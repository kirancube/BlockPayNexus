"""
BlockPay Nexus - Fraud Detection & Risk Analysis Microservice
Implements a Chain of Responsibility pattern for sequential rule evaluation,
dynamic 0-100 risk scoring, and policy-driven wallet restriction.
"""

import time
from typing import Dict, Any, List, Tuple
from blockpay.events.bus import event_bus, EventTopics


class FraudRule:
    """Base class in Chain of Responsibility pattern."""
    def __init__(self, name: str, weight: int):
        self.name = name
        self.weight = weight
        self._next_rule: 'FraudRule' = None

    def set_next(self, next_rule: 'FraudRule') -> 'FraudRule':
        self._next_rule = next_rule
        return next_rule

    def evaluate(self, context: Dict[str, Any], score: int, triggered: List[str]) -> Tuple[int, List[str]]:
        # Overridden by concrete rules
        if self._next_rule:
            return self._next_rule.evaluate(context, score, triggered)
        return score, triggered


class MaterialityThresholdRule(FraudRule):
    """Rule 1: Flags single transfer exceeding materiality limit (₹3,00,000)."""
    def __init__(self):
        super().__init__("HIGH_MATERIALITY_DEVIATION", 40)

    def evaluate(self, context: Dict[str, Any], score: int, triggered: List[str]) -> Tuple[int, List[str]]:
        amount = context.get("amount", 0.0)
        currency = context.get("currency", "INR")
        # In INR terms
        scaled_amount = amount if currency == "INR" else amount * 60000.0
        if scaled_amount >= 300000.0:
            score += self.weight
            triggered.append(self.name)
        if self._next_rule:
            return self._next_rule.evaluate(context, score, triggered)
        return score, triggered


class VelocityThresholdRule(FraudRule):
    """Rule 2: Flags high velocity (frequent operations within 60s)."""
    def __init__(self):
        super().__init__("VELOCITY_THRESHOLD_SURGE", 35)

    def evaluate(self, context: Dict[str, Any], score: int, triggered: List[str]) -> Tuple[int, List[str]]:
        recent_count = context.get("recent_tx_count_60s", 0)
        if recent_count >= 4:
            score += self.weight
            triggered.append(self.name)
        if self._next_rule:
            return self._next_rule.evaluate(context, score, triggered)
        return score, triggered


class CounterpartyAnomalyRule(FraudRule):
    """Rule 3: Flags unverified or suspicious counterparties."""
    def __init__(self):
        super().__init__("COUNTERPARTY_RISK_SURGE", 45)

    def evaluate(self, context: Dict[str, Any], score: int, triggered: List[str]) -> Tuple[int, List[str]]:
        recipient = context.get("recipient", "").lower()
        if "suspicious" in recipient or "proxy" in recipient or "bot" in recipient:
            score += self.weight
            triggered.append(self.name)
        if self._next_rule:
            return self._next_rule.evaluate(context, score, triggered)
        return score, triggered


class FraudService:
    def __init__(self):
        # Build Chain of Responsibility
        self.rule_chain = MaterialityThresholdRule()
        r2 = VelocityThresholdRule()
        r3 = CounterpartyAnomalyRule()
        self.rule_chain.set_next(r2).set_next(r3)

        self.alerts: List[Dict[str, Any]] = []
        self._user_recent_txs: Dict[str, List[float]] = {}

    def record_attempt(self, user_id: str):
        now = time.time()
        if user_id not in self._user_recent_txs:
            self._user_recent_txs[user_id] = []
        # Keep only past 60s
        self._user_recent_txs[user_id] = [t for t in self._user_recent_txs[user_id] if now - t <= 60.0]
        self._user_recent_txs[user_id].append(now)

    def evaluate_transaction(self, tx_context: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the transaction through the Chain of Responsibility."""
        user_id = tx_context.get("userId", "")
        self.record_attempt(user_id)
        
        recent_count = len(self._user_recent_txs.get(user_id, []))
        context_with_velocity = {**tx_context, "recent_tx_count_60s": recent_count}

        raw_score, triggered_rules = self.rule_chain.evaluate(context_with_velocity, score=5, triggered=[])
        final_score = min(100, raw_score)

        if final_score >= 75:
            decision = "BLOCK"
        elif final_score >= 40:
            decision = "REVIEW"
        else:
            decision = "ALLOW"

        # If blocked or review, create alert and emit event
        if decision != "ALLOW":
            alert = {
                "alertId": f"frd_{int(time.time() * 1000)}",
                "transactionId": tx_context.get("txId", "unknown"),
                "userId": user_id,
                "amount": tx_context.get("amount", 0.0),
                "currency": tx_context.get("currency", "INR"),
                "riskScore": final_score,
                "decision": decision,
                "rulesTriggered": triggered_rules,
                "status": "REVIEW_PENDING",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            self.alerts.append(alert)
            event_bus.publish(EventTopics.FRAUD_ALERT_CREATED, alert)

        return {
            "riskScore": final_score,
            "decision": decision,
            "rulesTriggered": triggered_rules,
        }

    def get_all_alerts(self) -> List[Dict[str, Any]]:
        return self.alerts

    def update_alert_status(self, alert_id: str, new_status: str, admin_notes: str = "") -> bool:
        for a in self.alerts:
            if a["alertId"] == alert_id:
                a["status"] = new_status
                a["adminNotes"] = admin_notes
                return True
        return False


fraud_service = FraudService()
