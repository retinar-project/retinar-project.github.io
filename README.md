# Retinar Website

Sitio web estático bilingüe (español/inglés) de Retinar, construido con Jekyll y orientado a:

- adquisición de leads institucionales (formulario de demo/contacto),
- comunicación de producto y propuesta de valor,
- contenido evergreen en blog clínico/operativo.

Este documento está pensado para desarrolladores que necesiten mantener, extender o publicar la web.

## 1) Stack y decisiones técnicas

- Generador: `Jekyll 3.9.5` (ver `Gemfile` y `Gemfile.lock`).
- Plugin activo: `jekyll-sitemap` (genera `sitemap.xml`).
- Motor Markdown: `kramdown`.
- Frontend: HTML/Liquid + CSS + JavaScript vanilla (sin bundlers ni framework JS).
- Formularios: `Formspree`.
- Hosting objetivo: compatible con GitHub Pages.

Existe un script de comprobación mínima de configuración de contacto (ver sección 8 y “Pruebas” abajo). No hay pipeline con Node.

## 2) Requisitos de entorno

- Ruby compatible con `jekyll 3.9.5`.
- Bundler (en lockfile figura `2.4.22`).

Instalación de dependencias:

```bash
bundle install
```

## 3) Desarrollo local

Levantar servidor local:

```bash
bundle exec jekyll serve
```

