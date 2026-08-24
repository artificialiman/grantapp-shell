<script lang="ts">
	import ClusterDetail from '$lib/components/ClusterDetail.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<ClusterDetail
	cluster={data.cluster}
	stream="science"
	streamLabel="Science"
	streamHref="/science"
	isLoggedIn={!!data.user}
/>
