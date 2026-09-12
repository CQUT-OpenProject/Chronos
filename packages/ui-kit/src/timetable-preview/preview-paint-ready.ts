import type { Readable } from 'svelte/store';

export const PREVIEW_PAINT_READY_CONTEXT = 'chronos.previewPaintReady';

export type PreviewPaintReadySource = Readable<boolean>;
