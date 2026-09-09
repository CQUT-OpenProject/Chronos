//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/constants.js
var e = Symbol("uninitialized"), t = "http://www.w3.org/1999/xhtml", n = Array.isArray, r = Array.prototype.indexOf, i = Array.prototype.includes, a = Array.from, o = Object.defineProperty, s = Object.getOwnPropertyDescriptor, c = Object.getOwnPropertyDescriptors, l = Object.prototype, u = Array.prototype, d = Object.getPrototypeOf, f = Object.isExtensible, p = () => {};
function m(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function h() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var g = 1024, _ = 2048, v = 4096, ee = 8192, te = 16384, ne = 32768, y = 1 << 25, re = 65536, b = 1 << 19, ie = 1 << 20, x = 65536, ae = 1 << 21, oe = 1 << 22, se = 1 << 23, ce = Symbol("$state"), le = Symbol("component"), ue = Symbol(""), de = Symbol("attributes"), fe = Symbol("class"), pe = Symbol("style"), me = Symbol("text"), he = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
function ge() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function _e() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function ve(e) {
	return e === this.v;
}
function ye(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function be(e) {
	return !ye(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function xe() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Se() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ce() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function we() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Te() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ee() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var S = null;
function C(e) {
	S = e;
}
function De(e, t = !1, n) {
	S = {
		p: S,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: null
	};
}
function Oe(e) {
	var t = S, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Nt(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, S = t.p, ke(e);
}
function ke(e = {}) {
	return o(e, le, { value: !0 }), e;
}
function Ae() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var w = [];
function je() {
	var e = w;
	w = [], m(e);
}
function Me(e) {
	if (w.length === 0 && !$e) {
		var t = w;
		queueMicrotask(() => {
			t === w && je();
		});
	}
	w.push(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/status.js
var Ne = ~(_ | v | g);
function T(e, t) {
	e.f = e.f & Ne | t;
}
function Pe(e) {
	e.f & 512 || e.deps === null ? T(e, g) : T(e, v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Fe(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= x, Fe(t.deps));
}
function Ie(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Fe(e.deps), T(e, g);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Le(e) {
	var t = B, n = U;
	H(null), W(null);
	try {
		return e();
	} finally {
		H(t), W(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function Re(e, t, n, r) {
	let i = Ae() ? He : Ge;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = U, c = ze(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				I(e, s);
			}
			Be();
		}
	}
	var d = Ve();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ We(e))).then(u).catch((e) => I(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), Be();
	}) : f();
}
function ze() {
	var e = U, t = B, n = S, r = O;
	return function(i = !0) {
		W(e), H(t), C(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Be(e = !0) {
	W(null), H(null), C(null), e && O?.deactivate();
}
function Ve() {
	var e = U, t = e.b, n = O, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function He(t) {
	var n = 2 | _;
	return U !== null && (U.f |= b), {
		ctx: S,
		deps: null,
		effects: null,
		equals: ve,
		f: n,
		fn: t,
		reactions: null,
		rv: 0,
		v: e,
		wv: 0,
		parent: U,
		ac: null
	};
}
var Ue = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function We(t, n, r) {
	let i = U;
	i === null && xe();
	var a = void 0, o = ft(e), s = !B, c = /* @__PURE__ */ new Set();
	return It(() => {
		var e = U, n = h();
		a = n.promise;
		try {
			Promise.resolve(t()).then(n.resolve, (e) => {
				e !== he && n.reject(e);
			}).finally(Be);
		} catch (e) {
			n.reject(e), Be();
		}
		var r = O;
		if (s) {
			if (e.f & 32768) var l = Ve();
			if (i.b?.is_rendered()) r.async_deriveds.get(e)?.reject(Ue);
			else for (let e of c.values()) e.reject(Ue);
			c.add(n), r.async_deriveds.set(e, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== Ue && (r.activate(), t ? (o.f |= se, pt(o, t)) : (o.f & 8388608 && (o.f ^= se), pt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Mt(() => {
		for (let e of c) e.reject(Ue);
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
function E(e) {
	let t = /* @__PURE__ */ He(e);
	return Qt(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function Ge(e) {
	let t = /* @__PURE__ */ He(e);
	return t.equals = be, t;
}
function Ke(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) R(t[n]);
	}
}
function qe(t) {
	var n, r = U, i = t.parent;
	if (!z && i !== null && t.v !== e && i.f & 24576) return ge(), t.v;
	W(i);
	try {
		t.f &= ~x, Ke(t), n = on(t);
	} finally {
		W(r);
	}
	return n;
}
function Je(e) {
	var t = qe(e);
	if (!e.equals(t) && (e.wv = nn(), (!O?.is_fork || e.deps === null) && (O === null ? e.v = t : (O.capture(e, t, !0), Ze?.capture(e, t, !0)), e.deps === null))) {
		T(e, g);
		return;
	}
	z || (k === null ? Pe(e) : (jt() || O?.is_fork) && k.set(e, t));
}
function Ye(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Le(() => {
		t.ac.abort(he), t.ac = null;
	}), t.fn !== null && (t.teardown = p), ln(t, 0), Ht(t));
}
function Xe(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Z(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var D = null, O = null, Ze = null, k = null, Qe = null, $e = !1, et = !1, A = null, tt = null, nt = 0, rt = 1, it = class t {
	id = rt++;
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
		D === null ? D = this : (D.#n = this, this.#t = D), D = this;
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
			for (var r of n.d) T(r, _), t(r);
			for (r of n.m) T(r, v), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, nt++ > 1e3 && (this.#x(), at());
		for (let e of this.#u) this.#d.delete(e), T(e, _), this.schedule(e);
		for (let e of this.#d) T(e, v), this.schedule(e);
		let e = this.#c;
		this.#c = [], this.apply();
		var n = A = [], r = [], i = tt = [];
		for (let t of e) try {
			this.#_(t, n, r);
		} catch (e) {
			throw lt(t), this.#h() || this.discard(), e;
		}
		if (O = null, i.length > 0) {
			var a = t.ensure();
			for (let e of i) a.schedule(e);
		}
		if (A = null, tt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) ct(e, t);
			i.length > 0 && O.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Ze = this, ot(r), ot(n), Ze = null, this.#s?.resolve();
		var s = O;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && (M.clear(), s.#g());
	}
	#_(e, t, n) {
		e.f ^= g;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= g : i & 4 ? t.push(r) : rn(r) && (i & 16 && this.#d.add(r), Z(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), T(i, _), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), O = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Ie(e[t], this.#u, this.#d);
	}
	capture(t, n, r = !1) {
		t.v !== e && !this.previous.has(t) && this.previous.set(t, t.v), t.f & 8388608 || (this.current.set(t, [n, r]), k?.set(t, n)), this.is_fork || (t.v = n);
	}
	activate() {
		O = this;
	}
	deactivate() {
		O = null, k = null;
	}
	flush() {
		try {
			et = !0, O = this, this.#g();
		} finally {
			nt = 0, Qe = null, A = null, tt = null, et = !1, O = null, k = null, M.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(Ue);
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
		this.#m || (this.#m = !0, Me(() => {
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
		return (this.#s ??= h()).promise;
	}
	static ensure() {
		if (O === null) {
			let e = O = new t();
			!et && Me(() => {
				e.#e || e.flush();
			});
		}
		return O;
	}
	apply() {
		k = null;
	}
	schedule(e) {
		if (Qe = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (A !== null && t === U && (B === null || !(B.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= g;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? D = e : t.#t = e, this.linked = !1;
		}
	}
};
function at() {
	try {
		Se();
	} catch (e) {
		I(e, Qe);
	}
}
var j = null;
function ot(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && rn(r) && (j = /* @__PURE__ */ new Set(), Z(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Gt(r), j?.size > 0)) {
				M.clear();
				for (let e of j) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) j.has(n) && (j.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Z(n);
					}
				}
				j.clear();
			}
		}
		j = null;
	}
}
function st(e) {
	O.schedule(e);
}
function ct(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), T(e, g);
		for (var n = e.first; n !== null;) ct(n, t), n = n.next;
	}
}
function lt(e) {
	T(e, g);
	for (var t = e.first; t !== null;) lt(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var ut = /* @__PURE__ */ new Set(), M = /* @__PURE__ */ new Map(), dt = !1;
function ft(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: ve,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function N(e, t) {
	let n = ft(e, t);
	return Qt(n), n;
}
function P(e, t, n = !1) {
	return B !== null && (!V || B.f & 131072) && Ae() && B.f & 4325394 && (G === null || !G.has(e)) && Te(), pt(e, n ? _t(t) : t, tt);
}
function pt(e, t, n = null) {
	if (!e.equals(t)) {
		z ? M.set(e, t) : M.has(e) || M.set(e, e.v);
		var r = it.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && qe(t), k === null && Pe(t);
		}
		e.wv = nn(), gt(e, _, n), Ae() && U !== null && U.f & 1024 && !(U.f & 96) && (J === null ? $t([e]) : J.push(e)), !r.is_fork && ut.size > 0 && !dt && mt();
	}
	return t;
}
function mt() {
	dt = !1;
	for (let e of ut) {
		e.f & 1024 && T(e, v);
		let t;
		try {
			t = rn(e);
		} catch {
			t = !0;
		}
		t && Z(e);
	}
	ut.clear();
}
function ht(e) {
	P(e, e.v + 1);
}
function gt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ae(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === U)) {
			var l = (c & _) === 0;
			if (l && T(s, t), c & 131072) ut.add(s);
			else if (c & 2) {
				var u = s;
				k?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= x), gt(u, v, n));
			} else if (l) {
				var d = s;
				c & 16 && j !== null && j.add(d), n === null ? st(d) : n.push(d);
			}
		}
	}
}
function _t(t) {
	if (typeof t != "object" || !t || ce in t || le in t) return t;
	let r = d(t);
	if (r !== l && r !== u) return t;
	var i = /* @__PURE__ */ new Map(), a = n(t), o = /* @__PURE__ */ N(0), c = null, f = X, p = (e) => {
		if (X === f) return e();
		var t = B, n = X;
		H(null), tn(f);
		var r = e();
		return H(t), tn(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ N(t.length, c)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Ce();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ N(n.value, c);
				return i.set(t, e), e;
			}) : P(r, n.value, !0), !0;
		},
		deleteProperty(t, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in t) {
					let t = p(() => /* @__PURE__ */ N(e, c));
					i.set(n, t), ht(o);
				}
			} else P(r, e), ht(o);
			return !0;
		},
		get(n, r, a) {
			if (r === ce) return t;
			var o = i.get(r), l = r in n;
			if (o === void 0 && (!l || s(n, r)?.writable) && (o = p(() => /* @__PURE__ */ N(_t(l ? n[r] : e), c)), i.set(r, o)), o !== void 0) {
				var u = Q(o);
				return u === e ? void 0 : u;
			}
			return Reflect.get(n, r, a);
		},
		getOwnPropertyDescriptor(t, n) {
			var r = Reflect.getOwnPropertyDescriptor(t, n);
			if (r && "value" in r) {
				var a = i.get(n);
				a && (r.value = Q(a));
			} else if (r === void 0) {
				var o = i.get(n), s = o?.v;
				if (o !== void 0 && s !== e) return {
					enumerable: !0,
					configurable: !0,
					value: s,
					writable: !0
				};
			}
			return r;
		},
		has(t, n) {
			if (n === ce) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== e || Reflect.has(t, n);
			return (r !== void 0 || U !== null && (!a || s(t, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ N(a ? _t(t[n]) : e, c)), i.set(n, r)), Q(r) === e) ? !1 : a;
		},
		set(t, n, r, l) {
			var u = i.get(n), d = n in t;
			if (a && n === "length") for (var f = r; f < u.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in t && (m = p(() => /* @__PURE__ */ N(e, c)), i.set(f + "", m)) : P(m, e);
			}
			if (u === void 0) (!d || s(t, n)?.writable) && (u = p(() => /* @__PURE__ */ N(void 0, c)), P(u, _t(r)), i.set(n, u));
			else {
				d = u.v !== e;
				var h = p(() => _t(r));
				P(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(t, n);
			if (g?.set && g.set.call(l, r), !d) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && P(_, v + 1);
				}
				ht(o);
			}
			return !0;
		},
		ownKeys(t) {
			Q(o);
			var n = Reflect.ownKeys(t).filter((t) => {
				var n = i.get(t);
				return n === void 0 || n.v !== e;
			});
			for (var [r, a] of i) a.v !== e && !(r in t) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			we();
		}
	});
}
var vt, yt, bt, xt;
function St() {
	if (vt === void 0) {
		vt = window, yt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		bt = s(t, "firstChild").get, xt = s(t, "nextSibling").get, f(e) && (e[fe] = void 0, e[de] = null, e[pe] = void 0, e.__e = void 0), f(n) && (n[me] = void 0);
	}
}
function Ct(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function wt(e) {
	return bt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Tt(e) {
	return xt.call(e);
}
function Et(e, t) {
	return /* @__PURE__ */ wt(e);
}
function Dt(e, t = !1) {
	return /* @__PURE__ */ wt(e);
}
function F(e, t = 1, n = !1) {
	let r = e;
	for (; t--;) r = /* @__PURE__ */ Tt(r);
	return r;
}
function Ot(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function kt(e) {
	var t = U;
	if (t === null) return B.f |= se, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	I(e, t);
}
function I(e, t) {
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
function At(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function L(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= ee);
	var r = {
		ctx: S,
		deps: null,
		nodes: null,
		f: e | _ | 512,
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
	O?.register_created_effect(r);
	var i = r;
	if (e & 4) A === null ? it.ensure().schedule(r) : A.push(r);
	else if (t !== null) {
		try {
			Z(r);
		} catch (e) {
			throw R(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= re));
	}
	if (i !== null && (i.parent = n, n !== null && At(i, n), B !== null && B.f & 2 && !(e & 64))) {
		var a = B;
		(a.effects ??= []).push(i);
	}
	return r;
}
function jt() {
	return B !== null && !V;
}
function Mt(e) {
	let t = L(8, null);
	return T(t, g), t.teardown = e, t;
}
function Nt(e) {
	return L(4 | ie, e);
}
function Pt(e) {
	it.ensure();
	let t = L(64 | b, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Kt(t, () => {
			R(t), n(void 0);
		}) : (R(t), n(void 0));
	});
}
function Ft(e) {
	return L(4, e);
}
function It(e) {
	return L(oe | b, e);
}
function Lt(e, t = 0) {
	return L(8 | t, e);
}
function Rt(e, t = [], n = [], r = []) {
	Re(r, t, n, (t) => {
		L(8, () => {
			e(...t.map(Q));
		});
	});
}
function zt(e, t = 0) {
	return L(16 | t, e);
}
function Bt(e) {
	return L(32 | b, e);
}
function Vt(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = z, r = B;
		Zt(!0), H(null);
		try {
			t.call(null);
		} catch (t) {
			I(t, e.parent);
		} finally {
			Zt(n), H(r);
		}
	}
}
function Ht(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Le(() => {
			e.abort(he);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : R(n, t), n = r;
	}
}
function Ut(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || R(t), t = n;
	}
}
function R(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Wt(e.nodes.start, e.nodes.end), n = !0), e.f |= y, Ht(e, t && !n), ln(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Vt(e), e.f ^= y, e.f |= te;
	var i = e.parent;
	i !== null && i.first !== null && Gt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Wt(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Tt(e);
		e.remove(), e = n;
	}
}
function Gt(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Kt(e, t, n = !0) {
	var r = [];
	e.f |= 256, qt(e, r, !0);
	var i = () => {
		n && R(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function qt(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= ee;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				qt(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Jt(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Tt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var Yt = null, Xt = !1, z = !1;
function Zt(e) {
	z = e;
}
var B = null, V = !1;
function H(e) {
	B = e;
}
var U = null;
function W(e) {
	U = e;
}
var G = null;
function Qt(e) {
	B !== null && (G ??= /* @__PURE__ */ new Set()).add(e);
}
var K = null, q = 0, J = null;
function $t(e) {
	J = e;
}
var en = 1, Y = 0, X = Y;
function tn(e) {
	X = e;
}
function nn() {
	return ++en;
}
function rn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~x), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (rn(a) && Je(a), a.wv > e.wv) return !0;
		}
		t & 512 && k === null && T(e, g);
	}
	return !1;
}
function an(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(G !== null && G.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? an(a, t, !1) : t === a && (n ? T(a, _) : a.f & 1024 && T(a, v), st(a));
	}
}
function on(e) {
	var t = K, n = q, r = J, i = B, a = G, o = S, s = V, c = X, l = e.f;
	K = null, q = 0, J = null, B = l & 96 ? null : e, G = null, C(e.ctx), V = !1, X = ++Y, e.ac !== null && (Le(() => {
		e.ac.abort(he);
	}), e.ac = null);
	try {
		e.f |= ae;
		var u = e.fn, d = u();
		e.f |= ne;
		var f = sn(e);
		if (Ae() && J !== null && !V && f !== null && !(e.f & 6146)) for (var p = 0; p < J.length; p++) an(J[p], e);
		if (i !== null && i !== e) {
			if (Y++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Y;
			if (t !== null) for (let e of t) e.rv = Y;
			J !== null && (r === null ? r = J : r.push(...J));
		}
		return e.f & 8388608 && (e.f ^= se), d;
	} catch (t) {
		return sn(e), kt(t);
	} finally {
		e.f ^= ae, K = t, q = n, J = r, B = i, G = a, C(o), V = s, X = c;
	}
}
function sn(e) {
	var t = e.deps, n = O?.is_fork;
	if (K !== null) {
		var r;
		if (n || ln(e, q), t !== null && q > 0) for (t.length = q + K.length, r = 0; r < K.length; r++) t[q + r] = K[r];
		else e.deps = t = K;
		if (jt() && e.f & 512) for (r = q; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && q < t.length && (ln(e, q), t.length = q);
	return t;
}
function cn(t, n) {
	let a = n.reactions;
	if (a !== null) {
		var o = r.call(a, t);
		if (o !== -1) {
			var s = a.length - 1;
			s === 0 ? a = n.reactions = null : (a[o] = a[s], a.pop());
		}
	}
	if (a === null && n.f & 2 && (K === null || !i.call(K, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~x), c.v !== e && Pe(c), c.ac !== null && Le(() => {
			c.ac.abort(he), c.ac = null, T(c, _);
		}), Ye(c), ln(c, 0);
	}
}
function ln(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) cn(e, n[r]);
}
function Z(e) {
	var t = e.f;
	if (!(t & 16384)) {
		T(e, g);
		var n = U, r = Xt;
		U = e, Xt = !(t & 96);
		try {
			t & 16777232 ? Ut(e) : Ht(e), Vt(e);
			var i = on(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = en;
		} finally {
			Xt = r, U = n;
		}
	}
}
function Q(e) {
	var t = !!(e.f & 2);
	if (Yt?.add(e), B !== null && !V && !(U !== null && U.f & 16384) && (G === null || !G.has(e))) {
		var n = B.deps;
		if (B.f & 2097152) e.rv < Y && (e.rv = Y, K === null && n !== null && n[q] === e ? q++ : K === null ? K = [e] : K.push(e));
		else {
			B.deps ??= [], i.call(B.deps, e) || B.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [B] : i.call(r, B) || r.push(B);
		}
	}
	if (z && M.has(e)) return M.get(e);
	if (t) {
		var a = e;
		if (z) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || dn(a)) && (o = qe(a)), M.set(a, o), o;
		}
		var s = !(a.f & 512) && !V && B !== null && (Xt || !!(B.f & 512)), c = (a.f & ne) === 0;
		rn(a) && (s && (a.f |= 512), Je(a)), s && !c && (Xe(a), un(a));
	}
	if (k?.has(e)) return k.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function un(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Xe(t), un(t));
}
function dn(t) {
	if (t.v === e) return !0;
	if (t.deps === null) return !1;
	for (let e of t.deps) if (M.has(e) || e.f & 2 && dn(e)) return !0;
	return !1;
}
function fn(e) {
	var t = V;
	try {
		return V = !0, e();
	} finally {
		V = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var pn = Symbol("events"), mn = /* @__PURE__ */ new Set(), hn = /* @__PURE__ */ new Set();
function gn(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || xn.call(t, e), !e.cancelBubble) return Le(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Me(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function _n(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = gn(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && Mt(() => {
		t.removeEventListener(e, o, a);
	});
}
function vn(e, t, n) {
	(t[pn] ??= {})[e] = n;
}
function $(e) {
	for (var t = 0; t < e.length; t++) mn.add(e[t]);
	for (var n of hn) n(e);
}
var yn = null, bn = !1;
function xn(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	yn = e, bn || (bn = !0, setTimeout(() => {
		bn = !1, yn = null;
	}));
	var s = 0, c = yn === e && e[pn];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[pn] = t;
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
		var d = B, f = U;
		H(null), W(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[pn]?.[r];
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
			e[pn] = t, delete e.currentTarget, H(d), W(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var Sn = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Cn(e) {
	return Sn?.createHTML(e) ?? e;
}
function wn(e) {
	var t = Ot("template");
	return t.innerHTML = Cn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function Tn(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function En(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		i === void 0 && (i = wn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ wt(i)));
		var t = r || yt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ wt(t), s = t.lastChild;
			Tn(o, s);
		} else Tn(t, t);
		return t;
	};
}
function Dn(e, t) {
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var On = ["touchstart", "touchmove"];
function kn(e) {
	return On.includes(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function An(e) {
	let t = 0, n = ft(0), r;
	return () => {
		jt() && (Q(n), Lt(() => (t === 0 && (r = fn(() => e(() => ht(n)))), t += 1, () => {
			Me(() => {
				--t, t === 0 && (r?.(), r = void 0, ht(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var jn = re | b;
function Mn(e, t, n, r) {
	new Nn(e, t, n, r);
}
var Nn = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t;
	#n;
	#r;
	#i = null;
	#a = null;
	#o = null;
	#s = null;
	#c = 0;
	#l = 0;
	#u = !1;
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Set();
	#p = null;
	#m = An(() => (this.#p = ft(this.#c), () => {
		this.#p = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#t = t, this.#n = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#r = zt(() => {
			this.#g();
		}, jn);
	}
	#h(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				_e();
				return;
			}
			t = !0, n && Ee(), this.#o !== null && Kt(this.#o, () => {
				this.#o = null;
			}), this.#v(() => {
				this.#g();
			});
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#t.onerror?.(e, r), n = !1;
				} catch (e) {
					I(e, this.#r && this.#r.parent);
				}
			}
		};
	}
	#g() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#l = 0, this.#c = 0, this.#i = Bt(() => {
				this.#n(this.#e);
			}), this.#l > 0) {
				var e = this.#s = document.createDocumentFragment();
				Jt(this.#i, e);
				let t = this.#t.pending;
				this.#a = Bt(() => t(this.#e));
			} else this.#_(O);
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		this.is_pending = !1, e.transfer_effects(this.#d, this.#f);
	}
	defer_effect(e) {
		Ie(e, this.#d, this.#f);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#t.pending;
	}
	#v(e) {
		var t = U, n = B, r = S;
		W(this.#r), H(this.#r), C(this.#r.ctx);
		try {
			return it.ensure(), e();
		} finally {
			W(t), H(n), C(r);
		}
	}
	#y(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#y(e, t);
			return;
		}
		this.#l += e, this.#l === 0 && (this.#_(t), this.#a && Kt(this.#a, () => {
			this.#a = null;
		}), this.#s &&= (this.#e.before(this.#s), null));
	}
	update_pending_count(e, t) {
		this.#y(e, t), this.#c += e, !(!this.#p || this.#u) && (this.#u = !0, Me(() => {
			this.#u = !1, this.#p && pt(this.#p, this.#c);
		}));
	}
	get_effect_pending() {
		return this.#m(), Q(this.#p);
	}
	error(e) {
		if (!this.#t.onerror && !this.#t.failed) throw e;
		O?.is_fork ? (this.#i && O.skip_effect(this.#i), this.#a && O.skip_effect(this.#a), this.#o && O.skip_effect(this.#o), O.oncommit(() => {
			this.#b(e);
		})) : this.#b(e);
	}
	#b(e) {
		this.#i &&= (R(this.#i), null), this.#a &&= (R(this.#a), null), this.#o &&= (R(this.#o), null);
		let t = this.#t.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#h(e);
			r(), t && (this.#o = this.#v(() => {
				try {
					return Bt(() => {
						var r = U;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return I(e, this.#r.parent), null;
				}
			}));
		};
		Me(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				I(e, this.#r && this.#r.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => I(e, this.#r && this.#r.parent)) : n(t);
		});
	}
};
function Pn(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[me] ??= e.nodeValue) && (e[me] = n, e.nodeValue = `${n}`);
}
function Fn(e, t) {
	return Ln(e, t);
}
var In = /* @__PURE__ */ new Map();
function Ln(e, { target: t, anchor: n, props: r = {}, events: i, context: o, intro: s = !0, transformError: c }) {
	St();
	var l = void 0, u = Pt(() => {
		var s = n ?? t.appendChild(Ct());
		Mn(s, { pending: () => {} }, (t) => {
			De({});
			var n = S;
			o && (n.c = o), i && (r.$$events = i), l = e(t, r) || ke(), Oe();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = kn(r);
					for (let e of [t, document]) {
						var a = In.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), In.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, xn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(a(mn)), hn.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = In.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, xn), r.delete(e), r.size === 0 && In.delete(n)) : r.set(e, i);
			}
			hn.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Rn.set(l, u), l;
}
var Rn = /* @__PURE__ */ new WeakMap();
function zn(e, t) {
	let n = Rn.get(e);
	return n ? (Rn.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var Bn = [..." 	\n\r\f\xA0\v﻿"];
function Vn(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Bn.includes(r[o - 1])) && (s === r.length || Bn.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function Hn(e, t, n, r, i, a) {
	var o = e[fe];
	if (o !== n || o === void 0) {
		var s = Vn(n, r, a);
		s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s), e[fe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Un = Symbol("is custom element"), Wn = Symbol("is html");
function Gn(e, t, n, r) {
	var i = Kn(e);
	i[t] !== (i[t] = n) && (t === "loading" && (e[ue] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Jn(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Kn(e) {
	return e[de] ??= {
		[Un]: e.nodeName.includes("-"),
		[Wn]: e.namespaceURI === t
	};
}
var qn = /* @__PURE__ */ new Map();
function Jn(e) {
	var t = e.getAttribute("is") || e.nodeName, n = qn.get(t);
	if (n) return n;
	qn.set(t, n = /* @__PURE__ */ new Set());
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = c(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.add(o);
		i = d(i);
	}
	return n;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Yn(e, t) {
	return e === t || e?.[ce] === t;
}
function Xn(e = ke(), t, n, r) {
	var i = S.r, a = U;
	return Ft(() => {
		var o, s;
		return Lt(() => {
			o = s, s = r?.() || [], fn(() => {
				Yn(n(...s), e) || (t(e, ...s), o && Yn(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Yn(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
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
var Zn = /\s+/g;
function Qn(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(Zn, " ");
}
//#endregion
//#region packages/core/src/domain/course.ts
function $n(e) {
	let t = e.name ? Qn(e.name) : "";
	return {
		teacher: "",
		location: "",
		weeks: [],
		remark: "",
		...e,
		name: t || e.name
	};
}
function er(e) {
	return {
		showSaturday: e.some((e) => e.dayOfWeek === 6),
		showSunday: e.some((e) => e.dayOfWeek === 7)
	};
}
var tr = "未命名课表";
function nr(e) {
	let t = e.trim();
	return t.length > 0 ? t : tr;
}
function rr(e) {
	if (!e) return;
	let t = e.source.trim() || "UNKNOWN", n = e.campusId?.trim();
	return n ? {
		source: t,
		campusId: n
	} : { source: t };
}
function ir(e) {
	let t = Date.now(), n = rr(e.importMetadata), r = e.courses ?? [];
	return {
		schemaVersion: e.schemaVersion ?? 1,
		id: e.id,
		name: nr(e.name),
		courses: r,
		academicConfig: {
			termStartDate: e.academicConfig?.termStartDate ?? "",
			startWeek: e.academicConfig?.startWeek ?? 1,
			endWeek: e.academicConfig?.endWeek ?? 20,
			periodTimes: e.academicConfig?.periodTimes ?? [],
			...e.academicConfig?.holidayCalendar ? { holidayCalendar: {
				...e.academicConfig.holidayCalendar,
				holidays: [...e.academicConfig.holidayCalendar.holidays]
			} } : {}
		},
		viewPrefs: {
			showSaturday: e.viewPrefs?.showSaturday ?? !0,
			showSunday: e.viewPrefs?.showSunday ?? !0,
			showNonCurrentWeekCourses: e.viewPrefs?.showNonCurrentWeekCourses ?? !1
		},
		createdAt: e.createdAt ?? t,
		updatedAt: e.updatedAt ?? t,
		...n ? { importMetadata: n } : {},
		...e.customMetadata ? { customMetadata: { ...e.customMetadata } } : {}
	};
}
//#endregion
//#region packages/core/src/domain/preferences.ts
var ar = {
	currentTimetableId: "chronos_preferences:current_timetable_id",
	themeMode: "chronos_preferences:theme_mode",
	timetableLayoutMode: "chronos_preferences:timetable_layout_mode",
	paletteMode: "chronos_preferences:palette_mode",
	capsuleCornerStyle: "chronos_preferences:capsule_corner_style",
	hapticFeedbackEnabled: "chronos_preferences:haptic_feedback_enabled",
	visualThemeId: "chronos_preferences:visual_theme_id",
	locale: "chronos_preferences:locale"
};
//#endregion
//#region packages/core/src/schema/schema-types.ts
function or(e) {
	return e;
}
//#endregion
//#region packages/core/src/i18n/i18n-catalog.ts
function sr(e, t) {
	return t ? e.replace(/\{(\w+)\}/g, (e, n) => {
		let r = t[n];
		return r == null ? `{${n}}` : typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? String(r) : JSON.stringify(r);
	}) : e;
}
//#endregion
//#region packages/core/src/types/slots.ts
var cr = class extends Error {
	kind;
	constructor(e, t) {
		super(t), this.name = "ImportSlotError", this.kind = e;
	}
}, lr = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.on-surface,color.primary,color.on-primary,color.surface-variant,color.outline,color.secondary,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,color.outline-variant,color.surface-container-high,color.canvas,color.ink,color.border-subtle,color.success,color.warning,color.danger,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
//#endregion
//#region packages/core/src/plugin/define-chronos-plugin.ts
function ur(e, t, n = "zh-cn") {
	return e[n]?.[t] ?? e.en?.[t] ?? t;
}
function dr() {
	return "0.5.2";
}
function fr(e) {
	let t;
	return {
		id: e.id,
		name: () => t?.(e.nameKey) ?? ur(e.messages, e.nameKey),
		version: e.version ?? dr(),
		description: e.descriptionKey ? () => t?.(e.descriptionKey) ?? ur(e.messages, e.descriptionKey) : void 0,
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
//#region packages/core/src/plugin/register-import-tab.ts
function pr(e, t) {
	return e.registerSlot("import.source.tab", t);
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), $(["input"]), $(["change"]), $(["change"]), $(["change"]), $(["click"]), $(["change"]), $(["click"]), $(["click"]), $(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function mr(e) {
	return {
		[lr]: !0,
		mount(t, n) {
			let r = Fn(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				zn(r);
			} };
		}
	};
}
//#endregion
//#region packages/ui-kit/src/i18n/plugin-text.ts
function hr(e, t, n, r, i) {
	let a = n["zh-cn"][r] ?? n.en?.[r] ?? String(r);
	if (!e) return sr(a, i);
	e.slotVersion;
	let o = e.translatePlugin(t, r, i);
	return o === r ? sr(a, i) : o;
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/import-tab-props.ts
async function gr(e, t, n, r) {
	let i = await e.previewWithSlot(t, n);
	return !i && e.state.errorMessage && r?.notify(e.state.errorMessage, "error"), i;
}
ar.hapticFeedbackEnabled;
//#endregion
//#region packages/codec-kit/src/deflate.ts
async function _r(e) {
	if (typeof CompressionStream > "u") {
		let t = await import(
			/* @vite-ignore */
			["node", "zlib"].join(":")
);
		return new Uint8Array(t.deflateRawSync(Buffer.from(e)));
	}
	let t = new ReadableStream({ start(t) {
		t.enqueue(e), t.close();
	} }).pipeThrough(new CompressionStream("deflate-raw"));
	return new Uint8Array(await new Response(t).arrayBuffer());
}
async function vr(e) {
	if (typeof DecompressionStream > "u") {
		let t = await import(
			/* @vite-ignore */
			["node", "zlib"].join(":")
);
		return new Uint8Array(t.inflateRawSync(Buffer.from(e)));
	}
	let t = new ReadableStream({ start(t) {
		t.enqueue(e), t.close();
	} }).pipeThrough(new DecompressionStream("deflate-raw"));
	return new Uint8Array(await new Response(t).arrayBuffer());
}
async function yr(e) {
	if (typeof CompressionStream > "u") {
		let t = await import(
			/* @vite-ignore */
			["node", "zlib"].join(":")
);
		return new Uint8Array(t.deflateSync(Buffer.from(e)));
	}
	let t = new ReadableStream({ start(t) {
		t.enqueue(e), t.close();
	} }).pipeThrough(new CompressionStream("deflate"));
	return new Uint8Array(await new Response(t).arrayBuffer());
}
//#endregion
//#region packages/codec-kit/src/base64.ts
var br = 8192;
function xr(e) {
	let t = "";
	for (let n = 0; n < e.length; n += br) t += String.fromCharCode(...e.subarray(n, n + br));
	return t;
}
function Sr(e) {
	let t = new Uint8Array(e.length);
	for (let n = 0; n < e.length; n += 1) t[n] = e.charCodeAt(n);
	return t;
}
function Cr(e) {
	return btoa(xr(e));
}
function wr(e) {
	return Sr(atob(e));
}
//#endregion
//#region packages/codec-kit/src/crc32.ts
var Tr = (() => {
	let e = /* @__PURE__ */ new Uint32Array(256);
	for (let t = 0; t < 256; t += 1) {
		let n = t;
		for (let e = 0; e < 8; e += 1) n = n & 1 ? n >>> 1 ^ 3988292384 : n >>> 1;
		e[t] = n >>> 0;
	}
	return e;
})();
function Er(e) {
	let t = 4294967295;
	for (let n of e) t = (Tr[(t ^ n) & 255] ^ t >>> 8) >>> 0;
	return (t ^ 4294967295) >>> 0;
}
function Dr(e) {
	let t = e.filter((e) => e < 1 || e > 32);
	if (t.length > 0) throw RangeError(`week out of range: ${t.join(", ")}`);
}
function Or(e) {
	Dr(e);
	let t = 0;
	for (let n of e) t |= 1 << n - 1;
	return t >>> 0;
}
function kr(e) {
	let t = [];
	for (let n = 1; n <= 32; n += 1) e & 1 << n - 1 && t.push(n);
	return t;
}
//#endregion
//#region packages/codec-kit/src/interner.ts
var Ar = class {
	strings = [];
	index = /* @__PURE__ */ new Map();
	maxEntries;
	constructor(e = {}) {
		this.maxEntries = e.maxEntries ?? Infinity, e.seed !== void 0 && this.intern(e.seed);
	}
	intern(e) {
		let t = e?.trim() ?? "";
		if (!t) return -1;
		let n = this.index.get(t);
		if (n !== void 0) return n;
		if (this.strings.length >= this.maxEntries) throw RangeError("string table overflow");
		let r = this.strings.length;
		return this.strings.push(t), this.index.set(t, r), r;
	}
}, jr = [
	{
		eccPerBlock: 7,
		blocks: [{
			count: 1,
			totalCodewords: 26,
			dataCodewords: 19
		}]
	},
	{
		eccPerBlock: 10,
		blocks: [{
			count: 1,
			totalCodewords: 44,
			dataCodewords: 34
		}]
	},
	{
		eccPerBlock: 15,
		blocks: [{
			count: 1,
			totalCodewords: 70,
			dataCodewords: 55
		}]
	},
	{
		eccPerBlock: 20,
		blocks: [{
			count: 1,
			totalCodewords: 100,
			dataCodewords: 80
		}]
	},
	{
		eccPerBlock: 26,
		blocks: [{
			count: 1,
			totalCodewords: 134,
			dataCodewords: 108
		}]
	},
	{
		eccPerBlock: 18,
		blocks: [{
			count: 2,
			totalCodewords: 86,
			dataCodewords: 68
		}]
	},
	{
		eccPerBlock: 20,
		blocks: [{
			count: 2,
			totalCodewords: 98,
			dataCodewords: 78
		}]
	},
	{
		eccPerBlock: 24,
		blocks: [{
			count: 2,
			totalCodewords: 121,
			dataCodewords: 97
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 2,
			totalCodewords: 146,
			dataCodewords: 116
		}]
	},
	{
		eccPerBlock: 18,
		blocks: [{
			count: 2,
			totalCodewords: 86,
			dataCodewords: 68
		}, {
			count: 2,
			totalCodewords: 87,
			dataCodewords: 69
		}]
	},
	{
		eccPerBlock: 20,
		blocks: [{
			count: 4,
			totalCodewords: 101,
			dataCodewords: 81
		}]
	},
	{
		eccPerBlock: 24,
		blocks: [{
			count: 2,
			totalCodewords: 116,
			dataCodewords: 92
		}, {
			count: 2,
			totalCodewords: 117,
			dataCodewords: 93
		}]
	},
	{
		eccPerBlock: 26,
		blocks: [{
			count: 4,
			totalCodewords: 133,
			dataCodewords: 107
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 3,
			totalCodewords: 145,
			dataCodewords: 115
		}, {
			count: 1,
			totalCodewords: 146,
			dataCodewords: 116
		}]
	},
	{
		eccPerBlock: 22,
		blocks: [{
			count: 5,
			totalCodewords: 109,
			dataCodewords: 87
		}, {
			count: 1,
			totalCodewords: 110,
			dataCodewords: 88
		}]
	},
	{
		eccPerBlock: 24,
		blocks: [{
			count: 5,
			totalCodewords: 122,
			dataCodewords: 98
		}, {
			count: 1,
			totalCodewords: 123,
			dataCodewords: 99
		}]
	},
	{
		eccPerBlock: 28,
		blocks: [{
			count: 1,
			totalCodewords: 135,
			dataCodewords: 107
		}, {
			count: 5,
			totalCodewords: 136,
			dataCodewords: 108
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 5,
			totalCodewords: 150,
			dataCodewords: 120
		}, {
			count: 1,
			totalCodewords: 151,
			dataCodewords: 121
		}]
	},
	{
		eccPerBlock: 28,
		blocks: [{
			count: 3,
			totalCodewords: 141,
			dataCodewords: 113
		}, {
			count: 4,
			totalCodewords: 142,
			dataCodewords: 114
		}]
	},
	{
		eccPerBlock: 28,
		blocks: [{
			count: 3,
			totalCodewords: 135,
			dataCodewords: 107
		}, {
			count: 5,
			totalCodewords: 136,
			dataCodewords: 108
		}]
	},
	{
		eccPerBlock: 28,
		blocks: [{
			count: 4,
			totalCodewords: 144,
			dataCodewords: 116
		}, {
			count: 4,
			totalCodewords: 145,
			dataCodewords: 117
		}]
	},
	{
		eccPerBlock: 28,
		blocks: [{
			count: 2,
			totalCodewords: 151,
			dataCodewords: 123
		}, {
			count: 7,
			totalCodewords: 152,
			dataCodewords: 124
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 4,
			totalCodewords: 147,
			dataCodewords: 117
		}, {
			count: 5,
			totalCodewords: 148,
			dataCodewords: 118
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 6,
			totalCodewords: 151,
			dataCodewords: 121
		}, {
			count: 4,
			totalCodewords: 152,
			dataCodewords: 122
		}]
	},
	{
		eccPerBlock: 26,
		blocks: [{
			count: 8,
			totalCodewords: 133,
			dataCodewords: 107
		}, {
			count: 4,
			totalCodewords: 134,
			dataCodewords: 108
		}]
	},
	{
		eccPerBlock: 28,
		blocks: [{
			count: 10,
			totalCodewords: 142,
			dataCodewords: 114
		}, {
			count: 2,
			totalCodewords: 143,
			dataCodewords: 115
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 8,
			totalCodewords: 152,
			dataCodewords: 122
		}, {
			count: 4,
			totalCodewords: 153,
			dataCodewords: 123
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 3,
			totalCodewords: 147,
			dataCodewords: 117
		}, {
			count: 10,
			totalCodewords: 148,
			dataCodewords: 118
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 7,
			totalCodewords: 146,
			dataCodewords: 116
		}, {
			count: 7,
			totalCodewords: 147,
			dataCodewords: 117
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 5,
			totalCodewords: 145,
			dataCodewords: 115
		}, {
			count: 10,
			totalCodewords: 146,
			dataCodewords: 116
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 13,
			totalCodewords: 145,
			dataCodewords: 115
		}, {
			count: 3,
			totalCodewords: 146,
			dataCodewords: 116
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 17,
			totalCodewords: 145,
			dataCodewords: 115
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 17,
			totalCodewords: 145,
			dataCodewords: 115
		}, {
			count: 1,
			totalCodewords: 146,
			dataCodewords: 116
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 13,
			totalCodewords: 145,
			dataCodewords: 115
		}, {
			count: 6,
			totalCodewords: 146,
			dataCodewords: 116
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 12,
			totalCodewords: 151,
			dataCodewords: 121
		}, {
			count: 7,
			totalCodewords: 152,
			dataCodewords: 122
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 6,
			totalCodewords: 151,
			dataCodewords: 121
		}, {
			count: 14,
			totalCodewords: 152,
			dataCodewords: 122
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 17,
			totalCodewords: 152,
			dataCodewords: 122
		}, {
			count: 4,
			totalCodewords: 153,
			dataCodewords: 123
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 4,
			totalCodewords: 152,
			dataCodewords: 122
		}, {
			count: 18,
			totalCodewords: 153,
			dataCodewords: 123
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 20,
			totalCodewords: 147,
			dataCodewords: 117
		}, {
			count: 4,
			totalCodewords: 148,
			dataCodewords: 118
		}]
	},
	{
		eccPerBlock: 30,
		blocks: [{
			count: 19,
			totalCodewords: 148,
			dataCodewords: 118
		}, {
			count: 6,
			totalCodewords: 149,
			dataCodewords: 119
		}]
	}
], Mr = /* @__PURE__ */ new Uint8Array(512), Nr = /* @__PURE__ */ new Uint8Array(256);
(() => {
	let e = 1;
	for (let t = 0; t < 255; t++) Mr[t] = e, Mr[t + 255] = e, Nr[e] = t, e <<= 1, e & 256 && (e ^= 285);
})();
function Pr(e, t) {
	return e === 0 || t === 0 ? 0 : Mr[Nr[e] + Nr[t]];
}
function Fr(e) {
	let t = new Uint8Array([1]);
	for (let n = 0; n < e; n++) {
		let e = new Uint8Array(t.length + 1);
		for (let r = 0; r < t.length; r++) e[r] ^= Pr(t[r], Mr[n]), e[r + 1] ^= t[r];
		t = e;
	}
	return t;
}
function Ir(e, t) {
	let n = Fr(t), r = new Uint8Array(t);
	for (let i = 0; i < e.length; i++) {
		let a = e[i] ^ r[0];
		for (let e = 0; e < t - 1; e++) r[e] = r[e + 1] ^ Pr(n[e + 1], a);
		r[t - 1] = Pr(n[t], a);
	}
	return r;
}
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-payload-encoder.ts
function Lr(e) {
	let t = jr[e - 1];
	if (!t) throw Error(`Unsupported QR version: ${e}`);
	return t;
}
function Rr(e) {
	for (let t = 1; t <= 40; t++) {
		let n = Lr(t).blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0);
		if (e + (t <= 9 ? 2 : 3) <= n) return t;
	}
	throw Error(`Data payload too large for QR Code (length: ${e}, max capacity: 2953 bytes)`);
}
function zr(e, t) {
	let n = new TextEncoder().encode(e), r = Lr(t), i = r.blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0), a = [];
	function o(e, t) {
		for (let n = t - 1; n >= 0; n--) a.push(e >> n & 1);
	}
	o(4, 4);
	let s = t <= 9 ? 8 : 16;
	o(n.length, s);
	for (let e of n) o(e, 8);
	let c = i * 8;
	for (o(0, Math.min(4, c - a.length)); a.length % 8 != 0;) a.push(0);
	let l = new Uint8Array(i);
	for (let e = 0; e < a.length / 8; e++) {
		let t = 0;
		for (let n = 0; n < 8; n++) t = t << 1 | a[e * 8 + n];
		l[e] = t;
	}
	let u = 236;
	for (let e = a.length / 8; e < i; e++) l[e] = u, u = u === 236 ? 17 : 236;
	let d = [], f = [], p = 0;
	for (let e of r.blocks) for (let t = 0; t < e.count; t++) {
		let t = l.subarray(p, p + e.dataCodewords);
		d.push(t), f.push(Ir(t, r.eccPerBlock)), p += e.dataCodewords;
	}
	let m = [], h = Math.max(...d.map((e) => e.length));
	for (let e = 0; e < h; e++) for (let t of d) e < t.length && m.push(t[e]);
	for (let e = 0; e < r.eccPerBlock; e++) for (let t of f) m.push(t[e]);
	return Uint8Array.from(m);
}
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-layout-tables.ts
var Br = [
	[],
	[6, 18],
	[6, 22],
	[6, 26],
	[6, 30],
	[6, 34],
	[
		6,
		22,
		38
	],
	[
		6,
		24,
		42
	],
	[
		6,
		26,
		46
	],
	[
		6,
		28,
		50
	],
	[
		6,
		30,
		54
	],
	[
		6,
		32,
		58
	],
	[
		6,
		34,
		62
	],
	[
		6,
		26,
		46,
		66
	],
	[
		6,
		26,
		48,
		70
	],
	[
		6,
		26,
		50,
		74
	],
	[
		6,
		30,
		54,
		78
	],
	[
		6,
		30,
		56,
		82
	],
	[
		6,
		30,
		58,
		86
	],
	[
		6,
		34,
		62,
		90
	],
	[
		6,
		28,
		50,
		72,
		94
	],
	[
		6,
		26,
		50,
		74,
		98
	],
	[
		6,
		30,
		54,
		78,
		102
	],
	[
		6,
		28,
		54,
		80,
		106
	],
	[
		6,
		32,
		58,
		84,
		110
	],
	[
		6,
		30,
		58,
		86,
		114
	],
	[
		6,
		34,
		62,
		90,
		118
	],
	[
		6,
		26,
		50,
		74,
		98,
		122
	],
	[
		6,
		30,
		54,
		78,
		102,
		126
	],
	[
		6,
		26,
		52,
		78,
		104,
		130
	],
	[
		6,
		30,
		56,
		82,
		108,
		134
	],
	[
		6,
		34,
		60,
		86,
		112,
		138
	],
	[
		6,
		30,
		58,
		86,
		114,
		142
	],
	[
		6,
		34,
		62,
		90,
		118,
		146
	],
	[
		6,
		30,
		54,
		78,
		102,
		126,
		150
	],
	[
		6,
		24,
		50,
		76,
		102,
		128,
		154
	],
	[
		6,
		28,
		54,
		80,
		106,
		132,
		158
	],
	[
		6,
		32,
		58,
		84,
		110,
		136,
		162
	],
	[
		6,
		26,
		54,
		82,
		110,
		138,
		166
	],
	[
		6,
		30,
		58,
		86,
		114,
		142,
		170
	]
], Vr = [
	31892,
	34236,
	39577,
	42195,
	48118,
	51042,
	55367,
	58893,
	63784,
	68472,
	70749,
	76311,
	79154,
	84390,
	87683,
	92361,
	96236,
	102084,
	102881,
	110507,
	110734,
	117786,
	119615,
	126325,
	127568,
	133589,
	136944,
	141498,
	145311,
	150283,
	152622,
	158308,
	161089,
	167017
], Hr = 9174;
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-matrix-layout.ts
function Ur(e, t, n, r, i) {
	function a(e, i, a, o = !0) {
		e >= 0 && e < t && i >= 0 && i < t && (n[e][i] = a, o && (r[e][i] = !0));
	}
	function o(e, n) {
		for (let r = -1; r <= 7; r++) for (let i = -1; i <= 7; i++) {
			let o = e + r, s = n + i;
			o < 0 || o >= t || s < 0 || s >= t || (r === -1 || r === 7 || i === -1 || i === 7 ? a(o, s, !1) : r === 0 || r === 6 || i === 0 || i === 6 || r >= 2 && r <= 4 && i >= 2 && i <= 4 ? a(o, s, !0) : a(o, s, !1));
		}
	}
	o(0, 0), o(0, t - 7), o(t - 7, 0);
	for (let e = 8; e < t - 8; e++) n[6][e] === null && a(6, e, e % 2 == 0), n[e][6] === null && a(e, 6, e % 2 == 0);
	let s = Br[e - 1] ?? [];
	for (let e of s) for (let t of s) if (!r[e][t]) for (let n = -2; n <= 2; n++) for (let r = -2; r <= 2; r++) {
		let i = Math.max(Math.abs(n), Math.abs(r)) !== 1;
		a(e + n, t + r, i);
	}
	a(t - 8, 8, !0);
	for (let e = 0; e < 9; e++) n[8][e] === null && a(8, e, !1, !0), n[e][8] === null && a(e, 8, !1, !0);
	for (let e = 0; e < 8; e++) n[8][t - 1 - e] === null && a(8, t - 1 - e, !1, !0), n[t - 1 - e][8] === null && a(t - 1 - e, 8, !1, !0);
	if (e >= 7) {
		let n = Vr[e - 7];
		for (let e = 0; e < 18; e++) {
			let r = (n >> e & 1) == 1, i = Math.floor(e / 3), o = e % 3 + t - 11;
			a(i, o, r), a(o, i, r);
		}
	}
	let c = 0, l = t - 1, u = -1;
	for (let e = t - 1; e > 0; e -= 2) for (e === 6 && e--;;) {
		for (let t = 0; t < 2; t++) {
			let a = e - t;
			if (!r[l][a]) {
				let e = Math.floor(c / 8), t = 7 - c % 8, r = e < i.length && (i[e] >> t & 1) == 1;
				n[l][a] = r, c++;
			}
		}
		if (l += u, l < 0 || l >= t) {
			u = -u, l += u;
			break;
		}
	}
	for (let e = 0; e < t; e++) for (let i = 0; i < t; i++) r[e][i] || (e + i) % 2 == 0 && (n[e][i] = !n[e][i]);
	let d = Hr;
	for (let e = 0; e < 15; e++) {
		let r = (d >> e & 1) == 1;
		e < 6 ? n[8][e] = r : e < 8 ? n[8][e + 1] = r : n[8][t - 15 + e] = r, e < 8 ? n[t - 1 - e][8] = r : n[14 - e][8] = r;
	}
}
function Wr(e, t) {
	let n = t * 4 + 17, r = Array.from({ length: n }, () => Array(n).fill(null));
	return Ur(t, n, r, Array.from({ length: n }, () => Array(n).fill(!1)), zr(e, t)), {
		size: n,
		modules: r.map((e) => e.map((e) => !!e))
	};
}
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-encode.ts
function Gr(e) {
	return Wr(e, Rr(new TextEncoder().encode(e).length));
}
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-png.ts
var Kr = new Uint8Array([
	137,
	80,
	78,
	71,
	13,
	10,
	26,
	10
]);
function qr(e, t, n) {
	e.setUint32(t, n, !1);
}
function Jr(e, t) {
	let n = new TextEncoder().encode(e), r = new Uint8Array(8 + t.length + 4), i = new DataView(r.buffer);
	qr(i, 0, t.length), r.set(n, 4), r.set(t, 8);
	let a = new Uint8Array(n.length + t.length);
	return a.set(n, 0), a.set(t, n.length), qr(i, 8 + t.length, Er(a)), r;
}
function Yr(e, t) {
	let n = new TextEncoder().encode(e), r = new TextEncoder().encode(t), i = new Uint8Array(n.length + 1 + r.length);
	return i.set(n, 0), i[n.length] = 0, i.set(r, n.length + 1), Jr("tEXt", i);
}
function Xr(e, t = {}) {
	let { margin: n = 2, size: r = 512 } = t, i = e.size + n * 2, a = Math.max(1, Math.floor(r / i)), o = i * a, s = i * a, c = new Uint8Array(o * s * 4);
	for (let t = 0; t < s; t++) {
		let r = Math.floor(t / a) - n;
		for (let i = 0; i < o; i++) {
			let s = Math.floor(i / a) - n, l = r >= 0 && r < e.size && s >= 0 && s < e.size && e.modules[r][s], u = (t * o + i) * 4, d = l ? 0 : 255;
			c[u] = d, c[u + 1] = d, c[u + 2] = d, c[u + 3] = 255;
		}
	}
	return {
		rgba: c,
		width: o,
		height: s
	};
}
async function Zr(e, t, n, r = {}) {
	let i = 1 + t * 4, a = new Uint8Array(n * i);
	for (let r = 0; r < n; r++) {
		let n = r * i;
		a[n] = 0, a.set(e.subarray(r * t * 4, (r + 1) * t * 4), n + 1);
	}
	let o = await yr(a), s = /* @__PURE__ */ new Uint8Array(13), c = new DataView(s.buffer);
	qr(c, 0, t), qr(c, 4, n), s[8] = 8, s[9] = 6, s[10] = 0, s[11] = 0, s[12] = 0;
	let l = [
		Kr,
		Jr("IHDR", s),
		Jr("IDAT", o),
		...r.metadata ? [Yr("chronos-qr", r.metadata)] : [],
		Jr("IEND", /* @__PURE__ */ new Uint8Array())
	], u = l.reduce((e, t) => e + t.length, 0), d = new Uint8Array(u), f = 0;
	for (let e of l) d.set(e, f), f += e.length;
	return d;
}
async function Qr(e, t = {}) {
	let { rgba: n, width: r, height: i } = Xr(Gr(e), t);
	return Zr(n, r, i, { metadata: e });
}
function $r(e, t) {
	return e[t] << 24 | e[t + 1] << 16 | e[t + 2] << 8 | e[t + 3];
}
function ei(e) {
	return e.length >= 8 && e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71;
}
function ti(e) {
	if (!ei(e)) return null;
	let t = 8;
	for (; t + 12 <= e.length;) {
		let n = $r(e, t), r = String.fromCharCode(e[t + 4], e[t + 5], e[t + 6], e[t + 7]), i = t + 8, a = i + n;
		if (a > e.length) break;
		if (r === "tEXt") {
			let t = e.subarray(i, a), n = t.indexOf(0);
			if (n > 0) {
				let e = new TextDecoder().decode(t.subarray(0, n)), r = new TextDecoder().decode(t.subarray(n + 1));
				if (e === "chronos-qr" && r.startsWith("chronos-qr:")) return r;
			}
		}
		t = a + 4;
	}
	return null;
}
async function ni(e, t) {
	if (typeof window > "u") throw Error(t("decode.browserOnly"));
	let n = new Uint8Array(await e.arrayBuffer()), r = ti(n);
	if (r) return r;
	try {
		let e = new TextDecoder().decode(n), t = /chronos-qr:[A-Za-z0-9+/=:_-]+/.exec(e);
		if (t) return t[0];
	} catch {}
	let i = URL.createObjectURL(e), a = document.createElement("canvas"), o = a.getContext("2d");
	try {
		let e = new Image();
		await new Promise((n, r) => {
			e.onload = () => n(), e.onerror = () => r(Error(t("decode.unreadableImage"))), e.src = i;
		});
		let n = e.naturalWidth || e.width || 512, r = e.naturalHeight || e.height || 512;
		if (a.width = n, a.height = r, o?.drawImage(e, 0, 0, n, r), window.BarcodeDetector) try {
			let e = await new window.BarcodeDetector({ formats: ["qr_code"] }).detect(a);
			if (e.length > 0 && e[0]?.rawValue) return e[0].rawValue;
		} catch (e) {
			console.warn("[BarcodeDetector] detect failed on canvas:", e);
		}
	} finally {
		URL.revokeObjectURL(i);
	}
	throw Error(t("decode.noQrFound"));
}
//#endregion
//#region packages/plugins/codec-qrcode/src/messages.ts
function ri(e) {
	return or({ content: {
		type: "string",
		title: () => e("import.field.content.title"),
		placeholder: () => e("import.field.content.placeholder"),
		required: !0
	} });
}
var ii = {
	"zh-cn": {
		"plugin.name": "二维码",
		"plugin.description": "通过二维码导入/导出课表",
		"import.tab.title": "二维码",
		"import.tab.badge": "图片",
		"import.tab.supporting": "选择或扫描导出为二维码图片进行导入",
		"import.field.content.title": "二维码内容",
		"import.field.content.placeholder": "二维码识别出的数据内容",
		"import.error.empty": "未识别到有效的二维码内容",
		"import.error.corrupt": "二维码数据格式损坏或无法解析为课表",
		"import.error.decodeFailed": "二维码识别失败",
		"import.ui.title": "二维码",
		"import.ui.subtitle": "选择或拖入他人分享的导出为二维码图片",
		"import.ui.dropLabel": "点击选择二维码图片",
		"import.ui.formats": "支持 PNG、JPEG、WebP 或 SVG 格式",
		"import.ui.select": "选择图片",
		"import.ui.scanning": "识别中…",
		"import.ui.dropAria": "二维码图片上传区域",
		"export.action.title": "二维码",
		"export.action.description": "生成分享二维码 PNG 图片并保存",
		"export.error.noTimetable": "无可导出的课表",
		"export.success": "已生成并下载导出为二维码",
		"timetable.unnamedCourse": "未命名课程",
		"timetable.defaultName": "二维码导入课表",
		"decode.browserOnly": "二维码解码仅支持在浏览器环境中运行",
		"decode.unreadableImage": "无法读取图片内容",
		"decode.noQrFound": "未能从该图片中识别出有效的二维码或当前浏览器不支持原生扫码识别"
	},
	en: {
		"plugin.name": "QR Code",
		"plugin.description": "Import and export timetables via QR codes",
		"import.tab.title": "QR code",
		"import.tab.badge": "Image",
		"import.tab.supporting": "Select or scan a timetable QR code image to import",
		"import.field.content.title": "QR content",
		"import.field.content.placeholder": "Decoded QR payload",
		"import.error.empty": "No valid QR content was recognized",
		"import.error.corrupt": "QR data is corrupted or cannot be parsed as a timetable",
		"import.error.decodeFailed": "Failed to decode QR code",
		"import.ui.title": "QR code",
		"import.ui.subtitle": "Select or drop a shared timetable QR image",
		"import.ui.dropLabel": "Choose a QR image",
		"import.ui.formats": "PNG, JPEG, WebP, or SVG",
		"import.ui.select": "Choose image",
		"import.ui.scanning": "Scanning…",
		"import.ui.dropAria": "QR image upload area",
		"export.action.title": "QR code",
		"export.action.description": "Generate a shareable QR PNG image and download",
		"export.error.noTimetable": "No timetable to export",
		"export.success": "Timetable QR code downloaded",
		"timetable.unnamedCourse": "Untitled course",
		"timetable.defaultName": "Imported timetable (QR)",
		"decode.browserOnly": "QR decoding is only available in the browser",
		"decode.unreadableImage": "Could not read image contents",
		"decode.noQrFound": "No valid QR code was found in this image, or the browser does not support native scanning"
	}
};
function ai(e) {
	return ii[e.toLowerCase() === "en" ? "en" : "zh-cn"];
}
//#endregion
//#region packages/plugins/codec-qrcode/src/QrCodeImportTab.svelte
var oi = /* @__PURE__ */ En("<div class=\"rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs\"><div class=\"flex flex-col gap-4\"><div><h2 class=\"text-title-medium text-on-surface\"> </h2> <p class=\"text-body-small mt-0.5 text-on-surface-variant\"> </p></div> <input type=\"file\" accept=\"image/*,.svg\" class=\"hidden\"/> <div role=\"region\"><svg class=\"size-10 text-on-surface-variant/80\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><path d=\"M14 14h3v3h-3z\"></path><path d=\"M20 14v3h-3\"></path><path d=\"M14 20h7\"></path></svg> <div class=\"flex flex-col gap-1\"><span class=\"text-body-medium font-medium text-on-surface\"> </span> <span class=\"text-body-small text-on-surface-variant\"> </span></div> <button type=\"button\" class=\"text-label-large mt-1 rounded-full bg-primary px-6 py-2.5 font-medium text-on-primary disabled:opacity-50\"> </button></div></div></div>");
function si(e, t) {
	De(t, !0);
	let n = /* @__PURE__ */ N(!1), r = /* @__PURE__ */ N(null), i = /* @__PURE__ */ N(!1);
	function a(e) {
		return hr(t.controller, "tool-qrcode", ii, e);
	}
	let o = /* @__PURE__ */ E(() => a("import.ui.title")), s = /* @__PURE__ */ E(() => a("import.ui.subtitle")), c = /* @__PURE__ */ E(() => a("import.ui.dropLabel")), l = /* @__PURE__ */ E(() => a("import.ui.formats")), u = /* @__PURE__ */ E(() => a("import.ui.select")), d = /* @__PURE__ */ E(() => a("import.ui.scanning")), f = /* @__PURE__ */ E(() => a("import.ui.dropAria"));
	async function p(e) {
		P(n, !0);
		try {
			let n = await ni(e, (e) => a(e));
			await gr(t.transfer, "qrcode", { content: n }, t.controller) && t.onContinue();
		} catch (e) {
			let n = e instanceof Error ? e.message : a("import.error.decodeFailed");
			t.controller?.notify(n, "error");
		} finally {
			P(n, !1);
		}
	}
	async function m(e) {
		let t = e.target, n = t.files?.[0];
		n && (await p(n), t.value = "");
	}
	async function h(e) {
		e.preventDefault(), P(i, !1);
		let t = e.dataTransfer?.files?.[0];
		t && await p(t);
	}
	var g = oi(), _ = Et(Et(g)), v = Et(_), ee = Dt(v, !0), te = Dt(F(v, 2), !0), ne = F(_, 2);
	Xn(ne, (e) => P(r, e), () => Q(r));
	var y = F(ne, 2), re = F(Et(y), 2), b = Et(re), ie = Dt(b, !0), x = Dt(F(b, 2), !0), ae = F(re, 2), oe = Dt(ae, !0);
	Rt(() => {
		Pn(ee, Q(o)), Pn(te, Q(s)), Hn(y, 1, `flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${Q(i) ? "border-primary bg-primary/5" : "border-outline/40 bg-surface-variant/20"}`), Gn(y, "aria-label", Q(f)), Pn(ie, Q(c)), Pn(x, Q(l)), ae.disabled = Q(n), Pn(oe, Q(n) ? Q(d) : Q(u));
	}), vn("change", ne, m), _n("dragover", y, (e) => {
		e.preventDefault(), P(i, !0);
	}), _n("dragleave", y, () => P(i, !1)), _n("drop", y, h), vn("click", ae, () => Q(r)?.click()), Dn(e, g), Oe();
}
$(["change", "click"]);
//#endregion
//#region packages/plugins/codec-qrcode/src/index.ts
var ci = "chronos-qr:v1:";
async function li(e) {
	let t = new Ar(), n = e.courses.map((e) => {
		let n = t.intern(e.name), r = t.intern(e.teacher), i = t.intern(e.location), a = t.intern(e.remark), o = Or(e.weeks), s = [
			n,
			r,
			i,
			e.dayOfWeek,
			e.startPeriod,
			e.endPeriod,
			o
		];
		return a >= 0 && s.push(a), s;
	}), r = {
		v: 2,
		n: e.name,
		s: t.strings,
		c: n
	};
	e.academicConfig?.termStartDate && (r.d = e.academicConfig.termStartDate), (e.academicConfig?.startWeek !== void 0 || e.academicConfig?.endWeek !== void 0) && (r.w = [e.academicConfig.startWeek ?? 1, e.academicConfig.endWeek ?? 20]), e.academicConfig?.periodTimes?.length && (r.p = e.academicConfig.periodTimes.map((e) => [
		e.index,
		e.startTime,
		e.endTime
	]));
	let i = JSON.stringify(r);
	return `${ci}${Cr(await _r(new TextEncoder().encode(i)))}`;
}
async function ui(e, t = ai("zh-cn")) {
	let n = e.trim();
	if (!n.startsWith("chronos-qr:v1:")) throw new cr("invalid-data", t["import.error.corrupt"]);
	try {
		let e = await vr(wr(n.slice(14))), r = new TextDecoder().decode(e), i = JSON.parse(r), a = i.s ?? [], o = (i.c ?? []).map((e, n) => {
			let r = (e[0] >= 0 ? a[e[0]] : null) ?? t["timetable.unnamedCourse"], i = (e[1] >= 0 ? a[e[1]] : null) ?? "", o = (e[2] >= 0 ? a[e[2]] : null) ?? "", s = e[3] ?? 1, c = e[4] ?? 1, l = e[5] ?? 1, u = kr(e[6] ?? 1), d = u.length > 0 ? u : [1], f = e[7] !== void 0 && e[7] >= 0 ? a[e[7]] : void 0;
			return $n({
				id: `c-qr-${n + 1}-${Date.now().toString(36)}`,
				name: r,
				teacher: i,
				location: o,
				dayOfWeek: s,
				startPeriod: c,
				endPeriod: l,
				weeks: d,
				remark: f
			});
		});
		return ir({
			id: `t-qr-${Date.now().toString(36)}`,
			name: i.n || t["timetable.defaultName"],
			academicConfig: {
				termStartDate: i.d ?? "",
				startWeek: i.w?.[0] ?? 1,
				endWeek: i.w?.[1] ?? 20,
				periodTimes: (i.p ?? []).map((e) => ({
					index: e[0],
					startTime: e[1],
					endTime: e[2]
				}))
			},
			viewPrefs: {
				...er(o),
				showNonCurrentWeekCourses: !1
			},
			courses: o
		});
	} catch (e) {
		throw e instanceof cr ? e : new cr("invalid-data", t["import.error.corrupt"]);
	}
}
function di(e = {}) {
	let { importComponent: t = mr(si) } = e;
	return fr({
		id: "tool-qrcode",
		messages: ii,
		nameKey: "plugin.name",
		descriptionKey: "plugin.description",
		category: "tool",
		order: 35,
		author: "CQUT OpenProject",
		homepage: "https://github.com/CQUT-OpenProject/Chronos",
		async apply(e, n) {
			let r = ri(n);
			pr(e, {
				id: "qrcode",
				title: () => n("import.tab.title"),
				order: 25,
				importKind: "file",
				badge: () => n("import.tab.badge"),
				supportingText: () => n("import.tab.supporting"),
				component: t,
				inputSchema: r,
				async executeImport(t) {
					let r = ai(e.i18n.locale), i = t.content;
					if (!i?.trim()) throw new cr("no-data", n("import.error.empty"));
					return ui(i, r);
				}
			}), e.registerSlot("export.action", {
				id: "qrcode",
				title: () => n("export.action.title"),
				order: 20,
				disposition: "download",
				isPrimary: !1,
				description: () => n("export.action.description"),
				async export(e, t) {
					let r = e ?? t?.state.currentTimetable;
					if (!r) throw Error(n("export.error.noTimetable"));
					let i = await Qr(await li(r), { margin: 2 });
					return {
						filename: `${(r.name || "timetable").replace(/[/\\?%*:|"<>]/g, "_")}-qrcode.png`,
						mimeType: "image/png",
						content: i,
						disposition: "download",
						successMessage: () => n("export.success")
					};
				}
			});
		}
	});
}
di();
//#endregion
//#region packages/plugins/codec-qrcode/bundle/entry.ts
var fi = di({ importComponent: mr(si) });
//#endregion
export { fi as default };
