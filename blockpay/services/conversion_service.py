"""
BlockPay Nexus - Currency Exchange & Conversion Microservice
Implements Strategy pattern for fiat-to-crypto vs crypto-to-fiat swaps,
quote locking window (30s), transparent fee calculation, and atomic Saga execution.
"""

import time
from typing import Dict, Any, Optional
from blockpay.services.wallet_service import wallet_service
from blockpay.services.blockchain_service import blockchain_service, compute_transaction_hash
from blockpay.events.bus import event_bus, EventTopics

SIMULATED_RATES = {
    "BTC": 5890000.00,
    "ETH": 284500.00,
    "USDT": 85.50,
    "SOL": 16800.00,
}


class ConversionQuote:
    def __init__(self, from_asset: str, to_asset: str, rate: float, quote_id: str, expires_at: float):
        self.from_asset = from_asset
        self.to_asset = to_asset
        self.rate = rate
        self.quote_id = quote_id
        self.expires_at = expires_at

    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class ConversionService:
    def __init__(self):
        self._quotes: Dict[str, ConversionQuote] = {}

    def get_quote(self, from_asset: str, to_asset: str) -> Dict[str, Any]:
        """Provides a locked quote valid for 30 seconds (FR-CONVERSION-003, BR-05)."""
        crypto_symbol = to_asset if from_asset == "INR" else from_asset
        rate = SIMULATED_RATES.get(crypto_symbol, 1.0)
        quote_id = f"quot_{int(time.time() * 1000)}"
        expires_at = time.time() + 30.0  # 30-sec validity

        quote_obj = ConversionQuote(from_asset, to_asset, rate, quote_id, expires_at)
        self._quotes[quote_id] = quote_obj

        return {
            "quoteId": quote_id,
            "fromAsset": from_asset,
            "toAsset": to_asset,
            "rate": rate,
            "validForSeconds": 30,
            "expiresAt": expires_at,
            "feePercentage": 0.25,
            "feeFlatINR": 125.00
        }

    def execute_conversion(
        self,
        user_id: str,
        from_asset: str,
        to_asset: str,
        amount: float,
        quote_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Atomically coordinates debit and credit using the Saga pattern (FR-CONVERSION-006)."""
        now = time.time()
        # Verify quote if provided
        crypto_symbol = to_asset if from_asset == "INR" else from_asset
        if quote_id and quote_id in self._quotes:
            quote = self._quotes[quote_id]
            if quote.is_expired():
                return {"success": False, "error": "Quote expired. Please refresh rate before converting (BR-05)."}
            rate = quote.rate
        else:
            rate = SIMULATED_RATES.get(crypto_symbol, 1.0)

        fee_inr = 125.00

        tx_id = f"tx_bpx_{int(now * 1000) % 1000000:06d}"
        created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Strategy 1: FIAT -> CRYPTO
        if from_asset == "INR":
            fiat_w = wallet_service.get_fiat_wallet(user_id)
            if not fiat_w or fiat_w["availableBalance"] < (amount + fee_inr):
                return {"success": False, "error": "Insufficient INR funds including conversion fee."}

            crypto_amount = round((amount - fee_inr) / rate, 6)

            # Leg 1: Debit Fiat
            debit_res = wallet_service.debit_fiat(user_id, amount, "CONVERSION")
            if not debit_res["success"]:
                return {"success": False, "error": debit_res["error"]}

            # Leg 2: Credit Crypto
            try:
                credit_res = wallet_service.credit_crypto(user_id, to_asset, crypto_amount)
            except Exception as e:
                # Compensating Rollback
                wallet_service.credit_fiat(user_id, amount, "COMPENSATING_ROLLBACK")
                return {"success": False, "error": f"Saga compensating rollback triggered: {e}"}

            # Blockchain anchoring
            canonical_payload = {
                "txId": tx_id,
                "userId": user_id,
                "fromAsset": from_asset,
                "toAsset": to_asset,
                "amount": amount,
                "receivedAmount": crypto_amount,
                "timestamp": created_at
            }
            root_hash = compute_transaction_hash(canonical_payload)
            blockchain_service.anchor_transaction(tx_id, root_hash, amount, f"INR->{to_asset}")

            conversion_rec = {
                "conversionId": tx_id,
                "userId": user_id,
                "fromAsset": from_asset,
                "toAsset": to_asset,
                "inputAmount": amount,
                "outputAmount": crypto_amount,
                "rate": rate,
                "fee": fee_inr,
                "status": "COMPLETED",
                "blockchainHash": root_hash,
                "timestamp": created_at
            }
            event_bus.publish(EventTopics.TRANSACTION_COMPLETED, conversion_rec)
            return {"success": True, "conversion": conversion_rec}

        # Strategy 2: CRYPTO -> FIAT
        else:
            crypto_w = wallet_service.get_crypto_wallets(user_id)
            if from_asset not in crypto_w or crypto_w[from_asset]["available"] < amount:
                return {"success": False, "error": f"Insufficient {from_asset} funds."}

            gross_inr = amount * rate
            net_inr = round(max(0.0, gross_inr - fee_inr), 2)

            # Leg 1: Debit Crypto
            debit_res = wallet_service.debit_crypto(user_id, from_asset, amount)
            if not debit_res["success"]:
                return {"success": False, "error": debit_res["error"]}

            # Leg 2: Credit Fiat
            try:
                credit_res = wallet_service.credit_fiat(user_id, net_inr, "CONVERSION")
            except Exception as e:
                # Compensating Rollback
                wallet_service.credit_crypto(user_id, from_asset, amount)
                return {"success": False, "error": f"Saga compensating rollback triggered: {e}"}

            canonical_payload = {
                "txId": tx_id,
                "userId": user_id,
                "fromAsset": from_asset,
                "toAsset": to_asset,
                "amount": amount,
                "receivedAmount": net_inr,
                "timestamp": created_at
            }
            root_hash = compute_transaction_hash(canonical_payload)
            blockchain_service.anchor_transaction(tx_id, root_hash, amount, f"{from_asset}->INR")

            conversion_rec = {
                "conversionId": tx_id,
                "userId": user_id,
                "fromAsset": from_asset,
                "toAsset": to_asset,
                "inputAmount": amount,
                "outputAmount": net_inr,
                "rate": rate,
                "fee": fee_inr,
                "status": "COMPLETED",
                "blockchainHash": root_hash,
                "timestamp": created_at
            }
            event_bus.publish(EventTopics.TRANSACTION_COMPLETED, conversion_rec)
            return {"success": True, "conversion": conversion_rec}


conversion_service = ConversionService()
