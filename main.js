/* ============================================================
   RISKCOM | Main JavaScript — Full-Screen Layout
   ============================================================ */

(function () {
  'use strict';

  // ── Elements ──────────────────────────────────────────────
  const sidebar         = document.getElementById('sidebar');
  const sectionsWrapper = document.getElementById('sectionsWrapper');
  const mobileMenuBtn   = document.getElementById('mobileMenuBtn');
  const backdrop        = document.getElementById('sidebarBackdrop');
  const navItems        = document.querySelectorAll('.nav-item');

  // ── Mobile sidebar ─────────────────────────────────────────
  function openMobileSidebar() {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
  if (backdrop)      backdrop.addEventListener('click', closeMobileSidebar);

  // ── Active nav on click ────────────────────────────────────
  navItems.forEach(item => {
    item.querySelector('a').addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 768) closeMobileSidebar();
    });
  });

  // ── Active nav on scroll (Intersection Observer) ───────────
  const sections = document.querySelectorAll('.fs-section[id]');

  const sectionLabels = {
    'inicio':          'Inicio',
    'quienes-somos':   'Quiénes Somos',
    'soluciones':      'Soluciones',
    'propuesta':       'Propuesta de Valor',
    'rse':             'RSE',
    'informacion':     'Información',
    'videos':          'Videos',
    'contacto':        'Contáctenos',
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  // ── Smooth scroll (sin offset de topbar) ──────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Lazy loading de videos ─────────────────────────────────
  // Busca todos los .fs-video-bg que tengan data-video definido
  const videoBgs = document.querySelectorAll('.fs-video-bg[data-video]');

  const videoLoader = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const container = entry.target;
        const src = container.dataset.video;

        // Evitar cargar dos veces
        if (container.dataset.loaded) return;
        container.dataset.loaded = 'true';

        // Crear el elemento video dinámicamente
        const video = document.createElement('video');
        video.autoplay    = true;
        video.muted       = true;
        video.loop        = true;
        video.playsInline = true;
        video.setAttribute('aria-hidden', 'true');

        const source = document.createElement('source');
        source.src  = src;
        source.type = 'video/mp4';
        video.appendChild(source);

        // Añadir al DOM — el CSS lo hace aparecer con fade
        container.appendChild(video);

        // Marcar la sección padre con has-video para ajustar el overlay
        const section = container.closest('.fs-section');
        if (section) section.classList.add('has-video');

        // Intentar reproducir (algunos browsers bloquean autoplay)
        video.play().catch(() => {
          // Si el browser bloquea autoplay, se queda el fondo oscuro — sin error visible
        });

        // Cuando el video empieza a reproducirse, aplicar fade-in suave
        video.addEventListener('playing', () => {
          video.classList.add('playing');
        }, { once: true });

        // Fallback: si canplay dispara pero playing no (algunos móviles)
        video.addEventListener('canplay', () => {
          setTimeout(() => video.classList.add('playing'), 100);
        }, { once: true });
      });
    },
    {
      // Empieza a cargar cuando la sección anterior está a 100px de terminar
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    }
  );

  videoBgs.forEach(bg => videoLoader.observe(bg));
  const fadeTargets = document.querySelectorAll(
    '.card, .service-item, .visual-card, .contact-item, .stat, .placeholder-content'
  );

  fadeTargets.forEach(el => el.classList.add('fade-in'));

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children);
          const index = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('visible'), index * 80);
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeTargets.forEach(el => fadeObserver.observe(el));

  // ── Contact form ───────────────────────────────────────────
  const form = document.querySelector('.contact-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-primary');
      const original = btn.innerHTML;

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando…';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Mensaje enviado';
        btn.style.background = 'var(--accent-dim)';

        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.background = '';
          form.reset();
        }, 3000);
      }, 1500);
    });
  }

  // ── Resize: reset mobile state en desktop ─────────────────
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileSidebar();
  });

})();
