<script lang="ts">
	import ClusterDetail from '$lib/components/ClusterDetail.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<ClusterDetail
	cluster={data.cluster}
	stream="arts"
	streamLabel="Arts"
	streamHref="/arts"
	isLoggedIn={!!data.user}
/>
