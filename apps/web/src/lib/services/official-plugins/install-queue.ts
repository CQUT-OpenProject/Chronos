import type { Disposable } from '@chronos/core';
import type { PluginManifest } from '@chronos/core';
import { isInFlightInstallStatus } from './install-queue-task-state';
import type {
	InstallQueueChangeKind,
	OfficialPluginInstallQueueDeps,
	PluginInstallProgress,
	PluginInstallRunner,
	PluginInstallStage,
	PluginInstallTask
} from './install-queue-types';
import {
	createQueuedTask,
	markTaskCanceled,
	markTaskCompleted,
	markTaskDownloading,
	markTaskFailed,
	pickNextQueuedTask,
	requeueTask,
	resolveTaskErrorOutcome,
	updateTaskProgress
} from './install-queue-task-state';

export type {
	InstallQueueChangeKind,
	OfficialPluginInstallQueueDeps,
	PluginInstallProgress,
	PluginInstallRunner,
	PluginInstallStage,
	PluginInstallTask
};

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
			if (isInFlightInstallStatus(existing.status)) {
				return;
			}
			this.tasks.set(manifest.id, requeueTask(existing, manifest, manifestUrl));
			this.notifyState();
			void this.processNext();
			return;
		}

		this.tasks.set(manifest.id, createQueuedTask(manifest, manifestUrl));
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
			const canceled = markTaskCanceled(task);
			this.tasks.set(pluginId, canceled);
			this.notifyState();
			this.deps.onTaskCanceled?.(canceled);
			this.clearFinished(pluginId);
			return;
		}

		if (isInFlightInstallStatus(task.status)) {
			if (this.activeTaskId === pluginId && this.activeController) {
				this.activeController.abort();
			}
			this.tasks.set(pluginId, markTaskCanceled(task));
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

		this.tasks.set(pluginId, requeueTask(task, task.manifest, task.manifestUrl));
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
				const canceled = markTaskCanceled(task);
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
				this.tasks.set(this.activeTaskId, markTaskCanceled(activeTask));
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
		return isInFlightInstallStatus(task.status);
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

		// FIFO with concurrency=1: only one active runner at a time.
		const nextTask = pickNextQueuedTask(this.tasks.values());
		if (!nextTask) {
			return;
		}

		this.isProcessing = true;
		this.activeTaskId = nextTask.pluginId;
		this.activeController = new AbortController();
		const controller = this.activeController;
		const activeId = nextTask.pluginId;

		this.tasks.set(activeId, markTaskDownloading(nextTask));
		this.notifyState();

		try {
			// Runner errors are classified below; queue does not rethrow.
			await this.deps.runner(nextTask.manifest, nextTask.manifestUrl, {
				signal: controller.signal,
				onProgress: (prog) => {
					const current = this.tasks.get(activeId);
					if (!current || current.status === 'canceled' || controller.signal.aborted) return;
					this.tasks.set(activeId, updateTaskProgress(current, prog));
					this.notifyProgress();
				}
			});

			const current = this.tasks.get(activeId);
			if (current && current.status !== 'canceled' && !controller.signal.aborted) {
				const completed = markTaskCompleted(current);
				this.tasks.set(activeId, completed);
				this.notifyState();
				this.deps.onTaskCompleted?.(completed);
				this.clearFinished(activeId);
			}
		} catch (err: unknown) {
			const current = this.tasks.get(activeId) ?? nextTask;
			const outcome = resolveTaskErrorOutcome(err, {
				signalAborted: controller.signal.aborted,
				currentStatus: current.status
			});

			if (outcome === 'canceled') {
				const canceled = markTaskCanceled(current);
				this.tasks.set(activeId, canceled);
				this.notifyState();
				this.deps.onTaskCanceled?.(canceled);
				this.clearFinished(activeId);
			} else {
				const failed = markTaskFailed(current, err instanceof Error ? err.message : String(err));
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
