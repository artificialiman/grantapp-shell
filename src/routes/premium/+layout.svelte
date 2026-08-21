<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="premium-layout">
	<slot />
</div>

<style>
	.premium-layout {
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
