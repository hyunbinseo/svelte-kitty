<script>
	import { t } from './i18n';
</script>

<svelte:head>
	<!-- Reference src/routes/+layout.svelte -->
	<script>
		{
			var isSupported =
				typeof [].toReversed === 'function' && // ES2023
				CSS.supports('selector(:has(a))');
			if (isSupported) window.location.href = '/';
		}
	</script>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- Use CSS supported by legacy browsers. -->

<main class="p-4">
	<h1 class="text-2xl font-bold">{t.heading}</h1>
	<p>{t.message}</p>
</main>
