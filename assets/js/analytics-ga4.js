(function () {
  var config = window.retinarAnalytics;
  if (!config || !config.measurementId || typeof window.gtag !== 'function') return;

  var banner = document.querySelector('[data-cookie-consent]');
  var acceptButton = document.querySelector('[data-analytics-accept]');
  var rejectButton = document.querySelector('[data-analytics-reject]');
  var settingsButtons = document.querySelectorAll('[data-analytics-consent-settings]');
  var analyticsLoaded = false;

  function getStoredChoice() {
    try {
      return window.localStorage.getItem(config.storageKey);
    } catch (error) {
      return null;
    }
  }

  function storeChoice(choice) {
    try {
      window.localStorage.setItem(config.storageKey, choice);
    } catch (error) {
      // La elección sigue aplicándose durante la página actual si el almacenamiento no está disponible.
    }
  }

  function setAnalyticsConsent(granted) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.measurementId);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', config.measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function removeAnalyticsCookies() {
    var hostname = window.location.hostname;
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;

      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
      if (hostname) {
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + hostname + '; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + hostname + '; SameSite=Lax';
      }
    });
  }

  function showBanner(shouldFocus) {
    if (!banner) return;
    banner.hidden = false;
    if (shouldFocus && acceptButton) acceptButton.focus();
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function acceptAnalytics() {
    storeChoice('granted');
    setAnalyticsConsent(true);
    loadAnalytics();
    hideBanner();
  }

  function rejectAnalytics() {
    storeChoice('denied');
    setAnalyticsConsent(false);
    removeAnalyticsCookies();
    hideBanner();
  }

  if (acceptButton) acceptButton.addEventListener('click', acceptAnalytics);
  if (rejectButton) rejectButton.addEventListener('click', rejectAnalytics);

  settingsButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      showBanner(true);
    });
  });

  var storedChoice = getStoredChoice();
  if (storedChoice === 'granted') {
    setAnalyticsConsent(true);
    loadAnalytics();
  } else if (storedChoice !== 'denied') {
    showBanner(false);
  }
})();
