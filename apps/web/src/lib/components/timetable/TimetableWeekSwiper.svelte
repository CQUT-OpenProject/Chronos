<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import type { CapsuleCornerStyle, TimetableLayoutMode } from '@chronos/core';
	import type { CoursePaletteEntry } from '@chronos/core';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import {
		committedWeekFromScroll,
		pagerPreviewWeekFromScroll,
		scrollOffsetFromWeek,
		shouldPaintPagerWeek,
		WEEK_PAGER_NEIGHBOR_RADIUS
	} from '$lib/timetable/week-navigation';
	import { createWeekPagerSnap } from '$lib/timetable/week-pager-snap';
	import type { CapsulePagerPreview } from '$lib/timetable/capsule-pager-preview';
	import TimetableGrid from './TimetableGrid.svelte';

	const PAGER_SETTLE_MS = 90;
	const PAGER_SUPPRESS_MS = 150;

	let {
		screen,
		hasDynamicBackground,
		coursePalette,
		layoutMode,
		capsuleCornerStyle = 'sharp',
		active = true,
		onCourseClick,
		pagerPreview
	}: {
		screen: TimetableScreenController;
		hasDynamicBackground: boolean;
		coursePalette: readonly CoursePaletteEntry[];
		layoutMode: TimetableLayoutMode;
		capsuleCornerStyle?: CapsuleCornerStyle;
		active?: boolean;
		onCourseClick: (courseId: string) => void;
		pagerPreview?: CapsulePagerPreview;
	} = $props();

	const shell = getContext<AppShellController>('appShell');
	const screenState = $derived(screen.state);
	const weeks = $derived(screenState.weeks);
	const periodHighlightEnabled = $derived(
		shell.controller.userPreferences?.currentPeriodHighlightEnabled ?? false
	);
	const allowPagerTouch = $derived(!screenState.isEditing);

	let pagerEl = $state<HTMLDivElement | undefined>();
	let pagerReady = $state(false);
	let paintAdjacent = $state(false);

	let pagerGesture = false;
	let gestureStartWeek: number | null = null;
	let suppressScrollUntil = 0;
	let settleTimer = 0;
	let pagerSnap: ReturnType<typeof createWeekPagerSnap> | undefined;
	let paintWeek = $state(0);

	// 同步写入 preview，勿改 RAF 合并：与 displayedWeek 须在同一事件内到达指示器，否则点阵会先落到整数周。
	function setPagerPreview(week: number) {
		pagerPreview?.setPreview(week);
	}

	function clearPagerPreview() {
		pagerPreview?.clearPreview();
	}

	function syncPagerScroll(node: HTMLDivElement): boolean {
		if (pagerGesture) return true;
		const width = node.clientWidth;
		if (width <= 0) return false;
		const target = scrollOffsetFromWeek(screen.state.displayedWeek, width, screen.state.startWeek);
		if (Math.abs(node.scrollLeft - target) >= 2) {
			suppressScrollUntil = Date.now() + PAGER_SUPPRESS_MS;
			node.scrollTo({ left: target, behavior: 'instant' });
		}
		return true;
	}

	function setDisplayedWeekDuringGesture(week: number) {
		if (week === screen.state.displayedWeek) return;
		screen.setDisplayedWeek(week);
	}

	function settlePager(source: 'timeout' | 'scrollend') {
		if (source === 'timeout') {
			settleTimer = 0;
		}
		const wasGesture = pagerGesture;
		const gestureStart = gestureStartWeek;
		const node = pagerEl;
		// timeout 路径勿清空 preview、勿重置 pagerGesture：滑动未结束时需要保留小数 preview 做点阵交叉淡变。
		// scrollend 后再统一收尾。
		if (source === 'scrollend') {
			pagerGesture = false;
		}
		// 勿在 !wasGesture 时 clearPagerPreview：多余的 scrollend 会在滑动中误清 preview。
		if (!wasGesture) {
			return;
		}
		if (node) {
			const week = committedWeekFromScroll(
				node.scrollLeft,
				node.clientWidth,
				screen.state.startWeek,
				screen.state.endWeek
			);
			if (week != null) {
				setDisplayedWeekDuringGesture(week);
				if (source === 'scrollend' && gestureStart != null && week !== gestureStart) {
					trackEvent('timetable_week_swipe');
				}
			}
		}
		if (source === 'scrollend') {
			gestureStartWeek = null;
			clearPagerPreview();
		}
	}

	function scheduleSettle() {
		window.clearTimeout(settleTimer);
		settleTimer = window.setTimeout(() => settlePager('timeout'), PAGER_SETTLE_MS);
	}

	function onPagerScrollEnd() {
		if (pagerSnap?.isAnimating) return;
		window.clearTimeout(settleTimer);
		settleTimer = 0;
		settlePager('scrollend');
	}

	function onPagerScroll(event: Event) {
		const node = event.currentTarget as HTMLDivElement;
		if (Date.now() < suppressScrollUntil) return;

		const { startWeek, endWeek } = screen.state;
		const preview = pagerPreviewWeekFromScroll(
			node.scrollLeft,
			node.clientWidth,
			startWeek,
			endWeek
		);
		if (preview == null) return;

		if (!pagerGesture) {
			pagerGesture = true;
			gestureStartWeek = screen.state.displayedWeek;
			screen.interaction.notePagerFirstMove();
		}

		setPagerPreview(preview);
		paintWeek = Math.round(preview);
		// 滑动中同步提交整数周以更新标题/课表；点阵靠 preview 插值。勿删此行来“修跳变”，根因在 TimetableScreen 的 preview 生命周期。
		setDisplayedWeekDuringGesture(paintWeek);
		scheduleSettle();
	}

	const pagerAttach: Attachment<HTMLDivElement> = (node) => {
		pagerEl = node;
		untrack(() => {
			paintWeek = screen.state.displayedWeek;
			if (syncPagerScroll(node)) pagerReady = true;
		});
		const snap = createWeekPagerSnap(node, onPagerScrollEnd);
		pagerSnap = snap;
		const resizeObserver = new ResizeObserver(() => {
			snap.cancel();
			if (pagerGesture) return;
			untrack(() => syncPagerScroll(node));
			if (node.clientWidth > 0) pagerReady = true;
		});
		resizeObserver.observe(node);
		return () => {
			resizeObserver.disconnect();
			snap.destroy();
			if (pagerSnap === snap) pagerSnap = undefined;
			window.clearTimeout(settleTimer);
			settleTimer = 0;
			gestureStartWeek = null;
			pagerGesture = false;
			clearPagerPreview();
			if (pagerEl === node) pagerEl = undefined;
		};
	};

	$effect(() => {
		const week = screenState.displayedWeek;
		const startWeek = screenState.startWeek;
		void screenState.endWeek;
		void week;
		void startWeek;
		const node = pagerEl;
		// Writing scrollLeft during a fling aborts iOS momentum scrolling.
		if (!node || pagerGesture) return;
		paintWeek = week;
		syncPagerScroll(node);
	});

	$effect(() => {
		if (!active) {
			pagerSnap?.cancel();
			paintAdjacent = false;
			return;
		}
		const frame = requestAnimationFrame(() => {
			paintAdjacent = true;
		});
		return () => cancelAnimationFrame(frame);
	});
