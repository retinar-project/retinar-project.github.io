# Design System de Retinar

Documento maestro del sistema visual y de interacción de Retinar, construido a partir de la implementación real del sitio en este repositorio.

Fecha de referencia: 12 de abril de 2026.

## 1. Alcance

Este documento no describe un sistema aspiracional ni una guía abstracta de branding. Describe el sistema que hoy existe en la web de Retinar, tal como está implementado.

En otras palabras:

- toma como fuente principal el código real,
- documenta tanto decisiones explícitas como patrones emergentes,
- distingue entre tokens formalizados y valores repetidos pero no tokenizados,
- y deja registradas también las excepciones y deudas de sistematización visibles en la implementación.

## 2. Fuentes de verdad

Las fuentes principales del sistema son:

| Fuente | Rol dentro del sistema |
| --- | --- |
| `assets/css/main.css` | Fuente principal de tokens, layout, componentes, estados, motion y responsive |
| `_layouts/default.html` | Carga tipografías, CSS global, estructura base y orden semántico general |
| `_layouts/landing.html` | Define la landing principal y sus patrones críticos |
| `_layouts/page.html` | Define el patrón de páginas estáticas simples |
| `_layouts/resources-index.html` | Define patrón editorial de índice de recursos/blog |
| `_layouts/resource.html` | Define patrón editorial de artículo individual |
| `_layouts/faq.html` | Define patrón FAQ con navegación rápida y acordeones |
| `_includes/header.html` | Define header, navegación, switch de idioma y redes |
| `_includes/footer.html` | Define footer institucional y legal |
| `_includes/contact-form.html` | Define la estructura base de formularios |
| `assets/js/main.js` | Define comportamiento: header sticky, menú mobile, carruseles, reveal y filtros del blog |
| `_data/i18n.yml` | Define copy, tono, labels, CTA y microcopy en ES/EN |
| `assets/img/logos/*` | Define el uso real de marca, wordmark y variantes |

## 3. Resumen ejecutivo

Retinar tiene un sistema visual de alto contraste, clínico y tecnológico, construido sobre una lógica muy consistente:

- base neutra blanca o negra,
- un único acento dominante en verde ácido,
- tipografía sobria y técnica,
- componentes con radios suaves y bordes finos,
- fotografías o visuales clínicos con apariencia realista,
- y un tono verbal que habla de implementación, cobertura, seguridad clínica e impacto concreto.

La web no se comporta como un sitio de startup “futurista” ni como una marca de consumo. Se siente como una plataforma de salud digital con legitimidad científica, intención institucional y foco operativo.

## 4. ADN de marca

### 4.1 Qué transmite

- Confianza clínica.
- Rigor técnico.
- Implementación posible.
- Escalabilidad institucional.
- Innovación aplicada.
- Prevención con impacto real.

### 4.2 Qué no transmite

- Futurismo abstracto.
- Estética neón genérica.
- Disrupción vacía.
- Consumo masivo.
- “App de lifestyle”.
- SaaS corporativo frío de paleta azul/gris estándar.

### 4.3 Fórmula perceptual

La identidad actual de Retinar puede resumirse así:

1. Una base sobria y muy controlada.
2. Un acento fluorescente que dirige la atención.
3. Superficies limpias, redondeadas y respiradas.
4. Mucho contraste entre dark mode y light mode por secciones.
5. Prueba clínica o institucional como parte del diseño, no sólo del contenido.

## 5. Identidad de marca y logotipo

### 5.1 Wordmark observado

Los archivos `assets/img/logos/retinar-wordmark.svg` y `assets/img/logos/retinar-wordmark-inline.svg` muestran la lógica de marca con máxima claridad:

- `retin` en claro neutro (`#e8e8e8` dentro del SVG),
- `ar` en verde ácido `#cef71f`,
- subrayado verde ácido bajo `ar`,
- familia `Encode Sans`,
- peso `700`,
- tracking ajustado con `letter-spacing="-8"` en el SVG.

### 5.2 Uso real en la web

En header y footer no se usa el SVG sino la imagen `assets/img/logos/retinar_logo blanco-verde.png`, siempre sobre fondo oscuro.

Esto produce dos conclusiones importantes:

- el sistema de marca real privilegia hoy una versión clara del logo para navegación y cierre,
- y el sitio no explota todavía una familia amplia de variantes de logo dentro de la interfaz.

### 5.3 Reglas de uso

- Priorizar el wordmark completo.
- Mantener siempre el `ar` y el subrayado en verde ácido.
- En dark surfaces usar variante clara.
- En light surfaces, si se necesitara, usar versión negra/verde o SVG equivalente.
- No agregar sombras, gradientes, strokes ni efectos 3D al logo.
- No cambiar el verde ácido por otros verdes.
- No encapsular el logo dentro de badges, stickers o placas ornamentales salvo que la pieza lo exija de forma excepcional.

