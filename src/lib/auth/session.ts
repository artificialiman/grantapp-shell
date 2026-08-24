import { client } from '$lib/supabase';
import { clearDeviceTag } from './deviceTag';

export interface SessionError {
	code: string;
	message: string;
}

/**
 * Bind or rebind the current device for the logged-in student.
 * Throws an error if the device is already bound to a different student (hard lock).
 *
 * NOT currently called anywhere — login/+page.svelte duplicates this
 * fetch inline instead of importing it. Left here as the intended
 * reusable version; worth consolidating login's inline copy to call
 * this instead, next time that page is touched.
 */
export async function bindDevice(deviceTag: string): Promise<void> {
	const response = await fetch('/api/bind-device', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ device_tag: deviceTag })
	});

	if (!response.ok) {
		const error = await response.json();
		if (response.status === 409) {
			throw {
				code: 'DEVICE_LOCKED',
				message:
					error.message ||
					'This account is active on another device. Contact your administrator to switch devices.'
			} as SessionError;
		}
		throw {
			code: 'BIND_FAILED',
			message: error.message || 'Failed to bind device'
		} as SessionError;
	}
}

/**
 * Sign out the current user and clear device tag. Runs in the browser
 * (uses the browser-oriented client from $lib/supabase, which is
 * correct here — this is a client-side-only action).
 */
export async function signOut(): Promise<void> {
	await client.auth.signOut();
	clearDeviceTag();
}
