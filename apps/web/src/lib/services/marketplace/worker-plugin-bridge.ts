/* eslint-disable @typescript-eslint/no-implied-eval, no-new-func */
import type {
	PluginManifest,
	ChronosEngine,
	Disposable,
	Timetable,
	Course,
	CourseBadge,
	ExportResult,
	HttpRequestOptions,
	StandardSlotMap,
	AcademicConfig,
	UserPreferences,
	ConfigSchema,
	ThemeContribution
} from '@chronos/core';
import { IHttpService, IStorageService } from '@chronos/core';
import { InProcessSandboxAdapter } from './in-process-sandbox-adapter';

export interface WorkerRpcMessage {
	id?: string;
	method?: string;
	params?: Record<string, unknown>;
	result?: unknown;
	error?: string;
	ok?: boolean;
	event?: string;
	payload?: unknown;
}

export function isAllowedDomain(targetUrl: string, allowedDomains?: string[]): boolean {
	let hostname: string;
	try {
		const parsed = new URL(targetUrl, 'https://localhost');
		hostname = parsed.hostname.toLowerCase();
	} catch {
		return false;
	}

	// SSRF Protection: Deny localhost and private network addresses
	if (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '::1' ||
		hostname === '0.0.0.0' ||
		hostname.startsWith('10.') ||
		hostname.startsWith('192.168.') ||
		/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
		hostname.endsWith('.local') ||
		hostname.endsWith('.internal')
	) {
		return false;
	}

	if (!allowedDomains || allowedDomains.length === 0) {
		return false;
	}

	return allowedDomains.some((pattern) => {
		const clean = pattern.trim().toLowerCase();
		if (clean === '*' || clean === '*.*') return true;
		if (clean.startsWith('*.')) {
			const suffix = clean.slice(2);
			return hostname === suffix || hostname.endsWith('.' + suffix);
		}
		return hostname === clean;
	});
}

export { InProcessSandboxAdapter } from './in-process-sandbox-adapter';

export class WorkerPluginBridge implements Disposable {
	private worker: Worker | null = null;
	private disposables: Disposable[] = [];
	private slotDisposables = new Map<string, Disposable>();
	private rpcSeq = 0;
	private pendingRequests = new Map<
		string,
		{ resolve: (val: unknown) => void; reject: (err: Error) => void }
	>();
	private isInitialized = false;

	constructor(
		private manifest: PluginManifest,
		private code: string,
		private engine: ChronosEngine,
		private customWorker?: Worker
	) {}

	async start(): Promise<void> {
		if (this.customWorker) {
			this.worker = this.customWorker;
		} else if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
			const workerScript = `
				(function() {
					const noop = () => { throw new Error('Direct I/O is disabled inside sandbox'); };
					try {
						self.fetch = noop;
						self.XMLHttpRequest = noop;
						self.WebSocket = noop;
						self.EventSource = noop;
						self.indexedDB = undefined;
					} catch(e) {}

					importScripts('/worker-runtime.js');
					self.initSandboxPlugin(${JSON.stringify(this.manifest)}, ${JSON.stringify(this.code)});
				})();
			`;
			const blob = new Blob([workerScript], { type: 'application/javascript' });
			const workerUrl = URL.createObjectURL(blob);
			this.worker = new Worker(workerUrl);
			URL.revokeObjectURL(workerUrl);
		} else if (import.meta.env.MODE === 'test') {
			this.worker = new InProcessSandboxAdapter(this.manifest, this.code);
		} else {
			throw new Error(
				'Web Worker runtime is not available; third-party plugins cannot be loaded in this environment'
			);
		}

		if (!this.worker) {
			throw new Error('WebWorker runtime is not available');
		}

		this.setupRpcHandlers();

