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
	color: string;
	textColor: string;
	weeksCsv: string;
	remark: string;
}

export interface WallpaperRow {
	id: string;
	blob: Blob;
	updatedAt: number;
}

export class ChronosDB extends Dexie {
	timetables!: Table<TimetableRow, string>;
	courses!: Table<CourseRow, string>;
	wallpapers!: Table<WallpaperRow, string>;

	constructor(name = 'chronos') {
		super(name);
		this.version(1).stores({
			timetables: 'id, updatedAt',
			courses: 'id, timetableId, [timetableId+dayOfWeek]'
		});
		this.version(2).stores({
			timetables: 'id, updatedAt',
			courses: 'id, timetableId, [timetableId+dayOfWeek]',
			wallpapers: 'id'
		});
	}
}

export const db = new ChronosDB();
