import { describe, expect, it } from 'vite-plus/test';
import type { ImportTabSlotContribution } from '@chronos/core';
import {
	buildImportDescription,
	buildOnboardingImportHighlight,
	formatImportMethodTitle,
	slotsHaveImportKind
} from './import-slot-capabilities';

const onlineSlot: ImportTabSlotContribution = {
	id: 'cqut-online',
	title: () => '知行理工',
	importKind: 'online',
	executeImport: async () => ({}) as never
};

const linkSlot: ImportTabSlotContribution = {
	id: 'share-link',
	title: () => '分享口令',
	importKind: 'link',
	executeImport: async () => ({}) as never
};

const fileSlot: ImportTabSlotContribution = {
	id: 'edu-html',
	title: () => 'HTML 文件',
	importKind: 'file',
	executeImport: async () => ({}) as never
};

describe('import-slot-capabilities', () => {
	it('detects import kinds from slot metadata', () => {
		const slots = [onlineSlot, linkSlot, fileSlot];
		expect(slotsHaveImportKind(slots, 'online')).toBe(true);
		expect(slotsHaveImportKind(slots, 'link')).toBe(true);
		expect(slotsHaveImportKind(slots, 'file')).toBe(true);
		expect(slotsHaveImportKind([linkSlot], 'online')).toBe(false);
	});

	it('builds transfer import descriptions from registered slots', () => {
		expect(buildImportDescription([onlineSlot, linkSlot, fileSlot])).toBe(
			'支持知行理工在线导入、分享口令、教务系统导出的 HTML 文件。'
		);
		expect(buildImportDescription([linkSlot, fileSlot])).toBe(
			'支持分享口令、教务系统导出的 HTML 文件。'
		);
		expect(buildImportDescription([linkSlot])).toBe('支持分享口令导入课表。');
	});

	it('builds onboarding highlight copy without host plugin ids', () => {
		expect(buildOnboardingImportHighlight([onlineSlot, linkSlot, fileSlot])).toBe(
			'知行理工在线导入、分享口令、HTML 文件均可'
		);
		expect(buildOnboardingImportHighlight([linkSlot, fileSlot])).toBe(
			'分享口令、HTML 文件均可导入'
		);
	});

	it('formats import method titles from slot metadata', () => {
		expect(formatImportMethodTitle(onlineSlot)).toBe('知行理工在线导入');
		expect(formatImportMethodTitle(linkSlot)).toBe('分享口令导入');
	});
});
