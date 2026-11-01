/* PREVIEW: Thai Credit Risk headlines panel (Bloomberg-style). Data: data/credit_news.js */
(function(){
const css=`#crnews{background:var(--card);color:var(--ink);border:1px solid var(--line);border-left:4px solid var(--dn);border-radius:var(--r);padding:14px 16px;margin:18px 0 6px}
#crnews h2{margin:0 0 6px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
#crnews .bkh{color:var(--dn);display:inline-flex;align-items:center;gap:8px;font-weight:800;animation:crbl 1.6s ease-in-out infinite}
#crnews .dot{width:9px;height:9px;border-radius:50%;background:var(--dn);animation:crpu 1.2s ease-in-out infinite}
@keyframes crpu{0%,100%{opacity:1;box-shadow:0 0 0 0 #c2261e66}50%{opacity:.4;box-shadow:0 0 0 6px #c2261e00}}
@keyframes crbl{50%{opacity:.55}}
#crnews .r{font:12px ui-monospace,Menlo,monospace;color:var(--faint);letter-spacing:0;text-transform:none}
#crnews ul{list-style:none;margin:0;padding:0}#crnews li{border-top:1px solid var(--line)}
#crnews li a{display:block;padding:9px 2px;text-decoration:none;color:var(--ink)}#crnews li a:hover .tt{color:var(--acc)}
#crnews .tt{font-size:15px;line-height:1.4;font-weight:600}
#crnews .mt{color:var(--mute);font:12px ui-monospace,Menlo,monospace;margin-top:3px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#crnews .chip{border-radius:4px;padding:1px 7px;font-weight:700;color:#fff;background:var(--fl)}
#crnews .t-DEFAULT{background:#c2261e}#crnews .t-RATING{background:#e8743b}#crnews .t-NPL{background:#f5a524;color:#14181b}#crnews .t-BONDS{background:#0b7a75}#crnews .t-HH{background:#2f6fb0}#crnews .t-BOT{background:#14181b}#crnews .t-BANKS{background:#8b9499}
#crnews .more{display:none}#crnews .more.open{display:block}
#crnews .mbtn{margin-top:8px;width:100%;background:var(--bg);color:var(--acc);border:1px solid var(--line);border-radius:8px;padding:7px;font:600 13px inherit;font-family:inherit;cursor:pointer}#crnews .mbtn:hover{border-color:var(--acc)}
#crnews .disc{color:var(--faint);font-size:11.5px;margin-top:8px}`;
document.head.insertAdjacentHTML('beforeend','<style>'+css+'</style>');
const N=window.CREDIT_NEWS||{items:[]},it=N.items.slice(0,15);
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const th=()=>document.body.dataset.lg==='th',L=(e,t)=>th()?t:e;
const bkk=u=>{const d=new Date(Date.parse(u)+7*3600e3);return d.toISOString().slice(5,10).replace('-','/')+' '+d.toISOString().slice(11,16)+' BKK'};
const ago=u=>{const m=Math.max(0,Math.round((Date.now()-Date.parse(u))/6e4));return m<60?m+'m':m<1440?Math.floor(m/60)+'h':Math.floor(m/1440)+'d'};
const LI=x=>`<li><a href="${esc(x.link)}" target="_blank" rel="noopener"><div class="tt">${esc(x.title)}</div><div class="mt"><span class="chip t-${esc(x.tag.split(' ')[0])}">${esc(x.tag)}</span><span>${esc(x.source)}</span><span>${bkk(x.utc)} · ${ago(x.utc)} ${L('ago','ที่แล้ว')}</span></div></a></li>`;
let open=false;
function html(){return `<div id="crnews"><h2><span class="bkh"><i class="dot"></i>${L('THAI CREDIT RISK · HEADLINES','ข่าวความเสี่ยงสินเชื่อไทย')}</span><span class="r">${L('updated','อัปเดต')} ${bkk(N.updated)}</span></h2><ul>${it.slice(0,5).map(LI).join('')}</ul>${it.length>5?`<div class="more ${open?'open':''}"><ul>${it.slice(5).map(LI).join('')}</ul></div><button class="mbtn" aria-expanded="${open}">${open?L('Show less ▴','แสดงน้อยลง ▴'):L(`+${it.length-5} more ▾`,`ดูเพิ่มอีก ${it.length-5} ข่าว ▾`)}</button>`:''}<div class="disc">${L('Headlines from free public feeds (Google News RSS EN+TH, Bangkok Post). Click to open the original source. Not verified by this site.','พาดหัวจากฟีดสาธารณะฟรี (Google News RSS ไทย+อังกฤษ, Bangkok Post) คลิกเพื่อเปิดแหล่งข่าวต้นฉบับ เว็บไซต์นี้ไม่ได้ตรวจสอบเนื้อหา')}</div></div>`}
function put(){const s=document.getElementById('creditfg');if(!s||document.getElementById('crnews'))return;s.insertAdjacentHTML('beforebegin',html());
 const b=document.querySelector('#crnews .mbtn');if(b)b.onclick=()=>{open=!open;document.getElementById('crnews').remove();put()}}
put();new MutationObserver(put).observe(document.getElementById('main'),{childList:true});
})();
