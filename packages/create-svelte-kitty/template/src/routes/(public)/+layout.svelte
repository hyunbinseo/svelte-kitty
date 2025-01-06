<script lang="ts">
	import { page } from '$app/state';
	import Container from '$lib/components/Container.svelte';
	import logo from '$lib/static/logo-horizontal.svg';
	import { t } from './i18n.layout.ts';

	let { children } = $props();

	type NavHref = `/${string}`;

	const navLinks = $derived(
		new Map<NavHref, string>([
			['/', t.nav.home],
			['/about', t.nav.about],
			page.url.pathname === '/login' //
				? ['/login', t.nav.login]
				: ['/session/redirect', t.nav.app]
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
		<img src={logo} alt={t.logo} class="m-auto h-1/2 sm:ml-[--container-padding] sm:mr-0" />
		<div
			class="ml-6 flex flex-1 gap-x-6 overflow-x-auto whitespace-nowrap pr-[--container-padding] last:*:ml-auto max-sm:hidden"
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

<style lang="postcss">
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
