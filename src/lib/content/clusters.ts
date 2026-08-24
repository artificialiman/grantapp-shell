/**
 * JAMB subject-combination clusters, grouped by stream.
 *
 * This is structural/reference data (cluster codes, subject
 * combinations, which faculties they unlock) — not copy. Cluster and
 * subject *names* are standard JAMB terms; the surrounding page prose
 * (hero copy, CTAs, descriptions) stays IMAN's per CONTENT_OWNERSHIP.md.
 *
 * Source: cross-referenced against grantappai.online's live cluster
 * pages (MEPC/BEPC/ELGC/EACE/EMEG/EEGC codes match exactly) and
 * expanded to full JAMB coverage per the CONTENT_OWNERSHIP manual's
 * research (jamb-gov.org, an unofficial/unaffiliated aggregator — not
 * JAMB's own .gov.ng site). Treat as a working reference; cross-check
 * against the official JAMB brochure before this is the sole source
 * feeding real student prep.
 */

export type Stream = 'science' | 'arts' | 'commerce';

export type Cluster = {
	/** URL segment, e.g. 'mepc' -> /science/mepc */
	slug: string;
	/** Real JAMB-style subject-combination code, e.g. 'MEPC'. Shown as a badge. */
	code: string;
	/** Cluster name — a standard subject-combination label, not marketing copy. */
	name: string;
	/** The subjects that make up this combination, in JAMB's stated order. */
	subjects: string[];
	/** Where a subject slot offers a choice (e.g. "Biology or Agric Science"),
	 *  list the alternates here keyed by the fixed subject they modify.
	 *  Not yet surfaced in the UI — reserved for when elective-slot
	 *  selection is built. */
	electiveNotes?: string;
	/** Representative faculties/courses this combination unlocks. Not
	 *  exhaustive — the widely-recognised anchor courses for the cluster. */
	faculties: string[];
	/** True once real question content exists for this cluster. */
	available: boolean;
};

export type StreamMeta = {
	slug: Stream;
	label: string;
	clusters: Cluster[];
};

export const SCIENCE_CLUSTERS: Cluster[] = [
	{
		slug: 'bepc',
		code: 'BEPC',
		name: 'Medical & Health Sciences',
		subjects: ['Biology', 'English', 'Physics', 'Chemistry'],
		faculties: [
			'Medicine & Surgery',
			'Pharmacy',
			'Nursing',
			'Medical Laboratory Science',
			'Physiotherapy',
			'Biochemistry',
			'Microbiology'
		],
		available: true
	},
	{
		slug: 'mepc',
		code: 'MEPC',
		name: 'Engineering & Technology',
		subjects: ['Mathematics', 'English', 'Physics', 'Chemistry'],
		faculties: [
			'Petroleum Engineering',
			'Chemical Engineering',
			'Computer Engineering',
			'Mechanical Engineering',
			'Mechatronics Engineering',
			'Architecture'
		],
		available: true
	},
	{
		slug: 'mepe',
		code: 'MEPE',
		name: 'Engineering — Elective Track',
		subjects: ['Mathematics', 'English', 'Physics'],
		electiveNotes: '4th subject: one of Biology, Chemistry, Agric Science, Economics, or Geography',
		faculties: ['Electrical/Electronics Engineering', 'Cyber Security Science', 'Information Technology'],
		available: false
	},
	{
		slug: 'mees',
		code: 'MEES',
		name: 'Computing & Data',
		subjects: ['Mathematics', 'English', 'Economics'],
		electiveNotes: '4th subject: any Social Science subject — verify Physics-track requirement with target university',
		faculties: ['Computer Science'],
		available: false
	},
	{
		slug: 'cmbe',
		code: 'CMBE',
		name: 'Agriculture & Environmental Science',
		subjects: ['Chemistry', 'Mathematics or Physics', 'Biology or Agric Science', 'English'],
		faculties: [
			'Animal Science',
			'Crop Science',
			'Soil Science',
			'Fisheries & Aquaculture',
			'Forestry & Wildlife Management',
			'Food Science & Technology'
		],
		available: false
	},
	{
		slug: 'mepx',
		code: 'MEPX',
		name: 'Built Environment',
		subjects: ['Mathematics', 'English', 'Physics'],
		electiveNotes: '4th subject: one of Chemistry, Geography, Biology, Economics, or Art',
		faculties: ['Architecture', 'Building', 'Quantity Surveying'],
		available: false
	},
	{
		slug: 'mepc-geo',
		code: 'MPCB',
		name: 'Earth & Physical Sciences',
		subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
		faculties: ['Geology', 'Mathematics (Degree)'],
		available: false
	},
	{
		slug: 'mees-land',
		code: 'MEEX',
		name: 'Land, Survey & Planning',
		subjects: ['Mathematics', 'Economics', 'English'],
		electiveNotes: '4th subject: one of Literature, History, Government, Geography, Chemistry, or Physics',
		faculties: ['Land Surveying & Geoinformatics'],
		available: false
	},
	{
		slug: 'mgex',
		code: 'MGEX',
		name: 'Urban & Regional Planning',
		subjects: ['Mathematics', 'Geography', 'English'],
		electiveNotes: '4th subject: one of Economics, Physics, or Chemistry',
		faculties: ['Urban & Regional Planning'],
		available: false
	}
];