## 6. Principios del sistema visual

### 6.1 Alto contraste como norma

La marca vive de la tensión entre negro profundo, blanco limpio y un acento muy luminoso. El contraste no es un detalle: es la estructura base del sistema.

### 6.2 Un solo color protagonista

El verde ácido es el único color saturado con rol dominante. El sistema no está planteado como una paleta multicolor.

### 6.3 Dark mode y light mode por bloques

La web alterna secciones oscuras y claras para ordenar la jerarquía:

- oscuro para hero, propuesta de valor, conversión y footer,
- claro para explicación, contenidos editoriales, cards y lectura prolongada.

### 6.4 Tecnología con humanidad

Aunque el lenguaje UI es técnico y limpio, la dirección visual apunta a contextos clínicos reales, equipos reales y despliegue real.

### 6.5 Energía controlada

Hay glow, blur, halos y motion, pero siempre en dosis moderadas. Nunca se busca espectáculo visual por encima del contenido.

## 7. Paleta cromática

### 7.1 Tokens base formalizados en `:root`

| Token | Valor | Rol principal |
| --- | --- | --- |
| `--white` | `#ffffff` | Superficie principal clara |
| `--offwhite` | `#fafafa` | Fondo secundario claro |
| `--black` | `#000000` | Fondo dark principal |
| `--charcoal` | `#0a0a0a` | Dark surface secundaria / profunda |
| `--acid` | `#cef71f` | Acento principal, CTA, foco, highlight |
| `--acid-soft` | `#ddff5f` | Hover suave del acento |
| `--ink` | `#060606` | Texto principal en claro |
| `--ink-muted` | `rgba(0, 0, 0, 0.72)` | Texto secundario en claro |
| `--ink-subtle` | `rgba(0, 0, 0, 0.56)` | Texto terciario, notas y meta |
| `--ink-on-dark` | `#fafafa` | Texto principal sobre oscuro |
| `--ink-muted-on-dark` | `rgba(250, 250, 250, 0.75)` | Texto secundario sobre oscuro |
| `--line-dark` | `rgba(250, 250, 250, 0.2)` | Bordes sobre fondo oscuro |
| `--line-light` | `rgba(0, 0, 0, 0.13)` | Bordes suaves sobre fondo claro |
| `--line-light-strong` | `rgba(0, 0, 0, 0.24)` | Bordes más notorios sobre claro |

### 7.2 Jerarquía cromática real

#### Nivel 1: estructura

- `--black`
- `--white`
- `--offwhite`
- `--ink`
- `--ink-on-dark`

Estos colores sostienen la casi totalidad del sitio.

#### Nivel 2: acento

- `--acid`
- `--acid-soft`

Se usan para:

- CTA primario,
- highlights con `.marker-highlight`,
- KPI destacados,
- líneas superiores de cards,
- focus visible,
- hover selectivo,
- estados activos y glows.

#### Nivel 3: soporte y separación

- `--line-light`
- `--line-light-strong`
- `--line-dark`
- `--ink-muted`
- `--ink-subtle`
- `--ink-muted-on-dark`

Sirven para separar superficies, bajar intensidad de lectura y organizar profundidad.

### 7.3 Colores literales usados fuera de tokens

Además de los tokens oficiales, el CSS usa un conjunto de colores “de implementación” en contextos puntuales. Son parte del sistema visible actual aunque no estén tokenizados:

| Valor | Uso actual |
| --- | --- |
| `#050505` | Fondo interno del shot principal del hero |
| `#050604`, `#0f1408`, `#070905` | Gradiente dark del KPI de features |
| `#f3f5f2` | Fondo de media placeholders en módulos de features |
| `#e7edcf` | Fondo del chip de categoría en library cards |
| `#d4dcb9` | Borde del chip de categoría en library cards |
| `#28320f` | Texto oscuro-oliva del chip de categoría |
| `#8fb500`, `#84aa00` | Verdes auxiliares en gradientes acid del about page |
| `#030303` | Fondo del footer |
| `#1a1a1a` | Hover del botón secundario |

### 7.4 Opacidades recurrentes del sistema

Hay varias opacidades repetidas que, aunque no son tokens, sí funcionan como escala visual:

- `0.04` a `0.08`: fondos dark sutiles y overlays mínimos,
- `0.10` a `0.12`: glow suave y fondos acid translúcidos,
- `0.24` a `0.38`: bordes y énfasis medios,
- `0.45` a `0.75`: estados destacados y bordes activos,
- `0.82` a `0.90`: texto claro de alta legibilidad sobre oscuro.

### 7.5 Reglas de uso del color

