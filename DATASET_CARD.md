# Dataset Card — SentinelAI X
**Evaluation Standards:** UCF-Crime, XD-Violence, ShanghaiTech Campus  
**Audited Date:** September 2026  
**License Compliance:** Research & Academic Non-Commercial Use Only  

---

## 1. UCF-Crime Dataset

- **Source:** Center for Research in Computer Vision (CRCV), University of Central Florida (Sultani et al., CVPR 2018).
- **Scale:** 1,900 untrimmed CCTV surveillance videos (~128 hours) captured from actual urban surveillance cameras.
- **Classes (13 Anomaly Categories + Normal):** Abuse, Arrest, Arson, Assault, Burglary, Explosion, Fighting, RoadAccidents, Robbery, Shooting, Shoplifting, Stealing, Vandalism, and Normal routine surveillance.
- **Annotations:** Video-level binary labels for training (1,610 videos); frame-level temporal anomaly intervals $[t_{start}, t_{end}]$ for evaluation (290 testing videos).
- **Partition:** Strict zero-leakage split (800 normal + 810 anomaly in train; 150 normal + 140 anomaly in test). No video ID overlap.
- **Known Biases & Limitations:** Resolution varies widely from 240p to 720p with compression artifacts. Night-time footage is predominantly low-contrast black-and-white.

---

## 2. XD-Violence Dataset

- **Source:** Wu et al., ECCV 2020.
- **Scale:** 4,754 untrimmed videos (~217 hours) spanning movies, CCTV, dashcams, and mobile video.
- **Modality:** Synchronized stereo/mono audio tracks and visual streams.
- **Classes (6 Violence Categories + Normal):** Fighting, Shooting, Riot, Abuse, Car Accident, Explosion, and Normal.
- **Partition:** 3,954 training videos and 800 testing videos.
- **Annotations:** Frame-level binary labels for evaluation.
- **Intended Use:** Evaluating multi-modal late fusion where acoustic shockwaves (explosions, gunshots, screaming) disambiguate visually ambiguous physical altercations.

---

## 3. ShanghaiTech Campus Dataset

- **Source:** Luo et al., ICCV 2017.
- **Scale:** 437 high-resolution surveillance videos captured across 13 distinct campus camera scenes.
- **Classes:** 130 anomalous events including bicycle riding on pedestrian paths, skateboarding, fighting, chasing, and vehicle incursions.
- **Partition:** 330 training videos (strictly normal pedestrian flow) and 107 testing videos with pixel-level and frame-level ground truths.
- **Intended Use:** Evaluating zero-shot transfer and unsupervised one-class video anomaly detection in structured physical perimeters.

---

## 4. Privacy & Ethical Ingestion Guidelines

- Datasets are utilized exclusively for scientific benchmarking and algorithmic evaluation.
- No personally identifiable information (PII), faces, or biometric markers are redistributed within this repository.
- Researchers must agree to academic data user agreements directly through the respective hosting universities before running feature extraction pipelines.
