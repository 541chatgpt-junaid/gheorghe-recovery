/* ==========================================================================
   Gheorghe 24/7 Recovery — interactions
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '447402370507';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Light / dark theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncToggle() {
    var label = currentTheme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
    themeMeta.setAttribute('content', currentTheme() === 'light' ? '#FFFFFF' : '#0E0E0E');
  }

  function setTheme(theme) {
    if (!reduceMotion.matches) {
      root.classList.add('theme-anim');
      setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
    }
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    syncToggle();
  }

  if (themeToggle) {
    syncToggle();
    themeToggle.addEventListener('click', function () {
      setTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mobile-menu');
  var overlay = document.querySelector('.menu-overlay');
  var closeBtn = menu.querySelector('.mobile-menu__close');
  var lastFocus = null;

  function focusables() {
    return menu.querySelectorAll('a[href], button:not([disabled])');
  }

  function openMenu() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    // force reflow so the overlay fades in
    void overlay.offsetWidth;
    overlay.classList.add('is-visible');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    setTimeout(function () { closeBtn.focus(); }, 50);
  }

  function closeMenu(restoreFocus) {
    overlay.classList.remove('is-visible');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setTimeout(function () { overlay.hidden = true; }, 300);
    if (restoreFocus !== false && lastFocus) lastFocus.focus();
  }

  burger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', function () { closeMenu(); });
  overlay.addEventListener('click', function () { closeMenu(); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { closeMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key === 'Tab') {
      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 900 && menu.classList.contains('is-open')) closeMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');

  function revealDone(el) {
    // Once revealed, drop the stagger delay so hover effects respond instantly
    el.addEventListener('transitionend', function handler(ev) {
      if (ev.propertyName !== 'opacity') return;
      el.style.setProperty('--d', '0s');
      el.removeEventListener('transitionend', handler);
    });
  }

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealDone(entry.target);
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('.counter');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    if (reduceMotion.matches || target <= 1) { el.textContent = target; return; }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Tow truck driving across the road ---------- */
  var road = document.querySelector('.road');
  var truck = document.querySelector('.road__truck');
  var wheels = truck ? truck.querySelectorAll('.wheel') : [];

  function updateTruck() {
    if (!road || !truck) return;
    var rect = road.getBoundingClientRect();
    var vh = window.innerHeight;
    if (rect.bottom < -200 || rect.top > vh + 200) return;

    var roadWidth = road.offsetWidth;
    var truckWidth = truck.offsetWidth;

    if (reduceMotion.matches) {
      truck.style.transform = 'translateX(' + (roadWidth - truckWidth) / 2 + 'px)';
      return;
    }

    // progress 0 → 1 as the road moves from the bottom of the viewport to ~25% from the top
    var progress = (vh - rect.top) / (vh * 0.85);
    progress = Math.max(0, Math.min(1, progress));
    var x = -truckWidth + progress * (roadWidth + truckWidth * 0.2);
    x = Math.min(x, roadWidth - truckWidth);
    truck.style.transform = 'translateX(' + x + 'px)';

    var rotation = progress * 1080;
    for (var i = 0; i < wheels.length; i++) {
      wheels[i].style.transform = 'rotate(' + rotation + 'deg)';
    }
  }

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll('.nav__list a');
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  function updateActiveNav() {
    var pos = window.scrollY + window.innerHeight * 0.35;
    var activeIndex = -1;
    var bestTop = -1;
    sections.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= pos && sec.offsetTop > bestTop) { bestTop = sec.offsetTop; activeIndex = i; }
    });
    navLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === activeIndex); });
  }

  /* ---------- Scroll loop (rAF throttled) ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      updateTruck();
      updateActiveNav();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Reviews slider ---------- */
  var slider = document.querySelector('.slider');
  if (slider) {
    var track = slider.querySelector('.slider__track');
    var slides = track.querySelectorAll('.review');
    var dotsWrap = slider.querySelector('.slider__dots');
    var dots = [];

    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', 'Show review ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function currentIndex() {
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0;
      var bestDist = Infinity;
      slides.forEach(function (s, i) {
        var c = s.offsetLeft - track.offsetLeft + s.offsetWidth / 2;
        var d = Math.abs(c - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function goTo(i) {
      var n = slides.length;
      i = (i + n) % n;
      var s = slides[i];
      var left = s.offsetLeft - track.offsetLeft - (track.clientWidth - s.offsetWidth) / 2;
      track.scrollTo({ left: left, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    function updateDots() {
      var idx = currentIndex();
      dots.forEach(function (d, i) {
        d.setAttribute('aria-current', i === idx ? 'true' : 'false');
      });
    }

    slider.querySelectorAll('.slider__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goTo(currentIndex() + parseInt(btn.getAttribute('data-dir'), 10));
      });
    });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex() - 1); }
    });

    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDots, 60);
    }, { passive: true });
    window.addEventListener('resize', updateDots);
    updateDots();
  }

  /* ---------- Quick quote form → WhatsApp ---------- */
  var form = document.getElementById('quote-form');
  if (form) {
    var rules = {
      name: function (v) { return v.length >= 2 ? '' : 'Please enter your name.'; },
      phone: function (v) {
        var digits = v.replace(/\D/g, '');
        if (!v) return 'Please enter your phone number.';
        if (!/^[+\d][\d\s()-]*$/.test(v) || digits.length < 10 || digits.length > 15) {
          return 'Please enter a valid phone number.';
        }
        return '';
      },
      pickup: function (v) { return v.length >= 2 ? '' : 'Please tell us where to collect the vehicle.'; },
      vehicle: function (v) { return v ? '' : 'Please choose a vehicle type.'; }
    };

    function validateField(name) {
      var input = form.elements[name];
      var msg = rules[name](input.value.trim());
      var field = input.closest('.field');
      var err = document.getElementById('e-' + name);
      field.classList.toggle('has-error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.textContent = msg;
      return !msg;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () {
        if (input.value.trim()) validateField(name);
      });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validateField(name);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var v = function (n) { return form.elements[n].value.trim(); };
      var lines = [
        'Hello Gheorghe 24/7 Recovery, I need a quote.',
        '',
        'Name: ' + v('name'),
        'Phone: ' + v('phone'),
        'Pickup: ' + v('pickup'),
        'Drop-off: ' + (v('dropoff') || 'Not specified'),
        'Vehicle: ' + v('vehicle')
      ];
      if (v('message')) lines.push('Message: ' + v('message'));

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var win = window.open(url, '_blank');
      if (win) { win.opener = null; } else { window.location.href = url; }
    });
  }
})();
