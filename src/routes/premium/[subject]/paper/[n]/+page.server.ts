import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { client } from '$lib/supabase';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw redirect(303, '/login');
	}

	const subject = params.subject;
	const paperNumber = Number(params.n);

	if (!Number.isInteger(paperNumber) || paperNumber < 1 || paperNumber > 10) {
		throw error(404, 'Paper not found');
	}

	// Paper 1 is always reachable. Every other paper needs the previous one
	// marked completed server-side — this check must live here, not just in
	// the hub UI, or a student could hit the URL directly and skip the gate.
	if (paperNumber > 1) {
		const { data: previous } = await client
			.from('paper_progress')
			.select('status')
			.eq('student_id', session.user.id)
			.eq('subject', subject)
			.eq('paper_number', paperNumber - 1)
			.maybeSingle();

		if (previous?.status !== 'completed') {
			throw redirect(303, `/premium/${subject}`);
		}
	}

	const { data: current } = await client
		.from('paper_progress')
		.select('status, answered_count, score')
		.eq('student_id', session.user.id)
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
