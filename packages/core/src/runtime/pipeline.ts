import type { Disposable } from '../types/env';
import type { ExportTransformContext, ExportTransformHook } from '../types/context';

export class Pipeline implements Disposable {
	private exportHooks = new Set<ExportTransformHook>();

	registerExportTransform(hook: ExportTransformHook): Disposable {
		this.exportHooks.add(hook);
		return {
			dispose: () => {
				this.exportHooks.delete(hook);
			}
		};
	}

	async executeExportTransforms(ctx: ExportTransformContext): Promise<ExportTransformContext> {
		for (const hook of this.exportHooks) {
			await hook(ctx);
		}
		return ctx;
	}

	dispose(): void {
		this.exportHooks.clear();
	}
}
