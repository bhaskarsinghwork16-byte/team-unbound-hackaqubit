"""
Oral Screening Lightweight CNN Architecture & Explainable AI (Grad-CAM).
Target: Rural Oral Cancer / Pre-malignant Lesion Screening.
Classes:
  - 0: 'No suspicious lesion'
  - 1: 'Suspicious lesion'

Architecture: EfficientNet-Lite0 / MobileNetV3 + Layer Activation Heatmaps.
"""

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models
import numpy as np

class OralScreeningCNN(nn.Module):
    """
    Lightweight model for oral cavity lesion classification.
    Optimized for high sensitivity to avoid missing referable lesions.
    """
    def __init__(self, num_classes=2, pretrained=True):
        super(OralScreeningCNN, self).__init__()
        weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_large(weights=weights)
        
        # Keep reference to final convolutional feature layer for Grad-CAM
        self.target_layer = self.backbone.features[-1]
        
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.Hardswish(),
            nn.Dropout(p=0.35),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)


class GradCAM:
    """
    Grad-CAM implementation to compute attention heatmaps explaining
    which oral cavity pixels influenced the suspicious lesion decision.
    """
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate_heatmap(self, input_tensor, target_class=1):
        """
        Computes 2D normalized Grad-CAM heatmap for the specified target class.
        """
        self.model.eval()
        self.model.zero_grad()
        
        logits = self.model(input_tensor)
        target = logits[0, target_class]
        target.backward()

        # Global average pool the gradients
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
        # Weighted combination of forward activation maps
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
        cam = F.relu(cam)
        
        # Interpolate to input image dimensions (224, 224)
        cam = F.interpolate(cam, size=input_tensor.shape[2:], mode='bilinear', align_corners=False)
        cam = cam.squeeze().cpu().numpy()
        
        # Normalize between 0.0 and 1.0
        cam_min, cam_max = np.min(cam), np.max(cam)
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)
            
        return cam, logits.softmax(dim=1).detach().cpu().numpy()[0]

def export_oral_model(model, save_dir="ml/models_exported"):
    os.makedirs(save_dir, exist_ok=True)
    model.eval()
    dummy = torch.randn(1, 3, 224, 224)
    onnx_path = os.path.join(save_dir, "oral_mobilenetv3.onnx")
    torch.onnx.export(
        model,
        dummy,
        onnx_path,
        export_params=True,
        opset_version=13,
        input_names=['input_image'],
        output_names=['logits']
    )
    print(f"[EXPORT] Oral Screening model saved to ONNX: {onnx_path}")

if __name__ == "__main__":
    print("Initializing Oral Lesion Screening Architecture & Grad-CAM...")
    model = OralScreeningCNN(num_classes=2, pretrained=False)
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total Parameters: {total_params:,} (~{total_params * 4 / (1024*1024):.2f} MB in FP32)")
    
    # Test Grad-CAM synthetic pass
    gradcam = GradCAM(model, model.target_layer)
    dummy_img = torch.randn(1, 3, 224, 224, requires_grad=True)
    heatmap, probs = gradcam.generate_heatmap(dummy_img, target_class=1)
    print(f"Grad-CAM Heatmap generated shape: {heatmap.shape}, min: {heatmap.min():.2f}, max: {heatmap.max():.2f}")
    export_oral_model(model)
