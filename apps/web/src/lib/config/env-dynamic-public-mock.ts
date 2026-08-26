export const env: Record<string, string> = new Proxy(
	{},
	{
		get(_target, prop: string) {
			return process.env[prop] ?? '';
		}
	}
);
