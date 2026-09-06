export interface EccBlock {
	count: number;
	totalCodewords: number;
	dataCodewords: number;
}

export interface VersionEccSpec {
	eccPerBlock: number;
	blocks: EccBlock[];
}
/**
 * Standard ISO/IEC 18004 Table for ECC codewords and block division:
 * [eccPerBlock, count1, total1, data1, (count2, total2, data2)]
 */
// Level L ECC specs for versions 1..40
export const ECC_SPECS_L: VersionEccSpec[] = [
	{ eccPerBlock: 7, blocks: [{ count: 1, totalCodewords: 26, dataCodewords: 19 }] }, // V1
	{ eccPerBlock: 10, blocks: [{ count: 1, totalCodewords: 44, dataCodewords: 34 }] }, // V2
	{ eccPerBlock: 15, blocks: [{ count: 1, totalCodewords: 70, dataCodewords: 55 }] }, // V3
	{ eccPerBlock: 20, blocks: [{ count: 1, totalCodewords: 100, dataCodewords: 80 }] }, // V4
	{ eccPerBlock: 26, blocks: [{ count: 1, totalCodewords: 134, dataCodewords: 108 }] }, // V5
	{ eccPerBlock: 18, blocks: [{ count: 2, totalCodewords: 86, dataCodewords: 68 }] }, // V6
	{ eccPerBlock: 20, blocks: [{ count: 2, totalCodewords: 98, dataCodewords: 78 }] }, // V7
	{ eccPerBlock: 24, blocks: [{ count: 2, totalCodewords: 121, dataCodewords: 97 }] }, // V8
	{ eccPerBlock: 30, blocks: [{ count: 2, totalCodewords: 146, dataCodewords: 116 }] }, // V9
	{
		eccPerBlock: 18,
		blocks: [
			{ count: 2, totalCodewords: 86, dataCodewords: 68 },
			{ count: 2, totalCodewords: 87, dataCodewords: 69 }
		]
	}, // V10
	{ eccPerBlock: 20, blocks: [{ count: 4, totalCodewords: 101, dataCodewords: 81 }] }, // V11
	{
		eccPerBlock: 24,
		blocks: [
			{ count: 2, totalCodewords: 116, dataCodewords: 92 },
			{ count: 2, totalCodewords: 117, dataCodewords: 93 }
		]
	}, // V12
	{ eccPerBlock: 26, blocks: [{ count: 4, totalCodewords: 133, dataCodewords: 107 }] }, // V13
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 3, totalCodewords: 145, dataCodewords: 115 },
			{ count: 1, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V14
	{
		eccPerBlock: 22,
		blocks: [
			{ count: 5, totalCodewords: 109, dataCodewords: 87 },
			{ count: 1, totalCodewords: 110, dataCodewords: 88 }
		]
	}, // V15
	{
		eccPerBlock: 24,
		blocks: [
			{ count: 5, totalCodewords: 122, dataCodewords: 98 },
			{ count: 1, totalCodewords: 123, dataCodewords: 99 }
		]
	}, // V16
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 1, totalCodewords: 135, dataCodewords: 107 },
			{ count: 5, totalCodewords: 136, dataCodewords: 108 }
		]
	}, // V17
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 5, totalCodewords: 150, dataCodewords: 120 },
			{ count: 1, totalCodewords: 151, dataCodewords: 121 }
		]
	}, // V18
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 3, totalCodewords: 141, dataCodewords: 113 },
			{ count: 4, totalCodewords: 142, dataCodewords: 114 }
		]
	}, // V19
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 3, totalCodewords: 135, dataCodewords: 107 },
			{ count: 5, totalCodewords: 136, dataCodewords: 108 }
		]
	}, // V20
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 4, totalCodewords: 144, dataCodewords: 116 },
			{ count: 4, totalCodewords: 145, dataCodewords: 117 }
		]
	}, // V21
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 2, totalCodewords: 151, dataCodewords: 123 },
			{ count: 7, totalCodewords: 152, dataCodewords: 124 }
		]
	}, // V22
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 4, totalCodewords: 147, dataCodewords: 117 },
			{ count: 5, totalCodewords: 148, dataCodewords: 118 }
		]
	}, // V23
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 6, totalCodewords: 151, dataCodewords: 121 },
			{ count: 4, totalCodewords: 152, dataCodewords: 122 }
		]
	}, // V24
	{
		eccPerBlock: 26,
		blocks: [
			{ count: 8, totalCodewords: 133, dataCodewords: 107 },
			{ count: 4, totalCodewords: 134, dataCodewords: 108 }
		]
	}, // V25
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 10, totalCodewords: 142, dataCodewords: 114 },
			{ count: 2, totalCodewords: 143, dataCodewords: 115 }
		]
	}, // V26
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 8, totalCodewords: 152, dataCodewords: 122 },
			{ count: 4, totalCodewords: 153, dataCodewords: 123 }
		]
	}, // V27
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 3, totalCodewords: 147, dataCodewords: 117 },
			{ count: 10, totalCodewords: 148, dataCodewords: 118 }
		]
	}, // V28
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 7, totalCodewords: 146, dataCodewords: 116 },
			{ count: 7, totalCodewords: 147, dataCodewords: 117 }
		]
	}, // V29
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 5, totalCodewords: 145, dataCodewords: 115 },
			{ count: 10, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V30
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 13, totalCodewords: 145, dataCodewords: 115 },
			{ count: 3, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V31
	{ eccPerBlock: 30, blocks: [{ count: 17, totalCodewords: 145, dataCodewords: 115 }] }, // V32
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 17, totalCodewords: 145, dataCodewords: 115 },
			{ count: 1, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V33
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 13, totalCodewords: 145, dataCodewords: 115 },
			{ count: 6, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V34
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 12, totalCodewords: 151, dataCodewords: 121 },
			{ count: 7, totalCodewords: 152, dataCodewords: 122 }
		]
	}, // V35
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 6, totalCodewords: 151, dataCodewords: 121 },
			{ count: 14, totalCodewords: 152, dataCodewords: 122 }
		]
	}, // V36
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 17, totalCodewords: 152, dataCodewords: 122 },
			{ count: 4, totalCodewords: 153, dataCodewords: 123 }
		]
	}, // V37
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 4, totalCodewords: 152, dataCodewords: 122 },
			{ count: 18, totalCodewords: 153, dataCodewords: 123 }
		]
	}, // V38
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 20, totalCodewords: 147, dataCodewords: 117 },
			{ count: 4, totalCodewords: 148, dataCodewords: 118 }
		]
	}, // V39
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 19, totalCodewords: 148, dataCodewords: 118 },
			{ count: 6, totalCodewords: 149, dataCodewords: 119 }
		]
	} // V40
];
