import type { PluginManifest } from '@chronos/core';

export type PluginInstallStage =
	| 'queued'
	| 'downloading'
	| 'verifying'
	| 'installing'
	| 'completed'
	| 'failed'
	| 'canceled';

export type InstallQueueChangeKind = 'progress' | 'state';

export interface PluginInstallProgress {
	readonly stage: PluginInstallStage;
	readonly percent: number;
	readonly message?: string;
}

export interface PluginInstallTask {
	readonly pluginId: string;
	readonly manifest: PluginManifest;
	readonly manifestUrl?: string;
	readonly status: PluginInstallStage;
	readonly progress: PluginInstallProgress;
	readonly error?: string;
	readonly enqueuedAt: number;
	readonly startedAt?: number;
	readonly completedAt?: number;
}

export type PluginInstallRunner = (
	manifest: PluginManifest,
	manifestUrl?: string,
	options?: {
		signal?: AbortSignal;
		onProgress?: (progress: {
			stage: PluginInstallStage;
			percent: number;
			message?: string;
		}) => void;
	}
) => Promise<void>;

export interface OfficialPluginInstallQueueDeps {
	runner: PluginInstallRunner;
	onTaskFailed?: (task: PluginInstallTask) => void;
	onTaskCompleted?: (task: PluginInstallTask) => void;
	onTaskCanceled?: (task: PluginInstallTask) => void;
}
