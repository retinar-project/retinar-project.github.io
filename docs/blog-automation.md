# Automatización del blog de Retinar

## Objetivo

Automatizar dentro de Codex la generación semanal de artículos bilingües del blog, su validación técnica y su despliegue, dejando fuera por ahora la generación de imágenes nuevas y la difusión en redes sociales.

## Piezas implementadas

- Skill local de generación editorial: [retinar-generar-articulo-blog](/Users/ignaciorlando/Documents/retinar-website/codex-skills/retinar-generar-articulo-blog/SKILL.md)
- Skill local de publicación y deploy: [retinar-publicar-articulo-blog](/Users/ignaciorlando/Documents/retinar-website/codex-skills/retinar-publicar-articulo-blog/SKILL.md)
- Inventario editorial para evitar repetición: [scripts/blog_topic_inventory.py](/Users/ignaciorlando/Documents/retinar-website/scripts/blog_topic_inventory.py)
- Script de commit y deploy del artículo: [scripts/commit_and_deploy_blog.sh](/Users/ignaciorlando/Documents/retinar-website/scripts/commit_and_deploy_blog.sh)

## Flujo semanal previsto

1. La automatización abre la skill local de generación.
2. Se ejecuta `python3 scripts/blog_topic_inventory.py --format markdown`.
3. Se elige un tema nuevo y evergreen después de revisar el inventario y buscar fuentes online.
4. Se redactan los artículos ES y EN con placeholder visual común:
`/assets/img/placeholders/blog-hero.png`
5. Se valida el sitio con `./scripts/verify_contact_config.sh` y `bundle exec jekyll build`.
6. Se ejecuta `./scripts/commit_and_deploy_blog.sh ...`.
7. El repo fuente queda commiteado y pusheado, y luego se dispara el deploy a `retinar-project.github.io`.

## Decisiones de diseño

- El control de repetición temática se apoya en similitud léxica simple. No reemplaza criterio editorial, pero evita colisiones obvias.
- El deploy se mantiene en el flujo existente del repo para no introducir una ruta paralela de publicación.
- Mientras no exista automatización de imágenes, todos los artículos generados por este flujo usan un asset placeholder estable.
- Las skills viven dentro del repo para que la automatización pueda abrirlas explícitamente sin depender de una instalación global en `~/.codex/skills`.

## Comandos útiles

```bash
python3 scripts/blog_topic_inventory.py --format markdown
python3 scripts/blog_topic_inventory.py --compare "adherencia al tamizaje de retina en APS"
./scripts/verify_contact_config.sh
bundle exec jekyll build
./scripts/commit_and_deploy_blog.sh "Agregar artículo blog: ejemplo" _recursos_es/ejemplo.md _resources_en/example.md
```
