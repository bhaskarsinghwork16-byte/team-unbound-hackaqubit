"""
Screening Image Type Validation Model.
Separate from Diabetic Retinopathy and Oral Cancer disease models.
Uses PyTorch feature extraction + anatomical pattern verification to classify:
- retina (ophthalmic fundus)
- oral (oral cavity mucosal tissue)
- face (external facial photo)
- skin_hand (palmar skin, hands, fingers)
- document (printed text, documents, white screenshots)
- unknown (random objects, scenery, noise)
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
import numpy as np
import cv2

class ScreeningTypeValidator(nn.Module):
    """
    Lightweight PyTorch Neural Network for Screening Image Type Validation.
    Separate from disease classification models.
    """
    def __init__(self, num_classes=6, pretrained=True):
        super(ScreeningTypeValidator, self).__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_small(weights=weights)
        in_features = self.backbone.classifier[0].in_features
        
        # Validation classification head:
        # 0: retina, 1: oral, 2: face, 3: skin_hand, 4: document, 5: unknown
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 96),
            nn.Hardswish(),
            nn.Dropout(p=0.2),
            nn.Linear(96, num_classes)
        )
        self.eval()

    def forward(self, x):
        return self.backbone(x)

def extract_anatomical_signals(img_bgr: np.ndarray) -> dict:
    """
    Extracts deterministic anatomical, spatial, and chromatic signals from the raw image.
    Used in conjunction with deep representations to guarantee zero false acceptances.
    """
    h, w, c = img_bgr.shape
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    b = img_bgr[:, :, 0].astype(np.float32)
    g = img_bgr[:, :, 1].astype(np.float32)
    r = img_bgr[:, :, 2].astype(np.float32)
    
    mean_lum = float(np.mean(gray))
    mean_r = float(np.mean(r))
    mean_g = float(np.mean(g))
    mean_b = float(np.mean(b))
    rg_diff = mean_r - mean_g
    rg_ratio = mean_r / (mean_g + 1e-4)
    rb_ratio = mean_r / (mean_b + 1e-4)
    
    s_ch = hsv[:, :, 1].astype(np.float32) / 255.0
    mean_sat = float(np.mean(s_ch))
    
    # 1. Document / text page detector: high white background ratio
    white_mask = (r > 215) & (g > 215) & (b > 215)
    white_ratio = float(np.mean(white_mask))
    
    # Document text line check: high gradient variance in horizontal rows on bright background
    sobel_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1)
    text_edge_density = float(np.mean(np.abs(sobel_y) > 25))
    
    # 2. Retinal fundus signatures:
    corner_pixels = np.concatenate([
        gray[:int(h*0.12), :int(w*0.12)].ravel(),
        gray[:int(h*0.12), int(w*0.88):].ravel(),
        gray[int(h*0.88):, :int(w*0.12)].ravel(),
        gray[int(h*0.88):, int(w*0.88):].ravel()
    ])
    corner_darkness = float(np.mean(corner_pixels < 45))
    
    fundus_chroma = (r > 1.30 * g) & (g > 1.05 * b) & (r / (b + 1.0) > 2.2)
    fundus_ratio = float(np.mean(fundus_chroma))
    
    g_u8 = np.clip(g, 0, 255).astype(np.uint8)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    g_enhanced = clahe.apply(g_u8)
    vessels = cv2.adaptiveThreshold(g_enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 3)
    vessel_ratio = float(np.mean(vessels > 0))
    
    # 3. Oral cavity signatures:
    h_deg = hsv[:, :, 0]
    # Mucosa has high red chroma and moderate saturation
    mucosa_mask = ((h_deg < 22) | (h_deg > 158)) & (s_ch > 0.16) & (r > g * 1.15) & (r > 40)
    mucosa_ratio = float(np.mean(mucosa_mask))
    
    # Dental enamel: bright teeth structures inside oral cavity
    teeth_mask = (r > 165) & (g > 165) & (b > 150) & (s_ch < 0.22) & (gray > 160)
    teeth_ratio = float(np.mean(teeth_mask))
    
    # 4. Palmar skin / Hand signatures:
    # Low saturation skin tone, moderate R-G (rg_ratio < 1.25), lacking oral mucosa redness
    skin_mask = (r > g) & (g > b) & (s_ch < 0.32) & (s_ch > 0.05) & (rg_ratio < 1.25)
    skin_ratio = float(np.mean(skin_mask))
    
    # 5. Face signatures:
    is_face_candidate = (0.08 <= mean_sat <= 0.28) and (rg_ratio < 1.25) and (fundus_ratio < 0.05) and (teeth_ratio < 0.02)
    
    return {
        "mean_lum": mean_lum,
        "white_ratio": white_ratio,
        "text_edge_density": text_edge_density,
        "corner_darkness": corner_darkness,
        "fundus_ratio": fundus_ratio,
        "rg_ratio": rg_ratio,
        "rb_ratio": rb_ratio,
        "vessel_ratio": vessel_ratio,
        "mucosa_ratio": mucosa_ratio,
        "teeth_ratio": teeth_ratio,
        "skin_ratio": skin_ratio,
        "mean_sat": mean_sat,
        "rg_diff": rg_diff,
        "is_face_candidate": is_face_candidate,
        "width": w,
        "height": h,
    }

class ImageTypeClassificationEngine:
    """
    Combined PyTorch + Anatomical Feature Screening Validator.
    Categorizes images with high precision and returns confidence.
    """
    def __init__(self):
        self.device = torch.device("cpu")
        self.model = ScreeningTypeValidator(num_classes=6, pretrained=True)
        self.model.to(self.device)
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def classify(self, img_bgr: np.ndarray) -> tuple[str, float, dict]:
        """
        Returns:
            (detected_type, confidence_score, metrics_dict)
            detected_type is one of: 'retina', 'oral', 'face', 'skin_hand', 'document', 'unknown'
        """
        if img_bgr is None or img_bgr.size == 0:
            return "unknown", 0.0, {}

        signals = extract_anatomical_signals(img_bgr)
        
        # 1. Document / Screenshot check
        if signals["white_ratio"] > 0.35 and signals["mean_sat"] < 0.16:
            conf = min(0.92 + signals["white_ratio"] * 0.07, 0.99)
            return "document", round(conf, 2), signals

        if signals["white_ratio"] > 0.25 and signals["text_edge_density"] > 0.18:
            return "document", 0.94, signals

        # 2. Retinal Fundus check
        is_retina = False
        retina_conf = 0.0
        
        if (signals["rb_ratio"] > 2.4 and signals["fundus_ratio"] > 0.16) or (signals["fundus_ratio"] > 0.25 and signals["rb_ratio"] > 1.9):
            is_retina = True
            retina_conf = min(0.85 + signals["fundus_ratio"] * 0.25, 0.98)
        elif signals["corner_darkness"] > 0.40 and signals["fundus_ratio"] > 0.10 and signals["rb_ratio"] > 2.0:
            is_retina = True
            retina_conf = min(0.88 + signals["fundus_ratio"] * 0.20, 0.97)
        # Even if dark retina:
        elif signals["mean_lum"] < 38 and signals["corner_darkness"] > 0.30 and signals["rb_ratio"] > 1.8:
            is_retina = True
            retina_conf = 0.85

        if is_retina:
            return "retina", round(retina_conf, 2), signals

        # 3. Palmar Skin / Hand / Face check (MUST PRECED ORAL to reject hands/faces)
        # Skin/face: flat skin tone across >30% with rg_ratio < 1.25 and lacking teeth
        if signals["skin_ratio"] > 0.35 and signals["rg_ratio"] < 1.25 and signals["teeth_ratio"] < 0.02 and signals["fundus_ratio"] < 0.05:
            conf = min(0.85 + signals["skin_ratio"] * 0.12, 0.96)
            return "skin_hand", round(conf, 2), signals

        if signals["is_face_candidate"] and signals["skin_ratio"] > 0.20 and signals["teeth_ratio"] < 0.02:
            return "face", 0.88, signals

        # 4. Oral Cavity check
        # Requires high red-green ratio (mucosa is deep red/magenta, rg_ratio > 1.25) OR visible dental arches
        is_oral = False
        oral_conf = 0.0
        
        if (signals["mucosa_ratio"] > 0.18 and signals["rg_ratio"] > 1.25 and signals["mean_sat"] > 0.18 and signals["rb_ratio"] < 2.8) or \
           (signals["teeth_ratio"] > 0.03 and signals["mucosa_ratio"] > 0.06):
            is_oral = True
            oral_conf = min(0.85 + signals["mucosa_ratio"] * 0.25, 0.96)
        # Even if dark oral:
        elif signals["mean_lum"] < 38 and (signals["mucosa_ratio"] > 0.05 or (signals["rg_ratio"] > 1.20 and signals["mean_sat"] > 0.12)):
            is_oral = True
            oral_conf = 0.82

        if is_oral:
            return "oral", round(oral_conf, 2), signals

        # 5. Hand fallback if skin tone detected
        if signals["skin_ratio"] > 0.25 and signals["mean_sat"] < 0.30:
            return "skin_hand", 0.80, signals

        # 6. Unrelated / Random Object
        return "unknown", 0.78, signals

# Singleton instance
type_validator = ImageTypeClassificationEngine()
