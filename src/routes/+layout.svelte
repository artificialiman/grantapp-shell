<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let online = true;

	onMount(() => {
		const handleOnline = () => (online = true);
		const handleOffline = () => (online = false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Check initial status
		online = navigator.onLine;

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});
</script>

<header class="navbar">
	<div class="container">
		<div class="navbar-brand">
			<a href="/">
				<h1>GrantApp</h1>
			</a>
		</div>
		<nav class="navbar-menu">
			<a href="/" class:active={$page.url.pathname === '/'}>Home</a>
			<a href="/login" class:active={$page.url.pathname === '/login'}>Login</a>
		</nav>
		<div class="navbar-status">
			{#if !online}
				<span class="offline-badge">Offline</span>
			{/if}
		</div>
	</div>
</header>

<main class="container main-content">
	<slot />
</main>

<footer class="footer">
	<p>&copy; 2026 GrantApp. All rights reserved.</p>
</footer>

<style>
	:global(body) {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	:global(main.main-content) {
		flex: 1;
		padding: 2rem 1rem;
	}

	.navbar {
		background-color: #fff;
		border-bottom: 1px solid #e0e0e0;
		padding: 1rem 0;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.navbar-brand h1 {
		margin: 0;
		font-size: 1.5rem;
		color: #007bff;
	}

	.navbar-menu {
		display: flex;
		gap: 2rem;
		flex: 1;
		margin-left: 2rem;
	}

	.navbar-menu a {
		font-weight: 500;
		color: #333;
		transition: color 0.2s ease;
	}

	.navbar-menu a.active {
		color: #007bff;
		text-decoration: underline;
	}

	.navbar-menu a:hover {
		color: #007bff;
	}

	.navbar-status {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.offline-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background-color: #ffc107;
		color: #333;
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.footer {
		background-color: #f8f9fa;
		border-top: 1px solid #e0e0e0;
		padding: 2rem;
		text-align: center;
		color: #666;
		font-size: 0.875rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}
</style>
