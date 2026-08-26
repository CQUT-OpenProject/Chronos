import type { Disposable } from '../types/env';
import type { Course } from '../domain/course';
import type { ChronosContext } from '../types/context';
import type { CourseBadge, CourseBadgeSlotContribution } from '../types/slots';

export class BadgeManager implements Disposable {
	private contributions = new Map<
		string,
		{ badge: CourseBadgeSlotContribution; ctx?: ChronosContext }
	>();
	private cache: Record<string, CourseBadge[]> = {};

	constructor(private onBadgesUpdated?: (badges: Record<string, CourseBadge[]>) => void) {}

	registerCourseBadge(badge: CourseBadgeSlotContribution, ctx?: ChronosContext): Disposable {
		this.contributions.set(badge.id, { badge, ctx });
		return {
			dispose: () => {
				const current = this.contributions.get(badge.id);
				if (current?.badge === badge) {
					this.contributions.delete(badge.id);
				}
			}
		};
	}

	async recalculate(courses: Course[]): Promise<Record<string, CourseBadge[]>> {
		if (this.contributions.size === 0) {
			this.cache = {};
			return this.cache;
		}

		const nextBadges: Record<string, CourseBadge[]> = {};

		for (const course of courses) {
			nextBadges[course.id] = [];
		}

		for (const { badge, ctx } of this.contributions.values()) {
			if (badge.getBadge) {
				for (const course of courses) {
					try {
						const result = badge.getBadge(course, ctx as ChronosContext);
						if (result) {
							const list = Array.isArray(result) ? result : [result];
							nextBadges[course.id]?.push(...list);
						}
					} catch (error) {
						console.error(`[BadgeManager] Error in badge provider "${badge.id}":`, error);
					}
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

	dispose(): void {
		this.contributions.clear();
		this.cache = {};
	}
}
