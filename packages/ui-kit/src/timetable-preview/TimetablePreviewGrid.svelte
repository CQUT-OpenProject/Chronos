<script lang="ts">
	import './timetable-dynamic-tint.css';
	import type { Attachment } from 'svelte/attachments';
	import {
		placeCapsules,
		type CoursePaletteEntry,
		type TimetableCourseDisplayModel,
		type TimetableGridModel
	} from '@chronos/core';
	import { capsuleCornerAttrs } from '../timetable/capsule-corners';
	import { timetableDayColumnHeaderLabel } from './day-labels';
	import MiddleTruncateText from './MiddleTruncateText.svelte';
	import { createFitWidthFontAttachment } from '../utils/fit-width-font.svelte';
	import {
		timetableBodyTintClass,
		timetableSidebarTintClass,
		timetableSolidBgClass
	} from './timetable-grid-chrome';

	const ROW_HEIGHT = '5.5rem';
	const SIDEBAR_WIDTH = '3.25rem';
	const FIT_MIN_FONT_PX = 6;

	import type { CapsuleCornerStyle, TimetableLayoutMode } from '@chronos/core';
	import type { Course, CourseBadge } from '@chronos/core';
	import { currentTimeMinutes, findCurrentPeriodIndex, parsePeriodRanges } from '@chronos/core';

	interface Props {
		displayedWeek: number;
		gridModel: TimetableGridModel;
		courseDisplayModels: TimetableCourseDisplayModel[];
		coursePalette: readonly CoursePaletteEntry[];
		paletteCourses?: { name: string; color?: string }[];
		hasDynamicBackground?: boolean;
		layoutMode?: TimetableLayoutMode;
		capsuleCornerStyle?: CapsuleCornerStyle;
		interactive?: boolean;
		isCurrentWeek?: boolean;
		currentPeriodIndex?: number | null;
		courseBadges?: Record<string, CourseBadge[]>;
		expandedSlots?: ReadonlySet<string>;
		onExpandSlot?: (slotKey: string) => void;
		onCourseClick?: (course: Course) => void;
	}

	let {
		displayedWeek,
		gridModel,
		courseDisplayModels,
		coursePalette,
		paletteCourses,
		hasDynamicBackground = false,
		layoutMode = 'fixed',
		capsuleCornerStyle = 'rounded',
		interactive = false,
		isCurrentWeek = false,
		currentPeriodIndex: propCurrentPeriodIndex,
		courseBadges = {},
		expandedSlots: propExpandedSlots,
		onExpandSlot,
		onCourseClick
	}: Props = $props();

	let gridBodyWidth = $state(0);
	let bodyViewportHeight = $state(0);
	let internalExpandedSlots = $state(new Set<string>());
	let now = $state(new Date());

	const effectiveExpandedSlots = $derived(propExpandedSlots ?? internalExpandedSlots);
	const visibleDayCount = $derived(gridModel.visibleDays.length);
	const columnWidthPx = $derived(visibleDayCount > 0 ? gridBodyWidth / visibleDayCount : 0);
	const parsedPeriods = $derived(parsePeriodRanges(gridModel.periods));

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
	const currentPeriodIndex = $derived(
		propCurrentPeriodIndex !== undefined
			? propCurrentPeriodIndex
			: isCurrentWeek
				? findCurrentPeriodIndex(parsedPeriods, currentTimeMinutes(now))
				: null
	);
	const rowHeightCss = $derived.by(() => {
		if (!isFitLayout || bodyViewportHeight <= 0 || gridModel.displayedPeriodCount <= 0) {
			return ROW_HEIGHT;
		}
		return `${bodyViewportHeight / gridModel.displayedPeriodCount}px`;
	});

	$effect(() => {
		if (propCurrentPeriodIndex !== undefined) return;
		if (!isCurrentWeek) return;
		let timeoutId: ReturnType<typeof setTimeout>;
		const schedule = () => {
			const delay = (() => {
				// recompute delay until next period change
				const periods = parsedPeriods;
				if (periods.length === 0) return 60_000;
				const nowMinutes = currentTimeMinutes(new Date());
				let nextChange: number | null = null;
				for (const p of periods) {
					if (nowMinutes < p.startMinutes) {
						nextChange = p.startMinutes;
						break;
					}
					if (nowMinutes < p.endMinutes) {
						nextChange = p.endMinutes;
						break;
					}
				}
				if (nextChange == null) return 60_000;
				return Math.max((nextChange - nowMinutes) * 60_000, 1_000);
			})();
			timeoutId = setTimeout(() => {
				now = new Date();
				schedule();
			}, delay);
		};
		schedule();
		return () => clearTimeout(timeoutId);
	});

	function expandSlot(key: string) {
		if (onExpandSlot) {
			onExpandSlot(key);
		} else {
			internalExpandedSlots = new Set([...internalExpandedSlots, key]);
		}
	}

	function dayOfMonth(date: string): string {
		return date.slice(8, 10);
	}

	const gridBodyWidthAttach: Attachment = (node) => {
		const update = () => {
			gridBodyWidth = node.clientWidth;
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	};

	const bodyViewportAttach: Attachment = (node) => {
		const element = node as HTMLDivElement;
		bodyViewportHeight = element.clientHeight;
		const observer = new ResizeObserver(() => {
			bodyViewportHeight = element.clientHeight;
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	};
</script>

<div
	class="relative flex h-full min-h-0 w-full flex-1 flex-col {solidBgClass}"
	style="--row-height: {rowHeightCss}; --sidebar-width: {SIDEBAR_WIDTH}"
>
	<div class="flex shrink-0 items-center py-2 {timetableSidebarTintClass(hasDynamicBackground)}">
		<div
			class="text-body-small flex w-[var(--sidebar-width)] flex-col items-center text-center text-on-surface-variant"
		>
			<span>{gridModel.monthLabel}</span>
			<span>月</span>
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
		{@attach bodyViewportAttach}
		class="min-h-0 flex-1 {isFitLayout
			? 'overflow-hidden'
			: 'overflow-y-auto'} {timetableBodyTintClass(hasDynamicBackground)}"
		role="region"
		aria-label="课表预览"
	>
		<div class="flex" style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})">
			<aside
				aria-label="节次与时间"
				class="shrink-0"
				style:width="var(--sidebar-width)"
				style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
			>
				{#each gridModel.periods as period (period.index)}
					{@const isActive = isCurrentWeek && period.index === currentPeriodIndex}
					<div
						class="flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center"
					>
						<div
							class="flex h-full w-full flex-col items-center justify-center rounded-2xl {isActive
								? 'period-active'
								: ''}"
						>
							<span class="text-body-medium font-bold">{period.index}</span>
							<span
								class="text-caption mt-1 leading-tight {isActive ? '' : 'text-on-surface-variant'}"
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
							{#if interactive}
								<button
									type="button"
									class="flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center"
									style={capsuleCornerAttrs(item.corners).style}
									onclick={() => expandSlot(item.key)}
								>
									<span class="text-on-surface-variant" style:font-size="{item.placeholderPx}px">
										此时段有 {item.count} 门课程重叠
									</span>
								</button>
							{:else}
								<div
									class="flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center"
									style={capsuleCornerAttrs(item.corners).style}
								>
									<span class="text-on-surface-variant" style:font-size="{item.placeholderPx}px">
										{item.count} 门课程重叠
									</span>
								</div>
							{/if}
						{:else}
							{@const courseBadgesForThis = courseBadges[item.course.id] ?? []}
							{@const badgeText = item.badgeLabel || courseBadgesForThis[0]?.text}
							{#if interactive}
								<button
									type="button"
									class="course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left {item
										.displayModel.isHolidayMuted
										? 'opacity-40'
										: item.displayModel.isInDisplayedWeek
											? ''
											: 'opacity-45'}"
									style="{capsuleCornerAttrs(item.corners).style}; --capsule: {item.colors
										.background}; --capsule-fg: {item.colors.text}"
									onclick={() => onCourseClick?.(item.course)}
								>
									{#if badgeText}
										<span class="mb-0.5 flex w-full shrink-0 justify-center">
											<span
												class="max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap"
												style:background-color="color-mix(in srgb, currentColor 12%, transparent)"
												style:color="color-mix(in srgb, currentColor 80%, transparent)"
												style:font-size="{item.scale.badgePx}px"
												{@attach createFitWidthFontAttachment(() => ({
													lines: [badgeText],
													maxFontPx: item.scale.badgePx,
													fromParent: true
												}))}
											>
												{badgeText}
											</span>
										</span>
									{/if}
									<MiddleTruncateText
										text={item.course.name}
										class="min-h-0 flex-1 leading-tight font-medium"
										style="font-size: {item.scale.titlePx}px"
									/>
									{#if item.locationLines.length > 0}
										<div
											class="mt-1.5 shrink-0 overflow-hidden leading-tight"
											style="color: color-mix(in srgb, currentColor 80%, transparent); font-size: {item
												.locationMetrics.fontPx}px; height: {item.locationMetrics.heightPx}px"
											{@attach createFitWidthFontAttachment(() => ({
												lines: item.locationLines,
												maxFontPx: item.locationMetrics.fontPx
											}))}
										>
											{#each item.locationLines as line, index (index)}
												<div class="overflow-hidden whitespace-nowrap">{line}</div>
											{/each}
										</div>
									{/if}
									{#if item.teacher}
										<div
											class="mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap"
											style="color: color-mix(in srgb, currentColor 80%, transparent); font-size: {item
												.scale.detailPx}px"
											{@attach createFitWidthFontAttachment(() => ({
												lines: [item.teacher],
												maxFontPx: item.scale.detailPx
											}))}
										>
											{item.teacher}
										</div>
									{/if}
								</button>
							{:else}
								<div
									class="course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left {item
										.displayModel.isHolidayMuted
										? 'opacity-40'
										: item.displayModel.isInDisplayedWeek
											? ''
											: 'opacity-45'}"
									style="{capsuleCornerAttrs(item.corners).style}; --capsule: {item.colors
										.background}; --capsule-fg: {item.colors.text}"
								>
									{#if badgeText}
										<span class="mb-0.5 flex w-full shrink-0 justify-center">
											<span
												class="max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap"
												style:background-color="color-mix(in srgb, currentColor 12%, transparent)"
												style:color="color-mix(in srgb, currentColor 80%, transparent)"
												style:font-size="{item.scale.badgePx}px"
												{@attach createFitWidthFontAttachment(() => ({
													lines: [badgeText],
													maxFontPx: item.scale.badgePx,
													fromParent: true
												}))}
											>
												{badgeText}
											</span>
										</span>
									{/if}
									<MiddleTruncateText
										text={item.course.name}
										class="min-h-0 flex-1 leading-tight font-medium"
										style="font-size: {item.scale.titlePx}px"
									/>
									{#if item.locationLines.length > 0}
										<div
											class="mt-1.5 shrink-0 overflow-hidden leading-tight"
											style="color: color-mix(in srgb, currentColor 80%, transparent); font-size: {item
												.locationMetrics.fontPx}px; height: {item.locationMetrics.heightPx}px"
											{@attach createFitWidthFontAttachment(() => ({
												lines: item.locationLines,
												maxFontPx: item.locationMetrics.fontPx
											}))}
										>
											{#each item.locationLines as line, index (index)}
												<div class="overflow-hidden whitespace-nowrap">{line}</div>
											{/each}
										</div>
									{/if}
									{#if item.teacher}
										<div
											class="mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap"
											style="color: color-mix(in srgb, currentColor 80%, transparent); font-size: {item
												.scale.detailPx}px"
											{@attach createFitWidthFontAttachment(() => ({
												lines: [item.teacher],
												maxFontPx: item.scale.detailPx
											}))}
										>
											{item.teacher}
										</div>
									{/if}
								</div>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
