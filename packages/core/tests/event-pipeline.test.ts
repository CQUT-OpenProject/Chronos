import { describe, it, expect } from 'vite-plus/test';
import { EventPipeline } from '../src/runtime/event-pipeline';

describe('EventPipeline', () => {
	it('broadcasts events with emit', () => {
		const pipeline = new EventPipeline();
		const received: string[] = [];

		pipeline.on('theme:changed', ({ themeId }) => {
			received.push(themeId);
		});

		pipeline.emit('theme:changed', { themeId: 'theme-1' });
		pipeline.emit('theme:changed', { themeId: 'theme-2' });
		expect(received).toEqual(['theme-1', 'theme-2']);

		pipeline.dispose();
	});

	it('stops notifying after subscription is disposed', () => {
		const pipeline = new EventPipeline();
		const received: string[] = [];

		const sub = pipeline.on('theme:changed', ({ themeId }) => {
			received.push(themeId);
		});

		pipeline.emit('theme:changed', { themeId: 'theme-1' });
		sub.dispose();
		pipeline.emit('theme:changed', { themeId: 'theme-2' });

		expect(received).toEqual(['theme-1']);
		pipeline.dispose();
	});
});
