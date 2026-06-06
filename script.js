/* ================================================
   FARIHA.ME — Advanced 3D Portfolio JavaScript
   Three.js | Custom Cursor | Scroll Animations
   ================================================ */
'use strict';

/* ── LOADER ───────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loaderFill');
  const pct    = document.getElementById('loaderPct');
  let p = 0;
  document.body.style.overflow = 'hidden';

  const tick = setInterval(() => {
    p += Math.random() * 15 + 4;
    if (p >= 100) {
      p = 100;
      clearInterval(tick);
      fill.style.width = '100%';
      pct.textContent  = '100%';
      setTimeout(() => {
        loader.classList.add('out');
        document.body.style.overflow = '';
        revealHero();
        init3D();
      }, 400);
    }
    fill.style.width = p + '%';
    pct.textContent  = Math.floor(p) + '%';
  }, 80);
})();

/* ── HERO REVEAL ──────────────────────────────── */
function revealHero() {
  const eyebrow = document.getElementById('heroEyebrow');
  const lines   = document.querySelectorAll('#heroTitle .line');
  const bottom  = document.getElementById('heroBottom');
  setTimeout(() => eyebrow && eyebrow.classList.add('show'), 100);
  lines.forEach((line, i) => setTimeout(() => line.classList.add('show'), 200 + i * 120));
  setTimeout(() => bottom && bottom.classList.add('show'), 600);
}

/* ── THREE.JS 3D BACKGROUND ───────────────────── */
function init3D() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('canvas-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  const point1  = new THREE.PointLight(0xc8f542, 2, 20);
  const point2  = new THREE.PointLight(0x2af5ff, 1.5, 20);
  const point3  = new THREE.PointLight(0xff3cac, 1.5, 20);
  point1.position.set(4, 4, 4);
  point2.position.set(-4, -2, 3);
  point3.position.set(0, -4, 2);
  scene.add(ambient, point1, point2, point3);

  // Main icosahedron
  const geoMain = new THREE.IcosahedronGeometry(1.4, 1);
  const matMain = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.95, roughness: 0.08 });
  const meshMain = new THREE.Mesh(geoMain, matMain);
  meshMain.position.set(2.5, 0.3, 0);
  scene.add(meshMain);

  // Wireframe overlay
  const geoWire = new THREE.IcosahedronGeometry(1.43, 1);
  const matWire = new THREE.MeshBasicMaterial({ color: 0xc8f542, wireframe: true, transparent: true, opacity: 0.12 });
  const meshWire = new THREE.Mesh(geoWire, matWire);
  meshWire.position.copy(meshMain.position);
  scene.add(meshWire);

  // Torus rings
  const geoTorus = new THREE.TorusGeometry(0.9, 0.04, 16, 80);
  const matTorus = new THREE.MeshStandardMaterial({ color: 0x2af5ff, metalness: 0.9, roughness: 0.1, emissive: 0x2af5ff, emissiveIntensity: 0.3 });
  const meshTorus = new THREE.Mesh(geoTorus, matTorus);
  meshTorus.rotation.x = Math.PI / 3;
  scene.add(meshTorus);

  const geoTorus2 = new THREE.TorusGeometry(1.15, 0.025, 16, 80);
  const matTorus2 = new THREE.MeshStandardMaterial({ color: 0xff3cac, metalness: 0.9, roughness: 0.1, emissive: 0xff3cac, emissiveIntensity: 0.25 });
  const meshTorus2 = new THREE.Mesh(geoTorus2, matTorus2);
  meshTorus2.rotation.y = Math.PI / 4;
  meshTorus2.rotation.x = Math.PI / 6;
  scene.add(meshTorus2);

  // Particles
  const pCount = 280, pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random() - 0.5) * 20;
    pPos[i*3+1] = (Math.random() - 0.5) * 12;
    pPos[i*3+2] = (Math.random() - 0.5) * 10 - 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xc8f542, size: 0.04, sizeAttenuation: true, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Satellites
  const satellites = [];
  const satColors  = [0xc8f542, 0x2af5ff, 0xff3cac];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.SphereGeometry(0.08 + i * 0.03, 16, 16);
    const m = new THREE.MeshStandardMaterial({ color: satColors[i], metalness: 0.8, roughness: 0.2, emissive: satColors[i], emissiveIntensity: 0.5 });
    const s = new THREE.Mesh(g, m);
    s.userData = { orbitRadius: 1.8 + i * 0.3, speed: 0.6 + i * 0.2, offset: (i / 3) * Math.PI * 2 };
    scene.add(s);
    satellites.push(s);
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    meshMain.rotation.x = t * 0.18 + mouse.y * 0.2;
    meshMain.rotation.y = t * 0.22 + mouse.x * 0.2;
    meshMain.position.y = 0.3 + Math.sin(t * 0.6) * 0.15;

    meshWire.rotation.x = meshMain.rotation.x + 0.02;
    meshWire.rotation.y = meshMain.rotation.y + 0.02;
    meshWire.position.copy(meshMain.position);

    meshTorus.rotation.z = t * 0.35;
    meshTorus.rotation.x = Math.PI / 3 + mouse.y * 0.1;
    meshTorus.position.copy(meshMain.position);

    meshTorus2.rotation.z = -t * 0.25;
    meshTorus2.rotation.y = t * 0.15 + mouse.x * 0.1;
    meshTorus2.position.copy(meshMain.position);

    satellites.forEach(s => {
      const angle = t * s.userData.speed + s.userData.offset;
      s.position.x = meshMain.position.x + Math.cos(angle) * s.userData.orbitRadius;
      s.position.y = meshMain.position.y + Math.sin(angle * 0.7) * 0.5;
      s.position.z = Math.sin(angle) * s.userData.orbitRadius * 0.6;
      s.rotation.y = t;
    });

    particles.rotation.y =  t * 0.04;
    particles.rotation.x = -t * 0.02;
    particles.position.y = -scrollY * 0.002;

    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 0.2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    point1.position.x =  Math.sin(t * 0.5) * 5;
    point1.position.z =  Math.cos(t * 0.5) * 5;
    point2.position.x = -Math.sin(t * 0.4) * 4;
    point2.position.z =  Math.cos(t * 0.4) * 4;

    renderer.render(scene, camera);
  }
  animate();
}

