<script lang="ts">
	import { resolve } from '$app/paths';
	import { beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createAppShell } from '$lib/app/app-shell.svelte';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import ServiceWorkerUpdatePrompt from '$lib/components/pwa/ServiceWorkerUpdatePrompt.svelte';
	import { initWebVitals } from '$lib/client/web-vitals';
	import { setContext } from 'svelte';
	import type { Pathname } from '$app/types';
	import { page } from '$app/state';
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';
	import {
		getNavigationDirection,
		type NavigationDirection
	} from '$lib/navigation/navigation-direction';
	import { isSecondaryRoute, isTabBarVisible } from '$lib/navigation/routes';
	import { secondaryPageTransition } from '$lib/navigation/secondary-page-transition';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import 'm3-svelte/etc/layer';
	import '$lib/m3/m3.css';
	import { chronosM3Theme } from '$lib/m3/theme';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
	let tabBarSuppressed = $state(isSecondaryRoute(page.url.pathname));
	const tabBarVisible = $derived(isTabBarVisible(page.url.pathname) && !tabBarSuppressed);

	let navDirection = $state<NavigationDirection>('none');

	beforeNavigate(({ from, to, type }) => {
		const fromPath = from?.url.pathname;
		const toPath = to?.url.pathname;

		if (type === 'popstate') {
			navDirection = 'back';
		} else if (!toPath) {
			return;
		} else {
			navDirection = getNavigationDirection(fromPath, toPath);
		}

		if (toPath) {
			tabBarSuppressed = isSecondaryRoute(toPath);
		}
	});

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

{#key page.url.pathname}
	<div
		class="min-h-dvh bg-canvas text-ink"
		in:secondaryPageTransition={{ direction: navDirection, phase: 'in' }}
		out:secondaryPageTransition={{ direction: navDirection, phase: 'out' }}
	>
		{@render children()}
	</div>
{/key}

<div
	class="tab-bar-wrapper"
	class:tab-bar-wrapper--hidden={!tabBarVisible}
	aria-hidden={!tabBarVisible}
>
	<BottomTabBar />
</div>

<InstallPrompt />
<ServiceWorkerUpdatePrompt />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
