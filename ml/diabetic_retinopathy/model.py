"""
Diabetic Retinopathy (DR) Lightweight Model Architecture & Training Script.
Target: Rural Health Camps on Low-End Smartphones.
Classes:
  - 0: 'No obvious DR'
  - 1: 'Suspected / Referable DR'

Architecture: MobileNetV3-Small (Transfer Learning + INT8 Quantization Aware)
"""

import os
import time
import torch
import torch.nn as nn
from torchvision import models, transforms

class DRMobileNetV3(nn.Module):
    """
    Lightweight MobileNetV3-Small tailored for fast inference on low-end ARM CPUs.
    Output: Binary classification (No obvious DR vs Suspected/Referable DR).
    """
    def __init__(self, num_classes=2, pretrained=True):
        super(DRMobileNetV3, self).__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_small(weights=weights)
        
        # Replace classifier head for binary screening
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.Hardswish(),
            nn.Dropout(p=0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)

def get_transforms(img_size=224):
    """Clinical preprocessing pipeline with data augmentation for rural camera variance."""
    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    return train_transform, val_transform

def export_to_onnx_and_tflite(model, save_dir="ml/models_exported"):
    """Exports trained PyTorch weights to ONNX format for mobile runtime conversion."""
    os.makedirs(save_dir, exist_ok=True)
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    onnx_path = os.path.join(save_dir, "dr_mobilenetv3.onnx")
    
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=13,
        do_constant_folding=True,
        input_names=['input_image'],
        output_names=['logits'],
        dynamic_axes={'input_image': {0: 'batch_size'}, 'logits': {0: 'batch_size'}}
    )
    print(f"[EXPORT] Successfully exported DR model to ONNX: {onnx_path}")
    print("[EXPORT] Ready for ONNX Runtime Mobile or TFLite converter via onnx-tf.")

if __name__ == "__main__":
    print("Initializing Diabetic Retinopathy MobileNetV3 Architecture...")
    model = DRMobileNetV3(num_classes=2, pretrained=False)
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total Trainable Parameters: {total_params:,} (~{total_params * 4 / (1024*1024):.2f} MB in FP32)")
    export_to_onnx_and_tflite(model)
