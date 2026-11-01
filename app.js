/* Thai Corporate Credit Trends — no libraries, inline SVG. Data: data/trends.js (real Google Trends pulls). */
(function(){
const T=window.TRENDS||{items:{},terms:[]};const TH=window.THEMES;
let lg=(location.hash.match(/lang=(th|en)/)||[])[1]||localStorage.getItem('tct-lang')||'en';
const L=(e,t)=>lg==='th'?t:e;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sgn=x=>(x>0?'+':'')+Math.round(x);
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const MON=[['Jan','ม.ค.'],['Feb','ก.พ.'],['Mar','มี.ค.'],['Apr','เม.ย.'],['May','พ.ค.'],['Jun','มิ.ย.'],['Jul','ก.ค.'],['Aug','ส.ค.'],['Sep','ก.ย.'],['Oct','ต.ค.'],['Nov','พ.ย.'],['Dec','ธ.ค.']];
const terms=(T.terms||[]).map(r=>({key:r[0],theme:r[1],word:r[2],lang:r[3],en:r[4],th:r[5]}));
const theme=id=>TH.find(t=>t.id===id);
const nm=t=>lg==='th'?t.th:t.en;
const nm2=t=>(lg==='th'&&t.th===t.word)?'':nm(t);
const ex=(w,hl)=>`https://trends.google.com/trends/explore?date=today%205-y&geo=TH&hl=${hl||(lg==='th'?'th':'en')}&q=${encodeURIComponent(w)}`;
const C={};
function an(key){
 if(key in C)return C[key];
 const it=(T.items||{})[key];if(!it||!it.series||it.series.length<110)return C[key]=null;
 const s=it.series.slice(0,-1);/* last week may be incomplete */
 const v=s.map(x=>x[1]),l52=v.slice(-52),p52=v.slice(-104,-52),f52=v.slice(0,52);
 const pct=(a,b)=>avg(b)>=2?(avg(a)/avg(b)-1)*100:null;
 const sm=v.map((_,i)=>avg(v.slice(Math.max(0,i-3),i+1)));
 const mm=Array.from({length:12},()=>[]);s.forEach((x,i)=>mm[+x[0].slice(5,7)-1].push(v[i]));
 const mavg=mm.map(avg),mean=avg(mavg)||1,pk=mavg.indexOf(Math.max(...mavg));
 const ym={};s.forEach((x,i)=>{(ym[x[0].slice(0,7)]=ym[x[0].slice(0,7)]||[]).push(v[i])});
 const months=Object.keys(ym).sort().map(k=>[k,avg(ym[k])]);
 let pki=v.indexOf(Math.max(...v));
 return C[key]={it,s,v,sm,yoy:pct(l52,p52),y5:pct(l52,f52),level:avg(l52),pk,pkx:(mavg[pk]/mean-1)*100,mavg,months,peak:s[pki][0]};
}
const cls=a=>a.yoy==null?'fl':a.yoy>10?'up':a.yoy<-10?'dn':'fl';
const COL={up:'#0a7b5c',dn:'#c2261e',fl:'#667075'};
function spark(a,col,W=240,H=60){
 const mx=Math.max(...a.sm,1),n=a.sm.length,pts=a.sm.map((y,i)=>[(i/(n-1)*W).toFixed(1),(H-3-(y/mx)*(H-8)).toFixed(1)]);
 const line=pts.map(p=>p.join(',')).join(' '),x52=((n-52)/(n-1)*W).toFixed(1);
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="5-year trend line"><rect x="${x52}" y="0" width="${(W-x52).toFixed(1)}" height="${H}" fill="#f1f4f4"/><polyline points="0,${H-1} ${line} ${W},${H-1}" fill="${col}" fill-opacity=".12"/><polyline points="${line}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linejoin="round"/><line x1="0" y1="${H-.5}" x2="${W}" y2="${H-.5}" stroke="#d7dcdb"/></svg>`;
}
function season(a){const mx=Math.max(...a.mavg,1);return `<svg viewBox="0 0 120 24" style="width:120px;flex:none" role="img" aria-label="months">${a.mavg.map((m,i)=>{const h=Math.max(1,m/mx*20);return `<rect x="${i*10+1}" y="${22-h}" width="8" height="${h}" rx="1" fill="${i===a.pk?'#14181b':'#c9d0ce'}"/>`}).join('')}</svg>`}
function rq(list,n){return list.slice(0,n).map(r=>`<li><span title="${esc(r[0])}">${esc(r[0])}</span><b>${r[1]>=5000?L('Breakout','พุ่งมาก'):'+'+r[1]+'%'}</b></li>`).join('')}
function card(t){
 const a=an(t.key),th=theme(t.theme);
 const head=`<h4><span>${esc(t.word)}<small>${nm2(t)?esc(nm2(t))+' · ':''}${t.lang==='th'?L('Thai search','คำค้นภาษาไทย'):L('English search','คำค้นภาษาอังกฤษ')}</small></span>`;
 if(!a)return `<div class="card tc na">${head}<span class="arrow fl">${L('not available','ไม่มีข้อมูล')}</span></h4><p class="note">${(T.empty||{})[t.key]?L('Google returned no data for this word (too few searches).','Google ไม่มีข้อมูลสำหรับคำนี้ (มีคนค้นน้อยเกินไป)'):L('Not pulled: Google rate-limited the request. Run the refresh script later.','ยังดึงไม่ได้ เพราะ Google จำกัดจำนวนครั้ง ให้รันสคริปต์ refresh ภายหลัง')} <a href="${ex(t.word)}" target="_blank" rel="noopener">${L('Open in Google Trends ↗','เปิดใน Google Trends ↗')}</a></p></div>`;
 const c=cls(a),lab={up:L('Rising','เพิ่มขึ้น'),dn:L('Falling','ลดลง'),fl:a.yoy==null?L('Too small','น้อยเกินไป'):L('Flat','ทรงตัว')}[c];
 const rs=(a.it.rising||[]);
 return `<div class="card tc" data-k="${t.key}" tabindex="0" style="border-top:3px solid ${th.col}">${head}<span class="arrow ${c}">${lab}${a.yoy==null?'':' '+sgn(a.yoy)+'%'}</span></h4>${spark(a,COL[c])}
 <div class="st">${L('Last 52 wks vs year before','52 สัปดาห์ล่าสุดเทียบปีก่อน')}: <b>${a.yoy==null?'–':sgn(a.yoy)+'%'}</b> · ${L('vs 5 yrs ago','เทียบ 5 ปีก่อน')}: <b>${a.y5==null?'–':sgn(a.y5)+'%'}</b></div>
 <div style="display:flex;gap:8px;align-items:center;margin-top:4px">${season(a)}<span class="st">${a.pkx>=25?`${L('Busiest month','เดือนที่ค้นมากสุด')}: <b>${L(MON[a.pk][0],MON[a.pk][1])}</b>`:L('No clear season','ไม่เห็นฤดูกาลชัด')}</span></div>
 ${rs.length?`<ul class="rq">${rq(rs,3)}</ul>`:`<p class="note" style="margin:6px 0 0">${L('Rising related searches: none returned','คำค้นที่มาแรง: ไม่มีข้อมูล')}</p>`}</div>`;
}
function fmtRet(iso){if(!iso)return L('not yet','ยังไม่ได้ดึง');const d=new Date(iso);if(isNaN(d))return iso;return d.toLocaleString(lg==='th'?'th-TH':'en-GB',{timeZone:'Asia/Bangkok',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+' '+L('Bangkok time','เวลากรุงเทพฯ')}
function heat(){
 const have=terms.filter(t=>an(t.key));if(!have.length)return `<div class="callout">${L('No Google Trends data was pulled yet, so the heat map is empty.','ยังไม่มีข้อมูล Google Trends จึงยังไม่มีแผนที่ความร้อน')}</div>`;
 const months=an(have[0].key).months.map(m=>m[0]);
 const hdr=`<tr><th></th>${months.map(m=>`<th>${m.slice(5)==='01'?m.slice(0,4):''}</th>`).join('')}</tr>`;
 let rows='';
 TH.forEach(th=>{const ts=terms.filter(t=>t.theme===th.id);rows+=`<tr class="th"><td colspan="30" style="color:${th.col};white-space:nowrap">${th.icon} ${L(th.en,th.th)}</td></tr>`;
  ts.forEach(t=>{const a=an(t.key);if(!a){rows+=`<tr><td class="lab" title="${esc(t.word)}">${esc(t.word)}</td><td colspan="${months.length}" class="note" style="padding-left:6px">${L('not available','ไม่มีข้อมูล')}</td></tr>`;return}
   const mp=Object.fromEntries(a.months),mx=Math.max(...a.months.map(m=>m[1]),1);
   rows+=`<tr><td class="lab" data-k="${t.key}" title="${esc(nm(t))}">${esc(t.word)}</td>${months.map(m=>{const x=(mp[m]||0)/mx;return `<td class="c" title="${esc(t.word)} ${m}: ${Math.round(mp[m]||0)}" style="background:${th.col};opacity:${(0.06+0.94*x*x).toFixed(2)}"></td>`}).join('')}</tr>`})});
 return `<div class="card heat"><table>${hdr}${rows}</table></div><p class="note">${L('Each row is one search word, monthly average, coloured on its own scale: darkest = that word’s busiest month in 5 years. Look for columns where many rows go dark at once — that is when stress (or interest) was broad. Click a word for the full chart.','แต่ละแถวคือหนึ่งคำค้น ค่าเฉลี่ยรายเดือน ระบายสีตามสเกลของคำนั้นเอง สีเข้มสุด = เดือนที่ค้นมากที่สุดใน 5 ปี ให้มองหาคอลัมน์ที่หลายแถวเข้มพร้อมกัน แปลว่าความกังวล (หรือความสนใจ) เกิดพร้อมกันวงกว้าง คลิกที่คำเพื่อดูกราฟเต็ม')}</p>${heatSrc()}`;
}
function heatSrc(){
 const lk=t=>`<a href="${ex(t.word)}" target="_blank" rel="noopener" title="${esc(nm(t))}">${esc(t.word)} ↗</a>`;
 const grp=TH.map(th=>{const ts=terms.filter(t=>t.theme===th.id);return ts.length?`<p style="margin:4px 0"><b style="color:${th.col}">${th.icon} ${L(th.en,th.th)}:</b> ${ts.map(lk).join(' · ')}</p>`:''}).join('');
 return `<div class="card" id="pulse-src"><h3 style="margin:0 0 4px">${L('Sources — click to re-check each word on Google Trends','แหล่งข้อมูล — คลิกเพื่อตรวจสอบแต่ละคำบน Google Trends')}</h3><p class="note" style="margin:0 0 6px">${L('Source','ที่มา')}: <a href="https://trends.google.com/trends/explore?date=today%205-y&geo=TH" target="_blank" rel="noopener">Google Trends</a> · ${L('Geo: Thailand (TH) · Period: past 5 years (today 5-y), weekly, averaged to months here · Retrieved','พื้นที่: ประเทศไทย (TH) · ช่วงเวลา: 5 ปีย้อนหลัง (today 5-y) รายสัปดาห์ เฉลี่ยเป็นรายเดือนในหน้านี้ · ดึงข้อมูลเมื่อ')} ${fmtRet(T.retrieved)} · ${L('pulled with','ดึงด้วย')} <a href="https://github.com/GeneralMills/pytrends" target="_blank" rel="noopener">pytrends</a> · <a href="https://github.com/piyaster11/thai-credit-trends/blob/main/data/trends.json" target="_blank" rel="noopener">${L('raw data (JSON)','ข้อมูลดิบ (JSON)')}</a> · <a href="https://support.google.com/trends/answer/4365533" target="_blank" rel="noopener">${L('how Google scales 0–100','วิธีที่ Google คำนวณสเกล 0–100')}</a></p>${grp}<p class="note" style="margin:6px 0 0">${L('Google Trends samples searches, so a live re-check can differ by a few points from the saved numbers; the shape and peak months should match.','Google Trends ใช้ข้อมูลสุ่มตัวอย่าง ค่าที่ตรวจซ้ำอาจต่างจากที่บันทึกไว้เล็กน้อย แต่รูปแบบและเดือนสูงสุดควรตรงกัน')}</p></div>`;
}
function movers(){
 const ok=terms.map(t=>({t,a:an(t.key)})).filter(x=>x.a&&x.a.yoy!=null&&x.a.level>=5);
 if(!ok.length)return '';
 const up=ok.filter(x=>x.a.yoy>0).sort((a,b)=>b.a.yoy-a.a.yoy).slice(0,6),dn=ok.filter(x=>x.a.yoy<0).sort((a,b)=>a.a.yoy-b.a.yoy).slice(0,6);
 const mx=Math.max(...ok.map(x=>Math.abs(x.a.yoy)),1);
 const li=(x,c)=>`<div class="mv" data-k="${x.t.key}"><span><b>${esc(x.t.word)}</b> <span class="note">${esc(nm(x.t))}</span></span><span style="display:flex;align-items:center;gap:8px"><span class="bar" style="width:${Math.max(6,Math.abs(x.a.yoy)/mx*120)}px;background:${COL[c]}"></span><b style="color:${COL[c]};min-width:48px;text-align:right">${sgn(x.a.yoy)}%</b></span></div>`;
 return `<div class="movers"><div class="card"><h3 style="margin:0 0 6px">▲ ${L('Rising most vs last year','เพิ่มขึ้นมากสุดเทียบปีก่อน')}</h3>${up.map(x=>li(x,'up')).join('')||'<p class="note">–</p>'}</div><div class="card"><h3 style="margin:0 0 6px">▼ ${L('Falling most vs last year','ลดลงมากสุดเทียบปีก่อน')}</h3>${dn.map(x=>li(x,'dn')).join('')||'<p class="note">–</p>'}</div></div><p class="note">${L('Average of the last 52 weeks vs the 52 weeks before. Words with very low search interest are left out. A rise is a question to ask, not a conclusion.','ค่าเฉลี่ย 52 สัปดาห์ล่าสุดเทียบกับ 52 สัปดาห์ก่อนหน้า ตัดคำที่มีคนค้นน้อยมากออก การเพิ่มขึ้นคือคำถามที่ควรถามต่อ ไม่ใช่ข้อสรุป')}</p>`;
}
function bigChart(keys,cols,W=900,H=300){
 const P={l:34,r:10,t:10,b:24};const as=keys.map(an);const s0=as[0].s;const n=s0.length;
 const X=i=>P.l+i/(n-1)*(W-P.l-P.r),Y=v=>P.t+(1-v/100)*(H-P.t-P.b);
 let g='';[0,25,50,75,100].forEach(y=>g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(y)}" y2="${Y(y)}" stroke="#eef0f1"/><text x="${P.l-6}" y="${Y(y)+4}" font-size="11" fill="#8b9499" text-anchor="end">${y}</text>`);
 s0.forEach((x,i)=>{if(i&&x[0].slice(0,4)!==s0[i-1][0].slice(0,4))g+=`<line x1="${X(i)}" x2="${X(i)}" y1="${P.t}" y2="${H-P.b}" stroke="#e3e7e8" stroke-dasharray="3 3"/><text x="${X(i)+3}" y="${H-8}" font-size="11" fill="#8b9499">${x[0].slice(0,4)}</text>`});
 const lines=as.map((a,j)=>{const raw=a.v.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' '),sm=a.sm.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return (keys.length===1?`<polyline points="${P.l},${Y(0)} ${raw} ${X(n-1)},${Y(0)}" fill="${cols[j]}" fill-opacity=".08"/><polyline points="${raw}" fill="none" stroke="${cols[j]}" stroke-opacity=".35" stroke-width="1"/>`:'')+`<polyline points="${sm}" fill="none" stroke="${cols[j]}" stroke-width="2.2" stroke-linejoin="round"/>`}).join('');
 return `<svg viewBox="0 0 ${W} ${H}" class="bc" data-keys="${keys.join(',')}" role="img" aria-label="weekly chart">${g}${lines}<line class="hl" x1="0" x2="0" y1="${P.t}" y2="${H-P.b}" stroke="#14181b" stroke-opacity="0"/><rect x="${P.l}" y="0" width="${W-P.l-P.r}" height="${H}" fill="transparent" class="hov" data-w="${W}" data-pl="${P.l}" data-pr="${P.r}"/></svg><div class="tip"></div>`;
}
function hookHover(root){root.querySelectorAll('svg.bc').forEach(svg=>{const r=svg.querySelector('.hov'),hl=svg.querySelector('.hl'),tip=svg.nextElementSibling,keys=svg.dataset.keys.split(',');
 const W=+r.dataset.w,pl=+r.dataset.pl,pr=+r.dataset.pr;
 r.addEventListener('mousemove',e=>{const bb=svg.getBoundingClientRect(),x=(e.clientX-bb.left)/bb.width*W;const a0=an(keys[0]),n=a0.s.length;const i=Math.max(0,Math.min(n-1,Math.round((x-pl)/(W-pl-pr)*(n-1))));
  const xx=pl+i/(n-1)*(W-pl-pr);hl.setAttribute('x1',xx);hl.setAttribute('x2',xx);hl.setAttribute('stroke-opacity','.4');
  tip.innerHTML=`<b>${L('Week of','สัปดาห์ที่เริ่ม')} ${a0.s[i][0]}</b> · `+keys.map(k=>{const t=terms.find(x=>x.key===k);return `${esc(t.word)}: <b>${an(k).v[i]}</b>`}).join(' · ')})})}
function openTerm(k){
 const t=terms.find(x=>x.key===k),a=an(k);if(!t||!a)return;const th=theme(t.theme);
 const top=a.it.top||[],rs=a.it.rising||[];
 document.getElementById('mbody').innerHTML=`<p class="note" style="margin:0">${th.icon} ${L(th.en,th.th)}</p><h2>${esc(t.word)} <span class="note" style="font-size:15px">${esc(nm2(t))}</span></h2>
 <p class="st">${L('Thailand · weekly · last 5 years · 0–100 on its own scale · line = 4-week average','ประเทศไทย · รายสัปดาห์ · 5 ปีล่าสุด · 0–100 ตามสเกลของคำนี้ · เส้นเข้ม = ค่าเฉลี่ย 4 สัปดาห์')}. ${L('Peak week','สัปดาห์สูงสุด')}: <b>${a.peak}</b> · ${L('vs year before','เทียบปีก่อน')}: <b>${a.yoy==null?'–':sgn(a.yoy)+'%'}</b></p>
 <div class="big">${bigChart([k],[th.col])}</div>
 <div class="grid2" style="margin-top:10px"><div><h4 style="margin:0">${L('Top related searches','คำค้นที่เกี่ยวข้องยอดนิยม')}</h4>${top.length?`<ul class="rq">${top.slice(0,8).map(r=>`<li><span>${esc(r[0])}</span><b style="color:#14181b">${r[1]}</b></li>`).join('')}</ul>`:`<p class="note">${L('none returned','ไม่มีข้อมูล')}</p>`}</div>
 <div><h4 style="margin:0">${L('Rising related searches','คำค้นที่เกี่ยวข้องที่มาแรง')}</h4>${rs.length?`<ul class="rq">${rq(rs,8)}</ul>`:`<p class="note">${L('none returned','ไม่มีข้อมูล')}</p>`}</div></div>
 <p class="note">${L('Related searches cover the same 5 years. “Breakout” = grew more than 5,000% from a tiny base. Retrieved','คำค้นที่เกี่ยวข้องครอบคลุม 5 ปีเดียวกัน “พุ่งมาก” = เพิ่มเกิน 5,000% จากฐานที่เล็กมาก ดึงเมื่อ')} ${fmtRet(a.it.retrieved||T.retrieved)}. <a href="${ex(t.word)}" target="_blank" rel="noopener">${L('Open this in Google Trends ↗','เปิดใน Google Trends ↗')}</a></p>
 <div class="callout" style="margin:8px 0 0"><b>${L('What to check next','ตรวจสอบอะไรต่อ')}:</b> ${th.check.map(c=>`<a href="${c[2]}" target="_blank" rel="noopener">${L(c[0],c[1])}</a>`).join(' · ')}</div>`;
 const m=document.getElementById('modal');m.hidden=false;hookHover(m);
}
let pick=null;const PC=['#e5484d','#3e63dd','#f5a524','#12a594'];
function compare(){
 const have=terms.filter(t=>an(t.key));if(!have.length)return '';
 if(!pick)pick=['restructure_th','layoff_th','rate_th','pawn_th'].filter(k=>an(k)).slice(0,4);if(!pick.length)pick=[have[0].key];
 const chips=have.map(t=>{const i=pick.indexOf(t.key);return `<button class="chip ${i>=0?'on':''}" data-pk="${t.key}" style="${i>=0?'background:'+PC[i]:''}">${esc(t.word)}</button>`}).join('');
 const words=pick.map(k=>terms.find(t=>t.key===k).word);
 return `<div class="card"><div class="cmp-pick">${chips}</div><div class="legend">${pick.map((k,i)=>`<span><i style="background:${PC[i]}"></i>${esc(terms.find(t=>t.key===k).word)}</span>`).join('')}</div><div class="big" id="cmpc">${bigChart(pick,PC)}</div>
 <p class="note">${L('Pick up to 4 words. Each line is on its OWN 0–100 scale, so compare the timing and shape, not the height. To compare real relative volume on one shared scale, ','เลือกได้สูงสุด 4 คำ แต่ละเส้นใช้สเกล 0–100 ของตัวเอง จึงเทียบจังหวะและรูปทรง ไม่ใช่ความสูง ถ้าต้องการเทียบปริมาณจริงบนสเกลเดียวกัน ')}<a href="${ex(words.join(','))}" target="_blank" rel="noopener"><b>${L('open this exact comparison in Google Trends ↗','เปิดการเปรียบเทียบนี้ใน Google Trends ↗')}</b></a></p></div>`;
}
function howto(){
 return `<div class="grid3"><div class="card"><h3 style="margin:0 0 4px">① ${L('0–100 is relative','0–100 เป็นค่าสัมพัทธ์')}</h3><div class="scale"><div style="background:#c9d0ce;color:#14181b">0</div><div style="background:#7cc4a4">25</div><div style="background:#2f9e6f">50</div><div style="background:#0b7a75">75</div><div style="background:#0d1b2a">100</div></div><p class="note">${L('100 = the busiest week for that word in the period and place you chose. 50 = half as busy. It is NOT a count of searches.','100 = สัปดาห์ที่คนค้นคำนั้นมากที่สุดในช่วงเวลาและพื้นที่ที่เลือก 50 = ครึ่งหนึ่งของจุดสูงสุด ไม่ใช่จำนวนครั้งที่ค้น')}</p></div>
 <div class="card"><h3 style="margin:0 0 4px">② ${L('Interest, not volume or sales','ความสนใจ ไม่ใช่ปริมาณหรือยอดขาย')}</h3><p class="note">${L('A spike in “ล้มละลาย” may be one famous news story, a TV drama, or real distress. Searches show what people are curious or worried about. Always confirm with an official source before it goes in a credit memo.','การค้นหา “ล้มละลาย” ที่พุ่งขึ้นอาจมาจากข่าวดังข่าวเดียว ละคร หรือความเดือดร้อนจริง การค้นหาบอกว่าคนสงสัยหรือกังวลเรื่องอะไร ต้องยืนยันกับแหล่งทางการก่อนใส่ในบันทึกสินเชื่อเสมอ')}</p></div>
 <div class="card"><h3 style="margin:0 0 4px">③ ${L('Use it to ask better questions','ใช้เพื่อถามคำถามให้ดีขึ้น')}</h3><p class="note">${L('Good use: “Searches for used cars are falling; how are my auto-dealer client’s sales?” Bad use: “Searches fell 20%, so revenue fell 20%.” Thai and English words behave differently; check both.','ใช้ถูก: “คนค้นรถมือสองลดลง ยอดขายของลูกค้าเต็นท์รถเป็นอย่างไร” ใช้ผิด: “การค้นหาลด 20% แปลว่ารายได้ลด 20%” คำภาษาไทยและอังกฤษให้ผลต่างกัน ควรดูทั้งสองแบบ')}</p></div></div>`;
}
function themesView(){
 return TH.map(th=>{const ts=terms.filter(t=>t.theme===th.id);return `<section id="th-${th.id}"><div class="theme-h"><span class="dot" style="background:${th.col}"></span><h2>${th.icon} ${L(th.en,th.th)}</h2></div>
 <div class="why"><div class="card"><b>${L('Why a credit analyst cares','ทำไมนักวิเคราะห์สินเชื่อควรสนใจ')}</b><p style="margin:4px 0 0;font-size:14px">${L(th.why[0],th.why[1])}</p></div>
 <div class="card"><b>${L('What to check next (official sources)','ตรวจสอบต่อที่ไหน (แหล่งทางการ)')}</b><ul>${th.check.map(c=>`<li><a href="${c[2]}" target="_blank" rel="noopener">${L(c[0],c[1])}</a></li>`).join('')}</ul></div></div>
 <div class="spk">${ts.map(card).join('')}</div></section>`}).join('');
}
function tryIt(){
 return `<div class="card try"><p style="margin:0 0 8px">${L('Every word in this dashboard opens live in Google Trends. Change the dates, the region (e.g. a province), or add a client’s brand or sector word.','ทุกคำในแดชบอร์ดนี้เปิดใน Google Trends ได้ทันที ลองเปลี่ยนช่วงเวลา พื้นที่ (เช่น รายจังหวัด) หรือเพิ่มชื่อแบรนด์หรือคำในอุตสาหกรรมของลูกค้า')}</p>
 ${TH.map(th=>`<p style="margin:6px 0 2px"><b style="color:${th.col}">${th.icon} ${L(th.en,th.th)}</b></p>${terms.filter(t=>t.theme===th.id).map(t=>`<a class="tl" href="${ex(t.word)}" target="_blank" rel="noopener">${esc(t.word)} ↗</a>`).join('')}`).join('')}
 <h3 style="margin:16px 0 6px">${L('Five 2-minute exercises','5 แบบฝึกหัด 2 นาที')}</h3><ol style="margin:0;padding-left:20px;font-size:14px">
 <li>${L('Pick one client’s sector. Find its word above and open it. Is interest higher or lower than last year?','เลือกอุตสาหกรรมของลูกค้าหนึ่งราย หาคำที่เกี่ยวข้องด้านบนแล้วเปิดดู ความสนใจสูงหรือต่ำกว่าปีที่แล้ว')}</li>
 <li>${L('Open the comparison <a href="'+ex('รถมือสอง,ยึดรถ')+'" target="_blank" rel="noopener">รถมือสอง vs ยึดรถ</a>. Do they move together?','เปิดการเปรียบเทียบ <a href="'+ex('รถมือสอง,ยึดรถ')+'" target="_blank" rel="noopener">รถมือสอง กับ ยึดรถ</a> สองเส้นเคลื่อนไหวไปด้วยกันหรือไม่')}</li>
 <li>${L('In Google Trends, switch “Thailand” to a province where a client operates.','ใน Google Trends เปลี่ยน “ประเทศไทย” เป็นจังหวัดที่ลูกค้าดำเนินธุรกิจ')}</li>
 <li>${L('Find the biggest spike on one chart, then search the news for that week. What happened?','หาจุดที่พุ่งสูงสุดในกราฟหนึ่ง แล้วค้นข่าวของสัปดาห์นั้น เกิดอะไรขึ้น')}</li>
 <li>${L('Write one sentence for a memo, with the official source that confirms (or contradicts) the trend.','เขียนหนึ่งประโยคสำหรับบันทึกสินเชื่อ พร้อมแหล่งข้อมูลทางการที่ยืนยัน (หรือขัดแย้ง) กับเทรนด์')}</li></ol></div>`;
}
function clone(){
 return `<div class="grid2"><div class="card"><h3 style="margin:0 0 6px">${L('Clone and run it yourself','โคลนไปใช้เอง')}</h3><pre>git clone https://github.com/piyaster11/thai-credit-trends
cd thai-credit-trends
python3 -m http.server 8000   # open http://localhost:8000</pre><p class="note">${L('Or just open index.html in a browser — no server or install needed.','หรือเปิดไฟล์ index.html ในเบราว์เซอร์ได้เลย ไม่ต้องติดตั้งอะไร')}</p></div>
 <div class="card"><h3 style="margin:0 0 6px">${L('Refresh the data / add your own words','อัปเดตข้อมูล / เพิ่มคำของคุณเอง')}</h3><pre>pip install pytrends
# edit refresh/terms.py to add words
python3 refresh/pull_trends.py --force
python3 refresh/make_js.py</pre><p class="note">${L('Google limits requests, so the script waits ~45 s between words (about 30–60 min for all). If Google answers “429 too many requests”, wait and run again; words already saved are kept. Public data only — never put client names or bank data into it.','Google จำกัดจำนวนครั้ง สคริปต์จึงรอราว 45 วินาทีต่อคำ (ทั้งหมดราว 30–60 นาที) ถ้า Google ตอบว่า “429 ขอบ่อยเกินไป” ให้รอแล้วรันใหม่ คำที่ดึงแล้วจะเก็บไว้ ใช้ข้อมูลสาธารณะเท่านั้น ห้ามใส่ชื่อลูกค้าหรือข้อมูลธนาคาร')}</p></div></div>`;
}
function creditFG0(){
 const F=window.CREDIT_FG;if(!F)return `<div class="callout">${L('Credit Fear & Greed data not available yet.','ยังไม่มีข้อมูลดัชนี Credit Fear & Greed')}</div>`;
 const bands=[[0,25,'#c2261e','Extreme Fear','กลัวสุดขีด'],[25,45,'#e8743b','Fear','กลัว'],[45,55,'#c9a227','Neutral','กลาง'],[55,75,'#5fae6e','Greed','โลภ'],[75,100,'#0a7b5c','Extreme Greed','โลภสุดขีด']];
 const bandOf=x=>bands.find(b=>x<b[1]||b[1]===100);const B=bandOf(F.score>55&&F.score<56?55.1:F.score);
 const cx=160,cy=150,R=120,pt=(v,r)=>{const a=Math.PI*(1-v/100);return [(cx+r*Math.cos(a)).toFixed(1),(cy-r*Math.sin(a)).toFixed(1)]};
 const arc=(a,b,c)=>{const p=pt(a,R),q=pt(b,R);return `<path d="M${p[0]} ${p[1]} A${R} ${R} 0 0 1 ${q[0]} ${q[1]}" stroke="${c}" stroke-width="26" fill="none"/>`};
 const n=pt(F.score,R-30);
 const svg=`<svg viewBox="0 0 320 180" style="width:100%;max-width:360px;display:block;margin:0 auto" role="img" aria-label="gauge ${F.score}">${bands.map(b=>arc(b[0],b[1],b[2])).join('')}<line x1="${cx}" y1="${cy}" x2="${n[0]}" y2="${n[1]}" stroke="#14181b" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="8" fill="#14181b"/><text x="20" y="175" font-size="11" fill="#8b9499">0</text><text x="290" y="175" font-size="11" fill="#8b9499">100</text></svg>`;
 const fmtD=d=>d?new Date(d).toLocaleDateString(lg==='th'?'th-TH':'en-GB',{day:'numeric',month:'short',year:'numeric'}):'–';
 const rows=F.components.map(c=>{const sc=c.ok?bandOf(c.score):null;return `<tr><td><b>${esc(L(c.en,c.th))}</b>${c.ok?`<div class="note">${esc(L(c.note_en,c.note_th))}</div>`:`<div class="note">${L('Source failed this run — excluded, other weights re-scaled','ดึงข้อมูลไม่สำเร็จรอบนี้ — ตัดออกและปรับน้ำหนักที่เหลือ')}</div>`}</td><td style="white-space:nowrap">${c.ok?`${c.value} <span class="note">${esc(c.unit)}</span>`:'n/a'}</td><td style="text-align:center">${c.ok?`<b style="color:${sc[2]}">${Math.round(c.score)}</b>`:'n/a'}</td><td style="text-align:center">${c.ok?c.eff_weight+'%':'–'}</td><td class="note" style="white-space:nowrap">${c.ok?fmtD(c.asof):'–'}</td><td><a href="${esc(c.src)}" target="_blank" rel="noopener">${L('Source ↗','แหล่งที่มา ↗')}</a></td></tr>`}).join('');
 return `<div class="fg"><div class="card fgg">${svg}<div style="text-align:center;margin-top:-6px"><div style="font-size:44px;font-weight:750;line-height:1">${Math.round(F.score)}</div><div style="font-size:18px;font-weight:650;color:${B[2]}">${L(B[3],B[4])}</div><p class="note" style="margin:6px 0 0">${L('Updated','อัปเดต')} ${fmtRet(F.updated)} · ${F.n_ok}/${F.n_total} ${L('components','องค์ประกอบ')}</p></div>
 <p style="margin:12px 0 0;font-size:14px">${L('0 = extreme fear (credit stress: lenders pull back, spreads widen, refinancing gets hard). 100 = extreme greed (easy credit, risk may be under-priced). Bands: Extreme Fear &lt;25 · Fear 25–44 · Neutral 45–55 · Greed 56–75 · Extreme Greed &gt;75.','0 = กลัวสุดขีด (สินเชื่อตึงตัว ผู้ให้กู้ระวัง ส่วนต่างกว้างขึ้น รีไฟแนนซ์ยาก) 100 = โลภสุดขีด (สินเชื่อหาง่าย ความเสี่ยงอาจถูกตีราคาต่ำ) ช่วง: กลัวสุดขีด &lt;25 · กลัว 25–44 · กลาง 45–55 · โลภ 56–75 · โลภสุดขีด &gt;75')}</p></div>
 <div class="card" style="overflow-x:auto"><table class="fgt"><tr><th>${L('Component','องค์ประกอบ')}</th><th>${L('Reading','ค่าล่าสุด')}</th><th>${L('Score','คะแนน')}</th><th>${L('Weight','น้ำหนัก')}</th><th>${L('As of','ณ วันที่')}</th><th>${L('Re-check','ตรวจสอบ')}</th></tr>${rows}</table>
 <p class="note" style="margin:10px 0 0"><b>${L('Method','วิธีคำนวณ')}:</b> ${L('Each component is scored 0–100 as the percentile of today’s reading within its own ~3-year history (daily; monthly/weekly where noted), flipped where higher means more stress (searches, yields, FX volatility, oil, junk spreads, VIX). Index = weighted average; stress searches and the US high-yield spread count 1.5×, others 1×. A failed source shows n/a and is dropped. Refreshed daily ~07:00 Bangkok by GitHub Actions from free sources (Yahoo Finance, FRED, Google Trends) — ','แต่ละองค์ประกอบให้คะแนน 0–100 ตามเปอร์เซ็นไทล์ของค่าวันนี้เทียบประวัติของตัวเองราว 3 ปี (รายวัน หรือรายเดือน/สัปดาห์ตามที่ระบุ) กลับด้านเมื่อค่าสูงหมายถึงตึงตัว (คำค้น ยีลด์ ความผันผวนค่าเงิน น้ำมัน ส่วนต่างหุ้นกู้ VIX) ดัชนี = ค่าเฉลี่ยถ่วงน้ำหนัก คำค้นความตึงตัวและส่วนต่าง High-yield สหรัฐฯ นับ 1.5 เท่า ที่เหลือ 1 เท่า แหล่งที่ล้มเหลวแสดง n/a และถูกตัดออก อัปเดตทุกวันราว 07:00 น. เวลากรุงเทพฯ ผ่าน GitHub Actions จากแหล่งฟรี (Yahoo Finance, FRED, Google Trends) — ')}<a href="https://github.com/piyaster11/thai-credit-trends/blob/main/scripts/credit_fg.py" target="_blank" rel="noopener">${L('code','โค้ด')}</a> · <a href="https://github.com/piyaster11/thai-credit-trends/blob/main/data/credit_fg.json" target="_blank" rel="noopener">${L('raw JSON','ข้อมูลดิบ JSON')}</a>. ${'' }${L('Google Trends data only updates when the Trends refresh is run. A market-sentiment gauge for discussion, not a default model or credit advice.','ข้อมูล Google Trends อัปเดตเฉพาะเมื่อรันการรีเฟรช Trends เป็นมาตรวัดอารมณ์ตลาดเพื่อการพูดคุย ไม่ใช่โมเดลผิดนัดชำระหรือคำแนะนำสินเชื่อ')}</p></div></div>`;
}
function creditFG(){return creditFG0()+validation()}
/* Validation box for the Credit Fear & Greed gauge (preview). Data: data/credit_fg_history.js */
const A=(h,t)=>`<a href="${h}" target="_blank" rel="noopener">${t}</a>`;
function chart(H){
 const s=H.series,W=900,Ht=280,pl=36,pr=44,pt=10,pb=26,t0=Date.parse(s[0].d),t1=Date.parse(s[s.length-1].d);
 const X=d=>pl+(Date.parse(d)-t0)/(t1-t0)*(W-pl-pr),Y=v=>pt+(100-v)/100*(Ht-pt-pb);
 const st=H.stlfsi.pairs,mn=Math.max(-2.5,Math.min(...st.map(p=>p[2]))),mx=Math.max(...st.map(p=>p[2])),Y2=v=>pt+(mx-Math.max(v,mn))/(mx-mn)*(Ht-pt-pb);
 let g=`<rect x="${pl}" y="${Y(25)}" width="${W-pl-pr}" height="${Y(0)-Y(25)}" fill="#c2261e" opacity=".08"/><rect x="${pl}" y="${Y(45)}" width="${W-pl-pr}" height="${Y(25)-Y(45)}" fill="#e8743b" opacity=".08"/>`;
 H.events.forEach((e,i)=>{const a=X(e.start),b=X(e.end);g+=`<rect x="${a}" y="${pt}" width="${Math.max(3,b-a)}" height="${Ht-pt-pb}" fill="#14181b" opacity=".13"/><text x="${a+2}" y="${pt+12+i*12}" font-size="11" font-weight="700" fill="#14181b">${['COVID','STARK','JKN'][i]||e.id}</text>`});
 [0,25,45,55,75,100].forEach(v=>g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e3e7e6"/><text x="${pl-4}" y="${Y(v)+4}" font-size="10" text-anchor="end" fill="#8b9499">${v}</text>`);
 for(let y=new Date(t0).getFullYear()+1;y<=new Date(t1).getFullYear();y++){const x=X(y+'-01-01');g+=`<text x="${x}" y="${Ht-8}" font-size="10" text-anchor="middle" fill="#8b9499">${y}</text>`}
 g+=`<polyline fill="none" stroke="#2f6fb0" stroke-width="1.4" stroke-dasharray="4 3" points="${st.map(p=>X(p[0]).toFixed(1)+','+Y2(p[2]).toFixed(1)).join(' ')}"/>`;
 g+=`<polyline fill="none" stroke="#14181b" stroke-width="2" points="${s.map(p=>X(p.d).toFixed(1)+','+Y(p.s).toFixed(1)).join(' ')}"/>`;
 g+=`<text x="${W-pr+4}" y="${pt+10}" font-size="10" fill="#2f6fb0">${L('calm','สงบ')}</text><text x="${W-pr+4}" y="${Ht-pb}" font-size="10" fill="#2f6fb0">${L('stress','ตึงตัว')}</text>`;
 return `<svg viewBox="0 0 ${W} ${Ht}" style="width:100%;height:auto" role="img" aria-label="backtest">${g}</svg>
 <p class="note" style="margin:4px 0 0"><b style="color:#14181b">━</b> ${L('Credit F&amp;G backtest (weekly, 0–100, left axis)','แบ็กเทสต์ Credit F&amp;G (รายสัปดาห์ 0–100 แกนซ้าย)')} · <b style="color:#2f6fb0">┅</b> ${L('St. Louis Fed Financial Stress Index, inverted (up = calm, right axis)','ดัชนีความตึงตัวทางการเงิน St. Louis Fed กลับด้าน (ขึ้น = สงบ แกนขวา ตัดค่าสุดขั้วปี 2020)')} · ${L('red/orange tint = Extreme Fear / Fear zone; grey = stress events','สีแดง/ส้ม = โซนกลัวสุดขีด/กลัว · สีเทา = เหตุการณ์ตึงตัว')}</p>`;
}
function validation(){
 const H=window.CREDIT_FG_HIST;if(!H)return `<div class="callout">${L('Validation data not available.','ยังไม่มีข้อมูลการตรวจสอบ')}</div>`;
 const fd=d=>new Date(d).toLocaleDateString(lg==='th'?'th-TH':'en-GB',{day:'numeric',month:'short',year:'numeric'});
 const bt=b=>({'Extreme Fear':L('Extreme Fear','กลัวสุดขีด'),'Fear':L('Fear','กลัว'),'Neutral':L('Neutral','กลาง'),'Greed':L('Greed','โลภ'),'Extreme Greed':L('Extreme Greed','โลภสุดขีด')}[b]||b);
 const verdict={covid:L('✅ Detected — Extreme Fear throughout the crash.','✅ จับได้ — อยู่ในโซนกลัวสุดขีดตลอดช่วงวิกฤต'),stark:L('❌ Not detected — gauge stayed Neutral/Greed. STARK was a single-company fraud; market-wide signals (spreads, VIX, banks) did not move. This is a known limit: the gauge measures system-wide credit mood, not issuer risk.','❌ จับไม่ได้ — ดัชนีอยู่โซนกลาง/โลภ STARK เป็นการทุจริตของบริษัทเดียว สัญญาณระดับตลาดไม่ขยับ นี่คือข้อจำกัด: ดัชนีวัดอารมณ์สินเชื่อทั้งระบบ ไม่ใช่ความเสี่ยงรายบริษัท'),jkn:L('⚠️ Partly — fell into Fear in Oct–Nov 2023, but that coincided with the global bond sell-off and the Israel–Gaza war, so it is not proof the gauge "saw" JKN itself.','⚠️ บางส่วน — ลงสู่โซนกลัวช่วง ต.ค.–พ.ย. 2566 แต่ตรงกับช่วงตลาดพันธบัตรโลกเทขายและสงครามอิสราเอล–กาซา จึงไม่ใช่หลักฐานว่าดัชนีจับ JKN ได้โดยตรง')};
 const ev=H.events.map(e=>`<tr><td><b>${esc(L(e.en,e.th))}</b><div class="note">${fd(e.start)} – ${fd(e.end)} · ${A(e.src,L('source','แหล่งข่าว'))}${e.src2?' · '+A(e.src2,L('source 2','แหล่งข่าว 2')):''}</div></td><td style="text-align:center"><b>${e.min}</b><div class="note">${bt(e.min_band)}</div></td><td style="text-align:center">${e.avg}<div class="note">${bt(e.avg_band)}</div></td><td style="text-align:center">${e.weeks_fear}/${e.weeks}</td><td>${verdict[e.id]||''}</td></tr>`).join('');
 const S=H.sensitivity,sr=S.rows.map(r=>`<tr><td>${esc(L(r.en,r.th))}</td><td style="text-align:center"><b>${r.s}</b></td><td>${bt(r.s<25?'Extreme Fear':r.s<45?'Fear':r.s<=55?'Neutral':r.s<=75?'Greed':'Extreme Greed')}</td></tr>`).join('');
 const C=H.stlfsi;
 return `<div class="card" id="validation" style="margin-top:14px"><h3 style="margin:0 0 4px">${L('Validation — can this gauge be trusted?','การตรวจสอบ — เชื่อถือดัชนีนี้ได้แค่ไหน?')}</h3>
 <p class="note" style="margin:0 0 10px">${L('There is no official “credit fear &amp; greed” index anywhere. So we test ours three ways: (1) did it flash Fear in real Thai stress events, (2) does it move with an official central-bank stress index, (3) does the answer change if you change the weights?','ไม่มีดัชนี “ความกลัว-ความโลภสินเชื่อ” ที่เป็นทางการ จึงทดสอบ 3 แบบ: (1) ช่วงวิกฤตจริงในไทยดัชนีอยู่โซนกลัวหรือไม่ (2) เคลื่อนไหวไปกับดัชนีความตึงตัวของธนาคารกลางหรือไม่ (3) ถ้าเปลี่ยนน้ำหนัก ผลเปลี่ยนไหม')}</p>
 <h4 style="margin:10px 0 4px">1 · ${L('Backtest since 2019','แบ็กเทสต์ตั้งแต่ปี 2019')}</h4>${chart(H)}
 <div style="overflow-x:auto"><table class="fgt" style="margin-top:8px"><tr><th>${L('Stress event','เหตุการณ์')}</th><th>${L('Low','ต่ำสุด')}</th><th>${L('Average','เฉลี่ย')}</th><th>${L('Weeks in Fear','สัปดาห์ในโซนกลัว')}</th><th>${L('Verdict','ผล')}</th></tr>${ev}</table></div>
 <h4 style="margin:14px 0 4px">2 · ${L('Versus the St. Louis Fed Financial Stress Index','เทียบกับดัชนีความตึงตัวทางการเงิน St. Louis Fed')}</h4>
 <p style="margin:0;font-size:14px">${L(`Correlation with the inverted ${A(C.src,'STLFSI4')} (weekly, ${C.n} weeks, 2019–2026): <b>${C.r_level}</b> on levels and <b>${C.r_3m_change}</b> on 3-month changes. That is a moderate positive link: the two agree on direction in big global shocks (2020, 2022) but ours also carries Thai-specific signals (baht, SET, Thai banks, oil as an import cost), so a perfect match is neither expected nor wanted.`,`ค่าสหสัมพันธ์กับ ${A(C.src,'STLFSI4')} แบบกลับด้าน (รายสัปดาห์ ${C.n} สัปดาห์ 2019–2026): <b>${C.r_level}</b> สำหรับระดับ และ <b>${C.r_3m_change}</b> สำหรับการเปลี่ยนแปลง 3 เดือน ถือว่าสัมพันธ์เชิงบวกปานกลาง ทิศทางตรงกันในช่วงช็อกใหญ่ของโลก (2020, 2022) แต่ดัชนีเรามีสัญญาณเฉพาะไทย (ค่าบาท SET หุ้นแบงก์ไทย น้ำมัน) จึงไม่ควรเหมือนกันทุกจุด`)}</p>
 <h4 style="margin:14px 0 4px">3 · ${L('Sensitivity of today’s score','ความอ่อนไหวของคะแนนวันนี้')}</h4>
 <p style="margin:0 0 6px;font-size:14px">${L(`Changing the weights or dropping any one input moves today’s ${S.live} to between <b>${S.min}</b> and <b>${S.max}</b>. Every variant except one stays in Fear; dropping baht volatility (today’s only calm signal) pushes it into Extreme Fear. Conclusion: “Fear” is robust to the weighting choice.`,`เปลี่ยนน้ำหนักหรือตัดองค์ประกอบใดออก 1 ตัว คะแนนวันนี้ ${S.live} จะอยู่ระหว่าง <b>${S.min}</b> ถึง <b>${S.max}</b> ทุกแบบยังอยู่ในโซนกลัว ยกเว้นเมื่อตัดความผันผวนค่าเงินบาท (สัญญาณสงบเพียงตัวเดียววันนี้) จะลงไปโซนกลัวสุดขีด สรุป: ผล “กลัว” ไม่ขึ้นกับการเลือกน้ำหนัก`)}</p>
 <details><summary class="note" style="cursor:pointer">${L('Show all variants','ดูทุกแบบ')}</summary><table class="fgt"><tr><th>${L('Variant','แบบ')}</th><th>${L('Score','คะแนน')}</th><th>${L('Band','โซน')}</th></tr>${sr}</table></details>
 <h4 style="margin:14px 0 4px">4 · ${L('Method precedents &amp; caveats','อ้างอิงวิธีการและข้อจำกัด')}</h4>
 <ul style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.55">
 <li>${L('Built following the','สร้างตามแนวทาง')} ${A('https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators-methodology-and-user-guide_9789264043466-en.html','OECD/JRC Handbook on Constructing Composite Indicators (2008)')} ${L('— normalisation, weighting, sensitivity analysis.','— การปรับมาตรฐาน การถ่วงน้ำหนัก การวิเคราะห์ความอ่อนไหว')}</li>
 <li>${L('Design precedents from central banks:','ต้นแบบจากธนาคารกลาง:')} ${A('https://fred.stlouisfed.org/series/STLFSI4','St. Louis Fed Financial Stress Index')} · ${A('https://www.chicagofed.org/research/data/nfci/current-data','Chicago Fed NFCI')} · ${A('https://data.ecb.europa.eu/data/datasets/CISS','ECB CISS')}</li>
 <li>${L('Official Thai reference on corporate debt and NPLs:','แหล่งอ้างอิงทางการของไทยด้านหนี้ภาคธุรกิจและ NPL:')} ${A('https://www.bot.or.th/en/research-and-publications/reports/financial-stability-report.html',L('Bank of Thailand Financial Stability Report','รายงานเสถียรภาพระบบการเงิน ธนาคารแห่งประเทศไทย'))}</li>
 <li>${L('Backtest uses 6 market inputs only. Google Trends is excluded because Google re-scales the whole 5-year window on every pull, so past values are not what an analyst would have seen at the time; the Thai 10-yr yield has no free history source. FRED only publishes the ICE high-yield spread from Oct 2023, so it enters the backtest in late 2024; before that 5 inputs are used. Bank basket = KBANK, BBL, SCB, KTB, TTB; SET proxied by the TDEX ETF. Same check today: backtest-style market-only score ','แบ็กเทสต์ใช้เฉพาะ 6 ข้อมูลตลาด ไม่รวม Google Trends เพราะ Google ปรับสเกลทั้งช่วง 5 ปีทุกครั้งที่ดึง ค่าย้อนหลังจึงไม่ใช่ค่าที่นักวิเคราะห์เห็นในเวลานั้น และไม่มีข้อมูลย้อนหลังฟรีของบอนด์ยีลด์ไทย 10 ปี FRED เผยแพร่ส่วนต่าง High-yield ตั้งแต่ ต.ค. 2023 จึงเข้าแบ็กเทสต์ช่วงปลายปี 2024 ก่อนหน้านั้นใช้ 5 ข้อมูล ตะกร้าแบงก์ = KBANK BBL SCB KTB TTB และใช้ TDEX แทน SET ตรวจสอบวันนี้: คะแนนแบบแบ็กเทสต์ ')}${H.series[H.series.length-1].s} ${L('vs live market-only','เทียบคะแนนสดเฉพาะตลาด')} ${(S.rows.find(r=>r.en.startsWith('Market-only'))||{}).s}.</li>
 <li>${L('One sample period with few Thai credit events — treat results as supportive evidence, not proof. Not a default model and not credit advice.','ช่วงทดสอบเดียวและเหตุการณ์สินเชื่อไทยมีน้อย ให้ถือเป็นหลักฐานสนับสนุน ไม่ใช่ข้อพิสูจน์ ไม่ใช่โมเดลผิดนัดชำระและไม่ใช่คำแนะนำสินเชื่อ')}</li>
 <li>${A('https://github.com/piyaster11/thai-credit-trends/blob/main/scripts/credit_fg_backtest.py',L('backtest code','โค้ดแบ็กเทสต์'))} · ${A('https://github.com/piyaster11/thai-credit-trends/blob/main/data/credit_fg_history.json',L('backtest data (JSON)','ข้อมูลแบ็กเทสต์ (JSON)'))} · ${L('computed','คำนวณเมื่อ')} ${fmtRet(H.updated)}</li></ul></div>`;
}

function render(){
 document.body.dataset.lg=lg;document.documentElement.lang=lg;
 document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lg));
 const have=terms.filter(t=>an(t.key)).length;
 document.getElementById('t-badge').textContent=L('Credit Analyst AI Workshop · Section 01 · Google Trends','เวิร์กช็อป AI สำหรับนักวิเคราะห์สินเชื่อ · ส่วนที่ 01 · Google Trends');
 document.getElementById('t-title').innerHTML=L('What is Thailand <em>worried</em> about?<br>Credit signals from 5 years of Google searches','คนไทย<em>กังวล</em>เรื่องอะไร?<br>สัญญาณสินเชื่อจากการค้นหา Google 5 ปี');
 document.getElementById('t-sub').textContent=L('Free, public, early clues for corporate credit analysts: borrower stress, sector demand, rates, the bond market and household strain — in Thai and English searches.','เบาะแสล่วงหน้า ฟรี และเป็นข้อมูลสาธารณะสำหรับนักวิเคราะห์สินเชื่อธุรกิจ: ลูกหนี้ตึงตัว ความต้องการรายอุตสาหกรรม ดอกเบี้ย ตลาดหุ้นกู้ และภาระครัวเรือน จากคำค้นทั้งภาษาไทยและอังกฤษ');
 document.getElementById('stats').innerHTML=[[have+'/'+terms.length,L('search words with data','คำค้นที่มีข้อมูล')],['5',L('credit themes','หมวดสินเชื่อ')],['5 '+L('yrs','ปี'),L('weekly, Thailand','รายสัปดาห์ ประเทศไทย')],['TH + EN',L('search languages','ภาษาคำค้น')]].map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
 document.getElementById('fresh').innerHTML=`${L('Google Trends data retrieved','ดึงข้อมูล Google Trends เมื่อ')}: <b>${fmtRet(T.retrieved)}</b> · ${L('source: Google Trends (trends.google.com) via pytrends · nothing updates by itself','ที่มา: Google Trends ผ่าน pytrends · ไม่อัปเดตอัตโนมัติ')}`;
 const nav=[['creditfg',L('Credit Fear & Greed','ดัชนีความกลัว-โลภสินเชื่อ')],['pulse',L('5-year pulse','ชีพจร 5 ปี')],['movers',L('Biggest movers','เปลี่ยนมากสุด')],['howto',L('How to read','วิธีอ่าน')],...TH.map(t=>['th-'+t.id,t.icon+' '+L(t.en,t.th)]),['compare',L('Compare','เปรียบเทียบ')],['try',L('Try it yourself','ลองเอง')],['clone',L('Clone / refresh','โคลน / อัปเดต')]];
 document.getElementById('navin').innerHTML=nav.map(n=>`<a href="#${n[0]}">${n[1]}</a>`).join('');
 const S=(id,h,lede,body)=>`<section id="${id}"><h2>${h}</h2>${lede?`<p class="lede">${lede}</p>`:''}${body}</section>`;
 document.getElementById('main').innerHTML=
  S('creditfg',L('Thai Corporate Credit Fear &amp; Greed','ดัชนีความกลัว-ความโลภ สินเชื่อธุรกิจไทย'),L('One number for today’s corporate credit mood in Thailand, built from 8 free, re-checkable signals.','ตัวเลขเดียวสะท้อนอารมณ์ตลาดสินเชื่อธุรกิจไทยวันนี้ จาก 8 สัญญาณฟรีที่ตรวจสอบซ้ำได้'),creditFG())+
  S('pulse',L('The 5-year pulse','ชีพจร 5 ปี'),L('Every credit-related search word on one screen. Dark = that word’s busiest months.','ทุกคำค้นที่เกี่ยวกับสินเชื่อในหน้าจอเดียว สีเข้ม = เดือนที่คำนั้นถูกค้นมากที่สุด'),heat())+
  S('movers',L('Biggest movers this year','เปลี่ยนแปลงมากที่สุดในปีนี้'),'',movers())+
  S('howto',L('How to read Google Trends (60 seconds)','อ่าน Google Trends ใน 60 วินาที'),'',howto())+
  themesView()+
  S('compare',L('Compare words','เปรียบเทียบคำค้น'),L('Does stress show up in several places at once? Overlay up to four words.','ความตึงตัวเกิดหลายจุดพร้อมกันหรือไม่ ลองซ้อนกราฟได้สูงสุด 4 คำ'),compare())+
  S('try',L('Try it yourself','ลองทำเอง'),'',tryIt())+
  S('clone',L('Clone it, refresh it, make it yours','โคลน อัปเดต และปรับใช้เอง'),'',clone());
 document.getElementById('foot').innerHTML=`<p style="margin:0 0 6px"><b>${L('Unofficial · public sources only · for training','ไม่เป็นทางการ · ใช้แหล่งข้อมูลสาธารณะเท่านั้น · เพื่อการฝึกอบรม')}</b>. ${L('Not investment or credit advice. Not affiliated with Google or any bank. Contains no client or bank data. Search interest is not volume, sales or default rates.','ไม่ใช่คำแนะนำการลงทุนหรือสินเชื่อ ไม่เกี่ยวข้องกับ Google หรือธนาคารใด ไม่มีข้อมูลลูกค้าหรือธนาคาร ความสนใจในการค้นหาไม่ใช่ปริมาณ ยอดขาย หรืออัตราผิดนัดชำระ')}</p><p style="margin:0">${L('Thai text was machine-written and is awaiting native review.','ข้อความภาษาไทยเขียนโดยเครื่องและรอการตรวจทานโดยเจ้าของภาษา')} · <a href="https://github.com/piyaster11/thai-credit-trends">GitHub</a></p>`;
 hookHover(document.getElementById('main'));
}
document.addEventListener('click',e=>{
 const lb=e.target.closest('[data-lang]');if(lb){lg=lb.dataset.lang;localStorage.setItem('tct-lang',lg);render();return}
 const pk=e.target.closest('[data-pk]');if(pk){const k=pk.dataset.pk,i=pick.indexOf(k);if(i>=0){if(pick.length>1)pick.splice(i,1)}else{if(pick.length>=4)pick.shift();pick.push(k)}document.getElementById('compare').outerHTML=`<section id="compare"><h2>${L('Compare words','เปรียบเทียบคำค้น')}</h2><p class="lede">${L('Does stress show up in several places at once? Overlay up to four words.','ความตึงตัวเกิดหลายจุดพร้อมกันหรือไม่ ลองซ้อนกราฟได้สูงสุด 4 คำ')}</p>${compare()}</section>`;hookHover(document.getElementById('compare'));return}
 if(e.target.id==='mx'||e.target.id==='modal'){document.getElementById('modal').hidden=true;return}
 const k=e.target.closest('[data-k]');if(k&&!e.target.closest('a'))openTerm(k.dataset.k);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('modal').hidden=true;if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.k)openTerm(e.target.dataset.k)});
render();
})();
