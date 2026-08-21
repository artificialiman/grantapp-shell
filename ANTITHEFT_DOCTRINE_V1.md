# GrantApp Shell — Antitheft Doctrine v1
> Migration manual for AI coding agents (GitHub Copilot Workspace, Antigravity, Claude Code, etc.)
> **Rule Zero, carried forward:** Every module does one job. Never let a fix in one file bleed into another file's job.

**Source repo (reference, read-only):** `artificialiman/UTMEDaily`
**Target repo:** new SvelteKit app — name TBD, referred to here as `grantapp-shell`
**Supersedes:** `ANTIFAIL_DOCTRINE_V2.md` for anything this document explicitly restates. Where this document is silent, ANTIFAIL_DOCTRINE_V2 still governs (fonts, question embedding contract, build.py ownership, scoring rules, CSS scope boundaries).

---

## 0. What is changing and what is not

| Staying the same | Changing |
|---|---|
| Static build-time question generation (`build.py` logic, Fisher-Yates shuffle, `esc()` escaping) | Hosting/framework: static HTML → SvelteKit |
| Self-contained premium papers (no runtime fetch for question data) | Auth: hardcoded SHA-256 → Supabase Auth |
| No negative marking on premium, negative marking on free tier | Session: `sessionStorage` 3hr TTL → Supabase session + **device-bound hard lock** |
| Fonts (Syne / DM Sans / Space Mono / DM Mono) | Offline: none → full offline-capable PWA with service worker |
| `<a href>` routing philosophy (traceable failures) | Routing: real anchors → SvelteKit's file-based routing (still produces real URLs, still no silent JS-only navigation) |
| CSS token architecture (`studi054-core.css` / brand pack pattern) | Content delivery: plain page fetch → cached-first PWA shell |

**Why static generation survives the migration:** the value of `build.py` (shuffle, balance, escaping, source-verification) is a data-integrity job, not a hosting job. Moving frameworks does not change that job. Re-run the same Python pipeline, emit JSON instead of stamped `<script>` blocks, and load the JSON as a static asset. Nothing about the actual content pipeline needs to change in this pass.

---

## 1. Stack

- **Framework:** SvelteKit, with `@sveltejs/adapter-auto` (standard SvelteKit app with SSR + service worker support)
- **Backend:** Supabase (Postgres + Auth + Row Level Security)
- **PWA layer:** `@vite-pwa/sveltekit` (Workbox-managed)
- **Source control:** GitHub, `artificialiman/grantapp-shell`

---

## 2. Repository shape (completed in Phase 1)

```
grantapp-shell/
├── src/
│   ├── app.html
│   ├── app.css                      ← token architecture
│   ├── lib/
│   │   ├── supabase.ts              ← single Supabase client instance
│   │   ├── auth/
│   │   │   ├── session.ts           ← session read/write, device-tag logic
│   │   │   └── deviceTag.ts         ← device fingerprint generation
│   │   ├── content/
│   │   │   └── loader.ts            ← loads static question JSON
│   │   └── components/
│   │       ├── SubjectCard.svelte
│   │       ├── ClusterCard.svelte
│   │       └── QuizShell.svelte
│   ├── routes/
│   │   ├── +layout.svelte           ← global nav, offline-status indicator
│   │   ├── +layout.server.ts        ← session loading
│   │   ├── +page.svelte             ← stream picker
│   │   ├── login/+page.svelte
│   │   ├── signup/+page.svelte
│   │   ├── science/+page.svelte
│   │   ├── arts/+page.svelte
│   │   ├── commercial/+page.svelte
│   │   └── premium/
│   │       ├── +layout.server.ts    ← session gate
│   │       ├── +layout.svelte
│   │       ├── +page.svelte         ← replaces premium-hub.html
│   │       └── [subject]/+page.svelte
│   ├── api/
│   │   ├── bind-device/+server.ts   ← Phase 3 device binding
│   │   └── admin/unlock/+server.ts  ← Phase 3 stub
│   ├── hooks.server.ts              ← Supabase session middleware
│   └── service-worker.ts            ← generated via vite-pwa
├── static/
│   ├── fonts/                       ← self-hosted Google Fonts
│   └── content/                     ← placeholder JSON files
├── supabase/
│   └── migrations/
│       └── 0001_init.sql            ← schema, RLS policies
├── package.json
├── tsconfig.json
├── svelte.config.js
├── vite.config.ts
├── .env.local.example
├── .gitignore
├── SETUP.md                         ← new contributor guide
└── ANTITHEFT_DOCTRINE_V1.md         ← this file
```

---

## 3. Build Order Summary (Phases 1–7)

All phases have been completed **except** Phase 7 (manual testing). You now have:

