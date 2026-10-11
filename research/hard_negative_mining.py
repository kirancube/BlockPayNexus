"""
SentinelAI X Hard Negative Mining & Continuous Learning Pipeline
Stores operator-dismissed false alarms (running, weather, camera shake, benign crowds)
and injects them as hard negative instances during MIL retraining to reduce False Alarm Rate (FAR).
"""

import os
import json
import time
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict


@dataclass
class HardNegativeEntry:
    entry_id: str
    camera_id: str
    timestamp: str
    category: str  # 'RUNNING_SPORTS', 'OPTICAL_FLARE_WEATHER', 'BENIGN_CROWD', 'CAMERA_SHAKE'
    peak_score: float
    feature_vector: List[float]
    operator_id: str
    reason: str
    reused_in_retraining: bool = False


class HardNegativeStore:
    """
    Persistent store for hard negative surveillance instances.
    Default storage: JSONL audit ledger in local/cloud persistence directory.
    """
    def __init__(self, storage_path: str = "data/hard_negatives.jsonl"):
        self.storage_path = storage_path
        self._ensure_storage_exists()

    def _ensure_storage_exists(self):
        directory = os.path.dirname(self.storage_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        if not os.path.exists(self.storage_path):
            with open(self.storage_path, "w", encoding="utf-8") as f:
                pass

    def record_hard_negative(
        self,
        camera_id: str,
        category: str,
        peak_score: float,
        feature_vector: List[float],
        operator_id: str = "OPERATOR_01",
        reason: str = "Operator verified benign activity"
    ) -> HardNegativeEntry:
        """Appends a new hard negative to persistent storage."""
        entry = HardNegativeEntry(
            entry_id=f"HN-{int(time.time() * 1000)}",
            camera_id=camera_id,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            category=category,
            peak_score=round(peak_score, 4),
            feature_vector=feature_vector,
            operator_id=operator_id,
            reason=reason,
            reused_in_retraining=False
        )

        with open(self.storage_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(entry)) + "\n")

        return entry

    def load_all_entries(self) -> List[HardNegativeEntry]:
        """Loads all recorded hard negatives from disk."""
        entries = []
        if not os.path.exists(self.storage_path):
            return entries

        with open(self.storage_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    data = json.loads(line)
                    entries.append(HardNegativeEntry(**data))
        return entries


class HardNegativeMiner:
    """
    Mines recorded false alarms and integrates them into negative training bags.
    """
    def __init__(self, store: Optional[HardNegativeStore] = None):
        self.store = store or HardNegativeStore()

    def augment_negative_bag(
        self,
        nominal_bag_features: List[List[float]],
        mining_ratio: float = 0.25
    ) -> Tuple[List[List[float]], int]:
        """
        Substitutes a fraction of nominal bag instances with mined hard negative features.
        Forces the MIL loss function to penalize false alarms on complex edge cases.
        """
        hard_negatives = self.store.load_all_entries()
        if not hard_negatives:
            return nominal_bag_features, 0

        bag_len = len(nominal_bag_features)
        num_to_inject = max(1, int(bag_len * mining_ratio))

        augmented = list(nominal_bag_features)
        injected_count = 0

        for i in range(min(num_to_inject, len(hard_negatives))):
            idx_to_replace = (bag_len - 1) - i
            augmented[idx_to_replace] = hard_negatives[i].feature_vector
            injected_count += 1

        return augmented, injected_count

    def get_summary_statistics(self) -> Dict[str, Any]:
        """Computes statistical distribution of mined false positive categories."""
        entries = self.store.load_all_entries()
        distribution: Dict[str, int] = {}
        for e in entries:
            distribution[e.category] = distribution.get(e.category, 0) + 1

        return {
            "total_mined_instances": len(entries),
            "category_distribution": distribution,
            "storage_path": self.store.storage_path
        }
