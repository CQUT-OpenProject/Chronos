import type { Disposable } from '../types/env';
import type { Course } from '../domain/course';
import type { CourseBadge, CourseBadgeContribution } from '../types/contributions';

export class BadgeManager implements Disposable {
	private contributions = new Map<string, CourseBadgeContribution>();
	private cache: Record<string, CourseBadge[]> = {};

	constructor(private onBadgesUpdated?: (badges: Record<string, CourseBadge[]>) => void) {}

	registerCourseBadge(badge: CourseBadgeContribution): Disposable {
		this.contributions.set(badge.id, badge);
		return {
			dispose: () => {
				if (this.contributions.get(badge.id) === badge) {
					this.contributions.delete(badge.id);
				}
			}
		};
	}

	getBadges(): ReadonlyArray<CourseBadgeContribution> {
		return Array.from(this.contributions.values());
	}

	async recalculate(courses: Course[]): Promise<Record<string, CourseBadge[]>> {
		const nextBadges: Record<string, CourseBadge[]> = {};

		for (const course of courses) {
			nextBadges[course.id] = [];
		}

		for (const contribution of this.contributions.values()) {
			// 1. Synchronous computation
			if (contribution.getBadge) {
				for (const course of courses) {
					try {
						const result = contribution.getBadge(course);
						if (result) {
							const list = Array.isArray(result) ? result : [result];
							nextBadges[course.id]?.push(...list);
						}
					} catch (error) {
						console.error(
							`[BadgeManager] Error in sync badge provider "${contribution.id}":`,
							error
						);
					}
				}
			}

			// 2. Asynchronous projection
			if (contribution.projectBadges) {
				try {
					const projected = await contribution.projectBadges(courses);
					if (projected) {
						for (const [courseId, badges] of Object.entries(projected)) {
							if (nextBadges[courseId]) {
								nextBadges[courseId].push(...badges);
							}
						}
					}
				} catch (error) {
					console.error(
						`[BadgeManager] Error in async badge projection "${contribution.id}":`,
						error
					);
				}
			}
		}

		this.cache = nextBadges;
		this.onBadgesUpdated?.(this.cache);
		return this.cache;
	}

	getAll(): Record<string, CourseBadge[]> {
		return { ...this.cache };
	}

	getForCourse(courseId: string): CourseBadge[] {
		return this.cache[courseId] ? [...this.cache[courseId]] : [];
	}

	dispose(): void {
		this.contributions.clear();
		this.cache = {};
	}
}