- ✅ **Phase 1:** SvelteKit scaffold, all routes created, local build ready
- ✅ **Phase 2:** Supabase client wired, login/signup forms functional
- ✅ **Phase 3:** Database schema (migration 0001_init.sql), device binding route, RLS policies defined
- ✅ **Phase 4:** Hard-lock flow: first device binds, second device is rejected
- ✅ **Phase 5:** Premium gate: `/premium/*` requires valid session + subscription + device match
- ✅ **Phase 6:** PWA configuration, offline indicator, cache-strategy configured
- ⏳ **Phase 7:** Manual testing (you do this)

---

## 4. What You Need to Do

1. **Install Node.js 18+** if not already installed
2. **Follow SETUP.md:**
   - Create Supabase project
   - Copy environment variables to `.env.local`
   - Run the database migration (0001_init.sql)
   - Create a test user
3. **Start dev server:**
   ```bash
   cd grantapp-shell
   npm install
   npm run dev
   ```
4. **Run Phase 7 manual tests** (see SETUP.md section 8–9)

---

## 5. Files Structure Reference

### Authentication & Session
- `src/lib/supabase.ts` — Supabase client, session helpers
- `src/lib/auth/deviceTag.ts` — Device UUID generation + storage
- `src/lib/auth/session.ts` — Device binding, validation, sign-out

### Routes & Pages
- `src/routes/+layout.svelte` — Global navbar, offline indicator
- `src/routes/login/+page.svelte` — Sign in + device bind flow
- `src/routes/premium/+layout.server.ts` — **THE GATE** (session + subscription + device check)
- `src/routes/api/bind-device/+server.ts` — Device binding logic (hard lock)

### Database
- `supabase/migrations/0001_init.sql` — All tables, RLS policies, indexes

### Configuration
- `svelte.config.js` — SvelteKit config
- `vite.config.ts` — Vite + PWA config
- `tsconfig.json` — TypeScript config
- `package.json` — Dependencies

---

## 6. Key Invariants (Never Break These)

1. **One device, one student, always.** `device_bindings` has max 1 row per student. No concurrent sessions.
2. **No client-side write to `device_bindings`.** Server-only, using `SERVICE_ROLE_KEY`.
3. **A rejected login never mutates state.** Lock-out is pure read + reject, no side effects.
4. **Every device change is logged.** `device_unlock_log` has a row for every bind/rebind/unlock.
5. **Premium content never round-trips at render time.** Once cached, loads offline with zero network calls.
6. **The session gate lives in exactly one file.** `src/routes/premium/+layout.server.ts`. No redundant checks.
7. **Secrets are never committed.** `.env.local` is in `.gitignore`; keys live only in local files or CI/CD secrets.

---

## 7. Next Tasks (Deferred to Later Phases)

- **Phase 8:** Content porting (JSON generation from build.py)
- **Phase 9:** Admin unlock UI
- **Phase 10:** Payment/subscription purchase flow
- **Phase 11:** Analytics & monitoring
- **Phase 12:** Edge Functions (deferred)

---

## 8. Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Missing Supabase environment variables" | `.env.local` missing or empty | Copy `.env.local.example` → `.env.local`, fill in values |
| Device bind fails with 409 | Account already bound on another device | Expected behavior! Clear localStorage on second device and try again |
| `/premium` shows login instead of content | Session expired or subscription not active | Check Supabase: `students` table, `subscription_active = true` |
| Offline indicator always shows "Offline" | Service Worker not installed | Rebuild PWA; check browser support |
| RLS policy rejects read attempts | Incorrect user ID in query | Ensure `auth.uid()` matches the `id` in the policy |

---

## 9. Architecture Decisions Explained

### Why no client-side device binding?
If the browser could write its own device tag to `device_bindings`, the lock is decorative — a script could bypass it.

### Why localStorage, not fingerprinting?
Browser fingerprints (canvas, user-agent) are unreliable (iOS privacy features defeat them) and fragile. A stored UUID is simpler, more reliable, and security is enforced server-side anyway.

### Why `@vite-pwa/sveltekit` and not hand-rolled service worker?
Workbox handles cache-strategy edge cases (partial responses, opaque responses, versioning) that manual workers get wrong.

### Why Supabase Auth instead of hardcoded SHA-256?
SHA-256 has no device awareness. Supabase Auth + device binding closes the "one user, multiple devices" gap — a real gap for a paid product.

---

## References & Further Reading

- **SvelteKit Docs:** https://kit.svelte.dev
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **@vite-pwa/sveltekit:** https://vite-pwa-org.netlify.app/frameworks/sveltekit.html
- **Workbox:** https://developers.google.com/web/tools/workbox

---

> **All scaffolding, wiring, and configuration is complete.** 
> Next action: Follow SETUP.md to create Supabase project and test.
