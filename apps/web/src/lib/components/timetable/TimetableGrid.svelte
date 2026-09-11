<script lang="ts">
	import { tick } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { Attachment } from 'svelte/attachments';
	import {
		ALL_CORNERS_ROUNDED,
		placeCapsules,
		type Course,
		type CoursePaletteEntry,
		type PlacedCourseCapsule,
		type TimetableCourseDisplayModel,
		type TimetableGridModel
	} from '@chronos/core';
	import type { CapsuleCornerStyle, CapsuleCorners, TimetableLayoutMode } from '@chronos/core';
	import MiddleTruncateText from '@chronos/ui-kit/timetable-preview/MiddleTruncateText.svelte';
	import { capsuleCornerAttrs } from '@chronos/ui-kit/timetable/capsule-corners';
	import {
		courseCapsuleInnerWidthPx,
		createFitWidthFontAttachment
	} from '@chronos/ui-kit/utils/fit-width-font.svelte';
	import { timetableDayColumnHeaderLabel } from '$lib/timetable/day-labels';
	import {
		buildCourseCapsuleAriaLabel,
		buildOverlapPlaceholderAriaLabel
	} from '$lib/timetable/course-a11y';
	import {
		calculatePeriodCenterScrollOffset,
		calculatePeriodOffsetByIndex
	} from '$lib/timetable/period-scroll';
	import { getAppController } from '$lib/services/app-engine';
	import { trackEvent } from '$lib/client/analytics';

	import {
		timetableBodyTintClass,
		timetableSidebarTintClass,
		timetableSolidBgClass
	} from '@chronos/ui-kit';
	import { createCourseCardHandlers } from '$lib/timetable/course-card-gesture';
	import { createGridGestureHandlers } from '$lib/timetable/grid-gesture';
	import { rearrangeCourseSchedule } from '$lib/timetable/course-reorder';
	import {
		type TimetableDragSession,
		type TimetableInteraction
	} from '$lib/timetable/timetable-interaction.svelte';
	import { haptic } from '$lib/haptic/haptic';

	const SCROLL_ROW_HEIGHT = '5.5rem';
	const SIDEBAR_WIDTH_REM = 3.25;

	function estimateGridBodyWidth(): number {
		if (typeof window === 'undefined') return 0;
		const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		return Math.max(0, window.innerWidth - SIDEBAR_WIDTH_REM * rem);
	}

	interface Props {
		displayedWeek: number;
		isCurrentWeek: boolean;
		currentPeriodIndex: number | null;
		periodHighlightEnabled?: boolean;
		expandedSlots?: ReadonlySet<string>;
		onExpandSlot?: (slotKey: string) => void;
		gridModel: TimetableGridModel;
		courseDisplayModels: TimetableCourseDisplayModel[];
		hasDynamicBackground: boolean;
		coursePalette: readonly CoursePaletteEntry[];
		paletteCourses?: { name: string }[];
		layoutMode?: TimetableLayoutMode;
		capsuleCornerStyle?: CapsuleCornerStyle;
		onCourseClick?: (course: Course) => void;
		onRequestWeekDelete?: (course: Course, week: number) => void;
		interaction: TimetableInteraction;
	}

	let {
		displayedWeek,
		isCurrentWeek,
		currentPeriodIndex,
		periodHighlightEnabled = false,
		expandedSlots: propExpandedSlots,
		onExpandSlot,
		gridModel,
		courseDisplayModels,
		hasDynamicBackground,
		coursePalette,
		paletteCourses,
		layoutMode = 'fixed',
		capsuleCornerStyle = 'sharp',
		onCourseClick,
		onRequestWeekDelete,
		interaction
	}: Props = $props();

	const effectivePeriodIndex = $derived(periodHighlightEnabled ? currentPeriodIndex : null);
	const isEditing = $derived(interaction.isEditing);
	const dragState = $derived(interaction.drag?.week === displayedWeek ? interaction.drag : null);

	const controller = getAppController();

	let scrollContainer = $state<HTMLDivElement | undefined>();
	let gridBodyEl = $state<HTMLDivElement | undefined>();
	let bodyViewportHeight = $state(0);
	let gridBodyWidth = $state(estimateGridBodyWidth());
	let centeredFor = $state<string | null>(null);
	let internalExpandedSlots = $state(new Set<string>());

	interface DragSettlePreview {
		courseId: string;
		targetColIndex: number;
		targetDayOfWeek: number;
		targetStartPeriod: number;
		course: Course;
		placed: PlacedCourseCapsule;
	}

	let settling = $state<DragSettlePreview | null>(null);

	const concealedCourseId = $derived(dragState?.course.id ?? settling?.courseId ?? null);

	const dropPreview = $derived(
		dragState && !dragState.overDeleteZone
			? {
					targetColIndex: dragState.targetColIndex,
					targetStartPeriod: dragState.targetStartPeriod,
					course: dragState.course,
					placed: dragState.placed
				}
			: settling
				? {
						targetColIndex: settling.targetColIndex,
						targetStartPeriod: settling.targetStartPeriod,
						course: settling.course,
						placed: settling.placed
					}
				: null
	);

	const effectiveExpandedSlots = $derived(propExpandedSlots ?? internalExpandedSlots);
	const visibleDayCount = $derived(gridModel.visibleDays.length);
	const columnWidthPx = $derived(visibleDayCount > 0 ? gridBodyWidth / visibleDayCount : 0);

	const placements = $derived(
		placeCapsules({
			courseDisplayModels,
			visibleDays: gridModel.visibleDays,
			columnWidthPx,
			expandedSlotKeys: effectiveExpandedSlots,
			coursePalette,
			paletteCourses,
			layoutMode,
			capsuleCornerStyle
		})
	);

	const solidBgClass = $derived(timetableSolidBgClass(hasDynamicBackground));
	const isFitLayout = $derived(layoutMode === 'compact');
	const capsuleLayoutReady = $derived(!isFitLayout || bodyViewportHeight > 0);
	const rowHeightCss = $derived.by(() => {
		if (!isFitLayout || bodyViewportHeight <= 0 || gridModel.displayedPeriodCount <= 0) {
			return SCROLL_ROW_HEIGHT;
		}
		return `${bodyViewportHeight / gridModel.displayedPeriodCount}px`;
	});
	const rowHeightInPx = $derived.by(() => {
		if (isFitLayout && bodyViewportHeight > 0 && gridModel.displayedPeriodCount > 0) {
			return bodyViewportHeight / gridModel.displayedPeriodCount;
		}
		if (typeof window === 'undefined') return 88;
		const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		return 5.5 * rem;
	});

	function scrollToCurrentPeriod(smooth = false): boolean {
		if (isFitLayout || !isCurrentWeek || !scrollContainer || bodyViewportHeight <= 0) {
			return false;
		}
		const target = effectivePeriodIndex;
		if (target == null) return false;

		const periodElements = scrollContainer.querySelectorAll<HTMLElement>('aside > div');
		const targetEl =
			target >= 1 && target <= periodElements.length ? periodElements[target - 1] : null;

		const targetOffset = targetEl
			? calculatePeriodCenterScrollOffset({
					periodTop: targetEl.offsetTop,
					periodHeight: targetEl.offsetHeight,
					viewportHeight: bodyViewportHeight,
					scrollHeight: scrollContainer.scrollHeight
				})
			: calculatePeriodOffsetByIndex({
					periodIndex: target,
					rowHeightPx:
						5.5 * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16),
					viewportHeight: bodyViewportHeight,
					scrollHeight: scrollContainer.scrollHeight
				});

		if (targetOffset === 0) {
			scrollContainer.scrollTop = 0;
			return true;
		}

		if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
			return false;
		}

		if (smooth) {
			scrollContainer.scrollTo({ top: targetOffset, behavior: 'smooth' });
		} else {
			scrollContainer.scrollTop = targetOffset;
		}
		return true;
	}

	$effect(() => {
		if (isFitLayout) {
			centeredFor = null;
			return;
		}
		if (!isCurrentWeek) return;

		const centerKey = `${displayedWeek}-${isCurrentWeek}`;
		if (centeredFor === centerKey || !scrollContainer || bodyViewportHeight === 0) return;

		const success = scrollToCurrentPeriod(false);
		if (success) {
			centeredFor = centerKey;
		} else {
			const rafId = requestAnimationFrame(() => {
				if (scrollToCurrentPeriod(false)) {
					centeredFor = centerKey;
				}
			});
			return () => cancelAnimationFrame(rafId);
		}
	});

	function dayOfMonth(date: string): string {
		return date.slice(8, 10);
	}

	function expandSlot(key: string) {
		trackEvent('timetable_overlap_expand');
		if (onExpandSlot) {
			onExpandSlot(key);
		} else {
			internalExpandedSlots = new Set([...internalExpandedSlots, key]);
		}
	}

	function handleOverlapPointerUp(key: string, event: PointerEvent) {
		const result = interaction.notePointerUp(event);
		if (
			(result?.startedMode === 'view' && result.gesture === 'tap') ||
			(result === null && interaction.isEditing)
		) {
			expandSlot(key);
		}
	}

	function handleOverlapClick(key: string, event: MouseEvent) {
		if (event.detail !== 0) {
			event.preventDefault();
			return;
		}
		expandSlot(key);
	}

	const bodyScrollAttach: Attachment = (node) => {
		const element = node as HTMLDivElement;
		scrollContainer = element;
		bodyViewportHeight = element.clientHeight;
		const observer = new ResizeObserver(() => {
			bodyViewportHeight = element.clientHeight;
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
			if (scrollContainer === element) scrollContainer = undefined;
		};
	};

	const gridBodyWidthAttach: Attachment = (node) => {
		const update = () => {
			gridBodyWidth = node.clientWidth;
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	};

	function capturePointer(event: PointerEvent) {
		const targetEl =
			(event.currentTarget as HTMLElement | null) ??
			(event.target as HTMLElement | null)?.closest<HTMLElement>('.course-capsule');
		if (targetEl && typeof targetEl.setPointerCapture === 'function') {
			try {
				targetEl.setPointerCapture(event.pointerId);
			} catch {
				// ignore if pointer is not capturable
			}
		}
	}

	function startDrag(
		placed: PlacedCourseCapsule,
		event: PointerEvent,
		options: { hapticOnStart?: boolean; persistAfterDrop?: boolean; waitForMove?: boolean } = {}
	) {
		settling = null;
		if (!placed.displayModel.isInDisplayedWeek) return;

		const { hapticOnStart = true, persistAfterDrop = true, waitForMove = false } = options;
		if (hapticOnStart) {
			haptic.light();
		}

		capturePointer(event);

		const initialColIndex = gridModel.visibleDays.findIndex(
			(d) => d.dayOfWeek === placed.course.dayOfWeek
		);

		interaction.beginDrag({
			course: placed.course,
			placed,
			pointerId: event.pointerId,
			week: displayedWeek,
			targetColIndex: initialColIndex >= 0 ? initialColIndex : 0,
			targetDayOfWeek: placed.course.dayOfWeek,
			targetStartPeriod: placed.course.startPeriod,
			persistAfterDrop,
			waitForMove,
			originX: event.clientX,
			originY: event.clientY
		});
	}

	function isPointerOverDeleteZone(clientX: number, clientY: number): boolean {
		const target = document.elementFromPoint(clientX, clientY);
		return target?.closest('.timetable-delete-zone') != null;
	}

	function handleWindowPointerMove(event: PointerEvent) {
		if (!dragState || event.pointerId !== dragState.pointerId) return;
		interaction.notePointerMove(event);

		const overDeleteZone = isPointerOverDeleteZone(event.clientX, event.clientY);
		if (interaction.setDragOverDeleteZone(overDeleteZone)) {
			haptic.selection();
		}

		if (overDeleteZone) {
			if (scrollContainer && !isFitLayout) {
				const containerRect = scrollContainer.getBoundingClientRect();
				const bottomThreshold = containerRect.bottom - 48;
				if (event.clientY > bottomThreshold) {
					const intensity = Math.min(1, (event.clientY - bottomThreshold) / 48);
					scrollContainer.scrollTop += Math.round(intensity * 12);
				}
			}
			return;
		}

		if (gridBodyEl && visibleDayCount > 0 && gridModel.displayedPeriodCount > 0) {
			const gridRect = gridBodyEl.getBoundingClientRect();
			const relX = event.clientX - gridRect.left;
			const relY = event.clientY - gridRect.top;

			const colWidth = gridRect.width / visibleDayCount;
			let colIdx = Math.floor(relX / colWidth);
			colIdx = Math.max(0, Math.min(colIdx, visibleDayCount - 1));
			const targetDay = gridModel.visibleDays[colIdx]?.dayOfWeek ?? dragState.targetDayOfWeek;

			const rowHeight = gridRect.height / gridModel.displayedPeriodCount;
			const span = dragState.course.endPeriod - dragState.course.startPeriod + 1;
			let periodIdx = Math.floor(relY / rowHeight) + 1;
			periodIdx = Math.max(1, Math.min(periodIdx, gridModel.displayedPeriodCount - span + 1));

			if (
				interaction.updateDragTarget({
					targetColIndex: colIdx,
					targetDayOfWeek: targetDay,
					targetStartPeriod: periodIdx
				})
			) {
				haptic.selection();
			}
		}

		if (scrollContainer && !isFitLayout) {
			const containerRect = scrollContainer.getBoundingClientRect();
			const topThreshold = containerRect.top + 48;
			const bottomThreshold = containerRect.bottom - 48;

			if (event.clientY < topThreshold) {
				const intensity = Math.min(1, (topThreshold - event.clientY) / 48);
				scrollContainer.scrollTop -= Math.round(intensity * 12);
			} else if (event.clientY > bottomThreshold) {
				const intensity = Math.min(1, (event.clientY - bottomThreshold) / 48);
				scrollContainer.scrollTop += Math.round(intensity * 12);
			}
		}
	}

	function buildDragUpdate(current: TimetableDragSession): {
		updatedCourses: Course[];
		settling: DragSettlePreview;
	} | null {
		const academicConfig = controller.currentTimetable?.academicConfig;
		const totalWeeks = academicConfig
			? { startWeek: academicConfig.startWeek ?? 1, endWeek: academicConfig.endWeek ?? 20 }
			: undefined;

		const updatedCourses = rearrangeCourseSchedule({
			currentCourses: controller.currentTimetable?.courses ?? [],
			draggedCourseId: current.course.id,
			targetDayOfWeek: current.targetDayOfWeek,
			targetStartPeriod: current.targetStartPeriod,
			currentWeek: displayedWeek,
			totalWeeks,
			displayedPeriodCount: gridModel.displayedPeriodCount
		});

		if (!updatedCourses) return null;

		const span = Math.max(1, current.course.endPeriod - current.course.startPeriod + 1);
		const clampedStart = Math.max(
			1,
			Math.min(current.targetStartPeriod, gridModel.displayedPeriodCount - span + 1)
		);

		const targetColIndex = gridModel.visibleDays.findIndex(
			(day) => day.dayOfWeek === current.targetDayOfWeek
		);

		const targetCourse = updatedCourses.find(
			(course) =>
				(course.id === current.course.id || course.name === current.course.name) &&
				course.dayOfWeek === current.targetDayOfWeek &&
				course.startPeriod === clampedStart &&
				(course.weeks.length === 0 || course.weeks.includes(displayedWeek))
		) ?? {
			...current.course,
			dayOfWeek: current.targetDayOfWeek,
			startPeriod: clampedStart,
			endPeriod: clampedStart + span - 1
		};

		return {
			updatedCourses,
			settling: {
				courseId: targetCourse.id,
				targetColIndex: targetColIndex >= 0 ? targetColIndex : current.targetColIndex,
				targetDayOfWeek: current.targetDayOfWeek,
				targetStartPeriod: clampedStart,
				course: targetCourse,
				placed: current.placed
			}
		};
	}

	async function commitDragSession(current: TimetableDragSession) {
		const update = buildDragUpdate(current);
		if (!update) return;

		settling = update.settling;
		try {
			await controller.saveCurrentTimetableDetails({ courses: update.updatedCourses });
			trackEvent('timetable_course_reorder');
		} catch {
			settling = null;
		} finally {
			await tick();
			settling = null;
		}
	}

	function handleWindowPointerUp(event: PointerEvent) {
		if (!dragState || event.pointerId !== dragState.pointerId) return;
		const current = interaction.endDrag();
		if (!current) return;
		if (current.overDeleteZone) {
			onRequestWeekDelete?.(current.course, displayedWeek);
			return;
		}
		void commitDragSession(current);
	}

	function handleWindowPointerCancel(event: PointerEvent) {
		if (!dragState || event.pointerId !== dragState.pointerId) return;
		interaction.cancelDrag();
	}

	const gridGestureHandlers = createGridGestureHandlers({
		interaction,
		onClickEmpty: () => {
			if (!interaction.isDragging && !interaction.isClickGuarded()) {
				haptic.light();
				interaction.exitEdit();
			}
		}
	});

	$effect(() => {
		if (!settling) return;

		const matched = placements.some((item) => {
			if (item.kind === 'course') {
				return (
					item.course.dayOfWeek === settling.targetDayOfWeek &&
					item.course.startPeriod === settling.targetStartPeriod &&
					item.course.name === settling.course.name
				);
			}
			if (item.kind === 'overlap-placeholder') {
				return (
					item.key.startsWith(`${settling.targetDayOfWeek}:`) &&
					item.geometry.startPeriod <= settling.targetStartPeriod &&
					settling.targetStartPeriod <= item.geometry.endPeriod
				);
			}
			return false;
		});
		if (matched) settling = null;
	});

	$effect(() => {
		if (!dragState) return;

		const preventTouchScroll = (e: TouchEvent) => {
			if (e.cancelable) {
				e.preventDefault();
			}
		};

		window.addEventListener('touchmove', preventTouchScroll, { passive: false });
		return () => {
			window.removeEventListener('touchmove', preventTouchScroll);
		};
	});
</script>

<svelte:window
	onpointermove={dragState ? handleWindowPointerMove : undefined}
	onpointerup={dragState ? handleWindowPointerUp : undefined}
	onpointercancel={dragState ? handleWindowPointerCancel : undefined}
	oncontextmenu={dragState || isEditing ? (e) => e.preventDefault() : undefined}
	ondragstart={(e) => e.preventDefault()}
	ondrop={(e) => e.preventDefault()}
/>

<div
	class="relative flex h-full w-full flex-col select-none {solidBgClass}"
	style="--row-height: {rowHeightCss}; --sidebar-width: 3.25rem"
	onpointerdown={gridGestureHandlers.onpointerdown}
	onpointermove={gridGestureHandlers.onpointermove}
	onpointerup={gridGestureHandlers.onpointerup}
	onpointerleave={gridGestureHandlers.onpointerleave}
	onpointercancel={gridGestureHandlers.onpointercancel}
	ondragstart={(e) => e.preventDefault()}
>
	<div class="flex shrink-0 items-center py-2 {timetableSidebarTintClass(hasDynamicBackground)}">
		<div
			class="text-body-small flex w-[var(--sidebar-width)] flex-col items-center text-center text-on-surface-variant"
		>
			<span>{gridModel.monthLabel}</span>
			<span>{hostT('timetable.grid.monthSuffix')}</span>
		</div>
		<div class="flex min-w-0 flex-1">
			{#each gridModel.visibleDays as day (day.dayOfWeek)}
				<div class="flex min-w-0 flex-1 flex-col items-center">
					<span class="text-body-small max-w-full truncate text-on-surface-variant">
						{timetableDayColumnHeaderLabel(day)}
					</span>
					<div
						class="text-body-medium mt-1 flex size-[26px] items-center justify-center rounded-full {day.isToday
							? 'bg-brand text-on-primary'
							: day.holiday
								? 'text-on-surface-variant'
								: 'text-on-surface'}"
					>
						{dayOfMonth(day.date)}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div
		{@attach bodyScrollAttach}
		class="min-h-0 flex-1 {isFitLayout
			? 'overflow-hidden'
			: 'overflow-y-auto'} {timetableBodyTintClass(hasDynamicBackground)}"
		role="region"
		aria-label={hostT('timetable.grid.aria')}
	>
		<div class="flex" style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})">
			<aside
				aria-label={hostT('timetable.grid.periodsAria')}
				class="shrink-0"
				style:width="var(--sidebar-width)"
				style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
			>
				{#each gridModel.periods as period (period.index)}
					<div
						class="flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center"
					>
						<div
							class="flex h-full w-full flex-col items-center justify-center rounded-2xl {period.index ===
							effectivePeriodIndex
								? 'period-active'
								: ''}"
						>
							<span class="text-body-medium font-bold">
								{period.index}
							</span>
							<span
								class="text-caption mt-1 font-mono leading-tight {period.index ===
								effectivePeriodIndex
									? ''
									: 'text-on-surface-variant'}"
							>
								{period.startTime}<br />{period.endTime}
							</span>
						</div>
					</div>
				{/each}
			</aside>

			<div
				bind:this={gridBodyEl}
				{@attach gridBodyWidthAttach}
				class="relative min-w-0 flex-1"
				style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
			>
				{#each gridModel.visibleDays as day, columnIndex (day.dayOfWeek)}
					{#if day.holiday}
						<div
							class="pointer-events-none absolute top-0 bg-surface-container-low/60"
							style:left="{(columnIndex / visibleDayCount) * 100}%"
							style:width="{100 / visibleDayCount}%"
							style:height="100%"
						></div>
					{/if}
				{/each}
				{#if capsuleLayoutReady}
					{#each placements as item (item.key)}
						{@const span = item.geometry.endPeriod - item.geometry.startPeriod + 1}
						{@const isConcealed = item.kind === 'course' && item.course.id === concealedCourseId}
						<div
							class="absolute box-border overflow-hidden transition-[transform,opacity] duration-200 ease-out {isConcealed
								? 'opacity-0'
								: ''}"
							style:top="calc((var(--row-height) * {item.geometry.startPeriod - 1}))"
							style:left="{item.geometry.leftPercent}%"
							style:width="{item.geometry.widthPercent}%"
							style:height="calc(var(--row-height) * {span})"
							style:transform={isEditing ? 'scale(0.92)' : 'scale(1)'}
							style:transform-origin="center center"
						>
							{#if item.kind === 'overlap-placeholder'}
								<button
									type="button"
									class="flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center"
									style={capsuleCornerAttrs(isEditing ? ALL_CORNERS_ROUNDED : item.corners).style}
									aria-label={buildOverlapPlaceholderAriaLabel(item.count)}
									onpointerup={(event) => handleOverlapPointerUp(item.key, event)}
									onclick={(event) => handleOverlapClick(item.key, event)}
								>
									<span class="text-on-surface-variant" style:font-size="{item.placeholderPx}px">
										{hostT('timetable.grid.overlap', { count: item.count })}
									</span>
								</button>
							{:else}
								{@render courseCard(item, isEditing ? ALL_CORNERS_ROUNDED : item.corners)}
							{/if}
						</div>
					{/each}
				{/if}
				{#if dropPreview}
					{@const span = dropPreview.course.endPeriod - dropPreview.course.startPeriod + 1}
					{@const periodEnd = dropPreview.targetStartPeriod + span - 1}
					{@const periodLabel =
						dropPreview.targetStartPeriod === periodEnd
							? hostT('timetable.reorder.periodSingle', { n: dropPreview.targetStartPeriod })
							: hostT('timetable.reorder.periodRange', {
									start: dropPreview.targetStartPeriod,
									end: periodEnd
								})}
					<div
						class="pointer-events-none absolute z-20 box-border transition-[top,left,transform] duration-100 ease-out"
						style:top="calc(var(--row-height) * {dropPreview.targetStartPeriod - 1})"
						style:left="{(dropPreview.targetColIndex / visibleDayCount) * 100}%"
						style:width="{100 / visibleDayCount}%"
						style:height="calc(var(--row-height) * {span})"
						style:transform="scale(0.92)"
						style:transform-origin="center center"
					>
						<div
							class="flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-primary bg-primary/20 p-1.5 text-center shadow-inner"
							style={capsuleCornerAttrs(ALL_CORNERS_ROUNDED).style}
						>
							<span class="line-clamp-2 px-1 text-xs font-semibold text-primary">
								{dropPreview.course.name}
							</span>
							<span
								class="inline-flex max-w-full items-center justify-center rounded-full bg-surface-container-highest/90 px-1.5 py-0.5 text-center leading-none font-medium whitespace-nowrap text-on-surface tabular-nums shadow-xs"
								{@attach createFitWidthFontAttachment(() => ({
									lines: [periodLabel],
									maxFontPx: 11,
									minFontPx: 7,
									fromParent: true
								}))}
							>
								{periodLabel}
							</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#snippet courseCard(placed: PlacedCourseCapsule, displayCorners: CapsuleCorners)}
	{@const colors = placed.colors}
	{@const scale = placed.scale}
	{@const locationLines = placed.locationLines}
	{@const locationMetrics = placed.locationMetrics}
	{@const teacher = placed.teacher}
	{@const handlers = createCourseCardHandlers(placed.course, {
		interaction,
		onCourseClick: isEditing ? undefined : onCourseClick,
		onLongPress: (_c, event) => {
			interaction.enterEditFromLongPress(event);
			if (placed.displayModel.isInDisplayedWeek) {
				startDrag(placed, event, {
					hapticOnStart: false,
					persistAfterDrop: false,
					waitForMove: true
				});
			}
		},
		onDragStart: (_c, event) => startDrag(placed, event)
	})}
	{@const pluginBadges = controller.courseBadges[placed.course.id] ?? []}
	{@const badgeText = placed.badgeLabel || pluginBadges[0]?.text}
	{@const innerWidthPx = courseCapsuleInnerWidthPx(columnWidthPx, placed.geometry.widthPercent)}
	<button
		type="button"
		draggable="false"
		class="course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left select-none {isEditing
			? 'cursor-grab active:cursor-grabbing'
			: ''} {placed.displayModel.isHolidayMuted
			? 'opacity-40'
			: placed.displayModel.isInDisplayedWeek
				? ''
				: 'opacity-45'}"
		style="{capsuleCornerAttrs(displayCorners)
			.style}; --capsule: {colors.background}; --capsule-fg: {colors.text}; touch-action: {isEditing
			? 'none'
			: 'pan-x pan-y'}; -webkit-user-drag: none; user-select: none;"
		aria-label={buildCourseCapsuleAriaLabel(placed.course, {
			teacher,
			isHolidayMuted: placed.displayModel.isHolidayMuted
		})}
		onpointerdown={handlers.onpointerdown}
		onpointermove={handlers.onpointermove}
		onpointerup={handlers.onpointerup}
		onpointerleave={handlers.onpointerleave}
		onpointercancel={handlers.onpointercancel}
		onclick={handlers.onclick}
		ondragstart={(event) => event.preventDefault()}
		oncontextmenu={(event) => event.preventDefault()}
	>
		{#if badgeText}
			<span class="mb-0.5 flex w-full shrink-0 justify-center">
				<span
					class="max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap"
					style:background-color="color-mix(in srgb, currentColor 12%, transparent)"
					style:color="color-mix(in srgb, currentColor 80%, transparent)"
					style:font-size="{scale.badgePx}px"
					{@attach createFitWidthFontAttachment(() => ({
						lines: [badgeText],
						maxFontPx: scale.badgePx,
						fromParent: true,
						availableWidthPx: innerWidthPx
					}))}
				>
					{badgeText}
				</span>
			</span>
		{/if}
		<MiddleTruncateText
			text={placed.course.name}
			class="min-h-0 flex-1 leading-tight font-medium"
			style="font-size: {scale.titlePx}px"
		/>
		{#if locationLines.length > 0}
			<div
				class="mt-1.5 shrink-0 overflow-hidden leading-tight"
				style="color: color-mix(in srgb, currentColor 80%, transparent); font-size: {locationMetrics.fontPx}px; height: {locationMetrics.heightPx}px"
				{@attach createFitWidthFontAttachment(() => ({
					lines: locationLines,
					maxFontPx: locationMetrics.fontPx,
					availableWidthPx: innerWidthPx
				}))}
			>
				{#each locationLines as line, lineIndex (`${lineIndex}:${line}`)}
					<div class="overflow-hidden whitespace-nowrap">{line}</div>
				{/each}
			</div>
		{/if}
		{#if teacher}
			<div
				class="mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap"
				style="color: color-mix(in srgb, currentColor 80%, transparent); font-size: {scale.detailPx}px"
				{@attach createFitWidthFontAttachment(() => ({
					lines: [teacher],
					maxFontPx: scale.detailPx,
					availableWidthPx: innerWidthPx
				}))}
			>
				{teacher}
			</div>
		{/if}
	</button>
{/snippet}
