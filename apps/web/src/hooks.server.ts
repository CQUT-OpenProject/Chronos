import type { Handle } from '@sveltejs/kit';
import type { AppLocale } from '@chronos/core';
import { appLocaleToBcp47 } from '$lib/i18n/locale-sync';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', appLocaleToBcp47(locale as AppLocale))
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});
