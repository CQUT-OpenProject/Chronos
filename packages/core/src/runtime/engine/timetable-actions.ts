import { createTimetable, type AcademicConfig, type Timetable } from '../../domain/timetable';
import type { EngineActionHost } from './engine-action-host';

/** Timetable CRUD for ChronosEngine. */
export class TimetableActions {
	constructor(private readonly host: EngineActionHost) {}

	async createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable> {
		const id = `tt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const timetable = createTimetable({
			id,
			name,
			academicConfig: {
				termStartDate: config?.termStartDate ?? '',
				startWeek: config?.startWeek ?? 1,
				endWeek: config?.endWeek ?? 20,
				periodTimes: config?.periodTimes ?? []
			}
		});

		await this.host.storage.saveTimetable(timetable);
		await this.host.refreshTimetables();

		if (!this.host.getCurrentTimetable()) {
			await this.host.switchTimetable(timetable.id);
		}

		return timetable;
	}

	async importTimetable(
		timetable: Timetable,
		options: { overwriteActive?: boolean } = {}
	): Promise<Timetable> {
		let toSave = timetable;
		if (options.overwriteActive) {
			const activeId = await this.host.storage.getActiveTimetableId();
			if (activeId) {
				toSave = { ...timetable, id: activeId };
			}
		}

		await this.host.storage.saveTimetable(toSave);
		await this.host.refreshTimetables();
		await this.host.switchTimetable(toSave.id);
		return toSave;
	}

	async switchTimetable(timetableId: string): Promise<void> {
		const previousId = this.host.getCurrentTimetable()?.id ?? null;
		const timetable = await this.host.storage.getTimetable(timetableId);
		if (!timetable) {
			throw new Error(`Timetable not found: ${timetableId}`);
		}

		await this.host.storage.setActiveTimetableId(timetableId);
		this.host.setCurrentTimetable(timetable);
		this.host.updateTime();
		this.host.rescheduleDayClock();
		await this.host.badges.recalculate(timetable.courses);

		this.host.emit('timetable:switched', {
			previousId,
			currentId: timetableId,
			timetable
		});
	}

	async deleteTimetable(timetableId: string): Promise<void> {
		await this.host.storage.deleteTimetable(timetableId);
		await this.host.refreshTimetables();

		if (this.host.getCurrentTimetable()?.id === timetableId) {
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
