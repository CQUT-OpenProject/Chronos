import type { OfficialPluginService } from './official-plugin-service';
import type { ChronosEngine, Disposable } from '@chronos/core';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';

export interface PluginHmrData {
	id: string;
	type?: 'theme' | 'tool';
	rev: string;
	costMs: string;
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

class PluginHmrCoordinator {
	private activeService: OfficialPluginService | null = null;
	private activeEngine: ChronosEngine | null = null;
	private isListening = false;
	private readonly hmrChains = new Map<string, Promise<void>>();

	resetForTesting(): void {
		this.activeService = null;
		this.activeEngine = null;
		this.isListening = false;
		this.hmrChains.clear();
	}

	enqueue(service: OfficialPluginService, engine: ChronosEngine, data: PluginHmrData): void {
		const { id } = data;
		const prev = this.hmrChains.get(id) ?? Promise.resolve();
		const next = prev
			.then(() => handlePluginHmr(service, engine, data))
			.catch(() => {})
			.finally(() => {
				if (this.hmrChains.get(id) === next) {
					this.hmrChains.delete(id);
				}
			});
		this.hmrChains.set(id, next);
	}

	setup(service: OfficialPluginService, engine: ChronosEngine): Disposable {
		this.activeService = service;
		this.activeEngine = engine;

		if (!import.meta.hot) {
			return this.createServiceDisposable(service);
		}

		if (!this.isListening) {
			this.isListening = true;

			import.meta.hot.on('chronos:plugin-hmr', (data: PluginHmrData) => {
				if (this.activeService && this.activeEngine) {
					this.enqueue(this.activeService, this.activeEngine, data);
				}
			});

			import.meta.hot.on('chronos:plugin-hmr-error', (data: PluginHmrErrorData) => {
				console.error(`[Plugin HMR] Build error in [${data.id}]:`, data.message);
				this.activeEngine?.notify(`[HMR] 插件 ${data.id} 编译失败: ${data.message}`, 'error');
			});

			import.meta.hot.dispose(() => {
				this.isListening = false;
				this.activeService = null;
				this.activeEngine = null;
			});
		}

		return this.createServiceDisposable(service);
	}

	private createServiceDisposable(service: OfficialPluginService): Disposable {
		return {
			dispose: () => {
				if (this.activeService === service) {
					this.activeService = null;
					this.activeEngine = null;
				}
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
): void {
	pluginHmrCoordinator.enqueue(service, engine, data);
}

export function setupPluginHmr(service: OfficialPluginService, engine: ChronosEngine): Disposable {
	return pluginHmrCoordinator.setup(service, engine);
}

export async function handlePluginHmr(
	service: OfficialPluginService,
	engine: ChronosEngine,
	data: PluginHmrData
): Promise<void> {
	const { id, type, code, cssCode, colorsJson, iconThemeJson, costMs } = data;
	const existing = service.getInstalled(id);

	if (!existing) {
		engine.notify(`[HMR] 插件 ${id} 已重编 (${costMs}ms，未安装)`, 'info');
		return;
	}

	const isTheme = type === 'theme' || existing.manifest.type === 'theme';

	const updatedRecord: InstalledOfficialPluginRecord = {
		...existing,
		code: isTheme ? null : (code ?? existing.code),
		cssCode: isTheme ? null : cssCode,
		colorsJson: isTheme ? (colorsJson ?? existing.colorsJson) : null,
		iconThemeJson: isTheme ? (iconThemeJson ?? existing.iconThemeJson) : null,
		installedAt: Date.now()
	};

	if (!existing.enabled) {
		await service.updateRecord(updatedRecord);
		engine.notify(`[HMR] 插件 ${id} 已更新 (${costMs}ms，未启用)`, 'info');
		return;
	}

	try {
		const activator = service.getRuntimeActivator();
		await activator.deactivate(id, { revertThemes: false });
		await activator.activate(updatedRecord);
		await service.updateRecord(updatedRecord);

		if (updatedRecord.manifest.type === 'theme') {
			const currentActiveThemeId = engine.state.activeThemeId;
			if (
				currentActiveThemeId &&
				(currentActiveThemeId === id || updatedRecord.manifest.themeId === currentActiveThemeId)
			) {
				engine.setTheme(currentActiveThemeId);
			}
		}

		engine.notify(`[HMR] 插件 ${id} 已热重载 (${costMs}ms)`, 'info');
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		console.error(`[Plugin HMR] 热重载 ${id} 失败:`, error);
		engine.notify(`[HMR] 热重载 ${id} 失败: ${error.message}`, 'error');
	}
}
