"""
Unit tests for SentinelAI X REST API endpoints and server logic.
"""

import unittest
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.temporal_localization import TemporalLocalizationEngine
from sentinel.core.interaction_graph import SceneInteractionGraph
from sentinel.core.calibration import CalibrationMetrics
from research.hard_negative_mining import HardNegativeStore, HardNegativeMiner


class TestServerLogicAndEndpoints(unittest.TestCase):
    def setUp(self):
        self.temp_store_path = "tests/test_hard_negatives.jsonl"
        self.store = HardNegativeStore(storage_path=self.temp_store_path)
        self.miner = HardNegativeMiner(self.store)

    def tearDown(self):
        if os.path.exists(self.temp_store_path):
            try:
                os.remove(self.temp_store_path)
            except Exception:
                pass

    def test_hard_negative_recording_and_retrieval(self):
        entry = self.store.record_hard_negative(
            camera_id="CAM_02",
            category="FALSE_POSITIVE_ENVIRONMENTAL",
            peak_score=0.78,
            feature_vector=[0.1] * 64,
            operator_id="OP_TEST",
            reason="Sunlight glare on optical lens"
        )
        self.assertTrue(entry.entry_id.startswith("HN-"))
        self.assertEqual(entry.camera_id, "CAM_02")

        entries = self.store.load_all_entries()
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].category, "FALSE_POSITIVE_ENVIRONMENTAL")

        summary = self.miner.get_summary_statistics()
        self.assertEqual(summary["total_mined_instances"], 1)
        self.assertIn("FALSE_POSITIVE_ENVIRONMENTAL", summary["category_distribution"])

    def test_negative_bag_augmentation(self):
        # Record 2 hard negatives
        self.store.record_hard_negative("CAM_01", "CROWD", 0.72, [0.8] * 10)
        self.store.record_hard_negative("CAM_01", "WEATHER", 0.65, [0.7] * 10)

        nominal_bag = [[0.01] * 10 for _ in range(8)]
        augmented, count = self.miner.augment_negative_bag(nominal_bag, mining_ratio=0.25)

        self.assertEqual(count, 2)
        self.assertEqual(len(augmented), 8)
        # Check that the substituted instances contain mined values
        self.assertEqual(augmented[-1][0], 0.8)


if __name__ == "__main__":
    unittest.main()
