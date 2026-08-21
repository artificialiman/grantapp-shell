import type { Handle } from '@sveltejs/kit';
import { client } from '$lib/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		const {
			data: { session }
		} = await client.auth.getSession();

		event.locals.getSession = async () => session;
	} catch (error) {
		event.locals.getSession = async () => null;
	}

	return resolve(event);
};
