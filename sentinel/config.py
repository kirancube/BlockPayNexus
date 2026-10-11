"""
Configuration Manager for SentinelAI X
Loads YAML/JSON configurations with validation and default fallback parameters.
"""

import os
import json
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


@dataclass
class C3DConfig:
    input_channels: int = 3
    clip_length: int = 16
    spatial_size: List[int] = field(default_factory=lambda: [112, 112])
    feature_dimension: int = 4096
    temporal_kernel_size: int = 3
    pretrained_weights: str = "c3d_ucf101_sports1m.pth"


@dataclass
class MILModelConfig:
    input_dim: int = 4096
    hidden_dim_1: int = 512
    dropout_rate: float = 0.60
    hidden_dim_2: int = 32
    output_dim: int = 1
    activation: str = "sigmoid"


@dataclass
class OptimizationConfig:
    optimizer: str = "adagrad"
    learning_rate: float = 0.001
    weight_decay: float = 0.00005
    batch_size: int = 30
    epochs: int = 50
    lambda_1_smoothness: float = 0.00008  # 8 x 10^-5: Temporal continuity constraint
    lambda_2_sparsity: float = 0.00008    # 8 x 10^-5: Temporal sparsity constraint


@dataclass
class InferenceConfig:
    latency_budget_ms: float = 5.0
    anomaly_threshold: float = 0.50
    critical_threshold: float = 0.85
    temporal_smoothing_window: int = 5
    suppression_window_frames: int = 32
    target_auc: float = 0.7541
    target_far: float = 0.019  # 1.9% False Alarm Rate


@dataclass
class DatasetConfig:
    name: str = "UCF-Crime"
    total_videos: int = 1900
    total_duration_hours: int = 128
    num_instances_per_bag: int = 32


@dataclass
class SystemConfig:
    name: str = "SentinelAI X"
    dossier_id: str = "2024-SAX-003C"
    version: str = "1.2.0"
    classification: str = "UNCLASSIFIED//INTEL"
    device_mode: str = "hybrid"
    c3d: C3DConfig = field(default_factory=C3DConfig)
    mil: MILModelConfig = field(default_factory=MILModelConfig)
    optimization: OptimizationConfig = field(default_factory=OptimizationConfig)
    inference: InferenceConfig = field(default_factory=InferenceConfig)
    dataset: DatasetConfig = field(default_factory=DatasetConfig)
    categories: List[str] = field(default_factory=lambda: [
        "Abuse", "Arrest", "Arson", "Assault", "Burglary",
        "Explosion", "Fighting", "Road Accidents", "Robbery",
        "Shooting", "Shoplifting", "Stealing", "Vandalism", "Normal"
    ])


def load_config(config_path: Optional[str] = None) -> SystemConfig:
    """Load configuration from YAML file or return robust default config."""
    if config_path is None:
        default_paths = [
            os.path.join(os.path.dirname(__file__), "..", "config", "config.yaml"),
            "config/config.yaml",
            os.path.join(os.getcwd(), "config", "config.yaml")
        ]
        for p in default_paths:
            if os.path.exists(p):
                config_path = p
                break

    cfg = SystemConfig()
    if config_path and os.path.exists(config_path) and HAS_YAML:
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                raw = yaml.safe_load(f)
                if raw:
                    if "system" in raw:
                        cfg.name = raw["system"].get("name", cfg.name)
                        cfg.dossier_id = raw["system"].get("dossier_id", cfg.dossier_id)
                        cfg.version = raw["system"].get("version", cfg.version)
                    if "model" in raw:
                        m = raw["model"]
                        if "feature_extractor" in m:
                            fe = m["feature_extractor"]
                            cfg.c3d.input_channels = fe.get("input_channels", cfg.c3d.input_channels)
                            cfg.c3d.clip_length = fe.get("clip_length", cfg.c3d.clip_length)
                            cfg.c3d.feature_dimension = fe.get("feature_dimension", cfg.c3d.feature_dimension)
                        if "ranking_engine" in m:
                            re = m["ranking_engine"]
                            cfg.mil.input_dim = re.get("input_dim", cfg.mil.input_dim)
                            cfg.mil.hidden_dim_1 = re.get("hidden_dim_1", cfg.mil.hidden_dim_1)
                            cfg.mil.dropout_rate = re.get("dropout_rate", cfg.mil.dropout_rate)
                            cfg.mil.hidden_dim_2 = re.get("hidden_dim_2", cfg.mil.hidden_dim_2)
                    if "optimization" in raw:
                        opt = raw["optimization"]
                        cfg.optimization.optimizer = opt.get("optimizer", cfg.optimization.optimizer)
                        cfg.optimization.learning_rate = opt.get("learning_rate", cfg.optimization.learning_rate)
                        constraints = opt.get("constraints", {})
                        cfg.optimization.lambda_1_smoothness = constraints.get("lambda_1_smoothness", cfg.optimization.lambda_1_smoothness)
                        cfg.optimization.lambda_2_sparsity = constraints.get("lambda_2_sparsity", cfg.optimization.lambda_2_sparsity)
                    if "inference" in raw:
                        inf = raw["inference"]
                        cfg.inference.latency_budget_ms = inf.get("latency_budget_ms", cfg.inference.latency_budget_ms)
                        cfg.inference.anomaly_threshold = inf.get("anomaly_threshold", cfg.inference.anomaly_threshold)
                        cfg.inference.critical_threshold = inf.get("critical_threshold", cfg.inference.critical_threshold)
                        cfg.inference.target_auc = inf.get("target_auc", cfg.inference.target_auc)
                        cfg.inference.target_far = inf.get("target_far", cfg.inference.target_far)
                    if "dataset" in raw and "categories" in raw["dataset"]:
                        cfg.categories = raw["dataset"]["categories"]
        except Exception:
            pass  # Fallback to default dataclass config
    return cfg


def load_camera_grid(camera_config_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Load camera grid node details."""
    if camera_config_path is None:
        default_paths = [
            os.path.join(os.path.dirname(__file__), "..", "config", "camera_config.json"),
            "config/camera_config.json",
        ]
        for p in default_paths:
            if os.path.exists(p):
                camera_config_path = p
                break

    if camera_config_path and os.path.exists(camera_config_path):
        try:
            with open(camera_config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("cameras", [])
        except Exception:
            pass

    return [
        {"camera_id": "CAM_01", "name": "North Gate Terminal", "resolution": "4K", "capabilities": ["Ultra-HD Perception"]},
        {"camera_id": "CAM_02", "name": "Sector Perimeter West", "resolution": "1080p", "capabilities": ["PTZ_ACTIVE"]},
        {"camera_id": "CAM_03", "name": "Transit Checkpoint South", "resolution": "1440p", "capabilities": ["ANPR_READY"]},
        {"camera_id": "CAM_04", "name": "Central Concourse East", "resolution": "1080p", "capabilities": ["FOV_120_WIDE"]},
    ]
