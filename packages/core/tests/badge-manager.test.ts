import { describe, it, expect, vi } from 'vite-plus/test';
import { BadgeManager } from '../src/runtime/badge-manager';
import { createCourse } from '../src/domain/course';
import type { CourseBadge, CourseBadgeContribution } from '../src/types/contributions';

describe('BadgeManager in @chronos/core', () => {
	it('calculates sync badges and async projected badges', async () => {
		const onUpdated = vi.fn();
		const manager = new BadgeManager(onUpdated);

		const syncBadgeProvider: CourseBadgeContribution = {
			id: 'sync-badge',
			getBadge(course) {
				if (course.name.includes('实验')) {
					return { id: 'lab', text: '实验课', colorScheme: 'warning' };
				}
				return null;
			}
		};

		const asyncBadgeProvider: CourseBadgeContribution = {
			id: 'async-badge',
			async projectBadges(courses) {
				const result: Record<string, CourseBadge[]> = {};
				for (const c of courses) {
					if (c.teacher.includes('教授')) {
						result[c.id] = [{ id: 'prof', text: '教授授课', colorScheme: 'primary' }];
					}
				}
				return result;
			}
		};

		manager.registerCourseBadge(syncBadgeProvider);
		manager.registerCourseBadge(asyncBadgeProvider);

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
		expect(manager.getForCourse('c1')).toEqual([
			{ id: 'lab', text: '实验课', colorScheme: 'warning' },
			{ id: 'prof', text: '教授授课', colorScheme: 'primary' }
		]);
	});

	it('unregisters badge provider', async () => {
		const manager = new BadgeManager();
		const provider: CourseBadgeContribution = {
			id: 'temp',
			getBadge: () => ({ id: 't', text: '临时' })
		};

		const sub = manager.registerCourseBadge(provider);
		expect(manager.getBadges().length).toBe(1);

		sub.dispose();
		expect(manager.getBadges().length).toBe(0);
	});
});
