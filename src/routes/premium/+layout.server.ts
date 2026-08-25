import { redirect, isRedirect } from '@sveltejs/kit';
import { DEVICE_TAG_KEY } from '$lib/auth/deviceTag';
import type { LayoutServerLoad } from './$types';

/**
 * THE GATE. Three checks, all required: valid session, active
 * subscription, AND this request came from the bound device.
 *
 * The device check is the one that was missing. Binding only ever
 * happened once, at login (see /api/bind-device and login/+page.svelte).
 * Once a browser holds a valid Supabase session cookie, this load
 * function used to only check session + subscription -- so a session
 * cookie copied to a second device (or reused by a second person who
 * has it) got full premium access with the device_bindings table never
 * consulted again. That silently defeated invariant #1 in
 * ANTITHEFT_DOCTRINE_V1.md ("One device, one student, always").
 *
 * The fix re-checks device_bindings on every load, comparing it against
 * the ga_device_tag cookie (mirrored from localStorage by
 * generateOrRetrieveDeviceTag -- see deviceTag.ts). A browser that never
 * went through the bind flow, or whose bound device_tag no longer
 * matches what's on file (e.g. an admin unlock moved the binding to a
 * different device), gets redirected out here even with an otherwise
 * valid session.
 */
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

		// Must be the bound device -- checked on every load, not just at login.
		const deviceTagCookie = event.cookies.get(DEVICE_TAG_KEY);

		const { data: binding, error: bindingError } = await event.locals.supabase
			.from('device_bindings')
			.select('device_tag')
			.eq('student_id', user.id)
			.single();

		if (bindingError || !binding) {
			// Never bound a device at all -- shouldn't happen post-login, but
			// fail closed rather than assume access is fine.
			throw redirect(303, '/login');
		}

		if (!deviceTagCookie || deviceTagCookie !== binding.device_tag) {
			// This browser either never bound (no cookie) or is a different
			// device than the one on file. Send it through login, where
			// signing in will either re-bind (if this becomes the new device
			// via admin unlock) or hit the existing 409 hard lock.
			throw redirect(303, '/login');
		}

		return {
			session,
			student
		};
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw redirect(303, '/login');
	}
};
