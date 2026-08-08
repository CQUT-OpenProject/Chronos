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
	let headerContainerEl = $state<HTMLElement | null>(null);

	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let activePointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let isPressDragging = false;

	const displayedWeekNumber = $derived(weekSliderVisible ? dragWeek : screenState.displayedWeek);
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

	function onPointerDown(e: PointerEvent) {
		if (e.button !== 0 || startWeek >= endWeek) return;
		activePointerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;
		isPressDragging = false;

		const target = e.currentTarget as HTMLElement | null;
		if (target?.setPointerCapture) {
			try {
				target.setPointerCapture(e.pointerId);
			} catch {
				// Ignore
			}
		}

		if (longPressTimer) clearTimeout(longPressTimer);
		longPressTimer = setTimeout(() => {
			navigator.vibrate?.(10);
			dragWeek = screenState.displayedWeek;
			weekSliderVisible = true;
			isPressDragging = true;
			longPressTimer = null;
		}, 350);
	}

	function releaseCapture(pointerId: number) {
		if (headerContainerEl && headerContainerEl.hasPointerCapture(pointerId)) {
			try {
				headerContainerEl.releasePointerCapture(pointerId);
			} catch {
				// Ignore
			}
		}
	}

	function onWindowPointerMove(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;

		if (!isPressDragging) {
			const dx = Math.abs(e.clientX - startX);
			const dy = Math.abs(e.clientY - startY);
			if (dx > 8 || dy > 8) {
				if (longPressTimer) {
					clearTimeout(longPressTimer);
					longPressTimer = null;
				}
				releaseCapture(e.pointerId);
			}
			return;
		}

		e.preventDefault();
		updateWeekFromClientX(e.clientX);
	}

	function onWindowPointerUp(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;
		releaseCapture(e.pointerId);
		activePointerId = null;

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
			onHeaderTap();
		} else if (isPressDragging) {
			isPressDragging = false;
			weekSliderVisible = false;
		}
	}

	function onWindowPointerCancel(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;
		releaseCapture(e.pointerId);
		activePointerId = null;
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		if (isPressDragging) {
			isPressDragging = false;
			weekSliderVisible = false;
		}
	}

	function updateWeekFromClientX(clientX: number) {
		if (!headerContainerEl) return;
		const rect = headerContainerEl.getBoundingClientRect();
		if (rect.width <= 0) return;
		const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		const calculatedWeek = Math.round(startWeek + pct * (endWeek - startWeek));
		const clampedWeek = Math.max(startWeek, Math.min(endWeek, calculatedWeek));
		if (dragWeek !== clampedWeek) {
			dragWeek = clampedWeek;
			screen.setDisplayedWeek(clampedWeek);
		}
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

<svelte:window
	onpointermove={onWindowPointerMove}
	onpointerup={onWindowPointerUp}
	onpointercancel={onWindowPointerCancel}
/>

<div class="flex h-[calc(100dvh-var(--spacing-tabbar)-var(--tabbar-safe))] flex-col">
	<TopAppBar class="shrink-0">
		{#snippet titleSnippet()}
			<div
				bind:this={headerContainerEl}
				class="flex min-h-16 min-w-0 flex-1 cursor-pointer touch-none flex-col justify-center select-none"
				role="button"
				tabindex="0"
				onpointerdown={onPointerDown}
				onkeydown={(event) => event.key === 'Enter' && onHeaderTap()}
				oncontextmenu={(event) => event.preventDefault()}
			>
				<div class="flex h-7 items-center">
					{#if weekSliderVisible && startWeek < endWeek}
						<Slider
							bind:value={dragWeek}
							min={startWeek}
							max={endWeek}
							step={1}
							stops
							onValueChange={(week) => screen.setDisplayedWeek(week)}
							onValueCommit={onSliderCommit}
						/>
					{:else}
						<p class="truncate text-xl leading-none font-bold">{weekRangeText}</p>
					{/if}
				</div>
				<div class="flex h-5 items-center">
					<p class="truncate text-sm leading-none text-on-surface-variant">
						第 {displayedWeekNumber} 周{headerTodayLabel ? ` ${headerTodayLabel}` : ''}
					</p>
				</div>
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
