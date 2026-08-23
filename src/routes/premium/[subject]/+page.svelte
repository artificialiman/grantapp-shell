<script lang="ts">
	import { page } from '$app/stores';
	import QuizShell from '$lib/components/QuizShell.svelte';

	$: subjectName = $page.params.subject || 'Subject';
	$: subjectLabel = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
</script>

<div class="wrap">
	<div class="breadcrumb">
		<a href="/premium">Premium</a><span class="sep">/</span><span class="current">{subjectLabel}</span>
	</div>

	<h1 class="page-title">{subjectLabel}</h1>
	<p class="page-intro">Premium papers and practice questions</p>

	<QuizShell subject={subjectLabel} questionCount={0} />
</div>

<style>
	.wrap {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 2rem 5rem;
	}

	.page-title {
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		letter-spacing: -0.03em;
		margin: 1rem 0 0.4rem;
	}

	.page-intro {
		color: var(--muted);
		margin-bottom: 2rem;
	}
</style>
