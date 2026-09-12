<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { beforeNavigate, afterNavigate, goto } from '$app/navigation';
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
	import { onboardingController } from '$lib/client/onboarding.svelte';
	import {
		updateTransitionDirection,
		setupSecondaryPageViewTransition,
		secondaryTransitionGate,
		recordNavigation,
		configureNavigateBack,
		restoreShellTabFromHistory,
		stampShellTabOnHistory,
		syncDeepLinkEntryState,
		isShellRoute,
		isSecondaryRoute
	} from '$lib/navigation';
	import ShellRouteHost from '$lib/components/shell/ShellRouteHost.svelte';
	import { PREVIEW_PAINT_READY_CONTEXT, TIMETABLE_PRESENTATION_CONTEXT } from '@chronos/ui-kit';
	import { toStore } from 'svelte/store';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';

	setupSecondaryPageViewTransition();

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
	const gate = secondaryTransitionGate;

	let { children } = $props();

	const shell = createAppShell();
	const timetableScreen = getTimetableScreen();
	const platform = createPlatformBootstrap({ shell, timetableScreen });
	const shellTab = createShellTabController(() => getAppController());

	configureNavigateBack({
		goto: (href) => goto(href),
		setActiveTab: (tabId) => shellTab.setActiveTab(tabId)
	});

	beforeNavigate(({ from, to, type, delta }) => {
		const fromPath = from?.url.pathname;
		const toPath = to?.url.pathname;
		if (!toPath) return;

		if (fromPath && isShellRoute(fromPath) && isSecondaryRoute(toPath)) {
			stampShellTabOnHistory(shellTab.activeTabId);
		}

		updateTransitionDirection(fromPath, toPath, type, delta ?? undefined);
		recordNavigation(fromPath, toPath, type, delta ?? undefined);

		if (isShellRoute(toPath)) {
			restoreShellTabFromHistory((tabId) => shellTab.setActiveTab(tabId));
		}
	});

	afterNavigate(() => {
		syncDeepLinkEntryState();
	});

	const blockShell = $derived(onboardingController.isActive(page.url.pathname));
	const shouldLoadOnboarding = $derived(onboardingController.shouldRender(page.url.pathname));

	let InstallPrompt = $state<Component | null>(null);
	let OnboardingFlow = $state<Component | null>(null);

	setContext('appShell', shell);
	setContext('timetableScreen', timetableScreen);
	setContext('shellTab', shellTab);
	setContext(
		PREVIEW_PAINT_READY_CONTEXT,
		toStore(() => gate.previewPaintReady)
	);
	setContext(
		TIMETABLE_PRESENTATION_CONTEXT,
		toStore(() => ({
			displayedWeek: timetableScreen.state.displayedWeek,
			coursePalette: shell.appearance.coursePalette
		}))
	);

	$effect(() => {
		void getAppController().slotVersion;
		shellTab.reconcileActiveTab();
	});

	$effect(() => {
		if (!shouldLoadOnboarding || OnboardingFlow) return;
		void import('$lib/components/onboarding/OnboardingFlow.svelte').then((module) => {
			OnboardingFlow = module.default;
		});
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
{#if OnboardingFlow}
	<OnboardingFlow />
{/if}
<Snackbar />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
