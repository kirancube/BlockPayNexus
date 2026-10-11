"""
Unit tests for Uncertainty Calibration, ECE, Brier Score, and MC-Dropout.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.calibration import (
    TemperatureScaling,
    CalibrationMetrics,
    MonteCarloDropoutEstimator
)


class TestUncertaintyCalibration(unittest.TestCase):
    def test_temperature_scaling(self):
        ts = TemperatureScaling(temperature=1.5)
        # Scaled logit 3.0 / 1.5 = 2.0 -> sigmoid(2.0) ~ 0.8808
        p = ts.calibrate_logit(3.0)
        self.assertAlmostEqual(p, 0.8808, places=3)

        # Test fitting
        logits = [-3.0, -2.0, -1.0, 1.0, 2.0, 3.0]
        labels = [0, 0, 0, 1, 1, 1]
        ts.fit(logits, labels, lr=0.1, max_iter=50)
        self.assertGreater(ts.temperature, 0.1)

    def test_brier_score(self):
        # Perfect predictions: Brier Score = 0
        p_perf = [1.0, 0.0, 1.0, 0.0]
        y_perf = [1, 0, 1, 0]
        self.assertEqual(CalibrationMetrics.brier_score(p_perf, y_perf), 0.0)

        # Completely inverted predictions: Brier Score = 1.0
        p_bad = [0.0, 1.0, 0.0, 1.0]
        self.assertEqual(CalibrationMetrics.brier_score(p_bad, y_perf), 1.0)

    def test_expected_calibration_error(self):
        probs = [0.1, 0.2, 0.35, 0.6, 0.85, 0.95]
        labels = [0, 0, 0, 1, 1, 1]

        ece_res = CalibrationMetrics.expected_calibration_error(probs, labels, num_bins=5)

        self.assertIn("ece", ece_res)
        self.assertIn("reliability_diagram", ece_res)
        self.assertGreaterEqual(ece_res["ece"], 0.0)
        self.assertLessEqual(ece_res["ece"], 1.0)
        self.assertEqual(len(ece_res["reliability_diagram"]), 5)

    def test_mc_dropout_uncertainty(self):
        estimator = MonteCarloDropoutEstimator(num_samples=10, dropout_rate=0.25)
        res = estimator.estimate_uncertainty(base_logit=2.5, noise_level=0.08)

        self.assertIn("risk_score", res)
        self.assertIn("confidence", res)
        self.assertIn("epistemic_uncertainty", res)
        self.assertIn("aleatoric_uncertainty", res)

        self.assertGreaterEqual(res["risk_score"], 0.0)
        self.assertLessEqual(res["risk_score"], 1.0)
        self.assertGreaterEqual(res["epistemic_uncertainty"], 0.0)


if __name__ == "__main__":
    unittest.main()
