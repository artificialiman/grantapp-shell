import type { LayoutServerLoad } from './$types';
import { client } from '$lib/supabase';

export const load: LayoutServerLoad = async (event) => {
	try {
		const session = await event.locals.getSession();
		const user = session?.user;

		let student = null;
		if (user) {
			const { data } = await client
				.from('students')
				.select('*')
				.eq('id', user.id)
				.single();
			student = data;
		}

		return {
			session,
			student,
			user
		};
	} catch (err) {
		console.error('Layout server load error:', err);
		return {
			session: null,
			student: null,
			user: null
		};
	}
};
