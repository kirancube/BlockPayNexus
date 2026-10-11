"""
Unit tests for Configurable Temporal Architectures (C3D, TCN, BiLSTM, Transformer).
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.temporal_models import (
    create_temporal_model,
    TemporalCNNStandalone,
    BiLSTMStandalone,
    TemporalTransformerStandalone
)


class TestTemporalModels(unittest.TestCase):
    def setUp(self):
        # 32 instances of 64-D vectors
        self.normal_seq = [[0.05 * (i % 3) for _ in range(64)] for i in range(32)]
        # Injected anomaly at instances 14..18
        self.anomaly_seq = []
        for i in range(32):
            if 14 <= i <= 18:
                self.anomaly_seq.append([1.8 for _ in range(64)])
            else:
                self.anomaly_seq.append([0.05 * (i % 3) for _ in range(64)])

    def test_factory_creation_and_inference(self):
        architectures = ["c3d_mil", "tcn", "bilstm", "transformer"]
        for arch in architectures:
            model = create_temporal_model(model_type=arch, input_dim=64, use_torch=False)
            self.assertIsNotNone(model, f"Failed to instantiate {arch}")

            scores = model.forward(self.normal_seq)
            self.assertEqual(len(scores), 32, f"Incorrect output length for {arch}")

            # Verify scores are bounded probabilities in [0.0, 1.0]
            for s in scores:
                self.assertGreaterEqual(s, 0.0)
                self.assertLessEqual(s, 1.0)

    def test_transformer_anomaly_sensitivity(self):
        transformer = TemporalTransformerStandalone(input_dim=64, d_model=32)
        norm_scores = transformer.forward(self.normal_seq)
        ano_scores = transformer.forward(self.anomaly_seq)

        # Peak anomaly score should exceed nominal baseline
        self.assertGreater(max(ano_scores), max(norm_scores))

    def test_tcn_and_bilstm_temporal_flow(self):
        tcn = TemporalCNNStandalone(input_dim=64, kernel_size=3)
        bilstm = BiLSTMStandalone(input_dim=64)

        tcn_scores = tcn.forward(self.normal_seq)
        lstm_scores = bilstm.forward(self.normal_seq)

        self.assertEqual(len(tcn_scores), 32)
        self.assertEqual(len(lstm_scores), 32)


if __name__ == "__main__":
    unittest.main()
