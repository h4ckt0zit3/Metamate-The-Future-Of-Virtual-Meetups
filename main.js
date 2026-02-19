/* ========== main.js – MetaMates ========== */

// ---- Three.js Hero Background ----
(function initHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 90);

  // --- Particle field ---
  const particleCount = 2400;
  const positions = new Float32Array(particleCount * 3);
  const colors    = new Float32Array(particleCount * 3);
  const sizes     = new Float32Array(particleCount);

  const paletteSrc = [
    new THREE.Color('#00d4ff'),
    new THREE.Color('#a855f7'),
    new THREE.Color('#06b6d4'),
    new THREE.Color('#7b2fff'),
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 300;
    positions[i3 + 1] = (Math.random() - 0.5) * 220;
    positions[i3 + 2] = (Math.random() - 0.5) * 200;
    const c = paletteSrc[Math.floor(Math.random() * paletteSrc.length)];
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // --- Connecting lines (sparse grid) ---
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
  });
  const lineGroup = new THREE.Group();
  for (let i = 0; i < 60; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3((Math.random() - 0.5) * 260, (Math.random() - 0.5) * 180, (Math.random() - 0.5) * 180),
      new THREE.Vector3((Math.random() - 0.5) * 260, (Math.random() - 0.5) * 180, (Math.random() - 0.5) * 180),
    ]);
    lineGroup.add(new THREE.Line(lineGeo, lineMat));
  }
  scene.add(lineGroup);

  // --- Holographic rings ---
  const ringGroup = new THREE.Group();
  const ringColors = [0x00d4ff, 0xa855f7, 0x06b6d4];
  ringColors.forEach((col, i) => {
    const ringGeo = new THREE.TorusGeometry(18 + i * 10, 0.15, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.18 - i * 0.04,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    ring.rotation.z = (Math.random() - 0.5) * 0.5;
    ring.position.z = -20;
    ringGroup.add(ring);
  });
  scene.add(ringGroup);

  // Orbit sphere
  const sphereGeo = new THREE.SphereGeometry(6, 32, 32);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.08,
    blending: THREE.AdditiveBlending,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(32, 10, -30);
  scene.add(sphere);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate particles gently
    particles.rotation.y = t * 0.018;
    particles.rotation.x = t * 0.008;

    // Ring animations
    ringGroup.children.forEach((r, i) => {
      r.rotation.y = t * (0.12 + i * 0.07);
      r.rotation.z = t * (0.06 + i * 0.04);
    });
    ringGroup.rotation.y = t * 0.05;

    // Sphere rotation
    sphere.rotation.x = t * 0.2;
    sphere.rotation.y = t * 0.3;

    // Camera parallax
    camera.position.x += (mouseX * 12 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 8  - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ---- Navbar scroll ----
(function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  hamburger && hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Active link
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${en.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));
})();

// ---- HUD Clock ----
(function initClock() {
  const el = document.getElementById('hudTime');
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
})();

