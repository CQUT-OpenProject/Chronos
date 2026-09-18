import type { Course, PlacedCourseCapsule } from '@chronos/core';

export const TIMETABLE_POINTER_THRESHOLD_PX = 5;
export const TIMETABLE_LONG_PRESS_DELAY_MS = 450;
export const TIMETABLE_CLICK_GUARD_MS = 120;
export const TIMETABLE_LONG_PRESS_CLICK_SUPPRESS_MS = 50;

export type TimetableInteractionMode = 'view' | 'edit' | 'dragging';

export interface TimetableDragSession {
	course: Course;
	placed: PlacedCourseCapsule;
	pointerId: number;
	week: number;
	targetColIndex: number;
	targetDayOfWeek: number;
	targetStartPeriod: number;
	persistAfterDrop: boolean;
	overDeleteZone: boolean;
}

export interface BeginDragInput {
	course: Course;
	placed: PlacedCourseCapsule;
	pointerId: number;
	week: number;
	targetColIndex: number;
	targetDayOfWeek: number;
	targetStartPeriod: number;
	persistAfterDrop: boolean;
	waitForMove?: boolean;
	originX?: number;
	originY?: number;
}

export interface DragTargetPatch {
	targetColIndex: number;
	targetDayOfWeek: number;
	targetStartPeriod: number;
}

export interface DragGridGeometry {
	gridRect: { left: number; top: number; width: number; height: number };
	visibleDays: readonly { dayOfWeek: number }[];
	displayedPeriodCount: number;
}

export interface GridHandlerOptions {
	onEmptyLongPress?: (event: PointerEvent) => void;
	onClickEmpty?: (event: MouseEvent) => void;
}

export interface CourseCardHandlerOptions {
	onCourseClick?: (course: Course) => void;
	onLongPress?: (course: Course, event: PointerEvent) => void;
	onDragStart?: (course: Course, event: PointerEvent) => void;
}

export interface TimetableInteractionOptions {
	now?: () => number;
	longPressDelayMs?: number;
	thresholdPx?: number;
	clickGuardMs?: number;
}

export interface TimetableInteractionCore {
	get mode(): TimetableInteractionMode;
	isClickGuarded(): boolean;
	resetClickFlags(): void;
	enterEdit(): void;
	enterEditFromLongPress(event: PointerEvent): void;
	watchLongPress(event: PointerEvent, onFire: (event: PointerEvent) => void): boolean;
	notePointerMove(event: PointerEvent): void;
	notePointerUp(event: PointerEvent): void;
	notePointerLost(event: PointerEvent): void;
	notePointerCancel(event: PointerEvent): void;
	consumeClickSuppression(): boolean;
}
