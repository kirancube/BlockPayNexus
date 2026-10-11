# SentinelAI X — Research Data Split & Leakage Prevention Protocol
**Document Version:** 1.0.0-PROTOCOL  
**Standard:** International CVPR/ECCV Video Anomaly Detection Benchmarking Standard  
**Maintainers:** P R Kiran Kumar Reddy & Kurapati SriHarsha Vardhan  

---

## 1. Principle of Strict Partitioning

In video anomaly detection, data leakage is the most prevalent cause of artificially inflated performance metrics. If clips from the same physical video sequence, camera angle, or surveillance recording appear in both training and test sets, the model learns background spatial memorization rather than generalized temporal dynamics.

SentinelAI X enforces a strict **Zero-Leakage Invariant**:
$$\mathcal{V}_{train} \cap \mathcal{V}_{test} = \emptyset$$
$$\text{Clips}(v_i) \cap \text{Clips}(v_j) = \emptyset \quad \forall v_i \in \mathcal{V}_{train}, v_j \in \mathcal{V}_{test}$$

No frame, optical flow vector, temporal clip, or acoustic segment from a training video may ever be evaluated during testing.

---

## 2. Dataset Partitioning Protocols

### 2.1 UCF-Crime Benchmark Partition
- **Total Videos:** 1,900 untrimmed surveillance videos (~128 hours).
- **Categories:** 13 anomaly classes (Abuse, Arrest, Arson, Assault, Burglary, Explosion, Fighting, RoadAccidents, Robbery, Shooting, Shoplifting, Stealing, Vandalism) + Normal.
- **Split Distribution:**
  - **Training Set (800 Normal, 810 Anomaly = 1,610 videos):** Used exclusively for weak Multiple Instance Learning (bag-level labels only).
  - **Testing Set (150 Normal, 140 Anomaly = 290 videos):** Evaluated temporally using ground-truth frame-level annotation intervals.
- **Partition Rule:** Videos are strictly divided by unique video filename hash. All segments sampled from `Abuse028_x264` remain strictly within the test partition.

### 2.2 XD-Violence Multimodal Benchmark Partition
- **Total Videos:** 4,754 untrimmed videos (~217 hours) with synchronized audio.
- **Split Distribution:**
  - **Training Set:** 3,954 videos.
  - **Testing Set:** 800 videos.
- **Modality Synchronization:** Audio log-mel spectrogram frames and C3D/I3D visual features are sampled synchronously at 16 frames per second. Audio tracks are never partitioned independently of visual video streams.

### 2.3 ShanghaiTech Campus Benchmark Partition
- **Total Scenes:** 13 distinct CCTV scene viewpoints across a university campus.
- **Split Distribution:**
  - **Training Set:** 330 videos (strictly normal pedestrian and bicycle traffic).
  - **Testing Set:** 107 videos containing 130 anomalous events.
- **Scene-Level Separation:** Training and testing sets preserve scene distributions, but individual video recordings never overlap between splits.

---

## 3. Deterministic Seed Control

To ensure bit-exact reproducibility across independent research laboratories:
- Master PRNG seed: `42`
- Evaluation seeds: `[42, 123, 2026, 7, 99]`
- Bag sampling operates with a seeded pseudo-random generator, ensuring that temporal instance selection produces identical instance bags regardless of operating system or execution environment.

```python
# Formal Seed Protocol
import random
import os

def set_deterministic_seed(seed: int = 42):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    try:
        import numpy as np
        np.random.seed(seed)
    except ImportError:
        pass
    try:
        import torch
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
    except ImportError:
        pass
```

---

## 4. Verification & Audit Trail

The dataset adapter (`sentinel/data/unified_adapter.py`) programmatically validates the partition prior to initiating training:

$$\text{assert } |\mathcal{V}_{train} \cap \mathcal{V}_{test}| == 0, \quad \text{"DATA LEAKAGE DETECTED"}$$

If even a single video identifier is detected in both partitions, the loader immediately raises a `DataLeakageError` and halts pipeline execution.
