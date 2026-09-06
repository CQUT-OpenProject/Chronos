import { describe, expect, it, vi } from 'vite-plus/test';
import { createRafCoalescer } from '$lib/utils/raf-coalescer';

describe('createRafCoalescer', () => {
	it('coalesces multiple schedule calls into one flush', () => {
		vi.useFakeTimers();
		const onFlush = vi.fn();
		const coalescer = createRafCoalescer(onFlush);

		coalescer.schedule(1);
		coalescer.schedule(2);
		coalescer.schedule(3);

		expect(onFlush).not.toHaveBeenCalled();
		vi.runAllTimers();
		expect(onFlush).toHaveBeenCalledOnce();
		expect(onFlush).toHaveBeenCalledWith(3);

		vi.useRealTimers();
	});

	it('flush bypasses pending frame and cancels schedule', () => {
		const onFlush = vi.fn();
		const coalescer = createRafCoalescer(onFlush);

		coalescer.schedule(1);
		coalescer.flush(5);

		expect(onFlush).toHaveBeenCalledOnce();
		expect(onFlush).toHaveBeenCalledWith(5);
	});

	it('cancel drops pending value without flushing', () => {
		vi.useFakeTimers();
		const onFlush = vi.fn();
		const coalescer = createRafCoalescer(onFlush);

		coalescer.schedule(1);
		coalescer.cancel();
		vi.runAllTimers();

		expect(onFlush).not.toHaveBeenCalled();
		vi.useRealTimers();
	});
});
