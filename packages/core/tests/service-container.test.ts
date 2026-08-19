import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ServiceContainer,
	createServiceIdentifier,
	type IHttpService,
	type Disposable
} from '../src';

describe('ServiceContainer in @chronos/core', () => {
	it('registers and retrieves service by ServiceIdentifier', () => {
		const container = new ServiceContainer();
		const customId = createServiceIdentifier<{ name: string }>('customService');

		expect(container.has(customId)).toBe(false);
		expect(container.tryGet(customId)).toBeUndefined();

		const instance = { name: 'ChronosCustom' };
		const sub = container.register(customId, instance);

		expect(container.has(customId)).toBe(true);
		expect(container.get(customId)).toBe(instance);
		expect(container.tryGet(customId)).toBe(instance);

		sub.dispose();
		expect(container.has(customId)).toBe(false);
		expect(container.tryGet(customId)).toBeUndefined();
	});

	it('throws error when requesting unregistered service with get()', () => {
		const container = new ServiceContainer();
		const missingId = createServiceIdentifier<IHttpService>('missingHttp');

		expect(() => container.get(missingId)).toThrowError(
			'[ServiceContainer] Service not found: "missingHttp"'
		);
	});

	it('disposes registered disposable services on container.dispose()', () => {
		const container = new ServiceContainer();
		const disposeFn = vi.fn();

		const disposableService: Disposable = {
			dispose: disposeFn
		};

		const serviceId = createServiceIdentifier<Disposable>('disposableSvc');
		container.register(serviceId, disposableService);

		container.dispose();

		expect(disposeFn).toHaveBeenCalledTimes(1);
		expect(container.has(serviceId)).toBe(false);
	});
});
