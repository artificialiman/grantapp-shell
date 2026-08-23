/**
 * Subject metadata, question shape, and study-material shape shared across
 * the premium paper flow. Content ownership: `prompt`, `options`,
 * `explanation`, diagram `alt`, and material `title` are IMAN's copy —
 * agents populate structure only, never invented English. See
 * CONTENT_OWNERSHIP.md Section 1.
 */

export type Stream = 'science' | 'arts' | 'commerce';

/** Which stream a premium subject belongs to — drives --accent via .stream-context--*. */
export const SUBJECT_STREAM: Record<string, Stream> = {
	biology: 'science',
	chemistry: 'science',
	physics: 'science',
	mathematics: 'science',
	english: 'arts',
	history: 'arts',
	geography: 'arts',
	accounting: 'commerce',
	economics: 'commerce',
	commerce: 'commerce'
};

export function streamFor(subject: string): Stream {
	return SUBJECT_STREAM[subject] ?? 'science';
}

export type Question = {
	id: string;
	paper: number; // 1–10
	index: number; // 1–50 within that paper
	prompt: string; // COPY: IMAN
	diagram?: {
		src: string; // e.g. /content/{subject}/diagrams/q0142.svg
		alt: string; // COPY: IMAN
	};
	options: string[]; // COPY: IMAN
	correctIndex: number;
	explanation?: string; // COPY: IMAN
};

export type StudyMaterial = {
	id: string;
	title: string; // COPY: IMAN
	type: 'factfile' | 'formula-sheet' | 'diagram-sheet' | 'topic-summary';
	src: string; // e.g. /content/{subject}/materials/factfile-01.pdf
	sizeLabel?: string; // computed, not authored
};

export type PaperStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export type PaperSummary = {
	number: number; // 1–10
	status: PaperStatus;
	answeredCount: number; // 0–50
	score: number | null; // null until completed
};
