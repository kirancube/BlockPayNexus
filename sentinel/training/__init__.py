"""
SentinelAI X Training and Evaluation Pipeline
- DeepMILTrainer: Adagrad ranking optimization loop
- Evaluator: ROC-AUC, False Alarm Rate, and Multi-Class metrics
"""

from sentinel.training.trainer import DeepMILTrainer
from sentinel.training.evaluate import AnomalyEvaluator

__all__ = [
    "DeepMILTrainer",
    "AnomalyEvaluator",
]
