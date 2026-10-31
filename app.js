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
 return `<div class="card heat"><table>${hdr}${rows}</table></div><p class="note">${L('Each row is one search word, monthly average, coloured on its own scale: darkest = that word’s busiest month in 5 years. Look for columns where many rows go dark at once — that is when stress (or interest) was broad. Click a word for the full chart.','แต่ละแถวคือหนึ่งคำค้น ค่าเฉลี่ยรายเดือน ระบายสีตามสเกลของคำนั้นเอง สีเข้มสุด = เดือนที่ค้นมากที่สุดใน 5 ปี ให้มองหาคอลัมน์ที่หลายแถวเข้มพร้อมกัน แปลว่าความกังวล (หรือความสนใจ) เกิดพร้อมกันวงกว้าง คลิกที่คำเพื่อดูกราฟเต็ม')}</p>`;
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
function render(){
 document.body.dataset.lg=lg;document.documentElement.lang=lg;
 document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lg));
 const have=terms.filter(t=>an(t.key)).length;
 document.getElementById('t-badge').textContent=L('Credit Analyst AI Workshop · Section 01 · Google Trends','เวิร์กช็อป AI สำหรับนักวิเคราะห์สินเชื่อ · ส่วนที่ 01 · Google Trends');
 document.getElementById('t-title').innerHTML=L('What is Thailand <em>worried</em> about?<br>Credit signals from 5 years of Google searches','คนไทย<em>กังวล</em>เรื่องอะไร?<br>สัญญาณสินเชื่อจากการค้นหา Google 5 ปี');
 document.getElementById('t-sub').textContent=L('Free, public, early clues for corporate credit analysts: borrower stress, sector demand, rates, the bond market and household strain — in Thai and English searches.','เบาะแสล่วงหน้า ฟรี และเป็นข้อมูลสาธารณะสำหรับนักวิเคราะห์สินเชื่อธุรกิจ: ลูกหนี้ตึงตัว ความต้องการรายอุตสาหกรรม ดอกเบี้ย ตลาดหุ้นกู้ และภาระครัวเรือน จากคำค้นทั้งภาษาไทยและอังกฤษ');
 document.getElementById('stats').innerHTML=[[have+'/'+terms.length,L('search words with data','คำค้นที่มีข้อมูล')],['5',L('credit themes','หมวดสินเชื่อ')],['5 '+L('yrs','ปี'),L('weekly, Thailand','รายสัปดาห์ ประเทศไทย')],['TH + EN',L('search languages','ภาษาคำค้น')]].map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
 document.getElementById('fresh').innerHTML=`${L('Google Trends data retrieved','ดึงข้อมูล Google Trends เมื่อ')}: <b>${fmtRet(T.retrieved)}</b> · ${L('source: Google Trends (trends.google.com) via pytrends · nothing updates by itself','ที่มา: Google Trends ผ่าน pytrends · ไม่อัปเดตอัตโนมัติ')}`;
 const nav=[['pulse',L('5-year pulse','ชีพจร 5 ปี')],['movers',L('Biggest movers','เปลี่ยนมากสุด')],['howto',L('How to read','วิธีอ่าน')],...TH.map(t=>['th-'+t.id,t.icon+' '+L(t.en,t.th)]),['compare',L('Compare','เปรียบเทียบ')],['try',L('Try it yourself','ลองเอง')],['clone',L('Clone / refresh','โคลน / อัปเดต')]];
 document.getElementById('navin').innerHTML=nav.map(n=>`<a href="#${n[0]}">${n[1]}</a>`).join('');
 const S=(id,h,lede,body)=>`<section id="${id}"><h2>${h}</h2>${lede?`<p class="lede">${lede}</p>`:''}${body}</section>`;
 document.getElementById('main').innerHTML=
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
