"""
Unit tests for Spatiotemporal Scene Interaction Graph Engine.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.core.interaction_graph import SceneInteractionGraph


class TestSceneInteractionGraph(unittest.TestCase):
    def setUp(self):
        self.graph_engine = SceneInteractionGraph(
            proximity_threshold_px=120.0,
            collision_threshold_px=45.0,
            high_velocity_threshold=80.0
        )

    def test_nominal_distant_actors(self):
        actors = [
            {"track_id": 1, "class_name": "person", "bbox": [10, 10, 40, 60], "vx": 5.0, "vy": 2.0},
            {"track_id": 2, "class_name": "person", "bbox": [500, 500, 530, 560], "vx": 4.0, "vy": 1.0}
        ]
        nodes, edges = self.graph_engine.build_graph(actors)
        self.assertEqual(len(nodes), 2)
        # They are > 600px apart, so no interaction edge should form
        self.assertEqual(len(edges), 0)

        risk = self.graph_engine.score_interaction_risk(nodes, edges)
        self.assertLess(risk["interaction_anomaly_score"], 0.10)
        self.assertEqual(risk["dominant_relation"], "NOMINAL_SPATIAL_SEPARATION")

    def test_violent_collision_detection(self):
        # Two actors within 30px with rapid closing velocity (>100px/s)
        actors = [
            {"track_id": 10, "class_name": "person", "bbox": [100, 100, 130, 160], "vx": 90.0, "vy": 0.0},
            {"track_id": 11, "class_name": "person", "bbox": [120, 105, 150, 165], "vx": -85.0, "vy": 0.0}
        ]
        nodes, edges = self.graph_engine.build_graph(actors)
        self.assertEqual(len(nodes), 2)
        self.assertEqual(len(edges), 1)

        edge = edges[0]
        self.assertEqual(edge.relation, "COLLIDING")
        self.assertGreaterEqual(edge.risk_weight, 0.90)

        risk = self.graph_engine.score_interaction_risk(nodes, edges)
        self.assertGreater(risk["interaction_anomaly_score"], 0.85)
        self.assertEqual(risk["dominant_relation"], "COLLIDING")

    def test_mermaid_diagram_export(self):
        actors = [
            {"track_id": 1, "class_name": "person", "bbox": [100, 100, 130, 160], "vx": 10.0, "vy": 0.0},
            {"track_id": 2, "class_name": "vehicle", "bbox": [160, 110, 220, 180], "vx": 12.0, "vy": 0.0}
        ]
        nodes, edges = self.graph_engine.build_graph(actors)
        mermaid = self.graph_engine.generate_mermaid_diagram(nodes, edges)

        self.assertTrue(mermaid.startswith("graph LR"))
        self.assertIn('ACTOR_1["PERSON #1"]', mermaid)
        self.assertIn('ACTOR_2["VEHICLE #2"]', mermaid)


if __name__ == "__main__":
    unittest.main()
