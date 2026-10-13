"""
extract_regional_features.py
-----------------------------
Extracts 2x2 regional visual saliency features from all website screenshots.
Divides each computational saliency map into four quadrants:
  - Top-Left (TL)
  - Top-Right (TR)
  - Bottom-Left (BL)
  - Bottom-Right (BR)

Calculates the proportion of total saliency intensity for each quadrant,
ensuring percentages sum to 100%, and computes an overall concentration measure.
"""

import cv2
import numpy as np
import pandas as pd
from pathlib import Path

# Paths
IMAGES_DIR = Path("images")
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

# Image extensions
EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}

def calculate_gini(array):
    """Calculate Gini coefficient of a 2D array as a saliency concentration metric."""
    flat = array.flatten().astype(np.float64)
    if flat.size == 0 or flat.sum() == 0:
        return 0.0
    flat = np.sort(flat)
    n = flat.size
    index = np.arange(1, n + 1)
    return float((np.sum((2 * index - n - 1) * flat)) / (n * np.sum(flat)))

def extract_2x2_features(smap):
    """
    Given a 2D float saliency map, compute 2x2 regional percentages and concentration.
    Returns:
        dict: {
            "pct_top_left": float,
            "pct_top_right": float,
            "pct_bottom_left": float,
            "pct_bottom_right": float,
            "dominant_quadrant": str,
            "top_ratio": float,
            "left_ratio": float,
            "saliency_gini": float
        }
    """
    h, w = smap.shape
    mid_y, mid_x = h // 2, w // 2

    # Quadrant slices
    tl = smap[:mid_y, :mid_x]
    tr = smap[:mid_y, mid_x:]
    bl = smap[mid_y:, :mid_x]
    br = smap[mid_y:, mid_x:]

    # Sum of saliency mass per quadrant
    sum_tl = float(np.sum(tl))
    sum_tr = float(np.sum(tr))
    sum_bl = float(np.sum(bl))
    sum_br = float(np.sum(br))

    total = sum_tl + sum_tr + sum_bl + sum_br

    if total > 0:
        pct_tl = (sum_tl / total) * 100.0
        pct_tr = (sum_tr / total) * 100.0
        pct_bl = (sum_bl / total) * 100.0
        pct_br = (sum_br / total) * 100.0
    else:
        # Uniform fallback for empty maps
        pct_tl = pct_tr = pct_bl = pct_br = 25.0

    # Dominant quadrant
    quadrants = {
        "top_left": pct_tl,
        "top_right": pct_tr,
        "bottom_left": pct_bl,
        "bottom_right": pct_br
    }
    dominant_quadrant = max(quadrants, key=quadrants.get)

    # Top vs bottom, Left vs right ratios
    top_pct = pct_tl + pct_tr
    left_pct = pct_tl + pct_bl

    # Gini concentration index
    gini = calculate_gini(smap)

    return {
        "pct_top_left": round(pct_tl, 2),
        "pct_top_right": round(pct_tr, 2),
        "pct_bottom_left": round(pct_bl, 2),
        "pct_bottom_right": round(pct_br, 2),
        "pct_top": round(top_pct, 2),
        "pct_bottom": round(100.0 - top_pct, 2),
        "pct_left": round(left_pct, 2),
        "pct_right": round(100.0 - left_pct, 2),
        "dominant_quadrant": dominant_quadrant,
        "saliency_concentration_gini": round(gini, 4)
    }

def process_all_screenshots():
    sal = cv2.saliency.StaticSaliencySpectralResidual_create()
    records = []

    # Map categories to search folders
    category_folders = {
        "Product": IMAGES_DIR / "ProductDataset",
        "Education": IMAGES_DIR / "eduDataset"
    }

    print("Extracting 2x2 regional features across datasets...")

    for category, folder in category_folders.items():
        if not folder.exists():
            print(f"[warning] Folder not found: {folder}")
            continue

        files = sorted(
            p for p in folder.rglob("*")
            if p.is_file() and p.suffix.lower() in EXTS
        )
        print(f"[{category}] Found {len(files)} screenshots")

        for idx, file_path in enumerate(files, 1):
            img = cv2.imread(str(file_path))
            if img is None:
                print(f"[skip] Unreadable: {file_path.name}")
                continue

            h, w = img.shape[:2]
            ok, smap = sal.computeSaliency(img)
            if not ok:
                print(f"[fail] Could not compute saliency: {file_path.name}")
                continue

            # Ensure smap is float
            smap = smap.astype(np.float32)

            # Extract features
            feats = extract_2x2_features(smap)

            record = {
                "screenshot_id": f"{category}_{file_path.stem}",
                "filename": file_path.name,
                "relative_path": str(file_path.relative_to(IMAGES_DIR)),
                "category": category,
                "image_width": w,
                "image_height": h,
                "aspect_ratio": round(w / h, 3),
                **feats
            }
            records.append(record)

    df = pd.DataFrame(records)
    out_csv = DATA_DIR / "saliency_regional_features.csv"
    df.to_csv(out_csv, index=False)

    print(f"\nSuccessfully extracted features for {len(df)} screenshots.")
    print(f"Saved dataset to: {out_csv}")
    print("\nSummary by Category:")
    print(df.groupby("category")[["pct_top_left", "pct_top_right", "pct_bottom_left", "pct_bottom_right", "saliency_concentration_gini"]].mean())

    return df

if __name__ == "__main__":
    process_all_screenshots()
