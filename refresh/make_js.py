#!/usr/bin/env python3
"""Write data/trends.js (window.TRENDS) from data/trends.json + refresh/terms.py, so index.html also works opened from disk."""
import json, pathlib, sys
R = pathlib.Path(__file__).parent; sys.path.insert(0, str(R)); from terms import TERMS
src = R.parent / "data" / "trends.json"
d = json.loads(src.read_text()) if src.exists() else {"items": {}}
d["terms"] = [list(t) for t in TERMS]
(R.parent / "data" / "trends.js").write_text("window.TRENDS=" + json.dumps(d, ensure_ascii=False) + ";\n")
print("items", len(d["items"]), "of", len(TERMS))
