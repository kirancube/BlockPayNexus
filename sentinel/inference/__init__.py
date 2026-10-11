"""
SentinelAI X Real-Time Inference Package
- StreamInferenceEngine: Sub-5ms latency spatiotemporal anomaly scoring
- AlertManager: Severity classification, debouncing, and structured threat packaging
"""

from sentinel.inference.engine import StreamInferenceEngine
from sentinel.inference.alert_manager import AlertManager, ThreatAlert

__all__ = [
    "StreamInferenceEngine",
    "AlertManager",
    "ThreatAlert",
]
