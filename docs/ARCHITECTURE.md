# SentinelAI X: System Architecture & Design Dossier

**Document Classification:** UNCLASSIFIED // DEFENSE INTEL  
**Document ID:** SAI-X_ARCH_V1.2  
**Framework Status:** SYSTEM_ONLINE (60% Implemented Core, 40% Edge Extensions)

---

## 1. Executive Summary & Paradigm Shift

Modern surveillance infrastructure is burdened by an unsustainable ratio of cameras to human monitors. Legacy CCTV deployments store petabytes of raw pixels in cold storage while relying on fatigued operators to monitor multi-screen arrays. This introduces a catastrophic **Human Bottleneck** characterized by low throughput, high response latency, and a high rate of missed incidents.

```
LEGACY SURVEILLANCE PARADIGM (PASSIVE):
[Camera Node] ──(Throughput: Limited)──> [Video Storage] ──(Latency: High)──> [Human Bottleneck] ──> [Missed Incident]

SENTINELAI X FRAMEWORK (ACTIVE INTELLIGENCE):
[Camera Node] ──(Real-Time)──> [AI Perception: C3D] ──(Predictive)──> [Risk Analytics: MIL] ──> [Prioritized Alert (99.9%)]
```

**SentinelAI X** acts as an **AI Security Co-Pilot**. It ingests unstructured CCTV pixels, isolates spatiotemporal anomaly signals, suppresses environmental noise, and presents structured, investigated alerts to the human operator with closed-loop validation.

---

## 2. Tiered System Architecture

SentinelAI X is partitioned into two distinct functional zones:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ZONE 1: IMPLEMENTED CORE ENGINE                                    │
│                                                                                                  │
│   [Untrimmed Video] ──> [16-Frame Sampling] ──> [C3D Spatiotemporal] ──> [Deep MIL Ranking Model]│
│       Raw CCTV             Non-overlapping        4096-D Vectors          0-1 Anomaly Scores     │
└──────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ZONE 2: PLANNED EDGE EXTENSIONS                                    │
│                                                                                                  │
│   [Object Perception] ───────────────> [Risk Scoring] ─────────────────> [Incident Command UI]   │
│     YOLOv8 / ByteTrack                   Severity Engine                  Real-Time Tactical HUD │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Zone 1: Implemented Core
1. **Video Ingestion & 16-Frame Sampling:**
   - Ingests untrimmed CCTV streams (30–60 FPS).
   - Partitions video streams into contiguous 16-frame clips ($t \to t+16$).
   - Normalizes spatial dimensions to $112 \times 112$ with Sports-1M/UCF-101 channel mean subtraction.

2. **Spatiotemporal Feature Extraction (C3D Network):**
   - Utilizes $3 \times 3 \times 3$ spatiotemporal convolutional kernels to capture appearance and motion dynamics simultaneously.
   - Outputs a 4096-dimensional dense descriptor from the FC7 layer for every 16-frame clip.

3. **Stream 1: Deep Multiple Instance Learning (Deep MIL) Ranking Model:**
   - Architecture: $\text{Linear}(4096, 512) \to \text{ReLU} \to \text{Dropout}(0.60) \to \text{Linear}(512, 32) \to \text{ReLU} \to \text{Linear}(32, 1) \to \text{Sigmoid}$.
   - Regression mapping: $0.0 = \text{Nominal Surveillance Baseline}, 1.0 = \text{Critical Anomaly Spike}$.
   - Optimization: Adagrad with base learning rate $\eta = 0.001$.
   - **Law 1 (Temporal Sparsity $\lambda_2 = 8 \times 10^{-5}$):** Penalizes continuous high scores.
   - **Law 2 (Temporal Smoothness $\lambda_1 = 8 \times 10^{-5}$):** Enforces physical continuity.

4. **Stream 2: Spatiotemporal Latent World Model (SLWM):**
   - Inspired by Predictive Coding and Joint-Embedding Predictive Architectures (Video-JEPA).
   - Projects 4096-D vectors into a compact 256-D physical state manifold $z_t$.
   - Autoregressively forecasts expected inertial momentum $\hat{z}_{t+1}$.
   - Computes physical prediction divergence (Free Energy / Surprise): $\mathcal{E}_{world} = \|z_{t+1} - \hat{z}_{t+1}\|_2^2$.

5. **Gated Synergistic Fusion Gate (GSFG):**
   - Fuses discriminative ranking score $s_{disc}$ with generative world surprise $\mathcal{E}_{world}$.
   - Achieves mutual cross-verification: suppresses optical noise while instantly catching unexpected physical causality ruptures.

### Zone 2: Planned Edge Modules
1. **Object Perception (YOLOv8 + ByteTrack):**
   - Extracts bounding boxes, semantic classes (`person`, `vehicle`, `object`), and track identities.
   - Computes instantaneous object density and spatial velocity vectors ($\text{px/sec}$).

2. **Risk Scoring Severity Engine:**
   - Synthesizes deep spatiotemporal anomaly scores with object velocity and interaction dynamics.
   - Multi-factor formulation: $\text{Severity} = \min(1.0, f(V_i) \cdot (1.0 + \frac{v_{avg}}{200}))$.

3. **Tactical Operations Center HUD & LLM Incident Synthesizer:**
   - WebSocket streaming telemetry, live diagnostic curves (0 to 16,000 frames), and automated natural language briefings.

---

## 3. Network Topology: Hub-and-Spoke Mesh

```
                     ┌────────────────────────┐
                     │   CENTRAL CLOUD        │
                     │   COMMAND PLATFORM     │
                     │                        │
                     │  - Deep MIL Ranking    │
                     │  - Alert Packaging     │
                     │  - Tactical HUD API    │
                     └──────────▲─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │ (Encrypted RTSP)    │ (Encrypted RTSP)    │ (Encrypted RTSP)
          │                     │                     │
┌─────────┴────────┐  ┌─────────┴────────┐  ┌─────────┴────────┐
│  EDGE NODE 01    │  │  EDGE NODE 02    │  │  EDGE NODE 03    │
│  CAM_01: 4K      │  │  CAM_02: PTZ     │  │  CAM_03: ANPR    │
│  North Gate      │  │  Perimeter West  │  │  Transit South   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Sensor Grid Specifications:
- **CAM_01:** 4K Resolution (3840×2160), 30 FPS, FOV 90°. Assigned to Ultra-HD Static Perimeter Guard.
- **CAM_02:** 1080p Resolution, 60 FPS, PTZ Active with 30x optical zoom for dynamic target tracking.
- **CAM_03:** 1440p Resolution, 30 FPS, ANPR Ready for license plate recognition and vehicle velocity indexing.
- **CAM_04:** 1080p Resolution, 30 FPS, FOV 120° Wide Angle for high-density concourse crowd flow analysis.

---

## 4. Latency Budget & Real-Time Guarantees

SentinelAI X is engineered with strict real-time execution bounds:
- **16-Frame Batch Ingestion:** 533 ms buffer time at 30 FPS.
- **C3D Feature Extraction (Tensor Core GPU):** 12–18 ms.
- **Deep MIL Ranking Forward Pass:** **< 3.8 ms** (strictly compliant with the **< 5ms** latency budget).
- **End-to-End Alert Dispatch:** < 50 ms after clip completion.
