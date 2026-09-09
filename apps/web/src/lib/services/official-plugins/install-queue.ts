import type { Disposable, PluginManifest } from '@chronos/core';

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

function isAbortError(err: unknown): boolean {
	if (!err) return false;
	if (typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
		return true;
	}
	if (err instanceof Error && (err.message === 'Aborted' || err.name === 'AbortError')) {
		return true;
	}
	return false;
}

/**
 * OfficialPluginInstallQueue manages sequential (FIFO, concurrency = 1)
 * plugin installations with progress tracking, stage transitions, cancellation,
 * and error isolation.
 */
export class OfficialPluginInstallQueue implements Disposable {
	private readonly tasks = new Map<string, PluginInstallTask>();
	private readonly listeners = new Set<(change: { kind: InstallQueueChangeKind }) => void>();
	private isProcessing = false;
	private activeTaskId: string | null = null;
	private activeController: AbortController | null = null;
	private disposed = false;

	constructor(private readonly deps: OfficialPluginInstallQueueDeps) {}

	/**
	 * Adds a plugin to the installation queue.
	 * If already queued or in progress, ignores duplicate request.
	 * If previously failed or canceled, resets to queued.
	 */
	enqueue(manifest: PluginManifest, manifestUrl?: string): void {
		if (this.disposed) return;
		const existing = this.tasks.get(manifest.id);

		if (existing) {
			if (
				existing.status === 'queued' ||
				existing.status === 'downloading' ||
				existing.status === 'verifying' ||
				existing.status === 'installing'
			) {
				return;
			}
			const updated: PluginInstallTask = {
				...existing,
				manifest,
				manifestUrl: manifestUrl ?? existing.manifestUrl,
				status: 'queued',
				progress: { stage: 'queued', percent: 0 },
				error: undefined,
				enqueuedAt: Date.now(),
				startedAt: undefined,
				completedAt: undefined
			};
			this.tasks.set(manifest.id, updated);
			this.notifyState();
			void this.processNext();
			return;
		}

		const task: PluginInstallTask = {
			pluginId: manifest.id,
			manifest,
			manifestUrl,
			status: 'queued',
			progress: { stage: 'queued', percent: 0 },
			enqueuedAt: Date.now()
		};

		this.tasks.set(manifest.id, task);
		this.notifyState();
		void this.processNext();
	}

	/**
	 * Cancels a pending or currently active installation task.
	 */
	cancel(pluginId: string): void {
		const task = this.tasks.get(pluginId);
		if (!task) return;

		if (task.status === 'queued') {
			const canceled: PluginInstallTask = {
				...task,
				status: 'canceled',
				progress: { stage: 'canceled', percent: 0 }
			};
			this.tasks.set(pluginId, canceled);
			this.notifyState();
			this.deps.onTaskCanceled?.(canceled);
			this.clearFinished(pluginId);
			return;
		}

		if (
			task.status === 'downloading' ||
			task.status === 'verifying' ||
			task.status === 'installing'
		) {
			if (this.activeTaskId === pluginId && this.activeController) {
				this.activeController.abort();
			}
			this.tasks.set(pluginId, {
				...task,
				status: 'canceled',
				progress: { stage: 'canceled', percent: 0 }
			});
			this.notifyState();
		}
	}

	/**
	 * Retries a failed or canceled installation.
	 */
	retry(pluginId: string): void {
		const task = this.tasks.get(pluginId);
		if (!task) return;
		if (task.status !== 'failed' && task.status !== 'canceled') return;

		this.tasks.set(pluginId, {
			...task,
			status: 'queued',
			progress: { stage: 'queued', percent: 0 },
			error: undefined,
			enqueuedAt: Date.now(),
			startedAt: undefined,
			completedAt: undefined
		});

		this.notifyState();
		void this.processNext();
	}

	/**
	 * Cancels all queued and active tasks.
	 */
	cancelAll(): void {
		let changed = false;
		for (const [id, task] of this.tasks.entries()) {
			if (task.status === 'queued') {
				const canceled: PluginInstallTask = {
					...task,
					status: 'canceled',
					progress: { stage: 'canceled', percent: 0 }
				};
				this.tasks.set(id, canceled);
				this.deps.onTaskCanceled?.(canceled);
				this.clearFinished(id);
				changed = true;
			}
		}

		if (this.activeController) {
			this.activeController.abort();
		}

		if (this.activeTaskId) {
			const activeTask = this.tasks.get(this.activeTaskId);
			if (activeTask && activeTask.status !== 'canceled') {
				this.tasks.set(this.activeTaskId, {
					...activeTask,
					status: 'canceled',
					progress: { stage: 'canceled', percent: 0 }
				});
				changed = true;
			}
		}

		if (changed) {
			this.notifyState();
		}
	}

