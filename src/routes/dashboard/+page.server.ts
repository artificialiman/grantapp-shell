import {
	getMasteryGrid,
	getTopicBreakdown,
	getDailyTrend,
	getConfidenceCalibration,
	getSummaryStats
} from '$lib/quiz/analytics';
import type { PageServerLoad } from './$types';

const DEFAULT_SUBJECT = 'chemistry';

export const load: PageServerLoad = async ({ url, parent, locals }) => {
	const { session } = await parent();
	const subject = url.searchParams.get('subject') ?? DEFAULT_SUBJECT;
	const studentId = session.user.id;

	const [masteryGrid, topicBreakdown, dailyTrend, confidenceCalibration, summary] = await Promise.all([
		getMasteryGrid(locals.supabase, studentId, subject),
		getTopicBreakdown(locals.supabase, studentId, subject),
		getDailyTrend(locals.supabase, studentId, subject),
		getConfidenceCalibration(locals.supabase, studentId, subject),
		getSummaryStats(locals.supabase, studentId, subject)
	]);

	return {
		subject,
		masteryGrid,
		topicBreakdown,
		dailyTrend,
		confidenceCalibration,
		summary
	};
};
