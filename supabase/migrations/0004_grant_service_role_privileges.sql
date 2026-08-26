-- Fix: service_role was missing explicit table-level GRANTs.
--
-- In Supabase, service_role is *supposed* to bypass RLS entirely, but
-- RLS bypass and table-level privileges are two separate Postgres
-- mechanisms — bypassing RLS doesn't matter if the role was never
-- granted SELECT/INSERT/UPDATE/DELETE on the table in the first place.
-- Confirmed via a live Vercel runtime log:
--
--   code: '42501'
--   message: 'permission denied for table device_bindings'
--   hint: 'Grant the required privileges to the current role with:
--          GRANT SELECT ON public.device_bindings TO service_role;'
--
-- Postgres's own hint is the fix. Applying it to every table this app's
-- service_role-only write pattern depends on (see 0001-0003's comments:
-- "no client write policy — service_role bypasses RLS"), not just the
-- one table that happened to surface the error first.

grant select, insert, update, delete on public.students to service_role;
grant select, insert, update, delete on public.device_bindings to service_role;
grant select, insert, update, delete on public.device_unlock_log to service_role;
grant select, insert, update, delete on public.paper_progress to service_role;
grant select, insert, update, delete on public.questions to service_role;
grant select, insert, update, delete on public.mastery_state to service_role;
grant select, insert, update, delete on public.answer_events to service_role;
grant select, insert, update, delete on public.daily_assignments to service_role;

-- Sequences backing the bigint identity columns also need explicit
-- grants for service_role to insert into these tables at all.
grant usage, select on all sequences in schema public to service_role;
