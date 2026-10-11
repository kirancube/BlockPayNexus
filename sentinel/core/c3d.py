"""
C3D: 3D Convolutional Network for Spatiotemporal Video Perception
As specified in SentinelAI X Intelligence Dossier (Page 4, Page 7).

Extracts appearance and motion dynamics simultaneously across 16-frame temporal windows
using 3x3x3 spatiotemporal kernels, outputting 4096-dimensional dense vectors.
"""

import math
from typing import List, Union, Tuple, Optional, Any

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    nn = object


class C3DNetworkTorch(nn.Module if HAS_TORCH else object):
    """
    Full PyTorch C3D Architecture for spatiotemporal video feature extraction.
    Input shape: (Batch, Channels=3, Depth=16, Height=112, Width=112)
    Output shape: (Batch, 4096) feature vector.
    """
    def __init__(self, feature_dim: int = 4096, pretrained: bool = False):
        if not HAS_TORCH:
            raise RuntimeError("PyTorch is required for C3DNetworkTorch.")
        super().__init__()
        self.feature_dim = feature_dim

        self.conv1 = nn.Conv3d(3, 64, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.pool1 = nn.MaxPool3d(kernel_size=(1, 2, 2), stride=(1, 2, 2))

        self.conv2 = nn.Conv3d(64, 128, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.pool2 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))

        self.conv3a = nn.Conv3d(128, 256, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.conv3b = nn.Conv3d(256, 256, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.pool3 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))

        self.conv4a = nn.Conv3d(256, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.conv4b = nn.Conv3d(512, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.pool4 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))

        self.conv5a = nn.Conv3d(512, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.conv5b = nn.Conv3d(512, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.pool5 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2), padding=(0, 1, 1))

        self.relu = nn.ReLU()
        self.fc6 = nn.Linear(8192, 4096)
        self.fc7 = nn.Linear(4096, feature_dim)
        self.dropout = nn.Dropout(p=0.5)

    def forward(self, x: "torch.Tensor") -> "torch.Tensor":
        """
        Forward pass through C3D layers up to FC7 feature representation.
        x: (B, 3, 16, 112, 112)
        returns: (B, 4096) normalized spatiotemporal feature vectors.
        """
        h = self.relu(self.conv1(x))
        h = self.pool1(h)

        h = self.relu(self.conv2(h))
        h = self.pool2(h)

        h = self.relu(self.conv3a(h))
        h = self.relu(self.conv3b(h))
        h = self.pool3(h)

        h = self.relu(self.conv4a(h))
        h = self.relu(self.conv4b(h))
        h = self.pool4(h)

        h = self.relu(self.conv5a(h))
        h = self.relu(self.conv5b(h))
        h = self.pool5(h)

        h = h.view(h.size(0), -1)
        h = self.relu(self.fc6(h))
        h = self.dropout(h)
        h = self.relu(self.fc7(h))

        # L2 Normalization of spatiotemporal feature representation
        norm = torch.norm(h, p=2, dim=1, keepdim=True) + 1e-12
        features = h / norm
        return features


class C3DStandalone:
    """
    Lightweight standalone C3D descriptor simulator & deterministic feature extractor.
    Enables zero-dependency local execution, unit testing, and edge node simulation.
    """
    def __init__(self, feature_dim: int = 4096):
        self.feature_dim = feature_dim

    def forward(self, clip_frames: List[Any]) -> List[float]:
        """
        Deterministic spatiotemporal hash-projection simulating 4096-D C3D feature.
        """
        num_frames = len(clip_frames)
        # Compute spatiotemporal pseudo-moments
        seed_val = 0.0
        for idx, frame in enumerate(clip_frames):
            if isinstance(frame, (list, tuple)):
                flat_sum = sum(sum(row) if isinstance(row, list) else row for row in frame)
            elif hasattr(frame, "sum"):
                flat_sum = float(frame.sum())
            else:
                flat_sum = float(hash(str(frame)) % 1000)
            seed_val += flat_sum * ((idx + 1) ** 0.5)

        # Generate deterministic 4096-D pseudo-features
        raw_vec = []
        for i in range(self.feature_dim):
            val = math.sin((seed_val + 1.0) * (i + 1) * 0.007) * math.cos(i * 0.03)
            raw_vec.append(val)

        # L2 normalization
        norm = math.sqrt(sum(v * v for v in raw_vec)) + 1e-12
        return [v / norm for v in raw_vec]


class C3D:
    """
    Unified C3D Factory dispatching either Torch GPU/CPU model or Standalone descriptor.
    """
    def __new__(cls, feature_dim: int = 4096, use_torch: bool = True):
        if use_torch and HAS_TORCH:
            return C3DNetworkTorch(feature_dim=feature_dim)
        return C3DStandalone(feature_dim=feature_dim)
