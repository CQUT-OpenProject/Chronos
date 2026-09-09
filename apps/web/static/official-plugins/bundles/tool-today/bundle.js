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
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/constants.js
var h = 1 << 24, g = 1024, _ = 2048, v = 4096, y = 8192, b = 16384, x = 32768, S = 1 << 25, ee = 65536, C = 1 << 19, te = 1 << 20, ne = 1 << 25, re = 65536, ie = 1 << 21, ae = 1 << 22, oe = 1 << 23, se = Symbol("$state"), ce = Symbol("component"), le = Symbol("legacy props"), ue = Symbol("attributes"), de = Symbol("class"), fe = Symbol("style"), pe = Symbol("text"), me = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
function he() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function ge(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function _e() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/hydration.js
var w = !1;
function ve(e) {
	w = e;
}
var T;
function E(t) {
	if (t === null) throw ge(), e;
	return T = t;
}
function ye() {
	return E(/* @__PURE__ */ qt(T));
}
function D(t) {
	if (w) {
		if (/* @__PURE__ */ qt(T) !== null) throw ge(), e;
		T = t;
	}
}
function be(e = 1) {
	if (w) {
		for (var t = e, n = T; t--;) n = /* @__PURE__ */ qt(n);
		T = n;
	}
}
function xe(e = !0) {
	for (var t = 0, n = T;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ qt(n);
		e && n.remove(), n = i;
	}
}
function Se(t) {
	if (!t || t.nodeType !== 8) throw ge(), e;
	return t.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function Ce(e) {
	return e === this.v;
}
function we(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Te(e) {
	return !we(e, this.v);
}
function Ee(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function De() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Oe(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ke(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function Ae() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function je(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Me() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ne(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Pe() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Fe() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ie() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Le() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/context.js
function Re(e) {
	let t = e.p;
	for (; t !== null && t.c === null;) t = t.p;
	return t?.c ?? null;
}
function ze(e, t) {
	return e === null && Ee(t), e.c ??= new Map(Re(e) || void 0);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var O = null;
function Be(e) {
	O = e;
}
function Ve(e) {
	return ze(O, "getContext").get(e);
}
function He(e, t = !1, n) {
	O = {
		p: O,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: G,
		l: null
	};
}
function Ue(e) {
	var t = O, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) cn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, O = t.p, We(e);
}
function We(e = {}) {
	return o(e, ce, { value: !0 }), e;
}
function Ge() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var Ke = [];
function qe() {
	var e = Ke;
	Ke = [], p(e);
}
function Je(e) {
	if (Ke.length === 0 && !vt) {
		var t = Ke;
		queueMicrotask(() => {
			t === Ke && qe();
		});
	}
	Ke.push(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/status.js
var Ye = ~(_ | v | g);
function k(e, t) {
	e.f = e.f & Ye | t;
}
function Xe(e) {
	e.f & 512 || e.deps === null ? k(e, g) : k(e, v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Ze(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= re, Ze(t.deps));
}
function Qe(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Ze(e.deps), k(e, g);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/store.js
var $e = !1;
function et(e) {
	var t = $e;
	try {
		return $e = !1, [e(), $e];
	} finally {
		$e = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function tt(e) {
	var t = H, n = G;
	W(null), kn(null);
	try {
		return e();
	} finally {
		W(t), kn(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function nt(e, t, n, r) {
	let i = Ge() ? ot : lt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = G, c = rt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				en(e, s);
			}
			it();
		}
	}
	var d = at();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ ct(e))).then(u).catch((e) => en(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), it();
	}) : f();
}
function rt() {
	var e = G, t = H, n = O, r = j;
	return function(i = !0) {
		kn(e), W(t), Be(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function it(e = !0) {
	kn(null), W(null), Be(null), e && j?.deactivate();
}
function at() {
	var e = G, t = e.b, n = j, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ot(e) {
	var n = 2 | _;
	return G !== null && (G.f |= C), {
		ctx: O,
		deps: null,
		effects: null,
		equals: Ce,
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
var st = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function ct(e, n, r) {
	let i = G;
	i === null && De();
	var a = void 0, o = Pt(t), s = !H, c = /* @__PURE__ */ new Set();
	return dn(() => {
		var t = G, n = m();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== me && n.reject(e);
			}).finally(it);
		} catch (e) {
			n.reject(e), it();
		}
		var r = j;
		if (s) {
			if (t.f & 32768) var l = at();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(st);
			else for (let e of c.values()) e.reject(st);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== st && (r.activate(), t ? (o.f |= oe, It(o, t)) : (o.f & 8388608 && (o.f ^= oe), It(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), on(() => {
		for (let e of c) e.reject(st);
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
function A(e) {
	let t = /* @__PURE__ */ ot(e);
	return jn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function lt(e) {
	let t = /* @__PURE__ */ ot(e);
	return t.equals = Te, t;
}
function ut(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) V(t[n]);
	}
}
function dt(e) {
	var n, r = G, i = e.parent;
	if (!Dn && i !== null && e.v !== t && i.f & 24576) return he(), e.v;
	kn(i);
	try {
		e.f &= ~re, ut(e), n = Bn(e);
	} finally {
		kn(r);
	}
	return n;
}
function ft(e) {
	var t = dt(e);
	if (!e.equals(t) && (e.wv = Ln(), (!j?.is_fork || e.deps === null) && (j === null ? e.v = t : (j.capture(e, t, !0), gt?.capture(e, t, !0)), e.deps === null))) {
		k(e, g);
		return;
	}
	Dn || (M === null ? Xe(e) : (an() || j?.is_fork) && M.set(e, t));
}
function pt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && tt(() => {
		t.ac.abort(me), t.ac = null;
	}), t.fn !== null && (t.teardown = f), Un(t, 0), gn(t));
}
function mt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Wn(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var ht = null, j = null, gt = null, M = null, _t = null, vt = !1, yt = !1, bt = null, xt = null, St = 0, Ct = 1, wt = class e {
	id = Ct++;
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
		ht === null ? ht = this : (ht.#n = this, this.#t = ht), ht = this;
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
			for (var r of n.d) k(r, _), t(r);
			for (r of n.m) k(r, v), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, St++ > 1e3 && (this.#x(), Tt());
		for (let e of this.#u) this.#d.delete(e), k(e, _), this.schedule(e);
		for (let e of this.#d) k(e, v), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = bt = [], r = [], i = xt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw At(e), this.#h() || this.discard(), t;
		}
		if (j = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (bt = null, xt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) kt(e, t);
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
		this.#r.clear(), gt = this, Dt(r), Dt(n), gt = null, this.#s?.resolve();
		var s = j;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && (Mt.clear(), s.#g());
	}
	#_(e, t, n) {
		e.f ^= g;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= g : i & 4 ? t.push(r) : Rn(r) && (i & 16 && this.#d.add(r), Wn(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), k(i, _), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), j = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Qe(e[t], this.#u, this.#d);
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
			yt = !0, j = this, this.#g();
		} finally {
			St = 0, _t = null, bt = null, xt = null, yt = !1, j = null, M = null, Mt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(st);
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
		this.#m || (this.#m = !0, Je(() => {
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
			!yt && Je(() => {
				t.#e || t.flush();
			});
		}
		return j;
	}
	apply() {
		M = null;
	}
	schedule(e) {
		if (_t = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (bt !== null && t === G && (H === null || !(H.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? ht = e : t.#t = e, this.linked = !1;
		}
	}
};
function Tt() {
	try {
		Me();
	} catch (e) {
		en(e, _t);
	}
}
var Et = null;
function Dt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Rn(r) && (Et = /* @__PURE__ */ new Set(), Wn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && yn(r), Et?.size > 0)) {
				Mt.clear();
				for (let e of Et) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Et.has(n) && (Et.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Wn(n);
					}
				}
				Et.clear();
			}
		}
		Et = null;
	}
}
function Ot(e) {
	j.schedule(e);
}
function kt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), k(e, g);
		for (var n = e.first; n !== null;) kt(n, t), n = n.next;
	}
}
function At(e) {
	k(e, g);
	for (var t = e.first; t !== null;) At(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var jt = /* @__PURE__ */ new Set(), Mt = /* @__PURE__ */ new Map(), Nt = !1;
function Pt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Ce,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function N(e, t) {
	let n = Pt(e, t);
	return jn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Ft(e, t = !1, n = !0) {
	let r = Pt(e);
	return t || (r.equals = Te), r;
}
function P(e, t, n = !1) {
	return H !== null && (!U || H.f & 131072) && Ge() && H.f & 4325394 && (An === null || !An.has(e)) && Ie(), It(e, n ? Bt(t) : t, xt);
}
function It(e, t, n = null) {
	if (!e.equals(t)) {
		Dn ? Mt.set(e, t) : Mt.has(e) || Mt.set(e, e.v);
		var r = wt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && dt(t), M === null && Xe(t);
		}
		e.wv = Ln(), zt(e, _, n), Ge() && G !== null && G.f & 1024 && !(G.f & 96) && (J === null ? Mn([e]) : J.push(e)), !r.is_fork && jt.size > 0 && !Nt && Lt();
	}
	return t;
}
function Lt() {
	Nt = !1;
	for (let e of jt) {
		e.f & 1024 && k(e, v);
		let t;
		try {
			t = Rn(e);
		} catch {
			t = !0;
		}
		t && Wn(e);
	}
	jt.clear();
}
function Rt(e) {
	P(e, e.v + 1);
}
function zt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ge(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === G)) {
			var l = (c & _) === 0;
			if (l && k(s, t), c & 131072) jt.add(s);
			else if (c & 2) {
				var u = s;
				M?.delete(u), c & 65536 || (c & 512 && (G === null || !(G.f & 2097152)) && (s.f |= re), zt(u, v, n));
			} else if (l) {
				var d = s;
				c & 16 && Et !== null && Et.add(d), n === null ? Ot(d) : n.push(d);
			}
		}
	}
}
function Bt(e) {
	if (typeof e != "object" || !e || se in e || ce in e) return e;
	let r = u(e);
	if (r !== c && r !== l) return e;
	var i = /* @__PURE__ */ new Map(), a = n(e), o = /* @__PURE__ */ N(0), d = null, f = Fn, p = (e) => {
		if (Fn === f) return e();
		var t = H, n = Fn;
		W(null), In(f);
		var r = e();
		return W(t), In(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ N(e.length, d)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Pe();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ N(n.value, d);
				return i.set(t, e), e;
			}) : P(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ N(t, d));
					i.set(n, e), Rt(o);
				}
			} else P(r, t), Rt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === se) return e;
			var o = i.get(r), c = r in n;
			if (o === void 0 && (!c || s(n, r)?.writable) && (o = p(() => /* @__PURE__ */ N(Bt(c ? n[r] : t), d)), i.set(r, o)), o !== void 0) {
				var l = Y(o);
				return l === t ? void 0 : l;
			}
			return Reflect.get(n, r, a);
		},
		getOwnPropertyDescriptor(e, n) {
			var r = Reflect.getOwnPropertyDescriptor(e, n);
			if (r && "value" in r) {
				var a = i.get(n);
				a && (r.value = Y(a));
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
			if (n === se) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || G !== null && (!a || s(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ N(a ? Bt(e[n]) : t, d)), i.set(n, r)), Y(r) === t) ? !1 : a;
		},
		set(e, n, r, c) {
			var l = i.get(n), u = n in e;
			if (a && n === "length") for (var f = r; f < l.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ N(t, d)), i.set(f + "", m)) : P(m, t);
			}
			if (l === void 0) (!u || s(e, n)?.writable) && (l = p(() => /* @__PURE__ */ N(void 0, d)), P(l, Bt(r)), i.set(n, l));
			else {
				u = l.v !== t;
				var h = p(() => Bt(r));
				P(l, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(c, r), !u) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && P(_, v + 1);
				}
				Rt(o);
			}
			return !0;
		},
		ownKeys(e) {
			Y(o);
			var n = Reflect.ownKeys(e).filter((e) => {
				var n = i.get(e);
				return n === void 0 || n.v !== t;
			});
			for (var [r, a] of i) a.v !== t && !(r in e) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			Fe();
		}
	});
}
var Vt, Ht, Ut, Wt;
function Gt() {
	if (Vt === void 0) {
		Vt = window, Ht = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Ut = s(t, "firstChild").get, Wt = s(t, "nextSibling").get, d(e) && (e[de] = void 0, e[ue] = null, e[fe] = void 0, e.__e = void 0), d(n) && (n[pe] = void 0);
	}
}
function F(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Kt(e) {
	return Ut.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function qt(e) {
	return Wt.call(e);
}
function I(e, t) {
	if (!w) return /* @__PURE__ */ Kt(e);
	var n = /* @__PURE__ */ Kt(T);
	if (n === null) n = T.appendChild(F());
	else if (t && n.nodeType !== 3) {
		var r = F();
		return n?.before(r), E(r), r;
	}
	return t && Qt(n), E(n), n;
}
function Jt(e, t = !1) {
	if (!w) {
		var n = /* @__PURE__ */ Kt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ qt(n) : n;
	}
	if (t) {
		if (T?.nodeType !== 3) {
			var r = F();
			return T?.before(r), E(r), r;
		}
		Qt(T);
	}
	return T;
}
function L(e, t = !1) {
	if (!w) return /* @__PURE__ */ Kt(e);
	var n = I(e, t);
	return D(e), n;
}
function R(e, t = 1, n = !1) {
	let r = w ? T : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ qt(r);
	if (!w) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = F();
			return r === null ? i?.after(a) : r.before(a), E(a), a;
		}
		Qt(r);
	}
	return E(r), r;
}
function Yt(e) {
	e.textContent = "";
}
function Xt() {
	return !1;
}
function Zt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Qt(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function $t(e) {
	var t = G;
	if (t === null) return H.f |= oe, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	en(e, t);
}
function en(e, t) {
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
function tn(e) {
	G === null && (H === null && je(e), Ae()), Dn && ke(e);
}
function nn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function rn(e, t) {
	var n = G;
	n !== null && n.f & 8192 && (e |= y);
	var r = {
		ctx: O,
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
	j?.register_created_effect(r);
	var i = r;
	if (e & 4) bt === null ? wt.ensure().schedule(r) : bt.push(r);
	else if (t !== null) {
		try {
			Wn(r);
		} catch (e) {
			throw V(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ee));
	}
	if (i !== null && (i.parent = n, n !== null && nn(i, n), H !== null && H.f & 2 && !(e & 64))) {
		var a = H;
		(a.effects ??= []).push(i);
	}
	return r;
}
function an() {
	return H !== null && !U;
}
function on(e) {
	let t = rn(8, null);
	return k(t, g), t.teardown = e, t;
}
function sn(e) {
	tn("$effect");
	var t = G.f;
	if (!H && t & 32 && O !== null && !O.i) {
		var n = O;
		(n.e ??= []).push(e);
	} else return cn(e);
}
function cn(e) {
	return rn(4 | te, e);
}
function ln(e) {
	wt.ensure();
	let t = rn(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? bn(t, () => {
			V(t), n(void 0);
		}) : (V(t), n(void 0));
	});
}
function un(e) {
	return rn(4, e);
}
function dn(e) {
	return rn(ae | C, e);
}
function fn(e, t = 0) {
	return rn(8 | t, e);
}
function z(e, t = [], n = [], r = []) {
	nt(r, t, n, (t) => {
		rn(8, () => {
			e(...t.map(Y));
		});
	});
}
function pn(e, t = 0) {
	return rn(16 | t, e);
}
function mn(e, t = 0) {
	return rn(h | t, e);
}
function B(e) {
	return rn(32 | C, e);
}
function hn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = Dn, r = H;
		On(!0), W(null);
		try {
			t.call(null);
		} catch (t) {
			en(t, e.parent);
		} finally {
			On(n), W(r);
		}
	}
}
function gn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && tt(() => {
			e.abort(me);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : V(n, t), n = r;
	}
}
function _n(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || V(t), t = n;
	}
}
function V(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (vn(e.nodes.start, e.nodes.end), n = !0), e.f |= S, gn(e, t && !n), Un(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	hn(e), e.f ^= S, e.f |= b;
	var i = e.parent;
	i !== null && i.first !== null && yn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function vn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ qt(e);
		e.remove(), e = n;
	}
}
function yn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function bn(e, t, n = !0) {
	var r = [];
	e.f |= 256, xn(e, r, !0);
	var i = () => {
		n && V(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function xn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= y;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				xn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Sn(e) {
	e.f &= -257, Cn(e, !0);
}
function Cn(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= y, e.f & 1024 || (k(e, _), wt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Cn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function wn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ qt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var Tn = null, En = !1, Dn = !1;
function On(e) {
	Dn = e;
}
var H = null, U = !1;
function W(e) {
	H = e;
}
var G = null;
function kn(e) {
	G = e;
}
var An = null;
function jn(e) {
	H !== null && (An ??= /* @__PURE__ */ new Set()).add(e);
}
var K = null, q = 0, J = null;
function Mn(e) {
	J = e;
}
var Nn = 1, Pn = 0, Fn = Pn;
function In(e) {
	Fn = e;
}
function Ln() {
	return ++Nn;
}
function Rn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~re), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Rn(a) && ft(a), a.wv > e.wv) return !0;
		}
		t & 512 && M === null && k(e, g);
	}
	return !1;
}
function zn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(An !== null && An.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? zn(a, t, !1) : t === a && (n ? k(a, _) : a.f & 1024 && k(a, v), Ot(a));
	}
}
function Bn(e) {
	var t = K, n = q, r = J, i = H, a = An, o = O, s = U, c = Fn, l = e.f;
	K = null, q = 0, J = null, H = l & 96 ? null : e, An = null, Be(e.ctx), U = !1, Fn = ++Pn, e.ac !== null && (tt(() => {
		e.ac.abort(me);
	}), e.ac = null);
	try {
		e.f |= ie;
		var u = e.fn, d = u();
		e.f |= x;
		var f = Vn(e);
		if (Ge() && J !== null && !U && f !== null && !(e.f & 6146)) for (var p = 0; p < J.length; p++) zn(J[p], e);
		if (i !== null && i !== e) {
			if (Pn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Pn;
			if (t !== null) for (let e of t) e.rv = Pn;
			J !== null && (r === null ? r = J : r.push(...J));
		}
		return e.f & 8388608 && (e.f ^= oe), d;
	} catch (t) {
		return Vn(e), $t(t);
	} finally {
		e.f ^= ie, K = t, q = n, J = r, H = i, An = a, Be(o), U = s, Fn = c;
	}
}
function Vn(e) {
	var t = e.deps, n = j?.is_fork;
	if (K !== null) {
		var r;
		if (n || Un(e, q), t !== null && q > 0) for (t.length = q + K.length, r = 0; r < K.length; r++) t[q + r] = K[r];
		else e.deps = t = K;
		if (an() && e.f & 512) for (r = q; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && q < t.length && (Un(e, q), t.length = q);
	return t;
}
function Hn(e, n) {
	let a = n.reactions;
	if (a !== null) {
		var o = r.call(a, e);
		if (o !== -1) {
			var s = a.length - 1;
			s === 0 ? a = n.reactions = null : (a[o] = a[s], a.pop());
		}
	}
	if (a === null && n.f & 2 && (K === null || !i.call(K, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~re), c.v !== t && Xe(c), c.ac !== null && tt(() => {
			c.ac.abort(me), c.ac = null, k(c, _);
		}), pt(c), Un(c, 0);
	}
}
function Un(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Hn(e, n[r]);
}
function Wn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		k(e, g);
		var n = G, r = En;
		G = e, En = !(t & 96);
		try {
			t & 16777232 ? _n(e) : gn(e), hn(e);
			var i = Bn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Nn;
		} finally {
			En = r, G = n;
		}
	}
}
function Y(e) {
	var t = !!(e.f & 2);
	if (Tn?.add(e), H !== null && !U && !(G !== null && G.f & 16384) && (An === null || !An.has(e))) {
		var n = H.deps;
		if (H.f & 2097152) e.rv < Pn && (e.rv = Pn, K === null && n !== null && n[q] === e ? q++ : K === null ? K = [e] : K.push(e));
		else {
			H.deps ??= [], i.call(H.deps, e) || H.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [H] : i.call(r, H) || r.push(H);
		}
	}
	if (Dn && Mt.has(e)) return Mt.get(e);
	if (t) {
		var a = e;
		if (Dn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Kn(a)) && (o = dt(a)), Mt.set(a, o), o;
		}
		var s = !(a.f & 512) && !U && H !== null && (En || !!(H.f & 512)), c = (a.f & x) === 0;
		Rn(a) && (s && (a.f |= 512), ft(a)), s && !c && (mt(a), Gn(a));
	}
	if (M?.has(e)) return M.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Gn(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (mt(t), Gn(t));
}
function Kn(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Mt.has(t) || t.f & 2 && Kn(t)) return !0;
	return !1;
}
function qn(e) {
	var t = U;
	try {
		return U = !0, e();
	} finally {
		U = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var Jn = Symbol("events"), Yn = /* @__PURE__ */ new Set(), Xn = /* @__PURE__ */ new Set();
function Zn(e, t, n) {
	(t[Jn] ??= {})[e] = n;
}
function Qn(e) {
	for (var t = 0; t < e.length; t++) Yn.add(e[t]);
	for (var n of Xn) n(e);
}
var $n = null, er = !1;
function tr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	$n = e, er || (er = !0, setTimeout(() => {
		er = !1, $n = null;
	}));
	var s = 0, c = $n === e && e[Jn];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Jn] = t;
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
		W(null), kn(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[Jn]?.[r];
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
			e[Jn] = t, delete e.currentTarget, W(d), kn(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var nr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function rr(e) {
	return nr?.createHTML(e) ?? e;
}
function ir(e) {
	var t = Zt("template");
	return t.innerHTML = rr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function ar(e, t) {
	var n = G;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function X(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (w) return ar(T, null), T;
		i === void 0 && (i = ir(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Kt(i)));
		var t = r || Ht ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Kt(t), s = t.lastChild;
			ar(o, s);
		} else ar(t, t);
		return t;
	};
}
function Z(e, t) {
	if (w) {
		var n = G;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = T), ye();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var or = ["touchstart", "touchmove"];
function sr(e) {
	return or.includes(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function cr(e) {
	let t = 0, n = Pt(0), r;
	return () => {
		an() && (Y(n), fn(() => (t === 0 && (r = qn(() => e(() => Rt(n)))), t += 1, () => {
			Je(() => {
				--t, t === 0 && (r?.(), r = void 0, Rt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var lr = ee | C;
function ur(e, t, n, r) {
	new dr(e, t, n, r);
}
var dr = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = w ? T : null;
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
	#h = cr(() => (this.#m = Pt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = G;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = G.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = pn(() => {
			if (w) {
				let e = this.#t;
				ye();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lr), w && (this.#e = T);
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
		Je(r), t && (this.#s = B(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				_e();
				return;
			}
			t = !0, n && Le(), this.#s !== null && bn(this.#s, () => {
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
					en(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = B(() => e(this.#e)), Je(() => {
			var e = this.#c = document.createDocumentFragment(), t = F(), n = !1;
			if (e.append(t), this.#a = this.#S(() => {
				try {
					return B(() => this.#r(t));
				} catch (e) {
					try {
						this.error(e), n = !0;
					} catch (e) {
						en(e, this.#i.parent);
					}
					return null;
				}
			}), this.#a === null) {
				this.#c = null, n && this.#x(j);
				return;
			}
			this.#u === 0 && (this.#e.before(e), this.#c = null, bn(this.#o, () => {
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
				wn(this.#a, e);
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
		Qe(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = G, n = H, r = O;
		kn(this.#i), W(this.#i), Be(this.#i.ctx);
		try {
			return wt.ensure(), e();
		} finally {
			kn(t), W(n), Be(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && bn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Je(() => {
			this.#d = !1, this.#m && It(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), Y(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		j?.is_fork ? (this.#a && j.skip_effect(this.#a), this.#o && j.skip_effect(this.#o), this.#s && j.skip_effect(this.#s), j.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (V(this.#a), null), this.#o &&= (V(this.#o), null), this.#s &&= (V(this.#s), null), w && (E(this.#t), be(), E(xe()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return B(() => {
						var r = G;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return en(e, this.#i.parent), null;
				}
			}));
		};
		Je(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				en(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => en(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
function Q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[pe] ??= e.nodeValue) && (e[pe] = n, e.nodeValue = `${n}`);
}
function fr(e, t) {
	return mr(e, t);
}
var pr = /* @__PURE__ */ new Map();
function mr(t, { target: n, anchor: r, props: i = {}, events: o, context: s, intro: c = !0, transformError: l }) {
	Gt();
	var u = void 0, d = ln(() => {
		var c = r ?? n.appendChild(F());
		ur(c, { pending: () => {} }, (n) => {
			He({});
			var r = O;
			if (s && (r.c = s), o && (i.$$events = o), w && ar(n, null), u = t(n, i) || We(), w && (G.nodes.end = T, T === null || T.nodeType !== 8 || T.data !== "]")) throw ge(), e;
			Ue();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = sr(r);
					for (let e of [n, document]) {
						var a = pr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), pr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, tr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(a(Yn)), Xn.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = pr.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, tr), t.delete(e), t.size === 0 && pr.delete(r)) : t.set(e, i);
			}
			Xn.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return hr.set(u, d), u;
}
var hr = /* @__PURE__ */ new WeakMap();
function gr(e, t) {
	let n = hr.get(e);
	return n ? (hr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var _r = class {
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
			if (n) Sn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Sn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
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
						wn(r, t), t.append(F()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else V(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), bn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (V(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = j, r = Xt();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = F();
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
		} else w && (this.anchor = T), this.#a(n);
	}
};
function vr(e) {
	O === null && Ee("onMount"), sn(() => {
		let t = qn(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/if.js
function $(e, t, n = !1) {
	var r;
	w && (r = T, ye());
	var i = new _r(e), a = n ? ee : 0;
	function o(e, t) {
		if (w) {
			var n = Se(r);
			if (e !== parseInt(n.substring(1))) {
				var a = xe();
				E(a), i.anchor = a, ve(!1), i.ensure(e, t), ve(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	pn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function yr(e, t, n) {
	for (var r = [], i = t.length, o, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		bn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					br(e, a(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			Yt(d), d.append(u), e.items.clear();
		}
		br(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function br(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ne, wn(a, document.createDocumentFragment())) : V(t[i], n);
	}
}
var xr;
function Sr(e, t, r, i, o, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = w ? E(/* @__PURE__ */ Kt(u)) : u.appendChild(F());
	}
	w && ye();
	var d = null, f = /* @__PURE__ */ lt(() => {
		var e = r();
		return n(e) ? e : e == null ? [] : a(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, wr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ne, Er(d, null, c)) : Sn(d) : bn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: pn(() => {
			p = Y(f);
			var e = p.length;
			let n = !1;
			w && Se(c) === "[!" != (e === 0) && (c = xe(), E(c), ve(!1), n = !0);
			for (var a = /* @__PURE__ */ new Set(), u = j, v = Xt(), y = 0; y < e; y += 1) {
				w && T.nodeType === 8 && T.data === "]" && (c = T, n = !0, ve(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && It(S.v, b), S.i && It(S.i, y), v && u.unskip_effect(S.e)) : (S = Tr(l, h ? c : xr ??= F(), b, x, y, o, t, r), h || (S.e.f |= ne), l.set(x, S)), a.add(x);
			}
			if (e === 0 && s && !d && (h ? d = B(() => s(c)) : (d = B(() => s(xr ??= F())), d.f |= ne)), e > a.size && Oe("", "", ""), w && e > 0 && E(xe()), !h) {
				if (m.set(u, a), v) {
					for (let [e, t] of l) a.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			n && ve(!0), Y(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, w && (c = T);
}
function Cr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function wr(e, t, n, r, i) {
	var o = !!(r & 8), s = t.length, c = e.items, l = Cr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Sn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ne, _ === l) Er(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Dr(e, d, _), Dr(e, _, y), Er(_, y, n), d = _, p = [], m = [], l = Cr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Er(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Dr(e, S.prev, ee.next), Dr(e, d, S), Dr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), Er(_, l, n), Dr(e, _.prev, _.next), Dr(e, _, d === null ? e.effect.first : d.next), Dr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Cr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Cr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (br(e, a(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var C = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || C.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && C.push(l), l = Cr(l.next);
		var te = C.length;
		if (te > 0) {
			var re = r & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.measure();
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.fix();
			}
			yr(e, C, re);
		}
	}
	o && Je(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Tr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Pt(n) : /* @__PURE__ */ Ft(n, !1, !1) : null, l = o & 2 ? Pt(i) : null;
	return {
		v: c,
		i: l,
		e: B(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Er(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ qt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Dr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function Or(e, t) {
	var n = void 0, r;
	mn(() => {
		n !== (n = t()) && (r &&= (V(r), null), n && (r = B(() => {
			un(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var kr = [..." 	\n\r\f\xA0\v﻿"];
function Ar(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || kr.includes(r[o - 1])) && (s === r.length || kr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function jr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Mr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Nr(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Mr)), i && c.push(...Object.keys(i).map(Mr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Mr(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += jr(r)), i && (n += jr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function Pr(e, t, n, r, i, a) {
	var o = e[de];
	if (w || o !== n || o === void 0) {
		var s = Ar(n, r, a);
		(!w || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[de] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/style.js
function Fr(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Ir(e, t, n, r) {
	var i = e[fe];
	if (w || i !== t) {
		var a = Nr(t, r);
		(!w || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[fe] = t;
	} else r && (Array.isArray(r) ? (Fr(e, n?.[0], r[0]), Fr(e, n?.[1], r[1], "important")) : Fr(e, n, r));
	return r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/props.js
function Lr(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), c = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ ot(r), Y(u)) : (l && (l = !1, c = o ? qn(r) : r), c);
	let f;
	if (a) {
		var p = se in e || le in e;
		f = s(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = et(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Ne(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (c = void 0), n === void 0 ? c : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? ot : lt)(() => (v = !1, g()));
	a && Y(y);
	var b = G;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? Y(y) : i && a ? Bt(e) : e;
			return P(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Dn && v || b.f & 16384 ? y.v : Y(y);
	});
}
//#endregion
//#region packages/core/src/algorithms/display-models.ts
function Rr(e, t) {
	return t <= 0 || e.endPeriod >= 1 && e.startPeriod <= t;
}
//#endregion
//#region packages/core/src/algorithms/palette.ts
var zr = [
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
], Br = zr.map(([e, t]) => ({
	background: e,
	foreground: t
})), Vr = /\s+/g;
function Hr(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = t * 31 + e.charCodeAt(n) | 0;
	return t;
}
function Ur(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(Vr, " ");
}
function Wr(e) {
	return zr[Math.abs(Hr(e) % zr.length)] ?? zr[0];
}
function Gr(e) {
	let [t] = Wr(e), n = zr.findIndex(([e]) => e === t);
	return n >= 0 ? n : 0;
}
function Kr(e, t = Br) {
	let n = e.name ? Ur(e.name) : "";
	return !n || t.length === 0 ? Br[0] : t[Gr(n) % t.length];
}
function qr(e, t = Br) {
	if (t.length === 0) return /* @__PURE__ */ new Map();
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Ur(t.name), r = Gr(e);
		n.has(e) || n.set(e, {
			name: e,
			slot: r,
			hash: Hr(e)
		});
	}
	let r = [...n.values()].sort((e, t) => e.hash - t.hash || e.name.localeCompare(t.name)), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = [];
	for (let { name: e, slot: n } of r) {
		let r = n % t.length;
		if (a.has(r)) {
			o.push(e);
			continue;
		}
		a.add(r), i.set(e, t[r]);
	}
	let s = 0;
	for (let e of o) {
		for (; a.has(s % t.length) && a.size < t.length;) s += 1;
		let n = s % t.length;
		a.add(n), i.set(e, t[n]), s += 1;
	}
	return i;
}
//#endregion
//#region packages/core/src/domain/preferences.ts
var Jr = {
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
//#region packages/core/src/algorithms/date.ts
function Yr(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function Xr(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function Zr(e) {
	let [, t, n] = e.split("-");
	return `${t.padStart(2, "0")}/${n.padStart(2, "0")}`;
}
function Qr(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function $r(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function ei(e, t) {
	return $r(e, t * 7);
}
function ti(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function ni(e, t) {
	return e.getTime() < t.getTime();
}
function ri(e) {
	return Xr(Qr(Yr(e)));
}
function ii(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function ai(e) {
	let t = (/* @__PURE__ */ new Date(`${e}T12:00:00`)).getDay();
	return t === 0 ? 7 : t;
}
//#endregion
//#region packages/core/src/algorithms/calendar.ts
var oi = class {
	normalizeTermStartDate(e, t) {
		let n = Yr(ri(t));
		if (!e || !e.trim()) return Xr(Qr(n));
		try {
			return Xr(Qr(Yr(e)));
		} catch {
			return Xr(Qr(this.inferTermStartDateFromTermName(e) || n));
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
		}, r = Yr(this.normalizeTermStartDate(n.termStartDate, e)), i = Yr(e);
		if (ni(i, r)) return n.startWeek;
		let a = ti(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return Xr(ei(Yr(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return Xr($r(Yr(this.resolveWeekStart(e, t, r)), n - 1));
	}
};
//#endregion
//#region packages/core/src/algorithms/period-clock.ts
function si(e) {
	let t = /^(\d{1,2}):(\d{2})$/.exec(e.trim());
	return t ? Number(t[1]) * 60 + Number(t[2]) : 0;
}
function ci(e) {
	return e.map((e) => ({
		index: e.index,
		startMinutes: si(e.startTime),
		endMinutes: si(e.endTime)
	})).sort((e, t) => e.index - t.index);
}
function li(e) {
	return e.getHours() * 60 + e.getMinutes();
}
function ui(e, t, n = "upcomingOrLast") {
	let r = null;
	for (let n of e) {
		if (t >= n.startMinutes && t <= n.endMinutes) return n.index;
		r == null && t < n.startMinutes && (r = n.index);
	}
	return n === "none" ? null : r ?? e.at(-1)?.index ?? null;
}
//#endregion
//#region packages/core/src/types/services.ts
function di(e) {
	return { key: e };
}
var fi = di("storage"), pi = di("hostNavigation");
//#endregion
//#region packages/core/src/i18n/i18n-catalog.ts
function mi(e, t) {
	return t ? e.replace(/\{(\w+)\}/g, (e, n) => {
		let r = t[n];
		return r == null ? `{${n}}` : typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? String(r) : JSON.stringify(r);
	}) : e;
}
//#endregion
//#region packages/core/src/types/mountable.ts
var hi = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.on-surface,color.primary,color.on-primary,color.surface-variant,color.outline,color.secondary,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,color.outline-variant,color.surface-container-high,color.canvas,color.ink,color.border-subtle,color.success,color.warning,color.danger,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
//#endregion
//#region packages/core/src/plugin/define-chronos-plugin.ts
function gi(e, t, n = "zh-cn") {
	return e[n]?.[t] ?? e.en?.[t] ?? t;
}
function _i() {
	return "0.5.2";
}
function vi(e) {
	let t;
	return {
		id: e.id,
		name: () => t?.(e.nameKey) ?? gi(e.messages, e.nameKey),
		version: e.version ?? _i(),
		description: e.descriptionKey ? () => t?.(e.descriptionKey) ?? gi(e.messages, e.descriptionKey) : void 0,
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
//#region packages/ui-kit/src/schema-form/inputs/FileField.svelte
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), Qn(["input"]), Qn(["change"]), Qn(["change"]), Qn(["change"]);
//#endregion
//#region packages/ui-kit/src/utils/middle-truncate.ts
var yi = null;
function bi(e) {
	if (typeof document > "u") return () => Infinity;
	yi ??= document.createElement("canvas");
	let t = yi.getContext("2d");
	return t ? (t.font = e, (e) => t.measureText(e).width) : () => Infinity;
}
function xi(e, t, n, r = 6) {
	if (e <= 0) return r;
	let i = Math.max(r, n), a = Math.min(r, i), o = t(i);
	if (o <= e) return i;
	let s = e / o * i, c = Math.max(a, Math.min(i, Math.floor(s * 10) / 10));
	if (c <= a) return a;
	if (t(c) > e) {
		let n = t(c);
		if (n > e) {
			let t = e / n * c;
			c = Math.max(a, Math.min(i, Math.floor(t * 10) / 10));
		}
	}
	return c;
}
function Si(e) {
	let t = getComputedStyle(e), n = t.fontStyle || "normal", r = t.fontWeight || "normal", i = t.fontFamily || "sans-serif";
	return (e) => bi(`${n} ${r} ${e}px ${i}`);
}
//#endregion
//#region packages/ui-kit/src/utils/fit-width-font.svelte.ts
var Ci = 6;
function wi(e) {
	return (t) => {
		let n = () => {
			let { lines: n, maxFontPx: r, minFontPx: i = Ci, fromParent: a = !1, availableWidthPx: o } = e(), s = n.filter((e) => e.length > 0), c = o ?? (a ? t.parentElement ?? t : t).clientWidth;
			if (a) {
				let e = getComputedStyle(t);
				if (c -= (Number.parseFloat(e.paddingLeft) || 0) + (Number.parseFloat(e.paddingRight) || 0), t.parentElement) {
					let e = getComputedStyle(t.parentElement);
					c -= (Number.parseFloat(e.paddingLeft) || 0) + (Number.parseFloat(e.paddingRight) || 0);
				}
				c = Math.max(0, c);
			}
			if (c <= 0 || s.length === 0) return;
			let l = Si(t), u = xi(c, (e) => {
				let t = l(e);
				return Math.max(...s.map((e) => t(e)));
			}, r, i);
			t.style.fontSize = `${u}px`;
		}, r = null, i = new ResizeObserver(n);
		return sn(() => {
			let { fromParent: a = !1, availableWidthPx: o } = e();
			if (o != null) {
				r &&= (i.disconnect(), null), n();
				return;
			}
			let s = a ? t.parentElement ?? t : t;
			r !== s && (i.disconnect(), i.observe(s), r = s), n();
		}), () => i.disconnect();
	};
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetablePreviewGrid.svelte
Qn(["click"]);
//#endregion
//#region packages/ui-kit/src/timetable-preview/timetable-presentation.ts
var Ti = "chronos.timetablePresentation";
function Ei(e) {
	let t = e?.coursePalette;
	return t && t.length > 0 ? t : Br;
}
//#endregion
//#region packages/ui-kit/src/schema-form/inputs/WallpaperPreviewField.svelte
Qn(["change"]);
//#endregion
//#region packages/ui-kit/src/form/date-field-utils.ts
function Di(e) {
	return e?.toLowerCase() === "en" ? "en" : "zh-CN";
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
Qn(["click"]), Qn(["click"]), Qn(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function Oi(e) {
	return {
		[hi]: !0,
		mount(t, n) {
			let r = fr(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				gr(r);
			} };
		}
	};
}
//#endregion
//#region packages/ui-kit/src/i18n/plugin-text.ts
function ki(e, t, n, r, i) {
	let a = n["zh-cn"][r] ?? n.en?.[r] ?? String(r);
	if (!e) return mi(a, i);
	e.slotVersion;
	let o = e.translatePlugin(t, r, i);
	return o === r ? mi(a, i) : o;
}
//#endregion
//#region packages/ui-kit/src/haptic/haptic.ts
var Ai = Jr.hapticFeedbackEnabled, ji = "__CHRONOS_NATIVE__";
function Mi() {
	if (typeof window > "u") return null;
	let e = window[ji];
	return typeof e == "object" && e && typeof e.callNative == "function" ? e : null;
}
function Ni() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Pi() {
	return Ni() ? typeof navigator < "u" && "userActivation" in navigator && navigator.userActivation != null ? navigator.userActivation.hasBeenActive : !0 : !1;
}
function Fi() {
	if (typeof window > "u") return !1;
	try {
		if (typeof localStorage > "u") return !0;
		let e = localStorage.getItem(Ai);
		return e !== "0" && e !== "false";
	} catch {
		return !0;
	}
}
function Ii(e) {
	if (!Pi()) return !1;
	try {
		return navigator.vibrate(e);
	} catch {
		return !1;
	}
}
function Li(e, t) {
	if (!Fi()) return !1;
	let n = Mi();
	return n ? (n.callNative("haptic", e.method, e.params ?? {}).catch(() => {
		Ii(t);
	}), !0) : Ii(t);
}
var Ri = {
	selection: 15,
	light: 25,
	medium: 50,
	heavy: 80,
	success: [
		30,
		60,
		40
	],
	warning: [
		50,
		60,
		50
	]
}, zi = {
	selection() {
		return Li({ method: "selection" }, Ri.selection);
	},
	light() {
		return Li({
			method: "impact",
			params: { style: "light" }
		}, Ri.light);
	},
	medium() {
		return Li({
			method: "impact",
			params: { style: "medium" }
		}, Ri.medium);
	},
	heavy() {
		return Li({
			method: "impact",
			params: { style: "heavy" }
		}, Ri.heavy);
	},
	success() {
		return Li({
			method: "notification",
			params: { type: "success" }
		}, Ri.success);
	},
	warning() {
		return Li({
			method: "notification",
			params: { type: "warning" }
		}, Ri.warning);
	},
	cancel() {
		if (Pi()) try {
			return navigator.vibrate(0);
		} catch {
			return !1;
		}
		return !1;
	}
}, Bi = {
	"zh-cn": {
		"plugin.name": "今日",
		"plugin.description": "快速查看当天课程",
		"tab.label": "今日",
		"screen.title": "今日",
		"screen.week": "第 {week} 周",
		"screen.scope.active": "当前课表",
		"screen.scope.all": "全部课表",
		"screen.summary.count": "共 {count} 节课",
		"screen.summary.current": "第 {period} 节进行中",
		"screen.empty.noTimetable": "请先选择或创建课表",
		"screen.empty.noCourses": "今天没有课",
		"screen.empty.noCoursesHint": "享受轻松的一天吧",
		"screen.status.current": "进行中",
		"screen.status.past": "已结束",
		"screen.status.upcoming": "未开始",
		"screen.course.location": "教室 {location}",
		"screen.course.teacher": "教师 {teacher}",
		"screen.course.timetable": "{name}",
		"screen.course.periodSingle": "第 {n} 节",
		"screen.course.periodRange": "第 {start}-{end} 节",
		"config.scope.title": "范围"
	},
	en: {
		"plugin.name": "Today",
		"plugin.description": "Quick showing today's courses",
		"tab.label": "Today",
		"screen.title": "Today",
		"screen.week": "Week {week}",
		"screen.scope.active": "Current timetable",
		"screen.scope.all": "All timetables",
		"screen.summary.count": "{count} course(s) today",
		"screen.summary.current": "Period {period} in progress",
		"screen.empty.noTimetable": "Select or create a timetable first",
		"screen.empty.noCourses": "No classes today",
		"screen.empty.noCoursesHint": "Enjoy your day off",
		"screen.status.current": "Now",
		"screen.status.past": "Ended",
		"screen.status.upcoming": "Upcoming",
		"screen.course.location": "Room {location}",
		"screen.course.teacher": "Teacher {teacher}",
		"screen.course.timetable": "{name}",
		"screen.course.periodSingle": "Period {n}",
		"screen.course.periodRange": "Periods {start}-{end}",
		"config.scope.title": "Scope"
	}
}, Vi = "tool-today";
//#endregion
//#region packages/plugins/today/src/index.ts
function Hi(e = {}) {
	let { screenComponent: t } = e;
	return vi({
		id: Vi,
		messages: Bi,
		nameKey: "plugin.name",
		descriptionKey: "plugin.description",
		category: "tool",
		order: 35,
		author: "Chronos",
		defaultConfig: { scope: "active" },
		async apply(e, n) {
			e.registerSlot("shell.bottom-bar.tab", {
				id: "today",
				label: () => n("tab.label"),
				order: 15,
				icon: "today",
				iconFill: "calendar-today",
				defaultLaunch: !0
			}), e.registerSlot("shell.route.screen", {
				id: Vi,
				title: () => n("screen.title"),
				...t ? { component: t } : {}
			});
		}
	});
}
//#endregion
//#region packages/plugins/today/src/today-courses.ts
var Ui = new oi();
function Wi(e, t, n) {
	let r = e.find((e) => e.index === t), i = e.find((e) => e.index === n);
	return !r || !i ? null : {
		startTime: r.startTime,
		endTime: i.endTime
	};
}
function Gi(e) {
	return [...e].sort((e, t) => {
		let n = e.course.startPeriod - t.course.startPeriod;
		if (n !== 0) return n;
		let r = e.course.endPeriod - t.course.endPeriod;
		return r === 0 ? e.course.name.localeCompare(t.course.name, "zh-CN") : r;
	});
}
function Ki(e, t, n, r) {
	let i = ci(t), a = i.find((t) => t.index === e.startPeriod), o = i.find((t) => t.index === e.endPeriod);
	if (a && o) {
		if (n > o.endMinutes) return "past";
		if (n >= a.startMinutes && n <= o.endMinutes) return "current";
		if (n < a.startMinutes) return "upcoming";
	}
	return r == null ? "upcoming" : e.endPeriod < r ? "past" : e.startPeriod <= r && e.endPeriod >= r ? "current" : "upcoming";
}
function qi(e, t, n, r) {
	return Gi(e).map((e) => ({
		hit: e,
		status: Ki(e.course, t, n, r)
	}));
}
async function Ji(e, t) {
	let { todayIso: n, scope: r, timetable: i } = t;
	if (!i) return [];
	let a = ai(n);
	if (r === "active") {
		let t = Ui.calculateAcademicWeek(n, i.academicConfig);
		return e.queryCourses({
			dayOfWeek: a,
			week: t,
			timetableIds: [i.id]
		});
	}
	let o = await e.listTimetables();
	if (o.length === 0) return [];
	let s = (await Promise.all(o.map((t) => e.getTimetable(t.id)))).filter((e) => e != null), c = /* @__PURE__ */ new Map();
	for (let e of s) {
		let t = Ui.calculateAcademicWeek(n, e.academicConfig), r = c.get(t) ?? [];
		r.push(e.id), c.set(t, r);
	}
	return (await Promise.all([...c.entries()].map(([t, n]) => e.queryCourses({
		dayOfWeek: a,
		week: t,
		timetableIds: n
	})))).flat();
}
//#endregion
//#region packages/plugins/today/src/today-screen.svelte.ts
function Yi() {
	let e = /* @__PURE__ */ N(null), t = "", n = /* @__PURE__ */ N("active"), r = /* @__PURE__ */ N([]), i = !1, a, o;
	function s() {
		return Y(e)?.currentTimetable ?? null;
	}
	function c() {
		return s()?.academicConfig.periodTimes ?? [];
	}
	function l() {
		return Y(e)?.clockTodayIso || ii();
	}
	function u() {
		return Y(e)?.clockNow ?? /* @__PURE__ */ new Date();
	}
	function d() {
		let t = Y(e);
		if (!t) return null;
		let n = ci(c());
		return n.length === 0 ? t.currentPeriodIndex ?? null : ui(n, li(t.clockNow));
	}
	async function f() {
		if (i) return;
		let a = Y(e), o = s();
		if (!a || !o) {
			P(r, []);
			return;
		}
		try {
			let s = a.getPluginContext(t), f = l(), p = u(), m = await Ji(s.service(fi), {
				todayIso: f,
				scope: Y(n),
				timetable: o
			});
			if (i || Y(e) !== a) return;
			let h = c(), g = m.filter((e) => Rr(e.course, h.length));
			P(r, qi(g, h, li(p), d()));
		} catch {
			i || P(r, []);
		}
	}
	async function p() {
		let r = Y(e);
		if (r) try {
			let e = r.getPluginContext(t);
			P(n, e.config.scope ?? "active", !0);
		} catch {
			P(n, "active");
		}
	}
	async function m(n, r) {
		if (!i && !Y(e) && (P(e, n, !0), t = r, await p(), !(i || Y(e) !== n))) {
			try {
				let e = n.getPluginContext(t), r = e.on("time:tick", () => {
					i || f();
				});
				a = () => r.dispose();
				let s = e.on("timetable:switched", () => {
					i || f();
				});
				o = () => s.dispose();
			} catch {}
			i || Y(e) !== n || await f();
		}
	}
	async function h(r) {
		if (i) return;
		r !== Y(n) && zi.medium(), P(n, r, !0);
		let a = Y(e);
		if (a) {
			try {
				await a.getPluginContext(t).updateConfig({ scope: r });
			} catch {}
			i || await f();
		}
	}
	function g() {
		i = !0, a?.(), a = void 0, o?.(), o = void 0, P(e, null), t = "", P(r, []);
	}
	return sn(() => {
		if (i) return;
		let t = Y(e);
		t && (t.clockNow, t.clockTodayIso, Y(n), s()?.id, s()?.academicConfig.periodTimes, f());
	}), {
		get today() {
			return l();
		},
		get now() {
			return u();
		},
		get scope() {
			return Y(n);
		},
		get courseEntries() {
			return Y(r);
		},
		get currentPeriodIndex() {
			return d();
		},
		init: m,
		dispose: g,
		persistScope: h,
		refreshCourses: f
	};
}
//#endregion
//#region packages/plugins/today/src/TodayScreen.svelte
var Xi = /* @__PURE__ */ X("<p class=\"text-label-large shrink-0 text-on-surface-variant\"> </p>"), Zi = /* @__PURE__ */ X("<div class=\"mt-1 flex items-center justify-between gap-3\"><p class=\"text-body-medium text-on-surface-variant\"> </p> <!></div>"), Qi = /* @__PURE__ */ X("<div></div>"), $i = /* @__PURE__ */ X("<button type=\"button\"> </button>"), ea = /* @__PURE__ */ X("<section class=\"flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs\"><div class=\"mb-4 flex size-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" class=\"size-8 fill-current\"><path d=\"M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z\"></path></svg></div> <p class=\"text-title-medium text-on-surface\"> </p></section>"), ta = /* @__PURE__ */ X("<section class=\"flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs\"><div class=\"mb-4 flex size-16 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" class=\"size-8 fill-current\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"></path></svg></div> <p class=\"text-title-medium text-on-surface\"> </p> <p class=\"text-body-medium mt-2 text-on-surface-variant\"> </p></section>"), na = /* @__PURE__ */ X("<p class=\"text-label-medium text-on-surface tabular-nums\"> </p>"), ra = /* @__PURE__ */ X("<span class=\"text-label-small shrink-0 rounded-full bg-primary px-2 py-0.5 text-on-primary\"> </span>"), ia = /* @__PURE__ */ X("<p> </p>"), aa = /* @__PURE__ */ X("<div class=\"text-body-small mt-1 flex flex-col gap-1 text-on-surface-variant\"><!> <!> <!></div>"), oa = /* @__PURE__ */ X("<div class=\"flex w-11 shrink-0 flex-col items-center self-stretch\"><!> <div class=\"flex min-h-0 w-full flex-1 flex-col items-center justify-center\"><p class=\"text-headline-small w-full min-w-0 text-center font-bold whitespace-nowrap text-on-surface-variant\"> </p></div> <!></div> <div class=\"w-1 shrink-0 self-stretch rounded-full\" aria-hidden=\"true\"></div> <div class=\"min-w-0 flex-1\"><div class=\"flex items-start justify-between gap-2\"><p class=\"text-title-medium truncate text-on-surface\"> </p> <!></div> <!></div>", 1), sa = /* @__PURE__ */ X("<button type=\"button\"><!></button>"), ca = /* @__PURE__ */ X("<div><!></div>"), la = /* @__PURE__ */ X("<li><!></li>"), ua = /* @__PURE__ */ X("<section class=\"overflow-hidden rounded-2xl border border-outline/20 bg-surface shadow-xs\"><ul class=\"divide-y divide-outline/10\"></ul></section>"), da = /* @__PURE__ */ X("<div class=\"flex min-h-0 flex-1 flex-col overflow-y-auto\"><header class=\"border-b border-outline/10 bg-surface px-4 pt-6 pb-4\"><p class=\"text-headline-small text-on-surface\"> </p> <!> <div class=\"rounded-pill relative mt-4 flex w-full border border-border bg-surface p-1.5 shadow-xs\"><!> <!></div></header> <div class=\"flex flex-1 flex-col gap-4 p-4\"><!></div></div>");
function fa(e, t) {
	He(t, !0);
	let n = Lr(t, "active", 3, !0), r = Ve(Ti), i = /* @__PURE__ */ A(() => r?.() ?? {}), a = /* @__PURE__ */ A(() => Ei(Y(i))), o = new oi(), s = Yi(), c = /* @__PURE__ */ A(() => t.controller.currentTimetable), l = /* @__PURE__ */ A(() => Y(c)?.academicConfig.periodTimes ?? []), u = /* @__PURE__ */ A(() => t.controller.clockTodayIso || s.today), d = /* @__PURE__ */ A(() => Y(c) ? o.calculateAcademicWeek(Y(u), Y(c).academicConfig) : 1), f = /* @__PURE__ */ A(() => qr(s.courseEntries.map((e) => e.hit.course), Y(a))), p = /* @__PURE__ */ A(() => [{
		value: "active",
		label: h("screen.scope.active")
	}, {
		value: "all",
		label: h("screen.scope.all")
	}]), m = /* @__PURE__ */ A(() => Y(p).findIndex((e) => e.value === s.scope));
	function h(e, n) {
		return ki(t.controller, Vi, Bi, e, n);
	}
	function g(e) {
		let n = (/* @__PURE__ */ new Date(`${e}T12:00:00`)).toLocaleDateString(Di(t.controller.currentLocale), { weekday: "short" });
		return `${Zr(e)} ${n}`;
	}
	function _(e) {
		return Y(f).get(Ur(e.course.name)) ?? Kr(e.course, Y(a));
	}
	let v = /* @__PURE__ */ A(() => {
		try {
			return t.controller.getPluginContext(t.pluginId).tryService(pi);
		} catch {
			return;
		}
	});
	function y(e) {
		Y(v)?.openCourseEditor(e);
	}
	vr(() => (s.init(t.controller, t.pluginId), () => s.dispose()));
	var b = da(), x = I(b), S = I(x), ee = L(S, !0), C = R(S, 2), te = (e) => {
		var t = Zi(), n = I(t), r = L(n, !0), i = R(n, 2), a = (e) => {
			var t = Xi(), n = L(t, !0);
			z((e) => Q(n, e), [() => h("screen.summary.count", { count: s.courseEntries.length })]), Z(e, t);
		};
		$(i, (e) => {
			s.courseEntries.length > 0 && e(a);
		}), D(t), z((e) => Q(r, e), [() => h("screen.week", { week: Y(d) })]), Z(e, t);
	};
	$(C, (e) => {
		Y(c) && e(te);
	});
	var ne = R(C, 2), re = I(ne), ie = (e) => {
		var t = Qi();
		let r;
		z(() => {
			Pr(t, 1, `rounded-pill absolute top-1.5 bottom-1.5 bg-secondary-container shadow-xs ${n() ? "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]" : ""}`), r = Ir(t, "", r, {
				left: `calc(0.375rem + ${Y(m) ?? ""} * ((100% - 0.75rem) / 2))`,
				width: "calc((100% - 0.75rem) / 2)"
			});
		}), Z(e, t);
	};
	$(re, (e) => {
		Y(m) >= 0 && e(ie);
	}), Sr(R(re, 2), 17, () => Y(p), (e) => e.value, (e, t) => {
		var n = $i(), r = L(n, !0);
		z(() => {
			Pr(n, 1, `text-label-large rounded-pill relative z-10 flex-1 cursor-pointer py-2 text-center transition-colors duration-200 ${s.scope === Y(t).value ? "text-on-secondary-container" : "text-on-surface-variant hover:text-on-surface"}`), Q(r, Y(t).label);
		}), Zn("click", n, () => void s.persistScope(Y(t).value)), Z(e, n);
	}), D(ne), D(x);
	var ae = R(x, 2), oe = I(ae), se = (e) => {
		var t = ea(), n = L(R(I(t), 2), !0);
		D(t), z((e) => Q(n, e), [() => h("screen.empty.noTimetable")]), Z(e, t);
	}, ce = (e) => {
		var t = ta(), n = R(I(t), 2), r = L(n, !0), i = L(R(n, 2), !0);
		D(t), z((e, t) => {
			Q(r, e), Q(i, t);
		}, [() => h("screen.empty.noCourses"), () => h("screen.empty.noCoursesHint")]), Z(e, t);
	}, le = (e) => {
		var t = ua(), n = I(t);
		Sr(n, 21, () => s.courseEntries, (e) => `${e.hit.timetableId}-${e.hit.course.id}`, (e, t) => {
			var n = la();
			{
				let e = (e) => {
					var n = oa(), r = Jt(n), i = I(r), a = (e) => {
						var t = na(), n = L(t, !0);
						z(() => Q(n, Y(c).startTime)), Z(e, t);
					};
					$(i, (e) => {
						Y(c) && e(a);
					});
					var l = R(i, 2), d = I(l), f = L(d, !0);
					Or(d, () => wi(() => ({
						lines: [Y(u)],
						maxFontPx: 24,
						minFontPx: 6,
						fromParent: !0
					}))), D(l);
					var p = R(l, 2), m = (e) => {
						var t = na(), n = L(t, !0);
						z(() => Q(n, Y(c).endTime)), Z(e, t);
					};
					$(p, (e) => {
						Y(c) && e(m);
					}), D(r);
					var g = R(r, 2);
					let _;
					var v = R(g, 2), y = I(v), b = I(y), x = L(b, !0), S = R(b, 2), ee = (e) => {
						var t = ra(), n = L(t, !0);
						z((e) => Q(n, e), [() => h("screen.status.current")]), Z(e, t);
					};
					$(S, (e) => {
						Y(t).status === "current" && e(ee);
					}), D(y);
					var C = R(y, 2), te = (e) => {
						var n = aa(), r = I(n), i = (e) => {
							var n = ia(), r = L(n, !0);
							z((e) => Q(r, e), [() => h("screen.course.timetable", { name: Y(t).hit.timetableName })]), Z(e, n);
						};
						$(r, (e) => {
							s.scope === "all" && Y(t).hit.timetableName && e(i);
						});
						var a = R(r, 2), o = (e) => {
							var n = ia(), r = L(n, !0);
							z(() => Q(r, Y(t).hit.course.location)), Z(e, n);
						};
						$(a, (e) => {
							Y(t).hit.course.location && e(o);
						});
						var c = R(a, 2), l = (e) => {
							var n = ia(), r = L(n, !0);
							z(() => Q(r, Y(t).hit.course.teacher)), Z(e, n);
						};
						$(c, (e) => {
							Y(t).hit.course.teacher && e(l);
						}), D(n), Z(e, n);
					};
					$(C, (e) => {
						(s.scope === "all" && Y(t).hit.timetableName || Y(t).hit.course.location || Y(t).hit.course.teacher) && e(te);
					}), D(v), z(() => {
						Q(f, Y(u)), _ = Ir(g, "", _, { "background-color": Y(o).background }), Q(x, Y(t).hit.course.name);
					}), Z(e, n);
				}, o = /* @__PURE__ */ A(() => _(Y(t).hit)), c = /* @__PURE__ */ A(() => Wi(Y(l), Y(t).hit.course.startPeriod, Y(t).hit.course.endPeriod)), u = /* @__PURE__ */ A(() => Y(t).hit.course.startPeriod === Y(t).hit.course.endPeriod ? h("screen.course.periodSingle", { n: Y(t).hit.course.startPeriod }) : h("screen.course.periodRange", {
					start: Y(t).hit.course.startPeriod,
					end: Y(t).hit.course.endPeriod
				}));
				var r = I(n), i = (n) => {
					var r = sa(), i = I(r);
					e(i), D(r), z(() => Pr(r, 1, `flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-container-low ${Y(t).status === "past" ? "opacity-60" : ""}`)), Zn("click", r, () => y(Y(t).hit.course.id)), Z(n, r);
				}, a = (n) => {
					var r = ca(), i = I(r);
					e(i), D(r), z(() => Pr(r, 1, `flex gap-3 px-4 py-4 ${Y(t).status === "past" ? "opacity-60" : ""}`)), Z(n, r);
				};
				$(r, (e) => {
					Y(v) ? e(i) : e(a, -1);
				}), D(n);
			}
			Z(e, n);
		}), D(n), D(t), Z(e, t);
	};
	$(oe, (e) => {
		Y(c) ? s.courseEntries.length === 0 ? e(ce, 1) : e(le, -1) : e(se);
	}), D(ae), D(b), z((e) => Q(ee, e), [() => g(Y(u))]), Z(e, b), Ue();
}
Qn(["click"]);
//#endregion
//#region packages/plugins/today/bundle/entry.ts
var pa = Hi({ screenComponent: Oi(fa) });
//#endregion
export { pa as default };
