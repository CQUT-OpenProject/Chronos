import { isSameDragTarget, mapPointerToDragTarget } from './timetable-drag-geometry';
import type {
	BeginDragInput,
	DragGridGeometry,
	DragTargetPatch,
	TimetableDragSession,
	TimetableInteractionMode
} from './timetable-interaction-types';

interface DragMoveLock {
	pointerId: number;
	startX: number;
	startY: number;
}

export interface DragSessionControllerOptions {
	thresholdPx: number;
	getDrag: () => TimetableDragSession | null;
	setDrag: (drag: TimetableDragSession | null) => void;
	getMode: () => TimetableInteractionMode;
	setMode: (mode: TimetableInteractionMode) => void;
	armClickGuard: () => void;
}

export interface DragSessionController {
	beginDrag(input: BeginDragInput): boolean;
	updateDragTarget(patch: DragTargetPatch): boolean;
	updateDragFromPointer(event: PointerEvent, geometry: DragGridGeometry): boolean;
	setDragOverDeleteZone(over: boolean): boolean;
	endDrag(): TimetableDragSession | null;
	cancelDrag(): TimetableDragSession | null;
	tryReleaseDragMoveLock(event: PointerEvent): boolean;
	clearDragMoveLock(): void;
	discardLockedDrag(): boolean;
}

export function createDragSessionController(
	options: DragSessionControllerOptions
): DragSessionController {
	let dragMoveLock: DragMoveLock | null = null;

	function clearDragMoveLock() {
		dragMoveLock = null;
	}

	function tryReleaseDragMoveLock(event: PointerEvent): boolean {
		if (!dragMoveLock || event.pointerId !== dragMoveLock.pointerId) return false;
		const dx = Math.abs(event.clientX - dragMoveLock.startX);
		const dy = Math.abs(event.clientY - dragMoveLock.startY);
		if (dx <= options.thresholdPx && dy <= options.thresholdPx) return false;
		clearDragMoveLock();
		return true;
	}

	function discardLockedDrag(): boolean {
		if (!options.getDrag() || !dragMoveLock) return false;
		clearDragMoveLock();
		options.setDrag(null);
		options.setMode('edit');
		return true;
	}

	function beginDrag(input: BeginDragInput): boolean {
		if (options.getMode() === 'dragging') return false;
		const { waitForMove = false, originX = 0, originY = 0, ...session } = input;
		options.setDrag({ ...session, overDeleteZone: false });
		dragMoveLock = waitForMove
			? { pointerId: session.pointerId, startX: originX, startY: originY }
			: null;
		options.setMode('dragging');
		return true;
	}

	function updateDragTarget(patch: DragTargetPatch): boolean {
		const drag = options.getDrag();
		if (!drag || dragMoveLock) return false;
		if (isSameDragTarget(drag, patch)) return false;
		drag.targetColIndex = patch.targetColIndex;
		drag.targetDayOfWeek = patch.targetDayOfWeek;
		drag.targetStartPeriod = patch.targetStartPeriod;
		return true;
	}

	function updateDragFromPointer(event: PointerEvent, geometry: DragGridGeometry): boolean {
		const drag = options.getDrag();
		if (!drag || event.pointerId !== drag.pointerId || dragMoveLock) return false;
		const patch = mapPointerToDragTarget(event, drag, geometry);
		return patch ? updateDragTarget(patch) : false;
	}

	function setDragOverDeleteZone(over: boolean): boolean {
		const drag = options.getDrag();
		if (!drag || dragMoveLock) return false;
		if (drag.overDeleteZone === over) return false;
		drag.overDeleteZone = over;
		return true;
	}

	function endDrag(): TimetableDragSession | null {
		if (discardLockedDrag()) return null;
		if (options.getMode() !== 'dragging' || !options.getDrag()) return null;
		const current = options.getDrag()!;
		options.setDrag(null);
		options.setMode(current.persistAfterDrop ? 'edit' : 'view');
		options.armClickGuard();
		return current;
	}

	function cancelDrag(): TimetableDragSession | null {
		return endDrag();
	}

	return {
		beginDrag,
		updateDragTarget,
		updateDragFromPointer,
		setDragOverDeleteZone,
		endDrag,
		cancelDrag,
		tryReleaseDragMoveLock,
		clearDragMoveLock,
		discardLockedDrag
	};
}
