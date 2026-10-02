(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // Boot sequence
  const boot = $('#boot');
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
    help: () => `Available commands:\n\n  about       short profile\n  whoami      identity + current focus\n  skills      capability summary\n  projects    selected project index\n  contact     contact channels\n  socials     public profiles\n  education   education summary\n  experience  current experience\n  github      open GitHub\n  linkedin    open LinkedIn\n  tryhackme   open TryHackMe\n  email       open email client\n  resume      resume/CV status\n  clear       clear terminal\n  banner      show terminal banner\n\nTip: type 'open github' or 'open linkedin'.`,
    about: () => `Shadin K V — cybersecurity student and builder focused on Security Engineering, AppSec/Product Security, VAPT, SOC/detection, cloud security and automation.`,
    whoami: () => `user: Shadin K V\nrole: Cybersecurity Intern / Security Engineering learner\nprimary_track: Security Engineering -> AppSec/Product Security -> Cloud/AI Security\nsecondary_tracks: VAPT | SOC | Detection Engineering | Cloud Security\nlocation: Kerala, India`,
    skills: () => `appsec: OWASP, Burp Suite, ZAP, threat modeling, API security, secure auth\nvapt: Nmap, Nuclei, ffuf, Nikto, sqlmap, XSStrike, recon, reporting\ndevsecops: GitHub Actions, Semgrep, Gitleaks, Trivy, Checkov, SBOM, containers, Kubernetes\nsoc: Wazuh, Suricata, Elastic/Kibana, SIEM rules, log analysis, SOAR workflows\ncloud: AWS EC2/VPC/CloudTrail/Lambda/WAF concepts\nengineering: Python, FastAPI, Flask, REST, SQLite, Linux, Docker, Git`,
    projects: () => `PX-01  VAPTForge\nPX-02  SecureFlow DevSecOps\nPX-03  Cloud SOC on AWS\nPX-04  File Integrity + Jira Automation\nPX-05  Network Packet Visualizer\n\nRun 'github' to explore the repositories.`,
    contact: () => `email     shdnkval@gmail.com\ngithub    github.com/simplyy-shadin\nlinkedin  linkedin.com/in/shadin-k-v-cybersecurity/\n\nCommands: email | github | linkedin`,
    socials: () => `GitHub    https://github.com/simplyy-shadin\nLinkedIn  https://www.linkedin.com/in/shadin-k-v-cybersecurity/\nTryHackMe https://tryhackme.com/p/simplyy.hacker\nMedium    https://medium.com/@shdnkval\nX         https://x.com/simplyy_shadin`,
    education: () => `Bachelor of Science (Honors) in Data Science & Artificial Intelligence\nIIT Guwahati — ongoing\n\nHigher Secondary Education — Biology Science\n2022-2024 — 91%`,
    experience: () => `Cybersecurity Intern — Brototype\n2024 -> Present\nHands-on work across SOC, VAPT, application security, cloud security, security tooling and projects.`,
    resume: () => `CV variants available for Security Engineering/AppSec, VAPT, SOC and general cybersecurity positioning.\nAdd downloadable PDF links here when you publish your final CV files.`,
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
        const options = [...Object.keys(commands), ...Object.keys(links), 'socials', 'education', 'experience'];
        const matches = options.filter(cmd => cmd.startsWith(input.value.toLowerCase()));
        if (matches.length === 1) input.value = matches[0];
      }
    });
    terminalWindow?.addEventListener('click', () => input.focus());
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); output.innerHTML = ''; input.focus(); }
    });
  }

  $('#year').textContent = new Date().getFullYear();
  const checksum = [...'shadin-k-v-cyber-portfolio'].reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0), 0) >>> 0;
  $('#fakeChecksum').textContent = checksum.toString(16).padStart(8, '0').toUpperCase() + '-PORTFOLIO';
})();
