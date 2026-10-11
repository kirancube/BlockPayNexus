"""
Unit tests for SentinelAI X Advanced Research-Grade Modules:
1. Evidential Uncertainty & Conformal Prediction
2. Cross-Camera Topological Graph Mesh (Mesh-VAD)
3. Multi-Modal Acoustic-Visual Fusion (ASTD)
4. Autonomous SALUTE Tactical SITREP Generator
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.evidential_uncertainty import EvidentialUncertaintyEngine
from sentinel.core.graph_mesh import TopologicalGraphMesh
from sentinel.core.multimodal_audio import AcousticTransientDetector
from sentinel.core.sitrep_generator import TacticalSitrepGenerator


class TestAdvancedFeatures(unittest.TestCase):
    def setUp(self):
        self.evidential = EvidentialUncertaintyEngine(confidence_level=0.99)
        self.graph = TopologicalGraphMesh()
        self.audio = AcousticTransientDetector()
        self.sitrep = TacticalSitrepGenerator()

    # --- 1. Evidential Uncertainty & Conformal Prediction Tests ---
    def test_evidential_uncertainty_nominal_vs_ood(self):
        # Nominal case: High agreement between MIL and World Model, low noise
        nom = self.evidential.compute_evidential_distribution(
            raw_anomaly_score=0.03,
            world_surprise=0.02,
            sensor_noise_factor=0.02
        )
        self.assertLess(nom["expected_score"], 0.10)
        self.assertLess(nom["epistemic_uncertainty"], 0.30)
        self.assertEqual(nom["decision_safety"], "CERTIFIED_HIGH_CONFIDENCE")
        self.assertTrue(nom["conformal_interval"][0] <= nom["expected_score"] <= nom["conformal_interval"][1])

        # Out-of-Distribution (OOD) case: Extreme disagreement between models (MIL low, World Model shock)
        ood = self.evidential.compute_evidential_distribution(
            raw_anomaly_score=0.20,
            world_surprise=0.95,
            sensor_noise_factor=0.04
        )
        self.assertGreater(ood["epistemic_uncertainty"], 0.35)

    # --- 2. Topological Graph Mesh Tests ---
    def test_graph_mesh_threat_diffusion(self):
        # Initial priors should be uniform baseline
        initial_state = self.graph.get_mesh_state()
        self.assertEqual(len(initial_state["nodes"]), 4)

        # Inject high anomaly at CAM_01 (North Gate)
        res = self.graph.update_node_observation(camera_id="CAM_01", observed_score=0.96)
        
        # Adjacent node CAM_02 (Sector West) should receive the highest diffused prior
        updated_priors = res["updated_priors"]
        self.assertGreater(updated_priors["CAM_02"], initial_state["prearmed_priors"]["CAM_02"])
        self.assertEqual(res["highest_risk_adjacent_node"], "CAM_02")

    # --- 3. Multi-Modal Audio-Visual Fusion Tests ---
    def test_acoustic_detection_and_multimodal_fusion(self):
        # High-frequency transient energy (Gunshot/Shatter)
        high_freq_mel = [0.05] * 64 + [0.85] * 64
        audio_res = self.audio.compute_acoustic_score(high_freq_mel)
        self.assertIn(audio_res["acoustic_signature"], ["GUNSHOT_OR_SHATTER", "HUMAN_SCREAM_OR_PANIC"])
        self.assertGreater(audio_res["acoustic_score"], 0.70)

        # Multi-modal fusion: Video 0.90 + Audio 0.95 + World 0.85
        fused = self.audio.fuse_multimodal(video_score=0.90, acoustic_score=0.95, world_surprise=0.85)
        self.assertEqual(fused["threat_level"], "CRITICAL")
        self.assertGreater(fused["unified_multimodal_score"], 0.90)

    # --- 4. Tactical SITREP SALUTE Generator Tests ---
    def test_salute_sitrep_generation(self):
        report = self.sitrep.generate_salute_report(
            camera_id="CAM_01",
            camera_name="North Gate Entry",
            anomaly_score=0.9824,
            crime_class="Assault",
            frame_index=8750,
            epistemic_uncertainty=0.042,
            conformal_interval=(0.94, 0.99),
            acoustic_signature="HUMAN_SCREAM_OR_PANIC"
        )
        salute = report["salute"]
        self.assertIn("size", salute)
        self.assertIn("activity", salute)
        self.assertIn("location", salute)
        self.assertIn("uniform", salute)
        self.assertIn("time", salute)
        self.assertIn("equipment", salute)
        self.assertIn("=== TACTICAL SITUATION REPORT", report["plaintext_briefing"])
        self.assertEqual(report["metrics"]["threat_priority"], "PRIORITY_ONE_CRITICAL")


if __name__ == "__main__":
    unittest.main()
