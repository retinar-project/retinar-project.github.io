#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEGACY_DIR_DEFAULT="/Users/ignaciorlando/Documents/retinar-project.github.io"
DEPLOY_MESSAGE="${1:-}"

usage() {
  cat <<'EOF'
Uso:
  ./scripts/deploy.sh ["mensaje commit"]

Flujo:
  1) Build con Jekyll en retinar-website.
  2) Copia _site/ a /Users/ignaciorlando/Documents/retinar-project.github.io.
  3) Preserva el CNAME existente en el repo destino.
  4) Commit + push en la rama de deploy del repo destino.

Variables opcionales:
  LEGACY_DIR=/ruta/al/repo-destino
  LEGACY_BRANCH=main|master|...
  SOURCE_BRANCH=main|...
  BUNDLE_BIN=/ruta/a/bundle
EOF
}

error() {
  echo "Error: $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || error "Falta comando '$1'."
}

detect_legacy_branch() {
  local repo_dir="$1"
  local remote_head

  if [[ -n "${LEGACY_BRANCH:-}" ]]; then
    echo "$LEGACY_BRANCH"
    return
  fi

  remote_head="$(git -C "$repo_dir" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null || true)"
  if [[ -n "$remote_head" ]]; then
    echo "${remote_head#origin/}"
    return
  fi

  if git -C "$repo_dir" show-ref --verify --quiet refs/heads/main; then
    echo "main"
    return
  fi

  git -C "$repo_dir" rev-parse --abbrev-ref HEAD
}

resolve_bundle_bin() {
  local candidate

  if [[ -n "${BUNDLE_BIN:-}" ]]; then
    "$BUNDLE_BIN" --version >/dev/null 2>&1 || error "BUNDLE_BIN='$BUNDLE_BIN' no es ejecutable o no funciona."
    echo "$BUNDLE_BIN"
    return
  fi

  while IFS= read -r candidate; do
    [[ -n "$candidate" ]] || continue
    if "$candidate" --version >/dev/null 2>&1; then
      echo "$candidate"
      return
    fi
  done < <(type -aP bundle 2>/dev/null | awk '!seen[$0]++')

  if [[ -x "/usr/bin/bundle" ]] && /usr/bin/bundle --version >/dev/null 2>&1; then
    echo "/usr/bin/bundle"
    return
  fi

  error "No encontré un 'bundle' funcional. Probá con BUNDLE_BIN=/usr/bin/bundle o reinstalá bundler."
}

cd "$ROOT_DIR"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

require_cmd git
require_cmd rsync
BUNDLE_CMD="$(resolve_bundle_bin)"

if [[ -n "$(git status --porcelain)" ]]; then
  error "Hay cambios sin commitear en retinar-website. Commit o stash antes de deploy."
fi

SOURCE_BRANCH_EXPECTED="${SOURCE_BRANCH:-main}"
CURRENT_SOURCE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[[ "$CURRENT_SOURCE_BRANCH" == "$SOURCE_BRANCH_EXPECTED" ]] || error "Estás en '$CURRENT_SOURCE_BRANCH'. Cambiá a '$SOURCE_BRANCH_EXPECTED' para deploy."

LEGACY_DIR="${LEGACY_DIR:-$LEGACY_DIR_DEFAULT}"
[[ -d "$LEGACY_DIR/.git" ]] || error "No existe repo destino en '$LEGACY_DIR'."
[[ -f "$LEGACY_DIR/CNAME" ]] || error "No existe '$LEGACY_DIR/CNAME'. El deploy preserva ese archivo."

if [[ -n "$(git -C "$LEGACY_DIR" status --porcelain)" ]]; then
  error "Hay cambios sin commitear en '$LEGACY_DIR'. Commit o stash antes de deploy."
fi

echo "Construyendo sitio con Jekyll..."
echo "Usando bundler en: $BUNDLE_CMD"
"$BUNDLE_CMD" exec jekyll build

LEGACY_BRANCH_RESOLVED="$(detect_legacy_branch "$LEGACY_DIR")"
CURRENT_LEGACY_BRANCH="$(git -C "$LEGACY_DIR" rev-parse --abbrev-ref HEAD)"

if [[ "$CURRENT_LEGACY_BRANCH" != "$LEGACY_BRANCH_RESOLVED" ]]; then
  if git -C "$LEGACY_DIR" show-ref --verify --quiet "refs/heads/$LEGACY_BRANCH_RESOLVED"; then
    echo "Cambiando repo destino a rama '$LEGACY_BRANCH_RESOLVED'..."
    git -C "$LEGACY_DIR" checkout "$LEGACY_BRANCH_RESOLVED" >/dev/null
  else
    error "La rama '$LEGACY_BRANCH_RESOLVED' no existe en '$LEGACY_DIR'. Configurá LEGACY_BRANCH."
  fi
fi

echo "Sincronizando _site/ en $LEGACY_DIR (preservando CNAME)..."
rsync -av --delete --exclude '.git/' --exclude 'CNAME' "$ROOT_DIR/_site/" "$LEGACY_DIR/"

git -C "$LEGACY_DIR" add -A

if git -C "$LEGACY_DIR" diff --cached --quiet; then
  echo "No hay cambios para publicar en el repo destino."
  exit 0
fi

COMMIT_MSG="${DEPLOY_MESSAGE:-deploy desde retinar-website $(date '+%Y-%m-%d %H:%M:%S')}"
git -C "$LEGACY_DIR" commit -m "$COMMIT_MSG"
git -C "$LEGACY_DIR" push origin "$LEGACY_BRANCH_RESOLVED"

echo "Deploy publicado en '$LEGACY_BRANCH_RESOLVED' de '$LEGACY_DIR'."
