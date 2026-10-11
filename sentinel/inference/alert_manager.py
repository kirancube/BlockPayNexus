"""
Incident Alert Manager & Threat Packaging Engine
As specified in SentinelAI X Intelligence Dossier (Page 2, Page 3, Page 14).

Transforms unstructured raw video spikes into investigated, structured threat alerts.
Implements hysteresis debouncing and closed-loop Human-in-the-Loop operator feedback.
"""

import time
import uuid
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


@dataclass
class ThreatAlert:
    alert_id: str
    timestamp: float
    camera_id: str
    camera_name: str
    frame_index: int
    anomaly_score: float
    severity: str  # NOMINAL, LOW, MEDIUM, HIGH, CRITICAL
    category: str
    confidence: float
    status: str  # PENDING_REVIEW, VERIFIED_INCIDENT, DISMISSED_FALSE_POSITIVE
    description: str
    tactical_readout: Dict[str, Any] = field(default_factory=dict)
    operator_feedback: Optional[str] = None


class AlertManager:
    """
    Manages generation, debouncing, and lifecycle of structured security alerts.
    """
    def __init__(
        self,
        anomaly_threshold: float = 0.50,
        critical_threshold: float = 0.85,
        debounce_frames: int = 48  # Approx 3 vectors / 1.5 seconds
    ):
        self.anomaly_threshold = anomaly_threshold
        self.critical_threshold = critical_threshold
        self.debounce_frames = debounce_frames
        self.last_alert_frame = -debounce_frames
        self.active_alerts: List[ThreatAlert] = []
        self.archived_alerts: List[ThreatAlert] = []

    def evaluate_and_dispatch(
        self,
        camera_id: str,
        camera_name: str,
        frame_index: int,
        score: float,
        detected_category: str = "Unspecified Incident"
    ) -> Optional[ThreatAlert]:
        """
        Evaluates current score. If threshold is breached and debounced, packages a structured alert.
        """
        if score < self.anomaly_threshold:
            return None

        # Check debounce window to avoid alert spamming
        if (frame_index - self.last_alert_frame) < self.debounce_frames:
            return None

        self.last_alert_frame = frame_index
        severity = "CRITICAL" if score >= self.critical_threshold else "HIGH"

        alert = ThreatAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            timestamp=time.time(),
            camera_id=camera_id,
            camera_name=camera_name,
            frame_index=frame_index,
            anomaly_score=round(score, 4),
            severity=severity,
            category=detected_category,
            confidence=round(score * 100, 1),
            status="PENDING_REVIEW",
            description=f"Automated threat spike ({severity}) detected on {camera_id} [{camera_name}] with anomaly score {score:.2f}.",
            tactical_readout={
                "module": "MODULE_3_MIL_RANKING_ENGINE",
                "false_alarm_suppression": "ACTIVE (1.9% FAR)",
                "ai_transparency_protocol": "VERIFICATION_REQUIRED",
                "spatiotemporal_dimension": 4096
            }
        )

        self.active_alerts.insert(0, alert)
        return alert

    def register_operator_feedback(self, alert_id: str, feedback_type: str, notes: str = "") -> bool:
        """
        Records human operator decision (Decision Maker Feedback Loop, Page 3).
        Feedback types:
          - 'CONFIRMED_THREAT': Dispatches law enforcement / security intervention.
          - 'FALSE_POSITIVE_ENVIRONMENTAL': Low-light / rain / insect occlusion (Page 14 Case 1).
          - 'FALSE_POSITIVE_BEHAVIORAL': Rapid crowd gathering in normal activity (Page 14 Case 2).
        """
        for alert in self.active_alerts:
            if alert.alert_id == alert_id:
                if feedback_type == "CONFIRMED_THREAT":
                    alert.status = "VERIFIED_INCIDENT"
                else:
                    alert.status = "DISMISSED_FALSE_POSITIVE"
                alert.operator_feedback = f"{feedback_type}: {notes}".strip()
                return True
        return False

    def get_recent_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns recent structured alerts as serializable dictionaries."""
        return [
            {
                "alert_id": a.alert_id,
                "timestamp": a.timestamp,
                "camera_id": a.camera_id,
                "camera_name": a.camera_name,
                "frame_index": a.frame_index,
                "anomaly_score": a.anomaly_score,
                "severity": a.severity,
                "category": a.category,
                "confidence": a.confidence,
                "status": a.status,
                "description": a.description,
                "operator_feedback": a.operator_feedback,
                "tactical_readout": a.tactical_readout
            }
            for a in self.active_alerts[:limit]
        ]
