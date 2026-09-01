<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { getContext } from 'svelte';
	import type { BottomTabSlotContribution } from '@chronos/core';
	import { HOST_DEFAULT_ICON_THEME_ID, resolveLocalizedText } from '@chronos/core';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';
	import { getAppController, getAppEngine } from '$lib/services/app-engine';

	import { resolveShellIcon, shellIconSizeClass } from '$lib/shell/resolve-shell-icon';
	import ShellSvgIcon from '$lib/shell/ShellSvgIcon.svelte';
	import { haptic } from '$lib/haptic/haptic';

	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');
	const shellTab = getContext<ShellTabController>('shellTab');
	const controller = getAppController();

	const sortedTabs = $derived(controller.getSlots('shell.bottom-bar.tab'));
	const activeTabId = $derived(shellTab.activeTabId);

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
		if (tab.hostPanel === 'timetable' && activeTabId === tab.id && timetableScreen) {
			timetableScreen.jumpToCurrentWeek();
			return;
		}
		shellTab.setActiveTab(tab.id);
	}
</script>

<div class="bottom-bar w-full flex-col justify-center">
	<nav
		aria-label={hostT('ui.nav.main')}
		class="flex h-full w-full max-w-md items-center justify-around"
	>
		{#each sortedTabs as tab (tab.id)}
			{@const active = activeTabId === tab.id}
			{@const icon = resolveTabIcon(tab, active)}
			<button
				type="button"
				role="tab"
				aria-selected={active}
				class="flex h-full min-h-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-0 bg-transparent py-0.5 text-on-surface-variant transition-colors hover:text-on-surface sm:gap-1 sm:py-1"
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
			</button>
		{/each}
	</nav>
</div>
