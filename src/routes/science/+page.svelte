<script lang="ts">
	import ClusterCard from '$lib/components/ClusterCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const clusters = [
		{ title: 'Biology', description: 'Genetics, Ecology, Cellular Biology', href: '/science/biology' },
		{ title: 'Chemistry', description: 'Organic, Inorganic, Physical', href: '/science/chemistry' },
		{ title: 'Physics', description: 'Mechanics, Waves, Electricity', href: '/science/physics' }
	];
</script>

<div class="science-page">
	<h1>Science Stream</h1>
	<p class="intro">Master core science subjects with comprehensive question banks and premium papers.</p>

	<div class="clusters">
		{#each clusters as cluster}
			<ClusterCard
				title={cluster.title}
				description={cluster.description}
				href={cluster.href}
				count={25}
			/>
		{/each}
	</div>
</div>

<style>
	.science-page {
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
