<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import { createAppShell } from '$lib/app/app-shell.svelte';
	import { getTimetableScreen } from '$lib/timetable/timetable-screen.svelte';
	import { createPlatformBootstrap } from '$lib/platform/platform-bootstrap.svelte';
	import Snackbar from '$lib/components/ui/Snackbar.svelte';
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { createShellTabController } from '$lib/shell/shell-tab.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { updateTransitionDirection } from '$lib/navigation/navigation-direction';
	import { setupSecondaryPageViewTransition } from '$lib/navigation/setup-secondary-page-view-transition';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';

	setupSecondaryPageViewTransition();

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	beforeNavigate(({ from, to, type, delta }) => {
		const fromPath = from?.url.pathname;
		const toPath = to?.url.pathname;
		if (!toPath) return;
		updateTransitionDirection(fromPath, toPath, type, delta ?? undefined);
	});

	let { children } = $props();

	const shell = createAppShell();
	const timetableScreen = getTimetableScreen();
	const platform = createPlatformBootstrap({ shell, timetableScreen });
	const shellTab = createShellTabController(() => getAppController());

	let InstallPrompt = $state<Component | null>(null);
	let OnboardingFlow = $state<Component | null>(null);

	setContext('appShell', shell);
	setContext('timetableScreen', timetableScreen);
	setContext('shellTab', shellTab);

	$effect(() => {
		void getAppController().slotVersion;
		shellTab.reconcileActiveTab();
	});

	onMount(() => {
		platform.init(page.url.pathname);
		void import('$lib/components/pwa/InstallPrompt.svelte').then((module) => {
			InstallPrompt = module.default;
		});
		void import('$lib/components/onboarding/OnboardingFlow.svelte').then((module) => {
			OnboardingFlow = module.default;
		});
	});
</script>

<svelte:head>
	{@html webManifestLink}
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="relative grid min-h-dvh w-full grid-cols-1 grid-rows-1 overflow-x-clip bg-canvas text-ink"
>
	<div class="page-root col-start-1 row-start-1 h-dvh w-full bg-canvas text-ink">
		{@render children()}
	</div>
</div>

{#if InstallPrompt}
	<InstallPrompt />
{/if}
{#if OnboardingFlow}
	<OnboardingFlow />
{/if}
<Snackbar />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
