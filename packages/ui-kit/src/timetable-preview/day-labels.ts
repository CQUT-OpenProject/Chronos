const DAY_SHORT_LABELS = ['', '一', '二', '三', '四', '五', '六', '日'];

export function timetableDayShortLabel(dayOfWeek: number): string {
	return DAY_SHORT_LABELS[dayOfWeek] ?? '?';
}
