# Thai Corporate Credit Trends · เทรนด์สินเชื่อธุรกิจไทย

**Live:** https://piyaster11.github.io/thai-credit-trends/

A free, one-page dashboard of **Google Trends (Thailand, last 5 years, weekly)** for words that matter to corporate credit analysts, in **Thai and English**, grouped into five themes: borrower stress, sector demand, macro and rates, credit market, and consumer/SME stress. Built for the Credit Analyst AI Workshop (Section 01 · Google Trends), 4 Nov 2026.

Each theme explains *why a credit analyst cares* and links to the *official source to check next* (Bank of Thailand, NESDC, SET, SEC, ThaiBMA, TRIS, Fitch Thailand, NCB, etc. — links only, no copied figures). Every word links straight to Google Trends so you can explore it yourself.

## Use it
- Open the live page, or clone and open `index.html` in any browser (no install, no server needed).
```bash
git clone https://github.com/piyaster11/thai-credit-trends
cd thai-credit-trends
python3 -m http.server 8000   # optional; then open http://localhost:8000
```

## Refresh the data / add your own words
```bash
pip install pytrends
# add or change words in refresh/terms.py
python3 refresh/pull_trends.py          # add --force to re-pull words already saved
python3 refresh/make_js.py              # writes data/trends.js used by the page
```
Google rate-limits requests: the script waits ~45 s between words and 5 min after a "429 too many requests", saves after every word, and skips words already saved. A full pull takes 30–60+ minutes; if Google keeps refusing, wait a few hours or try another network. `refresh/loop.sh` keeps retrying for you. Nothing is scheduled. You can also run the **Refresh Google Trends (manual)** workflow from the repo's Actions tab; it pulls on GitHub's machines and commits the new data.

| File | What |
|---|---|
| `index.html`, `app.js`, `style.css` | The page (no libraries, inline SVG charts) |
| `content.js` | Theme text (EN/TH) and official-source links |
| `data/trends.json` | Raw Google Trends pull: weekly values, top and rising related searches, `retrieved` time stamp per word |
| `data/trends.js` | Same data wrapped for the page |
| `refresh/` | `terms.py` (word list), `pull_trends.py`, `make_js.py`, `loop.sh` |

## Caveats — read before using in a memo
- Google Trends is **interest, not volume, sales or default rates**. 0–100 is relative to each word's own busiest week in the chosen period and place.
- Each line is on its own scale, so heights cannot be compared between words. Use the dashboard's "open this comparison in Google Trends" link for a shared scale.
- Spikes often come from one news story. Always confirm with an official source.
- Words Google returned no data for, or that could not be pulled, are shown as **not available** — never filled in.
- pytrends is an unofficial library and may break when Google changes its site.
- **Thai text was machine-written and needs review by a native speaker.**
- Unofficial · public sources only · for training. Not investment or credit advice. Not affiliated with Google or any bank. Contains no client or bank data — keep it that way.

---

## ภาษาไทย (สรุป)
แดชบอร์ดหน้าเดียวแสดง **Google Trends ของประเทศไทย ย้อนหลัง 5 ปี รายสัปดาห์** สำหรับคำค้นที่เกี่ยวกับงานวิเคราะห์สินเชื่อธุรกิจ ทั้งภาษาไทยและอังกฤษ แบ่งเป็น 5 หมวด: ลูกหนี้ตึงตัว ความต้องการรายอุตสาหกรรม เศรษฐกิจมหภาคและดอกเบี้ย ตลาดตราสารหนี้ และภาระครัวเรือน/SME แต่ละหมวดอธิบายว่าทำไมนักวิเคราะห์สินเชื่อควรสนใจ และลิงก์ไปยังแหล่งข้อมูลทางการเพื่อตรวจสอบต่อ

**วิธีใช้:** เปิดหน้าเว็บด้านบน หรือโคลนแล้วเปิด `index.html` ได้เลย
**อัปเดตข้อมูล:** `pip install pytrends` แก้คำใน `refresh/terms.py` แล้วรัน `python3 refresh/pull_trends.py` และ `python3 refresh/make_js.py` (Google จำกัดจำนวนครั้ง อาจใช้เวลา 30–60 นาทีขึ้นไป)

**ข้อควรระวัง:** Google Trends คือ *ความสนใจ* ไม่ใช่ปริมาณ ยอดขาย หรืออัตราผิดนัดชำระ ค่า 0–100 เทียบกับจุดสูงสุดของคำนั้นเอง ต้องยืนยันกับแหล่งทางการก่อนใช้ในบันทึกสินเชื่อเสมอ คำที่ไม่มีข้อมูลจะแสดงว่า "ไม่มีข้อมูล" ไม่มีการเติมตัวเลขเอง **ข้อความภาษาไทยเขียนโดยเครื่อง ควรให้เจ้าของภาษาตรวจทาน** ไม่เป็นทางการ ใช้ข้อมูลสาธารณะเท่านั้น เพื่อการฝึกอบรม ห้ามใส่ข้อมูลลูกค้าหรือข้อมูลธนาคาร
