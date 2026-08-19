import type { Disposable } from '../types/env';
import type { ChronosEvents } from '../types/context';

type EventHandler<T> = (payload: T) => void | Promise<void>;

export class EventBus implements Disposable {
	private listeners = new Map<keyof ChronosEvents, Set<EventHandler<unknown>>>();

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		let handlers = this.listeners.get(event);
		if (!handlers) {
			handlers = new Set();
			this.listeners.set(event, handlers);
		}

		const genericHandler = handler as EventHandler<unknown>;
		handlers.add(genericHandler);

		return {
			dispose: () => {
				handlers?.delete(genericHandler);
				if (handlers?.size === 0) {
					this.listeners.delete(event);
				}
			}
		};
	}

	async emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): Promise<void> {
		const handlers = this.listeners.get(event);
		if (!handlers || handlers.size === 0) return;

		const snapshot = Array.from(handlers);
		const promises: Promise<void>[] = [];

		for (const handler of snapshot) {
			try {
				const result = handler(payload);
				if (result instanceof Promise) {
					promises.push(
						result.catch((error) => {
							console.error(
								`[EventBus] Unhandled error in async listener for "${String(event)}":`,
								error
							);
						})
					);
				}
			} catch (error) {
				console.error(`[EventBus] Unhandled error in listener for "${String(event)}":`, error);
			}
		}

		if (promises.length > 0) {
			await Promise.all(promises);
		}
	}

	dispose(): void {
		this.listeners.clear();
	}
}
