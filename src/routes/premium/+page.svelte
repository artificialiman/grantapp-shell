<script lang="ts">
	import ClusterCard from '$lib/components/ClusterCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="premium-hub">
	<h1>Premium Hub</h1>
	<p class="welcome">Welcome, {data.student?.full_name || 'Student'}!</p>

	<section class="premium-sections">
		<h2>Your Premium Papers</h2>
		<div class="papers-grid">
			<ClusterCard
				title="Science Premium 2025"
				description="Complete past papers with solutions"
				href="/premium/science"
				count={50}
			/>
			<ClusterCard
				title="Arts Premium 2025"
				description="Comprehensive humanities collection"
				href="/premium/arts"
				count={40}
			/>
			<ClusterCard
				title="Commercial Premium 2025"
				description="Business subjects mastery pack"
				href="/premium/commercial"
				count={45}
			/>
		</div>
	</section>

	<section class="subscription-info">
		<h3>Subscription Status</h3>
		{#if data.student?.subscription_expires_at}
			<p>Your premium access expires on {new Date(data.student.subscription_expires_at).toLocaleDateString()}</p>
		{:else}
			<p>Active subscription</p>
		{/if}
	</section>
</div>

<style>
	.premium-hub {
		padding: 2rem 1rem;
	}

	h1 {
		font-size: 2rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.welcome {
		font-size: 1.125rem;
		color: #666;
		margin-bottom: 2rem;
	}

	section {
		margin-bottom: 2rem;
	}

	h2 {
		font-size: 1.5rem;
		color: #333;
		margin-bottom: 1rem;
	}

	h3 {
		color: #333;
		margin-top: 0;
	}

	.papers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.subscription-info {
		padding: 1.5rem;
		background-color: #e7f3ff;
		border-left: 4px solid #007bff;
		border-radius: 4px;
	}

	.subscription-info p {
		margin: 0;
		color: #0056b3;
	}
</style>
