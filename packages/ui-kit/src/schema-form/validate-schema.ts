import type { ConfigSchema, SchemaField } from '@chronos/core';
import { isValidIsoDateString } from '../form/date-field-utils';

function isFilled(type: SchemaField['type'], raw: unknown): boolean {
	switch (type) {
		case 'date':
			return isValidIsoDateString(raw);
		case 'string':
		case 'password':
			return typeof raw === 'string' && raw.trim().length > 0;
		case 'select':
			return raw !== undefined && raw !== null && raw !== '';
		case 'number':
			return typeof raw === 'number' && !Number.isNaN(raw);
		case 'file':
			return raw !== undefined && raw !== null && raw !== '';
		default:
			// boolean / previews / array / object have no generic empty state
			// (some are not even rendered as inputs), so never block on them.
			return true;
	}
}

/**
 * Keys of visible required fields whose current value is missing,
 * or rejected by the field's own `validate` hook.
 */
export function findInvalidSchemaFields(
	schema: ConfigSchema<Record<string, unknown>>,
	value: Record<string, unknown>
): string[] {
	return (Object.entries(schema) as Array<[string, SchemaField<unknown>]>)
		.filter(([, field]) => field.required && !field.hidden)
		.filter(([key, field]) => !isFilled(field.type, value[key]) || field.validate?.(value[key]))
		.map(([key]) => key);
}
