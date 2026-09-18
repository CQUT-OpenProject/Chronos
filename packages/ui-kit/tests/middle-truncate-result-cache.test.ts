import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	getMiddleTruncateResult,
	setMiddleTruncateResult,
	subscribeMiddleTruncateFontChanges
} from '../src/utils/middle-truncate-result-cache';

afterEach(() => vi.unstubAllGlobals());

describe('middle truncate result cache', () => {
	it('evicts the least recently used result when full', () => {
		for (let index = 0; index < 512; index += 1) {
			setMiddleTruncateResult(`item-${index}`, `${index}`);
		}
		expect(getMiddleTruncateResult('item-0')).toBe('0');
		setMiddleTruncateResult('overflow', 'next');
		expect(getMiddleTruncateResult('item-1')).toBeUndefined();
		expect(getMiddleTruncateResult('item-0')).toBe('0');
	});

	it('clears results and notifies mounted cards when fonts load', () => {
		const fonts = new EventTarget();
		vi.stubGlobal('document', { fonts });
		const onFontChange = vi.fn();
		const unsubscribe = subscribeMiddleTruncateFontChanges(onFontChange);
		setMiddleTruncateResult('course-title', '课…程');
		fonts.dispatchEvent(new Event('loadingdone'));
		expect(getMiddleTruncateResult('course-title')).toBeUndefined();
		expect(onFontChange).toHaveBeenCalledOnce();
		unsubscribe();
	});
});
