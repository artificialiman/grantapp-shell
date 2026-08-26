import { redirect, isRedirect } from '@sveltejs/kit';
import { DEVICE_TAG_KEY } from '$lib/auth/deviceTag';
import type { LayoutServerLoad } from './$types';

/**
 * THE GATE -- currently SOFTENED, not removed.
 *
 * Premium UI is about to churn a lot. Getting redirected to /login on
 * every reload while iterating on that UI is friction with no payoff
 * right now, so the three checks below (session, active subscription,
 * bound device) no longer block navigation into /premium. The checks
 * still run and still fetch whatever data they can -- student profile,
 * device binding -- so pages under /premium keep receiving `session`
 * and `student` exactly as before, they're just never *enforced* by a
 * redirect while ENFORCE_GATE is false.
 *
 * This is the only line that needs to flip when premium UI work is
 * done and the hard lock needs to come back:
 */
const ENFORCE_GATE = false;

/**
 * The admin gate (src/routes/admin/+layout.server.ts) is separate and
 * untouched -- that one still hard-enforces on every load. This file
 * only softens the *premium* side.
 */
export const load: LayoutServerLoad = async (event) => {
	try {
		const { session, user } = await event.locals.safeGetSession();

		if (!session || !user) {
			if (ENFORCE_GATE) throw redirect(303, '/login');
			return { session: null, student: null };
		}

		// Fetch student profile (best-effort while gate is soft -- don't
		// throw on failure, just pass along whatever we have)
		const { data: student, error } = await event.locals.supabase
			.from('students')
			.select('*')
			.eq('id', user.id)
			.single();

		if (error || !student) {
			if (ENFORCE_GATE) throw redirect(303, '/login');
			return { session, student: null };
		}

		if (!student.subscription_active) {
			if (ENFORCE_GATE) throw redirect(303, '/login');
		}

		// Device-binding check -- same story, still runs, only enforced
		// when ENFORCE_GATE is true.
		const deviceTagCookie = event.cookies.get(DEVICE_TAG_KEY);

		const { data: binding, error: bindingError } = await event.locals.supabase
			.from('device_bindings')
			.select('device_tag')
			.eq('student_id', user.id)
			.single();

		if (ENFORCE_GATE) {
			if (bindingError || !binding) {
				throw redirect(303, '/login');
			}
			if (!deviceTagCookie || deviceTagCookie !== binding.device_tag) {
				throw redirect(303, '/login');
			}
		}

		return {
			session,
			student
		};
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		if (ENFORCE_GATE) {
			throw redirect(303, '/login');
		}
		// Gate is soft: swallow unexpected errors rather than block
		// navigation into /premium while its UI is being reworked.
		return { session: null, student: null };
	}
};
