#!/usr/bin/env bash
# Valida que el correo de contacto y el endpoint de Formspree sigan alineados con el sitio.
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
echo "verify_contact_config: OK"
