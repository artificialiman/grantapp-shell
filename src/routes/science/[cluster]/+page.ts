import { error } from '@sveltejs/kit';
import { findCluster } from '$lib/content/clusters';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const cluster = findCluster('science', params.cluster);
	if (!cluster) throw error(404, 'Cluster not found');
	return { cluster };
};
