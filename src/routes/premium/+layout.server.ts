import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { client } from '$lib/supabase';

export const load: LayoutServerLoad = async (event) => {
	try {
		const session = await event.locals.getSession();

		// Must have a session
		if (!session) {
			throw redirect(303, '/login');
		}

		// Fetch student profile
		const { data: student, error } = await client
			.from('students')
			.select('*')
			.eq('id', session.user.id)
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
