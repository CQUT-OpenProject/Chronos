export function formatPublishedDate(value: string) {
	if (!value) return '-';
	const [year, month, day] = value.split('-');
	if (!year || !month || !day) return value;
	return `${year}年${Number(month)}月${Number(day)}日`;
}
