/**
 * Premium subject catalog, organized into tiers — mirrors the live
 * site's premium-hub.html structure (Universal/Core Sciences/General
 * Studies/Specialist categorization), not the flat 3-item
 * "Science/Arts/Commercial Premium" list this page used to show.
 *
 * Each subject here corresponds to a `subject` value used in
 * paper_progress (see 0002_paper_progress.sql) — the premium papers
 * for a subject live at /premium/{slug}. `available` mirrors the
 * clusters.ts convention: subjects without a real paper set yet still
 * show, marked not-yet-available, rather than disappearing.
 */

export type PremiumSubject = {
	slug: string;
	name: string;
	icon: string;
};

export type PremiumTier = {
	id: string;
	label: string;
	blurb: string;
	subjects: PremiumSubject[];
};

export const PREMIUM_TIERS: PremiumTier[] = [
	{
		id: 'universal',
		label: 'Universal',
		blurb: 'Required across every stream',
		subjects: [{ slug: 'english', name: 'English Language', icon: '📖' }]
	},
	{
		id: 'core-sciences',
		label: 'Core Sciences',
		blurb: 'Medicine, engineering, and technical faculties',
		subjects: [
			{ slug: 'chemistry', name: 'Chemistry', icon: '🧪' },
			{ slug: 'physics', name: 'Physics', icon: '⚛️' },
			{ slug: 'biology', name: 'Biology', icon: '🧬' },
			{ slug: 'mathematics', name: 'Mathematics', icon: '📐' }
		]
	},
	{
		id: 'general-studies',
		label: 'General Studies',
		blurb: 'Arts, humanities, and social science faculties',
		subjects: [
			{ slug: 'government', name: 'Government', icon: '🏛️' },
			{ slug: 'history', name: 'History', icon: '📜' },
			{ slug: 'geography', name: 'Geography', icon: '🌍' },
			{ slug: 'literature', name: 'Literature in English', icon: '📚' }
		]
	},
	{
		id: 'specialist',
		label: 'Specialist',
		blurb: 'Commercial and specialized combinations',
		subjects: [
			{ slug: 'economics', name: 'Economics', icon: '📈' },
			{ slug: 'accounting', name: 'Accounting', icon: '🧮' },
			{ slug: 'commerce', name: 'Commerce', icon: '💼' }
		]
	}
];

export function findPremiumSubject(slug: string): PremiumSubject | undefined {
	for (const tier of PREMIUM_TIERS) {
		const match = tier.subjects.find((s) => s.slug === slug);
		if (match) return match;
	}
	return undefined;
}
