#!/usr/bin/env python3
"""Thai credit-risk headlines from free Google News RSS (EN+TH) + Bangkok Post -> data/credit_news.json/.js (stdlib only)."""
import json, re, os, urllib.request, urllib.parse, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
UA={"User-Agent":"Mozilla/5.0 Chrome/128.0"}
def gn(q,th=False):
    p="hl=th&gl=TH&ceid=TH:th" if th else "hl=en-US&gl=US&ceid=US:en"
    return "https://news.google.com/rss/search?q="+urllib.parse.quote(q)+"&"+p
FEEDS=[gn('Thailand (debenture OR "bond default" OR "debt restructuring") when:30d'),
 gn('Thai (NPL OR "non-performing" OR provisions) bank when:30d'),
 gn('(TRIS OR Fitch OR Moody\'s OR "S&P") Thailand rating when:30d'),
 gn('Thailand "household debt" when:30d'), gn('"Bank of Thailand" (rate OR credit OR loans) when:14d'),
 gn('Thai company (rehabilitation OR bankruptcy OR "missed payment") when:30d'),
 gn('หุ้นกู้ ผิดนัดชำระ when:30d',1), gn('หนี้เสีย NPL ธนาคาร when:30d',1), gn('หนี้ครัวเรือน when:30d',1),
 gn('ทริสเรทติ้ง อันดับเครดิต when:30d',1), gn('ฟื้นฟูกิจการ OR ขยายเวลาชำระหุ้นกู้ when:30d',1),
 "https://www.bangkokpost.com/rss/data/business.xml"]
TAGS=[("DEFAULT",r"default|ผิดนัด|missed payment|restructur|ปรับโครงสร้างหนี้|rehabilit|ฟื้นฟู|bankrupt|ล้มละลาย|ขยายเวลา"),
 ("RATING",r"\btris\b|ทริส|fitch|moody|s&p|rating|อันดับเครดิต|downgrade"),("NPL",r"\bnpl|non-performing|หนี้เสีย|provision|สำรอง"),
 ("HH DEBT",r"household debt|หนี้ครัวเรือน"),("BOT",r"bank of thailand|\bbot\b|ธปท|แบงก์ชาติ|policy rate|ดอกเบี้ยนโยบาย"),
 ("BONDS",r"debenture|bond|หุ้นกู้|พันธบัตร"),("BANKS",r"bank|ธนาคาร|แบงก์|loan|สินเชื่อ")]
THAI=r"thai|bangkok|baht|ไทย|ธปท|ทริส|หุ้นกู้|หนี้|ธนาคาร|แบงก์|สินเชื่อ|บาท"
def tag(t):
    for k,rx in TAGS:
        if re.search(rx,t,re.I): return k
def main():
    items={}
    for u in FEEDS:
        try: root=ET.fromstring(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read())
        except Exception as e: print("fail",u[:80],e); continue
        for it in root.iter("item"):
            t=(it.findtext("title") or "").strip(); src=it.findtext("source") or "Bangkok Post"
            if " - " in t and "news.google" in u: t,src2=t.rsplit(" - ",1); src=it.findtext("source") or src2
            if re.search(r"facebook|youtube|tiktok",src,re.I): continue
            k=tag(t)
            if not k or not re.search(THAI,t,re.I): continue
            if "bangkokpost" in u and k=="BANKS" and not re.search(r"credit|debt|loan|npl",t,re.I): continue
            try: d=parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc)
            except Exception: continue
            if d<datetime.now(timezone.utc)-timedelta(days=30): continue
            key=re.sub(r"\W","",t.lower())[:60]
            items.setdefault(key,{"title":t,"source":src.strip(),"link":it.findtext("link"),"utc":d.strftime("%Y-%m-%dT%H:%M:%SZ"),"tag":k})
    out=sorted(items.values(),key=lambda x:x["utc"],reverse=True)
    pri={"DEFAULT":0,"RATING":1,"NPL":2,"BONDS":3,"HH DEBT":4,"BOT":5,"BANKS":6}
    # keep recency but make sure core credit-event tags rank first within the last 7 days
    wk=(datetime.now(timezone.utc)-timedelta(days=7)).strftime("%Y-%m-%dT%H")
    out.sort(key=lambda x:(x["utc"]<wk, pri[x["tag"]]>3, ), reverse=False)
    out=out[:15]
    J={"updated":datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),"items":out}
    d=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","data")
    json.dump(J,open(os.path.join(d,"credit_news.json"),"w"),ensure_ascii=False,indent=1)
    open(os.path.join(d,"credit_news.js"),"w").write("window.CREDIT_NEWS="+json.dumps(J,ensure_ascii=False)+";\n")
    print(len(out)); [print(x["utc"],x["tag"],x["source"],"|",x["title"]) for x in out]
main()
