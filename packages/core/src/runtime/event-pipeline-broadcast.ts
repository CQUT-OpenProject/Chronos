import type { Disposable } from '../types/services';
import type { ChronosEvents } from '../types/context';

export type BroadcastHandler<T = unknown> = (payload: T) => Promise<void> | void;

/** Typed broadcast listeners for ChronosEvents. */
export class EventBroadcastRegistry implements Disposable {
	private listeners = new Map<string, Set<BroadcastHandler<unknown>>>();

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		const key = String(event);
		let handlers = this.listeners.get(key);
		if (!handlers) {
			handlers = new Set();
			this.listeners.set(key, handlers);
		}

		const genericHandler = handler as BroadcastHandler<unknown>;
		handlers.add(genericHandler);

		return {
			dispose: () => {
				handlers?.delete(genericHandler);
				if (handlers?.size === 0) {
					this.listeners.delete(key);
				}
			}
		};
	}

	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void {
		const handlers = this.listeners.get(String(event));
		if (!handlers || handlers.size === 0) return;

		for (const handler of handlers) {
			try {
				const result = handler(payload);
				if (result instanceof Promise) {
					result.catch((error) => {
						console.error(
							`[EventPipeline] Unhandled error in async listener for "${String(event)}":`,
							error
						);
					});
				}
			} catch (error) {
				console.error(`[EventPipeline] Unhandled error in listener for "${String(event)}":`, error);
			}
		}
	}

	dispose(): void {
		this.listeners.clear();
	}
}
