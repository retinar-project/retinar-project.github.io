# Retinar Design System

A practical, code-grounded design system for **Retinar** — an Argentina-based teleophthalmology platform that uses AI to detect diabetic retinopathy in hospitals, primary care, and outreach campaigns.

Retinar is positioned as a **clinical digital-health platform** with scientific legitimacy, institutional intent, and operational focus. Not a "futuristic startup." Not a "lifestyle app." Not generic-blue corporate SaaS.

This system is documented from the company's actual production website (Jekyll codebase), with every token traceable to real CSS or templates.

---

## Index

```
README.md                  ← you are here
SKILL.md                   ← cross-compatible agent skill
styles.css                 ← single entry point (imports the two below)
colors_and_type.css        ← color + typography CSS variables (tokens)
social_assets.css          ← campaign / social asset layer (black + white canvas)
fonts/                     ← IBM Plex Sans, Encode Sans (variable + condensed cuts)
assets/
  logos/                   ← retinar wordmark + dark/light/celeste variants
  awards/                  ← 8 award/recognition logos
  clients/                 ← 4 institution client logos
  institutions/            ← CONICET, UNICEN, PLADEMA
  images/                  ← campaign photos (black canvas), hero + module placeholders, blog
  social/                  ← deployed social assets: light-* and dark-* posts + stories
preview/                   ← Design-system preview cards (registered)
  *.html
ui_kits/
  website/                 ← Marketing-website UI kit (landing recreation)
    README.md
    index.html
    *.jsx
reference/                 ← read-only copies of source main.css + i18n.yml
```

---

## Sources of truth used to build this system

- **Codebase** (mounted local folder): `retinar-website/`
  - `assets/css/main.css` — full token + component CSS (2,353 lines)
  - `_layouts/{landing,page,faq,resource,resources-index}.html` — page patterns
  - `_includes/{header,footer,contact-form}.html` — global chrome
  - `_data/i18n.yml` — copy in ES + EN
  - `assets/img/logos/` — wordmarks, award logos, client logos
- **Spec document**: `uploads/design-system-retinar.md` — 1,300-line internal design-system spec written against the same codebase. Authoritative for tone and rationale.
- **Campaign images**: `uploads/1.png` … `uploads/6.png` — real campaign photography with brand text overlay.

---

## What Retinar is

**Tagline:** "Ver para crecer." (See to grow.)
**One-liner:** AI-powered teleophthalmology for **diabetic-retinopathy screening** in hospitals, primary care (APS) and outreach campaigns — bringing diagnosis where no ophthalmologist is present.

**Products represented in this design system**
1. **Marketing website** (`retinar.health`) — Jekyll static site, ES + EN. This is the single product surface available in the codebase. The clinical product (image-capture + AI-tamizaje + remote report) is referenced in copy but no UI source is available; we do **not** mock it.

**Audience**
- Hospitals and provincial health networks
- Ophthalmology clinics
- Health insurers ("obras sociales y prepagas")
- Government / public-health bodies

**Brand DNA**
- High-contrast: deep black + clean white + a single acid-green accent.
- Clinical, technical, sober. Real equipment, real teams, real deployments — no neon, no sci-fi grids.
- Institutional confidence: Argentine company (Retinar SAS), CONICET researchers, ANMAT authorization, public-hospital partnerships.

---

## Content fundamentals

### Voice
- **Clear, technical, institutional** — never salesy or hyperbolic.
- **Operational**: every claim earns its space with a number, a method, or a partner name. "+95% de sensibilidad", "+40 retinógrafos compatibles", "Desarrollado por Investigadores del CONICET y oftalmólogos de Argentina. Autorizado por ANMAT."
- **Voseo** in Spanish (`dejanos`, `enterate`, `contactanos`, `acompañamos`) — Argentine register, never tú/usted.
- **Sentence case** for most prose. **UPPERCASE eyebrows** for category labels with wide tracking (`TELEOFTALMOLOGÍA PARA TAMIZAJE`, `FLORENCIO VARELA – PBA`).
- **You vs we**: Retinar speaks as "we" only when stating institutional facts ("acompañamos al Servicio…"). When addressing the customer it uses second-person voseo ("dejanos tus datos", "compartinos tu contexto").

