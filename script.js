(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // Boot sequence
  const boot = $('#boot');
  window.setTimeout(() => boot?.classList.add('done'), 3600);
  const bootLog = $('#bootLog');
  const bootLines = [
    'initializing portfolio kernel...',
    'loading appsec modules...',
    'mounting project archive...',
    'checking defensive controls...',
    'opening visitor shell...',
    'system ready.'
  ];
  if (boot && bootLog && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bootLines.forEach((line, i) => setTimeout(() => {
      const row = document.createElement('div');
      row.textContent = line;
      bootLog.appendChild(row);
      if (i === bootLines.length - 1) setTimeout(() => boot.classList.add('done'), 450);
    }, 150 + i * 180));
  } else if (boot) {
    boot.classList.add('done');
  }

  // Mobile navigation
  const navToggle = $('#navToggle');
  const primaryNav = $('#primaryNav');
  const closeNav = () => {
    primaryNav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
  };
  navToggle?.addEventListener('click', () => {
    const open = !primaryNav?.classList.contains('open');
    primaryNav?.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  primaryNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNav();
  });
  addEventListener('resize', () => {
    if (innerWidth > 980) closeNav();
  });

  // Typewriter role loop
  const typeEl = $('#typewriter');
  const roles = [
    'Security Engineering',
    'Application Security',
    'VAPT / Offensive Security',
    'SOC & Detection Engineering',
    'Cloud Security',
    'Security Automation'
  ];
  let role = 0, char = 0, deleting = false;
  function typeLoop() {
    if (!typeEl) return;
    const text = roles[role];
    typeEl.textContent = deleting ? text.slice(0, char--) : text.slice(0, char++);
    let delay = deleting ? 45 : 75;
    if (!deleting && char > text.length) { deleting = true; delay = 1250; }
    else if (deleting && char < 0) { deleting = false; role = (role + 1) % roles.length; char = 0; delay = 320; }
    setTimeout(typeLoop, delay);
  }
  typeLoop();

  // Reveal animation
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Matrix canvas
  const canvas = $('#matrix');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    const chars = '01アイウエオカキクケコサシスセソ{}[]<>/\\$#@';
    const fontSize = 15;
    let drops = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array(Math.ceil(innerWidth / fontSize)).fill(0).map(() => Math.random() * -80);
    };
    resize();
    addEventListener('resize', resize);
    setInterval(() => {
      ctx.fillStyle = 'rgba(5,8,7,.11)';
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.fillStyle = '#75ff94';
      ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, y * fontSize);
        if (y * fontSize > innerHeight && Math.random() > .975) drops[i] = 0;
        drops[i]++;
      });
    }, 55);
  }


  // Interactive pseudo-3D cyber threat sphere
  const orbCanvas = $('#cyberOrb');
  const orbWrap = $('#cyberOrbWrap');
  const orbModeLabel = $('#orbModeLabel');
  let orbMode = 'network';

  const setOrbMode = mode => {
    if (!['network', 'threat', 'defense'].includes(mode)) return;
    orbMode = mode;
    if (orbWrap) {
      orbWrap.classList.toggle('mode-threat', mode === 'threat');
      orbWrap.classList.toggle('mode-defense', mode === 'defense');
    }
    $$('.orb-control').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.orbMode === mode);
    });
    if (orbModeLabel) {
      orbModeLabel.textContent = {
        network: 'NETWORK MAP',
        threat: 'THREAT HUNT',
        defense: 'DEFENSE GRID'
      }[mode];
    }
  };

  try {
    $$('.orb-control').forEach(btn => {
      btn.addEventListener('click', () => setOrbMode(btn.dataset.orbMode));
    });

    if (orbCanvas && orbWrap) {
      const ctx = orbCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      const nodeCount = 108;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const nodes = Array.from({ length: nodeCount }, (_, i) => {
        const y = 1 - (i / (nodeCount - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = goldenAngle * i;
        return {
          x: Math.cos(theta) * r,
          y,
          z: Math.sin(theta) * r,
          threat: i % 23 === 0 || i % 37 === 0
        };
      });

      const edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          if (dx * dx + dy * dy + dz * dz < 0.18 && edges.length < 260) edges.push([i, j]);
        }
      }

      let width = 0;
      let height = 0;
      let autoY = 0;
      let tiltX = -0.16;
      let tiltY = 0;
      let targetX = -0.16;
      let targetY = 0;
      let pulse = 0;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const resizeOrb = () => {
        const rect = orbWrap.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        orbCanvas.width = Math.round(width * dpr);
        orbCanvas.height = Math.round(height * dpr);
        orbCanvas.style.width = width + 'px';
        orbCanvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const rotatePoint = (p, ay, ax) => {
        const cy = Math.cos(ay);
        const sy = Math.sin(ay);
        const cx = Math.cos(ax);
        const sx = Math.sin(ax);
        const x1 = p.x * cy - p.z * sy;
        const z1 = p.x * sy + p.z * cy;
        return {
          x: x1,
          y: p.y * cx - z1 * sx,
          z: p.y * sx + z1 * cx
        };
      };

      const projectPoint = p => {
        const perspective = 3.25;
        const depth = perspective / (perspective - p.z);
        const scale = Math.min(width, height) * 0.31;
        return {
          x: width / 2 + p.x * scale * depth,
          y: height / 2 + p.y * scale * depth,
          z: p.z,
          depth
        };
      };

      const drawOrb = () => {
        ctx.clearRect(0, 0, width, height);
        if (!reducedMotion) autoY += orbMode === 'threat' ? 0.0052 : 0.0032;
        pulse += 0.045;
        tiltX += (targetX - tiltX) * 0.055;
        tiltY += (targetY - tiltY) * 0.055;

        const transformed = nodes.map(n => {
          const rotated = rotatePoint(n, autoY + tiltY, tiltX);
          return { ...projectPoint(rotated), threat: n.threat };
        });

        ctx.lineWidth = 0.7;
        for (const [a, b] of edges) {
          const p1 = transformed[a];
          const p2 = transformed[b];
          const front = Math.max(0.08, ((p1.z + p2.z) / 2 + 1) / 2);
          if (orbMode === 'threat' && (p1.threat || p2.threat)) {
            ctx.strokeStyle = `rgba(255,107,120,${0.18 + front * 0.22})`;
          } else if (orbMode === 'defense') {
            ctx.strokeStyle = `rgba(107,200,255,${0.07 + front * 0.18})`;
          } else {
            ctx.strokeStyle = `rgba(117,255,148,${0.06 + front * 0.18})`;
          }
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        if (orbMode === 'defense') {
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.strokeStyle = 'rgba(107,200,255,.18)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(
              0,
              0,
              Math.min(width, height) * (.27 + i * .045),
              Math.min(width, height) * (.09 + i * .017),
              autoY * (i % 2 ? -1 : 1),
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }
          ctx.restore();
        }

        transformed
          .map((p, i) => ({ ...p, i }))
          .sort((a, b) => a.z - b.z)
          .forEach(p => {
            const alpha = 0.2 + ((p.z + 1) / 2) * 0.8;
            const threatActive = orbMode === 'threat' && p.threat;
            const radius = (threatActive ? 2.8 : 1.4) * p.depth;

            if (threatActive) {
              ctx.strokeStyle = `rgba(255,107,120,${0.28 + Math.sin(pulse + p.i) * 0.12})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 6 + Math.sin(pulse + p.i) * 2, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = `rgba(255,107,120,${alpha})`;
            } else if (orbMode === 'defense') {
              ctx.fillStyle = `rgba(107,200,255,${alpha * .9})`;
            } else {
              ctx.fillStyle = `rgba(117,255,148,${alpha})`;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.8, radius), 0, Math.PI * 2);
            ctx.fill();
          });

        const core = 5 + Math.sin(pulse) * 1.4;
        ctx.fillStyle =
          orbMode === 'threat'
            ? 'rgba(255,107,120,.85)'
            : orbMode === 'defense'
              ? 'rgba(107,200,255,.85)'
              : 'rgba(117,255,148,.85)';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, core, 0, Math.PI * 2);
        ctx.fill();

        if (!reducedMotion) requestAnimationFrame(drawOrb);
      };

      resizeOrb();
      if ('ResizeObserver' in window) {
        new ResizeObserver(() => resizeOrb()).observe(orbWrap);
      } else {
        addEventListener('resize', resizeOrb);
      }

      orbWrap.addEventListener('pointermove', event => {
        const rect = orbWrap.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        targetY = nx * 0.7;
        targetX = -0.16 + ny * 0.48;
      });

      orbWrap.addEventListener('pointerleave', () => {
        targetX = -0.16;
        targetY = 0;
      });

      drawOrb();
    }
  } catch (error) {
    console.warn('3D visualization disabled:', error);
    if (orbWrap) orbWrap.classList.add('orb-fallback');
    if (orbModeLabel) orbModeLabel.textContent = 'TELEMETRY READY';
  }

  // Pointer-reactive project cards
  try {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.tilt-card').forEach(card => {
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty('--ry', `${x * 7}deg`);
          card.style.setProperty('--rx', `${y * -6}deg`);
        });
        card.addEventListener('pointerleave', () => {
          card.style.setProperty('--ry', '0deg');
          card.style.setProperty('--rx', '0deg');
        });
      });
    }
  } catch (error) {
    console.warn('3D card tilt disabled:', error);
  }

  // Terminal
  const form = $('#terminalForm');
  const input = $('#terminalInput');
  const output = $('#terminalOutput');
  const terminalWindow = $('#terminalWindow');
  const history = [];
  let historyIndex = 0;

  const links = {
    github: 'https://github.com/simplyy-shadin',
    linkedin: 'https://www.linkedin.com/in/shadin-k-v-cybersecurity/',
    tryhackme: 'https://tryhackme.com/p/simplyy.hacker',
    medium: 'https://medium.com/@shdnkval',
    x: 'https://x.com/simplyy_shadin',
    email: 'mailto:shdnkval@gmail.com'
  };

  const commands = {
    help: () => `Available commands:\n\n  about       short profile\n  whoami      identity + current focus\n  skills      capability summary\n  projects    selected project index\n  contact     contact channels\n  socials     public profiles\n  education   education summary\n  experience  current experience\n  github      open GitHub\n  linkedin    open LinkedIn\n  tryhackme   open TryHackMe\n  email       open email client\n  resume      resume/CV status\n  scan        run visual threat scan\n  defend      activate defense grid\n  matrix      boost background matrix\n  trace       simulated safe route trace\n  clear       clear terminal\n  banner      show terminal banner\n\nTip: type 'open github' or 'open linkedin'.`,
    about: () => `Shadin K V — aka simplyy-hacker — cybersecurity student and builder focused on Security Engineering, AppSec/Product Security, VAPT, SOC/detection, cloud security and automation.`,
    whoami: () => `user: Shadin K V\nalias: simplyy-hacker\nrole: Cybersecurity Intern / Security Engineering learner\nprimary_track: Security Engineering -> AppSec/Product Security -> Cloud/AI Security\nsecondary_tracks: VAPT | SOC | Detection Engineering | Cloud Security\nlocation: Kerala, India`,
    skills: () => `appsec: OWASP, Burp Suite, ZAP, threat modeling, API security, secure auth\nvapt: Nmap, Nuclei, ffuf, Nikto, sqlmap, XSStrike, recon, reporting\ndevsecops: GitHub Actions, Semgrep, Gitleaks, Trivy, Checkov, SBOM, containers, Kubernetes\nsoc: Wazuh, Suricata, Elastic/Kibana, SIEM rules, log analysis, SOAR workflows\ncloud: AWS EC2/VPC/CloudTrail/Lambda/WAF concepts\nengineering: Python, FastAPI, Flask, REST, SQLite, Linux, Docker, Git`,
    projects: () => `PX-01  VAPTForge\nPX-02  SecureFlow DevSecOps\nPX-03  Cloud SOC on AWS\nPX-04  File Integrity + Jira Automation\nPX-05  Network Packet Visualizer\n\nRun 'github' to explore the repositories.`,
    contact: () => `email     shdnkval@gmail.com\ngithub    github.com/simplyy-shadin\nlinkedin  linkedin.com/in/shadin-k-v-cybersecurity/\n\nCommands: email | github | linkedin`,
    socials: () => `GitHub    https://github.com/simplyy-shadin\nLinkedIn  https://www.linkedin.com/in/shadin-k-v-cybersecurity/\nTryHackMe https://tryhackme.com/p/simplyy.hacker\nMedium    https://medium.com/@shdnkval\nX         https://x.com/simplyy_shadin`,
    education: () => `Bachelor of Science (Honors) in Data Science & Artificial Intelligence\nIIT Guwahati — ongoing\n\nHigher Secondary Education — Biology Science\n2022-2024 — 91%`,
    experience: () => `Cybersecurity Intern — Brototype\n2024 -> Present\nHands-on work across SOC, VAPT, application security, cloud security, security tooling and projects.`,
    resume: () => `CV variants available for Security Engineering/AppSec, VAPT, SOC and general cybersecurity positioning.\nAdd downloadable PDF links here when you publish your final CV files.`,
    scan: () => {
      setOrbMode('threat');
      orbWrap?.classList.remove('scan-flash');
      void orbWrap?.offsetWidth;
      orbWrap?.classList.add('scan-flash');
      setTimeout(() => addLine('<span class="amber-text">[scan]</span> enumerating visible portfolio attack surface...'), 180);
      setTimeout(() => addLine('<span class="amber-text">[scan]</span> correlating telemetry: AppSec / VAPT / SOC / Cloud'), 520);
      setTimeout(() => addLine('<span class="green-text">[result]</span> demo scan complete — no real target was contacted.'), 950);
      return `visual threat scan initialized — 3D telemetry switched to THREAT HUNT`;
    },
    defend: () => {
      setOrbMode('defense');
      orbWrap?.classList.add('scan-flash');
      setTimeout(() => orbWrap?.classList.remove('scan-flash'), 900);
      return `defense grid active — monitoring nodes and containment rings enabled`;
    },
    matrix: () => {
      document.body.classList.toggle('matrix-boost');
      return document.body.classList.contains('matrix-boost')
        ? `matrix intensity: BOOSTED`
        : `matrix intensity: NORMAL`;
    },
    trace: () => `TRACE (simulation only)\nvisitor -> portfolio edge -> project archive -> terminal shell\nlatency: 13ms | encryption: aesthetic-grade | status: CONNECTED`,
    banner: () => `███████╗██╗  ██╗██╗   ██╗\n██╔════╝██║ ██╔╝██║   ██║\n███████╗█████╔╝ ██║   ██║\n╚════██║██╔═██╗ ╚██╗ ██╔╝\n███████║██║  ██╗ ╚████╔╝\n╚══════╝╚═╝  ╚═╝  ╚═══╝\n  security through engineering`,
  };

  const escapeHTML = value => value.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const addLine = (html, className = '') => {
    const line = document.createElement('div');
    if (className) line.className = className;
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };
  const openLink = key => {
    const url = links[key];
    if (!url) return false;
    addLine(`<span class="blue-text">[open]</span> ${escapeHTML(url.replace('mailto:',''))}`);
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  };
  const runCommand = raw => {
    const command = raw.trim();
    if (!command) return;
    addLine(`<span class="green-text">visitor@shadin:~$</span> ${escapeHTML(command)}`);
    const [base, arg] = command.toLowerCase().split(/\s+/, 2);
    if (base === 'clear') { output.innerHTML = ''; return; }
    if (base === 'open' && arg) {
      if (!openLink(arg)) addLine(`unknown target: ${escapeHTML(arg)}`, 'error-text');
      return;
    }
    if (links[base]) { openLink(base); return; }
    if (base === 'medium') { openLink('medium'); return; }
    if (base === 'x') { openLink('x'); return; }
    if (commands[base]) {
      const text = commands[base]();
      addLine(escapeHTML(text).replace(/\n/g, '<br>'));
    } else {
      addLine(`command not found: ${escapeHTML(base)} — type <span class="green-text">help</span>`, 'error-text');
    }
  };

  if (form && input && output) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const value = input.value;
      if (value.trim()) { history.push(value); historyIndex = history.length; }
      runCommand(value);
      input.value = '';
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (historyIndex > 0) input.value = history[--historyIndex] || ''; }
      if (e.key === 'ArrowDown') { e.preventDefault(); if (historyIndex < history.length) input.value = history[++historyIndex] || ''; }
      if (e.key === 'Tab') {
        e.preventDefault();
        const options = [...new Set([...Object.keys(commands), ...Object.keys(links), 'socials', 'education', 'experience', 'scan', 'defend', 'matrix', 'trace'])];
        const matches = options.filter(cmd => cmd.startsWith(input.value.toLowerCase()));
        if (matches.length === 1) input.value = matches[0];
      }
    });
    terminalWindow?.addEventListener('click', event => {
      if (window.matchMedia('(pointer: fine)').matches || event.target === input || event.target.closest('.terminal-input-row')) {
        input.focus();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); output.innerHTML = ''; input.focus(); }
    });
  }

  $('#year').textContent = new Date().getFullYear();
  const checksum = [...'shadin-k-v-cyber-portfolio'].reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0), 0) >>> 0;
  $('#fakeChecksum').textContent = checksum.toString(16).padStart(8, '0').toUpperCase() + '-PORTFOLIO';
})();
