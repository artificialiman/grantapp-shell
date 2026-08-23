import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { client } from '$lib/supabase';
import type { PaperSummary, PaperStatus } from '$lib/content/subjects';

const TOTAL_PAPERS = 10;

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw redirect(303, '/login');
	}

	const subject = params.subject;

	const { data: rows, error } = await client
		.from('paper_progress')
		.select('paper_number, status, answered_count, score')
		.eq('student_id', session.user.id)
		.eq('subject', subject);

	if (error) {
		console.error('Error loading paper progress:', error);
	}

	const byNumber = new Map((rows ?? []).map((r) => [r.paper_number, r]));

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
