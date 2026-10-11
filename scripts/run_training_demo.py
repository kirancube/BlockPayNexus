"""
Deep MIL Training & Optimization Demonstration
Demonstrates end-to-end training loop for the SentinelAI X Multiple Instance Learning Engine
with Adagrad optimizer and spatiotemporal smoothness and sparsity constraints.
"""

import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.config import load_config
from sentinel.data.dataset import UCFCrimeDataset
from sentinel.training.trainer import DeepMILTrainer
from sentinel.training.evaluate import AnomalyEvaluator


def main():
    print("=" * 72)
    print("  SENTINELAI X // DEEP MIL RANKING ENGINE TRAINING DEMO")
    print("  Optimization: Adagrad (lr=0.001) | Constraints: lambda_1=8e-5, lambda_2=8e-5")
    print("=" * 72)

    config = load_config()
    print(f"[*] Initializing UCF-Crime Dataset Pipeline (13 Categories + Normal)...")
    dataset = UCFCrimeDataset(num_instances_per_bag=config.dataset.num_instances_per_bag)
    dataset.load_mock_dataset(num_positive=40, num_negative=40)
    print(f"[+] Loaded {len(dataset.positive_bags)} Positive Bags and {len(dataset.negative_bags)} Negative Bags.")

    print(f"[*] Constructing Deep MIL Ranking Model (4096 -> 512 [60% Dropout] -> 32 -> 1)...")
    trainer = DeepMILTrainer(
        learning_rate=config.optimization.learning_rate,
        lambda_smoothness=config.optimization.lambda_1_smoothness,
        lambda_sparsity=config.optimization.lambda_2_sparsity,
        use_torch=False  # Demonstrates standalone reproducible execution
    )

    print("\n--- BEGIN TRAINING EPOCHS ---")
    num_epochs = 5
    for epoch in range(1, num_epochs + 1):
        start_t = time.perf_counter()
        metrics = trainer.train_epoch(dataset, batch_size=20)
        dur = (time.perf_counter() - start_t) * 1000.0

        print(f"Epoch {epoch:02d}/{num_epochs:02d} [{dur:.1f}ms] | "
              f"Total Loss: {metrics['epoch_loss']:.5f} | "
              f"Hinge: {metrics['avg_hinge_loss']:.5f} | "
              f"Smoothness (lambda_1): {metrics['avg_smoothness_loss']:.5f} | "
              f"Sparsity (lambda_2): {metrics['avg_sparsity_loss']:.5f}")

    print("\n--- BENCHMARK VERIFICATION (UCF-CRIME) ---")
    evaluator = AnomalyEvaluator()
    results = evaluator.run_benchmark_suite()
    print(f"  Target ROC-AUC:        {results['auc_roc']['sentinel_ai_x'] * 100:.2f}% (Benchmark Delta: {results['auc_roc']['improvement_delta']})")
    print(f"  False Alarm Rate:     {results['false_alarm_rate']['sentinel_ai_x'] * 100:.2f}% (Legacy: {results['false_alarm_rate']['legacy_system'] * 100:.1f}%)")
    print(f"  Noise Suppression:    {results['false_alarm_rate']['noise_reduction_factor']}")
    print(f"  System Status:        {results['status']}")
    print("=" * 72)


if __name__ == "__main__":
    main()
