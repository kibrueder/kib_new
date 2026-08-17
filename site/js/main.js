(function () {
  'use strict';

  // Theme toggle
  function setTheme(theme) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('theme-toggle-mobile')?.addEventListener('click', toggleTheme);

  // Mobile menu
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOpen = document.getElementById('menu-icon-open');
  const menuClose = document.getElementById('menu-icon-close');
  const backdrop = document.getElementById('mobile-menu-backdrop');

  function closeMobileMenu() {
    mobileMenu?.classList.add('hidden');
    menuOpen?.classList.remove('hidden');
    menuClose?.classList.add('hidden');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }

  function openMobileMenu() {
    mobileMenu?.classList.remove('hidden');
    menuOpen?.classList.add('hidden');
    menuClose?.classList.remove('hidden');
    menuBtn?.setAttribute('aria-expanded', 'true');
  }

  menuBtn?.addEventListener('click', () => {
    if (mobileMenu?.classList.contains('hidden')) openMobileMenu();
    else closeMobileMenu();
  });
  backdrop?.addEventListener('click', closeMobileMenu);
  mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobileMenu));

  // Smooth scroll to services
  function scrollToServices(e) {
    const services = document.getElementById('services');
    if (services) {
      e.preventDefault();
      const top = services.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    } else if (!window.location.pathname.match(/^\/?$/)) {
      // navigate to home#services
      return;
    }
  }

  document.querySelectorAll('.js-scroll-services').forEach((el) => {
    el.addEventListener('click', scrollToServices);
  });

  // Google Analytics — only after cookie accept
  function loadAnalytics() {
    const gaId = window.SITE_GA_ID;
    if (!gaId || window.__gaLoaded) return;
    window.__gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);
  }

  // Cookie banner
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieConsent = localStorage.getItem('cookieConsent');

  if (cookieConsent === 'accepted') {
    loadAnalytics();
  } else if (cookieBanner && !cookieConsent) {
    setTimeout(() => cookieBanner.classList.remove('hidden'), 1000);
  }

  function hideCookie(value) {
    localStorage.setItem('cookieConsent', value);
    cookieBanner?.classList.add('hidden');
    if (value === 'accepted') loadAnalytics();
  }

  document.getElementById('cookie-accept')?.addEventListener('click', () => hideCookie('accepted'));
  document.getElementById('cookie-decline')?.addEventListener('click', () => hideCookie('declined'));
  document.getElementById('cookie-close')?.addEventListener('click', () => hideCookie('declined'));

  // Fade-in on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
  });

  // Homepage timeline scroll progress
  const timelineLine = document.getElementById('timeline-progress');
  const timelineSection = document.getElementById('timeline');
  if (timelineLine && timelineSection) {
    window.addEventListener(
      'scroll',
      () => {
        const rect = timelineSection.getBoundingClientRect();
        const viewH = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (rect.height + viewH * 0.3)));
        timelineLine.style.height = `${progress * 100}%`;
      },
      { passive: true }
    );
  }

  // Clickable cards with data-href
  document.querySelectorAll('[data-href]').forEach((el) => {
    el.addEventListener('click', () => {
      window.location.href = el.getAttribute('data-href');
    });
  });
})();
