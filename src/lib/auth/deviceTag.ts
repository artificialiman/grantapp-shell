const DEVICE_TAG_KEY = 'ga_device_tag';
const DEVICE_TAG_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

/**
 * Mirror the device tag into a cookie so it rides along with every
 * server-rendered request automatically, not just the one-time POST to
 * /api/bind-device. localStorage is never sent to the server on a normal
 * page load, so without this mirror, +layout.server.ts has no way to
 * know which device is asking -- the premium gate could only ever check
 * "is there a valid session", never "is this the bound device". Not
 * httpOnly: this value isn't a secret, it's just an identifier the
 * client already holds in localStorage, and it needs to be written by
 * client JS.
 */
function setDeviceTagCookie(tag: string): void {
	if (typeof document === 'undefined') return;
	document.cookie = `${DEVICE_TAG_KEY}=${tag}; path=/; max-age=${DEVICE_TAG_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

/**
 * Generate a new device tag (UUID) or retrieve existing one from localStorage.
 * This tag persists across app relaunch and is the primary device identifier.
 * Also mirrors it into a cookie -- see setDeviceTagCookie -- so server-side
 * load functions (the premium gate) can see it on every request, not just
 * at bind time.
 */
export function generateOrRetrieveDeviceTag(): string {
	if (typeof window === 'undefined') return '';

	const existing = localStorage.getItem(DEVICE_TAG_KEY);
	if (existing) {
		setDeviceTagCookie(existing);
		return existing;
	}

	const newTag = crypto.randomUUID();
	localStorage.setItem(DEVICE_TAG_KEY, newTag);
	setDeviceTagCookie(newTag);
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
 * Clear the device tag (used on sign-out). Clears both localStorage and
 * the mirrored cookie so a signed-out browser doesn't keep presenting a
 * stale device identity.
 */
export function clearDeviceTag(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(DEVICE_TAG_KEY);
	if (typeof document !== 'undefined') {
		document.cookie = `${DEVICE_TAG_KEY}=; path=/; max-age=0`;
	}
}

export { DEVICE_TAG_KEY };
