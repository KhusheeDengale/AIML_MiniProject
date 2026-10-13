"""
infer_saliency.py
------------------
End-to-End Inference for New Website Screenshots.
Executes:
  Screenshot -> OpenCV Saliency -> 2x2 Feature Extraction -> Trained K-Means -> Saliency Profile -> Evidence-Based Recommendations

Can be run via command line:
  python infer_saliency.py <path_to_screenshot> [--category Product|Education]
or imported:
  from infer_saliency import analyze_screenshot
"""

import sys
import json
import joblib
import cv2
import numpy as np
from pathlib import Path
from extract_regional_features import extract_2x2_features

MODELS_DIR = Path("models")
DATA_DIR = Path("data")
OUT_DIR = Path("output_inference")
OUT_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODELS_DIR / "kmeans_saliency_model.joblib"
PROFILES_PATH = MODELS_DIR / "saliency_cluster_profiles.json"
STATS_PATH = DATA_DIR / "category_reference_stats.json"

# Load model and metadata lazily/globally
_kmeans_model = None
_cluster_profiles = None
_reference_stats = None

def _load_resources():
    global _kmeans_model, _cluster_profiles, _reference_stats
    if _kmeans_model is None:
        if not MODEL_PATH.exists() or not PROFILES_PATH.exists():
            raise FileNotFoundError("Trained K-Means model or profiles not found. Run train_kmeans_saliency.py first.")
        _kmeans_model = joblib.load(MODEL_PATH)
        with open(PROFILES_PATH, "r", encoding="utf-8") as f:
            _cluster_profiles = json.load(f)["profiles"]
        if STATS_PATH.exists():
            with open(STATS_PATH, "r", encoding="utf-8") as f:
                _reference_stats = json.load(f)

def generate_recommendations(features, cluster_info, ref_comparison=None, category=None):
    """
    Produce transparent, evidence-based recommendations tied directly to measured metrics.
    """
    recs = []
    tl = features["pct_top_left"]
    tr = features["pct_top_right"]
    bl = features["pct_bottom_left"]
    br = features["pct_bottom_right"]
    top_tot = features["pct_top"]
    bottom_tot = features["pct_bottom"]
    left_tot = features["pct_left"]
    right_tot = features["pct_right"]
    gini = features["saliency_concentration_gini"]
    dom = features["dominant_quadrant"]

    # 1. Top vs. Bottom Balance Observation
    if top_tot >= 55.0:
        recs.append({
            "aspect": "Vertical Visual Hierarchy",
            "observation": f"Upper viewport concentrates majority of visual prominence ({top_tot:.1f}% top vs {bottom_tot:.1f}% bottom).",
            "suggestion": "Header, branding, or hero banner anchors initial user attention. Ensure critical secondary calls-to-action or educational details lower on the page receive sufficient contrast to sustain engagement.",
            "severity": "Informative"
        })
    elif bottom_tot >= 55.0:
        recs.append({
            "aspect": "Vertical Visual Hierarchy",
            "observation": f"Lower viewport attracts majority of attention ({bottom_tot:.1f}% bottom vs {top_tot:.1f}% top).",
            "suggestion": "Heavy visual weight in cards, grids, or product images below the header. Ensure header navigation and main value proposition are not overshadowed by lower visual elements.",
            "severity": "Attention"
        })

    # 2. Horizontal (Left vs Right) Asymmetry
    if left_tot >= 55.0:
        recs.append({
            "aspect": "Horizontal Layout Balance",
            "observation": f"Left-side visual mass is high ({left_tot:.1f}% left vs {right_tot:.1f}% right).",
            "suggestion": "Aligns with natural Western F-pattern reading habits. If key conversion elements (e.g., admissions/cart button) reside on the right, increase their visual saliency through color contrast or whitespace.",
            "severity": "Opportunity"
        })
    elif right_tot >= 55.0:
        recs.append({
            "aspect": "Horizontal Layout Balance",
            "observation": f"Right-side visual elements strongly attract computational attention ({right_tot:.1f}% right vs {left_tot:.1f}% left).",
            "suggestion": "Right-hand hero image or floating action card dominates. Ensure the primary brand heading or text hierarchy on the left remains readable and visually anchored.",
            "severity": "Opportunity"
        })

    # Fallback if balanced
    if len(recs) == 0:
        recs.append({
            "aspect": "Overall Visual Balance",
            "observation": f"Spatial saliency is evenly distributed across quadrants (Top: {top_tot:.1f}%, Bottom: {bottom_tot:.1f}%, Left: {left_tot:.1f}%, Right: {right_tot:.1f}%).",
            "suggestion": "Visual weight is well-apportioned without excessive crowding in any single quadrant. Maintain this balance while verifying that primary interactive targets retain subtle visual emphasis.",
            "severity": "Positive"
        })

    # 3. Quadrant Dominance
    if features[f"pct_{dom}"] > 40.0:
        readable_dom = dom.replace("_", " ").title()
        recs.append({
            "aspect": "Focal Concentration",
            "observation": f"The {readable_dom} quadrant alone captures {features[f'pct_{dom}']:.1f}% of total spatial saliency.",
            "suggestion": f"A single focal region strongly anchors the page. Ensure this aligns with your intentional user journey (e.g. key product showcase) rather than unintentional clutter.",
            "severity": "Informative"
        })

    # 4. Attention Dispersion (Gini)
    if gini < 0.35:
        recs.append({
            "aspect": "Visual Focus & Clutter",
            "observation": f"Saliency concentration is low (Gini = {gini:.3f}), indicating widely dispersed visual attention.",
            "suggestion": "Multiple visual elements are competing evenly for attention. Consider strengthening visual hierarchy to guide user gaze progressively rather than presenting competing stimuli.",
            "severity": "Attention"
        })
    elif gini > 0.65:
        recs.append({
            "aspect": "Visual Focus & Clutter",
            "observation": f"Saliency is highly focused (Gini = {gini:.3f}), indicating a sharp, singular visual attractor.",
            "suggestion": "Strong, singular focal point detected. Confirm that essential secondary context (pricing, credentials, navigation) is noticed alongside this dominant attractor.",
            "severity": "Positive"
        })

    # 5. Category-Specific Benchmark Insights
    if ref_comparison and category:
        top_diff = ref_comparison.get("pct_top_diff", 0)
        if abs(top_diff) >= 12.0:
            direction = "higher" if top_diff > 0 else "lower"
            recs.append({
                "aspect": f"{category} Category Benchmark",
                "observation": f"Top-region attention is {abs(top_diff):.1f}% {direction} than the {category} website average.",
                "suggestion": f"Review whether this intentional divergence from standard {category.lower()} layout conventions serves your specific business or educational goal.",
                "severity": "Benchmark"
            })

    return recs

