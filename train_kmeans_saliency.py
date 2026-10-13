"""
train_kmeans_saliency.py
-------------------------
Trains an unsupervised K-Means clustering model on 2x2 regional visual saliency features.
Evaluates k=2, 3, 4, 5 using Silhouette Score, inertia, and profile interpretability.
Saves the trained model, cluster profiles, and dataset assignments for inference.
"""

import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

DATA_DIR = Path("data")
DATA_PATH = DATA_DIR / "saliency_regional_features.csv"
MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)

FEATURE_COLS = ["pct_top_left", "pct_top_right", "pct_bottom_left", "pct_bottom_right"]

def evaluate_and_train():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Feature dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} samples from {DATA_PATH}")

    # Validate feature values
    X = df[FEATURE_COLS].values
    row_sums = X.sum(axis=1)
    if not np.allclose(row_sums, 100.0, atol=1.0):
        print(f"[warning] Some row sums deviate slightly from 100: min={row_sums.min():.2f}, max={row_sums.max():.2f}")

    print("\n--- K-Means Model Selection (k=2 to 5) ---")
    results = {}
    models = {}
    
    # We test on raw percentages and optionally with standard scaler
    # Since all 4 features are on the exact same scale (percentages 0-100), raw scaling preserves absolute compositional meaning
    for k in [2, 3, 4, 5]:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=20)
        labels = kmeans.fit_predict(X)
        sil = silhouette_score(X, labels)
        inertia = kmeans.inertia_
        counts = pd.Series(labels).value_counts().to_dict()
        results[k] = {
            "silhouette": round(float(sil), 4),
            "inertia": round(float(inertia), 2),
            "cluster_counts": counts
        }
        models[k] = (kmeans, labels)
        print(f"k={k}: Silhouette Score = {sil:.4f}, Inertia = {inertia:.2f}, Cluster sizes = {counts}")

    # Select best k based on silhouette and balanced interpretability
    # Typically k=3 or k=4 yields rich, human-interpretable web layout archetypes
    # If k=3 has close silhouette to k=2 (within 0.02) and balanced clusters (min >= 15), choose k=3 for richer layout taxonomy
    if abs(results[3]["silhouette"] - results[2]["silhouette"]) < 0.02 and min(results[3]["cluster_counts"].values()) >= 15:
        chosen_k = 3
    else:
        chosen_k = best_k

    print(f"\nSelected k = {chosen_k} for deployment (Silhouette: {results[chosen_k]['silhouette']})")
    chosen_kmeans, chosen_labels = models[chosen_k]

    # Assign descriptive profiles based on centroids
    centroids = chosen_kmeans.cluster_centers_
    cluster_profiles = {}

    print(f"\n--- Cluster Centroids & Qualitative Profiles (k={chosen_k}) ---")
    for c_idx, center in enumerate(centroids):
        tl, tr, bl, br = center
        top_tot = tl + tr
        bottom_tot = bl + br
        left_tot = tl + bl
        right_tot = tr + br

        # Determine semantic label based on spatial distribution
        if top_tot >= 55.0:
            if left_tot >= 53.0:
                name = "Top-Left Focal (Header & Branding Dominant)"
            elif right_tot >= 53.0:
                name = "Top-Right Focal (Header & Utility/CTA Dominant)"
            else:
                name = "Top-Heavy (Header & Hero Banner Dominant)"
        elif bottom_tot >= 55.0:
            if left_tot >= 53.0:
                name = "Bottom-Left Focal (Content Grid Dominant)"
            elif right_tot >= 53.0:
                name = "Bottom-Right Focal (Product Cards & Detail Dominant)"
            else:
                name = "Bottom-Heavy (Content/Product Grid Dominant)"
        elif left_tot >= 55.0:
            name = "Left-Side Dominant (Sidebar / Asymmetrical Hero)"
        elif right_tot >= 55.0:
            name = "Right-Side Dominant (Right Rail / Product Showcase)"
        else:
            name = "Balanced / Distributed Layout (Multi-Focal)"

        profile_info = {
            "cluster_id": int(c_idx),
            "profile_name": name,
            "centroid_percentages": {
                "top_left": round(float(tl), 2),
                "top_right": round(float(tr), 2),
                "bottom_left": round(float(bl), 2),
                "bottom_right": round(float(br), 2)
            },
            "top_ratio": round(float(top_tot), 2),
            "bottom_ratio": round(float(bottom_tot), 2),
            "left_ratio": round(float(left_tot), 2),
            "right_ratio": round(float(right_tot), 2),
            "sample_count": int(results[chosen_k]["cluster_counts"][c_idx])
        }
        cluster_profiles[str(c_idx)] = profile_info

        print(f"\nCluster {c_idx}: {name}")
        print(f"  Centroid: TL={tl:.1f}%, TR={tr:.1f}%, BL={bl:.1f}%, BR={br:.1f}%")
        print(f"  Summary: Top={top_tot:.1f}%, Bottom={bottom_tot:.1f}%, Left={left_tot:.1f}%, Right={right_tot:.1f}%")
        print(f"  Sample count: {results[chosen_k]['cluster_counts'][c_idx]}")

    # Add cluster assignment to dataframe
    df["kmeans_cluster"] = chosen_labels
    df["cluster_profile"] = df["kmeans_cluster"].map(lambda c: cluster_profiles[str(c)]["profile_name"])

    # Analyze category distribution within clusters
    print("\n--- Distribution Across Website Categories ---")
    cat_cross = pd.crosstab(df["category"], df["cluster_profile"])
    print(cat_cross)

    # Save model and artifacts
    model_path = MODELS_DIR / "kmeans_saliency_model.joblib"
    joblib.dump(chosen_kmeans, model_path)

    profiles_path = MODELS_DIR / "saliency_cluster_profiles.json"
    with open(profiles_path, "w", encoding="utf-8") as f:
        json.dump({
            "k": chosen_k,
            "silhouette_score": results[chosen_k]["silhouette"],
            "inertia": results[chosen_k]["inertia"],
            "feature_columns": FEATURE_COLS,
            "profiles": cluster_profiles,
            "selection_comparison": results
        }, f, indent=2)

    # Save labeled dataset
    clustered_csv_path = DATA_DIR / "saliency_clustered_dataset.csv"
    df.to_csv(clustered_csv_path, index=False)

    print(f"\nSaved trained model to: {model_path}")
    print(f"Saved cluster profiles metadata to: {profiles_path}")
    print(f"Saved clustered dataset to: {clustered_csv_path}")

    return chosen_kmeans, cluster_profiles

if __name__ == "__main__":
    evaluate_and_train()
