# Model Card — SentinelAI X
**Model Name:** SentinelAI X (Dual-Stream Spatiotemporal MIL + Latent World Model + Multimodal ASTD)  
**Version:** 1.3.0-RESEARCH  
**Model Date:** September 2026  
**Authors:** P R Kiran Kumar Reddy & Kurapati SriHarsha Vardhan  
**License:** Apache 2.0  

---

## 1. Model Details

### 1.1 Model Purpose
SentinelAI X is an artificial intelligence surveillance platform engineered for **weakly supervised video anomaly intelligence, temporal event localization, Bayesian evidential uncertainty quantification, and Human-in-the-Loop operational response**.

### 1.2 Core Architecture
- **Visual Stream:** 3D Convolutional Network (C3D / 3x3x3 kernels) extracting 4096-dimensional spatiotemporal descriptors over 16-frame sliding windows.
- **Discriminative Stream:** Deep Multiple Instance Learning (Deep MIL) with 512-D and 32-D hidden representations, dropout ($p=0.60$), and sigmoid activation.
- **Physical Dynamics Stream:** Spatiotemporal Latent World Model (SLWM) projecting 4096-D features into a 256-D latent state $z_t$ and autoregressively forecasting nominal transition continuation $\hat{z}_{t+1}$. Free-energy prediction error $\|z_{t+1} - \hat{z}_{t+1}\|_2^2$ flags causality violations.
- **Acoustic Stream:** Acoustic Spectrogram Transient Detector (ASTD) tracking 128-band Mel spectral flux $\Delta E_{dB} / \Delta t$ for percussive acoustic shocks.
- **Evidential Stream:** Beta-Dirichlet uncertainty quantification with 99% Conformal Prediction intervals $[S_{lower}, S_{upper}]$, Epistemic novelty $u$, and Aleatoric noise $\sigma$.
- **Graph Mesh:** Cross-camera topological graph neural network (Mesh-VAD) diffusing spatial threat priors across adjacent CCTV nodes.

---

## 2. Intended Use & Boundaries

### 2.1 Intended Use
- Assisting human security operators in monitoring high-density surveillance transit hubs, public venues, and critical infrastructure.
- Pre-filtering thousands of video hours to prioritize review queues for human operators.
- Structuring automated tactical situation reports (MIL-STD-2525D SALUTE dossiers) to accelerate human decision-making.

### 2.2 Prohibited & Non-Intended Use
- **Autonomous Lethal or Enforcement Action:** SentinelAI X must NEVER autonomously dispatch armed force or make arrest decisions.
- **Biometric Identification & Profiling:** The model does not perform facial recognition, race classification, demographic profiling, or intent inferencing.
- **Judicial Determination of Guilt:** AI suspicion $\neq$ confirmed crime. Alerts represent physical velocity and kinetic anomalies, not legal culpability.

---

## 3. Training Methodology & Data

- **Methodology:** Weakly Supervised Multiple Instance Learning (MIL) where videos have bag-level labels only ($y \in \{0, 1\}$). No frame-level annotations required during training.
- **Loss Function:** Hinge ranking loss + Law 1 Temporal Sparsity ($\lambda_2 = 8 \times 10^{-5}$) + Law 2 Temporal Smoothness ($\lambda_1 = 8 \times 10^{-5}$).
- **Benchmark Datasets:** UCF-Crime (1,900 videos), XD-Violence (4,754 multimodal videos), ShanghaiTech Campus (13 scenes, 437 videos).

---

## 4. Limitations & Failure Modes

1. **Occlusion & Crowding:** Severe optical occlusion (>30% of field of view) degrades detection sensitivity by up to 21%.
2. **Rapid Camera Panning (PTZ):** High-speed pan-tilt-zoom motion induces artificial optical flow divergence that can trigger false positives without stationary background subtraction.
3. **Acoustic Background Echo:** Reverberant transit concourses can smear acoustic transient timing by 200–400 ms.
4. **Lighting Shift Transitions:** Abrupt switching from daylight to sodium vapor lamps can temporarily elevate epistemic uncertainty ($u > 0.35$), appropriately flagging the event for manual operator verification.
