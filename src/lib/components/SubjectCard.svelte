<script lang="ts">
	export let title: string;
	export let description: string = '';
	export let href: string = '#';
	export let icon: string = '📚';
	/** Stream identity — drives the card's accent color per DESIGN_SYSTEM.md Section 2. */
	export let stream: 'science' | 'arts' | 'commerce' = 'science';
	export let tag: string = '';
	export let subjects: string[] = [];
</script>

<a {href} class="stream-card {stream}">
	<div class="card-icon">{icon}</div>
	{#if tag}
		<span class="card-tag">{tag}</span>
	{/if}
	<h3 class="card-title">{title}</h3>
	{#if description}
		<p class="card-desc">{description}</p>
	{/if}
	{#if subjects.length}
		<div class="card-subjects">
			{#each subjects as subject}
				<span class="subject-pill">{subject}</span>
			{/each}
		</div>
	{/if}
	<div class="card-cta">
		<span>Explore stream</span>
		<span class="cta-arrow">→</span>
	</div>
</a>
