(function () {
  var config = window.retinarAnalytics;
  if (!config || (!config.measurementId && !config.hubspotPortalId)) return;

  var banner = document.querySelector('[data-cookie-consent]');
  var acceptButton = document.querySelector('[data-analytics-accept]');
  var rejectButton = document.querySelector('[data-analytics-reject]');
  var settingsButtons = document.querySelectorAll('[data-analytics-consent-settings]');
  var googleAnalyticsLoaded = false;
  var hubspotLoaded = false;

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
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }

  function loadGoogleAnalytics() {
    if (!config.measurementId || googleAnalyticsLoaded || typeof window.gtag !== 'function') return;
    googleAnalyticsLoaded = true;

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

  function loadHubSpot() {
    if (!config.hubspotPortalId || hubspotLoaded) return;
    hubspotLoaded = true;

    window._hsq = window._hsq || [];
    window._hsq.push(['doNotTrack', { track: true }]);

    if (document.getElementById('hs-script-loader')) return;

    var script = document.createElement('script');
    script.id = 'hs-script-loader';
    script.async = true;
    script.defer = true;
    script.src = 'https://js.hs-scripts.com/' + encodeURIComponent(config.hubspotPortalId) + '.js';
    document.head.appendChild(script);
  }

  function setHubSpotConsent(granted) {
    if (!config.hubspotPortalId) return;
    window._hsp = window._hsp || [];
    window._hsp.push([
      'setHubSpotConsent',
      {
        analytics: granted,
        advertisement: false,
        functionality: false
      }
    ]);
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

  function removeHubSpotCookies() {
    var hubspotCookieNames = [
      '__hstc',
      'hubspotutk',
      '__hssc',
      '__hssrc',
      '__hs_initial_opt_in',
      'messagesUtk'
    ];
    var hostname = window.location.hostname;

    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (hubspotCookieNames.indexOf(name) === -1) return;

      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
      if (hostname) {
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + hostname + '; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + hostname + '; SameSite=Lax';
      }
    });

    window._hsp = window._hsp || [];
    window._hsp.push(['revokeCookieConsent']);
    window._hsq = window._hsq || [];
    window._hsq.push(['doNotTrack']);
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
    setHubSpotConsent(true);
    loadGoogleAnalytics();
    loadHubSpot();
    hideBanner();
  }

  function rejectAnalytics() {
    storeChoice('denied');
    setAnalyticsConsent(false);
    removeAnalyticsCookies();
    removeHubSpotCookies();
    setHubSpotConsent(false);
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
    setHubSpotConsent(true);
    loadGoogleAnalytics();
    loadHubSpot();
  } else if (storedChoice === 'denied') {
    setAnalyticsConsent(false);
    removeAnalyticsCookies();
    removeHubSpotCookies();
    setHubSpotConsent(false);
  } else if (storedChoice !== 'denied') {
    showBanner(false);
  }
})();
