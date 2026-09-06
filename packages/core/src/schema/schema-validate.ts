import type { ConfigSchema, SchemaField, SchemaValidationResult } from './schema-types';

export function extractDefaultValues<T extends object>(schema: ConfigSchema<T>): T {
	const result = {} as Record<string, unknown>;

	for (const [key, field] of Object.entries(schema) as Array<[string, SchemaField<unknown>]>) {
		if (field.default !== undefined) {
			result[key] = field.default;
		} else {
			switch (field.type) {
				case 'boolean':
					result[key] = false;
					break;
				case 'number':
					result[key] = 0;
					break;
				case 'select':
					result[key] = field.options?.[0]?.value ?? '';
					break;
				case 'wallpaper-preview':
				case 'timetable-preview':
					result[key] = null;
					break;
				case 'string':
				case 'password':
				case 'file':
				case 'date':
				default:
					result[key] = '';
					break;
			}
		}
	}

	return result as T;
}

/**
 * Validate an input object against a declarative ConfigSchema,
 * applying default values, type checks, and custom validators.
 */
export function validateConfig<T extends object>(
	input: unknown,
	schema: ConfigSchema<T>
): SchemaValidationResult<T> {
	const errors: Record<string, string> = {};
	const raw =
		input && typeof input === 'object' && !Array.isArray(input)
			? (input as Record<string, unknown>)
			: {};

	const defaults = extractDefaultValues(schema);
	const values = { ...defaults, ...raw } as Record<string, unknown>;

	for (const [key, field] of Object.entries(schema) as Array<[string, SchemaField<unknown>]>) {
		const val = values[key];

		if (field.required) {
			if (val === undefined || val === null || val === '') {
				errors[key] = 'Field is required';
				continue;
			}
		}

		if (val === undefined || val === null || val === '') {
			continue;
		}

		switch (field.type) {
			case 'boolean':
				if (typeof val !== 'boolean') {
					errors[key] = 'Value must be a boolean';
				}
				break;
			case 'number':
				if (typeof val !== 'number' || Number.isNaN(val)) {
					const parsed = Number(val);
					if (Number.isNaN(parsed)) {
						errors[key] = 'Value must be a valid number';
					} else {
						values[key] = parsed;
					}
				}
				break;
			case 'select':
				if (field.options && field.options.length > 0) {
					const validValues = field.options.map((opt) => opt.value);
					if (!validValues.includes(val as string | number)) {
						errors[key] = 'Selected option is not in the allowed list';
					}
				}
				break;
			case 'string':
			case 'password':
			case 'date':
				if (typeof val !== 'string') {
					errors[key] = 'Value must be a string';
				}
				break;
			case 'file':
				if (typeof val !== 'string' && !(val instanceof Uint8Array)) {
					errors[key] = 'Value must be a string or binary file';
				}
				break;
			case 'wallpaper-preview':
				if (val !== null && val !== '' && typeof val !== 'string' && !(val instanceof Uint8Array)) {
					errors[key] = 'Value must be a string or binary file';
				}
				break;
			case 'timetable-preview':
				break;
		}

		if (!errors[key] && field.validate) {
			try {
				const errorMsg = field.validate(values[key] as never);
				if (errorMsg) {
					errors[key] = errorMsg;
				}
			} catch (err: unknown) {
				errors[key] = err instanceof Error ? err.message : 'Validation failed';
			}
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
		values: values as T
	};
}
