"""
Unit tests for Robustness Benchmarking and Multi-Seed Validation Suites.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from research.robustness_benchmarks import (
    RobustnessEvaluator,
    generate_robustness_markdown_table
)
from research.multiseed_evaluation import MultiSeedValidator


class TestResearchBenchmarks(unittest.TestCase):
    def setUp(self):
        self.evaluator = RobustnessEvaluator(seed=42)
        self.validator = MultiSeedValidator(num_instances_per_bag=16)

    def test_corruption_application(self):
        clean_feat = [0.05] * 4096
        # Normalize
        norm = sum(v * v for v in clean_feat) ** 0.5
        clean_feat = [v / norm for v in clean_feat]

        for corr in ["low_light", "rain_noise", "camera_shake", "compression", "occlusion"]:
            pert = self.evaluator.apply_corruption(clean_feat, corr, severity=3)
            self.assertEqual(len(pert), 4096)
            norm_sq = sum(v * v for v in pert)
            self.assertAlmostEqual(norm_sq, 1.0, places=3)

    def test_robustness_benchmark_sweep(self):
        results = self.evaluator.run_benchmark(num_samples=10)
        self.assertIn("low_light", results)
        self.assertIn("rain_noise", results)
        self.assertEqual(len(results["low_light"]), 5)  # 5 severity levels

        table_md = generate_robustness_markdown_table(results)
        self.assertTrue(table_md.startswith("| Corruption Condition"))
        self.assertIn("Low Light", table_md)

    def test_multi_seed_evaluation(self):
        res = self.validator.run_multi_seed_evaluation(architecture="transformer", test_samples_per_seed=8)
        self.assertEqual(res["num_seeds"], 5)
        self.assertIn("+/-", res["metrics"]["roc_auc"])
        self.assertEqual(len(res["per_seed_breakdown"]), 5)


if __name__ == "__main__":
    unittest.main()