- El verde ácido debe dirigir, no ocupar toda la escena.
- Los fondos principales deben seguir siendo neutros.
- Sobre oscuro, el verde funciona como señal de energía y precisión.
- Sobre claro, el verde funciona mejor en micro-superficies, etiquetas, bordes o highlights, no en grandes paneles salvo casos especiales.
- Evitar sumar saturación paralela en naranja, violeta, azul eléctrico o rojo salvo necesidades funcionales muy justificadas.

## 8. Tipografía

### 8.1 Familias cargadas por el sitio

Desde `_layouts/default.html`:

- `IBM Plex Sans` con pesos `400`, `500`, `700`
- `Encode Sans` con pesos `600`, `700`

### 8.2 Roles tipográficos

| Familia | Uso |
| --- | --- |
| `IBM Plex Sans` | Cuerpo, UI, formularios, labels, navegación, contenido editorial |
| `Encode Sans` | Marca `Retinar` |

### 8.3 Jerarquía tipográfica base

| Elemento | Valor |
| --- | --- |
| `h1` | `clamp(2rem, 5.5vw, 4.6rem)` |
| `h2` | `clamp(1.45rem, 3.9vw, 2.7rem)` |
| `h3` | `clamp(1.02rem, 2.1vw, 1.35rem)` |
| Texto general | `0.96rem` |
| Meta uppercase | `0.73rem` a `0.84rem` según contexto |
| KPI principal | hasta `clamp(2rem, 5vw, 3.2rem)` |

### 8.4 Rasgos tipográficos del sistema

- Títulos con `font-weight: 700`.
- KPI con `font-weight: 800`.
- Títulos con `letter-spacing: -0.02em`.
- KPI de features con `letter-spacing: -0.03em`.
- Labels y meta con tracking positivo alto (`0.1em`, `0.11em`, `0.12em`, `0.14em`).
- Muchas piezas de meta usan `text-transform: uppercase`.

### 8.5 Personalidad resultante

La tipografía no busca “futuro” sino claridad, densidad técnica y legibilidad. Es una voz editorial y profesional más que una voz publicitaria.

### 8.6 Reglas de uso

- Usar `IBM Plex Sans` para toda interfaz nueva.
- Reservar `Encode Sans` a marca o señales muy extraordinarias de identidad.
- No introducir tipografías serif ni display decorativas.
- Mantener los títulos grandes cortos; el sistema está calibrado para frases compactas.
- Mantener meta/eyebrow en mayúsculas sólo cuando la pieza lo pida como señal de sistema, no para párrafos.

## 9. Layout, grilla y ritmo espacial

### 9.1 Container

Token formalizado:

- `--container: min(1140px, calc(100% - 2rem));`

Esto define:

- ancho máximo controlado,
- gutters laterales consistentes,
- y una estética respirada, nunca edge-to-edge.

### 9.2 Padding vertical de secciones

Base:

- `.section { padding: clamp(3.8rem, 9vw, 8rem) 0; }`

En mobile (`max-width: 720px`):

- `.section { padding: 3rem 0; }`

### 9.3 Escala espacial emergente

El sistema no tiene tokens de spacing formales, pero sí una escala clara y repetida:

| Rango | Uso predominante |
| --- | --- |
| `0.18rem` a `0.35rem` | micro-ajustes, pills, labels |
| `0.4rem` a `0.7rem` | separación entre subelementos compactos |
| `0.8rem` a `1.15rem` | espacio entre título, texto, meta y controles |
| `1.2rem` a `1.6rem` | padding de cards y gap de módulos |
| `1.8rem` a `2.8rem` | composición de héroes, bloques y pares texto/imagen |

### 9.4 Radios

| Token | Valor | Uso típico |
| --- | --- | --- |
| `--radius-xs` | `10px` | inputs, overlays internos, subcards |
| `--radius-sm` | `14px` | cards medianas, FAQ, media wrappers |
| `--radius-md` | `20px` | cards principales, forms, page panels |
| `--radius-lg` | `30px` | hero shot principal |

Además hay uso repetido de:

- `border-radius: 999px` para botones, chips, switch, social icons y eyebrow,
- `12px` para FAQ cards rápidas e ítems internos.

### 9.5 Sombras

| Token | Valor | Uso |
| --- | --- | --- |
| `--shadow-sm` | `0 10px 24px rgba(0, 0, 0, 0.08)` | cards claras y panels |
| `--shadow-md` | `0 16px 42px rgba(0, 0, 0, 0.16)` | hover, elevación intermedia, hero de blog |
| `--shadow-lg` | `0 28px 84px rgba(0, 0, 0, 0.3)` | hero shot principal |

### 9.6 Capas y profundidad

Valores significativos:

- header sticky con `z-index: 120`,
- skip link con `z-index: 400`,
- hero overlay con blur y sombra fuerte,
- cards claras elevadas por sombra,
- cards dark elevadas más por borde/glow que por sombra.

