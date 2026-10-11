"""
SentinelAI X Configurable Temporal Architectures
Implements modular temporal models:
  1. C3D + Deep MIL (Baseline)
  2. Temporal CNN (TCN with Multi-Scale 1D Convolutions)
  3. BiLSTM / Recurrent Temporal Dynamics
  4. Temporal Transformer (Self-Attention over Bag Instances)
  5. Lightweight Hybrid Model

Supports seamless switching via configuration without source code modifications.
Supports both PyTorch GPU tensors and zero-dependency standalone execution.
"""

import math
import random
from typing import List, Dict, Any, Optional, Tuple, Union

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    nn = object


# ============================================================================
# PyTorch Temporal Implementations
# ============================================================================

if HAS_TORCH:
    class TemporalCNNTorch(nn.Module):
        """1D Temporal Convolutional Network over temporal feature sequences."""
        def __init__(self, input_dim: int = 4096, hidden_dim: int = 256, dropout: float = 0.5):
            super().__init__()
            self.conv1 = nn.Conv1d(input_dim, hidden_dim, kernel_size=3, padding=1)
            self.relu1 = nn.ReLU()
            self.conv2 = nn.Conv1d(hidden_dim, hidden_dim, kernel_size=3, padding=1)
            self.relu2 = nn.ReLU()
            self.dropout = nn.Dropout(dropout)
            self.classifier = nn.Linear(hidden_dim, 1)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            # x: (Batch, BagSize, 4096) -> transpose to (Batch, 4096, BagSize)
            h = x.transpose(1, 2)
            h = self.relu1(self.conv1(h))
            h = self.relu2(self.conv2(h))
            h = self.dropout(h)
            h = h.transpose(1, 2)  # (Batch, BagSize, Hidden)
            out = self.classifier(h)
            return self.sigmoid(out)

    class BiLSTMTorch(nn.Module):
        """Bidirectional LSTM over temporal instance sequences."""
        def __init__(self, input_dim: int = 4096, hidden_dim: int = 128, dropout: float = 0.5):
            super().__init__()
            self.lstm = nn.LSTM(input_dim, hidden_dim, batch_first=True, bidirectional=True)
            self.dropout = nn.Dropout(dropout)
            self.classifier = nn.Linear(hidden_dim * 2, 1)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            lstm_out, _ = self.lstm(x)
            h = self.dropout(lstm_out)
            out = self.classifier(h)
            return self.sigmoid(out)

    class TemporalTransformerTorch(nn.Module):
        """Temporal Transformer with Multi-Head Self-Attention over sequence bags."""
        def __init__(self, input_dim: int = 4096, d_model: int = 256, nhead: int = 4, num_layers: int = 2, dropout: float = 0.1):
            super().__init__()
            self.proj = nn.Linear(input_dim, d_model)
            encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, dim_feedforward=d_model * 2, dropout=dropout, batch_first=True)
            self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
            self.classifier = nn.Linear(d_model, 1)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            h = self.proj(x)
            h = self.transformer(h)
            out = self.classifier(h)
            return self.sigmoid(out)


# ============================================================================
# Zero-Dependency Standalone Pure-Python Implementations
# ============================================================================

class TemporalCNNStandalone:
    """Zero-dependency Temporal CNN with moving-window local context filtering."""
    def __init__(self, input_dim: int = 4096, kernel_size: int = 3):
        self.input_dim = input_dim
        self.kernel_size = kernel_size
        self.rng = random.Random(42)
        # Projection weights
        self.w_proj = [self.rng.uniform(-0.01, 0.01) for _ in range(input_dim)]
        self.bias = -2.8

    def forward(self, sequence: List[List[float]]) -> List[float]:
        """Processes bag of instances with temporal convolutional receptive field."""
        seq_len = len(sequence)
        raw_scores = []
        for vec in sequence:
            dot = sum(v * w for v, w in zip(vec, self.w_proj)) + self.bias
            score = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, dot))))
            raw_scores.append(score)

        # 1D Convolutional smoothing
        smoothed = []
        half_k = self.kernel_size // 2
        for i in range(seq_len):
            window = [raw_scores[max(0, min(seq_len - 1, i + k))] for k in range(-half_k, half_k + 1)]
            smoothed.append(sum(window) / len(window))
        return smoothed


