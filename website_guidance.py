
import cv2
import numpy as np
from pathlib import Path
from datetime import datetime

BASE = Path("output_opencv")
REPORTS = Path("reports")
REPORTS.mkdir(exist_ok=True)

CATEGORIES = {
    "1": ("Product", BASE / "ProductDataset_aggregate_heatmap.png"),
    "2": ("Education", BASE / "eduDataset_aggregate_heatmap.png"),
}

def read_gray(path):
    img = cv2.imread(str(path))
    if img is None:
        raise FileNotFoundError(f"Cannot read: {path}")
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def regions(gray):
    h, w = gray.shape
    parts = {
        "top-left": gray[:h//2, :w//2],
        "top-right": gray[:h//2, w//2:],
        "bottom-left": gray[h//2:, :w//2],
        "bottom-right": gray[h//2:, w//2:],
    }
    return {name: float(np.mean(part)) for name, part in parts.items()}

def save_report(title, lines):
    path = REPORTS / (
        datetime.now().strftime("%Y%m%d_%H%M%S") + "_report.txt"
    )
    path.write_text(title + "\n\n" + "\n".join(lines), encoding="utf-8")
    print("\n" + "=" * 55)
    print(title)
    print("=" * 55)
    print("\n".join(lines))
    print(f"\nReport saved to: {path}")

def choose_category():
    print("\nChoose website category:")
    print("1. Product")
    print("2. Education")
    choice = input("Enter 1 or 2: ").strip()
    if choice not in CATEGORIES:
        print("Invalid category.")
        return None
    name, path = CATEGORIES[choice]
    if not path.exists():
        print(f"Aggregate heatmap not found: {path}")
        print("Check the filename in output_opencv.")
        return None
    return name, path

def new_website_report():
    chosen = choose_category()
    if not chosen:
        return

    category, path = chosen
    gray = read_gray(path)
    scores = regions(gray)
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)

    lines = [
        f"Selected category: {category}",
        "",
        "Relative saliency by image quadrant (0-255):",
    ]

    for region, score in ranked:
        lines.append(f"- {region}: {score:.1f}")

    lines += [
        "",
        "Design guidance:",
        f"- Review the {ranked[0][0]} region for prominent visual content.",
        "- Place essential content according to the intended user journey, "
        "not saliency alone.",
        "- Use clear contrast, spacing, and visual hierarchy for primary actions.",
        "- Avoid placing essential information in low-saliency regions without "
        "sufficient visual emphasis.",
        "",
        "Interpretation:",
        "This guidance uses the selected category's aggregate computational "
        "saliency map. It is a reference, not a guarantee of human gaze."
    ]

    save_report(f"{category} Website Design Guidance", lines)

def existing_website_report():
    chosen = choose_category()
    if not chosen:
        return

    category, reference_path = chosen
    screenshot_path = Path(input(
        "Enter website screenshot path: "
    ).strip().strip('"'))

    if not screenshot_path.is_file():
        print("Screenshot file not found.")
        return

    image = cv2.imread(str(screenshot_path))
    if image is None:
        print("Cannot read screenshot.")
        return

    sal = cv2.saliency.StaticSaliencySpectralResidual_create()
    ok, smap = sal.computeSaliency(image)

    if not ok:
        print("Could not compute screenshot saliency.")
        return

    # Compare at a shared resolution.
    ref = read_gray(reference_path)
    size = (ref.shape[1], ref.shape[0])
    site = cv2.resize(smap, size)

    # Normalize each map for spatial pattern comparison.
    def normalize(arr):
        arr = arr.astype(np.float32)
        arr -= arr.min()
        if arr.max() > 0:
            arr /= arr.max()
        return arr

    ref_norm = normalize(ref)
    site_norm = normalize(site)

    diff = np.abs(ref_norm - site_norm)
    similarity = 1.0 - float(np.mean(diff))

    # Save the website's saliency visualization.
    out = BASE / "website_analysis"
    out.mkdir(exist_ok=True)
    stem = screenshot_path.stem
    cv2.imwrite(str(out / f"{stem}_saliency.png"),
                (site_norm * 255).astype(np.uint8))
    cv2.imwrite(str(out / f"{stem}_comparison.png"),
                (diff * 255).astype(np.uint8))

    site_regions = regions((site_norm * 255).astype(np.uint8))
    ref_regions = regions((ref_norm * 255).astype(np.uint8))

    lines = [
        f"Selected reference category: {category}",
        f"Website screenshot: {screenshot_path.name}",
        f"Mean absolute saliency difference: {np.mean(diff):.3f}",
        f"Pattern similarity indicator: {similarity * 100:.1f}%",
        "",
        "Regional comparison (normalized mean saliency):",
    ]

    for region in site_regions:
        delta = site_regions[region] - ref_regions[region]
        lines.append(
            f"- {region}: website {site_regions[region]:.1f}, "
            f"reference {ref_regions[region]:.1f}, difference {delta:+.1f}"
        )

    lines += [
        "",
        "Recommendations:",
        "- Review the placement and visual emphasis of primary actions.",
        "- Check whether headings, navigation, and key content are easy to "
        "distinguish.",
        "- If important elements lie in visually quiet areas, consider "
        "improving contrast or spacing.",
        "- Interpret regional differences alongside the actual page layout "
        "and purpose.",
        "",
        "Interpretation:",
        "The similarity indicator measures pixelwise similarity between "
        "normalized saliency patterns. It is not a percentage of usability, "
        "design quality, or human-attention accuracy."
    ]

    save_report(f"{category} Existing Website Evaluation", lines)

def main():
    while True:
        print("\n=== Website Saliency Guidance System ===")
        print("1. New website design guidance")
        print("2. Evaluate an existing website")
        print("3. Exit")
        choice = input("Select option: ").strip()

        try:
            if choice == "1":
                new_website_report()
            elif choice == "2":
                existing_website_report()
            elif choice == "3":
                break
            else:
                print("Invalid choice.")
        except Exception as exc:
            print(f"Error: {exc}")

if __name__ == "__main__":
    main()