		// Synchronize initial core state to sandbox
		this.postWorkerEvent('state:sync', this.engine.state);
	}

	private setupRpcHandlers(): void {
		if (!this.worker) return;

		this.worker.onmessage = async (e: MessageEvent<WorkerRpcMessage>) => {
			const data = e.data;
			if (!data) return;

			// 1. Handle RPC response from worker (Worker -> Host Response)
			if (typeof data.id === 'string' && ('result' in data || 'error' in data)) {
				const pending = this.pendingRequests.get(data.id);
				if (pending) {
					this.pendingRequests.delete(data.id);
					if (data.ok) {
						pending.resolve(data.result);
					} else {
						pending.reject(new Error(data.error || 'RPC error'));
					}
				}
				return;
			}

			// 2. Handle worker initialization notification
			if (data.method === 'plugin:initialized') {
				this.isInitialized = true;
				return;
			}
			if (data.method === 'plugin:initError') {
				console.error(`[WorkerPluginBridge] Plugin ${this.manifest.id} init error:`, data.error);
				return;
			}

			// 3. Handle method call from worker (Worker -> Host RPC Call)
			if (typeof data.id === 'string' && typeof data.method === 'string') {
				try {
					const result = await this.dispatchHostMethod(data.method, data.params || {});
					this.replySuccess(data.id, result);
				} catch (err: unknown) {
					const errorMsg = err instanceof Error ? err.message : String(err);
					this.replyError(data.id, errorMsg);
				}
			}
		};
	}

	private getPermissions(): string[] {
		return (this.manifest.permissions ?? this.manifest.capabilities ?? []).map(String);
	}

	private async dispatchHostMethod(
		method: string,
		params: Record<string, unknown>
	): Promise<unknown> {
		const perms = this.getPermissions();

		// Permission gateway: Network access check + allowedDomains whitelist + SSRF protection
		if (method.startsWith('http:')) {
			if (!perms.includes('network')) {
				throw new Error('Permission Denied: network capability required');
			}
			if (method === 'http:request') {
				const url = params.url as string;
				if (this.manifest.allowedDomains && this.manifest.allowedDomains.length > 0) {
					if (!isAllowedDomain(url, this.manifest.allowedDomains)) {
						throw new Error(
							`Permission Denied: domain "${url}" is not in allowedDomains whitelist`
						);
					}
				}
				return this.engine.services
					.get(IHttpService)
					.request(url, params.options as HttpRequestOptions | undefined);
			}
		}

		// Permission gateway: Storage capability and scoped prefix enforcement
		if (method.startsWith('storage:')) {
			if (!perms.includes('storage')) {
				throw new Error('Permission Denied: storage capability required');
			}
			const storage = this.engine.services.get(IStorageService);
			const key = params.key as string;
			switch (method) {
				case 'storage:get':
					return storage.getPluginData(this.manifest.id, key);
				case 'storage:set':
					return storage.setPluginData(this.manifest.id, key, params.value);
				case 'storage:delete':
					return storage.deletePluginData(this.manifest.id, key);
			}
		}

		// Config synchronization
		if (method === 'config:update') {
			const patch = (params.patch as Record<string, unknown>) || {};
			const current =
				(await this.engine.storage.getPluginData<Record<string, unknown>>(
					this.manifest.id,
					'__config__'
				)) || {};
			const updated = { ...current, ...patch };
			await this.engine.storage.setPluginData(this.manifest.id, '__config__', updated);
			this.engine.events.emit('config:changed', {
				pluginId: this.manifest.id,
				config: updated
			});
			return;
		}

		if (method === 'config:get') {
			return (
				(await this.engine.storage.getPluginData<Record<string, unknown>>(
					this.manifest.id,
					'__config__'
				)) || {}
			);
		}

		// Actions dispatchers
		if (method === 'actions:notify') {
			this.engine.actions.notify(
				params.message as string,
				(params.type as 'info' | 'warn' | 'error') || 'info'
			);
			return;
		}

		if (method === 'actions:setTheme') {
			this.engine.actions.setTheme(params.themeId as string);
			return;
		}

		if (method === 'actions:createTimetable') {
			return this.engine.actions.createTimetable(
				params.name as string,
				params.config as Partial<AcademicConfig> | undefined
			);
		}

		if (method === 'actions:switchTimetable') {
			return this.engine.actions.switchTimetable(params.timetableId as string);
		}

		if (method === 'actions:deleteTimetable') {
			return this.engine.actions.deleteTimetable(params.timetableId as string);
		}

		if (method === 'actions:saveCurrentTimetableDetails') {
			return this.engine.actions.saveCurrentTimetableDetails(params.patch as Partial<Timetable>);
		}

		if (method === 'actions:saveCourse') {
			return this.engine.actions.saveCourse(params.course as Course);
		}

		if (method === 'actions:updateCourse') {
			return this.engine.actions.updateCourse(
				params.courseId as string,
				params.patch as Partial<Course>
			);
		}

		if (method === 'actions:deleteCourse') {
			return this.engine.actions.deleteCourse(params.courseId as string);
		}

		if (method === 'actions:updatePreferences') {
			return this.engine.actions.updatePreferences(params.patch as Partial<UserPreferences>);
		}

		// Event subscription proxy
		if (method === 'event:subscribe') {
			const eventName = params.event as string;
			const sub = this.engine.on(eventName as never, (payload: unknown) => {
				this.postWorkerEvent(eventName, payload);
			});
			this.disposables.push(sub);
			return;
		}

		// --- Universal Hierarchical Slot Registration ---
		if (method === 'slot:register') {
			const slotName = params.slotName as keyof StandardSlotMap;
			const contribution = (params.contribution as Record<string, unknown>) || {};
			const id = typeof contribution.id === 'string' ? contribution.id : '';

			let sub: Disposable;

			if (slotName === 'import.source.tab') {
				const proxy: StandardSlotMap['import.source.tab'] & { id: string } = {
					id,
					title: () => (contribution.title as string) || id,
					order: contribution.order as number | undefined,
					icon: contribution.icon as string | undefined,
					supportingText: contribution.supportingText
						? () => contribution.supportingText as string
						: undefined,
					inputSchema: contribution.inputSchema as
						| ConfigSchema<Record<string, unknown>>
						| undefined,
					defaultInput: contribution.defaultInput as Record<string, unknown> | undefined,
					executeImport: async (inputs: Record<string, unknown>) => {
						return this.callWorker<Timetable>('slot:executeImport', {
							slotName,
							id,
							inputs
						});
					}
				};
				sub = this.engine.slots.register('import.source.tab', proxy);
			} else if (slotName === 'export.action') {
				const proxy: StandardSlotMap['export.action'] & { id: string } = {
					id,
					title: () => (contribution.title as string) || id,
					order: contribution.order as number | undefined,
					icon: contribution.icon as string | undefined,
					export: async (timetable: Timetable) => {
						return this.callWorker<ExportResult>('slot:export', {
							slotName,
							id,
							timetable
						});
					}
				};
				sub = this.engine.slots.register('export.action', proxy);
			} else if (slotName === 'course.detail.action') {
				const proxy: StandardSlotMap['course.detail.action'] & { id: string } = {
					id,
					label: () => (contribution.label as string) || (contribution.title as string) || id,
					icon: contribution.icon as string | undefined,
					order: contribution.order as number | undefined,
					onExecute: async (course: Course) => {
						await this.callWorker('slot:courseAction', {
							slotName,
							id,
							course
						});
					}
				};
				sub = this.engine.slots.register('course.detail.action', proxy);
			} else if (slotName === 'timetable.cell.badge') {
				sub = this.engine.badges.registerCourseBadge({
					id,
					projectBadges: contribution.hasProjectBadges
						? async (courses: Course[]) => {
								return this.callWorker<Record<string, CourseBadge[]>>('slot:projectBadges', {
									slotName,
									id,
									courses
								});
							}
						: undefined
				});
			} else if (slotName === 'mine.section') {
				const proxy: StandardSlotMap['mine.section'] & { id: string } = {
					id,
					title: () => (contribution.title as string) || id,
					order: contribution.order as number | undefined
				};
				sub = this.engine.slots.register('mine.section', proxy);
			} else if (slotName === 'mine.item') {
				const proxy: StandardSlotMap['mine.item'] & { id: string } = {
					id,
					sectionId: (contribution.sectionId as string) || 'app-support',
					title: () => (contribution.title as string) || id,
					supporting: contribution.supporting ? () => contribution.supporting as string : undefined,
					icon: contribution.icon as string | undefined,
					iconTone: contribution.iconTone as
						| 'primary'
						| 'secondary'
						| 'tertiary'
						| 'neutral'
						| undefined,
					order: contribution.order as number | undefined,
					href: contribution.href as string | undefined,
					onClick: contribution.hasOnClick
						? async () => {
								await this.callWorker('slot:mineItemClick', {
									slotName,
									id
								});
							}
						: undefined
				};
				sub = this.engine.slots.register('mine.item', proxy);
			} else if (slotName === 'shell.route.screen') {
				const proxy: StandardSlotMap['shell.route.screen'] & { id: string } = {
					id,
					title: () => (contribution.title as string) || id,
					schema: contribution.schema as ConfigSchema<Record<string, unknown>> | undefined
				};
				sub = this.engine.slots.register('shell.route.screen', proxy);
			} else if (slotName === 'theme.definition') {
				const proxy: ThemeContribution = {
					id,
					name: () => (contribution.name as string) || (contribution.title as string) || id,
					supportsDynamicColor: Boolean(contribution.supportsDynamicColor),
					getTokens: (mode: 'light' | 'dark') => {
						const tokens =
							mode === 'dark'
								? (contribution.darkTokens as Record<string, string>)
								: (contribution.lightTokens as Record<string, string>);
						return {
							surface: tokens?.surface ?? '#ffffff',
							onSurface: tokens?.onSurface ?? '#000000',
							primary: tokens?.primary ?? '#0068b7',
							onPrimary: tokens?.onPrimary ?? '#ffffff',
							surfaceVariant: tokens?.surfaceVariant ?? '#f0f0f0',
							outline: tokens?.outline ?? '#cccccc',
							...tokens
						};
					},
					resolveCoursePaint: contribution.hasResolveCoursePaint
						? (_course: Course, paletteIndex: number, mode: 'light' | 'dark') => {
								const isDark = mode === 'dark';
								const defaultColors = isDark
									? [
											{ background: '#f38ba8', foreground: '#11111b' },
											{ background: '#fab387', foreground: '#11111b' },
											{ background: '#a6e3a1', foreground: '#11111b' },
											{ background: '#89b4fa', foreground: '#11111b' }
										]
									: [
											{ background: '#d20f39', foreground: '#ffffff' },
											{ background: '#fe640b', foreground: '#ffffff' },
											{ background: '#40a02b', foreground: '#ffffff' },
											{ background: '#1e66f5', foreground: '#ffffff' }
										];
								return defaultColors[Math.abs(paletteIndex) % defaultColors.length]!;
							}
						: undefined
				};
				sub = this.engine.themes.registerTheme(proxy);
			} else {
				sub = this.engine.slots.register(slotName, contribution as never);
			}

			this.registerSlotDisposable(`slot:${slotName}:${id}`, sub);
			return;
		}

		if (method === 'slot:unregister') {
			const slotName = (params.slotName as string) || (params.type as string);
			const id = String(params.id);
			const key = `slot:${slotName}:${id}`;
			const sub = this.slotDisposables.get(key);
			if (sub) {
				sub.dispose();
				this.slotDisposables.delete(key);
			}
			return;
		}

		throw new Error(`Unknown host RPC method: ${method}`);
	}

	private registerSlotDisposable(key: string, disposable: Disposable): void {
		const existing = this.slotDisposables.get(key);
		if (existing) existing.dispose();
		this.slotDisposables.set(key, disposable);
	}

	callWorker<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
		return new Promise((resolve, reject) => {
			if (!this.worker) {
				return reject(new Error('Worker is not running'));
			}
			const id = `h_req_${++this.rpcSeq}_${Date.now()}`;
			this.pendingRequests.set(id, {
				resolve: resolve as (val: unknown) => void,
				reject
			});
			this.worker.postMessage({ id, method, params });
		});
	}

	postWorkerEvent(event: string, payload: unknown): void {
		this.worker?.postMessage({ event, payload });
	}

	private replySuccess(id: string, result: unknown): void {
		this.worker?.postMessage({ id, result, ok: true });
	}

	private replyError(id: string, error: string): void {
		this.worker?.postMessage({ id, error, ok: false });
	}

	get initialized(): boolean {
		return this.isInitialized;
	}

	dispose(): void {
		for (const [, sub] of this.slotDisposables) {
			sub.dispose();
		}
		this.slotDisposables.clear();

		for (const d of this.disposables) {
			d.dispose();
		}
		this.disposables = [];

		for (const [, pending] of this.pendingRequests) {
			pending.reject(new Error('Worker disposed'));
		}
		this.pendingRequests.clear();

		this.worker?.terminate();
		this.worker = null;
	}
}
