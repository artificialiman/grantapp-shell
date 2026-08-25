<script lang="ts">
	type IncomingQuestion = {
		subject: string;
		topic: string;
		subtopic?: string;
		cognitive_patterns: string[];
		information_types: string[];
		prompt: string;
		options: { id: string; text: string }[];
		correct_option_id: string;
		explanation?: string;
		negative_marking_value?: number;
		difficulty?: number;
		source?: string;
	};

	let jsonInput = '';
	let submitting = false;
	let result: { inserted?: number; message?: string; errors?: string[]; detail?: string } | null = null;
	let fileInput: HTMLInputElement;
	let fileName: string | null = null;
	let dragOver = false;

	// Live preview state — recomputed on every input change, never
	// submitted until the admin clicks Import. Parsing/validation here
	// mirrors the server's checks (options/correct-id consistency,
	// required taxonomy tags) so problems surface before the network
	// round-trip, not after.
	let parseError: string | null = null;
	let questions: IncomingQuestion[] = [];
	let previewErrors: string[] = [];

	$: subjectCounts = questions.reduce<Record<string, number>>((acc, q) => {
		acc[q.subject] = (acc[q.subject] ?? 0) + 1;
		return acc;
	}, {});

	function parseAndValidate(text: string) {
		parseError = null;
		questions = [];
		previewErrors = [];
		result = null;

		if (!text.trim()) return;

		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			parseError = 'Invalid JSON — check for a trailing comma or missing bracket.';
			return;
		}

		const arr = Array.isArray(parsed)
			? parsed
			: parsed && typeof parsed === 'object' && Array.isArray((parsed as { questions?: unknown }).questions)
				? (parsed as { questions: unknown[] }).questions
				: null;

		if (!arr) {
			parseError = 'Expected a JSON array of questions, or an object with a "questions" array.';
			return;
		}

		const errors: string[] = [];
		arr.forEach((q, i) => {
			const question = q as Partial<IncomingQuestion>;
			if (!question.subject || !question.topic || !question.prompt || !question.correct_option_id) {
				errors.push(`Question ${i + 1}: missing a required field (subject/topic/prompt/correct_option_id).`);
			}
			if (!Array.isArray(question.options) || question.options.length < 2) {
				errors.push(`Question ${i + 1}: needs at least 2 options.`);
			} else if (!question.options.some((o) => o.id === question.correct_option_id)) {
				errors.push(`Question ${i + 1}: correct_option_id doesn't match any option id.`);
			}
			if (!Array.isArray(question.cognitive_patterns) || question.cognitive_patterns.length === 0) {
				errors.push(`Question ${i + 1}: needs at least one cognitive_pattern tag.`);
			}
			if (!Array.isArray(question.information_types) || question.information_types.length === 0) {
				errors.push(`Question ${i + 1}: needs at least one information_type tag.`);
			}
		});

		questions = arr as IncomingQuestion[];
		previewErrors = errors;
	}

	$: parseAndValidate(jsonInput);

	function handleFileSelect(file: File) {
		fileName = file.name;
		const reader = new FileReader();
		reader.onload = (e) => {
			jsonInput = (e.target?.result as string) ?? '';
		};
		reader.readAsText(file);
	}

	function onFileInputChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) handleFileSelect(file);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) handleFileSelect(file);
	}

	async function handleImport() {
		if (previewErrors.length > 0 || questions.length === 0) return;

		submitting = true;
		result = null;
		try {
			const res = await fetch('/api/admin/questions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ questions })
			});
			result = await res.json();
			if (res.ok) {
				jsonInput = '';
				fileName = null;
			}
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
		Upload a .json file, drag one in, or paste a JSON array directly. Each question needs:
		subject, topic, prompt, options (array of {'{id, text}'}), correct_option_id,
		cognitive_patterns (array), information_types (array). Optional: subtopic, explanation,
		negative_marking_value, difficulty, source.
	</p>

	<div
		class="drop-zone"
		class:drag-over={dragOver}
		role="region"
		aria-label="Drop a JSON file here or use the button to choose one"
		on:dragover|preventDefault={() => (dragOver = true)}
		on:dragleave={() => (dragOver = false)}
		on:drop={onDrop}
	>
		<input
			bind:this={fileInput}
			type="file"
			accept=".json,application/json"
			on:change={onFileInputChange}
			hidden
		/>
		<button class="btn btn-secondary" on:click={() => fileInput.click()}>Choose .json file</button>
		<span class="drop-hint">{fileName ?? 'or drag a file here'}</span>
	</div>

	<textarea
		bind:value={jsonInput}
		placeholder={'[\n  {\n    "subject": "chemistry",\n    "topic": "Atomic Structure and Bonding",\n    "prompt": "...",\n    "options": [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}],\n    "correct_option_id": "a",\n    "cognitive_patterns": ["Logical"],\n    "information_types": ["Essential"]\n  }\n]'}
		rows="14"
	></textarea>

	{#if parseError}
		<div class="preview-box preview-error">
			<p>{parseError}</p>
		</div>
	{:else if questions.length > 0}
		<div class="preview-box" class:preview-error={previewErrors.length > 0}>
			<div class="preview-summary">
				<span class="preview-count">{questions.length} question{questions.length === 1 ? '' : 's'} parsed</span>
				{#each Object.entries(subjectCounts) as [subject, count]}
					<span class="preview-tag">{subject}: {count}</span>
				{/each}
			</div>

			{#if previewErrors.length > 0}
				<p class="preview-errors-label">{previewErrors.length} problem{previewErrors.length === 1 ? '' : 's'} found — fix before importing:</p>
				<ul>
					{#each previewErrors as e}
						<li>{e}</li>
					{/each}
				</ul>
			{:else}
				<p class="preview-ok">Looks valid. Sample of the first question:</p>
				<div class="sample-question">
					<div class="sample-row"><span class="sample-label">Subject / Topic</span> {questions[0].subject} / {questions[0].topic}</div>
					<div class="sample-row"><span class="sample-label">Prompt</span> {questions[0].prompt}</div>
					<div class="sample-row"><span class="sample-label">Options</span> {questions[0].options?.map((o) => `${o.id}: ${o.text}`).join(' · ')}</div>
					<div class="sample-row"><span class="sample-label">Correct</span> {questions[0].correct_option_id}</div>
					<div class="sample-row"><span class="sample-label">Tags</span> {questions[0].cognitive_patterns?.join(', ')} × {questions[0].information_types?.join(', ')}</div>
				</div>
			{/if}
		</div>
	{/if}

	<button
		class="btn btn-primary"
		on:click={handleImport}
		disabled={submitting || questions.length === 0 || previewErrors.length > 0}
	>
		{submitting ? 'Importing…' : `Import ${questions.length || ''} question${questions.length === 1 ? '' : 's'}`}
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

	.drop-zone {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px dashed var(--border-2);
		border-radius: var(--radius-md);
		margin-bottom: 1rem;
		transition: border-color 0.15s ease, background 0.15s ease;
	}

	.drop-zone.drag-over {
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.drop-hint {
		font-size: 0.8rem;
		color: var(--muted);
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

	.preview-box {
		margin-bottom: 1rem;
		padding: 1rem;
		border-radius: var(--radius-md);
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 0.85rem;
	}

	.preview-box.preview-error,
	.result-box.result-error {
		border-color: rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.06);
	}

	.preview-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.preview-count {
		font-weight: 600;
	}

	.preview-tag {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.preview-errors-label {
		color: var(--muted);
		margin-bottom: 0.4rem;
	}

	.preview-ok {
		color: var(--green);
		margin-bottom: 0.6rem;
	}

	.sample-question {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.8rem;
		background: var(--surface-2);
		border-radius: var(--radius-md);
		padding: 0.75rem;
	}

	.sample-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
		display: block;
		margin-bottom: 0.15rem;
	}

	.result-box {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: var(--radius-md);
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 0.85rem;
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
