import type { Disposable } from '../types/services';

export type NextFunction<R = unknown> = () => Promise<R> | R;
export type WaterfallHandler<T = unknown, R = unknown> = (
	payload: T,
	next: NextFunction<R>
) => Promise<R> | R;

/**
 * Onion middleware registry used by engine timetable/course actions.
 * Registration surface is frozen baseline — no external consumers yet.
 */
export class EventWaterfallRegistry implements Disposable {
	private hooks = new Map<string, Array<WaterfallHandler<unknown, unknown>>>();

	register<T = unknown, R = unknown>(event: string, handler: WaterfallHandler<T, R>): Disposable {
		let list = this.hooks.get(event);
		if (!list) {
			list = [];
			this.hooks.set(event, list);
		}

		const genericHandler = handler as WaterfallHandler<unknown, unknown>;
		list.push(genericHandler);

		return {
			dispose: () => {
				const hooks = this.hooks.get(event);
				if (!hooks) return;
				const idx = hooks.indexOf(genericHandler);
				if (idx >= 0) hooks.splice(idx, 1);
				if (hooks.length === 0) this.hooks.delete(event);
			}
		};
	}

	async run<T = unknown, R = unknown>(
		event: string,
		payload: T,
		fallback: (p: T) => Promise<R> | R
	): Promise<R> {
		const hooks = this.hooks.get(event) ?? [];

		const dispatch = async (currentIndex: number, currentPayload: T): Promise<R> => {
			if (currentIndex >= hooks.length) {
				return fallback(currentPayload);
			}
			const hook = hooks[currentIndex]!;
			return (await hook(currentPayload, () => dispatch(currentIndex + 1, currentPayload))) as R;
		};

		return dispatch(0, payload);
	}

	dispose(): void {
		this.hooks.clear();
	}
}
