<script lang="ts">
	import type { PageData } from './$types';
	import SubjectCard from '$lib/components/SubjectCard.svelte';

	export let data: PageData;
</script>

<section class="hero">
	<div class="hero-eyebrow">UTME &middot; Post-UTME &middot; WAEC prep</div>
	<h1>Prepare like you're <em>already in</em>.</h1>
	<p class="hero-sub">
		10,000 questions a subject, a personalised daily 100, and full papers that work offline —
		built for Nigerian secondary school students chasing the CGPA that gets them in.
	</p>
</section>

<section class="streams">
	<SubjectCard
		stream="science"
		icon="🔬"
		tag="Science"
		title="Science Stream"
		description="Biology, Chemistry, Physics — the core cluster for medicine, engineering, and every technical course."
		subjects={['Biology', 'Chemistry', 'Physics']}
		href="/science"
	/>
	<SubjectCard
		stream="arts"
		icon="📖"
		tag="Arts"
		title="Arts Stream"
		description="English, History, Geography — humanities preparation for law, mass comm, and the social sciences."
		subjects={['English', 'History', 'Geography']}
		href="/arts"
	/>
	<SubjectCard
		stream="commerce"
		icon="💼"
		tag="Commercial"
		title="Commercial Stream"
		description="Accounting, Economics, Commerce — for business, finance, and management courses."
		subjects={['Accounting', 'Economics', 'Commerce']}
		href="/commercial"
	/>
</section>

<div class="wrap">
	<a href="/premium" class="notes-card">
		<div class="notes-icon">⭐</div>
		<div class="notes-info">
			<div class="notes-label">Premium</div>
			<div class="notes-title">
				{data.student?.subscription_active ? 'You have premium access' : 'Unlock premium papers'}
			</div>
			<div class="notes-sub">
				{data.student?.subscription_active
					? 'View your premium papers and mock exams'
					: 'Full past papers, no negative marking, offline-ready'}
			</div>
		</div>
		<div class="notes-arrow">→</div>
	</a>
</div>

<style>
	.wrap {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 2rem 5rem;
	}
</style>
