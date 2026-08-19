import type { Disposable } from '../types/env';
import type {
	CourseActionContribution,
	TimetableExporterAdapter,
	TimetableSourceAdapter
} from '../types/contributions';

export class SlotRegistry implements Disposable {
	private sources = new Map<string, TimetableSourceAdapter>();
	private exporters = new Map<string, TimetableExporterAdapter>();
	private courseActions = new Map<string, CourseActionContribution>();

	constructor(private onSlotsChanged?: () => void) {}

	registerSource(adapter: TimetableSourceAdapter): Disposable {
		this.sources.set(adapter.id, adapter);
		this.onSlotsChanged?.();
		return {
			dispose: () => {
				if (this.sources.get(adapter.id) === adapter) {
					this.sources.delete(adapter.id);
					this.onSlotsChanged?.();
				}
			}
		};
	}

	getSource(id: string): TimetableSourceAdapter | undefined {
		return this.sources.get(id);
	}

	getSources(): ReadonlyArray<TimetableSourceAdapter> {
		return Array.from(this.sources.values());
	}

	registerExporter(adapter: TimetableExporterAdapter): Disposable {
		this.exporters.set(adapter.id, adapter);
		this.onSlotsChanged?.();
		return {
			dispose: () => {
				if (this.exporters.get(adapter.id) === adapter) {
					this.exporters.delete(adapter.id);
					this.onSlotsChanged?.();
				}
			}
		};
	}

	getExporter(id: string): TimetableExporterAdapter | undefined {
		return this.exporters.get(id);
	}

	getExporters(): ReadonlyArray<TimetableExporterAdapter> {
		return Array.from(this.exporters.values());
	}

	registerCourseAction(action: CourseActionContribution): Disposable {
		this.courseActions.set(action.id, action);
		this.onSlotsChanged?.();
		return {
			dispose: () => {
				if (this.courseActions.get(action.id) === action) {
					this.courseActions.delete(action.id);
					this.onSlotsChanged?.();
				}
			}
		};
	}

	getCourseAction(id: string): CourseActionContribution | undefined {
		return this.courseActions.get(id);
	}

	getCourseActions(): ReadonlyArray<CourseActionContribution> {
		return Array.from(this.courseActions.values());
	}

	dispose(): void {
		this.sources.clear();
		this.exporters.clear();
		this.courseActions.clear();
	}
}
