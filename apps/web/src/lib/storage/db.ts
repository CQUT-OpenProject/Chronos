import Dexie, { type Table } from 'dexie';

export interface TimetableRow {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	configJson: string;
}

export interface CourseRow {
	id: string;
	timetableId: string;
	name: string;
	teacher: string;
	location: string;
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
	weeksCsv: string;
	remark: string;
}

export interface PluginDataRow {
	id: string;
	pluginId: string;
	key: string;
	valueJson: string;
	updatedAt: number;
}

export class ChronosDB extends Dexie {
	timetables!: Table<TimetableRow, string>;
	courses!: Table<CourseRow, string>;
	pluginData!: Table<PluginDataRow, string>;

	constructor(name = 'chronos') {
		super(name);
		this.version(1).stores({
			timetables: 'id, updatedAt',
			courses: 'id, timetableId, [timetableId+dayOfWeek]',
			pluginData: 'id, pluginId, key, updatedAt'
		});
	}
}

export const db = new ChronosDB();
