import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Session redirect removed here too, same reasoning as
 * premium/[subject]/+page.server.ts -- see premium/+layout.server.ts's
 * ENFORCE_GATE flag. The paper-progression check below (previous paper
 * must be completed) is a *content* gate, not a login gate, so it stays
 * -- it just needs a sensible fallback when there's no signed-in user to
 * check progress against (treat as unlocked rather than crash or 401).
 */
export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	const subject = params.subject;
	const paperNumber = Number(params.n);

	if (!Number.isInteger(paperNumber) || paperNumber < 1 || paperNumber > 10) {
		throw error(404, 'Paper not found');
	}

	if (!user) {
		// No session to check progress against -- don't block, just skip
		// the personal-progress lookups.
		return {
			subject,
			paperNumber,
			status: 'unlocked' as const,
			answeredCount: 0,
			score: null,
			questions: [] as unknown[]
		};
	}

	// Paper 1 is always reachable. Every other paper needs the previous one
	// marked completed server-side — this check must live here, not just in
	// the hub UI, or a student could hit the URL directly and skip the gate.
	if (paperNumber > 1) {
		const { data: previous } = await locals.supabase
			.from('paper_progress')
			.select('status')
			.eq('student_id', user.id)
			.eq('subject', subject)
			.eq('paper_number', paperNumber - 1)
			.maybeSingle();

		if (previous?.status !== 'completed') {
			// Was: redirect(303, `/premium/${subject}`). With the login gate
			// softened we still want to keep this *content* progression rule,
			// but without a hard redirect loop when someone's just browsing --
			// report it as locked instead and let the UI decide what to show.
			return {
				subject,
				paperNumber,
				status: 'locked' as const,
				answeredCount: 0,
				score: null,
				questions: [] as unknown[]
			};
		}
	}

	const { data: current } = await locals.supabase
		.from('paper_progress')
		.select('status, answered_count, score')
		.eq('student_id', user.id)
		.eq('subject', subject)
		.eq('paper_number', paperNumber)
		.maybeSingle();

	// TODO: swap for the real question-bank loader once Section 2's content
	// pipeline lands (loadQuestionContent in lib/content/loader.ts).
	// Diagrams travel inside each question per subjects.ts's Question type.
	const questions: unknown[] = [];

	return {
		subject,
		paperNumber,
		status: current?.status ?? 'unlocked',
		answeredCount: current?.answered_count ?? 0,
		score: current?.score ?? null,
		questions
	};
};
