// Disables access to DOM typings and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from '$service-worker';

// This gives `self` the correct types
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = new Set([
	...build, // the app itself
	...files, // everything in `static`
]);

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			// Cache assets on service worker installation.
			// e.g. For offline PWA, cache all ASSETS here.
			await cache.addAll([]);
		})(),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				// Remove previous cached data from disk
				if (key !== CACHE) await caches.delete(key);
			}
		})(),
	);
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (!ASSETS.has(url.pathname)) return;

	event.respondWith(
		(async () => {
			// `build`/`files` can always be served from the cache
			const cache = await caches.open(CACHE);
			const cached = await cache.match(url.pathname);
			if (cached) return cached;

			const response = await fetch(event.request);
			if (response.ok) await cache.put(event.request, response.clone());
			return response;
		})(),
	);
});
