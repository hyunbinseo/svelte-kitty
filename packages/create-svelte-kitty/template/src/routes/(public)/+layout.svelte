<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_PRIVATE_PATH } from '$env/static/public';
	import Container from '$lib/components/Container.svelte';
	import logo from '$lib/static/logo-horizontal.svg';
	import { onMount } from 'svelte';
	import { t } from './i18n.layout.ts';

	let { children } = $props();

	let session = $state(false);

	onMount(async () => {
		const response = await fetch('/session');
		if (response.ok) session = true;
	});

	type NavHref = `/${string}`;

	const navLinks = $derived(
		new Map<NavHref, string>([
			['/', t.nav.home],
			['/about', t.nav.about],
			!session ? ['/login', t.nav.login] : [PUBLIC_PRIVATE_PATH as NavHref, t.nav.app]
		])
	);

	const navLinkIsActive = (href: NavHref) =>
		href === '/'
			? page.url.pathname === href //
			: page.url.pathname.startsWith(href);
</script>

<Container {topNav} {bottomNav}>
	{@render children()}
</Container>

{#snippet topNav()}
	<nav class="top flex h-[--top-navbar-height] shadow-bottom">
		<img src={logo} alt={t.logo} class="m-auto h-1/2 sm:mr-0 sm:ml-[--container-padding]" />
		<div
			class="ml-6 flex flex-1 gap-x-6 overflow-x-auto pr-[--container-padding] whitespace-nowrap last:*:ml-auto max-sm:hidden"
		>
			{#each navLinks as [href, label] (href)}
				{@const active = navLinkIsActive(href)}
				<a {href} class:active>{label}</a>
			{/each}
		</div>
	</nav>
{/snippet}

{#snippet bottomNav()}
	<nav class="bottom flex h-14 shadow-top *:flex-1">
		{#each navLinks as [href, label] (href)}
			{@const active = navLinkIsActive(href)}
			<a {href} class:active>{label}</a>
		{/each}
	</nav>
{/snippet}

<style>
	@import '$lib/theme.css' reference;

	nav {
		a {
			@apply flex items-center justify-center border-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700;
		}
		a.active {
			@apply border-blue-800 font-bold text-blue-800;
		}
	}

	nav.top {
		a {
			@apply border-b-4 pt-1;
		}
	}

	nav.bottom {
		a {
			@apply border-t-4 pb-1;
		}
	}
</style>
