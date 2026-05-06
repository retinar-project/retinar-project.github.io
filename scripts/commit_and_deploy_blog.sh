#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Uso:
  ./scripts/commit_and_deploy_blog.sh "mensaje commit" ruta1 [ruta2 ...]
EOF
}

error() {
  echo "Error: $*" >&2
  exit 1
}

[[ $# -ge 2 ]] || {
  usage
  exit 1
}

COMMIT_MESSAGE="$1"
shift

cd "$ROOT_DIR"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || error "Falta comando '$1'."
}

require_cmd git

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
mapfile -t CHANGED_FILES < <(git status --porcelain | awk '{print $2}')

declare -A ALLOWED=()
for path in "$@"; do
  [[ -e "$path" ]] || error "No existe '$path'."
  ALLOWED["$path"]=1
done

for changed in "${CHANGED_FILES[@]}"; do
  [[ -n "${ALLOWED[$changed]:-}" ]] || error "Hay cambios fuera del artículo: '$changed'."
done

git add -- "$@"

git diff --cached --quiet && error "No hay cambios staged para commitear."

git commit -m "$COMMIT_MESSAGE"
git push origin "$CURRENT_BRANCH"

SOURCE_BRANCH="$CURRENT_BRANCH" BUNDLE_BIN=/usr/bin/bundle ./scripts/deploy.sh "$COMMIT_MESSAGE"
