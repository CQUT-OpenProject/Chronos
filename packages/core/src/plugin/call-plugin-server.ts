import type { IHttpService, HttpResponse } from '../types/services';
import {
	parsePluginServerResponse,
	pluginServerErrorMessage,
	type PluginServerResponse
} from '../types/plugin-server';

export async function callPluginServer(
	http: IHttpService,
	pluginId: string,
	action: string,
	payload: unknown
): Promise<HttpResponse> {
	if (!http.proxy) {
		throw new Error('HTTP proxy is not supported in this environment');
	}
	return http.proxy(pluginId, action, payload);
}

export async function callPluginServerJson<T>(
	http: IHttpService,
	pluginId: string,
	action: string,
	payload: unknown
): Promise<{ response: HttpResponse; body: PluginServerResponse<T> }> {
	const response = await callPluginServer(http, pluginId, action, payload);
	const body = parsePluginServerResponse<T>(await response.json());
	return { response, body };
}

export function resolvePluginServerErrorMessage(
	body: PluginServerResponse<unknown>,
	fallback: string
): string {
	return pluginServerErrorMessage(body) ?? fallback;
}
