"""
Spatiotemporal Video Feature Extraction Pipeline
Chunking untrimmed video feeds into 16-frame clips and computing 4096-D C3D descriptors.
"""

import math
from typing import List, Dict, Any, Generator, Optional
from sentinel.core.c3d import C3D

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


class VideoFeatureExtractor:
    """
    Extracts 4096-dimensional spatiotemporal descriptors from raw video streams
    or frame sequences in 16-frame temporal windows.
    """
    def __init__(self, clip_length: int = 16, feature_dim: int = 4096, use_torch: bool = True):
        self.clip_length = clip_length
        self.feature_dim = feature_dim
        self.use_torch = use_torch and HAS_TORCH
        self.model = C3D(feature_dim=feature_dim, use_torch=self.use_torch)

    def extract_from_clip(self, clip_frames: List[Any]) -> List[float]:
        """
        Extract a 4096-D feature vector from a contiguous 16-frame clip.
        """
        if len(clip_frames) < self.clip_length:
            # Pad with last frame if needed
            last_frame = clip_frames[-1] if clip_frames else [[0.0] * 112 for _ in range(112)]
            clip_frames = clip_frames + [last_frame] * (self.clip_length - len(clip_frames))
        elif len(clip_frames) > self.clip_length:
            clip_frames = clip_frames[:self.clip_length]

        if self.use_torch and hasattr(self.model, "forward"):
            # Assume frames can be tensorized or use simulated model
            try:
                import torch
                # If clip_frames already a tensor: (1, 3, 16, 112, 112)
                if isinstance(clip_frames, torch.Tensor):
                    feat = self.model(clip_frames)
                    return feat.squeeze(0).tolist()
            except Exception:
                pass

        # Fallback to deterministic standalone spatiotemporal descriptor
        if hasattr(self.model, "forward"):
            return self.model.forward(clip_frames)
        return [0.0] * self.feature_dim

    def process_frame_stream(self, frame_generator: Generator[Any, None, None]) -> Generator[List[float], None, None]:
        """
        Sliding-window stream processor yielding 4096-D features as frames arrive.
        """
        buffer = []
        for frame in frame_generator:
            buffer.append(frame)
            if len(buffer) == self.clip_length:
                yield self.extract_from_clip(buffer)
                buffer = []  # Non-overlapping 16-frame chunks

    def process_bag(self, bag_frames: List[List[Any]]) -> List[List[float]]:
        """
        Process a list of 16-frame clips into a bag of 4096-D features.
        """
        features = []
        for clip in bag_frames:
            feat = self.extract_from_clip(clip)
            features.append(feat)
        return features