## 10. Familias de fondo

### 10.1 Fondo base del sitio

El `body` usa:

- fondo blanco,
- halo acid radial en esquina superior derecha,
- halo oscuro suave en esquina superior izquierda.

Esto da una atmósfera “científica y activa” sin sobrecargar la página.

### 10.2 Secciones claras

#### `.section-soft`

Usa:

- `var(--offwhite)` como base,
- halo radial acid más visible que el fondo general.

Rol:

- descanso visual,
- secciones informativas,
- bloques editoriales,
- transición entre dark y light.

### 10.3 Secciones oscuras

#### `.section-dark`

Usa:

- `var(--black)` como base,
- glow acid arriba a la derecha,
- glow claro muy sutil a la izquierda.

Rol:

- hero,
- propuesta de valor,
- conversión,
- footer-like areas,
- bloques donde la marca necesita máxima tensión visual.

## 11. Breakpoints y responsive

### 11.1 Breakpoints principales

| Breakpoint | Efecto |
| --- | --- |
| `1120px` | layouts de dos columnas pasan a una columna; grids de 3 pasan a 2 |
| `980px` | ajustes específicos de la página Sobre Retinar |
| `900px` | header mobile, menú desplegable, carruseles sin botones laterales |
| `720px` | reducción de padding general, hero más compacto, grids a una columna en varios contextos |
| `640px` | simplificación del footer |

### 11.2 Comportamientos principales

- Hero, features, conversion, footer y blog hero se apilan bajo `1120px`.
- Value grid, segment grid, library grid y card grid pasan de 3 a 2 columnas bajo `1120px`.
- En `900px`, la navegación deja de ser inline y pasa a panel flotante desplegable.
- En `720px`, los botones de algunas secciones se vuelven full width.
- En mobile, los carruseles se resuelven como scroll horizontal con tarjetas grandes y sin flechas visibles.

## 12. Sistema de componentes

### 12.1 Header

### Estructura

Definido en `_includes/header.html`.

Contiene:

- logo/brand,
- botón hamburguesa mobile,
- switch de idioma,
- redes sociales,
- navegación principal,
- CTA de contacto como último ítem del menú.

### Estilo

- `position: sticky`
- `top: 0`
- `background: rgba(0, 0, 0, 0.9)`
- `backdrop-filter: blur(10px)`
- borde inferior con `var(--line-dark)`
- estado `is-scrolled` con opacidad más cerrada (`0.95`)

### Altura y proporción

- `.header-inner` usa `min-height: 84px`
- gap base de `1.5rem`

### Logo

- visualmente pequeño y controlado,
- `max-width: min(24vw, 178px)`,
- alto `clamp(16px, 1.9vw, 28px)`,
- versión clara del logo sobre negro.

### Navegación desktop

- links en pills transparentes,
- hover con fondo blanco translúcido,
- CTA final en verde ácido con texto negro.

### Navegación mobile

Bajo `900px`:

- panel flotante dark,
- `min-width: 272px`,
- borde, radio y sombra media,
- navegación en columna,
- links full width y alineados a la izquierda.

### 12.2 Switch de idioma

Patrón:

- outline pill,
- borde dark light sobre fondo oscuro,
- texto pequeño (`0.82rem`),
- neutralidad visual,
- hover sólo cambia borde, no se transforma en CTA.

Rol:

- control secundario,
- nunca compite con el CTA de contacto.

### 12.3 Social links

Patrón:

- íconos dentro de círculos de `34px`,
- borde fino translúcido,
- hover con `scale(1.1)`,
- en header y footer mutan a acid en hover.

Rol:

- señal institucional discreta,
- no protagonista.

### 12.4 Eyebrow

Clase: `.eyebrow`

Valores clave:

- inline-block,
- border pill,
- acid sobre dark,
- `font-size: 0.73rem`,
- `letter-spacing: 0.14em`,
- uppercase,
- fondo acid translúcido.

Rol:

- enmarcar la categoría o naturaleza del bloque,
- preparar lectura del hero.

### 12.5 Hero principal

Definido en `_layouts/landing.html`.

### Estructura

- columna izquierda: copy, CTA, microproof, métricas
- columna derecha: visual principal + overlay informativo

### Layout

- grid `1.08fr / 0.92fr`
- gap `2.8rem`
- padding superior y inferior modulados por `clamp`

### Copy

- título grande con highlight inline,
- lead de ancho controlado,
- dos CTA,
- microcopy de prueba institucional,
- tres métricas en cards.

### Highlight de texto

Clase: `.marker-highlight`

Comportamiento:

- fondo acid,
- texto negro,
- padding mínimo,
- radio muy leve,
- `box-decoration-break: clone` para funcionar bien en cortes de línea.

