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

  // ── Audio Players (Inicio y Quiénes Somos) ──────────────────
  function createAudioPlayer(config) {
    const audio    = document.getElementById(config.audioId);
    const btn      = document.getElementById(config.btnId);
    const icon     = document.getElementById(config.iconId);
    const progress = document.getElementById(config.progressId);
    const player   = document.getElementById(config.playerId);

    if (!audio || !btn || !icon || !progress) return null;

    function setIcon(playing) {
      icon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-volume-high';
    }

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      progress.style.width = (audio.currentTime / audio.duration * 100) + '%';
    });

    audio.addEventListener('ended', () => {
      setIcon(false);
      progress.style.width = '0%';
      if (player) player.classList.remove('audio-waiting');
    });

    function pause() {
      audio.pause();
      setIcon(false);
      if (player) player.classList.remove('audio-waiting');
    }

    function stop() {
      audio.pause();
      audio.currentTime = 0;
      progress.style.width = '0%';
      setIcon(false);
      if (player) player.classList.remove('audio-waiting');
    }

    function play(fromBeginning = false) {
      if (fromBeginning) {
        audio.currentTime = 0;
      }
      return audio.play().then(() => {
        setIcon(true);
        if (player) player.classList.remove('audio-waiting');
      });
    }

    return {
      audio,
      btn,
      player,
      pause,
      stop,
      play,
      setIcon
    };
  }

  const introPlayer = createAudioPlayer({
    audioId: 'introAudio',
    btnId: 'audioBtn',
    iconId: 'audioIcon',
    progressId: 'audioProgressBar',
    playerId: 'audioPlayer'
  });

  const aboutPlayer = createAudioPlayer({
    audioId: 'aboutAudio',
    btnId: 'audioBtnAbout',
    iconId: 'audioIconAbout',
    progressId: 'audioProgressBarAbout',
    playerId: 'audioPlayerAbout'
  });

  function stopAllAudios() {
    if (introPlayer) introPlayer.stop();
    if (aboutPlayer) aboutPlayer.stop();
  }

  // Interacción manual en los botones de los reproductores
  if (introPlayer) {
    introPlayer.btn.addEventListener('click', () => {
      if (aboutPlayer) aboutPlayer.pause();
      if (introPlayer.audio.paused) {
        introPlayer.play(false).catch(() => {});
      } else {
        introPlayer.pause();
      }
    });
  }

  if (aboutPlayer) {
    aboutPlayer.btn.addEventListener('click', () => {
      if (introPlayer) introPlayer.pause();
      if (aboutPlayer.audio.paused) {
        aboutPlayer.play(false).catch(() => {});
      } else {
        aboutPlayer.pause();
      }
    });
  }

  let navigatingToSection = null;
  let navigationTimer = null;

  function setNavigatingSection(sectionId) {
    navigatingToSection = sectionId;
    clearTimeout(navigationTimer);
    navigationTimer = setTimeout(() => {
      navigatingToSection = null;
    }, 1400);
  }

  function handleSectionNavigation(sectionId, fromMenu = false) {
    setNavigatingSection(sectionId);

    if (sectionId === 'inicio') {
      if (aboutPlayer) aboutPlayer.stop();
      if (fromMenu && introPlayer) {
        introPlayer.play(true).catch(() => {});
      }
    } else if (sectionId === 'quienes-somos') {
      if (introPlayer) introPlayer.stop();
      if (fromMenu && aboutPlayer) {
        aboutPlayer.play(true).catch(() => {});
      }
    } else {
      stopAllAudios();
    }
  }

  // ── Active nav on click ────────────────────────────────────
  navItems.forEach(item => {
    item.querySelector('a').addEventListener('click', () => {
      const section = item.dataset.section;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 768) closeMobileSidebar();

      handleSectionNavigation(section, true);
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

          // Si llegamos a la sección objetivo de navegación
          if (navigatingToSection === id) {
            navigatingToSection = null;
          }

          // Si el usuario navega o se desplaza a otra sección, detener el audio de la sección anterior
          if (!navigatingToSection) {
            if (id !== 'inicio' && introPlayer) {
              introPlayer.pause();
            }
            if (id !== 'quienes-somos' && aboutPlayer) {
              aboutPlayer.pause();
            }
          }
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  // ── Smooth scroll (sin offset de topbar) ──────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // Si el enlace no viene del menú lateral (por ejemplo, botones CTA como #soluciones o #contacto)
      if (!link.closest('.sidebar-nav')) {
        const targetSection = href.replace('#', '');
        handleSectionNavigation(targetSection, false);
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Autoplay inicial en Inicio ─────────────────────────────
  if (introPlayer) {
    function tryAutoplay() {
      const hash = window.location.hash;
      if (hash && hash !== '#inicio') return;

      introPlayer.play(false).catch(() => {
        if (introPlayer.player) introPlayer.player.classList.add('audio-waiting');
        const events = ['click', 'keydown', 'touchstart'];
        function onFirstInteraction() {
          const activeSection = document.querySelector('.nav-item.active')?.dataset.section || 'inicio';
          if (activeSection === 'inicio') {
            introPlayer.play(false).catch(() => {});
          }
          events.forEach(ev => document.removeEventListener(ev, onFirstInteraction));
        }
        events.forEach(ev => document.addEventListener(ev, onFirstInteraction, { once: true, passive: true }));
      });
    }

    if (document.readyState === 'complete') {
      tryAutoplay();
    } else {
      window.addEventListener('load', tryAutoplay);
    }
  }

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