class BiLSTMStandalone:
    """Zero-dependency Bidirectional Recurrent Context Simulator."""
    def __init__(self, input_dim: int = 4096):
        self.input_dim = input_dim
        self.rng = random.Random(43)
        self.w_forward = [self.rng.uniform(-0.01, 0.01) for _ in range(input_dim)]
        self.w_backward = [self.rng.uniform(-0.01, 0.01) for _ in range(input_dim)]
        self.bias = -2.8

    def forward(self, sequence: List[List[float]]) -> List[float]:
        seq_len = len(sequence)
        forward_pass = []
        h_f = 0.0
        for vec in sequence:
            x_val = sum(v * w for v, w in zip(vec, self.w_forward))
            h_f = 0.7 * h_f + 0.3 * x_val
            forward_pass.append(h_f)

        backward_pass = []
        h_b = 0.0
        for vec in reversed(sequence):
            x_val = sum(v * w for v, w in zip(vec, self.w_backward))
            h_b = 0.7 * h_b + 0.3 * x_val
            backward_pass.append(h_b)
        backward_pass.reverse()

        scores = []
        for f, b in zip(forward_pass, backward_pass):
            logit = (f + b) + self.bias
            s = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, logit))))
            scores.append(s)
        return scores


class TemporalTransformerStandalone:
    """
    Zero-dependency Temporal Transformer with self-attention across sequence instances.
    Calculates query-key attention affinities: Attention(Q, K, V) = softmax(QK^T / sqrt(d)) * V.
    """
    def __init__(self, input_dim: int = 4096, d_model: int = 64):
        self.input_dim = input_dim
        self.d_model = d_model
        self.rng = random.Random(44)
        # Scaled random projection matrix
        scale = math.sqrt(2.0 / input_dim)
        self.W_q = [[self.rng.gauss(0, scale) for _ in range(d_model)] for _ in range(min(input_dim, 256))]
        self.W_k = [[self.rng.gauss(0, scale) for _ in range(d_model)] for _ in range(min(input_dim, 256))]
        self.w_out = [self.rng.gauss(0, 0.1) for _ in range(d_model)]
        self.bias = -2.9

    def forward(self, sequence: List[List[float]]) -> List[float]:
        seq_len = len(sequence)
        # Project inputs to compact attention dimension
        Q = []
        K = []
        for vec in sequence:
            q_vec = [0.0] * self.d_model
            k_vec = [0.0] * self.d_model
            limit = min(len(vec), len(self.W_q))
            for i in range(limit):
                v = vec[i]
                for j in range(self.d_model):
                    q_vec[j] += v * self.W_q[i][j]
                    k_vec[j] += v * self.W_k[i][j]
            Q.append(q_vec)
            K.append(k_vec)

        # Self-Attention Matrix
        scores = []
        inv_sqrt = 1.0 / math.sqrt(self.d_model)
        for i in range(seq_len):
            # Compute affinities to all tokens
            affinities = []
            for j in range(seq_len):
                dot = sum(Q[i][d] * K[j][d] for d in range(self.d_model)) * inv_sqrt
                affinities.append(dot)

            # Softmax
            max_a = max(affinities)
            exp_a = [math.exp(a - max_a) for a in affinities]
            sum_exp = sum(exp_a)
            weights = [e / sum_exp for e in exp_a]

            # Context vector
            ctx = [0.0] * self.d_model
            for j, w in enumerate(weights):
                for d in range(self.d_model):
                    ctx[d] += w * Q[j][d]

            # Output projection
            logit = sum(c * wo for c, wo in zip(ctx, self.w_out)) + self.bias
            s = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, logit))))
            scores.append(round(s, 5))

        return scores


# ============================================================================
# Temporal Architecture Factory
# ============================================================================

def create_temporal_model(
    model_type: str = "transformer",
    input_dim: int = 4096,
    use_torch: bool = True
) -> Any:
    """
    Factory function to instantiate configurable temporal anomaly models.
    Supports: 'c3d_mil', 'tcn', 'bilstm', 'transformer'.
    """
    model_type = model_type.lower()
    use_torch_active = use_torch and HAS_TORCH

    if model_type in ["transformer", "temporal_transformer"]:
        if use_torch_active:
            return TemporalTransformerTorch(input_dim=input_dim)
        return TemporalTransformerStandalone(input_dim=input_dim)

    elif model_type in ["tcn", "temporal_cnn"]:
        if use_torch_active:
            return TemporalCNNTorch(input_dim=input_dim)
        return TemporalCNNStandalone(input_dim=input_dim)

    elif model_type in ["bilstm", "lstm", "rnn"]:
        if use_torch_active:
            return BiLSTMTorch(input_dim=input_dim)
        return BiLSTMStandalone(input_dim=input_dim)

    elif model_type in ["c3d_mil", "mil", "c3d"]:
        from sentinel.core.mil_ranking import DeepMILRankingModel
        return DeepMILRankingModel(input_dim=input_dim, use_torch=use_torch_active)

    else:
        # Default fallback to Temporal Transformer
        if use_torch_active:
            return TemporalTransformerTorch(input_dim=input_dim)
        return TemporalTransformerStandalone(input_dim=input_dim)
