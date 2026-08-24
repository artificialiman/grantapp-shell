<script lang="ts">
	import ClusterCard from '$lib/components/ClusterCard.svelte';
	import { SCIENCE_CLUSTERS } from '$lib/content/clusters';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="stream-context--science wrap">
	<div class="breadcrumb">
		<a href="/">Home</a><span class="sep">/</span><span class="current">Science</span>
	</div>

	<h1 class="page-title">Science Stream</h1>
	<p class="page-intro">
		Pick the subject combination for your target course, then practice with real cluster exams.
	</p>

	<div class="clusters">
		{#each SCIENCE_CLUSTERS as cluster}
			<ClusterCard
				code={cluster.code}
				title={cluster.name}
				subjects={cluster.subjects}
				faculties={cluster.faculties}
				available={cluster.available}
				href={cluster.available ? `/science/${cluster.slug}` : '#'}
			/>
		{/each}
	</div>
</div>

<style>
	.wrap {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2.5rem 2rem 5rem;
	}

	.page-title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		letter-spacing: -0.03em;
		margin: 1rem 0 0.6rem;
	}

	.page-intro {
		font-size: 1rem;
		color: var(--muted);
		max-width: 560px;
		margin-bottom: 2.5rem;
		line-height: 1.6;
	}
</style>
