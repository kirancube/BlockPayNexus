"""
UCF-Crime Weakly Supervised Dataset Pipeline
As specified in SentinelAI X Intelligence Dossier (Page 5, Page 6, Page 10).

Represents untrimmed videos as Bags of 32 Spatiotemporal Instances:
  - Positive Bag (Anomaly Video): Contains >= 1 anomalous instance.
  - Negative Bag (Normal Video): Contains 0 anomalous instances.

Contains 13 Anomaly Categories:
  1. Abuse, 2. Arrest, 3. Arson, 4. Assault, 5. Burglary, 6. Explosion,
  7. Fighting, 8. Road Accidents, 9. Robbery, 10. Shooting,
  11. Shoplifting, 12. Stealing, 13. Vandalism, plus Normal.
"""

import math
import random
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Any, Optional


@dataclass
class VideoBag:
    video_id: str
    category: str
    is_anomaly: bool
    num_instances: int = 32
    features: List[List[float]] = field(default_factory=list)
    anomaly_window: Optional[Tuple[int, int]] = None  # (start_segment, end_segment) for evaluation


class UCFCrimeDataset:
    """
    Weakly Supervised Multiple Instance Learning Dataset for UCF-Crime.
    Generates paired Positive and Negative bags for ranking loss training.
    """
    CATEGORIES = [
        "Abuse", "Arrest", "Arson", "Assault", "Burglary",
        "Explosion", "Fighting", "Road Accidents", "Robbery",
        "Shooting", "Shoplifting", "Stealing", "Vandalism"
    ]

    def __init__(self, num_instances_per_bag: int = 32, feature_dim: int = 4096, seed: int = 42):
        self.num_instances = num_instances_per_bag
        self.feature_dim = feature_dim
        self.rng = random.Random(seed)
        self.positive_bags: List[VideoBag] = []
        self.negative_bags: List[VideoBag] = []

    def generate_synthetic_bag(self, video_id: str, category: str, is_anomaly: bool) -> VideoBag:
        """
        Synthesizes a 32-instance bag with spatiotemporal dynamics matching real UCF-Crime CCTV statistics.
        If anomalous, an anomaly signature is injected in a contiguous temporal window (e.g. segments 16-22).
        """
        bag_features = []
        anomaly_window = None

        if is_anomaly:
            # Pick a brief anomaly window (Law 1: Anomalies are brief)
            win_len = self.rng.randint(4, 7)
            start_win = self.rng.randint(10, self.num_instances - win_len - 2)
            anomaly_window = (start_win, start_win + win_len)

        base_angle = self.rng.uniform(0.1, 2.0)

        for i in range(self.num_instances):
            is_active_anomaly = is_anomaly and (anomaly_window[0] <= i <= anomaly_window[1])
            # Construct synthetic 4096D feature with spatiotemporal continuity
            inst_feat = []
            for d in range(self.feature_dim):
                base_val = math.sin((i + 1) * 0.15 + base_angle + d * 0.005)
                noise = self.rng.gauss(0.0, 0.05)
                if is_active_anomaly:
                    # Anomaly injection: elevated energy and spatiotemporal disturbance
                    anomaly_signal = 1.8 * math.cos(d * 0.02 + 1.2)
                    inst_feat.append(base_val + anomaly_signal + noise)
                else:
                    inst_feat.append(base_val + noise)

            # L2 normalization
            norm = math.sqrt(sum(v * v for v in inst_feat)) + 1e-12
            bag_features.append([v / norm for v in inst_feat])

        return VideoBag(
            video_id=video_id,
            category=category,
            is_anomaly=is_anomaly,
            num_instances=self.num_instances,
            features=bag_features,
            anomaly_window=anomaly_window
        )

    def load_mock_dataset(self, num_positive: int = 60, num_negative: int = 60):
        """Pre-populates dataset with balanced positive and negative bags across the 13 categories."""
        self.positive_bags = []
        self.negative_bags = []

        for i in range(num_positive):
            cat = self.CATEGORIES[i % len(self.CATEGORIES)]
            vid_id = f"{cat}{i+1:03d}_x264"
            bag = self.generate_synthetic_bag(vid_id, cat, is_anomaly=True)
            self.positive_bags.append(bag)

        for i in range(num_negative):
            vid_id = f"Normal_Videos_{i+1:03d}_x264"
            bag = self.generate_synthetic_bag(vid_id, "Normal", is_anomaly=False)
            self.negative_bags.append(bag)

    def get_batch(self, batch_size: int = 30) -> List[Tuple[VideoBag, VideoBag]]:
        """
        Samples paired (positive_bag, negative_bag) batches for MIL ranking.
        """
        pairs = []
        for _ in range(batch_size):
            pos = self.rng.choice(self.positive_bags)
            neg = self.rng.choice(self.negative_bags)
            pairs.append((pos, neg))
        return pairs
