"""
Unit tests for Deep MIL Ranking Architecture.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.mil_ranking import DeepMILRankingModel, DeepMILRankingModelStandalone


class TestDeepMILRankingModel(unittest.TestCase):
    def setUp(self):
        self.model = DeepMILRankingModelStandalone(
            input_dim=4096,
            hidden_1=512,
            hidden_2=32,
            dropout=0.60
        )

    def test_forward_vector_output_range(self):
        # Generate dummy 4096-D vector
        dummy_vector = [0.05 * (i % 7) for i in range(4096)]
        score = self.model.forward_vector(dummy_vector)

        # Must be Sigmoid output in [0.0, 1.0]
        self.assertIsInstance(score, float)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)

    def test_forward_bag_shape(self):
        # Bag of 32 instances
        dummy_bag = [[0.01 * (i + j) for i in range(4096)] for j in range(32)]
        scores = self.model.forward(dummy_bag)

        self.assertEqual(len(scores), 32)
        for s in scores:
            self.assertGreaterEqual(s, 0.0)
            self.assertLessEqual(s, 1.0)

    def test_train_eval_modes(self):
        self.model.train(True)
        self.assertTrue(self.model.training)
        self.model.eval()
        self.assertFalse(self.model.training)


if __name__ == "__main__":
    unittest.main()
