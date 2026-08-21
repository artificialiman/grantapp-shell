<script lang="ts">
	export let title: string;
	export let description: string = '';
	export let href: string = '#';
	export let count: number | null = null;
</script>

<a {href} class="cluster-card">
	<h4>{title}</h4>
	{#if description}
		<p>{description}</p>
	{/if}
	{#if count !== null}
		<span class="badge">{count} questions</span>
	{/if}
</a>

<style>
	.cluster-card {
		display: block;
		padding: 1.5rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		text-decoration: none;
		color: #333;
		transition: all 0.2s ease;
	}

	.cluster-card:hover {
		border-color: #007bff;
		background-color: #f8f9fa;
		box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
	}

	h4 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		font-weight: 600;
	}

	p {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		color: #666;
	}

	.badge {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.25rem 0.75rem;
		background-color: #e7f3ff;
		color: #007bff;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}
</style>