### Copy formula (recurring across the site)
1. Clinical problem or impact
2. Concrete operational improvement
3. Proof — metric, institution, or regulatory mark
4. CTA toward implementation or a conversation

### Tone examples
- Headline: *Previniendo la ceguera por diabetes con IA* — declarative, present-participle, action verb first.
- Sub: *Retinar mejora la eficiencia en la detección de retinopatía diabética en hospitales, APS y campañas llevando diagnóstico allí donde no hay un oftalmólogo presente.* — long, specific, lists the channels.
- KPI captions: *0 revisitas — por mala calidad de imagen* / *95% de sensibilidad — para detectar casos de riesgo* / *10 minutos — para informar un caso* — number then context.
- CTA: *Solicitar demo*, *Implementá Retinar*, *Contactanos* (imperative voseo).

### What the copy avoids
- "Revolucionamos la salud", "disrupting", "the future of…"
- Hype about AI without backing
- Absolute claims without a qualifier
- Unnecessary anglicisms (uses *retinógrafo* not "fundus camera" in ES context)

### Iconography in copy
- **No emoji.** Anywhere. Not in headers, body, CTAs, or list bullets.
- **No decorative unicode** (no ★ ✓ → in body copy). Where a directional arrow is needed in static piece, it's a real graphic (acid-green circular button with `→` glyph; see `campaign-1.png` through `campaign-6.png`).

---

## Visual foundations

### Color — see `colors_and_type.css`
- **Backbone: black / white / off-white.** Sections alternate dark and light to set rhythm: dark for hero / value-prop / conversion / footer; light for explanation, editorial, segments.
- **One accent, one job: `--acid #cef71f`.** Used for CTAs, focus rings, marker-highlights, KPI numbers, top-line accents on cards, hover glows. NEVER fills a large surface — always directs attention to a specific element.
- **Hover acid**: `--acid-soft #ddff5f`. **Deep-greens** `#8fb500` / `#84aa00` appear only inside about-page gradients.
- **No second saturated color.** No blue, violet, orange, red. Any new saturation must replace acid in a specific context, not coexist with it.
- **Greys are translucent**, expressed as rgba over black or white, not flat hex. This is intentional — it lets cards sit naturally on either dark or light sections.

### Typography
- **Body / UI / editorial: IBM Plex Sans** (400 / 500 / 700). Sober, technical, high legibility.
- **Brand mark: Encode Sans** (700) — reserved for the *Retinar* wordmark and very exceptional identity moments. **Do not use Encode Sans for body or section titles.**
- **Titles**: 700 weight, tight tracking (`-0.02em`), `line-height: 1.14–1.22`.
- **KPIs**: 800 weight, tighter (`-0.03em`), `clamp(2rem, 5vw, 3.2rem)`.
- **Meta / eyebrow**: UPPERCASE, wide tracking (`0.10em – 0.14em`), small sizes (0.73–0.84rem). Use sparingly — eyebrows label a section, not paragraphs.
- **No serif, no display, no monospace** in production (mono only used here in the design-system pages as a reference register).

### Layout & rhythm
- **Container**: `min(1140px, 100% − 2rem)`. Always centered, never edge-to-edge.
- **Section padding**: `clamp(3.8rem, 9vw, 8rem)` vertical. Generous breathing room is non-negotiable.
- **Two-column hero & feature rows** collapse to one column at `1120px`. Carousels become free-scroll on mobile (no buttons under 900px).
- **No formal spacing token scale** in the source; an emergent scale of ~0.18 / 0.4 / 0.9 / 1.4 / 2.4rem is used. We expose `--space-*` aliases in `colors_and_type.css` for completeness; the source mostly uses inline values.

