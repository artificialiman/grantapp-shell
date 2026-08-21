<script lang="ts">
	import type { PageData } from './$types';
	import SubjectCard from '$lib/components/SubjectCard.svelte';

	export let data: PageData;
</script>

<div class="home">
	<section class="hero">
		<h1>Welcome to GrantApp</h1>
		<p>Premium exam preparation for Nigerian secondary schools</p>
	</section>

	<section class="streams">
		<h2>Choose Your Stream</h2>
		<div class="grid">
			<SubjectCard title="Science" description="Biology, Chemistry, Physics" href="/science" icon="🔬" />
			<SubjectCard title="Arts" description="English, History, Geography" href="/arts" icon="📖" />
			<SubjectCard title="Commercial" description="Accounting, Economics, Commerce" href="/commercial" icon="💼" />
		</div>
	</section>

	{#if data.user}
		<section class="premium-cta">
			<h2>Premium Access</h2>
			{#if data.student?.subscription_active}
				<p>You have premium access. <a href="/premium">View premium content</a></p>
			{:else}
				<p>Unlock premium papers and features. <a href="/login">Subscribe now</a></p>
			{/if}
		</section>
	{/if}
</div>

<style>
	.home {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero {
		text-align: center;
		padding: 3rem 1rem;
		background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
		color: white;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.hero h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.hero p {
		font-size: 1.25rem;
		margin: 0;
	}

	.streams {
		margin-bottom: 3rem;
	}

	.streams h2 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.premium-cta {
		padding: 2rem;
		background-color: #f0f8ff;
		border: 2px solid #007bff;
		border-radius: 8px;
		text-align: center;
	}

	.premium-cta h2 {
		color: #0056b3;
		margin-top: 0;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 1.75rem;
		}

		.hero p {
			font-size: 1rem;
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
