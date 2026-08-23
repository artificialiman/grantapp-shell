-- GrantApp Shell - Database Schema
-- Phase 2: Premium paper progression (full-completion gate)
--
-- Each subject has 10 papers of 50 questions. A paper unlocks only once
-- the previous paper in that subject has been fully completed (all 50
-- answered and submitted) — see ANTITHEFT_DOCTRINE_V1 / CONTENT_OWNERSHIP.md
-- for why this is a server-truth gate, not client state.

create table public.paper_progress (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  paper_number smallint not null check (paper_number between 1 and 10),
  status text not null default 'unlocked' check (status in ('locked', 'unlocked', 'in_progress', 'completed')),
  answered_count smallint not null default 0 check (answered_count between 0 and 50),
  score smallint,                          -- null until completed
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, subject, paper_number)
);

-- Enable Row Level Security
alter table public.paper_progress enable row level security;

-- A student can read their own progress rows only.
create policy "students read own paper progress"
  on public.paper_progress for select
  using (auth.uid() = student_id);

-- Progress rows are written ONLY via the server-side submit-paper endpoint,
-- which uses the service_role key. No insert/update/delete policy is granted
-- to the authenticated role — same pattern as device_bindings in 0001_init.sql.

-- Indexes for the common "give me this student's paper grid for a subject" query
create index idx_paper_progress_student_subject on public.paper_progress(student_id, subject);
