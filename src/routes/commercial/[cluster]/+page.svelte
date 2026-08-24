<script lang="ts">
	import ClusterDetail from '$lib/components/ClusterDetail.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<ClusterDetail
	cluster={data.cluster}
	stream="commerce"
	streamLabel="Commercial"
	streamHref="/commercial"
	isLoggedIn={!!data.user}
/>
