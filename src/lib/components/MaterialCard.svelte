<script lang="ts">
	/** Reuses .notes-card exactly (icon / label / title / sub / arrow) —
	    see app.css "Notes / callout card" block. No new component CSS. */
	export let title: string; // COPY: IMAN
	export let type: string = 'factfile';
	export let href: string = '#';
	export let sizeLabel: string = '';

	const ICON: Record<string, string> = {
		factfile: '📄',
		'formula-sheet': '∑',
		'diagram-sheet': '📐',
		'topic-summary': '📝'
	};
</script>

<a {href} class="notes-card" target="_blank" rel="noopener">
	<div class="notes-icon">{ICON[type] ?? '📄'}</div>
	<div class="notes-info">
		<div class="notes-label">{type.replace('-', ' ')}</div>
		<div class="notes-title">{title}</div>
		{#if sizeLabel}
			<div class="notes-sub">{sizeLabel}</div>
		{/if}
	</div>
	<div class="notes-arrow">↓</div>
</a>
