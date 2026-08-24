// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			/** Reads the session cookie without re-validating the JWT against Supabase's auth server. Prefer safeGetSession() for anything access-gated. */
			getSession(): Promise<Session | null>;
			/** Re-validates the JWT via getUser() before trusting the session. Use this for any route that gates access (premium, dashboard, admin, bind-device). */
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
