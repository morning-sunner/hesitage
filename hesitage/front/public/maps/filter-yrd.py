import json
from pathlib import Path

def main():
    src = Path("china.geojson")
    dst = Path("china-yrd.geojson")
    prefixes = ("31", "32", "33", "34")

    data = json.loads(src.read_text(encoding="utf-8"))
    feats = data.get("features", [])
    kept = [f for f in feats if str(f.get("properties", {}).get("adcode", "")).startswith(prefixes)]

    out = {**data, "features": kept}
    dst.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print(f"Kept {len(kept)} / {len(feats)} features -> {dst}")

if __name__ == "__main__":
    main()