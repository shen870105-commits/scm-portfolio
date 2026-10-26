import {profile} from './profile.js?v=market-release';
import {languageController} from '../shared/language.js';
const set = (id,text) => document.getElementById(id).textContent = text;
languageController(language => {
 const p=profile[language];
 document.title=`${p.name} — Yvonne Shen`;
 [['brand-title','name'],['skip','skip'],['eyebrow','eyebrow'],['hero-title','title'],['hero-subtitle','subtitle'],['intro','intro'],['explore','explore'],['modules-link','modules'],['modules-title','modules'],['cap-label','capLabel'],['cap-title','capTitle'],['footer-copy','footer']].forEach(([id,key])=>set(id,p[key]));
 document.getElementById('capabilities').innerHTML=p.caps.map(([name,description])=>`<article class="cap"><h3>${name}</h3><p>${description}</p></article>`).join('');
 document.getElementById('cards').innerHTML=p.cards.map(([name,description],i)=>`<article class="card ${i===0?'featured':''}"><div class="status">${i===0?p.available:i===1?p.dataStatus:p.soon}</div><span class="card-number" aria-hidden="true">0${i+1}</span><h3>${name}</h3><p>${description}</p><div class="card-end">${i===0?`<a href="modules/processes/index.html">${p.enter} ↗</a>`:i===1?`<a href="modules/market-cost/index.html">${p.dataEnter} ↗</a>`:p.soon}</div></article>`).join('');
});
