(() => {
  'use strict';

  const birthdayScreen = document.getElementById('birthdayScreen');
  const siteShell = document.getElementById('siteShell');
  const skipBirthday = document.getElementById('skipBirthday');
  const timerBar = document.getElementById('birthdayTimer');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let birthdayClosed = false;
  let confettiFrame = 0;

  // A short birthday welcome runs on every fresh visit, then reveals the full site.
  function enterSite() {
    if (birthdayClosed) return;
    birthdayClosed = true;
    window.cancelAnimationFrame(confettiFrame);
    birthdayScreen.classList.add('leaving');
    siteShell.classList.remove('is-hidden');
    siteShell.removeAttribute('aria-hidden');
    siteShell.removeAttribute('inert');
    document.body.classList.add('birthday-finished');
    window.setTimeout(() => {
      birthdayScreen.hidden = true;
      document.getElementById('home')?.focus({ preventScroll: true });
    }, 700);
  }

  skipBirthday.addEventListener('click', enterSite);
  if (reducedMotion) {
    timerBar.style.animation = 'none';
    window.setTimeout(enterSite, 1800);
  } else {
    window.setTimeout(enterSite, 5100);
    startConfetti();
  }

  // Lightweight canvas confetti; automatically stops when the intro closes.
  function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0;
    const palette = ['#75e7df', '#a89bff', '#f0a2d3', '#ffcf83', '#d8e7ff'];
    const pieces = Array.from({ length: 95 }, () => ({
      x: Math.random(), y: Math.random() * -1.2, w: 3 + Math.random() * 5,
      h: 5 + Math.random() * 7, speed: .0018 + Math.random() * .0038,
      drift: (Math.random() - .5) * .0018, rotation: Math.random() * 6.28,
      spin: (Math.random() - .5) * .08, color: palette[Math.floor(Math.random() * palette.length)],
      alpha: .5 + Math.random() * .5
    }));
    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    function draw() {
      if (birthdayClosed) { ctx.clearRect(0, 0, width, height); return; }
      ctx.clearRect(0, 0, width, height);
      for (const p of pieces) {
        p.y += p.speed; p.x += p.drift; p.rotation += p.spin;
        if (p.y > 1.08) { p.y = -.04; p.x = Math.random(); }
        if (p.x < -.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -.05;
        ctx.save(); ctx.globalAlpha = p.alpha;
        ctx.translate(p.x * width, p.y * height); ctx.rotate(p.rotation);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      confettiFrame = window.requestAnimationFrame(draw);
    }
    draw();
  }

  // Mobile navigation.
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    mainNav.classList.toggle('open', open);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  // Theme toggle; the setting remains local to this browser.
  const themeToggle = document.getElementById('themeToggle');
  try {
    if (localStorage.getItem('sana-theme') === 'light') document.body.classList.add('light-theme');
  } catch (_) { /* Storage may be unavailable; the site still works. */ }
  themeToggle.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-theme');
    try { localStorage.setItem('sana-theme', light ? 'light' : 'dark'); } catch (_) {}
    themeToggle.setAttribute('aria-label', light ? 'فعال‌سازی پوسته تیره' : 'فعال‌سازی پوسته روشن');
  });

  // Reveal content as it enters the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Scroll progress and active navigation item.
  const progress = document.getElementById('pageProgress');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scrollTicking = false;
  function updateScrollUI() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 145) current = section; });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current?.id}`));
    scrollTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollTicking) { window.requestAnimationFrame(updateScrollUI); scrollTicking = true; }
  }, { passive: true });
  updateScrollUI();

  // A tiny deterministic demo of the visible Python snippet.
  const runButton = document.getElementById('runCode');
  const output = document.getElementById('terminalOutput');
  runButton.addEventListener('click', () => {
    runButton.disabled = true;
    output.textContent = 'در حال اجرا...';
    window.setTimeout(() => {
      output.textContent = 'Hello, Sana!';
      runButton.disabled = false;
      runButton.innerHTML = '<span>↻</span> اجرای دوباره';
    }, 420);
  });

  // Persian calendar year is the date supplied for this birthday celebration.
  document.getElementById('yearNow').textContent = '۱۴۰۵';
})();
