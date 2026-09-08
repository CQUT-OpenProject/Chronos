import dns from 'node:dns';
import { Agent, type Dispatcher } from 'undici';
import { CONNECT_TIMEOUT_MS } from './config';

let cachedDispatcher: Dispatcher | null = null;

export function createCqutDispatcher(): Dispatcher {
	return new Agent({
		connect: {
			timeout: CONNECT_TIMEOUT_MS,
			autoSelectFamily: false,
			lookup: (hostname, options, cb) => dns.lookup(hostname, { ...options, family: 4 }, cb),
			keepAlive: true,
			keepAliveInitialDelay: 1000
		},
		pipelining: 1,
		keepAliveTimeout: 10_000,
		keepAliveMaxTimeout: 30_000
	});
}

export function getCqutDispatcher(): Dispatcher {
	if (!cachedDispatcher) {
		cachedDispatcher = createCqutDispatcher();
	}
	return cachedDispatcher;
}
