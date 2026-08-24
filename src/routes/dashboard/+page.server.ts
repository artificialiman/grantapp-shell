import { client } from '$lib/supabase';
import {
	getMasteryGrid,
	getTopicBreakdown,
	getDailyTrend,
	getConfidenceCalibration,
	getSummaryStats
} from '$lib/quiz/analytics';
import type { PageServerLoad } from './$types';

const DEFAULT_SUBJECT = 'chemistry';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { session } = await parent();
	const subject = url.searchParams.get('subject') ?? DEFAULT_SUBJECT;
	const studentId = session.user.id;

	const [masteryGrid, topicBreakdown, dailyTrend, confidenceCalibration, summary] = await Promise.all([
		getMasteryGrid(client, studentId, subject),
		getTopicBreakdown(client, studentId, subject),
		getDailyTrend(client, studentId, subject),
		getConfidenceCalibration(client, studentId, subject),
		getSummaryStats(client, studentId, subject)
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
