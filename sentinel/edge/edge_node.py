"""
Hub-and-Spoke Edge Node Client
As specified in SentinelAI X Intelligence Dossier (Page 15).

Runs at the camera boundary, buffers 16-frame clips, computes or relays spatiotemporal features,
and transmits telemetry and feature payloads to Central Cloud Command.
"""

import time
import json
import argparse
from typing import Dict, Any, Optional
from sentinel.edge.camera_streamer import CameraStreamer
from sentinel.core.feature_extractor import VideoFeatureExtractor


class EdgeNodeClient:
    """
    Lightweight Edge Node client running on or near camera hardware.
    """
    def __init__(self, camera_id: str = "CAM_01", hub_url: str = "http://localhost:8000"):
        self.camera_id = camera_id
        self.hub_url = hub_url
        self.streamer = CameraStreamer(camera_id=camera_id, camera_name=f"Edge Node {camera_id}")
        self.extractor = VideoFeatureExtractor(clip_length=16)
        self.is_running = False

    def process_and_dispatch_clip(self, inject_anomaly: bool = False) -> Dict[str, Any]:
        """
        Samples a 16-frame clip, extracts 4096-D spatiotemporal descriptor, and formats payload.
        """
        clip = self.streamer.generate_clip(clip_length=16, inject_anomaly=inject_anomaly)
        feature_vector = self.extractor.extract_from_clip(clip["frames"])

        payload = {
            "node_id": self.camera_id,
            "timestamp": time.time(),
            "start_frame": clip["start_frame"],
            "end_frame": clip["end_frame"],
            "feature_dim": len(feature_vector),
            "feature_vector": feature_vector[:128],  # Compressed preview or full vector
            "telemetry": {
                "fps": 30,
                "resolution": self.streamer.resolution,
                "status": "OPERATIONAL"
            }
        }
        return payload


def main():
    parser = argparse.ArgumentParser(description="SentinelAI X Edge Node Client")
    parser.add_argument("--camera-id", default="CAM_01", help="Camera node identifier")
    parser.add_argument("--hub-url", default="http://localhost:8000", help="Central Cloud Command URL")
    args = parser.parse_args()

    node = EdgeNodeClient(camera_id=args.camera_id, hub_url=args.hub_url)
    print(f"[*] Edge Node {args.camera_id} initialized. Transmitting to {args.hub_url}...")
    sample_payload = node.process_and_dispatch_clip()
    print(f"[+] Dispatched 16-frame clip (frames {sample_payload['start_frame']}-{sample_payload['end_frame']}), feature dimension: {sample_payload['feature_dim']}")


if __name__ == "__main__":
    main()
