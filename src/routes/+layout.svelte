<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { signOut } from '$lib/auth/session';
	import { goto } from '$app/navigation';

	let online = true;

	// Dashboard nav is a genuinely different nav, not just denser padding
	// on the same links — a logged-in student on /premium has no use for
	// "Home"/"Login", and seeing those was a big part of why premium
	// didn't feel distinct from the public marketing site.
	$: isPremium = $page.url.pathname.startsWith('/premium');

	async function handleSignOut() {
		await signOut();
		await goto('/login');
	}

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
		<a href={isPremium ? '/premium' : '/'} class="brand">GrantApp <span>AI</span></a>
		{#if isPremium}
			<span class="nav-divider"></span>
			<span class="nav-subject">Premium</span>
		{/if}
	</div>
	{#if isPremium}
		<div class="nav-links">
			<a href="/premium" class:current={$page.url.pathname === '/premium'}>Papers</a>
			<a href="/dashboard">Progress</a>
			<button class="nav-signout" on:click={handleSignOut}>Sign out</button>
		</div>
	{:else}
		<div class="nav-links">
			<a href="/" class:current={$page.url.pathname === '/'}>Home</a>
			<a href="/login" class:current={$page.url.pathname === '/login'}>Login</a>
		</div>
	{/if}
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

	.nav-signout {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: color 0.2s ease;
	}

	.nav-signout:hover {
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
