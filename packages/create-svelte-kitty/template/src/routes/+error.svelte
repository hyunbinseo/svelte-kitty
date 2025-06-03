<script lang="ts">
	import { page } from '$app/state';
	import { t } from './i18n.error';

	// Blocked by https://github.com/sveltejs/kit/issues/11633
	const isGenericErrorMessage = (message: string) => /^Error: [45]\d{2}$/.test(message);
	const isDefinedReasonPhrase = (status: number): status is keyof typeof t.http => status in t.http;

	const message = $derived(
		(() => {
			const message = page?.error?.message;
			if (message && !isGenericErrorMessage(message)) return message;
			return isDefinedReasonPhrase(page.status) ? t.http[page.status] : t['unknown-error'];
		})(),
	);
</script>

<main class="p-4">
	<header>
		<h1 class="text-4xl font-bold">{page.status}</h1>
		<p>{message}</p>
	</header>
	<p class="mt-4">
		{t['please-try-again']}
		<a href="/" class="ua-anchor">{t['go-home']}</a>
	</p>
</main>
