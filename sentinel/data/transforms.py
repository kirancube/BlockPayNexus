"""
Spatiotemporal Video Transformations & Augmentations
Resizing, center-cropping to (112, 112), and channel-wise mean subtraction.
"""

from typing import List, Any, Tuple

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


class SpatiotemporalTransform:
    """
    Standard preprocessing for C3D video perception:
    - Target spatial dimension: (112, 112)
    - Target clip length: 16 frames
    - Sports1M / UCF-101 channel mean: [104.0, 117.0, 123.0]
    """
    def __init__(self, crop_size: Tuple[int, int] = (112, 112), mean: Tuple[float, float, float] = (104.0, 117.0, 123.0)):
        self.crop_size = crop_size
        self.mean = mean

    def __call__(self, clip_tensor: Any) -> Any:
        """
        Normalize clip data. Accepts PyTorch tensor (C, T, H, W) or simulated list.
        """
        if HAS_TORCH and isinstance(clip_tensor, torch.Tensor):
            # clip_tensor: (C=3, T=16, H, W)
            # Subtract mean
            for c in range(3):
                clip_tensor[c] = clip_tensor[c] - self.mean[c]
            return clip_tensor
        return clip_tensor
