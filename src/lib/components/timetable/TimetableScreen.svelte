<script lang="ts">
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import type { TimetableGridModel } from '$lib/models/presentation';
	import { timetableDayLabel } from '$lib/timetable/day-labels';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { getContext } from 'svelte';
	import { EditNote } from '$lib/icons';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TimetableWeekSwiper from './TimetableWeekSwiper.svelte';

	let {
		screen,
		onEditTimetableDetails,
		onCourseClick,
		onCourseLongClick
	}: {
		screen: TimetableScreenController;
		onEditTimetableDetails: () => void;
		onCourseClick: (courseId: string) => void;
		onCourseLongClick: (courseId: string) => void;
	} = $props();

	const screenState = $derived(screen.state);
	const shell = getContext<AppShellController>('appShell');
	const startWeek = $derived(screenState.startWeek);
	const endWeek = $derived(screenState.endWeek);
	const isDark = $derived(shell.state.isDark);
	const hasWallpaper = $derived(Boolean(screenState.appState.wallpaperUri));

	let weekSliderVisible = $state(false);
	let dragWeek = $state(0);

	const weekRangeText = $derived(
		formatWeekRange(screenState.weekGridModels.get(screenState.displayedWeek))
	);
	const headerTodayLabel = $derived(
		screenState.displayedWeek === screenState.academicWeek
			? timetableDayLabel(dayOfWeekFromIso(screenState.today))
			: ''
	);

	function onHeaderTap() {
		if (weekSliderVisible) {
			weekSliderVisible = false;
			return;
		}
		screen.jumpToCurrentWeek();
	}

	function onHeaderLongPress() {
		if (startWeek >= endWeek) return;
		dragWeek = screenState.displayedWeek;
		weekSliderVisible = true;
	}

	function onSliderCommit() {
		weekSliderVisible = false;
	}

	function formatWeekRange(gridModel: TimetableGridModel | undefined) {
		const days = gridModel?.visibleDays ?? [];
		const first = days[0]?.date;
		const last = days.at(-1)?.date;
		if (!first || !last) return formatIsoDate(screenState.today);
		return `${formatShortDate(first)} - ${formatShortDate(last)}`;
	}

	function formatShortDate(iso: string) {
		const [, month, day] = iso.split('-');
		return `${Number(month)}/${Number(day)}`;
	}

	function formatIsoDate(iso: string) {
		const [year, month, day] = iso.split('-');
		return `${year}/${Number(month)}/${Number(day)}`;
	}

	function dayOfWeekFromIso(iso: string) {
		const date = new Date(`${iso}T12:00:00`);
		const jsDay = date.getDay();
		return jsDay === 0 ? 7 : jsDay;
	}
</script>

<div class="flex h-[calc(100dvh-var(--spacing-tabbar)-var(--tabbar-safe))] flex-col">
	<TopAppBar class="shrink-0">
		{#snippet titleSnippet()}
			<div
				class="flex min-h-16 min-w-0 flex-1 cursor-pointer flex-col justify-center select-none"
				role="button"
				tabindex="0"
				onclick={onHeaderTap}
				onkeydown={(event) => event.key === 'Enter' && onHeaderTap()}
				oncontextmenu={(event) => {
					event.preventDefault();
					onHeaderLongPress();
				}}
			>
				{#if weekSliderVisible && startWeek < endWeek}
					<Slider
						bind:value={dragWeek}
						min={startWeek}
						max={endWeek}
						step={1}
						onValueChange={(week) => screen.setDisplayedWeek(week)}
						onValueCommit={onSliderCommit}
					/>
					<p class="text-sm font-semibold">第 {dragWeek} 周</p>
				{:else}
					<p class="truncate text-xl leading-7 font-bold">{weekRangeText}</p>
					<p class="text-sm text-on-surface-variant">
						第 {screenState.displayedWeek} 周{headerTodayLabel ? ` ${headerTodayLabel}` : ''}
					</p>
				{/if}
			</div>
		{/snippet}
		{#snippet actions()}
			<button
				type="button"
				class="flex items-center justify-center rounded-full p-1.5 text-on-surface-variant hover:bg-surface-variant"
				aria-label="编辑课表"
				onclick={() => {
					navigator.vibrate?.(10);
					onEditTimetableDetails();
				}}
			>
				<EditNote class="size-[22px]" />
			</button>
		{/snippet}
	</TopAppBar>

	<div class="relative min-h-0 flex-1">
		{#if hasWallpaper && screenState.appState.wallpaperUri}
			<div
				class="absolute inset-0 bg-cover bg-center"
				style:background-image="url('{screenState.appState.wallpaperUri}')"
				style:opacity={isDark ? 0.72 : 0.88}
			></div>
		{/if}

		{#key screenState.appState.currentTimetable?.id}
			<TimetableWeekSwiper {screen} {hasWallpaper} {isDark} {onCourseClick} {onCourseLongClick} />
		{/key}
	</div>
</div>