### Radii
| Token        | Value | Usage |
| ---          | ---   | ---   |
| `--radius-xs` | 10px | inputs, small overlays |
| `--radius-sm` | 14px | cards, FAQ items, media wrappers |
| `--radius-md` | 20px | feature cards, forms, panels |
| `--radius-lg` | 30px | hero shot only |
| `--radius-pill` | 999px | buttons, chips, eyebrow, social icons, switch |

### Shadows / elevation
- `--shadow-sm` for cards on light surfaces.
- `--shadow-md` on hover and on the blog hero card.
- `--shadow-lg` only on the hero shot.
- **On dark surfaces, elevation is conveyed by border + acid glow, not by shadow.**
- Inset rings & radial glows are used in the KPI card and acid-bordered overlays.

### Backgrounds
- **No full-bleed photographic backgrounds in the live site.** Photography is treated as content (in figures, hero-shot, segment-card media), not as wallpaper.
- The body has a subtle **radial halo** in acid upper-right and a soft dark halo upper-left — sets atmosphere without competing with content.
- `.section-soft` adds a stronger acid halo top-right against `--offwhite`.
- `.section-dark` layers a small acid halo + a faint white halo on `--black`.
- **Campaign / social assets** use a different convention from the website, and they exist in **two equally canonical canvases — black and off-white**. See *Campaign & social assets* below. Never assume black is the default.

### Borders
- On light: hairline `rgba(0,0,0,0.13)` (default), `rgba(0,0,0,0.24)` (stronger).
- On dark: hairline `rgba(250,250,250,0.20)`, or `rgba(206,247,31,0.35–0.72)` when acid-emphasized.
- A **4px acid top-line** sits on segment-cards to mark them as a positioning slot.

### Cards (anatomy)
- **Light card**: white background, `border: 1px solid var(--line-light)`, `border-radius: var(--radius-md)`, `box-shadow: var(--shadow-sm)`, `padding: 1.65rem 1.75rem`.
- **Dark card** (`value-card` on `.section-dark`): translucent white background `rgba(255,255,255,0.04)`, `border: 1px solid var(--line-dark)`, no shadow, acid top-line, h3 in acid.
- **KPI card** (inside feature-copy): the most decorative element — acid border, dark green-tinted gradient, radial acid glow pseudo-element, slow 3.6s pulse on `box-shadow`.

### Motion
- **Purpose only — never ornamental.** Patterns:
  - `.reveal`: opacity 0 → 1 + `translateY(22px → 0)` over 0.65s, triggered by IntersectionObserver at 15% visibility.
  - **Hover lift**: `translateY(-1px to -4px)` on cards, social icons, metrics, library/segment cards.
  - **Image zoom**: `scale(1.04)` on `.feature-media img` when its parent row is hovered (0.7s out-cubic).
  - **Acid glow** on primary button hover.
  - **KPI pulse**: 3.6s ease-in-out shadow animation; disabled under `prefers-reduced-motion`.
  - Carousel autoplay every 4200ms, pauses on hover/focus, off under reduced motion.
- **Easing**: mostly default `ease`. `cubic-bezier(0.16, 1, 0.3, 1)` (out-quint) for image-zoom.
- **`prefers-reduced-motion: reduce`** is genuinely respected: KPI animation off, transforms neutralized, autoplay disabled.

### Hover / press / focus states
- **Primary CTA hover**: background goes `--acid` → `--acid-soft`, gains `box-shadow: 0 0 18px rgba(206,247,31,0.32)` glow, lifts 1px.
- **Secondary CTA hover**: background `#000` → `#1a1a1a`.
- **Outline CTA hover (on dark)**: border + text shift to acid.
- **Card hover**: lift 1–2px and reinforce border color toward acid.
- **Link hover**: no underline thickness change; just color or background-shift on parent.
- **Focus**: global `outline: 2px solid var(--acid); outline-offset: 2px;`. **Acid is the only focus color.**
- **No `:active`-specific shrink, color flash, or press scale.** Press states are not explicitly designed — they inherit hover.

