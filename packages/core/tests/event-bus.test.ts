import { describe, it, expect, vi } from 'vite-plus/test';
import { EventBus } from '../src/runtime/event-bus';
import { createTimetable } from '../src/domain/timetable';

describe('EventBus in @chronos/core', () => {
	it('subscribes to events and receives emitted payload', async () => {
		const bus = new EventBus();
		const listener = vi.fn();

		const timetable = createTimetable({ id: 't1', name: '测试课表' });
		bus.on('timetable:loaded', listener);

		await bus.emit('timetable:loaded', { timetable });

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith({ timetable });
	});

	it('unsubscribes when disposable is called', async () => {
		const bus = new EventBus();
		const listener = vi.fn();

		const sub = bus.on('theme:changed', listener);
		await bus.emit('theme:changed', { themeId: 'catppuccin' });
		expect(listener).toHaveBeenCalledTimes(1);

		sub.dispose();
		await bus.emit('theme:changed', { themeId: 'nord' });
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('handles async listeners properly', async () => {
		const bus = new EventBus();
		let asyncFinished = false;

		bus.on('slots:updated', async () => {
			await new Promise((r) => setTimeout(r, 10));
			asyncFinished = true;
		});

		await bus.emit('slots:updated', undefined);
		expect(asyncFinished).toBe(true);
	});

	it('isolates errors in listeners and does not crash bus', async () => {
		const bus = new EventBus();
		const spyErr = vi.spyOn(console, 'error').mockImplementation(() => {});

		const failingListener = () => {
			throw new Error('Boom!');
		};
		const successListener = vi.fn();

		bus.on('theme:changed', failingListener);
		bus.on('theme:changed', successListener);

		await bus.emit('theme:changed', { themeId: 'test' });

		expect(successListener).toHaveBeenCalledTimes(1);
		expect(spyErr).toHaveBeenCalled();

		spyErr.mockRestore();
	});

	it('clears all listeners on dispose', async () => {
		const bus = new EventBus();
		const listener = vi.fn();

		bus.on('theme:changed', listener);
		bus.dispose();

		await bus.emit('theme:changed', { themeId: 'test' });
		expect(listener).not.toHaveBeenCalled();
	});
});
