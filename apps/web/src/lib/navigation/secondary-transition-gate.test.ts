import { describe, expect, it } from 'vite-plus/test';
import { createSecondaryTransitionGate } from './secondary-transition-gate.svelte';

describe('createSecondaryTransitionGate', () => {
	it('enables the shell host and stays live on the shell route', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');

		expect(gate.shellHostEnabled).toBe(true);
		expect(gate.frozen).toBe(false);
		expect(gate.receded).toBe(false);
		expect(gate.previewPaintReady).toBe(true);
	});

	it('does not freeze a secondary route before the shell host is enabled', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/about');

		expect(gate.shellHostEnabled).toBe(false);
		expect(gate.frozen).toBe(false);
		expect(gate.previewPaintReady).toBe(true);
	});

	it('freezes an enabled shell when settling on a secondary route without a view transition', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');
		gate.syncRoute('/plugins/tool-wallpaper');

		expect(gate.frozen).toBe(true);
		expect(gate.receded).toBe(true);
		expect(gate.skipPaint).toBe(true);
		expect(gate.previewPaintReady).toBe(true);
	});

	it('keeps the shell live during a forward view transition then freezes after it finishes', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');
		gate.beginTransition('forward', true);

		expect(gate.transitioning).toBe(true);
		expect(gate.frozen).toBe(false);
		expect(gate.receded).toBe(false);
		expect(gate.previewPaintReady).toBe(false);

		gate.finishTransition(true);

		expect(gate.transitioning).toBe(false);
		expect(gate.frozen).toBe(true);
		expect(gate.receded).toBe(true);
		expect(gate.previewPaintReady).toBe(true);
	});

	it('stays frozen during a back view transition then unfreezes after it finishes', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');
		gate.syncRoute('/about');
		gate.beginTransition('back', false);

		expect(gate.frozen).toBe(true);
		expect(gate.receded).toBe(true);
		expect(gate.skipPaint).toBe(false);
		expect(gate.previewPaintReady).toBe(false);

		gate.finishTransition(false);

		expect(gate.frozen).toBe(false);
		expect(gate.receded).toBe(false);
		expect(gate.previewPaintReady).toBe(true);
		expect(gate.shellHostEnabled).toBe(true);
	});

	it('stays frozen when navigating between secondary routes', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');
		gate.syncRoute('/about');
		gate.beginTransition('forward', true);

		expect(gate.frozen).toBe(true);
		expect(gate.skipPaint).toBe(true);
		expect(gate.previewPaintReady).toBe(false);

		gate.finishTransition(true);

		expect(gate.frozen).toBe(true);
		expect(gate.previewPaintReady).toBe(true);
	});

	it('ignores syncRoute freeze changes while a view transition is in flight', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');
		gate.beginTransition('forward', true);
		gate.syncRoute('/about');

		expect(gate.frozen).toBe(false);
		expect(gate.previewPaintReady).toBe(false);

		gate.finishTransition(true);

		expect(gate.frozen).toBe(true);
		expect(gate.previewPaintReady).toBe(true);
	});

	it('enables the shell host after an idle deep-link then freezes', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/about');
		gate.enableShellHost();
		gate.syncRoute('/about');

		expect(gate.shellHostEnabled).toBe(true);
		expect(gate.frozen).toBe(true);
	});
});
