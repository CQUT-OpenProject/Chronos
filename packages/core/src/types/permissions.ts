export type PluginPermission =
	| 'network'
	| 'storage'
	| 'vault'
	| 'notifications'
	| 'biometrics'
	| 'calendar';

export const ALLOWED_PLUGIN_PERMISSIONS: ReadonlySet<PluginPermission> = new Set([
	'network',
	'storage',
	'vault',
	'notifications',
	'biometrics',
	'calendar'
]);
