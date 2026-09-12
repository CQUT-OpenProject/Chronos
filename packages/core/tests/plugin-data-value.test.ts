import { describe, expect, it } from 'vite-plus/test';
import {
	deserializePluginDataFromNative,
	isPluginBinaryValue,
	serializePluginDataForNative
} from '../src/storage/plugin-data-value';

describe('plugin-data-value', () => {
	it('detects binary plugin values', () => {
		expect(isPluginBinaryValue(new Uint8Array([1]))).toBe(true);
		expect(isPluginBinaryValue(new Blob())).toBe(true);
		expect(isPluginBinaryValue({ mimeType: 'image/png' })).toBe(false);
	});

	it('serializes binary values for native bridge transport', async () => {
		const wire = await serializePluginDataForNative(
			new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })
		);
		expect(wire).toEqual({
			__binary: true,
			mimeType: 'image/png',
			base64: 'AQID'
		});

		const restored = deserializePluginDataFromNative(wire);
		expect(restored).toBeInstanceOf(Blob);
		expect(new Uint8Array(await (restored as Blob).arrayBuffer())).toEqual(
			new Uint8Array([1, 2, 3])
		);
	});
});
