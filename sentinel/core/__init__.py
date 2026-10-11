"""
SentinelAI X Core Deep Learning Modules
- C3D: 3D Convolutional Spatiotemporal Feature Extraction
- DeepMILRankingModel: Multiple Instance Learning Anomaly Ranking
- DeepMILRankingLoss: Hinge Ranking Loss with Sparsity and Smoothness Penalties
- FeatureExtractor: 16-frame chunker & pipeline integration
"""

from sentinel.core.c3d import C3D
from sentinel.core.mil_ranking import DeepMILRankingModel
from sentinel.core.loss import DeepMILRankingLoss
from sentinel.core.feature_extractor import VideoFeatureExtractor

__all__ = [
    "C3D",
    "DeepMILRankingModel",
    "DeepMILRankingLoss",
    "VideoFeatureExtractor",
]
