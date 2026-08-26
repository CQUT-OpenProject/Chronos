import { describe, expect, it } from 'vite-plus/test';
import {
	parsePluginServerResponse,
	pluginServerError,
	pluginServerErrorMessage,
	pluginServerSuccess
} from '../src/types/plugin-server';

describe('PluginServerResponse', () => {
	it('pluginServerSuccess wraps payload', () => {
		expect(pluginServerSuccess({ id: 1 })).toEqual({ ok: true, payload: { id: 1 } });
	});

	it('pluginServerError wraps kind and message', () => {
		expect(pluginServerError('Validation', 'bad input')).toEqual({
			ok: false,
			error: { kind: 'Validation', message: 'bad input' }
		});
	});

	it('parsePluginServerResponse accepts success body', () => {
		const parsed = parsePluginServerResponse<{ foo: string }>({
			ok: true,
			payload: { foo: 'bar' }
		});
		expect(parsed).toEqual({ ok: true, payload: { foo: 'bar' } });
	});

	it('parsePluginServerResponse accepts error body', () => {
		const parsed = parsePluginServerResponse({
			ok: false,
			error: { kind: 'Auth', message: 'denied' }
		});
		expect(parsed).toEqual({ ok: false, error: { kind: 'Auth', message: 'denied' } });
	});

	it('parsePluginServerResponse rejects malformed body', () => {
		const parsed = parsePluginServerResponse(null);
		expect(parsed.ok).toBe(false);
		if (!parsed.ok) {
			expect(parsed.error.kind).toBe('DataFormat');
		}
	});

	it('pluginServerErrorMessage extracts message from error response', () => {
		expect(pluginServerErrorMessage(pluginServerError('Network', 'timeout'))).toBe('timeout');
		expect(pluginServerErrorMessage(pluginServerSuccess({}))).toBeUndefined();
	});
});
