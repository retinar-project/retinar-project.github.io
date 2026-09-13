#!/usr/bin/env bash
# Valida que los destinos de Formspree y HubSpot sigan alineados con el sitio.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
grep -q 'contact_email: info@retinar.com.ar' _data/site.yml || {
  echo "error: _data/site.yml debe definir contact_email: info@retinar.com.ar"
  exit 1
}
grep -q '^email: info@retinar.com.ar' _config.yml || {
  echo "error: _config.yml debe definir email: info@retinar.com.ar"
  exit 1
}
FORM_ENDPOINT="$(sed -nE 's/^formspree_endpoint: "(https:\/\/formspree\.io\/f\/[[:alnum:]]+)"/\1/p' _config.yml)"
if [[ -z "$FORM_ENDPOINT" ]]; then
  echo "error: _config.yml debe incluir un formspree_endpoint (https://formspree.io/f/...)"
  exit 1
fi
SPA_FORM_COUNT="$(grep -c "form action=\"$FORM_ENDPOINT\" method=\"POST\" data-lead-form" index.html || true)"
if [[ "$SPA_FORM_COUNT" -lt 2 ]]; then
  echo "error: los formularios de contacto y descargas de index.html deben apuntar al formspree_endpoint configurado"
  exit 1
fi
grep -q 'nativeSubmit.call(form)' assets/js/hubspot-form.js || {
  echo "error: el envío a Formspree debe continuar después del intento de registro en HubSpot"
  exit 1
}
grep -qE '^hubspot_portal_id: "[0-9]+"' _config.yml || {
  echo "error: _config.yml debe incluir un hubspot_portal_id numérico"
  exit 1
}
grep -qE '^hubspot_form_id: "[0-9a-fA-F-]{36}"' _config.yml || {
  echo "error: _config.yml debe incluir un hubspot_form_id con formato UUID"
  exit 1
}
grep -q 'data-hubspot-portal-id' _includes/contact-form.html || {
  echo "error: el formulario debe exponer la configuración pública de HubSpot"
  exit 1
}
echo "verify_contact_config: OK"
