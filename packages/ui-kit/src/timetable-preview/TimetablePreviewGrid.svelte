<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import {
		placeCapsules,
		type CoursePaletteEntry,
		type TimetableCourseDisplayModel,
		type TimetableGridModel
	} from '@chronos/core';
	import { timetableDayShortLabel } from './day-labels';

	const ROW_HEIGHT = '5.5rem';
	const SIDEBAR_WIDTH = '3.25rem';

	interface Props {
		displayedWeek: number;
		gridModel: TimetableGridModel;
		courseDisplayModels: TimetableCourseDisplayModel[];
		coursePalette: readonly CoursePaletteEntry[];
		hasWallpaper?: boolean;
	}

	let {
		displayedWeek,
		gridModel,
		courseDisplayModels,
		coursePalette,
		hasWallpaper = false
	}: Props = $props();

	let gridBodyWidth = $state(0);

	const visibleDayCount = $derived(gridModel.visibleDays.length);
	const columnWidthPx = $derived(visibleDayCount > 0 ? gridBodyWidth / visibleDayCount : 0);

	const placements = $derived(
		placeCapsules({
			courseDisplayModels,
			visibleDays: gridModel.visibleDays,
			columnWidthPx,
			expandedSlotKeys: new Set<string>(),
			coursePalette,
			layoutMode: 'fixed',
			capsuleCornerStyle: 'rounded'
		})
	);

	const solidBgClass = $derived(hasWallpaper ? '' : 'bg-surface');

	function dayOfMonth(date: string): string {
		return date.slice(8, 10);
	}

	function cornerClasses(corners: {
		topLeft: boolean;
		topRight: boolean;
		bottomLeft: boolean;
		bottomRight: boolean;
	}): string {
		return [
			corners.topLeft ? 'rounded-tl-xl' : null,
			corners.topRight ? 'rounded-tr-xl' : null,
			corners.bottomLeft ? 'rounded-bl-xl' : null,
			corners.bottomRight ? 'rounded-br-xl' : null
		]
			.filter((name): name is string => name != null)
			.join(' ');
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
</script>

<div
	class="relative flex h-full w-full flex-col {solidBgClass}"
	style="--row-height: {ROW_HEIGHT}; --sidebar-width: {SIDEBAR_WIDTH}"
>
	<div
		class="flex shrink-0 items-center py-2 {hasWallpaper
			? 'bg-[var(--wallpaper-tint-sidebar)]'
			: 'bg-surface'}"
	>
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
		class="min-h-0 flex-1 overflow-hidden {hasWallpaper
			? 'timetable-wallpaper-body'
			: 'bg-surface'}"
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
					<div
						class="flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center"
					>
						<div class="flex h-full w-full flex-col items-center justify-center rounded-2xl">
							<span class="m3-body-medium font-bold">{period.index}</span>
							<span class="m3-caption mt-1 leading-tight text-on-surface-variant">
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
							<div
								class="flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center {cornerClasses(
									item.corners
								)}"
							>
								<span class="text-on-surface-variant" style:font-size="{item.placeholderPx}px">
									{item.count} 门课程重叠
								</span>
							</div>
						{:else}
							<div
								class="course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 {cornerClasses(
									item.corners
								)} {item.displayModel.isInDisplayedWeek ? '' : 'opacity-45'}"
								style:--capsule={item.colors.background}
								style:--capsule-fg={item.colors.text}
							>
								<span
									class="truncate leading-tight font-bold"
									style:font-size="{item.scale.titlePx}px"
								>
									{item.course.name}
								</span>
								{#if item.locationLines.length > 0}
									<span
										class="truncate text-on-surface-variant"
										style:font-size="{item.scale.detailPx}px"
									>
										{item.locationLines[0]}
									</span>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
