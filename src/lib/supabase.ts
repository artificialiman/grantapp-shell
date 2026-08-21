import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

export const client = createClient(supabaseUrl, supabaseAnonKey);

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
