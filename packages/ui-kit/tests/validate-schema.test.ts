import type { ConfigSchema } from '@chronos/core';
import { describe, expect, it } from 'vite-plus/test';
import { findInvalidSchemaFields } from '../src/schema-form/validate-schema';

const schema = {
	termStart: { type: 'date', title: 'Term start', required: true },
	nickname: { type: 'string', title: 'Nickname', required: true },
	optionalNote: { type: 'string', title: 'Note' },
	hiddenToken: { type: 'string', title: 'Token', required: true, hidden: true },
	mode: { type: 'select', title: 'Mode', required: true, options: [] },
	count: { type: 'number', title: 'Count', required: true },
	agreed: { type: 'boolean', title: 'Agreed', required: true },
	custom: {
		type: 'string',
		title: 'Custom',
		required: true,
		validate: (v: unknown) => (v === 'ok' ? undefined : 'must be ok')
	}
} as unknown as ConfigSchema<Record<string, unknown>>;

describe('findInvalidSchemaFields', () => {
	it('passes when every visible required field is filled', () => {
		expect(
			findInvalidSchemaFields(schema, {
				termStart: '2026-02-23',
				nickname: ' ada ',
				mode: 'a',
				count: 0,
				agreed: false,
				custom: 'ok'
			})
		).toEqual([]);
	});

	it('flags missing or malformed required values, ignoring hidden fields', () => {
		expect(
			findInvalidSchemaFields(schema, {
				termStart: 'foo',
				nickname: '   ',
				mode: '',
				count: Number.NaN,
				agreed: false,
				custom: 'ok'
			}).sort()
		).toEqual(['count', 'mode', 'nickname', 'termStart']);
	});

	it('honors the field validate hook', () => {
		expect(
			findInvalidSchemaFields(schema, {
				termStart: '2026-02-23',
				nickname: 'ada',
				mode: 'a',
				count: 1,
				agreed: true,
				custom: 'nope'
			})
		).toEqual(['custom']);
	});
});
