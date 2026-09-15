import os
from pathlib import Path
from rembg import remove
from PIL import Image

SRC = Path("public/images")
OUT = Path("public/images/nobg")
OUT.mkdir(parents=True, exist_ok=True)

EXTS = {".webp", ".png", ".jpg", ".jpeg"}
SKIP = {"gamers-end-logo.png", "provided-logo.png", "gamecraft-logo.webp", "product-sheet.png", "design-reference.png"}

images = [f for f in SRC.iterdir() if f.suffix.lower() in EXTS and f.name not in SKIP]
print(f"Processing {len(images)} images...")

for img_path in sorted(images):
    out_name = img_path.stem + ".png"
    out_path = OUT / out_name
    print(f"  {img_path.name} -> {out_name}", end=" ... ", flush=True)
    try:
        inp = Image.open(img_path)
        result = remove(inp)
        result.save(out_path, "PNG")
        print("done")
    except Exception as e:
        print(f"FAILED: {e}")

print("All done!")
