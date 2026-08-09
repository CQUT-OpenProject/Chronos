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

export function writeWeekBitmask(mask: number, target: number[]): void {
	target.push(mask & 0xff, (mask >>> 8) & 0xff, (mask >>> 16) & 0xff, (mask >>> 24) & 0xff);
}

export function readWeekBitmask(bytes: Uint8Array, offset: number): number {
	return (
		(bytes[offset]! |
			(bytes[offset + 1]! << 8) |
			(bytes[offset + 2]! << 16) |
			(bytes[offset + 3]! << 24)) >>>
		0
	);
}
