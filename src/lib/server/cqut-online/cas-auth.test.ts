import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { CAS_APPLICATION_CODE, TIMETABLE_SESSION_COOKIE } from './config';
import { loginCas } from './cas-auth';
import { CookieJar } from './cookie-jar';

const TEST_ACCOUNT = '20210001';
const TEST_PASSWORD = 'encrypted-password';
const TEST_TICKET = 'ST-test-ticket-001';

let server: Server | null = null;
let baseUrl = '';

function overrides() {
	return {
		uisBaseUrl: baseUrl,
		timetableBaseUrl: baseUrl,
		timetableHost: '127.0.0.1'
	};
}

async function startMockUpstream() {
	const requests: Array<{ method: string; path: string }> = [];

	server = createServer((req, res) => {
		const host = req.headers.host ?? '127.0.0.1';
		const url = new URL(req.url ?? '/', `http://${host}`);
		requests.push({ method: req.method ?? 'GET', path: url.pathname + url.search });

		if (url.pathname === '/center-auth-server/sso/doLogin' && req.method === 'POST') {
			res.setHeader('Content-Type', 'application/json;charset=utf-8');
			res.setHeader('Set-Cookie', 'auth_server_token=uis-token; Path=/');
			res.end(JSON.stringify({ code: 200, msg: '登录成功' }));
			return;
		}

		if (
			url.pathname === `/center-auth-server/${CAS_APPLICATION_CODE}/cas/login` &&
			req.method === 'GET'
		) {
			const redirect = new URL(`${baseUrl}/api/auth/casLogin`);
			redirect.searchParams.set('ticket', TEST_TICKET);
			res.statusCode = 302;
			res.setHeader('Location', redirect.toString());
			res.end();
			return;
		}

		if (url.pathname === '/api/auth/casLogin' && req.method === 'GET') {
			const ticket = url.searchParams.get('ticket');
			if (ticket !== TEST_TICKET) {
				res.statusCode = 400;
				res.end('invalid ticket');
				return;
			}
			res.statusCode = 302;
			res.setHeader('Set-Cookie', `${TIMETABLE_SESSION_COOKIE}=session-123; Path=/; HttpOnly`);
			res.setHeader('Location', `${baseUrl}/`);
			res.end();
			return;
		}

		res.statusCode = 404;
		res.end('not found');
	});

	await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
	const address = server.address();
	if (!address || typeof address === 'string') {
		throw new Error('failed to start mock server');
	}
	baseUrl = `http://127.0.0.1:${address.port}`;
	return { requests };
}

afterEach(async () => {
	if (!server) return;
	await new Promise<void>((resolve, reject) => {
		server!.close((error) => (error ? reject(error) : resolve()));
	});
	server = null;
	baseUrl = '';
});

describe('loginCas', () => {
	it('completes ticket exchange and stores timetable session cookie', async () => {
		const upstream = await startMockUpstream();
		const jar = new CookieJar();

		const result = await loginCas(jar, TEST_ACCOUNT, TEST_PASSWORD, undefined, overrides());
		expect(result.ok).toBe(true);
		expect(jar.hasCookie('127.0.0.1', TIMETABLE_SESSION_COOKIE)).toBe(true);
		expect(upstream.requests.map((item) => `${item.method} ${item.path.split('?')[0]}`)).toEqual([
			'POST /center-auth-server/sso/doLogin',
			`GET /center-auth-server/${CAS_APPLICATION_CODE}/cas/login`,
			'GET /api/auth/casLogin'
		]);
	});

	it('fails when CAS ticket is missing', async () => {
		server = createServer((req, res) => {
			const host = req.headers.host ?? '127.0.0.1';
			const url = new URL(req.url ?? '/', `http://${host}`);
			if (url.pathname === '/center-auth-server/sso/doLogin') {
				res.end(JSON.stringify({ code: 200, msg: '登录成功' }));
				return;
			}
			if (url.pathname === `/center-auth-server/${CAS_APPLICATION_CODE}/cas/login`) {
				res.statusCode = 302;
				res.setHeader('Location', `${baseUrl}/missing-ticket`);
				res.end();
				return;
			}
			res.statusCode = 404;
			res.end();
		});
		await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
		const address = server.address();
		if (!address || typeof address === 'string') throw new Error('no address');
		baseUrl = `http://127.0.0.1:${address.port}`;

		const jar = new CookieJar();
		const result = await loginCas(jar, TEST_ACCOUNT, TEST_PASSWORD, undefined, overrides());
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe('Auth');
		}
	});

	it('returns captcha-specific error when UIS asks for verification code', async () => {
		server = createServer((_req, res) => {
			res.setHeader('Content-Type', 'application/json;charset=utf-8');
			res.end(JSON.stringify({ code: 400, msg: '请输入验证码', verifyCode: 'required' }));
		});
		await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
		const address = server.address();
		if (!address || typeof address === 'string') throw new Error('no address');
		baseUrl = `http://127.0.0.1:${address.port}`;

		const jar = new CookieJar();
		const result = await loginCas(jar, TEST_ACCOUNT, TEST_PASSWORD, undefined, {
			uisBaseUrl: baseUrl,
			timetableBaseUrl: baseUrl,
			timetableHost: '127.0.0.1'
		});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toBe('需要验证码，当前版本暂不支持');
		}
	});
});
