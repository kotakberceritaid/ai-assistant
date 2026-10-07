(()=>{
if(window.__AIFA_LOADED__) return; window.__AIFA_LOADED__=true;
let API="";
let root=null, panel=null;

function norm(s){return (s||"").replace(/\s+/g," ").trim();}
function targetMatches(target){
  try{
    const a=new URL(target), b=new URL(location.href);
    return a.origin===b.origin && (a.pathname==="/" || b.pathname.startsWith(a.pathname));
  }catch{return false}
}
function getPageText(){
  const clone=document.body.cloneNode(true);
  clone.querySelectorAll("script,style,noscript,svg").forEach(x=>x.remove());
  return norm(clone.innerText).slice(0,30000);
}
function create(){
  if(root) return;
  root=document.createElement("div"); root.id="aifa-root";
  root.innerHTML=`<div id="aifa-bubble" title="AI Assistant">✦</div>
  <div id="aifa-panel">
    <div class="aifa-head"><b>🤖 AI Assistant</b><button class="aifa-close">×</button></div>
    <button class="aifa-action" data-action="analyze">⚡ Analisis Halaman</button>
    <button class="aifa-action" data-action="auto">🤖 Jawab Otomatis</button>
    <button class="aifa-action" data-action="chat">● Tanya AI</button>
    <button class="aifa-action" data-action="summary">▣ Ringkas Isi</button>
    <button class="aifa-action" data-action="options">✓ Bahas Opsi</button>
    <div id="aifa-result">Target terhubung. Pilih fitur.</div>
  </div>`;
  document.documentElement.appendChild(root);
  const bubble=root.querySelector("#aifa-bubble"), p=root.querySelector("#aifa-panel");
  bubble.onclick=()=>p.classList.toggle("open");
  root.querySelector(".aifa-close").onclick=()=>p.classList.remove("open");
  root.querySelectorAll(".aifa-action").forEach(btn=>btn.onclick=()=>run(btn.dataset.action));
}
function googleFormQuestions(){
  const blocks=[...document.querySelectorAll('[role="listitem"]')];
  return blocks.map((el,i)=>{
    const question=norm(el.innerText).slice(0,2500);
    const opts=[...el.querySelectorAll('[role="radio"],[role="checkbox"]')].map(x=>norm(x.getAttribute("aria-label")||x.innerText));
    return {i,question,options:opts};
  }).filter(x=>x.question);
}
async function autoAnswer(){
  const out=root.querySelector("#aifa-result");
  const qs=googleFormQuestions();
  if(!qs.length){out.textContent="Tidak menemukan pertanyaan Google Form.";return;}
  out.textContent=`Menemukan ${qs.length} pertanyaan. Meminta AI menentukan opsi...`;
  try{
    const r=await fetch(API+"/api/auto-answer",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({questions:qs,url:location.href})});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"API error");
    let done=0;
    for(const a of (data.answers||[])){
      const block=blocksForIndex(a.index)[0];
      if(!block) continue;
      const controls=[...block.querySelectorAll('[role="radio"],[role="checkbox"]')];
      const target=controls.find(c=>{
        const label=norm(c.getAttribute("aria-label")||c.innerText).toLowerCase();
        return label===String(a.option||"").toLowerCase() ||
               label.includes(String(a.option||"").toLowerCase());
      });
      if(target){target.click();done++;}
    }
    out.textContent=`AI memilih ${done} dari ${data.answers?.length||0} jawaban. Periksa hasilnya sebelum mengirim.`;
  }catch(e){out.textContent="Gagal auto-answer: "+e.message}
}
function blocksForIndex(index){
  return [...document.querySelectorAll('[role="listitem"]')].filter((_,i)=>i===Number(index));
}
async function run(action){
  if(action==="auto"){ await autoAnswer(); return; }
  const out=root.querySelector("#aifa-result");
  out.textContent="AI sedang menganalisis...";
  try{
    const r=await fetch(API+"/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action,text:getPageText(),url:location.href})});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"API error");
    out.textContent=data.answer||"Tidak ada hasil.";
  }catch(e){out.textContent="Gagal terhubung ke AI: "+e.message}
}
async function refresh(){
  const s=await chrome.storage.local.get(["targetUrl","enabled","apiBaseUrl"]);
  API=(s.apiBaseUrl||"").replace(/\/$/,"");
  if(!s.enabled || !s.targetUrl || !API || !targetMatches(s.targetUrl)){
    root?.remove(); root=null; return;
  }
  create();
}
chrome.runtime.onMessage.addListener(m=>{if(m.type==="refresh") refresh(); if(m.type==="disable"){root?.remove();root=null}});
refresh();
})();