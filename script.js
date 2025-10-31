// Shared helpers
export function qs(sel, root=document){return root.querySelector(sel)}
export function qsa(sel, root=document){return Array.from(root.querySelectorAll(sel))}
export function toast(msg){
  let t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 14px;border-radius:12px;background:rgba(0,229,255,.12);border:1px solid rgba(0,229,255,.25);color:#e8f3ff;backdrop-filter:blur(6px);z-index:9999;';
  document.body.appendChild(t); setTimeout(()=>t.remove(), 2500);
}

// Neon cursor trail on titles
export function neonTitles(){
  qsa('.title').forEach(el=>{
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * 100;
      el.style.textShadow = `0 0 20px rgba(0,229,255,.35), 0 0 40px rgba(0,255,136,.25)`;
      el.style.background = `linear-gradient(90deg, rgba(0,229,255,.25) ${x-10}%, rgba(0,255,136,.25) ${x+10}%)`;
      el.style['-webkit-background-clip'] = 'text';
      el.style.backgroundClip = 'text';
      el.style.color = 'transparent';
    });
    el.addEventListener('mouseleave', ()=>{ el.style.textShadow=''; el.style.color=''; el.style.background=''; });
  })
}

// Auth helpers (expects firebase.js to define auth, db)
export async function requireAdmin(auth, db){
  return new Promise((resolve, reject)=>{
    auth.onAuthStateChanged(async user=>{
      if(!user) return reject('not-signed-in');
      const doc = await (await import('https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js')).getDoc(
        (await import('https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js')).doc(db, 'users', user.uid)
      );
      if(doc.exists() && doc.data().role === 'admin') resolve(user); else reject('not-admin');
    })
  })
}

// Chatbot init and dock wiring
export function initChatbotUI(){
  const toggle = document.getElementById('chatbot-toggle');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.querySelector('.chatbot-close');
  function setChat(open){ if(!panel) return; panel.hidden = !open; toggle?.setAttribute('aria-expanded', String(open)); }
  toggle?.addEventListener('click', ()=> setChat(panel.hidden));
  closeBtn?.addEventListener('click', ()=> setChat(false));
  document.querySelectorAll('[data-chatbot]')?.forEach(el=> el.addEventListener('click', ()=> setChat(true)));
  // Dock navigation chips with data-nav
  document.querySelectorAll('[data-nav]')?.forEach(el=>{
    el.addEventListener('click', ()=>{ const href = el.getAttribute('data-nav'); if(href) window.location.href = href; });
  });
}


