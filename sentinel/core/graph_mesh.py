"""
SentinelAI X Cross-Camera Topological Graph Neural Network (Mesh-VAD)
Coordinates spatial-temporal graph diffusion across distributed surveillance camera nodes.
Implements inter-node anomaly prior propagation to track fleeing suspects across municipal blind spots.
"""

from typing import Dict, Any, List, Tuple
import math


class TopologicalGraphMesh:
    """
    Spatial Adjacency Graph and Anomaly Diffusion Engine for Distributed CCTV Meshes.
    """
    def __init__(self):
        # 4-Node Municipal CCTV Topology
        self.camera_nodes = ["CAM_01", "CAM_02", "CAM_03", "CAM_04"]
        
        # Spatial Physical Proximity & Transit Adjacency Matrix A
        # CAM_01 (North Gate) connects to CAM_02 (Sector West)
        # CAM_02 connects to CAM_01 and CAM_03 (Transit Checkpoint)
        # CAM_03 connects to CAM_02 and CAM_04 (Concourse East)
        # CAM_04 connects to CAM_03 and CAM_01 (Ring perimeter)
        self.adjacency: Dict[str, Dict[str, float]] = {
            "CAM_01": {"CAM_01": 1.0, "CAM_02": 0.85, "CAM_03": 0.20, "CAM_04": 0.65},
            "CAM_02": {"CAM_01": 0.85, "CAM_02": 1.0, "CAM_03": 0.90, "CAM_04": 0.15},
            "CAM_03": {"CAM_01": 0.20, "CAM_02": 0.90, "CAM_03": 1.0, "CAM_04": 0.80},
            "CAM_04": {"CAM_01": 0.65, "CAM_02": 0.15, "CAM_03": 0.80, "CAM_04": 1.0},
        }

        # Dynamic Prior States pi_prior per camera
        self.node_priors: Dict[str, float] = {cam: 0.05 for cam in self.camera_nodes}
        # Last observed anomaly states
        self.node_scores: Dict[str, float] = {cam: 0.02 for cam in self.camera_nodes}

    def update_node_observation(self, camera_id: str, observed_score: float) -> Dict[str, Any]:
        """
        Updates anomaly observation at a specific node and diffuses threat priors to adjacent nodes.
        
        Formula:
            pi_prior(j) = decay * pi_prior(j) + sum_i ( A_{ij} * max(0, score_i - threshold) * diffusion_rate )
        """
        if camera_id in self.node_scores:
            self.node_scores[camera_id] = observed_score

        diffusion_rate = 0.35
        decay = 0.88
        threshold = 0.50

        # Propagate threat diffusion across graph
        new_priors = {}
        for target_node in self.camera_nodes:
            # Baseline decay
            prior = self.node_priors[target_node] * decay
            
            # Inbound diffusion from all neighbors
            inbound_threat = 0.0
            for source_node in self.camera_nodes:
                if source_node != target_node:
                    src_score = self.node_scores[source_node]
                    if src_score > threshold:
                        edge_weight = self.adjacency[source_node][target_node]
                        inbound_threat += edge_weight * (src_score - threshold) * diffusion_rate
            
            prior = min(0.95, prior + inbound_threat)
            new_priors[target_node] = round(prior, 4)

        self.node_priors = new_priors

        # Calculate graph energy (Laplacian quadratic form)
        graph_energy = sum(
            self.adjacency[u][v] * ((self.node_scores[u] - self.node_scores[v]) ** 2)
            for u in self.camera_nodes
            for v in self.camera_nodes
        )

        return {
            "origin_node": camera_id,
            "origin_score": observed_score,
            "updated_priors": self.node_priors,
            "graph_spatial_energy": round(graph_energy, 4),
            "highest_risk_adjacent_node": max(
                (k for k in self.camera_nodes if k != camera_id),
                key=lambda k: self.node_priors[k]
            )
        }

    def get_mesh_state(self) -> Dict[str, Any]:
        """Returns the full active topology status."""
        return {
            "nodes": self.camera_nodes,
            "adjacency_matrix": self.adjacency,
            "current_scores": self.node_scores,
            "prearmed_priors": self.node_priors
        }
