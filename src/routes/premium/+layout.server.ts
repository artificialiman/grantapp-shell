import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	try {
		const { session, user } = await event.locals.safeGetSession();

		// Must have a session
		if (!session || !user) {
			throw redirect(303, '/login');
		}

		// Fetch student profile
		const { data: student, error } = await event.locals.supabase
			.from('students')
			.select('*')
			.eq('id', user.id)
			.single();

		if (error || !student) {
			throw redirect(303, '/login');
		}

		// Must have active subscription
		if (!student.subscription_active) {
			throw redirect(303, '/login');
		}

		return {
			session,
			student
		};
	} catch (err) {
		if (err instanceof Error && err.message.includes('redirect')) {
			throw err;
		}
		throw redirect(303, '/login');
	}
};
