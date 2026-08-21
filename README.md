# GrantApp Shell

A SvelteKit-based exam preparation platform with device-bound sessions, offline PWA support, and premium content delivery.

## Quick Start

```bash
npm install
npm run dev
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Architecture

- **Framework:** SvelteKit + TypeScript
- **Backend:** Supabase (Auth + Postgres + RLS)
- **Offline:** PWA with Workbox caching
- **Device Lock:** Hard lock enforced via device tags + server-side validation

## Key Files

- `src/lib/auth/deviceTag.ts` — Device UUID generation
- `src/lib/auth/session.ts` — Session validation, device binding
- `src/routes/premium/+layout.server.ts` — Premium content gate
- `src/routes/api/bind-device/+server.ts` — Device binding endpoint
- `supabase/migrations/0001_init.sql` — Database schema

## Features

- ✅ Supabase Auth (email/password)
- ✅ Device-bound hard lock (one device per student)
- ✅ Premium content gate (subscription-based)
- ✅ Offline-capable PWA shell
- ✅ Server-side session validation
- ✅ Row-level security (RLS)

## Next Steps

1. Follow [SETUP.md](./SETUP.md) to set up Supabase and run locally
2. Test the device-lock flow manually (2-browser test)
3. Phase 8: Content porting (JSON generation from build.py)

## Documentation

- [ANTITHEFT_DOCTRINE_V1.md](./ANTITHEFT_DOCTRINE_V1.md) — Architecture & migration guide
- [SETUP.md](./SETUP.md) — Local development setup

## License

(To be determined by IMAN)
