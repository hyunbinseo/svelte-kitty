<script>
	import { page } from '$app/state';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import '../app.css';

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
