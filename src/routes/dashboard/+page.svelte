<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// COPY NEEDED: subject switcher labels, empty-state copy, section
	// intros — left as plain values below per CONTENT_OWNERSHIP.md.
	const subjects = ['chemistry', 'physics', 'biology', 'mathematics', 'english'];

	$: cognitivePatterns = Array.from(new Set(data.masteryGrid.map((c) => c.cognitive_pattern))).sort();
	$: informationTypes = Array.from(new Set(data.masteryGrid.map((c) => c.information_type))).sort();
	$: cellFor = (cp: string, it: string) =>
		data.masteryGrid.find((c) => c.cognitive_pattern === cp && c.information_type === it);

	function masteryColor(score: number | null): string {
		if (score == null) return 'var(--surface-2)';
		// low mastery -> red-ish, high mastery -> green-ish, via the app's own tokens
		if (score < 0.4) return 'var(--red, #ef4444)';
		if (score < 0.7) return 'var(--accent)';
		return 'var(--green)';
	}

	function cellTitle(cp: string, it: string, cell: (typeof data.masteryGrid)[number] | undefined): string {
		if (!cell || cell.mastery_score == null) return `${cp} × ${it}: No data`;
		return `${cp} × ${it}: ${(cell.mastery_score * 100).toFixed(0)}% (${cell.attempts} attempts)`;
	}

	function cellValue(cell: (typeof data.masteryGrid)[number] | undefined): string {
		if (!cell || cell.mastery_score == null) return '';
		return (cell.mastery_score * 100).toFixed(0);
	}

	function handleSubjectChange(e: Event) {
		const target = e.currentTarget as HTMLSelectElement;
		window.location.href = `/dashboard?subject=${target.value}`;
	}

	$: weakestTopics = [...data.topicBreakdown].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
	$: maxDailyAttempts = Math.max(1, ...data.dailyTrend.map((d) => d.attempts));
</script>

