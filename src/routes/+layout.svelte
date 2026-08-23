<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let online = true;

	// Dashboard nav is denser and carries session state (Section 3.1 of
	// DESIGN_SYSTEM.md) — public routes get the taller marketing nav.
	$: isPremium = $page.url.pathname.startsWith('/premium');

	onMount(() => {
		const handleOnline = () => (online = true);
		const handleOffline = () => (online = false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		online = navigator.onLine;

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});
</script>

<nav class:nav-dashboard={isPremium}>
	<div class="nav-left">
		<a href="/" class="brand">GrantApp <span>AI</span></a>
	</div>
	<div class="nav-links">
		<a href="/" class:current={$page.url.pathname === '/'}>Home</a>
		<a href="/login" class:current={$page.url.pathname === '/login'}>Login</a>
	</div>
	<div class="nav-right">
		{#if !online}
			<span class="nav-badge offline">Offline</span>
		{/if}
	</div>
</nav>

<main>
	<slot />
</main>

<footer>
	<p>&copy; 2026 GrantApp AI. All rights reserved.</p>
</footer>

<style>
	main {
		min-height: 60vh;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.75rem;
	}

	.nav-links a {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
		transition: color 0.2s ease;
	}

	.nav-links a:hover,
	.nav-links a.current {
		color: var(--text);
	}

	.nav-right {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.nav-badge.offline {
		font-family: var(--font-mono);
		color: var(--flag);
		border-color: rgba(245, 158, 11, 0.3);
		background: var(--accent-dim);
	}
</style>
