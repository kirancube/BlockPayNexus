"""
Deep Multiple Instance Learning (Deep MIL) Ranking Loss Function
As specified in SentinelAI X Intelligence Dossier (Page 6, Page 8, Page 9).

Mathematical Formulation:
  L(Ba, Bn) = max(0, 1 - max_{i in Ba} f(Vi^a) + max_{j in Bn} f(Vj^n))
            + λ1 * sum_{i=1}^{m-1} (f(Vi^a) - f(V_{i+1}^a))^2
            + λ2 * sum_{i=1}^{m} f(Vi^a)

Algorithmic Constraints (Physics of the Anomaly):
  - Law 1 [Temporal Sparsity]: λ2 = 8 x 10^-5
    Penalizes continuous high scores; real incidents do not last forever.
  - Law 2 [Continuous Flow]:   λ1 = 8 x 10^-5
    Penalizes erratic high-frequency jumps; enforces gradual contiguous change.
"""

from typing import Dict, Any, Union, List

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    nn = object


class DeepMILRankingLossTorch(nn.Module if HAS_TORCH else object):
    """
    PyTorch Implementation of Deep MIL Ranking Loss with Physics Constraints.
    """
    def __init__(self, lambda_smoothness: float = 8e-5, lambda_sparsity: float = 8e-5, margin: float = 1.0):
        if not HAS_TORCH:
            raise RuntimeError("PyTorch is required for DeepMILRankingLossTorch.")
        super().__init__()
        self.lambda_1 = lambda_smoothness
        self.lambda_2 = lambda_sparsity
        self.margin = margin

    def forward(self, scores_anomaly: "torch.Tensor", scores_normal: "torch.Tensor") -> Dict[str, "torch.Tensor"]:
        """
        Calculates ranking loss over positive and negative bags.
        scores_anomaly: (Batch, BagSize, 1) or (BagSize, 1)
        scores_normal:  (Batch, BagSize, 1) or (BagSize, 1)
        """
        # Squeeze singleton dimension if present
        if scores_anomaly.dim() == 3:
            scores_a = scores_anomaly.squeeze(-1)
            scores_n = scores_normal.squeeze(-1)
        elif scores_anomaly.dim() == 2 and scores_anomaly.size(1) == 1:
            scores_a = scores_anomaly.squeeze(-1).unsqueeze(0)
            scores_n = scores_normal.squeeze(-1).unsqueeze(0)
        else:
            scores_a = scores_anomaly
            scores_n = scores_normal

        # 1. Hinge Ranking Loss
        # Objective: max(f(V_i^a)) > max(f(V_j^n))
        max_a, _ = torch.max(scores_a, dim=-1)  # (Batch,)
        max_n, _ = torch.max(scores_n, dim=-1)  # (Batch,)
        
        hinge_loss = torch.clamp(self.margin - max_a + max_n, min=0.0).mean()

        # 2. Temporal Smoothness Loss (Law 2: Time is continuous)
        # sum_{i} (s_i - s_{i+1})^2
        diff = scores_a[:, :-1] - scores_a[:, 1:]
        smoothness_loss = torch.sum(diff ** 2, dim=-1).mean()

        # 3. Temporal Sparsity Loss (Law 1: Anomalies are brief)
        # sum_{i} s_i
        sparsity_loss = torch.sum(scores_a, dim=-1).mean()

        # Total Composite Loss
        total_loss = hinge_loss + (self.lambda_1 * smoothness_loss) + (self.lambda_2 * sparsity_loss)

        return {
            "total_loss": total_loss,
            "hinge_loss": hinge_loss,
            "smoothness_loss": smoothness_loss,
            "sparsity_loss": sparsity_loss,
            "max_anomaly_score": max_a.mean(),
            "max_normal_score": max_n.mean(),
        }


class DeepMILRankingLossStandalone:
    """
    Pure Python Implementation of Deep MIL Ranking Loss with Physics Constraints.
    """
    def __init__(self, lambda_smoothness: float = 8e-5, lambda_sparsity: float = 8e-5, margin: float = 1.0):
        self.lambda_1 = lambda_smoothness
        self.lambda_2 = lambda_sparsity
        self.margin = margin

    def __call__(self, scores_anomaly: List[float], scores_normal: List[float]) -> Dict[str, float]:
        """
        scores_anomaly: List of anomaly scores for instances in positive video bag
        scores_normal: List of anomaly scores for instances in normal video bag
        """
        if not scores_anomaly or not scores_normal:
            raise ValueError("Input score bags cannot be empty.")

        max_a = max(scores_anomaly)
        max_n = max(scores_normal)

        # 1. Hinge Ranking Loss
        hinge_loss = max(0.0, self.margin - max_a + max_n)

        # 2. Temporal Smoothness Loss
        smoothness_loss = 0.0
        for i in range(len(scores_anomaly) - 1):
            diff = scores_anomaly[i] - scores_anomaly[i + 1]
            smoothness_loss += diff * diff

        # 3. Temporal Sparsity Loss
        sparsity_loss = sum(scores_anomaly)

        total_loss = hinge_loss + (self.lambda_1 * smoothness_loss) + (self.lambda_2 * sparsity_loss)

        return {
            "total_loss": total_loss,
            "hinge_loss": hinge_loss,
            "smoothness_loss": smoothness_loss,
            "sparsity_loss": sparsity_loss,
            "max_anomaly_score": max_a,
            "max_normal_score": max_n,
        }


class DeepMILRankingLoss:
    """
    Unified Factory for Deep MIL Ranking Loss.
    """
    def __new__(cls, lambda_smoothness: float = 8e-5, lambda_sparsity: float = 8e-5, margin: float = 1.0, use_torch: bool = True):
        if use_torch and HAS_TORCH:
            return DeepMILRankingLossTorch(lambda_smoothness, lambda_sparsity, margin)
        return DeepMILRankingLossStandalone(lambda_smoothness, lambda_sparsity, margin)