/* ── CUSTOM CURSOR ────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || window.matchMedia('(pointer: coarse)').matches) return;

  let rx = 0, ry = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; dot.style.left = cx + 'px'; dot.style.top = cy + 'px'; });

  function followRing() {
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(followRing);
  }
  followRing();

  document.querySelectorAll('a, button, .service-card, .project-card, .faq-q, .tech-pill').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('expand'));
    el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
  });
  document.addEventListener('mouseleave', () => ring.classList.add('hide'));
  document.addEventListener('mouseenter', () => ring.classList.remove('hide'));
})();

/* ── NAVBAR ───────────────────────────────────── */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    const sy = window.scrollY + 140;
    document.querySelectorAll('section[id]').forEach(sec => {
      const link = document.querySelector(`.nav-links .nav-link[href="#${sec.id}"]`);
      if (link) link.classList.toggle('active', sy >= sec.offsetTop && sy < sec.offsetTop + sec.offsetHeight);
    });
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('#mobileMenu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ── SMOOTH SCROLL ────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── SCROLL PROGRESS ──────────────────────────── */
(function() {
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;z-index:2000;background:linear-gradient(90deg,#c8f542,#2af5ff);width:0%;transition:width 0.1s;pointer-events:none;';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const d = document.documentElement;
    bar.style.width = (d.scrollTop / (d.scrollHeight - d.clientHeight) * 100) + '%';
  }, { passive: true });
})();

/* ── REVEAL OBSERVER ──────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.skill-fill').forEach(b => {
          setTimeout(() => { b.style.width = b.dataset.width + '%'; }, 200);
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => { entry.target.style.width = entry.target.dataset.width + '%'; }, 300);
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.skill-fill').forEach(b => barObs.observe(b));
})();

/* ── STAT COUNTERS ────────────────────────────── */
(function() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = +el.dataset.count, start = performance.now();
      function update(now) {
        const ease = 1 - Math.pow(1 - Math.min((now - start) / 1400, 1), 3);
        el.textContent = Math.round(ease * target);
        if (ease < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num[data-count]').forEach(el => obs.observe(el));
})();

/* ── FAQ ──────────────────────────────────────── */
(function() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq-a');
        if (a) a.style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        const a = item.querySelector('.faq-a');
        if (a) a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
  const first = document.querySelector('.faq-item');
  if (first) {
    first.classList.add('open');
    const fa = first.querySelector('.faq-a');
    if (fa) fa.style.maxHeight = fa.scrollHeight + 'px';
  }
})();

/* ── CONTACT FORM ─────────────────────────────── */
(function() {
  const form = document.getElementById('contactForm');
  const suc  = document.getElementById('formSuccess');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.disabled = true; btn.textContent = 'Sending...';
    setTimeout(() => { form.style.display = 'none'; suc.classList.add('show'); }, 1200);
  });
})();

/* ── CARD TILT ────────────────────────────────── */
(function() {
  document.querySelectorAll('.project-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2)  / (r.width/2);
      const y = (e.clientY - r.top  - r.height/2) / (r.height/2);
      card.style.transform = `perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── TECH PILL COLORS ─────────────────────────── */
(function() {
  const colors = ['#c8f542','#2af5ff','#ff3cac','#7c3aed','#fb923c'];
  document.querySelectorAll('.tech-pill').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      const c = colors[Math.floor(Math.random() * colors.length)];
      tag.style.cssText += `;background:${c};border-color:${c};color:#0a0a0a;`;
    });
    tag.addEventListener('mouseleave', () => { tag.style.background = tag.style.borderColor = tag.style.color = ''; });
  });
})();

/* ── HERO PARALLAX ────────────────────────────── */
(function() {
  window.addEventListener('scroll', () => {
    const hw = document.querySelector('.hero-title-wrap');
    if (hw) hw.style.transform = `translateY(${window.scrollY * 0.28}px)`;
  }, { passive: true });
})();

console.log('%cFARIHA.ME', 'font-family:monospace;font-size:2rem;color:#c8f542;font-weight:bold;');
console.log('%c✦ Built by Fariha Akter Prity — CSE Student & Web Developer', 'font-family:monospace;color:#2af5ff;');
