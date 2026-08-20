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
		if (typeof localStorage !== 'undefined') global.localStorage = undefined;
		if (typeof sessionStorage !== 'undefined') global.sessionStorage = undefined;
	} catch {
		// Ignore if running in mock test environment
	}

	let rpcSeq = 0;
	const pendingRequests = new Map();
	const eventHandlers = new Map();

	// Universal hierarchical slot contributions store: slotName -> Map(id -> contribution)
	const registeredSlots = new Map();

	function getSlotGroup(slotName) {
		if (!registeredSlots.has(slotName)) {
			registeredSlots.set(slotName, new Map());
		}
		return registeredSlots.get(slotName);
	}

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
				const params = data.params || {};

				switch (data.method) {
					// --- Standard Hierarchical Slot Dispatchers ---
					case 'slot:executeImport':
					case 'source:fetchSchedule': {
						const slotGroup = getSlotGroup('import.source.tab');
						const id = params.id || params.sourceId;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Import source slot contribution not found: ' + id);
						const fn = contribution.executeImport || contribution.fetchSchedule;
						if (typeof fn !== 'function') throw new Error('No executeImport function for: ' + id);
						result = await fn(params.inputs || params.params, currentContext);
						break;
					}

					case 'slot:export':
					case 'exporter:export': {
						const slotGroup = getSlotGroup('export.action');
						const id = params.id || params.exporterId;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Export action slot contribution not found: ' + id);
						result = await contribution.export(params.timetable, currentContext);
						break;
					}

					case 'slot:courseAction':
					case 'action:execute': {
						const slotGroup = getSlotGroup('course.detail.action');
						const id = params.id || params.actionId;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Course action slot contribution not found: ' + id);
						result = await contribution.onExecute(params.course, currentContext);
						break;
					}

					case 'slot:getBadge':
					case 'badge:getBadge': {
						const slotGroup = getSlotGroup('timetable.cell.badge');
						const id = params.id || params.badgeId;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Course badge slot contribution not found: ' + id);
						result = contribution.getBadge ? await contribution.getBadge(params.course, currentContext) : null;
						break;
					}

					case 'slot:projectBadges':
					case 'badge:projectBadges': {
						const slotGroup = getSlotGroup('timetable.cell.badge');
						const id = params.id || params.badgeId;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Course badge slot contribution not found: ' + id);
						result = contribution.projectBadges
							? await contribution.projectBadges(params.courses)
							: {};
						break;
					}

					case 'slot:themeGetTokens': {
						const slotGroup = getSlotGroup('theme.definition');
						const id = params.id || params.themeId;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Theme slot contribution not found: ' + id);
						result = contribution.getTokens
							? contribution.getTokens(params.mode, params.seedColor)
							: null;
						break;
					}

					case 'slot:themeResolveCoursePaint':
					case 'theme:resolveCoursePaint': {
						const slotGroup = getSlotGroup('theme.definition');
						const id = params.id || params.themeId;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Theme slot contribution not found: ' + id);
						result = contribution.resolveCoursePaint
							? contribution.resolveCoursePaint(
									params.course,
									params.paletteIndex,
									params.mode
								)
							: null;
						break;
					}

					case 'slot:mineItemClick': {
						const slotGroup = getSlotGroup('mine.item');
						const id = params.id;
						const contribution = slotGroup.get(id);
						if (!contribution) throw new Error('Mine item slot contribution not found: ' + id);
						if (typeof contribution.onClick === 'function') {
							result = await contribution.onClick(currentContext);
						}
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

	function createSandboxContext(manifest) {
		const subscriptions = [];
		let pluginConfig = Object.assign({}, manifest.defaultConfig || {});

		function resolveText(text) {
			if (!text) return '';
			return typeof text === 'function' ? text() : text;
		}

		const ctx = {
			pluginId: manifest.id,

			service: function (identifier) {
				const key = typeof identifier === 'string' ? identifier : identifier?.key || 'http';
				if (key === 'http') {
					return {
						request: function (url, options) {
							return callHost('http:request', { url: url, options: options });
						}
					};
				}
				if (key === 'storage') {
					return ctx.storage;
				}
				throw new Error('Service "' + key + '" is not directly accessible or not supported in sandbox');
			},

			get config() {
				return pluginConfig;
			},

			updateConfig: async function (patch) {
				pluginConfig = Object.assign({}, pluginConfig, patch);
				await callHost('config:update', { patch: patch });
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
				locale: 'zh-cn',
				t: function (key, params) {
					if (params && typeof params.default === 'string') return params.default;
					return key;
				}
			},

			get state() {
				return currentState;
			},

			actions: {
				createTimetable: function (name, config) {
					return callHost('actions:createTimetable', { name: name, config: config });
				},
				switchTimetable: function (timetableId) {
					return callHost('actions:switchTimetable', { timetableId: timetableId });
				},
				deleteTimetable: function (timetableId) {
					return callHost('actions:deleteTimetable', { timetableId: timetableId });
				},
				saveCurrentTimetableDetails: function (patch) {
					return callHost('actions:saveCurrentTimetableDetails', { patch: patch });
				},
				saveCourse: function (course) {
					return callHost('actions:saveCourse', { course: course });
				},
				updateCourse: function (courseId, patch) {
					return callHost('actions:updateCourse', { courseId: courseId, patch: patch });
				},
				deleteCourse: function (courseId) {
					return callHost('actions:deleteCourse', { courseId: courseId });
				},
				setTheme: function (themeId) {
					void callHost('actions:setTheme', { themeId: themeId });
				},
				updatePreferences: function (patch) {
					return callHost('actions:updatePreferences', { patch: patch });
				},
				notify: function (message, type) {
					void callHost('actions:notify', { message: message, type: type || 'info' });
				}
			},

			subscriptions: subscriptions,

			registerSlot: function (slotName, contribution) {
				const group = getSlotGroup(slotName);
				group.set(contribution.id, contribution);

				const serializable = {
					id: contribution.id,
					title: resolveText(contribution.title),
					label: resolveText(contribution.label),
					supporting: resolveText(contribution.supporting),
					supportingText: resolveText(contribution.supportingText),
					order: contribution.order,
					icon: contribution.icon,
					iconTone: contribution.iconTone,
					inputSchema: contribution.inputSchema,
					defaultInput: contribution.defaultInput,
					schema: contribution.schema,
					sectionId: contribution.sectionId,
					href: contribution.href,
					supportsDynamicColor: Boolean(contribution.supportsDynamicColor),
					hasGetTokens: typeof contribution.getTokens === 'function',
					lightTokens: contribution.getTokens ? contribution.getTokens('light') : undefined,
					darkTokens: contribution.getTokens ? contribution.getTokens('dark') : undefined,
					hasResolveCoursePaint: typeof contribution.resolveCoursePaint === 'function',
					hasGetBadge: typeof contribution.getBadge === 'function',
					hasProjectBadges: typeof contribution.projectBadges === 'function',
					hasOnClick: typeof contribution.onClick === 'function'
				};

				void callHost('slot:register', {
					slotName: slotName,
					contribution: serializable
				});

				const disposable = {
					dispose: function () {
						group.delete(contribution.id);
						void callHost('slot:unregister', {
							slotName: slotName,
							id: contribution.id
						});
					}
				};
				subscriptions.push(disposable);
				return disposable;
			},

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

			registerPipelineHook: function (_hook) {
				const disposable = {
					dispose: function () {}
				};
				subscriptions.push(disposable);
				return disposable;
			},

			addDisposable: function (disposable) {
				subscriptions.push(disposable);
			},

			// === Backward Compatibility Transition Methods ===
			env: {
				platform: 'web',
				http: {
					request: function (url, options) {
						return callHost('http:request', { url: url, options: options });
					}
				}
			},
			registerSource: function (adapter) {
				return ctx.registerSlot('import.source.tab', {
					id: adapter.id,
					title: adapter.title,
					authType: adapter.authType,
					fetchSchedule: adapter.fetchSchedule,
					executeImport: adapter.fetchSchedule
				});
			},
			registerExporter: function (adapter) {
				return ctx.registerSlot('export.action', {
					id: adapter.id,
					title: adapter.title,
					export: adapter.export
				});
			},
			registerCourseAction: function (action) {
				return ctx.registerSlot('course.detail.action', {
					id: action.id,
					label: action.label,
					icon: action.icon,
					onExecute: action.onExecute
				});
			},
			registerCourseBadge: function (badge) {
				return ctx.registerSlot('timetable.cell.badge', {
					id: badge.id,
					getBadge: badge.getBadge,
					projectBadges: badge.projectBadges
				});
			},
			registerTheme: function (theme) {
				return ctx.registerSlot('theme.definition', {
					id: theme.id,
					name: theme.name,
					supportsDynamicColor: theme.supportsDynamicColor,
					getTokens: theme.getTokens,
					resolveCoursePaint: theme.resolveCoursePaint
				});
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
