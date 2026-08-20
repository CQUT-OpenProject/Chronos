/* eslint-disable @typescript-eslint/no-implied-eval, no-new-func */
import type { PluginManifest } from '@chronos/core';
import type { WorkerRpcMessage } from './worker-plugin-bridge';

type SlotContribution = Record<string, unknown> & {
	id: string;
	executeImport?: (inputs: Record<string, unknown>, ctx: unknown) => unknown;
	export?: (timetable: unknown, ctx: unknown) => unknown;
	onExecute?: (course: unknown, ctx: unknown) => unknown;
	projectBadges?: (courses: unknown) => unknown;
	onClick?: (ctx: unknown) => unknown;
	getTokens?: (mode: string, seed?: unknown) => unknown;
	resolveCoursePaint?: (course: unknown, paletteIndex: number, mode: string) => unknown;
};

function resolveText(text: unknown): string {
	if (!text) return '';
	return typeof text === 'function' ? String((text as () => unknown)()) : String(text);
}

/**
 * In-process Worker stand-in that runs the same host RPC protocol as worker-runtime.js.
 */
export class InProcessSandboxAdapter implements Worker {
	onmessage: ((this: Worker, ev: MessageEvent<WorkerRpcMessage>) => unknown) | null = null;
	onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null = null;
	onerror: ((this: AbstractWorker, ev: ErrorEvent) => unknown) | null = null;

	private terminated = false;
	private rpcSeq = 0;
	private pending = new Map<
		string,
		{ resolve: (v: unknown) => void; reject: (e: Error) => void }
	>();
	private eventHandlers = new Map<string, Set<(payload: unknown) => unknown>>();
	private slots = new Map<string, Map<string, SlotContribution>>();
	private currentContext: Record<string, unknown> | null = null;
	private currentState: Record<string, unknown> = {};

	constructor(
		private manifest: PluginManifest,
		private code: string
	) {
		queueMicrotask(() => {
			void this.initPlugin();
		});
	}

	private getSlotGroup(slotName: string): Map<string, SlotContribution> {
		let group = this.slots.get(slotName);
		if (!group) {
			group = new Map();
			this.slots.set(slotName, group);
		}
		return group;
	}

	private emitToHost(data: WorkerRpcMessage): void {
		if (this.terminated || !this.onmessage) return;
		this.onmessage.call(this, { data } as MessageEvent<WorkerRpcMessage>);
	}

