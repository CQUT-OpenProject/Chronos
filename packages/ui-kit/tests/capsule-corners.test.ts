import { describe, expect, it } from 'vite-plus/test';
import { CAPSULE_CORNER_RADIUS, capsuleCornerAttrs } from '../src/timetable/capsule-corners';

describe('capsuleCornerAttrs', () => {
	it('applies squircle radius on all corners when fully rounded', () => {
		const { style } = capsuleCornerAttrs({
			topLeft: true,
			topRight: true,
			bottomLeft: true,
			bottomRight: true
		});
		expect(style).toContain(
			`border-radius:${CAPSULE_CORNER_RADIUS} ${CAPSULE_CORNER_RADIUS} ${CAPSULE_CORNER_RADIUS} ${CAPSULE_CORNER_RADIUS}`
		);
		expect(style).toContain('--corner-shape:squircle squircle squircle squircle');
		expect(style).toContain('corner-shape:squircle squircle squircle squircle');
	});

	it('squares all corners in sharp style', () => {
		const { style } = capsuleCornerAttrs({
			topLeft: false,
			topRight: false,
			bottomLeft: false,
			bottomRight: false
		});
		expect(style).toContain('border-radius:0 0 0 0');
		expect(style).toContain('--corner-shape:square square square square');
	});

	it('matches pill-style vertical adjacency (top exposed, bottom flush)', () => {
		const { style } = capsuleCornerAttrs({
			topLeft: true,
			topRight: true,
			bottomLeft: false,
			bottomRight: false
		});
		expect(style).toContain(`border-radius:${CAPSULE_CORNER_RADIUS} ${CAPSULE_CORNER_RADIUS} 0 0`);
		expect(style).toContain('--corner-shape:squircle squircle square square');
	});

	it('keeps a single exposed corner rounded', () => {
		const { style } = capsuleCornerAttrs({
			topLeft: false,
			topRight: true,
			bottomLeft: false,
			bottomRight: false
		});
		expect(style).toContain(`border-radius:0 ${CAPSULE_CORNER_RADIUS} 0 0`);
		expect(style).toContain('--corner-shape:square squircle square square');
	});
});
