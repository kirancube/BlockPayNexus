# SentinelAI X: Mathematical Foundations & Algorithmic Formulations

**Document Classification:** UNCLASSIFIED // DEFENSE INTEL  
**Report ID:** 2024-SAX-003B  
**Target Domain:** Weakly Supervised Spatiotemporal Video Anomaly Detection

---

## 1. Multiple Instance Learning (MIL) Formulation

In real-world public safety video feeds, precise frame-level boundary annotations ($t_{start}, t_{end}$) are virtually impossible to acquire at scale across millions of surveillance hours. Weak supervision via Multiple Instance Learning circumvents this annotation bottleneck.

### Bag-of-Instances Representation
Let a long, untrimmed surveillance video $V$ be partitioned into $m$ non-overlapping temporal segments (instances):
$$V = \{v_1, v_2, \dots, v_m\}$$
Where each instance $v_i$ represents a 16-frame spatiotemporal clip encoded into a feature vector $\mathbf{x}_i \in \mathbb{R}^{4096}$ by the C3D convolutional backbone.

Under the MIL paradigm:
- **Positive Bag ($B_a$):** An untrimmed video known to contain an anomaly at some unknown temporal index.
  $$B_a = \{\mathbf{x}_1^a, \mathbf{x}_2^a, \dots, \mathbf{x}_m^a\}, \quad \exists \, k \in \{1, \dots, m\} \text{ s.t. } y_k = 1$$
- **Negative Bag ($B_n$):** A normal surveillance video containing zero anomalous events across all segments.
  $$B_n = \{\mathbf{x}_1^n, \mathbf{x}_2^n, \dots, \mathbf{x}_m^n\}, \quad \forall \, j \in \{1, \dots, m\}, \, y_j = 0$$

### The Core Ranking Hypothesis
The fundamental premise of the Deep MIL Ranking Engine is that the most anomalous instance in an anomalous video must have a significantly higher predicted anomaly score than the most anomalous instance in a normal video:

$$\max_{i \in B_a} f(\mathbf{x}_i^a) > \max_{j \in B_n} f(\mathbf{x}_j^n)$$

Where $f(\mathbf{x}) \in [0, 1]$ represents the scalar anomaly score produced by the neural network.

---

## 2. Deep Ranking Loss Formulation

To train the ranking model end-to-end, we employ a composite loss function comprising the ranking margin hinge loss and two essential physical regularization constraints:

$$\mathcal{L}(B_a, B_n) = \mathcal{L}_{\text{hinge}}(B_a, B_n) + \lambda_1 \mathcal{L}_{\text{smooth}}(B_a) + \lambda_2 \mathcal{L}_{\text{sparse}}(B_a)$$

### 2.1 Hinge Ranking Loss
The hinge ranking loss enforces a minimum separation margin $m = 1.0$ between the maximum scored instance of the positive bag and the maximum scored instance of the negative bag:

$$\mathcal{L}_{\text{hinge}}(B_a, B_n) = \max\left(0, 1 - \max_{i \in B_a} f(\mathbf{x}_i^a) + \max_{j \in B_n} f(\mathbf{x}_j^n)\right)$$

- If $\max_{i \in B_a} f(\mathbf{x}_i^a) \ge \max_{j \in B_n} f(\mathbf{x}_j^n) + 1$, the margin is satisfied and $\mathcal{L}_{\text{hinge}} = 0$.
- Otherwise, gradients are backpropagated solely through the two maximal instances: $\arg\max_{i \in B_a} f(\mathbf{x}_i^a)$ and $\arg\max_{j \in B_n} f(\mathbf{x}_j^n)$.

---

## 3. Algorithmic Constraints: Physics of the Anomaly

Unconstrained Multiple Instance Learning models tend to produce erratic, noisy scores across adjacent clips or classify entire videos as uniformly anomalous. SentinelAI X introduces two physical priors:

```
[PANEL 1: TEMPORAL SPARSITY]                [PANEL 2: CONTINUOUS FLOW]
   [LAW 1: ANOMALIES ARE BRIEF]                 [LAW 2: TIME IS CONTINUOUS]

Score ▲                                      Variation ▲
 1.0  │        ┌─┐  <-- Anomaly Spike                   │   Smooth Signal
      │        │ │                                      │   ╭──────╮
 0.5  │        │ │                                      │  ╭╯      ╰╮
 0.0  └────────┴─┴────────► Time                        │──┴────────┴──► Time
      Nominal Baseline                                  Erratic Jumps Penalized
      λ2 = 8 × 10⁻⁵                                    λ1 = 8 × 10⁻⁵
```

### 3.1 Law 1: Anomalies Are Brief (Temporal Sparsity Constraint)
Real-world security incidents (e.g. assaults, robberies, explosions) are temporally localized and constitute a fraction of an untrimmed video feed. The sparsity constraint penalizes the sum of predicted anomaly scores across the entire anomalous bag:

$$\mathcal{L}_{\text{sparse}}(B_a) = \sum_{i=1}^{m} f(\mathbf{x}_i^a)$$

With coefficient $\lambda_2 = 8 \times 10^{-5}$:
- Prevents the network from trivially predicting $f(\mathbf{x}) \approx 1.0$ across all segments in an anomalous video.
- Forces the model to isolate only the exact temporal window containing the true incident spike.

### 3.2 Law 2: Time Is Continuous (Temporal Smoothness Constraint)
Surveillance video frames are temporally contiguous. A physical incident cannot jump from $0.05$ to $0.95$ and back to $0.05$ within consecutive milliseconds without severe environmental flicker. The temporal smoothness constraint penalizes squared differences between adjacent segments:

$$\mathcal{L}_{\text{smooth}}(B_a) = \sum_{i=1}^{m-1} \left(f(\mathbf{x}_i^a) - f(\mathbf{x}_{i+1}^a)\right)^2$$

With coefficient $\lambda_1 = 8 \times 10^{-5}$:
- Penalizes high-frequency noise and sudden single-frame spikes.
- Enforces smooth, continuous score trajectories that mirror physical human movement dynamics.

---

## 4. Optimization Dynamics: Adagrad Optimizer

The model parameters $\Theta = \{W_1, b_1, W_2, b_2, W_3, b_3\}$ are optimized using the **Adagrad** optimizer with an initial learning rate $\eta = 0.001$:

$$G_{t, \Theta} = G_{t-1, \Theta} + \left(\nabla_{\Theta} \mathcal{L}_t\right)^2$$

$$\Theta_{t+1} = \Theta_t - \frac{\eta}{\sqrt{G_{t, \Theta} + \epsilon}} \nabla_{\Theta} \mathcal{L}_t$$

Where $G_{t, \Theta}$ is the running diagonal matrix of squared historical gradients and $\epsilon = 10^{-8}$ prevents division by zero. Adagrad adaptively decreases the learning rate for frequently activated weights, dampening oscillations and ensuring stable convergence on sparse anomaly signals.
