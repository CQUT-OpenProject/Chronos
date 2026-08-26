import { MemoryCookieJar } from '@cqut-openproject/cas-sdk';
import { TIMETABLE_HOST, TIMETABLE_SESSION_COOKIE } from './config';

export class CookieJar extends MemoryCookieJar {
	storeFrom(response: Response, requestUrl?: string): void {
		const resolvedUrl = response.url || requestUrl;
		if (!resolvedUrl) return;

		const headers = response.headers as Headers & {
			getSetCookie?: () => string[];
		};
		const setCookieHeaders =
			typeof headers.getSetCookie === 'function'
				? headers.getSetCookie()
				: response.headers.get('set-cookie')
					? [response.headers.get('set-cookie')!]
					: [];

		this.setCookies(setCookieHeaders, resolvedUrl);
	}

	cookieHeader(url: string): string | undefined {
		const str = this.getCookieString(url);
		return str || undefined;
	}

	hasCookie(host: string, name: string): boolean {
		const testUrl = host.startsWith('http') ? host : `https://${host}/`;
		return this.getCookies(testUrl).some((c) => c.name === name);
	}

	hasTimetableSession(): boolean {
		return this.hasCookie(TIMETABLE_HOST, TIMETABLE_SESSION_COOKIE);
	}
}
