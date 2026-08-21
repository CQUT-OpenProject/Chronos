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
