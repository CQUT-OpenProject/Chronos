import type { Disposable } from '../types/services';

export type SerialHandler<T = unknown> = (payload: T) => Promise<boolean | void> | boolean | void;

/**
 * Short-circuit guard pipeline (`false` rejects engine actions).
 * Paired with waterfall registry; both are frozen baseline extension points.
 */
export class EventSerialRegistry implements Disposable {
	private hooks = new Map<string, Array<SerialHandler<unknown>>>();

	register<T = unknown>(event: string, handler: SerialHandler<T>): Disposable {
		let list = this.hooks.get(event);
		if (!list) {
			list = [];
			this.hooks.set(event, list);
		}

		const genericHandler = handler as SerialHandler<unknown>;
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

	async run<T = unknown>(event: string, payload: T): Promise<boolean> {
		const hooks = this.hooks.get(event);
		if (!hooks || hooks.length === 0) return true;

		for (const hook of hooks) {
			try {
				const result = await hook(payload);
				if (result === false) {
					return false;
				}
			} catch (error) {
				console.error(`[EventPipeline] Error in serial guard "${event}":`, error);
				return false;
			}
		}

		return true;
	}

	dispose(): void {
		this.hooks.clear();
	}
}
