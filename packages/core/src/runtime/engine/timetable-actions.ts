import { createTimetable, type AcademicConfig, type Timetable } from '../../domain/timetable';
import type { EngineActionHost } from './engine-action-host';

/** Timetable CRUD with guard/waterfall pipeline. */
export class TimetableActions {
	constructor(private readonly host: EngineActionHost) {}

	async createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable> {
		const allowed = await this.host.events.serial('guard:createTimetable', { name, config });
		if (!allowed) {
			throw new Error('[ChronosEngine] createTimetable action was rejected by guard');
		}

		return this.host.events.waterfall(
			'action:createTimetable',
			{ name, config },
			async ({ name: finalName, config: finalConfig }) => {
				const id = `tt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
				const timetable = createTimetable({
					id,
					name: finalName,
					academicConfig: {
						termStartDate: finalConfig?.termStartDate ?? '',
						startWeek: finalConfig?.startWeek ?? 1,
						endWeek: finalConfig?.endWeek ?? 20,
						periodTimes: finalConfig?.periodTimes ?? []
					}
				});

				await this.host.storage.saveTimetable(timetable);
				await this.host.refreshTimetables();

				if (!this.host.getCurrentTimetable()) {
					await this.host.switchTimetable(timetable.id);
				}

				return timetable;
			}
		);
	}

	async importTimetable(
		timetable: Timetable,
		options: { overwriteActive?: boolean } = {}
	): Promise<Timetable> {
		const allowed = await this.host.events.serial('guard:importTimetable', { timetable, options });
		if (!allowed) {
			throw new Error('[ChronosEngine] importTimetable action was rejected by guard');
		}

		return this.host.events.waterfall(
			'action:importTimetable',
			{ timetable, options },
			async ({ timetable: incoming, options: finalOptions }) => {
				let toSave = incoming;
				if (finalOptions.overwriteActive) {
					const activeId = await this.host.storage.getActiveTimetableId();
					if (activeId) {
						toSave = { ...incoming, id: activeId };
					}
				}

				await this.host.storage.saveTimetable(toSave);
				await this.host.refreshTimetables();
				await this.host.switchTimetable(toSave.id);
				return toSave;
			}
		);
	}

	async switchTimetable(timetableId: string): Promise<void> {
		const allowed = await this.host.events.serial('guard:switchTimetable', { timetableId });
		if (!allowed) {
			throw new Error('[ChronosEngine] switchTimetable action was rejected by guard');
		}

		return this.host.events.waterfall(
			'action:switchTimetable',
			{ timetableId },
			async ({ timetableId: targetId }) => {
				const previousId = this.host.getCurrentTimetable()?.id ?? null;
				const timetable = await this.host.storage.getTimetable(targetId);
				if (!timetable) {
					throw new Error(`Timetable not found: ${targetId}`);
				}

				await this.host.storage.setActiveTimetableId(targetId);
				this.host.setCurrentTimetable(timetable);
				this.host.updateTime();
				this.host.rescheduleDayClock();
				await this.host.badges.recalculate(timetable.courses);

				this.host.emit('timetable:switched', {
					previousId,
					currentId: targetId,
					timetable
				});
			}
		);
	}

	async deleteTimetable(timetableId: string): Promise<void> {
		const allowed = await this.host.events.serial('guard:deleteTimetable', { timetableId });
		if (!allowed) {
			throw new Error('[ChronosEngine] deleteTimetable action was rejected by guard');
		}

		return this.host.events.waterfall(
			'action:deleteTimetable',
			{ timetableId },
			async ({ timetableId: targetId }) => {
				await this.host.storage.deleteTimetable(targetId);
				await this.host.refreshTimetables();

				if (this.host.getCurrentTimetable()?.id === targetId) {
					const remaining = await this.host.storage.listTimetables();
					if (remaining.length > 0 && remaining[0]) {
						await this.host.switchTimetable(remaining[0].id);
					} else {
						this.host.setCurrentTimetable(null);
						await this.host.storage.setActiveTimetableId('');
						this.host.emit('timetable:updated', { timetable: null as unknown as Timetable });
					}
				}
			}
		);
	}

	async saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void> {
		const current = this.host.getCurrentTimetable();
		if (!current) {
			throw new Error('No active timetable to update');
		}

		const updated: Timetable = {
			...current,
			...patch,
			...(patch.academicConfig
				? {
						academicConfig: {
							...current.academicConfig,
							...patch.academicConfig
						}
					}
				: {}),
			updatedAt: Date.now()
		};

		await this.host.storage.saveTimetable(updated);
		this.host.setCurrentTimetable(updated);
		await this.host.refreshTimetables();
		this.host.updateTime();
		this.host.rescheduleDayClock();
		await this.host.badges.recalculate(updated.courses);
		this.host.emit('timetable:updated', { timetable: updated });
	}
}
