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

let activeService: OfficialPluginService | null = null;
let activeEngine: ChronosEngine | null = null;
let isListening = false;

export function resetPluginHmrForTesting(): void {
	activeService = null;
	activeEngine = null;
	isListening = false;
}

export function setupPluginHmr(service: OfficialPluginService, engine: ChronosEngine): Disposable {
	activeService = service;
	activeEngine = engine;

	if (!import.meta.hot) {
		return {
			dispose: () => {
				if (activeService === service) {
					activeService = null;
					activeEngine = null;
				}
			}
		};
	}

	if (!isListening) {
		isListening = true;

		import.meta.hot.on('chronos:plugin-hmr', (data: PluginHmrData) => {
			if (activeService && activeEngine) {
				void handlePluginHmr(activeService, activeEngine, data);
			}
		});

		import.meta.hot.on('chronos:plugin-hmr-error', (data: PluginHmrErrorData) => {
			console.error(`[Plugin HMR] Build error in [${data.id}]:`, data.message);
			activeEngine?.notify(`[HMR] 插件 ${data.id} 编译失败: ${data.message}`, 'error');
		});

		import.meta.hot.dispose(() => {
			isListening = false;
			activeService = null;
			activeEngine = null;
		});
	}

	return {
		dispose: () => {
			if (activeService === service) {
				activeService = null;
				activeEngine = null;
			}
		}
	};
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
