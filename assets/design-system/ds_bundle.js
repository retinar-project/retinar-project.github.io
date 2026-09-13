/* @ds-bundle: {"format":4,"namespace":"RetinarDesignSystem_97d407","components":[],"sourceHashes":{"instagram/deck-stage.js":"0c125b8b1e23","monografia/content.js":"2e6641b7ff32","monografia/docxdoc.js":"917b29f4a158","monografia/docxlib.js":"232447c090bf","monografia/preview-adapter.js":"9f71ffa3f086","monografia/wml2html.js":"c6fa01f392fb","retinapp/app.jsx":"39c15776d69a","retinapp/data.jsx":"e3436442e021","retinapp/icons.jsx":"bff0aa1a77c8","retinapp/ios-frame.jsx":"be3343be4b51","retinapp/screens-auth.jsx":"1ff75398f9e5","retinapp/screens-content.jsx":"1f1f40bbc205","retinapp/screens-estudios.jsx":"3a49ead396a9","retinapp/screens-extra.jsx":"d241f1ba5846","retinapp/screens-home.jsx":"497a9486459a","retinapp/screens-misc.jsx":"4c2184b323cf","retinapp/screens-quiz.jsx":"e859b40cb0ba","retinapp/screens-retina.jsx":"c0354452e3e2","retinapp/screens-salud.jsx":"70c0bfd6b6ea","retinapp/screens-vision.jsx":"327cd41471a5","retinapp/ui.jsx":"7b224f28020c","slides/deck-stage.js":"2c50f71f5203","ui_kits/website/app.jsx":"d1bd2232fd58","ui_kits/website/hero.jsx":"323e2d94c69b","ui_kits/website/sections.jsx":"c0459e13e090"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RetinarDesignSystem_97d407 = window.RetinarDesignSystem_97d407 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// instagram/deck-stage.js
try { (() => {
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *      On touch devices, tapping the left/right half of the stage goes
 *      prev/next — taps on links, buttons and other interactive slide
 *      content are left alone.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Delete (opens a Cancel/Delete confirm
 *      dialog). Drag the rail's right edge to resize; width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, on narrow viewports
 *      (≤640px), and via the `no-rail` attribute. Rail mutations dispatch
 *      a `deckchange`
 *      CustomEvent on the element: detail = {action, from, to, slide}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const FINE_POINTER_MQ = matchMedia('(hover: hover) and (pointer: fine)');
  const NARROW_MQ = matchMedia('(max-width: 640px)');
  // Slide-authored controls that should keep a tap instead of it navigating.
  const INTERACTIVE_SEL = 'a[href], button, input, select, textarea, summary, label, video[controls], audio[controls], [role="button"], [onclick], [tabindex]:not([tabindex^="-"]), [contenteditable]:not([contenteditable="false" i])';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    @media (max-width: 640px) {
      .rail, .rail-resize { display: none; }
    }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTap = this._onTap.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      this.addEventListener('click', this._onTap);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav and skip don't trigger
      // spurious refreshes.
      const OWN_ATTRS = /^data-(deck-|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          if (n && this._slideSet && this._slideSet.has(n)) this._liveDirty.add(n);
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      this.removeEventListener('click', this._onTap);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-omelette-chrome', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-omelette-chrome', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-omelette-chrome', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-omelette-chrome', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-omelette-chrome', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, overlay, menu, confirm);
      this._canvas = canvas;
      this._stage = stage;
      this._slot = slot;
      this._overlay = overlay;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      // Rail mutations (delete/move) already reconcile synchronously and
      // emit slidechange with reason 'api'; skip the async slotchange that
      // would otherwise re-broadcast with reason 'init'.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode || NARROW_MQ.matches) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
      // Crossing the narrow-viewport breakpoint reveals the rail — rerun the
      // thumbnail scale the same way _setRailWidth does.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTap(e) {
      // Touch-only — keyboard + the overlay toolbar cover nav on desktop.
      if (FINE_POINTER_MQ.matches) return;
      // Only taps that land on the stage (slide content or letterbox); the
      // overlay / rail / menus are siblings with their own click handlers.
      const path = e.composedPath();
      if (!this._stage || !path.includes(this._stage)) return;
      // Let interactive slide content keep the tap. composedPath (not
      // e.target.closest) so we see through open shadow roots — a <button>
      // inside a slide-authored custom element retargets e.target to the
      // host but still appears in the composed path.
      if (e.defaultPrevented) return;
      for (const n of path) {
        if (n === this._stage) break;
        if (n.matches && n.matches(INTERACTIVE_SEL)) return;
      }
      e.preventDefault();
      const rw = this._railWidth();
      const mid = rw + (window.innerWidth - rw) / 2;
      this._advance(e.clientX < mid ? -1 : 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }
    _emitDeckChange(detail) {
      this.dispatchEvent(new CustomEvent('deckchange', {
        detail,
        bubbles: true,
        composed: true
      }));
    }
    _deleteSlide(i) {
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const wasCurrent = i === this._index;
      if (i < this._index || wasCurrent && i === this._slides.length - 1) this._index--;
      this._squelchSlotChange = true;
      slide.remove();
      this._emitDeckChange({
        action: 'delete',
        from: i,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
      if (this._thumbs && this._thumbs[i]) {
        if (on) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
      }
      this._markLastVisible();
      this._emitDeckChange({
        action: on ? 'skip' : 'unskip',
        from: i,
        slide
      });
      // Re-broadcast so the presenter popup's prev/next thumbnails re-pick
      // the nearest non-skipped slide without waiting for a nav event.
      try {
        window.postMessage({
          slideIndexChanged: this._index,
          deckTotal: this._slides.length,
          deckSkipped: this._skippedIndices()
        }, '*');
      } catch (e) {}
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (j < 0 || j >= this._slides.length || j === i) return;
      const slide = this._slides[i];
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      // Track the active slide across the reorder so the same content
      // stays on screen.
      const cur = this._index;
      if (cur === i) this._index = j;else if (i < cur && j >= cur) this._index = cur - 1;else if (i > cur && j <= cur) this._index = cur + 1;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._emitDeckChange({
        action: 'move',
        from: i,
        to: j,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "instagram/deck-stage.js", error: String((e && e.message) || e) }); }

// monografia/content.js
try { (() => {
/* ============================================================
   Monografía Retinar — content model.
   globalThis.buildContent(R)  — R = DOCXDOC.createDoc(...)
   ============================================================ */
globalThis.buildContent = function (R) {
  const A = "monografia/assets/";

  // ---------------- TOC ----------------
  R.h1(null, "Contenido", "Índice de la monografía");
  R.p("Material educativo y operativo para personal de salud no oftalmológico que adopta Retinar para el tamizaje de retinopatía diabética con retinografía e inteligencia artificial.", {
    after: 160
  });
  R.toc([{
    n: 1,
    t: "Resumen ejecutivo"
  }, {
    n: 2,
    t: "Cómo usar esta monografía en una capacitación"
  }, {
    n: 3,
    t: "Por qué tamizar desde el punto de atención"
  }, {
    n: 4,
    t: "Anatomía práctica del fondo de ojo"
  }, {
    n: 5,
    t: "Qué es una retinografía y qué permite ver"
  }, {
    n: 6,
    t: "Fisiopatología y factores de riesgo sistémicos"
  }, {
    n: 7,
    t: "Lesiones elementales en retinografía diabética"
  }, {
    n: 8,
    t: "Clasificación clínica de la retinopatía diabética"
  }, {
    n: 9,
    t: "Edema macular diabético y maculopatía referible"
  }, {
    n: 10,
    t: "Calidad de imagen y captura con retinógrafo portátil"
  }, {
    n: 11,
    t: "Uso seguro de Retinar e IA (human-in-the-loop)"
  }, {
    n: 12,
    t: "Categorías operativas y derivación"
  }, {
    n: 13,
    t: "Comunicación con pacientes"
  }, {
    n: 14,
    t: "Implementación operativa del programa"
  }, {
    n: 15,
    t: "Indicadores de calidad y auditoría"
  }, {
    n: 16,
    t: "Casos didácticos comentados"
  }, {
    n: 17,
    t: "Apéndices operativos"
  }, {
    n: 18,
    t: "Bibliografía y fuentes sugeridas"
  }, {
    n: "—",
    t: "Anexo editorial: banco de imágenes recomendado"
  }]);
  R.callout({
    variant: "light",
    title: "Uso previsto de este documento",
    body: "Acompaña capacitaciones de implementación de Retinar. Su finalidad es educativa y operativa: ayudar al personal de salud a comprender la retinopatía diabética, capturar imágenes de calidad, interpretar categorías de tamizaje y activar circuitos de derivación seguros. No reemplaza la evaluación oftalmológica, las guías clínicas locales ni el criterio médico profesional."
  });

  // ---------------- 1 · Resumen ejecutivo ----------------
  R.pagebreak();
  R.h1("01", "Resumen ejecutivo", "Tamizaje retinal donde no hay un oftalmólogo presente");
  R.lead("La retinopatía diabética es una complicación microvascular de la diabetes y una de las principales causas de pérdida visual evitable. Progresa durante años sin síntomas; cuando la visión cae, el tratamiento ya puede llegar tarde.");
  R.p("Para el equipo que atiende diabetes, el tamizaje retinal no es un accesorio del cuidado metabólico: es prevención secundaria que detecta la enfermedad antes de que comprometa la autonomía del paciente. Retinar se incorpora como una plataforma de teleoftalmología asistida por inteligencia artificial que organiza la captura de retinografías, apoya el prediagnóstico de casos de riesgo, facilita la revisión humana y ordena la derivación.");
  R.p([{
    text: "En una adopción segura, la IA no reemplaza al oftalmólogo ni transforma al diabetólogo en retinólogo. "
  }, {
    text: "Su valor es ampliar acceso, estandarizar el flujo y asegurar que los casos que requieren evaluación especializada sean detectados y seguidos de manera trazable."
  }]);
  R.kpis([{
    n: "+95%",
    c: "Sensibilidad objetivo para detectar casos de riesgo"
  }, {
    n: "< 15 s",
    c: "Prediagnóstico asistido por imagen"
  }, {
    n: "+40",
    c: "Retinógrafos compatibles validados"
  }, {
    n: "4",
    c: "Categorías operativas: no referible, referible, urgente, no gradable"
  }], "light");
  R.h2("Para quién es esta monografía");
  R.p("Está escrita para personal de salud no oftalmológico: diabetólogos, endocrinólogos, médicos clínicos, enfermería, técnicos, residentes, administrativos de programas y responsables de implementación. El propósito es que quienes adopten Retinar entiendan qué fotografían, qué lesiones busca el tamizaje, qué significa que un caso sea referible, cómo se reconoce una imagen de mala calidad, cómo se comunica el resultado y cómo se cierra la derivación.");
  R.callout({
    title: "Mensaje central",
    body: "El objetivo de adoptar Retinar no es diagnosticar toda la patología retinal en el consultorio de diabetes, sino detectar de forma temprana y trazable a los pacientes que necesitan evaluación oftalmológica o retinológica."
  });

  // ---------------- 2 · Cómo usar ----------------
  R.pagebreak();
  R.h1("02", "Capacitación", "Cómo usar esta monografía");
  R.p("Este documento sirve como material de estudio previo y como anexo de consulta después de la capacitación presencial. Puede usarse completo en un curso introductorio o parcialmente, como apoyo para entrenamientos específicos de captura, calidad de imagen o derivación.");
  R.dtable({
    head: ["Momento", "Recomendación práctica"],
    widthsPct: [0.27, 0.73],
    kcol: true,
    rows: [["Antes de la capacitación", "Enviar los capítulos 1 a 8 para lectura previa. Pedir que los participantes anoten dudas sobre lesiones, calidad de imagen y derivación."], ["Clase de 2 horas", "Priorizar anatomía, lesiones elementales, calidad de imagen, concepto de referible, uso seguro de IA y casos prácticos."], ["Primer mes de adopción", "Usar los apéndices como checklist operativo. Auditar gradabilidad, tiempos de derivación y concordancia de lectura."], ["Reentrenamiento", "Revisar imágenes no gradables, falsos positivos, falsos negativos y casos con dudas de comunicación."]]
  });
  R.callout({
    variant: "light",
    title: "El aprendizaje se consolida mirando",
    body: "La capacitación no debe ser sólo expositiva. En salud visual, el equipo aprende al comparar casos, cometer errores seguros en un entorno docente y recibir retroalimentación. Por eso cada capítulo incluye mensajes operativos y, al final, casos comentados."
  });

  // ---------------- 3 · Por qué tamizar ----------------
  R.pagebreak();
  R.h1("03", "Fundamento", "Por qué tamizar desde el punto de atención");
  R.p("La diabetes produce daño vascular sostenido en órganos blanco. En la retina, ese daño aparece como microaneurismas, hemorragias, exudación, isquemia, edema macular y, en estadios avanzados, neovascularización. Muchas de estas alteraciones son visibles en una retinografía color antes de que el paciente perciba pérdida visual: esa posibilidad de detección temprana es la base del tamizaje.");
  R.p("El punto de atención diabetológica tiene una ventaja estratégica: el paciente ya está vinculado al sistema, el equipo conoce su historia metabólica y hay oportunidades repetidas para intervenir. En lugar de depender de que el paciente solicite y asista a un control oftalmológico externo, el programa acerca la captura al lugar donde ya consulta por su diabetes.");
  R.h2("Tamizar no es diagnosticar");
  R.p("Tamizar significa clasificar riesgo y decidir conducta: continuar seguimiento, repetir por mala calidad, derivar en forma programada o activar una derivación urgente. Diagnosticar y tratar implica evaluación especializada: lámpara de hendidura, OCT, angiografía, láser, inyecciones intravítreas, cirugía o seguimiento retinológico.");
  R.dtable({
    head: ["Concepto", "Qué significa en la adopción de Retinar"],
    widthsPct: [0.3, 0.7],
    kcol: true,
    rows: [["Tamizaje", "Búsqueda sistemática de signos de retinopatía diabética —o de mala calidad que impida descartar lesiones."], ["Prediagnóstico asistido", "Resultado preliminar de apoyo que orienta si el caso parece referible, no referible o no gradable."], ["Lectura humana", "Revisión por personal competente o especialista, sobre todo en casos positivos, dudosos, no gradables o discordantes."], ["Derivación", "Conexión efectiva del paciente con oftalmología o retina, con registro y seguimiento."]]
  });
  R.callout({
    title: "Lo que Retinar debe ayudar a evitar",
    body: "Un programa inseguro no es sólo el que falla en detectar lesiones. También es inseguro si obtiene imágenes malas, si comunica mal los resultados, si no deriva a tiempo o si pierde pacientes referidos en el seguimiento."
  });

  // ---------------- 4 · Anatomía ----------------
  R.pagebreak();
  R.h1("04", "Anatomía", "Anatomía práctica del fondo de ojo");
  R.p("Una retinografía de fondo de ojo es una fotografía de la retina. Para personal no oftalmológico, el primer objetivo es orientarse en la imagen. No hace falta memorizar toda la anatomía ocular, pero sí reconocer las referencias que organizan la lectura: papila, mácula, fóvea, vasos y arcadas.");
  R.figure({
    path: A + "fundus-anatomia.jpg",
    wmm: 108,
    eyebrow: "Figura 1",
    caption: "Retinografía esquemática anotada: la papila es el disco claro de donde emergen los vasos; la mácula, la zona central oscura responsable de la visión fina. Imagen didáctica simulada."
  });
  R.dtable({
    head: ["Estructura", "Cómo reconocerla", "Por qué importa en el tamizaje"],
    widthsPct: [0.2, 0.4, 0.4],
    kcol: true,
    rows: [["Papila / disco óptico", "Zona clara, redondeada u oval, de donde emergen los vasos.", "Orienta la imagen, ubica cuadrantes y permite detectar neovasos en papila o signos de glaucoma."], ["Mácula", "Zona más oscura cercana al centro de la retina posterior.", "Crítica para la visión fina. Exudados, hemorragias o edema cercanos pueden ser referibles."], ["Fóvea", "Centro funcional de la mácula; punto o depresión más oscura.", "La proximidad de lesiones a la fóvea define el riesgo de compromiso visual."], ["Vasos y arcadas", "Arterias y venas que salen de la papila y rodean la mácula.", "Permiten reconocer hemorragias, arrosariamiento venoso, IRMA y neovascularización."], ["Cuadrantes", "División por líneas vertical y horizontal centradas en la papila.", "Se usan para estimar severidad, especialmente con la regla 4-2-1."]]
  });
  R.callout({
    variant: "light",
    title: "Entrená una secuencia fija de lectura",
    body: "Primero localizá la papila, luego la mácula, después evaluá si la imagen está enfocada y recién entonces buscá lesiones. Quien busca microaneurismas sin orientarse antes aumenta el riesgo de error y de fatiga visual."
  });
  R.h2("Campos de captura");
  R.p("Conceptualmente se busca cubrir el polo posterior: una imagen centrada en mácula y otra en papila aportan información complementaria. Si el retinógrafo portátil tiene campo más limitado, el protocolo debe definir explícitamente qué campos son obligatorios y cuándo repetir.");
  R.figGrid({
    cols: 2,
    items: [{
      path: A + "cap-macula.jpg",
      label: "Campo centrado en mácula",
      desc: "Permite valorar la zona central y signos de maculopatía."
    }, {
      path: A + "cap-papila.jpg",
      label: "Campo centrado en papila",
      desc: "Permite valorar disco, arcadas y signos proliferativos."
    }]
  });
  R.p([{
    text: "Figura 2 · ",
    b: true,
    color: R._fig
  }, {
    text: "Campos recomendados de captura. Adaptar el protocolo al retinógrafo disponible y a la calidad obtenida en cada paciente."
  }], {
    after: 0
  });

  // ---------------- 5 · Qué es una retinografía ----------------
  R.pagebreak();
  R.h1("05", "Retinografía", "Qué es una retinografía y qué permite ver");
  R.p("La retinografía color de fondo de ojo es una imagen obtenida con una cámara retinal. A diferencia de la oftalmoscopía directa, deja un registro visual que puede almacenarse, compararse en el tiempo, auditarse y enviarse a lectura remota. Esa trazabilidad es uno de los motivos por los que resulta especialmente útil para programas de tamizaje.");
  R.p("Una retinografía no muestra todo: no reemplaza una evaluación oftalmológica completa, no mide el espesor macular como un OCT, no evalúa presión intraocular y puede fallar ante mala calidad, catarata, pupila pequeña, movimiento, opacidad de medios o errores de centrado. Por eso el resultado debe interpretarse dentro de un circuito clínico.");
  R.p("Permite observar signos visibles de retinopatía diabética —microaneurismas, hemorragias, exudados duros, manchas algodonosas, alteraciones venosas, IRMA, neovasos y signos indirectos de maculopatía— y también hallazgos no diabéticos: papila sospechosa de glaucoma, degeneración macular, oclusiones venosas o cicatrices de láser.");
  R.dtable({
    head: ["Ventaja", "Implicancia operativa"],
    widthsPct: [0.3, 0.7],
    kcol: true,
    rows: [["Registro permanente", "Permite comparar evolución, auditar decisiones y entrenar al equipo."], ["Telelectura", "Permite que especialistas revisen casos sin que el paciente se desplace inicialmente."], ["Estandarización", "Favorece un protocolo reproducible por técnicos o personal entrenado."], ["Integración con IA", "Permite control de calidad y prediagnóstico asistido, siempre con gobernanza clínica."]]
  });
  R.callout({
    title: "Principio de seguridad",
    body: "Si la imagen no permite ver lo necesario, el resultado correcto es «no gradable» o «estudio incompleto» — nunca «sin retinopatía»."
  });

  // ---------------- 6 · Fisiopatología ----------------
  R.pagebreak();
  R.h1("06", "Fisiopatología", "Fisiopatología y factores de riesgo sistémicos");
  R.p("La retinopatía diabética puede entenderse como el resultado de dos procesos interrelacionados: fuga vascular e isquemia. La fuga produce edema, exudados y hemorragias; la isquemia estimula mecanismos proangiogénicos que pueden terminar en neovascularización. La combinación de ambos explica por qué algunos pacientes tienen lesiones maculares y otros evolucionan a formas proliferativas.");
  R.p("La hiperglucemia sostenida daña el endotelio capilar, altera la barrera hematorretiniana y favorece la pérdida de pericitos. Los microaneurismas son una manifestación temprana de esa fragilidad capilar. Con el tiempo aparecen hemorragias intrarretinales, exudados lipídicos, manchas algodonosas y signos de isquemia.");
  R.p([{
    text: "Cuando la retina queda hipóxica puede responder formando vasos nuevos. Estos neovasos son frágiles, crecen donde no deberían y pueden sangrar hacia el vítreo. "
  }, {
    text: "En tamizaje, la presencia de neovasos, hemorragia prerretinal o vítrea debe considerarse una señal de alta prioridad.",
    b: true,
    color: R._ink
  }]);
  R.dtable({
    head: ["Factor", "Relación con la retinopatía", "Acción desde diabetología"],
    widthsPct: [0.22, 0.41, 0.37],
    kcol: true,
    rows: [["Duración de la diabetes", "A mayor tiempo de evolución, mayor riesgo acumulado.", "Registrar el año de diagnóstico y priorizar pacientes de larga evolución."], ["HbA1c elevada", "Asociada a aparición y progresión de lesiones microvasculares.", "Intensificar seguimiento metabólico y educación."], ["Hipertensión arterial", "Aumenta el daño microvascular y el riesgo de progresión.", "Control tensional sistemático."], ["Dislipidemia", "Relacionada con exudación lipídica y riesgo vascular general.", "Optimizar tratamiento y adherencia."], ["Nefropatía / albuminuria", "Marcador de microangiopatía sistémica.", "Priorizar tamizaje y seguimiento estrecho."], ["Embarazo con diabetes previa", "Puede acelerar la progresión de la retinopatía.", "Control preconcepcional o temprano y seguimiento trimestral según riesgo."]]
  });
  R.callout({
    variant: "light",
    title: "El tamizaje complementa, no compite",
    body: "El tamizaje retinal no compite con el control metabólico: lo complementa. La misma consulta que detecta riesgo ocular debe reforzar control glucémico, presión arterial, lípidos, riñón y adherencia."
  });

  // ---------------- 7 · Lesiones ----------------
  R.pagebreak();
  R.h1("07", "Lesiones", "Lesiones elementales en retinografía diabética");
  R.p("Este capítulo es el núcleo visual de la capacitación. El personal no oftalmológico no necesita graduar cada lesión con precisión de especialista, pero sí entender qué lesiones explican que una imagen sea sospechosa o referible.");
  R.figGrid({
    cols: 3,
    items: [{
      path: A + "les-micro.jpg",
      label: "Microaneurismas",
      desc: "Puntos rojos muy pequeños y redondeados. Primer signo típico; si están solos, suele ser RDNP leve."
    }, {
      path: A + "les-hemo.jpg",
      label: "Hemorragias",
      desc: "Puntos o manchas rojas, a veces en grupos. A mayor número y extensión, mayor severidad."
    }, {
      path: A + "les-exudados.jpg",
      label: "Exudados duros",
      desc: "Depósitos amarillentos brillantes. Cerca de la fóvea o en grupo macular, son referibles."
    }, {
      path: A + "les-algodon.jpg",
      label: "Manchas algodonosas",
      desc: "Lesiones blanquecinas y suaves. Expresan isquemia; obligan a buscar otros signos de severidad."
    }, {
      path: A + "les-prolif.jpg",
      label: "Neovasos / proliferativa",
      desc: "Vasos nuevos, desorganizados, en papila o retina. Definen RDP activa: derivación urgente."
    }, {
      path: A + "les-maculo.jpg",
      label: "Maculopatía referible",
      desc: "Exudados o lesiones cerca de la fóvea. Riesgo de compromiso visual central."
    }]
  });
  R.p([{
    text: "Figura 3 · ",
    b: true,
    color: R._fig
  }, {
    text: "Lesiones elementales sobre retinografías didácticas simuladas. En capacitación, complementar con retinografías clínicas reales curadas por especialistas."
  }]);
  R.dtable({
    head: ["Lesión", "Qué significa", "Error frecuente"],
    widthsPct: [0.22, 0.5, 0.28],
    kcol: true,
    rows: [["Microaneurismas", "Primer signo típico. Único hallazgo → suele ser RDNP leve.", "Confundirlos con pigmento o ruido."], ["Hemorragias intrarretinales", "Más número/extensión sugiere RDNP moderada o severa.", "Confundir hemorragias en llama con blot hemorrhages."], ["Exudados duros", "Sugieren fuga vascular; maculares son referibles.", "Confundir con drusas o reflejos."], ["Manchas algodonosas", "Isquemia de fibras nerviosas; buscar más signos.", "Sobrerreaccionar si están aisladas."], ["Beading venoso", "Marcador de isquemia y severidad.", "Confundir loops venosos con beading verdadero."], ["IRMA", "Enfermedad severa / preproliferativa.", "Clasificar estructuras dudosas como IRMA sin confirmar."], ["Neovasos", "RDP activa. Derivación urgente.", "Confundir vasos normales o artefactos con neovasos."], ["Hemorragia vítrea / prerretinal", "Puede indicar proliferativa activa. Urgente.", "Tomarla como simple mala calidad."]]
  });
  R.callout({
    variant: "light",
    title: "Las lesiones se aprenden por contraste",
    body: "Mostrá una imagen «limpia» con una lesión obvia, luego una imagen realista con la misma lesión más sutil y, finalmente, un confusor. Ese triple paso evita depender de ejemplos perfectos. Si la imagen es mala o la lesión genera duda, la conducta segura es registrar la calidad, enviar a lectura y, cuando corresponda, repetir o derivar."
  });

  // ---------------- 8 · Clasificación ----------------
  R.pagebreak();
  R.h1("08", "Clasificación", "Clasificación clínica de la retinopatía diabética");
  R.p("La clasificación internacional distingue cinco niveles de severidad. Para un equipo no oftalmológico, debe enseñarse como una forma de entender la progresión —no como una obligación de graduar casos complejos en soledad. La leve se reconoce por microaneurismas; la moderada tiene más lesiones sin criterios de severa; la severa se asocia a la regla 4-2-1; la proliferativa se define por neovascularización o complicaciones.");
  R.flow({
    cols: 5,
    steps: [{
      n: "—",
      t: "Sin RD aparente",
      d: "Sin lesiones en imágenes gradables."
    }, {
      n: "1",
      t: "RDNP leve",
      d: "Microaneurismas o cambios mínimos."
    }, {
      n: "2",
      t: "RDNP moderada",
      d: "Más que microaneurismas; sin criterios de severa."
    }, {
      n: "3",
      t: "RDNP severa",
      d: "Regla 4-2-1; beading o IRMA importante."
    }, {
      n: "4",
      t: "RDP",
      d: "Neovasos, hemorragia vítrea/prerretinal.",
      shd: R._urg
    }]
  });
  R.p([{
    text: "Figura 4 · ",
    b: true,
    color: R._fig
  }, {
    text: "Clasificación clínica simplificada y su traducción a decisión operativa."
  }]);
  R.dtable({
    head: ["Nivel", "Hallazgos orientativos", "Conducta con Retinar"],
    widthsPct: [0.18, 0.44, 0.38],
    kcol: true,
    rows: [["Sin RD aparente", "Sin lesiones compatibles en imágenes gradables.", "No referible. Repetir tamizaje según protocolo."], ["RDNP leve", "Microaneurismas solos o cambios mínimos.", "Generalmente no referible si no hay maculopatía, síntomas ni dudas de calidad."], ["RDNP moderada", "Más que microaneurismas, sin criterios de severa.", "Referible programado o seguimiento según protocolo y lectura especializada."], ["RDNP severa", "Regla 4-2-1: lesiones abundantes, beading o IRMA.", "Derivación preferente."], [{
      text: "RDP",
      color: R._ink,
      b: true
    }, "Neovasos, hemorragia, proliferación fibrovascular o tracción.", {
      text: "Derivación urgente.",
      b: true,
      color: R._urgInk
    }]]
  });
  R.callout({
    title: "Simplificación operativa",
    body: "Para la adopción inicial, conviene resolver los casos en cuatro categorías: no referible, referible, urgente y no gradable. La clasificación fina puede quedar en manos del lector especializado."
  });

  // ---------------- 9 · EMD ----------------
  R.pagebreak();
  R.h1("09", "Maculopatía", "Edema macular diabético y maculopatía referible");
  R.p("El edema macular diabético es una causa central de pérdida visual en personas con diabetes. Puede aparecer en distintos estadios y no siempre se confirma con certeza en una retinografía color. El estudio de referencia para medir el espesor macular es el OCT, pero la retinografía puede mostrar signos indirectos suficientes para derivar.");
  R.figure({
    path: A + "fundus-maculo.jpg",
    wmm: 104,
    eyebrow: "Figura 5",
    caption: "Ejemplo didáctico simulado de exudados cercanos a la mácula, una situación que debe activar evaluación oftalmológica / OCT según protocolo."
  });
  R.p("Desde el tamizaje, lo importante es reconocer la sospecha de compromiso macular: exudados duros cerca de la fóvea, grupos de exudados dentro de la mácula, hemorragias o microaneurismas cercanos a la fóvea asociados a baja agudeza visual, o cualquier hallazgo macular que genere duda razonable.");
  R.dtable({
    head: ["Señal", "Por qué importa", "Conducta"],
    widthsPct: [0.32, 0.36, 0.32],
    kcol: true,
    rows: [["Exudado a < 1 diámetro de disco del centro foveal", "Sugiere maculopatía referible.", "Derivar para evaluación oftalmológica y eventual OCT."], ["Grupo de exudados dentro de la mácula", "Puede representar fuga vascular significativa.", "Derivar, en especial si hay baja AV o progresión."], ["Baja AV + lesiones cerca de la fóvea", "Puede ser edema macular clínicamente relevante.", "Derivar aunque la cámara color no confirme espesor."], ["Imagen macular no gradable", "No permite excluir compromiso central.", "Repetir o derivar."]]
  });
  R.callout({
    title: "Regla práctica",
    body: "Ante sospecha macular, no esperés certeza absoluta en la retinografía color. El objetivo del tamizaje es no perder a quien necesita evaluación con oftalmología / OCT."
  });

  // ---------------- 10 · Calidad ----------------
  R.pagebreak();
  R.h1("10", "Calidad de imagen", "Calidad de imagen y captura con retinógrafo portátil");
  R.p("La calidad de imagen es parte del acto clínico. Una imagen borrosa, mal centrada o subexpuesta puede ocultar microaneurismas, exudados o neovasos. La calidad no debe quedar librada a la intuición: debe existir un checklist mínimo y una política explícita de repetición. Los retinógrafos portátiles acercan la captura y reducen barreras de acceso, pero tienen curva de aprendizaje, dependen de la iluminación y son más sensibles al movimiento y a la pupila pequeña.");
  R.figGrid({
    cols: 2,
    items: [{
      path: A + "q-gradable.jpg",
      tag: "Gradable",
      tagColor: R._fig,
      label: "Imagen gradable",
      desc: "Se ven vasos, mácula y papila con nitidez suficiente."
    }, {
      path: A + "q-desenfoque.jpg",
      tag: "No gradable",
      tagColor: R._urgInk,
      label: "Desenfoque",
      desc: "Los vasos no son nítidos: repetir antes de clasificar."
    }, {
      path: A + "q-subexp.jpg",
      tag: "No gradable",
      tagColor: R._urgInk,
      label: "Subexposición",
      desc: "La baja iluminación oculta lesiones pequeñas."
    }, {
      path: A + "q-parpado.jpg",
      tag: "No gradable",
      tagColor: R._urgInk,
      label: "Artefacto por párpado / pestañas",
      desc: "Sombras o pestañas pueden tapar zonas relevantes."
    }]
  });
  R.p([{
    text: "Figura 6 · ",
    b: true,
    color: R._fig
  }, {
    text: "Calidad de imagen. Las imágenes no gradables deben repetirse o derivarse; nunca se consideran negativas."
  }]);
  R.dtable({
    head: ["Paso de captura", "Recomendación"],
    widthsPct: [0.26, 0.74],
    kcol: true,
    rows: [["Preparación", "Explicar el estudio, confirmar identidad, lateralidad y consentimiento. Registrar síntomas visuales."], ["Ambiente", "Reducir reflejos y luz ambiente si el equipo lo requiere. Asegurar una posición cómoda."], ["Campos", "Capturar ambos ojos. Priorizar mácula y papila, o el protocolo equivalente del equipo."], ["Control inmediato", "Revisar foco, centrado, exposición y artefactos antes de cerrar el estudio."], ["Repetición", "Repetir imágenes con mala calidad corregible: desenfoque, sombra, párpado, movimiento, centrado."], ["No gradable", "Si persiste la mala calidad, registrar el motivo y activar conducta de repetición / derivación."]]
  });
  R.dtable({
    head: ["Causa de mala calidad", "Qué se ve", "Qué hacer"],
    widthsPct: [0.26, 0.4, 0.34],
    kcol: true,
    rows: [["Desenfoque", "Vasos borrosos; no se distinguen ramas finas.", "Reenfocar, estabilizar y repetir."], ["Subexposición", "Imagen oscura; lesiones pequeñas se pierden.", "Ajustar iluminación / parámetros y repetir."], ["Sobreexposición / reflejo", "Imagen lavada o con brillo central.", "Reposicionar, reducir reflejos y repetir."], ["Pestañas / párpado", "Sombra negra o borde que tapa la retina.", "Recolocar párpado, pedir apertura ocular y repetir."], ["Pupila pequeña", "Campo reducido o viñeteo.", "Reintentar; considerar midriasis si el protocolo la contempla; si no, derivar."], ["Opacidad de medios", "Velo difuso compatible con catarata.", "Intentar mejor toma; si no se logra, clasificar no gradable y derivar."]]
  });

  // ---------------- 11 · IA HITL ----------------
  R.pagebreak();
  R.h1("11", "IA segura", "Uso seguro de Retinar e IA (human-in-the-loop)");
  R.p("La inteligencia artificial puede ampliar el acceso al tamizaje al asistir en el control de calidad, la priorización de casos y el prediagnóstico. Su uso seguro exige gobernanza clínica: en una implementación inicial, ningún sistema automático debe tratarse como una autoridad aislada. Debe funcionar dentro de un circuito con roles, auditoría y criterios de escalamiento.");
  R.p([{
    text: "Human-in-the-loop",
    b: true,
    color: R._ink
  }, {
    text: " significa que la decisión clínica relevante no depende sólo de la salida del algoritmo. El sistema ayuda a identificar riesgo, pero los casos positivos, dudosos, no gradables, discordantes o con síntomas de alarma pasan a revisión humana o derivación según protocolo."
  }]);
  R.flow({
    cols: 4,
    steps: [{
      n: "1",
      t: "Captura",
      d: "Imagen del fondo de ojo."
    }, {
      n: "2",
      t: "Control de calidad",
      d: "¿La imagen es gradable?"
    }, {
      n: "3",
      t: "Prediagnóstico IA",
      d: "Triage y clasificación de riesgo."
    }, {
      n: "4",
      t: "Lectura humana",
      d: "Revisión según protocolo."
    }, {
      n: "5",
      t: "Resultado y conducta",
      d: "Categoría operativa."
    }, {
      n: "6",
      t: "Derivación",
      d: "Programada o urgente."
    }, {
      n: "7",
      t: "Seguimiento",
      d: "Cierre del circuito."
    }, {
      n: "!",
      t: "No gradable → repetir o derivar",
      d: "Nunca cerrar como normal.",
      shd: R._urg
    }]
  });
  R.p([{
    text: "Figura 7 · ",
    b: true,
    color: R._fig
  }, {
    text: "Uso seguro de IA en Retinar: el algoritmo apoya, pero no sustituye el circuito clínico ni la lectura humana definida por el protocolo."
  }]);
  R.p("El personal debe comprender de forma práctica la sensibilidad, la especificidad y los errores esperables. En tamizaje se prioriza la sensibilidad: se prefiere derivar algunos falsos positivos antes que perder enfermedad que amenaza la visión. Aun así, demasiados falsos positivos saturan el circuito, por lo que el programa necesita auditoría continua.");
  R.dtable({
    head: ["Situación", "Conducta segura"],
    widthsPct: [0.42, 0.58],
    kcol: true,
    rows: [["IA no referible + imagen gradable + sin síntomas", "Sigue circuito de no referible, con muestreo de auditoría según protocolo."], ["IA referible", "Revisión humana y derivación según categoría operativa."], ["IA no concluyente o baja confianza", "Revisión humana obligatoria."], ["Imagen no gradable", "No usar resultado negativo. Repetir o derivar."], ["Síntomas de alarma", "Derivación clínica aunque la IA no detecte lesiones."], ["Discordancia operador / IA / lector", "Escalar a revisión especializada y registrar para auditoría."]]
  });
  R.callout({
    title: "Lenguaje recomendado",
    body: "Usá «prediagnóstico», «tamizaje asistido» o «clasificación de riesgo». Evitá decirle al paciente que «la IA diagnosticó» o que «la IA descartó» enfermedad."
  });

  // ---------------- 12 · Categorías ----------------
  R.pagebreak();
  R.h1("12", "Derivación", "Categorías operativas y derivación");
  R.p("La adopción de Retinar debe transformar una imagen en una conducta. Para equipos no oftalmológicos, las categorías operativas deben ser simples, memorables y seguras.");
  R.dtable({
    head: ["Categoría", "Definición práctica", "Conducta"],
    widthsPct: [0.17, 0.46, 0.37],
    kcol: true,
    rows: [[{
      text: "No referible",
      color: R._fig,
      b: true
    }, "Imagen gradable sin signos de retinopatía referible ni sospecha macular.", "Informar, reforzar control metabólico y repetir tamizaje según protocolo."], [{
      text: "Referible",
      color: R._ink,
      b: true
    }, "RDNP moderada o peor, maculopatía referible, hallazgo no diabético relevante o duda clínica.", "Derivar a oftalmología / retina en plazo programado. Registrar y seguir."], [{
      text: "Urgente",
      color: R._urgInk,
      b: true
    }, "Neovasos, hemorragia vítrea/prerretinal, tracción, pérdida súbita o síntomas de alarma.", "Activar derivación urgente según la red local."], [{
      text: "No gradable",
      color: R._ink,
      b: true
    }, "No se puede decidir con seguridad por mala calidad o imposibilidad de captura.", "Repetir con mejor técnica o derivar. Nunca cerrar como normal."]]
  });
  R.figure({
    path: A + "fundus-prolif.jpg",
    wmm: 104,
    eyebrow: "Figura 8",
    caption: "Ejemplo didáctico simulado de sospecha proliferativa con neovasos / hemorragias. Conducta: derivación urgente."
  });
  R.p("La derivación no debe ser sólo una recomendación verbal: debe existir registro de fecha de estudio, categoría, responsable que informó, turno otorgado, asistencia y diagnóstico final cuando esté disponible. Sin esa trazabilidad, el programa puede detectar riesgo pero fallar en prevenir daño visual. En la etapa inicial es aceptable una tasa de derivación conservadora; la auditoría permitirá ajustar el equilibrio entre sensibilidad y carga asistencial.");

  // ---------------- 13 · Comunicación ----------------
  R.pagebreak();
  R.h1("13", "Comunicación", "Comunicación con pacientes");
  R.p("La forma de comunicar el resultado es una intervención clínica. Un mensaje demasiado tranquilizador puede hacer que el paciente abandone los controles; uno alarmista puede generar miedo y rechazo. El objetivo es explicar con claridad qué se encontró, qué no se puede saber y cuál es el próximo paso. Conviene evitar tecnicismos: en lugar de «retinopatía no proliferativa moderada», decí «aparecen cambios en la retina por la diabetes que conviene evaluar con oftalmología».");
  R.dtable({
    head: ["Escenario", "Guion breve sugerido"],
    widthsPct: [0.22, 0.78],
    kcol: true,
    rows: [["Antes del estudio", "«Vamos a tomar fotos de la retina para buscar cambios tempranos por la diabetes. Muchas veces esos cambios no dan síntomas al principio.»"], [{
      text: "No referible",
      color: R._fig,
      b: true
    }, "«En estas imágenes no vemos signos que obliguen a derivar ahora. Igual conviene repetir el control cuando corresponda.»"], [{
      text: "Referible",
      color: R._ink,
      b: true
    }, "«Aparecen cambios que necesitan evaluación por oftalmología. No es necesariamente una urgencia, pero sí hay que completar el estudio.»"], [{
      text: "Urgente",
      color: R._urgInk,
      b: true
    }, "«Hay signos o síntomas que requieren evaluación oftalmológica rápida. Vamos a activar la derivación prioritaria.»"], ["No gradable", "«La imagen no permite decidir con seguridad. Puede ser por pupila pequeña, catarata o dificultad técnica. Necesitamos repetir o derivar.»"]]
  });
  R.p([{
    text: "Figura 9 · ",
    b: true,
    color: R._fig
  }, {
    text: "Mensajes de comunicación seguros para pacientes. Adaptar al lenguaje local y al nivel de alfabetización en salud."
  }]);
  R.callout({
    title: "Síntomas de alarma",
    body: "Pérdida súbita de visión, aumento brusco de moscas volantes, destellos, cortina o sombra, dolor ocular intenso, ojo rojo con baja visual o visión muy distorsionada deben derivarse por criterio clínico, aunque la imagen no parezca grave."
  });

  // ---------------- 14 · Implementación ----------------
  R.pagebreak();
  R.h1("14", "Implementación", "Implementación operativa del programa");
  R.p("La adopción de Retinar debe definirse como un circuito asistencial reproducible. El flujo mínimo incluye selección de pacientes, consentimiento, captura, control de calidad, procesamiento, lectura, comunicación, derivación y seguimiento.");
  R.flow({
    cols: 3,
    steps: [{
      n: "1",
      t: "Población elegible",
      d: "Tipo de diabetes, edad, último control, prioridad."
    }, {
      n: "2",
      t: "Consentimiento",
      d: "Explicar que es tamizaje."
    }, {
      n: "3",
      t: "Captura",
      d: "Imágenes de ambos ojos."
    }, {
      n: "4",
      t: "Control de calidad",
      d: "¿Gradable? Repetir si corresponde."
    }, {
      n: "5",
      t: "Lectura Retinar + equipo",
      d: "IA + revisión humana."
    }, {
      n: "6",
      t: "Categoría operativa",
      d: "Decisión de conducta."
    }, {
      n: "7",
      t: "Comunicación",
      d: "Resultado documentado."
    }, {
      n: "8",
      t: "Derivación",
      d: "Programada o urgente."
    }, {
      n: "9",
      t: "Seguimiento y auditoría",
      d: "Cierre y mejora continua."
    }]
  });
  R.p([{
    text: "Figura 10 · ",
    b: true,
    color: R._fig
  }, {
    text: "Flujo operativo recomendado para la adopción de Retinar en efectores de salud. Adaptar a recursos, red de derivación y protocolos locales."
  }]);
  R.dtable({
    head: ["Componente", "Decisión que debe estar escrita antes de iniciar"],
    widthsPct: [0.26, 0.74],
    kcol: true,
    rows: [["Población elegible", "A quién se ofrece el estudio: tipo de diabetes, edad, último control ocular, prioridad clínica."], ["Rol de captura", "Quién toma imágenes, cómo se entrena y cómo se evalúa su competencia inicial."], ["Campos obligatorios", "Qué imágenes mínimas se requieren por ojo y cuándo repetir."], ["Lectura", "Quién revisa casos, qué rol cumple Retinar / IA y qué casos requieren revisión humana."], ["Derivación", "Plazos y responsables para referible, urgente y no gradable."], ["Comunicación", "Quién informa el resultado y cómo queda documentado."], ["Seguimiento", "Cómo se confirma que el paciente asistió a la consulta oftalmológica."], ["Auditoría", "Qué indicadores se revisan semanal o mensualmente."]]
  });
  R.callout({
    variant: "light",
    title: "El primer mes es aprendizaje supervisado",
    body: "Revisar el 100 % de los casos positivos y no gradables, auditar una muestra de negativos y hacer reuniones breves de retroalimentación. Si la tasa de no gradabilidad es alta, el problema no está en la IA sino en la captura, el dispositivo, el ambiente o el protocolo."
  });

  // ---------------- 15 · Indicadores ----------------
  R.pagebreak();
  R.h1("15", "Indicadores", "Indicadores de calidad y auditoría");
  R.p("Medir no es burocracia: es parte de la seguridad clínica. Los indicadores permiten saber si el programa amplía acceso, si las imágenes son evaluables, si los casos referibles llegan al especialista y si los tiempos son aceptables.");
  R.dtable({
    head: ["Indicador", "Definición", "Uso para gestión"],
    widthsPct: [0.2, 0.42, 0.38],
    kcol: true,
    rows: [["Cobertura", "Pacientes estudiados / elegibles.", "Mide el acceso efectivo."], ["Gradabilidad", "Estudios con calidad suficiente / capturados.", "Detecta problemas de captura o dispositivo."], ["No gradables", "Porcentaje y causa registrada.", "Orienta reentrenamiento y ajustes técnicos."], ["Referibles", "% de estudios que activan derivación.", "Permite dimensionar la carga asistencial."], ["Tiempo a resultado", "Días desde captura hasta comunicación.", "Evalúa la oportunidad del circuito."], ["Tiempo a derivación", "Días desde resultado referible hasta turno.", "Evalúa el riesgo de pérdida de seguimiento."], ["Asistencia", "Referidos que efectivamente consultan.", "Mide el cierre del ciclo de cuidado."], ["Concordancia", "Acuerdo IA / operador / lector en muestra auditada.", "Evalúa la seguridad del sistema."], ["Eventos / incidentes", "Errores de lateralidad, identificación o derivación.", "Permite aprendizaje y mejora continua."]]
  });
  R.callout({
    title: "Meta del primer ciclo",
    body: "Antes de escalar, el efector debe demostrar que puede capturar imágenes gradables, comunicar resultados, derivar casos referibles y cerrar el seguimiento. Escalar sin calidad aumenta el riesgo."
  });

  // ---------------- 16 · Casos ----------------
  R.pagebreak();
  R.h1("16", "Casos", "Casos didácticos comentados");
  R.p("Los siguientes casos usan imágenes simuladas, pensadas para discusión en capacitación. En una implementación real deben complementarse con un banco de retinografías clínicas propias, anonimizadas y revisadas por especialistas. Para cada caso, preguntá: ¿la imagen es gradable?, ¿hay signos de retinopatía?, ¿la conducta es no referible, referible, urgente o no gradable?");
  caso(R, A + "q-gradable.jpg", "Caso 1", "Imagen gradable sin lesiones evidentes", R._fig, "No referible", "Conducta: no referible si el paciente no tiene síntomas y el protocolo de lectura confirma la ausencia de lesiones. Repetir tamizaje según el intervalo definido.");
  caso(R, A + "fundus-moderada.jpg", "Caso 2", "RDNP moderada probable", R._ink, "Referible", "Conducta: referible programado o revisión especializada. El operador no necesita cerrar el grado exacto, pero sí reconocer que hay más que microaneurismas aislados.");
  caso(R, A + "fundus-maculo.jpg", "Caso 3", "Sospecha de maculopatía", R._ink, "Referible", "Conducta: derivar para evaluación oftalmológica / OCT. Los exudados cercanos a la fóvea no deben minimizarse.");
  caso(R, A + "fundus-prolif.jpg", "Caso 4", "Sospecha proliferativa", R._urgInk, "Urgente", "Conducta: derivación urgente. La presencia de neovasos o hemorragia vítrea / prerretinal cambia la prioridad.");

  // ---------------- 17 · Apéndices ----------------
  R.pagebreak();
  R.h1("17", "Apéndices", "Apéndices operativos");
  R.h2("17.1 · Checklist de captura");
  R.dtable({
    head: ["Paso", "Verificación"],
    widthsPct: [0.24, 0.76],
    kcol: true,
    rows: [["Identificación", "Confirmar paciente, fecha, ojo derecho/izquierdo y operador."], ["Consentimiento", "Explicar que es tamizaje y que no reemplaza la consulta oftalmológica si hay síntomas."], ["Datos mínimos", "Tipo de diabetes, años de evolución, HbA1c si está disponible, presión arterial, embarazo, síntomas, último control ocular."], ["Captura", "Obtener imágenes de ambos ojos según el protocolo del equipo."], ["Calidad", "Revisar foco, centrado, exposición, visibilidad de mácula/papila y artefactos."], ["Repetición", "Repetir imágenes corregibles antes de cerrar el estudio."], ["Clasificación", "Registrar no referible, referible, urgente o no gradable."], ["Seguimiento", "Documentar comunicación, turno, asistencia y diagnóstico final si vuelve."]]
  });
  R.h2("17.2 · Guía rápida de conducta");
  R.dtable({
    head: ["Resultado", "Significado", "Conducta"],
    widthsPct: [0.2, 0.42, 0.38],
    kcol: true,
    rows: [[{
      text: "No referible",
      color: R._fig,
      b: true
    }, "No hay signos que obliguen a derivar en imágenes gradables.", "Control periódico y educación."], [{
      text: "Referible",
      color: R._ink,
      b: true
    }, "Lesiones sospechosas o maculares que requieren evaluación.", "Derivar y seguir hasta el cierre."], [{
      text: "Urgente",
      color: R._urgInk,
      b: true
    }, "Signos o síntomas que amenazan la visión.", "Activar el circuito rápido."], ["No gradable", "No se puede decidir con seguridad.", "Repetir o derivar; nunca cerrar como normal."]]
  });
  R.h2("17.3 · Pre-test / post-test sugerido");
  R.dtable({
    head: ["Pregunta", "Respuesta esperada"],
    widthsPct: [0.5, 0.5],
    kcol: true,
    rows: [["¿Una imagen no gradable equivale a normal?", "No. Es incertidumbre: requiere repetición o derivación."], ["¿Cuál es una lesión temprana típica?", "Microaneurisma."], ["¿Qué conducta corresponde ante neovasos?", "Derivación urgente."], ["¿Qué sugiere un exudado cerca de la fóvea?", "Maculopatía referible; derivar para evaluación / OCT."], ["¿La IA reemplaza al oftalmólogo?", "No. Apoya el tamizaje dentro de un circuito human-in-the-loop."], ["¿Qué registrar si un paciente es referible?", "Resultado, comunicación, turno/derivación y seguimiento."]]
  });
  R.h2("17.4 · Registro mínimo recomendado");
  R.dtable({
    head: ["Grupo", "Campos mínimos"],
    widthsPct: [0.24, 0.76],
    kcol: true,
    rows: [["Identificación", "ID paciente, nombre, documento/historia, fecha, operador, efector."], ["Contexto clínico", "Tipo de diabetes, años de evolución, HbA1c, TA, embarazo, nefropatía si se conoce."], ["Síntomas", "Visión borrosa, pérdida súbita, moscas volantes, destellos, dolor, otros."], ["Captura", "Equipo, ojo, campo, número de imágenes, dilatación si se usó."], ["Calidad", "Gradable / no gradable por ojo y motivo de mala calidad."], ["Resultado", "Salida Retinar / IA, lectura humana, categoría operativa."], ["Conducta", "No referible, repetir, derivación programada, urgente."], ["Cierre", "Turno, asistencia, diagnóstico final, tratamiento si se informa."]]
  });

  // ---------------- 18 · Bibliografía ----------------
  R.pagebreak();
  R.h1("18", "Bibliografía", "Bibliografía y fuentes sugeridas");
  R.refs(["American Diabetes Association Professional Practice Committee. Standards of Care in Diabetes—2026. Sección 12: Retinopathy, Neuropathy, and Foot Care. Diabetes Care. 2026.", "International Council of Ophthalmology. ICO Guidelines for Diabetic Eye Care. Actualizaciones y recursos de cuidado ocular diabético.", "Wilkinson CP, Ferris FL, Klein RE, et al. Proposed international clinical diabetic retinopathy and diabetic macular edema disease severity scales. Ophthalmology. 2003.", "NHS England. Diabetic Eye Screening Programme: grading definitions for referable disease. GOV.UK, actualizado 4 de diciembre de 2025.", "NHS England. Features-based grading outcomes guidance. GOV.UK, actualizado 4 de diciembre de 2025.", "NHS England. Diabetic eye screening: guidance on fundus image quality and when adequate images cannot be taken. GOV.UK.", "Ministerio de Salud de la Provincia de Buenos Aires / PRODIABA. Guía sobre complicaciones microvasculares de la diabetes. 2023.", "International Diabetes Federation. IDF Diabetes Atlas, 11.ª edición. 2025; datos por país para Argentina.", "Organización Panamericana de la Salud / OMS. Diabetes: datos y recursos técnicos.", "Early Treatment Diabetic Retinopathy Study Research Group. Photocoagulation for diabetic macular edema and diabetic retinopathy studies. Publicaciones ETDRS clásicas."]);
  R.callout({
    variant: "light",
    title: "Fuentes de imágenes",
    body: "Las figuras de este documento fueron generadas como esquemas didácticos simulados para capacitación. Para la versión clínica final se recomienda incorporar retinografías anonimizadas propias y/o imágenes de fuentes autorizadas, con la atribución correspondiente y revisión por oftalmología / retina."
  });

  // ---------------- Anexo editorial ----------------
  R.pagebreak();
  R.h1(null, "Anexo editorial", "Banco de imágenes recomendado");
  R.p("Para futuras versiones del material, se recomienda construir un banco visual curado por especialistas. Cada imagen debe incluir diagnóstico docente, grado, conducta, fuente, permiso de uso y una leyenda breve. No utilizar imágenes de pacientes sin anonimización ni autorización institucional.");
  R.dtable({
    head: ["Tipo de imagen", "Cantidad sugerida", "Objetivo docente"],
    widthsPct: [0.34, 0.18, 0.48],
    kcol: true,
    rows: [["Retina normal", "5–10", "Orientación anatómica y variación normal."], ["Mala calidad / no gradable", "10", "Entrenar repetición y conducta segura."], ["RDNP leve", "10", "Reconocer microaneurismas y lesiones mínimas."], ["RDNP moderada / severa", "15", "Entrenar referibilidad y la regla 4-2-1."], ["Maculopatía / edema sospechado", "10", "Entrenar derivación por lesiones cerca de la fóvea."], ["Proliferativa / urgente", "8–10", "Reconocer neovasos, hemorragia vítrea/prerretinal."], ["Hallazgos no diabéticos", "10", "Evitar la ceguera de tamizaje: glaucoma, AMD, oclusiones, papiledema."]]
  });
  R.callout({
    title: "Cierre",
    body: "Capturar una imagen no alcanza. Un programa de tamizaje sólo es seguro si combina imágenes de calidad, categorías claras, lectura competente, comunicación responsable y seguimiento efectivo. Retinar es parte de un circuito asistencial, no una prueba aislada."
  });
};

// case-study block helper
globalThis.caso = function caso(R, path, tag, title, tagColor, verdict, conducta) {
  R.h3(tag + " · " + title);
  R.figure({
    path,
    wmm: 92,
    eyebrow: tag,
    caption: title + ". Imagen didáctica simulada."
  });
  R.callout({
    variant: "light",
    title: "Conducta sugerida — " + verdict,
    body: conducta
  });
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "monografia/content.js", error: String((e && e.message) || e) }); }

// monografia/docxdoc.js
try { (() => {
/* ============================================================
   Retinar .docx — package assembler + DS components
   Assigned to globalThis.DOCXDOC. Requires globalThis.DOCXLIB.
   ============================================================ */
globalThis.DOCXDOC = function () {
  "use strict";

  const L = globalThis.DOCXLIB;
  const C = L.C,
    FONT = L.FONT,
    FB = L.FONT_BRAND;
  const mmEmu = L.mmToEmu,
    mmTw = L.mmToTwip;
  const {
    run,
    runs,
    para,
    table,
    tr,
    imageRun
  } = L;
  const CONTENT_MM = 174; // text column width (A4 210 - 18*2)
  const CONTENT_TW = mmTw(CONTENT_MM);

  // ---------------- package builder ----------------
  function createDoc(images, opts) {
    opts = opts || {};
    const body = []; // body XML fragments
    const media = []; // {name, bytes}
    const imgRels = []; // {id, target}
    const exts = new Set(["png", "jpeg", "rels", "xml"]);
    let imgN = 0,
      relN = 100;
    function regImg(path) {
      const im = images[path];
      if (!im) throw new Error("missing image: " + path);
      imgN++;
      let ext = (im.ext || path.split(".").pop()).toLowerCase();
      if (ext === "jpg") ext = "jpeg";
      exts.add(ext);
      const name = "image" + imgN + "." + ext;
      media.push({
        name: "word/media/" + name,
        bytes: im.bytes
      });
      const rid = "rIdImg" + ++relN;
      imgRels.push({
        id: rid,
        target: "media/" + name
      });
      return {
        rid,
        w: im.w,
        h: im.h
      };
    }
    function imgXml(path, targetWmm, opt) {
      opt = opt || {};
      const r = regImg(path);
      let wmm = targetWmm,
        hmm = wmm * (r.h / r.w);
      if (opt.maxHmm && hmm > opt.maxHmm) {
        hmm = opt.maxHmm;
        wmm = hmm * (r.w / r.h);
      }
      return imageRun(r.rid, mmEmu(wmm), mmEmu(hmm), opt.name);
    }
    function push(x) {
      if (x) body.push(x);
    }

    // ---------------- DS components ----------------
    const R = {
      raw: push,
      _imgXml: imgXml,
      // semantic color shortcuts (strictly black / white / acid)
      _fig: C.acidDeep2,
      _ink: C.ink,
      _urgInk: C.ink,
      _urg: C.charcoal,
      _ph: opts.placeholders !== false,
      // image placeholders ON by default

      // placeholder "image area" — a framed, dashed box sized wmm × hmm
      _phArea(wmm, hmm, note, dark) {
        const fill = dark ? "0E0E0E" : C.media;
        const bcol = dark ? "3A3A3A" : C.lineStrong;
        const acc = dark ? C.acid : C.acidDeep2;
        const inner = para(run("\u25A2  IMAGEN", {
          b: true,
          color: acc,
          sz: 14,
          track: 24
        }), {
          align: "center",
          spaceBefore: 0,
          spaceAfter: 20,
          line: 220,
          lineRule: "auto"
        }) + para(run(note || "Insertar retinografía clínica", {
          color: dark ? C.onDarkMuted : C.inkSubtle,
          sz: 13
        }), {
          align: "center",
          spaceBefore: 0,
          spaceAfter: 0,
          line: 196,
          lineRule: "auto"
        });
        const bdr = {
          sz: 8,
          color: bcol,
          val: "dashed"
        };
        const cell = {
          p: inner,
          shd: fill,
          valign: "center",
          margins: {
            top: 60,
            bottom: 60,
            left: 100,
            right: 100
          },
          borders: {
            top: bdr,
            bottom: bdr,
            left: bdr,
            right: bdr
          }
        };
        return table([tr([cell], {
          height: mmTw(hmm),
          hRule: "atLeast"
        })], {
          widthsPct: [1],
          borders: "none",
          align: "center",
          totalWidthTwip: mmTw(wmm)
        });
      },
      spacer(pt) {
        push(para("", {
          spaceBefore: 0,
          spaceAfter: 0,
          sz: pt ? pt * 2 : 12,
          line: pt ? pt * 20 : 120,
          lineRule: "exact"
        }));
      },
      pagebreak() {
        push(`<w:p><w:r><w:br w:type="page"/></w:r></w:p>`);
      },
      acidBar() {
        push(table([[{
          p: para("", {
            sz: 2,
            spaceBefore: 0,
            spaceAfter: 0,
            line: 50,
            lineRule: "exact"
          }),
          shd: C.acid,
          borders: {
            top: null,
            left: null,
            bottom: null,
            right: null
          },
          margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        }]], {
          totalWidthTwip: mmTw(15),
          widthsPct: [1],
          borders: "none",
          cellMargins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        }));
        push(para("", {
          sz: 6,
          spaceBefore: 0,
          spaceAfter: 0,
          line: 60,
          lineRule: "exact"
        }));
      },
      eyebrow(text) {
        push(para(run(String(text).toUpperCase(), {
          b: true,
          color: C.acidDeep2,
          sz: 15,
          track: 28,
          font: FONT
        }), {
          spaceBefore: 40,
          spaceAfter: 60
        }));
      },
      // chapter opener
      h1(num, eyebrow, title) {
        push(para("", {
          sz: 8,
          spaceBefore: 0,
          spaceAfter: 0,
          line: 80,
          lineRule: "exact"
        }));
        if (eyebrow) R.eyebrow(eyebrow);
        const parts = [];
        if (num) {
          parts.push(run(num, {
            b: true,
            color: C.acidDeep,
            sz: 46,
            font: FB
          }));
          parts.push(run("  ", {
            sz: 46
          }));
        }
        parts.push(run(title, {
          b: true,
          color: C.ink,
          sz: 42,
          track: -10
        }));
        push(para(parts.join(""), {
          spaceBefore: 20,
          spaceAfter: 80,
          line: 240,
          lineRule: "auto",
          keepNext: true
        }));
        R.acidBar();
      },
      h2(text) {
        push(para(run(text, {
          b: true,
          color: C.ink,
          sz: 27,
          track: -6
        }), {
          spaceBefore: 220,
          spaceAfter: 70,
          keepNext: true
        }));
      },
      h3(text) {
        push(para(run(text, {
          b: true,
          color: C.ink,
          sz: 22,
          track: -2
        }), {
          spaceBefore: 150,
          spaceAfter: 40,
          keepNext: true
        }));
      },
      p(content, o) {
        o = o || {};
        push(para(runs(content, {
          color: o.color || C.inkMuted,
          sz: o.sz || 21
        }), {
          spaceBefore: 0,
          spaceAfter: o.after != null ? o.after : 120,
          line: 276,
          lineRule: "auto",
          align: o.align
        }));
      },
      lead(text) {
        push(para(runs(text, {
          color: C.inkMuted,
          sz: 25
        }), {
          spaceBefore: 30,
          spaceAfter: 160,
          line: 288,
          lineRule: "auto"
        }));
      },
      bullets(items, o) {
        o = o || {};
        items.forEach(it => {
          push(para(run("\u25AA  ", {
            color: C.acidDeep,
            sz: 18,
            b: true
          }) + runs(it, {
            color: o.color || C.inkMuted,
            sz: o.sz || 20
          }), {
            ind: 200,
            hanging: 200,
            spaceBefore: 0,
            spaceAfter: 50,
            line: 264,
            lineRule: "auto"
          }));
        });
      },
      // KPI strip — items:[{n,c}]; variant 'light'(default)|'dark'
      kpis(items, variant) {
        const dark = variant === "dark";
        const cells = items.map(it => ({
          shd: dark ? C.charcoal : C.white,
          valign: "top",
          margins: {
            top: 130,
            bottom: 130,
            left: 150,
            right: 120
          },
          p: para(run(it.n, {
            b: true,
            color: dark ? C.acid : C.acidDeep,
            sz: 40,
            track: -12
          }), {
            spaceBefore: 0,
            spaceAfter: 30,
            line: 240,
            lineRule: "exact"
          }) + para(run(it.c, {
            color: dark ? C.onDarkMuted : C.inkMuted,
            sz: 15
          }), {
            spaceBefore: 0,
            spaceAfter: 0,
            line: 200,
            lineRule: "auto"
          })
        }));
        push(para("", {
          sz: 6,
          spaceAfter: 30,
          line: 60,
          lineRule: "exact"
        }));
        push(table([cells], {
          widthsPct: items.map(() => 1 / items.length),
          borders: {
            sz: 6,
            color: dark ? "3A3A3A" : C.line
          }
        }));
        push(para("", {
          sz: 8,
          spaceAfter: 60,
          line: 80,
          lineRule: "exact"
        }));
      },
      // callout — {title, body(runs|array of paragraph strings), variant}
      callout(o) {
        const dark = o.variant !== "light";
        const fill = dark ? C.charcoal : C.acidTint;
        const titleColor = dark ? C.acid : C.ink;
        const bodyColor = dark ? C.onDarkMuted : C.inkMuted;
        let inner = "";
        if (o.title) inner += para(run(o.title, {
          b: true,
          color: titleColor,
          sz: 22,
          track: -2
        }), {
          spaceBefore: 0,
          spaceAfter: 50,
          line: 248,
          lineRule: "auto"
        });
        const paras = Array.isArray(o.body) ? o.body : [o.body];
        paras.forEach((b, i) => {
          inner += para(runs(b, {
            color: bodyColor,
            sz: 19
          }), {
            spaceBefore: 0,
            spaceAfter: i === paras.length - 1 ? 0 : 60,
            line: 264,
            lineRule: "auto"
          });
        });
        push(para("", {
          sz: 6,
          spaceBefore: 60,
          spaceAfter: 0,
          line: 60,
          lineRule: "exact"
        }));
        push(table([[{
          p: inner,
          shd: fill,
          valign: "top",
          margins: {
            top: 150,
            bottom: 150,
            left: 200,
            right: 200
          },
          borders: {
            top: dark ? {
              sz: 6,
              color: "2A2A2A"
            } : {
              sz: 6,
              color: C.acidDeep
            },
            right: dark ? {
              sz: 6,
              color: "2A2A2A"
            } : {
              sz: 6,
              color: C.acidDeep
            },
            bottom: dark ? {
              sz: 6,
              color: "2A2A2A"
            } : {
              sz: 6,
              color: C.acidDeep
            },
            left: {
              sz: 30,
              color: C.acid
            }
          }
        }]], {
          widthsPct: [1],
          borders: "none"
        }));
        push(para("", {
          sz: 8,
          spaceBefore: 0,
          spaceAfter: 120,
          line: 80,
          lineRule: "exact"
        }));
      },
      // figure — single framed image OR placeholder + caption.  o:{path, wmm, eyebrow, caption, maxHmm, note}
      figure(o) {
        const wmm = o.wmm || 120;
        push(para("", {
          sz: 6,
          spaceBefore: 60,
          spaceAfter: 0,
          line: 60,
          lineRule: "exact"
        }));
        if (R._ph) {
          const hmm = o.maxHmm ? o.maxHmm : Math.round(wmm * 0.72);
          push(R._phArea(wmm + 8, hmm, o.note || o.caption, false));
        } else {
          const img = imgXml(o.path, wmm, {
            maxHmm: o.maxHmm
          });
          push(table([[{
            p: para(img, {
              align: "center",
              spaceBefore: 0,
              spaceAfter: 0,
              line: 240,
              lineRule: "auto"
            }),
            shd: C.media,
            valign: "center",
            margins: {
              top: 90,
              bottom: 90,
              left: 90,
              right: 90
            },
            borders: {
              top: {
                sz: 4,
                color: C.line
              },
              bottom: {
                sz: 4,
                color: C.line
              },
              left: {
                sz: 4,
                color: C.line
              },
              right: {
                sz: 4,
                color: C.line
              }
            }
          }]], {
            widthsPct: [1],
            borders: "none",
            align: o.align || "center",
            totalWidthTwip: mmTw((o.wmm || 120) + 8)
          }));
        }
        if (o.caption || o.eyebrow) {
          const cap = [];
          if (o.eyebrow) {
            cap.push(run(o.eyebrow.toUpperCase() + "  ", {
              b: true,
              color: C.acidDeep2,
              sz: 13,
              track: 20
            }));
          }
          cap.push(run(o.caption || "", {
            color: C.inkSubtle,
            sz: 15,
            i: false
          }));
          push(para(cap.join(""), {
            spaceBefore: 50,
            spaceAfter: 140,
            line: 220,
            lineRule: "auto",
            align: o.align || "center",
            indRight: o.align ? null : 0
          }));
        } else {
          push(para("", {
            sz: 8,
            spaceAfter: 120,
            line: 80,
            lineRule: "exact"
          }));
        }
      },
      // figGrid — cols + items:[{path,label,desc}]  (lesion atlas / quality matrix)
      figGrid(o) {
        const cols = o.cols || 3;
        const imgWmm = (CONTENT_MM - 6 * cols) / cols;
        const phH = Math.round((imgWmm - 8) * 0.72);
        const rows = [];
        for (let i = 0; i < o.items.length; i += cols) {
          const slice = o.items.slice(i, i + cols);
          const cells = slice.map(it => {
            const visual = R._ph ? R._phArea(imgWmm - 8, phH, it.label, false) : para(imgXml(it.path, imgWmm - 4, {}), {
              align: "center",
              spaceBefore: 0,
              spaceAfter: 0,
              line: 240,
              lineRule: "auto"
            });
            let inner = visual + para("", {
              sz: 6,
              spaceBefore: 0,
              spaceAfter: 0,
              line: 70,
              lineRule: "exact"
            });
            inner += para(run(it.label, {
              b: true,
              color: C.ink,
              sz: 17,
              track: -2
            }), {
              spaceBefore: 0,
              spaceAfter: 20,
              line: 220,
              lineRule: "auto"
            });
            if (it.desc) inner += para(run(it.desc, {
              color: C.inkMuted,
              sz: 14
            }), {
              spaceBefore: 0,
              spaceAfter: 0,
              line: 196,
              lineRule: "auto"
            });
            if (it.tag) inner = para(run(it.tag.toUpperCase(), {
              b: true,
              color: it.tagColor || C.acidDeep2,
              sz: 12,
              track: 16
            }), {
              spaceBefore: 0,
              spaceAfter: 24,
              line: 180,
              lineRule: "auto"
            }) + inner;
            return {
              p: inner,
              shd: C.white,
              valign: "top",
              margins: {
                top: 120,
                bottom: 120,
                left: 120,
                right: 120
              }
            };
          });
          while (cells.length < cols) cells.push({
            p: para("", {
              sz: 4
            }),
            shd: C.white
          });
          rows.push(cells);
        }
        push(para("", {
          sz: 6,
          spaceBefore: 60,
          spaceAfter: 30,
          line: 60,
          lineRule: "exact"
        }));
        push(table(rows, {
          widthsPct: new Array(cols).fill(1 / cols),
          borders: {
            sz: 6,
            color: C.line
          }
        }));
        push(para("", {
          sz: 8,
          spaceAfter: 30,
          line: 80,
          lineRule: "exact"
        }));
      },
      // flow — steps:[{n,t,d}], cols
      flow(o) {
        const cols = o.cols || o.steps.length;
        const rows = [];
        for (let i = 0; i < o.steps.length; i += cols) {
          const slice = o.steps.slice(i, i + cols);
          const cells = slice.map(s => {
            const isDark = s.shd === C.charcoal || s.shd === C.black || s.shd === "0E0E0E" || s.shd === "000000";
            const numColor = isDark ? C.acid : C.acidDeep;
            const titleColor = isDark ? C.onDark : C.ink;
            const descColor = isDark ? C.onDarkMuted : C.inkMuted;
            let inner = "";
            if (s.n != null) inner += para(run(String(s.n), {
              b: true,
              color: numColor,
              sz: 26,
              font: FB
            }), {
              spaceBefore: 0,
              spaceAfter: 24,
              line: 240,
              lineRule: "exact"
            });
            inner += para(run(s.t, {
              b: true,
              color: titleColor,
              sz: 17,
              track: -2
            }), {
              spaceBefore: 0,
              spaceAfter: s.d ? 24 : 0,
              line: 220,
              lineRule: "auto"
            });
            if (s.d) inner += para(run(s.d, {
              color: descColor,
              sz: 14
            }), {
              spaceBefore: 0,
              spaceAfter: 0,
              line: 196,
              lineRule: "auto"
            });
            return {
              p: inner,
              shd: s.shd || C.acidTint,
              valign: "top",
              margins: {
                top: 120,
                bottom: 120,
                left: 130,
                right: 120
              },
              borders: {
                top: {
                  sz: 4,
                  color: isDark ? C.charcoal : C.line
                },
                bottom: {
                  sz: 4,
                  color: isDark ? C.charcoal : C.line
                },
                left: {
                  sz: 4,
                  color: isDark ? C.charcoal : C.line
                },
                right: {
                  sz: 4,
                  color: isDark ? C.charcoal : C.line
                }
              }
            };
          });
          while (cells.length < cols) cells.push({
            p: para("", {
              sz: 4
            }),
            borders: {
              top: null,
              bottom: null,
              left: null,
              right: null
            }
          });
          rows.push(cells);
        }
        push(para("", {
          sz: 6,
          spaceBefore: 60,
          spaceAfter: 30,
          line: 60,
          lineRule: "exact"
        }));
        push(table(rows, {
          widthsPct: new Array(cols).fill(1 / cols),
          borders: "none"
        }));
        push(para("", {
          sz: 8,
          spaceAfter: 60,
          line: 80,
          lineRule: "exact"
        }));
      },
      // data table — head:[..], rows:[[cell..]], opts:{widthsPct, kcol(bold first col), zebra}
      dtable(o) {
        const head = o.head || null;
        const cols = head ? head.length : o.rows[0].length;
        const widths = o.widthsPct || new Array(cols).fill(1 / cols);
        const trs = [];
        if (head) {
          trs.push(tr(head.map(h => ({
            runs: {
              text: String(h).toUpperCase(),
              b: true,
              color: C.ink,
              sz: 14,
              track: 16
            },
            shd: C.acidTint,
            valign: "bottom",
            margins: {
              top: 90,
              bottom: 90,
              left: 120,
              right: 120
            },
            borders: {
              bottom: {
                sz: 18,
                color: C.acid
              },
              top: null,
              left: null,
              right: null
            }
          })), {
            header: true,
            cantSplit: true
          }));
        }
        o.rows.forEach((rrow, ri) => {
          const cells = rrow.map((cell, ci) => {
            const isObj = cell && typeof cell === "object" && !Array.isArray(cell);
            const txt = isObj ? cell : {
              runs: cell
            };
            const kcol = o.kcol && ci === 0;
            return {
              runs: txt.runs != null ? txt.runs : txt.text,
              b: txt.b != null ? txt.b : kcol,
              color: txt.color || (kcol ? C.ink : C.inkMuted),
              sz: txt.sz || 18,
              align: txt.align,
              span: txt.span,
              shd: txt.shd || (o.zebra && ri % 2 === 1 ? C.offwhite : null),
              valign: "top",
              margins: {
                top: 80,
                bottom: 80,
                left: 120,
                right: 120
              },
              borders: {
                bottom: {
                  sz: 4,
                  color: C.line
                },
                top: null,
                left: null,
                right: null
              }
            };
          });
          trs.push(tr(cells, {
            cantSplit: true
          }));
        });
        push(para("", {
          sz: 6,
          spaceBefore: 40,
          spaceAfter: 30,
          line: 60,
          lineRule: "exact"
        }));
        push(table(trs, {
          widthsPct: widths,
          borders: "none"
        }));
        push(para("", {
          sz: 8,
          spaceAfter: 80,
          line: 80,
          lineRule: "exact"
        }));
      },
      // toc — items:[{n,t}]
      toc(items) {
        items.forEach(it => {
          push(para(run(it.n != null ? it.n : "—", {
            b: true,
            color: C.acidDeep,
            sz: 19,
            font: FB
          }) + run("\t", {
            sz: 19
          }) + run(it.t, {
            color: C.ink,
            sz: 19
          }), {
            tabs: [{
              pos: 360,
              val: "left"
            }],
            ind: 360,
            hanging: 360,
            spaceBefore: 0,
            spaceAfter: 0,
            line: 360,
            lineRule: "auto",
            border: {
              bottom: {
                sz: 4,
                color: C.line,
                space: 4
              }
            }
          }));
        });
      },
      refs(items) {
        items.forEach((it, i) => {
          push(para(run("[" + (i + 1) + "]  ", {
            b: true,
            color: C.acidDeep,
            sz: 15
          }) + run(it, {
            color: C.inkMuted,
            sz: 15
          }), {
            ind: 300,
            hanging: 300,
            spaceBefore: 0,
            spaceAfter: 60,
            line: 224,
            lineRule: "auto"
          }));
        });
      },
      // ---------------- build package ----------------
      build(buildOpts) {
        buildOpts = buildOpts || {};
        function anchoredImg(rid, wEmu, hEmu, behind, name, id) {
          const A = "http://schemas.openxmlformats.org/drawingml/2006/main";
          return `<w:r><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${behind ? 0 : 5}" behindDoc="${behind ? 1 : 0}" locked="0" layoutInCell="1" allowOverlap="1">` + `<wp:simplePos x="0" y="0"/>` + `<wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH>` + `<wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>` + `<wp:extent cx="${wEmu}" cy="${hEmu}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>` + `<wp:wrapNone/><wp:docPr id="${id}" name="${name}"/>` + `<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${A}" noChangeAspect="1"/></wp:cNvGraphicFramePr>` + `<a:graphic xmlns:a="${A}"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` + `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr>` + `<pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${wEmu}" cy="${hEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` + `</pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>`;
        }

        // cover — section 1: full-bleed anchored background + native editable content
        let coverPara = "";
        if (buildOpts.cover) {
          const cv = buildOpts.cover;
          const Wt = mmTw(210),
            Ht = mmTw(297);
          const coverSect = `<w:sectPr><w:pgSz w:w="${Wt}" w:h="${Ht}"/>` + `<w:pgMar w:top="${mmTw(20)}" w:right="${mmTw(17)}" w:bottom="${mmTw(13)}" w:left="${mmTw(17)}" w:header="0" w:footer="0" w:gutter="0"/>` + `<w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>`;
          const cw = mmTw(176);
          const bg = regImg(cv.bgPath);
          const bgRun = anchoredImg(bg.rid, mmEmu(210), mmEmu(297), true, "Fondo portada", 901);

          // logo (anchor lives in this first paragraph)
          let logoRun = "";
          if (cv.logoPath) {
            const lg = regImg(cv.logoPath);
            const lw = mmEmu(43);
            logoRun = imageRun(lg.rid, lw, Math.round(lw * (lg.h / lg.w)), "Retinar");
          }
          coverPara += para(bgRun + logoRun, {
            spaceBefore: 0,
            spaceAfter: 60,
            line: 240,
            lineRule: "auto"
          });

          // eyebrow
          coverPara += para(run((cv.eyebrow || "").toUpperCase(), {
            b: true,
            color: C.acid,
            sz: 17,
            track: 34
          }), {
            spaceBefore: 200,
            spaceAfter: 70
          });
          // title (segments, mark=highlight)
          const titleRuns = cv.title.map(s => s.mark ? run(s.t, {
            b: true,
            color: C.black,
            sz: 58,
            shd: C.acid,
            track: -12
          }) : run(s.t, {
            b: true,
            color: C.onDark,
            sz: 58,
            track: -14
          })).join("");
          coverPara += para(titleRuns, {
            spaceBefore: 0,
            spaceAfter: 120,
            line: 256,
            lineRule: "auto"
          });
          // subtitle
          if (cv.subtitle) coverPara += para(run(cv.subtitle, {
            color: C.onDarkMuted,
            sz: 22
          }), {
            spaceBefore: 0,
            spaceAfter: 150,
            line: 300,
            lineRule: "auto"
          });
          // fundus framed (or placeholder)
          if (cv.fundusPath || cv.fundusPlaceholder) {
            const fw = 100;
            if (R._ph) {
              coverPara += R._phArea(fw + 6, 56, "Retinografía de portada", true);
            } else {
              coverPara += table([[{
                p: para(imgXml(cv.fundusPath, fw, {}), {
                  align: "center",
                  spaceBefore: 0,
                  spaceAfter: 0,
                  line: 240,
                  lineRule: "auto"
                }),
                shd: C.charcoal,
                valign: "center",
                margins: {
                  top: 70,
                  bottom: 70,
                  left: 70,
                  right: 70
                },
                borders: {
                  top: {
                    sz: 8,
                    color: C.acidDeep
                  },
                  bottom: {
                    sz: 8,
                    color: C.acidDeep
                  },
                  left: {
                    sz: 8,
                    color: C.acidDeep
                  },
                  right: {
                    sz: 8,
                    color: C.acidDeep
                  }
                }
              }]], {
                widthsPct: [1],
                borders: "none",
                align: "center",
                totalWidthTwip: mmTw(fw + 6)
              });
            }
            coverPara += para("", {
              sz: 8,
              spaceAfter: 60,
              line: 80,
              lineRule: "exact"
            });
          }
          // KPI dark band
          if (cv.kpis) {
            const cells = cv.kpis.map(it => ({
              shd: "111111",
              valign: "top",
              margins: {
                top: 110,
                bottom: 110,
                left: 130,
                right: 110
              },
              p: para(run(it.n, {
                b: true,
                color: C.acid,
                sz: 40,
                track: -12
              }), {
                spaceBefore: 0,
                spaceAfter: 30,
                line: 240,
                lineRule: "exact"
              }) + para(run(it.c, {
                color: C.onDarkMuted,
                sz: 14
              }), {
                spaceBefore: 0,
                spaceAfter: 0,
                line: 196,
                lineRule: "auto"
              })
            }));
            coverPara += table([cells], {
              widthsPct: cv.kpis.map(() => 1 / cv.kpis.length),
              borders: {
                sz: 6,
                color: "333333"
              },
              totalWidthTwip: cw
            });
            coverPara += para("", {
              sz: 8,
              spaceAfter: 60,
              line: 80,
              lineRule: "exact"
            });
          }
          // meta line (carries the cover section properties)
          const metaRuns = (cv.meta || []).map((m, i) => run(m.lab.toUpperCase() + "  ", {
            b: true,
            color: C.acid,
            sz: 13,
            track: 20
          }) + run(m.val + (i < cv.meta.length - 1 ? "      " : ""), {
            color: C.onDarkMuted,
            sz: 15
          })).join("");
          coverPara += `<w:p><w:pPr><w:spacing w:before="120" w:after="0" w:line="240" w:lineRule="auto"/>` + `<w:pBdr><w:top w:val="single" w:sz="4" w:space="8" w:color="2A2A2A"/></w:pBdr>` + `<w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}"/></w:rPr>${coverSect}</w:pPr>${metaRuns}</w:p>`;
        }
        const bodyXml = coverPara + body.join("") + sectPr({
          cover: false
        });
        const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ` + `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ` + `xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ` + `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ` + `xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" ` + `xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" ` + `xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" ` + `xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" ` + `mc:Ignorable="w14 wp14">` + `<w:body>${bodyXml}</w:body></w:document>`;

        // ----- static parts -----
        const enc = new TextEncoder();
        const files = [];
        const add = (name, str) => files.push({
          name,
          data: enc.encode(str)
        });

        // content types
        let defaults = "";
        ["rels", "xml", "png", "jpeg"].forEach(e => {
          const ct = e === "rels" ? "application/vnd.openxmlformats-package.relationships+xml" : e === "xml" ? "application/xml" : e === "png" ? "image/png" : "image/jpeg";
          defaults += `<Default Extension="${e}" ContentType="${ct}"/>`;
        });
        const ctXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` + defaults + `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` + `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` + `<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>` + `<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>` + `<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>` + `<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>` + `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` + `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>` + `</Types>`;
        add("[Content_Types].xml", ctXml);
        add("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` + `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` + `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` + `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>` + `</Relationships>`);

        // document rels: styles, settings, numbering, header, footer, images
        let drels = `<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` + `<Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>` + `<Relationship Id="rIdNum" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>` + `<Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>` + `<Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>`;
        imgRels.forEach(ir => {
          drels += `<Relationship Id="${ir.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${ir.target}"/>`;
        });
        add("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drels}</Relationships>`);
        add("word/document.xml", documentXml);
        add("word/styles.xml", stylesXml());
        add("word/settings.xml", settingsXml());
        add("word/numbering.xml", numberingXml());
        add("word/header1.xml", headerXml(opts));
        add("word/footer1.xml", footerXml(opts));
        add("docProps/core.xml", coreXml(opts));
        add("docProps/app.xml", appXml(opts));
        media.forEach(m => files.push({
          name: m.name,
          data: m.bytes
        }));
        return L.zipStore(files);
      }
    };
    return R;
  }

  // ---------------- section properties ----------------
  function sectPr(o) {
    const W = mmTw(210),
      H = mmTw(297);
    if (o.cover) {
      return `<w:sectPr><w:pgSz w:w="${W}" w:h="${H}"/>` + `<w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/>` + `<w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>`;
    }
    const m = {
      top: mmTw(20),
      bottom: mmTw(18),
      left: mmTw(18),
      right: mmTw(18),
      header: mmTw(11),
      footer: mmTw(10)
    };
    return `<w:sectPr>` + `<w:headerReference w:type="default" r:id="rIdHeader"/>` + `<w:footerReference w:type="default" r:id="rIdFooter"/>` + `<w:pgSz w:w="${W}" w:h="${H}"/>` + `<w:pgMar w:top="${m.top}" w:right="${m.right}" w:bottom="${m.bottom}" w:left="${m.left}" w:header="${m.header}" w:footer="${m.footer}" w:gutter="0"/>` + `<w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>`;
  }

  // ---------------- header / footer ----------------
  function headerXml(opts) {
    const brand = run("retin", {
      b: true,
      color: C.ink,
      sz: 18,
      font: FB
    }) + run("ar", {
      b: true,
      color: C.acidDeep,
      sz: 18,
      font: FB
    });
    const right = run(opts.headerRight || "Tamizaje de retinopatía diabética", {
      color: C.inkSubtle,
      sz: 14,
      track: 18,
      caps: true
    });
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` + para(brand + run("\t", {}) + right, {
      tabs: [{
        pos: CONTENT_TW,
        val: "right"
      }],
      spaceBefore: 0,
      spaceAfter: 0,
      line: 240,
      lineRule: "auto",
      border: {
        bottom: {
          sz: 4,
          color: C.line,
          space: 6
        }
      }
    }) + `</w:hdr>`;
  }
  function footerXml(opts) {
    const left = run(opts.footerLeft || "Retinar · Material de capacitación · v1.0 — Junio 2026", {
      color: C.inkFaint,
      sz: 13,
      track: 8
    });
    const pg = run("\t", {}) + `<w:r><w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}"/><w:b/><w:color w:val="${C.inkMuted}"/><w:sz w:val="15"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>` + `<w:r><w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}"/><w:b/><w:color w:val="${C.inkMuted}"/><w:sz w:val="15"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>` + `<w:r><w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}"/><w:b/><w:color w:val="${C.inkMuted}"/><w:sz w:val="15"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` + para(left + pg, {
      tabs: [{
        pos: CONTENT_TW,
        val: "right"
      }],
      spaceBefore: 0,
      spaceAfter: 0,
      line: 240,
      lineRule: "auto",
      border: {
        top: {
          sz: 4,
          color: C.line,
          space: 6
        }
      }
    }) + `</w:ftr>`;
  }

  // ---------------- styles / settings / numbering / props ----------------
  function stylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` + `<w:docDefaults><w:rPrDefault><w:rPr>` + `<w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}" w:cs="${FONT}" w:eastAsia="${FONT}"/>` + `<w:color w:val="${C.ink}"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="es-AR"/>` + `</w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` + `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>` + `<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/></w:style>` + `<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>` + `</w:styles>`;
  }
  function settingsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` + `<w:zoom w:percent="100"/><w:defaultTabStop w:val="708"/>` + `<w:characterSpacingControl w:val="doNotCompress"/>` + `<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat>` + `<w:themeFontLang w:val="es-AR"/></w:settings>`;
  }
  function numberingXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` + `<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>` + `<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u25AA"/><w:lvlJc w:val="left"/>` + `<w:pPr><w:ind w:left="360" w:hanging="240"/></w:pPr>` + `<w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}"/><w:color w:val="${C.acidDeep}"/></w:rPr></w:lvl>` + `</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;
  }
  function coreXml(opts) {
    const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` + `<dc:title>${L.esc(opts.title || "Monografía de capacitación — Retinar")}</dc:title>` + `<dc:creator>Retinar</dc:creator><cp:lastModifiedBy>Retinar</cp:lastModifiedBy>` + `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>` + `<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
  }
  function appXml(opts) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` + `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Retinar Docs</Application><Company>Retinar</Company></Properties>`;
  }
  return {
    createDoc,
    CONTENT_MM,
    CONTENT_TW
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "monografia/docxdoc.js", error: String((e && e.message) || e) }); }

// monografia/docxlib.js
try { (() => {
/* ============================================================
   Minimal OOXML (.docx) builder — Retinar Design System
   Assigned to globalThis.DOCXLIB. Eval this file in run_script.
   ============================================================ */
globalThis.DOCXLIB = function () {
  "use strict";

  // ---------- palette (hex without #) ----------
  const C = {
    acid: "CEF71F",
    acidDeep: "84AA00",
    // acid as text/accent on light
    acidDeep2: "6E8F00",
    ink: "060606",
    inkMuted: "454545",
    inkSubtle: "767676",
    inkFaint: "9A9A9A",
    white: "FFFFFF",
    offwhite: "FAFAFA",
    black: "000000",
    charcoal: "0E0E0E",
    line: "DBDBDB",
    lineStrong: "BFBFBF",
    media: "F3F5F2",
    acidTint: "F2FBCF",
    // pale acid for table header bands
    acidTint2: "EAF6BE",
    chipBg: "E7EDCF",
    chipInk: "28320F",
    onDark: "FAFAFA",
    onDarkMuted: "C9CBC4"
  };
  const FONT = "IBM Plex Sans";
  const FONT_BRAND = "Encode Sans";

  // ---------- xml escape ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---------- units ----------
  const EMU_PER_MM = 36000;
  const TWIP_PER_MM = 1440 / 25.4;
  const mmToEmu = mm => Math.round(mm * EMU_PER_MM);
  const mmToTwip = mm => Math.round(mm * TWIP_PER_MM);

  // ============================================================
  //  RUNS
  // ============================================================
  // run opts: {b,i,color,sz(half-pt),font,caps,track(20ths pt),sup,sub,break,shd,highlightHex}
  function run(text, o) {
    o = o || {};
    let rpr = "";
    if (o.b) rpr += "<w:b/><w:bCs/>";
    if (o.i) rpr += "<w:i/>";
    if (o.caps) rpr += "<w:caps/>";
    if (o.track != null) rpr += `<w:spacing w:val="${o.track}"/>`;
    if (o.sup) rpr += `<w:vertAlign w:val="superscript"/>`;
    if (o.sub) rpr += `<w:vertAlign w:val="subscript"/>`;
    if (o.shd) rpr += `<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>`;
    const font = o.font || FONT;
    rpr += `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>`;
    if (o.color) rpr += `<w:color w:val="${o.color}"/>`;
    if (o.sz) rpr += `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`;
    let inner = "";
    if (o.break) inner += "<w:br/>";
    inner += `<w:t xml:space="preserve">${esc(text)}</w:t>`;
    return `<w:r>${rpr ? "<w:rPr>" + rpr + "</w:rPr>" : ""}${inner}</w:r>`;
  }
  // normalize runs input: string | runObj | array
  function runs(input, base) {
    base = base || {};
    if (input == null) return "";
    if (typeof input === "string") return run(input, base);
    if (Array.isArray(input)) return input.map(x => {
      if (typeof x === "string") return run(x, base);
      return run(x.text, Object.assign({}, base, x));
    }).join("");
    return run(input.text, Object.assign({}, base, input));
  }

  // ============================================================
  //  PARAGRAPH
  // ============================================================
  // opts: {align,spaceBefore,spaceAfter,line,lineRule,ind,indFirst,hanging,
  //        keepNext,shd,border:{}, sectPr, tabs:[{pos,val,leader}], contextualSpacing,
  //        bg, color(default run color), sz, font, b, outline(heading level)}
  function para(children, o) {
    o = o || {};
    let ppr = "";
    const spc = [];
    if (o.spaceBefore != null) spc.push(`w:before="${o.spaceBefore}"`);
    if (o.spaceAfter != null) spc.push(`w:after="${o.spaceAfter}"`);
    if (o.line != null) {
      spc.push(`w:line="${o.line}"`);
      spc.push(`w:lineRule="${o.lineRule || "auto"}"`);
    }
    if (o.keepNext) ppr += "<w:keepNext/>";
    if (o.keepLines) ppr += "<w:keepLines/>";
    if (o.outline != null) ppr += `<w:outlineLvl w:val="${o.outline}"/>`;
    if (o.shd) ppr += `<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>`;
    if (o.border) {
      const b = o.border;
      let bx = "";
      ["top", "left", "bottom", "right"].forEach(s => {
        if (b[s]) bx += `<w:${s} w:val="single" w:sz="${b[s].sz || 4}" w:space="${b[s].space != null ? b[s].space : 0}" w:color="${b[s].color || "auto"}"/>`;
      });
      if (bx) ppr += `<w:pBdr>${bx}</w:pBdr>`;
    }
    let indAttrs = "";
    if (o.ind != null) indAttrs += ` w:left="${o.ind}"`;
    if (o.indRight != null) indAttrs += ` w:right="${o.indRight}"`;
    if (o.indFirst != null) indAttrs += ` w:firstLine="${o.indFirst}"`;
    if (o.hanging != null) indAttrs += ` w:hanging="${o.hanging}"`;
    if (indAttrs) ppr += `<w:ind${indAttrs}/>`;
    if (o.tabs) {
      ppr += "<w:tabs>" + o.tabs.map(t => `<w:tab w:val="${t.val || "left"}" ${t.leader ? `w:leader="${t.leader}" ` : ""}w:pos="${t.pos}"/>`).join("") + "</w:tabs>";
    }
    if (o.contextualSpacing) ppr += "<w:contextualSpacing/>";
    if (spc.length) ppr += `<w:spacing ${spc.join(" ")}/>`;
    if (o.align) ppr += `<w:jc w:val="${o.align}"/>`;
    // paragraph-mark run props (affects default run formatting + line height of empty paras)
    let rpr = "";
    const dfont = o.font || FONT;
    rpr += `<w:rFonts w:ascii="${dfont}" w:hAnsi="${dfont}" w:cs="${dfont}"/>`;
    if (o.b) rpr += "<w:b/>";
    if (o.color) rpr += `<w:color w:val="${o.color}"/>`;
    if (o.sz) rpr += `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`;
    if (rpr) ppr += `<w:rPr>${rpr}</w:rPr>`;
    if (o.sectPr) ppr += o.sectPr;
    // children is already-built raw inline XML (runs). Empty string => empty paragraph.
    const body = children == null ? "" : children;
    return `<w:p>${ppr ? "<w:pPr>" + ppr + "</w:pPr>" : ""}${body}</w:p>`;
  }

  // ============================================================
  //  IMAGE  (inline)
  // ============================================================
  let _imgId = 1000;
  function imageRun(rId, wEmu, hEmu, name) {
    const id = ++_imgId;
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">` + `<wp:extent cx="${wEmu}" cy="${hEmu}"/>` + `<wp:effectExtent l="0" t="0" r="0" b="0"/>` + `<wp:docPr id="${id}" name="${esc(name || "img" + id)}"/>` + `<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>` + `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` + `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` + `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` + `<pic:nvPicPr><pic:cNvPr id="${id}" name="${esc(name || "img" + id)}"/><pic:cNvPicPr/></pic:nvPicPr>` + `<pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${wEmu}" cy="${hEmu}"/></a:xfrm>` + `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` + `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  }

  // ============================================================
  //  TABLE
  // ============================================================
  // cell: { runs|text|p(rawParagraphsXML), shd, span(gridSpan), vMerge, valign, b, color, sz, align, margins:{},
  //         borders:{}, font, noWrap }
  // table opts: { widthsPct:[..], totalWidthTwip, borders, look }
  function cellPara(cell) {
    if (cell.p) return cell.p; // raw paragraphs
    const inner = cell.xml != null ? cell.xml // already-built inline run XML
    : cell.runs != null ? runs(cell.runs, {
      b: cell.b,
      color: cell.color,
      sz: cell.sz,
      font: cell.font
    }) : runs(cell.text || "", {
      b: cell.b,
      color: cell.color,
      sz: cell.sz,
      font: cell.font
    });
    return para(inner, {
      align: cell.align,
      sz: cell.sz,
      color: cell.color,
      b: cell.b,
      font: cell.font,
      spaceBefore: cell.spaceBefore != null ? cell.spaceBefore : 0,
      spaceAfter: cell.spaceAfter != null ? cell.spaceAfter : 0,
      line: cell.line || 252,
      lineRule: "auto"
    });
  }
  function tcPr(cell, wTwip) {
    let s = "";
    if (wTwip != null) s += `<w:tcW w:w="${wTwip}" w:type="dxa"/>`;else s += `<w:tcW w:w="0" w:type="auto"/>`;
    if (cell.span) s += `<w:gridSpan w:val="${cell.span}"/>`;
    if (cell.vMerge) s += `<w:vMerge w:val="${cell.vMerge === true ? "continue" : cell.vMerge}"/>`;
    if (cell.borders) {
      const b = cell.borders;
      let bx = "";
      ["top", "left", "bottom", "right"].forEach(side => {
        const v = b[side];
        if (v === null) bx += `<w:${side} w:val="nil"/>`;else if (v) bx += `<w:${side} w:val="${v.val || "single"}" w:sz="${v.sz || 4}" w:space="0" w:color="${v.color || "auto"}"/>`;
      });
      if (bx) s += `<w:tcBorders>${bx}</w:tcBorders>`;
    }
    if (cell.shd) s += `<w:shd w:val="clear" w:color="auto" w:fill="${cell.shd}"/>`;
    const m = cell.margins;
    if (m) {
      s += "<w:tcMar>";
      ["top", "left", "bottom", "right"].forEach(side => {
        if (m[side] != null) s += `<w:${side} w:w="${m[side]}" w:type="dxa"/>`;
      });
      s += "</w:tcMar>";
    }
    if (cell.noWrap) s += "<w:noWrap/>";
    s += `<w:vAlign w:val="${cell.valign || "top"}"/>`;
    return `<w:tcPr>${s}</w:tcPr>`;
  }
  function tcell(cell, wTwip) {
    const paras = cell.p ? cell.p : cellPara(cell);
    return `<w:tc>${tcPr(cell, wTwip)}${paras}</w:tc>`;
  }
  function trow(cells, widths, o) {
    o = o || {};
    let trPr = "";
    if (o.header) trPr += "<w:tblHeader/>";
    if (o.cantSplit) trPr += "<w:cantSplit/>";
    if (o.height) trPr += `<w:trHeight w:val="${o.height}" w:hRule="${o.hRule || "atLeast"}"/>`;
    let wi = 0;
    const tcs = cells.map(c => {
      const span = c.span || 1;
      let w = 0;
      for (let k = 0; k < span; k++) w += widths[wi + k] || 0;
      wi += span;
      return tcell(c, w);
    }).join("");
    return `<w:tr>${trPr ? "<w:trPr>" + trPr + "</w:trPr>" : ""}${tcs}</w:tr>`;
  }
  function table(rows, o) {
    o = o || {};
    const total = o.totalWidthTwip || mmToTwip(174);
    const pct = o.widthsPct || rows[0].map(() => 1 / rows[0].length);
    const widths = pct.map(p => Math.round(p * total));
    // table borders
    let borders = "";
    const bdef = o.borders;
    if (bdef === "none") {
      ["top", "left", "bottom", "right", "insideH", "insideV"].forEach(s => borders += `<w:${s} w:val="nil"/>`);
    } else {
      const def = Object.assign({
        sz: 4,
        color: C.line,
        insideH: {
          sz: 4,
          color: C.line
        },
        insideV: {
          sz: 4,
          color: C.line
        }
      }, bdef || {});
      const line = v => v === null ? "nil" : "single";
      const mk = (side, v) => v === null ? `<w:${side} w:val="nil"/>` : `<w:${side} w:val="single" w:sz="${v.sz || 4}" w:space="0" w:color="${v.color || C.line}"/>`;
      borders += mk("top", def.top !== undefined ? def.top : {
        sz: def.sz,
        color: def.color
      });
      borders += mk("left", def.left !== undefined ? def.left : {
        sz: def.sz,
        color: def.color
      });
      borders += mk("bottom", def.bottom !== undefined ? def.bottom : {
        sz: def.sz,
        color: def.color
      });
      borders += mk("right", def.right !== undefined ? def.right : {
        sz: def.sz,
        color: def.color
      });
      borders += mk("insideH", def.insideH !== undefined ? def.insideH : {
        sz: def.sz,
        color: def.color
      });
      borders += mk("insideV", def.insideV !== undefined ? def.insideV : {
        sz: def.sz,
        color: def.color
      });
    }
    const grid = "<w:tblGrid>" + widths.map(w => `<w:gridCol w:w="${w}"/>`).join("") + "</w:tblGrid>";
    const defMar = o.cellMargins || {
      top: 60,
      bottom: 60,
      left: 110,
      right: 110
    };
    const tblPr = `<w:tblPr>` + `<w:tblW w:w="${total}" w:type="dxa"/>` + (o.align ? `<w:jc w:val="${o.align}"/>` : "") + `<w:tblBorders>${borders}</w:tblBorders>` + `<w:tblCellMar>` + `<w:top w:w="${defMar.top}" w:type="dxa"/><w:left w:w="${defMar.left}" w:type="dxa"/>` + `<w:bottom w:w="${defMar.bottom}" w:type="dxa"/><w:right w:w="${defMar.right}" w:type="dxa"/>` + `</w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>`;
    const body = rows.map(r => {
      const ro = r.__opts || {};
      const cells = r.__opts ? r.cells : r;
      return trow(cells, widths, ro);
    }).join("");
    return `${tblPr ? "<w:tbl>" + tblPr + grid + body + "</w:tbl>" : ""}`;
  }
  function tr(cells, opts) {
    return {
      __opts: opts || {},
      cells
    };
  }

  // ============================================================
  //  ZIP (store, no compression) + CRC32
  // ============================================================
  const _crcTable = function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  }();
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = _crcTable[(c ^ buf[i]) & 0xFF] ^ c >>> 8;
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  const enc = new TextEncoder();
  function zipStore(files) {
    // files: [{name, data:Uint8Array}]
    const chunks = [];
    const central = [];
    let offset = 0;
    function u16(n) {
      return [n & 0xFF, n >>> 8 & 0xFF];
    }
    function u32(n) {
      return [n & 0xFF, n >>> 8 & 0xFF, n >>> 16 & 0xFF, n >>> 24 & 0xFF];
    }
    for (const f of files) {
      const nameBytes = enc.encode(f.name);
      const data = f.data;
      const crc = crc32(data);
      const local = [].concat(u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0));
      const localHeader = new Uint8Array(local);
      chunks.push(localHeader, nameBytes, data);
      const localSize = localHeader.length + nameBytes.length + data.length;
      const cen = [].concat(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset));
      central.push(new Uint8Array(cen), nameBytes);
      offset += localSize;
    }
    let centralSize = 0;
    central.forEach(c => centralSize += c.length);
    const centralOffset = offset;
    const end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralSize), u32(centralOffset), u16(0)));
    const all = [].concat(chunks, central, [end]);
    let totalLen = 0;
    all.forEach(c => totalLen += c.length);
    const out = new Uint8Array(totalLen);
    let p = 0;
    for (const c of all) {
      out.set(c, p);
      p += c.length;
    }
    return out;
  }
  return {
    C,
    FONT,
    FONT_BRAND,
    esc,
    mmToEmu,
    mmToTwip,
    run,
    runs,
    para,
    table,
    tr,
    imageRun,
    zipStore,
    crc32
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "monografia/docxlib.js", error: String((e && e.message) || e) }); }

// monografia/preview-adapter.js
try { (() => {
/* HTML preview adapter — mirrors the DOCXDOC R interface so we can render
   the exact same content.js into an A4 HTML preview for visual verification. */
(function () {
  const A = "assets/";
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // runs: string | {text,b,i,color,...} | array
  function runs(input) {
    if (input == null) return "";
    if (typeof input === "string") return esc(input);
    if (Array.isArray(input)) return input.map(runs).join("");
    let s = esc(input.text || "");
    let st = "";
    if (input.color) st += `color:${hex(input.color)};`;
    if (input.b) s = `<strong>${s}</strong>`;
    if (input.i) s = `<em>${s}</em>`;
    return st ? `<span style="${st}">${s}</span>` : s;
  }
  function hex(c) {
    if (!c) return "inherit";
    if (c[0] === "#") return c;
    return "#" + c;
  }
  const out = [];
  function pushSec(html) {
    out.push(html);
  }
  let chapterOpen = false,
    buf = [];
  function flush() {
    if (buf.length) {
      out.push(`<section class="page"><div class="pad">${buf.join("\n")}</div></section>`);
      buf = [];
    }
  }
  function w(html) {
    buf.push(html);
  }
  const R = {
    _fig: "6E8F00",
    _ink: "060606",
    _urgInk: "060606",
    _urg: "0E0E0E",
    _ph: false,
    raw() {},
    spacer() {},
    pagebreak() {
      flush();
    },
    acidBar() {
      w(`<div class="acidbar"></div>`);
    },
    eyebrow(t) {
      w(`<div class="eyebrow">${esc(String(t).toUpperCase())}</div>`);
    },
    h1(num, eye, title) {
      flush();
      let h = `<div class="h1block">`;
      if (eye) h += `<div class="eyebrow">${esc(String(eye).toUpperCase())}</div>`;
      h += `<h1>`;
      if (num) h += `<span class="h1num">${esc(num)}</span> `;
      h += `${esc(title)}</h1><div class="acidbar"></div></div>`;
      w(h);
    },
    h2(t) {
      w(`<h2>${esc(t)}</h2>`);
    },
    h3(t) {
      w(`<h3>${esc(t)}</h3>`);
    },
    p(c, o) {
      o = o || {};
      w(`<p${o.align ? ` style="text-align:${o.align}"` : ""}>${runs(c)}</p>`);
    },
    lead(t) {
      w(`<p class="lead">${runs(t)}</p>`);
    },
    bullets(items) {
      w(`<ul>` + items.map(it => `<li>${runs(it)}</li>`).join("") + `</ul>`);
    },
    kpis(items, variant) {
      const dark = variant === "dark";
      w(`<div class="kpis${dark ? " dark" : ""}">` + items.map(it => `<div class="kpi"><div class="kn">${esc(it.n)}</div><div class="kc">${esc(it.c)}</div></div>`).join("") + `</div>`);
    },
    callout(o) {
      const dark = o.variant !== "light";
      let h = `<div class="callout${dark ? " dark" : " light"}">`;
      if (o.title) h += `<div class="ct">${esc(o.title)}</div>`;
      const paras = Array.isArray(o.body) ? o.body : [o.body];
      h += paras.map(b => `<p>${runs(b)}</p>`).join("");
      h += `</div>`;
      w(h);
    },
    figure(o) {
      const wmm = o.wmm || 120;
      const wpx = Math.round(wmm / 174 * 640);
      let cap = "";
      if (o.eyebrow) cap += `<span class="cap-eye">${esc(o.eyebrow.toUpperCase())}</span> `;
      cap += esc(o.caption || "");
      w(`<figure class="fig" style="max-width:${wpx}px"><div class="fig-frame"><img src="${A}${file(o.path)}" alt=""></div>${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`);
    },
    figGrid(o) {
      const cols = o.cols || 3;
      let h = `<div class="figgrid" style="grid-template-columns:repeat(${cols},1fr)">`;
      h += o.items.map(it => {
        let c = `<div class="gcell">`;
        if (it.tag) c += `<div class="gtag" style="color:${hex(it.tagColor || "6E8F00")}">${esc(it.tag.toUpperCase())}</div>`;
        c += `<img src="${A}${file(it.path)}" alt="">`;
        c += `<div class="glabel">${esc(it.label)}</div>`;
        if (it.desc) c += `<div class="gdesc">${esc(it.desc)}</div>`;
        return c + `</div>`;
      }).join("");
      w(h + `</div>`);
    },
    flow(o) {
      const cols = o.cols || o.steps.length;
      let h = `<div class="flow" style="grid-template-columns:repeat(${cols},1fr)">`;
      h += o.steps.map(s => {
        const dark = s.shd === "0E0E0E" || s.shd === "000000";
        let c = `<div class="fstep${dark ? " dark" : ""}">`;
        if (s.n != null) c += `<div class="fn">${esc(s.n)}</div>`;
        c += `<div class="ft">${esc(s.t)}</div>`;
        if (s.d) c += `<div class="fd">${esc(s.d)}</div>`;
        return c + `</div>`;
      }).join("");
      w(h + `</div>`);
    },
    dtable(o) {
      let h = `<table class="dt"><colgroup>` + (o.widthsPct || []).map(p => `<col style="width:${(p * 100).toFixed(1)}%">`).join("") + `</colgroup>`;
      if (o.head) {
        h += `<thead><tr>` + o.head.map(x => `<th>${esc(String(x).toUpperCase())}</th>`).join("") + `</tr></thead>`;
      }
      h += `<tbody>`;
      o.rows.forEach((row, ri) => {
        h += `<tr>` + row.map((cell, ci) => {
          const isObj = cell && typeof cell === "object" && !Array.isArray(cell);
          const txt = isObj ? cell.runs != null ? cell.runs : cell.text : cell;
          const k = o.kcol && ci === 0;
          let st = "";
          if (isObj && cell.color) st += `color:${hex(cell.color)};`;
          if (k || isObj && cell.b) st += "font-weight:600;";
          return `<td${st ? ` style="${st}"` : ""}${k ? ' class="kcol"' : ''}>${runs(txt)}</td>`;
        }).join("") + `</tr>`;
      });
      w(h + `</tbody></table>`);
    },
    toc(items) {
      w(`<div class="toc">` + items.map(it => `<div class="tocrow"><span class="tocn">${esc(it.n != null ? it.n : "—")}</span><span class="toct">${esc(it.t)}</span></div>`).join("") + `</div>`);
    },
    refs(items) {
      w(`<ol class="refs">` + items.map(it => `<li>${esc(it)}</li>`).join("") + `</ol>`);
    }
  };
  function file(p) {
    return p.replace(/^.*\//, "");
  }
  window.__renderPreview = function () {
    window.buildContent(R);
    flush();
    document.getElementById("doc").innerHTML = out.join("\n");
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "monografia/preview-adapter.js", error: String((e && e.message) || e) }); }

// monografia/wml2html.js
try { (() => {
/* WordprocessingML(document.xml) -> faithful HTML preview.
   globalThis.wmlToHtml(docXmlString) */
globalThis.wmlToHtml = function (xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const g = (el, tag) => el.getElementsByTagNameNS(NS, tag);
  const child = (el, tag) => {
    for (const c of el.children) if (c.localName === tag) return c;
    return null;
  };
  const children = (el, tag) => [...el.children].filter(c => c.localName === tag);
  const attr = (el, a) => el ? el.getAttributeNS(NS, a) : null;
  const TWIP = 1440 / 25.4; // per mm
  const hx = v => v && v !== "auto" ? "#" + v : null;
  function runHtml(r) {
    const rpr = child(r, "rPr");
    let style = "";
    let text = "";
    let isBreak = false;
    for (const c of r.children) {
      if (c.localName === "t") text += c.textContent;else if (c.localName === "br") isBreak = true;else if (c.localName === "tab") text += "\u2003";
    }
    let caps = false;
    if (rpr) {
      if (child(rpr, "b")) style += "font-weight:700;";
      if (child(rpr, "i")) style += "font-style:italic;";
      const color = attr(child(rpr, "color"), "val");
      if (color && color !== "auto") style += "color:#" + color + ";";
      const sz = attr(child(rpr, "sz"), "val");
      if (sz) style += "font-size:" + parseInt(sz) / 2 + "pt;";
      const sp = attr(child(rpr, "spacing"), "val");
      if (sp) style += "letter-spacing:" + parseInt(sp) / 20 / 12 * 1 + "px;";
      const rf = child(rpr, "rFonts");
      const fn = rf ? attr(rf, "ascii") : null;
      if (fn) style += "font-family:'" + fn + "';";
      const shd = attr(child(rpr, "shd"), "fill");
      if (shd && shd !== "auto") {
        style += "background:#" + shd + ";padding:0 .12em;border-radius:2px;";
      }
      if (child(rpr, "caps")) caps = true;
    }
    if (isBreak) return "<br>";
    if (caps) text = text.toUpperCase();
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (!text) return "";
    return `<span style="${style}">${text}</span>`;
  }
  function pPrStyle(ppr) {
    let style = "";
    if (!ppr) return {
      style,
      sect: null,
      isBreakBefore: false
    };
    const jc = attr(child(ppr, "jc"), "val");
    if (jc) style += "text-align:" + (jc === "both" ? "justify" : jc) + ";";
    const sp = child(ppr, "spacing");
    if (sp) {
      const bef = attr(sp, "before"),
        aft = attr(sp, "after"),
        line = attr(sp, "line"),
        rule = attr(sp, "lineRule");
      if (bef) style += "margin-top:" + parseInt(bef) / 20 + "pt;";
      if (aft) style += "margin-bottom:" + parseInt(aft) / 20 + "pt;";
      if (line) {
        if (rule === "auto") style += "line-height:" + parseInt(line) / 240 + ";";else style += "line-height:" + parseInt(line) / 20 + "pt;";
      }
    } else {
      style += "margin:0;";
    }
    const ind = child(ppr, "ind");
    if (ind) {
      const l = attr(ind, "left"),
        h = attr(ind, "hanging"),
        fl = attr(ind, "firstLine");
      if (l) style += "padding-left:" + parseInt(l) / 20 + "pt;";
      if (h) style += "text-indent:-" + parseInt(h) / 20 + "pt;";
      if (fl) style += "text-indent:" + parseInt(fl) / 20 + "pt;";
    }
    const pbdr = child(ppr, "pBdr");
    if (pbdr) {
      const b = child(pbdr, "bottom"),
        t = child(pbdr, "top");
      if (b) style += "border-bottom:1px solid " + (hx(attr(b, "color")) || "#ccc") + ";padding-bottom:4px;";
      if (t) style += "border-top:1px solid " + (hx(attr(t, "color")) || "#ccc") + ";padding-top:6px;";
    }
    const shd = attr(child(ppr, "shd"), "fill");
    if (shd && shd !== "auto") style += "background:#" + shd + ";";
    let isBreakBefore = false;
    return {
      style,
      sect: child(ppr, "sectPr"),
      isBreakBefore
    };
  }
  function paraHtml(p) {
    const ppr = child(p, "pPr");
    const {
      style
    } = pPrStyle(ppr);
    // page break?
    let html = "";
    let hasPB = false;
    for (const r of children(p, "r")) {
      for (const c of r.children) if (c.localName === "br" && attr(c, "type") === "page") hasPB = true;
      // drawing -> marker (skip cover bg)
      if (g(r, "drawing").length) {
        const nm = g(r, "docPr")[0] && attr(g(r, "docPr")[0], "name") || "";
        if (/portada|fondo/i.test(nm)) {
          html += `<img class="logo" src="assets/retinar-logo-light.png" style="height:28px;vertical-align:middle">`;
        } else html += `<span class="imgmark">[imagen]</span>`;
        continue;
      }
      html += runHtml(r);
    }
    let out = "";
    if (hasPB) out += `<div class="pb"></div>`;
    out += `<p style="${style}">${html || "&nbsp;"}</p>`;
    return out;
  }
  function tableHtml(tbl) {
    const grid = child(tbl, "tblGrid");
    const cols = grid ? children(grid, "gridCol").map(c => parseInt(attr(c, "w"))) : [];
    const total = cols.reduce((a, b) => a + b, 0) || 1;
    let html = `<table class="wtbl" style="width:${(total / TWIP).toFixed(1)}mm;">`;
    for (const trc of children(tbl, "tr")) {
      const hpr = child(trc, "trPr");
      let trStyle = "";
      if (hpr) {
        const h = child(hpr, "trHeight");
        if (h) trStyle += "height:" + (parseInt(attr(h, "val")) / TWIP).toFixed(1) + "mm;";
      }
      html += `<tr style="${trStyle}">`;
      for (const tc of children(trc, "tc")) {
        const tcpr = child(tc, "tcPr");
        let st = "vertical-align:top;";
        let span = 1;
        if (tcpr) {
          const gs = attr(child(tcpr, "gridSpan"), "val");
          if (gs) span = parseInt(gs);
          const shd = attr(child(tcpr, "shd"), "fill");
          if (shd && shd !== "auto") st += "background:#" + shd + ";";
          const va = attr(child(tcpr, "vAlign"), "val");
          if (va) st += "vertical-align:" + (va === "center" ? "middle" : va) + ";";
          const mar = child(tcpr, "tcMar");
          if (mar) {
            ["top", "bottom", "left", "right"].forEach(s => {
              const m = child(mar, s);
              if (m) st += "padding-" + s + ":" + parseInt(attr(m, "w")) / 20 + "pt;";
            });
          }
          const bdr = child(tcpr, "tcBorders");
          if (bdr) {
            ["top", "bottom", "left", "right"].forEach(s => {
              const b = child(bdr, s);
              if (b) {
                const v = attr(b, "val");
                if (v === "nil") return;
                const szb = parseInt(attr(b, "sz") || "4") / 8;
                const cl = hx(attr(b, "color")) || "#ccc";
                st += "border-" + s + ":" + Math.max(1, szb).toFixed(1) + "px " + (v === "dashed" ? "dashed" : "solid") + " " + cl + ";";
              }
            });
          }
        }
        let inner = "";
        for (const cc of tc.children) {
          if (cc.localName === "p") inner += paraHtml(cc);else if (cc.localName === "tbl") inner += tableHtml(cc);
        }
        html += `<td colspan="${span}" style="${st}">${inner}</td>`;
      }
      html += `</tr>`;
    }
    html += `</table>`;
    return html;
  }
  const body = g(doc, "body")[0];
  let pages = "";
  for (const el of body.children) {
    if (el.localName === "p") pages += paraHtml(el);else if (el.localName === "tbl") pages += tableHtml(el);else if (el.localName === "sectPr") {/* final */}
  }
  return pages;
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "monografia/wml2html.js", error: String((e && e.message) || e) }); }

// retinapp/app.jsx
try { (() => {
// RetinApp — app shell: router, bottom tab bar, device stage. Mounts into the iPhone frame.

const SCREENS = {
  welcome: WelcomeScreen,
  login: LoginScreen,
  'crear-cuenta': CreateAccountScreen,
  'cuenta-creada': AccountCreatedScreen,
  home: HomeScreen,
  estudios: EstudiosScreen,
  retina: VisionHubScreen,
  salud: SaludScreen,
  aprender: AprenderScreen,
  'upload-type': UploadTypeScreen,
  'upload-source': UploadSourceScreen,
  'upload-preview': UploadPreviewScreen,
  'upload-meta': UploadMetaScreen,
  'lab-extract': LabExtractScreen,
  saved: SavedScreen,
  'informe-retina': InformeRetinaScreen,
  'reg-hba1c': RegHba1cScreen,
  'reg-glucemia': RegGlucemiaScreen,
  'reg-peso': RegPesoScreen,
  'reg-actividad': RegActividadScreen,
  'reg-alimentacion': RegAlimentacionScreen,
  'reg-sintoma': RegSintomaScreen,
  'reg-pie': RegPieScreen,
  medicacion: MedicacionScreen,
  'salud-add': SaludAddScreen,
  'vision-intro': VisionIntroScreen,
  'vision-prep': VisionPrepScreen,
  'vision-eye': VisionEyeScreen,
  'vision-test': VisionTestScreen,
  'vision-result': VisionResultScreen,
  'vision-manual': VisionManualScreen,
  historia: HistoriaScreen,
  articulo: ArticuloScreen,
  'ia-info': IaInfoScreen,
  video: VideoScreen,
  recordatorios: RecordatoriosScreen,
  novedades: NovedadesScreen,
  perfil: PerfilScreen,
  privacidad: PrivacidadScreen,
  contacto: ContactoScreen,
  cuidador: CuidadorScreen,
  'doc-view': DocViewScreen,
  'onboarding-quiz': HealthQuizScreen
};
const TAB_IDS = ['home', 'estudios', 'retina', 'salud', 'aprender'];
function TabBar({
  tab,
  onTab
}) {
  const tabs = [['home', 'Inicio', 'home'], ['estudios', 'Estudios', 'folder'], ['retina', 'Mi visión', 'eye'], ['salud', 'Mi salud', 'health'], ['aprender', 'Aprender', 'book']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 40,
      paddingBottom: 26,
      paddingTop: 9,
      background: 'rgba(243,245,239,0.88)',
      backdropFilter: 'blur(18px) saturate(180%)',
      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      borderTop: `1px solid ${T.line}`,
      display: 'flex'
    }
  }, tabs.map(([id, label, icon]) => {
    const active = tab === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      className: "ru-press",
      onClick: () => onTab(id),
      style: {
        flex: 1,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '4px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 25,
      stroke: active ? 2.4 : 1.95,
      color: active ? T.green : T.inkSubtle
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: active ? 700 : 600,
        color: active ? T.green : T.inkSubtle,
        letterSpacing: '-0.01em'
      }
    }, label));
  }));
}
const LS_KEY = 'retinup_state_v1';
const LS_TEXT_SCALE_KEY = 'retinup_text_scale_v1';
const LS_PROFILE_KEY = 'retinup_profile_v1';
function App() {
  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || null;
    } catch (e) {
      return null;
    }
  };
  const init = load() || {
    authed: false,
    authStack: [{
      screen: 'welcome'
    }],
    tab: 'home',
    stack: []
  };
  const [authed, setAuthed] = React.useState(init.authed);
  const [authStack, setAuthStack] = React.useState(init.authStack);
  const [tab, setTab] = React.useState(init.tab);
  const [stack, setStack] = React.useState(init.stack);
  const [tabParams, setTabParams] = React.useState({});
  const scrollRef = React.useRef(null);
  const loadProfile = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_PROFILE_KEY)) || null;
    } catch (e) {
      return null;
    }
  };
  const [profile, setProfile] = React.useState(() => loadProfile() || DEFAULT_PROFILE);
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {}
  }, [profile]);
  const [textScale, setTextScaleState] = React.useState(() => {
    try {
      return +localStorage.getItem(LS_TEXT_SCALE_KEY) || 1;
    } catch (e) {
      return 1;
    }
  });
  const setTextScale = v => {
    setTextScaleState(v);
    try {
      localStorage.setItem(LS_TEXT_SCALE_KEY, String(v));
    } catch (e) {}
  };
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        authed,
        authStack,
        tab,
        stack
      }));
    } catch (e) {}
  }, [authed, authStack, tab, stack]);
  const nav = React.useMemo(() => ({
    go(screen, params) {
      if (!authed) {
        setAuthStack(s => [...s, {
          screen,
          params
        }]);
        return;
      }
      if (TAB_IDS.includes(screen)) {
        setTab(screen);
        setStack([]);
        setTabParams(params || {});
        return;
      }
      setStack(s => [...s, {
        screen,
        params
      }]);
    },
    tab(name, params) {
      setTab(name);
      setStack([]);
      setTabParams(params || {});
    },
    back() {
      if (!authed) {
        setAuthStack(s => s.length > 1 ? s.slice(0, -1) : s);
        return;
      }
      setStack(s => s.length ? s.slice(0, -1) : s);
    },
    reset(screen) {
      if (screen === 'home') {
        setAuthed(true);
        setTab('home');
        setStack(profile && profile.healthQuizDone ? [] : [{
          screen: 'onboarding-quiz'
        }]);
      } else if (screen === 'welcome') {
        setAuthed(false);
        setAuthStack([{
          screen: 'welcome'
        }]);
        setTab('home');
        setStack([]);
      }
    },
    completeHealthQuiz() {
      setProfile(p => ({
        ...p,
        healthQuizDone: true
      }));
      setStack([]);
    },
    profile,
    updateProfile(patch) {
      setProfile(p => ({
        ...p,
        ...patch
      }));
    },
    updateHealth(patch) {
      setProfile(p => ({
        ...p,
        health: {
          ...(p.health || {}),
          ...patch
        }
      }));
    },
    textScale,
    setTextScale
  }), [authed, textScale, profile]);
  const cur = !authed ? authStack[authStack.length - 1] : stack.length ? stack[stack.length - 1] : {
    screen: tab,
    params: tabParams
  };
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [cur.screen, authed, tab, stack.length, authStack.length]);
  const C = SCREENS[cur.screen] || HomeScreen;
  const showTab = authed && stack.length === 0;
  return /*#__PURE__*/React.createElement(IOSDevice, null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: T.canvas
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      position: 'relative',
      zoom: textScale
    }
  }, /*#__PURE__*/React.createElement(C, {
    nav: nav,
    params: cur.params
  })), showTab && /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    onTab: t => nav.tab(t)
  })));
}
function Stage() {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const s = Math.min(1, (window.innerHeight - 36) / 874, (window.innerWidth - 24) / 402);
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'center center'
    }
  }, /*#__PURE__*/React.createElement(App, null)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(Stage, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/app.jsx", error: String((e && e.message) || e) }); }

// retinapp/data.jsx
try { (() => {
// RetinApp — shared mock data. Single source of truth so the same clinical
// event reads identically on Home, Mi retina, Informe and Estudios.
// (Fixes the Home/Mi-retina/Informe contradiction flagged in the product critique.)
//
// RETINA_REPORTS.clasificacion mirrors Retinar's real clinical report schema:
//   referible          → referible / manual_referible_RD      (sí/no, deriva o no)
//   grado_rd           → grado_RD / manual_grado_RD            (0–4)
//   sospecha_md        → sospecha_MD / manual_sospecha_DMD     (0–2)
//   otras_patologias   → otras_patologias / manual_otras_patologias (sí/no)
//   patologia_concomitante_detalle → sólo si otras_patologias
// Each field stores { ia, manual } — manual is null until a professional
// validates/corrects the AI read. resolveClas() picks manual ?? ia so the UI
// always renders one final value, per field.
// hallazgos.{od,oi} → hallazgos_ojo_derecho / hallazgos_ojo_izquierdo
// impresion_diagnostica → impresion_diagnostica
// conducta.{accion_inmediata, recomendaciones} → accion_inmediata / conducta_recomendaciones

const GRADO_RD_LABELS = {
  0: 'Sin retinopatía aparente',
  1: 'Retinopatía diabética leve',
  2: 'Retinopatía diabética moderada',
  3: 'Retinopatía diabética severa',
  4: 'Retinopatía diabética proliferativa'
};
const SOSPECHA_MD_LABELS = {
  0: 'Sin edema macular aparente',
  1: 'Edema macular presente, sin compromiso del centro',
  2: 'Edema macular con compromiso del centro macular'
};
function resolveClas(field) {
  if (!field) return null;
  return field.manual !== null && field.manual !== undefined ? field.manual : field.ia;
}
function claseSeverityTone(kind, value) {
  if (value === null || value === undefined) return 'neutral';
  if (kind === 'grado') return value <= 1 ? 'green' : value === 2 ? 'amber' : 'red';
  if (kind === 'md') return value <= 0 ? 'green' : value === 1 ? 'amber' : 'red';
  return 'neutral';
}
const RETINA_REPORTS = [{
  date: '12/03/2026',
  inst: 'Hospital El Cruce',
  prof: 'Dr. L. Méndez',
  resultLabel: 'Sin signos de progresión',
  tone: 'green',
  referable: false,
  validated: true,
  summary: 'En este estudio no se observaron signos de retinopatía diabética referible. Se recomienda repetir el control según indicación médica.',
  clasificacion: {
    referible: {
      ia: false,
      manual: false
    },
    grado_rd: {
      ia: 1,
      manual: 1
    },
    sospecha_md: {
      ia: 0,
      manual: 0
    },
    otras_patologias: {
      ia: true,
      manual: true
    },
    patologia_concomitante_detalle: 'Se observan drusas maculares pequeñas en ambos ojos, sin significancia clínica actual. Se sugiere continuar el seguimiento anual habitual.'
  },
  hallazgos: {
    od: 'Retina aplicada, sin hemorragias ni exudados. Relación excavación/disco 0,3. Se observan drusas duras pequeñas en área macular.',
    oi: 'Retina aplicada, sin hemorragias ni exudados. Papila de bordes netos. Drusas duras pequeñas aisladas en polo posterior.'
  },
  impresion_diagnostica: 'Fondo de ojo sin signos de retinopatía diabética referible en ninguno de los dos ojos, sin cambios significativos respecto del control anterior. Drusas maculares incidentales, sin compromiso visual.',
  conducta: {
    accion_inmediata: null,
    recomendaciones: 'Continuar control anual de fondo de ojo. Mantener el buen control metabólico. Consultar antes si nota cambios en la visión.'
  }
}, {
  date: '18/10/2025',
  inst: 'Campaña Tandil',
  prof: null,
  resultLabel: 'Control recomendado — retinopatía referible',
  tone: 'red',
  referable: true,
  validated: false,
  summary: 'La lectura automática detectó signos compatibles con retinopatía diabética referible. Este resultado todavía no fue revisado por un oftalmólogo — pedí un turno para confirmar el diagnóstico y definir tratamiento.',
  clasificacion: {
    referible: {
      ia: true,
      manual: null
    },
    grado_rd: {
      ia: 3,
      manual: null
    },
    sospecha_md: {
      ia: 1,
      manual: null
    },
    otras_patologias: {
      ia: false,
      manual: null
    },
    patologia_concomitante_detalle: null
  },
  hallazgos: {
    od: 'Lectura automática: hemorragias en los 4 cuadrantes y arrosariamiento venoso en al menos 2 cuadrantes, compatible con retinopatía diabética no proliferativa severa.',
    oi: 'Lectura automática: microaneurismas y hemorragias intrarretinales moderadas, con exudados duros próximos al área macular.'
  },
  impresion_diagnostica: 'Lectura automática (IA) compatible con retinopatía diabética severa, con sospecha de edema macular sin compromiso central. Pendiente de confirmación por oftalmólogo.',
  conducta: {
    accion_inmediata: 'Derivar a oftalmología dentro de los 15 días.',
    recomendaciones: 'Evaluación oftalmológica presencial para confirmar el diagnóstico y definir tratamiento. Reforzar mientras tanto el control metabólico y de presión arterial.'
  }
}, {
  date: '05/09/2024',
  inst: 'Hospital El Cruce',
  prof: 'Dra. R. Solís',
  resultLabel: 'Sin cambios relevantes',
  tone: 'green',
  referable: false,
  validated: true,
  summary: 'No se observaron cambios relevantes respecto del estudio de base.',
  clasificacion: {
    referible: {
      ia: false,
      manual: false
    },
    grado_rd: {
      ia: 1,
      manual: 1
    },
    sospecha_md: {
      ia: 0,
      manual: 0
    },
    otras_patologias: {
      ia: false,
      manual: false
    },
    patologia_concomitante_detalle: null
  },
  hallazgos: {
    od: 'Retina aplicada, sin hemorragias. Signos leves de microangiopatía sin progresión respecto de controles previos.',
    oi: 'Retina aplicada, sin hemorragias ni exudados. Sin cambios respecto del estudio de base.'
  },
  impresion_diagnostica: 'Retinopatía diabética leve, estable, sin cambios relevantes respecto del estudio de base.',
  conducta: {
    accion_inmediata: null,
    recomendaciones: 'Repetir control de fondo de ojo en 12 meses.'
  }
}, {
  date: '20/08/2023',
  inst: 'Hospital El Cruce',
  prof: 'Dr. L. Méndez',
  resultLabel: 'Estudio de base',
  tone: 'neutral',
  referable: false,
  validated: true,
  summary: 'Primer estudio registrado. Sirve como punto de referencia para comparar controles futuros.',
  clasificacion: {
    referible: {
      ia: false,
      manual: false
    },
    grado_rd: {
      ia: 0,
      manual: 0
    },
    sospecha_md: {
      ia: 0,
      manual: 0
    },
    otras_patologias: {
      ia: false,
      manual: false
    },
    patologia_concomitante_detalle: null
  },
  hallazgos: {
    od: 'Retina aplicada, papila y mácula sin particularidades. Sin signos de retinopatía diabética.',
    oi: 'Retina aplicada, sin hemorragias, exudados ni signos de retinopatía diabética.'
  },
  impresion_diagnostica: 'Fondo de ojo sin signos de retinopatía diabética. Estudio de base para futuros controles.',
  conducta: {
    accion_inmediata: null,
    recomendaciones: 'Control anual de fondo de ojo.'
  }
}];
function getRetinaReport(date) {
  return RETINA_REPORTS.find(r => r.date === date) || RETINA_REPORTS[0];
}

// Visual-acuity history — mixes in-app Tumbling-E self-screenings with values
// loaded from an in-person ophthalmology control, newest first. Keeps Home /
// Mi salud / Mi visión showing the same latest reading.
const VISION_HISTORY = [{
  date: '02/07/2026',
  source: 'app',
  od: '20/25',
  oi: '20/40',
  reliabilityHits: 1
}, {
  date: '05/09/2025',
  source: 'doctor',
  od: '20/25',
  oi: '20/25',
  inst: 'Hospital El Cruce',
  prof: 'Dra. R. Solís'
}, {
  date: '20/08/2024',
  source: 'doctor',
  od: '20/40',
  oi: '20/50',
  inst: 'Hospital El Cruce',
  prof: 'Dr. L. Méndez'
}];
function getVisionEntry(date) {
  return VISION_HISTORY.find(v => v.date === date) || VISION_HISTORY[0];
}

// Chronological log for "Mi salud" — every self-reported / clinical health
// record, one entry per event, newest first (sorted at render time). Grouped
// by year and filterable by `type` in screens-salud.jsx.
const HEALTH_RECORDS = [{
  type: 'HbA1c',
  icon: 'droplet',
  tone: 'green',
  title: 'HbA1c',
  date: '20/06/2026',
  sub: '7,1% — en objetivo',
  go: 'reg-hba1c'
}, {
  type: 'Glucemia',
  icon: 'activity',
  tone: 'blue',
  title: 'Glucemia',
  date: '28/06/2026',
  sub: '132 mg/dL',
  go: 'reg-glucemia'
}, {
  type: 'Peso y presión',
  icon: 'scale',
  tone: 'neutral',
  title: 'Peso y presión',
  date: '20/06/2026',
  sub: '72 kg · PA 128/80',
  go: 'reg-peso'
}, {
  type: 'Actividad física',
  icon: 'footprints',
  tone: 'green',
  title: 'Actividad física',
  date: '29/06/2026',
  sub: '4 días esta semana · 2 h 40 min',
  go: 'reg-actividad'
}, {
  type: 'Alimentación',
  icon: 'utensils',
  tone: 'amber',
  title: 'Alimentación',
  date: '27/06/2026',
  sub: 'Autoevaluación: Buena',
  go: 'reg-alimentacion'
}, {
  type: 'Agudeza visual',
  icon: 'eye',
  tone: 'green',
  title: 'Agudeza visual',
  date: '02/07/2026',
  sub: 'OD 20/25 · OI 20/40',
  go: 'vision-result',
  params: {
    od: '20/25',
    oi: '20/40',
    reliabilityHits: 1,
    date: '02/07/2026',
    fromHistory: true
  }
}, {
  type: 'Cuidado del pie',
  icon: 'footprints',
  tone: 'neutral',
  title: 'Cuidado del pie',
  date: '18/06/2026',
  sub: 'Autoexamen: sin hallazgos',
  go: 'reg-pie'
}, {
  type: 'Función renal',
  icon: 'kidney',
  tone: 'amber',
  title: 'Función renal',
  date: '10/06/2026',
  sub: 'Filtrado glomerular 86 ml/min',
  go: 'lab-extract'
}, {
  type: 'Medicación',
  icon: 'pill',
  tone: 'blue',
  title: 'Ajuste de medicación',
  date: '05/03/2026',
  sub: 'Se agregó Enalapril 10mg',
  go: 'medicacion'
}, {
  type: 'Síntomas',
  icon: 'alert',
  tone: 'red',
  title: 'Síntoma reportado',
  date: '14/01/2026',
  sub: 'Hormigueo en los pies',
  go: 'reg-sintoma'
}, {
  type: 'Cuidado del pie',
  icon: 'footprints',
  tone: 'red',
  title: 'Cuidado del pie',
  date: '02/02/2026',
  sub: 'Callosidad leve en talón derecho',
  go: 'reg-pie'
}, {
  type: 'HbA1c',
  icon: 'droplet',
  tone: 'amber',
  title: 'HbA1c',
  date: '14/02/2026',
  sub: '7,4%',
  go: 'reg-hba1c'
}, {
  type: 'Alimentación',
  icon: 'utensils',
  tone: 'amber',
  title: 'Alimentación',
  date: '05/01/2026',
  sub: 'Autoevaluación: Regular',
  go: 'reg-alimentacion'
}, {
  type: 'Peso y presión',
  icon: 'scale',
  tone: 'neutral',
  title: 'Peso y presión',
  date: '20/12/2025',
  sub: '74 kg · PA 130/82',
  go: 'reg-peso'
}, {
  type: 'Actividad física',
  icon: 'footprints',
  tone: 'green',
  title: 'Actividad física',
  date: '08/12/2025',
  sub: '5 días esta semana · 3 h 00 min',
  go: 'reg-actividad'
}, {
  type: 'Agudeza visual',
  icon: 'stethoscope',
  tone: 'blue',
  title: 'Control oftalmológico',
  date: '05/09/2025',
  sub: 'OD 20/25 · OI 20/25',
  go: 'vision-result',
  params: {
    od: '20/25',
    oi: '20/25',
    date: '05/09/2025',
    fromHistory: true,
    source: 'doctor',
    inst: 'Hospital El Cruce',
    prof: 'Dra. R. Solís'
  }
}, {
  type: 'HbA1c',
  icon: 'droplet',
  tone: 'amber',
  title: 'HbA1c',
  date: '10/09/2025',
  sub: '7,9%',
  go: 'reg-hba1c'
}, {
  type: 'Síntomas',
  icon: 'alert',
  tone: 'red',
  title: 'Síntoma reportado',
  date: '22/09/2025',
  sub: 'Visión borrosa transitoria',
  go: 'reg-sintoma'
}, {
  type: 'Medicación',
  icon: 'pill',
  tone: 'blue',
  title: 'Inicio de tratamiento',
  date: '10/08/2025',
  sub: 'Se indicó Metformina 850mg',
  go: 'medicacion'
}, {
  type: 'Función renal',
  icon: 'kidney',
  tone: 'amber',
  title: 'Función renal',
  date: '12/11/2024',
  sub: 'Filtrado glomerular 84 ml/min',
  go: 'lab-extract'
}, {
  type: 'HbA1c',
  icon: 'droplet',
  tone: 'red',
  title: 'HbA1c',
  date: '18/11/2024',
  sub: '8,6% — fuera de objetivo',
  go: 'reg-hba1c'
}, {
  type: 'Agudeza visual',
  icon: 'stethoscope',
  tone: 'blue',
  title: 'Control oftalmológico',
  date: '20/08/2024',
  sub: 'OD 20/40 · OI 20/50',
  go: 'vision-result',
  params: {
    od: '20/40',
    oi: '20/50',
    date: '20/08/2024',
    fromHistory: true,
    source: 'doctor',
    inst: 'Hospital El Cruce',
    prof: 'Dr. L. Méndez'
  }
}];
function ddmmyyyyToKey(d) {
  const parts = String(d || '').split('/');
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts.map(Number);
  return yyyy * 10000 + mm * 100 + dd;
}

// Clinical range checks for self-reported values. Not a diagnosis — just flags
// values worth a conversation with the care team, per the product critique
// ("no validation of clinical ranges").
const RANGE_RULES = {
  hba1c: raw => {
    const v = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(v)) return null;
    if (v < 4 || v > 14) return {
      level: 'alert',
      msg: 'Este valor está muy fuera de lo esperado para HbA1c. Puede ser un error de carga — revisalo, y si es correcto, contactá a tu equipo de salud.'
    };
    if (v >= 9) return {
      level: 'warn',
      msg: 'Este valor está por encima del objetivo habitual. Buen tema para conversar en tu próxima consulta.'
    };
    return null;
  },
  glucemia: raw => {
    const v = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(v)) return null;
    if (v < 54 || v > 300) return {
      level: 'alert',
      msg: 'Este valor de glucemia es de riesgo. Si te sentís mal, contactá a tu equipo de salud o a un servicio de urgencias ahora.'
    };
    if (v < 70 || v > 180) return {
      level: 'warn',
      msg: 'Este valor está fuera del rango habitual. Prestá atención a cómo te sentís.'
    };
    return null;
  },
  peso: raw => {
    const v = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(v)) return null;
    if (v < 30 || v > 250) return {
      level: 'alert',
      msg: 'Ese peso parece fuera de lo esperado. Revisá que esté bien cargado.'
    };
    return null;
  },
  altura: raw => {
    const v = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(v)) return null;
    if (v < 100 || v > 230) return {
      level: 'alert',
      msg: 'Esta altura parece fuera de lo esperado. Revisá que esté cargada en centímetros (ej: 162).'
    };
    return null;
  },
  sistolica: raw => {
    const v = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(v)) return null;
    if (v > 180 || v < 90) return {
      level: 'alert',
      msg: 'Esta presión sistólica está fuera de rango seguro. Contactá a tu equipo de salud.'
    };
    return null;
  },
  diastolica: raw => {
    const v = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(v)) return null;
    if (v > 120 || v < 60) return {
      level: 'alert',
      msg: 'Esta presión diastólica está fuera de rango seguro. Contactá a tu equipo de salud.'
    };
    return null;
  }
};
function checkRange(kind, value) {
  const fn = RANGE_RULES[kind];
  return fn ? fn(value) : null;
}

// ── Account creation ──────────────────────────────────────────
// Argentina's 23 provinces + CABA, for the "Provincia" field.
const PROVINCIAS_AR = ['Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'];

// Username = apellidos + DNI concatenated. Password = 3 simple words joined
// with ".". Both are generated at signup and "emailed" to the user (mocked
// on the Cuenta creada screen) — login then runs on username + password only.
const RU_PASSWORD_WORDS = ['sol', 'luna', 'rio', 'flor', 'nube', 'mar', 'monte', 'trigo', 'oliva', 'cedro', 'jazmin', 'coral', 'ceibo', 'arroyo', 'valle', 'lago', 'pampa', 'yerba', 'alba', 'brisa', 'nieve', 'roble', 'junco', 'ambar', 'cielo', 'piedra', 'semilla', 'laurel'];
function stripDiacritics(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function generateUsername(apellidos, dni) {
  const clean = stripDiacritics(apellidos).toLowerCase().replace(/[^a-z]/g, '');
  const digits = String(dni || '').replace(/\D/g, '');
  return clean + digits;
}
function generatePassword() {
  const pick = () => RU_PASSWORD_WORDS[Math.floor(Math.random() * RU_PASSWORD_WORDS.length)];
  return [pick(), pick(), pick()].join('.');
}

// Seed profile — used until "Crear cuenta" replaces it. Represents a
// returning user who already completed the health questionnaire once, so the
// Login path shows a fully populated app; the signup path starts empty and
// triggers the first-access questionnaire.
const DEFAULT_PROFILE = {
  dni: '14.302.885',
  genero: 'F',
  nombres: 'María Beatriz',
  apellidos: 'Ferreyra',
  calle: 'Av. Rivadavia',
  numero: '1240',
  piso: '',
  depto: '',
  ciudad: 'Tandil',
  provincia: 'Buenos Aires',
  coberturaTiene: true,
  obraSocial: 'IOMA',
  codigoAfiliado: '0245981103',
  telefono: '+54 249 4xx xxxx',
  email: 'm.ferreyra@email.com',
  username: 'ferreyra14302885',
  password: 'sol.arroyo.trigo',
  healthQuizDone: true,
  health: {
    peso: '72',
    altura: '162',
    glaucomaFamiliar: 'no_se',
    aniosDiabetes: '14',
    complicaciones: ['Hipertensión'],
    complicacionOtro: '',
    medicacion: ['Metformina', 'Insulina']
  }
};
Object.assign(window, {
  RETINA_REPORTS,
  getRetinaReport,
  VISION_HISTORY,
  getVisionEntry,
  checkRange,
  GRADO_RD_LABELS,
  SOSPECHA_MD_LABELS,
  resolveClas,
  claseSeverityTone,
  HEALTH_RECORDS,
  ddmmyyyyToKey,
  PROVINCIAS_AR,
  generateUsername,
  generatePassword,
  DEFAULT_PROFILE
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/data.jsx", error: String((e && e.message) || e) }); }

// retinapp/icons.jsx
try { (() => {
// RetinApp — Lucide-style line icon set (brand extension; Retinar ships no icon system).
// Monoline, round caps/joins, currentColor. Slightly heavier stroke for 50–80yo legibility.

const RU_ICON_PATHS = {
  home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  retina: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  health: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7z"/><path d="M3.5 12H8l1.5-3 3 6 2-4 1.2 1H20.5"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  droplet: '<path d="M12 2.7 17.66 8.36a8 8 0 1 1-11.31 0z"/>',
  flask: '<path d="M14.5 2v6.5l4.6 8.2a2 2 0 0 1-1.75 3H6.65a2 2 0 0 1-1.75-3l4.6-8.2V2"/><path d="M8.5 2h7"/><path d="M7.2 14.5h9.6"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/><path d="M9 9h1"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  footprints: '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0z"/>',
  stethoscope: '<path d="M5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  kidney: '<path d="M15.5 3c3.3 0 5 2.9 5 6.4 0 4-2.9 6.6-5.8 8-2 1-4 1.5-5.6.5C6.8 16.6 5.8 14.7 5.8 13c0-1.5.7-2.5.7-4C6.5 6 8.7 3 11.6 3c1.1 0 1.7.5 2.2 1 .4-.6.9-1 1.7-1z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.82 0L6 21"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  calendarPlus: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M12 14v4"/><path d="M10 16h4"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9.5"/><path d="m8.2 12 2.6 2.6 5-5.2"/>',
  alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4.5"/><path d="M12 17h.01"/>',
  trendUp: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  trendDown: '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l4 2"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h4c2 0 3-1 5-2 2 1 3 2 5 2h4"/>',
  utensils: '<path d="M3 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>',
  bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  dumbbell: '<path d="M14.4 14.4 9.6 9.6"/><path d="m18.66 5.34-2.12 2.12"/><path d="m5.34 18.66 2.12-2.12"/><path d="M16.5 4.5 19.5 7.5 16.5 10.5"/><path d="M7.5 13.5 4.5 16.5 7.5 19.5"/><path d="m21 6-3-3"/><path d="m6 21-3-3"/>',
  waves: '<path d="M2 6c.9.6 1.5 1 2.8 1C7 7 7 5 9.2 5s2.2 2 4.5 2 2.3-2 4.5-2c1.3 0 1.9.4 2.8 1"/><path d="M2 12c.9.6 1.5 1 2.8 1C7 13 7 11 9.2 11s2.2 2 4.5 2 2.3-2 4.5-2c1.3 0 1.9.4 2.8 1"/><path d="M2 18c.9.6 1.5 1 2.8 1C7 19 7 17 9.2 17s2.2 2 4.5 2 2.3-2 4.5-2c1.3 0 1.9.4 2.8 1"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  sliders: '<path d="M4 6h11"/><path d="M19 6h1"/><circle cx="17" cy="6" r="2"/><path d="M4 12h3"/><path d="M11 12h9"/><circle cx="9" cy="12" r="2"/><path d="M4 18h11"/><path d="M19 18h1"/><circle cx="17" cy="18" r="2"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5"/><path d="M12 8h.01"/>',
  lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.6 4.6 0 0 1 8.9 14"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  apple: '<path d="M12 6.5c0-2 1.5-3.5 3.5-3.5"/><path d="M12 20c-3 0-5-2.5-5-6.5C7 9.5 9.2 8 12 8s5 1.5 5 5.5c0 4-2 6.5-5 6.5z"/>',
  phone: '<path d="M13.8 15.2a2 2 0 0 1-2.2.4 13 13 0 0 1-6.2-6.2 2 2 0 0 1 .4-2.2l1.4-1.4a1.5 1.5 0 0 1 2.2.1l1.2 1.5a1.5 1.5 0 0 1-.1 2l-.8.8a9 9 0 0 0 3.9 3.9l.8-.8a1.5 1.5 0 0 1 2-.1l1.5 1.2a1.5 1.5 0 0 1 .1 2.2z"/>',
  pill: '<path d="m10.5 20.5-9-9a5 5 0 1 1 7-7l9 9a5 5 0 1 1-7 7z"/><path d="m8.5 8.5 7 7"/>',
  userPlus: '<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  lock: '<rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4"/><circle cx="9" cy="4" r="1.2"/><circle cx="9" cy="14" r="1.2"/><circle cx="15" cy="14" r="1.2"/><path d="M2 13h2"/><path d="M20 13h2"/>',
  play: '<path d="M6 3v18l15-9z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
};
function Icon({
  name,
  size = 24,
  stroke = 1.9,
  color = 'currentColor',
  fill = 'none',
  style = {}
}) {
  const inner = RU_ICON_PATHS[name] || RU_ICON_PATHS.info;
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      display: 'block',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: inner
    }
  });
}
Object.assign(window, {
  Icon,
  RU_ICON_PATHS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/icons.jsx", error: String((e && e.message) || e) }); }

// retinapp/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/ios-frame.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-auth.jsx
try { (() => {
// RetinApp — Auth flow: Welcome, Login (username + password only).

function WelcomeScreen({
  nav
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    bg: T.card,
    padTop: T.safeTop,
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 28px 0',
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 30
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '28px 28px 8px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/welcome-hero.png",
    alt: "Adulto sonriendo mientras usa su celular en su living",
    style: {
      width: '100%',
      height: 250,
      objectFit: 'cover',
      borderRadius: T.rLg,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 29,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.18,
      marginTop: 34
    }
  }, "Tu compa\xF1ero para cuidar tu diabetes y proteger tu visi\xF3n."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17.5,
      color: T.inkMuted,
      lineHeight: 1.45,
      marginTop: 16
    }
  }, "Guard\xE1 tus estudios, segu\xED tu evoluci\xF3n y recib\xED recordatorios para mantener tus controles al d\xEDa.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 28px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    },
    "data-comment-anchor": "9dd391d46a-div-20-7"
  }, /*#__PURE__*/React.createElement(Btn, {
    onClick: () => nav.go('login')
  }, "Ingresar"), /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    onClick: () => nav.go('crear-cuenta')
  }, "Crear cuenta"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.retinar.com.ar",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 8,
      color: T.inkSubtle,
      fontSize: 13.5,
      textDecoration: 'none'
    }
  }, "Una aplicaci\xF3n de ", /*#__PURE__*/React.createElement(RetinarWordmark, {
    height: 20
  }))));
}
function LoginScreen({
  nav
}) {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  return /*#__PURE__*/React.createElement(Screen, {
    bg: T.card,
    padTop: T.safeTop
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.back(),
    style: {
      border: 'none',
      background: 'transparent',
      color: T.green,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      font: 'inherit',
      fontSize: 17,
      fontWeight: 600,
      padding: '6px 0',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 24,
    stroke: 2.4
  }), " Atr\xE1s")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 28px 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, "Ingres\xE1 a RetinAPP"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: T.inkMuted,
      marginTop: 10,
      lineHeight: 1.45
    }
  }, "Us\xE1 el usuario y la contrase\xF1a que te enviamos por correo al crear tu cuenta.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '30px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Usuario",
    value: user,
    onChange: setUser,
    placeholder: "apellido00000000"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Contrase\xF1a",
    value: pass,
    onChange: setPass,
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    type: "password"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: -4,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    style: {
      border: 'none',
      background: 'transparent',
      color: T.green,
      font: 'inherit',
      fontSize: 15.5,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Olvid\xE9 mi contrase\xF1a")), /*#__PURE__*/React.createElement(Btn, {
    icon: "arrowRight",
    onClick: () => nav.reset('home')
  }, "Ingresar"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 22,
      fontSize: 16,
      color: T.inkMuted
    }
  }, "\xBFTodav\xEDa no ten\xE9s cuenta?", ' ', /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.go('crear-cuenta'),
    style: {
      border: 'none',
      background: 'transparent',
      color: T.green,
      font: 'inherit',
      fontSize: 16,
      fontWeight: 700,
      cursor: 'pointer',
      padding: 0
    }
  }, "Crear una cuenta nueva"))));
}
Object.assign(window, {
  WelcomeScreen,
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-auth.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-content.jsx
try { (() => {
// RetinApp — Historia completa (longitudinal timeline) + Aprender + article.

const HISTORY = [{
  month: 'Julio 2026',
  items: [{
    cat: 'Visión',
    icon: 'eye',
    tone: 'amber',
    title: 'Agudeza visual orientativa',
    lines: ['OD: 20/25 · OI: 20/40', 'Confiabilidad: Media'],
    date: '02/07',
    go: 'vision-result',
    params: {
      od: '20/25',
      oi: '20/40',
      reliabilityHits: 1,
      date: '02/07/2026',
      fromHistory: true
    }
  }]
}, {
  month: 'Junio 2026',
  items: [{
    cat: 'Laboratorio',
    icon: 'flask',
    tone: 'blue',
    title: 'Laboratorio cargado',
    lines: ['HbA1c: 7,1%', 'Creatinina: 0,9 mg/dL'],
    date: '10/06',
    go: 'lab-extract'
  }]
}, {
  month: 'Marzo 2026',
  items: [{
    cat: 'Retina',
    icon: 'retina',
    tone: 'green',
    title: 'Control de retina · Retinar',
    lines: ['Resultado: sin progresión', 'Validado por Dr. L. Méndez'],
    date: '12/03',
    go: 'informe-retina',
    params: {
      date: '12/03/2026'
    }
  }, {
    cat: 'Laboratorio',
    icon: 'droplet',
    tone: 'amber',
    title: 'HbA1c reportada',
    lines: ['7,1% — mejoró vs. control anterior'],
    date: '02/03',
    go: 'salud'
  }]
}, {
  month: 'Enero 2026',
  items: [{
    cat: 'Actividad',
    icon: 'footprints',
    tone: 'neutral',
    title: 'Actividad física',
    lines: ['Promedio semanal: 4 días'],
    date: '—',
    go: 'salud'
  }]
}, {
  month: 'Octubre 2025',
  items: [{
    cat: 'Retina',
    icon: 'retina',
    tone: 'red',
    title: 'Informe oftalmológico',
    lines: ['Control recomendado — retinopatía referible', 'Pendiente de revisión médica'],
    date: '18/10',
    go: 'informe-retina',
    params: {
      date: '18/10/2025'
    }
  }]
}, {
  month: 'Agosto 2025',
  items: [{
    cat: 'Laboratorio',
    icon: 'droplet',
    tone: 'red',
    title: 'HbA1c reportada',
    lines: ['8,2% — fuera de objetivo'],
    date: '14/08',
    go: 'salud'
  }, {
    cat: 'Consultas',
    icon: 'stethoscope',
    tone: 'green',
    title: 'Consulta de diabetología',
    lines: ['Ajuste de tratamiento'],
    date: '10/08',
    go: 'doc-view',
    params: {
      title: 'Consulta de diabetología',
      meta: '10/08/2025'
    }
  }]
}];
const HIST_FILTERS = ['Todos', 'Retina', 'Laboratorio', 'Visión', 'Actividad', 'Consultas', 'Síntomas'];
function HistoriaScreen({
  nav
}) {
  const [f, setF] = React.useState('Todos');
  const groups = HISTORY.map(g => ({
    ...g,
    items: f === 'Todos' ? g.items : g.items.filter(i => i.cat === f)
  })).filter(g => g.items.length);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Mi historia de salud",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Tu diabetes, ordenada en una sola l\xEDnea de tiempo."
  }, "Mi historia de salud"), /*#__PURE__*/React.createElement("div", {
    className: "ru-scroll",
    style: {
      display: 'flex',
      gap: 9,
      overflowX: 'auto',
      padding: '4px 22px 6px'
    }
  }, HIST_FILTERS.map(x => /*#__PURE__*/React.createElement(Chip, {
    key: x,
    active: f === x,
    onClick: () => setF(x)
  }, x))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 22px 0'
    }
  }, groups.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkMuted,
      fontSize: 16,
      textAlign: 'center',
      padding: '40px 0'
    }
  }, "Sin eventos en esta categor\xEDa."), groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.month,
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: T.green,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      padding: '12px 0 10px'
    }
  }, g.month), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, g.items.map((it, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    pad: 15,
    onClick: () => it.go === 'salud' ? nav.tab('salud') : nav.go(it.go, it.params),
    style: {
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: it.icon,
    tone: it.tone,
    size: 46
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16.5,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, it.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600,
      flexShrink: 0
    }
  }, it.date)), it.lines.map((l, k) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      marginTop: 3
    }
  }, l)))))))))));
}
const LEARN = [{
  id: 'diabetes',
  icon: 'droplet',
  tone: 'green',
  title: 'Diabetes',
  sub: 'Qué es y cómo controlarla'
}, {
  id: 'rd',
  icon: 'retina',
  tone: 'green',
  title: 'Retinopatía diabética',
  sub: 'Cómo proteger tu visión'
}, {
  id: 'nefro',
  icon: 'kidney',
  tone: 'amber',
  title: 'Nefropatía',
  sub: 'Cómo cuidar tus riñones'
}, {
  id: 'neuro',
  icon: 'activity',
  tone: 'blue',
  title: 'Neuropatía',
  sub: 'Síntomas que conviene vigilar'
}, {
  id: 'cardio',
  icon: 'heart',
  tone: 'red',
  title: 'Cardiopatía',
  sub: 'Diabetes y salud del corazón'
}, {
  id: 'pie',
  icon: 'footprints',
  tone: 'neutral',
  title: 'Pie diabético',
  sub: 'Cuidados diarios'
}, {
  id: 'alim',
  icon: 'utensils',
  tone: 'amber',
  title: 'Alimentación',
  sub: 'Consejos simples para comer mejor'
}, {
  id: 'act',
  icon: 'bike',
  tone: 'green',
  title: 'Actividad física',
  sub: 'Movimiento adaptado a tu etapa de vida'
}, {
  id: 'ia',
  icon: 'bot',
  tone: 'blue',
  title: 'La IA en tus estudios',
  sub: 'Cómo se lee tu retinografía',
  route: 'ia-info'
}];

// Short explainer videos, linked from Aprender and (when relevant) from the
// matching artículo. Placeholder player — no real video hosting in this mock.
const VIDEOS = [{
  id: 'rd',
  tone: 'green',
  title: '¿Qué es la retinopatía diabética?',
  duration: '3:12',
  desc: 'Un recorrido simple por cómo la diabetes puede afectar la retina y por qué el control anual es clave.'
}, {
  id: 'hba1c',
  tone: 'amber',
  title: 'Cómo interpretar tu HbA1c',
  duration: '2:40',
  desc: 'Qué significa este valor de laboratorio y qué rango se considera un buen control.'
}, {
  id: 'pie',
  tone: 'neutral',
  title: 'Cuidado diario de tus pies',
  duration: '4:05',
  desc: 'Rutina simple de autoexamen para prevenir heridas y complicaciones.'
}, {
  id: 'ia',
  tone: 'blue',
  title: 'Cómo la IA lee tu retinografía',
  duration: '2:55',
  desc: 'Qué hace el algoritmo con la foto de tu fondo de ojo antes de que la revise un oftalmólogo.'
}];
function getVideo(id) {
  return VIDEOS.find(v => v.id === id) || VIDEOS[0];
}
function VideoCard({
  v,
  nav,
  width = 208
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ru-press",
    onClick: () => nav.go('video', {
      id: v.id
    }),
    style: {
      width,
      flexShrink: 0,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "VIDEO",
    h: 116,
    tone: v.tone,
    radius: T.r
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 999,
      background: 'rgba(12,15,7,0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 16,
    stroke: 0,
    fill: "#fff",
    color: "#fff"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      background: 'rgba(12,15,7,0.78)',
      color: '#fff',
      fontSize: 11.5,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 999
    }
  }, v.duration)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 9,
      lineHeight: 1.3
    }
  }, v.title));
}
function AprenderScreen({
  nav
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    tab: true
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Informaci\xF3n clara para cuidar tu diabetes todos los d\xEDas."
  }, "Aprender"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 16,
    onClick: () => nav.go('articulo', {
      topic: 'rd'
    }),
    style: {
      display: 'flex',
      gap: 15,
      alignItems: 'center',
      background: T.greenSoft,
      border: `1px solid ${T.greenSoftBorder}`,
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "lightbulb",
    tone: "acid",
    size: 52,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: T.greenStrong,
      letterSpacing: '0.03em',
      textTransform: 'uppercase'
    }
  }, "Recomendado para vos"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17.5,
      fontWeight: 700,
      marginTop: 3,
      lineHeight: 1.25
    }
  }, "\xBFPor qu\xE9 controlar mi retina una vez por a\xF1o?")), /*#__PURE__*/React.createElement(Icon, {
    name: "arrowRight",
    size: 20,
    stroke: 2.2,
    color: T.greenStrong
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Videos explicativos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ru-scroll",
    style: {
      display: 'flex',
      gap: 14,
      overflowX: 'auto',
      paddingBottom: 4
    }
  }, VIDEOS.map(v => /*#__PURE__*/React.createElement(VideoCard, {
    key: v.id,
    v: v,
    nav: nav
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px 0',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, LEARN.map(c => /*#__PURE__*/React.createElement(Card, {
    key: c.id,
    pad: 16,
    onClick: () => c.route ? nav.go(c.route) : nav.go('articulo', {
      topic: c.id,
      title: c.title
    }),
    style: {
      minHeight: 132,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: c.icon,
    tone: c.tone,
    size: 48,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginTop: 12,
      letterSpacing: '-0.01em'
    }
  }, c.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: T.inkMuted,
      marginTop: 3,
      lineHeight: 1.3
    }
  }, c.sub)))));
}
function ArticuloScreen({
  nav,
  params
}) {
  const [saved, setSaved] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Aprender",
    onBack: () => nav.back(),
    trailing: /*#__PURE__*/React.createElement("button", {
      className: "ru-press",
      onClick: () => setSaved(!saved),
      style: {
        border: 'none',
        background: 'transparent',
        color: saved ? T.green : T.inkMuted,
        cursor: 'pointer',
        padding: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bookmark",
      size: 22,
      stroke: 2,
      fill: saved ? T.green : 'none'
    }))
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: "green",
    icon: "eye"
  }, "Retinopat\xEDa diab\xE9tica"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 27,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      marginTop: 14
    }
  }, "\xBFPor qu\xE9 tengo que controlar mi retina una vez por a\xF1o?")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "ILUSTRACI\xD3N \u2014 el ojo y la retina, estilo c\xE1lido y simple",
    h: 190,
    tone: "green",
    radius: T.rLg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 26px 0'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      lineHeight: 1.6,
      color: T.ink
    }
  }, "La diabetes puede afectar los peque\xF1os vasos de la retina, la parte del ojo que nos permite ver con detalle."), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.greenSoft,
      borderLeft: `4px solid ${T.green}`,
      borderRadius: '4px 14px 14px 4px',
      padding: '16px 18px',
      margin: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: T.greenStrong,
      lineHeight: 1.45
    }
  }, "Muchas veces no da s\xEDntomas al principio.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      lineHeight: 1.6,
      color: T.ink
    }
  }, "Por eso, el control anual permite detectar cambios ", /*#__PURE__*/React.createElement("span", {
    className: "ru-mark"
  }, "antes de que afecten la visi\xF3n"), ". Cuanto antes se detectan, m\xE1s f\xE1cil es cuidarlos."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginTop: 24
    }
  }, [['calendar', 'Una vez al año', 'Es la frecuencia que recomiendan los especialistas si no hay otra indicación.'], ['eye', 'Es rápido e indoloro', 'El estudio de fondo de ojo toma pocos minutos.'], ['shield', 'Prevenir es cuidar', 'Detectar a tiempo protege tu visión a futuro.']].map(([ic, t, d]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      gap: 13,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: ic,
    tone: "green",
    size: 42,
    stroke: 1.9
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16.5,
      fontWeight: 700
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      marginTop: 2,
      lineHeight: 1.4
    }
  }, d)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 26px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 14,
    onClick: () => nav.go('video', {
      id: 'rd'
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 64,
      height: 48,
      borderRadius: 10,
      overflow: 'hidden',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "VIDEO",
    h: 48,
    tone: "green",
    radius: 10
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 14,
    stroke: 0,
    fill: "#fff",
    color: "#fff"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSubtle,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.03em'
    }
  }, "Video relacionado"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15.5,
      fontWeight: 700,
      marginTop: 2
    }
  }, "\xBFQu\xE9 es la retinopat\xEDa diab\xE9tica?")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 18,
    stroke: 2.2,
    color: T.inkSubtle
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 28px 0',
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: saved ? 'soft' : 'secondary',
    icon: "bookmark",
    onClick: () => setSaved(!saved)
  }, saved ? 'Guardado' : 'Guardar'), /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    icon: "share",
    onClick: () => {}
  }, "Compartir"))));
}
function VideoScreen({
  nav,
  params
}) {
  const v = getVideo(params?.id);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Video",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "REPRODUCTOR DE VIDEO",
    h: 220,
    tone: v.tone,
    radius: T.rLg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 999,
      background: 'rgba(12,15,7,0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 26,
    stroke: 0,
    fill: "#fff",
    color: "#fff"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      background: 'rgba(12,15,7,0.78)',
      color: '#fff',
      fontSize: 12.5,
      fontWeight: 700,
      padding: '5px 11px',
      borderRadius: 999
    }
  }, v.duration))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: v.tone,
    icon: "book"
  }, "Video explicativo"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 14,
      lineHeight: 1.25
    }
  }, v.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16.5,
      color: T.inkMuted,
      marginTop: 10,
      lineHeight: 1.5
    }
  }, v.desc)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    icon: "share",
    onClick: () => {}
  }, "Compartir video"))));
}
Object.assign(window, {
  HistoriaScreen,
  AprenderScreen,
  ArticuloScreen,
  VideoScreen,
  VIDEOS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-content.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-estudios.jsx
try { (() => {
// RetinApp — Estudios: repository, upload category, upload flow, lab auto-extraction.

const STUDY_CATS = [{
  id: 'oft',
  icon: 'eye',
  tone: 'green',
  title: 'Fondo de ojo / Retinografía',
  desc: 'Retinografía de campo amplio, fondo de ojo, informes oftalmológicos'
}, {
  id: 'oct',
  icon: 'retina',
  tone: 'blue',
  title: 'OCT / OCT-A',
  desc: 'Tomografía de coherencia óptica, angiografía OCT, OCT de segmento anterior'
}, {
  id: 'angio',
  icon: 'activity',
  tone: 'amber',
  title: 'Angiografía',
  desc: 'Angiografía fluoresceínica, angiografía con indocianina verde (ICG)'
}, {
  id: 'lab',
  icon: 'flask',
  tone: 'blue',
  title: 'Laboratorio',
  desc: 'HbA1c, glucemia, colesterol, función renal'
}, {
  id: 'renal',
  icon: 'kidney',
  tone: 'amber',
  title: 'Estudio renal',
  desc: 'Creatinina, filtrado glomerular, microalbuminuria'
}, {
  id: 'cardio',
  icon: 'heart',
  tone: 'red',
  title: 'Estudio cardiovascular',
  desc: 'ECG, ecocardiograma, presión arterial, informes'
}, {
  id: 'pie',
  icon: 'footprints',
  tone: 'neutral',
  title: 'Pie diabético',
  desc: 'Controles, heridas, curaciones, informes'
}, {
  id: 'consulta',
  icon: 'stethoscope',
  tone: 'green',
  title: 'Consulta médica',
  desc: 'Diabetología, clínica médica, nutrición u otras'
}, {
  id: 'otro',
  icon: 'file',
  tone: 'neutral',
  title: 'Otro documento',
  desc: 'Cualquier otro estudio relacionado con tu diabetes'
}];
const STUDIES = [{
  cat: 'Retina',
  icon: 'retina',
  tone: 'green',
  title: 'Informe de retina',
  meta: `${RETINA_REPORTS[0].inst} — ${RETINA_REPORTS[0].date}`,
  badge: RETINA_REPORTS[0].resultLabel,
  badgeTone: RETINA_REPORTS[0].tone,
  action: 'Abrir',
  go: 'informe-retina',
  params: {
    date: RETINA_REPORTS[0].date
  }
}, {
  cat: 'Laboratorio',
  icon: 'flask',
  tone: 'blue',
  title: 'Laboratorio',
  meta: 'Sanatorio Tandil — 10/06/2026',
  badge: 'HbA1c 7,1%',
  badgeTone: 'blue',
  action: 'Ver resultados',
  go: 'lab-extract'
}, {
  cat: 'Riñón',
  icon: 'kidney',
  tone: 'amber',
  title: 'Control nefrológico',
  meta: 'Hospital Municipal — 04/05/2026',
  action: 'Abrir',
  go: 'doc-view'
}, {
  cat: 'Retina',
  icon: 'retina',
  tone: RETINA_REPORTS[1].tone,
  title: 'Retinografía',
  meta: `${RETINA_REPORTS[1].inst} — ${RETINA_REPORTS[1].date}`,
  badge: RETINA_REPORTS[1].resultLabel,
  badgeTone: RETINA_REPORTS[1].tone,
  action: 'Abrir',
  go: 'informe-retina',
  params: {
    date: RETINA_REPORTS[1].date
  }
}, {
  cat: 'Corazón',
  icon: 'heart',
  tone: 'red',
  title: 'Electrocardiograma',
  meta: 'Cardiocentro — 22/02/2026',
  action: 'Abrir',
  go: 'doc-view'
}, {
  cat: 'Consultas',
  icon: 'stethoscope',
  tone: 'green',
  title: 'Consulta de diabetología',
  meta: 'Dra. Acosta — 02/03/2026',
  action: 'Abrir',
  go: 'doc-view'
}];
const FILTERS = ['Todos', 'Retina', 'Laboratorio', 'Riñón', 'Corazón', 'Pie diabético', 'Consultas', 'Otros'];
function StudyCard({
  s,
  nav
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: 15,
    onClick: () => nav.go(s.go || 'doc-view', s.params || {
      title: s.title,
      meta: s.meta
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: s.icon,
    tone: s.tone,
    size: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      marginTop: 2
    }
  }, s.meta), s.badge && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: s.badgeTone
  }, s.badge))), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    stroke: 2.2,
    color: T.inkSubtle
  }));
}
function EstudiosScreen({
  nav
}) {
  const [filter, setFilter] = React.useState('Todos');
  const [query, setQuery] = React.useState('');
  const q = query.trim().toLowerCase();
  const list = STUDIES.filter(s => filter === 'Todos' || s.cat === filter).filter(s => !q || [s.title, s.meta, s.cat].join(' ').toLowerCase().includes(q));
  return /*#__PURE__*/React.createElement(Screen, {
    tab: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, "Mis estudios"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      marginTop: 4
    }
  }, "Todos tus documentos m\xE9dicos, en un solo lugar.")), /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.go('upload-type'),
    style: {
      width: 44,
      height: 44,
      borderRadius: 999,
      border: 'none',
      background: T.green,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 5px 14px rgba(92,122,11,0.3)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 24,
    stroke: 2.4
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 14,
      padding: '4px 15px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 20,
    stroke: 2.1,
    color: T.inkSubtle
  }), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Buscar por tipo, fecha o instituci\xF3n",
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: T.font,
      fontSize: 16.5,
      color: T.ink,
      padding: '11px 0'
    }
  }), query && /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => setQuery(''),
    style: {
      border: 'none',
      background: T.canvas,
      borderRadius: 999,
      width: 26,
      height: 26,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.inkSubtle,
      cursor: 'pointer',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 14,
    stroke: 2.4
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ru-scroll",
    style: {
      display: 'flex',
      gap: 9,
      overflowX: 'auto',
      padding: '16px 22px 4px',
      margin: 0
    }
  }, FILTERS.map(f => /*#__PURE__*/React.createElement(Chip, {
    key: f,
    active: filter === f,
    onClick: () => setFilter(f)
  }, f))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, list.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkMuted,
      fontSize: 16,
      textAlign: 'center',
      padding: '40px 0'
    }
  }, "No encontramos estudios que coincidan."), list.map((s, i) => /*#__PURE__*/React.createElement(StudyCard, {
    key: i,
    s: s,
    nav: nav
  }))));
}
function UploadTypeScreen({
  nav
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Subir estudio",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Pod\xE9s cargar fotos, PDFs o archivos digitales. RetinAPP los ordena autom\xE1ticamente en tu historia de salud."
  }, "\xBFQu\xE9 estudio quer\xE9s subir?"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, STUDY_CATS.map(c => /*#__PURE__*/React.createElement(Card, {
    key: c.id,
    pad: 16,
    onClick: () => nav.go('upload-source', {
      cat: c.id,
      title: c.title
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: c.icon,
    tone: c.tone,
    size: 52,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17.5,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, c.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkMuted,
      marginTop: 3,
      lineHeight: 1.35
    }
  }, c.desc)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    stroke: 2.2,
    color: T.inkSubtle
  }))))));
}
function UploadSourceScreen({
  nav,
  params
}) {
  const opts = [{
    icon: 'camera',
    tone: 'green',
    label: 'Sacar foto',
    desc: 'Usá la cámara del teléfono'
  }, {
    icon: 'image',
    tone: 'blue',
    label: 'Elegir desde galería',
    desc: 'Fotos guardadas en el teléfono'
  }, {
    icon: 'file',
    tone: 'amber',
    label: 'Subir PDF',
    desc: 'Documentos digitales'
  }, {
    icon: 'folder',
    tone: 'neutral',
    label: 'Elegir archivo',
    desc: 'Desde tus archivos'
  }];
  const isLab = params?.cat === 'lab';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: params?.title || 'Subir archivo',
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Eleg\xED c\xF3mo quer\xE9s agregar tu estudio. Es r\xE1pido y seguro."
  }, "Subir archivo"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, opts.map(o => /*#__PURE__*/React.createElement(Card, {
    key: o.label,
    pad: 16,
    onClick: () => nav.go('upload-preview', {
      cat: params?.cat,
      isLab
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: o.icon,
    tone: o.tone,
    size: 52,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700
    }
  }, o.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkMuted,
      marginTop: 2
    }
  }, o.desc)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    stroke: 2.2,
    color: T.inkSubtle
  }))))));
}
function UploadPreviewScreen({
  nav,
  params
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Previsualizaci\xF3n",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Asegurate de que el documento se lea claramente antes de continuar."
  }, "Revis\xE1 que se vea bien"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "VISTA PREVIA \u2014 foto / PDF del estudio cargado",
    h: 320,
    tone: "blue",
    radius: T.rLg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go(params?.isLab ? 'lab-extract' : 'upload-meta', {
      cat: params?.cat
    })
  }, "Se ve bien"), /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    icon: "camera",
    onClick: () => nav.back()
  }, "Volver a sacar foto"))));
}
function UploadMetaScreen({
  nav
}) {
  const [d, setD] = React.useState({
    fecha: '',
    inst: '',
    prof: '',
    com: ''
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Datos del estudio",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Sum\xE1 un poco de contexto para encontrarlo f\xE1cil m\xE1s adelante."
  }, "Agreg\xE1 algunos datos"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Fecha del estudio",
    value: d.fecha,
    onChange: v => setD({
      ...d,
      fecha: v
    }),
    placeholder: "10/06/2026"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Instituci\xF3n",
    value: d.inst,
    onChange: v => setD({
      ...d,
      inst: v
    }),
    placeholder: "Sanatorio Tandil"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Profesional (opcional)",
    value: d.prof,
    onChange: v => setD({
      ...d,
      prof: v
    }),
    placeholder: "Dra. Acosta"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Comentario (opcional)",
    value: d.com,
    onChange: v => setD({
      ...d,
      com: v
    }),
    placeholder: "Notas que quieras recordar"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'estudio'
    })
  }, "Guardar estudio")))));
}
function LabValueRow({
  v,
  last,
  onEdit
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 0',
      borderBottom: last ? 'none' : `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, v.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      marginTop: 2
    }
  }, v.value, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: T.inkMuted
    }
  }, v.unit))), v.flag && /*#__PURE__*/React.createElement(StatusPill, {
    tone: v.flagTone
  }, v.flag), /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onEdit,
    style: {
      border: `1px solid ${T.line}`,
      background: T.card,
      borderRadius: 999,
      width: 38,
      height: 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.green,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 17,
    stroke: 2
  })));
}
function LabExtractScreen({
  nav
}) {
  const [showOriginal, setShowOriginal] = React.useState(false);
  const vals = [{
    name: 'HbA1c',
    value: '7,1',
    unit: '%',
    flag: 'En objetivo',
    flagTone: 'green'
  }, {
    name: 'Glucemia',
    value: '132',
    unit: 'mg/dL'
  }, {
    name: 'Creatinina',
    value: '0,9',
    unit: 'mg/dL'
  }, {
    name: 'Filtrado glomerular',
    value: '86',
    unit: 'ml/min',
    flag: 'Normal',
    flagTone: 'green'
  }, {
    name: 'Microalbuminuria',
    value: '24',
    unit: 'mg/g'
  }, {
    name: 'Colesterol LDL',
    value: '112',
    unit: 'mg/dL',
    flag: 'Atención',
    flagTone: 'amber'
  }, {
    name: 'Triglicéridos',
    value: '145',
    unit: 'mg/dL'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Resultados detectados",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: "blue",
    icon: "flask"
  }, "Lectura autom\xE1tica del laboratorio")), /*#__PURE__*/React.createElement(Title, {
    sub: "Confirm\xE1 si los valores son correctos antes de guardarlos. Pod\xE9s editar cualquiera.",
    style: {
      paddingTop: 14
    }
  }, "Encontramos estos resultados"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => setShowOriginal(v => !v),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      border: `1.5px solid ${T.line}`,
      background: T.card,
      borderRadius: 999,
      padding: '9px 16px',
      fontFamily: T.font,
      fontSize: 14.5,
      fontWeight: 700,
      color: T.green,
      cursor: 'pointer',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: showOriginal ? 'chevronDown' : 'image',
    size: 17,
    stroke: 2.1
  }), showOriginal ? 'Ocultar documento original' : 'Ver documento original para comparar'), showOriginal && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "DOCUMENTO ESCANEADO \u2014 original subido por vos",
    h: 220,
    tone: "blue",
    radius: T.rLg
  })), /*#__PURE__*/React.createElement(Card, {
    pad: '4px 18px'
  }, vals.map((v, i) => /*#__PURE__*/React.createElement(LabValueRow, {
    key: v.name,
    v: v,
    last: i === vals.length - 1,
    onEdit: () => {}
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      background: T.amberSoft,
      borderRadius: 14,
      padding: '13px 15px',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 19,
    stroke: 2,
    color: T.amberStrong,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: T.amberStrong,
      lineHeight: 1.4
    }
  }, "Estos datos no reemplazan la consulta m\xE9dica. Comparalos con el documento original antes de guardar."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'laboratorio'
    })
  }, "Guardar en mi historia"))));
}
function SavedScreen({
  nav,
  params
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    bg: T.canvas,
    padTop: T.safeTop,
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 96,
      borderRadius: 999,
      background: T.greenSoft,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.green
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 52,
    stroke: 2.4
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 26
    }
  }, params?.kind === 'laboratorio' ? 'Resultados guardados' : params?.kind === 'agudeza' ? 'Resultado guardado' : '¡Valor guardado!'), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: T.inkMuted,
      marginTop: 10,
      lineHeight: 1.45
    }
  }, "Este dato se agreg\xF3 a tu l\xEDnea de tiempo de salud.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 28px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    onClick: () => nav.go('historia')
  }, "Ver en mi historia"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => nav.reset('home')
  }, "Volver al inicio")));
}
Object.assign(window, {
  EstudiosScreen,
  UploadTypeScreen,
  UploadSourceScreen,
  UploadPreviewScreen,
  UploadMetaScreen,
  LabExtractScreen,
  SavedScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-estudios.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-extra.jsx
try { (() => {
// RetinApp — new supporting screens added per product critique:
// account creation flow, appointment/urgent contact, caregiver access,
// AI-transparency explainer, and a generic document viewer.

function CreateAccountScreen({
  nav
}) {
  const [d, setD] = React.useState({
    dni: '',
    genero: '',
    nombres: '',
    apellidos: '',
    calle: '',
    numero: '',
    piso: '',
    depto: '',
    ciudad: '',
    provincia: '',
    coberturaTiene: null,
    obraSocial: '',
    codigoAfiliado: '',
    telefono: '',
    email: ''
  });
  const set = k => v => setD(p => ({
    ...p,
    [k]: v
  }));
  const canSubmit = d.dni.trim() && d.genero && d.nombres.trim() && d.apellidos.trim() && d.calle.trim() && d.numero.trim() && d.ciudad.trim() && d.provincia && d.coberturaTiene !== null && (d.coberturaTiene === false || d.obraSocial.trim() && d.codigoAfiliado.trim()) && d.telefono.trim() && d.email.trim();
  function handleSubmit() {
    if (!canSubmit) return;
    const username = generateUsername(d.apellidos, d.dni);
    const password = generatePassword();
    nav.updateProfile({
      ...d,
      username,
      password,
      healthQuizDone: false,
      health: {
        peso: '',
        altura: '',
        glaucomaFamiliar: '',
        aniosDiabetes: '',
        complicaciones: [],
        complicacionOtro: '',
        medicacion: []
      }
    });
    nav.go('cuenta-creada');
  }
  const sectionLabel = t => /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: T.green,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      margin: '22px 0 12px'
    }
  }, t);
  return /*#__PURE__*/React.createElement(Screen, {
    bg: T.card,
    padTop: T.safeTop
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.back(),
    style: {
      border: 'none',
      background: 'transparent',
      color: T.green,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      font: 'inherit',
      fontSize: 17,
      fontWeight: 600,
      padding: '6px 0',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 24,
    stroke: 2.4
  }), " Atr\xE1s")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 28px 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 27,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, "Cre\xE1 tu cuenta"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: T.inkMuted,
      marginTop: 8,
      lineHeight: 1.45
    }
  }, "Complet\xE1 tus datos. Te vamos a enviar tu usuario y contrase\xF1a por correo.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 28px 24px'
    }
  }, sectionLabel('Datos personales'), /*#__PURE__*/React.createElement(Field, {
    label: "DNI",
    value: d.dni,
    onChange: set('dni'),
    placeholder: "00.000.000",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 7,
      paddingLeft: 2
    }
  }, "G\xE9nero"), /*#__PURE__*/React.createElement(Seg, {
    options: [{
      value: 'M',
      label: 'Masculino'
    }, {
      value: 'F',
      label: 'Femenino'
    }, {
      value: 'X',
      label: 'X'
    }],
    value: d.genero,
    onChange: set('genero')
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Nombres",
    value: d.nombres,
    onChange: set('nombres'),
    placeholder: "Mar\xEDa Beatriz"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Apellidos",
    value: d.apellidos,
    onChange: set('apellidos'),
    placeholder: "Ferreyra"
  }), sectionLabel('Domicilio'), /*#__PURE__*/React.createElement(Field, {
    label: "Calle",
    value: d.calle,
    onChange: set('calle'),
    placeholder: "Av. Rivadavia"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1.2
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "N\xFAmero",
    value: d.numero,
    onChange: set('numero'),
    placeholder: "1240",
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Piso (opc.)",
    value: d.piso,
    onChange: set('piso'),
    placeholder: "3"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Depto (opc.)",
    value: d.depto,
    onChange: set('depto'),
    placeholder: "B"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Ciudad",
    value: d.ciudad,
    onChange: set('ciudad'),
    placeholder: "Tandil"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Provincia",
    value: d.provincia,
    onChange: set('provincia'),
    options: PROVINCIAS_AR,
    placeholder: "Eleg\xED tu provincia"
  }), sectionLabel('Cobertura de salud'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 7,
      paddingLeft: 2
    }
  }, "\xBFTen\xE9s cobertura social?"), /*#__PURE__*/React.createElement(Seg, {
    options: [{
      value: true,
      label: 'Sí'
    }, {
      value: false,
      label: 'No'
    }],
    value: d.coberturaTiene,
    onChange: set('coberturaTiene')
  })), d.coberturaTiene === true && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "Obra social / prepaga",
    value: d.obraSocial,
    onChange: set('obraSocial'),
    placeholder: "IOMA"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "C\xF3digo de afiliado",
    value: d.codigoAfiliado,
    onChange: set('codigoAfiliado'),
    placeholder: "0245981103"
  })), sectionLabel('Contacto'), /*#__PURE__*/React.createElement(Field, {
    label: "Tel\xE9fono",
    value: d.telefono,
    onChange: set('telefono'),
    placeholder: "+54 9 249 400-0000",
    inputMode: "tel"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    value: d.email,
    onChange: set('email'),
    placeholder: "vos@email.com",
    inputMode: "email"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '8px 0 22px'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    disabled: !canSubmit,
    onClick: handleSubmit
  }, "Crear mi cuenta")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 16,
      color: T.inkMuted
    }
  }, "\xBFYa ten\xE9s cuenta?", ' ', /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.go('login'),
    style: {
      border: 'none',
      background: 'transparent',
      color: T.green,
      font: 'inherit',
      fontSize: 16,
      fontWeight: 700,
      cursor: 'pointer',
      padding: 0
    }
  }, "Ingresar"))));
}
function AccountCreatedScreen({
  nav
}) {
  const p = nav.profile || {};
  return /*#__PURE__*/React.createElement(Screen, {
    bg: T.canvas,
    padTop: T.safeTop,
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 26px 0',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 74,
      height: 74,
      borderRadius: 999,
      background: T.greenSoft,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.green,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 40,
    stroke: 2.4
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 20,
      textAlign: 'center'
    }
  }, "\xA1Tu cuenta fue creada!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: T.inkMuted,
      marginTop: 8,
      lineHeight: 1.45,
      textAlign: 'center'
    }
  }, "Te enviamos un correo a ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: T.ink
    }
  }, p.email), " con tu usuario y contrase\xF1a."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '13px 18px',
      borderBottom: `1px solid ${T.line}`,
      background: T.cardSoft,
      borderRadius: `${T.r - 1}px ${T.r - 1}px 0 0`
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mail",
    size: 18,
    stroke: 2,
    color: T.inkSubtle
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, "Correo enviado a ", p.email)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      lineHeight: 1.5
    }
  }, "Hola ", p.nombres, ", ya pod\xE9s ingresar a RetinAPP con estos datos:"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSubtle,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.03em'
    }
  }, "Usuario"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      letterSpacing: '-0.01em',
      marginTop: 2
    }
  }, p.username)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSubtle,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.03em'
    }
  }, "Contrase\xF1a"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      letterSpacing: '-0.01em',
      marginTop: 2
    }
  }, p.password))))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: T.inkSubtle,
      marginTop: 14,
      lineHeight: 1.4,
      textAlign: 'center'
    }
  }, "Te recomendamos cambiar tu contrase\xF1a despu\xE9s de ingresar por primera vez.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 28px 16px'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "arrowRight",
    onClick: () => nav.reset('home')
  }, "Ingresar a RetinAPP")));
}
const CONTACT_COPY = {
  turno: {
    title: 'Pedir turno',
    tone: 'green',
    body: 'Comunicate con tu institución para coordinar el próximo control. Ellos van a agendar el turno con el especialista disponible.'
  },
  urgente: {
    title: 'Control urgente recomendado',
    tone: 'red',
    body: 'Este resultado sugiere retinopatía referible. Pedí un turno con oftalmología lo antes posible para confirmar el diagnóstico.'
  },
  sintoma: {
    title: 'Contactar a mi equipo de salud',
    tone: 'red',
    body: 'Contanos lo que sentís apenas puedas hablar con un profesional. Si el síntoma es intenso o repentino, no esperes: buscá atención inmediata.'
  },
  valor: {
    title: 'Contactar a mi equipo de salud',
    tone: 'amber',
    body: 'Este valor está fuera de lo esperado. Tu equipo de salud puede ayudarte a interpretarlo.'
  }
};
function ContactoScreen({
  nav,
  params
}) {
  const kind = params?.reason || 'turno';
  const c = CONTACT_COPY[kind] || CONTACT_COPY.turno;
  const t = TONES[c.tone];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: c.title,
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: 17,
      background: t.bg,
      color: t.fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.tone === 'red' ? 'alert' : 'phone',
    size: 30,
    stroke: 1.9
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 16,
      lineHeight: 1.2
    }
  }, c.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: T.inkMuted,
      marginTop: 10,
      lineHeight: 1.45
    }
  }, c.body)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 0
  }, /*#__PURE__*/React.createElement(ListRow, {
    icon: "building",
    tone: "green",
    title: "Hospital El Cruce",
    subtitle: "Servicio de Oftalmolog\xEDa"
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "phone",
    tone: "blue",
    title: "0800 444 0000",
    subtitle: "L\xEDnea de turnos",
    last: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:08004440000",
    style: {
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "phone",
    variant: c.tone === 'red' ? 'danger' : 'primary'
  }, "Llamar ahora")), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => nav.back()
  }, "Volver"))));
}
function CuidadorScreen({
  nav
}) {
  const [people, setPeople] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [rel, setRel] = React.useState('Hijo/a');
  const add = () => {
    if (!name.trim()) return;
    setPeople(p => [...p, {
      name,
      rel
    }]);
    setName('');
    setShowForm(false);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Acceso compartido",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Dale a un familiar o cuidador acceso para ver tus turnos, recordatorios e informes."
  }, "Acceso compartido"), people.length === 0 && !showForm && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 20,
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "userPlus",
    tone: "green",
    size: 52,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginTop: 12
    }
  }, "Todav\xEDa no agregaste a nadie"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      marginTop: 4,
      lineHeight: 1.4
    }
  }, "Es com\xFAn apoyarse en un hijo/a o cuidador para los turnos y resultados."))), people.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '2px 16px'
  }, people.map((p, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: i,
    icon: "user",
    tone: "green",
    title: p.name,
    subtitle: p.rel,
    last: i === people.length - 1,
    trailing: /*#__PURE__*/React.createElement(StatusPill, {
      tone: "green"
    }, "Con acceso")
  })))), showForm ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nombre",
    value: name,
    onChange: setName,
    placeholder: "Nombre y apellido"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 8
    }
  }, "Relaci\xF3n"), /*#__PURE__*/React.createElement(Seg, {
    options: ['Hijo/a', 'Cónyuge', 'Cuidador/a'],
    value: rel,
    onChange: setRel
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    onClick: add
  }, "Agregar"), /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    variant: "secondary",
    onClick: () => setShowForm(false)
  }, "Cancelar")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "userPlus",
    variant: "secondary",
    onClick: () => setShowForm(true)
  }, "Agregar persona de confianza"))));
}
function IaInfoScreen({
  nav
}) {
  const steps = [['upload', 'Se toma la foto de tu retina', 'En tu institución de salud, con un equipo especializado.'], ['bot', 'Un algoritmo hace una primera lectura', 'Busca signos de retinopatía diabética en segundos.'], ['stethoscope', 'Un oftalmólogo siempre revisa el resultado', 'El informe final que ves en la app está firmado por un profesional.']];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Sobre la IA en tu informe",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "bot",
    tone: "blue",
    size: 56,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 16,
      lineHeight: 1.2
    }
  }, "Un algoritmo ayuda a leer tu estudio \u2014 un m\xE9dico siempre lo revisa")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, steps.map(([ic, t, d], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: ic,
    tone: "green",
    size: 46,
    stroke: 1.9
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16.5,
      fontWeight: 700
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      marginTop: 2,
      lineHeight: 1.4
    }
  }, d))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      background: T.blueSoft,
      borderRadius: 14,
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 19,
    stroke: 2,
    color: T.blueStrong,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: T.blueStrong,
      lineHeight: 1.4
    }
  }, "Mientras un resultado dice \"pendiente de revisi\xF3n\", es s\xF3lo la lectura autom\xE1tica. El diagn\xF3stico definitivo lo da un m\xE9dico.")))));
}
function DocViewScreen({
  nav,
  params
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: params?.title || 'Documento',
    onBack: () => nav.back(),
    trailing: /*#__PURE__*/React.createElement("button", {
      className: "ru-press",
      onClick: () => {},
      style: {
        border: 'none',
        background: 'transparent',
        color: T.green,
        cursor: 'pointer',
        padding: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "share",
      size: 22,
      stroke: 2
    }))
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "VISTA \u2014 documento / imagen del estudio",
    h: 280,
    tone: "blue",
    radius: T.rLg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 700
    }
  }, params?.title || 'Documento'), params?.meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      marginTop: 4
    }
  }, params.meta))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "download",
    onClick: () => {}
  }, "Descargar"), /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    icon: "share",
    onClick: () => {}
  }, "Compartir"))));
}
Object.assign(window, {
  CreateAccountScreen,
  AccountCreatedScreen,
  ContactoScreen,
  CuidadorScreen,
  IaInfoScreen,
  DocViewScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-extra.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-home.jsx
try { (() => {
// RetinApp — Home / health dashboard.
// Simplified per product critique: adults 50–80 often miss horizontal
// carousels and get overwhelmed by dense grids. Home now shows at most
// three stacked modules — status, one recommended next step, and a short
// recent-activity list — instead of greeting + ring + 2x2 grid + carousel +
// timeline all at once. "Subir estudio" is no longer the headline action
// (it's the highest-friction task and, per the business plan, usually done
// by the technician at point of care) — it stays one tap away in Estudios.

function GlassBtn({
  icon,
  onClick,
  badge
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onClick,
    style: {
      position: 'relative',
      width: 44,
      height: 44,
      borderRadius: 999,
      cursor: 'pointer',
      border: `1px solid ${T.line}`,
      background: T.card,
      boxShadow: T.shadow,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.ink
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22,
    stroke: 2
  }), badge && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 9,
      height: 9,
      borderRadius: 999,
      background: T.red,
      border: '2px solid #fff'
    }
  }));
}

// Kept for other screens that still import it.
function MiniCard({
  icon,
  tone,
  label,
  children,
  action,
  onAction,
  onClick
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: 15,
    onClick: onClick,
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 150
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: icon,
    tone: tone,
    size: 40
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 18,
    stroke: 2.2,
    color: T.inkSubtle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginTop: 11
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      marginTop: 4
    }
  }, children), action && /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: e => {
      e.stopPropagation();
      onAction && onAction();
    },
    style: {
      alignSelf: 'flex-start',
      marginTop: 8,
      border: 'none',
      background: 'transparent',
      color: T.green,
      font: 'inherit',
      fontSize: 14.5,
      fontWeight: 700,
      cursor: 'pointer',
      padding: 0
    }
  }, action));
}
function QuickAction({
  icon,
  tone,
  label,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onClick,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 9,
      width: 80,
      flexShrink: 0,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: icon,
    tone: tone,
    size: 62,
    shape: "squircle",
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: T.inkMuted,
      textAlign: 'center',
      lineHeight: 1.2
    }
  }, label));
}
function HomeScreen({
  nav
}) {
  const latest = RETINA_REPORTS[0];
  const p = nav.profile || {};
  const firstName = (p.nombres || 'María').trim().split(' ')[0];
  const initials = ((p.nombres || 'M')[0] + (p.apellidos || 'F')[0]).toUpperCase();
  const events = [{
    icon: 'flask',
    tone: 'blue',
    t: 'Laboratorio cargado',
    d: '10/06/2026'
  }, {
    icon: 'retina',
    tone: 'green',
    t: 'Informe de retina disponible',
    d: '12/03/2026'
  }, {
    icon: 'droplet',
    tone: 'amber',
    t: 'HbA1c reportada — 7,1%',
    d: '02/03/2026'
  }];
  return /*#__PURE__*/React.createElement(Screen, {
    tab: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, "Buen d\xEDa,"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 2
    }
  }, firstName)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement(GlassBtn, {
    icon: "bell",
    badge: true,
    onClick: () => nav.go('novedades')
  }), /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.go('perfil'),
    style: {
      width: 44,
      height: 44,
      borderRadius: 999,
      border: `1px solid ${T.line}`,
      background: T.greenSoft,
      color: T.greenStrong,
      fontWeight: 700,
      fontSize: 17,
      cursor: 'pointer'
    }
  }, initials))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px 0'
    }
  }, latest.referable ? /*#__PURE__*/React.createElement(UrgentCard, {
    icon: "retina",
    title: "Control ocular pendiente de revisi\xF3n",
    body: "Tu \xFAltimo estudio de retina detect\xF3 signos que un oftalm\xF3logo todav\xEDa tiene que confirmar."
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "calendarPlus",
    variant: "danger",
    onClick: () => nav.go('contacto', {
      reason: 'urgente'
    })
  }, "Pedir turno ahora"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => nav.go('informe-retina', {
      date: latest.date
    })
  }, "Ver informe")) : /*#__PURE__*/React.createElement(Card, {
    pad: 20,
    accent: T.green,
    onClick: () => nav.tab('retina', {
      sub: 'retina'
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 70,
      height: 70,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "70",
    height: "70",
    viewBox: "0 0 70 70",
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "35",
    cy: "35",
    r: "31",
    fill: "none",
    stroke: T.greenSoft,
    strokeWidth: "7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "35",
    cy: "35",
    r: "31",
    fill: "none",
    stroke: T.green,
    strokeWidth: "7",
    strokeLinecap: "round",
    strokeDasharray: `${2 * Math.PI * 31 * 0.82} 999`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.green
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "checkCircle",
    size: 30,
    stroke: 2.1
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: T.inkSubtle,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, "Estado de controles"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      marginTop: 3
    }
  }, "Control ocular al d\xEDa"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      marginTop: 16,
      paddingTop: 16,
      borderTop: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, "\xDAltimo control de retina"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginTop: 2
    }
  }, latest.date)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, "Pr\xF3ximo sugerido"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginTop: 2
    }
  }, "Septiembre 2026"))))), /*#__PURE__*/React.createElement(Section, {
    title: "Tu pr\xF3ximo paso"
  }, /*#__PURE__*/React.createElement(HealthCardHome, {
    icon: "droplet",
    tone: "amber",
    label: "Registrar tu HbA1c",
    action: "Registrar",
    onAction: () => nav.go('reg-hba1c')
  }, "Hace 4 meses que no carg\xE1s un valor. Tu \xFAltimo registro fue 7,1%.")), /*#__PURE__*/React.createElement(Section, {
    title: "Recordatorios"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 16,
    onClick: () => nav.go('recordatorios'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "bell",
    tone: "red",
    size: 46
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, "2 controles por agendar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkMuted,
      marginTop: 2
    }
  }, "Ver pendientes")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    stroke: 2.2,
    color: T.inkSubtle
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "\xDAltimos eventos",
    action: /*#__PURE__*/React.createElement("button", {
      className: "ru-press",
      onClick: () => nav.go('historia'),
      style: {
        border: 'none',
        background: 'transparent',
        color: T.green,
        font: 'inherit',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Ver todo")
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '4px 16px'
  }, events.map((e, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: i,
    icon: e.icon,
    tone: e.tone,
    title: e.t,
    subtitle: e.d,
    last: i === events.length - 1,
    onClick: () => nav.go('historia')
  })))));
}
function HealthCardHome({
  icon,
  tone,
  label,
  children,
  action,
  onAction
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: 17,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: icon,
    tone: tone,
    size: 50,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      marginTop: 3,
      lineHeight: 1.35
    }
  }, children)), /*#__PURE__*/React.createElement(Btn, {
    size: "sm",
    variant: "soft",
    full: false,
    onClick: onAction
  }, action));
}
Object.assign(window, {
  HomeScreen,
  GlassBtn,
  MiniCard,
  QuickAction
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-home.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-misc.jsx
try { (() => {
// RetinApp — Recordatorios, Novedades, Perfil, Privacidad.

function RecordatoriosScreen({
  nav
}) {
  const items = [{
    icon: 'retina',
    tone: 'green',
    title: 'Control de retina',
    body: 'Próximo control sugerido en septiembre 2026.',
    action: 'Pedir turno',
    actIcon: 'calendarPlus',
    go: 'contacto',
    params: {
      reason: 'turno'
    }
  }, {
    icon: 'droplet',
    tone: 'amber',
    title: 'HbA1c',
    body: 'Hace 4 meses que no registrás un valor.',
    action: 'Registrar ahora',
    actIcon: 'plus',
    go: 'reg-hba1c'
  }, {
    icon: 'flask',
    tone: 'blue',
    title: 'Laboratorio',
    body: 'Consultá con tu médico si corresponde repetirlo.',
    action: 'Marcar como hecho',
    actIcon: 'check'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Recordatorios",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Peque\xF1os avisos amables para mantener tus controles al d\xEDa."
  }, "Recordatorios"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    pad: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: it.icon,
    tone: it.tone,
    size: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17.5,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      marginTop: 4,
      lineHeight: 1.4
    }
  }, it.body))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    variant: "soft",
    icon: it.actIcon,
    onClick: () => it.go ? nav.go(it.go, it.params) : null
  }, it.action)))))));
}
function NovedadesScreen({
  nav
}) {
  const items = [{
    icon: 'retina',
    tone: 'green',
    title: 'Tu informe de retina ya está disponible',
    time: 'Hace 2 h',
    unread: true,
    go: 'informe-retina'
  }, {
    icon: 'droplet',
    tone: 'amber',
    title: 'Recordá registrar tu HbA1c',
    time: 'Ayer',
    unread: true,
    go: 'reg-hba1c'
  }, {
    icon: 'book',
    tone: 'blue',
    title: 'Nuevo artículo recomendado: cómo cuidar tus riñones',
    time: 'Hace 2 días',
    go: 'articulo'
  }, {
    icon: 'calendar',
    tone: 'neutral',
    title: 'Tu próximo control ocular está cerca',
    time: 'Hace 4 días',
    go: 'recordatorios'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Novedades",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, null, "Novedades"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '4px 16px'
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ru-press",
    onClick: () => nav.go(it.go),
    style: {
      display: 'flex',
      gap: 13,
      alignItems: 'center',
      padding: '14px 0',
      borderBottom: i === items.length - 1 ? 'none' : `1px solid ${T.line}`,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: it.icon,
    tone: it.tone,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.3
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: T.inkSubtle,
      marginTop: 3
    }
  }, it.time)), it.unread && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 999,
      background: T.green,
      flexShrink: 0
    }
  })))))));
}
function PerfilScreen({
  nav
}) {
  const scaleOpts = [{
    value: 1,
    label: 'Normal'
  }, {
    value: 1.15,
    label: 'Grande'
  }, {
    value: 1.3,
    label: 'Muy grande'
  }];
  const p = nav.profile || {};
  const nombreCompleto = [p.nombres, p.apellidos].filter(Boolean).join(' ') || 'María Beatriz Ferreyra';
  const initials = ((p.nombres || 'M')[0] + (p.apellidos || 'F')[0]).toUpperCase();
  const domicilio = [[p.calle, p.numero].filter(Boolean).join(' '), p.piso && `Piso ${p.piso}`, p.depto && `Depto ${p.depto}`].filter(Boolean).join(', ');
  const health = p.health || {};
  const glaucomaLabel = {
    si: 'Sí',
    no: 'No',
    no_se: 'No sé'
  }[health.glaucomaFamiliar] || '—';
  const hasHealthData = !!(health.peso || health.altura || health.glaucomaFamiliar || health.aniosDiabetes || health.complicaciones && health.complicaciones.length || health.medicacion && health.medicacion.length);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Mi perfil",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 22px 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 88,
      height: 88,
      borderRadius: 999,
      background: T.greenSoft,
      color: T.greenStrong,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
      fontWeight: 700
    }
  }, initials), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      marginTop: 14
    }
  }, nombreCompleto), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15.5,
      color: T.inkMuted,
      marginTop: 3
    }
  }, "DNI ", p.dni || '—')), /*#__PURE__*/React.createElement(Section, {
    title: "Datos personales"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '2px 16px'
  }, /*#__PURE__*/React.createElement(ListRow, {
    icon: "mapPin",
    tone: "neutral",
    title: "Domicilio",
    subtitle: domicilio || '—'
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "building",
    tone: "neutral",
    title: "Ciudad / Provincia",
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.inkMuted,
        fontSize: 14.5,
        fontWeight: 600,
        textAlign: 'right'
      }
    }, [p.ciudad, p.provincia].filter(Boolean).join(', ') || '—')
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "phone",
    tone: "neutral",
    title: "Tel\xE9fono",
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.inkMuted,
        fontSize: 15.5,
        fontWeight: 600
      }
    }, p.telefono || '—'),
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "mail",
    tone: "neutral",
    title: "Email",
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.inkMuted,
        fontSize: 14,
        fontWeight: 600
      }
    }, p.email || '—'),
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "shield",
    tone: "green",
    title: "Cobertura m\xE9dica",
    subtitle: p.coberturaTiene ? `Código de afiliado ${p.codigoAfiliado || '—'}` : undefined,
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.inkMuted,
        fontSize: 15.5,
        fontWeight: 600
      }
    }, p.coberturaTiene ? p.obraSocial || 'Sí' : 'No'),
    last: true
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Mi informaci\xF3n de salud",
    action: /*#__PURE__*/React.createElement("button", {
      className: "ru-press",
      onClick: () => nav.go('onboarding-quiz', {
        mode: 'edit'
      }),
      style: {
        border: 'none',
        background: 'transparent',
        color: T.green,
        font: 'inherit',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Editar")
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '2px 16px'
  }, /*#__PURE__*/React.createElement(ListRow, {
    icon: "scale",
    tone: "neutral",
    title: "Peso / Altura",
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.inkMuted,
        fontSize: 15,
        fontWeight: 600
      }
    }, health.peso ? `${health.peso} kg` : '—', " \xB7 ", health.altura ? `${health.altura} cm` : '—')
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "eye",
    tone: "neutral",
    title: "Antecedente familiar de glaucoma",
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.inkMuted,
        fontSize: 15,
        fontWeight: 600
      }
    }, glaucomaLabel)
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "calendar",
    tone: "neutral",
    title: "A\xF1os con diabetes",
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.inkMuted,
        fontSize: 15,
        fontWeight: 600
      }
    }, health.aniosDiabetes || '—')
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "heart",
    tone: "neutral",
    title: "Complicaciones",
    subtitle: health.complicaciones && health.complicaciones.length ? health.complicaciones.join(', ') : 'Ninguna registrada'
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "pill",
    tone: "neutral",
    title: "Medicaci\xF3n",
    subtitle: health.medicacion && health.medicacion.length ? health.medicacion.join(', ') : 'No registrada',
    last: true
  })), !hasHealthData && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: T.inkSubtle,
      marginTop: 10,
      lineHeight: 1.4,
      paddingLeft: 2
    }
  }, "Todav\xEDa no completaste este cuestionario. Pod\xE9s hacerlo cuando quieras.")), /*#__PURE__*/React.createElement(Section, {
    title: "Accesibilidad"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15.5,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 10
    }
  }, "Tama\xF1o del texto"), /*#__PURE__*/React.createElement(Seg, {
    options: scaleOpts,
    value: nav.textScale,
    onChange: nav.setTextScale
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "V\xEDnculos de cuidado"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '2px 16px'
  }, /*#__PURE__*/React.createElement(ListRow, {
    icon: "stethoscope",
    tone: "green",
    title: "Profesionales vinculados",
    subtitle: "Dra. Acosta \xB7 Dr. M\xE9ndez",
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "building",
    tone: "blue",
    title: "Instituciones vinculadas",
    subtitle: "Retinar \xB7 Hospital El Cruce \xB7 Sanatorio Tandil",
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "userPlus",
    tone: "amber",
    title: "Acceso compartido",
    subtitle: "Familiares o cuidadores con acceso a tu cuenta",
    onClick: () => nav.go('cuidador'),
    last: true
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Cuenta"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '2px 16px'
  }, /*#__PURE__*/React.createElement(ListRow, {
    icon: "pencil",
    tone: "neutral",
    title: "Editar datos",
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "sliders",
    tone: "neutral",
    title: "Gestionar permisos",
    onClick: () => nav.go('privacidad')
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "logout",
    tone: "red",
    title: "Cerrar sesi\xF3n",
    onClick: () => nav.reset('welcome'),
    last: true,
    trailing: /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 20,
      stroke: 2.2,
      color: T.inkSubtle
    })
  })))));
}
function PrivacidadScreen({
  nav
}) {
  const [t, setT] = React.useState({
    medico: true,
    recordatorios: true,
    anon: false,
    retinar: true,
    instituciones: true
  });
  const set = k => v => setT(p => ({
    ...p,
    [k]: v
  }));
  const rows = [['medico', 'Compartir informes con mi médico'], ['recordatorios', 'Recibir recordatorios'], ['anon', 'Usar mis datos anonimizados para mejorar RetinAPP'], ['retinar', 'Integración con Retinar'], ['instituciones', 'Integración con instituciones de salud']];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Privacidad",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: 17,
      background: T.greenSoft,
      color: T.green,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 30,
    stroke: 1.9
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 27,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 16
    }
  }, "Tus datos, bajo tu control")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '4px 18px'
  }, rows.map(([k, label], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 0',
      borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 16.5,
      fontWeight: 500,
      lineHeight: 1.35
    }
  }, label), /*#__PURE__*/React.createElement(Toggle, {
    on: t[k],
    onChange: set(k)
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: T.inkSubtle,
      marginTop: 16,
      lineHeight: 1.45,
      paddingLeft: 2
    }
  }, "Pod\xE9s cambiar estos permisos cuando quieras."))));
}
Object.assign(window, {
  RecordatoriosScreen,
  NovedadesScreen,
  PerfilScreen,
  PrivacidadScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-misc.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-quiz.jsx
try { (() => {
// RetinApp — "Queremos saber más de vos": a short, fully-optional health
// questionnaire shown once, on first access after account creation/login.
// The same screen is reused from Perfil ("Mi información de salud" → Editar)
// so answers can be updated later — mode "onboarding" vs "edit" only changes
// the header/footer chrome, never the fields themselves.

const GLAUCOMA_OPTS = [{
  value: 'si',
  label: 'Sí'
}, {
  value: 'no',
  label: 'No'
}, {
  value: 'no_se',
  label: 'No sé'
}];
const COMPLICACIONES_OPTS = ['Pie diabético', 'Problemas de riñones (nefropatía)', 'Problemas neurológicos (neuropatía diabética)', 'Problemas cardiovasculares', 'Hipertensión', 'Otro'];
const MEDICACION_OPTS = ['Metformina', 'Insulina', 'Sulfonilurea', 'DPP-4', 'SGLT2', 'GLP-1/GIP', 'Otros', 'No recuerdo'];
function HealthQuizScreen({
  nav,
  params
}) {
  const mode = params && params.mode === 'edit' ? 'edit' : 'onboarding';
  const existing = nav.profile && nav.profile.health || {};
  const [peso, setPeso] = React.useState(existing.peso || '');
  const [altura, setAltura] = React.useState(existing.altura || '');
  const [glaucoma, setGlaucoma] = React.useState(existing.glaucomaFamiliar || '');
  const [anios, setAnios] = React.useState(existing.aniosDiabetes || '');
  const [complicaciones, setComplicaciones] = React.useState(existing.complicaciones || []);
  const [compOtro, setCompOtro] = React.useState(existing.complicacionOtro || '');
  const [medicacion, setMedicacion] = React.useState(existing.medicacion || []);
  const toggleComp = o => setComplicaciones(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o]);
  const toggleMed = o => setMedicacion(p => {
    if (o === 'No recuerdo') return p.includes(o) ? [] : ['No recuerdo'];
    const rest = p.filter(x => x !== 'No recuerdo');
    return rest.includes(o) ? rest.filter(x => x !== o) : [...rest, o];
  });
  const pesoErr = peso.trim() && !/^\d+$/.test(peso.trim()) ? 'Ingresá el peso en kilos, sin decimales (ej: 72).' : null;
  const pesoRisk = !pesoErr && peso.trim() ? checkRange('peso', peso) : null;
  const alturaErr = altura.trim() && (!/^\d+$/.test(altura.trim()) || +altura < 50 || +altura > 250) ? 'Ingresá la altura en centímetros, sin decimales (ej: 162, no 1,62).' : null;
  const alturaRisk = !alturaErr && altura.trim() ? checkRange('altura', altura) : null;
  function collect() {
    return {
      peso: peso.trim(),
      altura: altura.trim(),
      glaucomaFamiliar: glaucoma,
      aniosDiabetes: anios.trim(),
      complicaciones,
      complicacionOtro: complicaciones.includes('Otro') ? compOtro.trim() : '',
      medicacion
    };
  }
  function handleSave() {
    nav.updateHealth(collect());
    if (mode === 'edit') nav.back();else nav.completeHealthQuiz();
  }
  function handleSkip() {
    nav.completeHealthQuiz();
  }
  return /*#__PURE__*/React.createElement("div", null, mode === 'edit' && /*#__PURE__*/React.createElement(TopBar, {
    title: "Mi informaci\xF3n de salud",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: mode === 'edit' ? 10 : T.safeTop,
    tab: false
  }, mode === 'onboarding' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "heart",
    tone: "green",
    size: 56,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 16,
      lineHeight: 1.2
    }
  }, "Queremos saber m\xE1s de vos"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16.5,
      color: T.inkMuted,
      marginTop: 8,
      lineHeight: 1.45
    }
  }, "Nos ayuda a personalizar tus recomendaciones. Todas las preguntas son opcionales \u2014 respond\xE9 las que quieras.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Peso (kg)",
    value: peso,
    onChange: setPeso,
    placeholder: "72",
    inputMode: "numeric",
    error: pesoErr
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Altura (cm)",
    value: altura,
    onChange: setAltura,
    placeholder: "162",
    inputMode: "numeric",
    error: alturaErr
  }))), pesoRisk && /*#__PURE__*/React.createElement(RiskBanner, {
    level: pesoRisk.level
  }, pesoRisk.msg), alturaRisk && /*#__PURE__*/React.createElement(RiskBanner, {
    level: alturaRisk.level
  }, alturaRisk.msg), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "\xBFTen\xE9s alg\xFAn antecedente familiar de glaucoma?"), /*#__PURE__*/React.createElement(Seg, {
    options: GLAUCOMA_OPTS,
    value: glaucoma,
    onChange: setGlaucoma
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\xBFCu\xE1ntos a\xF1os hace que ten\xE9s diabetes?",
    value: anios,
    onChange: setAnios,
    placeholder: "10",
    suffix: "a\xF1os",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      margin: '4px 0 12px'
    }
  }, "\xBFTen\xE9s o tuviste alguna de estas complicaciones?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      marginBottom: complicaciones.includes('Otro') ? 12 : 22
    }
  }, COMPLICACIONES_OPTS.map(o => /*#__PURE__*/React.createElement(OptionTile, {
    key: o,
    label: o,
    active: complicaciones.includes(o),
    onClick: () => toggleComp(o),
    tone: "amber",
    shape: "square"
  }))), complicaciones.includes('Otro') && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Field, {
    value: compOtro,
    onChange: setCompOtro,
    placeholder: "Contanos cu\xE1l"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      margin: '4px 0 12px'
    }
  }, "\xBFQu\xE9 medicaci\xF3n us\xE1s para controlar tu diabetes?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      marginBottom: 26
    }
  }, MEDICACION_OPTS.map(o => /*#__PURE__*/React.createElement(OptionTile, {
    key: o,
    label: o,
    active: medicacion.includes(o),
    onClick: () => toggleMed(o),
    tone: "blue",
    shape: "square"
  }))), /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: handleSave
  }, mode === 'edit' ? 'Guardar cambios' : 'Continuar'), mode === 'onboarding' && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: handleSkip,
    style: {
      border: 'none',
      background: 'transparent',
      color: T.inkMuted,
      font: 'inherit',
      fontSize: 15.5,
      fontWeight: 600,
      cursor: 'pointer',
      padding: 6
    }
  }, "Omitir por ahora")))));
}
Object.assign(window, {
  HealthQuizScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-quiz.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-retina.jsx
try { (() => {
// RetinApp — "Mi visión" tab: two sub-sections reached via a segmented
// control — Mi visión (visual-acuity self-report + progression) and
// Mi retina (Retinar integration hub: last fundus image + retina evolution),
// plus the patient-facing retina report. Uses the shared RETINA_REPORTS /
// VISION_HISTORY sources (data.jsx) so Home / Mi salud / Mi visión / Informe
// never disagree about the same study again. Distinguishes an unvalidated AI
// pre-read from a doctor-signed report, and gives the referable (worst) case
// a distinct, urgent treatment instead of the same generic actions as a
// routine result.

// ── Mi visión (visual acuity) ────────────────────────────────
function VisionAcuityChart({
  history
}) {
  const entries = [...history].reverse(); // oldest -> newest, left to right
  const w = 320,
    h = 120,
    padX = 14,
    padY = 14;
  const maxRank = VISION_LEVELS.length - 1;
  const n = entries.length;
  const xOf = i => padX + (n > 1 ? i * (w - padX * 2) / (n - 1) : (w - padX * 2) / 2);
  const yOf = rank => padY + (maxRank - Math.max(rank, 0)) * ((h - padY * 2) / maxRank);
  const pts = entries.map(e => ({
    od: visionAcuityRank(e.od),
    oi: visionAcuityRank(e.oi)
  }));
  const lineOD = pts.map((p, i) => `${xOf(i)},${yOf(p.od)}`).join(' ');
  const lineOI = pts.map((p, i) => `${xOf(i)},${yOf(p.oi)}`).join(' ');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 ${w} ${h}`,
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("polyline", {
    points: lineOI,
    fill: "none",
    stroke: T.blue,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: lineOD,
    fill: "none",
    stroke: T.green,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("circle", {
    cx: xOf(i),
    cy: yOf(p.oi),
    r: "4.2",
    fill: T.blue
  }), /*#__PURE__*/React.createElement("circle", {
    cx: xOf(i),
    cy: yOf(p.od),
    r: "4.2",
    fill: T.green
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 2
    }
  }, entries.map(e => /*#__PURE__*/React.createElement("span", {
    key: e.date,
    style: {
      fontSize: 12,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, e.date.slice(3)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginTop: 12,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13.5,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 999,
      background: T.green
    }
  }), "Ojo derecho"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13.5,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 999,
      background: T.blue
    }
  }), "Ojo izquierdo")));
}
function VisionAcuityTimeline({
  nav,
  history
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: '6px 18px'
  }, history.map((v, i) => {
    const last = i === history.length - 1;
    const isDoctor = v.source === 'doctor';
    return /*#__PURE__*/React.createElement("div", {
      key: v.date,
      className: "ru-press",
      onClick: () => nav.go('vision-result', {
        od: v.od,
        oi: v.oi,
        date: v.date,
        reliabilityHits: v.reliabilityHits || 0,
        source: v.source,
        inst: v.inst,
        prof: v.prof,
        fromHistory: true
      }),
      style: {
        display: 'flex',
        gap: 14,
        cursor: 'pointer',
        padding: '14px 0',
        borderBottom: last ? 'none' : `1px solid ${T.line}`
      }
    }, /*#__PURE__*/React.createElement(IconBadge, {
      name: isDoctor ? 'stethoscope' : 'eye',
      tone: isDoctor ? 'blue' : 'green',
      size: 44
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16.5,
        fontWeight: 700
      }
    }, "OD ", v.od, " \xB7 OI ", v.oi), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        color: T.inkSubtle,
        fontWeight: 600
      }
    }, v.date)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement(StatusPill, {
      tone: isDoctor ? 'blue' : 'green',
      icon: isDoctor ? 'stethoscope' : 'bot'
    }, isDoctor ? v.inst || 'Control oftalmológico' : 'Autoevaluación en la app'))), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 18,
      stroke: 2.2,
      color: T.inkSubtle,
      style: {
        alignSelf: 'center'
      }
    }));
  }));
}
function MiVisionSection({
  nav
}) {
  const latest = VISION_HISTORY[0];
  const isDoctor = latest.source === 'doctor';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 20,
    accent: T.green
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: T.inkSubtle,
      fontWeight: 700,
      letterSpacing: '0.03em',
      textTransform: 'uppercase'
    }
  }, "\xDAltima medici\xF3n"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: T.inkMuted
    }
  }, latest.date)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, "Ojo derecho"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: '-0.01em',
      marginTop: 2
    }
  }, latest.od)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, "Ojo izquierdo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: '-0.01em',
      marginTop: 2
    }
  }, latest.oi))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: isDoctor ? 'blue' : 'green',
    icon: isDoctor ? 'stethoscope' : 'bot'
  }, isDoctor ? latest.inst || 'Control oftalmológico' : 'Autoevaluación en la app')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    icon: "eye",
    onClick: () => nav.go('vision-intro')
  }, "Medir en la app"), /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    variant: "secondary",
    icon: "stethoscope",
    onClick: () => nav.go('vision-manual')
  }, "Cargar control")))), /*#__PURE__*/React.createElement(Section, {
    title: "Progresi\xF3n de mi agudeza visual"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement(VisionAcuityChart, {
    history: VISION_HISTORY
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Historial"
  }, /*#__PURE__*/React.createElement(VisionAcuityTimeline, {
    nav: nav,
    history: VISION_HISTORY
  })));
}
function RetinaCompare() {
  const [pct, setPct] = React.useState(52);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 230,
      borderRadius: T.r,
      overflow: 'hidden',
      border: `1px solid ${T.line}`,
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/retinografia-real.jpg",
    alt: "Retinograf\xEDa estudio anterior",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'sepia(0.35) brightness(0.88)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      clipPath: `inset(0 ${100 - pct}% 0 0)`
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/retinografia-real.jpg",
    alt: "Retinograf\xEDa estudio actual",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'rgba(12,15,7,0.78)',
      color: '#fff',
      fontSize: 12.5,
      fontWeight: 700,
      padding: '5px 11px',
      borderRadius: 999
    }
  }, "2023"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      background: T.green,
      color: '#fff',
      fontSize: 12.5,
      fontWeight: 700,
      padding: '5px 11px',
      borderRadius: 999
    }
  }, "2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: `${pct}%`,
      width: 3,
      background: '#fff',
      boxShadow: '0 0 6px rgba(0,0,0,0.35)',
      transform: 'translateX(-1.5px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%,-50%)',
      width: 42,
      height: 42,
      borderRadius: 999,
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.ink
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 16,
    stroke: 2.6
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 16,
    stroke: 2.6
  }))), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: pct,
    onChange: e => setPct(+e.target.value),
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'ew-resize',
      margin: 0
    }
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      marginTop: 12,
      lineHeight: 1.4
    }
  }, "Desliz\xE1 para comparar tus estudios y ver cambios a lo largo del tiempo."));
}
function RetinaTimeline({
  nav
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: '6px 18px'
  }, RETINA_REPORTS.map((p, i) => {
    const last = i === RETINA_REPORTS.length - 1;
    const t = TONES[p.tone];
    return /*#__PURE__*/React.createElement("div", {
      key: p.date,
      className: "ru-press",
      onClick: () => nav.go('informe-retina', {
        date: p.date
      }),
      style: {
        display: 'flex',
        gap: 16,
        cursor: 'pointer',
        padding: '14px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16,
        height: 16,
        borderRadius: 999,
        background: t.solid,
        border: `3px solid ${t.bg}`,
        flexShrink: 0
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        width: 2,
        background: T.line,
        marginTop: 4
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        paddingBottom: last ? 0 : 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: '-0.01em'
      }
    }, p.date.slice(-4)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        color: T.inkSubtle,
        fontWeight: 600
      }
    }, p.date)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(StatusPill, {
      tone: p.tone,
      icon: p.referable ? 'alert' : undefined
    }, p.resultLabel), !p.validated && /*#__PURE__*/React.createElement(StatusPill, {
      tone: "amber",
      icon: "bot"
    }, "Pendiente de revisi\xF3n"))), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 18,
      stroke: 2.2,
      color: T.inkSubtle,
      style: {
        alignSelf: 'center'
      }
    }));
  }));
}
function MiRetinaSection({
  nav
}) {
  const latest = RETINA_REPORTS[0];
  const t = TONES[latest.tone];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 22px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 0,
    accent: t.solid
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/retinografia-real.jpg",
    alt: "Retinograf\xEDa \u2014 \xFAltimo fondo de ojo",
    style: {
      width: '100%',
      height: 170,
      objectFit: 'cover',
      borderRadius: `${T.r - 1}px ${T.r - 1}px 0 0`,
      borderBottom: `1px solid ${T.line}`,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: T.inkSubtle,
      fontWeight: 700,
      letterSpacing: '0.03em',
      textTransform: 'uppercase'
    }
  }, "\xDAltimo control"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: T.inkMuted
    }
  }, latest.date)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      marginTop: 8
    }
  }, latest.resultLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    onClick: () => nav.go('informe-retina', {
      date: latest.date
    })
  }, "Ver informe"), /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    variant: "secondary",
    icon: "image",
    onClick: () => {}
  }, "Ver im\xE1genes"))))), /*#__PURE__*/React.createElement(Section, {
    title: "Evoluci\xF3n de mi retina"
  }, /*#__PURE__*/React.createElement(RetinaTimeline, {
    nav: nav
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Comparar estudios"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600,
      marginBottom: 5
    }
  }, "Estudio anterior"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: '11px 13px',
      fontSize: 15.5,
      fontWeight: 600
    }
  }, "2023 ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevronDown",
    size: 16,
    stroke: 2.2,
    color: T.inkSubtle
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      fontWeight: 600,
      marginBottom: 5
    }
  }, "Estudio actual"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: '11px 13px',
      fontSize: 15.5,
      fontWeight: 600
    }
  }, "2026 ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevronDown",
    size: 16,
    stroke: 2.2,
    color: T.inkSubtle
  })))), /*#__PURE__*/React.createElement(RetinaCompare, null)), /*#__PURE__*/React.createElement(Section, {
    title: "Documentos"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 16,
    onClick: () => nav.go('estudios'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "folder",
    tone: "blue",
    size: 46
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16.5,
      fontWeight: 700
    }
  }, "Ver todos tus documentos de retina"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkMuted,
      marginTop: 2
    }
  }, "Informes, im\xE1genes y PDFs, en Estudios")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    stroke: 2.2,
    color: T.inkSubtle
  }))));
}
function VisionHubScreen({
  nav,
  params
}) {
  const [sub, setSub] = React.useState(params?.sub || 'retina');
  React.useEffect(() => {
    if (params && params.sub) setSub(params.sub);
  }, [params]);
  return /*#__PURE__*/React.createElement(Screen, {
    tab: true
  }, /*#__PURE__*/React.createElement(Title, null, "Mi visi\xF3n"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 22px'
    }
  }, /*#__PURE__*/React.createElement(Seg, {
    options: [{
      value: 'retina',
      label: 'Mi retina'
    }, {
      value: 'vision',
      label: 'Mi visión'
    }],
    value: sub,
    onChange: setSub
  })), sub === 'vision' ? /*#__PURE__*/React.createElement(MiVisionSection, {
    nav: nav
  }) : /*#__PURE__*/React.createElement(MiRetinaSection, {
    nav: nav
  }));
}

// Small severity scale for grado_RD (0–4) / sospecha_MD (0–2) — a compact,
// non-decorative visualization of an ordinal clinical score.
function GradeScale({
  value,
  max,
  tone
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, Array.from({
    length: max + 1
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 18,
      height: 8,
      borderRadius: 3,
      background: i <= value ? t.solid : T.line,
      flexShrink: 0
    }
  })));
}
function InformeRetinaScreen({
  nav,
  params
}) {
  const r = getRetinaReport(params?.date);
  const [shared, setShared] = React.useState(false);
  const t = TONES[r.tone];
  const referible = resolveClas(r.clasificacion.referible);
  const gradoRd = resolveClas(r.clasificacion.grado_rd);
  const sospechaMd = resolveClas(r.clasificacion.sospecha_md);
  const otrasPatologias = resolveClas(r.clasificacion.otras_patologias);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Informe de retina",
    onBack: () => nav.back(),
    trailing: /*#__PURE__*/React.createElement("button", {
      className: "ru-press",
      onClick: () => {},
      style: {
        border: 'none',
        background: 'transparent',
        color: T.green,
        cursor: 'pointer',
        padding: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "share",
      size: 22,
      stroke: 2
    }))
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, r.referable && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(UrgentCard, {
    icon: "alert",
    title: "Retinopat\xEDa referible \u2014 requiere evaluaci\xF3n",
    body: "Este resultado necesita que un oftalm\xF3logo lo confirme en persona. No es un control de rutina."
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    icon: "calendarPlus",
    onClick: () => nav.go('contacto', {
      reason: 'urgente'
    })
  }, "Pedir turno ahora"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px 10px'
    }
  }, [['Fecha', r.date], ['Institución', r.inst], ['Profesional', r.prof || '—'], ['Plataforma', 'Retinar IA']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginTop: 2
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: T.inkSubtle,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.03em'
    }
  }, "Resultado general"), /*#__PURE__*/React.createElement(StatusPill, {
    tone: r.tone,
    icon: r.referable ? 'alert' : 'checkCircle'
  }, r.resultLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, r.validated ? /*#__PURE__*/React.createElement(StatusPill, {
    tone: "green",
    icon: "checkCircle"
  }, "Revisado y validado por ", r.prof) : /*#__PURE__*/React.createElement(StatusPill, {
    tone: "amber",
    icon: "bot"
  }, "Prediagn\xF3stico por IA \u2014 pendiente de revisi\xF3n m\xE9dica")), !r.validated && /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.go('ia-info'),
    style: {
      marginTop: 10,
      border: 'none',
      background: 'transparent',
      color: T.green,
      font: 'inherit',
      fontSize: 14.5,
      fontWeight: 700,
      cursor: 'pointer',
      padding: 0,
      textDecoration: 'underline'
    }
  }, "\xBFQu\xE9 es el prediagn\xF3stico por IA?")))), /*#__PURE__*/React.createElement(Section, {
    title: "Resumen para vos"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18,
    style: {
      background: t.bg,
      border: `1px solid ${t.solid}30`,
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.5,
      color: t.fg
    }
  }, r.summary))), /*#__PURE__*/React.createElement(Section, {
    title: "Clasificaci\xF3n principal"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '4px 18px'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '15px 0',
      borderBottom: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      fontWeight: 600,
      marginBottom: 9
    }
  }, "\xBFRequiere derivaci\xF3n oftalmol\xF3gica?"), /*#__PURE__*/React.createElement(StatusPill, {
    tone: referible ? 'red' : 'green',
    icon: referible ? 'alert' : 'checkCircle'
  }, referible ? 'Sí, requiere derivación' : 'No, por el momento')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '15px 0',
      borderBottom: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, "Grado de retinopat\xEDa diab\xE9tica"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: T.inkSubtle
    }
  }, gradoRd, " / 4")), /*#__PURE__*/React.createElement(GradeScale, {
    value: gradoRd,
    max: 4,
    tone: claseSeverityTone('grado', gradoRd)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15.5,
      fontWeight: 700,
      marginTop: 9
    }
  }, GRADO_RD_LABELS[gradoRd])), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '15px 0',
      borderBottom: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, "Sospecha de edema macular"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: T.inkSubtle
    }
  }, sospechaMd, " / 2")), /*#__PURE__*/React.createElement(GradeScale, {
    value: sospechaMd,
    max: 2,
    tone: claseSeverityTone('md', sospechaMd)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15.5,
      fontWeight: 700,
      marginTop: 9
    }
  }, SOSPECHA_MD_LABELS[sospechaMd])), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '15px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      fontWeight: 600,
      marginBottom: 9
    }
  }, "Otras patolog\xEDas"), /*#__PURE__*/React.createElement(StatusPill, {
    tone: otrasPatologias ? 'amber' : 'green',
    icon: otrasPatologias ? 'info' : 'checkCircle'
  }, otrasPatologias ? 'Sí' : 'No'), otrasPatologias && r.clasificacion.patologia_concomitante_detalle && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      lineHeight: 1.45,
      marginTop: 10
    }
  }, r.clasificacion.patologia_concomitante_detalle)))), /*#__PURE__*/React.createElement(Section, {
    title: "Hallazgos por ojo"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "eye",
    tone: "green",
    size: 36,
    stroke: 2
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Ojo derecho (OD)")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      lineHeight: 1.5
    }
  }, r.hallazgos.od)), /*#__PURE__*/React.createElement(Card, {
    pad: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "eye",
    tone: "blue",
    size: 36,
    stroke: 2
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Ojo izquierdo (OI)")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      lineHeight: 1.5
    }
  }, r.hallazgos.oi)))), /*#__PURE__*/React.createElement(Section, {
    title: "Impresi\xF3n diagn\xF3stica"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: T.ink,
      lineHeight: 1.55
    }
  }, r.impresion_diagnostica))), /*#__PURE__*/React.createElement(Section, {
    title: "Conducta y recomendaciones"
  }, r.conducta.accion_inmediata && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      background: T.redSoft,
      border: `1px solid ${T.red}40`,
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert",
    size: 19,
    stroke: 2.1,
    color: T.redStrong,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: T.redStrong,
      lineHeight: 1.45,
      fontWeight: 600
    }
  }, r.conducta.accion_inmediata)), /*#__PURE__*/React.createElement(Card, {
    pad: 18,
    style: {
      background: T.greenSoft,
      border: `1px solid ${T.greenSoftBorder}`,
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15.5,
      color: T.greenStrong,
      lineHeight: 1.5
    }
  }, r.conducta.recomendaciones))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "download",
    onClick: () => {}
  }, "Descargar informe"), shared ? /*#__PURE__*/React.createElement(Btn, {
    variant: "soft",
    icon: "check",
    onClick: () => {}
  }, "Enviado a ", r.prof || 'tu equipo de salud') : /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    icon: "share",
    onClick: () => setShared(true)
  }, "Compartir con mi m\xE9dico"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    icon: "calendarPlus",
    onClick: () => nav.go(r.referable ? 'contacto' : 'recordatorios', r.referable ? {
      reason: 'urgente'
    } : undefined)
  }, r.referable ? 'Pedir turno' : 'Agregar recordatorio'))));
}
Object.assign(window, {
  VisionHubScreen,
  InformeRetinaScreen,
  RetinaCompare
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-retina.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-salud.jsx
try { (() => {
// RetinApp — Mi salud (self-report hub) + HbA1c / glucemia / peso / actividad /
// alimentación / síntomas / medicación / pie diabético.
//
// Mi salud is a single reverse-chronological log of every self-reported and
// clinical health record (see HEALTH_RECORDS in data.jsx), grouped by year
// and filterable by record type — instead of one static "current value" tile
// per category. The "+" shortcut opens a type chooser (salud-add) that routes
// into the registration flows below.
//
// Per critique: Glucemia and Peso/presión now have their own registration
// flows (previously both routed to reg-hba1c, mixing daily mg/dL readings
// with a trimestral % lab value). All numeric entries run a clinical range
// check (see data.jsx) and surface a RiskBanner instead of saving silently.

const SALUD_FILTERS = ['Todos', 'HbA1c', 'Glucemia', 'Peso y presión', 'Actividad física', 'Alimentación', 'Medicación', 'Síntomas', 'Cuidado del pie', 'Agudeza visual', 'Función renal'];
function HealthRecordCard({
  r,
  nav
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: 15,
    onClick: () => nav.go(r.go, r.params),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: r.icon,
    tone: r.tone,
    size: 46
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16.5,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, r.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: T.inkSubtle,
      fontWeight: 600,
      flexShrink: 0
    }
  }, r.date)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      marginTop: 3
    }
  }, r.sub)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 18,
    stroke: 2.2,
    color: T.inkSubtle
  }));
}
function SaludScreen({
  nav
}) {
  const [filter, setFilter] = React.useState('Todos');
  const list = HEALTH_RECORDS.filter(r => filter === 'Todos' || r.type === filter).slice().sort((a, b) => ddmmyyyyToKey(b.date) - ddmmyyyyToKey(a.date));
  const groups = [];
  list.forEach(r => {
    const year = r.date.split('/')[2];
    if (!groups.length || groups[groups.length - 1].year !== year) groups.push({
      year,
      items: []
    });
    groups[groups.length - 1].items.push(r);
  });
  return /*#__PURE__*/React.createElement(Screen, {
    tab: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, "Mi salud"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: T.inkMuted,
      marginTop: 4
    }
  }, "Tus valores y h\xE1bitos, registrados por vos.")), /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => nav.go('salud-add'),
    style: {
      width: 44,
      height: 44,
      borderRadius: 999,
      border: 'none',
      background: T.green,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 5px 14px rgba(92,122,11,0.3)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 24,
    stroke: 2.4
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ru-scroll",
    style: {
      display: 'flex',
      gap: 9,
      overflowX: 'auto',
      padding: '16px 22px 4px'
    }
  }, SALUD_FILTERS.map(f => /*#__PURE__*/React.createElement(Chip, {
    key: f,
    active: filter === f,
    onClick: () => setFilter(f)
  }, f))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, groups.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkMuted,
      fontSize: 16,
      textAlign: 'center',
      padding: '40px 0'
    }
  }, "Todav\xEDa no hay registros en esta categor\xEDa."), groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.year
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '20px 0 12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      letterSpacing: '-0.01em'
    }
  }, g.year), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: T.line
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, g.items.map((r, i) => /*#__PURE__*/React.createElement(HealthRecordCard, {
    key: i,
    r: r,
    nav: nav
  })))))));
}
const SALUD_ADD_TYPES = [{
  id: 'hba1c',
  icon: 'droplet',
  tone: 'amber',
  title: 'HbA1c',
  desc: 'Resultado de laboratorio, cada 3-4 meses',
  go: 'reg-hba1c'
}, {
  id: 'glucemia',
  icon: 'activity',
  tone: 'blue',
  title: 'Glucemia',
  desc: 'Medición diaria con glucómetro',
  go: 'reg-glucemia'
}, {
  id: 'peso',
  icon: 'scale',
  tone: 'neutral',
  title: 'Peso y presión',
  desc: 'Peso corporal y presión arterial',
  go: 'reg-peso'
}, {
  id: 'actividad',
  icon: 'footprints',
  tone: 'green',
  title: 'Actividad física',
  desc: 'Caminatas, gimnasio, natación y más',
  go: 'reg-actividad'
}, {
  id: 'alimentacion',
  icon: 'utensils',
  tone: 'amber',
  title: 'Alimentación',
  desc: 'Autoevaluación de tus comidas',
  go: 'reg-alimentacion'
}, {
  id: 'medicacion',
  icon: 'pill',
  tone: 'blue',
  title: 'Medicación',
  desc: 'Tomas del día y tratamiento actual',
  go: 'medicacion'
}, {
  id: 'sintoma',
  icon: 'alert',
  tone: 'red',
  title: 'Síntomas',
  desc: 'Cambios que quieras registrar',
  go: 'reg-sintoma'
}, {
  id: 'pie',
  icon: 'footprints',
  tone: 'neutral',
  title: 'Cuidado del pie',
  desc: 'Autoexamen: heridas, hormigueo, color',
  go: 'reg-pie'
}];
function SaludAddScreen({
  nav
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Registrar",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Eleg\xED qu\xE9 quer\xE9s registrar hoy."
  }, "\xBFQu\xE9 quer\xE9s registrar?"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, SALUD_ADD_TYPES.map(c => /*#__PURE__*/React.createElement(Card, {
    key: c.id,
    pad: 16,
    onClick: () => nav.go(c.go),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: c.icon,
    tone: c.tone,
    size: 52,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17.5,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, c.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkMuted,
      marginTop: 3,
      lineHeight: 1.35
    }
  }, c.desc)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    stroke: 2.2,
    color: T.inkSubtle
  }))))));
}
function RegHba1cScreen({
  nav
}) {
  const [val, setVal] = React.useState('');
  const [fecha, setFecha] = React.useState('');
  const risk = checkRange('hba1c', val);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Registrar HbA1c",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, null, "Registrar HbA1c"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 28px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 7,
      textAlign: 'center'
    }
  }, "Valor"), /*#__PURE__*/React.createElement(Field, {
    value: val,
    onChange: setVal,
    placeholder: "0,0",
    big: true,
    suffix: "%",
    inputMode: "decimal"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Fecha",
    value: fecha,
    onChange: setFecha,
    placeholder: "20/06/2026"
  })), risk ? /*#__PURE__*/React.createElement(RiskBanner, {
    level: risk.level,
    onContact: () => nav.go('contacto', {
      reason: 'valor'
    })
  }, risk.msg) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      background: T.blueSoft,
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 19,
    stroke: 2,
    color: T.blueStrong,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: T.blueStrong,
      lineHeight: 1.4
    }
  }, "La hemoglobina glicosilada ayuda a conocer el promedio de glucosa de los \xFAltimos meses.")), /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'hba1c'
    })
  }, "Guardar"))));
}
function RegGlucemiaScreen({
  nav
}) {
  const [val, setVal] = React.useState('');
  const [fecha, setFecha] = React.useState('');
  const risk = checkRange('glucemia', val);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Registrar glucemia",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, null, "Registrar glucemia"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 28px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 7,
      textAlign: 'center'
    }
  }, "Valor"), /*#__PURE__*/React.createElement(Field, {
    value: val,
    onChange: setVal,
    placeholder: "0",
    big: true,
    suffix: "mg/dL",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Fecha y hora",
    value: fecha,
    onChange: setFecha,
    placeholder: "20/06/2026 \xB7 08:30"
  })), risk && /*#__PURE__*/React.createElement(RiskBanner, {
    level: risk.level,
    onContact: () => nav.go('contacto', {
      reason: 'valor'
    })
  }, risk.msg), /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'glucemia'
    })
  }, "Guardar"))));
}
function RegPesoScreen({
  nav
}) {
  const [peso, setPeso] = React.useState('');
  const [sis, setSis] = React.useState('');
  const [dia, setDia] = React.useState('');
  const risks = [checkRange('peso', peso), checkRange('sistolica', sis), checkRange('diastolica', dia)].filter(Boolean);
  const worst = risks.find(r => r.level === 'alert') || risks[0];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Registrar peso y presi\xF3n",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, null, "Peso y presi\xF3n"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Peso (kg)",
    value: peso,
    onChange: setPeso,
    placeholder: "72",
    inputMode: "decimal"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Presi\xF3n sist\xF3lica",
    value: sis,
    onChange: setSis,
    placeholder: "120",
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Presi\xF3n diast\xF3lica",
    value: dia,
    onChange: setDia,
    placeholder: "80",
    inputMode: "numeric"
  }))), worst && /*#__PURE__*/React.createElement(RiskBanner, {
    level: worst.level,
    onContact: () => nav.go('contacto', {
      reason: 'valor'
    })
  }, worst.msg), /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'peso'
    })
  }, "Guardar"))));
}
function ActTile({
  icon,
  label,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onClick,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 9,
      padding: '18px 6px',
      cursor: 'pointer',
      background: active ? T.greenSoft : T.card,
      border: `1.5px solid ${active ? T.green : T.line}`,
      borderRadius: 18,
      color: active ? T.greenStrong : T.inkMuted,
      fontFamily: T.font
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 30,
    stroke: 1.9
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      fontWeight: 600
    }
  }, label));
}
const AGE_RECS = {
  joven: {
    label: 'Menor de 40',
    tone: 'blue',
    title: 'Actividad para adultos jóvenes con diabetes',
    tips: ['Al menos 150 min/semana de actividad moderada o 75 min de actividad intensa.', 'Podés incorporar ciclismo, running, natación o gimnasio con pesas.', 'Monitoreá tu glucemia antes y después del ejercicio.']
  },
  adulto: {
    label: '40 a 60 años',
    tone: 'amber',
    title: 'Actividad para adultos',
    tips: ['150 min/semana de actividad moderada es el objetivo recomendado.', 'Priorizá caminata rápida, natación, bicicleta o baile. Cuidá articulaciones.', 'Si tomás medicación, consultá con tu médico antes de aumentar la intensidad.']
  },
  mayor: {
    label: 'Mayor de 60',
    tone: 'green',
    title: 'Actividad para adultos mayores',
    tips: ['30 minutos de actividad moderada la mayoría de los días es suficiente y beneficioso.', 'Caminata, natación y ejercicios de equilibrio son ideales. Evitá esfuerzos bruscos.', 'Ejercicios de fuerza suave 2 veces por semana ayudan a mantener la masa muscular.']
  }
};
function RegActividadScreen({
  nav
}) {
  const [act, setAct] = React.useState('Caminar');
  const [dur, setDur] = React.useState('');
  const [intl, setIntl] = React.useState('Moderada');
  const [ageGroup, setAgeGroup] = React.useState('mayor');
  const rec = AGE_RECS[ageGroup];
  const acts = [['footprints', 'Caminar'], ['bike', 'Bicicleta'], ['dumbbell', 'Gimnasio'], ['waves', 'Natación'], ['music', 'Baile'], ['plus', 'Otra']];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Registrar actividad",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, null, "Registrar actividad"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 14
    }
  }, "\xBFQu\xE9 actividad hiciste?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10
    }
  }, acts.map(([ic, l]) => /*#__PURE__*/React.createElement(ActTile, {
    key: l,
    icon: ic,
    label: l,
    active: act === l,
    onClick: () => setAct(l)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Duraci\xF3n",
    value: dur,
    onChange: setDur,
    placeholder: "30 minutos",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 8
    }
  }, "Intensidad"), /*#__PURE__*/React.createElement(Seg, {
    options: ['Suave', 'Moderada', 'Alta'],
    value: intl,
    onChange: setIntl
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "\xBFEn qu\xE9 grupo de edad est\xE1s?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9
    }
  }, Object.entries(AGE_RECS).map(([k, v]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "ru-press",
    onClick: () => setAgeGroup(k),
    style: {
      flex: 1,
      height: 42,
      border: `1.5px solid ${ageGroup === k ? TONES[v.tone].solid : T.line}`,
      background: ageGroup === k ? TONES[v.tone].bg : T.card,
      color: ageGroup === k ? TONES[v.tone].fg : T.inkMuted,
      borderRadius: 12,
      fontFamily: T.font,
      fontSize: 13.5,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, v.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: TONES[rec.tone].bg,
      border: `1px solid ${TONES[rec.tone].solid}30`,
      borderRadius: 16,
      padding: '15px 16px',
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: TONES[rec.tone].fg,
      marginBottom: 10
    }
  }, rec.title), rec.tips.map((tip, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      marginTop: i > 0 ? 8 : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 999,
      background: TONES[rec.tone].solid,
      flexShrink: 0,
      marginTop: 6
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      color: TONES[rec.tone].fg,
      lineHeight: 1.4
    }
  }, tip))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'actividad'
    })
  }, "Guardar actividad")))));
}
function RegAlimentacionScreen({
  nav
}) {
  const [sel, setSel] = React.useState('Buena');
  const [com, setCom] = React.useState('');
  const opts = [{
    l: 'Muy buena',
    tone: 'green'
  }, {
    l: 'Buena',
    tone: 'green'
  }, {
    l: 'Regular',
    tone: 'amber'
  }, {
    l: 'Me costó cuidarme',
    tone: 'neutral'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Registrar alimentaci\xF3n",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, null, "Registrar alimentaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 28px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 16,
      lineHeight: 1.3
    }
  }, "\xBFC\xF3mo sent\xEDs que fue tu alimentaci\xF3n hoy?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 11
    }
  }, opts.map(o => {
    const active = sel === o.l;
    const t = TONES[o.tone];
    return /*#__PURE__*/React.createElement("button", {
      key: o.l,
      className: "ru-press",
      onClick: () => setSel(o.l),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '17px 18px',
        cursor: 'pointer',
        textAlign: 'left',
        background: active ? t.bg : T.card,
        border: `1.5px solid ${active ? t.solid : T.line}`,
        borderRadius: 16,
        fontFamily: T.font,
        fontSize: 18,
        fontWeight: 600,
        color: active ? t.fg : T.ink
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 999,
        border: `2px solid ${active ? t.solid : T.lineStrong}`,
        background: active ? t.solid : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, active && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15,
      stroke: 3,
      color: "#fff"
    })), o.l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 8
    }
  }, "\xBFQuer\xE9s agregar alg\xFAn comentario? (opcional)"), /*#__PURE__*/React.createElement("textarea", {
    value: com,
    onChange: e => setCom(e.target.value),
    placeholder: "Lo que quieras recordar",
    rows: 3,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: T.font,
      fontSize: 16,
      color: T.ink,
      background: T.card,
      border: `1.5px solid ${T.line}`,
      borderRadius: 14,
      padding: '14px 16px',
      outline: 'none',
      resize: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'alimentacion'
    })
  }, "Guardar")))));
}
function RegSintomaScreen({
  nav
}) {
  const all = ['Visión borrosa', 'Manchas o moscas volantes', 'Dolor ocular', 'Herida en el pie', 'Hormigueo', 'Mareos', 'Dolor en el pecho', 'Otro'];
  const grave = ['Dolor ocular', 'Dolor en el pecho', 'Visión borrosa'];
  const [sel, setSel] = React.useState([]);
  const toggle = s => setSel(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const showWarn = sel.some(s => grave.includes(s));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Reportar s\xEDntoma",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Registr\xE1 cambios que quieras recordar o consultar con tu equipo de salud."
  }, "Reportar s\xEDntoma"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, all.map(s => {
    const active = sel.includes(s);
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      className: "ru-press",
      onClick: () => toggle(s),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '15px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        background: active ? T.redSoft : T.card,
        border: `1.5px solid ${active ? T.red : T.line}`,
        borderRadius: 15,
        fontFamily: T.font,
        fontSize: 17,
        fontWeight: 600,
        color: active ? T.redStrong : T.ink
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 7,
        border: `2px solid ${active ? T.red : T.lineStrong}`,
        background: active ? T.red : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, active && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15,
      stroke: 3,
      color: "#fff"
    })), s);
  })), showWarn && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(UrgentCard, {
    title: "Esto puede requerir atenci\xF3n inmediata",
    body: "Un s\xEDntoma como este no deber\xEDa esperar. Llam\xE1 a tu equipo de salud o busc\xE1 una guardia si es intenso o repentino."
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    icon: "phone",
    onClick: () => nav.go('contacto', {
      reason: 'sintoma'
    })
  }, "Llamar a mi equipo de salud"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    variant: showWarn ? 'secondary' : 'primary',
    disabled: sel.length === 0,
    onClick: () => nav.go('saved', {
      kind: 'sintoma'
    })
  }, "Guardar s\xEDntoma"))));
}
function RegPieScreen({
  nav
}) {
  const all = ['Heridas o lastimaduras', 'Hormigueo o pérdida de sensibilidad', 'Cambios de color en la piel', 'Uñas encarnadas', 'Calzado que lastima', 'Ninguno de estos'];
  const grave = ['Heridas o lastimaduras'];
  const [sel, setSel] = React.useState([]);
  const toggle = s => setSel(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const showWarn = sel.some(s => grave.includes(s));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Cuidado del pie",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Revis\xE1 tus pies con buena luz. Las heridas en el pie diab\xE9tico pueden avanzar r\xE1pido si no se atienden."
  }, "Cuidado del pie"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, all.map(s => {
    const active = sel.includes(s);
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      className: "ru-press",
      onClick: () => toggle(s),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '15px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        background: active ? T.redSoft : T.card,
        border: `1.5px solid ${active ? T.red : T.line}`,
        borderRadius: 15,
        fontFamily: T.font,
        fontSize: 17,
        fontWeight: 600,
        color: active ? T.redStrong : T.ink
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 7,
        border: `2px solid ${active ? T.red : T.lineStrong}`,
        background: active ? T.red : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, active && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15,
      stroke: 3,
      color: "#fff"
    })), s);
  })), showWarn && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(UrgentCard, {
    title: "Una herida en el pie es urgente en diabetes",
    body: "Puede infectarse r\xE1pido. No esperes al pr\xF3ximo control de rutina."
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    icon: "phone",
    onClick: () => nav.go('contacto', {
      reason: 'sintoma'
    })
  }, "Llamar a mi equipo de salud"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    variant: showWarn ? 'secondary' : 'primary',
    disabled: sel.length === 0,
    onClick: () => nav.go('saved', {
      kind: 'pie'
    })
  }, "Guardar"))));
}
const MEDS_DEFAULT = [{
  name: 'Metformina 850mg',
  schedule: 'Desayuno y cena',
  taken: true
}, {
  name: 'Enalapril 10mg',
  schedule: 'Mañana',
  taken: false
}];
function MedicacionScreen({
  nav
}) {
  const [meds, setMeds] = React.useState(MEDS_DEFAULT);
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [sched, setSched] = React.useState('');
  const toggle = i => setMeds(m => m.map((x, k) => k === i ? {
    ...x,
    taken: !x.taken
  } : x));
  const add = () => {
    if (!name.trim()) return;
    setMeds(m => [...m, {
      name,
      schedule: sched || 'Sin horario definido',
      taken: false
    }]);
    setName('');
    setSched('');
    setShowForm(false);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Medicaci\xF3n",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Marc\xE1 cada toma para llevar un registro simple de tu tratamiento."
  }, "Medicaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, meds.map((m, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    pad: 16,
    onClick: () => toggle(i),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 999,
      flexShrink: 0,
      border: `2px solid ${m.taken ? T.green : T.lineStrong}`,
      background: m.taken ? T.green : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, m.taken && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    stroke: 3,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkMuted,
      marginTop: 2
    }
  }, m.schedule)), /*#__PURE__*/React.createElement(StatusPill, {
    tone: m.taken ? 'green' : 'neutral'
  }, m.taken ? 'Tomada hoy' : 'Pendiente')))), showForm ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Medicamento",
    value: name,
    onChange: setName,
    placeholder: "Ej. Metformina 850mg"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Horario",
    value: sched,
    onChange: setSched,
    placeholder: "Ej. Desayuno y cena"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    onClick: add
  }, "Agregar"), /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    variant: "secondary",
    onClick: () => setShowForm(false)
  }, "Cancelar")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "plus",
    variant: "secondary",
    onClick: () => setShowForm(true)
  }, "Agregar medicaci\xF3n"))));
}
Object.assign(window, {
  SaludScreen,
  SaludAddScreen,
  RegHba1cScreen,
  RegGlucemiaScreen,
  RegPesoScreen,
  RegActividadScreen,
  RegAlimentacionScreen,
  RegSintomaScreen,
  RegPieScreen,
  MedicacionScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-salud.jsx", error: String((e && e.message) || e) }); }

// retinapp/screens-vision.jsx
try { (() => {
// RetinApp — Agudeza visual (visual acuity self-screening), additive feature.
// Orientative, self-administered "Tumbling E" screening. Explicitly framed as
// a screening/self-report, never a diagnosis. Flow: intro -> prep -> per-eye
// instruction -> per-eye Tumbling E test -> result -> saved/history.
// Reuses existing RetinApp primitives (Screen, TopBar, Card, Btn, StatusPill,
// RiskBanner, UrgentCard) and tone system — no new visual language introduced.

const VISION_LEVELS = [{
  acuity: '20/100',
  size: 128
}, {
  acuity: '20/50',
  size: 82
}, {
  acuity: '20/40',
  size: 64
}, {
  acuity: '20/25',
  size: 44
}, {
  acuity: '20/20',
  size: 30
}];
const VISION_TRIALS_PER_LEVEL = 2;
const VISION_FLOOR_LABEL = 'Menor a 20/100';
const VISION_DIRS = ['arriba', 'abajo', 'izquierda', 'derecha'];
const VISION_ROT = {
  derecha: 0,
  abajo: 90,
  izquierda: 180,
  arriba: 270
};
function visionRandomDir() {
  return VISION_DIRS[Math.floor(Math.random() * VISION_DIRS.length)];
}
function visionAcuityRank(label) {
  if (!label || label === VISION_FLOOR_LABEL) return -1;
  return VISION_LEVELS.findIndex(l => l.acuity === label);
}
function visionReliabilityLabel(hits) {
  const score = Math.max(0, 2 - (hits || 0));
  return score >= 2 ? 'Alta' : score === 1 ? 'Media' : 'Baja';
}
const VISION_REL_TONE = {
  Alta: 'green',
  Media: 'amber',
  Baja: 'red'
};

// ── 1. Intro ─────────────────────────────────────────────────
function VisionIntroScreen({
  nav
}) {
  const items = [['clock', 'Dura pocos minutos', 'Se evalúa un ojo por vez, con respuestas simples.'], ['sun', 'Necesitás buena luz', 'Buscá un ambiente iluminado, sin reflejos en la pantalla.'], ['eye', 'Usá tus anteojos habituales', 'Los que usás normalmente para ver de lejos, si corresponde.'], ['shield', 'Es un screening, no un diagnóstico', 'El resultado es orientativo y no reemplaza el control con un especialista.']];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Agudeza visual",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "eye",
    tone: "green",
    size: 56,
    stroke: 1.85
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 27,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 16,
      lineHeight: 1.2
    }
  }, "Evalu\xE1 tu agudeza visual"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: T.inkMuted,
      marginTop: 10,
      lineHeight: 1.45
    }
  }, "Una prueba de screening orientativa para hacer desde tu celular, ojo por ojo.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      background: T.blueSoft,
      borderRadius: 16,
      padding: '15px 16px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 20,
    stroke: 2,
    color: T.blueStrong,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: T.blueStrong,
      lineHeight: 1.45
    }
  }, "Esta prueba ", /*#__PURE__*/React.createElement("b", null, "no reemplaza una evaluaci\xF3n oftalmol\xF3gica"), ". Puede ayudarte a decidir si conviene consultar a un profesional."))), /*#__PURE__*/React.createElement(Section, {
    title: "Antes de empezar"
  }, /*#__PURE__*/React.createElement(Card, {
    pad: '4px 18px'
  }, items.map(([ic, t, d], i) => /*#__PURE__*/React.createElement(ListRow, {
    key: t,
    icon: ic,
    tone: "green",
    title: t,
    subtitle: d,
    last: i === items.length - 1
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "arrowRight",
    onClick: () => nav.go('vision-prep')
  }, "Comenzar prueba"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => nav.go('vision-prep')
  }, "C\xF3mo prepararme"))));
}

// ── 2. Preparation ───────────────────────────────────────────
const VISION_CHECKLIST = ['Ubicá el celular a 2 metros de distancia.', 'Subí el brillo de la pantalla.', 'Evitá reflejos o luz directa sobre la pantalla.', 'Usá tus anteojos o lentes de contacto habituales si corresponde.', 'Cubrí un ojo sin presionarlo.', 'Realizá la prueba en un ambiente bien iluminado.'];
function VisionPrepScreen({
  nav
}) {
  const [done, setDone] = React.useState([]);
  const toggle = s => setDone(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Preparate",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Segu\xED estos pasos para un resultado m\xE1s consistente."
  }, "Preparate para la prueba"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Placeholder, {
    label: "DIAGRAMA \u2014 celular a 2 metros, un ojo tapado sin presionar",
    h: 170,
    tone: "green",
    radius: T.rLg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, VISION_CHECKLIST.map(s => {
    const active = done.includes(s);
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      className: "ru-press",
      onClick: () => toggle(s),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '15px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        background: active ? T.greenSoft : T.card,
        border: `1.5px solid ${active ? T.green : T.line}`,
        borderRadius: 15,
        fontFamily: T.font,
        fontSize: 16,
        fontWeight: 600,
        color: active ? T.greenStrong : T.ink
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 7,
        border: `2px solid ${active ? T.green : T.lineStrong}`,
        background: active ? T.green : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, active && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15,
      stroke: 3,
      color: "#fff"
    })), s);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "arrowRight",
    onClick: () => nav.go('vision-eye', {
      eye: 'OD',
      scores: {},
      reliabilityHits: 0
    })
  }, "Ya estoy listo/a"))));
}

// ── 3. Eye instruction ───────────────────────────────────────
function VisionEyeScreen({
  nav,
  params
}) {
  const eye = params?.eye || 'OD';
  const scores = params?.scores || {};
  const reliabilityHits = params?.reliabilityHits || 0;
  const isSecond = eye === 'OI';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: isSecond ? 'Ojo izquierdo' : 'Ojo derecho',
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 22px 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    name: "eye",
    tone: "green",
    size: 64,
    stroke: 1.8,
    shape: "circle"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 18,
      lineHeight: 1.25
    }
  }, isSecond ? 'Cubrí tu ojo derecho' : 'Cubrí tu ojo izquierdo'), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: T.inkMuted,
      marginTop: 8,
      lineHeight: 1.45
    }
  }, isSecond ? 'Vamos a evaluar tu ojo izquierdo.' : 'Vamos a evaluar tu ojo derecho.')), isSecond && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0',
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: "green",
    icon: "checkCircle"
  }, "Ojo derecho registrado: ", scores.OD === VISION_FLOOR_LABEL ? scores.OD : `Compatible con ${scores.OD}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      background: T.greenSoft,
      border: `1px solid ${T.greenSoftBorder}`,
      borderRadius: 16,
      padding: '15px 16px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 19,
    stroke: 2,
    color: T.greenStrong,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: T.greenStrong,
      lineHeight: 1.45
    }
  }, "Sosten\xE9 el celular a unos 2 metros y avis\xE1 cuando est\xE9s listo/a para ver las letras."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '30px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "arrowRight",
    onClick: () => nav.go('vision-test', {
      eye,
      scores,
      reliabilityHits
    })
  }, "Comenzar"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => nav.back()
  }, "Volver"))));
}
function DirBtn({
  dir,
  icon,
  label,
  onClick,
  disabled
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    disabled: disabled,
    onClick: () => onClick(dir),
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      height: 78,
      border: `1.5px solid ${T.lineStrong}`,
      borderRadius: 18,
      background: T.card,
      cursor: disabled ? 'default' : 'pointer',
      color: T.ink,
      fontFamily: T.font,
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 27,
    stroke: 2.2
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, label));
}

// ── 4. Tumbling E test ───────────────────────────────────────
function VisionTestScreen({
  nav,
  params
}) {
  const eye = params?.eye || 'OD';
  const scores = params?.scores || {};
  const priorHits = params?.reliabilityHits || 0;
  const [levelIdx, setLevelIdx] = React.useState(0);
  const [trialInLevel, setTrialInLevel] = React.useState(0);
  const [correctInLevel, setCorrectInLevel] = React.useState(0);
  const [direction, setDirection] = React.useState(() => visionRandomDir());
  const [feedback, setFeedback] = React.useState(null);
  const [showWarning, setShowWarning] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const warnedRef = React.useRef(false);
  React.useEffect(() => {
    if (eye !== 'OD') return; // only the first eye's test demonstrates this mock state
    const t = setTimeout(() => {
      if (!warnedRef.current) {
        warnedRef.current = true;
        setShowWarning(true);
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [eye]);
  const level = VISION_LEVELS[levelIdx];
  const totalMax = VISION_LEVELS.length * VISION_TRIALS_PER_LEVEL;
  const doneSoFar = levelIdx * VISION_TRIALS_PER_LEVEL + trialInLevel;
  function finishEye(resultAcuity, hitsAdd) {
    const hits = priorHits + hitsAdd + (warnedRef.current ? 1 : 0);
    if (eye === 'OD') {
      nav.go('vision-eye', {
        eye: 'OI',
        scores: {
          ...scores,
          OD: resultAcuity
        },
        reliabilityHits: hits
      });
    } else {
      const date = new Date().toLocaleDateString('es-AR');
      nav.go('vision-result', {
        od: scores.OD,
        oi: resultAcuity,
        reliabilityHits: hits,
        date
      });
    }
  }
  function answer(dir) {
    if (feedback || showWarning) return;
    const correct = dir === direction;
    setFeedback(correct ? 'correct' : 'incorrect');
    setTimeout(() => {
      setFeedback(null);
      const newCorrect = correctInLevel + (correct ? 1 : 0);
      const isLastTrialInLevel = trialInLevel + 1 >= VISION_TRIALS_PER_LEVEL;
      if (!isLastTrialInLevel) {
        setCorrectInLevel(newCorrect);
        setTrialInLevel(trialInLevel + 1);
        setDirection(visionRandomDir());
        return;
      }
      const passed = newCorrect >= VISION_TRIALS_PER_LEVEL;
      const isLastLevel = levelIdx + 1 >= VISION_LEVELS.length;
      if (passed && !isLastLevel) {
        setCorrectInLevel(0);
        setTrialInLevel(0);
        setLevelIdx(levelIdx + 1);
        setDirection(visionRandomDir());
      } else {
        const reachedLevel = passed ? levelIdx : levelIdx - 1;
        const acuity = reachedLevel >= 0 ? VISION_LEVELS[reachedLevel].acuity : VISION_FLOOR_LABEL;
        finishEye(acuity, newCorrect === 0 ? 1 : 0);
      }
    }, 550);
  }
  const disabled = !!feedback || showWarning;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: eye === 'OD' ? 'Ojo derecho' : 'Ojo izquierdo',
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: "green",
    icon: "eye"
  }, eye === 'OD' ? 'Evaluando ojo derecho' : 'Evaluando ojo izquierdo'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: T.inkSubtle,
      fontWeight: 600
    }
  }, "Letra ", Math.min(doneSoFar + 1, totalMax), " de ", totalMax)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 999,
      background: T.line,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${doneSoFar / totalMax * 100}%`,
      background: T.green,
      borderRadius: 999,
      transition: 'width .3s'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: `1px solid ${T.line}`,
      borderRadius: T.rLg,
      minHeight: 240,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: T.shadow,
      position: 'relative',
      overflow: 'hidden'
    }
  }, feedback && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 16,
      background: feedback === 'correct' ? 'rgba(92,122,11,0.08)' : 'rgba(190,58,43,0.08)'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: feedback === 'correct' ? 'green' : 'red',
    icon: feedback === 'correct' ? 'check' : 'x'
  }, feedback === 'correct' ? 'Correcto' : 'Incorrecto')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontWeight: 900,
      fontSize: level.size,
      color: '#0A0A0A',
      lineHeight: 1,
      display: 'inline-block',
      transform: `rotate(${VISION_ROT[direction]}deg)`
    }
  }, "E"))), showWarning && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(RiskBanner, {
    level: "warn"
  }, /*#__PURE__*/React.createElement("b", null, "La distancia parece no ser la recomendada."), " Si te acercaste a la pantalla, el resultado puede ser menos confiable. Pod\xE9s repetir la prueba m\xE1s adelante para una estimaci\xF3n m\xE1s consistente."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: -8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    size: "md",
    variant: "soft",
    onClick: () => setShowWarning(false)
  }, "Continuar prueba"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10,
      maxWidth: 320,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement(DirBtn, {
    dir: "arriba",
    icon: "chevronUp",
    label: "Arriba",
    onClick: answer,
    disabled: disabled
  }), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement(DirBtn, {
    dir: "izquierda",
    icon: "chevronLeft",
    label: "Izquierda",
    onClick: answer,
    disabled: disabled
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "eye",
    size: 22,
    stroke: 1.8,
    color: T.inkSubtle
  })), /*#__PURE__*/React.createElement(DirBtn, {
    dir: "derecha",
    icon: "chevronRight",
    label: "Derecha",
    onClick: answer,
    disabled: disabled
  }), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement(DirBtn, {
    dir: "abajo",
    icon: "chevronDown",
    label: "Abajo",
    onClick: answer,
    disabled: disabled
  }), /*#__PURE__*/React.createElement("div", null))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: () => setShowHelp(v => !v),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      border: 'none',
      background: 'transparent',
      color: T.green,
      font: 'inherit',
      fontSize: 14.5,
      fontWeight: 700,
      cursor: 'pointer',
      padding: 0,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 17,
    stroke: 2.1
  }), " Repetir instrucciones"), showHelp && /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.blueSoft,
      borderRadius: 14,
      padding: '13px 15px',
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: T.blueStrong,
      lineHeight: 1.4
    }
  }, "Mir\xE1 hacia d\xF3nde apuntan las l\xEDneas de la letra E y toc\xE1 la flecha que corresponda: arriba, abajo, izquierda o derecha. Eleg\xED una opci\xF3n aunque no est\xE9s seguro/a.")))));
}

// ── 6. Result ─────────────────────────────────────────────────
function VisionResultRow({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: T.inkMuted
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18.5,
      fontWeight: 800,
      letterSpacing: '-0.01em'
    }
  }, value === VISION_FLOOR_LABEL ? value : `Compatible con ${value}`));
}
function VisionResultScreen({
  nav,
  params
}) {
  const od = params?.od || VISION_FLOOR_LABEL;
  const oi = params?.oi || VISION_FLOOR_LABEL;
  const hits = params?.reliabilityHits || 0;
  const date = params?.date || new Date().toLocaleDateString('es-AR');
  const fromHistory = !!params?.fromHistory;
  const source = params?.source || 'app';
  const isDoctor = source === 'doctor';
  const rel = visionReliabilityLabel(hits);
  const relTone = VISION_REL_TONE[rel];
  const rOD = visionAcuityRank(od);
  const rOI = visionAcuityRank(oi);
  const bigDiff = Math.abs(rOD - rOI) >= 2;
  const poorVision = rOD <= 1 || rOI <= 1;
  const flagConsult = bigDiff || poorVision || !isDoctor && rel === 'Baja';
  const [shared, setShared] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Resultado",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: "blue",
    icon: isDoctor ? 'stethoscope' : 'eye'
  }, isDoctor ? 'Control oftalmológico' : 'Resultado orientativo'), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 14,
      lineHeight: 1.25
    }
  }, isDoctor ? 'Agudeza visual medida en consulta' : 'Estimación de tu agudeza visual'), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15.5,
      color: T.inkMuted,
      marginTop: 8,
      lineHeight: 1.45
    }
  }, isDoctor ? 'Valor cargado a partir de un control oftalmológico presencial.' : 'Esta prueba sugiere una estimación orientativa. No reemplaza una evaluación oftalmológica.')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(VisionResultRow, {
    label: "Ojo derecho",
    value: od
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(VisionResultRow, {
    label: "Ojo izquierdo",
    value: oi
  })), bigDiff && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      paddingTop: 14,
      borderTop: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: "amber",
    icon: "alert"
  }, "Diferencia notable entre ambos ojos")), isDoctor ? (params?.inst || params?.prof) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      paddingTop: 14,
      borderTop: `1px solid ${T.line}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, params?.inst && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, "Instituci\xF3n"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, params.inst)), params?.prof && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, "Profesional"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, params.prof))) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      paddingTop: 14,
      borderTop: `1px solid ${T.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      fontWeight: 600
    }
  }, "Confiabilidad"), /*#__PURE__*/React.createElement(StatusPill, {
    tone: relTone
  }, rel)))), /*#__PURE__*/React.createElement(Section, {
    title: "Recomendaci\xF3n"
  }, flagConsult ? /*#__PURE__*/React.createElement(UrgentCard, {
    icon: "stethoscope",
    title: "Te conviene consultar a un profesional",
    body: "Si not\xE1s cambios recientes, visi\xF3n borrosa, dolor, p\xE9rdida s\xFAbita de visi\xF3n o diferencias importantes entre ambos ojos, consult\xE1 con un profesional de la salud visual."
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    icon: "calendarPlus",
    onClick: () => nav.go('contacto', {
      reason: 'turno'
    })
  }, "Pedir turno")) : /*#__PURE__*/React.createElement(Card, {
    pad: 18,
    style: {
      background: T.greenSoft,
      border: `1px solid ${T.greenSoftBorder}`,
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: T.greenStrong,
      lineHeight: 1.5
    }
  }, isDoctor ? 'Este valor está dentro de un rango esperado.' : 'Tu estimación está dentro de un rango esperado.', " Si not\xE1s cambios en tu visi\xF3n, dolor o molestias, igual conviene consultar con un profesional de la salud visual."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 28px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, !fromHistory && /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    onClick: () => nav.go('saved', {
      kind: 'agudeza'
    })
  }, "Guardar resultado"), /*#__PURE__*/React.createElement(Btn, {
    variant: fromHistory ? 'primary' : 'secondary',
    icon: "arrowRight",
    onClick: () => nav.go('vision-prep')
  }, isDoctor ? 'Medir en la app' : 'Repetir prueba'), shared ? /*#__PURE__*/React.createElement(Btn, {
    variant: "soft",
    icon: "check",
    onClick: () => {}
  }, "Enviado a tu equipo de salud") : /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    icon: "share",
    onClick: () => setShared(true)
  }, "Compartir con profesional")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: T.inkSubtle,
      textAlign: 'center',
      padding: '4px 30px 0'
    }
  }, isDoctor ? 'Control registrado el' : 'Prueba realizada el', " ", date, ".")));
}

// ── Manual entry: acuity measured at an in-person ophthalmology control ──
function VisionManualScreen({
  nav
}) {
  const [d, setD] = React.useState({
    fecha: '',
    od: '',
    oi: '',
    inst: '',
    prof: ''
  });
  const set = k => v => setD(p => ({
    ...p,
    [k]: v
  }));
  const canSave = d.fecha.trim() && d.od.trim() && d.oi.trim();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Cargar control",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement(Screen, {
    padTop: 10
  }, /*#__PURE__*/React.createElement(Title, {
    sub: "Registr\xE1 la agudeza visual que te midieron en tu \xFAltimo control oftalmol\xF3gico."
  }, "Cargar agudeza visual"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 28px 0'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Fecha del control",
    value: d.fecha,
    onChange: set('fecha'),
    placeholder: "12/03/2026"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Ojo derecho (OD)",
    value: d.od,
    onChange: set('od'),
    placeholder: "20/25"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Ojo izquierdo (OI)",
    value: d.oi,
    onChange: set('oi'),
    placeholder: "20/25"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Instituci\xF3n (opcional)",
    value: d.inst,
    onChange: set('inst'),
    placeholder: "Hospital El Cruce"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Profesional (opcional)",
    value: d.prof,
    onChange: set('prof'),
    placeholder: "Dr. L. M\xE9ndez"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    icon: "check",
    disabled: !canSave,
    onClick: () => nav.go('saved', {
      kind: 'agudeza'
    })
  }, "Guardar control")))));
}
Object.assign(window, {
  VisionIntroScreen,
  VisionPrepScreen,
  VisionEyeScreen,
  VisionTestScreen,
  VisionResultScreen,
  VisionManualScreen,
  VISION_LEVELS,
  VISION_FLOOR_LABEL,
  visionReliabilityLabel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/screens-vision.jsx", error: String((e && e.message) || e) }); }

// retinapp/ui.jsx
try { (() => {
// RetinApp — design tokens + shared UI primitives.
// Brand extension of the Retinar system for a patient-facing iOS health app:
//   • Retinar green kept as the brand accent, but shifted to a deeper, legible
//     #5C7A0B for fills/text (neon acid #CEF71F is reserved for tiny highlights).
//   • Muted semantic blue / amber / red ADDED for medical status clarity only.
//   • IBM Plex Sans throughout; Encode Sans for the wordmark.
//   • Large type, big hit targets, generous spacing for users aged 50–80.

const T = {
  canvas: '#F3F5EF',
  card: '#FFFFFF',
  cardSoft: '#FAFBF5',
  ink: '#0C0F07',
  inkMuted: 'rgba(12,15,7,0.60)',
  inkSubtle: 'rgba(12,15,7,0.42)',
  line: 'rgba(12,15,7,0.09)',
  lineStrong: 'rgba(12,15,7,0.15)',
  green: '#5C7A0B',
  greenStrong: '#41570A',
  greenSoft: '#EEF4DB',
  greenSoftBorder: '#D9E6B7',
  acid: '#CEF71F',
  blue: '#2F6DA4',
  blueSoft: '#E8F1F8',
  blueStrong: '#1F4D77',
  amber: '#B06912',
  amberSoft: '#FBF0DD',
  amberStrong: '#7E4B0C',
  red: '#BE3A2B',
  redSoft: '#FAEAE7',
  redStrong: '#8C281D',
  r: 22,
  rSm: 15,
  rLg: 28,
  pill: 999,
  shadow: '0 6px 20px rgba(12,15,7,0.05), 0 1px 3px rgba(12,15,7,0.05)',
  shadowLg: '0 18px 46px rgba(12,15,7,0.13)',
  font: '"IBM Plex Sans", -apple-system, system-ui, sans-serif',
  brand: '"Encode Sans", "IBM Plex Sans", sans-serif',
  safeTop: 54
};
const TONES = {
  green: {
    bg: T.greenSoft,
    fg: T.greenStrong,
    solid: T.green
  },
  blue: {
    bg: T.blueSoft,
    fg: T.blueStrong,
    solid: T.blue
  },
  amber: {
    bg: T.amberSoft,
    fg: T.amberStrong,
    solid: T.amber
  },
  red: {
    bg: T.redSoft,
    fg: T.redStrong,
    solid: T.red
  },
  neutral: {
    bg: '#EDEFE8',
    fg: T.inkMuted,
    solid: T.inkMuted
  },
  acid: {
    bg: T.acid,
    fg: T.ink,
    solid: T.ink
  }
};

// ── Wordmark ───────────────────────────────────────────────
function Logo({
  size = 26,
  light = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: T.brand,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '-0.01em',
      color: light ? '#fff' : T.ink,
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'baseline'
    }
  }, "Retin", /*#__PURE__*/React.createElement("span", {
    style: {
      color: light ? T.acid : T.green,
      borderBottom: `${Math.max(2, size * 0.11)}px solid ${T.acid}`,
      paddingBottom: size * 0.04
    }
  }, "APP"));
}

// Real Retinar brand wordmark (raster, see assets/logos) — used wherever the
// app needs to credit the parent platform, distinct from the RetinAPP logo.
function RetinarWordmark({
  height = 16,
  light = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: light ? 'assets/logos/retinar-logo-light-crop.png' : 'assets/logos/retinar-logo-dark-crop.png',
    alt: "Retinar",
    style: {
      height,
      width: height * 3.0985,
      display: 'inline-block',
      verticalAlign: 'middle',
      objectFit: 'contain',
      ...style
    }
  });
}

// ── Layout ─────────────────────────────────────────────────
function Screen({
  children,
  tab = false,
  bg = T.canvas,
  padTop = T.safeTop + 8,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: bg,
      color: T.ink,
      fontFamily: T.font,
      paddingTop: padTop,
      paddingBottom: tab ? 108 : 40,
      boxSizing: 'border-box',
      ...style
    }
  }, children);
}
function TopBar({
  title,
  onBack,
  trailing,
  dark = false,
  transparent = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 9,
      paddingTop: T.safeTop,
      paddingBottom: 8,
      background: transparent ? 'transparent' : dark ? 'rgba(12,15,7,0.72)' : 'rgba(243,245,239,0.82)',
      backdropFilter: transparent ? 'none' : 'blur(14px) saturate(180%)',
      WebkitBackdropFilter: transparent ? 'none' : 'blur(14px) saturate(180%)',
      borderBottom: transparent ? '1px solid transparent' : `1px solid ${dark ? 'rgba(255,255,255,0.1)' : T.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 44,
      padding: '0 8px',
      gap: 4
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      border: 'none',
      background: 'transparent',
      color: dark ? '#fff' : T.green,
      font: 'inherit',
      fontSize: 17,
      fontWeight: 600,
      padding: '8px 8px 8px 4px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 26,
    stroke: 2.4
  }), " Atr\xE1s") : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: dark ? '#fff' : T.ink,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: onBack ? 84 : 8,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, trailing)));
}
function Title({
  children,
  sub,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 22px 14px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      margin: 0
    }
  }, children), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 17,
      color: T.inkMuted,
      lineHeight: 1.4
    }
  }, sub));
}
function Section({
  title,
  action,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 22px',
      marginTop: 26,
      ...style
    }
  }, (title || action) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      margin: 0
    }
  }, title), action), children);
}

// ── Surfaces ───────────────────────────────────────────────
function Card({
  children,
  onClick,
  style = {},
  pad = 18,
  soft = false,
  accent
}) {
  const tappable = !!onClick;
  return /*#__PURE__*/React.createElement("div", {
    className: tappable ? 'ru-press' : undefined,
    onClick: onClick,
    style: {
      background: soft ? T.cardSoft : T.card,
      borderRadius: T.r,
      border: `1px solid ${T.line}`,
      boxShadow: T.shadow,
      padding: pad,
      boxSizing: 'border-box',
      cursor: tappable ? 'pointer' : 'default',
      position: 'relative',
      overflow: accent ? 'hidden' : 'visible',
      ...style
    }
  }, accent && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: accent
    }
  }), children);
}
function IconBadge({
  name,
  tone = 'green',
  size = 48,
  shape = 'squircle',
  stroke = 1.9
}) {
  const t = TONES[tone] || TONES.green;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: t.bg,
      color: t.fg,
      borderRadius: shape === 'circle' ? 999 : size * 0.30
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: name,
    size: Math.round(size * 0.5),
    stroke: stroke
  }));
}
function StatusPill({
  tone = 'green',
  children,
  icon
}) {
  const t = TONES[tone] || TONES.green;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: t.bg,
      color: t.fg,
      borderRadius: 999,
      padding: '6px 13px 6px 11px',
      fontSize: 14.5,
      fontWeight: 600,
      letterSpacing: '-0.005em'
    }
  }, icon ? /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    stroke: 2.2
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: t.solid
    }
  }), children);
}

// ── Controls ───────────────────────────────────────────────
function Btn({
  children,
  onClick,
  variant = 'primary',
  icon,
  full = true,
  size = 'lg',
  style = {},
  disabled = false
}) {
  const h = size === 'lg' ? 58 : size === 'md' ? 48 : 40;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: h,
    padding: size === 'sm' ? '0 16px' : '0 22px',
    width: full ? '100%' : 'auto',
    borderRadius: size === 'sm' ? 999 : 16,
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: T.font,
    fontSize: size === 'lg' ? 18 : 16,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    boxSizing: 'border-box',
    opacity: disabled ? 0.45 : 1,
    transition: 'transform .12s, box-shadow .2s'
  };
  const variants = {
    primary: {
      background: T.green,
      color: '#fff',
      boxShadow: '0 6px 18px rgba(92,122,11,0.28)'
    },
    accent: {
      background: T.acid,
      color: T.ink,
      boxShadow: '0 6px 18px rgba(206,247,31,0.4)'
    },
    secondary: {
      background: T.card,
      color: T.ink,
      border: `1.5px solid ${T.lineStrong}`
    },
    ghost: {
      background: 'transparent',
      color: T.green
    },
    soft: {
      background: T.greenSoft,
      color: T.greenStrong
    },
    danger: {
      background: T.redSoft,
      color: T.redStrong
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: disabled ? undefined : onClick,
    disabled: disabled,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size === 'lg' ? 22 : 19,
    stroke: 2.1
  }), children);
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  error,
  big = false,
  suffix,
  inputMode
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: 16
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 7,
      paddingLeft: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    inputMode: inputMode,
    onChange: onChange ? e => onChange(e.target.value) : undefined,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: T.font,
      fontSize: big ? 30 : 18,
      fontWeight: big ? 700 : 500,
      letterSpacing: big ? '-0.02em' : 0,
      color: T.ink,
      background: T.card,
      border: `1.5px solid ${error ? T.red : T.line}`,
      borderRadius: 14,
      padding: big ? '18px 18px' : '15px 16px',
      outline: 'none',
      textAlign: big ? 'center' : 'left'
    }
  }), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 18,
      fontSize: big ? 26 : 17,
      fontWeight: 600,
      color: T.inkMuted,
      pointerEvents: 'none'
    }
  }, suffix)), error ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.red,
      marginTop: 7,
      paddingLeft: 2,
      lineHeight: 1.4,
      fontWeight: 500
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.inkSubtle,
      marginTop: 7,
      paddingLeft: 2,
      lineHeight: 1.4
    }
  }, hint) : null);
}

// Native <select>, styled to match Field. Used for long fixed option lists
// (e.g. Provincia) where a native picker is the friendliest control.
function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Elegí una opción'
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: 16
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: T.inkMuted,
      marginBottom: 7,
      paddingLeft: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: T.font,
      fontSize: 18,
      fontWeight: 500,
      color: value ? T.ink : T.inkSubtle,
      background: T.card,
      border: `1.5px solid ${T.line}`,
      borderRadius: 14,
      padding: '15px 44px 15px 16px',
      outline: 'none',
      appearance: 'none',
      WebkitAppearance: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 16,
      pointerEvents: 'none',
      display: 'flex',
      color: T.inkSubtle
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronDown",
    size: 20,
    stroke: 2.2
  }))));
}

// Tappable option row with a leading check indicator — single- or multi-select
// (shape="round" for exclusive choices, "square" for checklists).
function OptionTile({
  label,
  active,
  onClick,
  tone = 'green',
  shape = 'round'
}) {
  const t = TONES[tone] || TONES.green;
  return /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '15px 16px',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      background: active ? t.bg : T.card,
      border: `1.5px solid ${active ? t.solid : T.line}`,
      borderRadius: 15,
      fontFamily: T.font,
      fontSize: 16.5,
      fontWeight: 600,
      color: active ? t.fg : T.ink
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: shape === 'round' ? 999 : 7,
      border: `2px solid ${active ? t.solid : T.lineStrong}`,
      background: active ? t.solid : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, active && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15,
    stroke: 3,
    color: "#fff"
  })), label);
}
function ListRow({
  icon,
  tone = 'neutral',
  title,
  subtitle,
  trailing,
  onClick,
  badge,
  last = false,
  iconShape = 'squircle'
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: onClick ? 'ru-press' : undefined,
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '13px 4px',
      cursor: onClick ? 'pointer' : 'default',
      borderBottom: last ? 'none' : `1px solid ${T.line}`
    }
  }, icon && /*#__PURE__*/React.createElement(IconBadge, {
    name: icon,
    tone: tone,
    size: 44,
    shape: iconShape
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.25
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: T.inkMuted,
      marginTop: 2,
      lineHeight: 1.3
    }
  }, subtitle)), badge, trailing !== undefined ? trailing : onClick && /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    stroke: 2.2,
    color: T.inkSubtle
  }));
}
function Chip({
  children,
  active,
  onClick,
  icon
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      height: 40,
      padding: '0 16px',
      borderRadius: 999,
      fontFamily: T.font,
      fontSize: 15.5,
      fontWeight: 600,
      border: `1.5px solid ${active ? T.green : T.line}`,
      background: active ? T.green : T.card,
      color: active ? '#fff' : T.inkMuted
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    stroke: 2.1
  }), children);
}
function Toggle({
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange && onChange(!on),
    className: "ru-press",
    style: {
      width: 52,
      height: 31,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      flexShrink: 0,
      background: on ? T.green : '#D5D8CC',
      position: 'relative',
      transition: 'background .2s',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2.5,
      left: on ? 23.5 : 2.5,
      width: 26,
      height: 26,
      borderRadius: 999,
      background: '#fff',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      transition: 'left .2s'
    }
  }));
}
function Seg({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: '#E7EAE0',
      borderRadius: 13,
      padding: 3,
      gap: 3
    }
  }, options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const label = typeof o === 'string' ? o : o.label;
    const active = v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      className: "ru-press",
      onClick: () => onChange(v),
      style: {
        flex: 1,
        height: 38,
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: T.font,
        fontSize: 15,
        fontWeight: 600,
        background: active ? T.card : 'transparent',
        color: active ? T.ink : T.inkMuted,
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none'
      }
    }, label);
  }));
}

// Image placeholder — striped, monospace label (no hand-drawn art).
function Placeholder({
  label,
  h = 160,
  tone = 'green',
  radius = T.r,
  style = {}
}) {
  const t = TONES[tone] || TONES.green;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h,
      borderRadius: radius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 16,
      boxSizing: 'border-box',
      background: `repeating-linear-gradient(135deg, ${t.bg}, ${t.bg} 11px, ${T.card} 11px, ${T.card} 22px)`,
      border: `1px dashed ${t.fg}40`,
      color: t.fg,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      fontSize: 12.5,
      fontWeight: 600,
      letterSpacing: '0.02em',
      opacity: 0.85
    }
  }, label));
}
function Divider({
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: T.line,
      ...style
    }
  });
}

// Inline banner for out-of-range self-reported values (never blocks saving,
// but always names the risk and offers a direct path to the care team).
function RiskBanner({
  level = 'warn',
  children,
  onContact
}) {
  const isAlert = level === 'alert';
  const bg = isAlert ? T.redSoft : T.amberSoft;
  const fg = isAlert ? T.redStrong : T.amberStrong;
  const border = isAlert ? T.red : T.amber;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      border: `1px solid ${border}40`,
      borderRadius: 16,
      padding: '15px 16px',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert",
    size: 20,
    stroke: 2.1,
    color: fg,
    style: {
      marginTop: 1,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: fg,
      lineHeight: 1.45,
      fontWeight: 500
    }
  }, children)), isAlert && onContact && /*#__PURE__*/React.createElement("button", {
    className: "ru-press",
    onClick: onContact,
    style: {
      marginTop: 10,
      border: 'none',
      background: 'transparent',
      color: fg,
      font: 'inherit',
      fontSize: 14.5,
      fontWeight: 700,
      cursor: 'pointer',
      padding: 0,
      textDecoration: 'underline'
    }
  }, "Contactar a mi equipo de salud"));
}

// Distinct, higher-urgency treatment for the worst-case clinical outcome
// (referable retinopathy) or a grave symptom — never the same visual weight
// as a routine result, per critique.
function UrgentCard({
  icon = 'alert',
  title,
  body,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.redSoft,
      border: `1.5px solid ${T.red}55`,
      borderRadius: T.r,
      padding: 18,
      boxShadow: '0 8px 24px rgba(190,58,43,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 13,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 13,
      background: T.red,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 24,
    stroke: 2.1
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: T.redStrong,
      letterSpacing: '-0.01em'
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: T.redStrong,
      lineHeight: 1.45,
      marginTop: 5
    }
  }, body))), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, children));
}
Object.assign(window, {
  T,
  TONES,
  Logo,
  RetinarWordmark,
  Screen,
  TopBar,
  Title,
  Section,
  Card,
  IconBadge,
  StatusPill,
  Btn,
  Field,
  Select,
  OptionTile,
  ListRow,
  Chip,
  Toggle,
  Seg,
  Placeholder,
  Divider,
  RiskBanner,
  UrgentCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "retinapp/ui.jsx", error: String((e && e.message) || e) }); }

// slides/deck-stage.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* ═══ THIS PROJECT USES DESIGN COMPONENTS (.dc.html) ═══
 * Reference this stage from your <x-dc> template as an import — NEVER as a
 * raw <deck-stage> tag plus a <script src> (that hides the whole deck until
 * the stream finishes):
 *
 *   <x-import component-from-global-scope="deck-stage" from="./deck-stage.js"
 *             width="1920" height="1080" hint-size="100%,100%">
 *     <section data-label="Title" style="...">…</section>
 *     <section data-label="Agenda" style="...">…</section>
 *   </x-import>
 *
 * Slides are inline-styled <section> siblings; do not add a stylesheet or a
 * deck-stage:not(:defined) rule. The plain-HTML "Usage" block in the comment
 * below does NOT apply to .dc.html templates.
 */
/* BEGIN USAGE */
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *      On touch devices, tapping the left/right half of the stage goes
 *      prev/next — taps on links, buttons and other interactive slide
 *      content are left alone.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Duplicate / Delete (Delete opens a
 *      Cancel/Delete confirm dialog). Drag the rail's right edge to resize;
 *      width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, on narrow viewports
 *      (≤640px), and via the `no-rail` attribute. Rail mutations dispatch
 *      a `dc-op` CustomEvent on the element (see docs/dc-ops.md) and do
 *      NOT touch the DOM: the host applies the op and re-renders;
 *      structural rail input is locked until the host posts
 *      {__dc_op_ack: true, applied}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 *
 * Speaker notes stay in sync because the component posts {slideIndexChanged: N}
 * to the parent — just include the #speaker-notes script tag if asked for notes.
 *
 * Authoring guidance:
 *   - Write slide bodies as static HTML inside <deck-stage>, with sizing via
 *     CSS custom properties in a <style> block rather than JS constants.
 *     Static slide markup is what lets the user click a heading in edit mode
 *     and retype it directly; a slide rendered through <script type="text/babel">,
 *     React, or a loop over a JS array has to round-trip every tweak through a
 *     chat message instead. Reach for script-generated slides only when the
 *     content genuinely needs interactive behaviour static HTML can't express.
 *   - Do NOT set position/inset/width/height on the slide <section> elements —
 *     the component absolutely positions every slotted child for you.
 *   - Entrance animations: make the visible end-state the base style and
 *     animate *from* hidden, so print and reduced-motion show content.
 *     Gate the animation on [data-deck-active] and the motion query, e.g.
 *     `@media (prefers-reduced-motion:no-preference){ [data-deck-active] .x{animation:fade-in .5s both} }`.
 *     Avoid infinite decorative loops on slide content.
 */
/* END USAGE */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const FINE_POINTER_MQ = matchMedia('(hover: hover) and (pointer: fine)');
  const NARROW_MQ = matchMedia('(max-width: 640px)');
  // Slide-authored controls that should keep a tap instead of it navigating.
  const INTERACTIVE_SEL = 'a[href], button, input, select, textarea, summary, label, video[controls], audio[controls], [role="button"], [onclick], [tabindex]:not([tabindex^="-"]), [contenteditable]:not([contenteditable="false" i])';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    @media (max-width: 640px) {
      .rail, .rail-resize { display: none; }
    }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTap = this._onTap.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      this.addEventListener('click', this._onTap);
      // Print lays every slide out as its own page, so [data-deck-active]-
      // gated entrance styles need the attribute on every slide (not just
      // the current one) or their content prints at the hidden base style.
      // The transient freeze style lands BEFORE the attributes so any
      // attribute-keyed transition fires at 0s (changing transition-
      // duration after a transition has started doesn't affect it).
      this._onBeforePrint = () => {
        if (this._freezeStyle) this._freezeStyle.remove();
        this._freezeStyle = document.createElement('style');
        this._freezeStyle.textContent = '*,*::before,*::after{transition-duration:0s !important}';
        document.head.appendChild(this._freezeStyle);
        this._slides.forEach(s => s.setAttribute('data-deck-active', ''));
      };
      this._onAfterPrint = () => {
        this._applyIndex({
          showOverlay: false,
          broadcast: false
        });
        if (this._freezeStyle) {
          this._freezeStyle.remove();
          this._freezeStyle = null;
        }
      };
      window.addEventListener('beforeprint', this._onBeforePrint);
      window.addEventListener('afterprint', this._onAfterPrint);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav doesn't trigger spurious
      // refreshes — except data-deck-skip, which now arrives from the host
      // re-render and is what updates the rail badge, print bookkeeping,
      // and deckSkipped re-broadcast.
      const OWN_ATTRS = /^data-(deck-(?!skip$)|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          // Skip/unskip is handled below without re-cloning (the badge sits
          // on the thumb wrapper, not the clone) — don't mark the slide
          // dirty for an attr change whose only visible effect is the badge.
          if (n && this._slideSet && this._slideSet.has(n) && !(r.type === 'attributes' && r.attributeName === 'data-deck-skip')) {
            this._liveDirty.add(n);
          }
          // Host-driven skip toggle: sync the rail badge + print + presenter
          // skipped-list the way _toggleSkip used to do locally.
          if (r.type === 'attributes' && r.attributeName === 'data-deck-skip' && n && this._slideSet && this._slideSet.has(n)) {
            const i = this._slides.indexOf(n);
            if (this._thumbs && this._thumbs[i]) {
              if (n.hasAttribute('data-deck-skip')) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
            }
            this._markLastVisible();
            try {
              window.postMessage({
                slideIndexChanged: this._index,
                deckTotal: this._slides.length,
                deckSkipped: this._skippedIndices()
              }, '*');
            } catch (e) {}
          }
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      window.removeEventListener('beforeprint', this._onBeforePrint);
      window.removeEventListener('afterprint', this._onAfterPrint);
      if (this._freezeStyle) {
        this._freezeStyle.remove();
        this._freezeStyle = null;
      }
      this.removeEventListener('click', this._onTap);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-omelette-chrome', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-omelette-chrome', '');
      // Edit mode hooks wheel to pan the canvas; this opts the rail's own
      // scrollview out so thumbnails stay scrollable while editing.
      rail.setAttribute('data-dc-wheel-passthru', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-omelette-chrome', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <button type="button" data-act="duplicate">Duplicate slide</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'duplicate') this._duplicateSlide(i);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-omelette-chrome', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-omelette-chrome', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, overlay, menu, confirm);
      this._canvas = canvas;
      this._stage = stage;
      this._slot = slot;
      this._overlay = overlay;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } ' +
      // Jump authored animations/transitions to their end state so print
      // never captures mid-entrance — pairs with the beforeprint handler
      // in connectedCallback that sets data-deck-active on every slide.
      '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }
    _onSlotChange() {
      // Self-mutate path already reconciled synchronously and emitted
      // slidechange; skip the async slotchange it caused.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      // Primary lock-clear is the host's __deck_rail_ack; this clears on a
      // dropped ack so the rail can't stay dead.
      this._railLock = false;
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      // Per-slide data-speaker-notes is authoritative when present (attrs
      // travel with the element on reorder/dup/delete); a slide without
      // the attr falls through to the legacy #speaker-notes JSON array
      // PER SLIDE so a single attr on a JSON-authored deck doesn't blank
      // the rest.
      const tag = document.getElementById('speaker-notes');
      let json = null;
      if (tag) try {
        const p = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(p)) json = p;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
      }
      this._notes = this._slides.map((s, i) => {
        const a = s.getAttribute('data-speaker-notes');
        return a !== null ? a : json && typeof json[i] === 'string' ? json[i] : '';
      });
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode || NARROW_MQ.matches) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
      // Crossing the narrow-viewport breakpoint reveals the rail — rerun the
      // thumbnail scale the same way _setRailWidth does.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host has processed a dc-op; rail input is safe again. Not tied to
      // slotchange — setAttr and refusal don't fire one. On refusal,
      // revert the optimistic _index/hash adjustment so the next nav
      // starts from what's actually on screen.
      if (d && d.__dc_op_ack) {
        this._railLock = false;
        if (d.applied === false && this._indexBeforeEmit != null) {
          this._index = this._indexBeforeEmit;
          try {
            history.replaceState(null, '', '#' + (this._index + 1));
          } catch (e) {}
        }
        this._indexBeforeEmit = null;
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTap(e) {
      // Touch-only — keyboard + the overlay toolbar cover nav on desktop.
      if (FINE_POINTER_MQ.matches) return;
      // Only taps that land on the stage (slide content or letterbox); the
      // overlay / rail / menus are siblings with their own click handlers.
      const path = e.composedPath();
      if (!this._stage || !path.includes(this._stage)) return;
      // Let interactive slide content keep the tap. composedPath (not
      // e.target.closest) so we see through open shadow roots — a <button>
      // inside a slide-authored custom element retargets e.target to the
      // host but still appears in the composed path.
      if (e.defaultPrevented) return;
      for (const n of path) {
        if (n === this._stage) break;
        if (n.matches && n.matches(INTERACTIVE_SEL)) return;
      }
      e.preventDefault();
      const rw = this._railWidth();
      const mid = rw + (window.innerWidth - rw) / 2;
      this._advance(e.clientX < mid ? -1 : 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }

    /** Rail mutations. When a dc-runtime is present (`window.__dcUpdate`)
     *  the host owns the light DOM — handlers emit a dc-op only and the
     *  host applies it (to the editor's model or to the source file) and
     *  re-renders via dc-runtime; slotchange catches the rail up.
     *  Structural ops lock rail input until the host acks so a rapid second
     *  click can't address a stale index; setAttr/removeAttr respect the
     *  lock but don't set it (indices unchanged; the host serializes).
     *  `newIndex` is written to location.hash so slotchange's
     *  _restoreIndex lands on the right slide.
     *
     *  With NO dc-runtime (a raw .html deck), there's no re-render path,
     *  so handlers self-mutate locally for an instant update and emit
     *  `emitOnly: false`; the host persists to disk without
     *  re-rendering over the already-mutated DOM.
     *
     *  See docs/dc-ops.md for the contract. */
    _emitDcOp(op, slide, lock, newIndex) {
      // Slide index (template/script/style filtered — same as
      // _collectSlides). deck-stage is a filtered-index dc-op emitter;
      // the host resolves against findDeckStage().slideTids. Callers
      // already pass `to` as a slide index.
      op.at = this._slides.indexOf(slide);
      op.witness = {
        childCount: this._slides.length
      };
      // dc-runtime wraps an <x-import>-mounted component in a
      // <div class="sc-host-x" data-dc-tpl="N"> host — the stamp is on the
      // WRAPPER, not this element. closest() finds it (or this element's
      // own stamp when directly templated).
      const host = this.closest('[data-dc-tpl]');
      const tid = host && host.getAttribute('data-dc-tpl');
      op.mount = {
        tid: tid !== null ? parseInt(tid, 10) : null,
        tag: 'deck-stage'
      };
      op.emitOnly = !!window.__dcUpdate;
      if (op.emitOnly) {
        if (lock) this._railLock = true;
        if (newIndex != null && newIndex !== this._index) {
          this._indexBeforeEmit = this._index;
          this._index = newIndex;
          try {
            history.replaceState(null, '', '#' + (newIndex + 1));
          } catch (e) {}
        }
      }
      this.dispatchEvent(new CustomEvent('dc-op', {
        detail: op,
        bubbles: true,
        composed: true
      }));
      return op.emitOnly;
    }
    _deleteSlide(i) {
      if (this._railLock) return;
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const cur = this._index;
      const ni = i < cur || i === cur && i === this._slides.length - 1 ? cur - 1 : cur;
      if (this._emitDcOp({
        op: 'remove'
      }, slide, true, ni)) return;
      this._index = ni;
      this._squelchSlotChange = true;
      slide.remove();
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _duplicateSlide(i) {
      if (this._railLock) return;
      const slide = this._slides[i];
      if (!slide) return;
      if (this._emitDcOp({
        op: 'duplicate'
      }, slide, true, i + 1)) return;
      const copy = slide.cloneNode(true);
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      this._index = i + 1;
      this._squelchSlotChange = true;
      this.insertBefore(copy, slide.nextSibling);
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      if (this._railLock) return;
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (this._emitDcOp(on ? {
        op: 'setAttr',
        attr: 'data-deck-skip',
        value: ''
      } : {
        op: 'removeAttr',
        attr: 'data-deck-skip'
      }, slide, false)) return;
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (this._railLock || j < 0 || j >= this._slides.length || j === i) return;
      const cur = this._index;
      const ni = cur === i ? j : i < cur && j >= cur ? cur - 1 : i > cur && j <= cur ? cur + 1 : cur;
      const slide = this._slides[i];
      if (this._emitDcOp({
        op: 'move',
        to: j
      }, slide, true, ni)) return;
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      this._index = ni;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/website/app.jsx
try { (() => {
/* eslint-disable react/prop-types */
const CLIENTS = [{
  logo: "../../assets/clients/hospital-el-cruce.png",
  alt: "Hospital El Cruce"
}, {
  logo: "../../assets/clients/hospital-irurzun.png",
  alt: "Hospital Irurzun"
}, {
  logo: "../../assets/clients/julieta-lanteri.png",
  alt: "Hospital Julieta Lanteri"
}, {
  logo: "../../assets/clients/ministerio-salud-pba.png",
  alt: "Ministerio de Salud PBA"
}, {
  logo: "../../assets/clients/hospital-el-cruce.png",
  alt: "Hospital El Cruce"
}, {
  logo: "../../assets/clients/hospital-irurzun.png",
  alt: "Hospital Irurzun"
}];
const AWARDS = [{
  logo: "../../assets/awards/bna.png",
  alt: "Soluciones Innovadoras BNA"
}, {
  logo: "../../assets/awards/transformar-salud.png",
  alt: "Transformar Salud"
}, {
  logo: "../../assets/awards/fitba.png",
  alt: "FITBA"
}, {
  logo: "../../assets/awards/ia-transformadora.png",
  alt: "IA Transformadora"
}, {
  logo: "../../assets/awards/academia-medicina.png",
  alt: "Academia Nacional de Medicina"
}, {
  logo: "../../assets/awards/cno-2022.png",
  alt: "CNO 2022"
}, {
  logo: "../../assets/awards/pac-emprendedores.png",
  alt: "PAC Emprendedores"
}, {
  logo: "../../assets/awards/prendete.png",
  alt: "Prendete"
}];
function App() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(LogoCarousel, {
    variant: "light",
    title: "Estas instituciones <span class=\"marker-highlight\">ya usan Retinar</span>",
    subtitle: "Conoc\xE9 los centros e instituciones que ya est\xE1n usando Retinar para tamizar casos en riesgo de ceguera",
    items: CLIENTS
  }), /*#__PURE__*/React.createElement(FeatureStream, null), /*#__PURE__*/React.createElement(ValueGrid, null), /*#__PURE__*/React.createElement(SegmentGrid, null), /*#__PURE__*/React.createElement(LogoCarousel, {
    variant: "dark",
    title: "<span class=\"marker-highlight\">Premios</span> y reconocimientos",
    subtitle: "Nuestra plataforma recibi\xF3 premios en innovaci\xF3n y salud digital y reconocimientos acad\xE9micos.",
    items: AWARDS
  }), /*#__PURE__*/React.createElement(LibraryGrid, null), /*#__PURE__*/React.createElement(ConversionSection, null)), /*#__PURE__*/React.createElement(Footer, null));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/hero.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* eslint-disable react/prop-types */

const ICONS = {
  linkedin: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    focusable: "false"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6.36 8.09a2.09 2.09 0 1 1 0-4.18 2.09 2.09 0 0 1 0 4.18Zm1.77 12.09H4.58V9.9h3.55v10.28Zm12.05 0h-3.54v-5.23c0-1.25-.03-2.85-1.74-2.85-1.74 0-2 1.36-2 2.76v5.32H9.35V9.9h3.4v1.4h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.43v5.3Z"
  })),
  instagram: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    focusable: "false"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.9a3.85 3.85 0 0 0-3.85 3.85v8.5a3.85 3.85 0 0 0 3.85 3.85h8.5a3.85 3.85 0 0 0 3.85-3.85v-8.5a3.85 3.85 0 0 0-3.85-3.85h-8.5Zm8.9 1.5a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7ZM12 7.15a4.85 4.85 0 1 1 0 9.7 4.85 4.85 0 0 1 0-9.7Zm0 1.9a2.95 2.95 0 1 0 0 5.9 2.95 2.95 0 0 0 0-5.9Z"
  }))
};
function MarkerHighlight({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "marker-highlight"
  }, children);
}
function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, children);
}
function Button({
  variant = "primary",
  href = "#",
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    className: `btn btn-${variant}`,
    href: href
  }, rest), children);
}
function SocialLinks() {
  return /*#__PURE__*/React.createElement("div", {
    className: "social-links",
    "aria-label": "Redes sociales"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://www.linkedin.com/company/retinar",
    "aria-label": "LinkedIn"
  }, ICONS.linkedin), /*#__PURE__*/React.createElement("a", {
    href: "https://www.instagram.com/retinararg/",
    "aria-label": "Instagram"
  }, ICONS.instagram));
}
function Header() {
  return /*#__PURE__*/React.createElement("header", {
    className: "site-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container header-inner"
  }, /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#top"
  }, /*#__PURE__*/React.createElement("img", {
    className: "brand-logo",
    src: "../../assets/logos/retinar-logo-light.png",
    alt: "Retinar"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "primary-nav"
  }, /*#__PURE__*/React.createElement("a", {
    className: "language-switch",
    href: "#en"
  }, "EN"), /*#__PURE__*/React.createElement(SocialLinks, null), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#como-funciona"
  }, "Producto")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#producto"
  }, "Impacto")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#para-quien"
  }, "Para qui\xE9nes")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#sobre"
  }, "Sobre Retinar")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#blog-preview"
  }, "Blog")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    className: "nav-cta",
    href: "#demo"
  }, "Contacto"))))));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "hero section-dark",
    id: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container hero-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-copy"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Teleoftalmolog\xEDa para tamizaje"), /*#__PURE__*/React.createElement("h1", null, "Previniendo la ", /*#__PURE__*/React.createElement(MarkerHighlight, null, "ceguera por diabetes"), " con IA"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "Retinar mejora la eficiencia en la detecci\xF3n de retinopat\xEDa diab\xE9tica en hospitales, APS y campa\xF1as llevando diagn\xF3stico all\xED donde no hay un oftalm\xF3logo presente."), /*#__PURE__*/React.createElement("div", {
    className: "hero-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    href: "#demo",
    variant: "primary"
  }, "Solicitar demo"), /*#__PURE__*/React.createElement(Button, {
    href: "#como-funciona",
    variant: "outline"
  }, "C\xF3mo incorporar Retinar")), /*#__PURE__*/React.createElement("p", {
    className: "microcopy"
  }, "Desarrollado por Investigadores del CONICET y oftalm\xF3logos de Argentina. Autorizado por ANMAT."), /*#__PURE__*/React.createElement("div", {
    className: "hero-metrics"
  }, /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("strong", null, "+95% de sensibilidad"), /*#__PURE__*/React.createElement("span", null, "para detectar casos de riesgo")), /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("strong", null, "Revisi\xF3n cl\xEDnica garantizada"), /*#__PURE__*/React.createElement("span", null, "Deriv\xE1 s\xF3lo los casos de riesgo")), /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("strong", null, "+40 retin\xF3grafos compatibles"), /*#__PURE__*/React.createElement("span", null, "para aprovechar tu capacidad instalada")))), /*#__PURE__*/React.createElement("div", {
    className: "hero-media",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("figure", {
    className: "hero-shot"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/images/campaign-5.png",
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "hero-overlay"
  }, /*#__PURE__*/React.createElement("h2", null, "IA para control oftalmol\xF3gico de la persona diab\xE9tica"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Soporte para mejor calidad de imagen"), /*#__PURE__*/React.createElement("li", null, "Detecci\xF3n en tiempo real de riesgo de ceguera"), /*#__PURE__*/React.createElement("li", null, "Informe profesional con trazabilidad"))))));
}
Object.assign(window, {
  MarkerHighlight,
  Eyebrow,
  Button,
  SocialLinks,
  Header,
  Hero,
  ICONS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/sections.jsx
try { (() => {
/* eslint-disable react/prop-types */

function LogoCarousel({
  variant = "light",
  title,
  subtitle,
  items
}) {
  const trackRef = React.useRef(null);
  const scroll = dir => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: dir * 280,
      behavior: "smooth"
    });
  };
  const dark = variant === "dark";
  return /*#__PURE__*/React.createElement("section", {
    className: dark ? "section section-dark" : "section section-soft"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container section-heading"
  }, /*#__PURE__*/React.createElement("h2", {
    dangerouslySetInnerHTML: {
      __html: title
    }
  }), /*#__PURE__*/React.createElement("p", null, subtitle)), /*#__PURE__*/React.createElement("div", {
    className: `container carousel-shell ${dark ? "carousel-shell-dark" : ""}`
  }, /*#__PURE__*/React.createElement("button", {
    className: `carousel-button ${dark ? "carousel-button-dark" : ""}`,
    onClick: () => scroll(-1),
    "aria-label": "Anterior"
  }, "\u2190"), /*#__PURE__*/React.createElement("div", {
    className: "carousel-track",
    ref: trackRef
  }, items.map((it, i) => /*#__PURE__*/React.createElement("article", {
    key: i,
    className: `logo-card ${dark ? "logo-card-dark" : ""}`
  }, /*#__PURE__*/React.createElement("img", {
    src: it.logo,
    alt: it.alt,
    loading: "lazy"
  })))), /*#__PURE__*/React.createElement("button", {
    className: `carousel-button ${dark ? "carousel-button-dark" : ""}`,
    onClick: () => scroll(1),
    "aria-label": "Siguiente"
  }, "\u2192")));
}
function FeatureRow({
  id,
  title,
  kpiValue,
  kpiText,
  text,
  image,
  alt
}) {
  return /*#__PURE__*/React.createElement("article", {
    className: "feature-row",
    id: id
  }, /*#__PURE__*/React.createElement("div", {
    className: "feature-copy"
  }, /*#__PURE__*/React.createElement("h3", null, title), kpiValue ? /*#__PURE__*/React.createElement("div", {
    className: "feature-kpi",
    "aria-label": `${kpiValue} ${kpiText}`
  }, /*#__PURE__*/React.createElement("strong", null, kpiValue), /*#__PURE__*/React.createElement("span", null, kpiText)) : null, /*#__PURE__*/React.createElement("p", {
    className: "feature-description"
  }, text)), /*#__PURE__*/React.createElement("figure", {
    className: "feature-media"
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: alt
  })));
}
function FeatureStream() {
  return /*#__PURE__*/React.createElement("section", {
    id: "como-funciona",
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Un flujo vers\xE1til con ", /*#__PURE__*/React.createElement("span", {
    className: "marker-highlight"
  }, "impacto cl\xEDnico inmediato")), /*#__PURE__*/React.createElement("p", null, "Retinar permite montar estrategias distribuidas de tamizaje de retinopat\xEDa diab\xE9tica, llevando el control a nodos de captura sin oftalm\xF3logos y derivando los casos de riesgo a centros especializados de tratamiento.")), /*#__PURE__*/React.createElement("div", {
    className: "container feature-stream"
  }, /*#__PURE__*/React.createElement(FeatureRow, {
    id: "captura",
    title: "Captura descentralizada asistida",
    kpiValue: "0 revisitas",
    kpiText: "por mala calidad de imagen",
    text: "Ya no necesit\xE1s un oftalm\xF3logo para el control de tamizaje. Enfermeros o personal administrativo capacitado pueden capturar retinograf\xEDas en APS, y nuestra IA los ayuda a asegurar la calidad del estudio para evitar tener que repetirlos.",
    image: "../../assets/images/module-capture.png",
    alt: "Captura asistida de retinograf\xEDas en atenci\xF3n primaria"
  }), /*#__PURE__*/React.createElement(FeatureRow, {
    id: "tamizaje",
    title: "Tamizaje autom\xE1tico de riesgo",
    kpiValue: "95% de sensibilidad",
    kpiText: "para detectar casos de riesgo",
    text: "Nuestro algoritmo de IA detecta en tiempo real los casos referibles que requieren tratamiento de inmediato, con una sensibilidad mayor al 95%. Detectando casos de retinopat\xEDa diab\xE9tica no proliferativa moderada y severa, pod\xE9s derivarlos para confirmar diagn\xF3stico e iniciar el circuito terap\xE9utico.",
    image: "../../assets/images/module-ai.png",
    alt: "Priorizaci\xF3n autom\xE1tica de casos de riesgo"
  }), /*#__PURE__*/React.createElement(FeatureRow, {
    id: "informe",
    title: "Informe cl\xEDnico remoto",
    kpiValue: "10 minutos",
    kpiText: "para informar un caso",
    text: "Retinar permite al t\xE9cnico derivar los casos de riesgo a un oftalm\xF3logo para que los informe de manera remota, asistido por nuestra IA. El paciente recibe la confirmaci\xF3n de su diagn\xF3stico, un informe detallado indicando hallazgos, y la mejor sugerencia de tratamiento posible.",
    image: "../../assets/images/module-review.png",
    alt: "Revisi\xF3n remota con patolog\xEDas preidentificadas"
  })));
}
function ValueGrid() {
  const items = [{
    title: "Escalá tu estrategia de diagnóstico",
    text: "Aumentá la cobertura de tamizaje sin saturar tus oftalmólogos.",
    highlight: "Donde hay un retinógrafo, hay un control."
  }, {
    title: "Tiempo clínico recuperado",
    text: "Tus oftalmólogos se enfocan en confirmar diagnóstico y tratar pacientes.",
    highlight: "Más tiempo donde más se los necesita."
  }, {
    title: "Aprovechá tu capacidad instalada",
    text: "No tenés que cambiar tu retinógrafo para usar Retinar.",
    highlight: "Compatibles con +40 dispositivos."
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "producto",
    className: "section section-dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, /*#__PURE__*/React.createElement("span", {
    className: "marker-highlight"
  }, "Por qu\xE9"), " Retinar."), /*#__PURE__*/React.createElement("p", null, "M\xE1s cobertura, menos demora y mejor uso del tiempo m\xE9dico.")), /*#__PURE__*/React.createElement("div", {
    className: "container value-grid"
  }, items.map((it, i) => /*#__PURE__*/React.createElement("article", {
    key: i,
    className: "value-card"
  }, /*#__PURE__*/React.createElement("h3", null, it.title), /*#__PURE__*/React.createElement("p", null, it.text), /*#__PURE__*/React.createElement("span", {
    className: "value-highlight"
  }, it.highlight)))));
}
function SegmentGrid() {
  const cards = [{
    title: "Hospitales y redes",
    text: "Escalá campañas de prevención de ceguera con infraestructura existente.",
    image: "../../assets/images/segment-hospital.png"
  }, {
    title: "Clínicas oftalmológicas",
    text: "Concentrá el tiempo de tus médicos en informar y tratar.",
    image: "../../assets/images/segment-ophthalmology.png"
  }, {
    title: "Obras sociales y prepagas",
    text: "Reducí los costos de la pérdida de visión por diabetes con un control rápido y económico.",
    image: "../../assets/images/segment-technician.png"
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "para-quien",
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, /*#__PURE__*/React.createElement("span", {
    className: "marker-highlight"
  }, "Valor claro"), " para cada instituci\xF3n"), /*#__PURE__*/React.createElement("p", null, "Retinar te permite mejorar tus procesos de tamizaje y brindar nuevos servicios a un costo m\xEDnimo.")), /*#__PURE__*/React.createElement("div", {
    className: "container segment-grid"
  }, cards.map((c, i) => /*#__PURE__*/React.createElement("article", {
    key: i,
    className: "segment-card"
  }, /*#__PURE__*/React.createElement("figure", {
    className: "segment-media"
  }, /*#__PURE__*/React.createElement("img", {
    src: c.image,
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "segment-body"
  }, /*#__PURE__*/React.createElement("h3", null, c.title), /*#__PURE__*/React.createElement("p", null, c.text))))));
}
function LibraryGrid() {
  const posts = [{
    meta: "Implementación",
    title: "Retinar en la campaña del Hospital El Cruce",
    excerpt: "Cómo coordinamos un operativo de tamizaje con el servicio de oftalmología en Florencio Varela."
  }, {
    meta: "Retinografía",
    title: "Retinopatía diabética: detección temprana",
    excerpt: "Guía práctica para equipos clínicos sobre estadios y derivación.",
    image: "../../assets/images/blog-deteccion.png"
  }, {
    meta: "Adherencia",
    title: "Mejorar la adherencia al control de retina",
    excerpt: "Estrategias para sostener el control oftalmológico en personas con diabetes.",
    image: "../../assets/images/blog-adherencia.png"
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "blog-preview",
    className: "section section-soft"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Conoc\xE9 m\xE1s en ", /*#__PURE__*/React.createElement("span", {
    className: "marker-highlight"
  }, "nuestro blog")), /*#__PURE__*/React.createElement("p", null, "Acced\xE9 gratis a nuestros art\xEDculos con gu\xEDas pr\xE1cticas de implementaci\xF3n.")), /*#__PURE__*/React.createElement("div", {
    className: "container library-grid"
  }, posts.map((p, i) => /*#__PURE__*/React.createElement("article", {
    key: i,
    className: "library-card"
  }, /*#__PURE__*/React.createElement("p", {
    className: "resource-meta"
  }, p.meta), /*#__PURE__*/React.createElement("h3", null, p.title), /*#__PURE__*/React.createElement("p", null, p.excerpt), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-link",
    href: "#post"
  }, "Leer art\xEDculo")))), /*#__PURE__*/React.createElement("div", {
    className: "container library-action"
  }, /*#__PURE__*/React.createElement(Button, {
    href: "#blog",
    variant: "primary"
  }, "Ver todo el blog")));
}
function ConversionSection() {
  const [submitted, setSubmitted] = React.useState(false);
  const onSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "demo",
    className: "section section-dark conversion-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container conversion-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "conversion-copy"
  }, /*#__PURE__*/React.createElement("h2", null, "Implement\xE1 Retinar y reduc\xED los casos de ceguera por diabetes"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "Compartinos tu contexto institucional y te proponemos un plan de implementaci\xF3n."), /*#__PURE__*/React.createElement("p", {
    className: "conversion-guarantee"
  }, "Procesamiento alineado a protocolos internacionales de confidencialidad y anonimizaci\xF3n.")), /*#__PURE__*/React.createElement("form", {
    className: "form-shell",
    onSubmit: onSubmit
  }, /*#__PURE__*/React.createElement("h3", null, "Estamos para ayudarte"), /*#__PURE__*/React.createElement("p", null, "Dejanos tus datos y coordinamos una primera llamada."), submitted ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "1.2rem",
      color: "#cef71f"
    }
  }, "Gracias. Te contactamos en las pr\xF3ximas 48hs.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Nombre y apellido"), /*#__PURE__*/React.createElement("input", {
    placeholder: "Tu nombre",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Correo institucional"), /*#__PURE__*/React.createElement("input", {
    placeholder: "nombre@institucion.org",
    type: "email",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Instituci\xF3n"), /*#__PURE__*/React.createElement("input", {
    placeholder: "Hospital, red, obra social\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Tipo de consulta"), /*#__PURE__*/React.createElement("select", {
    defaultValue: ""
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true,
    style: {
      color: "#000"
    }
  }, "Seleccion\xE1 una opci\xF3n"), /*#__PURE__*/React.createElement("option", {
    style: {
      color: "#000"
    }
  }, "Implementaci\xF3n en mi instituci\xF3n"), /*#__PURE__*/React.createElement("option", {
    style: {
      color: "#000"
    }
  }, "Consulta t\xE9cnica o integraci\xF3n"), /*#__PURE__*/React.createElement("option", {
    style: {
      color: "#000"
    }
  }, "Soporte comercial"))), /*#__PURE__*/React.createElement("div", {
    className: "actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary"
  }, "Contactanos"), /*#__PURE__*/React.createElement("span", {
    className: "privacy-note"
  }, "Al enviar, acept\xE1s nuestra pol\xEDtica de privacidad."))))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container footer-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-col-brand"
  }, /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#top"
  }, /*#__PURE__*/React.createElement("img", {
    className: "brand-logo",
    src: "../../assets/logos/retinar-logo-light.png",
    alt: "Retinar"
  })), /*#__PURE__*/React.createElement("p", {
    className: "footer-tagline"
  }, "IA para teleoftalmolog\xEDa y detecci\xF3n temprana de ceguera prevenible."), /*#__PURE__*/React.createElement("p", {
    className: "footer-contact-email"
  }, /*#__PURE__*/React.createElement("span", {
    className: "footer-contact-email-label"
  }, "Correo:"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:hola@retinar.health"
  }, "hola@retinar.health")), /*#__PURE__*/React.createElement("div", {
    className: "footer-company-details"
  }, /*#__PURE__*/React.createElement("p", {
    className: "footer-company-line footer-company-line-identity"
  }, /*#__PURE__*/React.createElement("strong", null, "Retinar SAS"), " (CUIT 30-71892218-2)"), /*#__PURE__*/React.createElement("p", {
    className: "footer-company-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "footer-company-label"
  }, "Domicilio legal: "), /*#__PURE__*/React.createElement("span", null, "San Francisco 1678 (7000), Tandil, BA, Argentina")), /*#__PURE__*/React.createElement("p", {
    className: "footer-company-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "footer-company-label"
  }, "Domicilio comercial: "), /*#__PURE__*/React.createElement("span", null, "Instituto PLADEMA, Campus Universitario Tandil, Paraje Arroyo Seco S/N (7000), Tandil, BA, Argentina")), /*#__PURE__*/React.createElement("p", {
    className: "footer-company-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "footer-company-label"
  }, "Habilitaci\xF3n: "), /*#__PURE__*/React.createElement("span", null, "N\xBA 54151 (Direcci\xF3n de Farmacias, Ministerio de Salud de PBA). En tr\xE1mite ante ANMAT."))), /*#__PURE__*/React.createElement("div", {
    className: "footer-social-links"
  }, /*#__PURE__*/React.createElement(SocialLinks, null))), /*#__PURE__*/React.createElement("div", {
    className: "footer-col-nav"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "footer-nav-title"
  }, "Navegaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    className: "footer-nav-columns"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "footer-nav-list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#como-funciona"
  }, "Producto")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#producto"
  }, "Impacto")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#para-quien"
  }, "Para qui\xE9nes")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#blog-preview"
  }, "Blog"))), /*#__PURE__*/React.createElement("ul", {
    className: "footer-nav-list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#sobre"
  }, "Sobre Retinar")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#faq"
  }, "Preguntas frecuentes")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#privacidad"
  }, "Privacidad")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#terminos"
  }, "T\xE9rminos")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#contacto"
  }, "Contacto")))))), /*#__PURE__*/React.createElement("div", {
    className: "container footer-bottom"
  }, /*#__PURE__*/React.createElement("small", null, "Copyright 2026 Retinar.")));
}
Object.assign(window, {
  LogoCarousel,
  FeatureRow,
  FeatureStream,
  ValueGrid,
  SegmentGrid,
  LibraryGrid,
  ConversionSection,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/sections.jsx", error: String((e && e.message) || e) }); }

})();
