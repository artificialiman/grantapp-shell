<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="hub-hero">
	<div class="hub-eyebrow">Premium hub</div>
	<h1 class="hub-title">Welcome, <em>{data.student?.full_name || 'Student'}</em></h1>
	<p class="hub-sub">Your premium papers, unlocked and ready — every set works offline once opened.</p>
</section>

{#each data.tiers as tier}
	<section class="section-wrap">
		<div class="section-header">
			<span class="section-title">{tier.label}</span>
			<span class="section-count">{tier.blurb}</span>
		</div>

		<div class="subject-grid">
			{#each tier.subjects as subject}
				<a href="/premium/{subject.slug}" class="subject-card">
					<span class="subject-icon">{subject.icon}</span>
					<span class="subject-name">{subject.name}</span>
					<div class="subject-progress-track">
						<div
							class="subject-progress-fill"
							style="width: {(subject.completed / subject.total) * 100}%"
						></div>
					</div>
					<span class="subject-progress-label">{subject.completed}/{subject.total} papers</span>
				</a>
			{/each}
		</div>
	</section>
{/each}

<section class="section-wrap">
	<a href="/premium" class="notes-card">
		<div class="notes-icon">🗓️</div>
		<div class="notes-info">
			<div class="notes-label">Subscription</div>
			<div class="notes-title">
				{#if data.student?.subscription_expires_at}
					Renews {new Date(data.student.subscription_expires_at).toLocaleDateString()}
				{:else}
					Active subscription
				{/if}
			</div>
			<div class="notes-sub">Manage your plan and billing details</div>
		</div>
		<div class="notes-arrow">→</div>
	</a>
</section>

<style>
	.section-wrap {
		max-width: 960px;
		margin: 0 auto;
		padding: 0 2rem 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.subject-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 1rem;
	}

	.subject-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		text-decoration: none;
		color: var(--text);
		transition: border-color 0.15s ease, background 0.15s ease;
	}

	.subject-card:hover {
		border-color: var(--border-2);
		background: var(--surface-2);
	}

	.subject-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.subject-name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.95rem;
	}

	.subject-progress-track {
		height: 5px;
		background: var(--surface-2);
		border-radius: 999px;
		overflow: hidden;
		margin-top: 0.25rem;
	}

	.subject-progress-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 999px;
	}

	.subject-progress-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--muted);
	}
</style>