// ---- Scroll Reveal ----
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        // Stagger children
        const children = en.target.querySelectorAll('.glass-card, .feature-card, .timeline-step');
        children.forEach((c, i) => {
          setTimeout(() => c.classList.add('visible'), i * 120);
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ---- GSAP Animations ----
(function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  gsap.from('.hero-badge',    { opacity: 0, y: 30, duration: 0.8, delay: 0.3, ease: 'power3.out' });
  gsap.from('.hero-title',    { opacity: 0, y: 50, duration: 1,   delay: 0.5, ease: 'power3.out' });
  gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.9, ease: 'power3.out' });
  gsap.from('.hero-buttons',  { opacity: 0, y: 30, duration: 0.8, delay: 1.1, ease: 'power3.out' });
  gsap.from('.hero-stats',    { opacity: 0, y: 30, duration: 0.8, delay: 1.3, ease: 'power3.out' });
  gsap.from('.scroll-indicator', { opacity: 0, duration: 1, delay: 2, ease: 'power3.out' });

  // About cards stagger
  gsap.from('.glass-card', {
    scrollTrigger: { trigger: '.about-cards', start: 'top 80%' },
    opacity: 0, y: 60, stagger: 0.15, duration: 0.8, ease: 'power3.out',
  });

  // Timeline steps
  gsap.from('.timeline-step', {
    scrollTrigger: { trigger: '.timeline-wrapper', start: 'top 75%' },
    opacity: 0, x: -50, stagger: 0.2, duration: 0.7, ease: 'power3.out',
  });

  // Features grid
  gsap.from('.feature-card', {
    scrollTrigger: { trigger: '.features-grid', start: 'top 80%' },
    opacity: 0, y: 50, stagger: 0.12, duration: 0.8, ease: 'power3.out',
  });

  // Demo reveal with 3D tilt
  gsap.from('.demo-browser', {
    scrollTrigger: { trigger: '.demo-wrapper', start: 'top 80%' },
    opacity: 0, y: 60, rotateX: 15, duration: 1.2, ease: 'power3.out',
  });

  // Section titles
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
    });
  });

  // Parallax hero content on scroll
  gsap.to('.hero-content', {
    scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1 },
    y: 120, opacity: 0.3,
  });

  // Emotion bar fill animation
  ScrollTrigger.create({
    trigger: '.emotion-bars',
    start: 'top 80%',
    onEnter: () => {
      document.querySelectorAll('.emo-bar-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = w; }, 300);
      });
    },
    once: true,
  });

  // Step number float
  gsap.utils.toArray('.step-number').forEach((el, i) => {
    gsap.to(el, {
      y: -6,
      duration: 1.5 + i * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.3,
    });
  });

  // Tech pill hover glow
  document.querySelectorAll('.tech-pill').forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      gsap.to(pill, { scale: 1.08, duration: 0.2 });
    });
    pill.addEventListener('mouseleave', () => {
      gsap.to(pill, { scale: 1, duration: 0.2 });
    });
  });
})();

// ---- Control bar interactions ----
(function initControls() {
  ['micBtn','camBtn','screenBtn','vrBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });
})();

// ---- Avatar pulse animation ----
(function initAvatars() {
  const pods = document.querySelectorAll('.avatar-pod');
  let currentSpeaker = 1;

  setInterval(() => {
    pods.forEach((p, i) => {
      p.classList.remove('active-speaker');
      const ring = p.querySelector('.speaking-ring');
      const mouth = p.querySelector('.avatar-mouth');
      if (ring)  ring.remove();
      if (mouth) { mouth.className = 'avatar-mouth neutral'; }
    });

    currentSpeaker = (currentSpeaker + 1) % pods.length;
    const pod = pods[currentSpeaker];
    pod.classList.add('active-speaker');

    // Add ring
    const ring = document.createElement('div');
    ring.className = 'speaking-ring';
    pod.prepend(ring);

    const mouth = pod.querySelector('.avatar-mouth');
    if (mouth) mouth.className = 'avatar-mouth speaking';
  }, 4000);
})();

// ---- 3D card tilt ----
(function initTilt() {
  const cards = document.querySelectorAll('.glass-card, .feature-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ---- Random blockchain events ----
(function initChain() {
  const hashes = ['0x1a3f','0x9c2d','0xb4e1','0x5f8a','0x2c7b','0xd3e9','0x4f1c','0x8a5d'];
  const labels = ['Msg Encrypted','Block Confirmed','ZK Proof OK','Sig Verified','Handshake','Data Chunk','Auth Token','State Update'];
  const log = document.querySelector('.chain-log');
  if (!log) return;
  setInterval(() => {
    const entries = log.querySelectorAll('.chain-entry');
    if (entries.length > 5) entries[0].remove();
    const entry = document.createElement('div');
    entry.className = 'chain-entry chain-live';
    entry.innerHTML = `
      <span class="chain-hash">${hashes[Math.floor(Math.random()*hashes.length)]}...</span>
      <span class="chain-label">${labels[Math.floor(Math.random()*labels.length)]}</span>
      <span class="chain-status live">●</span>
    `;
    log.appendChild(entry);
    setTimeout(() => { entry.classList.remove('chain-live'); entry.querySelector('.chain-status').className='chain-status verified'; entry.querySelector('.chain-status').textContent='✓'; }, 1200);
  }, 2500);
})();

// ---- Smooth scroll for anchors ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

console.log('%c◈ MetaMates — IEEE Research Prototype 2026', 'color:#00d4ff;font-family:monospace;font-size:14px;font-weight:bold;');
