"""
train_complexity_rf.py
----------------------
Implements and trains the completed cognitive/complexity machine learning pipeline
from teammate's cognitive (1).ipynb (Cells 3, 6, 16, 18, 21, 22).

1. Extracts 8 physical visual & textual features across all 105 website screenshots:
   - word_count
   - text_block_count
   - text_density
   - text_block_density
   - brightness
   - contrast
   - edge_density
   - whitespace_ratio
2. Formulates the benchmark Complexity Proxy Index (Cell 6).
3. Trains a RandomForestRegressor (n_estimators=100, max_depth=4, random_state=42) (Cell 18).
4. Evaluates MAE, RMSE, R^2 and feature importances (Cells 19, 21).
5. Saves model to models/random_forest_complexity_model.joblib and dataset to data/website_complexity_dataset.csv.
"""

import os
import cv2
import joblib
import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from complexity_analysis import estimate_text_regions_cv

IMAGES_DIR = Path("images")
DATA_DIR = Path("data")
MODELS_DIR = Path("models")
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)

FEATURE_COLUMNS = [
    "word_count",
    "text_block_count",
    "text_density",
    "text_block_density",
    "brightness",
    "contrast",
    "edge_density",
    "whitespace_ratio"
]

def extract_single_image_features(image_path):
    """Exact feature extraction matching Cell 24 of cognitive (1).ipynb."""
    image = cv2.imread(str(image_path))
    if image is None:
        return None

    height, width = image.shape[:2]
    image_area = height * width
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 1. Visual physical features
    brightness = float(np.mean(gray))
    contrast = float(np.std(gray))

    # Canny Edge Density
    edges = cv2.Canny(gray, 100, 200)
    edge_density = float(np.count_nonzero(edges) / image_area)

    # Whitespace Ratio (10x10 patch low variance < 15)
    resized = cv2.resize(gray, (100, 100))
    patch_size = 10
    uniform_patches = 0
    total_patches = 0

    for y in range(0, 100, patch_size):
        for x in range(0, 100, patch_size):
            patch = resized[y:y + patch_size, x:x + patch_size]
            if float(np.std(patch)) < 15.0:
                uniform_patches += 1
            total_patches += 1

    whitespace_ratio = float(uniform_patches / total_patches)

    # 2. Text features
    text_info = estimate_text_regions_cv(gray, image_area)

    return {
        "word_count": text_info["word_count"],
        "text_block_count": text_info["text_block_count"],
        "text_density": text_info["text_density"],
        "text_block_density": text_info["text_block_density"],
        "brightness": brightness,
        "contrast": contrast,
        "edge_density": edge_density,
        "whitespace_ratio": whitespace_ratio
    }

def build_dataset_and_train():
    print("Extracting complexity features across 105 screenshots...")
    records = []

    exts = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}
    files = sorted(p for p in IMAGES_DIR.rglob("*") if p.is_file() and p.suffix.lower() in exts)

    for i, path in enumerate(files, 1):
        feats = extract_single_image_features(path)
        if feats is not None:
            category = "Education" if "edu" in str(path).lower() else "Product"
            records.append({
                "image_name": path.name,
                "relative_path": str(path.relative_to(IMAGES_DIR)),
                "category": category,
                **feats
            })

    df = pd.DataFrame(records)
    print(f"Extracted features for {len(df)} screenshots.")

    # Cell 6: Normalization and Complexity Score formulation
    def normalize_series(series):
        mn, mx = series.min(), series.max()
        if mx == mn:
            return pd.Series(0.0, index=series.index)
        return (series - mn) / (mx - mn)

    text_score = normalize_series(df["text_density"])
    edge_score = normalize_series(df["edge_density"])
    block_score = normalize_series(df["text_block_density"])
    whitespace_score = df["whitespace_ratio"].clip(0, 1)

    df["complexity_score"] = (
        100.0 * (
            0.35 * text_score
            + 0.25 * edge_score
            + 0.20 * block_score
            + 0.20 * (1.0 - whitespace_score)
        )
    ).clip(0, 100).round(2)

    # Save dataset matching Cell 3/6
    csv_path = DATA_DIR / "website_complexity_dataset.csv"
    df.to_csv(csv_path, index=False)
    print(f"Saved complexity dataset to: {csv_path}")

    # Cell 16-18: Train Random Forest Regressor
    X = df[FEATURE_COLUMNS]
    y = df["complexity_score"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=4,
        random_state=42
    )
    rf_model.fit(X_train, y_train)

    # Evaluate (Cell 19)
    predictions = rf_model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    print("\n--- Random Forest Evaluation Results (Cell 19) ---")
    print(f"MAE:  {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R^2:  {r2:.4f}")

    # Feature Importances (Cell 21)
    importances = dict(zip(FEATURE_COLUMNS, [round(float(v), 4) for v in rf_model.feature_importances_]))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("\n--- Feature Importances (Cell 21) ---")
    for feat, imp in sorted_importances:
        print(f"  {feat:<20}: {imp:.4f} ({imp*100:.1f}%)")

    # Save Model Artifact (Cell 22)
    model_path = MODELS_DIR / "random_forest_complexity_model.joblib"
    joblib.dump(rf_model, model_path)
    print(f"\nSaved Random Forest model artifact to: {model_path}")

    # Save metadata for explainability & normalization
    meta_path = MODELS_DIR / "complexity_model_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({
            "model_type": "RandomForestRegressor",
            "parameters": {"n_estimators": 100, "max_depth": 4, "random_state": 42},
            "metrics": {"mae": round(float(mae), 2), "rmse": round(float(rmse), 2), "r2": round(float(r2), 4)},
            "feature_columns": FEATURE_COLUMNS,
            "feature_importances": dict(sorted_importances),
            "normalization_ranges": {
                col: {"min": round(float(df[col].min()), 4), "max": round(float(df[col].max()), 4)}
                for col in FEATURE_COLUMNS
            },
            "formula_weights": {"text_density": 0.35, "edge_density": 0.25, "text_block_density": 0.20, "inverse_whitespace": 0.20}
        }, f, indent=2)
    print(f"Saved model metadata to: {meta_path}")

    return rf_model, df

if __name__ == "__main__":
    build_dataset_and_train()
