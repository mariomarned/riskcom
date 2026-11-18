/* ============================================================
   RISKCOM | Main JavaScript — Corporate Light B2B Layout
   ============================================================ */

(function () {
  'use strict';

  // ── Feature-detect Popover API & Load Polyfill Conditionally ──
  if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
    import('https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js').catch(() => {});
  }

  // ── Elements ──────────────────────────────────────────────
  const siteHeader  = document.getElementById('siteHeader');
  const headerInner = document.getElementById('headerInner');
  const siteMenu    = document.getElementById('site-menu');
  const navItems    = document.querySelectorAll('.nav-item');

  // ── Responsive Top Navbar (Intrinsic Measurement + Popover) ──
  let lastCollapsedWidth = 0;

  function syncNavbarLayout() {
    if (!siteHeader || !headerInner || !siteMenu) return;

    const wasWide = siteHeader.classList.contains('is-wide');
    const wasOpen = !wasWide && siteMenu.matches(':is(:popover-open, .\\:popover-open)');

    siteHeader.classList.add('is-measuring');
    siteHeader.classList.add('is-wide');

    const fitsInline = headerInner.scrollWidth <= headerInner.clientWidth;

    if (fitsInline) {
      siteHeader.classList.add('is-wide');
      siteMenu.removeAttribute('popover');
      lastCollapsedWidth = 0;
    } else {
      siteHeader.classList.remove('is-wide');
      siteMenu.setAttribute('popover', 'auto');
      lastCollapsedWidth = headerInner.clientWidth;
      if (wasOpen && typeof siteMenu.showPopover === 'function') {
        try {
          siteMenu.showPopover();
        } catch (_) {}
      }
    }

    requestAnimationFrame(() => {
      siteHeader.classList.remove('is-measuring');
    });
  }

  if (siteHeader && headerInner && siteMenu && typeof ResizeObserver !== 'undefined') {
    const navResizeObserver = new ResizeObserver(() => {
      const isCurrentlyWide = siteHeader.classList.contains('is-wide');
      if (isCurrentlyWide || headerInner.clientWidth > lastCollapsedWidth) {
        syncNavbarLayout();
      }
    });
    navResizeObserver.observe(siteHeader);
    navResizeObserver.observe(siteMenu);
    syncNavbarLayout();
  }

  function closeMobilePopoverMenu() {
    if (siteMenu && siteMenu.hasAttribute('popover') && typeof siteMenu.hidePopover === 'function') {
      try {
        siteMenu.hidePopover();
      } catch (_) {}
    }
  }

  function setActiveNavSection(sectionId) {
    navItems.forEach(item => {
      const isMatch = item.dataset.section === sectionId;
      item.classList.toggle('active', isMatch);
      const link = item.querySelector('a');
      if (link) {
        if (isMatch) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    });
  }

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
    const link = item.querySelector('a');
    if (!link) return;
    link.addEventListener('click', () => {
      const section = item.dataset.section;
      setActiveNavSection(section);
      closeMobilePopoverMenu();
      handleSectionNavigation(section, true);
    });
  });

  // ── Active nav on scroll (Intersection Observer) ───────────
  const sections = document.querySelectorAll('.fs-section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveNavSection(id);

          if (navigatingToSection === id) {
            navigatingToSection = null;
          }

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
    { threshold: 0.35 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  // ── Smooth scroll ──────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      if (!link.closest('.site-nav')) {
        const targetSection = href.replace('#', '');
        setActiveNavSection(targetSection);
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
          const activeItem = document.querySelector('.nav-item a[aria-current="page"]')?.closest('.nav-item');
          const activeSection = activeItem?.dataset.section || 'inicio';
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

  // ── Video de fondo en Hero (autoplay + control de pausa WCAG) ──
  const heroBgVideo     = document.getElementById('heroBgVideo');
  const heroVideoToggle = document.getElementById('heroVideoToggle');
  const heroVideoIcon   = document.getElementById('heroVideoIcon');
  const heroVideoLabel  = document.getElementById('heroVideoLabel');

  if (heroBgVideo) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateHeroVideoUI(isPlaying) {
      if (!heroVideoToggle || !heroVideoIcon || !heroVideoLabel) return;
      heroVideoIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
      heroVideoLabel.textContent = isPlaying ? 'Pausar video' : 'Reproducir video';
      heroVideoToggle.setAttribute(
        'aria-label',
        isPlaying ? 'Pausar video de fondo' : 'Reproducir video de fondo'
      );
    }

    if (prefersReducedMotion) {
      heroBgVideo.pause();
      updateHeroVideoUI(false);
    } else {
      heroBgVideo.play().then(() => {
        updateHeroVideoUI(true);
      }).catch(() => {
        updateHeroVideoUI(false);
      });
    }

    heroBgVideo.addEventListener('play', () => updateHeroVideoUI(true));
    heroBgVideo.addEventListener('pause', () => updateHeroVideoUI(false));

    if (heroVideoToggle) {
      heroVideoToggle.addEventListener('click', () => {
        if (heroBgVideo.paused) {
          heroBgVideo.play().catch(() => {});
        } else {
          heroBgVideo.pause();
        }
      });
    }
  }

  // ── Carga por etapas y reproducción de videos de fondo ─────
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videoBgs = document.querySelectorAll('.fs-video-bg[data-video]');

  function syncReducedMotionVideos(prefersReduced) {
    if (!prefersReduced) return;
    document.querySelectorAll('video[autoplay]').forEach(video => {
      video.removeAttribute('autoplay');
      video.pause();
    });
  }

  reducedMotionQuery.addEventListener('change', (e) => {
    syncReducedMotionVideos(e.matches);
  });

  const videoLoader = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const container = entry.target;
        const existingVideo = container.querySelector('video');

        if (entry.isIntersecting) {
          if (!container.dataset.loaded) {
            container.dataset.loaded = 'true';
            const src = container.dataset.video;

            const video = document.createElement('video');
            video.muted       = true;
            video.loop        = true;
            video.playsInline = true;
            video.preload     = 'metadata';
            video.setAttribute('width', '1280');
            video.setAttribute('height', '720');
            video.setAttribute('loading', 'lazy');
            video.setAttribute('aria-hidden', 'true');
            if (!reducedMotionQuery.matches) {
              video.autoplay = true;
            }

            const source = document.createElement('source');
            source.src  = src;
            source.type = 'video/mp4';
            video.appendChild(source);

            container.appendChild(video);

            const section = container.closest('.fs-section');
            if (section) section.classList.add('has-video');

            video.addEventListener('playing', () => {
              video.classList.add('playing');
            }, { once: true });

            video.addEventListener('canplay', () => {
              setTimeout(() => video.classList.add('playing'), 100);
            }, { once: true });

            if (!reducedMotionQuery.matches) {
              video.play().catch(() => {});
            }
          } else if (existingVideo && !reducedMotionQuery.matches) {
            existingVideo.play().catch(() => {});
          }
        } else if (existingVideo && !existingVideo.paused) {
          existingVideo.pause();
        }
      });
    },
    {
      rootMargin: '250px 0px',
      threshold: 0.05
    }
  );

  videoBgs.forEach(bg => videoLoader.observe(bg));

  // ── Acordeón de Soluciones (Filtros por categoría) ──────────
  const solutionsAccordion = document.getElementById('solutionsAccordion');
  const filterPills = document.querySelectorAll('.filter-pill');

  if (solutionsAccordion) {
    const solutionItems = Array.from(solutionsAccordion.querySelectorAll('.solution-item'));

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.filter;
        filterPills.forEach(p => {
          const isActive = p === pill;
          p.classList.toggle('is-active', isActive);
          p.setAttribute('aria-pressed', String(isActive));
        });

        solutionItems.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.hidden = !match;
          if (!match) item.open = false;
        });
      });
    });
  }

  // ── Animaciones de aparición en scroll ─────────────────────
  const fadeTargets = document.querySelectorAll(
    '.card, .service-item, .visual-card, .contact-item, .stat, .hero-partner-card, .video-feature-card'
  );

  fadeTargets.forEach(el => el.classList.add('fade-in'));

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children);
          const index = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('visible'), index * 70);
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeTargets.forEach(el => fadeObserver.observe(el));

  // ── Animación de entrada para todas las etiquetas H2 ───────
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const h2Elements = document.querySelectorAll('h2');
    h2Elements.forEach(h2 => h2.classList.add('h2-reveal'));

    const h2Observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            h2Observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    h2Elements.forEach(h2 => h2Observer.observe(h2));
  }

  // ── Fallback de animación para badges y subtítulos ─────────
  if (
    !CSS.supports('(animation-timeline: view()) and (animation-range: entry)') &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  ) {
    const headingBlocks = document.querySelectorAll('.section-heading-block');
    const headingParts = [];

    headingBlocks.forEach(block => {
      const parts = block.querySelectorAll('.section-badge, .fs-subtitle');
      parts.forEach((part, idx) => {
        part.classList.add('heading-reveal-init');
        part.style.transitionDelay = (idx * 110) + 'ms';
        headingParts.push(part);
      });
    });

    const headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            headingObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    headingParts.forEach(el => headingObserver.observe(el));
  }

  // ── Contact form ───────────────────────────────────────────
  const form = document.querySelector('.contact-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-primary');
      const original = btn.innerHTML;

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando solicitud…';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Solicitud recibida';
        btn.style.background = 'var(--brand-green-dark)';

        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.background = '';
          form.reset();
        }, 3000);
      }, 1400);
    });
  }

})();
