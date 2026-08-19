import type { Disposable } from '../types/services';
import type { StandardSlotMap } from '../types/slots';
import type {
	CourseActionContribution,
	TimetableExporterAdapter,
	TimetableSourceAdapter
} from '../types/contributions';

export class HierarchicalSlotRegistry implements Disposable {
	private slots = new Map<string, Map<string, unknown>>();
	private listeners = new Set<() => void>();

	constructor(private onSlotsChangedCallback?: () => void) {}

	register<K extends keyof StandardSlotMap>(
		slotName: K,
		contribution: StandardSlotMap[K] & { id: string }
	): Disposable {
		const key = String(slotName);
		if (!this.slots.has(key)) {
			this.slots.set(key, new Map());
		}
		const group = this.slots.get(key)!;
		group.set(contribution.id, contribution);
		this.notify();

		return {
			dispose: () => {
				if (group.get(contribution.id) === contribution) {
					group.delete(contribution.id);
					this.notify();
				}
			}
		};
	}

	get<K extends keyof StandardSlotMap>(slotName: K): Array<StandardSlotMap[K]> {
		const group = this.slots.get(String(slotName));
		if (!group) return [];
		const list = Array.from(group.values()) as Array<StandardSlotMap[K] & { order?: number }>;
		return list.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
	}

	getSlotItem<K extends keyof StandardSlotMap>(
		slotName: K,
		id: string
	): StandardSlotMap[K] | undefined {
		return this.slots.get(String(slotName))?.get(id) as StandardSlotMap[K] | undefined;
	}

	onChanged(listener: () => void): Disposable {
		this.listeners.add(listener);
		return {
			dispose: () => {
				this.listeners.delete(listener);
			}
		};
	}

	clear(): void {
		this.slots.clear();
		this.notify();
	}

	// === Backward Compatibility Adapters ===
	registerSource(adapter: TimetableSourceAdapter): Disposable {
		const contribution = {
			...adapter,
			executeImport: (inputs: Record<string, unknown>) =>
				adapter.fetchSchedule({
					username: inputs.username as string | undefined,
					password: inputs.password as string | undefined,
					fileContent: inputs.fileContent as string | undefined
				})
		};
		return this.register(
			'import.source.tab',
			contribution as unknown as StandardSlotMap['import.source.tab'] & { id: string }
		);
	}

	getSource(id: string): TimetableSourceAdapter | undefined {
		const item = this.getSlotItem('import.source.tab', id);
		if (!item) return undefined;
		const raw = item as unknown as Record<string, unknown>;
		if (typeof raw.fetchSchedule === 'function') {
			return item as unknown as TimetableSourceAdapter;
		}
		if (typeof raw.executeImport === 'function') {
			return {
				...item,
				fetchSchedule: (inputs: Record<string, unknown>) =>
					(
						raw.executeImport as (
							inputs: Record<string, unknown>,
							ctx?: unknown
						) => Promise<import('../domain/timetable').Timetable>
					)(inputs)
			} as unknown as TimetableSourceAdapter;
		}
		return item as unknown as TimetableSourceAdapter;
	}

	getSources(): ReadonlyArray<TimetableSourceAdapter> {
		return this.get('import.source.tab') as unknown as ReadonlyArray<TimetableSourceAdapter>;
	}

	registerExporter(adapter: TimetableExporterAdapter): Disposable {
		const contribution = {
			...adapter,
			export: (timetable: import('../domain/timetable').Timetable) => adapter.export(timetable)
		};
		return this.register(
			'export.action',
			contribution as unknown as StandardSlotMap['export.action'] & { id: string }
		);
	}

	getExporter(id: string): TimetableExporterAdapter | undefined {
		const item = this.getSlotItem('export.action', id);
		if (!item) return undefined;
		const raw = item as unknown as Record<string, unknown>;
		if (typeof raw.export === 'function') {
			return item as unknown as TimetableExporterAdapter;
		}
		return item as unknown as TimetableExporterAdapter;
	}

	getExporters(): ReadonlyArray<TimetableExporterAdapter> {
		return this.get('export.action') as unknown as ReadonlyArray<TimetableExporterAdapter>;
	}

	registerCourseAction(action: CourseActionContribution): Disposable {
		return this.register(
			'course.detail.action',
			action as unknown as StandardSlotMap['course.detail.action'] & { id: string }
		);
	}

	getCourseAction(id: string): CourseActionContribution | undefined {
		return this.getSlotItem('course.detail.action', id) as CourseActionContribution | undefined;
	}

	getCourseActions(): ReadonlyArray<CourseActionContribution> {
		return this.get('course.detail.action') as unknown as ReadonlyArray<CourseActionContribution>;
	}

	private notify(): void {
		for (const listener of this.listeners) {
			try {
				listener();
			} catch (error) {
				console.error('[HierarchicalSlotRegistry] Error in listener:', error);
			}
		}
		this.onSlotsChangedCallback?.();
	}

	dispose(): void {
		this.slots.clear();
		this.listeners.clear();
	}
}
