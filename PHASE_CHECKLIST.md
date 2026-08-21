# Project Build Checklist & Verification

## Phase 1: ✅ SvelteKit Scaffold
- [x] `package.json` — all dependencies listed
- [x] `tsconfig.json` — TypeScript config
- [x] `svelte.config.js` — SvelteKit adapter setup
- [x] `vite.config.ts` — Vite + PWA plugin config
- [x] `.eslintrc.json` — Linting rules
- [x] `.prettierrc` — Code formatting
- [x] `.gitignore` — Git exclusions
- [x] Directory structure created (all routes, lib, static, supabase)

**Deliverables:** SvelteKit project ready to run locally. To verify: `npm install && npm run dev` should start on localhost:5173.

---

## Phase 2: ✅ Supabase Client & Auth
- [x] `src/lib/supabase.ts` — Supabase client singleton
- [x] `src/hooks.server.ts` — Session middleware
- [x] `src/routes/login/+page.svelte` — Sign-in/sign-up form
- [x] `src/lib/auth/session.ts` — Session helpers (stub for Phase 2)
- [x] `src/routes/+layout.server.ts` — Load session on every page
- [x] `src/routes/+layout.svelte` — Global navbar

**Deliverables:** Login/signup forms wired to Supabase Auth. To verify: create test user in Supabase, sign in via UI.

---

## Phase 3: ✅ Database Schema & Device Binding
- [x] `supabase/migrations/0001_init.sql` — Full schema
  - `students` table (id, full_name, subscription_active, subscription_expires_at)
  - `device_bindings` table (student_id PRIMARY KEY, device_tag, device_label, bound_at, last_seen_at)
  - `device_unlock_log` table (id, student_id, previous_device_tag, unlocked_by, unlocked_at, reason)
- [x] RLS policies enabled (students read own rows, no client write to device_bindings)
- [x] `src/lib/auth/deviceTag.ts` — Device UUID generation + localStorage storage
- [x] `src/routes/api/bind-device/+server.ts` — Device binding endpoint (hard-lock logic)
- [x] `src/lib/auth/session.ts` — Full implementation with bindDevice(), validateSession(), signOut()

**Deliverables:** Database ready, device binding works. To verify:
- Run migration in Supabase SQL Editor
- First login should create device binding
- Check `device_bindings` table has 1 row

---

## Phase 4: ✅ Hard-Lock Flow
- [x] Device binding call in login flow
- [x] 409 error handling (lock-out message)
- [x] Sign-out on failed bind
- [x] `src/routes/api/admin/unlock/+server.ts` — Admin unlock stub (501)

**Deliverables:** Device lock prevents second device. To verify:
- Sign in Browser 1 → succeeds
- Sign in Browser 2 (same account, different private window) → 409 lock-out message
- Close Browser 2, clear localStorage, sign in again → succeeds on new device
- Browser 1 should now see session errors (old device invalidated)

---

## Phase 5: ✅ Premium Session Gate
- [x] `src/routes/premium/+layout.server.ts` — Gate logic (session check, subscription check, device mismatch)
- [x] Server-side redirect (303) if gate fails
- [x] `src/routes/premium/+layout.svelte` — Premium layout
- [x] `src/routes/premium/+page.svelte` — Premium hub (paper listing)
- [x] `src/routes/premium/[subject]/+page.svelte` — Subject-specific premium page

**Deliverables:** Premium routes protected. To verify:
- Unauthenticated visit to `/premium` → redirects to `/login`
- Authenticated but no subscription → redirects to `/login`
- Authenticated with subscription → loads premium hub
- Subscription status displayed on `/premium`

---

## Phase 6: ✅ PWA & Offline
- [x] `vite.config.ts` — `@vite-pwa/sveltekit` configured with:
  - Cache-first for `static/content/*` (question JSON)
  - Network-first for premium routes
  - Never cache auth endpoints
- [x] `src/routes/+layout.svelte` — Offline indicator (online/offline badge)
- [x] `static/fonts/` — Directory ready for self-hosted fonts
- [x] `static/content/placeholder.json` — Placeholder content file
- [x] Manifest config in `vite.config.ts` (name, icons, start_url, display)

**Deliverables:** PWA-ready. To verify:
- `npm run build` generates service worker
- App installable in Chrome (manifest recognized)
- DevTools → Network → Offline → app shell loads (no network errors)
- Online/offline badge toggles correctly

