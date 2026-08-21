<script lang="ts">
	import ClusterCard from '$lib/components/ClusterCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const clusters = [
		{ title: 'Accounting', description: 'Financial Statements, Bookkeeping', href: '/commercial/accounting' },
		{ title: 'Economics', description: 'Micro, Macro, Development', href: '/commercial/economics' },
		{ title: 'Commerce', description: 'Trade, Business, Marketing', href: '/commercial/commerce' }
	];
</script>

<div class="commercial-page">
	<h1>Commercial Stream</h1>
	<p class="intro">Prepare for business and commercial subjects with real-world scenarios and case studies.</p>

	<div class="clusters">
		{#each clusters as cluster}
			<ClusterCard
				title={cluster.title}
				description={cluster.description}
				href={cluster.href}
				count={22}
			/>
		{/each}
	</div>
</div>

<style>
	.commercial-page {
		max-width: 900px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.intro {
		font-size: 1.125rem;
		color: #666;
		margin-bottom: 2rem;
	}

	.clusters {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}
</style>
