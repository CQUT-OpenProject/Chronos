<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { timetableDayLabel } from '$lib/timetable/day-labels';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { dayOfWeekFromIso } from '@chronos/core';
	import { getContext } from 'svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import { TimetableWallpaperLayer } from '@chronos/ui-kit';
	import { haptic } from '$lib/haptic/haptic';
	import { createCapsulePagerPreview } from '$lib/timetable/capsule-pager-preview';
	import TimetableWeekSwiper from './TimetableWeekSwiper.svelte';
	import TimetableCapsuleIndicator from './TimetableCapsuleIndicator.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';

	let {
		screen,
		active = true,
		onCourseClick
	}: {
		screen: TimetableScreenController;
		active?: boolean;
		onCourseClick: (courseId: string) => void;
	} = $props();

	const screenState = $derived(screen.state);
	const shell = getContext<AppShellController>('appShell');

	const coursePalette = $derived(shell.appearance.coursePalette);
	const hasDynamicColorBackground = $derived(shell.state.hasDynamicColorBackground);
	const dynamicColorUri = $derived(shell.state.dynamicColorUri);
	const layoutMode = $derived(shell.controller.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(
		shell.controller.userPreferences?.capsuleCornerStyle ?? 'sharp'
	);

	const pendingWeekDelete = $derived(screen.pendingWeekDelete);
	let weekDeleteSheetOpen = $state(false);
	const pagerPreview = createCapsulePagerPreview();

	const displayedWeekNumber = $derived(screenState.displayedWeek);
	const headerTodayLabel = $derived(
		displayedWeekNumber === screenState.academicWeek
			? timetableDayLabel(dayOfWeekFromIso(screenState.today))
			: ''
	);
	const weekLabel = $derived(
		hostT('timetable.week.label', {
			week: displayedWeekNumber,
			today: headerTodayLabel ? ` ${headerTodayLabel}` : ''
		})
	);

	$effect(() => {
		if (pendingWeekDelete) weekDeleteSheetOpen = true;
	});

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !screenState.isEditing) return;
		if (event.defaultPrevented) return;
		const target = event.target;
		if (
			target instanceof Element &&
			target.closest('[data-dialog-content], [data-dialog-overlay]')
		) {
			return;
		}
		haptic.light();
		screen.setEditing(false);
	}

	$effect(() => {
		if (!active && screenState.isEditing) {
			screen.setEditing(false);
		}
	});
</script>

<svelte:window onkeydown={active ? onWindowKeydown : undefined} />

<div class="relative flex h-[calc(100dvh-var(--bottom-bar-height))] flex-col">
	<TopAppBar class="shrink-0">
		{#snippet titleSnippet()}
			<div class="flex min-h-0 flex-1 items-center py-0.5 text-left sm:py-1" aria-label={weekLabel}>
				<p
					class="text-title-large truncate text-base leading-tight font-bold sm:text-lg md:text-xl"
				>
					{weekLabel}
				</p>
			</div>
		{/snippet}
	</TopAppBar>

	<TimetableWallpaperLayer
		wallpaperUri={hasDynamicColorBackground ? dynamicColorUri : null}
		blurred={screenState.isEditing}
	>
		{#key screenState.currentTimetable?.id}
			<TimetableWeekSwiper
				{screen}
				{active}
				hasDynamicBackground={hasDynamicColorBackground}
				{coursePalette}
				{layoutMode}
				{capsuleCornerStyle}
				{onCourseClick}
				{pagerPreview}
			/>
		{/key}
	</TimetableWallpaperLayer>

	{#if !screenState.isEditing && screenState.currentTimetable}
		<TimetableCapsuleIndicator {screen} {pagerPreview} />
	{/if}
</div>

{#if pendingWeekDelete}
	<BottomSheet
		bind:open={weekDeleteSheetOpen}
		showHandle={false}
		onOpenChangeComplete={(isOpen) => {
			if (!isOpen) screen.cancelWeekDelete();
		}}
		title={hostT('timetable.deleteWeek.title')}
		description={hostT('timetable.deleteWeek.desc', {
			name: pendingWeekDelete.course.name,
			week: pendingWeekDelete.week
		})}
	>
		{#snippet footer()}
			<Button variant="text" onclick={() => (weekDeleteSheetOpen = false)}>
				{hostT('common.cancel')}
			</Button>
			<Button variant="filled" onclick={() => void screen.confirmWeekDelete()}>
				{hostT('common.delete')}
			</Button>
		{/snippet}
	</BottomSheet>
{/if}
