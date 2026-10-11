# SentinelAI X — Responsible AI, Ethics & Operational Governance Charter
**Document Version:** 1.0.0-GOVERNANCE  
**Standard:** IEEE Global AI Ethics Initiative & EU AI Act High-Risk AI System Guidelines  
**Lead Authors:** P R Kiran Kumar Reddy & Kurapati SriHarsha Vardhan  

---

## 1. Foundational Governance Principles

### 1.1 The Golden Invariant of Human Oversight
$$\text{AI Anomaly Suspicion} \neq \text{Confirmed Incident} \neq \text{Confirmed Crime}$$

SentinelAI X is fundamentally engineered as an **augmented decision-support tool**, NOT an autonomous enforcement agent. Under no circumstances may output from this system trigger autonomous physical containment, lethal action, or legal citation without explicit, authenticated human operator verification.

### 1.2 Prohibited Usages
1. **No Autonomous Weaponry or Force Deployment:** The API cannot interface with lethal autonomous weapon systems (LAWS) or remote electronic immobilization devices.
2. **No Facial Recognition or Biometric Profiling:** SentinelAI X does not detect identity, race, gender, age, religion, or demographic markers. It evaluates non-biometric kinetic velocities and spatiotemporal feature divergences only.
3. **No Intent or Mental State Attribution:** The system measures physical motion, spatiotemporal continuity, and acoustic energy; it never infers internal psychological intent or moral culpability.

---

## 2. Privacy-Preserving Architecture

### 2.1 Edge Processing & Metadata-Only Transmission
Where deployed on edge nodes (NVIDIA Jetson, Raspberry Pi), raw video frames are processed locally. Only compact 4096-D mathematical feature vectors and anonymized bounding box coordinates are transmitted across network boundaries:
$$\text{Camera} \xrightarrow{\text{Edge Device}} \text{Extract } z_t \in \mathbb{R}^{256} \xrightarrow{\text{Encrypted Tunnel}} \text{Central Cloud API}$$
Raw CCTV video never leaves the localized security enclave unless explicitly requested by an operator during an active verified incident.

### 2.2 Face Anonymization & Optical Defocusing
The operator interface supports automatic face and license plate Gaussian blurring to preserve citizen privacy during routine monitoring.

### 2.3 Strict Data Retention Lifecycles
- **Nominal Telemetry:** Automatically purged after 24 hours.
- **Unverified Alerts:** Purged after 7 days unless preserved by operator override.
- **Operator Audit Ledger:** Retained cryptographically for auditability and compliance reviews.

---

## 3. Disentangled Uncertainty & Fallback Behavior

When environmental conditions deteriorate (e.g. dense fog, sensor glare, OOD crowd behavior), the **Bayesian Evidential Uncertainty Engine** flags high epistemic novelty ($u > 0.35$). In this state:
- The system declares `HUMAN_AUDIT_REQUIRED`.
- Autonomous dispatch suggestions are suppressed.
- The human operator is notified that the sensor environment has drifted beyond certified statistical distribution bounds.

---

## 4. Continuous Hard Negative Mining

To prevent algorithmic bias against normal athletic activity (running, jogging, sports) or environmental conditions (rain, shadows, swaying foliage), dismissed false alarms are fed into `research/hard_negative_mining.py`. These instances are continuously integrated as negative bags during periodic offline retraining to systematically drive down false alarm rates.