Es uno de los recursos más distintivos del sistema.

### Métricas del hero

Cada card:

- borde dark,
- fondo blanco translúcido muy bajo,
- radio `--radius-sm`,
- `min-height: 126px`,
- hover con leve elevación y refuerzo de borde.

### Visual principal

`.hero-media`:

- `min-height: 560px`,
- shot principal absolutamente posicionado,
- recorte grande con `--radius-lg`,
- sombra `--shadow-lg`,
- overlay flotante con blur.

### Overlay

- ancho `min(90%, 450px)`,
- borde acid semitransparente,
- fondo negro translúcido,
- blur,
- lista de puntos con pequeñas subcards acid translúcidas.

### Regla de sistema que deja el hero

Retinar no usa héroes ilustrativos vacíos: el hero combina promesa, prueba, interfaz y contexto clínico/operativo en la primera pantalla.

### 12.6 Carruseles de logos y premios

### Estructura

- wrapper `.carousel-shell`
- track `.carousel-track`
- botones prev/next
- cards `.logo-card`

### Grid y scroll

`.carousel-track` usa:

- flujo por columnas,
- `grid-auto-columns: minmax(220px, 1fr)`,
- scroll horizontal,
- `scroll-snap-type: x mandatory`,
- scrollbars ocultas.

### Cards

- fondo blanco en clientes,
- fondo dark translúcido en premios,
- `min-height: 126px`,
- radio `--radius-sm`,
- hover con elevación leve.

### Comportamiento JS

Desde `assets/js/main.js`:

- autoplay cada `4200ms`,
- pausa en hover y focus,
- wrap-around al llegar al final,
- se ocultan flechas si no hacen falta,
- en mobile se apagan las flechas y queda scroll natural.

### 12.7 Feature stream

Patrón central del bloque “Cómo funciona”.

### Estructura

Cada `.feature-row` contiene:

- `.feature-copy`
- `.feature-media`

### Layout

- grid de dos columnas `1.08fr / 0.92fr`
- alternancia visual con `nth-child(even)` invirtiendo copy y media

### Copy card

- borde claro,
- fondo blanco,
- radio `--radius-md`,
- sombra suave,
- padding `1.65rem 1.75rem`

### KPI card interna

Es uno de los componentes más ricos del sistema:

- borde acid fuerte,
- gradiente dark con tinte verdoso,
- pseudo-elemento circular de glow,
- número grande acid,
- copy pequeño claro,
- hover con glow adicional,
- animación `feature-kpi-pulse` cada `3.6s`.

### Media

- contenedor con fondo gris-verdoso `#f3f5f2`,
- imagen `object-fit: cover`,
- zoom sutil en hover del row.

### Regla de sistema

El bloque combina explicación, prueba cuantitativa y visual clínico en una misma unidad. Esa tríada es muy propia de Retinar.

### 12.8 Value cards

Patrón del bloque “Por qué Retinar”.

### Estilo

- dark cards sobre dark section,
- borde `var(--line-dark)`,
- línea superior acid suavizada,
- fondo translúcido claro muy bajo,
- hover con mayor brillo y borde acid.

### Tipos de texto

- `h3` en acid,
- cuerpo en blanco suavizado,
- línea de highlight final en acid casi pleno.

### Rol

- traducir beneficios estratégicos en bloques breves,
- no son cards de feature ni de navegación: son cards de posicionamiento.

### 12.9 Segment cards

Patrón del bloque “Para quién”.

### Estilo

- fondo `offwhite`,
- borde claro fuerte,
- sombra suave,
- línea superior acid de `4px`,
- imagen enmarcada arriba,
- hover con elevación leve.

### Imagen

- `.segment-media` con borde propio,
- fondo blanco,
- altura fija `190px`,
- `object-fit: cover`.

### Rol

- segmentación comercial/institucional,
- tono más cercano a “casos de adopción” que a feature técnica.

### 12.10 Library cards del home

Patrón del preview de blog en la landing.

### Estructura

- meta pill
- título
- excerpt
- botón link

### Estilo

- fondo blanco,
- sombra suave,
- radio `--radius-md`,
- grid interno para empujar CTA hacia abajo.

### Meta chip

Es un componente particular:

- fondo `#e7edcf`,
- borde `#d4dcb9`,
- texto `#28320f`,
- pill ancha,
- centrada verticalmente,
- truncado con ellipsis si hace falta.

### Rol

- da tono editorial sin salir del sistema,
- introduce un subregistro “knowledge / library”.

### 12.11 Resource cards del índice de blog

Patrón similar pero más editorial y con thumbnail grande.

### Rasgos

- grid de dos filas: imagen + contenido,
- thumbnail de `200px`,
- borde inferior en la imagen,
- CTA tipo link button,
- hover con elevación.

