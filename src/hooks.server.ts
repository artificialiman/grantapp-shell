import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Creates a request-scoped Supabase client bound to THIS request's
 * cookies, and exposes a validated getSession() on event.locals.
 *
 * This replaces the previous approach of calling the shared, browser-
 * oriented client's auth.getSession() from server code. That client
 * has no cookie context at all when running server-side -- it was
 * effectively asking "is anyone logged in anywhere" and always got
 * back nothing, which is why every session-gated route (bind-device,
 * /premium, /dashboard, /admin) was silently failing auth checks in
 * production despite login itself succeeding. See TAXONOMY.md-adjacent
 * history in this repo's commit log for the trail on this.
 */
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: options?.path ?? '/' });
				});
			}
		}
	});

	/**
	 * getSession() reads the (possibly stale/tampered) JWT straight from
	 * the cookie. getUser() re-validates it against Supabase's auth
	 * server on every call -- slower, but it's the only one that
	 * actually confirms the token hasn't been forged or revoked. Route
	 * code that gates access (premium, dashboard, admin) should prefer
	 * safeGetSession() below, not raw getSession().
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT invalid/expired/tampered -- treat as logged out rather than
			// trusting the unvalidated session object.
			return { session: null, user: null };
		}

		return { session, user };
	};

	// Back-compat shim: existing route code across the app calls
	// event.locals.getSession() (singular, no validation). Keep it
	// working, but route it through the validated path so the fix
	// applies everywhere without touching every load function in one
	// pass. New code should prefer safeGetSession() directly.
	event.locals.getSession = async () => {
		const { session } = await event.locals.safeGetSession();
		return session;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

