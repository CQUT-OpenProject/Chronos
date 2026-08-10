import { ShareBinaryDecodeError } from './share-binary-decode-error';

export const MAX_WEEK = 32;

export function assertValidWeeks(weeks: number[]): void {
	const invalid = weeks.filter((week) => week < 1 || week > MAX_WEEK);
	if (invalid.length > 0) {
		throw new ShareBinaryDecodeError(`week out of range: ${invalid.join(', ')}`);
	}
}

export function weeksToBitmask(weeks: number[]): number {
	assertValidWeeks(weeks);
	let mask = 0;
	for (const week of weeks) {
		mask |= 1 << (week - 1);
	}
	return mask >>> 0;
}

export function bitmaskToWeeks(mask: number): number[] {
	const weeks: number[] = [];
	for (let week = 1; week <= MAX_WEEK; week += 1) {
		if ((mask & (1 << (week - 1))) !== 0) weeks.push(week);
	}
	return weeks;
}
