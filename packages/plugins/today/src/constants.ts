export const TODAY_PLUGIN_ID = 'tool-today';

export const DEFAULT_PREPARE_REMINDER_MINUTES = 30;

export type TodayScope = 'active' | 'all';

export interface TodayPluginConfig {
	scope: TodayScope;
	prepareReminderMinutes: number;
}
