import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	// This endpoint is a stub for this phase.
	// Full implementation (admin unlock) is deferred to the next phase.
	return json(
		{
			message: 'Admin unlock functionality not yet implemented. Use Supabase dashboard to manage device bindings.'
		},
		{ status: 501 }
	);
};
