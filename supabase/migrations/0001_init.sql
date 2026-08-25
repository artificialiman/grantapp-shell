-- GrantApp Shell - Database Schema
-- Phase 1: Auth + Device Binding + Offline Infrastructure

-- Students / accounts. Supabase Auth owns the actual credential (auth.users);
-- this table holds the app-specific profile and subscription state.
create table public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  subscription_active boolean not null default false,
  subscription_expires_at timestamptz
);

-- Device binding. One row per student, hard-enforced 1:1.
-- A second, different device does NOT replace this row automatically --
-- see /api/bind-device: a mismatched device_tag is rejected with 409, not
-- swapped in. The row only ever changes via an admin unlock (deferred to
-- Phase 9; see src/routes/api/admin/unlock/+server.ts), which is expected
-- to update this same row in place rather than insert a second one.
create table public.device_bindings (
  student_id uuid primary key references public.students(id) on delete cascade,
  device_tag text not null,
  device_label text,              -- human-readable, e.g. "Chrome on Android" — for admin unlock UI
  bound_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Admin unlock audit trail. Every forced device reset must be logged — no silent unlocks.
create table public.device_unlock_log (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id),
  previous_device_tag text,
  unlocked_by text not null,      -- admin identifier, never null
  unlocked_at timestamptz not null default now(),
  reason text
);

-- Enable Row Level Security
alter table public.students enable row level security;
alter table public.device_bindings enable row level security;
alter table public.device_unlock_log enable row level security;

-- RLS Policies

-- A student can read their own row only.
create policy "students read own row"
  on public.students for select
  using (auth.uid() = id);

-- A student can read their own device binding only (needed for client-side "you're locked out" messaging).
create policy "students read own device binding"
  on public.device_bindings for select
  using (auth.uid() = student_id);

-- Device bindings are written ONLY via a server-side function (Section 5), never directly from the client.
-- No insert/update/delete policy is granted to the authenticated role — this is intentional.
-- The service_role key (server-side only) bypasses RLS for the bind/rebind operation.

-- Unlock log is admin-only; no client policy at all in this pass.

-- Indexes for common queries
create index idx_device_bindings_student_id on public.device_bindings(student_id);
create index idx_device_unlock_log_student_id on public.device_unlock_log(student_id);
create index idx_device_unlock_log_unlocked_at on public.device_unlock_log(unlocked_at);
