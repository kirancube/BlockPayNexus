# SentinelAI X — Master Reproducibility Guide
**Standard:** IEEE / ACM / CVPR Reproducibility Checklist Standard  
**Maintainers:** P R Kiran Kumar Reddy & Kurapati SriHarsha Vardhan  
**Repository:** [SentinelAIX](https://github.com/kirancube/SentinelAIX)  

---

## 1. Environment Setup

### 1.1 Minimum System Requirements
- **OS:** Linux (Ubuntu 20.04+), macOS 12+, or Windows 10/11 (PowerShell / WSL2).
- **Python:** 3.8+ (Supports zero-dependency pure Python standalone mode out of the box).
- **Node.js:** v18.0+ & npm 9.0+ (for Tactical HUD frontend).
- **Optional GPU:** NVIDIA CUDA 11.7+ with PyTorch 1.10+ for accelerated tensor batching.

### 1.2 Installation
```bash
# Clone the repository
git clone https://github.com/kirancube/SentinelAIX.git
cd SentinelAIX

# Optional: Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1

# Install Python requirements (Optional - Standalone mode requires NO external wheels)
pip install -r requirements.txt

# Install and build frontend
cd frontend
npm install
npm run build
cd ..
```

---

## 2. Dataset Preparation & Legal Sourcing

Datasets must be acquired directly from their respective academic institutions under research licenses:

1. **UCF-Crime:** Center for Research in Computer Vision (CRCV), University of Central Florida.
   - [Official UCF-Crime Portal](https://www.crcv.ucf.edu/projects/real-world/)
2. **XD-Violence:** Multimodal Video Anomaly Benchmark with synchronized audio.
   - [XD-Violence GitHub Portal](https://roc-ng.github.io/XD-Violence/)
3. **ShanghaiTech Campus:** Video Anomaly Detection in Campus Surveillance.
   - [ShanghaiTech VAD Portal](https://svip-lab.github.io/dataset/campus_dataset.html)

Place pre-extracted feature files in `data/<dataset_name>/` or point `config/config.yaml` to your local storage mount.

---

## 3. Preprocessing & Clip Sampling

Feature extraction executes 16-frame non-overlapping temporal windows at 30 FPS:
```bash
# Verify dataset adapter & zero-leakage invariant
python -m unittest tests/test_dataset_adapter.py
```

---

## 4. Model Training

Train the Deep Multiple Instance Learning (Deep MIL) ranking architecture under Adagrad optimization with Physics Constraints ($\lambda_1$ temporal smoothness, $\lambda_2$ temporal sparsity):
```bash
python scripts/run_training_demo.py
```

---

## 5. Temporal Localization & Event Segmentation

Segment continuous anomaly curves into discrete $[t_{start}, t_{end}]$ intervals and evaluate Temporal IoU (tIoU) and Temporal AP (tAP):
```bash
python -m unittest tests/test_temporal_localization.py
```

---

## 6. Multi-Seed Validation ($N = 5$)

Run evaluation across the five standard deterministic seeds `[42, 123, 2026, 7, 99]`:
```bash
python -c "from research.multiseed_evaluation import MultiSeedValidator; val = MultiSeedValidator(); res = val.run_multi_seed_evaluation(); print(res['metrics'])"
```

---

## 7. Environmental Stress & Robustness Sweeps

Evaluate model degradation under low light, rain, camera shake, compression, and occlusion:
```bash
python -m unittest tests/test_research_benchmarks.py
```

---

## 8. Tactical Operations Command Server

Launch the full central cloud API server and Tactical Operations HUD:
```bash
python scripts/run_dashboard.py --host 127.0.0.1 --port 8000
```
Access the Tactical HUD at: `http://127.0.0.1:8000`

---

## 9. Comprehensive Test Suite

Verify all 43 research test cases across the entire codebase:
```bash
python -m unittest discover tests
```
*Expected Result: 43 tests passing in ~16s.*
