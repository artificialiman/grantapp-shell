import type { PageServerLoad } from './$types';
import type { PaperSummary, PaperStatus } from '$lib/content/subjects';

const TOTAL_PAPERS = 10;

/**
 * Session check here used to redirect independently of the (now
 * softened) premium/+layout.server.ts gate -- meaning this route stayed
 * hard-locked even while the parent layout was relaxed. Softened to
 * match: no session just means no personal progress to show, not a
 * redirect. See premium/+layout.server.ts for the ENFORCE_GATE flag
 * that governs re-enabling all of this at once later.
 */
export const load: PageServerLoad = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();

	const subject = params.subject;

	let byNumber = new Map<number, { paper_number: number; status: string; answered_count: number; score: number | null }>();

	if (user) {
		const { data: rows, error } = await locals.supabase
			.from('paper_progress')
			.select('paper_number, status, answered_count, score')
			.eq('student_id', user.id)
			.eq('subject', subject);

		if (error) {
			console.error('Error loading paper progress:', error);
		}

		byNumber = new Map((rows ?? []).map((r) => [r.paper_number, r]));
	}

	// Papers with no row yet are implicitly locked, except Paper 1, which is
	// always open — a student's first attempt at any subject creates no row
	// until they actually start it (see submit-paper endpoint).
	const papers: PaperSummary[] = Array.from({ length: TOTAL_PAPERS }, (_, i) => {
		const number = i + 1;
		const row = byNumber.get(number);

		if (row) {
			return {
				number,
				status: row.status as PaperStatus,
				answeredCount: row.answered_count,
				score: row.score
			};
		}

		const previousCompleted = number === 1 || byNumber.get(number - 1)?.status === 'completed';
		return {
			number,
			status: (previousCompleted ? 'unlocked' : 'locked') as PaperStatus,
			answeredCount: 0,
			score: null
		};
	});

	// TODO: replace with real material listing once Section 2 materials
	// pipeline exists — loader.ts placeholder mirrors question-bank pattern.
	const materials: { id: string; title: string; type: string; src: string }[] = [];

	return { subject, papers, materials };
};
