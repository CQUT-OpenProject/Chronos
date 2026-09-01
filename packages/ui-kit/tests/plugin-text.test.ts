import { describe, expect, it } from 'vite-plus/test';
import { pluginText } from '../src/i18n/plugin-text';

const SAMPLE_MESSAGES = {
	'zh-cn': {
		'hello.name': '你好 {name}'
	},
	en: {
		'hello.name': 'Hello {name}'
	}
};

describe('pluginText', () => {
	it('interpolates params on catalog fallback when controller is absent', () => {
		expect(pluginText(undefined, 'demo', SAMPLE_MESSAGES, 'hello.name', { name: 'Chronos' })).toBe(
			'你好 Chronos'
		);
	});
});