def analyze_screenshot(image_path, category=None, save_outputs=True):
    """
    Run full end-to-end inference on a single screenshot path.
    """
    _load_resources()
    path = Path(image_path)
    if not path.is_file():
        raise FileNotFoundError(f"Screenshot file does not exist: {path}")

    # 1. Load image
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError(f"OpenCV could not decode image: {path}")
    h, w = img.shape[:2]

    # 2. Compute Spectral Residual Saliency
    sal = cv2.saliency.StaticSaliencySpectralResidual_create()
    ok, smap = sal.computeSaliency(img)
    if not ok:
        raise RuntimeError("Failed to compute Spectral Residual saliency.")

    smap = smap.astype(np.float32)

    # 3. Saliency postprocessing (matching teammate's normalization)
    smap_blur = cv2.GaussianBlur(smap, (0, 0), sigmaX=8)
    smap_blur -= smap_blur.min()
    if smap_blur.max() > 0:
        smap_blur /= smap_blur.max()
    gray = (smap_blur * 255).astype(np.uint8)
    heat = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.5, heat, 0.5, 0)

    # Save visual outputs
    stem = path.stem
    map_out_path = OUT_DIR / f"{stem}_saliency_map.png"
    heat_out_path = OUT_DIR / f"{stem}_heatmap.png"
    overlay_out_path = OUT_DIR / f"{stem}_overlay.png"

    if save_outputs:
        cv2.imwrite(str(map_out_path), gray)
        cv2.imwrite(str(heat_out_path), heat)
        cv2.imwrite(str(overlay_out_path), overlay)

    # 4. 2x2 Regional Feature Extraction
    features = extract_2x2_features(smap)

    # 5. K-Means Profile Prediction
    feat_vector = np.array([[
        features["pct_top_left"],
        features["pct_top_right"],
        features["pct_bottom_left"],
        features["pct_bottom_right"]
    ]])
    cluster_id = int(_kmeans_model.predict(feat_vector)[0])
    profile_info = _cluster_profiles[str(cluster_id)]
    centroid = np.array(list(profile_info["centroid_percentages"].values()))
    distance_to_centroid = float(np.linalg.norm(feat_vector[0] - centroid))

    # 6. Reference Category Comparison
    ref_comparison = None
    if _reference_stats:
        cat_key = category if category in ["Education", "Product"] else "Overall"
        ref_means = _reference_stats["categories"][cat_key]["means"]
        ref_comparison = {
            "reference_group": cat_key,
            "pct_top_left_diff": round(features["pct_top_left"] - ref_means["pct_top_left"], 2),
            "pct_top_right_diff": round(features["pct_top_right"] - ref_means["pct_top_right"], 2),
            "pct_bottom_left_diff": round(features["pct_bottom_left"] - ref_means["pct_bottom_left"], 2),
            "pct_bottom_right_diff": round(features["pct_bottom_right"] - ref_means["pct_bottom_right"], 2),
            "pct_top_diff": round(features["pct_top"] - ref_means["pct_top"], 2),
            "pct_left_diff": round(features["pct_left"] - ref_means["pct_left"], 2),
            "gini_diff": round(features["saliency_concentration_gini"] - ref_means["saliency_concentration_gini"], 3),
            "reference_cluster_distribution": _reference_stats["categories"][cat_key]["cluster_profile_distribution"]
        }

    # 7. Generate Actionable Design Recommendations
    recommendations = generate_recommendations(features, profile_info, ref_comparison, category)

    result = {
        "screenshot_name": path.name,
        "image_dimensions": {"width": w, "height": h},
        "category_context": category or "Not Specified",
        "regional_percentages": {
            "top_left": features["pct_top_left"],
            "top_right": features["pct_top_right"],
            "bottom_left": features["pct_bottom_left"],
            "bottom_right": features["pct_bottom_right"],
            "top_total": features["pct_top"],
            "bottom_total": features["pct_bottom"],
            "left_total": features["pct_left"],
            "right_total": features["pct_right"]
        },
        "dominant_quadrant": features["dominant_quadrant"],
        "saliency_concentration_gini": features["saliency_concentration_gini"],
        "kmeans_analysis": {
            "cluster_id": cluster_id,
            "profile_name": profile_info["profile_name"],
            "distance_to_cluster_centroid": round(distance_to_centroid, 2),
            "cluster_centroid_percentages": profile_info["centroid_percentages"]
        },
        "reference_comparison": ref_comparison,
        "recommendations": recommendations,
        "output_files": {
            "saliency_map": str(map_out_path),
            "colored_heatmap": str(heat_out_path),
            "overlay_image": str(overlay_out_path)
        }
    }

    return result

