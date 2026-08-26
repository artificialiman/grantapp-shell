import { PREMIUM_TIERS } from '$lib/content/premium-subjects';
import type { PageServerLoad } from './$types';

const TOTAL_PAPERS = 10;

/**
 * `session` can now be null here -- the parent layout gate is softened
 * (see premium/+layout.server.ts) and no longer guarantees a session
 * before this load runs. Previously `session.user.id` was used
 * unconditionally, which would throw the moment an anonymous visitor
 * reached this page. Guarded below: no session just means no personal
 * progress to attach, not a crash.
 */
export const load: PageServerLoad = async ({ parent, locals }) => {
	const { student, session } = await parent();

	const completedBySubject = new Map<string, number>();

	if (session?.user?.id) {
		const { data: rows } = await locals.supabase
			.from('paper_progress')
			.select('subject, status')
			.eq('student_id', session.user.id);

		for (const row of rows ?? []) {
			if (row.status === 'completed') {
				completedBySubject.set(row.subject, (completedBySubject.get(row.subject) ?? 0) + 1);
			}
		}
	}

	// Attach real progress (papers completed out of 10) to each catalog
	// subject. Subjects with zero paper_progress rows simply show 0/10 —
	// that's a real, meaningful state (not started yet), distinct from
	// `available: false` on a subject with no papers built at all.
	const tiers = PREMIUM_TIERS.map((tier) => ({
		...tier,
		subjects: tier.subjects.map((subject) => ({
			...subject,
			completed: completedBySubject.get(subject.slug) ?? 0,
			total: TOTAL_PAPERS
		}))
	}));

	return { tiers, student };
};
