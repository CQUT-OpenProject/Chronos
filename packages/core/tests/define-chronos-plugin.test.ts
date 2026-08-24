import { describe, expect, it, vi } from 'vite-plus/test';
import { defineChronosPlugin } from '../src/plugin/define-chronos-plugin';
import { resolveLocalizedText } from '../src/types/slots';
import type { ChronosContext } from '../src/types/context';

const TEST_MESSAGES = {
	'zh-cn': {
		'plugin.name': '测试插件',
		'plugin.description': '测试描述'
	},
	en: {
		'plugin.name': 'Test Plugin',
		'plugin.description': 'Test description'
	}
};

describe('defineChronosPlugin', () => {
	it('registers messages and resolves localized name after apply', async () => {
		const registerMessages = vi.fn(() => ({ dispose: vi.fn() }));
		const registerSlot = vi.fn(() => ({ dispose: vi.fn() }));
		let capturedT: ((key: string) => string) | undefined;

		const plugin = defineChronosPlugin({
			id: 'test-plugin',
			messages: TEST_MESSAGES,
			nameKey: 'plugin.name',
			descriptionKey: 'plugin.description',
			apply(_ctx, t) {
				capturedT = t;
			}
		});

		expect(typeof plugin.name).toBe('function');
		expect(resolveLocalizedText(plugin.name)).toBe('测试插件');

		const ctx = {
			i18n: {
				registerMessages,
				t: (key: string) => TEST_MESSAGES.en[key as keyof (typeof TEST_MESSAGES)['en']] ?? key
			},
			registerSlot
		} as unknown as ChronosContext;

		await plugin.apply(ctx);

		expect(registerMessages).toHaveBeenCalledWith(TEST_MESSAGES);
		expect(capturedT?.('plugin.name')).toBe('Test Plugin');
		expect(resolveLocalizedText(plugin.name)).toBe('Test Plugin');
		expect(resolveLocalizedText(plugin.description)).toBe('Test description');
	});
});
