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
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte';
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { createShellTabController } from '$lib/shell/shell-tab.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { onboardingController } from '$lib/client/onboarding.svelte';
	import { updateTransitionDirection } from '$lib/navigation/navigation-direction';
	import { setupSecondaryPageViewTransition } from '$lib/navigation/setup-secondary-page-view-transition';
	import { secondaryTransitionGate } from '$lib/navigation/secondary-transition-gate.svelte';
	import ShellRouteHost from '$lib/components/shell/ShellRouteHost.svelte';
	import { PREVIEW_PAINT_READY_CONTEXT } from '@chronos/ui-kit';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';

	setupSecondaryPageViewTransition();

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
	const gate = secondaryTransitionGate;

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

	const blockShell = $derived(onboardingController.isActive(page.url.pathname));

	let InstallPrompt = $state<Component | null>(null);

	setContext('appShell', shell);
	setContext('timetableScreen', timetableScreen);
	setContext('shellTab', shellTab);
	setContext(PREVIEW_PAINT_READY_CONTEXT, () => gate.previewPaintReady);

	$effect(() => {
		void getAppController().slotVersion;
		shellTab.reconcileActiveTab();
	});

	onMount(() => {
		platform.init(page.url.pathname);
		void import('$lib/components/pwa/InstallPrompt.svelte').then((module) => {
			InstallPrompt = module.default;
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
	<div
		class={[
			'shell-root col-start-1 row-start-1 h-dvh w-full bg-canvas text-ink',
			gate.skipPaint && 'is-frozen',
			gate.receded && gate.skipPaint && 'is-receded'
		]}
		class:invisible={blockShell}
		class:pointer-events-none={blockShell || gate.frozen}
		inert={gate.frozen}
	>
		<ShellRouteHost />
	</div>
	<div
		class="secondary-root col-start-1 row-start-1 h-dvh w-full"
		class:is-blocked={blockShell}
		class:invisible={blockShell}
	>
		{@render children()}
	</div>
</div>

{#if InstallPrompt}
	<InstallPrompt />
{/if}
<OnboardingFlow />
<Snackbar />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
