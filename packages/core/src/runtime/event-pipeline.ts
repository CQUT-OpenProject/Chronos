import type { Disposable } from '../types/services';
import type { ChronosEvents } from '../types/context';
import { EventBroadcastRegistry } from './event-pipeline-broadcast';
import {
	EventWaterfallRegistry,
	type NextFunction,
	type WaterfallHandler
} from './event-pipeline-waterfall';
import { EventSerialRegistry, type SerialHandler } from './event-pipeline-serial';

export type { NextFunction, WaterfallHandler, SerialHandler };

/**
 * Facade over broadcast, waterfall, and serial registries.
 * Engine actions call `serial`/`waterfall`; plugins subscribe via `on`.
 */
export class EventPipeline implements Disposable {
	private readonly broadcast = new EventBroadcastRegistry();
	private readonly waterfallHub = new EventWaterfallRegistry();
	private readonly serialRegistry = new EventSerialRegistry();

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.broadcast.on(event, handler);
	}

	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void {
		this.broadcast.emit(event, payload);
	}

	registerWaterfall<T = unknown, R = unknown>(
		event: string,
		handler: WaterfallHandler<T, R>
	): Disposable {
		return this.waterfallHub.register(event, handler);
	}

	async waterfall<T = unknown, R = unknown>(
		event: string,
		payload: T,
		fallback: (p: T) => Promise<R> | R
	): Promise<R> {
		return this.waterfallHub.run(event, payload, fallback);
	}

	registerSerial<T = unknown>(event: string, handler: SerialHandler<T>): Disposable {
		return this.serialRegistry.register(event, handler);
	}

	async serial<T = unknown>(event: string, payload: T): Promise<boolean> {
		return this.serialRegistry.run(event, payload);
	}

	dispose(): void {
		this.broadcast.dispose();
		this.waterfallHub.dispose();
		this.serialRegistry.dispose();
	}
}
