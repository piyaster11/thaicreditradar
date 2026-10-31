#!/usr/bin/env python3
"""Pull Google Trends (Thailand, last 5 years) for the Thai Corporate Credit Trends dashboard.
Public data only. Needs: pip install pytrends. Google rate-limits hard, so this goes slowly
(one request every ~45 s, backs off 5 min on a 429). Safe to re-run: keywords already
saved in data/trends.json are skipped unless --force is given.
Nothing is scheduled by this file. Run it by hand:  python3 pull_trends.py
Output: data/trends.json  (weekly values 0-100, each word scaled to ITS OWN 5-year peak)."""
import json, sys, time, datetime, pathlib
from pytrends.request import TrendReq

OUT = pathlib.Path(__file__).parent.parent / "data" / "trends.json"
GEO, TF = "TH", "today 5-y"
# (key, search word, plain-English group)
sys.path.insert(0, str(pathlib.Path(__file__).parent)); from terms import TERMS
def load():
    return json.loads(OUT.read_text()) if OUT.exists() else {"geo": GEO, "timeframe": TF, "items": {}}
def save(d):
    OUT.parent.mkdir(exist_ok=True); OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1))
def call(fn, tries=2):
    for i in range(tries):
        try:
            return fn()
        except Exception as e:
            print("  retry", i, repr(e)[:90], flush=True); time.sleep(int(__import__("os").environ.get("RETRY_WAIT", "300")))
    return None
def main(force=False):
    d = load(); fails = 0; maxf = int(__import__("os").environ.get("MAX_FAILS", "4"))
    for key, theme, word, lang, label, label_th in TERMS:
        if key in d["items"] and not force:
            continue
        print("pulling", key, word, flush=True)
        py = TrendReq(hl="th-TH", tz=-420, timeout=(10, 30))
        def f():
            py.build_payload([word], timeframe=TF, geo=GEO)
            return py.interest_over_time()
        df = call(f)
        if df is None:
            fails += 1
            if fails >= maxf: print("stopping: Google keeps refusing (429). Try again later."); break
        else: fails = 0
        if df is None or df.empty:
            print("  no data for", key)
            if df is not None: d.setdefault("empty", {})[key] = word; save(d)
            continue
        series = [[str(i.date()), int(v)] for i, v in df[word].items()]
        time.sleep(45)
        rel = call(lambda: py.related_queries())
        top, rising = [], []
        if rel and rel.get(word):
            t, r = rel[word].get("top"), rel[word].get("rising")
            if t is not None: top = [[a, int(b)] for a, b in t.head(8).values.tolist()]
            if r is not None: rising = [[a, int(b)] for a, b in r.head(8).values.tolist()]
        d["items"][key] = {"retrieved": datetime.datetime.now().astimezone().isoformat(timespec="minutes"), "word": word, "label": label, "label_th": label_th, "theme": theme, "lang": lang, "series": series, "top": top, "rising": rising}
        d["retrieved"] = datetime.datetime.now().astimezone().isoformat(timespec="minutes")
        d["source"] = "Google Trends via pytrends; geo=TH; " + TF
        save(d); time.sleep(45)
    print("done", len(d["items"]), "of", len(TERMS))
if __name__ == "__main__":
    main("--force" in sys.argv)
