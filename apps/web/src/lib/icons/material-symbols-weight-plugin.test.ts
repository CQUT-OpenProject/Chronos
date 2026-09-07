import { describe, expect, it } from 'vite-plus/test';
import { stripMaterialSymbolIconWeights } from './material-symbols-weight-plugin';

describe('stripMaterialSymbolIconWeights', () => {
	it('keeps only weight 400 for regular and filled variants', () => {
		const input = `const pathData = {
    regular: {
        "100": "M1",
        "400": "M4",
        "700": "M7"
    },
    filled: {
        "100": "F1",
        "400": "F4",
        "700": "F7"
    }
};
const metadata = {};
export const IconW400 = pathData.regular[400];
`;
		expect(stripMaterialSymbolIconWeights(input)).toBe(`const pathData = {
    regular: {
        "400": "M4"
    },
    filled: {
        "400": "F4"
    }
};
const metadata = {};
export const IconW400 = pathData.regular[400];
`);
	});

	it('keeps regular-only icons without synthesizing filled paths', () => {
		const input = `const pathData = {
    regular: {
        "100": "M1",
        "400": "M4"
    }
};
const metadata = {};
`;
		expect(stripMaterialSymbolIconWeights(input)).toContain(
			'regular: {\n        "400": "M4"\n    }\n};'
		);
		expect(stripMaterialSymbolIconWeights(input)).not.toContain('filled');
	});
});
