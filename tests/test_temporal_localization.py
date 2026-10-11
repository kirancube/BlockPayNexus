"""
Unit tests for Temporal Anomaly Localization & Event Segmentation Engine.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.temporal_localization import (
    TemporalLocalizationEngine,
    TemporalEvent
)


class TestTemporalLocalization(unittest.TestCase):
    def setUp(self):
        self.engine = TemporalLocalizationEngine(
            default_threshold=0.50,
            min_duration_sec=1.0,
            merge_gap_sec=1.5,
            fps=30.0
        )

    def test_single_event_segmentation(self):
        # 32 instances, 16 frames per instance -> ~17.06s video
        # Nominals: ~0.04; Incident at instances 14..18 (values 0.85 .. 0.96)
        scores = [0.04] * 32
        for i in range(14, 19):
            scores[i] = 0.85 + (i - 14) * 0.02
        scores[16] = 0.98  # Peak

        events = self.engine.segment_events(scores, fps=30.0, frames_per_instance=16)

        self.assertEqual(len(events), 1)
        evt = events[0]
        self.assertEqual(evt.event_id, "EVT-001")
        self.assertAlmostEqual(evt.peak_score, 0.98, places=2)
        self.assertGreater(evt.duration_sec, 2.0)
        self.assertLess(evt.duration_sec, 4.0)

    def test_transient_noise_suppression(self):
        # A single isolated instance (16 frames / 30 fps = 0.53s) should be rejected (< 1.0s)
        scores = [0.02] * 32
        scores[10] = 0.95  # Isolated 1-instance spike

        events = self.engine.segment_events(scores, fps=30.0, frames_per_instance=16)
        self.assertEqual(len(events), 0, "Transient noise under 1.0s should have been filtered out")

    def test_temporal_iou_calculation(self):
        # Perfect overlap
        self.assertAlmostEqual(self.engine.calculate_temporal_iou((10.0, 20.0), (10.0, 20.0)), 1.0)
        # Disjoint
        self.assertAlmostEqual(self.engine.calculate_temporal_iou((0.0, 5.0), (10.0, 15.0)), 0.0)
        # 50% overlap: intersection 5, union 15 -> 1/3 = 0.3333
        iou = self.engine.calculate_temporal_iou((5.0, 15.0), (10.0, 20.0))
        self.assertAlmostEqual(iou, 5.0 / 15.0, places=3)

    def test_evaluation_metrics(self):
        predicted_event = TemporalEvent(
            event_id="EVT-001",
            start_frame=300,
            end_frame=600,
            start_time_sec=10.0,
            end_time_sec=20.0,
            duration_sec=10.0,
            peak_frame=450,
            peak_time_sec=15.0,
            peak_score=0.92,
            mean_score=0.88,
            confidence=0.95
        )
        gt_intervals = [(11.0, 19.0)]  # Ground truth from 11s to 19s

        metrics = self.engine.evaluate_detections([predicted_event], gt_intervals, iou_threshold=0.50)

        self.assertEqual(metrics["true_positives"], 1)
        self.assertEqual(metrics["precision"], 1.0)
        self.assertEqual(metrics["recall"], 1.0)
        self.assertEqual(metrics["f1"], 1.0)
        self.assertGreater(metrics["mean_tiou"], 0.70)
        self.assertAlmostEqual(metrics["mean_localization_error_sec"], 0.0, places=1)


if __name__ == "__main__":
    unittest.main()
