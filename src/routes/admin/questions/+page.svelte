<script lang="ts">
	let jsonInput = '';
	let submitting = false;
	let result: { inserted?: number; message?: string; errors?: string[]; detail?: string } | null = null;

	async function handleImport() {
		result = null;
		let parsed;
		try {
			parsed = JSON.parse(jsonInput);
		} catch {
			result = { message: 'Invalid JSON — check for a trailing comma or missing bracket.' };
			return;
		}

		const questions = Array.isArray(parsed) ? parsed : parsed.questions;
		if (!Array.isArray(questions)) {
			result = { message: 'Expected a JSON array of questions, or an object with a "questions" array.' };
			return;
		}

		submitting = true;
		try {
			const res = await fetch('/api/admin/questions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ questions })
			});
			result = await res.json();
		} catch (err) {
			result = { message: err instanceof Error ? err.message : 'Request failed' };
		} finally {
			submitting = false;
		}
	}
</script>

<div class="wrap">
	<h1 class="page-title">Question import</h1>
	<p class="page-intro">
		Paste a JSON array of questions. Each needs: subject, topic, prompt, options (array of
		{'{id, text}'}), correct_option_id, cognitive_patterns (array), information_types (array).
		Optional: subtopic, explanation, negative_marking_value, difficulty, source.
	</p>

	<textarea
		bind:value={jsonInput}
		placeholder={'[\n  {\n    "subject": "chemistry",\n    "topic": "Atomic Structure and Bonding",\n    "prompt": "...",\n    "options": [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}],\n    "correct_option_id": "a",\n    "cognitive_patterns": ["Logical"],\n    "information_types": ["Essential"]\n  }\n]'}
		rows="18"
	></textarea>

	<button class="btn btn-primary" on:click={handleImport} disabled={submitting || !jsonInput.trim()}>
		{submitting ? 'Importing…' : 'Import questions'}
	</button>

	{#if result}
		<div class="result-box" class:result-error={result.errors || result.message}>
			{#if result.inserted !== undefined}
				<p class="result-success">Inserted {result.inserted} question{result.inserted === 1 ? '' : 's'}.</p>
			{/if}
			{#if result.message}
				<p>{result.message}</p>
			{/if}
			{#if result.errors}
				<ul>
					{#each result.errors as e}
						<li>{e}</li>
					{/each}
				</ul>
			{/if}
			{#if result.detail}
				<p class="result-detail">{result.detail}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrap {
		max-width: 800px;
		margin: 0 auto;
		padding: 2.5rem 2rem 5rem;
	}

	.page-title {
		font-size: 1.75rem;
		margin-bottom: 0.5rem;
	}

	.page-intro {
		color: var(--muted);
		font-size: 0.85rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	textarea {
		width: 100%;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		padding: 1rem;
		background: var(--surface);
		border: 1px solid var(--border-2);
		border-radius: var(--radius-md);
		color: var(--text);
		resize: vertical;
		margin-bottom: 1rem;
	}

	.result-box {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: var(--radius-md);
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 0.85rem;
	}

	.result-box.result-error {
		border-color: rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.06);
	}

	.result-success {
		color: var(--green);
		font-weight: 600;
	}

	.result-detail {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--muted);
		margin-top: 0.5rem;
	}

	ul {
		margin: 0.5rem 0 0;
		padding-left: 1.2rem;
	}
</style>
