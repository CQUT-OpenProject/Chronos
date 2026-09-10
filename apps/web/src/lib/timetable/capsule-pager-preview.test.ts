import { describe, expect, it, vi } from 'vite-plus/test';
import { createCapsulePagerPreview } from '$lib/timetable/capsule-pager-preview';

describe('createCapsulePagerPreview', () => {
	it('delivers the current preview when a target attaches late', () => {
		const bridge = createCapsulePagerPreview();
		const onPreview = vi.fn();

		bridge.setPreview(5.5);
		bridge.attach({ onPagerPreviewWeek: onPreview });

		expect(onPreview).toHaveBeenCalledOnce();
		expect(onPreview).toHaveBeenCalledWith(5.5);
	});

	it('forwards preview updates synchronously to the attached target', () => {
		const bridge = createCapsulePagerPreview();
		const onPreview = vi.fn();
		bridge.attach({ onPagerPreviewWeek: onPreview });

		bridge.setPreview(4.25);
		bridge.setPreview(4.75);
		bridge.clearPreview();

		expect(onPreview).toHaveBeenCalledTimes(3);
		expect(onPreview).toHaveBeenNthCalledWith(1, 4.25);
		expect(onPreview).toHaveBeenNthCalledWith(2, 4.75);
		expect(onPreview).toHaveBeenNthCalledWith(3, null);
	});

	it('stops notifying after detach', () => {
		const bridge = createCapsulePagerPreview();
		const onPreview = vi.fn();
		bridge.attach({ onPagerPreviewWeek: onPreview });
		bridge.detach();

		bridge.setPreview(3.5);

		expect(onPreview).not.toHaveBeenCalled();
		expect(bridge.current).toBe(3.5);
	});
});
