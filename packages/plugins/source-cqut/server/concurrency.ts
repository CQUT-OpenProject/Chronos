export async function mapWithConcurrency<T, R>(
	items: T[],
	limit: number,
	mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
	if (items.length === 0) return [];

	const concurrency = Math.max(1, Math.min(limit, items.length));
	const results: R[] = Array.from({ length: items.length });
	let nextIndex = 0;

	async function worker(): Promise<void> {
		while (nextIndex < items.length) {
			const currentIndex = nextIndex;
			nextIndex += 1;
			results[currentIndex] = await mapper(items[currentIndex]!, currentIndex);
		}
	}

	await Promise.all(Array.from({ length: concurrency }, () => worker()));
	return results;
}
