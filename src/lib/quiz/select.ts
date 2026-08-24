import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Adaptive selection over the dual-axis taxonomy (TAXONOMY.md).
 *
 * Core idea: for each (cognitive_pattern x information_type) combo the
 * student has a mastery_score in [0,1] (or none, if untouched). Combos
 * with lower mastery — or no data yet — get sampled more heavily. This
 * is intentionally simple (weighted random draw, not a full IRT/
 * knowledge-tracing model) so it's easy to reason about and tune; the
 * weighting function is the one thing to revisit if it doesn't feel
 * right in practice.
 *
 * Runs server-side only (uses a Supabase client with an active session
 * or service_role — callers must supply one). Not yet a Postgres RPC
 * per Iman's call to start in app code — see the migration file's note
 * on promoting this once proven.
 */

export type MasteryRow = {
	cognitive_pattern: string;
	information_type: string;
	mastery_score: number | null;
	attempts: number;
};

export type Question = {
	id: number;
	subject: string;
	topic: string;
	subtopic: string | null;
	cognitive_patterns: string[];
	information_types: string[];
	prompt: string;
	options: { id: string; text: string }[];
	correct_option_id: string;
	explanation: string | null;
	negative_marking_value: number;
	difficulty: number | null;
};

const UNKNOWN_COMBO_WEIGHT = 0.65; // treat "never attempted" as moderately weak, not maximally weak — avoids hammering a student with only-new material
const MIN_WEIGHT = 0.05; // even a mastered combo keeps a small chance of resurfacing, so mastery isn't "answer it right once, never see it again"

/**
 * Given a student's current mastery rows, compute a weight per
 * (cognitive_pattern, information_type) combo: low mastery -> high
 * weight -> sampled more often.
 */
function buildComboWeights(masteryRows: MasteryRow[]): Map<string, number> {
	const weights = new Map<string, number>();
	for (const row of masteryRows) {
		const key = comboKey(row.cognitive_pattern, row.information_type);
		const score = row.mastery_score ?? UNKNOWN_COMBO_WEIGHT;
		// invert: mastery 0.9 -> weight 0.1ish; mastery 0.1 -> weight 0.9ish
		const weight = Math.max(MIN_WEIGHT, 1 - score);
		weights.set(key, weight);
	}
	return weights;
}

function comboKey(cognitivePattern: string, informationType: string): string {
	return `${cognitivePattern}::${informationType}`;
}

/**
 * A question can carry multiple tags per axis. Its overall weight is the
 * MAX weight across all its (cognitive_pattern x information_type) combo
 * pairs — a question touching even one weak combo is worth surfacing,
 * rather than averaging it down because it also touches strong combos.
 */
function questionWeight(q: Question, comboWeights: Map<string, number>): number {
	let max = MIN_WEIGHT;
	for (const cp of q.cognitive_patterns) {
		for (const it of q.information_types) {
			const w = comboWeights.get(comboKey(cp, it));
			if (w !== undefined && w > max) max = w;
			if (w === undefined && UNKNOWN_COMBO_WEIGHT > max) max = UNKNOWN_COMBO_WEIGHT;
		}
	}
	return max;
}

function weightedSample<T>(items: T[], weights: number[], count: number): T[] {
	const pool = items.map((item, i) => ({ item, weight: weights[i] }));
	const picked: T[] = [];

	while (picked.length < count && pool.length > 0) {
		const total = pool.reduce((sum, p) => sum + p.weight, 0);
		let r = Math.random() * total;
		let idx = 0;
		for (; idx < pool.length; idx++) {
			r -= pool[idx].weight;
			if (r <= 0) break;
		}
		const chosen = pool.splice(Math.min(idx, pool.length - 1), 1)[0];
		picked.push(chosen.item);
	}

	return picked;
}

/**
 * Select `count` questions for a student in a subject, adaptively
 * weighted toward their weakest taxonomy combos. Excludes questions the
 * student has already seen recently if `excludeQuestionIds` is passed
 * (callers decide the recency window — e.g. "seen in the last 14 days").
 */
export async function selectAdaptiveQuestions(
	supabase: SupabaseClient,
	studentId: string,
	subject: string,
	count: number,
	excludeQuestionIds: number[] = []
): Promise<Question[]> {
	const { data: masteryRows, error: masteryError } = await supabase
		.from('mastery_state')
		.select('cognitive_pattern, information_type, mastery_score, attempts')
		.eq('student_id', studentId)
		.eq('subject', subject);

	if (masteryError) throw masteryError;

	let query = supabase
		.from('questions')
		.select(
			'id, subject, topic, subtopic, cognitive_patterns, information_types, prompt, options, correct_option_id, explanation, negative_marking_value, difficulty'
		)
		.eq('subject', subject)
		.eq('active', true);

	if (excludeQuestionIds.length > 0) {
		query = query.not('id', 'in', `(${excludeQuestionIds.join(',')})`);
	}

	const { data: candidates, error: questionsError } = await query;
	if (questionsError) throw questionsError;
	if (!candidates || candidates.length === 0) return [];

	const comboWeights = buildComboWeights((masteryRows ?? []) as MasteryRow[]);
	const weights = (candidates as Question[]).map((q) => questionWeight(q, comboWeights));

	return weightedSample(candidates as Question[], weights, Math.min(count, candidates.length));
}
