import {steps} from './data/extrusion.js';
import {profile} from '../../content/profile.js';
import {languageController} from '../../shared/language.js';
// 製程說明與個人心法分開呈現，核心步驟固定為六步。
const copy={
zh:{title:'鋁擠型：從材料到型材',label:'01 / PROCESS KNOWLEDGE',intro:'六個核心步驟，連結製程知識與管理思考。點選步驟，探索每個交接背後要確認的事。',boundary:'一般製程示意，非公司 SOP。實際路線依材料、產品與工廠條件調整；不代表本人操作所有工序。',back:'← 返回首頁',flow:'核心流程',instruction:'點選步驟查看詳情，也可使用 Tab 與 Enter／Space 操作。',selected:'已選取',view:'查看',step:'步驟',purpose:'目的',description:'製程說明',insight:'管理觀察重點',personal:'個人實務心法',suggestion:'作品集管理觀點',check:'交接時確認',source:'製程參考',traceLabel:'MANAGEMENT THREAD / LOT TRACEABILITY',traceTitle:'批號，是連結每一站的線索。',traceCopy:'從原料到成品，以批號串聯每批的生產紀錄。客訴發生時，可據此追查製程、縮小受影響範圍並協助原因調查。這裡呈現管理思路；完整批號追溯功能尚未開發。',branchLabel:'SUPPLEMENTARY / OUTSIDE THE CORE FLOW',branchTitle:'核心流程之外，仍需關注的交接。',branchNote:'以下為補充分支，不列入六步正式流程。依產品需求安排；本階段僅提供說明，未建立管理系統。',branches:[['A / FABRICATION','後續加工與表面處理','依產品需求安排加工或表面處理。梯具腳管與踏板在焊接、拉釘／鉚釘組裝等階段，同樣重視治具的正確設置；不將這些工序視為定尺鋸切本身。'],['B / INSPECTION','檢查與出貨驗貨','檢查可貫穿製程，並於交付前核對要求、記錄與異常處置。品質風險與出貨驗貨功能預留擴充，尚未實作。'],['C / DELIVERY','包裝與交付準備','核對包裝保護、數量、標示與交期，銜接交付需求。完整包裝、出貨管理與批號查詢功能尚未實作。']]},
en:{title:'Aluminium extrusion: from billet to profile',label:'01 / PROCESS KNOWLEDGE',intro:'Six core steps connecting process knowledge with management thinking. Select a step to explore what needs to be checked at each handoff.',boundary:'A general overview, not a company SOP. Actual routes depend on material, product, and plant conditions. This does not imply hands-on operation of every process.',back:'← Back to home',flow:'Core process',instruction:'Select a step, or navigate with Tab and Enter / Space.',selected:'Selected',view:'View',step:'STEP',purpose:'Purpose',description:'Process description',insight:'Management considerations',personal:'Personal practical insight',suggestion:'Portfolio management perspective',check:'Handoff check',source:'Process reference',traceLabel:'MANAGEMENT THREAD / LOT TRACEABILITY',traceTitle:'A lot number connects the handoffs.',traceCopy:'Link each lot’s production records from raw material to finished product. When a complaint arises, these links help trace operations, narrow the affected scope, and support root-cause investigation. This illustrates the management approach; a full traceability system is not yet implemented.',branchLabel:'SUPPLEMENTARY / OUTSIDE THE CORE FLOW',branchTitle:'Beyond the core process: the next handoffs.',branchNote:'These supplementary branches are outside the six core steps. Routes depend on the product. This phase provides explanations, not operational management systems.',branches:[['A / FABRICATION','Further fabrication & finishing','Arrange fabrication or finishing to meet product needs. For ladder leg tubes and steps, correct fixture setup also matters in welding and riveted assembly. These are separate operations from cutting to length.'],['B / INSPECTION','Inspection & shipment checks','Checks may occur throughout production and before delivery. Review requirements, records, and issue resolution. Quality risk and shipment inspection features are reserved for future development.'],['C / DELIVERY','Packing & delivery preparation','Check product protection, quantities, labels, and schedules against delivery needs. Full packing, shipment management, and lot lookup features are not yet implemented.']]}
};
let selected=0, language='zh';
const mobile=matchMedia('(max-width:600px)');
const set=(id,text)=>document.getElementById(id).textContent=text;
function details(index,id){
 const s=steps[index], d=s[language], c=copy[language];
 const personal=index===0||index===4;
 return `<div class="detail-top"><span>${c.step} ${s.id} / 06</span><span>SCM / YVONNE SHEN</span></div><h2 id="${id}">${d.name}</h2><p class="tagline">${d.tagline}</p><div class="detail-block"><h3>${c.purpose}</h3><p>${d.purpose}</p></div><div class="detail-block"><h3>${c.description}</h3><p>${d.description}</p></div><div class="detail-block insight"><span class="suggestion">${personal?c.personal:c.suggestion}</span><h3>${c.insight}</h3><p>${d.insight}</p></div><div class="detail-block"><h3>${c.check}</h3><p>${d.check}</p></div><p class="source">${c.source}: <a href="${s.source[1]}">${s.source[0]}</a></p>`;
}
function select(index){
 selected=index;
 const c=copy[language];
 set('count',`${index+1} / 6`);
 document.querySelectorAll('.step-button').forEach((button,i)=>{
  const active=i===index;
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-controls',mobile.matches?`mobile-${i}`:'desktop-detail');
  if(mobile.matches) button.setAttribute('aria-expanded',String(active));
  else button.removeAttribute('aria-expanded');
  button.querySelector('.step-state').textContent=active?c.selected:c.view;
  const panel=document.getElementById(`mobile-${i}`);
  panel.hidden=!active||!mobile.matches;
  panel.innerHTML=active&&mobile.matches?details(i,`mobile-title-${i}`):'';
 });
 document.getElementById('desktop-detail').innerHTML=details(index,'detail-title');
}
languageController(next=>{
 language=next;
 const c=copy[next], p=profile[next];
 document.title=`${c.title} — SCM Portfolio`;
 [['brand-title',p.name],['skip',p.skip],['footer-copy',p.footer]].forEach(([id,text])=>set(id,text));
 ['title','intro','boundary','back','instruction'].forEach(id=>set(id,c[id]));
 [['process-label','label'],['flow-title','flow'],['trace-label','traceLabel'],['trace-title','traceTitle'],['trace-copy','traceCopy'],['branch-label','branchLabel'],['branch-title','branchTitle'],['branch-note','branchNote']].forEach(([id,key])=>set(id,c[key]));
 document.getElementById('flow').innerHTML=steps.map((s,i)=>`<li><button type="button" class="step-button" data-step="${i}"><span class="step-id" aria-hidden="true">${s.id}</span><span class="step-name">${s[language].name}</span><span class="step-state"></span></button><section class="detail mobile-detail" id="mobile-${i}" aria-labelledby="mobile-title-${i}" hidden></section></li>`).join('');
 document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.step))));
 document.getElementById('branches').innerHTML=c.branches.map(([label,name,body])=>`<article class="branch"><p class="eyebrow">${label}</p><h3>${name}</h3><p>${body}</p></article>`).join('');
 select(selected);
});
mobile.addEventListener('change',()=>select(selected));
