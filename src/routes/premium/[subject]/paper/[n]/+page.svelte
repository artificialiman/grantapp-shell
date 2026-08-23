<script lang="ts">
	import QuizShell from '$lib/components/QuizShell.svelte';
	import { streamFor } from '$lib/content/subjects';
	import type { PageData } from './$types';

	export let data: PageData;

	$: subjectLabel = data.subject.charAt(0).toUpperCase() + data.subject.slice(1);
	$: stream = streamFor(data.subject);
</script>

<div class="stream-context--{stream} wrap">
	<div class="breadcrumb">
		<a href="/premium">Premium</a><span class="sep">/</span>
		<a href="/premium/{data.subject}">{subjectLabel}</a><span class="sep">/</span>
		<span class="current">Paper {data.paperNumber}</span>
	</div>

	<h1 class="page-title">{subjectLabel} · Paper {data.paperNumber}</h1>
	<p class="page-intro">
		<!-- COPY NEEDED: paper intro line, e.g. instructions or scoring note -->
		50 questions. Progress saves automatically as you answer.
	</p>

	<!--
		QuizShell currently renders a placeholder. It needs to become the real
		question-by-question runner: one Question at a time (see
		lib/content/subjects.ts — diagram lives inline on the question), a
		progress indicator, and a call to /api/submit-paper as answers are
		recorded and again on final submit. That's an interaction-design pass
		of its own, separate from this routing/gating skeleton.
	-->
	<QuizShell subject={subjectLabel} questionCount={data.questions.length} />
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
