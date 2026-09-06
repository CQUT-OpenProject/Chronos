import { defineChronosPlugin, type ChronosMountable } from '@chronos/core';
import { SOURCE_CQUT_MESSAGES } from './messages';
import { registerCqutImportTabs } from './cqut-import-tabs';

export type { CqutCampusId } from './campus-period-times';
export {
	CQUT_CAMPUSES,
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	DEFAULT_CQUT_CAMPUS_ID,
	getCampusApiName
} from './campus-period-times';

export type { CqutImportForm } from './messages';
export {
	parseCqutScheduleData,
	type CqutCampusScheduleMetadata,
	type CqutOnlineEventItem,
	type CqutOnlinePayloadData,
	type CqutScheduleRawInput
} from './cqut-schedule-parser';

import CqutOnlineImportTab from './CqutOnlineImportTab.svelte';
import EduHtmlImportTab from './EduHtmlImportTab.svelte';
import { mountableSvelteComponent } from '@chronos/ui-kit';

export interface CreateCqutPluginOptions {
	onlineComponent?: ChronosMountable;
	htmlComponent?: ChronosMountable;
}

export interface CqutPluginConfig {
	disabledSlots?: string[];
}

export function createCqutPlugin(options: CreateCqutPluginOptions = {}) {
	const {
		onlineComponent = mountableSvelteComponent(CqutOnlineImportTab),
		htmlComponent = mountableSvelteComponent(EduHtmlImportTab)
	} = options;

	return defineChronosPlugin<CqutPluginConfig>({
		id: 'source-cqut',
		messages: SOURCE_CQUT_MESSAGES,
		nameKey: 'plugin.name',
		descriptionKey: 'plugin.description',
		category: 'source',
		order: 10,
		author: 'CQUT OpenProject',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		allowedDomains: ['authserver.cqut.edu.cn', 'uis.cqut.edu.cn', 'timetable-cfc.cqut.edu.cn'],
		apply(ctx, t) {
			registerCqutImportTabs({
				ctx,
				t,
				disabledSlots: new Set(ctx.config.disabledSlots ?? []),
				onlineComponent,
				htmlComponent
			});
		}
	});
}

export const cqutPlugin = createCqutPlugin();

export { mergeWeekPayloads, resolveWeeksToFetch } from './week-merge';
export type {
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from './week-merge';
export {
	createHtmlImportSchema,
	createHtmlConfirmSchema,
	createCqutImportSchema,
	SOURCE_CQUT_MESSAGES
} from './messages';
export { parseHtmlTimetable, finalizeHtmlPreview } from './html-parser';
export type { HtmlImportForm, HtmlConfirmForm } from './html-parser';
