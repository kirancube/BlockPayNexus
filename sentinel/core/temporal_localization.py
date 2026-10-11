"""
SentinelAI X Temporal Anomaly Localization & Event Segmentation Engine
Segments continuous frame-level / bag-level anomaly scores into discrete temporal intervals.
Evaluates Temporal Intersection over Union (tIoU), Temporal Average Precision (tAP),
Event Detection Rate, and Mean Localization Error.
"""

import math
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field


@dataclass
class TemporalEvent:
    """Represents a temporally localized anomaly interval in surveillance footage."""
    event_id: str
    start_frame: int
    end_frame: int
    start_time_sec: float
    end_time_sec: float
    duration_sec: float
    peak_frame: int
    peak_time_sec: float
    peak_score: float
    mean_score: float
    confidence: float
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "start_time_sec": round(self.start_time_sec, 2),
            "end_time_sec": round(self.end_time_sec, 2),
            "duration_sec": round(self.duration_sec, 2),
            "start_time_formatted": self.format_time(self.start_time_sec),
            "end_time_formatted": self.format_time(self.end_time_sec),
            "peak_time_formatted": self.format_time(self.peak_time_sec),
            "peak_score": round(self.peak_score, 4),
            "mean_score": round(self.mean_score, 4),
            "confidence": round(self.confidence, 4)
        }

    @staticmethod
    def format_time(seconds: float) -> str:
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins:02d}:{secs:02d}"


class TemporalLocalizationEngine:
    """
    Translates raw continuous anomaly score curves into structured, actionable event intervals.
    """
    def __init__(
        self,
        default_threshold: float = 0.50,
        min_duration_sec: float = 1.0,
        merge_gap_sec: float = 1.5,
        fps: float = 30.0
    ):
        self.default_threshold = default_threshold
        self.min_duration_sec = min_duration_sec
        self.merge_gap_sec = merge_gap_sec
        self.fps = fps

    def segment_events(
        self,
        scores: List[float],
        fps: Optional[float] = None,
        frames_per_instance: int = 16,
        threshold: Optional[float] = None
    ) -> List[TemporalEvent]:
        """
        Segments a temporal series of anomaly scores into discrete TemporalEvents.
        """
        active_fps = fps or self.fps
        active_thresh = threshold if threshold is not None else self.default_threshold
        time_step = frames_per_instance / active_fps

        raw_intervals: List[Tuple[int, int, List[float]]] = []
        in_event = False
        start_idx = 0
        current_scores: List[float] = []

        for idx, score in enumerate(scores):
            if score >= active_thresh:
                if not in_event:
                    in_event = True
                    start_idx = idx
                    current_scores = [score]
                else:
                    current_scores.append(score)
            else:
                if in_event:
                    in_event = False
                    raw_intervals.append((start_idx, idx - 1, current_scores))
                    current_scores = []

        if in_event:
            raw_intervals.append((start_idx, len(scores) - 1, current_scores))

        # Merge close intervals (gap < merge_gap_sec)
        merged_intervals: List[Tuple[int, int, List[float]]] = []
        for start_i, end_i, scs in raw_intervals:
            if not merged_intervals:
                merged_intervals.append((start_i, end_i, scs))
            else:
                prev_start, prev_end, prev_scs = merged_intervals[-1]
                gap_sec = (start_i - prev_end - 1) * time_step
                if gap_sec <= self.merge_gap_sec:
                    # Merge with previous
                    combined_scs = prev_scs + scs
                    merged_intervals[-1] = (prev_start, end_i, combined_scs)
                else:
                    merged_intervals.append((start_i, end_i, scs))

        # Filter by minimum duration & construct TemporalEvent objects
        events: List[TemporalEvent] = []
        for i, (start_i, end_i, scs) in enumerate(merged_intervals):
            duration_sec = (end_i - start_i + 1) * time_step
            if duration_sec < self.min_duration_sec:
                continue

            # Identify peak
            peak_val = max(scs)
            peak_rel_idx = scs.index(peak_val)
            peak_instance = start_i + peak_rel_idx

            start_f = start_i * frames_per_instance
            end_f = (end_i + 1) * frames_per_instance
            peak_f = peak_instance * frames_per_instance + (frames_per_instance // 2)

            start_t = start_f / active_fps
            end_t = end_f / active_fps
            peak_t = peak_f / active_fps

            mean_val = sum(scs) / len(scs)

            events.append(TemporalEvent(
                event_id=f"EVT-{i+1:03d}",
                start_frame=start_f,
                end_frame=end_f,
                start_time_sec=start_t,
                end_time_sec=end_t,
                duration_sec=duration_sec,
                peak_frame=peak_f,
                peak_time_sec=peak_t,
                peak_score=peak_val,
                mean_score=mean_val,
                confidence=min(1.0, peak_val * 1.05)
            ))

        return events

    @staticmethod
    def calculate_temporal_iou(
        pred: Tuple[float, float],
        gt: Tuple[float, float]
    ) -> float:
        """
        Calculates 1D Temporal Intersection over Union (tIoU) between prediction (p_start, p_end)
        and ground truth (gt_start, gt_end).
        """
        p_start, p_end = pred
        gt_start, gt_end = gt

        intersection = max(0.0, min(p_end, gt_end) - max(p_start, gt_start))
        union = max(p_end, gt_end) - min(p_start, gt_start)
        if union <= 0.0:
            return 0.0
        return intersection / union

    def evaluate_detections(
        self,
        predicted_events: List[TemporalEvent],
        ground_truth_intervals: List[Tuple[float, float]],
        iou_threshold: float = 0.50
    ) -> Dict[str, Any]:
        """
        Evaluates temporal detection metrics against ground-truth intervals.
        """
        if not ground_truth_intervals:
            return {
                "detected": False,
                "precision": 0.0 if predicted_events else 1.0,
                "recall": 1.0,
                "mean_tiou": 0.0,
                "mean_localization_error_sec": 0.0
            }

        matched_gt = set()
        matched_preds = set()
        ious = []
        loc_errors = []

        for p_idx, pred in enumerate(predicted_events):
            pred_interval = (pred.start_time_sec, pred.end_time_sec)
            best_iou = 0.0
            best_gt_idx = -1

            for gt_idx, gt in enumerate(ground_truth_intervals):
                iou = self.calculate_temporal_iou(pred_interval, gt)
                if iou > best_iou:
                    best_iou = iou
                    best_gt_idx = gt_idx

            if best_iou >= iou_threshold and best_gt_idx != -1:
                matched_gt.add(best_gt_idx)
                matched_preds.add(p_idx)
                ious.append(best_iou)

                # Localization error: distance from predicted peak to ground truth midpoint
                gt_midpoint = (ground_truth_intervals[best_gt_idx][0] + ground_truth_intervals[best_gt_idx][1]) / 2.0
                loc_errors.append(abs(pred.peak_time_sec - gt_midpoint))

        precision = len(matched_preds) / max(1, len(predicted_events))
        recall = len(matched_gt) / len(ground_truth_intervals)
        f1 = (2 * precision * recall) / max(1e-8, precision + recall)
        mean_tiou = sum(ious) / max(1, len(ious)) if ious else 0.0
        mean_loc_err = sum(loc_errors) / max(1, len(loc_errors)) if loc_errors else 0.0

        return {
            "num_predictions": len(predicted_events),
            "num_ground_truths": len(ground_truth_intervals),
            "true_positives": len(matched_gt),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "mean_tiou": round(mean_tiou, 4),
            "mean_localization_error_sec": round(mean_loc_err, 2),
            "iou_threshold": iou_threshold
        }
