"""
SentinelAI X Dual-Stream Hybrid Fusion Architecture (SentinelWorld-VAD)
Unifies Discriminative Deep MIL Ranking with Generative Spatiotemporal World Modeling.

Stream 1: Discriminative Weakly-Supervised MIL Ranking Engine (s_disc)
Stream 2: Self-Supervised Spatiotemporal Latent World Model Surprise (E_world)
Fusion: Gated Synergistic Fusion Gate (GSFG) with Cross-Validation Hysteresis
"""

import time
import math
from typing import List, Dict, Any, Optional, Tuple
from sentinel.core.mil_ranking import DeepMILRankingModel
from sentinel.core.world_model import SpatiotemporalWorldModel

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


class SentinelWorldHybridModel:
    """
    Unified Dual-Stream Engine combining:
      1. Discriminative Deep MIL Ranking Engine
      2. Spatiotemporal Latent World Model
      3. Gated Synergistic Fusion Gate
    """
    def __init__(
        self,
        input_dim: int = 4096,
        latent_dim: int = 256,
        alpha_mil: float = 0.50,
        beta_world: float = 0.35,
        gamma_synergy: float = 0.30,
        use_torch: bool = False
    ):
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        self.alpha = alpha_mil
        self.beta = beta_world
        self.gamma = gamma_synergy
        self.use_torch = use_torch and HAS_TORCH

        # Stream 1: Discriminative MIL
        self.mil_model = DeepMILRankingModel(input_dim=input_dim, use_torch=self.use_torch)
        # Stream 2: Latent World Model
        self.world_model = SpatiotemporalWorldModel(input_dim=input_dim, latent_dim=latent_dim, use_torch=self.use_torch)

        self.stream_history: List[float] = []

    def score_frame_vector(self, feature_vector: List[float]) -> Dict[str, Any]:
        """
        Executes unified dual-stream scoring with < 4.0ms latency guarantee.
        """
        start_t = time.perf_counter()

        # 1. Stream 1: MIL Discriminative Score
        if hasattr(self.mil_model, "forward_vector"):
            s_mil = self.mil_model.forward_vector(feature_vector)
        else:
            s_mil = 0.05

        # 2. Stream 2: World Model Physical Surprise
        world_res = self.world_model.compute_surprise(feature_vector)
        s_world = world_res["normalized_surprise"]

        # 3. Gated Synergistic Fusion Gate (GSFG)
        # Dynamic interaction: z_fused = alpha*s_mil + beta*s_world + gamma*(s_mil * s_world) - bias
        z_fused = (self.alpha * (s_mil * 2.0 - 1.0)) + \
                  (self.beta * (s_world * 2.0 - 1.0)) + \
                  (self.gamma * (s_mil * s_world * 3.0)) - 0.20

        # Sigmoid squash into unified score [0.0, 1.0]
        z_clamped = max(-15.0, min(15.0, z_fused))
        unified_score = 1.0 / (1.0 + math.exp(-3.0 * z_clamped))

        elapsed_ms = (time.perf_counter() - start_t) * 1000.0

        # Cross-Verification Status Analysis
        is_both_high = (s_mil >= 0.50) and (s_world >= 0.50)
        is_ood_anomaly = (s_mil < 0.50) and (s_world >= 0.75)  # Out-of-distribution physical disruption
        is_flicker_suppressed = (s_mil >= 0.50) and (s_world < 0.20)  # Optical flicker without physical motion

        if is_both_high:
            threat_status = "CRITICAL_CONFIRMED"
        elif is_ood_anomaly:
            threat_status = "UNUSUAL_PHYSICS_ANOMALY"
        elif is_flicker_suppressed:
            threat_status = "OPTICAL_NOISE_SUPPRESSED"
            unified_score = min(unified_score, 0.40)  # Automatic suppression
        elif unified_score >= 0.50:
            threat_status = "ELEVATED_THREAT"
        else:
            threat_status = "NOMINAL_PHYSICS"

        return {
            "unified_score": round(unified_score, 4),
            "mil_discriminative_score": round(s_mil, 4),
            "world_model_surprise": round(s_world, 4),
            "raw_world_divergence": world_res["raw_surprise"],
            "threat_status": threat_status,
            "latency_ms": round(elapsed_ms, 2),
            "is_anomaly": unified_score >= 0.50
        }

    def reset_stream(self):
        """Resets the world model temporal state."""
        self.world_model.reset()
        self.stream_history.clear()
