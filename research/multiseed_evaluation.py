"""
SentinelAI X Multi-Seed Experimental Validation Suite
Executes research evaluation across 5 deterministic random seeds: [42, 123, 2026, 7, 99].
Reports mean +/- standard deviation across all performance metrics.
"""

import math
import random
from typing import List, Dict, Any, Tuple
from sentinel.data.unified_adapter import UCFCrimeAdapter, SplitManager
from sentinel.core.temporal_models import create_temporal_model
from sentinel.core.loss import DeepMILRankingLoss


class MultiSeedValidator:
    """
    Evaluates model stability and reports statistical confidence bounds (mean +/- std).
    """
    SEEDS = [42, 123, 2026, 7, 99]

    def __init__(self, num_instances_per_bag: int = 32):
        self.num_instances = num_instances_per_bag

    def run_multi_seed_evaluation(
        self,
        architecture: str = "transformer",
        test_samples_per_seed: int = 30
    ) -> Dict[str, Any]:
        """
        Runs evaluation across all 5 seeds and compiles statistical metrics.
        """
        seed_results = []

        for seed in self.SEEDS:
            adapter = UCFCrimeAdapter(num_segments=self.num_instances, seed=seed)
            videos = adapter.scan_dataset()
            split_mgr = SplitManager(seed=seed)
            _, test_videos = split_mgr.partition_videos(videos, test_ratio=0.25)

            # Sample test bags
            test_bags = [adapter.load_bag(v, feature_dim=64) for v in test_videos[:test_samples_per_seed]]

            model = create_temporal_model(model_type=architecture, input_dim=64, use_torch=False)

            bag_scores = []
            ground_truth = []
            for bag in test_bags:
                scores = model.forward(bag.features)
                max_score = max(scores)
                bag_scores.append(max_score)
                ground_truth.append(1 if bag.is_anomaly else 0)

            auc = self._calculate_auc(bag_scores, ground_truth)
            preds = [1 if s >= 0.50 else 0 for s in bag_scores]
            tp = sum(1 for p, y in zip(preds, ground_truth) if p == 1 and y == 1)
            fp = sum(1 for p, y in zip(preds, ground_truth) if p == 1 and y == 0)
            fn = sum(1 for p, y in zip(preds, ground_truth) if p == 0 and y == 1)
            tn = sum(1 for p, y in zip(preds, ground_truth) if p == 0 and y == 0)

            prec = tp / max(1, tp + fp)
            rec = tp / max(1, tp + fn)
            f1 = (2 * prec * rec) / max(1e-6, prec + rec)
            far = fp / max(1, fp + tn)

            seed_results.append({
                "seed": seed,
                "auc": auc,
                "f1": f1,
                "precision": prec,
                "recall": rec,
                "far": far
            })

        # Calculate mean and standard deviation
        def stats(key: str) -> Tuple[float, float]:
            vals = [r[key] for r in seed_results]
            mean_v = sum(vals) / len(vals)
            var_v = sum((v - mean_v) ** 2 for v in vals) / len(vals)
            std_v = math.sqrt(var_v)
            return round(mean_v, 4), round(std_v, 4)

        auc_mean, auc_std = stats("auc")
        f1_mean, f1_std = stats("f1")
        far_mean, far_std = stats("far")

        return {
            "architecture": architecture,
            "num_seeds": len(self.SEEDS),
            "seeds_tested": self.SEEDS,
            "metrics": {
                "roc_auc": f"{auc_mean * 100:.2f}% +/- {auc_std * 100:.2f}%",
                "f1_score": f"{f1_mean:.3f} +/- {f1_std:.3f}",
                "false_alarm_rate": f"{far_mean * 100:.2f}% +/- {far_std * 100:.2f}%"
            },
            "per_seed_breakdown": seed_results
        }

    @staticmethod
    def _calculate_auc(scores: List[float], labels: List[int]) -> float:
        pos = [s for s, y in zip(scores, labels) if y == 1]
        neg = [s for s, y in zip(scores, labels) if y == 0]
        if not pos or not neg:
            return 0.50

        concordant = 0
        for p in pos:
            for n in neg:
                if p > n:
                    concordant += 1.0
                elif p == n:
                    concordant += 0.5
        return concordant / (len(pos) * len(neg))
