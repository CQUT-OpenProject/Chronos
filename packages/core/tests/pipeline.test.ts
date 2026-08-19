import { describe, it, expect } from 'vite-plus/test';
import { Pipeline } from '../src/runtime/pipeline';
import { createTimetable } from '../src/domain/timetable';
import type { ExportTransformContext } from '../src/types/context';

describe('Pipeline in @chronos/core', () => {
	it('executes export transform hooks in sequential waterfall order', async () => {
		const pipeline = new Pipeline();
		const order: number[] = [];

		pipeline.registerExportTransform(async (ctx) => {
			order.push(1);
			ctx.targetData.step1 = true;
		});

		pipeline.registerExportTransform((ctx) => {
			order.push(2);
			ctx.targetData.step2 = true;
		});

		const context: ExportTransformContext = {
			exporterId: 'ics-export',
			timetable: createTimetable({ id: 't1', name: '课表' }),
			targetData: {}
		};

		const result = await pipeline.executeExportTransforms(context);

		expect(order).toEqual([1, 2]);
		expect(result.targetData).toEqual({
			step1: true,
			step2: true
		});
	});

	it('unregisters hooks when disposable is called', async () => {
		const pipeline = new Pipeline();

		const sub = pipeline.registerExportTransform((ctx) => {
			ctx.targetData.hook1 = true;
		});

		pipeline.registerExportTransform((ctx) => {
			ctx.targetData.hook2 = true;
		});

		sub.dispose();

		const context: ExportTransformContext = {
			exporterId: 'json-export',
			timetable: createTimetable({ id: 't1', name: '课表' }),
			targetData: {}
		};

		const result = await pipeline.executeExportTransforms(context);

		expect(result.targetData).toEqual({ hook2: true });
	});
});
