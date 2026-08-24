<script lang="ts">
	import type { Cluster, Stream } from '$lib/content/clusters';

	export let cluster: Cluster;
	export let stream: Stream;
	export let streamLabel: string;
	export let streamHref: string;
	export let isLoggedIn: boolean;
</script>

<div class="stream-context--{stream} wrap">
	<div class="breadcrumb">
		<a href="/">Home</a><span class="sep">/</span>
		<a href={streamHref}>{streamLabel}</a><span class="sep">/</span>
		<span class="current">{cluster.code}</span>
	</div>

	<div class="cluster-header">
		<span class="card-code">{cluster.code}</span>
		<h1 class="page-title">{cluster.name}</h1>
		<p class="cluster-subjects-full">{cluster.subjects.join(' · ')}</p>
		{#if cluster.electiveNotes}
			<!-- Structural note (elective-slot rule), not marketing copy —
			     see CONTENT_OWNERSHIP.md: this describes a JAMB requirement,
			     not a sentence written for a student to read as prose. -->
			<p class="elective-note">{cluster.electiveNotes}</p>
		{/if}
	</div>

	{#if cluster.faculties.length}
		<div class="section-header">
			<span class="section-title">Unlocks admission into</span>
		</div>
		<div class="faculty-tags faculty-tags--full">
			{#each cluster.faculties as faculty}
				<span class="faculty-tag">{faculty}</span>
			{/each}
		</div>
	{/if}

	<div class="section-header">
		<span class="section-title">Practice</span>
	</div>

	{#if cluster.available}
		<a href="/quiz/{stream}/{cluster.slug}" class="notes-card">
			<div class="notes-icon">⏱️</div>
			<div class="notes-info">
				<div class="notes-label">Cluster exam</div>
				<div class="notes-title">Full {cluster.code} practice test</div>
				<!-- COPY NEEDED: real question/minute counts once the cluster
				     exam content pipeline exists for this cluster -->
				<div class="notes-sub">Timed, mixed from all {cluster.subjects.length} subjects</div>
			</div>
			<div class="notes-arrow">→</div>
		</a>
	{:else}
		<div class="notes-card coming-soon">
			<div class="notes-icon">🔒</div>
			<div class="notes-info">
				<div class="notes-label">Cluster exam</div>
				<!-- COPY NEEDED: final coming-soon messaging -->
				<div class="notes-title">Coming soon</div>
				<div class="notes-sub">This cluster's practice content is still being built</div>
			</div>
		</div>
	{/if}

	<div class="section-header">
		<span class="section-title">Individual subjects</span>
	</div>
	<div class="subject-drill-grid">
		{#each cluster.subjects as subject}
			<a href="/quiz/subject/{subject.toLowerCase().replace(/\s+/g, '-')}" class="subject-drill">
				{subject}
			</a>
		{/each}
	</div>

	{#if isLoggedIn}
		<a href="/premium" class="notes-card">
			<div class="notes-icon">⭐</div>
			<div class="notes-info">
				<div class="notes-label">Premium</div>
				<div class="notes-title">Full past papers for these subjects</div>
				<div class="notes-sub">10 papers each, offline-ready</div>
			</div>
			<div class="notes-arrow">→</div>
		</a>
	{/if}
</div>

<style>
	.wrap {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2.5rem 2rem 5rem;
	}

	.cluster-header {
		margin: 1rem 0 2.5rem;
	}

	.page-title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		letter-spacing: -0.03em;
		margin: 0.6rem 0 0.4rem;
	}

	.cluster-subjects-full {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		color: var(--muted);
	}

	.elective-note {
		font-size: 0.85rem;
		color: var(--muted);
		margin-top: 0.5rem;
		font-style: italic;
		max-width: 560px;
	}

	.faculty-tags--full {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 2.5rem;
	}

	.faculty-tag {
		font-size: 0.8rem;
		padding: 0.35rem 0.8rem;
		border-radius: 999px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text);
	}

	.notes-card.coming-soon {
		opacity: 0.6;
		cursor: default;
	}

	.subject-drill-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
		margin-bottom: 2.5rem;
	}

	.subject-drill {
		padding: 0.85rem 1rem;
		border-radius: var(--radius-card);
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: 0.9rem;
		font-weight: 500;
		text-align: center;
		transition: border-color 0.2s ease;
	}

	.subject-drill:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
