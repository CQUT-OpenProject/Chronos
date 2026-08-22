<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { BottomTabSlotContribution } from '@chronos/core';
	import { PALETTE_MODE_VIBRANT } from '@chronos/core';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { toAppPathname } from '$lib/navigation/app-pathname';
	import { getAppController, getAppEngine } from '$lib/services/app-engine';
	import { resolveEffectiveThemeId } from '$lib/appearance/apply-active-theme';
	import { resolveShellIcon } from '$lib/shell/resolve-shell-icon';
	import { haptic } from '$lib/haptic/haptic';

	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');
	const controller = getAppController();

	const sortedTabs = $derived.by(() => {
		void controller.slotVersion;
		const rawTabs = controller.getSlots('shell.bottom-bar.tab');
		return [...rawTabs].sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
	});

	const appPathname = $derived(toAppPathname(page.url.pathname));

	function isActive(href: string) {
		if (href === '/') return appPathname === '/';
		return appPathname.startsWith(href);
	}

	function resolveText(text: string | (() => string) | undefined): string {
		if (!text) return '';
		return typeof text === 'function' ? text() : text;
	}

	function resolveTabIcon(tab: BottomTabSlotContribution, active: boolean) {
		void controller.activeThemeId;
		void controller.userPreferences;

		const engine = getAppEngine();
		const paletteMode = controller.userPreferences?.paletteMode ?? PALETTE_MODE_VIBRANT;
		const effectiveThemeId = resolveEffectiveThemeId(engine, controller.activeThemeId, paletteMode);
		const themeOverride = engine.themes.getTheme(effectiveThemeId)?.shell?.bottomTabIcons?.[tab.id];

		const iconRef = active
			? (themeOverride?.iconFill ?? themeOverride?.icon ?? tab.iconFill ?? tab.icon)
			: (themeOverride?.icon ?? tab.icon);

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
	<nav aria-label="主导航" class="flex h-full w-full max-w-md items-center justify-around">
		{#each sortedTabs as tab (tab.id)}
			{@const active = isActive(tab.href)}
			{@const Icon = resolveTabIcon(tab, active)}
			<a
				href={resolve(tab.href as any)}
				data-sveltekit-preload-data="off"
				aria-current={active ? 'page' : undefined}
				class="flex h-full min-h-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-0.5 text-on-surface-variant transition-colors hover:text-on-surface sm:gap-1 sm:py-1"
				onclick={(e) => handleTabClick(e, tab)}
			>
				<span
					aria-hidden="true"
					class="flex h-7 w-12 items-center justify-center rounded-full transition-colors sm:h-8 sm:w-14 {active
						? 'shell-bottom-tab-active'
						: ''}"
				>
					{#if Icon}
						<Icon class="size-[22px] sm:size-6" />
					{/if}
				</span>
				<span
					class="m3-label-small text-[11px] leading-tight sm:text-xs {active
						? 'text-on-surface'
						: 'text-on-surface-variant'}"
				>
					{resolveText(tab.label)}
				</span>
			</a>
		{/each}
	</nav>
</div>