	/**
	 * Removes finished (completed/canceled) tasks from the queue registry.
	 */
	clearFinished(pluginId?: string): void {
		if (pluginId) {
			const task = this.tasks.get(pluginId);
			if (task && (task.status === 'completed' || task.status === 'canceled')) {
				this.tasks.delete(pluginId);
				this.notifyState();
			}
			return;
		}

		let changed = false;
		for (const [id, task] of this.tasks.entries()) {
			if (task.status === 'completed' || task.status === 'canceled') {
				this.tasks.delete(id);
				changed = true;
			}
		}
		if (changed) {
			this.notifyState();
		}
	}

	getTask(pluginId: string): PluginInstallTask | undefined {
		return this.tasks.get(pluginId);
	}

	getTasks(): ReadonlyArray<PluginInstallTask> {
		return Array.from(this.tasks.values());
	}

	getActiveTask(): PluginInstallTask | undefined {
		if (!this.activeTaskId) return undefined;
		return this.tasks.get(this.activeTaskId);
	}

	getQueuedTasks(): ReadonlyArray<PluginInstallTask> {
		return Array.from(this.tasks.values()).filter((t) => t.status === 'queued');
	}

	isBusy(pluginId: string): boolean {
		const task = this.tasks.get(pluginId);
		if (!task) return false;
		return (
			task.status === 'queued' ||
			task.status === 'downloading' ||
			task.status === 'verifying' ||
			task.status === 'installing'
		);
	}

	onChanged(listener: (change: { kind: InstallQueueChangeKind }) => void): Disposable {
		this.listeners.add(listener);
		return {
			dispose: () => {
				this.listeners.delete(listener);
			}
		};
	}

	private notify(kind: InstallQueueChangeKind): void {
		for (const listener of this.listeners) {
			try {
				listener({ kind });
			} catch (err) {
				console.error('[OfficialPluginInstallQueue] Error in change listener:', err);
			}
		}
	}

	private notifyState(): void {
		this.notify('state');
	}

	private notifyProgress(): void {
		this.notify('progress');
	}

	private async processNext(): Promise<void> {
		if (this.disposed || this.isProcessing) return;

		// Pick the oldest queued task (FIFO)
		let nextTask: PluginInstallTask | null = null;
		for (const task of this.tasks.values()) {
			if (task.status === 'queued') {
				if (!nextTask || task.enqueuedAt < nextTask.enqueuedAt) {
					nextTask = task;
				}
			}
		}

		if (!nextTask) {
			return;
		}

		this.isProcessing = true;
		this.activeTaskId = nextTask.pluginId;
		this.activeController = new AbortController();
		const controller = this.activeController;
		const activeId = nextTask.pluginId;

		this.tasks.set(activeId, {
			...nextTask,
			status: 'downloading',
			startedAt: Date.now(),
			progress: { stage: 'downloading', percent: 0 }
		});
		this.notifyState();

		try {
			await this.deps.runner(nextTask.manifest, nextTask.manifestUrl, {
				signal: controller.signal,
				onProgress: (prog) => {
					const current = this.tasks.get(activeId);
					if (!current || current.status === 'canceled' || controller.signal.aborted) return;
					this.tasks.set(activeId, {
						...current,
						status: prog.stage,
						progress: {
							stage: prog.stage,
							percent: Math.min(100, Math.max(0, prog.percent)),
							message: prog.message
						}
					});
					this.notifyProgress();
				}
			});

			const current = this.tasks.get(activeId);
			if (current && (current.status as string) !== 'canceled' && !controller.signal.aborted) {
				const completed: PluginInstallTask = {
					...current,
					status: 'completed',
					completedAt: Date.now(),
					progress: { stage: 'completed', percent: 100 }
				};
				this.tasks.set(activeId, completed);
				this.notifyState();
				this.deps.onTaskCompleted?.(completed);
				this.clearFinished(activeId);
			}
		} catch (err: unknown) {
			const current = this.tasks.get(activeId) ?? nextTask;
			if (
				controller.signal.aborted ||
				(current.status as string) === 'canceled' ||
				isAbortError(err)
			) {
				const canceled: PluginInstallTask = {
					...current,
					status: 'canceled',
					progress: { stage: 'canceled', percent: 0 }
				};
				this.tasks.set(activeId, canceled);
				this.notifyState();
				this.deps.onTaskCanceled?.(canceled);
				this.clearFinished(activeId);
			} else {
				const msg = err instanceof Error ? err.message : String(err);
				const failed: PluginInstallTask = {
					...current,
					status: 'failed',
					error: msg,
					progress: { stage: 'failed', percent: 0, message: msg }
				};
				this.tasks.set(activeId, failed);
				this.notifyState();
				this.deps.onTaskFailed?.(failed);
			}
		} finally {
			this.isProcessing = false;
			this.activeTaskId = null;
			this.activeController = null;
			void this.processNext();
		}
	}

	dispose(): void {
		this.disposed = true;
		this.cancelAll();
		this.listeners.clear();
	}
}
