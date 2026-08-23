<script lang="ts">
	import type { PaperStatus } from '$lib/content/subjects';

	export let number: number;
	export let status: PaperStatus;
	export let answeredCount: number = 0;
	export let score: number | null = null;
	export let href: string = '#';

	$: locked = status === 'locked';

	/** Card modifier reuses the existing two-state system: locked → .coming,
	    everything actionable → .live. See app.css .paper-card rules. */
	$: cardClass = locked ? 'coming' : 'live';

	/** Badge modifier — see DESIGN_SYSTEM.md Section 6 for which of these
	    are new vs. reused as-is. */
	$: badgeClass =
		status === 'completed'
			? 'status-live'
			: status === 'in_progress'
				? 'status-progress'
				: status === 'unlocked'
					? 'status-unlocked'
					: 'status-soon';

	$: badgeLabel = status.replace('_', ' ');

	$: detail =
		status === 'completed' && score !== null
			? `${score}/50 · reviewed`
			: status === 'in_progress'
				? `${answeredCount}/50 answered`
				: status === 'unlocked'
					? '50 questions'
					: `Complete Paper ${number - 1} to unlock`;
</script>

{#if locked}
	<div class="paper-card {cardClass}" aria-disabled="true">
		<div class="paper-top">
			<span class="paper-num">{String(number).padStart(2, '0')}</span>
			<span class="paper-status {badgeClass}">{badgeLabel}</span>
		</div>
		<div class="paper-meta">
			<span class="paper-name">Paper {number}</span>
			<span class="paper-detail">{detail}</span>
		</div>
	</div>
{:else}
	<a {href} class="paper-card {cardClass}">
		<div class="paper-top">
			<span class="paper-num">{String(number).padStart(2, '0')}</span>
			<span class="paper-status {badgeClass}">{badgeLabel}</span>
		</div>
		<div class="paper-meta">
			<span class="paper-name">Paper {number}</span>
			<span class="paper-detail">{detail}</span>
		</div>
	</a>
{/if}
