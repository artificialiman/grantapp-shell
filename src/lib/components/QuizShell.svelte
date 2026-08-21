<script lang="ts">
	export let subject: string = 'Biology';
	export let questionCount: number = 0;
</script>

<div class="quiz-shell">
	<h2>{subject}</h2>
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
		padding: 2rem;
		background-color: #f9f9f9;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	h2 {
		margin-top: 0;
		color: #333;
	}

	.quiz-content {
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder {
		color: #999;
		font-style: italic;
	}
</style>