export const ARTS_CLUSTERS: Cluster[] = [
	{
		slug: 'elgc',
		code: 'ELGC',
		name: 'Humanities & Social Sciences',
		subjects: ['English', 'Literature', 'Government', 'CRS'],
		faculties: ['Law', 'Mass Communication', 'International Relations', 'Political Science'],
		available: true
	},
	{
		slug: 'elgc-law',
		code: 'ELGX',
		name: 'Law',
		subjects: ['Literature', 'Government', 'English'],
		electiveNotes: '4th subject: any other Social Science subject. Sharia/Islamic Law variant swaps Government for IRS.',
		faculties: ['Law', 'International Law & Jurisprudence', 'Commercial Law', 'Civil Law'],
		available: false
	},
	{
		slug: 'emex',
		code: 'EMEX',
		name: 'Mass Communication & Media',
		subjects: ['Mathematics', 'Economics', 'English'],
		electiveNotes: '4th subject: one other relevant subject. Communication Arts uses a separate combination (Literature, Economics, Government, English).',
		faculties: ['Mass Communication', 'Communication Arts'],
		available: false
	},
	{
		slug: 'elxx',
		code: 'ELXX',
		name: 'Theatre, Fine & Creative Arts',
		subjects: ['Literature', 'English'],
		electiveNotes: '+2 other relevant subjects for Theatre Arts; Fine Arts track uses Fine Arts + 1 other Arts subject + English + any other subject',
		faculties: ['Theatre Arts', 'Fine and Applied Arts', 'Creative Arts'],
		available: false
	},
	{
		slug: 'gexx',
		code: 'GEXX',
		name: 'Political Science & Government',
		subjects: ['Government or History', 'English'],
		electiveNotes: '+2 other Social Science/Arts subjects',
		faculties: ['Political Science', 'History and International Studies'],
		available: false
	},
	{
		slug: 'exxx',
		code: 'EXXX',
		name: 'Philosophy, Religion & Society',
		subjects: ['English'],
		electiveNotes: '+3 subjects from Arts/Social Science, commonly Government, CRS/IRS, or History',
		faculties: ['Philosophy', 'Sociology & Anthropology', 'Psychology', 'Social Work'],
		available: false
	},
	{
		slug: 'elxl',
		code: 'ELXL',
		name: 'Languages & Linguistics',
		subjects: ['English'],
		electiveNotes: '+ a named language (Igbo/Yoruba/French/Arabic) + 2 other Arts/Social Science subjects',
		faculties: ['Linguistics'],
		available: false
	},
	{
		slug: 'emgx',
		code: 'EMGX',
		name: 'Statistics & Quantitative Social Science',
		subjects: ['Economics', 'Mathematics', 'English'],
		electiveNotes: '4th subject: one of Government, History, Geography, Literature, French, or CRS/IRS',
		faculties: ['Statistics', 'Criminology'],
		available: false
	}
];

export const COMMERCIAL_CLUSTERS: Cluster[] = [
	{
		slug: 'eace',
		code: 'EACE',
		name: 'Business Studies',
		subjects: ['English', 'Accounting', 'Commerce', 'Economics'],
		faculties: ['Business Administration', 'Office Management', 'Insurance', 'Marketing'],
		available: true
	},
	{
		slug: 'emeg',
		code: 'EMEG',
		name: 'Economics & Finance',
		subjects: ['English', 'Mathematics', 'Economics', 'Government'],
		faculties: ['Economics', 'Banking & Finance', 'Public Administration'],
		available: true
	},
	{
		slug: 'eegc',
		code: 'EEGC',
		name: 'Commerce & Social Studies',
		subjects: ['English', 'Economics', 'Government', 'Commerce'],
		faculties: ['Political Economy', 'Cooperative Economics', 'Insurance'],
		available: true
	},
	{
		slug: 'emac',
		code: 'EMAC',
		name: 'Accounting & Mathematics',
		subjects: ['English', 'Mathematics', 'Accounting', 'Commerce'],
		faculties: ['Accounting', 'Finance', 'Actuarial Science'],
		available: false
	},
	{
		slug: 'emea',
		code: 'EMEA',
		name: 'Economics & Accounting',
		subjects: ['English', 'Mathematics', 'Economics', 'Accounting'],
		faculties: ['Economics', 'Accounting', 'Statistics'],
		available: false
	},
	{
		slug: 'emsx',
		code: 'EMSX',
		name: 'Entrepreneurship & Enterprise',
		subjects: ['Mathematics', 'Economics', 'English'],
		electiveNotes: '4th subject: any Social Science or Arts subject (Commerce, Accounting, Government, Geography)',
		faculties: ['Entrepreneurship', 'Project Management'],
		available: false
	},
	{
		slug: 'emgx-estate',
		code: 'EMGE',
		name: 'Estate & Property',
		subjects: ['Mathematics', 'Economics', 'English'],
		electiveNotes: '+1 other subject',
		faculties: ['Estate Management'],
		available: false
	},
	{
		slug: 'egex',
		code: 'EGEX',
		name: 'Tourism',
		subjects: ['Geography', 'Economics', 'English'],
		electiveNotes: '4th subject: any other Social Science or Arts subject',
		faculties: ['Tourism Studies'],
		available: false
	}
];

export const STREAMS: Record<Stream, StreamMeta> = {
	science: { slug: 'science', label: 'Science', clusters: SCIENCE_CLUSTERS },
	arts: { slug: 'arts', label: 'Arts', clusters: ARTS_CLUSTERS },
	commerce: { slug: 'commerce', label: 'Commercial', clusters: COMMERCIAL_CLUSTERS }
};

export function clustersFor(stream: Stream): Cluster[] {
	return STREAMS[stream].clusters;
}

export function findCluster(stream: Stream, slug: string): Cluster | undefined {
	return clustersFor(stream).find((c) => c.slug === slug);
}
