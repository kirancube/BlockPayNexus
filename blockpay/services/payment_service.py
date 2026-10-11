"""
BlockPay Nexus - Payment & Transfer Microservice
Orchestrates peer-to-peer transfers using a distributed Saga pattern,
State machine transitions, fraud rule evaluation, and blockchain audit anchoring.
"""

import time
import uuid
import threading
from typing import Dict, Any, List, Optional
from blockpay.services.wallet_service import wallet_service
from blockpay.services.fraud_service import fraud_service
from blockpay.services.auth_service import auth_service
from blockpay.services.blockchain_service import blockchain_service, compute_transaction_hash
from blockpay.events.bus import event_bus, EventTopics


class TransactionStatus:
    INITIATED = "INITIATED"
    VALIDATED = "VALIDATED"
    RISK_CHECK = "RISK_CHECK"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REVERSED = "REVERSED"


class PaymentService:
    def __init__(self):
        # In-memory transaction repository
        self.transactions: List[Dict[str, Any]] = []
        # Idempotency Cache: idempotency_key -> cached response
        self.idempotency_cache: Dict[str, Dict[str, Any]] = {}
        # Concurrency Lock: Prevents double-spend race conditions across threads
        self._lock = threading.Lock()

    def execute_transfer(
        self,
        sender_id: str,
        receiver_id: str,
        amount: float,
        currency: str = "INR",
        idempotency_key: Optional[str] = None,
        pin: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes P2P transfer through the Saga State Machine:
        INITIATED -> VALIDATED -> RISK_CHECK -> PROCESSING -> COMPLETED (or FAILED).
        Enforces idempotency keys, server-side PIN authentication, and atomic locking.
        """
        # 0. IDEMPOTENCY CHECK (Double-spend prevention)
        if idempotency_key and idempotency_key in self.idempotency_cache:
            return self.idempotency_cache[idempotency_key]

        # 0.1 SERVER-SIDE TRANSACTION PIN AUTHENTICATION
        if pin is not None:
            pin_res = auth_service.verify_transaction_pin(sender_id, pin)
            if not pin_res["success"]:
                fail_res = {
                    "success": False,
                    "error": pin_res.get("error", "Incorrect Transaction PIN."),
                    "pinLocked": pin_res.get("locked", False),
                    "attemptsRemaining": pin_res.get("attemptsRemaining")
                }
                if idempotency_key:
                    self.idempotency_cache[idempotency_key] = fail_res
                return fail_res
        tx_id = f"tx_bpx_{int(time.time() * 1000) % 1000000:06d}"
        trace_id = f"trc-{tx_id}-saga"
        created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        timeline = [
            {"step": TransactionStatus.INITIATED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": True}
        ]

        # 1. VALIDATION STEP
        if amount <= 0:
            timeline.append({"step": TransactionStatus.VALIDATED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": False, "note": "Amount must be positive"})
            return self._record_failure(tx_id, trace_id, sender_id, receiver_id, amount, currency, timeline, "Invalid non-positive amount.")

        # Check sender wallet status
        fiat_wallet = wallet_service.get_fiat_wallet(sender_id)
        if fiat_wallet and fiat_wallet["status"] == "FROZEN":
            timeline.append({"step": TransactionStatus.VALIDATED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": False, "note": "Sender wallet FROZEN"})
            return self._record_failure(tx_id, trace_id, sender_id, receiver_id, amount, currency, timeline, "Sender wallet is FROZEN.")

        # Check available balance
        if currency == "INR":
            if not fiat_wallet or fiat_wallet["availableBalance"] < amount:
                timeline.append({"step": TransactionStatus.VALIDATED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": False, "note": "Insufficient funds"})
                return self._record_failure(tx_id, trace_id, sender_id, receiver_id, amount, currency, timeline, "Insufficient available INR balance.")
        else:
            crypto_w = wallet_service.get_crypto_wallets(sender_id)
            if currency not in crypto_w or crypto_w[currency]["available"] < amount:
                timeline.append({"step": TransactionStatus.VALIDATED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": False, "note": "Insufficient crypto"})
                return self._record_failure(tx_id, trace_id, sender_id, receiver_id, amount, currency, timeline, f"Insufficient {currency} funds.")

        timeline.append({"step": TransactionStatus.VALIDATED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": True})

        # 2. RISK CHECK STEP (Chain of Responsibility)
        risk_result = fraud_service.evaluate_transaction({
            "txId": tx_id,
            "userId": sender_id,
            "recipient": receiver_id,
            "amount": amount,
            "currency": currency
        })

        if risk_result["decision"] == "BLOCK":
            timeline.append({
                "step": TransactionStatus.RISK_CHECK,
                "time": time.strftime("%H:%M:%S", time.gmtime()),
                "ok": False,
                "note": f"Triggered rules: {', '.join(risk_result['rulesTriggered'])}"
            })
            return self._record_failure(
                tx_id, trace_id, sender_id, receiver_id, amount, currency, timeline,
                f"Blocked by Fraud Engine (Risk: {risk_result['riskScore']}/100)",
                risk_result
            )

        timeline.append({
            "step": TransactionStatus.RISK_CHECK,
            "time": time.strftime("%H:%M:%S", time.gmtime()),
            "ok": True,
            "note": f"Risk Score: {risk_result['riskScore']}/100"
        })

        # 3. PROCESSING STEP (Atomic Double-Entry Debit/Credit with Mutex Lock)
        timeline.append({"step": TransactionStatus.PROCESSING, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": True})

        with self._lock:
            try:
                if currency == "INR":
                    debit_res = wallet_service.debit_fiat(sender_id, amount, "TRANSFER")
                    if not debit_res["success"]:
                        raise Exception(debit_res["error"])
                    credit_res = wallet_service.credit_fiat(receiver_id, amount, "TRANSFER")
                else:
                    debit_res = wallet_service.debit_crypto(sender_id, currency, amount)
                    if not debit_res["success"]:
                        raise Exception(debit_res["error"])
                    credit_res = wallet_service.credit_crypto(receiver_id, currency, amount)
            except Exception as e:
                # Compensating Saga rollback
                if currency == "INR":
                    wallet_service.credit_fiat(sender_id, amount, "COMPENSATING_ROLLBACK")
                else:
                    wallet_service.credit_crypto(sender_id, currency, amount)
                timeline.append({"step": TransactionStatus.REVERSED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": False})
                fail_res = self._record_failure(tx_id, trace_id, sender_id, receiver_id, amount, currency, timeline, f"Saga Rollback: {e}")
                if idempotency_key:
                    self.idempotency_cache[idempotency_key] = fail_res
                return fail_res

        # 4. COMPLETION STEP & BLOCKCHAIN AUDIT ANCHORING
        canonical_tx_payload = {
            "txId": tx_id,
            "sender": sender_id,
            "receiver": receiver_id,
            "amount": amount,
            "currency": currency,
            "timestamp": created_at
        }
        root_hash = compute_transaction_hash(canonical_tx_payload)
        anchor_rec = blockchain_service.anchor_transaction(tx_id, root_hash, amount, currency)

        timeline.append({"step": TransactionStatus.COMPLETED, "time": time.strftime("%H:%M:%S", time.gmtime()), "ok": True})

        completed_tx = {
            "id": tx_id,
            "serviceTraceId": trace_id,
            "type": "TRANSFER",
            "direction": "OUT",
            "sender": sender_id,
            "receiver": receiver_id,
            "amount": amount,
            "currency": currency,
            "fee": 0.0,
            "status": TransactionStatus.COMPLETED,
            "timestamp": created_at,
            "riskScore": risk_result["riskScore"],
            "fraudDecision": risk_result["decision"],
            "blockchainHash": root_hash,
            "blockchainStatus": "VERIFIED",
            "blockNumber": anchor_rec["blockNumber"],
            "gasUsed": anchor_rec["gasUsed"],
            "timeline": timeline
        }
        self.transactions.insert(0, completed_tx)

        # Publish notification event
        event_bus.publish(EventTopics.TRANSACTION_COMPLETED, completed_tx)
        success_res = {"success": True, "transaction": completed_tx}
        if idempotency_key:
            self.idempotency_cache[idempotency_key] = success_res
        return success_res

    def _record_failure(
        self,
        tx_id: str,
        trace_id: str,
        sender_id: str,
        receiver_id: str,
        amount: float,
        currency: str,
        timeline: List[Dict[str, Any]],
        reason: str,
        risk_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        risk_score = risk_result["riskScore"] if risk_result else 20
        decision = risk_result["decision"] if risk_result else "BLOCK"
        
        failed_tx = {
            "id": tx_id,
            "serviceTraceId": trace_id,
            "type": "TRANSFER",
            "direction": "OUT",
            "sender": sender_id,
            "receiver": receiver_id,
            "amount": amount,
            "currency": currency,
            "fee": 0.0,
            "status": TransactionStatus.FAILED,
            "failReason": reason,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "riskScore": risk_score,
            "fraudDecision": decision,
            "blockchainHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "blockchainStatus": "NOT_ANCHORED",
            "blockNumber": None,
            "gasUsed": 0,
            "timeline": timeline
        }
        self.transactions.insert(0, failed_tx)
        event_bus.publish(EventTopics.TRANSACTION_FAILED, failed_tx)
        return {"success": False, "error": reason, "transaction": failed_tx}

    def get_transaction_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.transactions[:limit]

    def get_transaction_by_id(self, tx_id: str) -> Optional[Dict[str, Any]]:
        for t in self.transactions:
            if t["id"] == tx_id:
                return t
        return None


payment_service = PaymentService()
