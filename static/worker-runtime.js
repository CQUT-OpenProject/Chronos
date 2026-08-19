/* eslint-disable @typescript-eslint/no-implied-eval, no-new-func */
// Chronos Worker Sandbox Runtime (worker-runtime.js)
(function (global) {
	'use strict';

	// 1. Strictly block native I/O that could lead to data escape or bypass permission checks
	const noopIo = function () {
		throw new Error('Direct I/O is disabled inside the Chronos plugin sandbox');
	};

	try {
		global.fetch = noopIo;
		global.XMLHttpRequest = noopIo;
		global.WebSocket = noopIo;
		global.EventSource = noopIo;
		global.indexedDB = undefined;
	} catch {
		// Ignore if running in mock test environment
	}

	let rpcSeq = 0;
	const pendingRequests = new Map();
	const eventHandlers = new Map();

	const registeredSources = new Map();
	const registeredExporters = new Map();
	const registeredActions = new Map();
	const registeredBadges = new Map();
	const registeredThemes = new Map();

	function callHost(method, params) {
		return new Promise(function (resolve, reject) {
			const id = 'w_req_' + ++rpcSeq + '_' + Date.now();
			pendingRequests.set(id, { resolve: resolve, reject: reject });
			global.postMessage({ id: id, method: method, params: params });
		});
	}

	function replyHost(id, result, error) {
		if (error) {
			global.postMessage({ id: id, error: error.message || String(error), ok: false });
		} else {
			global.postMessage({ id: id, result: result, ok: true });
		}
	}

	let currentState = {
		currentTimetable: null,
		activeWeek: 1,
		currentPeriodIndex: null,
		activeThemeId: 'm3-default',
		userPreferences: null
	};

	global.onmessage = async function (e) {
		const data = e.data;
		if (!data) return;

		// 1. Handle response from host (Host -> Worker Response)
		if (typeof data.id === 'string' && ('result' in data || 'error' in data)) {
			const pending = pendingRequests.get(data.id);
			if (pending) {
				pendingRequests.delete(data.id);
				if (data.ok) {
					pending.resolve(data.result);
				} else {
					pending.reject(new Error(data.error || 'RPC failed'));
				}
			}
			return;
		}

		// 2. Handle event notification from host (Host -> Worker Event)
		if (data.event) {
			if (data.event === 'state:sync' && data.payload) {
				currentState = Object.assign({}, currentState, data.payload);
			}
			const handlers = eventHandlers.get(data.event);
			if (handlers) {
				for (const handler of handlers) {
					try {
						await handler(data.payload);
					} catch (err) {
						console.error('[WorkerSandbox] Error in event listener for ' + data.event, err);
					}
				}
			}
			return;
		}

		// 3. Handle method call from host (Host -> Worker Method Call)
		if (typeof data.id === 'string' && typeof data.method === 'string') {
			try {
				let result;
				switch (data.method) {
					case 'source:fetchSchedule': {
						const source = registeredSources.get(data.params.sourceId);
						if (!source) throw new Error('Source not found: ' + data.params.sourceId);
						result = await source.fetchSchedule(data.params.params);
						break;
					}
					case 'exporter:export': {
						const exporter = registeredExporters.get(data.params.exporterId);
						if (!exporter) throw new Error('Exporter not found: ' + data.params.exporterId);
						result = await exporter.export(data.params.timetable);
						break;
					}
					case 'action:execute': {
						const action = registeredActions.get(data.params.actionId);
						if (!action) throw new Error('Action not found: ' + data.params.actionId);
						result = await action.onExecute(data.params.course, currentContext);
						break;
					}
					case 'badge:getBadge': {
						const badge = registeredBadges.get(data.params.badgeId);
						if (!badge) throw new Error('Badge not found: ' + data.params.badgeId);
						result = badge.getBadge ? await badge.getBadge(data.params.course) : null;
						break;
					}
					case 'badge:projectBadges': {
						const badge = registeredBadges.get(data.params.badgeId);
						if (!badge) throw new Error('Badge not found: ' + data.params.badgeId);
						result = badge.projectBadges ? await badge.projectBadges(data.params.courses) : {};
						break;
					}
					case 'theme:resolveCoursePaint': {
						const theme = registeredThemes.get(data.params.themeId);
						if (!theme) throw new Error('Theme not found: ' + data.params.themeId);
						result = theme.resolveCoursePaint
							? theme.resolveCoursePaint(
									data.params.course,
									data.params.paletteIndex,
									data.params.mode
								)
							: null;
						break;
					}
					default:
						throw new Error('Unknown worker RPC method: ' + data.method);
				}
				replyHost(data.id, result);
			} catch (err) {
				replyHost(data.id, undefined, err);
			}
		}
	};

	let currentContext = null;

	function createSandboxContext(_manifest) {
		const subscriptions = [];

		const ctx = {
			env: {
				platform: 'web',
				http: {
					request: function (url, options) {
						return callHost('http:request', { url: url, options: options });
					}
				}
			},
			storage: {
				get: function (key) {
					return callHost('storage:get', { key: key });
				},
				set: function (key, value) {
					return callHost('storage:set', { key: key, value: value });
				},
				delete: function (key) {
					return callHost('storage:delete', { key: key });
				}
			},
			i18n: {
				locale: 'zh-CN',
				t: function (key, params) {
					if (params && typeof params.default === 'string') return params.default;
					return key;
				}
			},
			get state() {
				return currentState;
			},
			actions: {
				notify: function (message, type) {
					void callHost('actions:notify', { message: message, type: type || 'info' });
				},
				setTheme: function (themeId) {
					void callHost('actions:setTheme', { themeId: themeId });
				}
			},
			subscriptions: subscriptions,
			on: function (event, handler) {
				if (!eventHandlers.has(event)) {
					eventHandlers.set(event, new Set());
					void callHost('event:subscribe', { event: event });
				}
				eventHandlers.get(event).add(handler);
				const disposable = {
					dispose: function () {
						const set = eventHandlers.get(event);
						if (set) set.delete(handler);
					}
				};
				subscriptions.push(disposable);
				return disposable;
			},
			registerSource: function (adapter) {
				registeredSources.set(adapter.id, adapter);
				const title = typeof adapter.title === 'function' ? adapter.title() : adapter.title;
				void callHost('slot:registerSource', {
					id: adapter.id,
					title: title,
					authType: adapter.authType
				});
				const disposable = {
					dispose: function () {
						registeredSources.delete(adapter.id);
						void callHost('slot:unregister', { type: 'source', id: adapter.id });
					}
				};
				subscriptions.push(disposable);
				return disposable;
			},
			registerExporter: function (adapter) {
				registeredExporters.set(adapter.id, adapter);
				const title = typeof adapter.title === 'function' ? adapter.title() : adapter.title;
				void callHost('slot:registerExporter', {
					id: adapter.id,
					title: title
				});
				const disposable = {
					dispose: function () {
						registeredExporters.delete(adapter.id);
						void callHost('slot:unregister', { type: 'exporter', id: adapter.id });
					}
				};
				subscriptions.push(disposable);
				return disposable;
			},
			registerCourseAction: function (action) {
				registeredActions.set(action.id, action);
				const label = typeof action.label === 'function' ? action.label() : action.label;
				void callHost('slot:registerCourseAction', {
					id: action.id,
					label: label,
					icon: action.icon
				});
				const disposable = {
					dispose: function () {
						registeredActions.delete(action.id);
						void callHost('slot:unregister', { type: 'action', id: action.id });
					}
				};
				subscriptions.push(disposable);
				return disposable;
			},
			registerCourseBadge: function (badge) {
				registeredBadges.set(badge.id, badge);
				void callHost('slot:registerCourseBadge', {
					id: badge.id,
					hasGetBadge: typeof badge.getBadge === 'function',
					hasProjectBadges: typeof badge.projectBadges === 'function'
				});
				const disposable = {
					dispose: function () {
						registeredBadges.delete(badge.id);
						void callHost('slot:unregister', { type: 'badge', id: badge.id });
					}
				};
				subscriptions.push(disposable);
				return disposable;
			},
			registerTheme: function (theme) {
				registeredThemes.set(theme.id, theme);
				const name = typeof theme.name === 'function' ? theme.name() : theme.name;
				const lightTokens = theme.getTokens ? theme.getTokens('light') : {};
				const darkTokens = theme.getTokens ? theme.getTokens('dark') : {};
				void callHost('slot:registerTheme', {
					id: theme.id,
					name: name,
					supportsDynamicColor: Boolean(theme.supportsDynamicColor),
					lightTokens: lightTokens,
					darkTokens: darkTokens,
					hasResolveCoursePaint: typeof theme.resolveCoursePaint === 'function'
				});
				const disposable = {
					dispose: function () {
						registeredThemes.delete(theme.id);
						void callHost('slot:unregister', { type: 'theme', id: theme.id });
					}
				};
				subscriptions.push(disposable);
				return disposable;
			}
		};

		return ctx;
	}

	global.initSandboxPlugin = async function (manifest, code) {
		currentContext = createSandboxContext(manifest);

		try {
			// Execute plugin source code in sandboxed scope
			const fn = new Function('module', 'exports', 'ctx', code);
			const moduleObj = { exports: {} };
			const res = fn(moduleObj, moduleObj.exports, currentContext);

			const plugin = moduleObj.exports.default || moduleObj.exports.plugin || moduleObj.exports || res;
			if (plugin && typeof plugin.apply === 'function') {
				await plugin.apply(currentContext);
			}

			global.postMessage({ method: 'plugin:initialized', pluginId: manifest.id, ok: true });
		} catch (err) {
			global.postMessage({
				method: 'plugin:initError',
				pluginId: manifest.id,
				error: err.message || String(err),
				ok: false
			});
		}
	};
})(typeof self !== 'undefined' ? self : globalThis);
