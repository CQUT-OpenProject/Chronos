import { writeGeneratedThemeCss } from '../src/lib/m3/theme.ts';

const outputPath = writeGeneratedThemeCss();
console.log(`Wrote ${outputPath}`);
