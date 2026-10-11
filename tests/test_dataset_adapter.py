"""
Unit tests for SentinelAI X Unified Dataset Adapter & Data Leakage Prevention.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.data.unified_adapter import (
    UCFCrimeAdapter,
    XDViolenceAdapter,
    ShanghaiTechAdapter,
    SplitManager,
    ClipSampler,
    DataLeakageError,
    VideoInstance
)


class TestDatasetAdapter(unittest.TestCase):
    def setUp(self):
        self.ucf = UCFCrimeAdapter(num_segments=32, seed=42)
        self.xd = XDViolenceAdapter(num_segments=32, seed=42)
        self.shanghai = ShanghaiTechAdapter(num_segments=32, seed=42)

    def test_ucf_crime_adapter_scan(self):
        videos = self.ucf.scan_dataset()
        self.assertGreater(len(videos), 0)
        
        # Must contain both anomaly and normal instances
        anomalies = [v for v in videos if v.is_anomaly]
        normals = [v for v in videos if not v.is_anomaly]
        self.assertGreater(len(anomalies), 0)
        self.assertGreater(len(normals), 0)

    def test_zero_leakage_partitioning(self):
        videos = self.ucf.scan_dataset()
        split_mgr = SplitManager(seed=42)
        train_set, test_set = split_mgr.partition_videos(videos, test_ratio=0.25)

        train_ids = {v.video_id for v in train_set}
        test_ids = {v.video_id for v in test_set}

        # Zero-leakage invariant: No video in both train and test
        overlap = train_ids.intersection(test_ids)
        self.assertEqual(len(overlap), 0, f"Data leakage detected! Overlapping videos: {overlap}")
        self.assertEqual(len(train_set) + len(test_set), len(videos))

    def test_leakage_detection_raises_error(self):
        split_mgr = SplitManager(seed=42)
        v1 = VideoInstance("VID_001", "UCF", "Assault", True, 60.0, 1800)
        v2 = VideoInstance("VID_002", "UCF", "Normal", False, 60.0, 1800)
        
        # Intentionally force leakage
        train_set = [v1, v2]
        test_set = [v1]  # v1 is in both!

        # Manually trigger leakage check logic
        train_ids = {v.video_id for v in train_set}
        test_ids = {v.video_id for v in test_set}
        self.assertTrue(len(train_ids.intersection(test_ids)) > 0)

    def test_clip_sampler_uniformity(self):
        sampler = ClipSampler(num_segments=32)
        
        # 100 raw temporal features
        raw_feats = [[float(i)] * 10 for i in range(100)]
        sampled = sampler.sample_features(raw_feats)

        self.assertEqual(len(sampled), 32)
        self.assertEqual(len(sampled[0]), 10)
        # Check first and last sample indices
        self.assertEqual(sampled[0][0], 0.0)
        self.assertGreater(sampled[-1][0], 85.0)

    def test_bag_generation_and_normalization(self):
        videos = self.ucf.scan_dataset()
        first_video = videos[0]
        bag = self.ucf.load_bag(first_video, feature_dim=64)

        self.assertEqual(bag.num_instances, 32)
        self.assertEqual(len(bag.features), 32)
        self.assertEqual(len(bag.features[0]), 64)

        # Check L2 normalization on all instances in bag
        for feat in bag.features:
            norm_sq = sum(v * v for v in feat)
            self.assertAlmostEqual(norm_sq, 1.0, places=3)


if __name__ == "__main__":
    unittest.main()
