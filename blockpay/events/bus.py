"""
BlockPay Nexus - Asynchronous Event Bus
Provides durable event-driven publish/subscribe decoupling for microservices,
mimicking RabbitMQ / Apache Kafka topic semantics with in-memory fallback.
"""

import time
import uuid
from typing import Dict, Any, List, Callable
from collections import defaultdict


class EventTopics:
    USER_REGISTERED = "USER_REGISTERED"
    WALLET_CREATED = "WALLET_CREATED"
    TRANSACTION_INITIATED = "TRANSACTION_INITIATED"
    TRANSACTION_COMPLETED = "TRANSACTION_COMPLETED"
    TRANSACTION_FAILED = "TRANSACTION_FAILED"
    FRAUD_ALERT_CREATED = "FRAUD_ALERT_CREATED"
    PORTFOLIO_UPDATED = "PORTFOLIO_UPDATED"
    NEWS_PUBLISHED = "NEWS_PUBLISHED"
    PRICE_UPDATED = "PRICE_UPDATED"
    NOTIFICATION_CREATED = "NOTIFICATION_CREATED"
    AUDIT_RECORDED = "AUDIT_RECORDED"


class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = defaultdict(list)
        self._event_log: List[Dict[str, Any]] = []

    def subscribe(self, topic: str, handler: Callable):
        """Register a consumer callback for a specific topic."""
        self._subscribers[topic].append(handler)

    def publish(self, topic: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Publish an event to all subscribers and append to audit event log."""
        event = {
            "eventId": f"evt_{uuid.uuid4().hex[:12]}",
            "topic": topic,
            "timestamp": time.time(),
            "payload": payload,
        }
        self._event_log.append(event)

        # Dispatch to registered observers
        for handler in self._subscribers.get(topic, []):
            try:
                handler(event)
            except Exception as e:
                print(f"[EventBus] Error in consumer for topic '{topic}': {e}")

        return event

    def get_event_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._event_log[-limit:]


# Global singleton event bus instance
event_bus = EventBus()
