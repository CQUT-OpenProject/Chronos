<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { BottomTabSlotContribution } from '@chronos/core';
	import { HOST_DEFAULT_ICON_THEME_ID, resolveLocalizedText } from '@chronos/core';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';
	import { getAppController, getAppEngine } from '$lib/services/app-engine';

	import { resolveShellIcon, shellIconSizeClass } from '$lib/shell/resolve-shell-icon';
	import ShellSvgIcon from '$lib/shell/ShellSvgIcon.svelte';
	import { haptic } from '$lib/haptic/haptic';
	import Button from '$lib/components/ui/Button.svelte';
	import DisplayOptionsSheet from '$lib/components/timetable/DisplayOptionsSheet.svelte';
	import { DeleteFill } from '$lib/icons';

	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');
	const shellTab = getContext<ShellTabController>('shellTab');
	const controller = getAppController();

	const sortedTabs = $derived(controller.getSlots('shell.bottom-bar.tab'));
	const activeTabId = $derived(shellTab.activeTabId);
	const isEditing = $derived(Boolean(timetableScreen?.state.isEditing));
	const isDragging = $derived(Boolean(timetableScreen?.interaction.isDragging));
	const isDragOverDeleteZone = $derived(Boolean(timetableScreen?.interaction.drag?.overDeleteZone));

	let displayOptionsOpen = $state(false);

	$effect(() => {
		if (!isEditing) {
			displayOptionsOpen = false;
		}
	});

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
		if (timetableScreen?.state.isEditing && tab.hostPanel !== 'timetable') {
			timetableScreen.setEditing(false);
		}
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

<div
	class="bottom-bar w-full flex-col justify-center"
	class:timetable-delete-zone={isEditing && isDragging}
	class:timetable-delete-zone--active={isEditing && isDragging && isDragOverDeleteZone}
	aria-label={isEditing && isDragging ? hostT('timetable.deleteWeek.zoneAria') : undefined}
>
	{#if isEditing}
		<div class="edit-bottom-bar relative h-full w-full max-w-md">
			<div
				class="edit-bottom-bar-layer edit-bottom-bar-controls h-full w-full {isDragging
					? 'edit-bottom-bar-controls--dragging'
					: ''} {isDragOverDeleteZone ? 'edit-bottom-bar-layer--hidden' : ''}"
				aria-hidden={isDragOverDeleteZone}
			>
				<Button
					variant="outlined"
					class="edit-bottom-bar-action min-w-0"
					onclick={() => {
						haptic.light();
						goto(resolve('/timetable/details'));
					}}
				>
					{hostT('timetable.edit.aria')}
				</Button>
				<div class="edit-bottom-bar-trash-slot" aria-hidden={!isDragging}>
					<div
						class="edit-bottom-bar-trash flex items-center justify-center rounded-full"
						role="img"
						aria-hidden="true"
					>
						<DeleteFill class="size-6 text-error/70" aria-hidden="true" />
					</div>
				</div>
				<Button
					variant="outlined"
					class="edit-bottom-bar-action min-w-0"
					onclick={() => {
						haptic.light();
						displayOptionsOpen = true;
					}}
				>
					{hostT('timetable.details.section.display')}
				</Button>
			</div>
			<div
				class="edit-bottom-bar-layer edit-bottom-bar-delete-hint flex h-full w-full items-center justify-center gap-2 px-4 {isDragOverDeleteZone
					? 'edit-bottom-bar-delete-hint--active'
					: ''}"
				role="status"
				aria-live="polite"
				aria-hidden={!isDragOverDeleteZone}
				aria-label={hostT('timetable.deleteWeek.dropHint')}
			>
				<DeleteFill
					class="edit-bottom-bar-delete-icon size-6 shrink-0 text-error"
					aria-hidden="true"
				/>
				<span class="edit-bottom-bar-delete-text text-label-large truncate font-medium text-error">
					{hostT('timetable.deleteWeek.dropHint')}
				</span>
			</div>
		</div>
	{:else}
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
	{/if}
