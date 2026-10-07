const api=document.querySelector("#api"), url=document.querySelector("#url"),msg=document.querySelector("#msg");
chrome.storage.local.get(["targetUrl","apiBaseUrl"],x=>{url.value=x.targetUrl||""; api.value=x.apiBaseUrl||"";});
document.querySelector("#save").onclick=async()=>{
  const v=url.value.trim(), a=api.value.trim().replace(/\/$/,"");
  if(!/^https?:\/\//i.test(v)){msg.textContent="URL form tidak valid.";return;}
  if(!/^https?:\/\//i.test(a)){msg.textContent="URL Vercel tidak valid.";return;}
  await chrome.storage.local.set({targetUrl:v,apiBaseUrl:a,enabled:true});
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(tab?.id) chrome.tabs.sendMessage(tab.id,{type:"refresh"});
  msg.textContent="Aktif. Buka/refresh halaman target.";
};
document.querySelector("#off").onclick=async()=>{
  await chrome.storage.local.set({enabled:false});
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(tab?.id) chrome.tabs.sendMessage(tab.id,{type:"disable"});
  msg.textContent="Dinonaktifkan.";
};
