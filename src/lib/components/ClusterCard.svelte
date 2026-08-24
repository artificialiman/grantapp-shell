<script lang="ts">
	export let title: string;
	export let description: string = '';
	export let href: string = '#';
	export let code: string = '';
	export let subjects: string[] = [];
	export let faculties: string[] = [];
	export let available: boolean = true;
</script>

<a {href} class="cluster-card" class:coming-soon={!available} aria-disabled={!available}>
	<div class="card-header-row">
		{#if code}
			<span class="card-code">{code}</span>
		{/if}
		{#if !available}
			<span class="card-meta">Coming soon</span>
		{/if}
	</div>
	<h4 class="card-title">{title}</h4>
	{#if subjects.length}
		<p class="cluster-subjects">{subjects.join(' · ')}</p>
	{/if}
	{#if description}
		<p class="card-desc">{description}</p>
	{/if}
	{#if faculties.length}
		<div class="faculty-tags">
			{#each faculties.slice(0, 4) as faculty}
				<span class="faculty-tag">{faculty}</span>
			{/each}
			{#if faculties.length > 4}
				<span class="faculty-tag faculty-tag--more">+{faculties.length - 4} more</span>
			{/if}
		</div>
	{/if}
	<div class="card-cta">
		<span>{available ? 'Open cluster' : 'Notify me'}</span>
		<span class="cta-arrow">→</span>
	</div>
</a>

<style>
	.cluster-subjects {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--muted);
		margin: 0.3rem 0 0.6rem;
	}

	.faculty-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.75rem 0;
	}

	.faculty-tag {
		font-size: 0.72rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.faculty-tag--more {
		color: var(--accent);
		border-color: rgba(245, 158, 11, 0.3);
	}

	.cluster-card.coming-soon {
		opacity: 0.6;
		cursor: default;
	}
</style>
