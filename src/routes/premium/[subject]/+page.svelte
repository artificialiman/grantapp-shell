<script lang="ts">
	import PaperCard from '$lib/components/PaperCard.svelte';
	import MaterialCard from '$lib/components/MaterialCard.svelte';
	import { streamFor } from '$lib/content/subjects';
	import type { PageData } from './$types';

	export let data: PageData;

	$: subjectLabel = data.subject.charAt(0).toUpperCase() + data.subject.slice(1);
	$: stream = streamFor(data.subject);
	$: completedCount = data.papers.filter((p) => p.status === 'completed').length;
</script>

<div class="stream-context--{stream} wrap">
	<div class="breadcrumb">
		<a href="/premium">Premium</a><span class="sep">/</span><span class="current">{subjectLabel}</span>
	</div>

	<h1 class="page-title">{subjectLabel}</h1>
	<p class="page-intro">
		<!-- COPY NEEDED: subject hub intro line -->
		500 likely questions, 10 papers of 50, unlocked one completed paper at a time.
	</p>

	<div class="stats-bar">
		<div class="stat">
			<div class="stat-num">{completedCount}/10</div>
			<div class="stat-label">Papers done</div>
		</div>
		<div class="stat">
			<div class="stat-num">500</div>
			<div class="stat-label">Questions</div>
		</div>
		<div class="stat">
			<div class="stat-num">{data.materials.length}</div>
			<div class="stat-label">Study files</div>
		</div>
	</div>

	<div class="section-header">
		<span class="section-title">Papers</span>
		<span class="section-count">{data.papers.length} sets</span>
	</div>
	<div class="paper-grid">
		{#each data.papers as paper}
			<PaperCard
				number={paper.number}
				status={paper.status}
				answeredCount={paper.answeredCount}
				score={paper.score}
				href="/premium/{data.subject}/paper/{paper.number}"
			/>
		{/each}
	</div>

	<div class="section-header">
		<span class="section-title">Study materials</span>
		<span class="section-count">{data.materials.length} files</span>
	</div>
	{#if data.materials.length}
		<div class="material-list">
			{#each data.materials as material}
				<MaterialCard title={material.title} type={material.type} href={material.src} />
			{/each}
		</div>
	{:else}
		<!-- COPY NEEDED: empty-state copy for a subject with no materials uploaded yet -->
		<p class="empty-state">Study materials for this subject are on the way.</p>
	{/if}
</div>

<style>
	.wrap {
		max-width: 960px;
		margin: 0 auto;
		padding: 2.5rem 2rem 5rem;
	}

	.page-title {
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		letter-spacing: -0.03em;
		margin: 1rem 0 0.4rem;
	}

	.page-intro {
		color: var(--muted);
		margin-bottom: 2rem;
		max-width: 560px;
		line-height: 1.6;
	}

	/* .stats-bar, .section-header, .paper-grid are all global (app.css) —
	   only the material list needs a local layout rule, since app.css has
	   no existing "stack of notes-cards" pattern to reuse. */
	.material-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 3rem;
	}

	.empty-state {
		color: var(--muted);
		font-size: 0.9rem;
		font-style: italic;
		margin-bottom: 3rem;
	}
</style>
