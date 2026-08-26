import type { Disposable } from '../types/services';
import type { ChronosEvents } from '../types/context';

export type NextFunction<R = unknown> = () => Promise<R> | R;
export type WaterfallHandler<T = unknown, R = unknown> = (
	payload: T,
	next: NextFunction<R>
) => Promise<R> | R;
export type SerialHandler<T = unknown> = (payload: T) => Promise<boolean | void> | boolean | void;
export type BroadcastHandler<T = unknown> = (payload: T) => Promise<void> | void;

export class EventPipeline implements Disposable {
	private broadcastListeners = new Map<string, Set<BroadcastHandler<unknown>>>();
	private waterfallHooks = new Map<string, Array<WaterfallHandler<unknown, unknown>>>();
	private serialHooks = new Map<string, Array<SerialHandler<unknown>>>();

	// === 1. Broadcast / Parallel Events ===
	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		const key = String(event);
		let handlers = this.broadcastListeners.get(key);
		if (!handlers) {
			handlers = new Set();
			this.broadcastListeners.set(key, handlers);
		}

		const genericHandler = handler as BroadcastHandler<unknown>;
		handlers.add(genericHandler);

		return {
			dispose: () => {
				handlers?.delete(genericHandler);
				if (handlers?.size === 0) {
					this.broadcastListeners.delete(key);
				}
			}
		};
	}

	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void {
		const handlers = this.broadcastListeners.get(String(event));
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

	// === 2. Waterfall Onion Middleware Pipeline ===
	// FROZEN BASELINE — 引擎动作内部调用 waterfall/serial，但注册面当前零消费者
	// （见 CONTEXT.md EventPipeline 段）。与 hosts/native-protocol.ts 同款到期条款：
	// 不新增公开 API；若两个发布周期内仍无真实消费方，连同引擎动作中的
	// guard/waterfall 包装一并整体移除，而非让休眠面长期挂在导出表面。
	registerWaterfall<T = unknown, R = unknown>(
		event: string,
		handler: WaterfallHandler<T, R>
	): Disposable {
		let hooks = this.waterfallHooks.get(event);
		if (!hooks) {
			hooks = [];
			this.waterfallHooks.set(event, hooks);
		}

		const genericHandler = handler as WaterfallHandler<unknown, unknown>;
		hooks.push(genericHandler);

		return {
			dispose: () => {
				const list = this.waterfallHooks.get(event);
				if (list) {
					const idx = list.indexOf(genericHandler);
					if (idx >= 0) list.splice(idx, 1);
					if (list.length === 0) this.waterfallHooks.delete(event);
				}
			}
		};
	}

	async waterfall<T = unknown, R = unknown>(
		event: string,
		payload: T,
		fallback: (p: T) => Promise<R> | R
	): Promise<R> {
		const hooks = this.waterfallHooks.get(event) ?? [];

		const dispatch = async (currentIndex: number, currentPayload: T): Promise<R> => {
			if (currentIndex >= hooks.length) {
				return fallback(currentPayload);
			}
			const hook = hooks[currentIndex]!;
			return (await hook(currentPayload, () => dispatch(currentIndex + 1, currentPayload))) as R;
		};

		return dispatch(0, payload);
	}

	// === 3. Serial Guard Pipeline (Short-circuit on false) ===
	// 同上：FROZEN BASELINE，到期即随 waterfall 一起移除。
	registerSerial<T = unknown>(event: string, handler: SerialHandler<T>): Disposable {
		let hooks = this.serialHooks.get(event);
		if (!hooks) {
			hooks = [];
			this.serialHooks.set(event, hooks);
		}

		const genericHandler = handler as SerialHandler<unknown>;
		hooks.push(genericHandler);

		return {
			dispose: () => {
				const list = this.serialHooks.get(event);
				if (list) {
					const idx = list.indexOf(genericHandler);
					if (idx >= 0) list.splice(idx, 1);
					if (list.length === 0) this.serialHooks.delete(event);
				}
			}
		};
	}

	async serial<T = unknown>(event: string, payload: T): Promise<boolean> {
		const hooks = this.serialHooks.get(event);
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
		this.broadcastListeners.clear();
		this.waterfallHooks.clear();
		this.serialHooks.clear();
	}
}
