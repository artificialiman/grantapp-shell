import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Dashboard requires a session but NOT an active subscription — unlike
 * /premium (see premium/+layout.server.ts), analytics on free-tier
 * practice (daily 100, cluster exams, subject drills) is available to
 * any logged-in student. Gating this behind premium would mean a
 * student can't see their own weak areas until they've already paid,
 * which undercuts the free tier's value.
 */
export const load: LayoutServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();

	if (!session || !user) {
		throw redirect(303, '/login');
	}

	return { session };
};
