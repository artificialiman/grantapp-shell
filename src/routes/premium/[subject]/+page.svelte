<script lang="ts">
	import QuizShell from '$lib/components/QuizShell.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const subjectName = data.params?.subject || 'Subject';
</script>

<div class="premium-subject">
	<h1>{subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}</h1>
	<p class="description">Premium papers and practice questions</p>

	<QuizShell subject={subjectName} questionCount={0} />
</div>

<style>
	.premium-subject {
		padding: 2rem 1rem;
		max-width: 900px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.description {
		font-size: 1rem;
		color: #666;
		margin-bottom: 2rem;
	}
</style>
