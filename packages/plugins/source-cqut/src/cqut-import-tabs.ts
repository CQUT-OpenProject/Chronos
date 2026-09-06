/** CQUT plugin import slot registration (online credentials + edu HTML file). */
import type { ChronosContext, Timetable } from '@chronos/core';
import {
	callPluginServerJson,
	registerImportTab,
	ImportSlotError,
	type ChronosMountable
} from '@chronos/core';
import { IHttpService } from '@chronos/core';
import { DEFAULT_CQUT_CAMPUS_ID } from './campus-period-times';
import {
	createCqutImportSchema,
	createHtmlConfirmSchema,
	createHtmlImportSchema,
	resolveCqutServerErrorMessage,
	type CqutImportForm
} from './messages';
import {
	parseHtmlTimetable,
	finalizeHtmlPreview,
	type HtmlImportForm,
	type HtmlConfirmForm
} from './html-parser';
import { parseCqutScheduleData, type CqutScheduleRawInput } from './cqut-schedule-parser';

const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';

export interface RegisterCqutImportTabsOptions {
	ctx: ChronosContext;
	t: (key: string) => string;
	disabledSlots: Set<string>;
	onlineComponent: ChronosMountable;
	htmlComponent: ChronosMountable;
}

async function executeCqutOnlineImport(
	ctx: ChronosContext,
	t: (key: string) => string,
	inputs: CqutImportForm,
	context?: ChronosContext
): Promise<Timetable> {
	const activeCtx = context ?? ctx;
	const username = inputs.username?.trim();
	const password = inputs.password;

	if (!username || !password?.trim()) {
		throw new ImportSlotError('unsupported', t('import.online.error.credentials'));
	}

	activeCtx.actions.notify(t('import.online.notify.connecting'), 'info');

	const http = activeCtx.service(IHttpService);
	if (!http.proxy) {
		throw new ImportSlotError('unsupported', t('import.online.error.proxyUnsupported'));
	}

	const { response, body } = await callPluginServerJson<CqutScheduleRawInput>(
		http,
		SOURCE_CQUT_PLUGIN_ID,
		'preview',
		{ account: username, password }
	);

	if (!response.ok || !body.ok) {
		throw new ImportSlotError('network', resolveCqutServerErrorMessage(body, t));
	}

	return parseCqutScheduleData(body.payload, username, DEFAULT_CQUT_CAMPUS_ID, t);
}

async function executeCqutHtmlImport(
	t: (key: string) => string,
	inputs: HtmlImportForm
): Promise<Timetable> {
	const fileContent = inputs.file;
	if (!fileContent || typeof fileContent !== 'string') {
		throw new ImportSlotError('no-data', t('import.html.error.invalidFile'));
	}
	return parseHtmlTimetable(fileContent, {
		campusId: DEFAULT_CQUT_CAMPUS_ID,
		t
	});
}

/** Register CQUT online and edu-html import slots when not disabled in plugin config. */
export function registerCqutImportTabs(options: RegisterCqutImportTabsOptions): void {
	const { ctx, t, disabledSlots, onlineComponent, htmlComponent } = options;
	const cqutImportSchema = createCqutImportSchema(t);
	const htmlImportSchema = createHtmlImportSchema(t);
	const htmlConfirmSchema = createHtmlConfirmSchema(t);

	if (!disabledSlots.has('cqut-online')) {
		registerImportTab<CqutImportForm>(ctx, {
			id: 'cqut-online',
			title: () => t('import.online.tab.title'),
			order: 10,
			importKind: 'online',
			supportingText: () => t('import.online.tab.supporting'),
			component: onlineComponent,
			inputSchema: cqutImportSchema,
			executeImport: (inputs, context) => executeCqutOnlineImport(ctx, t, inputs, context)
		});
	}

	if (!disabledSlots.has('edu-html')) {
		registerImportTab<HtmlImportForm & HtmlConfirmForm>(ctx, {
			id: 'edu-html',
			title: () => t('import.html.tab.title'),
			order: 30,
			importKind: 'file',
			supportingText: () => t('import.html.tab.supporting'),
			component: htmlComponent,
			inputSchema: htmlImportSchema,
			confirmSchema: htmlConfirmSchema,
			confirmDefaultInput: {
				campusId: DEFAULT_CQUT_CAMPUS_ID,
				termStartDate: ''
			},
			validateConfirmInputs: (inputs) => {
				const termStartDate = inputs.termStartDate as string | undefined;
				if (!termStartDate?.trim()) {
					return t('import.html.error.termStartRequired');
				}
				return null;
			},
			finalizePreview: (preview, inputs) =>
				finalizeHtmlPreview(preview, inputs as HtmlConfirmForm, t),
			executeImport: (inputs) => executeCqutHtmlImport(t, inputs)
		});
	}
}