	private callHost(method: string, params: Record<string, unknown>): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const id = `w_req_${++this.rpcSeq}_${Date.now()}`;
			this.pending.set(id, { resolve, reject });
			this.emitToHost({ id, method, params });
		});
	}

	private createContext(): Record<string, unknown> {
		const subscriptions: { dispose: () => void }[] = [];
		let pluginConfig: Record<string, unknown> = {
			...(this.manifest as PluginManifest & { defaultConfig?: Record<string, unknown> })
				.defaultConfig
		};

		const getState = () => this.currentState;

		const ctx = {
			pluginId: this.manifest.id,
			service: (identifier: { key?: string } | string) => {
				const key = typeof identifier === 'string' ? identifier : identifier?.key || 'http';
				if (key === 'http') {
					return {
						request: (url: string, options?: unknown) =>
							this.callHost('http:request', { url, options: options as Record<string, unknown> })
					};
				}
				throw new Error(`Service "${key}" is not supported in sandbox`);
			},
			get config() {
				return pluginConfig;
			},
			updateConfig: async (patch: Record<string, unknown>) => {
				pluginConfig = { ...pluginConfig, ...patch };
				await this.callHost('config:update', { patch });
			},
			storage: {
				get: (key: string) => this.callHost('storage:get', { key }),
				set: (key: string, value: unknown) => this.callHost('storage:set', { key, value }),
				delete: (key: string) => this.callHost('storage:delete', { key })
			},
			i18n: {
				locale: 'zh-cn',
				t: (key: string, params?: { default?: string }) => params?.default ?? key
			},
			get state() {
				return getState();
			},
			actions: {
				notify: (message: string, type?: string) => {
					void this.callHost('actions:notify', { message, type: type || 'info' });
				}
			},
			registerSlot: (slotName: string, contribution: SlotContribution) => {
				this.getSlotGroup(slotName).set(contribution.id, contribution);
				const serializable = {
					id: contribution.id,
					title: resolveText(contribution.title),
					label: resolveText(contribution.label),
					order: contribution.order,
					hasOnClick: typeof contribution.onClick === 'function'
				};
				void this.callHost('slot:register', { slotName, contribution: serializable });
				const disposable = {
					dispose: () => {
						this.getSlotGroup(slotName).delete(contribution.id);
						void this.callHost('slot:unregister', { slotName, id: contribution.id });
					}
				};
				subscriptions.push(disposable);
				return disposable;
			},
			on: (event: string, handler: (payload: unknown) => unknown) => {
				if (!this.eventHandlers.has(event)) {
					this.eventHandlers.set(event, new Set());
					void this.callHost('event:subscribe', { event });
				}
				this.eventHandlers.get(event)!.add(handler);
				return { dispose: () => this.eventHandlers.get(event)?.delete(handler) };
			},
			registerPipelineHook: () => ({ dispose: () => {} }),
			addDisposable: (d: { dispose: () => void }) => {
				subscriptions.push(d);
			}
		};

		return ctx;
	}

	private async initPlugin(): Promise<void> {
		if (this.terminated) return;
		this.currentContext = this.createContext();
		try {
			const fn = new Function('module', 'exports', 'ctx', this.code);
			const moduleObj: { exports: Record<string, unknown> } = { exports: {} };
			const res = fn(moduleObj, moduleObj.exports, this.currentContext);
			const plugin = (moduleObj.exports.default ||
				moduleObj.exports.plugin ||
				moduleObj.exports ||
				res) as { apply?: (ctx: unknown) => unknown };
			if (plugin && typeof plugin.apply === 'function') {
				await plugin.apply(this.currentContext);
			}
			this.emitToHost({
				method: 'plugin:initialized',
				params: { pluginId: this.manifest.id },
				ok: true
			});
		} catch (err: unknown) {
			const error = err instanceof Error ? err.message : String(err);
			this.emitToHost({
				method: 'plugin:initError',
				params: { pluginId: this.manifest.id, error },
				ok: false,
				error
			});
		}
	}

	postMessage(message: WorkerRpcMessage): void {
		if (this.terminated) return;
		void this.handleHostMessage(message);
	}

	private async handleHostMessage(data: WorkerRpcMessage): Promise<void> {
		if (typeof data.id === 'string' && ('result' in data || 'error' in data) && !data.method) {
			const pending = this.pending.get(data.id);
			if (pending) {
				this.pending.delete(data.id);
				if (data.ok) pending.resolve(data.result);
				else pending.reject(new Error(data.error || 'RPC failed'));
			}
			return;
		}

		if (data.event) {
			if (data.event === 'state:sync' && data.payload && typeof data.payload === 'object') {
				this.currentState = { ...this.currentState, ...(data.payload as Record<string, unknown>) };
			}
			const handlers = this.eventHandlers.get(data.event);
			if (handlers) {
				for (const handler of handlers) {
					await handler(data.payload);
				}
			}
			return;
		}

		if (typeof data.id === 'string' && typeof data.method === 'string') {
			try {
				const params = data.params || {};
				let result: unknown;
				if (data.method === 'slot:executeImport' || data.method === 'source:fetchSchedule') {
					const contribution = this.getSlotGroup('import.source.tab').get(
						String(params.id || params.sourceId)
					);
					if (!contribution?.executeImport) {
						throw new Error('Import source slot contribution not found');
					}
					result = await contribution.executeImport(
						(params.inputs as Record<string, unknown>) || {},
						this.currentContext
					);
				} else if (data.method === 'slot:export') {
					const contribution = this.getSlotGroup('export.action').get(String(params.id));
					if (!contribution?.export) throw new Error('Export action not found');
					result = await contribution.export(params.timetable, this.currentContext);
				} else if (data.method === 'slot:mineItemClick') {
					const contribution = this.getSlotGroup('mine.item').get(String(params.id));
					result = await contribution?.onClick?.(this.currentContext);
				} else {
					throw new Error(`Unknown worker RPC method: ${data.method}`);
				}
				this.emitToHost({ id: data.id, result, ok: true });
			} catch (err: unknown) {
				const error = err instanceof Error ? err.message : String(err);
				this.emitToHost({ id: data.id, error, ok: false });
			}
		}
	}

	terminate(): void {
		this.terminated = true;
		this.pending.clear();
	}

	addEventListener = () => {};
	removeEventListener = () => {};
	dispatchEvent = () => true;
}
