# GrantApp Shell Setup Guide

This document walks through setting up the GrantApp shell for development.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier OK for development)
- Git

## 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Go to **Settings → API** and copy:
   - Project URL
   - Anon Key (public)
   - Service Role Key (secret — keep this private!)

## 2. Local Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in the Supabase values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SERVICE_ROLE_KEY=your-service-role-key-here
   ```
3. **Never commit `.env.local`** — it's in `.gitignore`

## 3. Install Dependencies

```bash
npm install
```

## 4. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/0001_init.sql` and copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**

Wait for the migration to complete. You should see:
- `students` table
- `device_bindings` table
- `device_unlock_log` table
- RLS policies enabled

## 5. Create a Test User

1. In Supabase dashboard, go to **Authentication → Users**
2. Click **Add user**
3. Enter an email and password
4. Click **Create user**

Then, manually create a student record:
1. Go to **SQL Editor**
2. Run this query (replace `user-id-here` with the UUID from step 3):
   ```sql
   insert into public.students (id, full_name, subscription_active)
   values ('user-id-here', 'Test Student', true);
   ```

## 6. Start Development Server

```bash
npm run dev
```

The app should be running at `http://localhost:5173`

## 7. Test the Flow

1. Visit `http://localhost:5173`
2. Click **Login**
3. Enter the test user's email and password
4. You should be redirected to the home page
5. Visit `/premium` — you should see the premium hub (because subscription_active = true)

## 8. Manual Testing: Device Lock

To test the device lock feature:

1. Sign in as the test user in **Browser 1**
2. Open an **Incognito/Private window** (Browser 2)
3. Visit `http://localhost:5173/login`
4. Try to sign in with the same test account
5. You should see: *"This account is active on another device. Contact your administrator to switch devices."*
6. Close Browser 2's localStorage:
   - F12 → Application → Local Storage → clear
7. Refresh Browser 2
8. Sign in again — should work (new device tag generated)
9. Browser 1 should now be locked out (device mismatch)

## 9. Build for Production

```bash
npm run build
```

This generates a production build in the `build/` directory.

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists and has correct values
- Restart dev server after changing `.env.local`

### "VITE_SUPABASE_ANON_KEY is not defined"
- The anon key is public and should start with `eyJ...`
- It's OK to commit example values in `.env.local.example`; just never commit actual keys in `.env.local`

### "Unauthorized" when trying to access `/premium`
- Check the test user has `subscription_active = true` in Supabase
- Check session cookie is set (DevTools → Application → Cookies)

### Device binding fails with "Database error"
- Check SERVICE_ROLE_KEY is set in `.env.local`
- Check RLS policies are enabled (they should be after the migration)
- Check `device_bindings` table exists in Supabase

## Next Steps

After Phase 1 is complete and verified:
- Phase 2: Real question content (JSON generation from build.py)
- Phase 3: Admin unlock UI
- Phase 4: Analytics and monitoring
