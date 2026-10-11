"""
Pydantic API Schemas for SentinelAI X
"""

from typing import List, Dict, Any, Optional

try:
    from pydantic import BaseModel, Field
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(*args, **kwargs):
        return None


class ClipScoreRequest(BaseModel):
    camera_id: str
    frame_index: int
    feature_vector: List[float]


class AnomalyScoreResponse(BaseModel):
    camera_id: str
    frame_index: int
    raw_score: float
    smoothed_score: float
    severity: str
    is_anomaly: bool
    latency_ms: float
    timestamp: float


class ThreatAlertSchema(BaseModel):
    alert_id: str
    timestamp: float
    camera_id: str
    camera_name: str
    frame_index: int
    anomaly_score: float
    severity: str
    category: str
    confidence: float
    status: str
    description: str
    tactical_readout: Optional[Dict[str, Any]] = None
    operator_feedback: Optional[str] = None


class OperatorFeedbackRequest(BaseModel):
    alert_id: str
    feedback_type: str  # CONFIRMED_THREAT, FALSE_POSITIVE_ENVIRONMENTAL, FALSE_POSITIVE_BEHAVIORAL
    operator_id: str
    notes: Optional[str] = ""


class SystemTelemetryResponse(BaseModel):
    dossier_id: str
    platform_name: str
    status: str
    active_cameras: int
    processed_frames: int
    auc_roc: float
    false_alarm_rate: float
    latency_ms: float
    tactical_modules: Dict[str, str]
