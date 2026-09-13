/* One entrance per block, with no hidden content when scripting is unavailable. */
(function () {
  'use strict';

  window.retinarMotion = function (root) {
    if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;
    var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var seen = new WeakSet();
    var pending = new Set();
    var running = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        observer.unobserve(node);
        pending.delete(node);
        if (preference.matches || node.contains(document.activeElement)) return;
        var index = Array.prototype.indexOf.call(node.parentElement.children, node);
        var animation = node.animate([
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 560,
          delay: Math.min(index, 3) * 65,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards'
        });
        running.set(node, animation);
        animation.onfinish = animation.oncancel = function () { running.delete(node); };
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    function refresh() {
      pending.forEach(function (node) {
        if (!root.contains(node)) { observer.unobserve(node); pending.delete(node); }
      });
      running.forEach(function (animation, node) {
        if (!root.contains(node)) animation.cancel();
      });
      // Animate siblings, never nested ancestors and children together.
      root.querySelectorAll('main .section > .container > *').forEach(function (node) {
        if (seen.has(node)) return;
        seen.add(node);
        if (preference.matches) return;
        pending.add(node);
        observer.observe(node);
      });
    }

    function reduceMotion() {
      if (!preference.matches) return;
      observer.disconnect();
      pending.clear();
      running.forEach(function (animation) { animation.cancel(); });
    }

    function onFocus(event) {
      running.forEach(function (animation, node) {
        if (node.contains(event.target)) animation.cancel();
      });
    }

    preference.addEventListener('change', reduceMotion);
    root.addEventListener('focusin', onFocus);
    refresh();
    return {
      refresh: refresh,
      destroy: function () {
        observer.disconnect();
        pending.clear();
        running.forEach(function (animation) { animation.cancel(); });
        preference.removeEventListener('change', reduceMotion);
        root.removeEventListener('focusin', onFocus);
      }
    };
  };
})();
