import type { OfficialPluginService } from './official-plugin-service';
import type { ChronosEngine, Disposable } from '@chronos/core';
import type { PluginManifest } from '@chronos/core';

export interface PluginHmrData {
	id: string;
	type?: 'theme' | 'tool';
	rev?: string;
	costMs: string;
	manifest?: Record<string, unknown>;
	code: string | null;
	cssCode: string | null;
	colorsJson: string | null;
	iconThemeJson: string | null;
}

export interface PluginHmrErrorData {
	id: string;
	message: string;
	stack?: string;
}

type HmrSession = {
	service: OfficialPluginService;
	engine: ChronosEngine;
	controller: AbortController;
	sequences: Map<string, number>;
	applied: Map<string, Set<string>>;
};
class PluginHmrCoordinator {
	private active?: HmrSession;
	private listening = false;
	// Chains outlive a session so a replacement session waits for aborted runtime rollback.
	private readonly chains = new Map<string, Promise<void>>();
	resetForTesting(): void {
		this.active?.controller.abort();
		this.active = undefined;
		this.chains.clear();
	}
	enqueue(
		service: OfficialPluginService,
		engine: ChronosEngine,
		data: PluginHmrData
	): Promise<void> {
		const session = this.active;
		if (!session || session.service !== service || session.engine !== engine)
			return Promise.resolve();
		session.sequences.set(data.id, (session.sequences.get(data.id) ?? 0) + 1);
		return this.queue(session, data, false);
	}
	private queue(session: HmrSession, data: PluginHmrData, silent: boolean): Promise<void> {
		const previous = this.chains.get(data.id) ?? Promise.resolve();
		const next = previous
			.then(async () => {
				if (session.controller.signal.aborted || !session.service.getInstalled(data.id)) return;
				if (data.rev && session.applied.get(data.id)?.has(data.rev)) return;
				const applied = await handlePluginHmr(session.service, session.engine, data, {
					silent,
					signal: session.controller.signal
				});
				if (applied && data.rev) {
					const revisions = session.applied.get(data.id) ?? new Set<string>();
					revisions.add(data.rev);
					session.applied.set(data.id, revisions);
				}
			})
			.catch((error) => {
				if (!session.controller.signal.aborted) console.error('[Plugin HMR]', error);
			})
			.finally(() => {
				if (this.chains.get(data.id) === next) this.chains.delete(data.id);
			});
		this.chains.set(data.id, next);
		return next;
	}
	private async bootstrap(session: HmrSession): Promise<void> {
		const sequences = new Map(session.sequences);
		try {
			const response = await fetch('/__chronos/dev-plugin-hmr.json', {
				signal: session.controller.signal
			});
			if (!response.ok) return;
			const payloads = (await response.json()) as PluginHmrData[];
			if (session.controller.signal.aborted) return;
			await Promise.all(
				payloads
					.filter((data) => (session.sequences.get(data.id) ?? 0) === (sequences.get(data.id) ?? 0))
					.map((data) => this.queue(session, data, true))
			);
		} catch (error) {
			if (!session.controller.signal.aborted)
				console.warn('[Plugin HMR] Failed to bootstrap dev plugin builds:', error);
		}
	}
	setup(service: OfficialPluginService, engine: ChronosEngine): Disposable {
		this.active?.controller.abort();
		const session: HmrSession = {
			service,
			engine,
			controller: new AbortController(),
			sequences: new Map(),
			applied: new Map()
		};
		this.active = session;
		if (import.meta.hot && !this.listening) {
			this.listening = true;
			import.meta.hot.on('chronos:plugin-hmr', (data: PluginHmrData) => {
				if (this.active) void this.enqueue(this.active.service, this.active.engine, data);
			});
			import.meta.hot.on('chronos:plugin-hmr-error', (data: PluginHmrErrorData) => {
				console.error(`[Plugin HMR] Build error in [${data.id}]:`, data.message);
				this.active?.engine.notify(`[HMR] 插件 ${data.id} 编译失败: ${data.message}`, 'error');
			});
			import.meta.hot.dispose(() => {
				this.active?.controller.abort();
				this.active = undefined;
				this.listening = false;
			});
		}
		if (import.meta.env.DEV && typeof window !== 'undefined') void this.bootstrap(session);
		return {
			dispose: () => {
				session.controller.abort();
				if (this.active === session) this.active = undefined;
			}
		};
	}
}
const pluginHmrCoordinator = new PluginHmrCoordinator();
export function resetPluginHmrForTesting(): void {
	pluginHmrCoordinator.resetForTesting();
}
export function enqueuePluginHmr(
	service: OfficialPluginService,
	engine: ChronosEngine,
	data: PluginHmrData
): Promise<void> {
	return pluginHmrCoordinator.enqueue(service, engine, data);
}
export function setupPluginHmr(service: OfficialPluginService, engine: ChronosEngine): Disposable {
	return pluginHmrCoordinator.setup(service, engine);
}

export async function handlePluginHmr(
	service: OfficialPluginService,
	engine: ChronosEngine,
	data: PluginHmrData,
	options?: { silent?: boolean; signal?: AbortSignal }
): Promise<boolean> {
	const { id, costMs } = data;
	const existing = service.getInstalled(id);
	if (!existing) {
		if (!options?.silent) engine.notify(`[HMR] 插件 ${id} 已重编 (${costMs}ms，未安装)`, 'info');
		return false;
	}
	try {
		options?.signal?.throwIfAborted();
		const updated = await service.applyHotUpdate(data, { signal: options?.signal });
		if (options?.signal?.aborted) return false;
		if (updated.enabled && updated.manifest.type === 'theme') {
			const manifest = updated.manifest as PluginManifest & { themeId?: string };
			const active = engine.state.activeThemeId;
			if (active && (active === id || manifest.themeId === active)) engine.setTheme(active);
		}
		if (!options?.silent)
			engine.notify(
				updated.enabled
					? `[HMR] 插件 ${id} 已热重载 (${costMs}ms)`
					: `[HMR] 插件 ${id} 已更新 (${costMs}ms，未启用)`,
				'info'
			);
		return true;
	} catch (err) {
		if (options?.signal?.aborted) return false;
		const error = err instanceof Error ? err : new Error(String(err));
		const action = existing.enabled ? '热重载' : '热更新';
		console.error(`[Plugin HMR] ${action} ${id} 失败:`, error);
		engine.notify(`[HMR] ${action} ${id} 失败: ${error.message}`, 'error');
		return false;
	}
}
