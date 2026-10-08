"""
Screening Image Validation Gate.
Implements the 3-State Gating Protocol:
- "valid"   -> Correct image type + sufficient quality. (Allowed to run medical model)
- "retake"  -> Correct image type detected, but quality is insufficient. (BLOCKED)
- "invalid" -> Wrong image type. (BLOCKED)

Returns the exact JSON contract specified:
{
  "status": "valid" | "retake" | "invalid",
  "imageType": "retina" | "oral" | "unknown",
  "confidence": number | null,
  "quality": {
    "blur": number,
    "brightness": number,
    "contrast": number,
    "resolution": string
  },
  "reason": string
}
"""

import numpy as np
from .type_classifier import type_validator
from .quality_validator import assess_image_quality

def validate_screening_image(img_bgr: np.ndarray, task: str) -> dict:
    """
    Executes:
    1. Image Type Classification (PyTorch + anatomical signals)
    2. Quality Checks (blur, brightness, contrast, resolution)
    Returns validation contract.
    """
    if img_bgr is None or img_bgr.size == 0:
        return {
            "status": "invalid",
            "imageType": "unknown",
            "confidence": None,
            "quality": {
                "blur": 0.0,
                "brightness": 0.0,
                "contrast": 0.0,
                "resolution": "0x0"
            },
            "reason": "This image does not appear to match the selected screening."
        }

    # STEP 1: Image Type Validation
    detected_type, type_confidence, _ = type_validator.classify(img_bgr)
    
    # Assess Quality Signals (blur, brightness, contrast, resolution)
    quality_metrics = assess_image_quality(img_bgr, task)
    
    # Format mapped imageType for contract: "retina" | "oral" | "unknown"
    contract_image_type = detected_type if detected_type in ["retina", "oral"] else "unknown"

    # Evaluate compatibility with requested task ("eye" or "oral")
    is_correct_type = False
    rejection_reason = ""

    if task == "eye":
        if detected_type == "retina":
            is_correct_type = True
        elif detected_type == "oral":
            rejection_reason = "This appears to be an oral image. Please capture a retinal image or switch to Oral Screening."
        elif detected_type == "skin_hand":
            rejection_reason = "This image does not appear to match the selected screening (skin or hand photo detected)."
        elif detected_type == "face":
            rejection_reason = "This appears to be an external face photo. Retinal fundus photograph is required for Eye Screening."
        elif detected_type == "document":
            rejection_reason = "This appears to be a document or screenshot, not a retinal image."
        else:
            rejection_reason = "This image does not appear to match the selected screening."
    elif task == "oral":
        if detected_type == "oral":
            is_correct_type = True
        elif detected_type == "retina":
            rejection_reason = "This appears to be a retinal image. Please capture an oral image or switch to Eye Screening."
        elif detected_type == "skin_hand":
            rejection_reason = "This image does not appear to match the selected screening (skin or hand photo detected)."
        elif detected_type == "face":
            rejection_reason = "This appears to be an external face photo. Please frame the oral cavity interior (tongue, cheek, palate, or gums)."
        elif detected_type == "document":
            rejection_reason = "This appears to be a document or screenshot, not an oral cavity image."
        else:
            rejection_reason = "This image does not appear to match the selected screening."

    # STATE 1: INVALID -> Wrong image type
    if not is_correct_type:
        return {
            "status": "invalid",
            "imageType": contract_image_type,
            "confidence": None, # Never fabricate confidence for invalid image
            "quality": {
                "blur": quality_metrics["blur"],
                "brightness": quality_metrics["brightness"],
                "contrast": quality_metrics["contrast"],
                "resolution": quality_metrics["resolution"],
            },
            "reason": rejection_reason
        }

    # STATE 2: RETAKE -> Correct image type, but poor optical quality
    if not quality_metrics["is_acceptable"]:
        return {
            "status": "retake",
            "imageType": contract_image_type,
            "confidence": None, # Never fabricate confidence when quality is insufficient
            "quality": {
                "blur": quality_metrics["blur"],
                "brightness": quality_metrics["brightness"],
                "contrast": quality_metrics["contrast"],
                "resolution": quality_metrics["resolution"],
            },
            "reason": quality_metrics["retake_reason"] or "The correct screening area was detected, but the image quality is not sufficient for reliable screening."
        }

    # STATE 3: VALID -> Correct image type + sufficient quality
    return {
        "status": "valid",
        "imageType": contract_image_type,
        "confidence": type_confidence,
        "quality": {
            "blur": quality_metrics["blur"],
            "brightness": quality_metrics["brightness"],
            "contrast": quality_metrics["contrast"],
            "resolution": quality_metrics["resolution"],
        },
        "reason": "Image quality and screening area are suitable for analysis."
    }
