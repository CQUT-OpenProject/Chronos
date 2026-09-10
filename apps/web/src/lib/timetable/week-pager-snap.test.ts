import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createWeekPagerSnap } from './week-pager-snap';

function createHarness(initialOffset = 9000, reducedMotion = false) {
	let now = 0;
	let nextFrame = 1;
	const frames = new Map<number, FrameRequestCallback>();
	vi.spyOn(performance, 'now').mockImplementation(() => now);
	vi.stubGlobal('window', { matchMedia: () => ({ matches: reducedMotion }) });
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		const id = nextFrame++;
		frames.set(id, callback);
		return id;
	});
	vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));

	const positions: number[] = [];
	const node = Object.assign(new EventTarget(), {
		clientWidth: 1000,
		scrollWidth: 20000,
		scrollLeft: initialOffset,
		style: { scrollSnapType: '', overflowX: '' },
		ownerDocument: new EventTarget(),
		scrollTo({ left }: ScrollToOptions): void {
			this.scrollLeft = left ?? this.scrollLeft;
			positions.push(this.scrollLeft);
			node.dispatchEvent(new Event('scroll'));
		}
	});
	const onSettled = vi.fn();
	const snap = createWeekPagerSnap(node as unknown as HTMLElement, onSettled);

	function scroll(left: number, elapsed = 20) {
		now += elapsed;
		node.scrollLeft = left;
		node.dispatchEvent(new Event('scroll'));
	}

	function advance(elapsed: number) {
		const end = now + elapsed;
		while (frames.size > 0 && now < end) {
			now = Math.min(end, now + 16);
			const pending = [...frames.values()];
			frames.clear();
			for (const callback of pending) callback(now);
		}
		now = end;
	}

	function approach(target = 10000, direction = 1) {
		scroll(target - direction * 150);
		scroll(target - direction * 100);
		scroll(target - direction * 38);
		scroll(target - direction * 18, 40);
	}

	return { node, snap, onSettled, positions, scroll, advance, approach };
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('week pager snap finish', () => {
	it.each([1, -1])('shortens the slow tail without overshooting in direction %s', (direction) => {
		const h = createHarness(direction === 1 ? 9000 : 11000);
		h.approach(10000, direction);
		expect(h.snap.isAnimating).toBe(true);

		h.advance(60);
		expect(h.node.scrollLeft).toBe(10000);
		expect(h.positions.every((left) => direction * (10000 - left) >= 0)).toBe(true);
		expect(
			h.positions.every((left, i) => i === 0 || direction * (left - h.positions[i - 1]) >= 0)
		).toBe(true);

		h.advance(16);
		expect(h.snap.isAnimating).toBe(false);
		expect(h.onSettled).toHaveBeenCalledTimes(1);
		expect(h.node.style).toEqual({ scrollSnapType: '', overflowX: '' });
		h.snap.destroy();
	});

	it.each([1, -1])('only decelerates from the incoming speed in direction %s', (direction) => {
		const h = createHarness(direction === 1 ? 9000 : 11000);
		h.approach(10000, direction);
		let previousOffset = h.node.scrollLeft;
		let previousSpeed = 0.5;
		for (let elapsed = 0; elapsed < 64; elapsed += 8) {
			h.advance(8);
			const speed = (direction * (h.node.scrollLeft - previousOffset)) / 8;
			expect(speed).toBeGreaterThanOrEqual(0);
			expect(speed).toBeLessThanOrEqual(previousSpeed + 1e-9);
			previousOffset = h.node.scrollLeft;
			previousSpeed = speed;
		}
		expect(h.node.scrollLeft).toBe(10000);
		h.snap.destroy();
	});

	it('does not pull a slow distant page into place with a second acceleration', () => {
		const h = createHarness();
		h.scroll(9850);
		h.scroll(9900);
		h.scroll(9940);
		h.scroll(9960, 40);
		expect(h.snap.isAnimating).toBe(true);
		let previousOffset = h.node.scrollLeft;
		let previousSpeed = 0.5;
		for (let elapsed = 0; elapsed < 128; elapsed += 16) {
			h.advance(16);
			const speed = (h.node.scrollLeft - previousOffset) / 16;
			expect(speed).toBeGreaterThanOrEqual(0);
			expect(speed).toBeLessThanOrEqual(previousSpeed + 1e-9);
			previousOffset = h.node.scrollLeft;
			previousSpeed = speed;
		}
		expect(h.node.scrollLeft).toBe(10000);
		h.snap.destroy();
	});

	it('leaves fast multi-week motion and motion away from a nearby page native', () => {
		const h = createHarness();
		h.scroll(9920);
		h.scroll(9960);
		expect(h.snap.isAnimating).toBe(false);
		h.scroll(10020, 40);
		h.scroll(10040, 40);
		expect(h.snap.isAnimating).toBe(false);
		expect(h.positions).toEqual([]);
		h.snap.destroy();
	});

	it('does not take over while the finger is down after native pointer cancellation', () => {
		const h = createHarness();
		h.node.dispatchEvent(Object.assign(new Event('touchstart'), { touches: [{}] }));
		h.node.ownerDocument.dispatchEvent(new Event('pointercancel'));
		h.approach();
		expect(h.snap.isAnimating).toBe(false);
		h.node.dispatchEvent(Object.assign(new Event('touchend'), { touches: [] }));
		h.scroll(9992, 40);
		expect(h.snap.isAnimating).toBe(true);
		h.snap.destroy();
	});

	it('waits for wheel input to finish before accelerating its tail', () => {
		const h = createHarness();
		h.scroll(9850);
		h.scroll(9900);
		h.node.dispatchEvent(new Event('wheel'));
		h.scroll(9968);
		h.scroll(9988);
		expect(h.snap.isAnimating).toBe(false);
		h.scroll(9994);
		expect(h.snap.isAnimating).toBe(true);
		h.snap.destroy();
	});

	it.each(['pointerdown', 'touchstart', 'wheel', 'keydown'])(
		'lets %s interrupt from the visible position',
		(event) => {
			const h = createHarness();
			h.approach();
			h.advance(32);
			const interruptedOffset = h.node.scrollLeft;
			h.node.dispatchEvent(Object.assign(new Event(event), { touches: [{}] }));
			h.advance(240);
			expect(h.snap.isAnimating).toBe(false);
			expect(h.node.scrollLeft).toBe(interruptedOffset);
			expect(h.onSettled).not.toHaveBeenCalled();
			expect(h.node.style).toEqual({ scrollSnapType: '', overflowX: '' });
			h.snap.destroy();
		}
	);

	it('can reverse to the previous week after interrupting a forward finish', () => {
		const h = createHarness();
		h.approach();
		h.advance(32);
		h.node.dispatchEvent(new Event('pointerdown'));
		h.node.ownerDocument.dispatchEvent(new Event('pointerup'));
		h.approach(9000, -1);
		h.advance(160);
		expect(h.node.scrollLeft).toBe(9000);
		expect(h.onSettled).toHaveBeenCalledTimes(1);
		h.snap.destroy();
	});

	it.each([0, 19000])('lands exactly on the timetable boundary %s', (target) => {
		const direction = target === 0 ? -1 : 1;
		const h = createHarness(target - direction * 1000);
		h.approach(target, direction);
		h.advance(160);
		expect(h.node.scrollLeft).toBe(target);
		expect(h.positions.every((left) => left >= 0 && left <= 19000)).toBe(true);
		h.snap.destroy();
	});

	it('cancels on resize and restores native snapping', () => {
		const h = createHarness();
		h.approach();
		h.node.clientWidth = 800;
		h.advance(160);
		expect(h.snap.isAnimating).toBe(false);
		expect(h.node.style).toEqual({ scrollSnapType: '', overflowX: '' });
		expect(h.onSettled).not.toHaveBeenCalled();
		h.snap.destroy();
	});

	it('does not add an animation when reduced motion is preferred', () => {
		const h = createHarness(9000, true);
		h.approach();
		h.advance(160);
		expect(h.positions).toEqual([]);
		expect(h.snap.isAnimating).toBe(false);
		h.snap.destroy();
	});

	it('removes listeners and cancels pending frames on detach', () => {
		const h = createHarness();
		h.approach();
		h.snap.destroy();
		h.advance(160);
		h.approach();
		expect(h.snap.isAnimating).toBe(false);
		expect(h.positions).toHaveLength(1);
		expect(h.onSettled).not.toHaveBeenCalled();
	});
});
