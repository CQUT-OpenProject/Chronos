import type { Disposable, ServiceIdentifier } from '../types/services';

export class ServiceContainer implements Disposable {
	private services = new Map<string, unknown>();

	register<T>(identifier: ServiceIdentifier<T>, instance: T): Disposable {
		const key = identifier.key;
		this.services.set(key, instance);

		return {
			dispose: () => {
				if (this.services.get(key) === instance) {
					this.services.delete(key);
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

	dispose(): void {
		for (const [key, service] of this.services) {
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
		}
		this.services.clear();
	}
}
