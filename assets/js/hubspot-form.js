(function () {
  var forms = document.querySelectorAll('[data-lead-form][data-hubspot-portal-id][data-hubspot-form-id]');
  if (!forms.length || typeof window.fetch !== 'function') return;

  var nativeSubmit = window.HTMLFormElement.prototype.submit;
  var hubspotTimeoutMs = 5000;

  function readField(formData, name) {
    var value = formData.get(name);
    return typeof value === 'string' ? value.trim() : '';
  }

  function addContactField(fields, name, value) {
    if (!value) return;
    fields.push({ objectTypeId: '0-1', name: name, value: value });
  }

  function splitName(fullName) {
    var parts = fullName.split(/\s+/).filter(Boolean);
    return {
      firstName: parts.shift() || '',
      lastName: parts.join(' ')
    };
  }

  function getCookie(name) {
    var prefix = name + '=';
    var cookies = document.cookie ? document.cookie.split(';') : [];

    for (var index = 0; index < cookies.length; index += 1) {
      var cookie = cookies[index].trim();
      if (cookie.indexOf(prefix) === 0) return decodeURIComponent(cookie.slice(prefix.length));
    }

    return '';
  }

  function hasAnalyticsConsent() {
    try {
      return window.localStorage.getItem('retinar_analytics_consent') === 'granted';
    } catch (error) {
      return false;
    }
  }

  function buildMessage(formData) {
    var message = readField(formData, 'message');
    var metadata = [
      'Formulario: ' + (readField(formData, 'form_variant') || 'website'),
      'Idioma: ' + (readField(formData, 'lang') || document.documentElement.lang || 'es')
    ];
    var inquiryType = readField(formData, 'inquiry_type');

    if (inquiryType) metadata.push('Tipo de consulta: ' + inquiryType);
    return message + '\n\n---\n' + metadata.join('\n');
  }

  function buildSubmission(form) {
    var formData = new window.FormData(form);
    var name = splitName(readField(formData, 'name'));
    var fields = [];
    var context = {
      pageName: document.title,
      pageUri: window.location.href
    };

    addContactField(fields, 'firstname', name.firstName);
    addContactField(fields, 'lastname', name.lastName);
    addContactField(fields, 'email', readField(formData, 'email'));
    addContactField(fields, 'phone', readField(formData, 'phone'));
    addContactField(fields, 'company', readField(formData, 'organization'));
    addContactField(fields, 'message', buildMessage(formData));

    if (hasAnalyticsConsent()) {
      var hutk = getCookie('hubspotutk');
      if (hutk) context.hutk = hutk;
    }

    return {
      fields: fields,
      submittedAt: String(Date.now()),
      context: context
    };
  }

  function sendToHubSpot(form) {
    var portalId = form.getAttribute('data-hubspot-portal-id');
    var formId = form.getAttribute('data-hubspot-form-id');
    var endpoint = 'https://api.hsforms.com/submissions/v3/integration/submit/' +
      encodeURIComponent(portalId) + '/' + encodeURIComponent(formId);
    var controller = typeof window.AbortController === 'function' ? new window.AbortController() : null;
    var timeoutId = window.setTimeout(function () {
      if (controller) controller.abort();
    }, hubspotTimeoutMs);
    var options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildSubmission(form))
    };

    if (controller) options.signal = controller.signal;

    return window.fetch(endpoint, options).then(function (response) {
      if (!response.ok) throw new Error('HubSpot respondió con estado ' + response.status);
    }).finally(function () {
      window.clearTimeout(timeoutId);
    });
  }

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var honeypot = form.querySelector('input[name="company"]');
      if (honeypot && honeypot.value) return;
      if (!form.checkValidity() || form.getAttribute('data-hubspot-submitting') === 'true') return;

      event.preventDefault();
      form.setAttribute('data-hubspot-submitting', 'true');

      var submitButton = form.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
      }

      sendToHubSpot(form).catch(function (error) {
        // Formspree sigue siendo el canal de respaldo si HubSpot no responde.
        if (window.console && typeof window.console.warn === 'function') {
          window.console.warn('No se pudo registrar el lead en HubSpot.', error);
        }
      }).then(function () {
        nativeSubmit.call(form);
      });
    });
  });
})();
