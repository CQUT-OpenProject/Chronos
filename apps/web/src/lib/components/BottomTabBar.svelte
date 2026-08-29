<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { BottomTabSlotContribution } from '@chronos/core';
	import {
		HOST_DEFAULT_ICON_THEME_ID,
		PALETTE_MODE_VIBRANT,
		resolveLocalizedText
	} from '@chronos/core';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { toAppPathname } from '$lib/navigation/app-pathname';
	import { getAppController, getAppEngine } from '$lib/services/app-engine';

	import { resolveEffectiveThemeId } from '$lib/appearance/apply-active-theme';
	import { resolveShellIcon, shellIconSizeClass } from '$lib/shell/resolve-shell-icon';
	import ShellSvgIcon from '$lib/shell/ShellSvgIcon.svelte';
	import { haptic } from '$lib/haptic/haptic';

	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');
	const controller = getAppController();

	const sortedTabs = $derived(controller.getSlots('shell.bottom-bar.tab'));

	const appPathname = $derived(toAppPathname(page.url.pathname));

	function isActive(href: string) {
		if (href === '/') return appPathname === '/';
		return appPathname.startsWith(href);
	}

	function resolveTabIcon(tab: BottomTabSlotContribution, active: boolean) {
		const engine = getAppEngine();
		const iconThemeId = controller.activeIconThemeId;
		const iconTheme =
			iconThemeId !== HOST_DEFAULT_ICON_THEME_ID
				? engine.iconThemes.getIconTheme(iconThemeId)
				: undefined;
		const iconOverride = iconTheme?.bottomTabIcons?.[tab.id];

		const iconRef = active
			? (iconOverride?.iconFill ?? iconOverride?.icon ?? tab.iconFill ?? tab.icon)
			: (iconOverride?.icon ?? tab.icon);

		return resolveShellIcon(iconRef);
	}

	function handleTabClick(event: MouseEvent, tab: BottomTabSlotContribution) {
		haptic.light();
		if (tab.onClick) {
			const ctx = controller.getPluginContextForSlot('shell.bottom-bar.tab', tab.id);
			void tab.onClick(event, ctx);
			return;
		}
		if (tab.href === '/' && timetableScreen) {
			timetableScreen.jumpToCurrentWeek();
			if (appPathname === '/') {
				event.preventDefault();
			}
		}
	}
</script>

<div class="bottom-bar w-full flex-col justify-center">
	<nav
		aria-label={hostT('ui.nav.main')}
		class="flex h-full w-full max-w-md items-center justify-around"
	>
		{#each sortedTabs as tab (tab.id)}
			{@const active = isActive(tab.href)}
			{@const icon = resolveTabIcon(tab, active)}
			<a
				href={resolve(tab.href as any)}
				data-sveltekit-preload-data="off"
				aria-current={active ? 'page' : undefined}
				class="flex h-full min-h-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-0.5 text-on-surface-variant transition-colors hover:text-on-surface sm:gap-1 sm:py-1"
				onclick={(e) => handleTabClick(e, tab)}
			>
				<span
					aria-hidden="true"
					class="rounded-circular flex h-7 w-12 items-center justify-center transition-colors sm:h-8 sm:w-14 {active
						? 'shell-bottom-tab-active'
						: ''}"
				>
					{#if icon?.kind === 'component'}
						{@const Icon = icon.component}
						<Icon class={shellIconSizeClass()} />
					{:else if icon?.kind === 'svg'}
						<ShellSvgIcon
							markup={icon.markup}
							rotation={icon.rotation}
							opacity={icon.opacity}
							class={shellIconSizeClass(icon.size)}
						/>
					{:else if icon?.kind === 'url'}
						<img src={icon.url} alt="" class="object-contain {shellIconSizeClass(icon.size)}" />
					{/if}
				</span>
				<span
					class="text-label-small text-[11px] leading-tight sm:text-xs {active
						? 'text-on-surface'
						: 'text-on-surface-variant'}"
				>
					{resolveLocalizedText(tab.label)}
				</span>
			</a>
		{/each}
	</nav>
</div>
