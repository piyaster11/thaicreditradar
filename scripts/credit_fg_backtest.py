#!/usr/bin/env python3
"""Backtest of the Credit Fear & Greed gauge (same scoring as credit_fg.py: each component =
percentile vs its own trailing ~3y (756 obs) history, expanding window when history is shorter,
min 250 obs). Free data only. Weekly (Friday) sampling. Google Trends component is EXCLUDED from the
backtest (trends.json only covers ~5y and Google re-scales the whole window, so past readings are not
point-in-time); Thai 10y yield excluded (no free source), same as live. Also compares with FRED STLFSI4
and runs weight sensitivity on today's live components."""
import json, os, math, bisect, statistics as st, datetime as dt, csv, io, urllib.request
UA={"User-Agent":"Mozilla/5.0 (credit-fg-backtest)"}
BKK=dt.timezone(dt.timedelta(hours=7))
def get(u):
    for i in range(4):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=90).read().decode()
        except Exception as e: err=e
    raise err
def yahoo(sym):
    j=json.loads(get(f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?period1=1356998400&period2=9999999999&interval=1d"))
    r=j["chart"]["result"][0]; c=r["indicators"]["quote"][0]["close"]
    return [(dt.datetime.fromtimestamp(t,BKK).date().isoformat(),v) for t,v in zip(r["timestamp"],c) if v is not None]
def fred(sid):
    import subprocess
    txt=subprocess.run(["curl","-s","-m","120","--retry","3",f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}"],capture_output=True,text=True).stdout
    rows=list(csv.reader(io.StringIO(txt)))[1:]
    return [(d,float(v)) for d,v in rows if v not in (".","")]
def ma_gap(s,n):
    v=[x[1] for x in s]; out=[]; run=sum(v[:n-1])
    for i in range(n-1,len(v)):
        run+=v[i]; out.append((s[i][0],(v[i]/(run/n)-1)*100)); run-=v[i-n+1]
    return out
def chg(s,n): return [(s[i][0],(s[i][1]/s[i-n][1]-1)*100) for i in range(n,len(s))]
def rolling_pct(s,greed=True,win=756,minobs=250):
    out={}; v=[x[1] for x in s]
    for i in range(len(v)):
        if i+1<minobs: continue
        h=sorted(v[max(0,i-win+1):i+1]); p=100*bisect.bisect_right(h,v[i])/len(h)
        out[s[i][0]]=p if greed else 100-p
    return out
comp={}
tdex=yahoo("TDEX.BK"); comp["set"]=(rolling_pct(ma_gap(tdex,125)),1.0)
ss=[dict(yahoo(s)) for s in ["KBANK.BK","BBL.BK","SCB.BK","KTB.BK","TTB.BK"]]
ss=[s for s in ss if len(s)>1500]
dates=sorted(set.intersection(*[set(s) for s in ss]))
idx=[(d,st.mean(s[d]/s[dates[0]] for s in ss)) for d in dates]; comp["banks"]=(rolling_pct(chg(idx,63)),1.0)
th=yahoo("THB=X"); v=[x[1] for x in th]; r=[math.log(v[i]/v[i-1]) for i in range(1,len(v))]
vol=[(th[i+1][0],st.pstdev(r[i-20:i+1])*math.sqrt(252)*100) for i in range(20,len(r))]
comp["thb"]=(rolling_pct(vol,False),1.0)
comp["oil"]=(rolling_pct(yahoo("BZ=F"),False),1.0)
comp["hy"]=(rolling_pct(fred("BAMLH0A0HYM2"),False),1.5)
comp["vix"]=(rolling_pct(yahoo("^VIX"),False),1.0)
def asof(m,d):
    ks=sorted(m); 
    return ks, m
cache={k:(sorted(m),m,w) for k,(m,w) in comp.items()}
def val(k,d):
    ks,m,w=cache[k]; i=bisect.bisect_right(ks,d)-1
    if i<0: return None
    if (dt.date.fromisoformat(d)-dt.date.fromisoformat(ks[i])).days>10: return None
    return m[ks[i]]
start=dt.date(2019,1,4); end=dt.date.today(); series=[]
d=start
while d<=end:
    ds=d.isoformat(); parts={k:val(k,ds) for k in comp}; ok={k:x for k,x in parts.items() if x is not None}
    if len(ok)>=4:
        tw=sum(comp[k][1] for k in ok); sc=sum(ok[k]*comp[k][1] for k in ok)/tw
        series.append(dict(d=ds,s=round(sc,1),n=len(ok),c={k:round(x) for k,x in ok.items()}))
    d+=dt.timedelta(days=7)
band=lambda x:"Extreme Fear" if x<25 else "Fear" if x<45 else "Neutral" if x<=55 else "Greed" if x<=75 else "Extreme Greed"
events=[
 dict(id="covid",en="COVID-19 market crash",th="วิกฤตโควิด-19 ตลาดร่วง",start="2020-02-20",end="2020-04-30",src="https://www.reuters.com/article/us-thailand-stocks-idUSKBN2160AZ"),
 dict(id="stark",en="STARK Corporation default & accounting fraud",th="STARK ผิดนัดชำระหุ้นกู้และตกแต่งบัญชี",start="2023-05-01",end="2023-07-31",src=""),
 dict(id="jkn",en="JKN Global Group bond default / rehabilitation",th="JKN ผิดนัดชำระหุ้นกู้/ฟื้นฟูกิจการ",start="2023-10-01",end="2023-12-31",src=""),
]
EV=json.load(open(os.path.join(os.path.dirname(__file__),"events.json"))) if os.path.exists(os.path.join(os.path.dirname(__file__),"events.json")) else events
for e in EV:
    w=[p["s"] for p in series if e["start"]<=p["d"]<=e["end"]]
    e["min"]=round(min(w),1) if w else None; e["avg"]=round(st.mean(w),1) if w else None
    e["min_band"]=band(min(w)) if w else None; e["avg_band"]=band(st.mean(w)) if w else None
    e["weeks_fear"]=sum(1 for x in w if x<45); e["weeks"]=len(w)
# STLFSI4 comparison (weekly, dated Fridays)
fs=fred("STLFSI4"); fsm=dict(fs); g={p["d"]:p["s"] for p in series}
pairs=[]
for d0,x in fs:
    dd=dt.date.fromisoformat(d0)
    for k in range(0,4):
        q=(dd-dt.timedelta(days=k)).isoformat()
        if q in g: pairs.append((d0,g[q],-x)); break
def corr(a,b):
    ma,mb=st.mean(a),st.mean(b); 
    return sum((x-ma)*(y-mb) for x,y in zip(a,b))/math.sqrt(sum((x-ma)**2 for x in a)*sum((y-mb)**2 for y in b))
r_lvl=corr([p[1] for p in pairs],[p[2] for p in pairs])
# 3-month changes correlation
r_chg=corr([pairs[i][1]-pairs[i-13][1] for i in range(13,len(pairs))],[pairs[i][2]-pairs[i-13][2] for i in range(13,len(pairs))])
# sensitivity on today's live components
live=json.load(open(os.path.join(os.path.dirname(__file__),"..","data","credit_fg.json")))
ok=[c for c in live["components"] if c["ok"]]
wavg=lambda cs,eq=False:round(sum(c["score"]*(1 if eq else c["weight"]) for c in cs)/sum(1 if eq else c["weight"] for c in cs),1)
sens=[dict(en="Official weights",th="น้ำหนักทางการ",s=wavg(ok)),dict(en="Equal weights",th="น้ำหนักเท่ากัน",s=wavg(ok,True))]
for c in ok: sens.append(dict(en="Without "+c["en"],th="ไม่รวม "+c["th"],s=wavg([x for x in ok if x is not c])))
sens.append(dict(en="Market-only (no Google Trends, as in backtest)",th="เฉพาะตลาด (ไม่รวม Google Trends เหมือนแบ็กเทสต์)",s=wavg([x for x in ok if x["id"]!="trends"])))
out=dict(updated=dt.datetime.now(BKK).isoformat(timespec="minutes"),method="weekly Friday; components set,banks,thb,oil,hy,vix; trends & thai10y excluded; FRED ICE HY spread only public from 2023-10-31 so hy enters late 2024; rolling 756-obs percentile, expanding (min 250 obs) early",
 series=[{"d":p["d"],"s":p["s"],"n":p["n"]} for p in series],components_last=series[-1]["c"],events=EV,
 stlfsi=dict(src="https://fred.stlouisfed.org/series/STLFSI4",n=len(pairs),r_level=round(r_lvl,2),r_3m_change=round(r_chg,2),pairs=[[p[0],p[1],round(p[2],3)] for p in pairs]),
 sensitivity=dict(rows=sens,min=min(x["s"] for x in sens),max=max(x["s"] for x in sens),live=live["score"]))
base=os.path.join(os.path.dirname(__file__),"..","data")
json.dump(out,open(os.path.join(base,"credit_fg_history.json"),"w"),ensure_ascii=False)
open(os.path.join(base,"credit_fg_history.js"),"w").write("window.CREDIT_FG_HIST="+json.dumps(out,ensure_ascii=False)+";\n")
print("weeks",len(series),series[0]["d"],series[0]["n"],"last",series[-1])
for e in EV: print(e["id"],e["min"],e["avg"],e["min_band"],e["weeks_fear"],"/",e["weeks"])
print("r",r_lvl,r_chg,len(pairs)); print(out["sensitivity"]["min"],out["sensitivity"]["max"]); [print(x) for x in sens]
