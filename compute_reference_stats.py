"""
compute_reference_stats.py
--------------------------
Calculates category-specific reference statistics (Education vs. Product)
from the 105-screenshot dataset, including mean, median, IQR, and cluster distributions.
Saves results to data/category_reference_stats.json.
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path

DATA_PATH = Path("data/saliency_clustered_dataset.csv")
OUT_JSON = Path("data/category_reference_stats.json")

def compute_and_save():
    df = pd.read_csv(DATA_PATH)
    
    stats = {
        "dataset_summary": {
            "total_screenshots": len(df),
            "education_count": int((df["category"] == "Education").sum()),
            "product_count": int((df["category"] == "Product").sum()),
        },
        "categories": {}
    }

    metrics = [
        "pct_top_left", "pct_top_right", "pct_bottom_left", "pct_bottom_right",
        "pct_top", "pct_bottom", "pct_left", "pct_right", "saliency_concentration_gini"
    ]

    for cat in ["Education", "Product"]:
        cat_df = df[df["category"] == cat]
        
        cat_stats = {
            "count": len(cat_df),
            "means": {m: round(float(cat_df[m].mean()), 2) for m in metrics},
            "medians": {m: round(float(cat_df[m].median()), 2) for m in metrics},
            "stds": {m: round(float(cat_df[m].std()), 2) for m in metrics},
            "q25": {m: round(float(cat_df[m].quantile(0.25)), 2) for m in metrics},
            "q75": {m: round(float(cat_df[m].quantile(0.75)), 2) for m in metrics},
            "dominant_quadrant_distribution": cat_df["dominant_quadrant"].value_counts().to_dict(),
            "cluster_profile_distribution": cat_df["cluster_profile"].value_counts().to_dict()
        }
        stats["categories"][cat] = cat_stats

    # Overall dataset baseline
    stats["categories"]["Overall"] = {
        "count": len(df),
        "means": {m: round(float(df[m].mean()), 2) for m in metrics},
        "medians": {m: round(float(df[m].median()), 2) for m in metrics},
        "stds": {m: round(float(df[m].std()), 2) for m in metrics},
        "dominant_quadrant_distribution": df["dominant_quadrant"].value_counts().to_dict(),
        "cluster_profile_distribution": df["cluster_profile"].value_counts().to_dict()
    }

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print(f"Reference statistics successfully saved to: {OUT_JSON}")
    print("\n--- Summary of Category Means ---")
    for cat in ["Education", "Product"]:
        m = stats["categories"][cat]["means"]
        print(f"\n{cat} Websites (N={stats['categories'][cat]['count']}):")
        print(f"  Top-Left: {m['pct_top_left']}%, Top-Right: {m['pct_top_right']}%  (Top Total: {m['pct_top']}%)")
        print(f"  Bottom-Left: {m['pct_bottom_left']}%, Bottom-Right: {m['pct_bottom_right']}%  (Bottom Total: {m['pct_bottom']}%)")
        print(f"  Left Total: {m['pct_left']}%, Right Total: {m['pct_right']}%")
        print(f"  Mean Saliency Gini: {m['saliency_concentration_gini']}")

    return stats

if __name__ == "__main__":
    compute_and_save()
