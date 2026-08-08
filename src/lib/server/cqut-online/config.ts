export const UIS_BASE_URL = 'https://uis.cqut.edu.cn';
export const CAS_APPLICATION_CODE = 'YF8A4013';
export const TIMETABLE_BASE_URL = 'https://timetable-cfc.cqut.edu.cn';
export const TIMETABLE_HOST = new URL(TIMETABLE_BASE_URL).hostname;
export const UIS_HOST = new URL(UIS_BASE_URL).hostname;

export const CAS_SERVICE_URL = `${TIMETABLE_BASE_URL}/api/auth/casLogin`;
export const CAS_LOGIN_URL = `${UIS_BASE_URL}/center-auth-server/sso/doLogin`;
export const CAS_TICKET_URL = `${UIS_BASE_URL}/center-auth-server/${CAS_APPLICATION_CODE}/cas/login`;
export const WEEK_EVENTS_URL = `${TIMETABLE_BASE_URL}/api/courseSchedule/listWeekEvents`;

export const UNIVERSITY_ID = '100005';
export const JSON_MEDIA_TYPE = 'application/json; charset=utf-8';
export const TIMETABLE_SESSION_COOKIE = 'JSESSIONID';

export const WEEK_FETCH_CONCURRENCY = 4;
export const REQUEST_TIMEOUT_MS = 12_000;
export const TOTAL_FETCH_TIMEOUT_MS = 55_000;
export const HTTP_RETRY_DELAY_MS = 250;

/** Per-instance IP sliding window; not shared across Vercel instances. */
export const PREVIEW_RATE_LIMIT_MAX = 8;
export const PREVIEW_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
