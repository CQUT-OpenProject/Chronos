/** Remove all keys in a Web Storage object that start with the given prefix. */
export function clearKeysWithPrefix(storage: Storage, prefix: string): void {
	const keysToRemove: string[] = [];
	for (let i = 0; i < storage.length; i++) {
		const key = storage.key(i);
		if (key?.startsWith(prefix)) {
			keysToRemove.push(key);
		}
	}
	for (const key of keysToRemove) {
		storage.removeItem(key);
	}
}
