import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

type IncomingQuestion = {
	subject: string;
	topic: string;
	subtopic?: string;
	cognitive_patterns: string[];
	information_types: string[];
	prompt: string;
	options: { id: string; text: string }[];
	correct_option_id: string;
	explanation?: string;
	negative_marking_value?: number;
	difficulty?: number;
	source?: string;
};

/**
 * Bulk question import. Deliberately re-checks the admin allowlist here
 * too (not just relying on the +layout.server.ts gate) — this is a
 * write endpoint that can populate the entire question bank, so it
 * doesn't trust that every caller necessarily went through the page
 * load gate first.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const session = await locals.getSession();
		if (!session?.user?.email) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		const adminEmails = (process.env.ADMIN_EMAILS ?? '')
			.split(',')
			.map((e: string) => e.trim().toLowerCase())
			.filter(Boolean);

		if (!adminEmails.includes(session.user.email.toLowerCase())) {
			return json({ message: 'Forbidden' }, { status: 403 });
		}

		if (!SERVICE_ROLE_KEY) {
			console.error('SERVICE_ROLE_KEY not configured');
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const body = (await request.json()) as { questions: IncomingQuestion[] };
		if (!Array.isArray(body.questions) || body.questions.length === 0) {
			return json({ message: 'Expected a non-empty questions array' }, { status: 400 });
		}

		const errors: string[] = [];
		const rows = body.questions.map((q, i) => {
			if (!q.subject || !q.topic || !q.prompt || !q.correct_option_id) {
				errors.push(`Question at index ${i} is missing a required field (subject/topic/prompt/correct_option_id).`);
			}
			if (!Array.isArray(q.options) || q.options.length < 2) {
				errors.push(`Question at index ${i} needs at least 2 options.`);
			}
			if (q.options && !q.options.some((o) => o.id === q.correct_option_id)) {
				errors.push(`Question at index ${i}: correct_option_id doesn't match any option id.`);
			}
			if (!Array.isArray(q.cognitive_patterns) || q.cognitive_patterns.length === 0) {
				errors.push(`Question at index ${i} needs at least one cognitive_pattern tag.`);
			}
			if (!Array.isArray(q.information_types) || q.information_types.length === 0) {
				errors.push(`Question at index ${i} needs at least one information_type tag.`);
			}

			return {
				subject: q.subject,
				topic: q.topic,
				subtopic: q.subtopic ?? null,
				cognitive_patterns: q.cognitive_patterns ?? [],
				information_types: q.information_types ?? [],
				prompt: q.prompt,
				options: q.options,
				correct_option_id: q.correct_option_id,
				explanation: q.explanation ?? null,
				negative_marking_value: q.negative_marking_value ?? 0.25,
				difficulty: q.difficulty ?? null,
				source: q.source ?? null,
				created_by: session.user.email
			};
		});

		if (errors.length > 0) {
			return json({ message: 'Validation failed', errors }, { status: 400 });
		}

		const { createClient } = await import('@supabase/supabase-js');
		const supabaseUrl = process.env.VITE_SUPABASE_URL;
		if (!supabaseUrl) {
			return json({ message: 'Server configuration error' }, { status: 500 });
		}

		const adminClient = createClient(supabaseUrl, SERVICE_ROLE_KEY);
		const { data, error } = await adminClient.from('questions').insert(rows).select('id');

		if (error) {
			console.error('bulk question insert error:', error);
			return json({ message: 'Insert failed', detail: error.message }, { status: 500 });
		}

		return json({ inserted: data?.length ?? 0 });
	} catch (err) {
		console.error('admin/questions import error:', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
