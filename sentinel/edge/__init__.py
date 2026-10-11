"""
SentinelAI X Edge Operations & Perception Package
- CameraStreamer: 16-frame chunker & RTSP camera feed ingestion
- ObjectTracker: Zone 2 YOLOv8 / ByteTrack object perception stub
- EdgeNode: Lightweight edge streamer client for Hub-and-Spoke topology
"""

from sentinel.edge.camera_streamer import CameraStreamer
from sentinel.edge.object_tracker import ObjectPerceptionTracker
from sentinel.edge.edge_node import EdgeNodeClient

__all__ = [
    "CameraStreamer",
    "ObjectPerceptionTracker",
    "EdgeNodeClient",
]