def print_analysis_report(result):
    """Format and print an executive visual saliency report."""
    print("\n" + "=" * 65)
    print(f"UI INSIGHT -- VISUAL SALIENCY ANALYSIS REPORT")
    print(f"Screenshot: {result['screenshot_name']} ({result['image_dimensions']['width']}x{result['image_dimensions']['height']})")
    print(f"Category Context: {result['category_context']}")
    print("=" * 65)

    r = result["regional_percentages"]
    print("\n[1] 2x2 Spatial Saliency Distribution:")
    print("  +-----------------------+-----------------------+")
    print(f"  | Top-Left:  {r['top_left']:>5.1f}%     | Top-Right: {r['top_right']:>5.1f}%     |  --> Top: {r['top_total']:.1f}%")
    print("  +-----------------------+-----------------------+")
    print(f"  | Btm-Left:  {r['bottom_left']:>5.1f}%     | Btm-Right: {r['bottom_right']:>5.1f}%     |  --> Bottom: {r['bottom_total']:.1f}%")
    print("  +-----------------------+-----------------------+")
    print(f"     Left: {r['left'] if 'left' in r else r['left_total']:.1f}%               Right: {r['right'] if 'right' in r else r['right_total']:.1f}%")
    print(f"  Dominant Quadrant: {result['dominant_quadrant'].replace('_', ' ').title()}")
    print(f"  Concentration (Gini): {result['saliency_concentration_gini']:.3f} (0=uniform, 1=sharp focus)")

    km = result["kmeans_analysis"]
    print(f"\n[2] Machine Learning Pattern Classification (K-Means):")
    print(f"  Assigned Cluster: Cluster {km['cluster_id']}")
    print(f"  Learned Profile:  {km['profile_name']}")
    print(f"  Centroid Dist:    {km['distance_to_cluster_centroid']:.2f}")

    ref = result["reference_comparison"]
    if ref:
        print(f"\n[3] Category Reference Comparison ({ref['reference_group']} Baseline):")
        print(f"  Top Deviation:    {ref['pct_top_diff']:+5.1f}% relative to category mean")
        print(f"  Left Deviation:   {ref['pct_left_diff']:+5.1f}% relative to category mean")
        print(f"  Gini Deviation:   {ref['gini_diff']:+5.3f}")

    print(f"\n[4] Evidence-Based Design Recommendations:")
    for idx, rec in enumerate(result["recommendations"], 1):
        print(f"  {idx}. [{rec['severity']}] {rec['aspect']}")
        print(f"     Observation: {rec['observation']}")
        print(f"     Guidance:    {rec['suggestion']}\n")

    print(f"[5] Generated Output Artifacts:")
    for k, v in result["output_files"].items():
        print(f"  - {k}: {v}")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python infer_saliency.py <screenshot_path> [--category Product|Education]")
        # Demo run on one real image if no arg passed
        demo_img = "images/ProductDataset/Screenshot 2026-10-12 203644.png"
        print(f"\nNo screenshot provided. Running demo on: {demo_img} (Category: Product)")
        res = analyze_screenshot(demo_img, category="Product")
        print_analysis_report(res)
    else:
        img_path = sys.argv[1]
        cat = None
        if len(sys.argv) >= 4 and sys.argv[2] == "--category":
            cat = sys.argv[3]
        res = analyze_screenshot(img_path, category=cat)
        print_analysis_report(res)
