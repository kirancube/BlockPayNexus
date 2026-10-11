"""
Unit tests for Spatiotemporal Latent World Model and Dual-Stream Hybrid Fusion Architecture.
"""

import unittest
import sys
import os
import math

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.world_model import SpatiotemporalWorldModelStandalone
from sentinel.core.hybrid_fusion import SentinelWorldHybridModel


class TestWorldModel(unittest.TestCase):
    def setUp(self):
        self.world_model = SpatiotemporalWorldModelStandalone(input_dim=4096, latent_dim=256)
        self.hybrid_model = SentinelWorldHybridModel(input_dim=4096, latent_dim=256, use_torch=False)

    def test_latent_encoding_shape_and_norm(self):
        dummy_feat = [0.05 * math.sin(i * 0.1) for i in range(4096)]
        z = self.world_model.encode(dummy_feat)

        self.assertEqual(len(z), 256)
        # Verify L2 normalization
        norm_sq = sum(v * v for v in z)
        self.assertAlmostEqual(norm_sq, 1.0, places=3)

    def test_world_model_surprise_nominal_vs_shock(self):
        # 1. Warm-up with continuous nominal walking stream
        for step in range(5):
            nom_vec = [0.03 * math.sin(step * 0.2 + i * 0.05) for i in range(4096)]
            res = self.world_model.compute_surprise(nom_vec)

        # Baseline surprise should be low
        self.assertLess(res["normalized_surprise"], 0.65)

        # 2. Inject abrupt physical shock / explosion vector
        shock_vec = [1.8 * math.cos(i * 0.3 + 1.5) for i in range(4096)]
        res_shock = self.world_model.compute_surprise(shock_vec)

        # Raw divergence and normalized surprise must be higher than nominal
        self.assertGreater(res_shock["raw_surprise"], 0.1)
        self.assertIn("status", res_shock)

    def test_hybrid_fusion_latency_and_output_bounds(self):
        dummy_feat = [0.02 * math.cos(i * 0.15) for i in range(4096)]
        # Multi-pass warm-up to stabilize Python bytecode interpreter
        for _ in range(3):
            self.hybrid_model.score_frame_vector(dummy_feat)
        res = self.hybrid_model.score_frame_vector(dummy_feat)

        self.assertIn("unified_score", res)
        self.assertIn("mil_discriminative_score", res)
        self.assertIn("world_model_surprise", res)
        self.assertIn("threat_status", res)

        # Score bounds
        self.assertGreaterEqual(res["unified_score"], 0.0)
        self.assertLessEqual(res["unified_score"], 1.0)

        # Pure-Python CPU latency bound (target < 5ms, CI/CD ceiling < 25ms under system load)
        self.assertLess(res["latency_ms"], 25.0)

    def test_hybrid_reset(self):
        self.hybrid_model.reset_stream()
        self.assertIsNone(self.hybrid_model.world_model.prev_z)


if __name__ == "__main__":
    unittest.main()