### Recursos extra

El índice incluye:

- buscador,
- filtros por categoría,
- empty state,
- hero editorial con imagen.

### 12.12 Botones

### Base `.button`

- inline-flex,
- centrado,
- pill completa,
- padding `0.84rem 1.24rem`,
- peso `700`,
- transición de color, borde, sombra y elevación.

### Variantes

| Variante | Estilo | Uso |
| --- | --- | --- |
| `.button-primary` | acid + texto negro + borde oscuro suave | CTA principal |
| `.button-secondary` | negro + texto blanco | CTA secundaria en claro |
| `.button-outline` | transparente + borde claro/blanco | CTA secundaria en oscuro |
| `.button-link` | outline claro sobre fondo claro | navegación editorial y CTA de baja intensidad |

### Estados

- primario: hover con `--acid-soft`, glow y `translateY(-1px)`
- secundario: hover con `#1a1a1a`
- outline: hover refuerza borde acid y texto acid
- link: hover con fondo gris claro sutil

### Regla de sistema

Sólo un CTA por bloque debe sentirse claramente dominante. El primario no debe competir con otros botones de peso similar en el mismo cluster.

### 12.13 Formularios

El sistema tiene dos grandes variantes.

### Variante clara

Usada en página de contacto y shells sobre fondo claro.

Rasgos:

- `form-shell` blanco,
- borde claro,
- sombra suave,
- inputs con borde y radio `--radius-xs`,
- labels pequeños,
- nota legal sutil.

### Variante oscura / conversión

Usada en la landing dentro de `.conversion-section`.

Rasgos:

- shell translúcido sobre fondo oscuro,
- sin sombra pesada,
- inputs transparentes,
- sólo borde inferior claro,
- labels claros,
- placeholders claros atenuados,
- foco visible acid.

### Estructura del form

Desde `_includes/contact-form.html`:

- nombre,
- email,
- teléfono,
- organización,
- tipo de consulta opcional según variante,
- mensaje,
- honeypot oculto,
- consentimiento implícito por hidden input.

### Focus

Globalmente:

- `outline: 2px solid var(--acid);`
- `outline-offset: 2px;`

### 12.14 Chips y filtros

Patrón del índice de recursos.

### `.chip`

- pill blanca,
- borde claro,
- padding compacto,
- cursor pointer.

### Estado activo

`.chip.is-active`

- fondo acid,
- borde oscuro suave.

Es un patrón útil si se extiende el sistema a filtros, tags o tabs livianos.

### 12.15 Page hero

Patrón reutilizable para páginas internas.

### Estilo

- dark background,
- gran título,
- lead opcional,
- padding superior menor al hero principal.

### Variantes

- páginas estáticas: título + lead,
- recurso editorial: meta + título + descripción + imagen,
- blog index: copy + imagen lateral.

### 12.16 Prose editorial

Clase base: `.prose`

### Rasgos

- ancho máximo `78ch`,
- espaciado vertical consistente,
- títulos internos con margen superior,
- listas en grid con gap,
- blockquote con barra acid izquierda y fondo suave.

### Lectura de marca

No es un estilo editorial literario; es un estilo editorial técnico, sobrio y claro.

### 12.17 Sistema visual de la página “Sobre Retinar”

Es la página más rica en subcomponentes fuera de la landing.

### Componentes propios

- `.about-intro`
- `.about-kicker`
- `.about-highlight-grid`
- `.about-panel`
- `.about-panel-acid`
- `.about-checklist`
- `.about-metrics`
- `.about-pillar-grid`
- `.about-timeline`
- `.about-implementation-grid`
- `.about-section-dark`
- `.about-logo-grid`
- `.about-cta`

### Rasgos distintivos

- mayor densidad de componentes informativos,
- uso más amplio del verde en gradientes completos,
- combinación de white cards, offwhite cards y dark panel,
- checklist con bullets negros,
- timeline con barra lateral acid,
- grid de logos institucionales en dark surface.

### Qué enseña este patrón

Cuando Retinar necesita profundidad institucional, no rompe el sistema: lo expande mediante módulos claros, badges acid y contenedores dark bien controlados.

### 12.18 FAQ

Patrón definido en `_layouts/faq.html`.

### Estructura

- navegación rápida,
- clusters por tema,
- acordeones internos por pregunta.

### Componentes

#### `.faq-quick-card`

- card clara pequeña,
- borde claro,
- gradiente casi imperceptible,
- hover con leve acid.

#### `.faq-cluster`

- contenedor principal del tema,
- `details`/`summary`,
- scroll margin para navegación interna,
- padding y borde controlados.

#### `.faq-item`

- subacordeón dentro del cluster,
- fondo gris claro translúcido,
- estado abierto con borde más fuerte y glow interno acid.

