<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { createAppShell } from '$lib/app/app-shell.svelte';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import ServiceWorkerUpdatePrompt from '$lib/components/pwa/ServiceWorkerUpdatePrompt.svelte';
	import { initWebVitals } from '$lib/client/web-vitals';
	import { setContext } from 'svelte';
	import type { Pathname } from '$app/types';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import 'm3-svelte/etc/layer';
	import '$lib/m3/m3.css';
	import { chronosM3Theme } from '$lib/m3/theme';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	let { children } = $props();

	const shell = createAppShell();
	setContext('appShell', shell);

	onMount(() => {
		shell.init();
		initWebVitals();
		return () => shell.destroy();
	});

	$effect(() => {
		document.documentElement.classList.toggle('dark', shell.state.isDark);
		document.documentElement.style.colorScheme = shell.state.isDark ? 'dark' : 'light';
	});
</script>

<svelte:head>
	<style>
		{@html chronosM3Theme}
	</style>
	{@html webManifestLink}
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-dvh bg-canvas text-ink">
	{@render children()}
</div>

<InstallPrompt />
<ServiceWorkerUpdatePrompt />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
