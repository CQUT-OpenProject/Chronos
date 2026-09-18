const MAX_ENTRIES = 512;

const results = new Map<string, string>();
const fontListeners = new Set<() => void>();

function onFontsLoaded() {
	results.clear();
	for (const listener of fontListeners) listener();
}

export function getMiddleTruncateResult(key: string): string | undefined {
	const result = results.get(key);
	if (result !== undefined) {
		results.delete(key);
		results.set(key, result);
	}
	return result;
}

export function setMiddleTruncateResult(key: string, result: string): void {
	results.delete(key);
	results.set(key, result);
	if (results.size > MAX_ENTRIES) results.delete(results.keys().next().value!);
}

export function subscribeMiddleTruncateFontChanges(listener: () => void): () => void {
	if (fontListeners.size === 0) document.fonts?.addEventListener('loadingdone', onFontsLoaded);
	fontListeners.add(listener);
	return () => {
		fontListeners.delete(listener);
		if (fontListeners.size === 0) {
			document.fonts?.removeEventListener('loadingdone', onFontsLoaded);
			results.clear();
		}
	};
}
