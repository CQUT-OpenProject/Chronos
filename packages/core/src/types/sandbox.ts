import type { Disposable } from './services';
import type { PluginManifest, PluginCapability } from './marketplace';

// ── JSON-RPC message protocol ────────────────────────────────────────

/** JSON-RPC 2.0 request envelope for sandbox ↔ host communication. */
export interface SandboxRpcRequest<T = unknown> {
	readonly jsonrpc: '2.0';
	readonly id: string;
	readonly method: string;
	readonly params?: T;
}

/** JSON-RPC 2.0 response envelope for sandbox ↔ host communication. */
export interface SandboxRpcResponse<T = unknown> {
	readonly jsonrpc: '2.0';
	readonly id: string;
	readonly result?: T;
	readonly error?: {
		readonly code: number;
		readonly message: string;
		readonly data?: unknown;
	};
}

// ── Capability gate ──────────────────────────────────────────────────

/**
 * Permission gate that enforces domain whitelists and SSRF protection
 * before forwarding sandboxed plugin requests to host services.
 */
export interface SandboxCapabilityGate {
	/**
	 * Validate whether the plugin identified by `pluginId` is allowed to
	 * invoke `capability`. Returns `true` if permitted.
	 */
	checkPermission(pluginId: string, capability: PluginCapability): boolean;

	/**
	 * Validate a network request URL against the plugin's `allowedDomains`
	 * whitelist and built-in SSRF heuristics (private IP ranges, loopback, etc.).
	 * Returns `true` if the request should be forwarded.
	 */
	checkNetworkAccess(pluginId: string, url: string): boolean;
}

// ── Worker bridge ────────────────────────────────────────────────────

/**
 * Bridge between the host main thread and a sandboxed plugin running inside
 * a WebWorker (web) or QuickJS isolate (native).
 *
 * The host creates one bridge per sandboxed plugin. The bridge proxies
 * `ctx.service()`, `ctx.registerSlot()`, and event subscriptions as
 * JSON-RPC calls across the isolation boundary.
 */
export interface WorkerPluginBridge extends Disposable {
	/** Unique identifier of the sandboxed plugin this bridge manages. */
	readonly pluginId: string;

	/** Initialize the sandbox, load the bundle code, and call `apply()`. */
	init(manifest: PluginManifest, code: string): Promise<void>;

	/** Send a JSON-RPC request to the sandbox and await its response. */
	call<T = unknown, R = unknown>(method: string, params?: T): Promise<R>;

	/**
	 * Register a handler for incoming RPC calls from the sandbox
	 * (e.g. `slot:register`, `http:request`, `storage:get`).
	 */
	onRequest(handler: (request: SandboxRpcRequest) => Promise<SandboxRpcResponse>): Disposable;
}

// ── Sandbox plugin host (runs inside the worker) ─────────────────────

/**
 * Minimal runtime environment exposed to the sandboxed plugin code.
 * All capability access is proxied back to the host via RPC.
 */
export interface SandboxPluginHost {
	/** Plugin identifier injected by the bridge during initialization. */
	readonly pluginId: string;

	/**
	 * Send an RPC request to the host and await the result.
	 * This is the single exit point for all capability access.
	 */
	callHost<T = unknown, R = unknown>(method: string, params?: T): Promise<R>;

	/**
	 * Register a handler for incoming RPC calls from the host
	 * (e.g. `slot:executeImport` triggered by user interaction).
	 */
	onHostRequest(handler: (request: SandboxRpcRequest) => Promise<SandboxRpcResponse>): Disposable;
}
