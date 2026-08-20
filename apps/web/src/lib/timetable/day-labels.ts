const DAY_LABELS = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DAY_SHORT_LABELS = ['', '一', '二', '三', '四', '五', '六', '日'];

export function timetableDayLabel(dayOfWeek: number): string {
	return DAY_LABELS[dayOfWeek] ?? '未知';
}

export function timetableDayShortLabel(dayOfWeek: number): string {
	return DAY_SHORT_LABELS[dayOfWeek] ?? '?';
}
