(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const menu = document.getElementById('siteMenu');
  const langButtons = [...document.querySelectorAll('[data-lang-switch]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');

  const meta = {
    en: {
      title: 'Star Halo — Ideas become real games',
      description: 'An independent game studio in Beijing. We take ideas all the way to real games.',
      ogTitle: 'Star Halo — Ideas become real games.',
      ogDescription: 'An independent studio in Beijing. We take ideas all the way to real games.'
    },
    zh: {
      title: 'Star Halo 星环漫宇 — 来自北京的独立游戏工作室',
      description: '一家位于北京的独立游戏工作室。把点子做成真正的游戏。',
      ogTitle: 'Star Halo 星环漫宇 — 把点子做成真正的游戏。',
      ogDescription: '一家位于北京的独立游戏工作室。把点子做成真正的游戏。'
    }
  };

  let currentLanguage = 'en';
  let menuOpen = false;

  const setLanguage = (language) => {
    currentLanguage = language === 'zh' ? 'zh' : 'en';
    root.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    root.dataset.lang = currentLanguage;

    document.querySelectorAll('[data-en]').forEach((element) => {
      const value = currentLanguage === 'zh' ? element.dataset.zh : element.dataset.en;
      if (typeof value === 'string') element.textContent = value;
    });

    document.querySelectorAll('[data-en-alt]').forEach((element) => {
      const value = currentLanguage === 'zh' ? element.dataset.zhAlt : element.dataset.enAlt;
      if (typeof value === 'string') element.alt = value;
    });

    document.querySelectorAll('[data-en-aria]').forEach((element) => {
      const value = currentLanguage === 'zh' ? element.dataset.zhAria : element.dataset.enAria;
      if (typeof value === 'string') element.setAttribute('aria-label', value);
    });

    langButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.langSwitch === currentLanguage));
    });

    const pageMeta = meta[currentLanguage];
    document.title = pageMeta.title;
    if (metaDescription) metaDescription.content = pageMeta.description;
    if (ogTitle) ogTitle.content = pageMeta.ogTitle;
    if (ogDescription) ogDescription.content = pageMeta.ogDescription;
    if (twitterTitle) twitterTitle.content = pageMeta.ogTitle;
    if (twitterDescription) twitterDescription.content = pageMeta.ogDescription;

    updateEmbeddedVideoTitle();
  };

  const openMenu = () => {
    menuOpen = true;
    header.classList.add('is-menu-open');
    menu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    const firstLink = menu.querySelector('a');
    window.setTimeout(() => {
      if (menuOpen) firstLink?.focus({ preventScroll: true });
    }, reduceMotion.matches ? 60 : 480);
  };

  const closeMenu = (restoreFocus = true) => {
    if (!menuOpen) return;
    menuOpen = false;
    header.classList.remove('is-menu-open');
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  };

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      if (menuOpen) closeMenu();
      else openMenu();
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (!menuOpen) return;

      if (event.key === 'Escape') {
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = [menuToggle, ...menu.querySelectorAll('a')].filter((element) => !element.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && menuOpen) closeMenu(false);
    }, { passive: true });
  }

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.langSwitch === currentLanguage) return;
      setLanguage(button.dataset.langSwitch);
    });
  });

  const revealElements = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const heroVideo = document.getElementById('heroVideo');
  const heroSection = document.querySelector('.hero');
  let heroVideoLoaded = false;
  let heroInView = true;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const shouldAvoidVideo = () => reduceMotion.matches || Boolean(connection?.saveData) || /(^|-)2g/.test(connection?.effectiveType || '');

  const playHeroVideo = () => {
    if (!heroVideoLoaded || !heroInView || document.hidden || reduceMotion.matches) return;
    heroVideo.play().catch(() => {});
  };

  const loadHeroVideo = () => {
    if (!heroVideo || heroVideoLoaded || shouldAvoidVideo()) return;
    heroVideoLoaded = true;
    const mobileSource = heroVideo.dataset.srcMobile;
    const desktopSource = heroVideo.dataset.src;
    heroVideo.src = window.innerWidth <= 700 && mobileSource ? mobileSource : desktopSource;
    heroVideo.load();
    heroVideo.addEventListener('playing', () => {
      heroVideo.classList.add('is-ready');
      heroVideo.closest('.hero-media')?.classList.add('is-playing');
    }, { once: true });
    playHeroVideo();
  };

  if (heroVideo && heroSection) {
    const queueHeroVideo = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadHeroVideo, { timeout: 2200 });
      } else {
        window.setTimeout(loadHeroVideo, 700);
      }
    };

    if (document.readyState === 'complete') queueHeroVideo();
    else window.addEventListener('load', queueHeroVideo, { once: true });

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        heroInView = entry.isIntersecting;
        if (heroInView) playHeroVideo();
        else heroVideo.pause();
      }, { threshold: 0.03 });
      heroObserver.observe(heroSection);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!heroVideo) return;
    if (document.hidden) {
      heroVideo.pause();
      document.getElementById('trailerVideo')?.pause();
    } else {
      playHeroVideo();
    }
  });

  const filmPlayer = document.querySelector('[data-player]');
  const trailerVideo = document.getElementById('trailerVideo');
  const filmOverlay = document.getElementById('filmOverlay');
  const filmPlay = document.getElementById('filmPlay');

  const playFilm = () => {
    if (!trailerVideo || !filmOverlay) return;
    const source = trailerVideo.dataset.src;
    if (source && trailerVideo.getAttribute('src') !== source) {
      trailerVideo.src = source;
      trailerVideo.load();
    }
    trailerVideo.controls = true;
    const playAttempt = trailerVideo.play();
    if (playAttempt) playAttempt.catch(() => {});
  };

  if (trailerVideo && filmOverlay && filmPlay) {
    filmPlay.addEventListener('click', playFilm);

    trailerVideo.addEventListener('playing', () => {
      filmOverlay.classList.add('is-hidden');
    });

    trailerVideo.addEventListener('ended', () => {
      trailerVideo.controls = false;
      filmOverlay.classList.remove('is-hidden');
    });

    if (filmPlayer && 'IntersectionObserver' in window) {
      const filmObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting && !trailerVideo.paused) trailerVideo.pause();
      }, { threshold: 0.05 });
      filmObserver.observe(filmPlayer);
    }
  }

  const tiltTargets = [...document.querySelectorAll('[data-tilt]')];
  const finePointer = window.matchMedia('(pointer: fine)');

  if (finePointer.matches && !reduceMotion.matches) {
    tiltTargets.forEach((target) => {
      target.addEventListener('pointermove', (event) => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        target.style.setProperty('--tilt-x', `${(-y * 3.2).toFixed(2)}deg`);
        target.style.setProperty('--tilt-y', `${(x * 3.2).toFixed(2)}deg`);
      });

      target.addEventListener('pointerleave', () => {
        target.style.setProperty('--tilt-x', '0deg');
        target.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  const pixelTown = document.querySelector('[data-pixel-town]');

  if (pixelTown) {
    const townSection = pixelTown.closest('.statement');
    const farCanvas = pixelTown.querySelector('[data-layer="far"]');
    const midCanvas = pixelTown.querySelector('[data-layer="mid"]');
    const lightsCanvas = pixelTown.querySelector('[data-layer="lights"]');
    const nearCanvas = pixelTown.querySelector('[data-layer="near"]');
    const townGlow = pixelTown.querySelector('.pixel-town-glow');

    if (townSection && farCanvas && midCanvas && lightsCanvas && nearCanvas) {
      const townLayers = [
        { canvas: farCanvas, depth: 0.26 },
        { canvas: midCanvas, depth: 0.56 },
        { canvas: lightsCanvas, depth: 0.56 },
        { canvas: nearCanvas, depth: 1 }
      ];

      const townPalette = {
        ridgeBack: '#e5e0f0',
        ridgeFront: '#d6d0e5',
        spire: '#dcd6e9',
        wall: '#a99fc7',
        wallAlt: '#9c92bc',
        roof: '#948ab5',
        windowOff: '#8b80af',
        near: '#443c69',
        nearAlt: '#3a3259',
        nearRim: '#61568a',
        lit: '#f2b061',
        litStrong: '#ffd7a4',
        litDim: 'rgba(242, 176, 97, 0.4)'
      };

      const townRandom = (seed) => {
        let state = seed >>> 0;
        return () => {
          state = (state + 0x6d2b79f5) >>> 0;
          let t = state;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      };

      let townCols = 0;
      let townRows = 0;
      let townUnit = 3;
      let townPadUnits = 0;
      let litWindows = [];
      let beaconLights = [];
      let townInView = false;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let pointerSeenAt = 0;
      let townFrame = 0;
      let townBuilt = false;

      const sizeTownCanvas = (canvas) => {
        canvas.width = townCols;
        canvas.height = townRows;
        canvas.style.width = `${townCols * townUnit}px`;
        canvas.style.height = `${townRows * townUnit}px`;
        canvas.style.left = `${-townPadUnits * townUnit}px`;
      };

      const paintTownLights = () => {
        const ctx = lightsCanvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, townCols, townRows);
        litWindows.forEach((win) => {
          if (!win.on) return;
          ctx.fillStyle = win.strong ? townPalette.litStrong : townPalette.lit;
          ctx.fillRect(win.x, win.y, 1, 1);
        });
        beaconLights.forEach((beacon) => {
          ctx.fillStyle = beacon.on ? townPalette.lit : townPalette.litDim;
          ctx.fillRect(beacon.x, beacon.y, 1, 1);
        });
      };

      const buildTown = () => {
        const width = Math.round(townSection.clientWidth);
        const height = Math.round(pixelTown.clientHeight);
        if (width < 200 || height < 40) return;

        townUnit = width >= 1400 ? 4 : width >= 900 ? 3 : 2;
        townPadUnits = Math.ceil(56 / townUnit);
        townCols = Math.ceil(width / townUnit) + townPadUnits * 2;
        townRows = Math.max(20, Math.round(height / townUnit));

        townLayers.forEach(({ canvas }) => sizeTownCanvas(canvas));

        const rand = townRandom(1979);
        const groundRow = townRows - 4;
        const farCtx = farCanvas.getContext('2d');
        const midCtx = midCanvas.getContext('2d');
        const nearCtx = nearCanvas.getContext('2d');
        if (!farCtx || !midCtx || !nearCtx) return;

        farCtx.clearRect(0, 0, townCols, townRows);
        midCtx.clearRect(0, 0, townCols, townRows);
        nearCtx.clearRect(0, 0, townCols, townRows);

        const drawRidge = (baseRow, amplitude, phase, color) => {
          farCtx.fillStyle = color;
          for (let x = 0; x < townCols; x += 1) {
            const ratio = x / townCols;
            const humpLeft = Math.exp(-Math.pow((ratio - 0.14) / 0.075, 2)) * amplitude * 5.4;
            const humpRight = Math.exp(-Math.pow((ratio - 0.88) / 0.065, 2)) * amplitude * 4.4;
            const y = Math.round(
              baseRow
              - Math.sin((x + phase) * 0.055) * amplitude
              - Math.sin((x + phase * 1.7) * 0.019) * amplitude * 1.4
              - humpLeft
              - humpRight
            );
            farCtx.fillRect(x, y, 1, townRows - y);
          }
        };

        drawRidge(groundRow - 4, 2.4, 0, townPalette.ridgeBack);
        drawRidge(groundRow - 2, 2.8, 46, townPalette.ridgeFront);

        farCtx.fillStyle = townPalette.spire;
        for (let i = 0; i < 5; i += 1) {
          const sx = Math.floor(rand() * townCols);
          const sw = 1 + Math.floor(rand() * 2);
          const sh = 5 + Math.floor(rand() * 8);
          farCtx.fillRect(sx, groundRow - 6 - sh, sw, sh + 7);
        }

        const buildings = [];
        let bx = -townPadUnits - 1;
        while (bx < townCols + townPadUnits) {
          const bw = 5 + Math.floor(rand() * 8);
          const bh = Math.min(groundRow - 10, 9 + Math.floor(rand() * 17));
          buildings.push({
            x: bx,
            w: bw,
            h: bh,
            top: groundRow - bh,
            roof: rand(),
            antenna: rand() < 0.28 ? 3 + Math.floor(rand() * 5) : 0
          });
          bx += bw + (rand() < 0.22 ? 0 : 1 + Math.floor(rand() * 3));
        }

        litWindows = [];
        beaconLights = [];

        buildings.forEach((building) => {
          midCtx.fillStyle = rand() < 0.5 ? townPalette.wall : townPalette.wallAlt;
          midCtx.fillRect(building.x, building.top, building.w, building.h);

          midCtx.fillStyle = townPalette.roof;
          if (building.roof < 0.34) {
            midCtx.fillRect(building.x, building.top - 1, building.w, 1);
          } else if (building.roof < 0.7) {
            const crownWidth = Math.max(2, building.w - 2);
            midCtx.fillRect(building.x + 1, building.top - 1, crownWidth, 1);
            midCtx.fillRect(building.x + 2, building.top - 2, Math.max(1, crownWidth - 2), 1);
          } else {
            const steps = Math.max(2, Math.floor(building.w / 2));
            for (let step = 0; step < steps; step += 1) {
              const wide = building.w - step * 2;
              if (wide <= 1) break;
              midCtx.fillRect(building.x + step, building.top - 1 - step, wide, 1);
            }
          }

          if (building.antenna) {
            const mastX = building.x + Math.floor(building.w / 2);
            midCtx.fillRect(mastX, building.top - 1 - building.antenna, 1, building.antenna);
            beaconLights.push({ x: mastX, y: building.top - 2 - building.antenna, on: rand() < 0.6 });
          }

          const firstWindowX = building.x + 2;
          const lastWindowX = building.x + building.w - 3;
          for (let wy = building.top + 3; wy <= groundRow - 3; wy += 4) {
            for (let wx = firstWindowX; wx <= lastWindowX; wx += 3) {
              midCtx.fillStyle = townPalette.windowOff;
              midCtx.fillRect(wx, wy, 1, 1);
              if (rand() < 0.34) {
                litWindows.push({
                  x: wx,
                  y: wy,
                  strong: rand() < 0.32,
                  on: rand() < 0.74
                });
              }
            }
          }
        });

        nearCtx.fillStyle = townPalette.near;
        nearCtx.fillRect(0, groundRow, townCols, townRows - groundRow);
        nearCtx.fillStyle = townPalette.nearRim;
        nearCtx.fillRect(0, groundRow, townCols, 1);

        const drawPitchedTop = (x, y, width) => {
          const steps = Math.max(2, Math.floor(width / 3.2));
          for (let step = 0; step < steps; step += 1) {
            const wide = width - step * 2;
            if (wide <= 1) break;
            nearCtx.fillRect(x + step, y - step, wide, 1);
          }
        };

        let hx = -townPadUnits;
        while (hx < townCols + townPadUnits) {
          const hw = 7 + Math.floor(rand() * 9);
          const hh = 3 + Math.floor(rand() * 7);
          const htop = groundRow - hh;
          nearCtx.fillStyle = rand() < 0.5 ? townPalette.near : townPalette.nearAlt;
          nearCtx.fillRect(hx, htop, hw, hh + 1);
          nearCtx.fillStyle = townPalette.near;
          drawPitchedTop(hx, htop - 1, hw);

          if (rand() < 0.45) {
            nearCtx.fillRect(hx + 2 + Math.floor(rand() * Math.max(1, hw - 4)), htop - 4, 1, 3);
          }

          const winCount = 1 + Math.floor(rand() * 2);
          for (let i = 0; i < winCount; i += 1) {
            const wax = hx + 2 + Math.floor(rand() * Math.max(1, hw - 4));
            const way = htop + 2 + Math.floor(rand() * Math.max(1, hh - 3));
            if (rand() < 0.58) {
              nearCtx.fillStyle = townPalette.lit;
              nearCtx.fillRect(wax, way, 1, 1);
            }
          }

          hx += hw + 6 + Math.floor(rand() * 12);
        }

        const drawConifer = (cx, baseY, size) => {
          nearCtx.fillStyle = townPalette.nearAlt;
          for (let row = 0; row < size; row += 1) {
            const half = Math.round((row / size) * (size / 2.6));
            nearCtx.fillRect(cx - half, baseY - row, half * 2 + 1, 1);
          }
          nearCtx.fillRect(cx, baseY, 1, 2);
        };

        for (let i = 0; i < 14; i += 1) {
          const tx = Math.floor(rand() * townCols);
          const size = 4 + Math.floor(rand() * 7);
          if (rand() < 0.55) drawConifer(tx, groundRow - 1, size);
        }

        const lampGlow = (gx, gy) => {
          nearCtx.fillStyle = 'rgba(255, 188, 110, 0.1)';
          nearCtx.fillRect(gx - 3, gy - 3, 7, 7);
          nearCtx.fillStyle = 'rgba(255, 188, 110, 0.16)';
          nearCtx.fillRect(gx - 2, gy - 2, 5, 5);
          nearCtx.fillStyle = 'rgba(255, 202, 138, 0.3)';
          nearCtx.fillRect(gx - 1, gy - 1, 3, 3);
          nearCtx.fillStyle = townPalette.litStrong;
          nearCtx.fillRect(gx, gy, 1, 1);
        };

        const lampCount = Math.max(2, Math.round(townCols / 130));
        for (let i = 0; i < lampCount; i += 1) {
          const lx = Math.floor((i + 0.5) * (townCols / lampCount)) + Math.floor(rand() * 12) - 6;
          const poleHeight = 6 + Math.floor(rand() * 4);
          nearCtx.fillStyle = townPalette.nearAlt;
          nearCtx.fillRect(lx, groundRow - poleHeight, 1, poleHeight);
          nearCtx.fillRect(lx, groundRow - poleHeight, 2, 1);
          nearCtx.globalCompositeOperation = 'lighter';
          lampGlow(lx + 1, groundRow - poleHeight - 1);
          nearCtx.globalCompositeOperation = 'source-over';
        }

        paintTownLights();
        townBuilt = true;
        if (!reduceMotion.matches) pixelTown.classList.add('is-live');
      };

      const applyTownTransform = () => {
        townLayers.forEach(({ canvas, depth }) => {
          const shiftX = currentX * depth * 26;
          const shiftY = currentY * depth * 7;
          canvas.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`;
        });
      };

      const townTick = (now) => {
        townFrame = 0;
        if (!townInView || document.hidden || reduceMotion.matches) return;

        if (!pointerSeenAt || now - pointerSeenAt > 2600) {
          targetX = Math.sin(now / 3600) * 0.4;
          targetY = Math.cos(now / 4400) * 0.22;
        }

        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;
        applyTownTransform();
        townFrame = window.requestAnimationFrame(townTick);
      };

      const startTown = () => {
        if (townFrame || reduceMotion.matches) return;
        townFrame = window.requestAnimationFrame(townTick);
      };

      townSection.addEventListener('pointermove', (event) => {
        if (reduceMotion.matches) return;
        const rect = townSection.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        pointerSeenAt = performance.now();
        if (townGlow) {
          const glowX = ((event.clientX - rect.left) / rect.width) * 100;
          townGlow.style.setProperty('--glow-x', `${glowX.toFixed(2)}%`);
        }
        startTown();
      }, { passive: true });

      townSection.addEventListener('pointerleave', () => {
        pointerSeenAt = 0;
      });

      if ('IntersectionObserver' in window) {
        const townObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            townInView = entry.isIntersecting;
            if (townInView) startTown();
          });
        }, { threshold: 0.01 });
        townObserver.observe(pixelTown);
      } else {
        townInView = true;
        startTown();
      }

      if (!reduceMotion.matches) {
        window.setInterval(() => {
          if (document.hidden || !townInView || !townBuilt) return;
          for (let i = 0; i < 3; i += 1) {
            const win = litWindows[Math.floor(Math.random() * litWindows.length)];
            if (win) win.on = !win.on;
          }
          paintTownLights();
        }, 1500);
      }

      let townResizeTimer = 0;
      window.addEventListener('resize', () => {
        window.clearTimeout(townResizeTimer);
        townResizeTimer = window.setTimeout(() => {
          buildTown();
          applyTownTransform();
        }, 220);
      }, { passive: true });

      buildTown();
      applyTownTransform();
      startTown();
    }
  }

  const phoneStacks = [...document.querySelectorAll('.chapter-visual')]
    .filter((visual) => visual.querySelectorAll('.phone').length === 2);

  phoneStacks.forEach((visual) => {
    const phones = [...visual.querySelectorAll('.phone')];

    const swapPhones = () => {
      phones.forEach((phone) => {
        const isFront = phone.classList.contains('phone-front');
        phone.classList.toggle('phone-front', !isFront);
        phone.classList.toggle('phone-back', isFront);
      });
    };

    phones.forEach((phone) => {
      phone.setAttribute('role', 'button');
      phone.setAttribute('tabindex', '0');
      phone.addEventListener('click', swapPhones);
      phone.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        swapPhones();
      });
    });
  });

  const galleries = [...document.querySelectorAll('[data-gallery]')];

  galleries.forEach((gallery) => {
    const main = gallery.querySelector('.gallery-main');
    const thumbs = [...gallery.querySelectorAll('.gallery-thumb')];
    const counter = gallery.querySelector('.gallery-count b');
    const thumbsWrap = gallery.querySelector('.gallery-thumbs');
    if (!main || thumbs.length < 2) return;

    let activeIndex = Math.max(0, thumbs.findIndex((thumb) => thumb.classList.contains('is-active')));
    let swapTimer = 0;

    const applyThumb = (thumb) => {
      main.src = thumb.dataset.full;
      main.dataset.enAlt = thumb.dataset.altEn;
      main.dataset.zhAlt = thumb.dataset.altZh;
      main.alt = currentLanguage === 'zh' ? thumb.dataset.altZh : thumb.dataset.altEn;
      main.classList.remove('is-changing');
    };

    const showSlide = (next, animate = true) => {
      activeIndex = (next + thumbs.length) % thumbs.length;
      const thumb = thumbs[activeIndex];
      thumbs.forEach((item, index) => {
        item.classList.toggle('is-active', index === activeIndex);
        item.setAttribute('aria-pressed', String(index === activeIndex));
      });
      if (counter) counter.textContent = String(activeIndex + 1).padStart(2, '0');

      window.clearTimeout(swapTimer);
      if (animate && !reduceMotion.matches) {
        main.classList.add('is-changing');
        swapTimer = window.setTimeout(() => applyThumb(thumb), 180);
      } else {
        applyThumb(thumb);
      }
    };

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => showSlide(index));
    });

    main.addEventListener('click', () => showSlide(activeIndex + 1));

    thumbsWrap?.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showSlide(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
      thumbs[activeIndex]?.focus();
    });
  });

  const screenshotDecks = [...document.querySelectorAll('[data-deck]')];

  screenshotDecks.forEach((deck) => {
    const cards = [...deck.querySelectorAll('.stitch-card')];
    const counter = deck.querySelector('.gallery-count b');
    if (cards.length < 2) return;

    let active = 0;

    const applyDeck = () => {
      cards.forEach((card, index) => {
        const slot = (index - active + cards.length) % cards.length;
        card.dataset.slot = String(slot);
        card.tabIndex = slot === 0 ? 0 : -1;
        card.setAttribute('aria-hidden', slot === 0 ? 'false' : 'true');
      });
      if (counter) counter.textContent = String(active + 1).padStart(2, '0');
    };

    const showCard = (next) => {
      active = (next + cards.length) % cards.length;
      applyDeck();
    };

    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const slot = Number(card.dataset.slot);
        showCard(slot === 0 ? active + 1 : index);
      });
    });

    deck.addEventListener('keydown', (event) => {
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
      if (!forward && !back) return;
      event.preventDefault();
      showCard(forward ? active + 1 : active - 1);
      cards[active]?.focus();
    });

    applyDeck();
  });

  const revealVisibleElements = () => {
    const viewportHeight = window.innerHeight;
    revealElements.forEach((element) => {
      if (element.classList.contains('is-visible')) return;
      const rect = element.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.94 && rect.bottom > 0) element.classList.add('is-visible');
    });
  };

  let scrollFrame = 0;
  const updateOnScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24 || menuOpen);
    revealVisibleElements();
  };

  const requestScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      updateOnScroll();
    });
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  const videoDialog = document.getElementById('videoDialog');
  const videoDialogFrame = document.getElementById('videoDialogFrame');
  const videoDialogTitle = document.getElementById('videoDialogTitle');
  const videoDialogClose = document.getElementById('videoDialogClose');
  const youtubeCards = [...document.querySelectorAll('[data-youtube-id]')];
  let activeYoutubeCard = null;
  let lastYoutubeTrigger = null;

  const getEmbeddedVideoTitle = (card) => {
    if (!card) return '';
    return currentLanguage === 'zh'
      ? card.dataset.youtubeTitleZh
      : card.dataset.youtubeTitleEn;
  };

  function updateEmbeddedVideoTitle() {
    if (!videoDialogTitle || !activeYoutubeCard) return;
    const title = getEmbeddedVideoTitle(activeYoutubeCard);
    videoDialogTitle.textContent = title;
    const embeddedFrame = videoDialogFrame?.querySelector('iframe');
    if (embeddedFrame) embeddedFrame.title = title;
  }

  const openEmbeddedVideo = (card) => {
    if (!videoDialog || !videoDialogFrame || !card) return;
    activeYoutubeCard = card;
    lastYoutubeTrigger = card;
    updateEmbeddedVideoTitle();
    videoDialogFrame.replaceChildren();

    const iframe = document.createElement('iframe');
    const language = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(card.dataset.youtubeId)}?autoplay=1&rel=0&playsinline=1&modestbranding=1&hl=${language}`;
    iframe.title = getEmbeddedVideoTitle(card);
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'eager');
    videoDialogFrame.append(iframe);

    document.body.classList.add('video-modal-open');
    if (!videoDialog.open) {
      if (typeof videoDialog.showModal === 'function') videoDialog.showModal();
      else videoDialog.setAttribute('open', '');
    }
  };

  const cleanupEmbeddedVideo = () => {
    videoDialogFrame?.replaceChildren();
    document.body.classList.remove('video-modal-open');
    const trigger = lastYoutubeTrigger;
    activeYoutubeCard = null;
    lastYoutubeTrigger = null;
    if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
  };

  const closeEmbeddedVideo = () => {
    if (!videoDialog) return;
    if (videoDialog.open) {
      if (typeof videoDialog.close === 'function') videoDialog.close();
      else videoDialog.removeAttribute('open');
    }
    cleanupEmbeddedVideo();
  };

  youtubeCards.forEach((card) => {
    card.addEventListener('click', () => openEmbeddedVideo(card));
  });

  if (videoDialog) {
    videoDialogClose?.addEventListener('click', closeEmbeddedVideo);

    videoDialog.addEventListener('click', (event) => {
      if (event.target === videoDialog) closeEmbeddedVideo();
    });

    videoDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeEmbeddedVideo();
    });

    videoDialog.addEventListener('close', cleanupEmbeddedVideo);
  }

  const artDialog = document.getElementById('artDialog');
  const artDialogImage = document.getElementById('artDialogImage');
  const artDialogTitle = document.getElementById('artDialogTitle');
  const artDialogClose = document.getElementById('artDialogClose');
  const artDialogCount = document.getElementById('artDialogCount');
  const artDialogPrev = document.getElementById('artDialogPrev');
  const artDialogNext = document.getElementById('artDialogNext');
  const artTriggers = [...document.querySelectorAll('[data-art]')];
  let artList = [];
  let artIndex = 0;
  let lastArtTrigger = null;

  const pad2 = (value) => String(value).padStart(2, '0');

  const showArt = (next) => {
    if (!artList.length || !artDialogImage) return;
    artIndex = (next + artList.length) % artList.length;
    const trigger = artList[artIndex];
    const source = trigger.querySelector('img');
    artDialogImage.src = trigger.dataset.full || (source ? source.currentSrc || source.src : '');
    if (source) {
      artDialogImage.alt = source.alt;
      artDialogImage.width = source.getAttribute('width') || '';
      artDialogImage.height = source.getAttribute('height') || '';
    }
    if (artDialogTitle) {
      const titleEn = trigger.dataset.titleEn || '';
      const titleZh = trigger.dataset.titleZh || '';
      artDialogTitle.dataset.en = titleEn;
      artDialogTitle.dataset.zh = titleZh;
      artDialogTitle.textContent = currentLanguage === 'zh' ? titleZh : titleEn;
    }
    if (artDialogCount) {
      artDialogCount.textContent = `${pad2(artIndex + 1)} / ${pad2(artList.length)}`;
    }
    lastArtTrigger = trigger;
  };

  const stepArt = (delta) => {
    if (!artDialog || !artDialog.open) return;
    showArt(artIndex + delta);
  };

  const openArt = (trigger) => {
    if (!artDialog || !artDialogImage || !trigger) return;
    const group = trigger.dataset.artGroup;
    artList = artTriggers.filter((item) => item.dataset.artGroup === group);
    showArt(Math.max(0, artList.indexOf(trigger)));
    document.body.classList.add('video-modal-open');
    if (!artDialog.open) {
      if (typeof artDialog.showModal === 'function') artDialog.showModal();
      else artDialog.setAttribute('open', '');
    }
  };

  const closeArt = () => {
    if (!artDialog) return;
    document.body.classList.remove('video-modal-open');
    const trigger = lastArtTrigger;
    lastArtTrigger = null;
    if (artDialog.open) {
      if (typeof artDialog.close === 'function') artDialog.close();
      else artDialog.removeAttribute('open');
    }
    if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
  };

  artTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openArt(trigger));
  });

  if (artDialog) {
    artDialogClose?.addEventListener('click', closeArt);
    artDialogPrev?.addEventListener('click', () => stepArt(-1));
    artDialogNext?.addEventListener('click', () => stepArt(1));

    artDialog.addEventListener('click', (event) => {
      if (event.target === artDialog) closeArt();
    });

    artDialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepArt(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepArt(1);
      }
    });

    artDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeArt();
    });

    artDialog.addEventListener('close', () => {
      document.body.classList.remove('video-modal-open');
      lastArtTrigger = null;
    });
  }

  setLanguage('en');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  updateOnScroll();
})();
