import { writeVarint } from './varint';
import { VarintReader } from './varint';

export const NO_TEACHER_SLOT = 0x0f;
const MAX_TEACHERS = 14;

export class TeacherTable {
	readonly names: string[] = [];
	private readonly indexOf = new Map<string, number>();

	intern(teacher: string): number {
		const trimmed = teacher.trim();
		if (!trimmed) return 0;
		const existing = this.indexOf.get(trimmed);
		if (existing !== undefined) return existing;
		if (this.names.length >= MAX_TEACHERS) {
			throw new Error('teacher table overflow');
		}
		const index = this.names.length + 1;
		this.names.push(trimmed);
		this.indexOf.set(trimmed, index);
		return index;
	}

	write(target: number[]): void {
		target.push(this.names.length);
		for (const name of this.names) {
			const bytes = new TextEncoder().encode(name);
			writeVarint(bytes.length, target);
			for (const byte of bytes) target.push(byte);
		}
	}

	static read(bytes: Uint8Array, offset: number): { table: TeacherTable; nextOffset: number } {
		const count = bytes[offset];
		if (count === undefined) throw new Error('truncated teacher table');

		const table = new TeacherTable();
		const reader = new VarintReader(bytes);
		reader.position = offset + 1;
		for (let index = 0; index < count; index += 1) {
			const length = reader.read();
			const start = reader.position;
			const slice = bytes.subarray(start, start + length);
			if (slice.length !== length) throw new Error('truncated teacher entry');
			const name = new TextDecoder().decode(slice);
			table.names.push(name);
			table.indexOf.set(name, index + 1);
			reader.position = start + length;
		}

		return { table, nextOffset: reader.position };
	}

	decode(index: number): string {
		if (index < 1 || index > this.names.length) return '';
		return this.names[index - 1] ?? '';
	}
}
