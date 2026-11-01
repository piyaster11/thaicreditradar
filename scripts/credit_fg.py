#!/usr/bin/env python3
"""Thai Corporate Credit Fear & Greed (0 = extreme fear / credit stress, 100 = greed / easy credit).
Free sources only, no API keys. Each component = percentile of today's reading vs its own ~3-year history.
If a source fails it is shown as n/a and the remaining components are re-weighted."""
import json, csv, io, statistics as st, urllib.request, datetime as dt, os
UA = {"User-Agent": "Mozilla/5.0 (credit-fg; github.com/piyaster11/thai-credit-trends)"}
BKK = dt.timezone(dt.timedelta(hours=7))
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read().decode()
def yahoo(sym, rng="5y"):
    j = json.loads(get(f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?range={rng}&interval=1d"))
    r = j["chart"]["result"][0]; c = r["indicators"]["quote"][0]["close"]
    return [(dt.datetime.fromtimestamp(t, BKK).date().isoformat(), v) for t, v in zip(r["timestamp"], c) if v is not None]
def fred(sid):
    rows = list(csv.reader(io.StringIO(get(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}"))))[1:]
    return [(d, float(v)) for d, v in rows if v not in (".", "")]
def pct(hist, x, higher_is_greed=True):
    p = 100.0 * sum(1 for h in hist if h <= x) / len(hist)
    return round(p if higher_is_greed else 100 - p, 1)
def ma_gap(s, n):  # % gap of each day vs its n-day MA
    v = [x[1] for x in s]; return [(s[i][0], (v[i] / st.mean(v[i-n+1:i+1]) - 1) * 100) for i in range(n-1, len(v))]
def chg(s, n, rel=True):
    v = [x[1] for x in s]; return [(s[i][0], ((v[i]/v[i-n]-1)*100) if rel else v[i]-v[i-n]) for i in range(n, len(v))]
def last3y(s, days=756): return s[-days:]
YL = lambda s: f"https://finance.yahoo.com/quote/{urllib.request.quote(s)}/history/"
comps = []
comps_src = {}
def add(cid, en, th, fn, src, weight=1.0):
    try:
        reading, unit, score, asof, note_en, note_th = fn()
        comps.append(dict(id=cid, en=en, th=th, value=reading, unit=unit, score=score, asof=asof, src=comps_src.get(cid, src), weight=weight, note_en=note_en, note_th=note_th, ok=True))
    except Exception as e:
        comps.append(dict(id=cid, en=en, th=th, value=None, unit="", score=None, asof=None, src=src, weight=weight, ok=False, err=str(e)[:160]))
        print("FAIL", cid, e)

def c_trends():
    d = json.load(open(os.path.join(os.path.dirname(__file__), "..", "data", "trends.json")))
    keys = ["restructure_th", "default_th", "bond_default_th", "bankrupt_th", "factory_close_th", "layoff_th"]
    ser = [d["items"][k]["series"][:-1] for k in keys if k in d["items"] and d["items"][k].get("series")]
    if not ser: raise RuntimeError("no trends series")
    n = min(len(s) for s in ser); ser = [s[-n:] for s in ser]
    # each word normalised to its own 5y mean, then averaged; 8-week avg vs history (weekly ~156 wks = 3y)
    comb = [st.mean(s[i][1] / (st.mean(x[1] for x in s) or 1) for s in ser) for i in range(n)]
    sm = [st.mean(comb[max(0, i-7):i+1]) for i in range(n)]
    h = sm[-156:]; x = sm[-1]
    return round(x*100), "% of 5y avg", pct(h, x, False), ser[0][-1][0], "Stress searches, 8-wk avg vs own 5-yr mean (higher = more stress)", "คำค้นความตึงตัว เฉลี่ย 8 สัปดาห์ เทียบค่าเฉลี่ย 5 ปี (สูง = ตึงตัวมาก)"
def c_set():
    lab_en, lab_th = "SET index", "ดัชนี SET"
    s = yahoo("^SET.BK")
    if len(s) < 400:  # Yahoo often returns only 1 point of ^SET.BK history; fall back to the SET50 ETF
        s = yahoo("TDEX.BK"); lab_en, lab_th = "SET50 ETF (TDEX, proxy: Yahoo ^SET.BK history unavailable)", "SET50 ETF (TDEX ใช้แทน เพราะ Yahoo ไม่มีประวัติ ^SET.BK)"
        comps_src["set"] = YL("TDEX.BK")
    g = last3y(ma_gap(s, 125)); x = g[-1][1]
    return round(x, 2), "% vs 125d MA", pct([v for _, v in g], x), g[-1][0], lab_en + " vs its 125-day average", lab_th + " เทียบค่าเฉลี่ย 125 วัน"
def c_banks():
    syms = ["KBANK.BK", "BBL.BK", "SCB.BK", "KTB.BK", "TTB.BK"]
    ss = []
    for s in syms:
        try: ss.append(dict(yahoo(s)))
        except Exception as e: print("bank fail", s, e)
    if len(ss) < 3: raise RuntimeError("too few bank series")
    dates = sorted(set.intersection(*[set(s) for s in ss]))
    idx = [(d, st.mean(s[d] / s[dates[0]] for s in ss)) for d in dates]
    m = last3y(chg(idx, 63)); x = m[-1][1]
    return round(x, 2), "% 3-month", pct([v for _, v in m], x), m[-1][0], f"Big-bank basket ({len(ss)} banks) 3-month return", f"ตะกร้าหุ้นธนาคารใหญ่ ({len(ss)} แห่ง) ผลตอบแทน 3 เดือน"
def c_bond():
    # OECD Thai 10y series (IRLTLT01THM156N) is no longer on FRED; no other key-free machine-readable source found
    s = fred("IRLTLT01THM156N"); c = chg(s, 6, rel=False)[-36:]; x = c[-1][1]
    return round(x, 2), "pp 6-month chg (10y yield " + f"{s[-1][1]:.2f}%)", pct([v for _, v in c], x, False), s[-1][0], "Thai 10-yr govt bond yield, 6-month change (OECD via FRED, monthly)", "อัตราผลตอบแทนพันธบัตรรัฐบาลไทย 10 ปี เปลี่ยนแปลง 6 เดือน (OECD ผ่าน FRED รายเดือน)"
def c_thb():
    s = yahoo("THB=X"); v = [x[1] for x in s]
    import math
    r = [math.log(v[i]/v[i-1]) for i in range(1, len(v))]
    vol = [(s[i+1][0], st.pstdev(r[i-20:i+1]) * math.sqrt(252) * 100) for i in range(20, len(r))]
    vol = last3y(vol); x = vol[-1][1]
    return round(x, 2), f"% ann. 21d vol (USD/THB {v[-1]:.2f})", pct([q for _, q in vol], x, False), vol[-1][0], "USD/THB 1-month volatility (higher = FX stress for borrowers)", "ความผันผวนค่าเงิน USD/THB 1 เดือน (สูง = ผู้กู้เสี่ยงค่าเงิน)"
def c_oil():
    s = last3y(yahoo("BZ=F")); x = s[-1][1]
    return round(x, 2), "USD/bbl", pct([v for _, v in s], x, False), s[-1][0], "Brent crude (higher = cost pressure on Thai corporates, a net oil importer)", "น้ำมันดิบเบรนท์ (สูง = ต้นทุนบริษัทไทยสูง ไทยนำเข้าน้ำมันสุทธิ)"
def c_hy():
    s = fred("BAMLH0A0HYM2"); s = last3y(s); x = s[-1][1]
    return round(x, 2), "% OAS", pct([v for _, v in s], x, False), s[-1][0], "US high-yield bond spread (global credit appetite)", "ส่วนต่างผลตอบแทนหุ้นกู้ High-yield สหรัฐฯ (ความกล้ารับความเสี่ยงเครดิตทั่วโลก)"
def c_vix():
    s = last3y(yahoo("^VIX")); x = s[-1][1]
    return round(x, 2), "index", pct([v for _, v in s], x, False), s[-1][0], "VIX — US stock-market fear gauge", "VIX — ดัชนีความกลัวตลาดหุ้นสหรัฐฯ"

add("trends", "Thai borrower-stress searches", "คำค้นลูกหนี้ตึงตัว", c_trends, "https://github.com/piyaster11/thai-credit-trends/blob/main/data/trends.json", 1.5)
add("set", "SET index momentum", "โมเมนตัมดัชนี SET", c_set, YL("^SET.BK"))
add("banks", "Thai bank stocks", "หุ้นธนาคารไทย", c_banks, YL("KBANK.BK"))
add("bond", "Thai 10-yr yield trend", "แนวโน้มบอนด์ยีลด์ไทย 10 ปี", c_bond, "https://www.thaibma.or.th/EN/Market/YieldCurve/Government.aspx")
add("thb", "Baht volatility", "ความผันผวนค่าเงินบาท", c_thb, YL("THB=X"))
add("oil", "Oil price pressure", "แรงกดดันราคาน้ำมัน", c_oil, YL("BZ=F"))
add("hy", "Global junk-bond spread", "ส่วนต่างหุ้นกู้ High-yield โลก", c_hy, "https://fred.stlouisfed.org/series/BAMLH0A0HYM2", 1.5)
add("vix", "Global fear (VIX)", "ความกลัวตลาดโลก (VIX)", c_vix, YL("^VIX"))
ok = [c for c in comps if c["ok"]]
if not ok: raise SystemExit("all sources failed")
tw = sum(c["weight"] for c in ok)
for c in ok: c["eff_weight"] = round(c["weight"] / tw * 100, 1)
score = round(sum(c["score"] * c["weight"] for c in ok) / tw, 1)
band = ("Extreme Fear" if score < 25 else "Fear" if score < 45 else "Neutral" if score <= 55 else "Greed" if score <= 75 else "Extreme Greed")
out = dict(score=score, band=band, updated=dt.datetime.now(BKK).isoformat(timespec="minutes"), n_ok=len(ok), n_total=len(comps), components=comps)
base = os.path.join(os.path.dirname(__file__), "..", "data")
json.dump(out, open(os.path.join(base, "credit_fg.json"), "w"), ensure_ascii=False, indent=1)
open(os.path.join(base, "credit_fg.js"), "w").write("window.CREDIT_FG=" + json.dumps(out, ensure_ascii=False) + ";\n")
print(score, band); [print(c["id"], c["value"], c.get("unit"), c["score"], c["asof"]) for c in comps]
