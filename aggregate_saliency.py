
import cv2
import numpy as np
from pathlib import Path

BASE = Path("images")
OUT = Path("output_opencv")
EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}
SIZE = (256, 256)

def aggregate(folder):
    maps = []

    files = sorted(
        p for p in folder.rglob("*")
        if p.is_file() and p.suffix.lower() in EXTS
    )

    for path in files:
        img = cv2.imread(str(path))
        if img is None:
            continue

        sal = cv2.saliency.StaticSaliencySpectralResidual_create()
        ok, smap = sal.computeSaliency(img)

        if ok:
            smap = cv2.resize(smap, SIZE)
            maps.append(smap.astype(np.float32))

    if not maps:
        print(f"No valid maps: {folder}")
        return None

    # Average the normalized saliency maps
    avg = np.mean(maps, axis=0)
    avg -= avg.min()

    if avg.max() > 0:
        avg /= avg.max()

    gray = (avg * 255).astype(np.uint8)
    heat = cv2.applyColorMap(gray, cv2.COLORMAP_JET)

    return gray, heat, len(maps)

OUT.mkdir(exist_ok=True)

results = {}

for name in ["ProductDataset", "eduDataset"]:
    result = aggregate(BASE / name)

    if result is not None:
        gray, heat, count = result
        cv2.imwrite(str(OUT / f"{name}_aggregate_gray.png"), gray)
        cv2.imwrite(str(OUT / f"{name}_aggregate_heatmap.png"), heat)
        results[name] = (gray.astype(np.float32) / 255, count)
        print(f"{name}: aggregated {count} images")

if len(results) == 2:
    combined = np.mean([v[0] for v in results.values()], axis=0)
    combined -= combined.min()

    if combined.max() > 0:
        combined /= combined.max()

    gray = (combined * 255).astype(np.uint8)
    heat = cv2.applyColorMap(gray, cv2.COLORMAP_JET)

    cv2.imwrite(str(OUT / "FINAL_combined_saliency.png"), heat)
    cv2.imwrite(str(OUT / "FINAL_combined_gray.png"), gray)

    print("Created final combined heatmap.")
