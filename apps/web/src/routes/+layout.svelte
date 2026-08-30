<script lang="ts">
	import { resolve } from '$app/paths';
	import { beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createAppShell } from '$lib/app/app-shell.svelte';
	import { getTimetableScreen } from '$lib/timetable/timetable-screen.svelte';
	import { createPlatformBootstrap } from '$lib/platform/platform-bootstrap.svelte';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte';
	import Snackbar from '$lib/components/ui/Snackbar.svelte';
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';
	import { createShellTabController } from '$lib/shell/shell-tab.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import {
		updateTransitionDirection,
		type NavigationDirection
	} from '$lib/navigation/navigation-direction';
	import { isSecondaryRoute } from '$lib/navigation/routes';
	import { secondaryPageTransition } from '$lib/navigation/secondary-page-transition';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	const TAB_PAGE_KEY = '__tabs__';
	const pageTransitionKey = $derived(
		isSecondaryRoute(page.url.pathname) ? page.url.pathname : TAB_PAGE_KEY
	);
	const showTabBar = $derived(!isSecondaryRoute(page.url.pathname));

	let transitionDirection = $state<NavigationDirection>('none');

	beforeNavigate(({ from, to, type, delta }) => {
		const fromPath = from?.url.pathname;
		const toPath = to?.url.pathname;
		if (!toPath) return;
		transitionDirection = updateTransitionDirection(fromPath, toPath, type, delta ?? undefined);
	});

	let { children } = $props();

	const shell = createAppShell();
	const timetableScreen = getTimetableScreen();
	const platform = createPlatformBootstrap({ shell, timetableScreen });
	const shellTab = createShellTabController(() => getAppController());

	setContext('appShell', shell);
	setContext('timetableScreen', timetableScreen);
	setContext('shellTab', shellTab);

	$effect(() => {
		void getAppController().slotVersion;
		shellTab.reconcileActiveTab();
	});

	onMount(() => platform.init(page.url.pathname));
</script>

<svelte:head>
	{@html webManifestLink}
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="relative grid min-h-dvh w-full grid-cols-1 grid-rows-1 overflow-x-clip bg-canvas text-ink"
>
	{#key pageTransitionKey}
		<div
			class="col-start-1 row-start-1 min-h-dvh w-full bg-canvas text-ink"
			in:secondaryPageTransition={{ phase: 'in', direction: transitionDirection }}
			out:secondaryPageTransition={{ phase: 'out', direction: transitionDirection }}
		>
			{@render children()}
		</div>
	{/key}
</div>

{#if showTabBar}
	<div class="tab-bar-wrapper">
		<BottomTabBar />
	</div>
{/if}

<InstallPrompt />
<OnboardingFlow />
<Snackbar />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as any)}>{locale}</a>
	{/each}
</div>