(a mí me anduvo correr otra cosa:

```bash
ruby -S bundle _2.4.22_ exec jekyll serve --livereload --host 127.0.0.1 --port 4000
```

URL local por defecto:

- `http://127.0.0.1:4000/`

Build de producción local:

```bash
bundle exec jekyll build
```

Salida generada:

- `_site/` (no editar manualmente).

## 4) Estructura del repositorio

```text
.
├── _config.yml                 # Configuración global Jekyll
├── _data/
│   ├── i18n.yml                # Textos por idioma (home, blog, forms, footer, etc.)
│   ├── faqs.yml                # FAQs por idioma
│   └── site.yml                # Datos institucionales para JSON-LD
├── _includes/
│   ├── header.html
│   ├── footer.html
│   └── contact-form.html
├── _layouts/
│   ├── default.html            # shell base + metadatos SEO + scripts
│   ├── landing.html            # home
│   ├── resources-index.html    # listado blog
│   ├── resource.html           # detalle artículo
│   ├── faq.html                # FAQ page + schema.org FAQPage
│   └── page.html               # páginas estáticas simples
├── _recursos_es/               # Colección blog ES
├── _resources_en/              # Colección blog EN
├── assets/
│   ├── css/main.css            # estilos globales
│   ├── js/main.js              # interacciones UI
│   └── img/                    # logos, placeholders e imágenes
├── en/                         # páginas estáticas en inglés
├── contacto/ faq/ privacidad/ recursos/ sobre/ terminos/  # páginas estáticas ES
├── index.md                    # home ES
├── 404.html
├── robots.txt
└── CNAME
```

## 5) Rutas y mapa funcional de páginas

### Español

- `/` -> `index.md` (`layout: landing`)
- `/blog/` -> `recursos/index.md` (`layout: resources-index`)
- `/recursos/` -> `recursos-legacy.md` (página legacy con redirección manual por enlace, `noindex`)
- `/faq/` -> `faq/index.md` (`layout: faq`)
- `/contacto/` -> `contacto/index.md` (`layout: page` + include de formulario)
- `/sobre/` -> `sobre/index.md`
- `/privacidad/` -> `privacidad/index.md`
- `/terminos/` -> `terminos/index.md`

### Inglés

- `/en/` -> `en/index.md` (`layout: landing`)
- `/en/blog/` -> `en/resources/index.md` (`layout: resources-index`)
- `/en/resources/` -> `en/resources-legacy.md` (`noindex`)
- `/en/faq/` -> `en/faq/index.md`
- `/en/contact/` -> `en/contact/index.md`
- `/en/about/` -> `en/about/index.md`
- `/en/privacy/` -> `en/privacy/index.md`
- `/en/terms/` -> `en/terms/index.md`

### Global

- `/404.html` -> página de no encontrado (`noindex`)
- `/robots.txt`
- `/sitemap.xml` -> generado por plugin

## 6) Convenciones de i18n (ES/EN)

La web es bilingüe y cada página debería definir:

- `lang`
- `alternate_lang`
- `alternate_url`

`_includes/header.html` usa `alternate_url` para el switch de idioma. Si falta, cae al fallback de `_data/i18n.yml`.

Los textos principales de UI están centralizados en `_data/i18n.yml`, incluyendo:

- navegación,
- hero y secciones de landing,
- textos del blog y filtros,
- textos de formularios,
- footer.

Recomendación operativa:

- mantener paridad de claves entre `es` y `en`,
- evitar hardcodear copies en layouts salvo que sea realmente estructural.

## 7) Modelo de contenido del blog (colecciones)

Colecciones configuradas en `_config.yml`:

- `recursos_es` -> salida en `/blog/:name/`
- `resources_en` -> salida en `/en/blog/:name/`

El listado (`resources-index`) ordena por `date` descendente y filtra por:

- categoría (`category`)
- texto (`title`, `excerpt`, `description`)

### Front matter recomendado para posts

#### ES (`_recursos_es/*.md`)

```yaml
---
lang: es
title: Título del artículo
description: Resumen SEO
image: /assets/img/placeholders/resource-coverage.svg
date: 2026-03-02
category: Guías
tags:
  - tag-1
  - tag-2
excerpt: Extracto corto para cards/listados
permalink: /blog/slug-del-articulo/
alternate_lang: en
alternate_url: /en/blog/article-slug/
---
```

#### EN (`_resources_en/*.md`)

Misma estructura, con:

- `lang: en`
- `permalink: /en/blog/.../`
- `alternate_lang: es`
- `alternate_url: /blog/.../`

Notas:

- `layout: resource` se aplica por defaults de colección (no hace falta repetirlo).
- `tags` hoy no se renderiza en UI, pero puede conservarse como metadata editorial.

## 8) Formularios y captura de leads

El include reusable es `_includes/contact-form.html`.

Variantes:

- `form_variant: demo` (landing, default)
- `form_variant: contact` (página de contacto)

Endpoints en `_config.yml`:

- `formspree_endpoint`: endpoint principal.
- `formspree_contact_endpoint`: endpoint opcional para contacto; si está vacío, usa el principal.

El formulario incluye:

- campos base (`name`, `email`, `phone`, `organization`, `message`),
- campo honeypot (`company`) anti-spam,
- metadata oculta (`lang`, `_subject`, `form_variant`, `consent=accepted`).

No hay lógica JS de validación custom; aplica validación HTML nativa + backend de Formspree.

**Destino de los envíos (Formspree):** el correo al que Formspree notifica no se elige en este repositorio: lo define el formulario asociado a `formspree_endpoint` (y opcionalmente `formspree_contact_endpoint`) en el [panel de Formspree](https://formspree.io/). Asegurá que el formulario vinculado a esa URL notifique a `info@retinar.com.ar` (o creado con esa dirección). Si generás un formulario nuevo, actualizá la URL en `_config.yml`. El correo visible en el sitio y en JSON-LD proviene de `_data/site.yml` → `contact_email` y de `email` en `_config.yml` (hoy ambos: `info@retinar.com.ar`).

## 9) Google Analytics 4 y consentimiento

La medición usa la etiqueta de Google Analytics 4 (`gtag.js`) y se configura en `_config.yml`:

```yaml
google_analytics_id: "G-XXXXXXXXXX"
```

El ID de medición es público y debe corresponder al flujo web de `https://retinar.com.ar`. Si el valor queda vacío:

- no se descarga ningún recurso de Google Analytics,
- no se muestra el banner de cookies,
- el sitio continúa funcionando sin medición.

La implementación aplica Consent Mode v2 en modo básico:

- Google Analytics no se carga antes de la aceptación;
- `analytics_storage` se habilita solo al aceptar;
- el almacenamiento y la personalización publicitaria permanecen deshabilitados;
- la elección se guarda en `localStorage` con la clave `retinar_analytics_consent`;
- el enlace “Preferencias de cookies” del footer permite revisar la elección.

Archivos involucrados:

- `_includes/analytics.html`: configuración temprana del consentimiento e inclusión condicional;
- `_includes/cookie-consent.html`: interfaz bilingüe;
- `assets/js/analytics-ga4.js`: persistencia, carga de `gtag.js` y revocación;
- `_data/i18n.yml`: textos ES/EN;
- `privacidad/index.md` y `en/privacy/index.md`: información al visitante.

Después del deploy, aceptar las cookies y verificar la visita en **Google Analytics → Informes → En tiempo real**. También se puede usar Google Tag Assistant para comprobar el estado de consentimiento.

## 10) SEO, metadata y datos estructurados

`_layouts/default.html` define:

- `canonical`,
- `hreflang` y `x-default`,
- Open Graph (`og:*`),
- Twitter card,
- `meta robots` cuando `noindex: true`.

Schemas JSON-LD activos:

- landing: `Organization` + `WebSite`,
- resource: `Article`,
- faq: `FAQPage`.

Datos institucionales usados por schema:

- `_data/site.yml`.

## 11) Frontend: comportamiento JS y contrato de markup

`assets/js/main.js` implementa:

- header sticky con estado `is-scrolled`,
- menú mobile (`data-menu-toggle`, `data-primary-nav`),
- carruseles (`data-carousel`, `data-carousel-track`, `data-carousel-prev`, `data-carousel-next`) con autoplay y pausa por hover/focus,
- búsqueda y filtros del blog (`data-resource-search`, `data-resource-filters`, `data-resource-item`, `data-resource-empty`),
- animaciones reveal con `IntersectionObserver` (`.reveal` -> `.is-visible`).

Si cambiás markup de layouts, respetá estos `data-*` y clases para no romper interacciones.

## 12) Frontend: estilos y responsive

`assets/css/main.css` centraliza todo el styling.

Puntos relevantes:

- tokens de diseño en `:root` (colores, radios, sombras, ancho de container),
- tipografías cargadas desde Google Fonts en `default.html`,
- breakpoints principales: `1120px`, `900px`, `720px`, `640px`,
- secciones críticas con layout grid: hero, features, value props, cards de blog, footer.

## 13) Guía de cambios frecuentes

### A) Cambiar copy de home, nav o footer

1. Editar `_data/i18n.yml` en ambos idiomas.
2. Validar que no se rompan keys usadas por layouts/includes.
3. Levantar `jekyll serve` y revisar ES/EN.

### B) Agregar una página estática nueva

1. Crear `ruta/index.md` (y su contraparte `en/...`).
2. Definir front matter (`layout`, `lang`, `title`, `description`, `permalink`, `alternate_lang`, `alternate_url`).
3. Si corresponde, sumar link en `t.nav` o `t.footer.*` en `_data/i18n.yml`.

### C) Publicar un artículo nuevo del blog

1. Crear archivo en `_recursos_es/`.
2. Crear equivalente en `_resources_en/`.
3. Enlazar alternates cruzados (`alternate_url`).
4. Verificar aparición en `/blog/` y `/en/blog/`.
5. Probar filtro por categoría y búsqueda.

### D) Actualizar logos de clientes/premios

1. Subir imagen a `assets/img/logos/...`.
2. Actualizar arreglo `clients.items` o `awards.items` en `_data/i18n.yml`.
3. Revisar rendering en desktop/mobile (carrusel).

## 14) Deploy y operación

- Dominio productivo: definido en `CNAME` (`retinar.com.ar`).
- Sitemap: `https://retinar.com.ar/sitemap.xml`.
- Robots: `robots.txt`.
- El sitio puede compilarse nativamente con Jekyll en GitHub Pages.

### Deploy simple (flujo actual)

Este proyecto despliega copiando `_site/` al repo `retinar-project.github.io`, que es el que publica GitHub Pages.

1. Hacer merge de tu rama de trabajo a `main` en `retinar-website`.
2. Pararte en `main` local y actualizar:
   ```bash
   git checkout main
   git pull --ff-only origin main
   ```
3. Ejecutar deploy:
   ```bash
   ./scripts/deploy.sh
   ```

Si aparece un error de `bad interpreter` de Ruby/Bundler en macOS:

```bash
BUNDLE_BIN=/usr/bin/bundle ./scripts/deploy.sh
```

El script:

- valida que no haya cambios locales sin commit (en ambos repos),
- exige estar en `main` del repo fuente (`retinar-website`),
- compila con Jekyll,
- sincroniza `_site/` a `/Users/ignaciorlando/Documents/retinar-project.github.io`,
- preserva `CNAME` del repo destino,
- hace commit y push en la rama de deploy del repo destino.

Opciones útiles:

- `LEGACY_DIR=/ruta/al/repo-destino ./scripts/deploy.sh`
- `LEGACY_BRANCH=main ./scripts/deploy.sh`
- `SOURCE_BRANCH=main ./scripts/deploy.sh`
- `./scripts/deploy.sh "deploy marzo"`

### Automatización editorial en Codex

Este repo también incluye una base para automatizar la generación y publicación semanal del blog dentro de Codex:

- Skill local de generación editorial: `codex-skills/retinar-generar-articulo-blog/SKILL.md`
- Inventario editorial y comparación temática: `scripts/blog_topic_inventory.py`
- Commit + push + deploy del artículo: `scripts/commit_and_deploy_blog.sh`

La guía operativa está en `docs/blog-automation.md`.

## 15) Checklist antes de merge/deploy

1. `./scripts/verify_contact_config.sh` (tras `chmod +x` si aplica).
2. `bundle exec jekyll build` sin errores.
3. Revisar rutas ES/EN y switch de idioma.
4. Verificar metadatos (`title`, `description`, `canonical`, `alternate`).
5. Verificar formularios (acción correcta en Formspree y destinatario en el panel).
6. Verificar filtros del blog y carruseles.
7. Verificar responsive en mobile.
8. Confirmar que no se editaron archivos generados (`_site/`) ni dependencias locales.

## 16) Pruebas y verificación de configuración

```bash
chmod +x scripts/verify_contact_config.sh   # una sola vez
./scripts/verify_contact_config.sh
```

Comprueba que `email` / `contact_email` y un `formspree.io/f/...` sigan presentes en la configuración. Recomendado correrlo antes de deploy.

## 17) Consideraciones de seguridad

- **Contenido estático y formularios:** el sitio no procesa credenciales de usuarios finales; los formularios delegan a Formspree. No almacenar claves de Formspree en el repo: la acción del form es una URL pública.
- **Secreto y cadena de suministro:** mantener `Gemfile.lock` bajo control de versiones; actualizar dependencias tras advisories.
- **Entradas del usuario:** validación en cliente es limitada; el proveedor del formulario aplica su propia capa. Evitar almacenar PII en el repositorio.
- **Alineación OWASP:** controlar enlaces externos (`rel="noopener noreferrer"`), no incluir tokens en URLs, y revisar periódicamente el destinatario y la política de reenvío en el panel de Formspree.
- **Contacto de seguridad:** para reportes de vulnerabilidad en el sitio, escribir a [info@retinar.com.ar](mailto:info@retinar.com.ar) indicando el alcance y pasos de reproducción.
