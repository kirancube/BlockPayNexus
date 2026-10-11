"""
Unit tests for C3D Spatiotemporal Convolutional Network.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.c3d import C3D, C3DStandalone


class TestC3DNetwork(unittest.TestCase):
    def test_c3d_standalone_output_dimension(self):
        model = C3DStandalone(feature_dim=4096)
        # 16 frames of mock pixel lists
        dummy_clip = [[[10.0] * 112 for _ in range(112)] for _ in range(16)]
        features = model.forward(dummy_clip)

        self.assertEqual(len(features), 4096)
        # Check L2 normalization: sum(v^2) should be approx 1.0
        norm_sq = sum(v * v for v in features)
        self.assertAlmostEqual(norm_sq, 1.0, places=4)

    def test_c3d_factory_creation(self):
        c3d_instance = C3D(feature_dim=4096, use_torch=False)
        self.assertIsNotNone(c3d_instance)


if __name__ == "__main__":
    unittest.main()
