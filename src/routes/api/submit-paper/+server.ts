import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

/**
 * Records paper progress and, only on full completion (50/50 answered),
 * unlocks the next paper. This is the one place progression state is
 * written — mirrors the service_role-only write pattern in
 * api/bind-device/+server.ts. The client never writes paper_progress directly.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { subject, paper_number, answered_count, score } = (await request.json()) as {
			subject: string;
			paper_number: number;
			answered_count: number;
			score?: number;
		};

		if (!subject || !paper_number || answered_count == null) {
			return json({ message: 'Missing required fields' }, { status: 400 });
		}

		if (!SERVICE_ROLE_KEY) {
			console.error('SERVICE_ROLE_KEY not configured');
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const { createClient } = await import('@supabase/supabase-js');
		const supabaseUrl = process.env.VITE_SUPABASE_URL;

		if (!supabaseUrl) {
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const adminClient = createClient(supabaseUrl, SERVICE_ROLE_KEY);

		const isComplete = answered_count >= 50;
		const status = isComplete ? 'completed' : 'in_progress';

		const { error: upsertError } = await adminClient.from('paper_progress').upsert(
			{
				student_id: user.id,
				subject,
				paper_number,
				status,
				answered_count,
				score: isComplete ? (score ?? null) : null,
				started_at: new Date().toISOString(),
				completed_at: isComplete ? new Date().toISOString() : null,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'student_id,subject,paper_number' }
		);

		if (upsertError) {
			console.error('Error upserting paper progress:', upsertError);
			return json({ message: 'Failed to save progress' }, { status: 500 });
		}

		// Ensure the next paper has an explicit "unlocked" row the moment this
		// one completes, rather than relying only on the hub's on-the-fly
		// derivation — keeps a direct URL hit on the next paper consistent too.
		if (isComplete && paper_number < 10) {
			await adminClient.from('paper_progress').upsert(
				{
					student_id: user.id,
					subject,
					paper_number: paper_number + 1,
					status: 'unlocked',
					answered_count: 0,
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'student_id,subject,paper_number', ignoreDuplicates: true }
			);
		}

		return json({ message: 'Progress saved', status }, { status: 200 });
	} catch (err) {
		console.error('Submit paper error:', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
