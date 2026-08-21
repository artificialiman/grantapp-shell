import { client } from '$lib/supabase';
import { generateOrRetrieveDeviceTag, clearDeviceTag } from './deviceTag';

export interface SessionError {
	code: string;
	message: string;
}

/**
 * Bind or rebind the current device for the logged-in student.
 * Throws an error if the device is already bound to a different student (hard lock).
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
				message: error.message || 'This account is active on another device. Contact your administrator to switch devices.'
			} as SessionError;
		}
		throw {
			code: 'BIND_FAILED',
			message: error.message || 'Failed to bind device'
		} as SessionError;
	}
}

/**
 * Validate the current session and device binding.
 * Returns true if session is valid, subscription is active, and device matches.
 * Server-side call; used in +layout.server.ts.
 */
export async function validateSession(
	sessionUserId: string | undefined
): Promise<{ valid: boolean; student: any | null }> {
	if (!sessionUserId) {
		return { valid: false, student: null };
	}

	try {
		const { data: student, error } = await client
			.from('students')
			.select('*')
			.eq('id', sessionUserId)
			.single();

		if (error || !student) {
			return { valid: false, student: null };
		}

		// Check subscription
		if (!student.subscription_active) {
			return { valid: false, student };
		}

		return { valid: true, student };
	} catch (err) {
		return { valid: false, student: null };
	}
}

/**
 * Get the student profile for the current user.
 * Server-side only (requires `VITE_SUPABASE_ANON_KEY` with appropriate RLS).
 */
export async function getSessionStudent(userId: string) {
	try {
		const { data: student, error } = await client
			.from('students')
			.select('*')
			.eq('id', userId)
			.single();

		if (error) throw error;
		return student;
	} catch (err) {
		return null;
	}
}

/**
 * Sign out the current user and clear device tag.
 */
export async function signOut(): Promise<void> {
	await client.auth.signOut();
	clearDeviceTag();
}
