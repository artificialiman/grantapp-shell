import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { DEVICE_TAG_KEY } from '$lib/auth/deviceTag';
import type { RequestHandler } from './$types';

// $env/dynamic/private, not process.env -- see hooks.server.ts for why:
// adapter-auto can land on a runtime where process.env isn't reliable.
const SERVICE_ROLE_KEY = env.SERVICE_ROLE_KEY;

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
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
		const supabaseUrl = env.VITE_SUPABASE_URL;

		if (!supabaseUrl) {
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const adminClient = createClient(supabaseUrl, SERVICE_ROLE_KEY);

		// Fetch subscription status alongside the bind check — the login
		// page uses this to route premium subscribers straight to
		// /premium. Doing this here (service_role, already-authenticated
		// request) instead of as a second client-side query after sign-in
		// avoids a real race: a client-side query run immediately after
		// signInWithPassword() can fire before the browser's session is
		// fully established, so an RLS-gated `auth.uid() = id` check can
		// silently return no row and fall through to the non-premium path
		// even for an active subscriber.
		const { data: studentRow } = await adminClient
			.from('students')
			.select('subscription_active')
			.eq('id', user.id)
			.single();
		const subscriptionActive = studentRow?.subscription_active ?? false;

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

			// Belt-and-suspenders: set the cookie server-side too, not just
			// via client JS in deviceTag.ts. The premium gate reads this
			// cookie on every load, so it must exist regardless of any
			// client-side timing quirk.
			cookies.set(DEVICE_TAG_KEY, device_tag, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				sameSite: 'lax'
			});

			return json({ message: 'Device bound successfully', subscription_active: subscriptionActive }, { status: 200 });
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

			cookies.set(DEVICE_TAG_KEY, device_tag, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				sameSite: 'lax'
			});

			return json({ message: 'Device updated successfully', subscription_active: subscriptionActive }, { status: 200 });
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