### Transparency, blur & "protection"
- The hero-overlay panel uses `backdrop-filter: blur(8px)` over `rgba(0,0,0,0.82)` with an acid hairline border. This is **the only frequent glassmorphism in the system.**
- The header uses `rgba(0,0,0,0.9)` + `backdrop-filter: blur(10px)` and bumps to `0.95` when scrolled.
- **No "protection gradients"** behind text-over-image — at the website level. Text over photography is handled differently: the campaign assets use **solid black capsules with acid `marker-highlight` runs** rather than gradient scrims (see `campaign-*.png`). When recreating campaign-style overlays, capsule the text in black/acid blocks — don't fade.

### Imagery vibe
- **Real, plausible, clinical.** Primary care offices, retinographers, hospital chairs, screens showing actual retina scans, ophthalmologists in lab coats.
- **Natural color, warm-neutral, slightly green-cast under fluorescent lights** (consistent with hospital interiors).
- **No B&W, no grain, no aggressive filters.** Light editing only.
- **Avoid**: stock "doctor pointing at floating UI", neon teal data viz, hologram eyes, dashboard mockups, multi-color collages.
- The Retinar codebase ships placeholders, not final art — the system is more mature than the asset library. Treat live photography as the goal.

### Layout rules (fixed elements)
- **Sticky header** (z-index 120, `min-height: 84px`).
- **Skip-link** appears on focus, top-left, z-index 400.
- **Sticky CTAs** are not used. There is no floating chat bubble, no scroll-progress bar, no cookie banner UI in the source.

### Iconography
See `ICONOGRAPHY` section below.

---

## Campaign & social assets (dual canvas)

Social, print and outreach pieces are **not** website sections. They have their own layer: `social_assets.css`.

### The brand works on two canvases

| | **Black canvas** | **Off-white canvas** |
| --- | --- | --- |
| Background | `#000` | `#f7f7f7` — *never pure white*, so shards can read |
| Ink | `#fafafa` | `#060606` |
| Decorative field | shards at `rgba(250,250,250,0.055)` | shards at `#ffffff` |
| Tag capsule (eyebrow) | white block, black text | black block, white text |
| Acid marker run | acid block, black text | **identical** |
| Wordmark file | `retinar-logo-light-crop.png` | `retinar-logo-dark-crop.png` |
| Arrow button | filled acid circle, black glyph | hairline black outline circle, black glyph |

**Both are first-class.** A feed alternates them; a carousel or story sequence usually stays in one canvas end to end. Do **not** default to black — roughly half of the deployed work (news, ephemerides, quotes, story sequences) is on the light canvas, and light is the better choice when the piece carries a screenshot, a partner logo with a white lockup, or long body copy.

**Choosing a canvas**
- Light: press/news clippings, screenshots, ephemerides, pull-quotes, long-copy event cards, anything containing third-party logos.
- Black: launch/announcement moments, photography-led pieces where the image is the subject, dense KPI statements, and pieces that sit next to a light one for contrast.
- Never mix canvases inside one asset (no half-black/half-white splits, except the deliberate photo-bleed panel below).

### Anatomy (both canvases)
1. **Shard field** — 3–5 large flat angular planes, one tone off the canvas, clipped polygons. Flat only: no gradients, no texture, no blur. Purely atmospheric; content never sits on a shard edge for contrast.
2. **Tag capsule** — square-cornered solid rectangle, inverse of the canvas, condensed uppercase. Labels the piece (`EN LOS MEDIOS`, `13 DE DICIEMBRE`). Acid is never used for tags.
3. **Display headline** — **Encode Sans Condensed 900**, uppercase, `line-height ≈ 0.98`, with acid `social-hl` runs on the words that carry the news. This is the one place condensed type is allowed; body and website titles remain IBM Plex Sans.
4. **Photography** — content, not wallpaper: an inset square-cornered block, or a full-height panel bleeding off one edge with a large single-side radius (`.social-photo.bleed-right`). Optional flat acid rectangles shouldering the block.
5. **Info rows** — acid circle icon + acid hairline rule + small label over larger value (event date / time / venue).
6. **Wordmark** — bottom of the canvas, in the variant matching the canvas.

