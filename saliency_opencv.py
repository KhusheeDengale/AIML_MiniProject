import cv2
import numpy as np
from pathlib import Path

IN_DIR = Path("images")
OUT_DIR = Path("output_opencv")
(OUT_DIR / "maps").mkdir(parents=True, exist_ok=True)
(OUT_DIR / "heatmaps").mkdir(exist_ok=True)
(OUT_DIR / "overlays").mkdir(exist_ok=True)

EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}

# Spectral Residual is fast and works well on screenshots/UI.
# Swap for cv2.saliency.StaticSaliencyFineGrained_create() to compare.
sal = cv2.saliency.StaticSaliencySpectralResidual_create()

def normalize(m):
    m = m.astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), sigmaX=8)
    m -= m.min()
    if m.max() > 0:
        m /= m.max()
    return (m * 255).astype(np.uint8)

files = sorted(p for p in IN_DIR.rglob("*") if p.is_file() and p.suffix.lower() in EXTS)
print(f"Found {len(files)} images")

for i, path in enumerate(files, 1):
    img = cv2.imread(str(path))
    if img is None:
        print(f"[skip] could not read {path.name}")
        continue

    ok, smap = sal.computeSaliency(img)
    if not ok:
        print(f"[fail] {path.name}")
        continue

    gray = normalize(smap)
    heat = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.5, heat, 0.5, 0)

    stem = path.stem
    cv2.imwrite(str(OUT_DIR / "maps" / f"{stem}.png"), gray)
    cv2.imwrite(str(OUT_DIR / "heatmaps" / f"{stem}.png"), heat)
    cv2.imwrite(str(OUT_DIR / "overlays" / f"{stem}.png"), overlay)
    print(f"[{i}/{len(files)}] {path.name}")

print("Done.")
