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
	return E(/* @__PURE__ */ Wt(T));
}
function D(t) {
	if (w) {
		if (/* @__PURE__ */ Wt(T) !== null) throw ge(), e;
		T = t;
	}
}
function be(e = 1) {
	if (w) {
		for (var t = e, n = T; t--;) n = /* @__PURE__ */ Wt(n);
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
		var i = /* @__PURE__ */ Wt(n);
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
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var O = null;
function Re(e) {
	O = e;
}
function ze(e, t = !1, n) {
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
function Be(e) {
	var t = O, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) an(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, O = t.p, Ve(e);
}
function Ve(e = {}) {
	return o(e, ce, { value: !0 }), e;
}
function He() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var Ue = [];
function We() {
	var e = Ue;
	Ue = [], p(e);
}
function Ge(e) {
	if (Ue.length === 0 && !ht) {
		var t = Ue;
		queueMicrotask(() => {
			t === Ue && We();
		});
	}
	Ue.push(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/status.js
var Ke = ~(_ | v | g);
function k(e, t) {
	e.f = e.f & Ke | t;
}
function qe(e) {
	e.f & 512 || e.deps === null ? k(e, g) : k(e, v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Je(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= re, Je(t.deps));
}
function Ye(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Je(e.deps), k(e, g);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/store.js
var Xe = !1;
function Ze(e) {
	var t = Xe;
	try {
		return Xe = !1, [e(), Xe];
	} finally {
		Xe = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Qe(e) {
	var t = H, n = G;
	W(null), En(null);
	try {
		return e();
	} finally {
		W(t), En(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function $e(e, t, n, r) {
	let i = He() ? rt : ot;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = G, c = et(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Zt(e, s);
			}
			tt();
		}
	}
	var d = nt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ at(e))).then(u).catch((e) => Zt(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), tt();
	}) : f();
}
function et() {
	var e = G, t = H, n = O, r = j;
	return function(i = !0) {
		En(e), W(t), Re(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function tt(e = !0) {
	En(null), W(null), Re(null), e && j?.deactivate();
}
function nt() {
	var e = G, t = e.b, n = j, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function rt(e) {
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
var it = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function at(e, n, r) {
	let i = G;
	i === null && De();
	var a = void 0, o = jt(t), s = !H, c = /* @__PURE__ */ new Set();
	return cn(() => {
		var t = G, n = m();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== me && n.reject(e);
			}).finally(tt);
		} catch (e) {
			n.reject(e), tt();
		}
		var r = j;
		if (s) {
			if (t.f & 32768) var l = nt();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(it);
			else for (let e of c.values()) e.reject(it);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== it && (r.activate(), t ? (o.f |= oe, Nt(o, t)) : (o.f & 8388608 && (o.f ^= oe), Nt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), nn(() => {
		for (let e of c) e.reject(it);
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
	let t = /* @__PURE__ */ rt(e);
	return On(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function ot(e) {
	let t = /* @__PURE__ */ rt(e);
	return t.equals = Te, t;
}
function st(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) V(t[n]);
	}
}
function ct(e) {
	var n, r = G, i = e.parent;
	if (!wn && i !== null && e.v !== t && i.f & 24576) return he(), e.v;
	En(i);
	try {
		e.f &= ~re, st(e), n = Ln(e);
	} finally {
		En(r);
	}
	return n;
}
function lt(e) {
	var t = ct(e);
	if (!e.equals(t) && (e.wv = Pn(), (!j?.is_fork || e.deps === null) && (j === null ? e.v = t : (j.capture(e, t, !0), pt?.capture(e, t, !0)), e.deps === null))) {
		k(e, g);
		return;
	}
	wn || (M === null ? qe(e) : (tn() || j?.is_fork) && M.set(e, t));
}
function ut(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Qe(() => {
		t.ac.abort(me), t.ac = null;
	}), t.fn !== null && (t.teardown = f), Bn(t, 0), pn(t));
}
function dt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Vn(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var ft = null, j = null, pt = null, M = null, mt = null, ht = !1, gt = !1, _t = null, vt = null, yt = 0, bt = 1, xt = class e {
	id = bt++;
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
		ft === null ? ft = this : (ft.#n = this, this.#t = ft), ft = this;
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
		this.#e = !0, yt++ > 1e3 && (this.#x(), St());
		for (let e of this.#u) this.#d.delete(e), k(e, _), this.schedule(e);
		for (let e of this.#d) k(e, v), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = _t = [], r = [], i = vt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Dt(e), this.#h() || this.discard(), t;
		}
		if (j = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (_t = null, vt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Et(e, t);
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
		this.#r.clear(), pt = this, wt(r), wt(n), pt = null, this.#s?.resolve();
		var s = j;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && (kt.clear(), s.#g());
	}
	#_(e, t, n) {
		e.f ^= g;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= g : i & 4 ? t.push(r) : Fn(r) && (i & 16 && this.#d.add(r), Vn(r));
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
		for (var t = 0; t < e.length; t += 1) Ye(e[t], this.#u, this.#d);
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
			gt = !0, j = this, this.#g();
		} finally {
			yt = 0, mt = null, _t = null, vt = null, gt = !1, j = null, M = null, kt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(it);
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
		this.#m || (this.#m = !0, Ge(() => {
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
			!gt && Ge(() => {
				t.#e || t.flush();
			});
		}
		return j;
	}
	apply() {
		M = null;
	}
	schedule(e) {
		if (mt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (_t !== null && t === G && (H === null || !(H.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? ft = e : t.#t = e, this.linked = !1;
		}
	}
};
function St() {
	try {
		Me();
	} catch (e) {
		Zt(e, mt);
	}
}
var Ct = null;
function wt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Fn(r) && (Ct = /* @__PURE__ */ new Set(), Vn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && gn(r), Ct?.size > 0)) {
				kt.clear();
				for (let e of Ct) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Ct.has(n) && (Ct.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Vn(n);
					}
				}
				Ct.clear();
			}
		}
		Ct = null;
	}
}
function Tt(e) {
	j.schedule(e);
}
function Et(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), k(e, g);
		for (var n = e.first; n !== null;) Et(n, t), n = n.next;
	}
}
function Dt(e) {
	k(e, g);
	for (var t = e.first; t !== null;) Dt(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var Ot = /* @__PURE__ */ new Set(), kt = /* @__PURE__ */ new Map(), At = !1;
function jt(e, t) {
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
	let n = jt(e, t);
	return On(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Mt(e, t = !1, n = !0) {
	let r = jt(e);
	return t || (r.equals = Te), r;
}
function P(e, t, n = !1) {
	return H !== null && (!U || H.f & 131072) && He() && H.f & 4325394 && (Dn === null || !Dn.has(e)) && Ie(), Nt(e, n ? Lt(t) : t, vt);
}
function Nt(e, t, n = null) {
	if (!e.equals(t)) {
		wn ? kt.set(e, t) : kt.has(e) || kt.set(e, e.v);
		var r = xt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && ct(t), M === null && qe(t);
		}
		e.wv = Pn(), It(e, _, n), He() && G !== null && G.f & 1024 && !(G.f & 96) && (J === null ? kn([e]) : J.push(e)), !r.is_fork && Ot.size > 0 && !At && Pt();
	}
	return t;
}
function Pt() {
	At = !1;
	for (let e of Ot) {
		e.f & 1024 && k(e, v);
		let t;
		try {
			t = Fn(e);
		} catch {
			t = !0;
		}
		t && Vn(e);
	}
	Ot.clear();
}
function Ft(e) {
	P(e, e.v + 1);
}
function It(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = He(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === G)) {
			var l = (c & _) === 0;
			if (l && k(s, t), c & 131072) Ot.add(s);
			else if (c & 2) {
				var u = s;
				M?.delete(u), c & 65536 || (c & 512 && (G === null || !(G.f & 2097152)) && (s.f |= re), It(u, v, n));
			} else if (l) {
				var d = s;
				c & 16 && Ct !== null && Ct.add(d), n === null ? Tt(d) : n.push(d);
			}
		}
	}
}
function Lt(e) {
	if (typeof e != "object" || !e || se in e || ce in e) return e;
	let r = u(e);
	if (r !== c && r !== l) return e;
	var i = /* @__PURE__ */ new Map(), a = n(e), o = /* @__PURE__ */ N(0), d = null, f = Mn, p = (e) => {
		if (Mn === f) return e();
		var t = H, n = Mn;
		W(null), Nn(f);
		var r = e();
		return W(t), Nn(n), r;
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
					i.set(n, e), Ft(o);
				}
			} else P(r, t), Ft(o);
			return !0;
		},
		get(n, r, a) {
			if (r === se) return e;
			var o = i.get(r), c = r in n;
			if (o === void 0 && (!c || s(n, r)?.writable) && (o = p(() => /* @__PURE__ */ N(Lt(c ? n[r] : t), d)), i.set(r, o)), o !== void 0) {
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
			return (r !== void 0 || G !== null && (!a || s(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ N(a ? Lt(e[n]) : t, d)), i.set(n, r)), Y(r) === t) ? !1 : a;
		},
		set(e, n, r, c) {
			var l = i.get(n), u = n in e;
			if (a && n === "length") for (var f = r; f < l.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ N(t, d)), i.set(f + "", m)) : P(m, t);
			}
			if (l === void 0) (!u || s(e, n)?.writable) && (l = p(() => /* @__PURE__ */ N(void 0, d)), P(l, Lt(r)), i.set(n, l));
			else {
				u = l.v !== t;
				var h = p(() => Lt(r));
				P(l, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(c, r), !u) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && P(_, v + 1);
				}
				Ft(o);
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
var Rt, zt, Bt, Vt;
function Ht() {
	if (Rt === void 0) {
		Rt = window, zt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Bt = s(t, "firstChild").get, Vt = s(t, "nextSibling").get, d(e) && (e[de] = void 0, e[ue] = null, e[fe] = void 0, e.__e = void 0), d(n) && (n[pe] = void 0);
	}
}
function F(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Ut(e) {
	return Bt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Wt(e) {
	return Vt.call(e);
}
function I(e, t) {
	if (!w) return /* @__PURE__ */ Ut(e);
	var n = /* @__PURE__ */ Ut(T);
	if (n === null) n = T.appendChild(F());
	else if (t && n.nodeType !== 3) {
		var r = F();
		return n?.before(r), E(r), r;
	}
	return t && Yt(n), E(n), n;
}
function Gt(e, t = !1) {
	if (!w) {
		var n = /* @__PURE__ */ Ut(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Wt(n) : n;
	}
	if (t) {
		if (T?.nodeType !== 3) {
			var r = F();
			return T?.before(r), E(r), r;
		}
		Yt(T);
	}
	return T;
}
function L(e, t = !1) {
	if (!w) return /* @__PURE__ */ Ut(e);
	var n = I(e, t);
	return D(e), n;
}
function R(e, t = 1, n = !1) {
	let r = w ? T : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Wt(r);
	if (!w) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = F();
			return r === null ? i?.after(a) : r.before(a), E(a), a;
		}
		Yt(r);
	}
	return E(r), r;
}
function Kt(e) {
	e.textContent = "";
}
function qt() {
	return !1;
}
function Jt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Yt(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function Xt(e) {
	var t = G;
	if (t === null) return H.f |= oe, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Zt(e, t);
}
function Zt(e, t) {
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
function Qt(e) {
	G === null && (H === null && je(e), Ae()), wn && ke(e);
}
function $t(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function en(e, t) {
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
	if (e & 4) _t === null ? xt.ensure().schedule(r) : _t.push(r);
	else if (t !== null) {
		try {
			Vn(r);
		} catch (e) {
			throw V(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ee));
	}
	if (i !== null && (i.parent = n, n !== null && $t(i, n), H !== null && H.f & 2 && !(e & 64))) {
		var a = H;
		(a.effects ??= []).push(i);
	}
	return r;
}
function tn() {
	return H !== null && !U;
}
function nn(e) {
	let t = en(8, null);
	return k(t, g), t.teardown = e, t;
}
function rn(e) {
	Qt("$effect");
	var t = G.f;
	if (!H && t & 32 && O !== null && !O.i) {
		var n = O;
		(n.e ??= []).push(e);
	} else return an(e);
}
function an(e) {
	return en(4 | te, e);
}
function on(e) {
	xt.ensure();
	let t = en(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? _n(t, () => {
			V(t), n(void 0);
		}) : (V(t), n(void 0));
	});
}
function sn(e) {
	return en(4, e);
}
function cn(e) {
	return en(ae | C, e);
}
function ln(e, t = 0) {
	return en(8 | t, e);
}
function z(e, t = [], n = [], r = []) {
	$e(r, t, n, (t) => {
		en(8, () => {
			e(...t.map(Y));
		});
	});
}
function un(e, t = 0) {
	return en(16 | t, e);
}
function dn(e, t = 0) {
	return en(h | t, e);
}
function B(e) {
	return en(32 | C, e);
}
function fn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = wn, r = H;
		Tn(!0), W(null);
		try {
			t.call(null);
		} catch (t) {
			Zt(t, e.parent);
		} finally {
			Tn(n), W(r);
		}
	}
}
function pn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Qe(() => {
			e.abort(me);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : V(n, t), n = r;
	}
}
function mn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || V(t), t = n;
	}
}
function V(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (hn(e.nodes.start, e.nodes.end), n = !0), e.f |= S, pn(e, t && !n), Bn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	fn(e), e.f ^= S, e.f |= b;
	var i = e.parent;
	i !== null && i.first !== null && gn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function hn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Wt(e);
		e.remove(), e = n;
	}
}
function gn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function _n(e, t, n = !0) {
	var r = [];
	e.f |= 256, vn(e, r, !0);
	var i = () => {
		n && V(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function vn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= y;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				vn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function yn(e) {
	e.f &= -257, bn(e, !0);
}
function bn(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= y, e.f & 1024 || (k(e, _), xt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			bn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function xn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Wt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var Sn = null, Cn = !1, wn = !1;
function Tn(e) {
	wn = e;
}
var H = null, U = !1;
function W(e) {
	H = e;
}
var G = null;
function En(e) {
	G = e;
}
var Dn = null;
function On(e) {
	H !== null && (Dn ??= /* @__PURE__ */ new Set()).add(e);
}
var K = null, q = 0, J = null;
function kn(e) {
	J = e;
}
var An = 1, jn = 0, Mn = jn;
function Nn(e) {
	Mn = e;
}
function Pn() {
	return ++An;
}
function Fn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~re), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Fn(a) && lt(a), a.wv > e.wv) return !0;
		}
		t & 512 && M === null && k(e, g);
	}
	return !1;
}
function In(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Dn !== null && Dn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? In(a, t, !1) : t === a && (n ? k(a, _) : a.f & 1024 && k(a, v), Tt(a));
	}
}
function Ln(e) {
	var t = K, n = q, r = J, i = H, a = Dn, o = O, s = U, c = Mn, l = e.f;
	K = null, q = 0, J = null, H = l & 96 ? null : e, Dn = null, Re(e.ctx), U = !1, Mn = ++jn, e.ac !== null && (Qe(() => {
		e.ac.abort(me);
	}), e.ac = null);
	try {
		e.f |= ie;
		var u = e.fn, d = u();
		e.f |= x;
		var f = Rn(e);
		if (He() && J !== null && !U && f !== null && !(e.f & 6146)) for (var p = 0; p < J.length; p++) In(J[p], e);
		if (i !== null && i !== e) {
			if (jn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = jn;
			if (t !== null) for (let e of t) e.rv = jn;
			J !== null && (r === null ? r = J : r.push(...J));
		}
		return e.f & 8388608 && (e.f ^= oe), d;
	} catch (t) {
		return Rn(e), Xt(t);
	} finally {
		e.f ^= ie, K = t, q = n, J = r, H = i, Dn = a, Re(o), U = s, Mn = c;
	}
}
function Rn(e) {
	var t = e.deps, n = j?.is_fork;
	if (K !== null) {
		var r;
		if (n || Bn(e, q), t !== null && q > 0) for (t.length = q + K.length, r = 0; r < K.length; r++) t[q + r] = K[r];
		else e.deps = t = K;
		if (tn() && e.f & 512) for (r = q; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && q < t.length && (Bn(e, q), t.length = q);
	return t;
}
function zn(e, n) {
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
		c.f & 512 && (c.f ^= 512, c.f &= ~re), c.v !== t && qe(c), c.ac !== null && Qe(() => {
			c.ac.abort(me), c.ac = null, k(c, _);
		}), ut(c), Bn(c, 0);
	}
}
function Bn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) zn(e, n[r]);
}
function Vn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		k(e, g);
		var n = G, r = Cn;
		G = e, Cn = !(t & 96);
		try {
			t & 16777232 ? mn(e) : pn(e), fn(e);
			var i = Ln(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = An;
		} finally {
			Cn = r, G = n;
		}
	}
}
function Y(e) {
	var t = !!(e.f & 2);
	if (Sn?.add(e), H !== null && !U && !(G !== null && G.f & 16384) && (Dn === null || !Dn.has(e))) {
		var n = H.deps;
		if (H.f & 2097152) e.rv < jn && (e.rv = jn, K === null && n !== null && n[q] === e ? q++ : K === null ? K = [e] : K.push(e));
		else {
			H.deps ??= [], i.call(H.deps, e) || H.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [H] : i.call(r, H) || r.push(H);
		}
	}
	if (wn && kt.has(e)) return kt.get(e);
	if (t) {
		var a = e;
		if (wn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Un(a)) && (o = ct(a)), kt.set(a, o), o;
		}
		var s = !(a.f & 512) && !U && H !== null && (Cn || !!(H.f & 512)), c = (a.f & x) === 0;
		Fn(a) && (s && (a.f |= 512), lt(a)), s && !c && (dt(a), Hn(a));
	}
	if (M?.has(e)) return M.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Hn(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (dt(t), Hn(t));
}
function Un(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (kt.has(t) || t.f & 2 && Un(t)) return !0;
	return !1;
}
function Wn(e) {
	var t = U;
	try {
		return U = !0, e();
	} finally {
		U = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var Gn = Symbol("events"), Kn = /* @__PURE__ */ new Set(), qn = /* @__PURE__ */ new Set();
function Jn(e, t, n) {
	(t[Gn] ??= {})[e] = n;
}
function Yn(e) {
	for (var t = 0; t < e.length; t++) Kn.add(e[t]);
	for (var n of qn) n(e);
}
var Xn = null, Zn = !1;
function Qn(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	Xn = e, Zn || (Zn = !0, setTimeout(() => {
		Zn = !1, Xn = null;
	}));
	var s = 0, c = Xn === e && e[Gn];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Gn] = t;
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
		W(null), En(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[Gn]?.[r];
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
			e[Gn] = t, delete e.currentTarget, W(d), En(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var $n = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function er(e) {
	return $n?.createHTML(e) ?? e;
}
function tr(e) {
	var t = Jt("template");
	return t.innerHTML = er(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function nr(e, t) {
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
		if (w) return nr(T, null), T;
		i === void 0 && (i = tr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Ut(i)));
		var t = r || zt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Ut(t), s = t.lastChild;
			nr(o, s);
		} else nr(t, t);
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
var rr = ["touchstart", "touchmove"];
function ir(e) {
	return rr.includes(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function ar(e) {
	let t = 0, n = jt(0), r;
	return () => {
		tn() && (Y(n), ln(() => (t === 0 && (r = Wn(() => e(() => Ft(n)))), t += 1, () => {
			Ge(() => {
				--t, t === 0 && (r?.(), r = void 0, Ft(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var or = ee | C;
function sr(e, t, n, r) {
	new cr(e, t, n, r);
}
var cr = class {
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
	#h = ar(() => (this.#m = jt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = G;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = G.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = un(() => {
			if (w) {
				let e = this.#t;
				ye();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, or), w && (this.#e = T);
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
		Ge(r), t && (this.#s = B(() => {
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
			t = !0, n && Le(), this.#s !== null && _n(this.#s, () => {
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
					Zt(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = B(() => e(this.#e)), Ge(() => {
			var e = this.#c = document.createDocumentFragment(), t = F(), n = !1;
			if (e.append(t), this.#a = this.#S(() => {
				try {
					return B(() => this.#r(t));
				} catch (e) {
					try {
						this.error(e), n = !0;
					} catch (e) {
						Zt(e, this.#i.parent);
					}
					return null;
				}
			}), this.#a === null) {
				this.#c = null, n && this.#x(j);
				return;
			}
			this.#u === 0 && (this.#e.before(e), this.#c = null, _n(this.#o, () => {
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
				xn(this.#a, e);
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
		Ye(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = G, n = H, r = O;
		En(this.#i), W(this.#i), Re(this.#i.ctx);
		try {
			return xt.ensure(), e();
		} finally {
			En(t), W(n), Re(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && _n(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ge(() => {
			this.#d = !1, this.#m && Nt(this.#m, this.#l);
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
					return Zt(e, this.#i.parent), null;
				}
			}));
		};
		Ge(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Zt(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Zt(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
function Q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[pe] ??= e.nodeValue) && (e[pe] = n, e.nodeValue = `${n}`);
}
function lr(e, t) {
	return dr(e, t);
}
var ur = /* @__PURE__ */ new Map();
function dr(t, { target: n, anchor: r, props: i = {}, events: o, context: s, intro: c = !0, transformError: l }) {
	Ht();
	var u = void 0, d = on(() => {
		var c = r ?? n.appendChild(F());
		sr(c, { pending: () => {} }, (n) => {
			ze({});
			var r = O;
			if (s && (r.c = s), o && (i.$$events = o), w && nr(n, null), u = t(n, i) || Ve(), w && (G.nodes.end = T, T === null || T.nodeType !== 8 || T.data !== "]")) throw ge(), e;
			Be();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = ir(r);
					for (let e of [n, document]) {
						var a = ur.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), ur.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Qn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(a(Kn)), qn.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = ur.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, Qn), t.delete(e), t.size === 0 && ur.delete(r)) : t.set(e, i);
			}
			qn.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return fr.set(u, d), u;
}
var fr = /* @__PURE__ */ new WeakMap();
function pr(e, t) {
	let n = fr.get(e);
	return n ? (fr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var mr = class {
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
			if (n) yn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (yn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
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
						xn(r, t), t.append(F()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else V(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), _n(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (V(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = j, r = qt();
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
function hr(e) {
	O === null && Ee("onMount"), rn(() => {
		let t = Wn(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/if.js
function $(e, t, n = !1) {
	var r;
	w && (r = T, ye());
	var i = new mr(e), a = n ? ee : 0;
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
	un(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function gr(e, t, n) {
	for (var r = [], i = t.length, o, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		_n(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					_r(e, a(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			Kt(d), d.append(u), e.items.clear();
		}
		_r(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function _r(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ne, xn(a, document.createDocumentFragment())) : V(t[i], n);
	}
}
var vr;
function yr(e, t, r, i, o, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = w ? E(/* @__PURE__ */ Ut(u)) : u.appendChild(F());
	}
	w && ye();
	var d = null, f = /* @__PURE__ */ ot(() => {
		var e = r();
		return n(e) ? e : e == null ? [] : a(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, xr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ne, Cr(d, null, c)) : yn(d) : _n(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: un(() => {
			p = Y(f);
			var e = p.length;
			let n = !1;
			w && Se(c) === "[!" != (e === 0) && (c = xe(), E(c), ve(!1), n = !0);
			for (var a = /* @__PURE__ */ new Set(), u = j, v = qt(), y = 0; y < e; y += 1) {
				w && T.nodeType === 8 && T.data === "]" && (c = T, n = !0, ve(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && Nt(S.v, b), S.i && Nt(S.i, y), v && u.unskip_effect(S.e)) : (S = Sr(l, h ? c : vr ??= F(), b, x, y, o, t, r), h || (S.e.f |= ne), l.set(x, S)), a.add(x);
			}
			if (e === 0 && s && !d && (h ? d = B(() => s(c)) : (d = B(() => s(vr ??= F())), d.f |= ne)), e > a.size && Oe("", "", ""), w && e > 0 && E(xe()), !h) {
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
function br(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function xr(e, t, n, r, i) {
	var o = !!(r & 8), s = t.length, c = e.items, l = br(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (yn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ne, _ === l) Cr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), wr(e, d, _), wr(e, _, y), Cr(_, y, n), d = _, p = [], m = [], l = br(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Cr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					wr(e, S.prev, ee.next), wr(e, d, S), wr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), Cr(_, l, n), wr(e, _.prev, _.next), wr(e, _, d === null ? e.effect.first : d.next), wr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = br(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = br(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (_r(e, a(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var C = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || C.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && C.push(l), l = br(l.next);
		var te = C.length;
		if (te > 0) {
			var re = r & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.measure();
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.fix();
			}
			gr(e, C, re);
		}
	}
	o && Ge(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Sr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? jt(n) : /* @__PURE__ */ Mt(n, !1, !1) : null, l = o & 2 ? jt(i) : null;
	return {
		v: c,
		i: l,
		e: B(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Cr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Wt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function wr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function Tr(e, t) {
	var n = void 0, r;
	dn(() => {
		n !== (n = t()) && (r &&= (V(r), null), n && (r = B(() => {
			sn(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var Er = [..." 	\n\r\f\xA0\v﻿"];
function Dr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Er.includes(r[o - 1])) && (s === r.length || Er.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Or(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function kr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Ar(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(kr)), i && c.push(...Object.keys(i).map(kr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = kr(e.substring(l, u).trim());
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
		return r && (n += Or(r)), i && (n += Or(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function jr(e, t, n, r, i, a) {
	var o = e[de];
	if (w || o !== n || o === void 0) {
		var s = Dr(n, r, a);
		(!w || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[de] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/style.js
function Mr(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Nr(e, t, n, r) {
	var i = e[fe];
	if (w || i !== t) {
		var a = Ar(t, r);
		(!w || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[fe] = t;
	} else r && (Array.isArray(r) ? (Mr(e, n?.[0], r[0]), Mr(e, n?.[1], r[1], "important")) : Mr(e, n, r));
	return r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/props.js
function Pr(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), c = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ rt(r), Y(u)) : (l && (l = !1, c = o ? Wn(r) : r), c);
	let f;
	if (a) {
		var p = se in e || le in e;
		f = s(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = Ze(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Ne(t), f(m)));
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
	var v = !1, y = (n & 1 ? rt : ot)(() => (v = !1, g()));
	a && Y(y);
	var b = G;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? Y(y) : i && a ? Lt(e) : e;
			return P(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return wn && v || b.f & 16384 ? y.v : Y(y);
	});
}
//#endregion
//#region packages/core/src/algorithms/display-models.ts
function Fr(e, t) {
	return t <= 0 || e.endPeriod >= 1 && e.startPeriod <= t;
}
//#endregion
//#region packages/core/src/algorithms/palette.ts
var Ir = [
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
], Lr = Ir.map(([e, t]) => ({
	background: e,
	foreground: t
})), Rr = /\s+/g;
function zr(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = t * 31 + e.charCodeAt(n) | 0;
	return t;
}
function Br(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(Rr, " ");
}
function Vr(e) {
	return Ir[Math.abs(zr(e) % Ir.length)] ?? Ir[0];
}
function Hr(e) {
	let [t] = Vr(e), n = Ir.findIndex(([e]) => e === t);
	return n >= 0 ? n : 0;
}
function Ur(e, t = Lr) {
	let n = e.name ? Br(e.name) : "";
	return !n || t.length === 0 ? Lr[0] : t[Hr(n) % t.length];
}
function Wr(e, t = Lr) {
	if (t.length === 0) return /* @__PURE__ */ new Map();
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Br(t.name), r = Hr(e);
		n.has(e) || n.set(e, {
			name: e,
			slot: r,
			hash: zr(e)
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
//#region packages/core/src/algorithms/date.ts
function Gr(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function Kr(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function qr(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function Jr(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function Yr(e, t) {
	return Jr(e, t * 7);
}
function Xr(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function Zr(e, t) {
	return e.getTime() < t.getTime();
}
function Qr(e) {
	return Kr(qr(Gr(e)));
}
function $r(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function ei(e) {
	let t = (/* @__PURE__ */ new Date(`${e}T12:00:00`)).getDay();
	return t === 0 ? 7 : t;
}
//#endregion
//#region packages/core/src/algorithms/calendar.ts
var ti = class {
	normalizeTermStartDate(e, t) {
		let n = Gr(Qr(t));
		if (!e || !e.trim()) return Kr(qr(n));
		try {
			return Kr(qr(Gr(e)));
		} catch {
			return Kr(qr(this.inferTermStartDateFromTermName(e) || n));
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
		}, r = Gr(this.normalizeTermStartDate(n.termStartDate, e)), i = Gr(e);
		if (Zr(i, r)) return n.startWeek;
		let a = Xr(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return Kr(Yr(Gr(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return Kr(Jr(Gr(this.resolveWeekStart(e, t, r)), n - 1));
	}
};
//#endregion
//#region packages/core/src/algorithms/period-clock.ts
function ni(e) {
	let t = /^(\d{1,2}):(\d{2})$/.exec(e.trim());
	return t ? Number(t[1]) * 60 + Number(t[2]) : 0;
}
function ri(e) {
	return e.map((e) => ({
		index: e.index,
		startMinutes: ni(e.startTime),
		endMinutes: ni(e.endTime)
	})).sort((e, t) => e.index - t.index);
}
function ii(e) {
	return e.getHours() * 60 + e.getMinutes();
}
function ai(e, t, n = "upcomingOrLast") {
	let r = null;
	for (let n of e) {
		if (t >= n.startMinutes && t <= n.endMinutes) return n.index;
		r == null && t < n.startMinutes && (r = n.index);
	}
	return n === "none" ? null : r ?? e.at(-1)?.index ?? null;
}
//#endregion
//#region packages/core/src/types/services.ts
function oi(e) {
	return { key: e };
}
var si = oi("storage"), ci = oi("hostNavigation");
//#endregion
//#region packages/core/src/i18n/i18n-catalog.ts
function li(e, t) {
	return t ? e.replace(/\{(\w+)\}/g, (e, n) => {
		let r = t[n];
		return r == null ? `{${n}}` : typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? String(r) : JSON.stringify(r);
	}) : e;
}
//#endregion
//#region packages/core/src/types/mountable.ts
var ui = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.on-surface,color.primary,color.on-primary,color.surface-variant,color.outline,color.secondary,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,color.outline-variant,color.surface-container-high,color.canvas,color.ink,color.border-subtle,color.success,color.warning,color.danger,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
//#endregion
//#region packages/core/src/plugin/define-chronos-plugin.ts
function di(e, t, n = "zh-cn") {
	return e[n]?.[t] ?? e.en?.[t] ?? t;
}
function fi() {
	return "0.4.8";
}
function pi(e) {
	let t;
	return {
		id: e.id,
		name: () => t?.(e.nameKey) ?? di(e.messages, e.nameKey),
		version: e.version ?? fi(),
		description: e.descriptionKey ? () => t?.(e.descriptionKey) ?? di(e.messages, e.descriptionKey) : void 0,
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
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), Yn(["input"]), Yn(["change"]), Yn(["change"]), Yn(["change"]);
//#endregion
//#region packages/ui-kit/src/utils/middle-truncate.ts
var mi = null;
function hi(e) {
	if (typeof document > "u") return () => Infinity;
	mi ??= document.createElement("canvas");
	let t = mi.getContext("2d");
	return t ? (t.font = e, (e) => t.measureText(e).width) : () => Infinity;
}
function gi(e, t, n, r = 6) {
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
function _i(e) {
	let t = getComputedStyle(e), n = t.fontStyle || "normal", r = t.fontWeight || "normal", i = t.fontFamily || "sans-serif";
	return (e) => hi(`${n} ${r} ${e}px ${i}`);
}
//#endregion
//#region packages/ui-kit/src/utils/fit-width-font.svelte.ts
var vi = 6;
function yi(e) {
	return (t) => {
		let n = () => {
			let { lines: n, maxFontPx: r, minFontPx: i = vi, fromParent: a = !1, availableWidthPx: o } = e(), s = n.filter((e) => e.length > 0), c = o ?? (a ? t.parentElement ?? t : t).clientWidth;
			if (a) {
				let e = getComputedStyle(t);
				c -= (Number.parseFloat(e.paddingLeft) || 0) + (Number.parseFloat(e.paddingRight) || 0), c = Math.max(0, c);
			}
			if (c <= 0 || s.length === 0) return;
			let l = _i(t), u = gi(c, (e) => {
				let t = l(e);
				return Math.max(...s.map((e) => t(e)));
			}, r, i);
			t.style.fontSize = `${u}px`;
		}, r = null, i = new ResizeObserver(n);
		return rn(() => {
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
//#region packages/ui-kit/src/schema-form/inputs/WallpaperPreviewField.svelte
Yn(["click"]), Yn(["change"]);
//#endregion
//#region packages/ui-kit/src/form/date-field-utils.ts
function bi(e) {
	return e?.toLowerCase() === "en" ? "en" : "zh-CN";
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
Yn(["click"]), Yn(["click"]), Yn(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function xi(e) {
	return {
		[ui]: !0,
		mount(t, n) {
			let r = lr(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				pr(r);
			} };
		}
	};
}
//#endregion
//#region packages/ui-kit/src/i18n/plugin-text.ts
function Si(e, t, n, r, i) {
	let a = n["zh-cn"][r] ?? n.en?.[r] ?? String(r);
	if (!e) return li(a, i);
	e.slotVersion;
	let o = e.translatePlugin(t, r, i);
	return o === r ? li(a, i) : o;
}
//#endregion
//#region packages/ui-kit/src/haptic/haptic.ts
var Ci = "chronos_preferences:haptic_feedback_enabled", wi = "__CHRONOS_NATIVE__";
function Ti() {
	if (typeof window > "u") return null;
	let e = window[wi];
	return typeof e == "object" && e && typeof e.callNative == "function" ? e : null;
}
function Ei() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Di() {
	if (typeof window > "u") return !1;
	try {
		if (typeof localStorage > "u") return !0;
		let e = localStorage.getItem(Ci);
		return e !== "0" && e !== "false";
	} catch {
		return !0;
	}
}
function Oi(e) {
	if (!Ei()) return !1;
	try {
		return navigator.vibrate(e);
	} catch {
		return !1;
	}
}
function ki(e, t) {
	if (!Di()) return !1;
	let n = Ti();
	return n ? (n.callNative("haptic", e.method, e.params ?? {}).catch(() => {
		Oi(t);
	}), !0) : Oi(t);
}
var Ai = {
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
}, ji = {
	light() {
		return ki({
			method: "impact",
			params: { style: "light" }
		}, Ai.light);
	},
	medium() {
		return ki({
			method: "impact",
			params: { style: "medium" }
		}, Ai.medium);
	},
	heavy() {
		return ki({
			method: "impact",
			params: { style: "heavy" }
		}, Ai.heavy);
	},
	success() {
		return ki({
			method: "notification",
			params: { type: "success" }
		}, Ai.success);
	},
	warning() {
		return ki({
			method: "notification",
			params: { type: "warning" }
		}, Ai.warning);
	},
	cancel() {
		if (Ei()) try {
			return navigator.vibrate(0);
		} catch {
			return !1;
		}
		return !1;
	}
}, Mi = {
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
}, Ni = "tool-today";
//#endregion
//#region packages/plugins/today/src/index.ts
function Pi(e = {}) {
	let { screenComponent: t } = e;
	return pi({
		id: Ni,
		messages: Mi,
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
				id: Ni,
				title: () => n("screen.title"),
				...t ? { component: t } : {}
			});
		}
	});
}
//#endregion
//#region packages/plugins/today/src/today-courses.ts
var Fi = new ti();
function Ii(e, t, n) {
	let r = e.find((e) => e.index === t), i = e.find((e) => e.index === n);
	return !r || !i ? null : {
		startTime: r.startTime,
		endTime: i.endTime
	};
}
function Li(e) {
	return [...e].sort((e, t) => {
		let n = e.course.startPeriod - t.course.startPeriod;
		if (n !== 0) return n;
		let r = e.course.endPeriod - t.course.endPeriod;
		return r === 0 ? e.course.name.localeCompare(t.course.name, "zh-CN") : r;
	});
}
function Ri(e, t, n, r) {
	let i = ri(t), a = i.find((t) => t.index === e.startPeriod), o = i.find((t) => t.index === e.endPeriod);
	if (a && o) {
		if (n > o.endMinutes) return "past";
		if (n >= a.startMinutes && n <= o.endMinutes) return "current";
		if (n < a.startMinutes) return "upcoming";
	}
	return r == null ? "upcoming" : e.endPeriod < r ? "past" : e.startPeriod <= r && e.endPeriod >= r ? "current" : "upcoming";
}
function zi(e, t, n, r) {
	return Li(e).map((e) => ({
		hit: e,
		status: Ri(e.course, t, n, r)
	}));
}
async function Bi(e, t) {
	let { todayIso: n, scope: r, timetable: i } = t;
	if (!i) return [];
	let a = ei(n);
	if (r === "active") {
		let t = Fi.calculateAcademicWeek(n, i.academicConfig);
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
		let t = Fi.calculateAcademicWeek(n, e.academicConfig), r = c.get(t) ?? [];
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
function Vi() {
	let e = /* @__PURE__ */ N(null), t = "", n = /* @__PURE__ */ N("active"), r = /* @__PURE__ */ N([]), i, a;
	function o() {
		return Y(e)?.currentTimetable ?? null;
	}
	function s() {
		return o()?.academicConfig.periodTimes ?? [];
	}
	let c = /* @__PURE__ */ A(() => Y(e)?.clockTodayIso || $r()), l = /* @__PURE__ */ A(() => Y(e)?.clockNow ?? /* @__PURE__ */ new Date()), u = /* @__PURE__ */ A(() => {
		let t = Y(e), n = t?.clockNow ?? /* @__PURE__ */ new Date(), r = ri(s());
		return r.length === 0 ? t?.currentPeriodIndex ?? null : ai(r, ii(n));
	});
	async function d() {
		let i = Y(e), a = o();
		if (!i || !a) {
			P(r, []);
			return;
		}
		try {
			let e = await Bi(i.getPluginContext(t).service(si), {
				todayIso: Y(c),
				scope: Y(n),
				timetable: a
			}), o = s(), d = e.filter((e) => Fr(e.course, o.length));
			P(r, zi(d, o, ii(Y(l)), Y(u)));
		} catch {
			P(r, []);
		}
	}
	async function f() {
		let r = Y(e);
		if (r) try {
			let e = r.getPluginContext(t);
			P(n, e.config.scope ?? "active", !0);
		} catch {
			P(n, "active");
		}
	}
	async function p(n, r) {
		if (!Y(e)) {
			P(e, n, !0), t = r, await f();
			try {
				let e = n.getPluginContext(t), r = e.on("time:tick", () => {
					d();
				});
				i = () => r.dispose();
				let o = e.on("timetable:switched", () => {
					d();
				});
				a = () => o.dispose();
			} catch {}
			await d();
		}
	}
	async function m(r) {
		r !== Y(n) && ji.medium(), P(n, r, !0);
		let i = Y(e);
		if (i) {
			try {
				await i.getPluginContext(t).updateConfig({ scope: r });
			} catch {}
			await d();
		}
	}
	function h() {
		i?.(), i = void 0, a?.(), a = void 0, P(e, null), t = "", P(r, []);
	}
	return rn(() => {
		let t = Y(e);
		t && (t.clockNow, t.clockTodayIso, Y(n), o()?.id, o()?.academicConfig.periodTimes, d());
	}), {
		get today() {
			return Y(c);
		},
		get now() {
			return Y(l);
		},
		get scope() {
			return Y(n);
		},
		get courseEntries() {
			return Y(r);
		},
		get currentPeriodIndex() {
			return Y(u);
		},
		init: p,
		dispose: h,
		persistScope: m,
		refreshCourses: d
	};
}
//#endregion
//#region packages/plugins/today/src/TodayScreen.svelte
var Hi = /* @__PURE__ */ X("<p class=\"text-label-large shrink-0 text-on-surface-variant\"> </p>"), Ui = /* @__PURE__ */ X("<div class=\"mt-1 flex items-center justify-between gap-3\"><p class=\"text-body-medium text-on-surface-variant\"> </p> <!></div>"), Wi = /* @__PURE__ */ X("<div></div>"), Gi = /* @__PURE__ */ X("<button type=\"button\"> </button>"), Ki = /* @__PURE__ */ X("<section class=\"flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs\"><div class=\"mb-4 flex size-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" class=\"size-8 fill-current\"><path d=\"M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z\"></path></svg></div> <p class=\"text-title-medium text-on-surface\"> </p></section>"), qi = /* @__PURE__ */ X("<section class=\"flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs\"><div class=\"mb-4 flex size-16 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" class=\"size-8 fill-current\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"></path></svg></div> <p class=\"text-title-medium text-on-surface\"> </p> <p class=\"text-body-medium mt-2 text-on-surface-variant\"> </p></section>"), Ji = /* @__PURE__ */ X("<p class=\"text-label-medium text-on-surface tabular-nums\"> </p>"), Yi = /* @__PURE__ */ X("<span class=\"text-label-small shrink-0 rounded-full bg-primary px-2 py-0.5 text-on-primary\"> </span>"), Xi = /* @__PURE__ */ X("<p> </p>"), Zi = /* @__PURE__ */ X("<div class=\"text-body-small mt-1 flex flex-col gap-1 text-on-surface-variant\"><!> <!> <!></div>"), Qi = /* @__PURE__ */ X("<div class=\"flex w-11 shrink-0 flex-col items-center self-stretch\"><!> <div class=\"flex min-h-0 w-full flex-1 flex-col items-center justify-center\"><p class=\"text-headline-small w-full min-w-0 text-center font-bold whitespace-nowrap text-on-surface-variant\"> </p></div> <!></div> <div class=\"w-1 shrink-0 self-stretch rounded-full\" aria-hidden=\"true\"></div> <div class=\"min-w-0 flex-1\"><div class=\"flex items-start justify-between gap-2\"><p class=\"text-title-medium truncate text-on-surface\"> </p> <!></div> <!></div>", 1), $i = /* @__PURE__ */ X("<button type=\"button\"><!></button>"), ea = /* @__PURE__ */ X("<div><!></div>"), ta = /* @__PURE__ */ X("<li><!></li>"), na = /* @__PURE__ */ X("<section class=\"overflow-hidden rounded-2xl border border-outline/20 bg-surface shadow-xs\"><ul class=\"divide-y divide-outline/10\"></ul></section>"), ra = /* @__PURE__ */ X("<div class=\"flex min-h-0 flex-1 flex-col overflow-y-auto\"><header class=\"border-b border-outline/10 bg-surface px-4 pt-6 pb-4\"><p class=\"text-headline-small text-on-surface\"> </p> <!> <div class=\"rounded-pill relative mt-4 flex w-full border border-border bg-surface p-1.5 shadow-xs\"><!> <!></div></header> <div class=\"flex flex-1 flex-col gap-4 p-4\"><!></div></div>");
function ia(e, t) {
	ze(t, !0);
	let n = Pr(t, "active", 3, !0), r = new ti(), i = Vi(), a = /* @__PURE__ */ A(() => t.controller.currentTimetable), o = /* @__PURE__ */ A(() => Y(a)?.academicConfig.periodTimes ?? []), s = /* @__PURE__ */ A(() => t.controller.clockTodayIso || i.today), c = /* @__PURE__ */ A(() => Y(a) ? r.calculateAcademicWeek(Y(s), Y(a).academicConfig) : 1), l = /* @__PURE__ */ A(() => {
		let e = t.controller.coursePalette;
		return Wr(i.courseEntries.map((e) => e.hit.course), e);
	}), u = /* @__PURE__ */ A(() => [{
		value: "active",
		label: f("screen.scope.active")
	}, {
		value: "all",
		label: f("screen.scope.all")
	}]), d = /* @__PURE__ */ A(() => Y(u).findIndex((e) => e.value === i.scope));
	function f(e, n) {
		return Si(t.controller, Ni, Mi, e, n);
	}
	function p(e) {
		return (/* @__PURE__ */ new Date(`${e}T12:00:00`)).toLocaleDateString(bi(t.controller.currentLocale), {
			month: "long",
			day: "numeric",
			weekday: "long"
		});
	}
	function m(e) {
		let n = t.controller.coursePalette;
		return Y(l).get(Br(e.course.name)) ?? Ur(e.course, n);
	}
	let h = /* @__PURE__ */ A(() => {
		try {
			return t.controller.getPluginContext(t.pluginId).tryService(ci);
		} catch {
			return;
		}
	});
	function g(e) {
		Y(h)?.openCourseEditor(e);
	}
	hr(() => (i.init(t.controller, t.pluginId), () => i.dispose()));
	var _ = ra(), v = I(_), y = I(v), b = L(y, !0), x = R(y, 2), S = (e) => {
		var t = Ui(), n = I(t), r = L(n, !0), a = R(n, 2), o = (e) => {
			var t = Hi(), n = L(t, !0);
			z((e) => Q(n, e), [() => f("screen.summary.count", { count: i.courseEntries.length })]), Z(e, t);
		};
		$(a, (e) => {
			i.courseEntries.length > 0 && e(o);
		}), D(t), z((e) => Q(r, e), [() => f("screen.week", { week: Y(c) })]), Z(e, t);
	};
	$(x, (e) => {
		Y(a) && e(S);
	});
	var ee = R(x, 2), C = I(ee), te = (e) => {
		var t = Wi();
		let r;
		z(() => {
			jr(t, 1, `rounded-pill absolute top-1.5 bottom-1.5 bg-secondary-container shadow-xs ${n() ? "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]" : ""}`), r = Nr(t, "", r, {
				left: `calc(0.375rem + ${Y(d) ?? ""} * ((100% - 0.75rem) / 2))`,
				width: "calc((100% - 0.75rem) / 2)"
			});
		}), Z(e, t);
	};
	$(C, (e) => {
		Y(d) >= 0 && e(te);
	}), yr(R(C, 2), 17, () => Y(u), (e) => e.value, (e, t) => {
		var n = Gi(), r = L(n, !0);
		z(() => {
			jr(n, 1, `text-label-large rounded-pill relative z-10 flex-1 cursor-pointer py-2 text-center transition-colors duration-200 ${i.scope === Y(t).value ? "text-on-secondary-container" : "text-on-surface-variant hover:text-on-surface"}`), Q(r, Y(t).label);
		}), Jn("click", n, () => void i.persistScope(Y(t).value)), Z(e, n);
	}), D(ee), D(v);
	var ne = R(v, 2), re = I(ne), ie = (e) => {
		var t = Ki(), n = L(R(I(t), 2), !0);
		D(t), z((e) => Q(n, e), [() => f("screen.empty.noTimetable")]), Z(e, t);
	}, ae = (e) => {
		var t = qi(), n = R(I(t), 2), r = L(n, !0), i = L(R(n, 2), !0);
		D(t), z((e, t) => {
			Q(r, e), Q(i, t);
		}, [() => f("screen.empty.noCourses"), () => f("screen.empty.noCoursesHint")]), Z(e, t);
	}, oe = (e) => {
		var t = na(), n = I(t);
		yr(n, 21, () => i.courseEntries, (e) => `${e.hit.timetableId}-${e.hit.course.id}`, (e, t) => {
			var n = ta();
			{
				let e = (e) => {
					var n = Qi(), r = Gt(n), a = I(r), o = (e) => {
						var t = Ji(), n = L(t, !0);
						z(() => Q(n, Y(l).startTime)), Z(e, t);
					};
					$(a, (e) => {
						Y(l) && e(o);
					});
					var s = R(a, 2), d = I(s), p = L(d, !0);
					Tr(d, () => yi(() => ({
						lines: [Y(u)],
						maxFontPx: 24,
						minFontPx: 6,
						fromParent: !0
					}))), D(s);
					var m = R(s, 2), h = (e) => {
						var t = Ji(), n = L(t, !0);
						z(() => Q(n, Y(l).endTime)), Z(e, t);
					};
					$(m, (e) => {
						Y(l) && e(h);
					}), D(r);
					var g = R(r, 2);
					let _;
					var v = R(g, 2), y = I(v), b = I(y), x = L(b, !0), S = R(b, 2), ee = (e) => {
						var t = Yi(), n = L(t, !0);
						z((e) => Q(n, e), [() => f("screen.status.current")]), Z(e, t);
					};
					$(S, (e) => {
						Y(t).status === "current" && e(ee);
					}), D(y);
					var C = R(y, 2), te = (e) => {
						var n = Zi(), r = I(n), a = (e) => {
							var n = Xi(), r = L(n, !0);
							z((e) => Q(r, e), [() => f("screen.course.timetable", { name: Y(t).hit.timetableName })]), Z(e, n);
						};
						$(r, (e) => {
							i.scope === "all" && Y(t).hit.timetableName && e(a);
						});
						var o = R(r, 2), s = (e) => {
							var n = Xi(), r = L(n, !0);
							z(() => Q(r, Y(t).hit.course.location)), Z(e, n);
						};
						$(o, (e) => {
							Y(t).hit.course.location && e(s);
						});
						var c = R(o, 2), l = (e) => {
							var n = Xi(), r = L(n, !0);
							z(() => Q(r, Y(t).hit.course.teacher)), Z(e, n);
						};
						$(c, (e) => {
							Y(t).hit.course.teacher && e(l);
						}), D(n), Z(e, n);
					};
					$(C, (e) => {
						(i.scope === "all" && Y(t).hit.timetableName || Y(t).hit.course.location || Y(t).hit.course.teacher) && e(te);
					}), D(v), z(() => {
						Q(p, Y(u)), _ = Nr(g, "", _, { "background-color": Y(c).background }), Q(x, Y(t).hit.course.name);
					}), Z(e, n);
				}, c = /* @__PURE__ */ A(() => m(Y(t).hit)), l = /* @__PURE__ */ A(() => Ii(Y(o), Y(t).hit.course.startPeriod, Y(t).hit.course.endPeriod)), u = /* @__PURE__ */ A(() => Y(t).hit.course.startPeriod === Y(t).hit.course.endPeriod ? f("screen.course.periodSingle", { n: Y(t).hit.course.startPeriod }) : f("screen.course.periodRange", {
					start: Y(t).hit.course.startPeriod,
					end: Y(t).hit.course.endPeriod
				}));
				var r = I(n), a = (n) => {
					var r = $i(), i = I(r);
					e(i), D(r), z(() => jr(r, 1, `flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-container-low ${Y(t).status === "past" ? "opacity-60" : ""}`)), Jn("click", r, () => g(Y(t).hit.course.id)), Z(n, r);
				}, s = (n) => {
					var r = ea(), i = I(r);
					e(i), D(r), z(() => jr(r, 1, `flex gap-3 px-4 py-4 ${Y(t).status === "past" ? "opacity-60" : ""}`)), Z(n, r);
				};
				$(r, (e) => {
					Y(h) ? e(a) : e(s, -1);
				}), D(n);
			}
			Z(e, n);
		}), D(n), D(t), Z(e, t);
	};
	$(re, (e) => {
		Y(a) ? i.courseEntries.length === 0 ? e(ae, 1) : e(oe, -1) : e(ie);
	}), D(ne), D(_), z((e) => Q(b, e), [() => p(Y(s))]), Z(e, _), Be();
}
Yn(["click"]);
//#endregion
//#region packages/plugins/today/bundle/entry.ts
var aa = Pi({ screenComponent: xi(ia) });
//#endregion
export { aa as default };
