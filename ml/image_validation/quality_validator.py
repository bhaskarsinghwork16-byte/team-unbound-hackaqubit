"""
Screening Image Quality Assessment (IQA) Module.
Uses OpenCV, NumPy, and image geometry to evaluate:
- Blur / Focus (Laplacian variance normalized 0-100)
- Brightness / Illumination (Mean luminance normalized 0-100)
- Contrast (Luminance standard deviation normalized 0-100)
- Resolution (W x H)
"""

import cv2
import numpy as np

def assess_image_quality(img_bgr: np.ndarray, task: str) -> dict:
    """
    Computes real, non-fabricated quality metrics.
    Returns:
    {
        "blur": float (0-100, higher is sharper),
        "brightness": float (0-100, optimal ~50-80),
        "contrast": float (0-100, higher is better),
        "resolution": str (e.g. "512x512"),
        "is_acceptable": bool,
        "retake_reason": str
    }
    """
    if img_bgr is None or img_bgr.size == 0:
        return {
            "blur": 0.0,
            "brightness": 0.0,
            "contrast": 0.0,
            "resolution": "0x0",
            "is_acceptable": False,
            "retake_reason": "Image data is empty or corrupted."
        }

    h, w, c = img_bgr.shape
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Blur / Sharpness via Laplacian Variance
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    # Normalization: 0 to 100 scale
    # Eye fundus requires lap_var >= 18.0. Oral mucosa requires lap_var >= 5.0.
    # Scale log-linearly so 20 is ~55%, 100 is ~75%, 500 is ~90%
    blur_score = min(max(np.log1p(lap_var) / np.log1p(1000.0) * 100.0, 0.0), 100.0)

    # 2. Brightness via Mean Luminance (0-255 -> 0-100)
    mean_lum = float(np.mean(gray))
    brightness_score = min(max((mean_lum / 255.0) * 100.0, 0.0), 100.0)

    # 3. Contrast via Standard Deviation of Luminance
    std_lum = float(np.std(gray))
    # Optimal std dev is ~30 to 75. Scale 0-100.
    contrast_score = min(max((std_lum / 80.0) * 100.0, 0.0), 100.0)

    resolution_str = f"{w}x{h}"

    # Clinical usability check:
    is_acceptable = True
    retake_reason = ""

    # Severe blur check
    if (task == "eye" and lap_var < 18.0) or (task == "oral" and lap_var < 5.0):
        is_acceptable = False
        if task == "eye":
            retake_reason = "Retinal image detected, but it is too blurry. Please retake with steady focus."
        else:
            retake_reason = "Oral image detected, but it has severe motion blur. Please hold steady and retake."

    # Underexposure / dark check
    elif mean_lum < 36.0 or brightness_score < 15.0:
        is_acceptable = False
        if task == "eye":
            retake_reason = "Retinal image detected, but it is too dark. Please retake with proper illumination."
        else:
            retake_reason = "Oral image detected, but lighting is underexposed. Please retake with better illumination."

    # Washed out / overexposure check
    elif mean_lum > 235.0:
        is_acceptable = False
        retake_reason = "The image is overexposed / washed out. Please retake avoiding direct glare."

    # Resolution check (minimum 180x180 for clinical screening)
    elif w < 180 or h < 180:
        is_acceptable = False
        retake_reason = f"Image resolution ({resolution_str}) is too low for reliable screening. Minimum 180x180 required."

    return {
        "blur": round(blur_score, 1),
        "brightness": round(brightness_score, 1),
        "contrast": round(contrast_score, 1),
        "resolution": resolution_str,
        "is_acceptable": is_acceptable,
        "retake_reason": retake_reason
    }
