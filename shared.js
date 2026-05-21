/* shared.js — nav active state + mobile menu + accordion + chat helpers */

// ── Active nav link ──
(function(){
  const links = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const page = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    if(a.getAttribute('href') === page) a.classList.add('active');
  });
})();

// ── Mobile menu ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if(hamburger && mobileMenu){
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── Accordion ──
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const body = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.accordion-btn').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling.classList.remove('open');
    });
    if(!isOpen){ btn.classList.add('open'); body.classList.add('open'); }
  });
});

// ── Scroll-reveal ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Chat helpers ──
function addMsg(text, type, containerId){
  const msgs = document.getElementById(containerId || 'chat-msgs');
  if(!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.innerHTML = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}
function removeTyping(containerId){
  const t = document.querySelector('.typing');
  if(t) t.remove();
}
async function callClaude(userMsg, systemPrompt, containerId){
  addMsg(userMsg, 'user', containerId);
  addMsg('<div class="typing-dots"><span></span><span></span><span></span></div>', 'bot typing', containerId);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:900,
        system: systemPrompt,
        messages:[{role:'user', content: userMsg}]
      })
    });
    const data = await res.json();
    removeTyping(containerId);
    addMsg(data.content[0].text.replace(/\n/g,'<br>'), 'bot', containerId);
  } catch(e) {
    removeTyping(containerId);
    addMsg('Sorry, could not connect right now. Try again! 🙏', 'bot', containerId);
  }
}
