# GrantApp AI — Design System
> Reverse-engineered from live, inline-styled pages: `index.html`, `science_clusters.html`,
> `premium-hub.html`, `premium-chemistry-hub.html`. Each page hand-rolled its own `<style>`
> block (per doctrine — self-contained files), so tokens drifted in name and value across
> pages even though the underlying visual system stayed consistent. This document is the
> reconciliation: one canonical token set, with each page's real variation folded in as a
> deliberate **context**, not lost.

---

## 1. What actually varies vs. what's consistent

**Consistent across every page (the real invariants):**
- Font pairing: `Syne` (800/700 weight, tight letter-spacing) for display/headings, `DM Sans` for body, `DM Mono` for small uppercase meta/labels (premium pages only — public pages don't use mono at all)
- Dark background in the `#08–0a` range, near-black
- Amber (`#f59e0b`) as the universal accent/gold — every page agrees on this exact hex
- Glow-card pattern: a card gets a `radial-gradient` pseudo-element that fades in on hover, tinted to the card's category color, plus a matching `box-shadow` glow and `border-color` shift
- Border-radius scale: small chips ~4px, buttons/inputs ~8px, cards 11–14px (premium) or 20px (public marketing cards)
- Letter-spacing on headings: consistently negative (-0.02em to -0.04em), consistently positive/uppercase on eyebrow/label text (+0.08em to +0.16em)

**What genuinely varies — and why each variant is kept, not discarded:**

| Page | `--bg` | Naming style | Distinct thing it adds |
|---|---|---|---|
| `index.html` | `#0a0a0f` | Semantic (`--science`, `--arts`, `--commerce`) | Multi-stream marketing card, stat bar, step indicator |
| `science_clusters.html` | `#0a0a0f` | Contextual (`--accent` = blue, `--amber` = amber) | Breadcrumb nav, `.cluster-card`, `.for-list` |
| `premium-hub.html` | `#08080f` | Palette-named (`--gold`, `--blue`, `--violet`) | Tiered card system (`.core`/`.general`/`.specialist`), live/soon badges, solo hero-card (English) |
| `premium-chemistry-hub.html` | `#0a0a0f` | Semantic + surface levels (`--surface-2`, `--border-2`) | Paper-grid with live/coming states, notes-card, session/greeting chips |

The `--bg` values (`#0a0a0f` vs `#08080f`) are close enough (1-2 units off in one channel) that this reads as unintentional drift, not a deliberate two-brand system — **canonicalize to `#0a0a0f`** since 3 of 4 pages agree on it.

The naming divergence (`--science` vs `--accent` vs `--gold`/`--blue`) is the real problem to solve: a shared token file needs one name per concept. Below, each page's local name is mapped to one canonical token.

---

## 2. Canonical tokens

```css
:root {
  /* ── Surfaces ── */
  --bg:          #0a0a0f;
  --surface:     #111118;
  --surface-2:   #18181f;   /* from premium-chemistry-hub — needed for nested/raised elements */
  --border:      #1e1e2e;
  --border-2:    #2a2a3a;   /* from premium-chemistry-hub — needed for dividers on surface-2 */

  /* ── Text ── */
  --text:        #f0eff4;
  --muted:       #7a7a8c;
  --dim:         #32323f;   /* from premium-hub — footer notes, lowest-emphasis text */

  /* ── Brand accent (amber/gold — every page agrees on this hex) ── */
  --accent:      #f59e0b;
  --accent-dim:  rgba(245, 158, 11, 0.12);
  --accent-glow: rgba(245, 158, 11, 0.2);

  /* ── Stream identity colors ──
     Canonical names are semantic (index.html's convention), since these
     map to real subject-stream concepts (Science/Arts/Commerce), not
     arbitrary palette slots. premium-hub's --blue/--violet map onto
     --science/--arts respectively — same hex family, reconciled below. */
  --science:       #3b82f6;
  --science-glow:  rgba(59, 130, 246, 0.15);
  --science-dim:   rgba(110, 142, 251, 0.08);  /* premium-hub's lighter blue-dim variant, for dense card fills */

  --arts:          #a855f7;
  --arts-glow:     rgba(168, 85, 247, 0.15);
  --arts-dim:      rgba(167, 139, 250, 0.07);  /* premium-hub's lighter violet-dim variant */

  --commerce:      #10b981;
  --commerce-glow: rgba(16, 185, 129, 0.15);

  /* ── State colors ── */
  --green:      #10b981;
  --green-dim:  rgba(16, 185, 129, 0.12);
  --red:        #ef4444;
  --red-dim:    rgba(239, 68, 68, 0.12);
  --flag:       #f59e0b;
  --live:       #4ade80;      /* premium-hub's badge.live green — distinct from --green, used only for live/soon status badges */
  --live-dim:   rgba(74, 222, 128, 0.08);

  /* ── Typography ── */
  --font-display: 'Syne', sans-serif;
  --font-sans:    'DM Sans', sans-serif;
  --font-mono:    'DM Mono', 'Space Mono', 'Courier New', monospace;

  /* ── Spacing ── */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;

  /* ── Radius — two scales, both real, used for different things ── */
  --radius-sm:   4px;    /* chips, tags */
  --radius-md:   8px;    /* buttons, inputs */
  --radius-card: 14px;   /* premium/dashboard cards (paper-card, notes-card) */
  --radius-lg:   1.25rem; /* public marketing cards (stream-card) — visually 20px, intentionally larger than dashboard cards */
  --radius-full: 9999px;
}
```

**Reconciliation notes (so no page's intent gets silently lost):**
- `premium-hub.html`'s `--gold` → same value as `--accent`, not a separate token. Its `--blue`/`--violet` are lighter tints of `--science`/`--arts` used for dense low-opacity card fills — kept as `--science-dim`/`--arts-dim` rather than a parallel gold/blue/violet system, so there's one source of truth for "what color is Science."
- `science_clusters.html` locally called blue `--accent` because in that page's context, blue *is* the accent (it's the science-stream page). That's a legitimate scoping pattern, not an error — see Section 4 (stream context blocks) for how to keep this without renaming `--accent` globally.
- The stray broken `@keyframes` block in `premium-chemistry-hub.html`'s source (an orphaned `}` and `to { ... }` with no matching `@keyframes` opener) is **not ported here** — it's dead/broken CSS in the source itself, flagged for you to check against the original intent rather than guessed at.

---

## 3. Component library

### 3.1 Nav
Two real variants exist — pick per route type, don't merge into one:

**Public nav** (`index.html`, cluster pages) — full height, brand + single badge:
```css
nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0;
  background: rgba(10,10,15,0.9);
  backdrop-filter: blur(12px);
  z-index: 100;
}
```

**Dashboard nav** (`premium-hub.html`, `premium-chemistry-hub.html`) — shorter, denser, carries session state:
```css
nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 2rem;             /* premium-hub uses a fixed 50px height variant for max density — use 1rem padding as the default, 50px height as a compact option */
  border-bottom: 1px solid var(--border);
  background: rgba(10,10,15,0.92);
  backdrop-filter: blur(14px);
  position: sticky; top: 0; z-index: 100;
}
.nav-left { display: flex; align-items: center; gap: 1.25rem; }
.nav-divider { width: 1px; height: 18px; background: var(--border-2); }
.nav-subject {
  font-family: var(--font-mono); font-size: 0.68rem;
  color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em;
}
.nav-greeting {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--muted);
  background: var(--surface-2); border: 1px solid var(--border-2);
  padding: 0.25rem 0.7rem; border-radius: var(--radius-full);
}
```

`.brand` is shared across both:
```css
.brand {
  font-family: var(--font-display); font-weight: 800;
  color: var(--text); text-decoration: none; letter-spacing: -0.02em;
}
.brand span { color: var(--accent); }
```

### 3.2 Hero
Public hero (large, centered) vs. dashboard hero (left-aligned, compact) — both real, both kept:

```css
/* Public — index.html, cluster pages */
.hero { text-align: center; padding: 5rem 2rem 3rem; }
.hero h1 { font-family: var(--font-display); font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.04em; }

/* Dashboard — premium-hub.html */
.hub-hero { max-width: 960px; margin: 0 auto; padding: 3.5rem 2rem 2.5rem; }
.hub-title { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; }
```

Both share the gradient-text emphasis pattern:
```css
h1 em, .hub-title em {
  font-style: normal;
  background: linear-gradient(135deg, var(--accent) 0%, #f97316 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
```

### 3.3 Cards — three distinct card types, genuinely different jobs

**Stream card** (public, `index.html`) — large marketing card, one per stream:
```css
.stream-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 2rem;
  position: relative; overflow: hidden;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.stream-card::before {
  content: ''; position: absolute; inset: 0; opacity: 0;
  transition: opacity 0.3s; border-radius: inherit;
}
.stream-card.science::before { background: radial-gradient(ellipse at top left, var(--science-glow), transparent 60%); }
.stream-card:hover { transform: translateY(-4px); }
.stream-card:hover::before { opacity: 1; }
.stream-card.science:hover { border-color: var(--science); box-shadow: 0 0 30px var(--science-glow); }
```
(repeat `.arts`/`.commerce` variants with their own tokens — same pattern, different color)

**Tiered subject card** (dashboard, `premium-hub.html`) — small, dense, grid of many:
```css
.card {
  display: flex; align-items: center; gap: 0.85rem;
  padding: 0.95rem 1.1rem; border-radius: 11px;
  border: 1px solid var(--border);
  transition: border-color 0.18s, background 0.18s, transform 0.15s;
}
.card.core { background: var(--science-dim); border-color: rgba(110,142,251,0.12); }
.card.general { background: var(--arts-dim); border-color: rgba(167,139,250,0.1); }
.card.specialist { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.06); }
.card.soon { opacity: 0.45; pointer-events: none; }
```
Use `.core`/`.general`/`.specialist` as a **content tier**, not a stream — this is orthogonal to the science/arts/commerce system. A specific subject card can be `.core` regardless of which stream it belongs to.

**Paper card** (dashboard, `premium-chemistry-hub.html`) — richest card, live/coming states, per-paper actions:
```css
.paper-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-card); padding: 1.4rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.9rem;
  position: relative; overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}
.paper-card::before {
  content: ''; position: absolute; inset: 0; opacity: 0;
  transition: opacity 0.3s; border-radius: inherit; pointer-events: none;
}
.paper-card.live::before { background: radial-gradient(ellipse at top left, var(--accent-dim), transparent 65%); }
.paper-card.live:hover { border-color: rgba(245,158,11,0.4); box-shadow: 0 0 24px var(--accent-glow); transform: translateY(-2px); }
.paper-card.coming { opacity: 0.65; }
.paper-num { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: -0.04em; color: var(--accent); }
.paper-card.coming .paper-num { color: var(--muted); }
```

### 3.4 Status badges — two systems, kept distinct on purpose
`premium-chemistry-hub.html`'s **paper status** badge (live/coming, on a paper):
```css
.paper-status { font-family: var(--font-mono); font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); }
.status-live { background: var(--green-dim); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
.status-soon { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }
```
`premium-hub.html`'s **subject availability** badge (on a subject card) uses a slightly different green (`--live`, not `--green`) — this is a real, if subtle, distinction worth preserving: paper status is about content readiness, subject badge is about whether the subject page exists at all yet.
```css
.badge { font-family: var(--font-mono); font-size: 0.52rem; text-transform: uppercase; letter-spacing: 0.07em; border-radius: var(--radius-sm); padding: 0.17rem 0.42rem; }
.badge.live { color: var(--live); background: var(--live-dim); border: 1px solid rgba(74,222,128,0.18); }
.badge.soon { color: var(--muted); background: rgba(100,100,122,0.1); border: 1px solid rgba(100,100,122,0.15); }
```

### 3.5 Buttons (from `quiz-styles.css`, still the most complete button system)
```css
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.9rem; border-radius: var(--radius-md); font-family: var(--font-sans); font-size: 0.82rem; font-weight: 500; border: none; transition: all 0.2s; }
.btn-primary { background: var(--accent); color: #000; font-weight: 700; }
.btn-secondary { background: var(--surface-2); color: var(--text); border: 1px solid var(--border-2); }
.btn-danger { background: var(--red-dim); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }
```
Plus `premium-chemistry-hub.html`'s paper-specific button (larger touch target, sits inside a card):
```css
.btn-paper { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.55rem 0.75rem; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; }
.btn-start { background: var(--accent); color: #000; border: 1px solid var(--accent); }
.btn-start-disabled { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); cursor: not-allowed; }
```

### 3.6 Breadcrumb (from `science_clusters.html` — not present on other pages, needed for any nested route)
```css
.breadcrumb { font-size: 0.8rem; color: var(--muted); }
.breadcrumb a { color: var(--muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--text); }
.breadcrumb .sep { margin: 0 0.4rem; color: var(--border-2); }
.breadcrumb .current { color: var(--text); }
```

### 3.7 Notes / callout card (from `premium-chemistry-hub.html`)
```css
.notes-card {
  background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent);
  border-radius: var(--radius-card); padding: 1.5rem;
  display: flex; align-items: center; gap: 1.25rem;
  transition: box-shadow 0.2s;
}
.notes-card:hover { box-shadow: 0 0 20px var(--accent-glow); }
```

---

## 4. Stream context blocks (how `science_clusters.html`'s local `--accent` renaming survives)

Rather than force every page to only ever say `var(--science)`, wrap stream-specific pages in a context class that remaps `--accent` locally — this preserves the authoring convenience the original pages used (write `--accent` once, mean "this page's stream color") without creating a second parallel token system:

```css
.stream-context--science { --accent: var(--science); --accent-glow: var(--science-glow); }
.stream-context--arts    { --accent: var(--arts);    --accent-glow: var(--arts-glow); }
.stream-context--commerce{ --accent: var(--commerce); --accent-glow: var(--commerce-glow); }
```
A science cluster page's root element gets `class="stream-context--science"`; every `.btn-primary`, gradient-text `em`, etc. inside it now uses science-blue automatically, with zero component-level changes.

---

## 5. What's still genuinely unresolved (flagging honestly, not guessing)

- **`--surface-2`/`--border-2` don't exist in `index.html` or `premium-hub.html` at all.** They're real, used, and needed (dashboard nav's greeting chip, e.g.) — but two of four source pages simply didn't need a second surface level. Not a conflict, just confirms these are additive tokens for denser UI, not a universal requirement.
- **The broken `@keyframes` in `premium-chemistry-hub.html`** (Section 2 note) — there's a component that was meant to animate in and the source is truncated. Worth checking your original draft/backup of that file if the entrance animation mattered.
- **`premium-hub.html`'s fixed `50px` nav height** vs. the `1rem`-padding auto-height nav elsewhere — I defaulted to padding-based for consistency, but if the 50px was an intentional density constraint (e.g., to fit more above the fold on the premium dashboard), say so and I'll make dashboard nav height a fixed token instead.
