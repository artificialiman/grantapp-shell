import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Real auth gate, not just an unlisted URL. No nav link anywhere in the
 * app points here (per Iman's spec), but that alone is not access
 * control — a URL with no link is still reachable by anyone who has it.
 * This checks the logged-in session's email against a server-side
 * allowlist (ADMIN_EMAILS, comma-separated, never exposed to the
 * client — no VITE_ prefix). Same "server-truth gate" principle as
 * premium/+layout.server.ts and paper_progress: the client never
 * decides its own admin status.
 */
export const load: LayoutServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();

	if (!session || !user?.email) {
		throw redirect(303, '/login');
	}

	const adminEmails = (process.env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((e: string) => e.trim().toLowerCase())
		.filter(Boolean);

	if (!adminEmails.includes(user.email.toLowerCase())) {
		// Deliberately identical redirect to "not logged in" — don't leak
		// that this route exists or that the check is email-based to a
		// logged-in non-admin user poking around.
		throw redirect(303, '/login');
	}

	return { session };
};
