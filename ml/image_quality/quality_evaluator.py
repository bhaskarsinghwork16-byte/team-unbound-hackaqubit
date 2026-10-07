"""
Automated Image Quality Assessment (IQA) for Edge Telemedicine.
Evaluates:
  1. Blur (Laplacian variance)
  2. Brightness (Mean luminance)
  3. Contrast (Luminance standard deviation)
  4. Noise (High-frequency residual approximation)
  5. Framing / Resolution sanity check

Threshold: 0.60 (Below this, the image is rejected before disease model execution).
"""

import cv2
import numpy as np

class ImageQualityEvaluator:
    def __init__(self, min_acceptable_score=0.60):
        self.min_acceptable_score = min_acceptable_score

    def evaluate(self, image_bgr: np.ndarray) -> dict:
        """
        Takes raw BGR image and returns composite score and per-metric diagnostic values.
        """
        if image_bgr is None or image_bgr.size == 0:
            return {
                "overall_score": 0.0,
                "is_acceptable": False,
                "reason": "Invalid or empty image"
            }

        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        blur_score = self._compute_blur(gray)
        brightness_score = self._compute_brightness(gray)
        contrast_score = self._compute_contrast(gray)
        noise_score = self._compute_noise(gray)
        framing_score = self._compute_framing(w, h, gray)

        # Weighted composite score
        overall = (
            blur_score * 0.35 +
            brightness_score * 0.20 +
            contrast_score * 0.20 +
            noise_score * 0.15 +
            framing_score * 0.10
        )
        overall = float(np.clip(overall, 0.0, 1.0))

        issue = self._identify_primary_issue(
            blur_score, brightness_score, contrast_score, noise_score, framing_score
        )

        return {
            "overall_score": round(overall, 3),
            "blur_score": round(blur_score, 3),
            "brightness_score": round(brightness_score, 3),
            "contrast_score": round(contrast_score, 3),
            "noise_score": round(noise_score, 3),
            "framing_score": round(framing_score, 3),
            "is_acceptable": overall >= self.min_acceptable_score,
            "primary_feedback": issue
        }

    def _compute_blur(self, gray: np.ndarray) -> float:
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        # Scale: log-linear scaling based on empirical fundus & oral camera data
        # < 80 is severely blurred, > 800 is adequately sharp
        score = np.log1p(laplacian_var) / np.log1p(1200.0)
        return float(np.clip(score, 0.0, 1.0))

    def _compute_brightness(self, gray: np.ndarray) -> float:
        mean_lum = np.mean(gray) / 255.0
        # Optimal center at 0.50. Under 0.15 is underexposed, over 0.85 is washed out.
        diff = abs(mean_lum - 0.50)
        score = 1.0 - (diff * 2.2)
        return float(np.clip(score, 0.0, 1.0))

    def _compute_contrast(self, gray: np.ndarray) -> float:
        std_lum = np.std(gray) / 255.0
        # Normal fundus/oral dynamic range has std dev between 0.12 and 0.28
        if std_lum < 0.05:
            return 0.1
        elif std_lum < 0.10:
            return 0.4
        elif std_lum > 0.38:
            return 0.65
        return float(np.clip(std_lum / 0.25, 0.0, 1.0))

    def _compute_noise(self, gray: np.ndarray) -> float:
        # High-frequency residual check
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        noise_residue = np.mean(np.abs(gray.astype(np.float32) - blurred.astype(np.float32))) / 255.0
        score = 1.0 - (noise_residue * 12.0)
        return float(np.clip(score, 0.0, 1.0))

    def _compute_framing(self, w: int, h: int, gray: np.ndarray) -> float:
        if w < 224 or h < 224:
            return 0.3
        # Check center region vs border luminance to ensure non-empty center
        center_crop = gray[h//4:3*h//4, w//4:3*w//4]
        if np.mean(center_crop) < 15:
            return 0.2  # Center is pitch black
        return 1.0

    def _identify_primary_issue(self, blur, bright, contrast, noise, framing) -> str:
        metrics = {
            "Too blurry. Hold the phone steady and tap to focus.": blur,
            "Lighting too dim or uneven. Please illuminate the region.": bright,
            "Low contrast. Ensure even light distribution.": contrast,
            "High digital sensor noise. Move to brighter natural light.": noise,
            "Improper framing. Center the eye or open mouth inside the guide ring.": framing,
        }
        worst_metric = min(metrics.items(), key=lambda x: x[1])
        if worst_metric[1] < 0.55:
            return worst_metric[0]
        return "Image quality is good. Ready for screening."

if __name__ == "__main__":
    evaluator = ImageQualityEvaluator()
    dummy_good = np.full((400, 400, 3), 128, dtype=np.uint8)
    cv2.circle(dummy_good, (200, 200), 100, (180, 80, 50), -1)
    
    res = evaluator.evaluate(dummy_good)
    print("Good Image Assessment:")
    print(res)

    dummy_blurry = cv2.GaussianBlur(dummy_good, (45, 45), 0)
    res_blurry = evaluator.evaluate(dummy_blurry)
    print("\nBlurry Degraded Image Assessment:")
    print(res_blurry)
