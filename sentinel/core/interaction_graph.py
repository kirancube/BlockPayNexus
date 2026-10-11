"""
SentinelAI X Dynamic Spatiotemporal Scene Interaction Graph Engine
Converts multi-object bounding boxes and tracking trajectories into a relational graph.
Identifies suspicious behavioral interactions (chasing, convergence, collisions, crowding).
"""

import math
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field


@dataclass
class ActorNode:
    """Represents an active entity in the surveillance scene."""
    node_id: str
    track_id: int
    class_name: str  # 'person', 'vehicle', 'bicycle', 'bag'
    bbox: List[float]  # [x1, y1, x2, y2]
    center: Tuple[float, float]
    velocity: Tuple[float, float]  # (vx, vy) in px/sec
    speed: float  # magnitude of velocity
    trajectory: List[Tuple[float, float]] = field(default_factory=list)


@dataclass
class InteractionEdge:
    """Represents a dynamic spatial/behavioral relationship between two actors."""
    source_id: str
    target_id: str
    relation: str  # 'NEAR', 'APPROACHING', 'CONVERGING', 'FOLLOWING', 'INTERACTING', 'COLLIDING'
    distance_px: float
    relative_speed: float
    risk_weight: float
    description: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source": self.source_id,
            "target": self.target_id,
            "relation": self.relation,
            "distance_px": round(self.distance_px, 1),
            "relative_speed": round(self.relative_speed, 1),
            "risk_weight": round(self.risk_weight, 3),
            "description": self.description
        }


class SceneInteractionGraph:
    """
    Constructs and analyzes dynamic relational graphs over tracked surveillance entities.
    """
    def __init__(
        self,
        proximity_threshold_px: float = 120.0,
        collision_threshold_px: float = 45.0,
        high_velocity_threshold: float = 80.0
    ):
        self.proximity_threshold = proximity_threshold_px
        self.collision_threshold = collision_threshold_px
        self.high_velocity_threshold = high_velocity_threshold

    def build_graph(
        self,
        tracked_objects: List[Dict[str, Any]],
        frame_idx: int = 0
    ) -> Tuple[List[ActorNode], List[InteractionEdge]]:
        """
        Parses detected/tracked objects into nodes and calculates pairwise relational edges.
        """
        nodes: List[ActorNode] = []
        for obj in tracked_objects:
            t_id = obj.get("track_id", 0)
            c_name = obj.get("class_name", "person")
            bbox = obj.get("bbox", [0, 0, 10, 10])
            cx = (bbox[0] + bbox[2]) / 2.0
            cy = (bbox[1] + bbox[3]) / 2.0
            vx = obj.get("vx", 0.0)
            vy = obj.get("vy", obj.get("velocity_px_sec", 0.0))
            spd = math.sqrt(vx * vx + vy * vy)
            hist = obj.get("trajectory", [(cx, cy)])

            nodes.append(ActorNode(
                node_id=f"ACTOR_{t_id}",
                track_id=t_id,
                class_name=c_name,
                bbox=bbox,
                center=(cx, cy),
                velocity=(vx, vy),
                speed=spd,
                trajectory=hist
            ))

        edges: List[InteractionEdge] = []
        num_nodes = len(nodes)

        for i in range(num_nodes):
            for j in range(i + 1, num_nodes):
                n_a = nodes[i]
                n_b = nodes[j]

                # Euclidean distance between centers
                dx = n_b.center[0] - n_a.center[0]
                dy = n_b.center[1] - n_a.center[1]
                dist = math.sqrt(dx * dx + dy * dy)

                if dist > self.proximity_threshold * 2.0:
                    continue  # Beyond interaction horizon

                # Relative velocity vector: V_b - V_a
                rel_vx = n_b.velocity[0] - n_a.velocity[0]
                rel_vy = n_b.velocity[1] - n_a.velocity[1]
                rel_speed = math.sqrt(rel_vx * rel_vx + rel_vy * rel_vy)

                # Relative convergence: dot product of (P_b - P_a) and (V_a - V_b)
                # If positive, entities are closing distance (converging)
                conv_rate = (dx * (n_a.velocity[0] - n_b.velocity[0]) + dy * (n_a.velocity[1] - n_b.velocity[1])) / (dist + 1e-6)

                # Classify relationship
                if dist <= self.collision_threshold and rel_speed >= self.high_velocity_threshold:
                    relation = "COLLIDING"
                    weight = 0.95
                    desc = f"Kinetic collision between {n_a.class_name} #{n_a.track_id} and {n_b.class_name} #{n_b.track_id}"
                elif dist <= self.collision_threshold:
                    relation = "INTERACTING"
                    weight = 0.75
                    desc = f"Close physical contact ({dist:.1f}px)"
                elif conv_rate > 35.0:
                    relation = "CONVERGING"
                    weight = 0.80
                    desc = f"Rapid trajectory convergence at {conv_rate:.1f} px/sec"
                elif rel_speed > self.high_velocity_threshold and (n_a.speed > 50.0 and n_b.speed > 50.0):
                    relation = "FOLLOWING"
                    weight = 0.65
                    desc = f"Coordinated high-speed chase vector"
                elif dist <= self.proximity_threshold:
                    relation = "NEAR"
                    weight = 0.20
                    desc = f"Spatial proximity ({dist:.1f}px)"
                else:
                    relation = "APPROACHING"
                    weight = 0.35
                    desc = f"Approaching trajectory"

                edges.append(InteractionEdge(
                    source_id=n_a.node_id,
                    target_id=n_b.node_id,
                    relation=relation,
                    distance_px=dist,
                    relative_speed=rel_speed,
                    risk_weight=weight,
                    description=desc
                ))

        return nodes, edges

    def score_interaction_risk(
        self,
        nodes: List[ActorNode],
        edges: List[InteractionEdge]
    ) -> Dict[str, Any]:
        """
        Aggregates relational edge dynamics into a unified interaction risk score.
        """
        if not edges:
            return {
                "interaction_anomaly_score": 0.04,
                "dominant_relation": "NOMINAL_SPATIAL_SEPARATION",
                "high_risk_edges_count": 0,
                "summary": "Normal entity distribution with nominal spacing."
            }

        # Weighted risk aggregation
        weights = [e.risk_weight for e in edges]
        max_risk = max(weights)
        mean_risk = sum(weights) / len(weights)
        fused_score = min(1.0, 0.7 * max_risk + 0.3 * mean_risk)

        # Dominant relation
        critical_edges = [e for e in edges if e.risk_weight >= 0.70]
        if critical_edges:
            dominant = max(critical_edges, key=lambda e: e.risk_weight).relation
            summary = f"Alert: {len(critical_edges)} high-risk interaction(s) detected: {critical_edges[0].description}"
        else:
            dominant = max(edges, key=lambda e: e.risk_weight).relation
            summary = f"Scene nominal: {len(nodes)} actors in standard transit."

        return {
            "interaction_anomaly_score": round(fused_score, 4),
            "dominant_relation": dominant,
            "high_risk_edges_count": len(critical_edges),
            "summary": summary
        }

    def generate_mermaid_diagram(
        self,
        nodes: List[ActorNode],
        edges: List[InteractionEdge]
    ) -> str:
        """
        Exports scene graph topology to Mermaid syntax for rendering in GitHub / UI.
        """
        lines = ["graph LR"]
        for n in nodes:
            lines.append(f'    {n.node_id}["{n.class_name.upper()} #{n.track_id}"]')
        for e in edges:
            lines.append(f'    {e.source_id} -- "{e.relation}" --> {e.target_id}')
        return "\n".join(lines)
