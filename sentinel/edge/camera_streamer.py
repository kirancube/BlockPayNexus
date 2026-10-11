"""
Camera Streamer & Ingestion Simulator
Handles real-time ingestion from CCTV RTSP feeds or synthetic video streams.
Batches incoming video frames into contiguous 16-frame clips for C3D spatiotemporal encoding.
"""

import time
import math
from typing import Generator, List, Dict, Any, Optional


class CameraStreamer:
    """
    Ingests video streams from a configured camera node (e.g., CAM_01, CAM_02, CAM_03, CAM_04).
    Produces continuous 16-frame temporal clips.
    """
    def __init__(self, camera_id: str, camera_name: str, fps: int = 30, resolution: str = "1080p"):
        self.camera_id = camera_id
        self.camera_name = camera_name
        self.fps = fps
        self.resolution = resolution
        self.current_frame = 0
        self.is_active = True

    def generate_clip(self, clip_length: int = 16, inject_anomaly: bool = False) -> Dict[str, Any]:
        """
        Generates or extracts a 16-frame spatiotemporal clip with metadata.
        """
        start_frame = self.current_frame
        self.current_frame += clip_length
        end_frame = self.current_frame

        # Synthetic spatiotemporal frame generation
        frames_meta = []
        for f in range(start_frame, end_frame):
            frames_meta.append({
                "frame_id": f,
                "timestamp": time.time() + (f / self.fps),
                "has_anomaly_signal": inject_anomaly
            })

        return {
            "camera_id": self.camera_id,
            "camera_name": self.camera_name,
            "start_frame": start_frame,
            "end_frame": end_frame,
            "clip_length": clip_length,
            "frames": frames_meta,
            "is_anomaly_injected": inject_anomaly
        }

    def stream_clips(self, total_clips: int = 100, anomaly_window: Optional[tuple] = None) -> Generator[Dict[str, Any], None, None]:
        """
        Continuous clip stream generator.
        """
        for i in range(total_clips):
            if not self.is_active:
                break
            inject = False
            if anomaly_window and (anomaly_window[0] <= i <= anomaly_window[1]):
                inject = True
            yield self.generate_clip(inject_anomaly=inject)
