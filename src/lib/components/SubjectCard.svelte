<script lang="ts">
	export let title: string;
	export let description: string = '';
	export let href: string = '#';
	export let icon: string = '📚';
</script>

<a {href} class="subject-card">
	<div class="icon">{icon}</div>
	<h3>{title}</h3>
	{#if description}
		<p>{description}</p>
	{/if}
</a>

<style>
	.subject-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		text-decoration: none;
		color: #333;
		transition: all 0.2s ease;
		min-height: 150px;
	}

	.subject-card:hover {
		border-color: #007bff;
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
		transform: translateY(-2px);
	}

	.icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	h3 {
		margin: 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		font-size: 0.875rem;
		color: #666;
	}
</style>