</script>

<div
	class="timetable-week-pager"
	class:timetable-week-pager-locked={!allowPagerTouch}
	class:timetable-week-pager-pending={!pagerReady}
	{@attach pagerAttach}
	onscroll={onPagerScroll}
	onscrollend={onPagerScrollEnd}
>
	{#each weeks as week (week)}
		<div class="timetable-week-page">
			{#if shouldPaintPagerWeek(week, paintWeek || screenState.displayedWeek, paintAdjacent, WEEK_PAGER_NEIGHBOR_RADIUS)}
				{@const gridModel = screenState.weekGridModels.get(week)}
				{@const courseModels = screenState.weekCourseDisplayModels.get(week) ?? []}
				{#if gridModel}
					<TimetableGrid
						displayedWeek={week}
						isCurrentWeek={week === screenState.academicWeek}
						currentPeriodIndex={screenState.currentPeriodIndex}
						{periodHighlightEnabled}
						expandedSlots={screenState.expandedSlots}
						onExpandSlot={(slotKey) => screen.expandSlot(slotKey)}
						interaction={screen.interaction}
						{gridModel}
						courseDisplayModels={courseModels}
						{hasDynamicBackground}
						{coursePalette}
						paletteCourses={screenState.currentTimetable?.courses}
						{layoutMode}
						{capsuleCornerStyle}
						onCourseClick={(course) => onCourseClick(course.id)}
						onRequestWeekDelete={(course, week) => screen.requestWeekDelete(course, week)}
					/>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.timetable-week-pager {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 100%;
		flex: 1;
		min-height: 0;
		height: 100%;
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
		touch-action: pan-x pan-y;
	}

	.timetable-week-pager-locked {
		overflow-x: hidden;
		touch-action: pan-y;
	}

	.timetable-week-pager-pending {
		visibility: hidden;
	}

	.timetable-week-page {
		height: 100%;
		overflow: hidden;
		scroll-snap-align: start;
		scroll-snap-stop: normal;
	}
</style>
