const DEVICE_TAG_KEY = 'ga_device_tag';

/**
 * Generate a new device tag (UUID) or retrieve existing one from localStorage.
 * This tag persists across app relaunch and is the primary device identifier.
 */
export function generateOrRetrieveDeviceTag(): string {
	if (typeof window === 'undefined') return '';

	const existing = localStorage.getItem(DEVICE_TAG_KEY);
	if (existing) return existing;

	const newTag = crypto.randomUUID();
	localStorage.setItem(DEVICE_TAG_KEY, newTag);
	return newTag;
}

/**
 * Get the stored device tag without generating a new one.
 */
export function getDeviceTag(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(DEVICE_TAG_KEY);
}

/**
 * Clear the device tag (used on sign-out).
 */
export function clearDeviceTag(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(DEVICE_TAG_KEY);
}

export { DEVICE_TAG_KEY };
