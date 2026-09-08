import type { Disposable } from '../types/services';
import type { ChronosEvents } from '../types/context';
import { EventBroadcastRegistry } from './event-pipeline-broadcast';

/**
 * Event pipeline for broadcasting Chronos events.
 */
export class EventPipeline implements Disposable {
	private readonly broadcast = new EventBroadcastRegistry();

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.broadcast.on(event, handler);
	}

	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void {
		this.broadcast.emit(event, payload);
	}

	dispose(): void {
		this.broadcast.dispose();
	}
}
