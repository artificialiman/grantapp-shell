<script lang="ts">
	import { client } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { generateOrRetrieveDeviceTag } from '$lib/auth/deviceTag';
	import type { PageData } from './$types';

	export let data: PageData;

	let email = '';
	let password = '';
	let loading = false;
	let error: string | null = null;
	let showSignUp = false;

	async function handleSignIn() {
		loading = true;
		error = null;

		try {
			const { error: signInError, data: signInData } = await client.auth.signInWithPassword({
				email,
				password
			});

			if (signInError) {
				error = signInError.message;
				loading = false;
				return;
			}

			// Get device tag
			const deviceTag = generateOrRetrieveDeviceTag();

			// Attempt to bind device
			const bindResponse = await fetch('/api/bind-device', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ device_tag: deviceTag })
			});

			if (!bindResponse.ok) {
				const bindError = await bindResponse.json();
				error = bindError.message || 'Failed to bind device';
				// Sign out the user since binding failed
				await client.auth.signOut();
				loading = false;
				return;
			}

			// Route premium subscribers straight to their papers; everyone
			// else lands on the homepage as before.
			const { data: student } = await client
				.from('students')
				.select('subscription_active')
				.eq('id', signInData.user.id)
				.single();

			await goto(student?.subscription_active ? '/premium' : '/');
		} catch (err) {
			error = (err as Error).message || 'An error occurred';
		}

		loading = false;
	}

	async function handleSignUp() {
		loading = true;
		error = null;

		try {
			const { error: signUpError } = await client.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (signUpError) {
				error = signUpError.message;
			} else {
				error = 'Sign-up successful! Please check your email to verify your account.';
				showSignUp = false;
			}
		} catch (err) {
			error = (err as Error).message || 'An error occurred';
		}

		loading = false;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (showSignUp) {
			handleSignUp();
		} else {
			handleSignIn();
		}
	}
</script>

<div class="login-container">
	<div class="login-card">
		<div class="hero-eyebrow">GrantApp AI</div>
		<h1>{showSignUp ? 'Sign Up' : 'Sign In'}</h1>

		{#if error}
			<div class="error-banner" class:success={error.includes('successful')}>
				<div class="error-content">
					<p>{error}</p>
				</div>
			</div>
		{/if}

		<form on:submit={handleSubmit}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					disabled={loading}
					placeholder="you@example.com"
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					disabled={loading}
					placeholder="••••••••"
				/>
			</div>

			<button type="submit" class="btn btn-primary btn-full" disabled={loading}>
				{loading ? 'Loading...' : showSignUp ? 'Sign Up' : 'Sign In'}
			</button>
		</form>

		<div class="toggle">
			{#if showSignUp}
				<p>
					Already have an account? <button
						type="button"
						on:click={() => {
							showSignUp = false;
							error = null;
						}}>Sign In</button
					>
				</p>
			{:else}
				<p>
					Don't have an account? <button
						type="button"
						on:click={() => {
							showSignUp = true;
							error = null;
						}}>Sign Up</button
					>
				</p>
			{/if}
		</div>

		<div class="back-link">
			<a href="/">← Back to Home</a>
		</div>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		padding: 2rem 1rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		padding: 2.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		background: var(--surface);
	}

	.hero-eyebrow {
		text-align: center;
		margin-bottom: 0.5rem;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		text-align: center;
		font-size: 1.6rem;
	}

	.error-banner {
		margin-bottom: 1.5rem;
	}

	.error-banner.success {
		background: var(--green-dim);
		border-color: rgba(16, 185, 129, 0.3);
	}

	.error-banner.success .error-content {
		color: var(--green);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		font-size: 0.7rem;
	}

	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-full {
		width: 100%;
		justify-content: center;
		padding: 0.75rem;
	}

	.btn-full:disabled {
		background: var(--surface-2);
		color: var(--muted);
		cursor: not-allowed;
	}

	.toggle {
		text-align: center;
		margin-top: 1.5rem;
	}

	.toggle p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.toggle button {
		background: none;
		border: none;
		color: var(--accent);
		cursor: pointer;
		font-weight: 600;
		padding: 0;
	}

	.toggle button:hover {
		opacity: 0.85;
	}

	.back-link {
		text-align: center;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.back-link a {
		color: var(--muted);
		font-size: 0.85rem;
	}

	.back-link a:hover {
		color: var(--accent);
	}
</style>
