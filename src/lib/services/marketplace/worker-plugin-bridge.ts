/* eslint-disable @typescript-eslint/no-implied-eval, no-new-func */
import type {
	PluginManifest,
	ChronosEngine,
	Disposable,
	Timetable,
	Course,
	CourseBadge,
	ExportResult,
	HttpRequestOptions
} from '@chronos/core';

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

class HeadlessSandboxWorker implements Worker {
	onmessage: ((this: Worker, ev: MessageEvent<WorkerRpcMessage>) => unknown) | null = null;
	onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null = null;
	onerror: ((this: AbstractWorker, ev: ErrorEvent) => unknown) | null = null;
	private terminated = false;

	constructor(manifest: PluginManifest, code: string) {
		queueMicrotask(() => {
			if (this.terminated) return;
			try {
				const fn = new Function('module', 'exports', 'ctx', code);
				const moduleObj: { exports: Record<string, unknown> } = { exports: {} };
				const res = fn(moduleObj, moduleObj.exports, {});
				const plugin =
					(moduleObj.exports.default as { apply?: unknown }) ||
					(moduleObj.exports.plugin as { apply?: unknown }) ||
					(moduleObj.exports as { apply?: unknown }) ||
					(res as { apply?: unknown });
				if (plugin && typeof plugin.apply === 'function') {
					// Plugin executed
				}
				this.emitToHost({
					method: 'plugin:initialized',
					params: { pluginId: manifest.id },
					ok: true
				});
			} catch (err: unknown) {
				const error = err instanceof Error ? err.message : String(err);
				this.emitToHost({
					method: 'plugin:initError',
					params: { pluginId: manifest.id, error },
					ok: false
				});
			}
		});
	}

	postMessage(_message: WorkerRpcMessage): void {
		// Host to Worker
	}

	private emitToHost(data: WorkerRpcMessage): void {
		if (this.onmessage) {
			this.onmessage.call(this, { data } as MessageEvent<WorkerRpcMessage>);
		}
	}

	terminate(): void {
		this.terminated = true;
	}

	addEventListener = () => {};
	removeEventListener = () => {};
	dispatchEvent = () => true;
}

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
		} else {
			this.worker = new HeadlessSandboxWorker(this.manifest, this.code);
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

	private async dispatchHostMethod(
		method: string,
		params: Record<string, unknown>
	): Promise<unknown> {
		// Permission gateway: Network access check
		if (method.startsWith('http:')) {
			if (!this.manifest.capabilities?.includes('network')) {
				throw new Error('Permission Denied: network capability required');
			}
			if (method === 'http:request') {
				return this.engine.env.http.request(
					params.url as string,
					params.options as HttpRequestOptions | undefined
				);
			}
		}

		// Permission gateway: Storage capability and scoped prefix enforcement
		if (method.startsWith('storage:')) {
			if (!this.manifest.capabilities?.includes('storage')) {
				throw new Error('Permission Denied: storage capability required');
			}
			const key = params.key as string;
			switch (method) {
				case 'storage:get':
					return this.engine.env.storage.getPluginData(this.manifest.id, key);
				case 'storage:set':
					return this.engine.env.storage.setPluginData(this.manifest.id, key, params.value);
				case 'storage:delete':
					return this.engine.env.storage.deletePluginData(this.manifest.id, key);
			}
		}

		// Permission gateway: Notification capability
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

		// Event subscription proxy
		if (method === 'event:subscribe') {
			const eventName = params.event as string;
			const sub = this.engine.on(eventName as never, (payload: unknown) => {
				this.postWorkerEvent(eventName, payload);
			});
			this.disposables.push(sub);
			return;
		}

		// Extension point slot registration proxies
		if (method === 'slot:registerSource') {
			const id = params.id as string;
			const sub = this.engine.slots.registerSource({
				id,
				title: () => (params.title as string) || id,
				authType: (params.authType as 'none' | 'password' | 'file') || 'none',
				fetchSchedule: async (fetchParams) => {
					return this.callWorker<Timetable>('source:fetchSchedule', {
						sourceId: id,
						params: fetchParams
					});
				}
			});
			this.registerSlotDisposable(`source:${id}`, sub);
			return;
		}

		if (method === 'slot:registerExporter') {
			const id = params.id as string;
			const sub = this.engine.slots.registerExporter({
				id,
				title: () => (params.title as string) || id,
				export: async (timetable) => {
					return this.callWorker<ExportResult>('exporter:export', {
						exporterId: id,
						timetable
					});
				}
			});
			this.registerSlotDisposable(`exporter:${id}`, sub);
			return;
		}

		if (method === 'slot:registerCourseAction') {
			const id = params.id as string;
			const sub = this.engine.slots.registerCourseAction({
				id,
				label: () => (params.label as string) || id,
				icon: params.icon as string | undefined,
				onExecute: async (course) => {
					await this.callWorker('action:execute', { actionId: id, course });
				}
			});
			this.registerSlotDisposable(`action:${id}`, sub);
			return;
		}

		if (method === 'slot:registerCourseBadge') {
			const id = params.id as string;
			const sub = this.engine.badges.registerCourseBadge({
				id,
				projectBadges: params.hasProjectBadges
					? async (courses) => {
							return this.callWorker<Record<string, CourseBadge[]>>('badge:projectBadges', {
								badgeId: id,
								courses
							});
						}
					: undefined
			});
			this.registerSlotDisposable(`badge:${id}`, sub);
			return;
		}

		if (method === 'slot:registerTheme') {
			const id = params.id as string;
			const sub = this.engine.themes.registerTheme({
				id,
				name: () => (params.name as string) || id,
				supportsDynamicColor: Boolean(params.supportsDynamicColor),
				getTokens: (mode) => {
					const tokens =
						mode === 'dark'
							? (params.darkTokens as Record<string, string>)
							: (params.lightTokens as Record<string, string>);
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
				resolveCoursePaint: params.hasResolveCoursePaint
					? (course: Course, paletteIndex: number, mode: 'light' | 'dark') => {
							// Static palette fallback calculation or worker delegation
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
			});
			this.registerSlotDisposable(`theme:${id}`, sub);
			return;
		}

		if (method === 'slot:unregister') {
			const key = `${String(params.type)}:${String(params.id)}`;
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
