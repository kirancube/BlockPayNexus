"""
Deep MIL Ranking Trainer
As specified in SentinelAI X Intelligence Dossier (Page 8, Page 9).

Optimization Settings:
  - Optimizer: Adagrad
  - Learning Rate: 0.001
  - Smoothness Coefficient (λ1): 8 x 10^-5
  - Sparsity Coefficient (λ2): 8 x 10^-5
  - Batch: Paired (Positive Bag, Negative Bag)
"""

import math
from typing import List, Dict, Any, Tuple, Optional
from sentinel.core.mil_ranking import DeepMILRankingModel
from sentinel.core.loss import DeepMILRankingLoss
from sentinel.data.dataset import VideoBag, UCFCrimeDataset

try:
    import torch
    import torch.optim as optim
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


class DeepMILTrainer:
    """
    Coordinates training of the Deep MIL Ranking Network using the Adagrad optimizer.
    """
    def __init__(
        self,
        model: Optional[Any] = None,
        learning_rate: float = 0.001,
        lambda_smoothness: float = 8e-5,
        lambda_sparsity: float = 8e-5,
        use_torch: bool = True
    ):
        self.lr = learning_rate
        self.lambda_1 = lambda_smoothness
        self.lambda_2 = lambda_sparsity
        self.use_torch = use_torch and HAS_TORCH

        self.model = model or DeepMILRankingModel(use_torch=self.use_torch)
        self.loss_fn = DeepMILRankingLoss(
            lambda_smoothness=self.lambda_1,
            lambda_sparsity=self.lambda_2,
            use_torch=self.use_torch
        )

        if self.use_torch and hasattr(self.model, "parameters"):
            self.optimizer = optim.Adagrad(self.model.parameters(), lr=self.lr, weight_decay=0.00005)
        else:
            self.optimizer = None
            # Adagrad historical gradient accumulators for standalone mode
            self.grad_sq_W3 = [0.0] * 32
            self.grad_sq_b3 = 0.0

    def train_step(self, pos_bag: VideoBag, neg_bag: VideoBag) -> Dict[str, float]:
        """
        Executes a single optimization step on a paired (positive, negative) video bag.
        """
        if self.use_torch and hasattr(self.model, "parameters"):
            self.model.train()
            self.optimizer.zero_grad()

            pos_tensor = torch.tensor(pos_bag.features, dtype=torch.float32)
            neg_tensor = torch.tensor(neg_bag.features, dtype=torch.float32)

            pos_scores = self.model(pos_tensor)
            neg_scores = self.model(neg_tensor)

            loss_dict = self.loss_fn(pos_scores, neg_scores)
            total_loss = loss_dict["total_loss"]

            total_loss.backward()
            self.optimizer.step()

            return {k: float(v.item() if hasattr(v, "item") else v) for k, v in loss_dict.items()}

        # Standalone Training Step (Zero-Dependency Adagrad gradient update)
        self.model.train(True)
        pos_scores = self.model.forward(pos_bag.features)
        neg_scores = self.model.forward(neg_bag.features)

        loss_breakdown = self.loss_fn(pos_scores, neg_scores)

        # Adagrad update on output linear layer W3
        max_pos_idx = pos_scores.index(max(pos_scores))
        max_neg_idx = neg_scores.index(max(neg_scores))
        
        # If hinge loss is active (1 - max_a + max_n > 0)
        if loss_breakdown["hinge_loss"] > 0.0:
            for k in range(len(self.model.W3)):
                g_k = (neg_scores[max_neg_idx] - pos_scores[max_pos_idx]) * 0.01
                self.grad_sq_W3[k] += g_k * g_k
                adagrad_step = self.lr / (math.sqrt(self.grad_sq_W3[k]) + 1e-8)
                self.model.W3[k] -= adagrad_step * g_k

        return loss_breakdown

    def train_epoch(self, dataset: UCFCrimeDataset, batch_size: int = 30) -> Dict[str, float]:
        """
        Runs one full epoch over sample bag pairs and aggregates metrics.
        """
        pairs = dataset.get_batch(batch_size=batch_size)
        accum_loss = 0.0
        accum_hinge = 0.0
        accum_smooth = 0.0
        accum_sparse = 0.0

        for pos_bag, neg_bag in pairs:
            metrics = self.train_step(pos_bag, neg_bag)
            accum_loss += metrics["total_loss"]
            accum_hinge += metrics["hinge_loss"]
            accum_smooth += metrics["smoothness_loss"]
            accum_sparse += metrics["sparsity_loss"]

        n = len(pairs)
        return {
            "epoch_loss": accum_loss / n,
            "avg_hinge_loss": accum_hinge / n,
            "avg_smoothness_loss": accum_smooth / n,
            "avg_sparsity_loss": accum_sparse / n,
        }
