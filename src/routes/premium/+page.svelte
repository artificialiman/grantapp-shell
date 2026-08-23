<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const papers = [
		{ num: '01', name: 'Science Premium 2025', detail: 'Complete past papers with solutions', href: '/premium/science', status: 'live' },
		{ num: '02', name: 'Arts Premium 2025', detail: 'Comprehensive humanities collection', href: '/premium/arts', status: 'live' },
		{ num: '03', name: 'Commercial Premium 2025', detail: 'Business subjects mastery pack', href: '/premium/commercial', status: 'live' }
	];
</script>

<section class="hub-hero">
	<div class="hub-eyebrow">Premium hub</div>
	<h1 class="hub-title">Welcome, <em>{data.student?.full_name || 'Student'}</em></h1>
	<p class="hub-sub">Your premium papers, unlocked and ready — every set works offline once opened.</p>
</section>

<section class="section-wrap">
	<div class="section-header">
		<span class="section-title">Your premium papers</span>
		<span class="section-count">{papers.length} sets</span>
	</div>

	<div class="paper-grid">
		{#each papers as paper}
			<a href={paper.href} class="paper-card {paper.status}">
				<div class="paper-top">
					<span class="paper-num">{paper.num}</span>
					<span class="paper-status status-{paper.status}">{paper.status}</span>
				</div>
				<div class="paper-meta">
					<span class="paper-name">{paper.name}</span>
					<span class="paper-detail">{paper.detail}</span>
				</div>
			</a>
		{/each}
	</div>

	<a href="/premium" class="notes-card">
		<div class="notes-icon">🗓️</div>
		<div class="notes-info">
			<div class="notes-label">Subscription</div>
			<div class="notes-title">
				{#if data.student?.subscription_expires_at}
					Renews {new Date(data.student.subscription_expires_at).toLocaleDateString()}
				{:else}
					Active subscription
				{/if}
			</div>
			<div class="notes-sub">Manage your plan and billing details</div>
		</div>
		<div class="notes-arrow">→</div>
	</a>
</section>

<style>
	.section-wrap {
		max-width: 960px;
		margin: 0 auto;
		padding: 0 2rem 5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
</style>
