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

			// Success!
			await goto('/');
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
		<h1>{showSignUp ? 'Sign Up' : 'Sign In'}</h1>

		{#if error}
			<div class="alert" class:error={!showSignUp || !error.includes('successful')}>
				{error}
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

			<button type="submit" class="primary" {disabled: loading}>
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
		min-height: 60vh;
		padding: 2rem 1rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin-top: 0;
		text-align: center;
		color: #333;
		font-size: 1.75rem;
	}

	.alert {
		padding: 1rem;
		margin-bottom: 1.5rem;
		border-radius: 6px;
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.alert.error {
		background-color: #f8d7da;
		color: #721c24;
		border-color: #f5c6cb;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: #333;
		font-size: 0.875rem;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	input:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
	}

	input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	button.primary {
		width: 100%;
		padding: 0.75rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	button.primary:hover:not(:disabled) {
		background-color: #0056b3;
	}

	button.primary:disabled {
		background-color: #6c757d;
		cursor: not-allowed;
	}

	.toggle {
		text-align: center;
		margin-top: 1.5rem;
	}

	.toggle p {
		margin: 0;
		font-size: 0.875rem;
		color: #666;
	}

	.toggle button {
		background: none;
		border: none;
		color: #007bff;
		cursor: pointer;
		font-weight: 600;
		text-decoration: underline;
		padding: 0;
	}

	.toggle button:hover {
		color: #0056b3;
	}

	.back-link {
		text-align: center;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e0e0e0;
	}

	.back-link a {
		color: #666;
		font-size: 0.875rem;
	}

	.back-link a:hover {
		color: #007bff;
		text-decoration: underline;
	}
</style>
