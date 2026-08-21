<script lang="ts">
	import ClusterCard from '$lib/components/ClusterCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const clusters = [
		{ title: 'English Language', description: 'Comprehension, Writing, Grammar', href: '/arts/english' },
		{ title: 'History', description: 'African History, World History', href: '/arts/history' },
		{ title: 'Geography', description: 'Physical, Human, Practical', href: '/arts/geography' }
	];
</script>

<div class="arts-page">
	<h1>Arts Stream</h1>
	<p class="intro">Explore humanities subjects with expertly curated content and interactive learning.</p>

	<div class="clusters">
		{#each clusters as cluster}
			<ClusterCard
				title={cluster.title}
				description={cluster.description}
				href={cluster.href}
				count={20}
			/>
		{/each}
	</div>
</div>

<style>
	.arts-page {
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
