import type { TimetableViewPrefs } from '@chronos/core';

export function createViewPrefsSaver(save: (prefs: TimetableViewPrefs) => Promise<void>) {
	let latest: TimetableViewPrefs | undefined;
	let inFlight = false;
	let inflightPromise = Promise.resolve();

	async function flush() {
		if (inFlight) return inflightPromise;
		inFlight = true;
		inflightPromise = (async () => {
			try {
				while (latest !== undefined) {
					const snapshot = latest;
					await save(snapshot);
					if (latest === snapshot) latest = undefined;
				}
			} finally {
				inFlight = false;
				if (latest !== undefined) await flush();
			}
		})();
		return inflightPromise;
	}

	return {
		apply(base: TimetableViewPrefs, patch: Partial<TimetableViewPrefs>): TimetableViewPrefs {
			latest = { ...(latest ?? base), ...patch };
			void flush();
			return latest;
		},
		whenIdle() {
			return inflightPromise;
		}
	};
}
