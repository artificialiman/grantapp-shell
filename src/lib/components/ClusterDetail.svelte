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
		<a href="/quiz/{stream}/{cluster.slug}" class="exam-launch">
			<div class="exam-launch-readout">
				<span class="exam-launch-duration">60</span>
				<span class="exam-launch-unit">min</span>
			</div>
			<div class="exam-launch-divider" aria-hidden="true"></div>
			<div class="exam-launch-info">
				<div class="exam-launch-label">Cluster exam · {cluster.code}</div>
				<div class="exam-launch-title">Start practice test</div>
				<!-- COPY NEEDED: real question/minute counts once the cluster
				     exam content pipeline exists for this cluster -->
				<div class="exam-launch-sub">Mixed from all {cluster.subjects.length} subjects</div>
			</div>
			<div class="exam-launch-go" aria-hidden="true">
				<span class="exam-launch-go-bar"></span>
				<span class="exam-launch-go-arrow">→</span>
			</div>
		</a>
	{:else}
		<div class="exam-launch exam-launch--locked">
			<div class="exam-launch-readout">
				<span class="exam-launch-duration">—</span>
				<span class="exam-launch-unit">min</span>
			</div>
			<div class="exam-launch-divider" aria-hidden="true"></div>
			<div class="exam-launch-info">
				<div class="exam-launch-label">Cluster exam · {cluster.code}</div>
				<!-- COPY NEEDED: final coming-soon messaging -->
				<div class="exam-launch-title">Coming soon</div>
				<div class="exam-launch-sub">This cluster's practice content is still being built</div>
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

	/* ── Exam launch — deliberately not a .notes-card. This is the single
	   highest-intent action on the page (starting a timed exam), so it
	   gets its own signature treatment instead of reusing the passive
	   info-card skin: sharp corners (every other surface on this page
	   is var(--radius-card)), a literal timer readout instead of an
	   icon, and a hover that reads as "the clock starting to run"
	   rather than a generic glow. ── */
	.exam-launch {
		display: flex;
		align-items: stretch;
		gap: 0;
		margin-bottom: 2.5rem;
		border: 1px solid var(--border-2);
		border-radius: 2px;
		background: var(--surface);
		text-decoration: none;
		color: var(--text);
		overflow: hidden;
		position: relative;
	}

	.exam-launch-readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.25rem 1.5rem;
		background: var(--bg);
		min-width: 88px;
	}

	.exam-launch-duration {
		font-family: var(--font-mono);
		font-size: 1.6rem;
		font-weight: 500;
		line-height: 1;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.exam-launch-unit {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
		margin-top: 0.3rem;
	}

	.exam-launch-divider {
		width: 1px;
		background: var(--border-2);
		align-self: stretch;
	}

	.exam-launch-info {
		flex: 1;
		padding: 1.25rem 1.5rem;
		min-width: 0;
	}

	.exam-launch-label {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent);
		margin-bottom: 0.3rem;
	}

	.exam-launch-title {
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 700;
		margin-bottom: 0.2rem;
	}

	.exam-launch-sub {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.exam-launch-go {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		flex-shrink: 0;
		position: relative;
		overflow: hidden;
	}

	.exam-launch-go-bar {
		position: absolute;
		inset: 0;
		background: var(--accent);
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.exam-launch-go-arrow {
		position: relative;
		font-size: 1.1rem;
		color: var(--muted);
		transition:
			color 0.2s ease,
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.exam-launch:hover {
		border-color: var(--accent);
	}

	.exam-launch:hover .exam-launch-go-bar {
		transform: translateX(0);
	}

	.exam-launch:hover .exam-launch-go-arrow {
		color: #000;
		transform: translateX(3px);
	}

	.exam-launch--locked {
		cursor: default;
		opacity: 0.55;
	}

	.exam-launch--locked .exam-launch-duration {
		color: var(--muted);
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
