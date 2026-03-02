(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var primaryNav = document.querySelector('[data-primary-nav]');

  function syncHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = primaryNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    primaryNav.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!link) return;

      primaryNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  }

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var carousels = document.querySelectorAll('[data-carousel]');

  carousels.forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var intervalId = null;

    if (!track || !prev || !next) return;

    function getStep() {
      var card = track.querySelector('.logo-card');
      if (!card) return track.clientWidth * 0.85;

      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || '16');
      return card.getBoundingClientRect().width + gap;
    }

    function getMaxScroll() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function move(direction) {
      var maxScroll = getMaxScroll();
      if (maxScroll <= 8) return;

      if (direction > 0 && track.scrollLeft >= maxScroll - 4) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      if (direction < 0 && track.scrollLeft <= 4) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
        return;
      }

      track.scrollBy({ left: getStep() * direction, behavior: 'smooth' });
    }

    function refreshButtons() {
      var maxScroll = getMaxScroll();
      var needsNavigation = maxScroll > 8;

      carousel.classList.toggle('is-nav-hidden', !needsNavigation);
      prev.hidden = !needsNavigation;
      next.hidden = !needsNavigation;

      if (!needsNavigation) {
        prev.disabled = true;
        next.disabled = true;
        return;
      }

      prev.disabled = false;
      next.disabled = false;
    }

    function stopAutoPlay() {
      if (!intervalId) return;
      window.clearInterval(intervalId);
      intervalId = null;
    }

    function startAutoPlay() {
      if (prefersReducedMotion) return;
      if (prev.hidden || next.hidden) return;
      stopAutoPlay();
      intervalId = window.setInterval(function () {
        move(1);
      }, 4200);
    }

    function syncCarouselState() {
      refreshButtons();
      if (prev.hidden || next.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    }

    prev.addEventListener('click', function () {
      move(-1);
    });

    next.addEventListener('click', function () {
      move(1);
    });

    track.addEventListener('scroll', refreshButtons, { passive: true });
    window.addEventListener('resize', syncCarouselState);

    track.querySelectorAll('img').forEach(function (image) {
      if (image.complete) return;
      image.addEventListener('load', syncCarouselState, { once: true });
      image.addEventListener('error', syncCarouselState, { once: true });
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    carousel.addEventListener('focusin', stopAutoPlay);
    carousel.addEventListener('focusout', startAutoPlay);

    syncCarouselState();
  });

  var searchInput = document.querySelector('[data-resource-search]');
  var filterContainer = document.querySelector('[data-resource-filters]');
  var cards = document.querySelectorAll('[data-resource-item]');
  var emptyState = document.querySelector('[data-resource-empty]');
  var activeCategory = 'all';

  function filterResources() {
    if (!cards.length) return;

    var query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    var visible = 0;

    cards.forEach(function (card) {
      var category = card.getAttribute('data-category');
      var title = card.getAttribute('data-title');
      var excerpt = card.getAttribute('data-excerpt');
      var categoryMatch = activeCategory === 'all' || category === activeCategory;
      var queryMatch = !query || title.indexOf(query) > -1 || excerpt.indexOf(query) > -1;
      var show = categoryMatch && queryMatch;

      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle('is-hidden', visible > 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterResources);
  }

  if (filterContainer) {
    filterContainer.addEventListener('click', function (event) {
      var button = event.target.closest('[data-category]');
      if (!button) return;

      activeCategory = button.getAttribute('data-category');
      filterContainer.querySelectorAll('[data-category]').forEach(function (chip) {
        chip.classList.remove('is-active');
      });
      button.classList.add('is-active');
      filterResources();
    });
  }

  filterResources();

  var revealNodes = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealNodes.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealNodes.forEach(function (node) {
      revealObserver.observe(node);
    });
  } else {
    revealNodes.forEach(function (node) {
      node.classList.add('is-visible');
    });
  }
})();
