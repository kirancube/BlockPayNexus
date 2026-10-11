"""
SentinelAI X Uncertainty Calibration & Reliability Engine
Implements:
  1. Temperature Scaling for logit probability calibration
  2. Expected Calibration Error (ECE) with M-bin partitioning
  3. Brier Score (Mean Squared Probability Discrepancy)
  4. Reliability Diagram data generator
  5. Monte Carlo Dropout (MC-Dropout) Epistemic Uncertainty Estimation
"""

import math
from typing import List, Dict, Any, Tuple, Optional


class TemperatureScaling:
    """
    Learns or applies a temperature parameter T > 0 to calibrate model logits.
    p = 1 / (1 + exp(-logit / T))
    """
    def __init__(self, temperature: float = 1.0):
        self.temperature = max(0.01, temperature)

    def calibrate_logit(self, logit: float) -> float:
        """Calibrates a single scalar logit."""
        scaled = logit / self.temperature
        return 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, scaled))))

    def calibrate_scores(self, logits: List[float]) -> List[float]:
        """Calibrates an array of logits."""
        return [self.calibrate_logit(l) for l in logits]

    def fit(self, logits: List[float], labels: List[int], lr: float = 0.05, max_iter: int = 100):
        """
        Optimizes temperature T using gradient descent on Negative Log-Likelihood (NLL).
        """
        if not logits or not labels or len(logits) != len(labels):
            return

        T = self.temperature
        for _ in range(max_iter):
            # Compute NLL gradient with respect to T
            grad = 0.0
            n = len(logits)
            for z, y in zip(logits, labels):
                p = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, z / T))))
                # dL/dT = (p - y) * (-z / T^2)
                grad += (p - y) * (-z / (T * T))
            grad /= n
            T = max(0.1, T - lr * grad)

        self.temperature = round(T, 4)


class CalibrationMetrics:
    """
    Evaluates probability calibration metrics: ECE, MCE, Brier Score, and Reliability Diagrams.
    """
    @staticmethod
    def brier_score(probabilities: List[float], ground_truths: List[int]) -> float:
        """
        Computes Brier Score: (1/N) * sum((p_i - y_i)^2).
        Ranges from 0.0 (perfect) to 1.0 (completely erroneous).
        """
        if not probabilities or not ground_truths or len(probabilities) != len(ground_truths):
            return 0.0
        n = len(probabilities)
        mse = sum((p - y) ** 2 for p, y in zip(probabilities, ground_truths)) / n
        return round(mse, 4)

    @staticmethod
    def expected_calibration_error(
        probabilities: List[float],
        ground_truths: List[int],
        num_bins: int = 10
    ) -> Dict[str, Any]:
        """
        Partitions predictions into num_bins and calculates ECE and Maximum Calibration Error (MCE).
        """
        if not probabilities or not ground_truths:
            return {"ece": 0.0, "mce": 0.0, "reliability_diagram": []}

        n = len(probabilities)
        bin_size = 1.0 / num_bins
        bins: List[List[Tuple[float, int]]] = [[] for _ in range(num_bins)]

        for p, y in zip(probabilities, ground_truths):
            b_idx = min(int(p / bin_size), num_bins - 1)
            bins[b_idx].append((p, y))

        total_ece = 0.0
        max_error = 0.0
        reliability_data = []

        for b_idx, b in enumerate(bins):
            bin_lower = b_idx * bin_size
            bin_upper = (b_idx + 1) * bin_size
            bin_center = (bin_lower + bin_upper) / 2.0

            if not b:
                reliability_data.append({
                    "bin_center": round(bin_center, 2),
                    "confidence": round(bin_center, 2),
                    "accuracy": 0.0,
                    "count": 0,
                    "calibration_gap": 0.0
                })
                continue

            count = len(b)
            avg_conf = sum(p for p, _ in b) / count
            avg_acc = sum(y for _, y in b) / count
            gap = abs(avg_acc - avg_conf)

            total_ece += (count / n) * gap
            max_error = max(max_error, gap)

            reliability_data.append({
                "bin_center": round(bin_center, 2),
                "confidence": round(avg_conf, 4),
                "accuracy": round(avg_acc, 4),
                "count": count,
                "calibration_gap": round(gap, 4)
            })

        return {
            "ece": round(total_ece, 4),
            "mce": round(max_error, 4),
            "num_samples": n,
            "num_bins": num_bins,
            "reliability_diagram": reliability_data
        }


class MonteCarloDropoutEstimator:
    """
    Performs Monte Carlo Dropout sampling to disentangle Epistemic (model uncertainty)
    from Aleatoric (data/optical noise) uncertainty.
    """
    def __init__(self, num_samples: int = 15, dropout_rate: float = 0.35):
        self.num_samples = num_samples
        self.dropout_rate = dropout_rate

    def estimate_uncertainty(
        self,
        base_logit: float,
        noise_level: float = 0.05
    ) -> Dict[str, float]:
        """
        Samples K perturbed forward passes to calculate mean and variance.
        """
        import random
        rng = random.Random(42)
        samples = []
        for _ in range(self.num_samples):
            # Stochastic dropout perturbation
            mask = 1.0 if rng.random() > self.dropout_rate else 0.0
            pert = rng.gauss(0.0, noise_level)
            logit_sample = base_logit * (mask / (1.0 - self.dropout_rate + 1e-6)) + pert
            prob = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, logit_sample))))
            samples.append(prob)

        mean_p = sum(samples) / len(samples)
        # Predictive variance (Epistemic uncertainty)
        var_p = sum((s - mean_p) ** 2 for s in samples) / len(samples)
        epistemic_std = math.sqrt(var_p)

        # Aleatoric uncertainty: entropy of expected probability
        p_safe = max(1e-6, min(1.0 - 1e-6, mean_p))
        entropy = -(p_safe * math.log(p_safe) + (1.0 - p_safe) * math.log(1.0 - p_safe))
        aleatoric_norm = entropy / math.log(2.0)  # Normalized to [0, 1]

        return {
            "risk_score": round(mean_p, 4),
            "confidence": round(1.0 - epistemic_std, 4),
            "epistemic_uncertainty": round(epistemic_std, 4),
            "aleatoric_uncertainty": round(aleatoric_norm * noise_level, 4)
        }
