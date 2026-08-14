import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { CookieJar } from './cookie-jar';

vi.mock('./config', () => ({
	REQUEST_TIMEOUT_MS: 100,
	HTTP_RETRY_DELAY_MS: 0
}));

const { requestStep } = await import('./http-client');

let server: Server | null = null;

async function listen(
	handler: (req: IncomingMessage, res: ServerResponse) => void
): Promise<string> {
	server = createServer(handler);
	await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
	const address = server.address();
	if (!address || typeof address === 'string') {
		throw new Error('failed to start mock server');
	}
	return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
	if (!server) return;
	await new Promise<void>((resolve, reject) => {
		server!.close((error) => (error ? reject(error) : resolve()));
	});
	server = null;
});

describe('requestStep', () => {
	it('returns network error with step name when upstream hangs', async () => {
		const url = `${await listen(() => {
			// Never respond — triggers REQUEST_TIMEOUT_MS.
		})}/hang`;

		const result = await requestStep(
			new CookieJar(),
			url,
			{ method: 'GET' },
			{},
			'统一身份认证登录'
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe('Network');
			expect(result.error.message).toBe('统一身份认证登录超时，请稍后重试');
		}
	});

	it('returns step-named HTTP error when upstream is not ok', async () => {
		const url = `${await listen((_req, res) => {
			res.statusCode = 502;
			res.end('bad gateway');
		})}/fail`;

		const result = await requestStep(
			new CookieJar(),
			url,
			{ method: 'GET' },
			{},
			'统一身份认证登录'
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe('Network');
			expect(result.error.message).toBe('统一身份认证登录失败：HTTP 502');
		}
	});
});
