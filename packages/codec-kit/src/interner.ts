export interface StringInternerOptions {
	maxEntries?: number;
	seed?: string;
}

export class StringInterner {
	readonly strings: string[] = [];
	private readonly index = new Map<string, number>();
	private readonly maxEntries: number;

	constructor(options: StringInternerOptions = {}) {
		this.maxEntries = options.maxEntries ?? Number.POSITIVE_INFINITY;
		if (options.seed !== undefined) this.intern(options.seed);
	}

	intern(value: string | null | undefined): number {
		const trimmed = value?.trim() ?? '';
		if (!trimmed) return -1;

		const existing = this.index.get(trimmed);
		if (existing !== undefined) return existing;

		if (this.strings.length >= this.maxEntries) {
			throw new RangeError('string table overflow');
		}
		const index = this.strings.length;
		this.strings.push(trimmed);
		this.index.set(trimmed, index);
		return index;
	}
}
