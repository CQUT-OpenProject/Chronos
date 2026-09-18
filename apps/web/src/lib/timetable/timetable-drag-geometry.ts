import type {
	DragGridGeometry,
	DragTargetPatch,
	TimetableDragSession
} from './timetable-interaction-types';

export function mapPointerToDragTarget(
	event: PointerEvent,
	drag: TimetableDragSession,
	geometry: DragGridGeometry
): DragTargetPatch | null {
	const visibleDayCount = geometry.visibleDays.length;
	if (visibleDayCount <= 0 || geometry.displayedPeriodCount <= 0) return null;

	const relX = event.clientX - geometry.gridRect.left;
	const relY = event.clientY - geometry.gridRect.top;
	const colWidth = geometry.gridRect.width / visibleDayCount;
	let colIdx = Math.floor(relX / colWidth);
	colIdx = Math.max(0, Math.min(colIdx, visibleDayCount - 1));
	const targetDay = geometry.visibleDays[colIdx]?.dayOfWeek ?? drag.targetDayOfWeek;

	const rowHeight = geometry.gridRect.height / geometry.displayedPeriodCount;
	const span = drag.course.endPeriod - drag.course.startPeriod + 1;
	let periodIdx = Math.floor(relY / rowHeight) + 1;
	periodIdx = Math.max(1, Math.min(periodIdx, geometry.displayedPeriodCount - span + 1));

	return {
		targetColIndex: colIdx,
		targetDayOfWeek: targetDay,
		targetStartPeriod: periodIdx
	};
}

export function isSameDragTarget(drag: TimetableDragSession, patch: DragTargetPatch): boolean {
	return (
		drag.targetColIndex === patch.targetColIndex &&
		drag.targetDayOfWeek === patch.targetDayOfWeek &&
		drag.targetStartPeriod === patch.targetStartPeriod
	);
}
