import { json } from '@sveltejs/kit';
import { updateMasteryForAnswer } from '$lib/quiz/mastery';
import type { RequestHandler } from './$types';

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

/**
 * Records a single answered question: scores it server-side (never trust
 * a client-reported "was I right"), logs it to answer_events (the
 * analytics ledger), and updates mastery_state for every taxonomy combo
 * the question touches. Mirrors the service_role-only write pattern in
 * api/submit-paper/+server.ts — the client never writes answer_events
 * or mastery_state directly (see 0003 migration's RLS policies).
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = (await request.json()) as {
			question_id: number;
			selected_option_id: string | null;
			confidence_rating?: number;
			time_taken_ms?: number;
			context: 'daily_100' | 'cluster_exam' | 'subject_drill' | 'premium_paper';
			context_ref?: string;
		};

		const { question_id, selected_option_id, confidence_rating, time_taken_ms, context, context_ref } =
			body;

		if (!question_id || !context) {
			return json({ message: 'Missing required fields' }, { status: 400 });
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

		const { data: question, error: questionError } = await adminClient
			.from('questions')
			.select(
				'id, subject, topic, cognitive_patterns, information_types, correct_option_id, negative_marking_value'
			)
			.eq('id', question_id)
			.single();

		if (questionError || !question) {
			return json({ message: 'Question not found' }, { status: 404 });
		}

		// Server-side scoring only — the client's own belief about
		// correctness is never trusted, same principle as paper_progress.
		const isSkipped = selected_option_id == null;
		const isCorrect = !isSkipped && selected_option_id === question.correct_option_id;
		const pointsAwarded = isSkipped ? 0 : isCorrect ? 1 : -question.negative_marking_value;

		const { error: insertError } = await adminClient.from('answer_events').insert({
			student_id: user.id,
			question_id: question.id,
			subject: question.subject,
			topic: question.topic,
			cognitive_patterns: question.cognitive_patterns,
			information_types: question.information_types,
			selected_option_id,
			is_correct: isCorrect,
			points_awarded: pointsAwarded,
			confidence_rating: confidence_rating ?? null,
			time_taken_ms: time_taken_ms ?? null,
			context,
			context_ref: context_ref ?? null
		});

		if (insertError) {
			console.error('answer_events insert error:', insertError);
			return json({ message: 'Failed to record answer' }, { status: 500 });
		}

		// Mastery is only meaningful for practice contexts the adaptive
		// engine draws from — not premium papers, which are gated content
		// rather than the adaptive pool (see 0003 migration's context note).
		if (context !== 'premium_paper' && !isSkipped) {
			await updateMasteryForAnswer(
				adminClient,
				user.id,
				question.subject,
				question.cognitive_patterns,
				question.information_types,
				isCorrect
			);
		}

		return json({ is_correct: isCorrect, points_awarded: pointsAwarded });
	} catch (err) {
		console.error('submit-answer error:', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
