import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Analytics read model, built directly off answer_events (the ledger)
 * and mastery_state (the fast-lookup summary). Every function here is a
 * distinct "cut" of the same underlying data — the dashboard composes
 * these rather than one giant query, so each view can be cached/loaded
 * independently.
 */

export type MasteryGridCell = {
	cognitive_pattern: string;
	information_type: string;
	mastery_score: number | null;
	attempts: number;
};

export type TopicBreakdown = {
	topic: string;
	attempts: number;
	correct: number;
	accuracy: number;
	avg_time_taken_ms: number | null;
};

export type DailyTrend = {
	date: string;
	attempts: number;
	correct: number;
	accuracy: number;
	points_total: number;
};

export type ConfidenceCalibration = {
	confidence_rating: number;
	attempts: number;
	accuracy: number;
};

/** The full (cognitive_pattern x information_type) mastery grid for a subject — the heatmap. */
export async function getMasteryGrid(
	supabase: SupabaseClient,
	studentId: string,
	subject: string
): Promise<MasteryGridCell[]> {
	const { data, error } = await supabase
		.from('mastery_state')
		.select('cognitive_pattern, information_type, mastery_score, attempts')
		.eq('student_id', studentId)
		.eq('subject', subject);

	if (error) throw error;
	return (data ?? []) as MasteryGridCell[];
}

/** Accuracy and volume per syllabus topic — where the "what to study next" list comes from. */
export async function getTopicBreakdown(
	supabase: SupabaseClient,
	studentId: string,
	subject: string
): Promise<TopicBreakdown[]> {
	const { data, error } = await supabase
		.from('answer_events')
		.select('topic, is_correct, time_taken_ms')
		.eq('student_id', studentId)
		.eq('subject', subject);

	if (error) throw error;

	const byTopic = new Map<string, { attempts: number; correct: number; timeSum: number; timeCount: number }>();
	for (const row of data ?? []) {
		const entry = byTopic.get(row.topic) ?? { attempts: 0, correct: 0, timeSum: 0, timeCount: 0 };
		entry.attempts += 1;
		if (row.is_correct) entry.correct += 1;
		if (row.time_taken_ms != null) {
			entry.timeSum += row.time_taken_ms;
			entry.timeCount += 1;
		}
		byTopic.set(row.topic, entry);
	}

	return Array.from(byTopic.entries()).map(([topic, e]) => ({
		topic,
		attempts: e.attempts,
		correct: e.correct,
		accuracy: e.attempts > 0 ? e.correct / e.attempts : 0,
		avg_time_taken_ms: e.timeCount > 0 ? e.timeSum / e.timeCount : null
	}));
}

/** Day-by-day accuracy and score trend, for a streak/progress chart. */
export async function getDailyTrend(
	supabase: SupabaseClient,
	studentId: string,
	subject: string,
	days = 30
): Promise<DailyTrend[]> {
	const since = new Date();
	since.setDate(since.getDate() - days);

	const { data, error } = await supabase
		.from('answer_events')
		.select('answered_at, is_correct, points_awarded')
		.eq('student_id', studentId)
		.eq('subject', subject)
		.gte('answered_at', since.toISOString())
		.order('answered_at', { ascending: true });

	if (error) throw error;

	const byDay = new Map<string, { attempts: number; correct: number; points: number }>();
	for (const row of data ?? []) {
		const day = row.answered_at.slice(0, 10);
		const entry = byDay.get(day) ?? { attempts: 0, correct: 0, points: 0 };
		entry.attempts += 1;
		if (row.is_correct) entry.correct += 1;
		entry.points += row.points_awarded;
		byDay.set(day, entry);
	}

	return Array.from(byDay.entries())
		.map(([date, e]) => ({
			date,
			attempts: e.attempts,
			correct: e.correct,
			accuracy: e.attempts > 0 ? e.correct / e.attempts : 0,
			points_total: e.points
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Confidence calibration — how well a student's self-rated confidence
 * matches actual accuracy. A student who's "very confident" (5) but only
 * 40% accurate at that rating is a genuinely useful, specific signal
 * (overconfidence) that a plain accuracy number can't surface.
 */
export async function getConfidenceCalibration(
	supabase: SupabaseClient,
	studentId: string,
	subject: string
): Promise<ConfidenceCalibration[]> {
	const { data, error } = await supabase
		.from('answer_events')
		.select('confidence_rating, is_correct')
		.eq('student_id', studentId)
		.eq('subject', subject)
		.not('confidence_rating', 'is', null);

	if (error) throw error;

	const byRating = new Map<number, { attempts: number; correct: number }>();
	for (const row of data ?? []) {
		const rating = row.confidence_rating as number;
		const entry = byRating.get(rating) ?? { attempts: 0, correct: 0 };
		entry.attempts += 1;
		if (row.is_correct) entry.correct += 1;
		byRating.set(rating, entry);
	}

	return Array.from(byRating.entries())
		.map(([confidence_rating, e]) => ({
			confidence_rating,
			attempts: e.attempts,
			accuracy: e.attempts > 0 ? e.correct / e.attempts : 0
		}))
		.sort((a, b) => a.confidence_rating - b.confidence_rating);
}

/** Top-line summary stats — the numbers at the top of the dashboard. */
export async function getSummaryStats(
	supabase: SupabaseClient,
	studentId: string,
	subject: string
): Promise<{
	total_attempts: number;
	total_correct: number;
	accuracy: number;
	points_total: number;
	avg_time_taken_ms: number | null;
}> {
	const { data, error } = await supabase
		.from('answer_events')
		.select('is_correct, points_awarded, time_taken_ms')
		.eq('student_id', studentId)
		.eq('subject', subject);

	if (error) throw error;

	const rows = data ?? [];
	const total_attempts = rows.length;
	const total_correct = rows.filter((r) => r.is_correct).length;
	const points_total = rows.reduce((sum, r) => sum + r.points_awarded, 0);
	const timed = rows.filter((r) => r.time_taken_ms != null);
	const avg_time_taken_ms =
		timed.length > 0 ? timed.reduce((sum, r) => sum + (r.time_taken_ms as number), 0) / timed.length : null;

	return {
		total_attempts,
		total_correct,
		accuracy: total_attempts > 0 ? total_correct / total_attempts : 0,
		points_total,
		avg_time_taken_ms
	};
}
