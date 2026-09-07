//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/constants.js
var e = {}, t = Symbol("uninitialized"), n = Array.isArray, r = Array.prototype.indexOf, i = Array.prototype.includes, a = Array.from, o = Object.defineProperty, s = Object.getOwnPropertyDescriptor, c = Object.prototype, l = Array.prototype, u = Object.getPrototypeOf, d = Object.isExtensible, f = () => {};
function p(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function m() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, ee = 1 << 25, T = 65536, te = 1 << 21, ne = 1 << 22, re = 1 << 23, ie = Symbol("$state"), ae = Symbol("component"), oe = Symbol("attributes"), se = Symbol("class"), ce = Symbol("style"), le = Symbol("text"), ue = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
function de() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function fe(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function pe() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/hydration.js
var E = !1;
function me(e) {
	E = e;
}
var D;
function O(t) {
	if (t === null) throw fe(), e;
	return D = t;
}
function he() {
	return O(/* @__PURE__ */ Nt(D));
}
function ge(t) {
	if (E) {
		if (/* @__PURE__ */ Nt(D) !== null) throw fe(), e;
		D = t;
	}
}
function _e(e = 1) {
	if (E) {
		for (var t = e, n = D; t--;) n = /* @__PURE__ */ Nt(n);
		D = n;
	}
}
function ve(e = !0) {
	for (var t = 0, n = D;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Nt(n);
		e && n.remove(), n = i;
	}
}
function ye(t) {
	if (!t || t.nodeType !== 8) throw fe(), e;
	return t.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function be(e) {
	return e === this.v;
}
function xe(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Se(e) {
	return !xe(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function Ce() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function we(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Te() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ee() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function De() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Oe() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ke() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var k = null;
function Ae(e) {
	k = e;
}
function je(e, t = !1, n) {
	k = {
		p: k,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: G,
		l: null
	};
}
function Me(e) {
	var t = k, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Gt(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, k = t.p, Ne(e);
}
function Ne(e = {}) {
	return o(e, ae, { value: !0 }), e;
}
function Pe() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var Fe = [];
function Ie() {
	var e = Fe;
	Fe = [], p(e);
}
function Le(e) {
	if (Fe.length === 0 && !ot) {
		var t = Fe;
		queueMicrotask(() => {
			t === Fe && Ie();
		});
	}
	Fe.push(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/status.js
var Re = ~(g | _ | h);
function A(e, t) {
	e.f = e.f & Re | t;
}
function ze(e) {
	e.f & 512 || e.deps === null ? A(e, h) : A(e, _);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Be(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, Be(t.deps));
}
function Ve(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Be(e.deps), A(e, h);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function He(e) {
	var t = H, n = G;
	W(null), K(null);
	try {
		return e();
	} finally {
		W(t), K(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function Ue(e, t, n, r) {
	let i = Pe() ? qe : Ze;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = G, c = We(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				R(e, s);
			}
			Ge();
		}
	}
	var d = Ke();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ Ye(e))).then(u).catch((e) => R(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), Ge();
	}) : f();
}
function We() {
	var e = G, t = H, n = k, r = j;
	return function(i = !0) {
		K(e), W(t), Ae(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Ge(e = !0) {
	K(null), W(null), Ae(null), e && j?.deactivate();
}
function Ke() {
	var e = G, t = e.b, n = j, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function qe(e) {
	var n = 2 | g;
	return G !== null && (G.f |= C), {
		ctx: k,
		deps: null,
		effects: null,
		equals: be,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: G,
		ac: null
	};
}
var Je = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Ye(e, n, r) {
	let i = G;
	i === null && Ce();
	var a = void 0, o = bt(t), s = !H, c = /* @__PURE__ */ new Set();
	return qt(() => {
		var t = G, n = m();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ue && n.reject(e);
			}).finally(Ge);
		} catch (e) {
			n.reject(e), Ge();
		}
		var r = j;
		if (s) {
			if (t.f & 32768) var l = Ke();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(Je);
			else for (let e of c.values()) e.reject(Je);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== Je && (r.activate(), t ? (o.f |= re, St(o, t)) : (o.f & 8388608 && (o.f ^= re), St(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Wt(() => {
		for (let e of c) e.reject(Je);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === a ? e(o) : t(a);
			}
			n.then(r, r);
		}
		t(a);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Xe(e) {
	let t = /* @__PURE__ */ qe(e);
	return fn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function Ze(e) {
	let t = /* @__PURE__ */ qe(e);
	return t.equals = Se, t;
}
function Qe(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) V(t[n]);
	}
}
function $e(e) {
	var n, r = G, i = e.parent;
	if (!un && i !== null && e.v !== t && i.f & 24576) return de(), e.v;
	K(i);
	try {
		e.f &= ~T, Qe(e), n = xn(e);
	} finally {
		K(r);
	}
	return n;
}
function et(e) {
	var t = $e(e);
	if (!e.equals(t) && (e.wv = vn(), (!j?.is_fork || e.deps === null) && (j === null ? e.v = t : (j.capture(e, t, !0), it?.capture(e, t, !0)), e.deps === null))) {
		A(e, h);
		return;
	}
	un || (M === null ? ze(e) : (Ut() || j?.is_fork) && M.set(e, t));
}
function tt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && He(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = f), wn(t, 0), Qt(t));
}
function nt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Tn(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var rt = null, j = null, it = null, M = null, at = null, ot = !1, st = !1, ct = null, lt = null, ut = 0, dt = 1, ft = class e {
	id = dt++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		rt === null ? rt = this : (rt.#n = this, this.#t = rt), rt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) A(r, g), t(r);
			for (r of n.m) A(r, _), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, ut++ > 1e3 && (this.#x(), pt());
		for (let e of this.#u) this.#d.delete(e), A(e, g), this.schedule(e);
		for (let e of this.#d) A(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = ct = [], r = [], i = lt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw _t(e), this.#h() || this.discard(), t;
		}
		if (j = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (ct = null, lt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) gt(e, t);
			i.length > 0 && j.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), it = this, mt(r), mt(n), it = null, this.#s?.resolve();
		var s = j;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && (P.clear(), s.#g());
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : yn(r) && (i & 16 && this.#d.add(r), Tn(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#v() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#y(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), A(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), j = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Ve(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), M?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		j = this;
	}
	deactivate() {
		j = null, M = null;
	}
	flush() {
		try {
			st = !0, j = this, this.#g();
		} finally {
			ut = 0, at = null, ct = null, lt = null, st = !1, j = null, M = null, P.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(Je);
		this.#x(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, Le(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= m()).promise;
	}
	static ensure() {
		if (j === null) {
			let t = j = new e();
			!st && Le(() => {
				t.#e || t.flush();
			});
		}
		return j;
	}
	apply() {
		M = null;
	}
	schedule(e) {
		if (at = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (ct !== null && t === G && (H === null || !(H.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= h;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? rt = e : t.#t = e, this.linked = !1;
		}
	}
};
function pt() {
	try {
		Te();
	} catch (e) {
		R(e, at);
	}
}
var N = null;
function mt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && yn(r) && (N = /* @__PURE__ */ new Set(), Tn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && tn(r), N?.size > 0)) {
				P.clear();
				for (let e of N) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) N.has(n) && (N.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Tn(n);
					}
				}
				N.clear();
			}
		}
		N = null;
	}
}
function ht(e) {
	j.schedule(e);
}
function gt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), A(e, h);
		for (var n = e.first; n !== null;) gt(n, t), n = n.next;
	}
}
function _t(e) {
	A(e, h);
	for (var t = e.first; t !== null;) _t(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var vt = /* @__PURE__ */ new Set(), P = /* @__PURE__ */ new Map(), yt = !1;
function bt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: be,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function F(e, t) {
	let n = bt(e, t);
	return fn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function xt(e, t = !1, n = !0) {
	let r = bt(e);
	return t || (r.equals = Se), r;
}
function I(e, t, n = !1) {
	return H !== null && (!U || H.f & 131072) && Pe() && H.f & 4325394 && (q === null || !q.has(e)) && Oe(), St(e, n ? Et(t) : t, lt);
}
function St(e, t, n = null) {
	if (!e.equals(t)) {
		un ? P.set(e, t) : P.has(e) || P.set(e, e.v);
		var r = ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && $e(t), M === null && ze(t);
		}
		e.wv = vn(), Tt(e, g, n), Pe() && G !== null && G.f & 1024 && !(G.f & 96) && (X === null ? pn([e]) : X.push(e)), !r.is_fork && vt.size > 0 && !yt && Ct();
	}
	return t;
}
function Ct() {
	yt = !1;
	for (let e of vt) {
		e.f & 1024 && A(e, _);
		let t;
		try {
			t = yn(e);
		} catch {
			t = !0;
		}
		t && Tn(e);
	}
	vt.clear();
}
function wt(e) {
	I(e, e.v + 1);
}
function Tt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Pe(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === G)) {
			var l = (c & g) === 0;
			if (l && A(s, t), c & 131072) vt.add(s);
			else if (c & 2) {
				var u = s;
				M?.delete(u), c & 65536 || (c & 512 && (G === null || !(G.f & 2097152)) && (s.f |= T), Tt(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && N !== null && N.add(d), n === null ? ht(d) : n.push(d);
			}
		}
	}
}
function Et(e) {
	if (typeof e != "object" || !e || ie in e || ae in e) return e;
	let r = u(e);
	if (r !== c && r !== l) return e;
	var i = /* @__PURE__ */ new Map(), a = n(e), o = /* @__PURE__ */ F(0), d = null, f = gn, p = (e) => {
		if (gn === f) return e();
		var t = H, n = gn;
		W(null), _n(f);
		var r = e();
		return W(t), _n(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ F(e.length, d)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Ee();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ F(n.value, d);
				return i.set(t, e), e;
			}) : I(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ F(t, d));
					i.set(n, e), wt(o);
				}
			} else I(r, t), wt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === ie) return e;
			var o = i.get(r), c = r in n;
			if (o === void 0 && (!c || s(n, r)?.writable) && (o = p(() => /* @__PURE__ */ F(Et(c ? n[r] : t), d)), i.set(r, o)), o !== void 0) {
				var l = Z(o);
				return l === t ? void 0 : l;
			}
			return Reflect.get(n, r, a);
		},
		getOwnPropertyDescriptor(e, n) {
			var r = Reflect.getOwnPropertyDescriptor(e, n);
			if (r && "value" in r) {
				var a = i.get(n);
				a && (r.value = Z(a));
			} else if (r === void 0) {
				var o = i.get(n), s = o?.v;
				if (o !== void 0 && s !== t) return {
					enumerable: !0,
					configurable: !0,
					value: s,
					writable: !0
				};
			}
			return r;
		},
		has(e, n) {
			if (n === ie) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || G !== null && (!a || s(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ F(a ? Et(e[n]) : t, d)), i.set(n, r)), Z(r) === t) ? !1 : a;
		},
		set(e, n, r, c) {
			var l = i.get(n), u = n in e;
			if (a && n === "length") for (var f = r; f < l.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ F(t, d)), i.set(f + "", m)) : I(m, t);
			}
			if (l === void 0) (!u || s(e, n)?.writable) && (l = p(() => /* @__PURE__ */ F(void 0, d)), I(l, Et(r)), i.set(n, l));
			else {
				u = l.v !== t;
				var h = p(() => Et(r));
				I(l, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(c, r), !u) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && I(_, v + 1);
				}
				wt(o);
			}
			return !0;
		},
		ownKeys(e) {
			Z(o);
			var n = Reflect.ownKeys(e).filter((e) => {
				var n = i.get(e);
				return n === void 0 || n.v !== t;
			});
			for (var [r, a] of i) a.v !== t && !(r in e) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			De();
		}
	});
}
var Dt, Ot, kt, At;
function jt() {
	if (Dt === void 0) {
		Dt = window, Ot = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		kt = s(t, "firstChild").get, At = s(t, "nextSibling").get, d(e) && (e[se] = void 0, e[oe] = null, e[ce] = void 0, e.__e = void 0), d(n) && (n[le] = void 0);
	}
}
function L(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Mt(e) {
	return kt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Nt(e) {
	return At.call(e);
}
function Pt(e, t) {
	if (!E) return /* @__PURE__ */ Mt(e);
	var n = /* @__PURE__ */ Mt(D);
	if (n === null) n = D.appendChild(L());
	else if (t && n.nodeType !== 3) {
		var r = L();
		return n?.before(r), O(r), r;
	}
	return t && Bt(n), O(n), n;
}
function Ft(e, t = !1) {
	if (!E) return /* @__PURE__ */ Mt(e);
	var n = Pt(e, t);
	return ge(e), n;
}
function It(e, t = 1, n = !1) {
	let r = E ? D : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Nt(r);
	if (!E) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = L();
			return r === null ? i?.after(a) : r.before(a), O(a), a;
		}
		Bt(r);
	}
	return O(r), r;
}
function Lt(e) {
	e.textContent = "";
}
function Rt() {
	return !1;
}
function zt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Bt(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function Vt(e) {
	var t = G;
	if (t === null) return H.f |= re, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	R(e, t);
}
function R(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128 && !(t.f & 33570816)) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function Ht(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function z(e, t) {
	var n = G;
	n !== null && n.f & 8192 && (e |= v);
	var r = {
		ctx: k,
		deps: null,
		nodes: null,
		f: e | g | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	j?.register_created_effect(r);
	var i = r;
	if (e & 4) ct === null ? ft.ensure().schedule(r) : ct.push(r);
	else if (t !== null) {
		try {
			Tn(r);
		} catch (e) {
			throw V(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && Ht(i, n), H !== null && H.f & 2 && !(e & 64))) {
		var a = H;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Ut() {
	return H !== null && !U;
}
function Wt(e) {
	let t = z(8, null);
	return A(t, h), t.teardown = e, t;
}
function Gt(e) {
	return z(4 | w, e);
}
function Kt(e) {
	ft.ensure();
	let t = z(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? nn(t, () => {
			V(t), n(void 0);
		}) : (V(t), n(void 0));
	});
}
function qt(e) {
	return z(ne | C, e);
}
function Jt(e, t = 0) {
	return z(8 | t, e);
}
function Yt(e, t = [], n = [], r = []) {
	Ue(r, t, n, (t) => {
		z(8, () => {
			e(...t.map(Z));
		});
	});
}
function Xt(e, t = 0) {
	return z(16 | t, e);
}
function B(e) {
	return z(32 | C, e);
}
function Zt(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = un, r = H;
		dn(!0), W(null);
		try {
			t.call(null);
		} catch (t) {
			R(t, e.parent);
		} finally {
			dn(n), W(r);
		}
	}
}
function Qt(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && He(() => {
			e.abort(ue);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : V(n, t), n = r;
	}
}
function $t(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || V(t), t = n;
	}
}
function V(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (en(e.nodes.start, e.nodes.end), n = !0), e.f |= x, Qt(e, t && !n), wn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Zt(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && tn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function en(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Nt(e);
		e.remove(), e = n;
	}
}
function tn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function nn(e, t, n = !0) {
	var r = [];
	e.f |= 256, rn(e, r, !0);
	var i = () => {
		n && V(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function rn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				rn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function an(e) {
	e.f &= -257, on(e, !0);
}
function on(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= v, e.f & 1024 || (A(e, g), ft.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			on(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function sn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Nt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var cn = null, ln = !1, un = !1;
function dn(e) {
	un = e;
}
var H = null, U = !1;
function W(e) {
	H = e;
}
var G = null;
function K(e) {
	G = e;
}
var q = null;
function fn(e) {
	H !== null && (q ??= /* @__PURE__ */ new Set()).add(e);
}
var J = null, Y = 0, X = null;
function pn(e) {
	X = e;
}
var mn = 1, hn = 0, gn = hn;
function _n(e) {
	gn = e;
}
function vn() {
	return ++mn;
}
function yn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (yn(a) && et(a), a.wv > e.wv) return !0;
		}
		t & 512 && M === null && A(e, h);
	}
	return !1;
}
function bn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(q !== null && q.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? bn(a, t, !1) : t === a && (n ? A(a, g) : a.f & 1024 && A(a, _), ht(a));
	}
}
function xn(e) {
	var t = J, n = Y, r = X, i = H, a = q, o = k, s = U, c = gn, l = e.f;
	J = null, Y = 0, X = null, H = l & 96 ? null : e, q = null, Ae(e.ctx), U = !1, gn = ++hn, e.ac !== null && (He(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= te;
		var u = e.fn, d = u();
		e.f |= b;
		var f = Sn(e);
		if (Pe() && X !== null && !U && f !== null && !(e.f & 6146)) for (var p = 0; p < X.length; p++) bn(X[p], e);
		if (i !== null && i !== e) {
			if (hn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = hn;
			if (t !== null) for (let e of t) e.rv = hn;
			X !== null && (r === null ? r = X : r.push(...X));
		}
		return e.f & 8388608 && (e.f ^= re), d;
	} catch (t) {
		return Sn(e), Vt(t);
	} finally {
		e.f ^= te, J = t, Y = n, X = r, H = i, q = a, Ae(o), U = s, gn = c;
	}
}
function Sn(e) {
	var t = e.deps, n = j?.is_fork;
	if (J !== null) {
		var r;
		if (n || wn(e, Y), t !== null && Y > 0) for (t.length = Y + J.length, r = 0; r < J.length; r++) t[Y + r] = J[r];
		else e.deps = t = J;
		if (Ut() && e.f & 512) for (r = Y; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && Y < t.length && (wn(e, Y), t.length = Y);
	return t;
}
function Cn(e, n) {
	let a = n.reactions;
	if (a !== null) {
		var o = r.call(a, e);
		if (o !== -1) {
			var s = a.length - 1;
			s === 0 ? a = n.reactions = null : (a[o] = a[s], a.pop());
		}
	}
	if (a === null && n.f & 2 && (J === null || !i.call(J, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~T), c.v !== t && ze(c), c.ac !== null && He(() => {
			c.ac.abort(ue), c.ac = null, A(c, g);
		}), tt(c), wn(c, 0);
	}
}
function wn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Cn(e, n[r]);
}
function Tn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		A(e, h);
		var n = G, r = ln;
		G = e, ln = !(t & 96);
		try {
			t & 16777232 ? $t(e) : Qt(e), Zt(e);
			var i = xn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = mn;
		} finally {
			ln = r, G = n;
		}
	}
}
function Z(e) {
	var t = !!(e.f & 2);
	if (cn?.add(e), H !== null && !U && !(G !== null && G.f & 16384) && (q === null || !q.has(e))) {
		var n = H.deps;
		if (H.f & 2097152) e.rv < hn && (e.rv = hn, J === null && n !== null && n[Y] === e ? Y++ : J === null ? J = [e] : J.push(e));
		else {
			H.deps ??= [], i.call(H.deps, e) || H.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [H] : i.call(r, H) || r.push(H);
		}
	}
	if (un && P.has(e)) return P.get(e);
	if (t) {
		var a = e;
		if (un) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Dn(a)) && (o = $e(a)), P.set(a, o), o;
		}
		var s = !(a.f & 512) && !U && H !== null && (ln || !!(H.f & 512)), c = (a.f & b) === 0;
		yn(a) && (s && (a.f |= 512), et(a)), s && !c && (nt(a), En(a));
	}
	if (M?.has(e)) return M.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function En(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (nt(t), En(t));
}
function Dn(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (P.has(t) || t.f & 2 && Dn(t)) return !0;
	return !1;
}
function On(e) {
	var t = U;
	try {
		return U = !0, e();
	} finally {
		U = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var kn = Symbol("events"), An = /* @__PURE__ */ new Set(), jn = /* @__PURE__ */ new Set();
function Mn(e, t, n) {
	(t[kn] ??= {})[e] = n;
}
function Q(e) {
	for (var t = 0; t < e.length; t++) An.add(e[t]);
	for (var n of jn) n(e);
}
var Nn = null, Pn = !1;
function Fn(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	Nn = e, Pn || (Pn = !0, setTimeout(() => {
		Pn = !1, Nn = null;
	}));
	var s = 0, c = Nn === e && e[kn];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[kn] = t;
			return;
		}
		var u = i.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (a = i[s] || e.target, a !== t) {
		o(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var d = H, f = G;
		W(null), K(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[kn]?.[r];
					h != null && (!a.disabled || e.target === a) && h.call(a, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, a = s < i.length ? i[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[kn] = t, delete e.currentTarget, W(d), K(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var In = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Ln(e) {
	return In?.createHTML(e) ?? e;
}
function Rn(e) {
	var t = zt("template");
	return t.innerHTML = Ln(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function zn(e, t) {
	var n = G;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Bn(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (E) return zn(D, null), D;
		i === void 0 && (i = Rn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Mt(i)));
		var t = r || Ot ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Mt(t), s = t.lastChild;
			zn(o, s);
		} else zn(t, t);
		return t;
	};
}
function Vn(e, t) {
	if (E) {
		var n = G;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = D), he();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Hn = ["touchstart", "touchmove"];
function Un(e) {
	return Hn.includes(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function Wn(e) {
	let t = 0, n = bt(0), r;
	return () => {
		Ut() && (Z(n), Jt(() => (t === 0 && (r = On(() => e(() => wt(n)))), t += 1, () => {
			Le(() => {
				--t, t === 0 && (r?.(), r = void 0, wt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var Gn = S | C;
function Kn(e, t, n, r) {
	new qn(e, t, n, r);
}
var qn = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = E ? D : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = Wn(() => (this.#m = bt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = G;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = G.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Xt(() => {
			if (E) {
				let e = this.#t;
				he();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, Gn), E && (this.#e = D);
	}
	#g() {
		try {
			this.#a = B(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Le(r), t && (this.#s = B(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				pe();
				return;
			}
			t = !0, n && ke(), this.#s !== null && nn(this.#s, () => {
				this.#s = null;
			}), this.#S(() => {
				this.#b();
			});
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					R(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = B(() => e(this.#e)), Le(() => {
			var e = this.#c = document.createDocumentFragment(), t = L(), n = !1;
			if (e.append(t), this.#a = this.#S(() => {
				try {
					return B(() => this.#r(t));
				} catch (e) {
					try {
						this.error(e), n = !0;
					} catch (e) {
						R(e, this.#i.parent);
					}
					return null;
				}
			}), this.#a === null) {
				this.#c = null, n && this.#x(j);
				return;
			}
			this.#u === 0 && (this.#e.before(e), this.#c = null, nn(this.#o, () => {
				this.#o = null;
			}), this.#x(j));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = B(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				sn(this.#a, e);
				let t = this.#n.pending;
				this.#o = B(() => t(this.#e));
			} else this.#x(j);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Ve(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = G, n = H, r = k;
		K(this.#i), W(this.#i), Ae(this.#i.ctx);
		try {
			return ft.ensure(), e();
		} finally {
			K(t), W(n), Ae(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && nn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Le(() => {
			this.#d = !1, this.#m && St(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), Z(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		j?.is_fork ? (this.#a && j.skip_effect(this.#a), this.#o && j.skip_effect(this.#o), this.#s && j.skip_effect(this.#s), j.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (V(this.#a), null), this.#o &&= (V(this.#o), null), this.#s &&= (V(this.#s), null), E && (O(this.#t), _e(), O(ve()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return B(() => {
						var r = G;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return R(e, this.#i.parent), null;
				}
			}));
		};
		Le(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				R(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => R(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
function Jn(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[le] ??= e.nodeValue) && (e[le] = n, e.nodeValue = `${n}`);
}
function Yn(e, t) {
	return Zn(e, t);
}
var Xn = /* @__PURE__ */ new Map();
function Zn(t, { target: n, anchor: r, props: i = {}, events: o, context: s, intro: c = !0, transformError: l }) {
	jt();
	var u = void 0, d = Kt(() => {
		var c = r ?? n.appendChild(L());
		Kn(c, { pending: () => {} }, (n) => {
			je({});
			var r = k;
			if (s && (r.c = s), o && (i.$$events = o), E && zn(n, null), u = t(n, i) || Ne(), E && (G.nodes.end = D, D === null || D.nodeType !== 8 || D.data !== "]")) throw fe(), e;
			Me();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = Un(r);
					for (let e of [n, document]) {
						var a = Xn.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Xn.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Fn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(a(An)), jn.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = Xn.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, Fn), t.delete(e), t.size === 0 && Xn.delete(r)) : t.set(e, i);
			}
			jn.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return Qn.set(u, d), u;
}
var Qn = /* @__PURE__ */ new WeakMap();
function $n(e, t) {
	let n = Qn.get(e);
	return n ? (Qn.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var er = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) an(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (an(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (V(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						sn(r, t), t.append(L()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else V(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), nn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (V(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = j, r = Rt();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = L();
				i.append(a), this.#n.set(e, {
					effect: B(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, B(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else E && (this.anchor = D), this.#a(n);
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/if.js
function tr(e, t, n = !1) {
	var r;
	E && (r = D, he());
	var i = new er(e), a = n ? S : 0;
	function o(e, t) {
		if (E) {
			var n = ye(r);
			if (e !== parseInt(n.substring(1))) {
				var a = ve();
				O(a), i.anchor = a, me(!1), i.ensure(e, t), me(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Xt(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function nr(e, t, n) {
	for (var r = [], i = t.length, o, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		nn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					rr(e, a(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			Lt(d), d.append(u), e.items.clear();
		}
		rr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function rr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ee, sn(a, document.createDocumentFragment())) : V(t[i], n);
	}
}
var ir;
function ar(e, t, r, i, o, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = E ? O(/* @__PURE__ */ Mt(u)) : u.appendChild(L());
	}
	E && he();
	var d = null, f = /* @__PURE__ */ Ze(() => {
		var e = r();
		return n(e) ? e : e == null ? [] : a(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, sr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ee, lr(d, null, c)) : an(d) : nn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Xt(() => {
			p = Z(f);
			var e = p.length;
			let n = !1;
			E && ye(c) === "[!" != (e === 0) && (c = ve(), O(c), me(!1), n = !0);
			for (var a = /* @__PURE__ */ new Set(), u = j, v = Rt(), y = 0; y < e; y += 1) {
				E && D.nodeType === 8 && D.data === "]" && (c = D, n = !0, me(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && St(S.v, b), S.i && St(S.i, y), v && u.unskip_effect(S.e)) : (S = cr(l, h ? c : ir ??= L(), b, x, y, o, t, r), h || (S.e.f |= ee), l.set(x, S)), a.add(x);
			}
			if (e === 0 && s && !d && (h ? d = B(() => s(c)) : (d = B(() => s(ir ??= L())), d.f |= ee)), e > a.size && we("", "", ""), E && e > 0 && O(ve()), !h) {
				if (m.set(u, a), v) {
					for (let [e, t] of l) a.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			n && me(!0), Z(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, E && (c = D);
}
function or(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function sr(e, t, n, r, i) {
	var o = !!(r & 8), s = t.length, c = e.items, l = or(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (an(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ee, _ === l) lr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ur(e, d, _), ur(e, _, y), lr(_, y, n), d = _, p = [], m = [], l = or(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) lr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					ur(e, S.prev, C.next), ur(e, d, S), ur(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), lr(_, l, n), ur(e, _.prev, _.next), ur(e, _, d === null ? e.effect.first : d.next), ur(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = or(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = or(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (rr(e, a(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = or(l.next);
		var T = w.length;
		if (T > 0) {
			var te = r & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.fix();
			}
			nr(e, w, te);
		}
	}
	o && Le(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function cr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? bt(n) : /* @__PURE__ */ xt(n, !1, !1) : null, l = o & 2 ? bt(i) : null;
	return {
		v: c,
		i: l,
		e: B(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function lr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Nt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function ur(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
[
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
].map(([e, t]) => ({
	background: e,
	foreground: t
}));
//#endregion
//#region packages/core/src/algorithms/date.ts
function $(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function dr(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function fr(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function pr(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function mr(e, t) {
	return pr(e, t * 7);
}
function hr(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function gr(e, t) {
	return e.getTime() < t.getTime();
}
function _r(e) {
	return dr(fr($(e)));
}
function vr(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region packages/core/src/algorithms/calendar.ts
var yr = class {
	normalizeTermStartDate(e, t) {
		let n = $(_r(t));
		if (!e || !e.trim()) return dr(fr(n));
		try {
			return dr(fr($(e)));
		} catch {
			return dr(fr(this.inferTermStartDateFromTermName(e) || n));
		}
	}
	inferTermStartDateFromTermName(e) {
		let t = /(20\d{2})\D+(20\d{2})[^\d]*([12])/.exec(e);
		if (!t) return null;
		let n = Number.parseInt(t[1] ?? "", 10), r = Number.parseInt(t[2] ?? "", 10), i = Number.parseInt(t[3] ?? "", 10);
		return Number.isNaN(n) || Number.isNaN(r) || Number.isNaN(i) ? null : i === 1 ? new Date(Date.UTC(n, 8, 1, 12)) : i === 2 ? new Date(Date.UTC(r, 2, 1, 12)) : null;
	}
	calculateAcademicWeek(e, t) {
		let n = t ?? {
			termStartDate: "",
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		}, r = $(this.normalizeTermStartDate(n.termStartDate, e)), i = $(e);
		if (gr(i, r)) return n.startWeek;
		let a = hr(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return dr(mr($(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return dr(pr($(this.resolveWeekStart(e, t, r)), n - 1));
	}
};
//#endregion
//#region packages/core/src/algorithms/holiday-calendar.ts
function br(e) {
	let { holidayCalendar: t, ...n } = e;
	return n;
}
async function xr(e) {
	let t = await e.listTimetables(), n = 0;
	for (let r of t) {
		let t = await e.getTimetable(r.id);
		if (!t?.academicConfig.holidayCalendar) continue;
		let i = {
			...t,
			academicConfig: br(t.academicConfig),
			updatedAt: Date.now()
		};
		await e.saveTimetable(i), n += 1;
	}
	return n;
}
function Sr(e, t = vr()) {
	let n = new yr(), r = $(n.resolveWeekStart(e, e.startWeek, t)), i = pr($(n.resolveWeekStart(e, e.endWeek, t)), 6);
	return {
		startDate: dr(r),
		endDate: dr(i)
	};
}
function Cr(e, t, n = vr()) {
	let { startDate: r, endDate: i } = Sr(t, n);
	return e.filter((e) => e.date >= r && e.date <= i);
}
function wr(e, t = vr()) {
	let { startDate: n, endDate: r } = Sr(e, t), i = Number.parseInt(n.slice(0, 4), 10), a = Number.parseInt(r.slice(0, 4), 10), o = /* @__PURE__ */ new Set();
	for (let e = i; e <= a; e += 1) o.add(e);
	return o.size === 0 && o.add(Number.parseInt(t.slice(0, 4), 10)), [...o].sort((e, t) => e - t);
}
//#endregion
//#region packages/core/src/types/services.ts
function Tr(e) {
	return { key: e };
}
var Er = Tr("http"), Dr = Tr("storage");
//#endregion
//#region packages/core/src/i18n/i18n-catalog.ts
function Or(e, t) {
	return t ? e.replace(/\{(\w+)\}/g, (e, n) => {
		let r = t[n];
		return r == null ? `{${n}}` : typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? String(r) : JSON.stringify(r);
	}) : e;
}
//#endregion
//#region packages/core/src/types/mountable.ts
var kr = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.on-surface,color.primary,color.on-primary,color.surface-variant,color.outline,color.secondary,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,color.outline-variant,color.surface-container-high,color.canvas,color.ink,color.border-subtle,color.success,color.warning,color.danger,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
//#endregion
//#region packages/core/src/plugin/define-chronos-plugin.ts
function Ar(e, t, n = "zh-cn") {
	return e[n]?.[t] ?? e.en?.[t] ?? t;
}
function jr() {
	return "0.4.8";
}
function Mr(e) {
	let t;
	return {
		id: e.id,
		name: () => t?.(e.nameKey) ?? Ar(e.messages, e.nameKey),
		version: e.version ?? jr(),
		description: e.descriptionKey ? () => t?.(e.descriptionKey) ?? Ar(e.messages, e.descriptionKey) : void 0,
		category: e.category,
		order: e.order,
		author: e.author,
		homepage: e.homepage,
		configSchema: e.configSchema,
		defaultConfig: e.defaultConfig,
		allowedDomains: e.allowedDomains,
		async apply(n) {
			n.i18n.registerMessages(e.messages);
			let r = (e, t) => n.i18n.t(e, t);
			t = r, await e.apply(n, r);
		},
		dispose: e.dispose
	};
}
//#endregion
//#region packages/ui-kit/src/schema-form/inputs/WallpaperPreviewField.svelte
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), Q(["input"]), Q(["change"]), Q(["change"]), Q(["change"]), Q(["click"]), Q(["change"]);
//#endregion
//#region packages/ui-kit/src/form/date-field-utils.ts
function Nr(e) {
	return e?.toLowerCase() === "en" ? "en" : "zh-CN";
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
Q(["click"]), Q(["click"]), Q(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function Pr(e) {
	return {
		[kr]: !0,
		mount(t, n) {
			let r = Yn(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				$n(r);
			} };
		}
	};
}
//#endregion
//#region packages/ui-kit/src/i18n/plugin-text.ts
function Fr(e, t, n, r, i) {
	let a = n["zh-cn"][r] ?? n.en?.[r] ?? String(r);
	if (!e) return Or(a, i);
	e.slotVersion;
	let o = e.translatePlugin(t, r, i);
	return o === r ? Or(a, i) : o;
}
//#endregion
//#region packages/plugins/calendar-holidays/src/messages.ts
var Ir = {
	"zh-cn": {
		"plugin.name": "法定节假日",
		"plugin.description": "在课表中展示法定节假日",
		"mine.title": "法定节假日",
		"mine.keywords": "节假日,假期,放假,国庆,春节,holiday",
		"screen.title": "法定节假日",
		"screen.intro.body": "安装后自动同步国务院公布的放假安排，并在课表标注。仅标记放假，不包含调休补班。",
		"screen.intro.source": "数据来源：holiday-cn",
		"screen.sync.action": "同步",
		"screen.sync.resync": "重新同步",
		"screen.sync.syncing": "同步中…",
		"screen.sync.last": "上次同步：{time}",
		"screen.sync.never": "尚未同步",
		"screen.list.row": "{date} · {label} · {weekday}",
		"screen.list.heading": "本学期假期",
		"screen.list.empty": "本学期暂无法定节假日",
		"screen.list.emptyHint": "同步后，课表将标注法定放假日",
		"screen.error.noTimetable": "请先选择或创建课表",
		"screen.error.syncFailed": "同步失败，请检查网络后重试",
		"screen.notify.synced": "法定节假日已同步"
	},
	en: {
		"plugin.name": "Public Holidays",
		"plugin.description": "Show public holidays on the timetable",
		"mine.title": "Public Holidays",
		"mine.keywords": "holiday,vacation,national day,spring festival",
		"screen.title": "Public Holidays",
		"screen.intro.body": "Automatically syncs official public holiday schedules on install and marks them on your timetable. Only rest days are marked; makeup workdays are excluded.",
		"screen.intro.source": "Data source: holiday-cn",
		"screen.sync.action": "Sync",
		"screen.sync.resync": "Resync",
		"screen.sync.syncing": "Syncing…",
		"screen.sync.last": "Last sync: {time}",
		"screen.sync.never": "Not synced yet",
		"screen.list.row": "{date} · {label} · {weekday}",
		"screen.list.heading": "Holidays this term",
		"screen.list.empty": "No public holidays in this term",
		"screen.list.emptyHint": "After syncing, holidays will appear on your timetable",
		"screen.error.noTimetable": "Select or create a timetable first",
		"screen.error.syncFailed": "Sync failed. Check your network and try again.",
		"screen.notify.synced": "Public holidays synced"
	}
}, Lr = "tool-calendar-holidays", Rr = "https://fastly.jsdelivr.net/gh/NateScarlet/holiday-cn@master", zr = {
	2025: {
		$schema: "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
		$id: "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2025.json",
		year: 2025,
		papers: ["https://www.gov.cn/zhengce/zhengceku/202411/content_6986383.htm"],
		days: [
			{
				name: "元旦",
				date: "2025-01-01",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-01-26",
				isOffDay: !1
			},
			{
				name: "春节",
				date: "2025-01-28",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-01-29",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-01-30",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-01-31",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-02-01",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-02-02",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-02-03",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-02-04",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2025-02-08",
				isOffDay: !1
			},
			{
				name: "清明节",
				date: "2025-04-04",
				isOffDay: !0
			},
			{
				name: "清明节",
				date: "2025-04-05",
				isOffDay: !0
			},
			{
				name: "清明节",
				date: "2025-04-06",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2025-04-27",
				isOffDay: !1
			},
			{
				name: "劳动节",
				date: "2025-05-01",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2025-05-02",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2025-05-03",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2025-05-04",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2025-05-05",
				isOffDay: !0
			},
			{
				name: "端午节",
				date: "2025-05-31",
				isOffDay: !0
			},
			{
				name: "端午节",
				date: "2025-06-01",
				isOffDay: !0
			},
			{
				name: "端午节",
				date: "2025-06-02",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-09-28",
				isOffDay: !1
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-01",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-02",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-03",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-04",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-05",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-06",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-07",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-08",
				isOffDay: !0
			},
			{
				name: "国庆节、中秋节",
				date: "2025-10-11",
				isOffDay: !1
			}
		]
	},
	2026: {
		$schema: "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
		$id: "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2026.json",
		year: 2026,
		papers: ["https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm"],
		days: [
			{
				name: "元旦",
				date: "2026-01-01",
				isOffDay: !0
			},
			{
				name: "元旦",
				date: "2026-01-02",
				isOffDay: !0
			},
			{
				name: "元旦",
				date: "2026-01-03",
				isOffDay: !0
			},
			{
				name: "元旦",
				date: "2026-01-04",
				isOffDay: !1
			},
			{
				name: "春节",
				date: "2026-02-14",
				isOffDay: !1
			},
			{
				name: "春节",
				date: "2026-02-15",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-16",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-17",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-18",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-19",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-20",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-21",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-22",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-23",
				isOffDay: !0
			},
			{
				name: "春节",
				date: "2026-02-28",
				isOffDay: !1
			},
			{
				name: "清明节",
				date: "2026-04-04",
				isOffDay: !0
			},
			{
				name: "清明节",
				date: "2026-04-05",
				isOffDay: !0
			},
			{
				name: "清明节",
				date: "2026-04-06",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2026-05-01",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2026-05-02",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2026-05-03",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2026-05-04",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2026-05-05",
				isOffDay: !0
			},
			{
				name: "劳动节",
				date: "2026-05-09",
				isOffDay: !1
			},
			{
				name: "端午节",
				date: "2026-06-19",
				isOffDay: !0
			},
			{
				name: "端午节",
				date: "2026-06-20",
				isOffDay: !0
			},
			{
				name: "端午节",
				date: "2026-06-21",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-09-20",
				isOffDay: !1
			},
			{
				name: "中秋节",
				date: "2026-09-25",
				isOffDay: !0
			},
			{
				name: "中秋节",
				date: "2026-09-26",
				isOffDay: !0
			},
			{
				name: "中秋节",
				date: "2026-09-27",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-01",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-02",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-03",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-04",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-05",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-06",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-07",
				isOffDay: !0
			},
			{
				name: "国庆节",
				date: "2026-10-10",
				isOffDay: !1
			}
		]
	},
	2027: {
		$schema: "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
		$id: "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2027.json",
		year: 2027,
		papers: [],
		days: []
	}
};
function Br(e) {
	return e.days.filter((e) => e.isOffDay).map((e) => ({
		date: e.date,
		label: e.name
	}));
}
async function Vr(e, t) {
	let n = `${Rr}/${t}.json`;
	try {
		let t = await e.request(n, {
			method: "GET",
			timeoutMs: 15e3
		});
		if (!t.ok) throw Error(`HTTP ${t.status}`);
		return await t.json();
	} catch (e) {
		return zr[t] || (console.warn(`[calendar-holidays] No holiday-cn data for ${t}`, e), null);
	}
}
async function Hr(e, t) {
	let n = (await Promise.all(t.map((t) => Vr(e, t)))).filter((e) => e !== null);
	if (n.length === 0) throw Error(`No holiday-cn data for years: ${t.join(", ")}`);
	let r = n.flatMap((e) => Br(e)), i = /* @__PURE__ */ new Map();
	for (let e of r) i.has(e.date) || i.set(e.date, e);
	return { holidays: [...i.values()].sort((e, t) => e.date.localeCompare(t.date)) };
}
//#endregion
//#region packages/plugins/calendar-holidays/src/holiday-sync.ts
var Ur = /* @__PURE__ */ new Map();
async function Wr(e) {
	return xr(e.service(Dr));
}
function Gr(e, t) {
	if (!e?.syncedAt || !e.syncedYears?.length) return !0;
	let n = new Set(e.syncedYears);
	return t.some((e) => !n.has(e));
}
async function Kr(e, t = {}) {
	let n = e.state.currentTimetable;
	if (!n) throw Error("No active timetable");
	let r = n.id, i = Ur.get(r);
	if (i) return i;
	let a = Jr(e, r, n.academicConfig, t).finally(() => {
		Ur.delete(r);
	});
	return Ur.set(r, a), a;
}
async function qr(e, t = {}) {
	return e.state.currentTimetable ? Kr(e, t) : !1;
}
async function Jr(e, t, n, r) {
	let i = wr(n), a = e.service(Dr), o = await a.getTimetable(t);
	if (!o) throw Error(`Timetable not found: ${t}`);
	if (!r.force && !Gr(o.academicConfig.holidayCalendar, i)) return !1;
	let { holidays: s } = await Hr(e.service(Er), i), c = {
		holidays: s,
		syncedAt: Date.now(),
		syncedYears: [...i]
	}, l = {
		...o.academicConfig,
		holidayCalendar: c
	};
	if (e.state.currentTimetable?.id === t) return await e.actions.saveCurrentTimetableDetails({ academicConfig: l }), !0;
	let u = {
		...o,
		academicConfig: l,
		updatedAt: Date.now()
	};
	return await a.saveTimetable(u), !0;
}
//#endregion
//#region packages/plugins/calendar-holidays/src/index.ts
function Yr(e = {}) {
	let { screenComponent: t } = e, n;
	return Mr({
		id: Lr,
		messages: Ir,
		nameKey: "plugin.name",
		descriptionKey: "plugin.description",
		category: "tool",
		order: 45,
		author: "Chronos",
		homepage: "https://github.com/NateScarlet/holiday-cn",
		allowedDomains: ["fastly.jsdelivr.net", "raw.githubusercontent.com"],
		async apply(e, r) {
			n = e;
			let i = r("mine.keywords").split(",").map((e) => e.trim()).filter(Boolean);
			e.registerSlot("mine.item", {
				id: "holiday-calendar",
				sectionId: "data-sync",
				title: () => r("mine.title"),
				href: `/plugins/${Lr}`,
				icon: "event",
				iconTone: "secondary",
				keywords: i,
				order: 25
			}), e.registerSlot("shell.route.screen", {
				id: Lr,
				title: () => r("screen.title"),
				...t ? { component: t } : {}
			});
			try {
				await qr(e);
			} catch {
				e.actions.notify(r("screen.error.syncFailed"), "warn");
			}
			e.on("timetable:switched", async () => {
				try {
					await qr(e);
				} catch {}
			});
		},
		async dispose() {
			let e = n;
			n = void 0, e && await Wr(e);
		}
	});
}
//#endregion
//#region packages/plugins/calendar-holidays/src/HolidayCalendarScreen.svelte
var Xr = /* @__PURE__ */ Bn("<p class=\"text-body-medium py-6 text-center text-on-surface-variant\"> </p>"), Zr = /* @__PURE__ */ Bn("<li class=\"py-3\"><span class=\"text-body-medium text-on-surface\"> </span></li>"), Qr = /* @__PURE__ */ Bn("<ul class=\"divide-y divide-outline/10\"></ul>"), $r = /* @__PURE__ */ Bn("<div class=\"mt-3 flex flex-col gap-4\"></div>"), ei = /* @__PURE__ */ Bn("<p class=\"text-body-small text-error\"> </p>"), ti = /* @__PURE__ */ Bn("<div class=\"flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4\"><section class=\"rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs\"><p class=\"text-body-medium text-on-surface-variant\"> </p> <button type=\"button\" class=\"text-label-large mt-4 w-full rounded-full bg-primary px-4 py-3 text-on-primary disabled:opacity-50\"> </button> <div class=\"mt-3 flex items-center justify-between gap-3\"><a class=\"text-body-small shrink-0 text-primary\" href=\"https://github.com/NateScarlet/holiday-cn\" target=\"_blank\" rel=\"noreferrer\"> </a> <p class=\"text-body-small text-right text-on-surface-variant\"> </p></div></section> <section class=\"rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs\"><h3 class=\"text-title-small text-on-surface\"> </h3> <!></section> <!></div>");
function ni(e, t) {
	je(t, !0);
	let n = /* @__PURE__ */ F(!1), r = /* @__PURE__ */ F(null), i = /* @__PURE__ */ Xe(() => t.controller.currentTimetable), a = /* @__PURE__ */ Xe(() => Z(i)?.academicConfig.holidayCalendar), o = /* @__PURE__ */ Xe(() => Z(i) && Z(a) ? Cr(Z(a).holidays, Z(i).academicConfig) : []), s = /* @__PURE__ */ Xe(() => u(Z(o))), c = /* @__PURE__ */ Xe(() => !!Z(a)?.syncedAt);
	function l(e) {
		return Fr(t.controller, Lr, Ir, e);
	}
	function u(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) {
			let e = n.date.slice(0, 7), r = t.get(e) ?? [];
			r.push(n), t.set(e, r);
		}
		return [...t.entries()].map(([e, t]) => ({
			key: e,
			items: t
		}));
	}
	function d(e, t) {
		let n = /* @__PURE__ */ new Date(`${e.date}T12:00:00`), r = n.toLocaleDateString(t, {
			month: "long",
			day: "numeric"
		}), i = n.toLocaleDateString(t, { weekday: "short" });
		return l("screen.list.row").replace("{date}", r).replace("{label}", e.label).replace("{weekday}", i);
	}
	function f(e) {
		if (!e) return l("screen.sync.never");
		let n = new Date(e);
		return l("screen.sync.last").replace("{time}", n.toLocaleString(Nr(t.controller.currentLocale), {
			month: "numeric",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		}));
	}
	async function p() {
		if (!Z(i)) {
			I(r, l("screen.error.noTimetable"), !0);
			return;
		}
		I(n, !0), I(r, null);
		try {
			let e = t.controller.getPluginContext(t.pluginId);
			await Kr(e, { force: !0 }), e.actions.notify(l("screen.notify.synced"), "info");
		} catch (e) {
			I(r, e instanceof Error ? e.message : l("screen.error.syncFailed"), !0);
		} finally {
			I(n, !1);
		}
	}
	var m = ti(), h = Pt(m), g = Pt(h), _ = Ft(g, !0), v = It(g, 2), y = Ft(v, !0), b = It(v, 2), x = Pt(b), S = Ft(x, !0), C = Ft(It(x, 2), !0);
	ge(b), ge(h);
	var w = It(h, 2), ee = Pt(w), T = Ft(ee, !0), te = It(ee, 2), ne = (e) => {
		var t = Xr(), n = Ft(t, !0);
		Yt((e) => Jn(n, e), [() => Z(a)?.holidays.length ? l("screen.list.empty") : l("screen.list.emptyHint")]), Vn(e, t);
	}, re = (e) => {
		var n = $r();
		ar(n, 21, () => Z(s), (e) => e.key, (e, n) => {
			var r = Qr();
			ar(r, 21, () => Z(n).items, (e) => e.date, (e, n) => {
				var r = Zr(), i = Ft(Pt(r), !0);
				ge(r), Yt((e) => Jn(i, e), [() => d(Z(n), t.controller.currentLocale)]), Vn(e, r);
			}), ge(r), Vn(e, r);
		}), ge(n), Vn(e, n);
	};
	tr(te, (e) => {
		Z(o).length === 0 ? e(ne) : e(re, -1);
	}), ge(w);
	var ie = It(w, 2), ae = (e) => {
		var t = ei(), n = Ft(t, !0);
		Yt(() => Jn(n, Z(r))), Vn(e, t);
	};
	tr(ie, (e) => {
		Z(r) && e(ae);
	}), ge(m), Yt((e, t, r, a, o) => {
		Jn(_, e), v.disabled = Z(n) || !Z(i), Jn(y, t), Jn(S, r), Jn(C, a), Jn(T, o);
	}, [
		() => l("screen.intro.body"),
		() => Z(n) ? l("screen.sync.syncing") : Z(c) ? l("screen.sync.resync") : l("screen.sync.action"),
		() => l("screen.intro.source"),
		() => f(Z(a)?.syncedAt),
		() => l("screen.list.heading")
	]), Mn("click", v, p), Vn(e, m), Me();
}
Q(["click"]);
//#endregion
//#region packages/plugins/calendar-holidays/bundle/entry.ts
var ri = Yr({ screenComponent: Pr(ni) });
//#endregion
export { ri as default };
