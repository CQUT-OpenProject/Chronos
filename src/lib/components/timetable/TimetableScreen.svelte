<script lang="ts">
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { ThemeMode } from '$lib/models/app-state';
	import type { TimetableGridModel } from '$lib/models/presentation';
	import { timetableDayLabel } from '$lib/timetable/timetable-grid-logic';
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
	const timetable = $derived(screenState.appState.currentTimetable);
	const startWeek = $derived(timetable?.academicConfig.startWeek ?? 1);
	const endWeek = $derived(timetable?.academicConfig.endWeek ?? 1);
	const weekCount = $derived(Math.max(1, endWeek - startWeek + 1));
	const weeks = $derived(Array.from({ length: weekCount }, (_, index) => startWeek + index));
	const isDark = $derived(resolveDark(screenState.appState.themeMode));
	const hasWallpaper = $derived(Boolean(screenState.appState.wallpaperUri));

	let weekSliderVisible = $state(false);
	let dragWeek = $state<number | null>(null);
	const sliderWeek = $derived(dragWeek ?? screenState.displayedWeek);

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
			dragWeek = null;
			return;
		}
		screen.jumpToCurrentWeek();
	}

	function onHeaderLongPress() {
		if (startWeek >= endWeek) return;
		dragWeek = screenState.displayedWeek;
		weekSliderVisible = true;
	}

	function onSliderInput(event: Event) {
		const value = Number((event.currentTarget as HTMLInputElement).value);
		dragWeek = value;
		screen.setDisplayedWeek(value);
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

	function resolveDark(themeMode: ThemeMode) {
		if (themeMode === ThemeMode.DARK) return true;
		if (themeMode === ThemeMode.LIGHT) return false;
		return (
			typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
		);
	}
</script>

<div class="flex h-[calc(100dvh-4rem)] flex-col {isDark ? 'dark' : ''}">
	<header
		class="shrink-0 border-b border-zinc-200/80 bg-white/60 px-3 py-2 backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/60"
	>
		<div class="flex items-center gap-2">
			<div
				class="min-w-0 flex-1"
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
					<input
						type="range"
						min={startWeek}
						max={endWeek}
						step={1}
						value={sliderWeek}
						oninput={onSliderInput}
						onchange={() => {
							weekSliderVisible = false;
							dragWeek = null;
						}}
						class="w-full"
					/>
					<p class="text-sm font-semibold">第 {sliderWeek} 周</p>
				{:else}
					<p class="truncate text-lg font-bold">{weekRangeText}</p>
					<p class="text-xs text-zinc-500 dark:text-zinc-400">
						第 {screenState.displayedWeek} 周{headerTodayLabel ? ` ${headerTodayLabel}` : ''}
					</p>
				{/if}
			</div>
			<button
				type="button"
				class="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
				onclick={onEditTimetableDetails}
			>
				编辑
			</button>
		</div>
	</header>

	<div class="relative min-h-0 flex-1">
		{#if hasWallpaper && screenState.appState.wallpaperUri}
			<div
				class="absolute inset-0 bg-cover bg-center"
				style:background-image="url('{screenState.appState.wallpaperUri}')"
				style:opacity={isDark ? 0.72 : 0.88}
			></div>
		{/if}

		{#key screenState.appState.currentTimetable?.id}
			<TimetableWeekSwiper
				{screen}
				{weeks}
				{startWeek}
				{hasWallpaper}
				{isDark}
				{onCourseClick}
				{onCourseLongClick}
			/>
		{/key}
	</div>
</div>
