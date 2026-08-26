import { describe, it, expect, vi } from 'vite-plus/test';
import { EventPipeline } from '../src/runtime/event-pipeline';

describe('EventPipeline', () => {
	it('broadcasts events with emit', () => {
		const pipeline = new EventPipeline();
		const received: string[] = [];

		pipeline.on('theme:changed', ({ themeId }) => {
			received.push(themeId);
		});

		pipeline.emit('theme:changed', { themeId: 'theme-1' });
		pipeline.emit('theme:changed', { themeId: 'theme-2' });
		expect(received).toEqual(['theme-1', 'theme-2']);

		pipeline.dispose();
	});

	it('intercepts and transforms payloads via waterfall middleware', async () => {
		const pipeline = new EventPipeline();

		// Hook 1: Prefix name
		pipeline.registerWaterfall<{ name: string }, string>('action:format', async (payload, next) => {
			payload.name = `[VIP] ${payload.name}`;
			const res = await next();
			return `${res} (Approved)`;
		});

		// Hook 2: Upper case
		pipeline.registerWaterfall<{ name: string }, string>('action:format', async (payload, next) => {
			payload.name = payload.name.toUpperCase();
			return next();
		});

		const result = await pipeline.waterfall<{ name: string }, string>(
			'action:format',
			{ name: 'john' },
			(p) => `Hello, ${p.name}`
		);

		expect(result).toBe('Hello, [VIP] JOHN (Approved)');

		pipeline.dispose();
	});

	it('supports serial guard short-circuiting', async () => {
		const pipeline = new EventPipeline();
		const step2 = vi.fn();

		pipeline.registerSerial<{ count: number }>('guard:check', (payload) => {
			if (payload.count > 10) return false;
			return true;
		});

		pipeline.registerSerial<{ count: number }>('guard:check', () => {
			step2();
			return true;
		});

		const allowed = await pipeline.serial('guard:check', { count: 5 });
		expect(allowed).toBe(true);
		expect(step2).toHaveBeenCalledTimes(1);

		const blocked = await pipeline.serial('guard:check', { count: 15 });
		expect(blocked).toBe(false);
		expect(step2).toHaveBeenCalledTimes(1); // Not called when first returns false

		pipeline.dispose();
	});
});
