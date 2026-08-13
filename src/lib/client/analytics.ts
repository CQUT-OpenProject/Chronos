import { env } from '$env/dynamic/public';
import type { PostHog } from 'posthog-js';

export type AnalyticsEvent =
	| 'onboarding_step_next'
	| 'onboarding_step_back'
	| 'onboarding_skip'
	| 'onboarding_start_import'
	| 'onboarding_layout_selected'
	| 'empty_import_click'
	| 'empty_import_guide_open'
	| 'timetable_week_swipe'
	| 'timetable_week_jump_current'
	| 'course_detail_open'
	| 'course_editor_open'
	| 'course_save'
	| 'course_delete'
	| 'import_source_select'
	| 'import_online_preview_attempt'
	| 'import_online_preview_success'
	| 'import_online_preview_fail'
	| 'import_share_preview_attempt'
	| 'import_share_preview_success'
	| 'import_share_preview_fail'
	| 'import_html_preview_attempt'
	| 'import_html_preview_success'
	| 'import_html_preview_fail'
	| 'share_link_decode_success'
	| 'share_link_decode_fail'
	| 'import_mode_select'
	| 'import_confirm'
	| 'export_copy_link'
	| 'export_long_link_warning_shown'
	| 'settings_theme_change'
	| 'settings_layout_change'
	| 'wallpaper_set'
	| 'wallpaper_clear'
	| 'timetable_switch'
	| 'timetable_delete'
	| 'pwa_install_prompt_show'
	| 'pwa_install_accept'
	| 'pwa_install_snooze'
	| 'pwa_install_dismiss'
	| 'pwa_install_cta_click'
	| 'pwa_update_available'
	| 'pwa_update_apply'
	| 'about_clear_all_data';

let client: PostHog | null = null;
let pending: Array<[AnalyticsEvent, Record<string, string | number | boolean> | undefined]> | null =
	null;

export function initAnalytics() {
	if (import.meta.env.DEV) return;

	const key = env.PUBLIC_POSTHOG_KEY;
	if (!key) return;

	pending = [];
	void import('posthog-js')
		.then(({ default: posthog }) => {
			posthog.init(key, {
				api_host: env.PUBLIC_POSTHOG_HOST,
				defaults: '2026-05-30',
				autocapture: false,
				disable_session_recording: true,
				persistence: 'localStorage'
			});
			client = posthog;
			const queued = pending;
			pending = null;
			for (const [name, properties] of queued ?? []) {
				posthog.capture(name, properties);
			}
		})
		.catch(() => {
			pending = null;
		});
}

export function trackEvent(
	name: AnalyticsEvent,
	properties?: Record<string, string | number | boolean>
) {
	if (client) {
		client.capture(name, properties);
		return;
	}
	pending?.push([name, properties]);
}
