import { describe, expect, it } from 'vite-plus/test';
import { CORE_SHELL_MESSAGE_KEYS, en, zhCn } from './host-messages';

describe('host-messages', () => {
	it('keeps zh-cn and en keys in parity', () => {
		expect(Object.keys(en).sort()).toEqual(Object.keys(zhCn).sort());
	});

	it('uses valid keys in CORE_SHELL_MESSAGE_KEYS', () => {
		for (const key of CORE_SHELL_MESSAGE_KEYS) {
			expect(key in zhCn).toBe(true);
			expect(key in en).toBe(true);
		}
	});
});
