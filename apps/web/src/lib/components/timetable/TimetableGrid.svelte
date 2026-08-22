<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import {
		placeCapsules,
		type CapsuleCorners,
		type Course,
		type PlacedCourseCapsule,
		type TimetableCourseDisplayModel,
		type TimetableGridModel
	} from '@chronos/core';
	import type { CapsuleCornerStyle, TimetableLayoutMode } from '@chronos/core';
	import MiddleTruncateText from '$lib/components/timetable/MiddleTruncateText.svelte';
	import { createSizedCanvasMeasurer, fitFontSizePx } from '$lib/text/middle-truncate';
	import { timetableDayShortLabel } from '$lib/timetable/day-labels';
	import {
		buildCourseCapsuleAriaLabel,
		buildOverlapPlaceholderAriaLabel
	} from '$lib/timetable/course-a11y';
	import {
		calculatePeriodCenterScrollOffset,
		calculatePeriodOffsetByIndex
	} from '$lib/timetable/period-scroll';
	import {
		computeDelayUntilNextCurrentTimeRefreshMillis,
		currentTimeMinutes,
		findCurrentPeriodIndex,
		parsePeriodRanges,
		type CoursePaletteEntry
	} from '@chronos/core';
	import { getAppController } from '$lib/services/app-engine';
	import {
		timetableBodyTintClass,
		timetableSidebarTintClass,
		timetableSolidBgClass
	} from '@chronos/ui-kit';
	import { createCourseCardHandlers } from '$lib/timetable/course-card-gesture';
	import { createTimetableInteractionMediator } from '$lib/timetable/timetable-interaction-mediator';

	const FIT_MIN_FONT_PX = 6;
	const SCROLL_ROW_HEIGHT = '5.5rem';

	interface Props {
		displayedWeek: number;
		isCurrentWeek: boolean;
		currentPeriodIndex?: number | null;
		expandedSlots?: ReadonlySet<string>;
		onExpandSlot?: (slotKey: string) => void;
		gridModel: TimetableGridModel;
		courseDisplayModels: TimetableCourseDisplayModel[];
		hasDynamicBackground: boolean;
		coursePalette: readonly CoursePaletteEntry[];
		paletteCourses?: { name: string; color: string }[];
		layoutMode?: TimetableLayoutMode;
		capsuleCornerStyle?: CapsuleCornerStyle;
		onCourseClick?: (course: Course) => void;
		onCourseLongClick?: (course: Course) => void;
	}

	let {
		displayedWeek,
		isCurrentWeek,
		currentPeriodIndex: propCurrentPeriodIndex,
		expandedSlots: propExpandedSlots,
		onExpandSlot,
		gridModel,
		courseDisplayModels,
		hasDynamicBackground,
		coursePalette,
		paletteCourses,
		layoutMode = 'fixed',
		capsuleCornerStyle = 'rounded',
		onCourseClick,
		onCourseLongClick
	}: Props = $props();

	const controller = getAppController();

	let scrollContainer = $state<HTMLDivElement | undefined>();
	let bodyViewportHeight = $state(0);
	let gridBodyWidth = $state(0);
	let centeredFor = $state<string | null>(null);
	let internalExpandedSlots = $state(new Set<string>());
	let now = $state(new Date());

	const effectiveExpandedSlots = $derived(propExpandedSlots ?? internalExpandedSlots);
	const parsedPeriods = $derived(parsePeriodRanges(gridModel.periods));
	const visibleDayCount = $derived(gridModel.visibleDays.length);
	const columnWidthPx = $derived(visibleDayCount > 0 ? gridBodyWidth / visibleDayCount : 0);
	const mediator = $derived(
		createTimetableInteractionMediator({
			onCourseClick,
			onCourseLongClick
		})
	);

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

	const currentPeriodIndex = $derived(
		propCurrentPeriodIndex !== undefined
			? propCurrentPeriodIndex
			: findCurrentPeriodIndex(parsedPeriods, currentTimeMinutes(now))
	);

	const solidBgClass = $derived(timetableSolidBgClass(hasDynamicBackground));
	const isFitLayout = $derived(layoutMode === 'compact');
	const rowHeightCss = $derived.by(() => {
		if (!isFitLayout || bodyViewportHeight <= 0 || gridModel.displayedPeriodCount <= 0) {
			return SCROLL_ROW_HEIGHT;
		}
		return `${bodyViewportHeight / gridModel.displayedPeriodCount}px`;
	});

	function scrollToCurrentPeriod(smooth = false): boolean {
		if (isFitLayout || !isCurrentWeek || !scrollContainer || bodyViewportHeight <= 0) {
			return false;
		}
		const target = currentPeriodIndex;
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

	$effect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;

		const schedule = () => {
			const delay = computeDelayUntilNextCurrentTimeRefreshMillis(new Date(), parsedPeriods);
			timeoutId = setTimeout(() => {
				now = new Date();
				schedule();
			}, delay);
		};

		schedule();
		return () => clearTimeout(timeoutId);
	});

	function dayOfMonth(date: string): string {
		return date.slice(8, 10);
	}

	/**
	 * Pass a getter so `{@attach fitWidthFont(() => …)}` does not re-create the
	 * attachment when params change — inner `$effect` applies updates instead.
	 */
	function fitWidthFont(
		getParams: () => { lines: string[]; maxFontPx: number; fromParent?: boolean }
	): Attachment<HTMLElement> {
		return (node) => {
			const apply = () => {
				const { lines, maxFontPx, fromParent = false } = getParams();
				const contents = lines.filter((line) => line.length > 0);
				const box = fromParent ? (node.parentElement ?? node) : node;
				let available = box.clientWidth;
				if (fromParent) {
					const style = getComputedStyle(node);
					available -=
						(Number.parseFloat(style.paddingLeft) || 0) +
						(Number.parseFloat(style.paddingRight) || 0);
					available = Math.max(0, available);
				}
				if (available <= 0 || contents.length === 0) return;

				const measurerForSize = createSizedCanvasMeasurer(node);
				const fontPx = fitFontSizePx(
					available,
					(size) => {
						const measure = measurerForSize(size);
						return Math.max(...contents.map((line) => measure(line)));
					},
					maxFontPx,
					FIT_MIN_FONT_PX
				);
				node.style.fontSize = `${fontPx}px`;
			};

			let observed: Element | null = null;
			const observer = new ResizeObserver(apply);

			$effect(() => {
				const { fromParent = false } = getParams();
				const target = fromParent ? (node.parentElement ?? node) : node;
				if (observed !== target) {
					observer.disconnect();
					observer.observe(target);
					observed = target;
				}
				apply();
			});

			return () => observer.disconnect();
		};
	}

	function expandSlot(key: string) {
		mediator.handleOverlapExpand(key);
		if (onExpandSlot) {
			onExpandSlot(key);
		} else {
			internalExpandedSlots = new Set([...internalExpandedSlots, key]);
		}
	}

	function cornerClasses(corners: CapsuleCorners): string {
		return [
			corners.topLeft ? 'rounded-tl-xl' : null,
			corners.topRight ? 'rounded-tr-xl' : null,
			corners.bottomLeft ? 'rounded-bl-xl' : null,
			corners.bottomRight ? 'rounded-br-xl' : null
		]
			.filter((name): name is string => name != null)
			.join(' ');
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
</script>

<div
	class="relative flex h-full w-full flex-col {solidBgClass}"
	style="--row-height: {rowHeightCss}; --sidebar-width: 3.25rem"
>
	<div class="flex shrink-0 items-center py-2 {timetableSidebarTintClass(hasDynamicBackground)}">
		<div
			class="m3-body-small flex w-[var(--sidebar-width)] flex-col items-center text-center text-on-surface-variant"
		>
			<span>{gridModel.monthLabel}</span>
			<span>月</span>
		</div>
		<div class="flex min-w-0 flex-1">
			{#each gridModel.visibleDays as day (day.dayOfWeek)}
				<div class="flex min-w-0 flex-1 flex-col items-center">
					<span class="m3-body-small text-on-surface-variant"
						>{timetableDayShortLabel(day.dayOfWeek)}</span
					>
					<div
						class="m3-body-medium mt-1 flex size-[26px] items-center justify-center rounded-full {day.isToday
							? 'bg-brand text-on-primary'
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
		aria-label="本周课程表"
	>
		<div class="flex" style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})">
			<aside
				aria-label="节次与时间"
				class="shrink-0"
				style:width="var(--sidebar-width)"
				style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
			>
				{#each gridModel.periods as period (period.index)}
					{@const isActive = period.index === currentPeriodIndex}
					<div
						class="flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center"
					>
						<div
							class="flex h-full w-full flex-col items-center justify-center rounded-2xl {isActive
								? 'period-active'
								: ''}"
						>
							<span class="m3-body-medium font-bold">
								{period.index}
							</span>
							<span
								class="m3-caption mt-1 leading-tight {isActive ? '' : 'text-on-surface-variant'}"
							>
								{period.startTime}<br />{period.endTime}
							</span>
						</div>
					</div>
				{/each}
			</aside>

			<div
				{@attach gridBodyWidthAttach}
				class="relative min-w-0 flex-1"
				style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
			>
				{#each placements as item (item.key)}
					{@const span = item.geometry.endPeriod - item.geometry.startPeriod + 1}
					<div
						class="absolute box-border overflow-hidden"
						style:top="calc((var(--row-height) * {item.geometry.startPeriod - 1}))"
						style:left="{item.geometry.leftPercent}%"
						style:width="{item.geometry.widthPercent}%"
						style:height="calc(var(--row-height) * {span})"
					>
						{#if item.kind === 'overlap-placeholder'}
							<button
								type="button"
								class="flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center {cornerClasses(
									item.corners
								)}"
								aria-label={buildOverlapPlaceholderAriaLabel(item.count)}
								onclick={() => expandSlot(item.key)}
							>
								<span class="text-on-surface-variant" style:font-size="{item.placeholderPx}px">
									此时段有 {item.count} 门课程重叠
								</span>
							</button>
						{:else}
							{@render courseCard(item)}
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