### Señales de interacción

- `+` y `-` se renderizan vía pseudo-elementos,
- no hay iconografía extra,
- el comportamiento es deliberadamente sobrio.

### 12.19 Footer

### Estilo

- fondo `#030303`,
- borde superior tenue,
- texto claro atenuado,
- navegación en dos columnas,
- detalle societario y regulatorio visible.

### Layout

- grid `0.9fr / 1.1fr`,
- colapsa a una columna en responsive.

### Rasgo de marca

El footer no es liviano ni “minimal”: es un cierre institucional. Expone empresa, domicilios y habilitación. Eso es parte de la identidad de confianza de Retinar.

## 13. Motion y comportamiento

### 13.1 Principios

- Motion corto.
- Motion funcional.
- Motion para jerarquía y feedback.
- Nunca motion ornamental dominante.

### 13.2 Patrones concretos

### Reveal

`.reveal`:

- inicia con `opacity: 0`,
- `translateY(22px)`,
- entra con transición de `0.65s`,
- activación por `IntersectionObserver`,
- threshold `0.15`.

### Hover lift

Frecuente en:

- cards,
- métricas del hero,
- library cards,
- segment cards,
- value cards,
- social links.

Rango usual:

- `translateY(-1px)` a `translateY(-4px)`

### Zoom de imagen

En `.feature-media img`:

- `transform: scale(1.04)` al hover del bloque.

### Glow

Aparece sobre todo en:

- botón primario,
- KPI card,
- bordes acid activos.

### Carrusel

- autoplay suave,
- pausa en hover/focus,
- wrap-around,
- sin animación si el usuario prefiere reducción de movimiento.

### 13.3 Reduced motion

Hay soporte explícito para `prefers-reduced-motion: reduce`:

- se apaga la animación del KPI,
- se neutralizan varias transitions,
- se evita el autoplay perceptivo del carrusel.

Esto es una señal de madurez del sistema.

## 14. Imágenes, ilustración y activos visuales

### 14.1 Dirección visual deseable

La web actual sugiere este criterio:

- personas reales,
- equipamiento oftalmológico visible,
- flujos clínicos verosímiles,
- interfaz clínica plausible,
- despliegues en APS, hospitales, campañas y revisión remota.

### 14.2 Tipo de visual que mejor encaja

- captura en atención primaria,
- revisión clínica remota,
- retinógrafos y pantallas reales,
- escenas institucionales,
- equipos médicos, técnicos y operadores,
- imágenes retina/diagnóstico que no parezcan stock genérico.

### 14.3 Visuales de soporte

El repositorio mezcla:

- assets de logo reales,
- PNGs placeholder para hero, módulos y segmentos,
- thumbnails de blog,
- SVGs placeholder institucionales.

### Conclusión importante

El design system visual está más maduro que la librería final de imágenes. Es decir: el marco de presentación está consolidado, pero parte de los visuales todavía son placeholders o representaciones transitorias.

### 14.4 Qué evitar

- dashboards falsos,
- hologramas, grids sci-fi y neón azul,
- stock “startup doctor pointing at screen” demasiado genérico,
- imágenes de quirófano no relacionadas,
- collage multicolor,
- renders visualmente ruidosos.

## 15. Lenguaje verbal y tono

### 15.1 Voz

La voz de Retinar es:

- clara,
- técnica sin hermetismo,
- institucional sin frialdad excesiva,
- segura,
- y orientada a operación real.

### 15.2 Temas verbales dominantes

- tamizaje,
- detección temprana,
- retinopatía diabética,
- cobertura,
- eficiencia,
- integración,
- validación clínica,
- compatibilidad,
- seguridad,
- implementación.

### 15.3 Rasgos estilísticos

- frases directas,
- beneficios concretos,
- prueba en forma de métricas o legitimidad institucional,
- voseo en español,
- poco adjetivo inflado.

### 15.4 Fórmula de copy recurrente

1. Problema o impacto clínico.
2. Mejora operativa concreta.
3. Prueba o legitimidad.
4. CTA a implementación o conversación.

### 15.5 Qué evitar en copy

- grandilocuencia,
- “revolucionamos la salud”,
- hype de IA sin respaldo,
- claims absolutos no calificados,
- anglicismos innecesarios.

## 16. Accesibilidad y semántica

El sistema actual incorpora varias decisiones valiosas:

- `skip-link` al contenido principal,
- foco visible global con outline acid,
- soporte `prefers-reduced-motion`,
- menús con `aria-expanded`,
- labels explícitos en formularios,
- `details/summary` para FAQ,
- `sr-only` para accesibilidad no visual,
- `alt` descriptivo en imágenes de contenido.

### Observaciones

