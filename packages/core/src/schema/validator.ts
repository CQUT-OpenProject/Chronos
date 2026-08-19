import type { ConfigSchema, SchemaField } from './schema';

export interface ValidationResult<T> {
	valid: boolean;
	errors: Record<string, string>;
	data: T;
}

export function extractDefaultValues<T extends object>(schema: ConfigSchema<T>): T {
	const result = {} as Record<string, unknown>;

	for (const [key, field] of Object.entries(schema) as [string, SchemaField][]) {
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
				case 'string':
				case 'password':
				case 'file':
				default:
					result[key] = '';
					break;
			}
		}
	}

	return result as T;
}

export function validateSchema<T extends object>(
	schema: ConfigSchema<T>,
	input: unknown
): ValidationResult<T> {
	const errors: Record<string, string> = {};
	const rawData =
		input && typeof input === 'object' && !Array.isArray(input)
			? (input as Record<string, unknown>)
			: {};

	const defaults = extractDefaultValues(schema);
	const data = { ...defaults, ...rawData } as Record<string, unknown>;

	for (const [key, field] of Object.entries(schema) as [string, SchemaField][]) {
		const value = data[key];

		// 1. Required field validation
		if (field.required) {
			if (value === undefined || value === null || value === '') {
				errors[key] = 'This field is required';
				continue;
			}
		}

		// Skip further type checks if value is omitted and not required
		if (value === undefined || value === null || value === '') {
			continue;
		}

		// 2. Type validation
		switch (field.type) {
			case 'boolean':
				if (typeof value !== 'boolean') {
					errors[key] = 'Value must be a boolean';
				}
				break;
			case 'number':
				if (typeof value !== 'number' || Number.isNaN(value)) {
					const parsed = Number(value);
					if (Number.isNaN(parsed)) {
						errors[key] = 'Value must be a valid number';
					} else {
						data[key] = parsed;
					}
				}
				break;
			case 'select':
				if (field.options && field.options.length > 0) {
					const validValues = field.options.map((opt) => opt.value);
					if (!validValues.includes(value as string | number)) {
						errors[key] = 'Selected option is not in the allowed list';
					}
				}
				break;
			case 'string':
			case 'password':
			case 'file':
				if (typeof value !== 'string') {
					errors[key] = 'Value must be a string';
				}
				break;
		}

		// 3. Custom validator execution
		if (!errors[key] && field.validate) {
			try {
				const customErr = field.validate(data[key]);
				if (customErr) {
					errors[key] = customErr;
				}
			} catch (err: unknown) {
				errors[key] = err instanceof Error ? err.message : 'Validation failed';
			}
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
		data: data as T
	};
}