### Rules
- Acid stays a director: marker runs, icon circles, hairline rules, one arrow. It never becomes the canvas.
- No scrims or protection gradients over photography — capsule the text in solid blocks instead.
- Text sizes are container-relative (`cqw`) in `social_assets.css`, so a canvas is authored once and exported at 1080×1080 or 1080×1920 without retuning.
- No emoji in Retinar-authored copy. (The deployed `light-story-4` uses a pointing hand — a platform-native story affordance, not a brand element; do not reproduce it in new work.)

### Deployed reference set (`assets/social/`)
- `light-post-medios-la-nacion.png` — press clipping, screenshot + black tag + acid run.
- `light-post-efemeride-oftalmologo.png` — ephemeride, centered, inset photo.
- `light-post-evento-cno26.png` / `dark-post-evento-cosapro.png` — **the same event-card layout in both canvases.** Read these two side by side before authoring anything.
- `light-story-1…4-*.png` — a 4-story sequence: hero, two pull-quotes, closing CTA.
- `assets/images/campaign-1…6.png` — the earlier black-canvas photo-led set.

---

## Iconography

### Approach
- **There is no icon system in the production site** — neither an icon font (Lucide, Material, Phosphor) nor a sprite. The visual vocabulary is intentionally minimal.
- **Two inline SVGs exist** in the codebase, both in `_includes/header.html` and `_includes/footer.html`:
  - LinkedIn glyph
  - Instagram glyph
  These are hand-authored, monoline, filled-style, fit in `34×34px` circles. Both copied here as references (rendered live in the UI kit).
- **No emoji**. Anywhere.
- **No unicode bullets / arrows** in UI labels — the FAQ accordion expresses its `+ / −` state via pseudo-elements (CSS-generated text, not unicode in markup).
- **Campaign assets** use a single graphic motif: an **acid circular button with a black `→` glyph**, used to indicate "next" in a story carousel. This is the closest the brand has to a recurring icon. See `campaign-1.png` etc.

### Recommendation if icons are needed for new work
- Use **Lucide** at `1.75px` stroke, monoline, never filled. Color: `currentColor` (so it picks up `--ink` on light and `--ink-on-dark` on dark surfaces). Acid only when actively emphasizing.
- Size: 18–20px inside 34px hit targets (matches social-icon convention).
- Flag any icon usage as a brand extension — the source system explicitly avoids decorative icons.

> ⚠️ **Substitution flag**: There is no codebase-native icon set, so any icons in mocks here are noted in their components. We have not bundled Lucide.

---

## Font substitution notes

Both source fonts are shipped here as variable TrueType:
- `IBMPlexSans-Variable.ttf` — full IBM Plex Sans family.
- `EncodeSans-Variable.ttf` — variable-axis Encode Sans (width + weight).

These match the families loaded by `_layouts/default.html` via Google Fonts. **No substitutions made.** No flag needed.

---

## Caveats

- Only one product surface (the marketing website) is in the codebase. The Retinar clinical web app is referenced in copy and screenshots but no source exists; we did **not** mock its UI. If you want a clinical-product UI kit, please import the app codebase or share Figma access.
- Imagery in the live site is mostly **placeholders**; campaign photography (uploads 1–6) is the only real, deployed brand imagery available. We use it for the "campaign asset" reference card.
- The source CSS has **no formal spacing-token scale**. We expose `--space-*` aliases as a convenience; the site uses inline `clamp()` and rem values directly. Treat the alias scale as suggestive.

---

## Using this system

For visual artifacts (slides, mocks, prototypes), import `colors_and_type.css` and copy the assets you need from `assets/`. For production work, treat `reference/main.css` as the canonical source — every token in `colors_and_type.css` traces back to it.

See `SKILL.md` for agent-mode usage and `ui_kits/website/` for component-level reference.