---

## Phase 7: ⏳ Manual Testing (YOUR RESPONSIBILITY)

### Pre-Test Checklist
- [ ] Node.js 18+ installed
- [ ] Supabase account created, project initialized
- [ ] `.env.local` created with Supabase credentials
- [ ] Migration run (`0001_init.sql` executed in Supabase SQL Editor)
- [ ] Test user created in Supabase Auth
- [ ] Test user record created in `students` table with `subscription_active = true`

### Test Steps (from SETUP.md Section 8–9)
- [ ] Local dev server runs: `npm run dev` → localhost:5173
- [ ] Home page loads with stream options
- [ ] Sign-in form works
- [ ] Sign-in succeeds, redirects to home
- [ ] Visit `/premium` with subscription → premium hub loads
- [ ] Device lock test: 2 browsers, 1 account, second is locked (409)
- [ ] Offline test: DevTools offline mode → app shell loads, login fails gracefully
- [ ] Build test: `npm run build` completes without errors

### Issues During Testing?
- See SETUP.md Section "Troubleshooting" or ANTITHEFT_DOCTRINE_V1.md Section 8

---

## Documentation Files

- [x] **README.md** — Project overview, quick start
- [x] **SETUP.md** — Step-by-step local development setup
- [x] **ANTITHEFT_DOCTRINE_V1.md** — Architecture, principles, invariants, troubleshooting
- [x] **BUILD_SUMMARY.md** — This file; file-by-file breakdown

---

## Project Statistics

| Category | Count |
|---|---|
| Routes | 9 (home, login, science, arts, commercial, premium hub, premium subject, + 2 API) |
| Components | 3 (SubjectCard, ClusterCard, QuizShell) |
| Library files | 5 (supabase.ts, deviceTag.ts, session.ts, content/loader.ts, + hooks.server.ts) |
| Configuration files | 7 (package.json, tsconfig, vite.config, svelte.config, .eslintrc, .prettierrc, .env.local.example) |
| Database tables | 3 (students, device_bindings, device_unlock_log) |
| RLS policies | 2 (students, device_bindings) |
| Database indexes | 3 (student_id x2, unlocked_at x1) |
| Migrations | 1 (0001_init.sql) |
| Total files created | **40+** |

---

## Environment Variables Required

Copy `.env.local.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SERVICE_ROLE_KEY=eyJ...
```

⚠️ Never commit `.env.local` — it's in `.gitignore`.

---

## Build Commands

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Type check
npm run check

# Lint + format
npm run lint
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Git Setup (After Phase 7)

```bash
cd grantapp-shell
git init
git add .
git commit -m "Phase 1-6: GrantApp shell scaffolding

- SvelteKit + TypeScript
- Supabase Auth + device-bound hard lock
- Premium content gate
- PWA offline support
- Database schema + RLS
"
git remote add origin https://github.com/artificialiman/grantapp-shell.git
git branch -M main
git push -u origin main
```

---

## Phase 8+ Roadmap

After Phase 7 passes:

| Phase | Task | Estimated Effort |
|---|---|---|
| 8 | Content porting (JSON from build.py) | 2–3 hours |
| 9 | Admin unlock UI | 2–3 hours |
| 10 | Payment/subscription flow | 3–4 hours |
| 11 | Analytics & monitoring | 2–3 hours |
| 12 | Edge Functions (advanced) | TBD |

---

## Common Questions

**Q: Why isn't the quiz loading?**  
A: Phase 6 only has placeholder content. Phase 8 will add real question JSON.

**Q: Can I test offline now?**  
A: Yes. DevTools → Network tab → Offline → refresh. App shell should load (cached). Login will fail gracefully (not cached).

**Q: How do I unlock a device in admin?**  
A: Currently, manually delete the row in Supabase `device_bindings` table and log the unlock in `device_unlock_log`. Phase 9 will add a UI for this.

**Q: What if I forget the service role key?**  
A: Go to Supabase dashboard → Settings → API → copy again. Never share this key.

**Q: Can I use this in production yet?**  
A: Not until you:
1. Complete Phase 7 (manual testing)
2. Add real content (Phase 8)
3. Build admin unlock UI (Phase 9)
4. Add payment flow (Phase 10)
5. Set up hosting (Vercel, Railway, etc.)

---

**All scaffolding complete. Ready for Phase 7 manual testing.**

Follow SETUP.md next. →