<div class="wrap">
	<div class="breadcrumb">
		<a href="/">Home</a><span class="sep">/</span><span class="current">Dashboard</span>
	</div>

	<div class="dash-header">
		<h1 class="page-title">Your progress</h1>
		<select class="subject-select" value={data.subject} on:change={handleSubjectChange}>
			{#each subjects as s}
				<option value={s} selected={s === data.subject}>{s[0].toUpperCase() + s.slice(1)}</option>
			{/each}
		</select>
	</div>

	<div class="stats-bar">
		<div class="stat">
			<div class="stat-num">{data.summary.total_attempts}</div>
			<div class="stat-label">Attempts</div>
		</div>
		<div class="stat">
			<div class="stat-num">{(data.summary.accuracy * 100).toFixed(0)}%</div>
			<div class="stat-label">Accuracy</div>
		</div>
		<div class="stat">
			<div class="stat-num">{data.summary.points_total.toFixed(1)}</div>
			<div class="stat-label">Points</div>
		</div>
		<div class="stat">
			<div class="stat-num">
				{data.summary.avg_time_taken_ms ? Math.round(data.summary.avg_time_taken_ms / 1000) : '—'}s
			</div>
			<div class="stat-label">Avg. time</div>
		</div>
	</div>

	{#if data.masteryGrid.length === 0}
		<div class="empty-state">
			<!-- COPY NEEDED: real empty-state messaging -->
			<p>No practice recorded yet for this subject.</p>
		</div>
	{:else}
		<div class="section-header">
			<span class="section-title">Mastery grid</span>
			<span class="section-count">{cognitivePatterns.length} × {informationTypes.length} combos</span>
		</div>

		<div class="heatmap-wrap">
			<div class="heatmap" style="grid-template-columns: 140px repeat({informationTypes.length}, 1fr);">
				<div class="heatmap-corner"></div>
				{#each informationTypes as it}
					<div class="heatmap-col-label">{it}</div>
				{/each}

				{#each cognitivePatterns as cp}
					<div class="heatmap-row-label">{cp}</div>
					{#each informationTypes as it}
						{@const cell = cellFor(cp, it)}
						<div
							class="heatmap-cell"
							style="background: {masteryColor(cell?.mastery_score ?? null)}"
							title={cellTitle(cp, it, cell)}
						>
							{#if cell && cell.mastery_score != null}
								<span class="heatmap-cell-value">{cellValue(cell)}</span>
							{/if}
						</div>
					{/each}
				{/each}
			</div>
		</div>

		<div class="section-header">
			<span class="section-title">Weakest topics</span>
		</div>
		<div class="topic-list">
			{#each weakestTopics as t}
				<div class="topic-row">
					<span class="topic-name">{t.topic}</span>
					<div class="topic-bar-track">
						<div class="topic-bar-fill" style="width: {t.accuracy * 100}%; background: {masteryColor(t.accuracy)}"></div>
					</div>
					<span class="topic-pct">{(t.accuracy * 100).toFixed(0)}%</span>
					<span class="topic-attempts">{t.attempts} seen</span>
				</div>
			{/each}
		</div>

		<div class="section-header">
			<span class="section-title">Last 30 days</span>
		</div>
		<div class="trend-chart">
			{#each data.dailyTrend as d}
				<div class="trend-bar-col" title="{d.date}: {d.attempts} attempts, {(d.accuracy * 100).toFixed(0)}% accuracy">
					<div class="trend-bar" style="height: {(d.attempts / maxDailyAttempts) * 100}%"></div>
				</div>
			{/each}
		</div>

		{#if data.confidenceCalibration.length > 0}
			<div class="section-header">
				<span class="section-title">Confidence calibration</span>
			</div>
			<div class="calibration-list">
				{#each data.confidenceCalibration as c}
					<div class="calibration-row">
						<span class="calibration-label">{c.confidence_rating} / 5</span>
						<div class="topic-bar-track">
							<div class="topic-bar-fill" style="width: {c.accuracy * 100}%; background: {masteryColor(c.accuracy)}"></div>
						</div>
						<span class="topic-pct">{(c.accuracy * 100).toFixed(0)}% correct</span>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.wrap {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2.5rem 2rem 5rem;
	}

	.dash-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		margin: 1rem 0 2rem;
	}

	.page-title {
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		letter-spacing: -0.03em;
		margin: 0;
	}

	.subject-select {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		padding: 0.5rem 0.9rem;
		background: var(--surface);
		border: 1px solid var(--border-2);
		border-radius: var(--radius-md);
		color: var(--text);
	}

	.empty-state {
		padding: 3rem 1rem;
		text-align: center;
		color: var(--muted);
	}

	/* ── Mastery heatmap ── */
	.heatmap-wrap {
		overflow-x: auto;
		margin-bottom: 3rem;
	}

	.heatmap {
		display: grid;
		gap: 3px;
		min-width: 600px;
	}

	.heatmap-corner {
		background: transparent;
	}

	.heatmap-col-label {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: var(--muted);
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		text-align: left;
		padding: 0.4rem 0.2rem;
		white-space: nowrap;
	}

	.heatmap-row-label {
		font-size: 0.78rem;
		color: var(--text);
		display: flex;
		align-items: center;
		padding-right: 0.6rem;
		white-space: nowrap;
	}

	.heatmap-cell {
		aspect-ratio: 1;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 36px;
		opacity: 0.85;
		transition: opacity 0.15s ease;
	}

	.heatmap-cell:hover {
		opacity: 1;
	}

	.heatmap-cell-value {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 600;
		color: #000;
		mix-blend-mode: difference;
		filter: invert(1);
	}

	/* ── Topic breakdown ── */
	.topic-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 3rem;
	}

	.topic-row {
		display: grid;
		grid-template-columns: 180px 1fr 50px 70px;
		align-items: center;
		gap: 0.75rem;
	}

	.topic-name {
		font-size: 0.85rem;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.topic-bar-track {
		height: 8px;
		background: var(--surface-2);
		border-radius: 999px;
		overflow: hidden;
	}

	.topic-bar-fill {
		height: 100%;
		border-radius: 999px;
	}

	.topic-pct {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--muted);
		text-align: right;
	}

	.topic-attempts {
		font-size: 0.7rem;
		color: var(--muted);
		text-align: right;
	}

	/* ── Trend chart ── */
	.trend-chart {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 100px;
		margin-bottom: 3rem;
		padding: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
	}

	.trend-bar-col {
		flex: 1;
		height: 100%;
		display: flex;
		align-items: flex-end;
	}

	.trend-bar {
		width: 100%;
		background: var(--accent);
		border-radius: 2px 2px 0 0;
		min-height: 2px;
		opacity: 0.8;
		transition: opacity 0.15s ease;
	}

	.trend-bar-col:hover .trend-bar {
		opacity: 1;
	}

	/* ── Confidence calibration ── */
	.calibration-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 2rem;
	}

	.calibration-row {
		display: grid;
		grid-template-columns: 70px 1fr 100px;
		align-items: center;
		gap: 0.75rem;
	}

	.calibration-label {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text);
	}
</style>
