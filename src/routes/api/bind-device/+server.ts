import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();

		if (!session || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { device_tag } = (await request.json()) as { device_tag: string };

		if (!device_tag) {
			return json({ message: 'Missing device_tag' }, { status: 400 });
		}

		if (!SERVICE_ROLE_KEY) {
			console.error('SERVICE_ROLE_KEY not configured');
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		// Import Supabase client for this request (uses service role)
		const { createClient } = await import('@supabase/supabase-js');
		const supabaseUrl = process.env.VITE_SUPABASE_URL;

		if (!supabaseUrl) {
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const adminClient = createClient(supabaseUrl, SERVICE_ROLE_KEY);

		// Check existing binding
		const { data: existing, error: checkError } = await adminClient
			.from('device_bindings')
			.select('*')
			.eq('student_id', user.id)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			console.error('Error checking device binding:', checkError);
			return json({ message: 'Database error' }, { status: 500 });
		}

		// No existing binding - create new one
		if (!existing) {
			const { error: insertError } = await adminClient.from('device_bindings').insert({
				student_id: user.id,
				device_tag,
				device_label: 'Web Browser',
				bound_at: new Date().toISOString(),
				last_seen_at: new Date().toISOString()
			});

			if (insertError) {
				console.error('Error creating device binding:', insertError);
				return json({ message: 'Failed to bind device' }, { status: 500 });
			}

			return json({ message: 'Device bound successfully' }, { status: 200 });
		}

		// Existing binding with same tag - update last_seen_at
		if (existing.device_tag === device_tag) {
			const { error: updateError } = await adminClient
				.from('device_bindings')
				.update({ last_seen_at: new Date().toISOString() })
				.eq('student_id', user.id);

			if (updateError) {
				console.error('Error updating device binding:', updateError);
				return json({ message: 'Failed to update device' }, { status: 500 });
			}

			return json({ message: 'Device updated successfully' }, { status: 200 });
		}

		// Existing binding with different tag - HARD LOCK (reject)
		return json(
			{ message: 'This account is active on another device. Contact your administrator to switch devices.' },
			{ status: 409 }
		);
	} catch (err) {
		console.error('Bind device error:', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
