/* ============================================================
   PayMo Business — shared helpers for the 5 consolidated pages
   ============================================================ */
/* ---------- utilities ---------- */
function openModal(id){ let el=document.getElementById(id); if(el) new bootstrap.Modal(el).show(); }
function closeModal(id){ let el=document.getElementById(id); if(el){ let m=bootstrap.Modal.getInstance(el); if(m) m.hide(); } }

let _toastT;
function toast(msg){
  let t=document.getElementById('pmToast'), m=document.getElementById('pmToastMsg');
  if(!t){ t=document.createElement('div'); t.id='pmToast'; t.className='pm-toast'; t.innerHTML='<i class="bi bi-check-circle-fill"></i><span id="pmToastMsg"></span>'; document.body.appendChild(t); m=t.querySelector('span'); }
  m.textContent=msg; t.classList.add('show');
  clearTimeout(_toastT); _toastT=setTimeout(()=>t.classList.remove('show'),2800);
}

/* ---------- generic tab pills ---------- */
function tabSwitch(btn,id){
  btn.closest('.pm-tab-pills').querySelectorAll('.pm-tab-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  let body=btn.closest('.modal-body');
  if(body){ body.querySelectorAll('[data-tabpanel]').forEach(el=>{ el.style.display='none'; }); let p=body.querySelector('[data-tabpanel="'+id+'"]'); if(p) p.style.display='block'; }
}

/* ---------- loading + success receipt (matches legacy doAction) ---------- */
function showLoading(containerId,cb){
  let el=document.getElementById(containerId);
  let ov=document.createElement('div'); ov.className='pm-loading-overlay';
  ov.innerHTML='<div class="pm-spinner"></div><p style="margin-top:12px;font-weight:600">Processing...</p>';
  el.style.position='relative'; el.appendChild(ov);
  setTimeout(()=>{ ov.remove(); cb(); },1200);
}
function simulateProcess(modalId,msg,ref=''){
  let modal=document.getElementById(modalId);
  let body=modal.querySelector('.modal-body'), foot=modal.querySelector('.modal-footer');
  showLoading(body.id||body.parentElement.id||body.tagName,()=>{
    body.innerHTML=`<div class="text-center p-4">
      <div class="pm-icon-circle round mx-auto mb-3" style="width:64px;height:64px;font-size:28px;background:var(--pm-accent-soft);color:var(--pm-accent)"><i class="bi bi-check-lg"></i></div>
      <h5 style="font-weight:700">${msg}</h5>${ref?`<p style="font-size:12px;color:var(--pm-muted)">Ref: ${ref}</p>`:''}
    </div>`;
    foot.innerHTML=`<button class="pm-btn pm-btn-primary" onclick="location.reload()">Done</button>`;
  });
}

/* ---------- generic stepper engine for multistep wizards ---------- */
let _flows = {};
function initFlow(key, total){ _flows[key]=1; }
function stepHTML(current,total){
  let h=''; for(let i=1;i<=total;i++){
    let cls=i<current?'completed':i===current?'active':''; let num=i<current?'<i class="bi bi-check"></i>':i;
    h+=`<div class="pm-step ${cls}"><div class="pm-step-num">${num}</div></div>`;
    if(i<total) h+=`<div style="flex:1;height:2px;background:${i<current?'var(--pm-accent)':'var(--pm-border)'};margin:0 8px"></div>`;
  }
  return h;
}
function setStep(prefix,step,total,nextBtnId){
  for(let i=1;i<=total;i++){ let e=document.getElementById(prefix+'Step'+i); if(e){e.classList.remove('active');e.style.display='none';} }
  let a=document.getElementById(prefix+'Step'+step); if(a){a.classList.add('active');a.style.display='block';}
  let st=document.getElementById(prefix+'Stepper'); if(st) st.innerHTML=stepHTML(step,total);
  let nb=document.getElementById(nextBtnId);
  if(nb) nb.innerHTML = step===total ? 'Finish <i class="bi bi-check-lg"></i>' : 'Continue <i class="bi bi-arrow-right"></i>';
}
/* convenience: run one step forward for a flow (prefix, total, nextBtnId, onFinish) */
function nextStep(prefix,total,nextBtnId,onFinish){
  let k=prefix; let cur=_flows[k]||1;
  if(cur===total-1){ let el=document.getElementById(prefix+'Step'+total); if(el){ el.classList.add('active'); el.style.display='block'; } let st=document.getElementById(prefix+'Stepper'); if(st) st.innerHTML=stepHTML(total,total); let nb=document.getElementById(nextBtnId); if(nb) nb.innerHTML='Finish <i class="bi bi-check-lg"></i>'; _flows[k]=total; return; }
  if(cur>=total){ if(onFinish) onFinish(); else toast('Completed'); return; }
  _flows[k]=cur+1; setStep(prefix,_flows[k],total,nextBtnId);
}

/* ---------- clock ---------- */
function tickClock(){
  document.querySelectorAll('[data-clock]').forEach(el=>{
    const tz=el.dataset.clock; try{ el.textContent=new Date().toLocaleTimeString('en-GB',{timeZone:tz||undefined,hour:'2-digit',minute:'2-digit',second:'2-digit'}); }catch(e){ el.textContent='--:--'; }
  });
  const d=document.getElementById('pmDate'),t=document.getElementById('pmTime');
  if(d) d.textContent=new Date().toLocaleDateString('en-KE',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  if(t) t.textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
}
document.addEventListener('DOMContentLoaded',()=>{ tickClock(); setInterval(tickClock,1000); });
