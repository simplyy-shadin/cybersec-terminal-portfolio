(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const STORAGE_KEY = 'skv-hacker-mode-v1';
  const baseScore = 250;
  const answers = {
    recon: '/ops/archive.txt',
    idor: '1007',
    auth: 'client-side authorization',
    soc: '10.0.9.77'
  };

  let state = { solved: {}, hints: {}, score: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    state = {
      solved: saved.solved || {},
      hints: saved.hints || {},
      score: Number.isFinite(saved.score) ? saved.score : 0
    };
  } catch (_) {}

  const normalize = value => value.trim().toLowerCase().replace(/\s+/g, ' ');
  const acceptedAuth = new Set(['client-side authorization','client side authorization','client-side trust','client side trust','broken authorization','authorization bypass']);

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function computeScore() {
    const solved = Object.keys(state.solved).filter(k => state.solved[k]).length;
    const usedHints = Object.keys(state.hints).filter(k => state.hints[k]).length;
    state.score = Math.max(0, solved * baseScore - usedHints * 50);
    persist();
  }

  function rank() {
    if (state.score >= 900 && solvedCount() === 4) return 'ROOTED';
    if (state.score >= 650) return 'OPERATOR';
    if (state.score >= 400) return 'ANALYST';
    if (state.score >= 200) return 'SCOUT';
    return 'RECON';
  }

  function solvedCount() {
    return Object.keys(state.solved).filter(k => state.solved[k]).length;
  }

  function updateUI() {
    computeScore();
    $('#scoreValue').textContent = state.score;
    $('#solvedValue').textContent = solvedCount();
    $('#rankValue').textContent = rank();

    $$('.challenge-card').forEach(card => {
      const id = card.dataset.challenge;
      const solved = !!state.solved[id];
      card.classList.toggle('solved', solved);
      const marker = card.querySelector('[data-state]');
      if (marker) marker.textContent = solved ? 'PWNED' : 'OPEN';
      const form = card.querySelector('.answer-form');
      if (form) {
        const input = form.querySelector('input');
        const button = form.querySelector('button');
        if (input) input.disabled = solved;
        if (button) button.disabled = solved;
      }
      const hintBox = card.querySelector('[data-hintbox]');
      if (hintBox && state.hints[id]) hintBox.hidden = false;
    });

    const complete = solvedCount() === 4;
    const badge = $('#completionBadge');
    badge.classList.toggle('locked', !complete);
    $('#badgeScore').textContent = String(state.score).padStart(4,'0') + ' / 1000';
    $('#copyResult').disabled = !complete;
    if (complete) {
      $('#rewardTitle').textContent = 'Vault unlocked.';
      $('#rewardCopy').textContent = 'You completed the browser-only SKV mini CTF. This badge is a local achievement, not a formal certification.';
      makeCode().then(code => { $('#completionCode').textContent = code; });
    } else {
      $('#rewardTitle').textContent = 'Vault locked.';
      $('#rewardCopy').textContent = 'Solve all four challenges to unlock your local completion badge.';
      $('#completionCode').textContent = 'LOCKED';
    }
  }

  async function makeCode() {
    const raw = 'simplyy-hacker|' + state.score + '|4';
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      return 'SKV-' + [...new Uint8Array(buf)].slice(0,5).map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
    }
    return 'SKV-' + state.score + '-CTF';
  }

  function markSolved(id) {
    if (state.solved[id]) return;
    state.solved[id] = true;
    updateUI();
  }

  function feedback(id, ok, message) {
    const el = $('[data-feedback="' + id + '"]');
    if (!el) return;
    el.textContent = message;
    el.className = 'feedback ' + (ok ? 'ok' : 'bad');
  }

  $$('.answer-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const id = form.dataset.form;
      const input = form.querySelector('input');
      const value = normalize(input?.value || '');
      let ok = false;
      if (id === 'auth') ok = acceptedAuth.has(value);
      else ok = value === answers[id];
      if (ok) {
        markSolved(id);
        feedback(id, true, 'flag accepted // +250');
      } else {
        feedback(id, false, 'nope // investigate again');
      }
    });
  });

  $$('.hint-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.hint;
      const box = $('[data-hintbox="' + id + '"]');
      if (!state.hints[id]) {
        state.hints[id] = true;
        computeScore();
      }
      if (box) box.hidden = false;
      updateUI();
    });
  });

  $('#inspectHeaders')?.addEventListener('click', () => {
    $('#reconConsole').textContent =
      'server: skv-lab\ncontent-type: text/html\nx-powered-by: curiosity\nx-debug-note: archive moved to /ops/archive.txt\ncache-control: no-store\n\n[ simulated response only ]';
  });

  const profiles = {
    1001:{id:1001,user:'guest',team:'visitor'},
    1002:{id:1002,user:'nina',team:'blue'},
    1003:{id:1003,user:'arun',team:'appsec'},
    1004:{id:1004,user:'lee',team:'cloud'},
    1005:{id:1005,user:'mira',team:'soc'},
    1006:{id:1006,user:'dev',team:'engineering'},
    1007:{id:1007,user:'ops-admin',team:'internal',sensitive:'backup console should not be exposed'},
    1008:{id:1008,user:'sam',team:'vapt'},
    1009:{id:1009,user:'jo',team:'detection'},
    1010:{id:1010,user:'kai',team:'platform'}
  };
  $('#fetchProfile')?.addEventListener('click', () => {
    const id = Number($('#profileId').value);
    $('#profileResult').textContent = profiles[id] ? JSON.stringify(profiles[id], null, 2) : '{"error":"not found"}';
  });

  const decodeB64 = token => {
    try {
      const normalized = token.replace(/-/g,'+').replace(/_/g,'/');
      const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
      return JSON.parse(atob(padded));
    } catch (_) { return null; }
  };
  const encodeB64 = obj => btoa(JSON.stringify(obj)).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');

  $('#decodeToken')?.addEventListener('click', () => {
    const data = decodeB64($('#roleToken').value.trim());
    $('#tokenResult').textContent = data ? JSON.stringify(data, null, 2) : 'invalid token';
  });

  $('#verifyToken')?.addEventListener('click', () => {
    const data = decodeB64($('#roleToken').value.trim());
    if (!data) {
      $('#tokenResult').textContent = 'invalid token';
      return;
    }
    if (data.role === 'admin') {
      $('#tokenResult').textContent = 'ACCESS GRANTED\nclient role trusted without server-side authorization\n\nexample admin token:\n' + encodeB64({user:data.user || 'visitor',role:'admin'});
    } else {
      $('#tokenResult').textContent = 'ACCESS DENIED\nrole=' + String(data.role || 'missing');
    }
  });

  $('#copyResult')?.addEventListener('click', async () => {
    const code = $('#completionCode').textContent;
    const text = 'I completed simplyy-hacker\'s browser-only mini CTF — score ' + state.score + '/1000 — rank ' + rank() + ' — ' + code;
    try {
      await navigator.clipboard.writeText(text);
      $('#copyResult').textContent = 'copied ✓';
      setTimeout(() => $('#copyResult').textContent = 'copy achievement', 1400);
    } catch (_) {
      window.prompt('Copy your achievement:', text);
    }
  });

  $('#resetProgress')?.addEventListener('click', () => {
    if (!confirm('Reset Hacker Mode progress and hints?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = { solved:{}, hints:{}, score:0 };
    $$('.feedback').forEach(el => { el.textContent=''; el.className='feedback'; });
    $$('.hint').forEach(el => el.hidden = true);
    $$('.answer-form input').forEach(el => { el.disabled=false; el.value=''; });
    $$('.answer-form button').forEach(el => el.disabled=false);
    updateUI();
  });

  // Matrix background
  const canvas = $('#matrix');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    const chars = '01<>/{}[]#@';
    const size = 16;
    let drops = [];
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1,2);
      canvas.width = innerWidth*dpr; canvas.height = innerHeight*dpr;
      canvas.style.width = innerWidth+'px'; canvas.style.height=innerHeight+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      drops = Array(Math.ceil(innerWidth/size)).fill(0).map(()=>Math.random()*-60);
    };
    resize(); addEventListener('resize',resize);
    setInterval(()=>{
      ctx.fillStyle='rgba(3,7,5,.13)';ctx.fillRect(0,0,innerWidth,innerHeight);
      ctx.fillStyle='#75ff94';ctx.font=size+'px IBM Plex Mono';
      drops.forEach((y,i)=>{ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*size,y*size);if(y*size>innerHeight&&Math.random()>.975)drops[i]=0;drops[i]++;});
    },70);
  }

  updateUI();
})();