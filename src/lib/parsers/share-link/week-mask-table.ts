import { bitmaskToWeeks, weeksToBitmask } from './week-bitmask';

export const WEEK_MASK_RANGE_FLAG = 0x80;
const MAX_MASK_ENTRIES = 255;

function encodeWeekMaskEntry(weeks: number[]): number[] {
	if (weeks.length === 0) return [];

	const sorted = [...weeks].sort((left, right) => left - right);
	const contiguous = sorted.every((week, index) => index === 0 || week === sorted[index - 1]! + 1);
	const start = sorted[0]!;
	const end = sorted[sorted.length - 1]!;

	if (contiguous && start >= 1 && start <= 127 && end <= 255) {
		return [WEEK_MASK_RANGE_FLAG | start, end];
	}

	const mask = weeksToBitmask(sorted);
	return [mask & 0xff, (mask >>> 8) & 0xff, (mask >>> 16) & 0xff, (mask >>> 24) & 0xff];
}

function decodeWeekMaskEntry(entry: number[]): number[] {
	if (entry.length === 0) return [];

	if (entry.length === 2 && (entry[0]! & WEEK_MASK_RANGE_FLAG) !== 0) {
		const start = entry[0]! & 0x7f;
		const end = entry[1]!;
		if (!end || end < start) return [];
		return Array.from({ length: end - start + 1 }, (_, index) => start + index);
	}

	if (entry.length === 4) {
		const mask = (entry[0]! | (entry[1]! << 8) | (entry[2]! << 16) | (entry[3]! << 24)) >>> 0;
		return bitmaskToWeeks(mask);
	}

	return [];
}

export class WeekMaskTable {
	readonly entries: number[][] = [];
	private readonly indexOf = new Map<string, number>();

	intern(weeks: number[]): number {
		const encoded = encodeWeekMaskEntry(weeks);
		const key = encoded.join(',');
		const existing = this.indexOf.get(key);
		if (existing !== undefined) return existing;
		if (this.entries.length >= MAX_MASK_ENTRIES) {
			throw new Error('week mask table overflow');
		}
		const index = this.entries.length;
		this.entries.push(encoded);
		this.indexOf.set(key, index);
		return index;
	}

	write(target: number[]): void {
		target.push(this.entries.length);
		for (const entry of this.entries) {
			target.push(entry.length);
			target.push(...entry);
		}
	}

	static read(bytes: Uint8Array, offset: number): { table: WeekMaskTable; nextOffset: number } {
		const count = bytes[offset];
		if (count === undefined) throw new Error('truncated week mask table');

		const table = new WeekMaskTable();
		let cursor = offset + 1;
		for (let index = 0; index < count; index += 1) {
			const entryLength = bytes[cursor];
			if (entryLength === undefined) throw new Error('truncated week mask entry');
			cursor += 1;
			const entryBytes: number[] = [];
			for (let byteIndex = 0; byteIndex < entryLength; byteIndex += 1) {
				const value = bytes[cursor + byteIndex];
				if (value === undefined) throw new Error('truncated week mask entry');
				entryBytes.push(value);
			}
			table.entries.push(entryBytes);
			table.indexOf.set(entryBytes.join(','), index);
			cursor += entryLength;
		}

		return { table, nextOffset: cursor };
	}

	decode(index: number): number[] {
		const entry = this.entries[index];
		if (!entry) return [];
		return decodeWeekMaskEntry(entry);
	}
}
