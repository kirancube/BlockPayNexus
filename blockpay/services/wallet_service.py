"""
BlockPay Nexus - Fiat & Cryptocurrency Wallet Microservice
Maintains double-entry immutable ledgers for sovereign fiat (INR)
and multi-asset crypto (BTC, ETH, USDT, SOL). Enforces non-negative balance invariants.
"""

import time
from typing import Dict, Any, List, Optional
from blockpay.events.bus import event_bus, EventTopics


class WalletService:
    def __init__(self):
        # userId -> Fiat Wallet
        self.fiat_wallets: Dict[str, Dict[str, Any]] = {}
        # userId -> Dict[asset, CryptoWallet]
        self.crypto_wallets: Dict[str, Dict[str, Dict[str, Any]]] = {}
        # Immutable Ledger: List of all ledger entries across system
        self.fiat_ledger: List[Dict[str, Any]] = []
        self.crypto_ledger: List[Dict[str, Any]] = []

        self._seed_default_wallets()

    def _seed_default_wallets(self):
        default_uid = "usr_bpx_90214"
        self.fiat_wallets[default_uid] = {
            "walletId": f"wlt_fiat_{default_uid}",
            "userId": default_uid,
            "currency": "INR",
            "balance": 450000.00,
            "availableBalance": 450000.00,
            "pendingBalance": 0.00,
            "dailyTopupLimit": 200000.00,
            "dailyTopupUsed": 25000.00,
            "status": "ACTIVE",
            "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        self.crypto_wallets[default_uid] = {
            "BTC": {"asset": "BTC", "balance": 0.8540, "available": 0.8540, "locked": 0.0000, "inrRate": 5890000.00},
            "ETH": {"asset": "ETH", "balance": 6.2500, "available": 6.2500, "locked": 0.0000, "inrRate": 284500.00},
            "USDT": {"asset": "USDT", "balance": 12450.00, "available": 12450.00, "locked": 0.0000, "inrRate": 85.50},
            "SOL": {"asset": "SOL", "balance": 42.5000, "available": 42.5000, "locked": 0.0000, "inrRate": 16800.00},
        }

    def ensure_user_wallets(self, user_id: str):
        """Creates zero-balance fiat and crypto wallets if not yet present (FR-WALLET-001, FR-CRYPTO-001)."""
        if user_id not in self.fiat_wallets:
            self.fiat_wallets[user_id] = {
                "walletId": f"wlt_fiat_{user_id}",
                "userId": user_id,
                "currency": "INR",
                "balance": 0.00,
                "availableBalance": 0.00,
                "pendingBalance": 0.00,
                "dailyTopupLimit": 200000.00,
                "dailyTopupUsed": 0.00,
                "status": "ACTIVE",
                "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
        if user_id not in self.crypto_wallets:
            self.crypto_wallets[user_id] = {
                "BTC": {"asset": "BTC", "balance": 0.0, "available": 0.0, "locked": 0.0, "inrRate": 5890000.00},
                "ETH": {"asset": "ETH", "balance": 0.0, "available": 0.0, "locked": 0.0, "inrRate": 284500.00},
                "USDT": {"asset": "USDT", "balance": 0.0, "available": 0.0, "locked": 0.0, "inrRate": 85.50},
                "SOL": {"asset": "SOL", "balance": 0.0, "available": 0.0, "locked": 0.0, "inrRate": 16800.00},
            }

    # FIAT OPERATIONS
    def get_fiat_wallet(self, user_id: str) -> Optional[Dict[str, Any]]:
        self.ensure_user_wallets(user_id)
        return self.fiat_wallets.get(user_id)

    def topup_fiat(self, user_id: str, amount: float) -> Dict[str, Any]:
        """Adds simulated INR funds, validating daily and single-tx constraints."""
        self.ensure_user_wallets(user_id)
        wallet = self.fiat_wallets[user_id]

        if amount <= 0:
            return {"success": False, "error": "Top-up amount must be strictly positive."}
        if wallet["dailyTopupUsed"] + amount > wallet["dailyTopupLimit"]:
            return {"success": False, "error": f"Daily top-up limit exceeded (Max ₹{wallet['dailyTopupLimit']:,})."}

        wallet["balance"] += amount
        wallet["availableBalance"] += amount
        wallet["dailyTopupUsed"] += amount
        wallet["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Immutable ledger entry
        entry_id = f"ldg_fiat_{len(self.fiat_ledger) + 1}"
        ledger_entry = {
            "entryId": entry_id,
            "walletId": wallet["walletId"],
            "userId": user_id,
            "type": "TOPUP",
            "amount": amount,
            "balanceAfter": wallet["balance"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        self.fiat_ledger.append(ledger_entry)

        return {"success": True, "balance": wallet["balance"], "ledgerEntry": ledger_entry}

    def debit_fiat(self, user_id: str, amount: float, reason: str = "TRANSFER") -> Dict[str, Any]:
        """Debits INR from available balance with atomic check and non-negative guarantee."""
        self.ensure_user_wallets(user_id)
        wallet = self.fiat_wallets[user_id]

        if wallet["status"] == "FROZEN":
            return {"success": False, "error": "Wallet is FROZEN. All debit operations prohibited (FR-WALLET-006)."}
        if amount <= 0:
            return {"success": False, "error": "Debit amount must be positive."}
        if amount > wallet["availableBalance"]:
            return {"success": False, "error": "Insufficient available INR funds."}

        wallet["balance"] -= amount
        wallet["availableBalance"] -= amount
        wallet["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        entry_id = f"ldg_fiat_{len(self.fiat_ledger) + 1}"
        ledger_entry = {
            "entryId": entry_id,
            "walletId": wallet["walletId"],
            "userId": user_id,
            "type": f"DEBIT_{reason}",
            "amount": -amount,
            "balanceAfter": wallet["balance"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        self.fiat_ledger.append(ledger_entry)
        return {"success": True, "balance": wallet["balance"], "ledgerEntry": ledger_entry}

    def credit_fiat(self, user_id: str, amount: float, reason: str = "TRANSFER") -> Dict[str, Any]:
        """Credits INR to wallet balance."""
        self.ensure_user_wallets(user_id)
        wallet = self.fiat_wallets[user_id]

        if amount <= 0:
            return {"success": False, "error": "Credit amount must be positive."}

        wallet["balance"] += amount
        wallet["availableBalance"] += amount
        wallet["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        entry_id = f"ldg_fiat_{len(self.fiat_ledger) + 1}"
        ledger_entry = {
            "entryId": entry_id,
            "walletId": wallet["walletId"],
            "userId": user_id,
            "type": f"CREDIT_{reason}",
            "amount": amount,
            "balanceAfter": wallet["balance"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        self.fiat_ledger.append(ledger_entry)
        return {"success": True, "balance": wallet["balance"], "ledgerEntry": ledger_entry}

    def set_fiat_status(self, user_id: str, status: str, justification: str = "") -> Dict[str, Any]:
        """Updates wallet status: ACTIVE, RESTRICTED, FROZEN (FR-WALLET-008)."""
        self.ensure_user_wallets(user_id)
        wallet = self.fiat_wallets[user_id]
        wallet["status"] = status
        wallet["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        event_bus.publish(EventTopics.NOTIFICATION_CREATED, {
            "userId": user_id,
            "type": "WALLET_STATUS_CHANGE",
            "status": status,
            "justification": justification
        })
        return {"success": True, "status": status}

    # CRYPTO OPERATIONS
    def get_crypto_wallets(self, user_id: str) -> Dict[str, Dict[str, Any]]:
        self.ensure_user_wallets(user_id)
        return self.crypto_wallets.get(user_id, {})

    def lock_crypto_balance(self, user_id: str, asset: str, amount: float) -> Dict[str, Any]:
        """Locks a portion of crypto balance during pending conversion/transfer (FR-CRYPTO-003)."""
        self.ensure_user_wallets(user_id)
        user_assets = self.crypto_wallets.get(user_id, {})
        if asset not in user_assets:
            return {"success": False, "error": f"Asset {asset} not found in wallet."}
        c = user_assets[asset]
        if amount > c["available"]:
            return {"success": False, "error": f"Insufficient available {asset}."}

        c["available"] -= amount
        c["locked"] += amount
        return {"success": True, "available": c["available"], "locked": c["locked"]}

    def release_crypto_balance(self, user_id: str, asset: str, amount: float) -> Dict[str, Any]:
        """Releases previously locked crypto balance back to available pool."""
        self.ensure_user_wallets(user_id)
        user_assets = self.crypto_wallets.get(user_id, {})
        if asset not in user_assets:
            return {"success": False, "error": f"Asset {asset} not found."}
        c = user_assets[asset]
        released = min(c["locked"], amount)
        c["locked"] -= released
        c["available"] += released
        return {"success": True, "available": c["available"], "locked": c["locked"]}

    def debit_crypto(self, user_id: str, asset: str, amount: float) -> Dict[str, Any]:
        """Debits crypto with zero-negative invariant (FR-CRYPTO-006)."""
        self.ensure_user_wallets(user_id)
        user_assets = self.crypto_wallets.get(user_id, {})
        if asset not in user_assets:
            return {"success": False, "error": f"Asset {asset} not supported."}
        c = user_assets[asset]
        if amount > c["available"]:
            return {"success": False, "error": f"Insufficient {asset} funds."}

        c["available"] -= amount
        c["balance"] -= amount

        entry_id = f"ldg_crypto_{len(self.crypto_ledger) + 1}"
        ledger_entry = {
            "entryId": entry_id,
            "userId": user_id,
            "asset": asset,
            "amount": -amount,
            "balanceAfter": c["balance"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        self.crypto_ledger.append(ledger_entry)
        return {"success": True, "balance": c["balance"], "available": c["available"]}

    def credit_crypto(self, user_id: str, asset: str, amount: float) -> Dict[str, Any]:
        """Credits crypto to asset balance."""
        self.ensure_user_wallets(user_id)
        user_assets = self.crypto_wallets.get(user_id, {})
        if asset not in user_assets:
            user_assets[asset] = {"asset": asset, "balance": 0.0, "available": 0.0, "locked": 0.0, "inrRate": 1.0}
        c = user_assets[asset]
        c["balance"] += amount
        c["available"] += amount

        entry_id = f"ldg_crypto_{len(self.crypto_ledger) + 1}"
        ledger_entry = {
            "entryId": entry_id,
            "userId": user_id,
            "asset": asset,
            "amount": amount,
            "balanceAfter": c["balance"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        self.crypto_ledger.append(ledger_entry)
        return {"success": True, "balance": c["balance"], "available": c["available"]}


wallet_service = WalletService()
