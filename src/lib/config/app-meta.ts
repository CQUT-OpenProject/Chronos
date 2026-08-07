import packageJson from '../../../package.json';

declare const __BUILD_TIME__: string;

export const APP_VERSION = packageJson.version;
export const BUILD_TIME = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : '';
export const PROJECT_INTRO = '基于渐进式 Web 的课程表应用';
export const SOURCE_CODE_URL = 'https://github.com/CQUT-OpenProject/Chronos';
