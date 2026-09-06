type WeekParity = 'ALL' | 'ODD' | 'EVEN';

/** Parses CQUT-style week strings such as "1-8周(单),10-12周". */
export function parseWeeks(raw: string): number[] {
	const weeks = new Set<number>();
	const normalized = raw
		.replace(/（/g, '(')
		.replace(/）/g, ')')
		.replace(/~/g, '-')
		.replace(/第/g, '');

	const BLOCK_REGEX = /([\d,\-\s]+)周(?:\((?:单|双)\))?/g;
	for (const match of normalized.matchAll(BLOCK_REGEX)) {
		const rangeStr = match[1] ?? '';
		const fullMatch = match[0] ?? '';
		const parity: WeekParity = fullMatch.includes('(单)')
			? 'ODD'
			: fullMatch.includes('(双)')
				? 'EVEN'
				: 'ALL';

		const parts = rangeStr.split(',');
		for (const part of parts) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			const sep = trimmed.indexOf('-');
			const start = Number.parseInt(sep >= 0 ? trimmed.slice(0, sep) : trimmed, 10);
			const end = Number.parseInt(sep >= 0 ? trimmed.slice(sep + 1) : trimmed, 10);
			if (Number.isNaN(start)) continue;
			const last = Number.isNaN(end) ? start : end;
			for (let w = Math.min(start, last); w <= Math.max(start, last); w += 1) {
				if (parity === 'ALL' || (parity === 'ODD' ? w % 2 === 1 : w % 2 === 0)) {
					weeks.add(w);
				}
			}
		}
	}
	return [...weeks].sort((left, right) => left - right);
}
