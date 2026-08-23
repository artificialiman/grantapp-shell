<script lang="ts">
	export let subject: string = 'Biology';
	export let questionCount: number = 0;
</script>

<div class="quiz-shell">
	<div class="quiz-header">
		<span class="section-title">{subject}</span>
	</div>
	<div class="quiz-content">
		{#if questionCount === 0}
			<p class="placeholder">Quiz content will load here. ({questionCount} questions)</p>
		{:else}
			<p>Questions loaded: {questionCount}</p>
		{/if}
	</div>
</div>

<style>
	.quiz-shell {
		padding: 1.75rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
	}

	.quiz-header {
		margin-bottom: 1.25rem;
	}

	.quiz-content {
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder {
		color: var(--muted);
		font-style: italic;
		font-size: 0.9rem;
	}
</style>
