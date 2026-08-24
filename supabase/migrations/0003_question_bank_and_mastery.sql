-- GrantApp Shell - Database Schema
-- Phase 3: Question bank, dual-axis taxonomy, adaptive mastery, analytics
--
-- Built against TAXONOMY.md (dual-axis: Cognitive Pattern x Information
-- Type, both multi-tag per question) plus a separate, non-mastery Topic
-- axis used for filtering/browsing only. See TAXONOMY.md for the tag
-- vocabulary rationale — tags are treated as extensible strings, not
-- fixed Postgres enums, since the doc explicitly says the vocabulary is
-- expected to keep evolving.
--
-- This phase covers: bulk-importable question bank, per-student mastery
-- state (the adaptive engine's read model), and a full per-answer event
-- log (the analytics write model). Selection logic itself lives in
-- SvelteKit server routes for now (+server.ts), not in SQL — see
-- src/lib/quiz/select.ts. Promote to a Postgres RPC once proven, per the
-- existing service_role-only write pattern in 0001/0002.

-- ── Question bank ──────────────────────────────────────────────────

create table public.questions (
  id bigint generated always as identity primary key,
  subject text not null,                    -- e.g. 'chemistry', 'physics' — matches subject slugs used elsewhere in the app
  topic text not null,                      -- syllabus topic, e.g. 'Atomic Structure and Bonding'
  subtopic text,                            -- optional finer breakdown within topic

  -- Dual-axis taxonomy (TAXONOMY.md). Arrays, not enums — a question can
  -- and often should carry multiple tags per axis.
  cognitive_patterns text[] not null default '{}',   -- e.g. {'Logical','Procedural'} — Axis 1
  information_types text[] not null default '{}',    -- e.g. {'Essential','Formula topics'} — Axis 2

  prompt text not null,
  options jsonb not null,                   -- [{ "id": "a", "text": "..." }, ...]
  correct_option_id text not null,
  explanation text,

  -- JAMB negative marking: how many points a WRONG answer costs. A correct
  -- answer always earns +1 (normalized; premium paper scoring can scale
  -- this separately). Stored per-question so difficulty-weighted negative
  -- marking is possible later without a schema change.
  negative_marking_value numeric not null default 0.25 check (negative_marking_value >= 0),

  difficulty smallint check (difficulty between 1 and 5),  -- coarse fallback signal; the real adaptive signal is the mastery grid below, not this

  source text,                              -- provenance note (e.g. 'JAMB 2019', 'authored'), not shown to students
  active boolean not null default true,     -- soft-disable instead of delete, so historical answer_events stay valid
  created_at timestamptz not null default now(),
  created_by text                           -- admin identifier, mirrors device_unlock_log's "unlocked_by" convention
);

create index idx_questions_subject on public.questions(subject) where active;
create index idx_questions_subject_topic on public.questions(subject, topic) where active;
create index idx_questions_cognitive_patterns on public.questions using gin(cognitive_patterns);
create index idx_questions_information_types on public.questions using gin(information_types);

-- ── Per-student mastery grid ───────────────────────────────────────
-- The adaptive engine's read model. One row per
-- (student, subject, cognitive_pattern, information_type) COMBO — the
-- cross-tabulation Iman specified, not two independent per-axis scores.
-- Updated incrementally after every answered question (see
-- api/submit-answer). A student who has never touched a given combo
-- simply has no row — treat missing as "unknown", not "weak" or
-- "strong", when selecting.

create table public.mastery_state (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  cognitive_pattern text not null,
  information_type text not null,

  attempts smallint not null default 0,
  correct smallint not null default 0,

  -- Exponential moving average of correctness, weighted toward recent
  -- answers so mastery reflects current standing, not lifetime average.
  -- Range 0-1. Null until the first attempt on this combo.
  mastery_score numeric check (mastery_score is null or mastery_score between 0 and 1),

  last_attempted_at timestamptz,
  updated_at timestamptz not null default now(),

  unique (student_id, subject, cognitive_pattern, information_type)
);

alter table public.mastery_state enable row level security;

create policy "students read own mastery state"
  on public.mastery_state for select
  using (auth.uid() = student_id);

-- Written only via the server-side submit-answer endpoint (service_role),
-- same pattern as device_bindings / paper_progress. No client write policy.

create index idx_mastery_state_student_subject on public.mastery_state(student_id, subject);

-- ── Per-answer event log ───────────────────────────────────────────
-- The analytics write model. Every answered question gets one row here,
-- regardless of whether it came from a cluster exam, a premium paper, or
-- ad-hoc subject drill practice. This is the source of truth the
-- dashboard's granular views are computed from — mastery_state is a
-- derived/summary table for fast adaptive lookups, this is the ledger.

create table public.answer_events (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  question_id bigint not null references public.questions(id),

  -- Denormalized copies of the question's taxonomy at answer time.
  -- Deliberate: if a question's tags are edited later, past analytics
  -- should reflect what the student actually experienced, not be
  -- silently rewritten by a retroactive tag change.
  subject text not null,
  topic text not null,
  cognitive_patterns text[] not null,
  information_types text[] not null,

  selected_option_id text,                  -- null if the student skipped/timed out
  is_correct boolean not null,
  points_awarded numeric not null,          -- +1 for correct; -negative_marking_value for wrong; 0 for skipped

  confidence_rating smallint check (confidence_rating between 1 and 5),  -- student's self-rated confidence, captured per Iman's spec
  time_taken_ms integer,

  -- Where this answer came from — lets the dashboard break down
  -- performance by context, and lets the adaptive engine exclude/include
  -- sources as needed (e.g. don't adapt daily-100 selection off premium
  -- paper answers, since those are gated content, not practice pool draws).
  context text not null check (context in ('daily_100', 'cluster_exam', 'subject_drill', 'premium_paper')),
  context_ref text,                         -- e.g. paper_number or cluster slug, free-form per context

  answered_at timestamptz not null default now()
);

alter table public.answer_events enable row level security;

create policy "students read own answer events"
  on public.answer_events for select
  using (auth.uid() = student_id);

-- Written only via the server-side submit-answer endpoint. No client
-- write policy — same reasoning as paper_progress: client-reported
-- correctness/points cannot be trusted as the write path.

create index idx_answer_events_student on public.answer_events(student_id, answered_at desc);
create index idx_answer_events_student_subject on public.answer_events(student_id, subject);
create index idx_answer_events_student_topic on public.answer_events(student_id, subject, topic);
create index idx_answer_events_cognitive_patterns on public.answer_events using gin(cognitive_patterns);
create index idx_answer_events_information_types on public.answer_events using gin(information_types);

-- ── Daily 100 assignment ───────────────────────────────────────────
-- Records which 100 questions were assigned to a student on a given day,
-- so the offline-sync flow has a stable, re-fetchable set (the client
-- shouldn't regenerate a different 100 if it re-requests before syncing
-- answers back), and so "did they finish today's 100" is a simple query.

create table public.daily_assignments (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  assigned_date date not null default current_date,
  question_ids bigint[] not null,
  completed_count smallint not null default 0,
  created_at timestamptz not null default now(),

  unique (student_id, assigned_date)
);

alter table public.daily_assignments enable row level security;

create policy "students read own daily assignments"
  on public.daily_assignments for select
  using (auth.uid() = student_id);

-- Written only server-side (service_role) — same pattern throughout this file.

create index idx_daily_assignments_student_date on public.daily_assignments(student_id, assigned_date desc);
