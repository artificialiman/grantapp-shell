<script lang="ts">
	export let title: string;
	export let description: string = '';
	export let href: string = '#';
	export let count: number | null = null;
	export let code: string = '';
</script>

<a {href} class="cluster-card">
	<div class="card-header-row">
		{#if code}
			<span class="card-code">{code}</span>
		{/if}
		{#if count !== null}
			<span class="card-meta">{count} questions</span>
		{/if}
	</div>
	<h4 class="card-title">{title}</h4>
	{#if description}
		<p class="card-desc">{description}</p>
	{/if}
	<div class="card-cta">
		<span>Open cluster</span>
		<span class="cta-arrow">→</span>
	</div>
</a>
