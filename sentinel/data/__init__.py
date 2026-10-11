"""
SentinelAI X Data Management Package
- UCFCrimeDataset: Weakly supervised dataset generator and bag sampler
- SpatiotemporalTransforms: Frame resizing, cropping, and normalization
"""

from sentinel.data.dataset import UCFCrimeDataset, VideoBag
from sentinel.data.transforms import SpatiotemporalTransform

__all__ = [
    "UCFCrimeDataset",
    "VideoBag",
    "SpatiotemporalTransform",
]
