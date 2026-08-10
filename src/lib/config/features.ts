declare const __ONLINE_IMPORT_ENABLED__: boolean;

/** false only in the GitHub Pages static build, which has no server to proxy 知行理工 requests. */
export const onlineImportEnabled =
	typeof __ONLINE_IMPORT_ENABLED__ === 'boolean' ? __ONLINE_IMPORT_ENABLED__ : true;
