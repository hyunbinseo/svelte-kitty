<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import formStyles from '$lib/styles/form.module.css';
	import { createFormHelper } from 'svelte-form-enhanced';
	import { slide } from 'svelte/transition';
	import { t } from './i18n.ts';

	let { data, form } = $props();

	const f = createFormHelper({
		onAfterSubmit: ({ result, update }) =>
			result.type === 'redirect'
				? goto(page.url.searchParams.get('redirect') || result.location)
				: update({ reset: false })
	});
</script>

<form
	method="post"
	use:enhance={f.submitFunction}
	class={[
		formStyles.stacked,
		formStyles.underline,
		'mx-auto my-8 flex w-full max-w-80 flex-col md:my-16'
	]}
>
	{#if !data.magicLinkLogin || form?.error}
		{#if !form?.loginId}
			<h1 class="text-2xl font-bold">
				{form?.error && form.error !== 'SEND_FAILED'
					? t.error[form.error]
					: data.magicLinkLogin === null
						? t['magic-link-is-invalid']
						: data.pageTitle}
			</h1>
			<label class="mt-8">
				<span>{t.email}</span>
				<!-- Contact types other than email can be used. -->
				<!-- Update frontend and backend code accordingly. -->
				<!-- e.g. input type, placeholder, email validation -->
				<input name="contact" type="email" placeholder="username@example.com" required />
			</label>
			{#if form?.error === 'SEND_FAILED' && f.state !== 'submitting'}
				<p transition:slide class="mt-2 text-red-800 text-smallish">{t.error[form.error]}</p>
			{/if}
			<button
				formaction="?/send"
				disabled={f.state === 'submitting'}
				class="btn btn-primary mt-4 disabled:btn-spinner"
			>
				{t['send-magic-link']}
			</button>
		{:else}
			<h1 class="text-2xl font-bold">{t['please-check-your-inbox']}</h1>
			<p class="mt-1">{t['this-page-can-be-safely-closed']}</p>
			<label class="btn btn-xs btn-secondary mt-6 w-fit">
				<input type="checkbox" name="use-otp" required />
				<span>{t['use-verification-code']}</span>
			</label>
			<label class="mt-6">
				<span>{t.code}</span>
				<input
					name="otp"
					type="text"
					inputmode="numeric"
					pattern="\d+"
					minlength={data.loginOtpLength}
					maxlength={data.loginOtpLength}
					placeholder={'123456789'.slice(0, data.loginOtpLength)}
					autocomplete="one-time-code"
					required
				/>
			</label>
			<input type="hidden" name="id" value={form.loginId} />
			<button
				formaction="?/otp"
				disabled={f.state === 'submitting'}
				class="btn btn-primary mt-4 disabled:btn-spinner"
			>
				{t.login}
			</button>
		{/if}
	{:else}
		<p class="text-xl font-bold">{t['login-as']}</p>
		<p class="mt-1">{data.magicLinkLogin.user.contact}</p>
		<input type="hidden" name="id" value={data.magicLinkLogin.id} />
		<input type="hidden" name="code" value={data.magicLinkLogin.code} />
		<button
			formaction="?/magic"
			disabled={f.state === 'submitting'}
			class="btn btn-primary mt-4 disabled:btn-spinner"
		>
			{t.continue}
		</button>
		<a href="?" class="btn btn-secondary mt-2">{t['start-over']}</a>
	{/if}
</form>

<style lang="postcss">
	label:has(input[name='use-otp']:not(:checked)) ~ * {
		@apply hidden;
	}
</style>
