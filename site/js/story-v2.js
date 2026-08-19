(function () {
  'use strict';

  const root = document.querySelector('.story-page');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panels = Array.from(root.querySelectorAll('.story-panel'));
  const stageWord = document.getElementById('story-stage-word');
  const stageNum = document.getElementById('story-stage-num');
  const railEl = document.getElementById('story-rail');
  let mapShowing = 'before';
  let currentIndex = 0;
  let wordTimer = null;

  function pad(n) {
    return ('0' + (n + 1)).slice(-2);
  }

  function getWord(panel) {
    const key = panel.getAttribute('data-story-word');
    if (typeof window.t === 'function' && key) {
      const translated = window.t(key);
      if (translated && translated !== key) return translated;
    }
    return panel.getAttribute('data-story-word-text') || (stageWord ? stageWord.textContent : '') || '';
  }

  function fitStageWord() {
    if (!stageWord || window.innerWidth <= 820) return;
    stageWord.style.fontSize = '';
    let size = parseFloat(getComputedStyle(stageWord).fontSize);
    const floor = size * 0.45;
    while (stageWord.scrollWidth > stageWord.clientWidth + 1 && size > floor) {
      size -= Math.max(1, size * 0.05);
      stageWord.style.fontSize = size + 'px';
    }
  }

  function setStageNum(value) {
    if (!stageNum) return;
    if (stageNum.textContent === value) return;

    if (reduceMotion) {
      stageNum.textContent = value;
      return;
    }

    stageNum.classList.remove('is-in');
    stageNum.classList.add('is-out');

    setTimeout(function () {
      stageNum.textContent = value;
      stageNum.classList.remove('is-out');
      stageNum.classList.add('is-in');
    }, 140);
  }

  function setStage(index) {
    if (index === currentIndex || !panels[index] || !stageWord) return;
    currentIndex = index;

    const word = getWord(panels[index]);
    setStageNum(pad(index));

    if (railEl) {
      Array.from(railEl.children).forEach((tick, i) => {
        tick.classList.toggle('is-on', i === index);
      });
    }

    if (reduceMotion) {
      stageWord.textContent = word;
      fitStageWord();
      return;
    }

    clearTimeout(wordTimer);
    stageWord.classList.remove('is-in');
    stageWord.classList.add('is-out');

    wordTimer = setTimeout(function () {
      stageWord.textContent = word;
      fitStageWord();
      stageWord.classList.remove('is-out');
      stageWord.classList.add('is-in');
    }, 280);
  }

  if (railEl && !railEl.children.length) {
    panels.forEach(function (_, i) {
      const tick = document.createElement('i');
      if (i === 0) tick.className = 'is-on';
      railEl.appendChild(tick);
    });
  }

  if (stageWord) {
    stageWord.classList.add('is-in');
    if (stageNum) stageNum.classList.add('is-in');
    fitStageWord();
    window.addEventListener('resize', fitStageWord);
  }

  const scrollHint = document.getElementById('story-scroll-hint');
  const footer = document.querySelector('footer');
  const stage = document.getElementById('story-stage');
  let panelOffsets = [];
  let panelHeights = [];
  let snapOff = false;

  function measurePanels() {
    panelOffsets = [];
    panelHeights = [];
    panels.forEach(function (panel) {
      const rect = panel.getBoundingClientRect();
      panelOffsets.push(rect.top + window.scrollY);
      panelHeights.push(rect.height);
    });
  }

  function activePanelIndex() {
    const mid = window.scrollY + window.innerHeight * 0.5;
    let best = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < panels.length; i++) {
      const center = panelOffsets[i] + panelHeights[i] * 0.5;
      const distance = Math.abs(center - mid);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }

    return best;
  }

  function updateScrollHint() {
    if (!scrollHint) return;
    const max = document.body.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    scrollHint.style.opacity = progress > 0.02 ? '0' : '';
  }

  function updateEndOfStory() {
    const last = panels[panels.length - 1];
    if (!last) return;

    const lastTop = last.getBoundingClientRect().top;
    if (!snapOff && lastTop <= 12) snapOff = true;
    if (snapOff && lastTop > window.innerHeight * 0.45) snapOff = false;
    document.documentElement.classList.toggle('story-snap-off', snapOff);

    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
    const hideStage = footerTop < window.innerHeight * 0.58;
    if (stage) stage.classList.toggle('is-hidden', hideStage);
    if (railEl) railEl.classList.toggle('is-hidden', hideStage);
  }

  function onStoryScroll() {
    updateScrollHint();
    updateEndOfStory();
    setStage(activePanelIndex());
  }

  window.addEventListener('scroll', onStoryScroll, { passive: true });
  window.addEventListener('resize', function () {
    measurePanels();
    fitStageWord();
    onStoryScroll();
  });
  window.addEventListener('load', function () {
    measurePanels();
    onStoryScroll();
  });

  measurePanels();
  onStoryScroll();

  root.querySelectorAll('.story-map-img').forEach(function (img) {
    if (img.complete) return;
    img.addEventListener('load', function () {
      measurePanels();
      onStoryScroll();
    }, { once: true });
  });

  root.querySelectorAll('a[href^="#story-"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  function locale() {
    return (document.documentElement.lang || 'de').indexOf('en') === 0 ? 'en-GB' : 'de-DE';
  }

  function formatProofValue(value, prefix, suffix, decimals) {
    const formatted = decimals > 0
      ? value.toLocaleString(locale(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(Math.round(value));
    return prefix + formatted + suffix;
  }

  function animateProofCounter(el) {
    const target = Number(el.dataset.value);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = Number(el.dataset.decimals || 0);
    if (Number.isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = formatProofValue(target, prefix, suffix, decimals);
      return;
    }

    const start = performance.now();
    const duration = 1100;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatProofValue(target * eased, prefix, suffix, decimals);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function resetAndAnimatePanel(panel) {
    panel.querySelectorAll('[data-counter]').forEach(function (el) {
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      el.textContent = prefix + '0' + suffix;
      animateProofCounter(el);
    });
  }

  const proofButtons = root.querySelectorAll('[data-proof]');
  const proofPanels = root.querySelectorAll('[data-proof-panel]');

  proofButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const mode = btn.getAttribute('data-proof');
      proofButtons.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      proofPanels.forEach(function (panel) {
        const show = panel.getAttribute('data-proof-panel') === mode;
        panel.hidden = !show;
        if (show) resetAndAnimatePanel(panel);
      });
    });
  });

  const adsSection = document.getElementById('story-ads');
  if (adsSection && 'IntersectionObserver' in window) {
    const adsSpy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const visible = adsSection.querySelector('[data-proof-panel]:not([hidden])');
          if (visible) resetAndAnimatePanel(visible);
          adsSpy.disconnect();
        });
      },
      { threshold: 0.35 }
    );
    adsSpy.observe(adsSection);
  } else {
    const visible = root.querySelector('[data-proof-panel]:not([hidden])');
    if (visible) resetAndAnimatePanel(visible);
  }

  function formatCount(value, prefix, suffix) {
    return prefix + String(Math.round(value)) + suffix;
  }

  function animateCount(el) {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';

    const to = parseFloat(el.dataset.to);
    const from = parseFloat(el.dataset.from || '0');
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (Number.isNaN(to)) return;

    if (reduceMotion) {
      el.textContent = formatCount(to, prefix, suffix);
      return;
    }

    const duration = 1100;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(from + (to - from) * eased, prefix, suffix);
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const counters = root.querySelectorAll('.js-story-count');
  if (counters.length && 'IntersectionObserver' in window) {
    const countSpy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countSpy.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { countSpy.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  function setMap(which) {
    mapShowing = which;
    root.querySelectorAll('[data-story-map-layer]').forEach(function (img) {
      img.classList.toggle('is-active', img.getAttribute('data-story-map-layer') === which);
    });
    root.querySelectorAll('[data-story-map-label]').forEach(function (label) {
      label.classList.toggle('hidden', label.getAttribute('data-story-map-label') !== which);
    });
    root.querySelectorAll('[data-story-map-toggle]').forEach(function (label) {
      label.classList.toggle('hidden', label.getAttribute('data-story-map-toggle') === which);
    });
    const toggleBtn = root.querySelector('#story-map-toggle-btn');
    if (toggleBtn) toggleBtn.setAttribute('aria-pressed', which === 'after' ? 'true' : 'false');
  }

  const mapToggle = root.querySelector('#story-map-toggle-btn');
  if (mapToggle) {
    mapToggle.addEventListener('click', function () {
      setMap(mapShowing === 'before' ? 'after' : 'before');
    });
  }

  function hookI18n() {
    if (typeof window.applyLanguage !== 'function' || window.__storyI18nHooked) return;
    window.__storyI18nHooked = true;
    const origApply = window.applyLanguage;
    window.applyLanguage = function (lang) {
      origApply(lang);
      if (panels[currentIndex]) {
        const w = getWord(panels[currentIndex]);
        if (stageWord) {
          stageWord.textContent = w;
          fitStageWord();
        }
      }
      const visibleProof = root.querySelector('[data-proof-panel]:not([hidden])');
      if (visibleProof) resetAndAnimatePanel(visibleProof);
    };
  }

  hookI18n();
  document.addEventListener('i18n-ready', hookI18n);
})();
