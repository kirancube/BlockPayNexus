"""
BlockPay Nexus - Notification Microservice
Subscribes to asynchronous domain events and provides queryable in-app event history.
"""

import time
from typing import Dict, Any, List
from blockpay.events.bus import event_bus, EventTopics


class NotificationService:
    def __init__(self):
        self.notifications: List[Dict[str, Any]] = [
            {
                "id": "notif_1",
                "userId": "usr_bpx_90214",
                "type": "TRANSFER_SUCCESS",
                "title": "Transfer Settled",
                "message": "₹15,000.00 sent to daniel_dev. Blockchain anchor verified.",
                "timestamp": "28 mins ago",
                "unread": True
            },
            {
                "id": "notif_2",
                "userId": "usr_bpx_90214",
                "type": "SECURITY_ALERT",
                "title": "Transfer Blocked",
                "message": "High materiality transfer of ₹3,50,000.00 was blocked by Fraud Engine (Risk score: 82).",
                "timestamp": "1 day ago",
                "unread": False
            }
        ]

        # Register event handlers
        event_bus.subscribe(EventTopics.TRANSACTION_COMPLETED, self._on_tx_completed)
        event_bus.subscribe(EventTopics.FRAUD_ALERT_CREATED, self._on_fraud_alert)

    def _on_tx_completed(self, event: Dict[str, Any]):
        payload = event.get("payload", {})
        notif = {
            "id": f"notif_{int(time.time() * 1000)}",
            "userId": payload.get("sender", "usr_bpx_90214"),
            "type": "TRANSACTION_COMPLETED",
            "title": "Transaction Settled",
            "message": f"Transaction {payload.get('id', '')} of {payload.get('currency', 'INR')} {payload.get('amount', 0)} completed.",
            "timestamp": "Just now",
            "unread": True
        }
        self.notifications.insert(0, notif)

    def _on_fraud_alert(self, event: Dict[str, Any]):
        payload = event.get("payload", {})
        notif = {
            "id": f"notif_{int(time.time() * 1000)}",
            "userId": payload.get("userId", "usr_bpx_90214"),
            "type": "FRAUD_ALERT",
            "title": "Risk Policy Warning",
            "message": f"Suspicious activity flagged: Risk score {payload.get('riskScore', 0)}/100. Action: {payload.get('decision')}.",
            "timestamp": "Just now",
            "unread": True
        }
        self.notifications.insert(0, notif)

    def get_user_notifications(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        return [n for n in self.notifications if n["userId"] == user_id][:limit]

    def mark_all_read(self, user_id: str):
        for n in self.notifications:
            if n["userId"] == user_id:
                n["unread"] = False


notification_service = NotificationService()
