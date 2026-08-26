import { describe, expect, it } from 'vite-plus/test';
import { TIMETABLE_HOST, TIMETABLE_SESSION_COOKIE } from './config';
import { CookieJar } from './cookie-jar';

describe('CookieJar', () => {
	it('stores cookies using response.url host', () => {
		const jar = new CookieJar();
		const response = new Response(null, {
			status: 200,
			headers: { 'set-cookie': 'JSESSIONID=abc123; Path=/; HttpOnly' }
		});
		Object.defineProperty(response, 'url', {
			value: `https://${TIMETABLE_HOST}/api/auth/casLogin`
		});

		jar.storeFrom(response);

		expect(jar.hasCookie(TIMETABLE_HOST, TIMETABLE_SESSION_COOKIE)).toBe(true);
		expect(jar.hasTimetableSession()).toBe(true);
	});

	it('falls back to requestUrl when response.url is empty', () => {
		const jar = new CookieJar();
		const response = new Response(null, {
			status: 200,
			headers: { 'set-cookie': 'auth_server_token=token; Path=/' }
		});

		jar.storeFrom(response, 'https://uis.cqut.edu.cn/center-auth-server/sso/doLogin');

		expect(jar.cookieHeader('https://uis.cqut.edu.cn/center-auth-server/sso/doLogin')).toBe(
			'auth_server_token=token'
		);
	});

	it('sends host-scoped cookies only for matching requests', () => {
		const jar = new CookieJar();
		const response = new Response(null, {
			status: 200,
			headers: { 'set-cookie': 'JSESSIONID=week-session; Path=/' }
		});
		Object.defineProperty(response, 'url', {
			value: `https://${TIMETABLE_HOST}/api/courseSchedule/listWeekEvents`
		});
		jar.storeFrom(response);

		expect(jar.cookieHeader(`https://${TIMETABLE_HOST}/api/courseSchedule/listWeekEvents`)).toBe(
			'JSESSIONID=week-session'
		);
		expect(
			jar.cookieHeader('https://uis.cqut.edu.cn/center-auth-server/sso/doLogin')
		).toBeUndefined();
	});
});
