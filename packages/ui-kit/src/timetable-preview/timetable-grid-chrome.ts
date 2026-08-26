/** Shared timetable grid surface classes for production and preview grids. */

export function timetableSolidBgClass(hasDynamicBackground: boolean): string {
	return hasDynamicBackground ? '' : 'bg-surface';
}

export function timetableSidebarTintClass(hasDynamicBackground: boolean): string {
	return hasDynamicBackground ? 'bg-[var(--dynamic-tint-sidebar)]' : 'bg-surface';
}

export function timetableBodyTintClass(hasDynamicBackground: boolean): string {
	return hasDynamicBackground ? 'timetable-dynamic-tint-body' : 'bg-surface';
}
