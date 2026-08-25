import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

/**
 * createBrowserClient (from @supabase/ssr), NOT the plain createClient
 * from @supabase/supabase-js. This matters: plain createClient stores
 * the session in localStorage, which the server can never read.
 * createBrowserClient stores it in cookies instead, which is what lets
 * hooks.server.ts's cookie-bound createServerClient actually see the
 * session on subsequent requests. Using plain createClient here was
 * the second half of the "Unauthorized on login" bug — hooks.server.ts
 * was fixed to correctly READ cookies, but nothing was WRITING the
 * session into a cookie in the first place until this change.
 */
export const client = createBrowserClient(supabaseUrl, supabaseAnonKey);

export async function getSession() {
	const { data, error } = await client.auth.getSession();
	if (error) throw error;
	return data.session;
}

export async function isSessionValid() {
	try {
		const session = await getSession();
		return session !== null;
	} catch {
		return false;
	}
}
