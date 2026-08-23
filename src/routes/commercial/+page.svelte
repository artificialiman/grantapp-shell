<script lang="ts">
	import ClusterCard from '$lib/components/ClusterCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const clusters = [
		{ code: '01', title: 'Accounting', description: 'Financial Statements, Bookkeeping', href: '/commercial/accounting', count: 22 },
		{ code: '02', title: 'Economics', description: 'Micro, Macro, Development', href: '/commercial/economics', count: 22 },
		{ code: '03', title: 'Commerce', description: 'Trade, Business, Marketing', href: '/commercial/commerce', count: 22 }
	];
</script>

<div class="stream-context--commerce wrap">
	<div class="breadcrumb">
		<a href="/">Home</a><span class="sep">/</span><span class="current">Commercial</span>
	</div>

	<h1 class="page-title">Commercial Stream</h1>
	<p class="page-intro">
		Prepare for business and commercial subjects with real-world scenarios and case studies.
	</p>

	<div class="clusters">
		{#each clusters as cluster}
			<ClusterCard
				code={cluster.code}
				title={cluster.title}
				description={cluster.description}
				href={cluster.href}
				count={cluster.count}
			/>
		{/each}
	</div>
</div>

<style>
	.wrap {
		max-width: 960px;
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
		max-width: 520px;
		margin-bottom: 2.5rem;
		line-height: 1.6;
	}
</style>
