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
grep -qE 'formspree\.io/f/[a-z]+' _config.yml || {
  echo "error: _config.yml debe incluir un formspree_endpoint (https://formspree.io/f/...)"
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
