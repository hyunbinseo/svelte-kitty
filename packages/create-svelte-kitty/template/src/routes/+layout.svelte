<script>
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import logo from '$lib/static/logo.svg?no-inline';
	import '../app.css';

	// SVG favicons are not supported by Safari 18.
	// Reference https://caniuse.com/link-icon-svg

	let { children } = $props();
</script>

<!-- This root layout file is always inherited. -->
<!-- Therefore, it only includes the essentials. -->
<!-- Use layout groups for layout customization. -->

<svelte:head>
	<!-- PageData values can be undefined despite being typed. -->
	<!-- Blocked by https://github.com/sveltejs/kit/issues/11018 -->
	<title>
		{page.data.pageTitle //
			? `${page.data.pageTitle} - ${PUBLIC_SITE_NAME}`
			: PUBLIC_SITE_NAME}
	</title>
	<meta property="og:title" content={page.data.pageTitle || PUBLIC_SITE_NAME} />
	<meta property="og:site_name" content={PUBLIC_SITE_NAME} />
	<!-- Blocked by https://github.com/sveltejs/svelte/issues/15337 -->
	{#if !dev}
		<link rel="icon" href={logo} />
	{/if}
	<script>
		if (window.location.pathname !== '/unsupported') {
			var isSupported =
				typeof [].toReversed === 'function' && // ES2023
				CSS.supports('selector(:has(a))');
			if (!isSupported) window.location.href = '/unsupported';
		}
	</script>
</svelte:head>

{@render children()}
