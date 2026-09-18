export function isAbortError(err: unknown): boolean {
	if (!err) return false;
	if (typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
		return true;
	}
	if (err instanceof Error && (err.message === 'Aborted' || err.name === 'AbortError')) {
		return true;
	}
	return false;
}

/** Swallow expected abort rejections from in-flight hot-update promises. */
export async function swallowAbortRejection(promise: Promise<unknown>): Promise<void> {
	try {
		await promise;
	} catch (err) {
		if (!isAbortError(err)) throw err;
	}
}
