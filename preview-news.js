/* PREVIEW: Thai Credit Risk headlines panel (Bloomberg-style). Data: data/credit_news.js */
(function(){
const css=`#crnews{background:#0b0d0f;color:#e8e6e1;border-radius:12px;padding:16px 18px;margin:18px 0 6px;border:1px solid #23282c;font-family:"Inter","Noto Sans Thai",system-ui,sans-serif}
#crnews h2{margin:0 0 10px;display:flex;justify-content:space-between;align-items:center;font-size:15px;letter-spacing:.06em;color:#ffb000}
#crnews .bkh{color:#ff3b3b;display:inline-flex;align-items:center;gap:8px;animation:crbl 1.4s steps(2) infinite}
#crnews .dot{width:10px;height:10px;border-radius:50%;background:#ff3b3b;animation:crpu 1.2s ease-in-out infinite}
@keyframes crpu{0%,100%{opacity:1;box-shadow:0 0 0 0 #ff3b3b88}50%{opacity:.35;box-shadow:0 0 0 6px #ff3b3b00}}
@keyframes crbl{50%{color:#fff}}
#crnews .r{font:12px ui-monospace,Menlo,monospace;color:#8a8f94}
#crnews ul{list-style:none;margin:0;padding:0}#crnews li{border-top:1px solid #1e2327}
#crnews li a{display:block;padding:9px 2px;text-decoration:none;color:#f2f0ea}#crnews li a:hover .tt{color:#ffb000}
#crnews .tt{font-size:15.5px;line-height:1.4}
#crnews .mt{color:#8a8f94;font:12px ui-monospace,Menlo,monospace;margin-top:3px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#crnews .chip{background:#2a1c00;color:#ffb000;border-radius:3px;padding:1px 6px}#crnews .chip.hot{background:#c8102e;color:#fff}
#crnews .more{display:none}#crnews .more.open{display:block}
#crnews .mbtn{margin-top:8px;width:100%;background:#15191c;color:#ffb000;border:1px solid #2a3035;border-radius:6px;padding:7px;font:13px ui-monospace,Menlo,monospace;cursor:pointer}
#crnews .disc{color:#6c7277;font-size:11.5px;margin-top:8px}`;
document.head.insertAdjacentHTML('beforeend','<style>'+css+'</style>');
const N=window.CREDIT_NEWS||{items:[]},it=N.items.slice(0,15);
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const th=()=>document.body.dataset.lg==='th',L=(e,t)=>th()?t:e;
const bkk=u=>{const d=new Date(Date.parse(u)+7*3600e3);return d.toISOString().slice(5,10).replace('-','/')+' '+d.toISOString().slice(11,16)+' BKK'};
const ago=u=>{const m=Math.max(0,Math.round((Date.now()-Date.parse(u))/6e4));return m<60?m+'m':m<1440?Math.floor(m/60)+'h':Math.floor(m/1440)+'d'};
const LI=x=>`<li><a href="${esc(x.link)}" target="_blank" rel="noopener"><div class="tt">${esc(x.title)}</div><div class="mt"><span class="chip ${/DEFAULT|RATING/.test(x.tag)?'hot':''}">${esc(x.tag)}</span><span>${esc(x.source)}</span><span>${bkk(x.utc)} · ${ago(x.utc)} ${L('ago','ที่แล้ว')}</span></div></a></li>`;
let open=false;
function html(){return `<div id="crnews"><h2><span class="bkh"><i class="dot"></i>${L('THAI CREDIT RISK · HEADLINES','ข่าวความเสี่ยงสินเชื่อไทย')}</span><span class="r">${L('updated','อัปเดต')} ${bkk(N.updated)}</span></h2><ul>${it.slice(0,5).map(LI).join('')}</ul>${it.length>5?`<div class="more ${open?'open':''}"><ul>${it.slice(5).map(LI).join('')}</ul></div><button class="mbtn" aria-expanded="${open}">${open?L('Show less ▴','แสดงน้อยลง ▴'):L(`+${it.length-5} more ▾`,`ดูเพิ่มอีก ${it.length-5} ข่าว ▾`)}</button>`:''}<div class="disc">${L('Headlines from free public feeds (Google News RSS EN+TH, Bangkok Post). Click to open the original source. Not verified by this site.','พาดหัวจากฟีดสาธารณะฟรี (Google News RSS ไทย+อังกฤษ, Bangkok Post) คลิกเพื่อเปิดแหล่งข่าวต้นฉบับ เว็บไซต์นี้ไม่ได้ตรวจสอบเนื้อหา')}</div></div>`}
function put(){const s=document.getElementById('creditfg');if(!s||document.getElementById('crnews'))return;s.insertAdjacentHTML('beforebegin',html());
 const b=document.querySelector('#crnews .mbtn');if(b)b.onclick=()=>{open=!open;document.getElementById('crnews').remove();put()}}
put();new MutationObserver(put).observe(document.getElementById('main'),{childList:true});
})();
