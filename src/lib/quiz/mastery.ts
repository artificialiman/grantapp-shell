import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Updates mastery_state for every (cognitive_pattern x information_type)
 * combo a question touches, after a student answers it. Uses an
 * exponential moving average so recent performance outweighs old —
 * a student who was weak on a combo months ago but has since improved
 * should show as improved, not permanently dragged down by early misses.
 */

const EMA_ALPHA = 0.25; // weight given to the newest answer; higher = mastery reacts faster to recent performance

export async function updateMasteryForAnswer(
	supabase: SupabaseClient,
	studentId: string,
	subject: string,
	cognitivePatterns: string[],
	informationTypes: string[],
	isCorrect: boolean
): Promise<void> {
	const combos: { cognitive_pattern: string; information_type: string }[] = [];
	for (const cp of cognitivePatterns) {
		for (const it of informationTypes) {
			combos.push({ cognitive_pattern: cp, information_type: it });
		}
	}

	for (const combo of combos) {
		const { data: existing, error: readError } = await supabase
			.from('mastery_state')
			.select('id, attempts, correct, mastery_score')
			.eq('student_id', studentId)
			.eq('subject', subject)
			.eq('cognitive_pattern', combo.cognitive_pattern)
			.eq('information_type', combo.information_type)
			.maybeSingle();

		if (readError) throw readError;

		const outcome = isCorrect ? 1 : 0;
		const attempts = (existing?.attempts ?? 0) + 1;
		const correct = (existing?.correct ?? 0) + outcome;

		// First attempt on this combo: seed mastery_score directly from the
		// outcome rather than blending against a null EMA.
		const newScore =
			existing?.mastery_score == null
				? outcome
				: EMA_ALPHA * outcome + (1 - EMA_ALPHA) * existing.mastery_score;

		const { error: upsertError } = await supabase.from('mastery_state').upsert(
			{
				student_id: studentId,
				subject,
				cognitive_pattern: combo.cognitive_pattern,
				information_type: combo.information_type,
				attempts,
				correct,
				mastery_score: newScore,
				last_attempted_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'student_id,subject,cognitive_pattern,information_type' }
		);

		if (upsertError) throw upsertError;
	}
}
