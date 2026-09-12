import { describe, expect, it } from 'vite-plus/test';
import type { Component } from 'svelte';
import { CHRONOS_MOUNTABLE } from '@chronos/core';
import { mountableSvelteComponent } from '../src/plugin-screen/mountable-svelte';

describe('mountableSvelteComponent', () => {
	it('creates a ChronosMountable with mount and update-capable handles', () => {
		const Dummy = {} as Component<{ label: string; count?: number }>;
		const mountable = mountableSvelteComponent(Dummy);
		expect(mountable[CHRONOS_MOUNTABLE]).toBe(true);
		expect(typeof mountable.mount).toBe('function');
	});
});
