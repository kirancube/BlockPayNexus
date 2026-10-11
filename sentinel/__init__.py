"""
SentinelAI X: Autonomous Public Safety Intelligence Platform
From Passive CCTV -> Intelligent Video Intelligence
"""

__version__ = "1.2.0"
__author__ = "SentinelAI Defense Intelligence Labs"
__dossier_id__ = "2024-SAX-003C"

from sentinel.config import load_config
from sentinel.core.c3d import C3D
from sentinel.core.mil_ranking import DeepMILRankingModel
from sentinel.core.loss import DeepMILRankingLoss

__all__ = [
    "load_config",
    "C3D",
    "DeepMILRankingModel",
    "DeepMILRankingLoss",
]
