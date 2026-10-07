"""
Synthetic Medical Asset Generator for HealthScreen AI Hackathon Demo
Generates realistic demonstration images into assets/demo/ for offline testing:
  1. demo_retina_normal.jpg      - Clear normal fundus
  2. demo_retina_referable.jpg   - Fundus with exudates & microaneurysms
  3. demo_retina_blurry.jpg      - Blurred fundus capture (Quality Rejection test)
  4. demo_oral_normal.jpg        - Healthy pink oral mucosa
  5. demo_oral_suspicious.jpg    - Suspicious mucosal lesion / leukoplakia
"""

import os
import cv2
import numpy as np

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def generate_fundus_image(referable=False, blurry=False):
    # 512x512 image
    img = np.zeros((512, 512, 3), dtype=np.uint8)
    center = (256, 256)
    radius = 230

    # Draw retinal circular background (deep reddish orange)
    for y in range(512):
        for x in range(512):
            dx = x - center[0]
            dy = y - center[1]
            dist = np.sqrt(dx*dx + dy*dy)
            if dist < radius:
                # Retinal gradation (darker near periphery)
                edge_dim = 1.0 - (dist / radius) * 0.45
                b = int(25 * edge_dim)
                g = int((75 + 15 * np.sin(x/30)) * edge_dim)
                r = int((195 + 20 * np.cos(y/30)) * edge_dim)
                img[y, x] = [b, g, r]

    # Draw Optic Disc (yellowish-orange oval on nasal side)
    cv2.circle(img, (160, 250), 38, (80, 190, 245), -1)
    cv2.circle(img, (160, 250), 22, (95, 215, 255), -1)

    # Draw Macula (darker circular foveal center)
    cv2.circle(img, (330, 260), 35, (15, 45, 130), -1)
    cv2.circle(img, (330, 260), 10, (10, 30, 95), -1)

    # Draw Retinal Blood Vessels (vascular arcades branching out)
    vessel_color = (15, 25, 120)
    # Superior arcade
    pts_sup = np.array([[160, 240], [210, 160], [290, 130], [380, 140]], np.int32)
    cv2.polylines(img, [pts_sup], False, vessel_color, 4, cv2.LINE_AA)
    # Inferior arcade
    pts_inf = np.array([[160, 260], [220, 340], [300, 380], [390, 360]], np.int32)
    cv2.polylines(img, [pts_inf], False, vessel_color, 4, cv2.LINE_AA)
    # Nasal branches
    pts_nasal = np.array([[160, 250], [100, 230], [60, 240]], np.int32)
    cv2.polylines(img, [pts_nasal], False, vessel_color, 3, cv2.LINE_AA)

    if referable:
        # Add Hard Exudates (bright yellow lipid deposits around macula)
        exudate_color = (120, 240, 255)
        for offset in [(-30, -20), (20, -35), (40, 25), (-25, 30), (15, 40)]:
            pt = (330 + offset[0], 260 + offset[1])
            cv2.circle(img, pt, 6, exudate_color, -1)
            cv2.circle(img, (pt[0]+4, pt[1]+3), 4, exudate_color, -1)

        # Add Microaneurysms and Flame Hemorrhages (dark red dots)
        hemo_color = (5, 5, 80)
        for offset in [(-60, -40), (70, -10), (10, -60), (-50, 50), (60, 30)]:
            pt = (330 + offset[0], 260 + offset[1])
            cv2.circle(img, pt, 4, hemo_color, -1)
            cv2.circle(img, (pt[0]-8, pt[1]+5), 3, hemo_color, -1)

    if blurry:
        # Apply severe motion blur + low illumination
        img = cv2.GaussianBlur(img, (55, 55), 0)
        img = (img.astype(np.float32) * 0.35).astype(np.uint8)

    return img

def generate_oral_image(suspicious=False):
    # 512x512 oral mucosa representation
    img = np.zeros((512, 512, 3), dtype=np.uint8)

    # Base mucosal pinkish hue with natural texture
    for y in range(512):
        for x in range(512):
            b = int(120 + 20 * np.sin(x/40) + 10 * np.random.randn())
            g = int(95 + 25 * np.cos(y/35) + 10 * np.random.randn())
            r = int(210 + 25 * np.sin((x+y)/50))
            img[y, x] = [np.clip(b, 0, 255), np.clip(g, 0, 255), np.clip(r, 0, 255)]

    # Draw oral cavity anatomical shadow (back of throat / darkness)
    cv2.ellipse(img, (256, 80), (160, 70), 0, 0, 360, (20, 15, 30), -1)

    if suspicious:
        # Draw leukoplakia / erythroplakia irregular lesion on buccal mucosa
        lesion_center = (320, 300)
        # Irregular white patch (Leukoplakia)
        cv2.ellipse(img, lesion_center, (65, 45), 25, 0, 360, (220, 230, 245), -1)
        # Erythematous border (red inflamed boundary)
        cv2.ellipse(img, lesion_center, (75, 55), 25, 0, 360, (40, 30, 190), 4)
        # Central ulceration
        cv2.circle(img, (325, 295), 18, (30, 25, 140), -1)

    # Subtle gaussian smoothing to look natural
    img = cv2.GaussianBlur(img, (5, 5), 0)
    return img

def main():
    out_dir = "assets/demo"
    ensure_dir(out_dir)

    print("Generating synthetic demo clinical images for judges...")

    # 1. Normal Retina
    retina_norm = generate_fundus_image(referable=False, blurry=False)
    cv2.imwrite(os.path.join(out_dir, "demo_retina_normal.jpg"), retina_norm)
    print("  [OK] Created assets/demo/demo_retina_normal.jpg")

    # 2. Referable DR Retina
    retina_ref = generate_fundus_image(referable=True, blurry=False)
    cv2.imwrite(os.path.join(out_dir, "demo_retina_referable.jpg"), retina_ref)
    print("  [OK] Created assets/demo/demo_retina_referable.jpg")

    # 3. Blurry Retina (Rejection trigger)
    retina_blur = generate_fundus_image(referable=False, blurry=True)
    cv2.imwrite(os.path.join(out_dir, "demo_retina_blurry.jpg"), retina_blur)
    print("  [OK] Created assets/demo/demo_retina_blurry.jpg")

    # 4. Normal Oral
    oral_norm = generate_oral_image(suspicious=False)
    cv2.imwrite(os.path.join(out_dir, "demo_oral_normal.jpg"), oral_norm)
    print("  [OK] Created assets/demo/demo_oral_normal.jpg")

    # 5. Suspicious Oral Lesion
    oral_susp = generate_oral_image(suspicious=True)
    cv2.imwrite(os.path.join(out_dir, "demo_oral_suspicious.jpg"), oral_susp)
    print("  [OK] Created assets/demo/demo_oral_suspicious.jpg")

    print("\nAll 5 clinical demo assets successfully generated!")

if __name__ == "__main__":
    main()
