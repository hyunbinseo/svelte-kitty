<script lang="ts">
	import type { Snippet } from 'svelte';
	import { t } from './container.i18n';

	let {
		topNav,
		children,
		bottomNav,
	}: {
		topNav?: Snippet;
		children?: Snippet;
		bottomNav?: Snippet;
	} = $props();
</script>

<!-- Fixed fullscreen background element. -->
<!-- A gradient or an image can be set here. -->
<div class="fixed inset-0 bg-gray-600"></div>

<div class="relative flex min-h-screen justify-center md:py-16">
	<div class="flex w-full max-w-screen-md flex-col bg-white">
		<noscript class="bg-yellow-300 p-2">{t.noscript}</noscript>
		<a
			href="#main-content"
			onclick={() => (window.location.hash = 'main-content')}
			class="btn btn-primary rounded-none"
		>
			{t['skip-to-content']}
		</a>
		<!-- `z-index` keeps the `position: relative` children from scrolling above. -->
		<div class="sticky top-0 z-10 bg-white/75 backdrop-blur">
			{@render topNav?.()}
		</div>
		<div id="main-content" class="flex-1 p-[--container-padding]">
			{@render children?.()}
		</div>
		<div class="sticky bottom-0 z-10 bg-white/75 backdrop-blur sm:hidden">
			{@render bottomNav?.()}
		</div>
	</div>
</div>

<style lang="postcss">
	/* `*` selector can be used since the style is scoped. */
	/* Reference https://stackoverflow.com/a/77054333 */
	* {
		/* Anchor with a `href="#a"` scrolls `id="a"` to the top, */
		/* which can be placed behind and under a sticky top nav. */
		/* Set `.scroll-mt-[--top-navbar-height]` to avoid this. */
		/* Reference https://tailwindcss.com/docs/scroll-margin */
		--top-navbar-height: theme(size.14);
		--container-padding: theme(size.5);
		@media (min-width: theme(screens.sm)) {
			--container-padding: theme(size.6);
		}
	}
	/* TODO Use .not-focus-visible:sr-only after upgrading to Tailwind v4. */
	/* The .[&:not(:focus-visible)]:sr-only does not work in Tailwind v3. */
	a[href='#main-content']:not(:focus-visible) {
		@apply sr-only;
	}
</style>
