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

export function timetableDayColumnDateClass(day: { isToday?: boolean; holiday?: unknown }): string {
	if (day.holiday)
		return 'bg-[var(--timetable-holiday-date-bg)] text-[var(--timetable-holiday-date-fg)]';
	if (day.isToday)
		return 'bg-[var(--timetable-today-date-bg)] text-[var(--timetable-today-date-fg)]';
	return 'text-on-surface';
}

export function timetableDayColumnDateShellClass(): string {
	return 'text-body-medium mt-1 flex size-[26px] items-center justify-center rounded-full font-extrabold';
}

export function timetablePeriodIndexClass(): string {
	return 'text-body-medium font-extrabold';
}

export function timetableHolidayColumnOverlayClass(hasDynamicBackground: boolean): string {
	if (hasDynamicBackground) {
		return 'bg-[var(--dynamic-tint-holiday-overlay)]';
	}
	return 'bg-on-surface-variant/5';
}
