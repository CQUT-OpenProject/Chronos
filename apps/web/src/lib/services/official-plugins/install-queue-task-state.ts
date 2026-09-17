import { isAbortError } from './abort-utils';
import type { PluginInstallStage, PluginInstallTask } from './install-queue-types';

/** Queued or actively running install stages (concurrency=1 invariant). */
export function isInFlightInstallStatus(status: PluginInstallStage): boolean {
	return (
		status === 'queued' ||
		status === 'downloading' ||
		status === 'verifying' ||
		status === 'installing'
	);
}

/** FIFO: pick the oldest queued task. */
export function pickNextQueuedTask(tasks: Iterable<PluginInstallTask>): PluginInstallTask | null {
	let nextTask: PluginInstallTask | null = null;
	for (const task of tasks) {
		if (task.status === 'queued') {
			if (!nextTask || task.enqueuedAt < nextTask.enqueuedAt) {
				nextTask = task;
			}
		}
	}
	return nextTask;
}

export function createQueuedTask(
	manifest: PluginInstallTask['manifest'],
	manifestUrl?: string
): PluginInstallTask {
	return {
		pluginId: manifest.id,
		manifest,
		manifestUrl,
		status: 'queued',
		progress: { stage: 'queued', percent: 0 },
		enqueuedAt: Date.now()
	};
}

export function requeueTask(
	task: PluginInstallTask,
	manifest: PluginInstallTask['manifest'],
	manifestUrl?: string
): PluginInstallTask {
	return {
		...task,
		manifest,
		manifestUrl: manifestUrl ?? task.manifestUrl,
		status: 'queued',
		progress: { stage: 'queued', percent: 0 },
		error: undefined,
		enqueuedAt: Date.now(),
		startedAt: undefined,
		completedAt: undefined
	};
}

export function markTaskCanceled(task: PluginInstallTask): PluginInstallTask {
	return {
		...task,
		status: 'canceled',
		progress: { stage: 'canceled', percent: 0 }
	};
}

export function markTaskDownloading(task: PluginInstallTask): PluginInstallTask {
	return {
		...task,
		status: 'downloading',
		startedAt: Date.now(),
		progress: { stage: 'downloading', percent: 0 }
	};
}

export function markTaskCompleted(task: PluginInstallTask): PluginInstallTask {
	return {
		...task,
		status: 'completed',
		completedAt: Date.now(),
		progress: { stage: 'completed', percent: 100 }
	};
}

export function markTaskFailed(task: PluginInstallTask, message: string): PluginInstallTask {
	return {
		...task,
		status: 'failed',
		error: message,
		progress: { stage: 'failed', percent: 0, message }
	};
}

export function updateTaskProgress(
	task: PluginInstallTask,
	prog: { stage: PluginInstallStage; percent: number; message?: string }
): PluginInstallTask {
	return {
		...task,
		status: prog.stage,
		progress: {
			stage: prog.stage,
			percent: Math.min(100, Math.max(0, prog.percent)),
			message: prog.message
		}
	};
}

export type TaskErrorOutcome = 'canceled' | 'failed';

export function resolveTaskErrorOutcome(
	err: unknown,
	options: { signalAborted: boolean; currentStatus: PluginInstallStage }
): TaskErrorOutcome {
	if (options.signalAborted || options.currentStatus === 'canceled' || isAbortError(err)) {
		return 'canceled';
	}
	return 'failed';
}
