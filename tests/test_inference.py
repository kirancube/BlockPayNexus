"""
Unit tests for Stream Inference Engine and Incident Alert Manager.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.inference.engine import StreamInferenceEngine
from sentinel.inference.alert_manager import AlertManager


class TestInferencePipeline(unittest.TestCase):
    def setUp(self):
        self.engine = StreamInferenceEngine(use_torch=False)
        self.alert_mgr = AlertManager(anomaly_threshold=0.50, critical_threshold=0.85, debounce_frames=32)

    def test_latency_budget(self):
        dummy_feat = [0.02 * (i % 5) for i in range(4096)]
        res = self.engine.score_vector(dummy_feat)

        self.assertIn("raw_score", res)
        self.assertIn("smoothed_score", res)
        self.assertIn("latency_ms", res)
        # Latency must be < 5.0ms on local CPU
        self.assertLess(res["latency_ms"], 5.0)

    def test_alert_dispatch_and_debounce(self):
        # 1. Normal score -> No alert
        alert1 = self.alert_mgr.evaluate_and_dispatch("CAM_01", "Gate 1", 100, 0.20)
        self.assertIsNone(alert1)

        # 2. Critical score -> Alert dispatched
        alert2 = self.alert_mgr.evaluate_and_dispatch("CAM_01", "Gate 1", 200, 0.92)
        self.assertIsNotNone(alert2)
        self.assertEqual(alert2.severity, "CRITICAL")
        self.assertEqual(len(self.alert_mgr.active_alerts), 1)

        # 3. Subsequent score inside debounce window (frame 210 < 200 + 32) -> Debounced (No duplicate alert)
        alert3 = self.alert_mgr.evaluate_and_dispatch("CAM_01", "Gate 1", 210, 0.94)
        self.assertIsNone(alert3)

    def test_operator_feedback_loop(self):
        alert = self.alert_mgr.evaluate_and_dispatch("CAM_01", "Gate 1", 500, 0.91)
        self.assertIsNotNone(alert)

        success = self.alert_mgr.register_operator_feedback(
            alert.alert_id,
            "CONFIRMED_THREAT",
            "Security teams deployed to Sector 07"
        )
        self.assertTrue(success)
        self.assertEqual(alert.status, "VERIFIED_INCIDENT")


if __name__ == "__main__":
    unittest.main()
