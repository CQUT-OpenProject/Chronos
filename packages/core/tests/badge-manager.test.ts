import { describe, it, expect, vi } from 'vite-plus/test';
import { BadgeManager } from '../src/runtime/badge-manager';
import { createCourse } from '../src/domain/course';
import type { CourseBadgeSlotContribution } from '../src/types/slots';

describe('BadgeManager in @chronos/core', () => {
	it('calculates badges from registered slot contributions', async () => {
		const onUpdated = vi.fn();
		const manager = new BadgeManager(onUpdated);

		const labBadgeProvider: CourseBadgeSlotContribution = {
			id: 'lab-badge',
			getBadge(course) {
				if (course.name.includes('实验')) {
					return { id: 'lab', text: '实验课', colorScheme: 'warning' };
				}
				return null;
			}
		};

		const profBadgeProvider: CourseBadgeSlotContribution = {
			id: 'prof-badge',
			getBadge(course) {
				if (course.teacher.includes('教授')) {
					return { id: 'prof', text: '教授授课', colorScheme: 'primary' };
				}
				return null;
			}
		};

		manager.registerCourseBadge(labBadgeProvider);
		manager.registerCourseBadge(profBadgeProvider);

		const courses = [
			createCourse({
				id: 'c1',
				name: '物理实验',
				teacher: '张教授',
				location: '实验楼A101',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2
			}),
			createCourse({
				id: 'c2',
				name: '高等数学',
				teacher: '李老师',
				location: '弘远楼B204',
				dayOfWeek: 2,
				startPeriod: 1,
				endPeriod: 2
			})
		];

		const badges = await manager.recalculate(courses);

		expect(onUpdated).toHaveBeenCalledWith(badges);
		expect(badges['c1']).toEqual([
			{ id: 'lab', text: '实验课', colorScheme: 'warning' },
			{ id: 'prof', text: '教授授课', colorScheme: 'primary' }
		]);
		expect(badges['c2']).toEqual([]);
		expect(manager.getAll()['c1']).toEqual([
			{ id: 'lab', text: '实验课', colorScheme: 'warning' },
			{ id: 'prof', text: '教授授课', colorScheme: 'primary' }
		]);
	});

	it('unregisters badge provider', async () => {
		const manager = new BadgeManager();
		const provider: CourseBadgeSlotContribution = {
			id: 'temp',
			getBadge: () => ({ id: 't', text: '临时' })
		};

		const sub = manager.registerCourseBadge(provider);
		await manager.recalculate([]);

		sub.dispose();
		expect(Object.keys(manager.getAll())).toHaveLength(0);
	});

	it('skips aggregation when no contributors are registered', async () => {
		const onUpdated = vi.fn();
		const manager = new BadgeManager(onUpdated);
		const badges = await manager.recalculate([
			createCourse({
				id: 'c1',
				name: 'Math',
				teacher: '',
				location: '',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2,
				weeks: [1]
			})
		]);
		expect(badges).toEqual({});
		expect(onUpdated).not.toHaveBeenCalled();
	});
});
