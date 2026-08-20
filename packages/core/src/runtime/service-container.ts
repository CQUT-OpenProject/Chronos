import type { Disposable, ServiceIdentifier } from '../types/services';

export class ServiceContainer implements Disposable {
	private services = new Map<string, unknown>();
	private registerListeners = new Set<(key: string, instance: unknown) => void>();
	private unregisterListeners = new Set<(key: string) => void>();

	register<T>(identifier: ServiceIdentifier<T>, instance: T): Disposable {
		const key = identifier.key;
		this.services.set(key, instance);
		this.notifyRegistered(key, instance);

		return {
			dispose: () => {
				if (this.services.get(key) === instance) {
					this.services.delete(key);
					this.notifyUnregistered(key);
				}
			}
		};
	}

	get<T>(identifier: ServiceIdentifier<T>): T {
		const service = this.tryGet(identifier);
		if (service === undefined) {
			throw new Error(`[ServiceContainer] Service not found: "${identifier.key}"`);
		}
		return service;
	}

	tryGet<T>(identifier: ServiceIdentifier<T>): T | undefined {
		return this.services.get(identifier.key) as T | undefined;
	}

	has<T>(identifier: ServiceIdentifier<T>): boolean {
		return this.services.has(identifier.key);
	}

	hasKey(key: string): boolean {
		return this.services.has(key);
	}

	keys(): string[] {
		return Array.from(this.services.keys());
	}

	onServiceRegistered(listener: (key: string, instance: unknown) => void): Disposable {
		this.registerListeners.add(listener);
		return {
			dispose: () => {
				this.registerListeners.delete(listener);
			}
		};
	}

	onServiceUnregistered(listener: (key: string) => void): Disposable {
		this.unregisterListeners.add(listener);
		return {
			dispose: () => {
				this.unregisterListeners.delete(listener);
			}
		};
	}

	private notifyRegistered(key: string, instance: unknown): void {
		for (const listener of this.registerListeners) {
			try {
				listener(key, instance);
			} catch (err) {
				console.error(`[ServiceContainer] Error in register listener for "${key}":`, err);
			}
		}
	}

	private notifyUnregistered(key: string): void {
		for (const listener of this.unregisterListeners) {
			try {
				listener(key);
			} catch (err) {
				console.error(`[ServiceContainer] Error in unregister listener for "${key}":`, err);
			}
		}
	}

	dispose(): void {
		const keys = Array.from(this.services.keys());
		for (const key of keys) {
			const service = this.services.get(key);
			if (
				service &&
				typeof service === 'object' &&
				'dispose' in service &&
				typeof (service as Disposable).dispose === 'function'
			) {
				try {
					(service as Disposable).dispose();
				} catch (error) {
					console.error(`[ServiceContainer] Error disposing service "${key}":`, error);
				}
			}
			this.notifyUnregistered(key);
		}
		this.services.clear();
		this.registerListeners.clear();
		this.unregisterListeners.clear();
	}
}
