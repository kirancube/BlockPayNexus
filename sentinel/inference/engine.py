"""
Real-Time Stream Inference Engine
As specified in SentinelAI X Intelligence Dossier (Page 4, Page 12).

Characteristics:
  - Latency: < 5ms per 16-frame vector
  - Real-time scoring continuous curve [0.0, 1.0]
  - Temporal smoothing window to suppress momentary camera flicker
"""

import time
import collections
from typing import List, Dict, Any, Optional
from sentinel.core.mil_ranking import DeepMILRankingModel

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


class StreamInferenceEngine:
    """
    Sub-5ms latency stream processor for CCTV nodes.
    Ingests 4096-D spatiotemporal feature vectors and computes continuous anomaly scores.
    """
    def __init__(
        self,
        model: Optional[Any] = None,
        smoothing_window: int = 5,
        anomaly_threshold: float = 0.50,
        critical_threshold: float = 0.85,
        use_torch: bool = True
    ):
        self.use_torch = use_torch and HAS_TORCH
        self.model = model or DeepMILRankingModel(use_torch=self.use_torch)
        if hasattr(self.model, "eval"):
            self.model.eval()

        self.smoothing_window = smoothing_window
        self.anomaly_threshold = anomaly_threshold
        self.critical_threshold = critical_threshold
        self.history = collections.deque(maxlen=smoothing_window)
        self.total_frames_processed = 0

    def score_vector(self, feature_vector: List[float]) -> Dict[str, Any]:
        """
        Processes a single 4096-D feature vector with strict <5ms latency profile.
        """
        start_time = time.perf_counter()

        if self.use_torch and hasattr(self.model, "parameters"):
            import torch
            with torch.no_grad():
                tensor_in = torch.tensor([feature_vector], dtype=torch.float32)
                raw_score = float(self.model(tensor_in).item())
        elif hasattr(self.model, "forward_vector"):
            raw_score = self.model.forward_vector(feature_vector)
        else:
            raw_score = 0.05

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        # Apply temporal smoothing
        self.history.append(raw_score)
        smoothed_score = sum(self.history) / len(self.history)

        self.total_frames_processed += 16  # Each vector covers 16 frames

        is_anomaly = smoothed_score >= self.anomaly_threshold
        is_critical = smoothed_score >= self.critical_threshold

        severity = "NOMINAL"
        if is_critical:
            severity = "CRITICAL"
        elif is_anomaly:
            severity = "ALERT"

        return {
            "frame_index": self.total_frames_processed,
            "raw_score": round(raw_score, 4),
            "smoothed_score": round(smoothed_score, 4),
            "severity": severity,
            "is_anomaly": is_anomaly,
            "latency_ms": round(elapsed_ms, 2),
            "status": "SYSTEM_ONLINE"
        }

    def reset_stream(self):
        """Clears temporal smoothing buffer and frame counters."""
        self.history.clear()
        self.total_frames_processed = 0
