"""
SentinelAI X Controlled Robustness & Environmental Stress Benchmarking Suite
Evaluates model degradation under synthetic real-world surveillance corruptions:
  1. Low Light / Nocturnal illumination attenuation
  2. Rain / Optical noise injection
  3. Camera Shake / Dynamic vibration jitter
  4. Compression Artifacts / Bitrate degradation
  5. Optical Occlusion / Spatial sensor masking

Measures AUC, F1, Precision, Recall, False Alarm Rate (FAR), and Latency.
"""

import math
import random
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass

from sentinel.core.mil_ranking import DeepMILRankingModel
from sentinel.core.world_model import SpatiotemporalWorldModel
from sentinel.core.hybrid_fusion import SentinelWorldHybridModel


@dataclass
class RobustnessMetric:
    corruption: str
    severity_level: int
    roc_auc: float
    f1_score: float
    precision: float
    recall: float
    false_alarm_rate: float
    latency_ms: float
    degradation_pct: float


class RobustnessEvaluator:
    """
    Simulates real-world environmental stress and measures performance degradation curves.
    """
    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = random.Random(seed)
        self.hybrid_model = SentinelWorldHybridModel(input_dim=4096, latent_dim=256, use_torch=False)

    def apply_corruption(
        self,
        features: List[float],
        corruption_type: str,
        severity: int
    ) -> List[float]:
        """
        Applies a synthetic physical corruption to a 4096-D spatiotemporal vector.
        Severity ranges from 1 (mild) to 5 (severe).
        """
        corrupted = list(features)
        dim = len(corrupted)

        if corruption_type == "low_light":
            # Attenuation of signal magnitude + baseline sensor thermal noise
            attenuation = 1.0 - (severity * 0.15)
            noise_std = severity * 0.04
            corrupted = [v * attenuation + self.rng.gauss(0, noise_std) for v in corrupted]

        elif corruption_type == "rain_noise":
            # High-frequency sporadic rain streak noise
            prob = severity * 0.12
            corrupted = [v + (self.rng.uniform(-0.6, 0.6) if self.rng.random() < prob else 0.0) for v in corrupted]

        elif corruption_type == "camera_shake":
            # Spatiotemporal jitter across feature indices
            shift = severity * 2
            corrupted = corrupted[shift:] + corrupted[:shift]

        elif corruption_type == "compression":
            # Quantization down to fewer discrete bins across dynamic range
            bins = max(4, 32 - severity * 5)
            min_v, max_v = min(corrupted), max(corrupted)
            range_v = max(1e-6, max_v - min_v)
            corrupted = [min_v + (round((v - min_v) / range_v * bins) / bins) * range_v for v in corrupted]

        elif corruption_type == "occlusion":
            # Mask contiguous chunk of dimensions (up to 30% of feature space)
            mask_len = int(dim * (severity * 0.06))
            start_mask = (severity * 400) % (dim - mask_len)
            for k in range(start_mask, start_mask + mask_len):
                corrupted[k] = 0.0

        # Renormalize L2 safely
        norm = math.sqrt(sum(v * v for v in corrupted))
        if norm < 1e-8:
            return features
        return [v / norm for v in corrupted]

    def run_benchmark(self, num_samples: int = 40) -> Dict[str, List[RobustnessMetric]]:
        """
        Runs comprehensive robustness sweeps across all 5 environmental corruptions.
        """
        corruptions = ["low_light", "rain_noise", "camera_shake", "compression", "occlusion"]
        results: Dict[str, List[RobustnessMetric]] = {}

        # Synthesize nominal and anomalous test vectors
        test_pairs: List[Tuple[List[float], int]] = []
        for i in range(num_samples // 2):
            # Normal routine
            feat = [0.03 * math.sin(i * 0.1 + d * 0.005) for d in range(4096)]
            norm = math.sqrt(sum(v * v for v in feat)) + 1e-12
            test_pairs.append(([v / norm for v in feat], 0))

            # Anomaly event
            feat_a = [0.03 * math.sin(i * 0.1 + d * 0.005) + 1.8 * math.cos(d * 0.02) for d in range(4096)]
            norm_a = math.sqrt(sum(v * v for v in feat_a)) + 1e-12
            test_pairs.append(([v / norm_a for v in feat_a], 1))

        # Baseline clean performance
        clean_scores = [self.hybrid_model.score_frame_vector(feat)["unified_score"] for feat, _ in test_pairs]
        clean_labels = [y for _, y in test_pairs]
        baseline_auc = self._calculate_auc(clean_scores, clean_labels)

        for corr in corruptions:
            results[corr] = []
            for sev in range(1, 6):
                pert_scores = []
                import time
                start_t = time.perf_counter()
                for feat, _ in test_pairs:
                    pert_feat = self.apply_corruption(feat, corr, sev)
                    res = self.hybrid_model.score_frame_vector(pert_feat)
                    pert_scores.append(res["unified_score"])
                dur_ms = round((time.perf_counter() - start_t) * 1000 / len(test_pairs), 2)

                auc = self._calculate_auc(pert_scores, clean_labels)
                degradation = ((baseline_auc - auc) / max(1e-6, baseline_auc)) * 100.0

                # Classification threshold = 0.50
                preds = [1 if s >= 0.50 else 0 for s in pert_scores]
                tp = sum(1 for p, y in zip(preds, clean_labels) if p == 1 and y == 1)
                fp = sum(1 for p, y in zip(preds, clean_labels) if p == 1 and y == 0)
                fn = sum(1 for p, y in zip(preds, clean_labels) if p == 0 and y == 1)
                tn = sum(1 for p, y in zip(preds, clean_labels) if p == 0 and y == 0)

                prec = tp / max(1, tp + fp)
                rec = tp / max(1, tp + fn)
                f1 = (2 * prec * rec) / max(1e-6, prec + rec)
                far = fp / max(1, fp + tn)

                results[corr].append(RobustnessMetric(
                    corruption=corr,
                    severity_level=sev,
                    roc_auc=round(auc, 4),
                    f1_score=round(f1, 4),
                    precision=round(prec, 4),
                    recall=round(rec, 4),
                    false_alarm_rate=round(far, 4),
                    latency_ms=dur_ms,
                    degradation_pct=round(degradation, 2)
                ))

        return results

    @staticmethod
    def _calculate_auc(scores: List[float], labels: List[int]) -> float:
        """Calculates exact ROC-AUC via rank-sum Wilcoxon-Mann-Whitney metric."""
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


def generate_robustness_markdown_table(benchmark_results: Dict[str, List[RobustnessMetric]]) -> str:
    """Formats benchmark results as a professional research Markdown table."""
    lines = [
        "| Corruption Condition | Severity (1-5) | ROC-AUC | F1-Score | FAR (%) | Latency (ms) | Degradation (%) |",
        "| :--- | :---: | :---: | :---: | :---: | :---: | :---: |"
    ]
    for corr, metrics in benchmark_results.items():
        for m in metrics:
            lines.append(
                f"| {m.corruption.replace('_', ' ').title()} | Level {m.severity_level} | "
                f"{m.roc_auc * 100:.2f}% | {m.f1_score:.3f} | {m.false_alarm_rate * 100:.2f}% | "
                f"{m.latency_ms:.2f} ms | -{m.degradation_pct:.2f}% |"
            )
    return "\n".join(lines)
