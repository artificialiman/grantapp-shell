import { json } from '@sveltejs/kit';
import { selectAdaptiveQuestions } from '$lib/quiz/select';
import type { RequestHandler } from './$types';

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const DAILY_COUNT = 100;
const RECENCY_EXCLUDE_DAYS = 14; // don't resurface a question seen in the last 2 weeks, even if its combo is still weak

/**
 * Returns today's personalized 100 questions for a student in a subject.
 * Idempotent per (student, subject, day) — a re-request on the same day
 * returns the same set already stored in daily_assignments, rather than
 * regenerating a different 100. This matters for offline sync: the
 * client fetches once while online, caches the set, and answers may
 * come back out of order or after a reconnect — the set itself must be
 * stable across that window.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		const subject = url.searchParams.get('subject');
		if (!subject) {
			return json({ message: 'Missing subject parameter' }, { status: 400 });
		}

		if (!SERVICE_ROLE_KEY) {
			console.error('SERVICE_ROLE_KEY not configured');
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const { createClient } = await import('@supabase/supabase-js');
		const supabaseUrl = process.env.VITE_SUPABASE_URL;
		if (!supabaseUrl) {
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const adminClient = createClient(supabaseUrl, SERVICE_ROLE_KEY);
		const today = new Date().toISOString().slice(0, 10);

		const { data: existing, error: existingError } = await adminClient
			.from('daily_assignments')
			.select('question_ids, completed_count')
			.eq('student_id', session.user.id)
			.eq('assigned_date', today)
			.maybeSingle();

		if (existingError) throw existingError;

		let questionIds: number[];

		if (existing) {
			questionIds = existing.question_ids;
		} else {
			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() - RECENCY_EXCLUDE_DAYS);

			const { data: recentAnswers, error: recentError } = await adminClient
				.from('answer_events')
				.select('question_id')
				.eq('student_id', session.user.id)
				.eq('subject', subject)
				.gte('answered_at', cutoff.toISOString());

			if (recentError) throw recentError;

			const excludeIds = (recentAnswers ?? []).map((r) => r.question_id);
			const selected = await selectAdaptiveQuestions(
				adminClient,
				session.user.id,
				subject,
				DAILY_COUNT,
				excludeIds
			);

			questionIds = selected.map((q) => q.id);

			const { error: insertError } = await adminClient.from('daily_assignments').insert({
				student_id: session.user.id,
				assigned_date: today,
				question_ids: questionIds,
				completed_count: 0
			});

			if (insertError) throw insertError;
		}

		if (questionIds.length === 0) {
			return json({ questions: [], completed_count: 0 });
		}

		const { data: questions, error: questionsError } = await adminClient
			.from('questions')
			.select(
				'id, subject, topic, subtopic, cognitive_patterns, information_types, prompt, options, correct_option_id, explanation, negative_marking_value, difficulty'
			)
			.in('id', questionIds);

		if (questionsError) throw questionsError;

		// Preserve the original selection order rather than whatever order
		// Postgres's IN returns.
		const byId = new Map((questions ?? []).map((q) => [q.id, q]));
		const ordered = questionIds.map((id) => byId.get(id)).filter(Boolean);

		return json({
			questions: ordered,
			completed_count: existing?.completed_count ?? 0
		});
	} catch (err) {
		console.error('daily-100 error:', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