</div>

<DisplayOptionsSheet bind:open={displayOptionsOpen} />

<style>
	.bottom-bar {
		transition: background-color 240ms cubic-bezier(0.2, 0, 0, 1);
	}

	.bottom-bar.timetable-delete-zone--active {
		background-color: color-mix(
			in srgb,
			var(--color-error) 14%,
			var(--shell-bottom-bar-bg, var(--color-surface-container))
		);
	}

	.edit-bottom-bar {
		display: grid;
	}

	.edit-bottom-bar-layer {
		grid-area: 1 / 1;
		transition:
			opacity 240ms cubic-bezier(0.2, 0, 0, 1),
			transform 240ms cubic-bezier(0.2, 0, 0, 1),
			filter 240ms cubic-bezier(0.2, 0, 0, 1);
		will-change: opacity, transform, filter;
	}

	.edit-bottom-bar-layer--hidden {
		opacity: 0;
		transform: scale(0.96);
		filter: blur(3px);
		pointer-events: none;
	}

	.edit-bottom-bar-controls {
		display: grid;
		align-items: center;
		column-gap: 0.5rem;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
	}

	.edit-bottom-bar-action {
		min-width: 0;
		transition:
			background-color 150ms ease,
			border-color 150ms ease,
			opacity 150ms ease;
	}

	.edit-bottom-bar-trash-slot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 0;
		min-width: 0;
		overflow: hidden;
		pointer-events: none;
		transition: width 200ms cubic-bezier(0.2, 0, 0, 1) 40ms;
	}

	.edit-bottom-bar-controls--dragging .edit-bottom-bar-trash-slot {
		width: 3rem;
		transition: width 240ms cubic-bezier(0.2, 0, 0, 1);
	}

	.edit-bottom-bar-trash {
		width: 3rem;
		height: 3rem;
		flex-shrink: 0;
		opacity: 0;
		transform: scale(0.72);
		transform-origin: center;
		transition:
			opacity 100ms cubic-bezier(0.4, 0, 1, 1),
			transform 120ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.edit-bottom-bar-controls--dragging .edit-bottom-bar-trash {
		opacity: 1;
		transform: scale(1);
		transition:
			opacity 120ms cubic-bezier(0.2, 0, 0, 1) 20ms,
			transform 180ms cubic-bezier(0.22, 1.12, 0.36, 1);
	}

	.edit-bottom-bar-delete-hint {
		opacity: 0;
		transform: scale(0.96);
		pointer-events: none;
	}

	.edit-bottom-bar-delete-hint--active {
		opacity: 1;
		transform: scale(1);
		pointer-events: auto;
	}

	.edit-bottom-bar-delete-text {
		transform: translateY(6px);
		opacity: 0;
		transition:
			transform 280ms cubic-bezier(0.2, 0, 0, 1),
			opacity 220ms cubic-bezier(0.2, 0, 0, 1);
	}

	.edit-bottom-bar-delete-hint--active .edit-bottom-bar-delete-text {
		transform: translateY(0);
		opacity: 1;
		transition-delay: 50ms;
	}

	.edit-bottom-bar-delete-icon {
		transform: scale(0.85);
		opacity: 0;
		transition:
			transform 320ms cubic-bezier(0.34, 1.35, 0.64, 1),
			opacity 200ms cubic-bezier(0.2, 0, 0, 1);
	}

	.edit-bottom-bar-delete-hint--active .edit-bottom-bar-delete-icon {
		transform: scale(1.1);
		opacity: 1;
		transition-delay: 20ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.bottom-bar,
		.edit-bottom-bar-layer,
		.edit-bottom-bar-trash-slot,
		.edit-bottom-bar-trash,
		.edit-bottom-bar-delete-text,
		.edit-bottom-bar-delete-icon {
			transition-duration: 1ms !important;
		}

		.edit-bottom-bar-layer--hidden {
			filter: none;
		}
	}
</style>
