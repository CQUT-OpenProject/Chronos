import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { fetchCampusTimeInfo, fetchUserCampusName } from './fetch-campus-time';
import { CookieJar } from './cookie-jar';

let server: Server | null = null;
let baseUrl = '';

async function startMockUpstream(handlers: {
	userInfoBody?: unknown;
	campusTimeBodies?: Record<string, unknown>;
}) {
	server = createServer((req, res) => {
		const host = req.headers.host ?? '127.0.0.1';
		const url = new URL(req.url ?? '/', `http://${host}`);

		if (url.pathname === '/api/courseSchedule/getUserInfo' && req.method === 'POST') {
			res.setHeader('Content-Type', 'application/json;charset=utf-8');
			res.end(JSON.stringify(handlers.userInfoBody ?? {}));
			return;
		}

		if (url.pathname === '/api/courseSchedule/getCampusTimeInfo' && req.method === 'POST') {
			let body = '';
			req.on('data', (chunk) => {
				body += chunk;
			});
			req.on('end', () => {
				const campusName = (JSON.parse(body) as { campusName?: string }).campusName ?? '';
				res.setHeader('Content-Type', 'application/json;charset=utf-8');
				res.end(JSON.stringify(handlers.campusTimeBodies?.[campusName] ?? []));
			});
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
}

afterEach(async () => {
	if (!server) return;
	await new Promise<void>((resolve, reject) => {
		server!.close((error) => (error ? reject(error) : resolve()));
	});
	server = null;
	baseUrl = '';
});

describe('fetch-campus-time', () => {
	it('fetchUserCampusName reads campus from nested user info', async () => {
		await startMockUpstream({
			userInfoBody: {
				data: {
					userCustomSetting: {
						campusName: '花溪校区'
					}
				}
			}
		});

		const jar = new CookieJar();
		const result = await fetchUserCampusName(jar, undefined, {
			getUserInfoUrl: `${baseUrl}/api/courseSchedule/getUserInfo`
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe('huaxi');
		}
	});

	it('fetchCampusTimeInfo maps sessionNum to period index', async () => {
		await startMockUpstream({
			campusTimeBodies: {
				两江校区: [
					{
						campusName: '两江校区',
						sessionNum: 2,
						startTime: '09:25',
						endTime: '10:10'
					},
					{
						campusName: '两江校区',
						sessionNum: 1,
						startTime: '08:30',
						endTime: '09:15'
					}
				]
			}
		});

		const jar = new CookieJar();
		const result = await fetchCampusTimeInfo(jar, 'liangjiang', undefined, {
			getCampusTimeInfoUrl: `${baseUrl}/api/courseSchedule/getCampusTimeInfo`
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual([
				{ index: 1, startTime: '08:30', endTime: '09:15' },
				{ index: 2, startTime: '09:25', endTime: '10:10' }
			]);
		}
	});
});