{#snippet courseCard(placed: PlacedCourseCapsule)}
	{@const colors = placed.colors}
	{@const scale = placed.scale}
	{@const locationLines = placed.locationLines}
	{@const locationMetrics = placed.locationMetrics}
	{@const teacher = placed.teacher}
	{@const handlers = createCourseCardHandlers(placed.course, {
		onCourseClick: mediator.handleCourseClick,
		onCourseLongClick: mediator.handleCourseLongPress,
		onLongPressFeedback: () => {}
	})}
	{@const pluginBadges = controller.courseBadges[placed.course.id] ?? []}
	{@const badgeText = placed.badgeLabel || pluginBadges[0]?.text}
	<button
		type="button"
		class="course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left {cornerClasses(
			placed.corners
		)} {placed.displayModel.isInDisplayedWeek ? '' : 'opacity-45'}"
		style:--capsule={colors.background}
		style:--capsule-fg={colors.text}
		aria-label={buildCourseCapsuleAriaLabel(placed.course, { teacher })}
		aria-keyshortcuts="Shift+Enter"
		oncontextmenu={handlers.oncontextmenu}
		onpointerdown={handlers.onpointerdown}
		onpointermove={handlers.onpointermove}
		onpointerup={handlers.onpointerup}
		onpointerleave={handlers.onpointerleave}
		onpointercancel={handlers.onpointercancel}
		onclick={handlers.onclick}
		onkeydown={handlers.onkeydown}
	>
		{#if badgeText}
			<span class="mb-0.5 flex w-full shrink-0 justify-center">
				<span
					class="max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap"
					style:background-color="color-mix(in srgb, currentColor 12%, transparent)"
					style:color="color-mix(in srgb, currentColor 80%, transparent)"
					style:font-size="{scale.badgePx}px"
					{@attach fitWidthFont(() => ({
						lines: [badgeText],
						maxFontPx: scale.badgePx,
						fromParent: true
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
				{@attach fitWidthFont(() => ({
					lines: locationLines,
					maxFontPx: locationMetrics.fontPx
				}))}
			>
				{#each locationLines as line, index (index)}
					<div class="overflow-hidden whitespace-nowrap">{line}</div>
				{/each}
			</div>
		{/if}
		{#if teacher}
			<div
				class="mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap"
				style="color: color-mix(in srgb, currentColor 80%, transparent); font-size: {scale.detailPx}px"
				{@attach fitWidthFont(() => ({ lines: [teacher], maxFontPx: scale.detailPx }))}
			>
				{teacher}
			</div>
		{/if}
	</button>
{/snippet}

<style>
	.timetable-wallpaper-body {
		background-image: linear-gradient(
			90deg,
			var(--wallpaper-tint-sidebar) 0,
			var(--wallpaper-tint-sidebar) var(--sidebar-width),
			var(--wallpaper-tint-grid) var(--sidebar-width),
			var(--wallpaper-tint-grid) 100%
		);
	}
</style>
