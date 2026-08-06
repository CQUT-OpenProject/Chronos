export class CookieJar {
	private readonly cookies = new Map<string, Map<string, string>>();

	storeFrom(response: Response, requestUrl: string): void {
		const host = new URL(requestUrl).hostname;
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

	hasSessionCookies(hosts: string[]): boolean {
		return hosts.some((host) => (this.cookies.get(host)?.size ?? 0) > 0);
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
