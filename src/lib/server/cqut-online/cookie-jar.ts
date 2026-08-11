import { TIMETABLE_HOST, TIMETABLE_SESSION_COOKIE } from './config';

export class CookieJar {
	private readonly cookies = new Map<string, Map<string, string>>();

	storeFrom(response: Response, requestUrl?: string): void {
		const resolvedUrl = response.url || requestUrl;
		if (!resolvedUrl) return;

		const host = new URL(resolvedUrl).hostname;
		const setCookieHeaders = this.readSetCookieHeaders(response);
		if (setCookieHeaders.length === 0) return;

		const hostCookies = this.cookies.get(host) ?? new Map<string, string>();
		for (const header of setCookieHeaders) {
			const [pair] = header.split(';');
			const separatorIndex = pair.indexOf('=');
			if (separatorIndex <= 0) continue;
			const name = pair.slice(0, separatorIndex).trim();
			const value = pair.slice(separatorIndex + 1).trim();
			if (!name) continue;
			hostCookies.set(name, value);
		}
		this.cookies.set(host, hostCookies);
	}

	cookieHeader(url: string): string | undefined {
		const host = new URL(url).hostname;
		const hostCookies = this.cookies.get(host);
		if (!hostCookies || hostCookies.size === 0) return undefined;
		return [...hostCookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
	}

	hasCookie(host: string, name: string): boolean {
		return this.cookies.get(host)?.has(name) ?? false;
	}

	hasTimetableSession(): boolean {
		return this.hasCookie(TIMETABLE_HOST, TIMETABLE_SESSION_COOKIE);
	}

	private readSetCookieHeaders(response: Response): string[] {
		const headers = response.headers as Headers & {
			getSetCookie?: () => string[];
		};
		if (typeof headers.getSetCookie === 'function') {
			return headers.getSetCookie();
		}
		const header = response.headers.get('set-cookie');
		return header ? [header] : [];
	}
}
