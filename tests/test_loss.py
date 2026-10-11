"""
Unit tests for Deep MIL Ranking Loss with Physics Constraints (Page 6 & Page 9).
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.loss import DeepMILRankingLossStandalone


class TestDeepMILRankingLoss(unittest.TestCase):
    def setUp(self):
        self.loss_fn = DeepMILRankingLossStandalone(
            lambda_smoothness=8e-5,
            lambda_sparsity=8e-5,
            margin=1.0
        )

    def test_hinge_loss_satisfied_margin(self):
        # max_a = 0.95, max_n = 0.05 -> margin 1.0 - 0.95 + 0.05 = 0.10
        pos_scores = [0.05, 0.1, 0.95, 0.1]
        neg_scores = [0.01, 0.02, 0.05, 0.03]

        loss_dict = self.loss_fn(pos_scores, neg_scores)
        self.assertAlmostEqual(loss_dict["hinge_loss"], 0.10, places=4)
        self.assertGreater(loss_dict["total_loss"], 0.0)

    def test_temporal_smoothness_penalty(self):
        # Erratic signal should have higher smoothness loss than smooth signal
        smooth_signal = [0.1, 0.2, 0.3, 0.4, 0.5]
        erratic_signal = [0.1, 0.9, 0.1, 0.9, 0.1]
        neg_baseline = [0.05] * 5

        loss_smooth = self.loss_fn(smooth_signal, neg_baseline)
        loss_erratic = self.loss_fn(erratic_signal, neg_baseline)

        self.assertGreater(loss_erratic["smoothness_loss"], loss_smooth["smoothness_loss"])

    def test_temporal_sparsity_penalty(self):
        # Brief anomaly should have lower sparsity penalty than continuous high scores
        brief_anomaly = [0.0, 0.0, 0.9, 0.0, 0.0]
        extended_anomaly = [0.9, 0.9, 0.9, 0.9, 0.9]
        neg_baseline = [0.05] * 5

        loss_brief = self.loss_fn(brief_anomaly, neg_baseline)
        loss_extended = self.loss_fn(extended_anomaly, neg_baseline)

        self.assertGreater(loss_extended["sparsity_loss"], loss_brief["sparsity_loss"])


if __name__ == "__main__":
    unittest.main()
