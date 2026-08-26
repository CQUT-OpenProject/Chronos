export type PluginHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

export interface PluginServerRequestEvent {
	request: Request;
	params: { pluginId: string; action: string };
	getClientAddress: () => string;
}

export type PluginServerHandler = (event: PluginServerRequestEvent) => Response | Promise<Response>;

export interface PluginServerManifest {
	handlers: Record<string, Partial<Record<PluginHttpMethod, PluginServerHandler>>>;
	proxy?: {
		domains: string[];
		action: string;
	};
}

export type PluginServerErrorKind =
	| 'NotFound'
	| 'Validation'
	| 'DataFormat'
	| 'Auth'
	| 'Network'
	| 'Upstream'
	| 'RateLimited';

export interface PluginServerError {
	kind: PluginServerErrorKind;
	message: string;
}

export type PluginServerResponse<T> =
	| { ok: true; payload: T }
	| { ok: false; error: PluginServerError };

export function pluginServerSuccess<T>(payload: T): PluginServerResponse<T> {
	return { ok: true, payload };
}

export function pluginServerError(
	kind: PluginServerErrorKind,
	message: string
): PluginServerResponse<never> {
	return { ok: false, error: { kind, message } };
}

function isPluginServerError(value: unknown): value is PluginServerError {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as PluginServerError;
	return typeof candidate.kind === 'string' && typeof candidate.message === 'string';
}

export function parsePluginServerResponse<T>(data: unknown): PluginServerResponse<T> {
	if (!data || typeof data !== 'object') {
		return pluginServerError('DataFormat', 'Invalid plugin server response');
	}

	const candidate = data as { ok?: unknown; payload?: unknown; error?: unknown };
	if (candidate.ok === true) {
		return { ok: true, payload: candidate.payload as T };
	}
	if (candidate.ok === false && isPluginServerError(candidate.error)) {
		return { ok: false, error: candidate.error };
	}

	return pluginServerError('DataFormat', 'Invalid plugin server response');
}

export function pluginServerErrorMessage(
	response: PluginServerResponse<unknown>
): string | undefined {
	if (response.ok) return undefined;
	return response.error.message;
}
