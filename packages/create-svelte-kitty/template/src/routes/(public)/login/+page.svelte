<script>
	import { enhance } from '$app/forms';
	import formStyles from '$lib/styles/form.module.css';
	import { createFormHelper } from 'svelte-form-enhanced';
	import { slide } from 'svelte/transition';
	import { t } from './i18n.ts';

	let { data, form } = $props();

	const f = createFormHelper({ updateOptions: { reset: false } });
</script>

<form
	method="post"
	use:enhance={f.submitFunction}
	class="{formStyles.stacked} {formStyles.underline} mx-auto my-8 flex w-full max-w-80 flex-col md:my-16"
>
	{#if !data.magicLinkLogin || form?.error}
		{#if !form?.loginId}
			<h1 class="text-2xl font-bold">
				{form?.error && form.error !== 'MAGIC_LINK_SEND_FAILED'
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
			{#if form?.error === 'MAGIC_LINK_SEND_FAILED' && f.state !== 'submitting'}
				<p transition:slide class="mt-2 text-smallish text-red-800">{t.error[form.error]}</p>
			{/if}
			<button
				formaction="?/send"
				disabled={f.state === 'submitting'}
				class="btn btn-primary disabled:btn-spinner mt-4"
			>
				{t['send-magic-link']}
			</button>
		{:else}
			<h1 class="text-2xl font-bold">{t['please-check-your-inbox']}</h1>
			<p class="mt-1">{t['this-page-can-be-safely-closed']}</p>
			<label class="btn btn-xs btn-secondary mt-6 w-fit">
				<input type="checkbox" name="use-otp" required />
				<span>{t['login-using-otp']}</span>
			</label>
			<label class="mt-6">
				<span>{t.otp}</span>
				<input
					name="otp"
					type="text"
					inputmode="numeric"
					pattern="\d+"
					minlength={data.loginOtpLength}
					maxlength={data.loginOtpLength}
					placeholder={'123456789'.slice(0, data.loginOtpLength)}
					required
				/>
			</label>
			<input type="hidden" name="id" value={form.loginId} />
			<button
				formaction="?/otp"
				disabled={f.state === 'submitting'}
				class="btn btn-primary disabled:btn-spinner mt-4"
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
			class="btn btn-primary disabled:btn-spinner mt-4"
		>
			{t.continue}
		</button>
		<a href="?" class="btn btn-secondary mt-2">{t['start-over']}</a>
	{/if}
</form>

<style>
	@import '$lib/theme.css' reference;

	label:has(input[name='use-otp']:not(:checked)) ~ * {
		@apply hidden;
	}
</style>