- El sitio trabaja con contraste alto, lo que favorece legibilidad.
- La mayoría de los botones y controles usan áreas clickeables cómodas.
- El green accent en algunos contextos translúcidos se usa con suficiente apoyo de borde o contraste.

## 17. Reglas de composición para piezas futuras

### 17.1 Si la pieza es de alto impacto

- fondo oscuro,
- titular grande,
- highlight acid en una porción breve,
- un CTA principal,
- una señal de prueba,
- una imagen o interfaz verosímil.

### 17.2 Si la pieza es informativa

- fondo blanco u offwhite,
- cards claras,
- jerarquía editorial,
- acento acid en títulos puntuales, chips o CTA.

### 17.3 Si la pieza es institucional

- alternar claro y oscuro,
- mostrar logos o credenciales,
- incorporar pruebas regulatorias o científicas,
- mantener un registro sobrio.

### 17.4 Si la pieza es de producto

- combinar explicación funcional + KPI + imagen de uso,
- mostrar el flujo, no sólo la pantalla,
- usar el verde para señalar pasos o momentos clave.

## 18. Reglas de extensión del sistema

### 18.1 Lo que conviene reutilizar tal cual

- tokens de color existentes,
- `--container`,
- radios,
- sombras,
- patrón pill,
- botones,
- `section-dark` y `section-soft`,
- `.form-shell`,
- `.resource-meta`,
- `.reveal`.

### 18.2 Lo que hoy no está del todo sistematizado

- spacing tokens formales,
- escala tipográfica secundaria,
- colores auxiliares fuera de `:root`,
- estados activos de chips como token reusable,
- alturas de thumbnails e imágenes como sistema explícito,
- una librería oficial de imágenes no-placeholder.

### 18.3 Criterio para agregar algo nuevo

Sólo agregar una nueva abstracción si:

- aparece repetida al menos en varios contextos,
- reduce duplicación real,
- y no rompe la lógica negro/blanco/acid que hoy sostiene la marca.

## 19. Observaciones sobre la implementación actual

Estas observaciones no contradicen el sistema; ayudan a entenderlo mejor.

### 19.1 Hay un sistema fuerte, pero no completamente tokenizado

Color, radios, sombras y container sí están tokenizados.
Spacing, gran parte de opacidades y algunos colores auxiliares no.

### 19.2 El sistema visual está más consolidado que la librería de assets

La estructura UI está bien definida, pero algunos visuales todavía son placeholders o piezas transitorias.

### 19.3 El sitio ya opera como design system aunque todavía sea CSS único

`assets/css/main.css` funciona de hecho como un design system monolítico:

- contiene tokens,
- contiene primitives,
- contiene patterns,
- contiene responsive,
- contiene motion,
- y contiene varias familias de componentes.

### 19.4 La marca depende mucho de la disciplina de uso del verde

Si una pieza futura sobreusa el acid, Retinar deja de sentirse precisa y premium. Ésa es probablemente la regla más importante del sistema.

## 20. Do / Don’t

### Do

- Usar base neutra.
- Mantener el verde ácido como acento principal.
- Alternar secciones claras y oscuras para ritmo.
- Usar bordes finos y radios suaves.
- Mostrar legitimidad clínica e institucional.
- Mantener CTAs claros y pocos.
- Cuidar foco visible y contraste.
- Priorizar imágenes reales o plausibles.

### Don’t

- No llenar superficies grandes con verde ácido.
- No sumar una segunda paleta saturada protagonista.
- No usar futurismo genérico de IA.
- No cargar el sistema con glassmorphism exagerado.
- No meter demasiadas tipografías.
- No convertir el sitio en un dashboard corporativo azul.
- No usar copy marketinero sin prueba.

## 21. Checklist para validar una pieza nueva

- ¿Se reconoce el binomio negro/blanco con acento acid?
- ¿Hay un solo foco principal de atención?
- ¿El verde dirige o invade?
- ¿El layout respira?
- ¿La pieza parece clínica/institucional y no genérica?
- ¿Hay una señal de prueba o legitimidad?
- ¿Las superficies están resueltas con bordes, radios y sombras coherentes con el sitio?
- ¿La tipografía conserva el tono sobrio y técnico?
- ¿La interacción tiene foco visible y motion moderado?
- ¿La pieza podría convivir sin fricción al lado del hero, el about page o el blog?

## 22. Síntesis final

Retinar tiene hoy un sistema visual muy reconocible:

- contraste alto,
- un acento ácido muy controlado,
- módulos claros y oscuros bien diferenciados,
- componentes redondeados y serenos,
- copy técnico con prueba,
- y una identidad que combina ciencia, clínica e implementación.

Si una pieza futura conserva esa estructura y ese criterio de uso del color, va a sentirse Retinar incluso antes de leer el logo.
