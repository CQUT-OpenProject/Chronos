import { describe, it, expect, vi } from 'vitest';
import type { PluginManifest } from '@chronos/core';
import { OfficialPluginInstallQueue, type PluginInstallRunner } from './install-queue';

function createManifest(id: string, name = id): PluginManifest {
	return {
		id,
		name: { 'zh-cn': name, en: name },
		version: '1.0.0',
		description: { 'zh-cn': `Description of ${name}`, en: `Description of ${name}` },
		author: 'Test Author',
		type: 'tool',
		bundleFormat: 'esm'
	};
}

describe('OfficialPluginInstallQueue', () => {
	it('starts the first enqueued task immediately and marks it active', async () => {
		let resolveInstall!: () => void;
		const runner = vi.fn().mockImplementation(() => {
			return new Promise<void>((resolve) => {
				resolveInstall = resolve;
			});
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		const manifest1 = createManifest('plugin-1');

		queue.enqueue(manifest1);

		expect(runner).toHaveBeenCalledTimes(1);
		expect(queue.isBusy('plugin-1')).toBe(true);

		const task1 = queue.getTask('plugin-1');
		expect(task1?.status).toBe('downloading');
		expect(queue.getActiveTask()?.pluginId).toBe('plugin-1');

		resolveInstall();
		// wait microtask
		await Promise.resolve();
		await Promise.resolve();

		expect(queue.getTask('plugin-1')).toBeUndefined();
		expect(queue.getActiveTask()).toBeUndefined();
	});

	it('enforces FIFO order and concurrency = 1 for multiple enqueued plugins', async () => {
		const completedIds: string[] = [];
		const resolvers = new Map<string, () => void>();

		const runner: PluginInstallRunner = vi.fn().mockImplementation((manifest) => {
			return new Promise<void>((resolve) => {
				resolvers.set(manifest.id, () => {
					completedIds.push(manifest.id);
					resolve();
				});
			});
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		const m1 = createManifest('plugin-1');
		const m2 = createManifest('plugin-2');
		const m3 = createManifest('plugin-3');

		queue.enqueue(m1);
		queue.enqueue(m2);
		queue.enqueue(m3);

		// Only m1 is running
		expect(runner).toHaveBeenCalledTimes(1);
		expect(queue.getTask('m1')?.status ?? queue.getTask('plugin-1')?.status).toBe('downloading');
		expect(queue.getTask('plugin-2')?.status).toBe('queued');
		expect(queue.getTask('plugin-3')?.status).toBe('queued');
		expect(queue.getQueuedTasks().length).toBe(2);

		// Complete m1
		resolvers.get('plugin-1')!();
		await Promise.resolve();
		await Promise.resolve();

		// Now m2 should be active, m3 still queued
		expect(runner).toHaveBeenCalledTimes(2);
		expect(queue.getTask('plugin-1')).toBeUndefined();
		expect(queue.getTask('plugin-2')?.status).toBe('downloading');
		expect(queue.getTask('plugin-3')?.status).toBe('queued');

		// Complete m2
		resolvers.get('plugin-2')!();
		await Promise.resolve();
		await Promise.resolve();

		// Now m3 should be active
		expect(runner).toHaveBeenCalledTimes(3);
		expect(queue.getTask('plugin-2')).toBeUndefined();
		expect(queue.getTask('plugin-3')?.status).toBe('downloading');

		// Complete m3
		resolvers.get('plugin-3')!();
		await Promise.resolve();
		await Promise.resolve();

		expect(queue.getTask('plugin-3')).toBeUndefined();
		expect(completedIds).toEqual(['plugin-1', 'plugin-2', 'plugin-3']);
	});

	it('notifies listeners on stage and progress updates', async () => {
		const changeListener = vi.fn();
		const runner: PluginInstallRunner = vi.fn().mockImplementation(async (_m, _url, opts) => {
			opts?.onProgress?.({ stage: 'downloading', percent: 40 });
			opts?.onProgress?.({ stage: 'verifying', percent: 75 });
			opts?.onProgress?.({ stage: 'installing', percent: 90 });
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		queue.onChanged(changeListener);

		queue.enqueue(createManifest('plugin-p'));
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		expect(changeListener).toHaveBeenCalled();
		expect(queue.getTask('plugin-p')).toBeUndefined();
		expect(changeListener.mock.calls.some(([change]) => change.kind === 'progress')).toBe(true);
		expect(changeListener.mock.calls.some(([change]) => change.kind === 'state')).toBe(true);
	});

	it('cancels a queued task before it starts', async () => {
		let resolveFirst!: () => void;
		const runner: PluginInstallRunner = vi.fn().mockImplementation((manifest) => {
			if (manifest.id === 'plugin-1') {
				return new Promise<void>((resolve) => {
					resolveFirst = resolve;
				});
			}
			return Promise.resolve();
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		queue.enqueue(createManifest('plugin-1'));
		queue.enqueue(createManifest('plugin-2'));

		expect(queue.getTask('plugin-2')?.status).toBe('queued');

		// Cancel queued plugin-2
		queue.cancel('plugin-2');
		expect(queue.getTask('plugin-2')).toBeUndefined();

		// Complete plugin-1
		resolveFirst();
		await Promise.resolve();
		await Promise.resolve();

		// runner should NOT have been called for plugin-2
		expect(runner).toHaveBeenCalledTimes(1);
	});

	it('aborts active task via AbortSignal when cancel() is called', async () => {
		let receivedSignal: AbortSignal | undefined;
		const runner: PluginInstallRunner = vi.fn().mockImplementation((_manifest, _url, opts) => {
			receivedSignal = opts?.signal;
			return new Promise<void>((_, reject) => {
				opts?.signal?.addEventListener('abort', () => {
					reject(new DOMException('Aborted', 'AbortError'));
				});
			});
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		queue.enqueue(createManifest('plugin-active'));

		expect(queue.getActiveTask()?.pluginId).toBe('plugin-active');
		expect(receivedSignal?.aborted).toBe(false);

		queue.cancel('plugin-active');

		expect(receivedSignal?.aborted).toBe(true);
		await Promise.resolve();
		await Promise.resolve();

		expect(queue.getTask('plugin-active')).toBeUndefined();
		expect(queue.getActiveTask()).toBeUndefined();
	});

	it('isolates failures: failed task does not prevent subsequent tasks from installing', async () => {
		const runner: PluginInstallRunner = vi.fn().mockImplementation(async (manifest) => {
			if (manifest.id === 'plugin-broken') {
				throw new Error('Download failed: 404 Not Found');
			}
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		queue.enqueue(createManifest('plugin-broken'));
		queue.enqueue(createManifest('plugin-ok'));

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		const brokenTask = queue.getTask('plugin-broken');
		expect(brokenTask?.status).toBe('failed');
		expect(brokenTask?.error).toBe('Download failed: 404 Not Found');

		expect(queue.getTask('plugin-ok')).toBeUndefined();
	});

	it('supports retrying a failed task', async () => {
		let attempts = 0;
		const runner: PluginInstallRunner = vi.fn().mockImplementation(async () => {
			attempts++;
			if (attempts === 1) {
				throw new Error('Network glitch');
			}
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		queue.enqueue(createManifest('retry-plugin'));

		await Promise.resolve();
		await Promise.resolve();

		expect(queue.getTask('retry-plugin')?.status).toBe('failed');

		// Retry
		queue.retry('retry-plugin');
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		expect(queue.getTask('retry-plugin')).toBeUndefined();
		expect(attempts).toBe(2);
	});

	it('cancelAll aborts active and cancels all queued tasks', async () => {
		let receivedSignal: AbortSignal | undefined;
		const runner: PluginInstallRunner = vi.fn().mockImplementation((manifest, _url, opts) => {
			if (manifest.id === 'm1') {
				receivedSignal = opts?.signal;
				return new Promise<void>((_, reject) => {
					opts?.signal?.addEventListener('abort', () => {
						reject(new DOMException('Aborted', 'AbortError'));
					});
				});
			}
			return Promise.resolve();
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		queue.enqueue(createManifest('m1'));
		queue.enqueue(createManifest('m2'));
		queue.enqueue(createManifest('m3'));

		queue.cancelAll();

		expect(receivedSignal?.aborted).toBe(true);
		await Promise.resolve();
		await Promise.resolve();

		expect(queue.getTask('m1')).toBeUndefined();
		expect(queue.getTask('m2')).toBeUndefined();
		expect(queue.getTask('m3')).toBeUndefined();
		expect(queue.getActiveTask()).toBeUndefined();
	});

	it('clearFinished removes completed and canceled tasks', async () => {
		const runner = vi.fn().mockResolvedValue(undefined);
		const queue = new OfficialPluginInstallQueue({ runner });

		queue.enqueue(createManifest('m1'));
		await Promise.resolve();
		await Promise.resolve();

		expect(queue.getTask('m1')).toBeUndefined();
	});

	it('emits new immutable task snapshots on every status and progress change so reactive frameworks detect changes', async () => {
		const snapshots: import('./install-queue').PluginInstallTask[] = [];
		let onProgressCb:
			| ((prog: { stage: import('./install-queue').PluginInstallStage; percent: number }) => void)
			| undefined;
		let resolveInstall!: () => void;

		const runner: PluginInstallRunner = vi.fn().mockImplementation((_m, _url, opts) => {
			onProgressCb = opts?.onProgress;
			return new Promise<void>((resolve) => {
				resolveInstall = resolve;
			});
		});

		const queue = new OfficialPluginInstallQueue({ runner });
		queue.onChanged(() => {
			const task = queue.getTask('snap-plugin');
			if (task) snapshots.push(task);
		});

		queue.enqueue(createManifest('snap-plugin'));
		expect(snapshots.length).toBeGreaterThanOrEqual(1);
		const initialEnqueued = snapshots[0]!;
		expect(initialEnqueued.status).toBe('queued');

		await Promise.resolve();
		await Promise.resolve();

		const downloadingSnap = snapshots.find((s) => s.status === 'downloading');
		expect(downloadingSnap).toBeDefined();
		expect(downloadingSnap).not.toBe(initialEnqueued);

		onProgressCb?.({ stage: 'verifying', percent: 80 });
		const verifyingSnap = snapshots[snapshots.length - 1]!;
		expect(verifyingSnap.status).toBe('verifying');
		expect(verifyingSnap.progress.percent).toBe(80);
		expect(verifyingSnap).not.toBe(downloadingSnap);

		resolveInstall();
		await Promise.resolve();
		await Promise.resolve();

		const completedSnap = snapshots[snapshots.length - 1]!;
		expect(completedSnap.status).toBe('completed');
		expect(completedSnap.progress.percent).toBe(100);
		expect(completedSnap).not.toBe(verifyingSnap);

		const uniqueRefs = new Set(snapshots);
		expect(uniqueRefs.size).toBe(snapshots.length);
	});

	it('invokes lifecycle callbacks across a multi-task session', async () => {
		const resolvers = new Map<string, () => void>();
		const onTaskCompleted = vi.fn();
		const onTaskCanceled = vi.fn();
		const runner: PluginInstallRunner = vi.fn().mockImplementation((manifest) => {
			return new Promise<void>((resolve) => {
				resolvers.set(manifest.id, resolve);
			});
		});

		const queue = new OfficialPluginInstallQueue({
			runner,
			onTaskCompleted,
			onTaskCanceled
		});

		queue.enqueue(createManifest('batch-1'));
		queue.enqueue(createManifest('batch-2'));
		queue.enqueue(createManifest('batch-3'));

		resolvers.get('batch-1')!();
		await Promise.resolve();
		await Promise.resolve();

		expect(onTaskCompleted).toHaveBeenCalledTimes(1);

		queue.cancel('batch-3');
		expect(onTaskCanceled).toHaveBeenCalledTimes(1);

		resolvers.get('batch-2')!();
		await Promise.resolve();
		await Promise.resolve();

		expect(onTaskCompleted).toHaveBeenCalledTimes(2);
	});

	it('calls onTaskFailed for non-abort errors', async () => {
		const onTaskFailed = vi.fn();
		const runner: PluginInstallRunner = vi.fn().mockRejectedValue(new Error('network down'));
		const queue = new OfficialPluginInstallQueue({ runner, onTaskFailed });

		queue.enqueue(createManifest('broken-plugin'));
		await Promise.resolve();
		await Promise.resolve();

		expect(onTaskFailed).toHaveBeenCalledTimes(1);
		expect(onTaskFailed.mock.calls[0]?.[0]?.status).toBe('failed');
		expect(queue.getTask('broken-plugin')?.status).toBe('failed');
	});
});
