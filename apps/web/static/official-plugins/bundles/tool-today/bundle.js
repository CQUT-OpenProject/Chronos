//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/constants.js
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
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/constants.js
var h = 1 << 24, g = 1024, _ = 2048, v = 4096, y = 8192, b = 16384, x = 32768, S = 1 << 25, C = 65536, w = 1 << 19, ee = 1 << 20, te = 1 << 25, ne = 65536, re = 1 << 21, ie = 1 << 22, ae = 1 << 23, oe = Symbol("$state"), se = Symbol("legacy props"), ce = Symbol("attributes"), le = Symbol("class"), ue = Symbol("style"), de = Symbol("text"), fe = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
function pe(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function me() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function he(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ge(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function _e() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ve(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function ye() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function be(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function xe() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Se() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ce() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function we() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Te() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Ee(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function De() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/hydration.js
var T = !1;
function Oe(e) {
	T = e;
}
var E;
function ke(t) {
	if (t === null) throw Ee(), e;
	return E = t;
}
function Ae() {
	return ke(/* @__PURE__ */ $t(E));
}
function D(t) {
	if (T) {
		if (/* @__PURE__ */ $t(E) !== null) throw Ee(), e;
		E = t;
	}
}
function je(e = 1) {
	if (T) {
		for (var t = e, n = E; t--;) n = /* @__PURE__ */ $t(n);
		E = n;
	}
}
function Me(e = !0) {
	for (var t = 0, n = E;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ $t(n);
		e && n.remove(), n = i;
	}
}
function Ne(t) {
	if (!t || t.nodeType !== 8) throw Ee(), e;
	return t.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function Pe(e) {
	return e === this.v;
}
function Fe(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ie(e) {
	return !Fe(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var Le = null;
function Re(e) {
	Le = e;
}
function ze(e, t = !1, n) {
	Le = {
		p: Le,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: F,
		l: null
	};
}
function Be(e) {
	var t = Le, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) fn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Le = t.p, e ?? {};
}
function Ve() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var He = [];
function Ue() {
	var e = He;
	He = [], p(e);
}
function We(e) {
	if (He.length === 0 && !St) {
		var t = He;
		queueMicrotask(() => {
			t === He && Ue();
		});
	}
	He.push(e);
}
function Ge(e) {
	var t = F;
	if (t === null) return P.f |= ae, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ke(e, t);
}
function Ke(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128) {
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
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/status.js
var qe = ~(_ | v | g);
function O(e, t) {
	e.f = e.f & qe | t;
}
function Je(e) {
	e.f & 512 || e.deps === null ? O(e, g) : O(e, v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Ye(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= ne, Ye(t.deps));
}
function Xe(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Ye(e.deps), O(e, g);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/store.js
var Ze = !1;
function Qe(e) {
	var t = Ze;
	try {
		return Ze = !1, [e(), Ze];
	} finally {
		Ze = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function $e(e) {
	var t = P, n = F;
	In(null), Ln(null);
	try {
		return e();
	} finally {
		In(t), Ln(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function et(e) {
	let t = 0, n = Rt(0), r;
	return () => {
		ln() && (I(n), gn(() => (t === 0 && (r = rr(() => e(() => Ut(n)))), t += 1, () => {
			We(() => {
				--t, t === 0 && (r?.(), r = void 0, Ut(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var tt = C | w;
function nt(e, t, n, r) {
	new rt(e, t, n, r);
}
var rt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = T ? E : null;
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
	#h = et(() => (this.#m = Rt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = F;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = F.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = _n(() => {
			if (T) {
				let e = this.#t;
				Ae();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, tt), T && (this.#e = E);
	}
	#g() {
		try {
			this.#a = yn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		We(r), t && (this.#s = yn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				De();
				return;
			}
			t = !0, n && we(), this.#s !== null && En(this.#s, () => {
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
					Ke(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = yn(() => e(this.#e)), We(() => {
			var e = this.#c = document.createDocumentFragment(), t = Zt();
			e.append(t), this.#a = this.#S(() => yn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, En(this.#o, () => {
				this.#o = null;
			}), this.#x(k));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = yn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				An(this.#a, e);
				let t = this.#n.pending;
				this.#o = yn(() => t(this.#e));
			} else this.#x(k);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Xe(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = F, n = P, r = Le;
		Ln(this.#i), In(this.#i), Re(this.#i.ctx);
		try {
			return Ot.ensure(), e();
		} catch (e) {
			return Ge(e), null;
		} finally {
			Ln(t), In(n), Re(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && En(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, We(() => {
			this.#d = !1, this.#m && Vt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), I(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		k?.is_fork ? (this.#a && k.skip_effect(this.#a), this.#o && k.skip_effect(this.#o), this.#s && k.skip_effect(this.#s), k.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Cn(this.#a), null), this.#o &&= (Cn(this.#o), null), this.#s &&= (Cn(this.#s), null), T && (ke(this.#t), je(), ke(Me()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return yn(() => {
						var r = F;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Ke(e, this.#i.parent), null;
				}
			}));
		};
		We(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ke(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ke(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function it(e, t, n, r) {
	let i = Ve() ? ct : ft;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = F, c = at(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ke(e, s);
			}
			ot();
		}
	}
	var d = st();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ ut(e))).then(u).catch((e) => Ke(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), ot();
	}) : f();
}
function at() {
	var e = F, t = P, n = Le, r = k;
	return function(i = !0) {
		Ln(e), In(t), Re(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ot(e = !0) {
	Ln(null), In(null), Re(null), e && k?.deactivate();
}
function st() {
	var e = F, t = e.b, n = k, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ct(e) {
	var n = 2 | _;
	return F !== null && (F.f |= w), {
		ctx: Le,
		deps: null,
		effects: null,
		equals: Pe,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: F,
		ac: null
	};
}
var lt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function ut(e, n, r) {
	let i = F;
	i === null && me();
	var a = void 0, o = Rt(t), s = !P, c = /* @__PURE__ */ new Set();
	return hn(() => {
		var t = F, n = m();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== fe && n.reject(e);
			}).finally(ot);
		} catch (e) {
			n.reject(e), ot();
		}
		var r = k;
		if (s) {
			if (t.f & 32768) var l = st();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(lt);
			else for (let e of c.values()) e.reject(lt);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== lt && (r.activate(), t ? (o.f |= ae, Vt(o, t)) : (o.f & 8388608 && (o.f ^= ae), Vt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), un(() => {
		for (let e of c) e.reject(lt);
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
function dt(e) {
	let t = /* @__PURE__ */ ct(e);
	return zn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function ft(e) {
	let t = /* @__PURE__ */ ct(e);
	return t.equals = Ie, t;
}
function pt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Cn(t[n]);
	}
}
function mt(e) {
	var n, r = F, i = e.parent;
	if (!Nn && i !== null && e.v !== t && i.f & 24576) return Te(), e.v;
	Ln(i);
	try {
		e.f &= ~ne, pt(e), n = Zn(e);
	} finally {
		Ln(r);
	}
	return n;
}
function ht(e) {
	var t = mt(e);
	if (!e.equals(t) && (e.wv = Jn(), (!k?.is_fork || e.deps === null) && (k === null ? e.v = t : (k.capture(e, t, !0), yt?.capture(e, t, !0)), e.deps === null))) {
		O(e, g);
		return;
	}
	Nn || (bt === null ? Je(e) : (ln() || k?.is_fork) && bt.set(e, t));
}
function gt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && $e(() => {
		t.ac.abort(fe), t.ac = null;
	}), t.fn !== null && (t.teardown = f), $n(t, 0), xn(t));
}
function _t(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && er(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var vt = null, k = null, yt = null, bt = null, xt = null, St = !1, Ct = !1, wt = null, Tt = null, Et = 0, Dt = 1, Ot = class e {
	id = Dt++;
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
		vt === null ? vt = this : (vt.#n = this, this.#t = vt), vt = this;
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
			for (var r of n.d) O(r, _), t(r);
			for (r of n.m) O(r, v), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Et++ > 1e3 && (this.#x(), kt());
		for (let e of this.#u) this.#d.delete(e), O(e, _), this.schedule(e);
		for (let e of this.#d) O(e, v), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = wt = [], r = [], i = Tt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Pt(e), this.#h() || this.discard(), t;
		}
		if (k = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (wt = null, Tt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Nt(e, t);
			i.length > 0 && k.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), yt = this, jt(r), jt(n), yt = null, this.#s?.resolve();
		var s = k;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && (It.clear(), s.#g());
	}
	#_(e, t, n) {
		e.f ^= g;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= g : i & 4 ? t.push(r) : Yn(r) && (i & 16 && this.#d.add(r), er(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), O(i, _), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), k = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Xe(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), bt?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		k = this;
	}
	deactivate() {
		k = null, bt = null;
	}
	flush() {
		try {
			Ct = !0, k = this, this.#g();
		} finally {
			Et = 0, xt = null, wt = null, Tt = null, Ct = !1, k = null, bt = null, It.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(lt);
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
		this.#m || (this.#m = !0, We(() => {
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
		if (k === null) {
			let t = k = new e();
			!Ct && We(() => {
				t.#e || t.flush();
			});
		}
		return k;
	}
	apply() {
		bt = null;
	}
	schedule(e) {
		if (xt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (wt !== null && t === F && (P === null || !(P.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? vt = e : t.#t = e, this.linked = !1;
		}
	}
};
function kt() {
	try {
		ye();
	} catch (e) {
		Ke(e, xt);
	}
}
var At = null;
function jt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Yn(r) && (At = /* @__PURE__ */ new Set(), er(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Tn(r), At?.size > 0)) {
				It.clear();
				for (let e of At) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) At.has(n) && (At.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || er(n);
					}
				}
				At.clear();
			}
		}
		At = null;
	}
}
function Mt(e) {
	k.schedule(e);
}
function Nt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), O(e, g);
		for (var n = e.first; n !== null;) Nt(n, t), n = n.next;
	}
}
function Pt(e) {
	O(e, g);
	for (var t = e.first; t !== null;) Pt(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var Ft = /* @__PURE__ */ new Set(), It = /* @__PURE__ */ new Map(), Lt = !1;
function Rt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Pe,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function zt(e, t) {
	let n = Rt(e, t);
	return zn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Bt(e, t = !1, n = !0) {
	let r = Rt(e);
	return t || (r.equals = Ie), r;
}
function A(e, t, n = !1) {
	return P !== null && (!Fn || P.f & 131072) && Ve() && P.f & 4325394 && (Rn === null || !Rn.has(e)) && Ce(), Vt(e, n ? Gt(t) : t, Tt);
}
function Vt(e, t, n = null) {
	if (!e.equals(t)) {
		Nn ? It.set(e, t) : It.has(e) || It.set(e, e.v);
		var r = Ot.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && mt(t), bt === null && Je(t);
		}
		e.wv = Jn(), Wt(e, _, n), Ve() && F !== null && F.f & 1024 && !(F.f & 96) && (Hn === null ? Un([e]) : Hn.push(e)), !r.is_fork && Ft.size > 0 && !Lt && Ht();
	}
	return t;
}
function Ht() {
	Lt = !1;
	for (let e of Ft) {
		e.f & 1024 && O(e, v);
		let t;
		try {
			t = Yn(e);
		} catch {
			t = !0;
		}
		t && er(e);
	}
	Ft.clear();
}
function Ut(e) {
	A(e, e.v + 1);
}
function Wt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ve(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === F)) {
			var l = (c & _) === 0;
			if (l && O(s, t), c & 131072) Ft.add(s);
			else if (c & 2) {
				var u = s;
				bt?.delete(u), c & 65536 || (c & 512 && (F === null || !(F.f & 2097152)) && (s.f |= ne), Wt(u, v, n));
			} else if (l) {
				var d = s;
				c & 16 && At !== null && At.add(d), n === null ? Mt(d) : n.push(d);
			}
		}
	}
}
function Gt(e) {
	if (typeof e != "object" || !e || oe in e) return e;
	let r = u(e);
	if (r !== c && r !== l) return e;
	var i = /* @__PURE__ */ new Map(), a = n(e), o = /* @__PURE__ */ zt(0), d = null, f = Kn, p = (e) => {
		if (Kn === f) return e();
		var t = P, n = Kn;
		In(null), qn(f);
		var r = e();
		return In(t), qn(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ zt(e.length, d)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && xe();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ zt(n.value, d);
				return i.set(t, e), e;
			}) : A(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ zt(t, d));
					i.set(n, e), Ut(o);
				}
			} else A(r, t), Ut(o);
			return !0;
		},
		get(n, r, a) {
			if (r === oe) return e;
			var o = i.get(r), c = r in n;
			if (o === void 0 && (!c || s(n, r)?.writable) && (o = p(() => /* @__PURE__ */ zt(Gt(c ? n[r] : t), d)), i.set(r, o)), o !== void 0) {
				var l = I(o);
				return l === t ? void 0 : l;
			}
			return Reflect.get(n, r, a);
		},
		getOwnPropertyDescriptor(e, n) {
			var r = Reflect.getOwnPropertyDescriptor(e, n);
			if (r && "value" in r) {
				var a = i.get(n);
				a && (r.value = I(a));
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
			if (n === oe) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || F !== null && (!a || s(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ zt(a ? Gt(e[n]) : t, d)), i.set(n, r)), I(r) === t) ? !1 : a;
		},
		set(e, n, r, c) {
			var l = i.get(n), u = n in e;
			if (a && n === "length") for (var f = r; f < l.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ zt(t, d)), i.set(f + "", m)) : A(m, t);
			}
			if (l === void 0) (!u || s(e, n)?.writable) && (l = p(() => /* @__PURE__ */ zt(void 0, d)), A(l, Gt(r)), i.set(n, l));
			else {
				u = l.v !== t;
				var h = p(() => Gt(r));
				A(l, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(c, r), !u) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && A(_, v + 1);
				}
				Ut(o);
			}
			return !0;
		},
		ownKeys(e) {
			I(o);
			var n = Reflect.ownKeys(e).filter((e) => {
				var n = i.get(e);
				return n === void 0 || n.v !== t;
			});
			for (var [r, a] of i) a.v !== t && !(r in e) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			Se();
		}
	});
}
var Kt, qt, Jt, Yt;
function Xt() {
	if (Kt === void 0) {
		Kt = window, qt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Jt = s(t, "firstChild").get, Yt = s(t, "nextSibling").get, d(e) && (e[le] = void 0, e[ce] = null, e[ue] = void 0, e.__e = void 0), d(n) && (n[de] = void 0);
	}
}
function Zt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Qt(e) {
	return Jt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function $t(e) {
	return Yt.call(e);
}
function j(e, t) {
	if (!T) return /* @__PURE__ */ Qt(e);
	var n = /* @__PURE__ */ Qt(E);
	if (n === null) n = E.appendChild(Zt());
	else if (t && n.nodeType !== 3) {
		var r = Zt();
		return n?.before(r), ke(r), r;
	}
	return t && an(n), ke(n), n;
}
function en(e, t = !1) {
	if (!T) {
		var n = /* @__PURE__ */ Qt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ $t(n) : n;
	}
	if (t) {
		if (E?.nodeType !== 3) {
			var r = Zt();
			return E?.before(r), ke(r), r;
		}
		an(E);
	}
	return E;
}
function M(e, t = 1, n = !1) {
	let r = T ? E : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ $t(r);
	if (!T) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Zt();
			return r === null ? i?.after(a) : r.before(a), ke(a), a;
		}
		an(r);
	}
	return ke(r), r;
}
function tn(e) {
	e.textContent = "";
}
function nn() {
	return !1;
}
function rn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function an(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function on(e) {
	F === null && (P === null && ve(e), _e()), Nn && ge(e);
}
function sn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function cn(e, t) {
	var n = F;
	n !== null && n.f & 8192 && (e |= y);
	var r = {
		ctx: Le,
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
	k?.register_created_effect(r);
	var i = r;
	if (e & 4) wt === null ? Ot.ensure().schedule(r) : wt.push(r);
	else if (t !== null) {
		try {
			er(r);
		} catch (e) {
			throw Cn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= C));
	}
	if (i !== null && (i.parent = n, n !== null && sn(i, n), P !== null && P.f & 2 && !(e & 64))) {
		var a = P;
		(a.effects ??= []).push(i);
	}
	return r;
}
function ln() {
	return P !== null && !Fn;
}
function un(e) {
	let t = cn(8, null);
	return O(t, g), t.teardown = e, t;
}
function dn(e) {
	on("$effect");
	var t = F.f;
	if (!P && t & 32 && Le !== null && !Le.i) {
		var n = Le;
		(n.e ??= []).push(e);
	} else return fn(e);
}
function fn(e) {
	return cn(4 | ee, e);
}
function pn(e) {
	Ot.ensure();
	let t = cn(64 | w, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? En(t, () => {
			Cn(t), n(void 0);
		}) : (Cn(t), n(void 0));
	});
}
function mn(e) {
	return cn(4, e);
}
function hn(e) {
	return cn(ie | w, e);
}
function gn(e, t = 0) {
	return cn(8 | t, e);
}
function N(e, t = [], n = [], r = []) {
	it(r, t, n, (t) => {
		cn(8, () => {
			e(...t.map(I));
		});
	});
}
function _n(e, t = 0) {
	return cn(16 | t, e);
}
function vn(e, t = 0) {
	return cn(h | t, e);
}
function yn(e) {
	return cn(32 | w, e);
}
function bn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Nn, n = P;
		Pn(!0), In(null);
		try {
			t.call(null);
		} finally {
			Pn(e), In(n);
		}
	}
}
function xn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && $e(() => {
			e.abort(fe);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Cn(n, t), n = r;
	}
}
function Sn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Cn(t), t = n;
	}
}
function Cn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (wn(e.nodes.start, e.nodes.end), n = !0), e.f |= S, xn(e, t && !n), $n(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	bn(e), e.f ^= S, e.f |= b;
	var i = e.parent;
	i !== null && i.first !== null && Tn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function wn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ $t(e);
		e.remove(), e = n;
	}
}
function Tn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function En(e, t, n = !0) {
	var r = [];
	Dn(e, r, !0);
	var i = () => {
		n && Cn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Dn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= y;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Dn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function On(e) {
	kn(e, !0);
}
function kn(e, t) {
	if (e.f & 8192) {
		e.f ^= y, e.f & 1024 || (O(e, _), Ot.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			kn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function An(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ $t(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var jn = null, Mn = !1, Nn = !1;
function Pn(e) {
	Nn = e;
}
var P = null, Fn = !1;
function In(e) {
	P = e;
}
var F = null;
function Ln(e) {
	F = e;
}
var Rn = null;
function zn(e) {
	P !== null && (Rn ??= /* @__PURE__ */ new Set()).add(e);
}
var Bn = null, Vn = 0, Hn = null;
function Un(e) {
	Hn = e;
}
var Wn = 1, Gn = 0, Kn = Gn;
function qn(e) {
	Kn = e;
}
function Jn() {
	return ++Wn;
}
function Yn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~ne), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Yn(a) && ht(a), a.wv > e.wv) return !0;
		}
		t & 512 && bt === null && O(e, g);
	}
	return !1;
}
function Xn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Rn !== null && Rn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Xn(a, t, !1) : t === a && (n ? O(a, _) : a.f & 1024 && O(a, v), Mt(a));
	}
}
function Zn(e) {
	var t = Bn, n = Vn, r = Hn, i = P, a = Rn, o = Le, s = Fn, c = Kn, l = e.f;
	Bn = null, Vn = 0, Hn = null, P = l & 96 ? null : e, Rn = null, Re(e.ctx), Fn = !1, Kn = ++Gn, e.ac !== null && ($e(() => {
		e.ac.abort(fe);
	}), e.ac = null);
	try {
		e.f |= re;
		var u = e.fn, d = u();
		e.f |= x;
		var f = e.deps, p = k?.is_fork;
		if (Bn !== null) {
			var m;
			if (p || $n(e, Vn), f !== null && Vn > 0) for (f.length = Vn + Bn.length, m = 0; m < Bn.length; m++) f[Vn + m] = Bn[m];
			else e.deps = f = Bn;
			if (ln() && e.f & 512) for (m = Vn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Vn < f.length && ($n(e, Vn), f.length = Vn);
		if (Ve() && Hn !== null && !Fn && f !== null && !(e.f & 6146)) for (m = 0; m < Hn.length; m++) Xn(Hn[m], e);
		if (i !== null && i !== e) {
			if (Gn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Gn;
			if (t !== null) for (let e of t) e.rv = Gn;
			Hn !== null && (r === null ? r = Hn : r.push(...Hn));
		}
		return e.f & 8388608 && (e.f ^= ae), d;
	} catch (e) {
		return Ge(e);
	} finally {
		e.f ^= re, Bn = t, Vn = n, Hn = r, P = i, Rn = a, Re(o), Fn = s, Kn = c;
	}
}
function Qn(e, n) {
	let a = n.reactions;
	if (a !== null) {
		var o = r.call(a, e);
		if (o !== -1) {
			var s = a.length - 1;
			s === 0 ? a = n.reactions = null : (a[o] = a[s], a.pop());
		}
	}
	if (a === null && n.f & 2 && (Bn === null || !i.call(Bn, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~ne), c.v !== t && Je(c), c.ac !== null && $e(() => {
			c.ac.abort(fe), c.ac = null, O(c, _);
		}), gt(c), $n(c, 0);
	}
}
function $n(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Qn(e, n[r]);
}
function er(e) {
	var t = e.f;
	if (!(t & 16384)) {
		O(e, g);
		var n = F, r = Mn;
		F = e, Mn = !(t & 96);
		try {
			t & 16777232 ? Sn(e) : xn(e), bn(e);
			var i = Zn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Wn;
		} finally {
			Mn = r, F = n;
		}
	}
}
function I(e) {
	var t = !!(e.f & 2);
	if (jn?.add(e), P !== null && !Fn && !(F !== null && F.f & 16384) && (Rn === null || !Rn.has(e))) {
		var n = P.deps;
		if (P.f & 2097152) e.rv < Gn && (e.rv = Gn, Bn === null && n !== null && n[Vn] === e ? Vn++ : Bn === null ? Bn = [e] : Bn.push(e));
		else {
			P.deps ??= [], i.call(P.deps, e) || P.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [P] : i.call(r, P) || r.push(P);
		}
	}
	if (Nn && It.has(e)) return It.get(e);
	if (t) {
		var a = e;
		if (Nn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || nr(a)) && (o = mt(a)), It.set(a, o), o;
		}
		var s = !(a.f & 512) && !Fn && P !== null && (Mn || !!(P.f & 512)), c = (a.f & x) === 0;
		Yn(a) && (s && (a.f |= 512), ht(a)), s && !c && (_t(a), tr(a));
	}
	if (bt?.has(e)) return bt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function tr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (_t(t), tr(t));
}
function nr(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (It.has(t) || t.f & 2 && nr(t)) return !0;
	return !1;
}
function rr(e) {
	var t = Fn;
	try {
		return Fn = !0, e();
	} finally {
		Fn = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var ir = Symbol("events"), ar = /* @__PURE__ */ new Set(), or = /* @__PURE__ */ new Set();
function sr(e, t, n) {
	(t[ir] ??= {})[e] = n;
}
function cr(e) {
	for (var t = 0; t < e.length; t++) ar.add(e[t]);
	for (var n of or) n(e);
}
var lr = null, ur = !1;
function dr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	lr = e, ur || (ur = !0, setTimeout(() => {
		ur = !1, lr = null;
	}));
	var s = 0, c = lr === e && e[ir];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[ir] = t;
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
		var d = P, f = F;
		In(null), Ln(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[ir]?.[r];
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
			e[ir] = t, delete e.currentTarget, In(d), Ln(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var fr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function pr(e) {
	return fr?.createHTML(e) ?? e;
}
function mr(e) {
	var t = rn("template");
	return t.innerHTML = pr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function hr(e, t) {
	var n = F;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function L(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (T) return hr(E, null), E;
		i === void 0 && (i = mr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Qt(i)));
		var t = r || qt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Qt(t), s = t.lastChild;
			hr(o, s);
		} else hr(t, t);
		return t;
	};
}
function R(e, t) {
	if (T) {
		var n = F;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = E), Ae();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var gr = ["touchstart", "touchmove"];
function _r(e) {
	return gr.includes(e);
}
function vr(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[de] ??= e.nodeValue) && (e[de] = n, e.nodeValue = `${n}`);
}
function yr(e, t) {
	return xr(e, t);
}
var br = /* @__PURE__ */ new Map();
function xr(t, { target: n, anchor: r, props: i = {}, events: o, context: s, intro: c = !0, transformError: l }) {
	Xt();
	var u = void 0, d = pn(() => {
		var c = r ?? n.appendChild(Zt());
		nt(c, { pending: () => {} }, (n) => {
			ze({});
			var r = Le;
			if (s && (r.c = s), o && (i.$$events = o), T && hr(n, null), u = t(n, i) || {}, T && (F.nodes.end = E, E === null || E.nodeType !== 8 || E.data !== "]")) throw Ee(), e;
			Be();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = _r(r);
					for (let e of [n, document]) {
						var a = br.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), br.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, dr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(a(ar)), or.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = br.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, dr), t.delete(e), t.size === 0 && br.delete(r)) : t.set(e, i);
			}
			or.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return Sr.set(u, d), u;
}
var Sr = /* @__PURE__ */ new WeakMap();
function Cr(e, t) {
	let n = Sr.get(e);
	return n ? (Sr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var wr = class {
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
			if (n) On(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (On(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Cn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						An(r, t), t.append(Zt()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Cn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), En(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Cn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = k, r = nn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = Zt();
				i.append(a), this.#n.set(e, {
					effect: yn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, yn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else T && (this.anchor = E), this.#a(n);
	}
};
function Tr(e) {
	Le === null && pe("onMount"), dn(() => {
		let t = rr(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/if.js
function Er(e, t, n = !1) {
	var r;
	T && (r = E, Ae());
	var i = new wr(e), a = n ? C : 0;
	function o(e, t) {
		if (T) {
			var n = Ne(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Me();
				ke(a), i.anchor = a, Oe(!1), i.ensure(e, t), Oe(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	_n(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function Dr(e, t, n) {
	for (var r = [], i = t.length, o, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		En(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Or(e, a(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			tn(d), d.append(u), e.items.clear();
		}
		Or(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Or(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= te, An(a, document.createDocumentFragment())) : Cn(t[i], n);
	}
}
var kr;
function Ar(e, t, r, i, o, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = T ? ke(/* @__PURE__ */ Qt(u)) : u.appendChild(Zt());
	}
	T && Ae();
	var d = null, f = /* @__PURE__ */ ft(() => {
		var e = r();
		return n(e) ? e : e == null ? [] : a(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Mr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= te, Pr(d, null, c)) : On(d) : En(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: _n(() => {
			p = I(f);
			var e = p.length;
			let n = !1;
			T && Ne(c) === "[!" != (e === 0) && (c = Me(), ke(c), Oe(!1), n = !0);
			for (var a = /* @__PURE__ */ new Set(), u = k, v = nn(), y = 0; y < e; y += 1) {
				T && E.nodeType === 8 && E.data === "]" && (c = E, n = !0, Oe(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && Vt(S.v, b), S.i && Vt(S.i, y), v && u.unskip_effect(S.e)) : (S = Nr(l, h ? c : kr ??= Zt(), b, x, y, o, t, r), h || (S.e.f |= te), l.set(x, S)), a.add(x);
			}
			if (e === 0 && s && !d && (h ? d = yn(() => s(c)) : (d = yn(() => s(kr ??= Zt())), d.f |= te)), e > a.size && he("", "", ""), T && e > 0 && ke(Me()), !h) {
				if (m.set(u, a), v) {
					for (let [e, t] of l) a.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			n && Oe(!0), I(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, T && (c = E);
}
function jr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Mr(e, t, n, r, i) {
	var o = !!(r & 8), s = t.length, c = e.items, l = jr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (On(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= te, _ === l) Pr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Fr(e, d, _), Fr(e, _, y), Pr(_, y, n), d = _, p = [], m = [], l = jr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Pr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Fr(e, S.prev, C.next), Fr(e, d, S), Fr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Pr(_, l, n), Fr(e, _.prev, _.next), Fr(e, _, d === null ? e.effect.first : d.next), Fr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = jr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = jr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Or(e, a(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = jr(l.next);
		var ee = w.length;
		if (ee > 0) {
			var ne = r & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < ee; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < ee; v += 1) w[v].nodes?.a?.fix();
			}
			Dr(e, w, ne);
		}
	}
	o && We(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Nr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Rt(n) : /* @__PURE__ */ Bt(n, !1, !1) : null, l = o & 2 ? Rt(i) : null;
	return {
		v: c,
		i: l,
		e: yn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Pr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ $t(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Fr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function Ir(e, t) {
	var n = void 0, r;
	vn(() => {
		n !== (n = t()) && (r &&= (Cn(r), null), n && (r = yn(() => {
			mn(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var Lr = [..." 	\n\r\f\xA0\v﻿"];
function Rr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Lr.includes(r[o - 1])) && (s === r.length || Lr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function zr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Br(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Vr(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Br)), i && c.push(...Object.keys(i).map(Br));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Br(e.substring(l, u).trim());
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
		return r && (n += zr(r)), i && (n += zr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function Hr(e, t, n, r, i, a) {
	var o = e[le];
	if (T || o !== n || o === void 0) {
		var s = Rr(n, r, a);
		(!T || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[le] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/style.js
function Ur(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Wr(e, t, n, r) {
	var i = e[ue];
	if (T || i !== t) {
		var a = Vr(t, r);
		(!T || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ue] = t;
	} else r && (Array.isArray(r) ? (Ur(e, n?.[0], r[0]), Ur(e, n?.[1], r[1], "important")) : Ur(e, n, r));
	return r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/props.js
function Gr(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), c = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ ct(r), I(u)) : (l && (l = !1, c = o ? rr(r) : r), c);
	let f;
	if (a) {
		var p = oe in e || se in e;
		f = s(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = Qe(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && be(t), f(m)));
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
	var v = !1, y = (n & 1 ? ct : ft)(() => (v = !1, g()));
	a && I(y);
	var b = F;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? I(y) : i && a ? Gt(e) : e;
			return A(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Nn && v || b.f & 16384 ? y.v : I(y);
	});
}
var Kr = [
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
], qr = Kr.map(([e, t]) => ({
	background: e,
	foreground: t
})), Jr = /\s+/g;
function Yr(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = t * 31 + e.charCodeAt(n) | 0;
	return t;
}
function Xr(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(Jr, " ");
}
function Zr(e) {
	return Kr[Math.abs(Yr(e) % Kr.length)] ?? Kr[0];
}
function Qr(e) {
	let [t] = Zr(e), n = Kr.findIndex(([e]) => e === t);
	return n >= 0 ? n : 0;
}
function $r(e, t = qr) {
	let n = e.name ? Xr(e.name) : "";
	return !n || t.length === 0 ? qr[0] : t[Qr(n) % t.length];
}
function ei(e, t = qr) {
	if (t.length === 0) return /* @__PURE__ */ new Map();
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Xr(t.name), r = Qr(e);
		n.has(e) || n.set(e, {
			name: e,
			slot: r,
			hash: Yr(e)
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
//#region packages/core/src/engine/date.ts
function ti(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function ni(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function ri(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function ii(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function ai(e, t) {
	return ii(e, t * 7);
}
function oi(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function si(e, t) {
	return e.getTime() < t.getTime();
}
function ci(e) {
	return ni(ri(ti(e)));
}
function li(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function ui(e) {
	let t = (/* @__PURE__ */ new Date(`${e}T12:00:00`)).getDay();
	return t === 0 ? 7 : t;
}
//#endregion
//#region packages/core/src/engine/calendar.ts
var di = class {
	normalizeTermStartDate(e, t) {
		let n = ti(ci(t));
		if (!e || !e.trim()) return ni(ri(n));
		try {
			return ni(ri(ti(e)));
		} catch {
			return ni(ri(this.inferTermStartDateFromTermName(e) || n));
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
		}, r = ti(this.normalizeTermStartDate(n.termStartDate, e)), i = ti(e);
		if (si(i, r)) return n.startWeek;
		let a = oi(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return ni(ai(ti(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return ni(ii(ti(this.resolveWeekStart(e, t, r)), n - 1));
	}
};
//#endregion
//#region packages/core/src/engine/period-clock.ts
function fi(e) {
	let t = /^(\d{1,2}):(\d{2})$/.exec(e.trim());
	return t ? Number(t[1]) * 60 + Number(t[2]) : 0;
}
function pi(e) {
	return e.map((e) => ({
		index: e.index,
		startMinutes: fi(e.startTime),
		endMinutes: fi(e.endTime)
	})).sort((e, t) => e.index - t.index);
}
function mi(e) {
	return e.getHours() * 60 + e.getMinutes();
}
function hi(e, t, n = "upcomingOrLast") {
	let r = null;
	for (let n of e) {
		if (t >= n.startMinutes && t <= n.endMinutes) return n.index;
		r == null && t < n.startMinutes && (r = n.index);
	}
	return n === "none" ? null : r ?? e.at(-1)?.index ?? null;
}
//#endregion
//#region packages/core/src/types/services.ts
function gi(e) {
	return { key: e };
}
var _i = gi("storage"), vi = gi("hostNavigation");
//#endregion
//#region packages/core/src/i18n/i18n-catalog.ts
function yi(e, t) {
	return t ? e.replace(/\{(\w+)\}/g, (e, n) => {
		let r = t[n];
		return r == null ? `{${n}}` : typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? String(r) : JSON.stringify(r);
	}) : e;
}
//#endregion
//#region packages/core/src/types/mountable.ts
var bi = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.on-surface,color.primary,color.on-primary,color.surface-variant,color.outline,color.secondary,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,color.outline-variant,color.surface-container-high,color.canvas,color.ink,color.border-subtle,color.success,color.warning,color.danger,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
function xi(e) {
	return `color.${e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;
}
function Si(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) typeof r == "string" && r.length > 0 && (t[xi(n)] = r);
	return t;
}
function Ci(e, t) {
	return {
		light: Si(e),
		dark: Si(t)
	};
}
//#endregion
//#region packages/core/src/plugin/define-chronos-plugin.ts
function wi(e, t, n = "zh-cn") {
	return e[n]?.[t] ?? e.en?.[t] ?? t;
}
function Ti() {
	return "0.4.6";
}
function Ei(e) {
	let t;
	return {
		id: e.id,
		name: () => t?.(e.nameKey) ?? wi(e.messages, e.nameKey),
		version: e.version ?? Ti(),
		description: e.descriptionKey ? () => t?.(e.descriptionKey) ?? wi(e.messages, e.descriptionKey) : void 0,
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
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/math_utils.js
function Di(e) {
	return e < 0 ? -1 : e === 0 ? 0 : 1;
}
function Oi(e, t, n) {
	return (1 - n) * e + n * t;
}
function ki(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function z(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function Ai(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function ji(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function Mi(e, t) {
	return [
		e[0] * t[0][0] + e[1] * t[0][1] + e[2] * t[0][2],
		e[0] * t[1][0] + e[1] * t[1][1] + e[2] * t[1][2],
		e[0] * t[2][0] + e[1] * t[2][1] + e[2] * t[2][2]
	];
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/color_utils.js
var Ni = [
	[
		.41233895,
		.35762064,
		.18051042
	],
	[
		.2126,
		.7152,
		.0722
	],
	[
		.01932141,
		.11916382,
		.95034478
	]
], Pi = [
	[
		3.2413774792388685,
		-1.5376652402851851,
		-.49885366846268053
	],
	[
		-.9691452513005321,
		1.8758853451067872,
		.04156585616912061
	],
	[
		.05562093689691305,
		-.20395524564742123,
		1.0571799111220335
	]
], Fi = [
	95.047,
	100,
	108.883
];
function Ii(e, t, n) {
	return (255 << 24 | (e & 255) << 16 | (t & 255) << 8 | n & 255) >>> 0;
}
function Li(e) {
	return Ii(Yi(e[0]), Yi(e[1]), Yi(e[2]));
}
function Ri(e) {
	return e >> 16 & 255;
}
function zi(e) {
	return e >> 8 & 255;
}
function Bi(e) {
	return e & 255;
}
function Vi(e, t, n) {
	let r = Pi, i = r[0][0] * e + r[0][1] * t + r[0][2] * n, a = r[1][0] * e + r[1][1] * t + r[1][2] * n, o = r[2][0] * e + r[2][1] * t + r[2][2] * n;
	return Ii(Yi(i), Yi(a), Yi(o));
}
function Hi(e) {
	return Mi([
		Ji(Ri(e)),
		Ji(zi(e)),
		Ji(Bi(e))
	], Ni);
}
function Ui(e) {
	let t = Ji(Ri(e)), n = Ji(zi(e)), r = Ji(Bi(e)), i = Ni, a = i[0][0] * t + i[0][1] * n + i[0][2] * r, o = i[1][0] * t + i[1][1] * n + i[1][2] * r, s = i[2][0] * t + i[2][1] * n + i[2][2] * r, c = Fi, l = a / c[0], u = o / c[1], d = s / c[2], f = Zi(l), p = Zi(u), m = Zi(d);
	return [
		116 * p - 16,
		500 * (f - p),
		200 * (p - m)
	];
}
function Wi(e) {
	let t = Yi(Ki(e));
	return Ii(t, t, t);
}
function Gi(e) {
	let t = Hi(e)[1];
	return 116 * Zi(t / 100) - 16;
}
function Ki(e) {
	return 100 * Qi((e + 16) / 116);
}
function qi(e) {
	return Zi(e / 100) * 116 - 16;
}
function Ji(e) {
	let t = e / 255;
	return t <= .040449936 ? t / 12.92 * 100 : ((t + .055) / 1.055) ** 2.4 * 100;
}
function Yi(e) {
	let t = e / 100, n = 0;
	return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, ki(0, 255, Math.round(n * 255));
}
function Xi() {
	return Fi;
}
function Zi(e) {
	return e > .008856451679035631 ? e ** (1 / 3) : (903.2962962962963 * e + 16) / 116;
}
function Qi(e) {
	let t = e * e * e;
	return t > .008856451679035631 ? t : (116 * e - 16) / 903.2962962962963;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/viewing_conditions.js
var $i = class e {
	static make(t = Xi(), n = 200 / Math.PI * Ki(50) / 100, r = 50, i = 2, a = !1) {
		let o = t, s = o[0] * .401288 + o[1] * .650173 + o[2] * -.051461, c = o[0] * -.250268 + o[1] * 1.204414 + o[2] * .045854, l = o[0] * -.002079 + o[1] * .048952 + o[2] * .953127, u = .8 + i / 10, d = u >= .9 ? Oi(.59, .69, (u - .9) * 10) : Oi(.525, .59, (u - .8) * 10), f = a ? 1 : u * (1 - 1 / 3.6 * Math.exp((-n - 42) / 92));
		f = f > 1 ? 1 : f < 0 ? 0 : f;
		let p = u, m = [
			100 / s * f + 1 - f,
			100 / c * f + 1 - f,
			100 / l * f + 1 - f
		], h = 1 / (5 * n + 1), g = h * h * h * h, _ = 1 - g, v = g * n + .1 * _ * _ * Math.cbrt(5 * n), y = Ki(r) / t[1], b = 1.48 + Math.sqrt(y), x = .725 / y ** .2, S = x, C = [
			(v * m[0] * s / 100) ** .42,
			(v * m[1] * c / 100) ** .42,
			(v * m[2] * l / 100) ** .42
		], w = [
			400 * C[0] / (C[0] + 27.13),
			400 * C[1] / (C[1] + 27.13),
			400 * C[2] / (C[2] + 27.13)
		], ee = (2 * w[0] + w[1] + .05 * w[2]) * x;
		return new e(y, ee, x, S, d, p, m, v, v ** .25, b);
	}
	constructor(e, t, n, r, i, a, o, s, c, l) {
		this.n = e, this.aw = t, this.nbb = n, this.ncb = r, this.c = i, this.nc = a, this.rgbD = o, this.fl = s, this.fLRoot = c, this.z = l;
	}
};
$i.DEFAULT = $i.make();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/cam16.js
var ea = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.hue = e, this.chroma = t, this.j = n, this.q = r, this.m = i, this.s = a, this.jstar = o, this.astar = s, this.bstar = c;
	}
	distance(e) {
		let t = this.jstar - e.jstar, n = this.astar - e.astar, r = this.bstar - e.bstar;
		return 1.41 * Math.sqrt(t * t + n * n + r * r) ** .63;
	}
	static fromInt(t) {
		return e.fromIntInViewingConditions(t, $i.DEFAULT);
	}
	static fromIntInViewingConditions(t, n) {
		let r = (t & 16711680) >> 16, i = (t & 65280) >> 8, a = t & 255, o = Ji(r), s = Ji(i), c = Ji(a), l = .41233895 * o + .35762064 * s + .18051042 * c, u = .2126 * o + .7152 * s + .0722 * c, d = .01932141 * o + .11916382 * s + .95034478 * c, f = .401288 * l + .650173 * u - .051461 * d, p = -.250268 * l + 1.204414 * u + .045854 * d, m = -.002079 * l + .048952 * u + .953127 * d, h = n.rgbD[0] * f, g = n.rgbD[1] * p, _ = n.rgbD[2] * m, v = (n.fl * Math.abs(h) / 100) ** .42, y = (n.fl * Math.abs(g) / 100) ** .42, b = (n.fl * Math.abs(_) / 100) ** .42, x = Di(h) * 400 * v / (v + 27.13), S = Di(g) * 400 * y / (y + 27.13), C = Di(_) * 400 * b / (b + 27.13), w = (11 * x + -12 * S + C) / 11, ee = (x + S - 2 * C) / 9, te = (20 * x + 20 * S + 21 * C) / 20, ne = (40 * x + 20 * S + C) / 20, re = ji(Math.atan2(ee, w) * 180 / Math.PI), ie = re * Math.PI / 180, ae = 100 * (ne * n.nbb / n.aw) ** +(n.c * n.z), oe = 4 / n.c * Math.sqrt(ae / 100) * (n.aw + 4) * n.fLRoot, se = re < 20.14 ? re + 360 : re, ce = (5e4 / 13 * (.25 * (Math.cos(se * Math.PI / 180 + 2) + 3.8)) * n.nc * n.ncb * Math.sqrt(w * w + ee * ee) / (te + .305)) ** .9 * (1.64 - .29 ** n.n) ** .73, le = ce * Math.sqrt(ae / 100), ue = le * n.fLRoot, de = 50 * Math.sqrt(ce * n.c / (n.aw + 4)), fe = (1 + 100 * .007) * ae / (1 + .007 * ae), pe = 1 / .0228 * Math.log(1 + .0228 * ue), me = pe * Math.cos(ie), he = pe * Math.sin(ie);
		return new e(re, le, ae, oe, ue, de, fe, me, he);
	}
	static fromJch(t, n, r) {
		return e.fromJchInViewingConditions(t, n, r, $i.DEFAULT);
	}
	static fromJchInViewingConditions(t, n, r, i) {
		let a = 4 / i.c * Math.sqrt(t / 100) * (i.aw + 4) * i.fLRoot, o = n * i.fLRoot, s = n / Math.sqrt(t / 100), c = 50 * Math.sqrt(s * i.c / (i.aw + 4)), l = r * Math.PI / 180, u = (1 + 100 * .007) * t / (1 + .007 * t), d = 1 / .0228 * Math.log(1 + .0228 * o), f = d * Math.cos(l), p = d * Math.sin(l);
		return new e(r, n, t, a, o, c, u, f, p);
	}
	static fromUcs(t, n, r) {
		return e.fromUcsInViewingConditions(t, n, r, $i.DEFAULT);
	}
	static fromUcsInViewingConditions(t, n, r, i) {
		let a = n, o = r, s = Math.sqrt(a * a + o * o), c = (Math.exp(s * .0228) - 1) / .0228 / i.fLRoot, l = 180 / Math.PI * Math.atan2(o, a);
		l < 0 && (l += 360);
		let u = t / (1 - (t - 100) * .007);
		return e.fromJchInViewingConditions(u, c, l, i);
	}
	toInt() {
		return this.viewed($i.DEFAULT);
	}
	viewed(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = Di(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = Di(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = Di(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return Vi(1.86206786 * x - 1.01125463 * S + .14918677 * C, .38752654 * x + .62144744 * S - .00897398 * C, -.0158415 * x - .03412294 * S + 1.04996444 * C);
	}
	static fromXyzInViewingConditions(t, n, r, i) {
		let a = .401288 * t + .650173 * n - .051461 * r, o = -.250268 * t + 1.204414 * n + .045854 * r, s = -.002079 * t + .048952 * n + .953127 * r, c = i.rgbD[0] * a, l = i.rgbD[1] * o, u = i.rgbD[2] * s, d = (i.fl * Math.abs(c) / 100) ** .42, f = (i.fl * Math.abs(l) / 100) ** .42, p = (i.fl * Math.abs(u) / 100) ** .42, m = Di(c) * 400 * d / (d + 27.13), h = Di(l) * 400 * f / (f + 27.13), g = Di(u) * 400 * p / (p + 27.13), _ = (11 * m + -12 * h + g) / 11, v = (m + h - 2 * g) / 9, y = (20 * m + 20 * h + 21 * g) / 20, b = (40 * m + 20 * h + g) / 20, x = Math.atan2(v, _) * 180 / Math.PI, S = x < 0 ? x + 360 : x >= 360 ? x - 360 : x, C = S * Math.PI / 180, w = 100 * (b * i.nbb / i.aw) ** +(i.c * i.z), ee = 4 / i.c * Math.sqrt(w / 100) * (i.aw + 4) * i.fLRoot, te = S < 20.14 ? S + 360 : S, ne = (5e4 / 13 * (1 / 4 * (Math.cos(te * Math.PI / 180 + 2) + 3.8)) * i.nc * i.ncb * Math.sqrt(_ * _ + v * v) / (y + .305)) ** .9 * (1.64 - .29 ** i.n) ** .73, re = ne * Math.sqrt(w / 100), ie = re * i.fLRoot, ae = 50 * Math.sqrt(ne * i.c / (i.aw + 4)), oe = (1 + 100 * .007) * w / (1 + .007 * w), se = Math.log(1 + .0228 * ie) / .0228, ce = se * Math.cos(C), le = se * Math.sin(C);
		return new e(S, re, w, ee, ie, ae, oe, ce, le);
	}
	xyzInViewingConditions(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = Di(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = Di(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = Di(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return [
			1.86206786 * x - 1.01125463 * S + .14918677 * C,
			.38752654 * x + .62144744 * S - .00897398 * C,
			-.0158415 * x - .03412294 * S + 1.04996444 * C
		];
	}
}, ta = class e {
	static sanitizeRadians(e) {
		return (e + Math.PI * 8) % (Math.PI * 2);
	}
	static trueDelinearized(e) {
		let t = e / 100, n = 0;
		return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, n * 255;
	}
	static chromaticAdaptation(e) {
		let t = Math.abs(e) ** .42;
		return Di(e) * 400 * t / (t + 27.13);
	}
	static hueOf(t) {
		let n = Mi(t, e.SCALED_DISCOUNT_FROM_LINRGB), r = e.chromaticAdaptation(n[0]), i = e.chromaticAdaptation(n[1]), a = e.chromaticAdaptation(n[2]), o = (11 * r + -12 * i + a) / 11, s = (r + i - 2 * a) / 9;
		return Math.atan2(s, o);
	}
	static areInCyclicOrder(t, n, r) {
		return e.sanitizeRadians(n - t) < e.sanitizeRadians(r - t);
	}
	static intercept(e, t, n) {
		return (t - e) / (n - e);
	}
	static lerpPoint(e, t, n) {
		return [
			e[0] + (n[0] - e[0]) * t,
			e[1] + (n[1] - e[1]) * t,
			e[2] + (n[2] - e[2]) * t
		];
	}
	static setCoordinate(t, n, r, i) {
		let a = e.intercept(t[i], n, r[i]);
		return e.lerpPoint(t, a, r);
	}
	static isBounded(e) {
		return 0 <= e && e <= 100;
	}
	static nthVertex(t, n) {
		let r = e.Y_FROM_LINRGB[0], i = e.Y_FROM_LINRGB[1], a = e.Y_FROM_LINRGB[2], o = n % 4 <= 1 ? 0 : 100, s = n % 2 == 0 ? 0 : 100;
		if (n < 4) {
			let n = o, c = s, l = (t - n * i - c * a) / r;
			return e.isBounded(l) ? [
				l,
				n,
				c
			] : [
				-1,
				-1,
				-1
			];
		}
		if (n < 8) {
			let n = o, c = s, l = (t - c * r - n * a) / i;
			return e.isBounded(l) ? [
				c,
				l,
				n
			] : [
				-1,
				-1,
				-1
			];
		}
		{
			let n = o, c = s, l = (t - n * r - c * i) / a;
			return e.isBounded(l) ? [
				n,
				c,
				l
			] : [
				-1,
				-1,
				-1
			];
		}
	}
	static bisectToSegment(t, n) {
		let r = [
			-1,
			-1,
			-1
		], i = r, a = 0, o = 0, s = !1, c = !0;
		for (let l = 0; l < 12; l++) {
			let u = e.nthVertex(t, l);
			if (u[0] < 0) continue;
			let d = e.hueOf(u);
			if (!s) {
				r = u, i = u, a = d, o = d, s = !0;
				continue;
			}
			(c || e.areInCyclicOrder(a, d, o)) && (c = !1, e.areInCyclicOrder(a, n, d) ? (i = u, o = d) : (r = u, a = d));
		}
		return [r, i];
	}
	static midpoint(e, t) {
		return [
			(e[0] + t[0]) / 2,
			(e[1] + t[1]) / 2,
			(e[2] + t[2]) / 2
		];
	}
	static criticalPlaneBelow(e) {
		return Math.floor(e - .5);
	}
	static criticalPlaneAbove(e) {
		return Math.ceil(e - .5);
	}
	static bisectToLimit(t, n) {
		let r = e.bisectToSegment(t, n), i = r[0], a = e.hueOf(i), o = r[1];
		for (let t = 0; t < 3; t++) if (i[t] !== o[t]) {
			let r = -1, s = 255;
			i[t] < o[t] ? (r = e.criticalPlaneBelow(e.trueDelinearized(i[t])), s = e.criticalPlaneAbove(e.trueDelinearized(o[t]))) : (r = e.criticalPlaneAbove(e.trueDelinearized(i[t])), s = e.criticalPlaneBelow(e.trueDelinearized(o[t])));
			for (let c = 0; c < 8 && !(Math.abs(s - r) <= 1); c++) {
				let c = Math.floor((r + s) / 2), l = e.CRITICAL_PLANES[c], u = e.setCoordinate(i, l, o, t), d = e.hueOf(u);
				e.areInCyclicOrder(a, n, d) ? (o = u, s = c) : (i = u, a = d, r = c);
			}
		}
		return e.midpoint(i, o);
	}
	static inverseChromaticAdaptation(e) {
		let t = Math.abs(e), n = Math.max(0, 27.13 * t / (400 - t));
		return Di(e) * n ** (1 / .42);
	}
	static findResultByJ(t, n, r) {
		let i = Math.sqrt(r) * 11, a = $i.DEFAULT, o = 1 / (1.64 - .29 ** a.n) ** .73, s = .25 * (Math.cos(t + 2) + 3.8) * (5e4 / 13) * a.nc * a.ncb, c = Math.sin(t), l = Math.cos(t);
		for (let t = 0; t < 5; t++) {
			let u = i / 100, d = ((n === 0 || i === 0 ? 0 : n / Math.sqrt(u)) * o) ** (1 / .9), f = a.aw * u ** (1 / a.c / a.z) / a.nbb, p = 23 * (f + .305) * d / (23 * s + 11 * d * l + 108 * d * c), m = p * l, h = p * c, g = (460 * f + 451 * m + 288 * h) / 1403, _ = (460 * f - 891 * m - 261 * h) / 1403, v = (460 * f - 220 * m - 6300 * h) / 1403, y = Mi([
				e.inverseChromaticAdaptation(g),
				e.inverseChromaticAdaptation(_),
				e.inverseChromaticAdaptation(v)
			], e.LINRGB_FROM_SCALED_DISCOUNT);
			if (y[0] < 0 || y[1] < 0 || y[2] < 0) return 0;
			let b = e.Y_FROM_LINRGB[0], x = e.Y_FROM_LINRGB[1], S = e.Y_FROM_LINRGB[2], C = b * y[0] + x * y[1] + S * y[2];
			if (C <= 0) return 0;
			if (t === 4 || Math.abs(C - r) < .002) return y[0] > 100.01 || y[1] > 100.01 || y[2] > 100.01 ? 0 : Li(y);
			i -= (C - r) * i / (2 * C);
		}
		return 0;
	}
	static solveToInt(t, n, r) {
		if (n < 1e-4 || r < 1e-4 || r > 99.9999) return Wi(r);
		t = ji(t);
		let i = t / 180 * Math.PI, a = Ki(r), o = e.findResultByJ(i, n, a);
		return o === 0 ? Li(e.bisectToLimit(a, i)) : o;
	}
	static solveToCam(t, n, r) {
		return ea.fromInt(e.solveToInt(t, n, r));
	}
};
ta.SCALED_DISCOUNT_FROM_LINRGB = [
	[
		.001200833568784504,
		.002389694492170889,
		.0002795742885861124
	],
	[
		.0005891086651375999,
		.0029785502573438758,
		.0003270666104008398
	],
	[
		.00010146692491640572,
		.0005364214359186694,
		.0032979401770712076
	]
], ta.LINRGB_FROM_SCALED_DISCOUNT = [
	[
		1373.2198709594231,
		-1100.4251190754821,
		-7.278681089101213
	],
	[
		-271.815969077903,
		559.6580465940733,
		-32.46047482791194
	],
	[
		1.9622899599665666,
		-57.173814538844006,
		308.7233197812385
	]
], ta.Y_FROM_LINRGB = [
	.2126,
	.7152,
	.0722
], ta.CRITICAL_PLANES = [
	.015176349177441876,
	.045529047532325624,
	.07588174588720938,
	.10623444424209313,
	.13658714259697685,
	.16693984095186062,
	.19729253930674434,
	.2276452376616281,
	.2579979360165119,
	.28835063437139563,
	.3188300904430532,
	.350925934958123,
	.3848314933096426,
	.42057480301049466,
	.458183274052838,
	.4976837250274023,
	.5391024159806381,
	.5824650784040898,
	.6277969426914107,
	.6751227633498623,
	.7244668422128921,
	.775853049866786,
	.829304845476233,
	.8848452951698498,
	.942497089126609,
	1.0022825574869039,
	1.0642236851973577,
	1.1283421258858297,
	1.1946592148522128,
	1.2631959812511864,
	1.3339731595349034,
	1.407011200216447,
	1.4823302800086415,
	1.5599503113873272,
	1.6398909516233677,
	1.7221716113234105,
	1.8068114625156377,
	1.8938294463134073,
	1.9832442801866852,
	2.075074464868551,
	2.1693382909216234,
	2.2660538449872063,
	2.36523901573795,
	2.4669114995532007,
	2.5710888059345764,
	2.6777882626779785,
	2.7870270208169257,
	2.898822059350997,
	3.0131901897720907,
	3.1301480604002863,
	3.2497121605402226,
	3.3718988244681087,
	3.4967242352587946,
	3.624204428461639,
	3.754355295633311,
	3.887192587735158,
	4.022731918402185,
	4.160988767090289,
	4.301978482107941,
	4.445716283538092,
	4.592217266055746,
	4.741496401646282,
	4.893568542229298,
	5.048448422192488,
	5.20615066083972,
	5.3666897647573375,
	5.5300801301023865,
	5.696336044816294,
	5.865471690767354,
	6.037501145825082,
	6.212438385869475,
	6.390297286737924,
	6.571091626112461,
	6.7548350853498045,
	6.941541251256611,
	7.131223617812143,
	7.323895587840543,
	7.5195704746346665,
	7.7182615035334345,
	7.919981813454504,
	8.124744458384042,
	8.332562408825165,
	8.543448553206703,
	8.757415699253682,
	8.974476575321063,
	9.194643831691977,
	9.417930041841839,
	9.644347703669503,
	9.873909240696694,
	10.106627003236781,
	10.342513269534024,
	10.58158024687427,
	10.8238400726681,
	11.069304815507364,
	11.317986476196008,
	11.569896988756009,
	11.825048221409341,
	12.083451977536606,
	12.345119996613247,
	12.610063955123938,
	12.878295467455942,
	13.149826086772048,
	13.42466730586372,
	13.702830557985108,
	13.984327217668513,
	14.269168601521828,
	14.55736596900856,
	14.848930523210871,
	15.143873411576273,
	15.44220572664832,
	15.743938506781891,
	16.04908273684337,
	16.35764934889634,
	16.66964922287304,
	16.985093187232053,
	17.30399201960269,
	17.62635644741625,
	17.95219714852476,
	18.281524751807332,
	18.614349837764564,
	18.95068293910138,
	19.290534541298456,
	19.633915083172692,
	19.98083495742689,
	20.331304511189067,
	20.685334046541502,
	21.042933821039977,
	21.404114048223256,
	21.76888489811322,
	22.137256497705877,
	22.50923893145328,
	22.884842241736916,
	23.264076429332462,
	23.6469514538663,
	24.033477234264016,
	24.42366364919083,
	24.817520537484558,
	25.21505769858089,
	25.61628489293138,
	26.021211842414342,
	26.429848230738664,
	26.842203703840827,
	27.258287870275353,
	27.678110301598522,
	28.10168053274597,
	28.529008062403893,
	28.96010235337422,
	29.39497283293396,
	29.83362889318845,
	30.276079891419332,
	30.722335150426627,
	31.172403958865512,
	31.62629557157785,
	32.08401920991837,
	32.54558406207592,
	33.010999283389665,
	33.4802739966603,
	33.953417292456834,
	34.430438229418264,
	34.911345834551085,
	35.39614910352207,
	35.88485700094671,
	36.37747846067349,
	36.87402238606382,
	37.37449765026789,
	37.87891309649659,
	38.38727753828926,
	38.89959975977785,
	39.41588851594697,
	39.93615253289054,
	40.460400508064545,
	40.98864111053629,
	41.520882981230194,
	42.05713473317016,
	42.597404951718396,
	43.141702194811224,
	43.6900349931913,
	44.24241185063697,
	44.798841244188324,
	45.35933162437017,
	45.92389141541209,
	46.49252901546552,
	47.065252796817916,
	47.64207110610409,
	48.22299226451468,
	48.808024568002054,
	49.3971762874833,
	49.9904556690408,
	50.587870934119984,
	51.189430279724725,
	51.79514187861014,
	52.40501387947288,
	53.0190544071392,
	53.637271562750364,
	54.259673423945976,
	54.88626804504493,
	55.517063457223934,
	56.15206766869424,
	56.79128866487574,
	57.43473440856916,
	58.08241284012621,
	58.734331877617365,
	59.39049941699807,
	60.05092333227251,
	60.715611475655585,
	61.38457167773311,
	62.057811747619894,
	62.7353394731159,
	63.417162620860914,
	64.10328893648692,
	64.79372614476921,
	65.48848194977529,
	66.18756403501224,
	66.89098006357258,
	67.59873767827808,
	68.31084450182222,
	69.02730813691093,
	69.74813616640164,
	70.47333615344107,
	71.20291564160104,
	71.93688215501312,
	72.67524319850172,
	73.41800625771542,
	74.16517879925733,
	74.9167682708136,
	75.67278210128072,
	76.43322770089146,
	77.1981124613393,
	77.96744375590167,
	78.74122893956174,
	79.51947534912904,
	80.30219030335869,
	81.08938110306934,
	81.88105503125999,
	82.67721935322541,
	83.4778813166706,
	84.28304815182372,
	85.09272707154808,
	85.90692527145302,
	86.72564993000343,
	87.54890820862819,
	88.3767072518277,
	89.2090541872801,
	90.04595612594655,
	90.88742016217518,
	91.73345337380438,
	92.58406282226491,
	93.43925555268066,
	94.29903859396902,
	95.16341895893969,
	96.03240364439274,
	96.9059996312159,
	97.78421388448044,
	98.6670533535366,
	99.55452497210776
];
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/hct.js
var B = class e {
	static from(t, n, r) {
		return new e(ta.solveToInt(t, n, r));
	}
	static fromInt(t) {
		return new e(t);
	}
	toInt() {
		return this.argb;
	}
	get hue() {
		return this.internalHue;
	}
	set hue(e) {
		this.setInternalState(ta.solveToInt(e, this.internalChroma, this.internalTone));
	}
	get chroma() {
		return this.internalChroma;
	}
	set chroma(e) {
		this.setInternalState(ta.solveToInt(this.internalHue, e, this.internalTone));
	}
	get tone() {
		return this.internalTone;
	}
	set tone(e) {
		this.setInternalState(ta.solveToInt(this.internalHue, this.internalChroma, e));
	}
	setValue(e, t) {
		this[e] = t;
	}
	toString() {
		return `HCT(${this.hue.toFixed(0)}, ${this.chroma.toFixed(0)}, ${this.tone.toFixed(0)})`;
	}
	static isBlue(e) {
		return e >= 250 && e < 270;
	}
	static isYellow(e) {
		return e >= 105 && e < 125;
	}
	static isCyan(e) {
		return e >= 170 && e < 207;
	}
	constructor(e) {
		this.argb = e;
		let t = ea.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = Gi(e), this.argb = e;
	}
	setInternalState(e) {
		let t = ea.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = Gi(e), this.argb = e;
	}
	inViewingConditions(t) {
		let n = ea.fromInt(this.toInt()).xyzInViewingConditions(t), r = ea.fromXyzInViewingConditions(n[0], n[1], n[2], $i.make());
		return e.from(r.hue, r.chroma, qi(n[1]));
	}
}, V = class e {
	static ratioOfTones(t, n) {
		return t = z(0, 100, t), n = z(0, 100, n), e.ratioOfYs(Ki(t), Ki(n));
	}
	static ratioOfYs(e, t) {
		let n = e > t ? e : t, r = n === t ? e : t;
		return (n + 5) / (r + 5);
	}
	static lighter(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = Ki(t), i = n * (r + 5) - 5, a = e.ratioOfYs(i, r), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = qi(i) + .4;
		return s < 0 || s > 100 ? -1 : s;
	}
	static darker(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = Ki(t), i = (r + 5) / n - 5, a = e.ratioOfYs(r, i), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = qi(i) - .4;
		return s < 0 || s > 100 ? -1 : s;
	}
	static lighterUnsafe(t, n) {
		let r = e.lighter(t, n);
		return r < 0 ? 100 : r;
	}
	static darkerUnsafe(t, n) {
		let r = e.darker(t, n);
		return r < 0 ? 0 : r;
	}
}, na = class e {
	static isDisliked(e) {
		let t = Math.round(e.hue) >= 90 && Math.round(e.hue) <= 111, n = Math.round(e.chroma) > 16, r = Math.round(e.tone) < 65;
		return t && n && r;
	}
	static fixIfDisliked(t) {
		return e.isDisliked(t) ? B.from(t.hue, t.chroma, 70) : t;
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/dynamic_color.js
function ra(e, t, n) {
	if (e.name !== n.name) throw Error(`Attempting to extend color ${e.name} with color ${n.name} of different name for spec version ${t}.`);
	if (e.isBackground !== n.isBackground) throw Error(`Attempting to extend color ${e.name} as a ${e.isBackground ? "background" : "foreground"} with color ${n.name} as a ${n.isBackground ? "background" : "foreground"} for spec version ${t}.`);
}
function H(e, t, n) {
	return ra(e, t, n), U.fromPalette({
		name: e.name,
		palette: (r) => r.specVersion >= t ? n.palette(r) : e.palette(r),
		tone: (r) => r.specVersion >= t ? n.tone(r) : e.tone(r),
		isBackground: e.isBackground,
		chromaMultiplier: (r) => {
			let i = r.specVersion >= t ? n.chromaMultiplier : e.chromaMultiplier;
			return i === void 0 ? 1 : i(r);
		},
		background: (r) => {
			let i = r.specVersion >= t ? n.background : e.background;
			return i === void 0 ? void 0 : i(r);
		},
		secondBackground: (r) => {
			let i = r.specVersion >= t ? n.secondBackground : e.secondBackground;
			return i === void 0 ? void 0 : i(r);
		},
		contrastCurve: (r) => {
			let i = r.specVersion >= t ? n.contrastCurve : e.contrastCurve;
			return i === void 0 ? void 0 : i(r);
		},
		toneDeltaPair: (r) => {
			let i = r.specVersion >= t ? n.toneDeltaPair : e.toneDeltaPair;
			return i === void 0 ? void 0 : i(r);
		}
	});
}
var U = class e {
	static fromPalette(t) {
		return new e(t.name ?? "", t.palette, t.tone ?? e.getInitialToneFromBackground(t.background), t.isBackground ?? !1, t.chromaMultiplier, t.background, t.secondBackground, t.contrastCurve, t.toneDeltaPair);
	}
	static getInitialToneFromBackground(e) {
		return e === void 0 ? (e) => 50 : (t) => e(t) ? e(t).getTone(t) : 50;
	}
	constructor(e, t, n, r, i, a, o, s, c) {
		if (this.name = e, this.palette = t, this.tone = n, this.isBackground = r, this.chromaMultiplier = i, this.background = a, this.secondBackground = o, this.contrastCurve = s, this.toneDeltaPair = c, this.hctCache = /* @__PURE__ */ new Map(), !a && o) throw Error(`Color ${e} has secondBackgrounddefined, but background is not defined.`);
		if (!a && s) throw Error(`Color ${e} has contrastCurvedefined, but background is not defined.`);
		if (a && !s) throw Error(`Color ${e} has backgrounddefined, but contrastCurve is not defined.`);
	}
	clone() {
		return e.fromPalette({
			name: this.name,
			palette: this.palette,
			tone: this.tone,
			isBackground: this.isBackground,
			chromaMultiplier: this.chromaMultiplier,
			background: this.background,
			secondBackground: this.secondBackground,
			contrastCurve: this.contrastCurve,
			toneDeltaPair: this.toneDeltaPair
		});
	}
	clearCache() {
		this.hctCache.clear();
	}
	getArgb(e) {
		return this.getHct(e).toInt();
	}
	getHct(e) {
		let t = this.hctCache.get(e);
		if (t != null) return t;
		let n = ca(e.specVersion).getHct(e, this);
		return this.hctCache.size > 4 && this.hctCache.clear(), this.hctCache.set(e, n), n;
	}
	getTone(e) {
		return ca(e.specVersion).getTone(e, this);
	}
	static foregroundTone(t, n) {
		let r = V.lighterUnsafe(t, n), i = V.darkerUnsafe(t, n), a = V.ratioOfTones(r, t), o = V.ratioOfTones(i, t);
		if (e.tonePrefersLightForeground(t)) {
			let e = Math.abs(a - o) < .1 && a < n && o < n;
			return a >= n || a >= o || e ? r : i;
		}
		return o >= n || o >= a ? i : r;
	}
	static tonePrefersLightForeground(e) {
		return Math.round(e) < 60;
	}
	static toneAllowsLightForeground(e) {
		return Math.round(e) <= 49;
	}
	static enableLightForeground(t) {
		return e.tonePrefersLightForeground(t) && !e.toneAllowsLightForeground(t) ? 49 : t;
	}
}, ia = class {
	getHct(e, t) {
		let n = t.getTone(e);
		return t.palette(e).getHct(n);
	}
	getTone(e, t) {
		let n = e.contrastLevel < 0, r = t.toneDeltaPair ? t.toneDeltaPair(e) : void 0;
		if (r) {
			let i = r.roleA, a = r.roleB, o = r.delta, s = r.polarity, c = r.stayTogether, l = s === "nearer" || s === "lighter" && !e.isDark || s === "darker" && e.isDark, u = l ? i : a, d = l ? a : i, f = t.name === u.name, p = e.isDark ? 1 : -1, m = u.tone(e), h = d.tone(e);
			if (t.background && u.contrastCurve && d.contrastCurve) {
				let r = t.background(e), i = u.contrastCurve(e), a = d.contrastCurve(e);
				if (r && i && a) {
					let t = r.getTone(e), o = i.get(e.contrastLevel), s = a.get(e.contrastLevel);
					V.ratioOfTones(t, m) < o && (m = U.foregroundTone(t, o)), V.ratioOfTones(t, h) < s && (h = U.foregroundTone(t, s)), n && (m = U.foregroundTone(t, o), h = U.foregroundTone(t, s));
				}
			}
			return (h - m) * p < o && (h = z(0, 100, m + o * p), (h - m) * p >= o || (m = z(0, 100, h - o * p))), 50 <= m && m < 60 ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : 50 <= h && h < 60 && (c ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : h = p > 0 ? 60 : 49), f ? m : h;
		}
		{
			let r = t.tone(e);
			if (t.background == null || t.background(e) === void 0 || t.contrastCurve == null || t.contrastCurve(e) === void 0) return r;
			let i = t.background(e).getTone(e), a = t.contrastCurve(e).get(e.contrastLevel);
			if (V.ratioOfTones(i, r) >= a || (r = U.foregroundTone(i, a)), n && (r = U.foregroundTone(i, a)), t.isBackground && 50 <= r && r < 60 && (r = V.ratioOfTones(49, i) >= a ? 49 : 60), t.secondBackground == null || t.secondBackground(e) === void 0) return r;
			let [o, s] = [t.background, t.secondBackground], [c, l] = [o(e).getTone(e), s(e).getTone(e)], [u, d] = [Math.max(c, l), Math.min(c, l)];
			if (V.ratioOfTones(u, r) >= a && V.ratioOfTones(d, r) >= a) return r;
			let f = V.lighter(u, a), p = V.darker(d, a), m = [];
			return f !== -1 && m.push(f), p !== -1 && m.push(p), U.tonePrefersLightForeground(c) || U.tonePrefersLightForeground(l) ? f < 0 ? 100 : f : m.length === 1 ? m[0] : p < 0 ? 0 : p;
		}
	}
}, aa = class {
	getHct(e, t) {
		let n = t.palette(e), r = t.getTone(e), i = n.hue, a = n.chroma * (t.chromaMultiplier ? t.chromaMultiplier(e) : 1);
		return B.from(i, a, r);
	}
	getTone(e, t) {
		let n = t.toneDeltaPair ? t.toneDeltaPair(e) : void 0;
		if (n) {
			let r = n.roleA, i = n.roleB, a = n.polarity, o = n.constraint, s = a === "darker" || a === "relative_lighter" && e.isDark || a === "relative_darker" && !e.isDark ? -n.delta : n.delta, c = t.name === r.name, l = c ? r : i, u = c ? i : r, d = l.tone(e), f = u.getTone(e), p = s * (c ? 1 : -1);
			if (o === "exact" ? d = z(0, 100, f + p) : o === "nearer" ? d = p > 0 ? z(0, 100, z(f, f + p, d)) : z(0, 100, z(f + p, f, d)) : o === "farther" && (d = p > 0 ? z(f + p, 100, d) : z(0, f + p, d)), t.background && t.contrastCurve) {
				let n = t.background(e), r = t.contrastCurve(e);
				if (n && r) {
					let t = n.getTone(e), i = r.get(e.contrastLevel);
					d = V.ratioOfTones(t, d) >= i && e.contrastLevel >= 0 ? d : U.foregroundTone(t, i);
				}
			}
			return t.isBackground && !t.name.endsWith("_fixed_dim") && (d = d >= 57 ? z(65, 100, d) : z(0, 49, d)), d;
		}
		{
			let n = t.tone(e);
			if (t.background == null || t.background(e) === void 0 || t.contrastCurve == null || t.contrastCurve(e) === void 0) return n;
			let r = t.background(e).getTone(e), i = t.contrastCurve(e).get(e.contrastLevel);
			if (n = V.ratioOfTones(r, n) >= i && e.contrastLevel >= 0 ? n : U.foregroundTone(r, i), t.isBackground && !t.name.endsWith("_fixed_dim") && (n = n >= 57 ? z(65, 100, n) : z(0, 49, n)), t.secondBackground == null || t.secondBackground(e) === void 0) return n;
			let [a, o] = [t.background, t.secondBackground], [s, c] = [a(e).getTone(e), o(e).getTone(e)], [l, u] = [Math.max(s, c), Math.min(s, c)];
			if (V.ratioOfTones(l, n) >= i && V.ratioOfTones(u, n) >= i) return n;
			let d = V.lighter(l, i), f = V.darker(u, i), p = [];
			return d !== -1 && p.push(d), f !== -1 && p.push(f), U.tonePrefersLightForeground(s) || U.tonePrefersLightForeground(c) ? d < 0 ? 100 : d : p.length === 1 ? p[0] : f < 0 ? 0 : f;
		}
	}
}, oa = new ia(), sa = new aa();
function ca(e) {
	return e === "2021" ? oa : sa;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/palettes/tonal_palette.js
var W = class e {
	static fromInt(t) {
		let n = B.fromInt(t);
		return e.fromHct(n);
	}
	static fromHct(t) {
		return new e(t.hue, t.chroma, t);
	}
	static fromHueAndChroma(t, n) {
		let r = new la(t, n).create();
		return new e(t, n, r);
	}
	constructor(e, t, n) {
		this.hue = e, this.chroma = t, this.keyColor = n, this.cache = /* @__PURE__ */ new Map();
	}
	tone(e) {
		let t = this.cache.get(e);
		return t === void 0 && (t = e == 99 && B.isYellow(this.hue) ? this.averageArgb(this.tone(98), this.tone(100)) : B.from(this.hue, this.chroma, e).toInt(), this.cache.set(e, t)), t;
	}
	getHct(e) {
		return B.fromInt(this.tone(e));
	}
	averageArgb(e, t) {
		let n = e >>> 16 & 255, r = e >>> 8 & 255, i = e & 255, a = t >>> 16 & 255, o = t >>> 8 & 255, s = t & 255, c = Math.round((n + a) / 2), l = Math.round((r + o) / 2), u = Math.round((i + s) / 2);
		return (255 << 24 | (c & 255) << 16 | (l & 255) << 8 | u & 255) >>> 0;
	}
}, la = class {
	constructor(e, t) {
		this.hue = e, this.requestedChroma = t, this.chromaCache = /* @__PURE__ */ new Map(), this.maxChromaValue = 200;
	}
	create() {
		let e = 0, t = 100;
		for (; e < t;) {
			let n = Math.floor((e + t) / 2), r = this.maxChroma(n) < this.maxChroma(n + 1);
			if (this.maxChroma(n) >= this.requestedChroma - .01) {
				if (Math.abs(e - 50) < Math.abs(t - 50)) t = n;
				else {
					if (e === n) return B.from(this.hue, this.requestedChroma, e);
					e = n;
				}
			} else r ? e = n + 1 : t = n;
		}
		return B.from(this.hue, this.requestedChroma, e);
	}
	maxChroma(e) {
		if (this.chromaCache.has(e)) return this.chromaCache.get(e);
		let t = B.from(this.hue, this.maxChromaValue, e).chroma;
		return this.chromaCache.set(e, t), t;
	}
}, ua = class e {
	constructor(e) {
		this.input = e, this.hctsByTempCache = [], this.hctsByHueCache = [], this.tempsByHctCache = /* @__PURE__ */ new Map(), this.inputRelativeTemperatureCache = -1, this.complementCache = null;
	}
	get hctsByTemp() {
		if (this.hctsByTempCache.length > 0) return this.hctsByTempCache;
		let e = this.hctsByHue.concat([this.input]), t = this.tempsByHct;
		return e.sort((e, n) => t.get(e) - t.get(n)), this.hctsByTempCache = e, e;
	}
	get warmest() {
		return this.hctsByTemp[this.hctsByTemp.length - 1];
	}
	get coldest() {
		return this.hctsByTemp[0];
	}
	analogous(e = 5, t = 12) {
		let n = Math.round(this.input.hue), r = this.hctsByHue[n], i = this.relativeTemperature(r), a = [r], o = 0;
		for (let e = 0; e < 360; e++) {
			let t = Ai(n + e), r = this.hctsByHue[t], a = this.relativeTemperature(r), s = Math.abs(a - i);
			i = a, o += s;
		}
		let s = 1, c = o / t, l = 0;
		for (i = this.relativeTemperature(r); a.length < t;) {
			let e = Ai(n + s), r = this.hctsByHue[e], o = this.relativeTemperature(r), u = Math.abs(o - i);
			l += u;
			let d = a.length * c, f = l >= d, p = 1;
			for (; f && a.length < t;) {
				a.push(r);
				let e = (a.length + p) * c;
				f = l >= e, p++;
			}
			if (i = o, s++, s > 360) {
				for (; a.length < t;) a.push(r);
				break;
			}
		}
		let u = [this.input], d = Math.floor((e - 1) / 2);
		for (let e = 1; e < d + 1; e++) {
			let t = 0 - e;
			for (; t < 0;) t = a.length + t;
			t >= a.length && (t %= a.length), u.splice(0, 0, a[t]);
		}
		let f = e - d - 1;
		for (let e = 1; e < f + 1; e++) {
			let t = e;
			for (; t < 0;) t = a.length + t;
			t >= a.length && (t %= a.length), u.push(a[t]);
		}
		return u;
	}
	get complement() {
		if (this.complementCache != null) return this.complementCache;
		let t = this.coldest.hue, n = this.tempsByHct.get(this.coldest), r = this.warmest.hue, i = this.tempsByHct.get(this.warmest) - n, a = e.isBetween(this.input.hue, t, r), o = a ? r : t, s = a ? t : r, c = 1e3, l = this.hctsByHue[Math.round(this.input.hue)], u = 1 - this.inputRelativeTemperature;
		for (let t = 0; t <= 360; t += 1) {
			let r = ji(o + 1 * t);
			if (!e.isBetween(r, o, s)) continue;
			let a = this.hctsByHue[Math.round(r)], d = (this.tempsByHct.get(a) - n) / i, f = Math.abs(u - d);
			f < c && (c = f, l = a);
		}
		return this.complementCache = l, this.complementCache;
	}
	relativeTemperature(e) {
		let t = this.tempsByHct.get(this.warmest) - this.tempsByHct.get(this.coldest), n = this.tempsByHct.get(e) - this.tempsByHct.get(this.coldest);
		return t === 0 ? .5 : n / t;
	}
	get inputRelativeTemperature() {
		return this.inputRelativeTemperatureCache >= 0 || (this.inputRelativeTemperatureCache = this.relativeTemperature(this.input)), this.inputRelativeTemperatureCache;
	}
	get tempsByHct() {
		if (this.tempsByHctCache.size > 0) return this.tempsByHctCache;
		let t = this.hctsByHue.concat([this.input]), n = /* @__PURE__ */ new Map();
		for (let r of t) n.set(r, e.rawTemperature(r));
		return this.tempsByHctCache = n, n;
	}
	get hctsByHue() {
		if (this.hctsByHueCache.length > 0) return this.hctsByHueCache;
		let e = [];
		for (let t = 0; t <= 360; t += 1) {
			let n = B.from(t, this.input.chroma, this.input.tone);
			e.push(n);
		}
		return this.hctsByHueCache = e, this.hctsByHueCache;
	}
	static isBetween(e, t, n) {
		return t < n ? t <= e && e <= n : t <= e || e <= n;
	}
	static rawTemperature(e) {
		let t = Ui(e.toInt()), n = ji(Math.atan2(t[2], t[1]) * 180 / Math.PI);
		return -.5 + .02 * Math.sqrt(t[1] * t[1] + t[2] * t[2]) ** 1.07 * Math.cos(ji(n - 50) * Math.PI / 180);
	}
}, G = class {
	constructor(e, t, n, r) {
		this.low = e, this.normal = t, this.medium = n, this.high = r;
	}
	get(e) {
		return e <= -1 ? this.low : e < 0 ? Oi(this.low, this.normal, (e - -1) / 1) : e < .5 ? Oi(this.normal, this.medium, (e - 0) / .5) : e < 1 ? Oi(this.medium, this.high, (e - .5) / .5) : this.high;
	}
}, K = class {
	constructor(e, t, n, r, i, a) {
		this.roleA = e, this.roleB = t, this.delta = n, this.polarity = r, this.stayTogether = i, this.constraint = a, this.constraint = a ?? "exact";
	}
}, q;
(function(e) {
	e[e.MONOCHROME = 0] = "MONOCHROME", e[e.NEUTRAL = 1] = "NEUTRAL", e[e.TONAL_SPOT = 2] = "TONAL_SPOT", e[e.VIBRANT = 3] = "VIBRANT", e[e.EXPRESSIVE = 4] = "EXPRESSIVE", e[e.FIDELITY = 5] = "FIDELITY", e[e.CONTENT = 6] = "CONTENT", e[e.RAINBOW = 7] = "RAINBOW", e[e.FRUIT_SALAD = 8] = "FRUIT_SALAD", e[e.CMF = 9] = "CMF";
})(q ||= {});
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/color_spec_2021.js
function da(e) {
	return e.variant === q.FIDELITY || e.variant === q.CONTENT;
}
function J(e) {
	return e.variant === q.MONOCHROME;
}
function fa(e, t, n, r) {
	let i = n, a = B.from(e, t, n);
	if (a.chroma < t) {
		let n = a.chroma;
		for (; a.chroma < t;) {
			i += r ? -1 : 1;
			let o = B.from(e, t, i);
			if (n > o.chroma || Math.abs(o.chroma - t) < .4) break;
			Math.abs(o.chroma - t) < Math.abs(a.chroma - t) && (a = o), n = Math.max(n, o.chroma);
		}
	}
	return i;
}
var pa = class {
	primaryPaletteKeyColor() {
		return U.fromPalette({
			name: "primary_palette_key_color",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.primaryPalette.keyColor.tone
		});
	}
	secondaryPaletteKeyColor() {
		return U.fromPalette({
			name: "secondary_palette_key_color",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.secondaryPalette.keyColor.tone
		});
	}
	tertiaryPaletteKeyColor() {
		return U.fromPalette({
			name: "tertiary_palette_key_color",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.tertiaryPalette.keyColor.tone
		});
	}
	neutralPaletteKeyColor() {
		return U.fromPalette({
			name: "neutral_palette_key_color",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.neutralPalette.keyColor.tone
		});
	}
	neutralVariantPaletteKeyColor() {
		return U.fromPalette({
			name: "neutral_variant_palette_key_color",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.neutralVariantPalette.keyColor.tone
		});
	}
	errorPaletteKeyColor() {
		return U.fromPalette({
			name: "error_palette_key_color",
			palette: (e) => e.errorPalette,
			tone: (e) => e.errorPalette.keyColor.tone
		});
	}
	background() {
		return U.fromPalette({
			name: "background",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : 98,
			isBackground: !0
		});
	}
	onBackground() {
		return U.fromPalette({
			name: "on_background",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 10,
			background: (e) => this.background(),
			contrastCurve: (e) => new G(3, 3, 4.5, 7)
		});
	}
	surface() {
		return U.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : 98,
			isBackground: !0
		});
	}
	surfaceDim() {
		return U.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : new G(87, 87, 80, 75).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceBright() {
		return U.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new G(24, 24, 29, 34).get(e.contrastLevel) : 98,
			isBackground: !0
		});
	}
	surfaceContainerLowest() {
		return U.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new G(4, 4, 2, 0).get(e.contrastLevel) : 100,
			isBackground: !0
		});
	}
	surfaceContainerLow() {
		return U.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new G(10, 10, 11, 12).get(e.contrastLevel) : new G(96, 96, 96, 95).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainer() {
		return U.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new G(12, 12, 16, 20).get(e.contrastLevel) : new G(94, 94, 92, 90).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainerHigh() {
		return U.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new G(17, 17, 21, 25).get(e.contrastLevel) : new G(92, 92, 88, 85).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainerHighest() {
		return U.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new G(22, 22, 26, 30).get(e.contrastLevel) : new G(90, 90, 84, 80).get(e.contrastLevel),
			isBackground: !0
		});
	}
	onSurface() {
		return U.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 10,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	surfaceVariant() {
		return U.fromPalette({
			name: "surface_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 30 : 90,
			isBackground: !0
		});
	}
	onSurfaceVariant() {
		return U.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 80 : 30,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	inverseSurface() {
		return U.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 20,
			isBackground: !0
		});
	}
	inverseOnSurface() {
		return U.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 20 : 95,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	outline() {
		return U.fromPalette({
			name: "outline",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 60 : 50,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1.5, 3, 4.5, 7)
		});
	}
	outlineVariant() {
		return U.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 30 : 80,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5)
		});
	}
	shadow() {
		return U.fromPalette({
			name: "shadow",
			palette: (e) => e.neutralPalette,
			tone: (e) => 0
		});
	}
	scrim() {
		return U.fromPalette({
			name: "scrim",
			palette: (e) => e.neutralPalette,
			tone: (e) => 0
		});
	}
	surfaceTint() {
		return U.fromPalette({
			name: "surface_tint",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.isDark ? 80 : 40,
			isBackground: !0
		});
	}
	primary() {
		return U.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => J(e) ? e.isDark ? 100 : 0 : e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new K(this.primaryContainer(), this.primary(), 10, "nearer", !1)
		});
	}
	primaryDim() {}
	onPrimary() {
		return U.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => J(e) ? e.isDark ? 10 : 90 : e.isDark ? 20 : 100,
			background: (e) => this.primary(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	primaryContainer() {
		return U.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => da(e) ? e.sourceColorHct.tone : J(e) ? e.isDark ? 85 : 25 : e.isDark ? 30 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.primaryContainer(), this.primary(), 10, "nearer", !1)
		});
	}
	onPrimaryContainer() {
		return U.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => da(e) ? U.foregroundTone(this.primaryContainer().tone(e), 4.5) : J(e) ? e.isDark ? 0 : 100 : e.isDark ? 90 : 30,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	inversePrimary() {
		return U.fromPalette({
			name: "inverse_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.isDark ? 40 : 80,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => new G(3, 4.5, 7, 7)
		});
	}
	secondary() {
		return U.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new K(this.secondaryContainer(), this.secondary(), 10, "nearer", !1)
		});
	}
	secondaryDim() {}
	onSecondary() {
		return U.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => J(e) ? e.isDark ? 10 : 100 : e.isDark ? 20 : 100,
			background: (e) => this.secondary(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	secondaryContainer() {
		return U.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => {
				let t = e.isDark ? 30 : 90;
				return J(e) ? e.isDark ? 30 : 85 : da(e) ? fa(e.secondaryPalette.hue, e.secondaryPalette.chroma, t, !e.isDark) : t;
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.secondaryContainer(), this.secondary(), 10, "nearer", !1)
		});
	}
	onSecondaryContainer() {
		return U.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => J(e) ? e.isDark ? 90 : 10 : da(e) ? U.foregroundTone(this.secondaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	tertiary() {
		return U.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => J(e) ? e.isDark ? 90 : 25 : e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new K(this.tertiaryContainer(), this.tertiary(), 10, "nearer", !1)
		});
	}
	tertiaryDim() {}
	onTertiary() {
		return U.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => J(e) ? e.isDark ? 10 : 90 : e.isDark ? 20 : 100,
			background: (e) => this.tertiary(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	tertiaryContainer() {
		return U.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				if (J(e)) return e.isDark ? 60 : 49;
				if (!da(e)) return e.isDark ? 30 : 90;
				let t = e.tertiaryPalette.getHct(e.sourceColorHct.tone);
				return na.fixIfDisliked(t).tone;
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.tertiaryContainer(), this.tertiary(), 10, "nearer", !1)
		});
	}
	onTertiaryContainer() {
		return U.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => J(e) ? e.isDark ? 0 : 100 : da(e) ? U.foregroundTone(this.tertiaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	error() {
		return U.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new K(this.errorContainer(), this.error(), 10, "nearer", !1)
		});
	}
	errorDim() {}
	onError() {
		return U.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? 20 : 100,
			background: (e) => this.error(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	errorContainer() {
		return U.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? 30 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.errorContainer(), this.error(), 10, "nearer", !1)
		});
	}
	onErrorContainer() {
		return U.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => J(e) ? e.isDark ? 90 : 10 : e.isDark ? 90 : 30,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	primaryFixed() {
		return U.fromPalette({
			name: "primary_fixed",
			palette: (e) => e.primaryPalette,
			tone: (e) => J(e) ? 40 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.primaryFixed(), this.primaryFixedDim(), 10, "lighter", !0)
		});
	}
	primaryFixedDim() {
		return U.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => J(e) ? 30 : 80,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.primaryFixed(), this.primaryFixedDim(), 10, "lighter", !0)
		});
	}
	onPrimaryFixed() {
		return U.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			tone: (e) => J(e) ? 100 : 10,
			background: (e) => this.primaryFixedDim(),
			secondBackground: (e) => this.primaryFixed(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	onPrimaryFixedVariant() {
		return U.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			tone: (e) => J(e) ? 90 : 30,
			background: (e) => this.primaryFixedDim(),
			secondBackground: (e) => this.primaryFixed(),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	secondaryFixed() {
		return U.fromPalette({
			name: "secondary_fixed",
			palette: (e) => e.secondaryPalette,
			tone: (e) => J(e) ? 80 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.secondaryFixed(), this.secondaryFixedDim(), 10, "lighter", !0)
		});
	}
	secondaryFixedDim() {
		return U.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => J(e) ? 70 : 80,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.secondaryFixed(), this.secondaryFixedDim(), 10, "lighter", !0)
		});
	}
	onSecondaryFixed() {
		return U.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			tone: (e) => 10,
			background: (e) => this.secondaryFixedDim(),
			secondBackground: (e) => this.secondaryFixed(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	onSecondaryFixedVariant() {
		return U.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			tone: (e) => J(e) ? 25 : 30,
			background: (e) => this.secondaryFixedDim(),
			secondBackground: (e) => this.secondaryFixed(),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	tertiaryFixed() {
		return U.fromPalette({
			name: "tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => J(e) ? 40 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.tertiaryFixed(), this.tertiaryFixedDim(), 10, "lighter", !0)
		});
	}
	tertiaryFixedDim() {
		return U.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => J(e) ? 30 : 80,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new G(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new K(this.tertiaryFixed(), this.tertiaryFixedDim(), 10, "lighter", !0)
		});
	}
	onTertiaryFixed() {
		return U.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => J(e) ? 100 : 10,
			background: (e) => this.tertiaryFixedDim(),
			secondBackground: (e) => this.tertiaryFixed(),
			contrastCurve: (e) => new G(4.5, 7, 11, 21)
		});
	}
	onTertiaryFixedVariant() {
		return U.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => J(e) ? 90 : 30,
			background: (e) => this.tertiaryFixedDim(),
			secondBackground: (e) => this.tertiaryFixed(),
			contrastCurve: (e) => new G(3, 4.5, 7, 11)
		});
	}
	highestSurface(e) {
		return e.isDark ? this.surfaceBright() : this.surfaceDim();
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/color_spec_2025.js
function Y(e, t = 0, n = 100, r = 1) {
	return z(t, n, ha(e.hue, e.chroma * r, 100, !0));
}
function ma(e, t = 0, n = 100) {
	return z(t, n, ha(e.hue, e.chroma, 0, !1));
}
function ha(e, t, n, r) {
	let i = n, a = B.from(e, t, i);
	for (; a.chroma < t && !(n < 0 || n > 100);) {
		n += r ? -1 : 1;
		let o = B.from(e, t, n);
		a.chroma < o.chroma && (a = o, i = n);
	}
	return i;
}
function X(e) {
	return e === 1.5 ? new G(1.5, 1.5, 3, 5.5) : e === 3 ? new G(3, 3, 4.5, 7) : e === 4.5 ? new G(4.5, 4.5, 7, 11) : e === 6 ? new G(6, 6, 7, 11) : e === 7 ? new G(7, 7, 11, 21) : e === 9 ? new G(9, 9, 11, 21) : e === 11 ? new G(11, 11, 21, 21) : e === 21 ? new G(21, 21, 21, 21) : new G(e, e, 7, 21);
}
var ga = class extends pa {
	surface() {
		let e = U.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => (super.surface().tone(e), e.platform === "phone" ? e.isDark ? 4 : B.isYellow(e.neutralPalette.hue) ? 99 : e.variant === q.VIBRANT ? 97 : 98 : 0),
			isBackground: !0
		});
		return H(super.surface(), "2025", e);
	}
	surfaceDim() {
		let e = U.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 4 : B.isYellow(e.neutralPalette.hue) ? 90 : e.variant === q.VIBRANT ? 85 : 87,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (!e.isDark) {
					if (e.variant === q.NEUTRAL) return 2.5;
					if (e.variant === q.TONAL_SPOT) return 1.7;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? 2.7 : 1.75;
					if (e.variant === q.VIBRANT) return 1.36;
				}
				return 1;
			}
		});
		return H(super.surfaceDim(), "2025", e);
	}
	surfaceBright() {
		let e = U.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 18 : B.isYellow(e.neutralPalette.hue) ? 99 : e.variant === q.VIBRANT ? 97 : 98,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.isDark) {
					if (e.variant === q.NEUTRAL) return 2.5;
					if (e.variant === q.TONAL_SPOT) return 1.7;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? 2.7 : 1.75;
					if (e.variant === q.VIBRANT) return 1.36;
				}
				return 1;
			}
		});
		return H(super.surfaceBright(), "2025", e);
	}
	surfaceContainerLowest() {
		let e = U.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 0 : 100,
			isBackground: !0
		});
		return H(super.surfaceContainerLowest(), "2025", e);
	}
	surfaceContainerLow() {
		let e = U.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 6 : B.isYellow(e.neutralPalette.hue) ? 98 : e.variant === q.VIBRANT ? 95 : 96 : 15,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === q.NEUTRAL) return 1.3;
					if (e.variant === q.TONAL_SPOT) return 1.25;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? 1.3 : 1.15;
					if (e.variant === q.VIBRANT) return 1.08;
				}
				return 1;
			}
		});
		return H(super.surfaceContainerLow(), "2025", e);
	}
	surfaceContainer() {
		let e = U.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 9 : B.isYellow(e.neutralPalette.hue) ? 96 : e.variant === q.VIBRANT ? 92 : 94 : 20,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === q.NEUTRAL) return 1.6;
					if (e.variant === q.TONAL_SPOT) return 1.4;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? 1.6 : 1.3;
					if (e.variant === q.VIBRANT) return 1.15;
				}
				return 1;
			}
		});
		return H(super.surfaceContainer(), "2025", e);
	}
	surfaceContainerHigh() {
		let e = U.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 12 : B.isYellow(e.neutralPalette.hue) ? 94 : e.variant === q.VIBRANT ? 90 : 92 : 25,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === q.NEUTRAL) return 1.9;
					if (e.variant === q.TONAL_SPOT) return 1.5;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? 1.95 : 1.45;
					if (e.variant === q.VIBRANT) return 1.22;
				}
				return 1;
			}
		});
		return H(super.surfaceContainerHigh(), "2025", e);
	}
	surfaceContainerHighest() {
		let e = U.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 15 : B.isYellow(e.neutralPalette.hue) ? 92 : e.variant === q.VIBRANT ? 88 : 90,
			isBackground: !0,
			chromaMultiplier: (e) => e.variant === q.NEUTRAL ? 2.2 : e.variant === q.TONAL_SPOT ? 1.7 : e.variant === q.EXPRESSIVE ? B.isYellow(e.neutralPalette.hue) ? 2.3 : 1.6 : e.variant === q.VIBRANT ? 1.29 : 1
		});
		return H(super.surfaceContainerHighest(), "2025", e);
	}
	onSurface() {
		let e = U.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.VIBRANT ? Y(e.neutralPalette, 0, 100, 1.1) : U.getInitialToneFromBackground((e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh())(e),
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === q.NEUTRAL) return 2.2;
					if (e.variant === q.TONAL_SPOT) return 1.7;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.isDark && e.platform === "phone" ? X(11) : X(9)
		});
		return H(super.onSurface(), "2025", e);
	}
	onSurfaceVariant() {
		let e = U.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === q.NEUTRAL) return 2.2;
					if (e.variant === q.TONAL_SPOT) return 1.7;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? e.isDark ? X(6) : X(4.5) : X(7)
		});
		return H(super.onSurfaceVariant(), "2025", e);
	}
	outline() {
		let e = U.fromPalette({
			name: "outline",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === q.NEUTRAL) return 2.2;
					if (e.variant === q.TONAL_SPOT) return 1.7;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? X(3) : X(4.5)
		});
		return H(super.outline(), "2025", e);
	}
	outlineVariant() {
		let e = U.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === q.NEUTRAL) return 2.2;
					if (e.variant === q.TONAL_SPOT) return 1.7;
					if (e.variant === q.EXPRESSIVE) return B.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? X(1.5) : X(3)
		});
		return H(super.outlineVariant(), "2025", e);
	}
	inverseSurface() {
		let e = U.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 98 : 4,
			isBackground: !0
		});
		return H(super.inverseSurface(), "2025", e);
	}
	inverseOnSurface() {
		let e = U.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => X(7)
		});
		return H(super.inverseOnSurface(), "2025", e);
	}
	primary() {
		let e = U.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.variant === q.NEUTRAL ? e.platform === "phone" ? e.isDark ? 80 : 40 : 90 : e.variant === q.TONAL_SPOT ? e.platform === "phone" ? e.isDark ? 80 : Y(e.primaryPalette) : Y(e.primaryPalette, 0, 90) : e.variant === q.EXPRESSIVE ? e.platform === "phone" ? Y(e.primaryPalette, 0, B.isYellow(e.primaryPalette.hue) ? 25 : B.isCyan(e.primaryPalette.hue) ? 88 : 98) : Y(e.primaryPalette) : e.platform === "phone" ? Y(e.primaryPalette, 0, B.isCyan(e.primaryPalette.hue) ? 88 : 98) : Y(e.primaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? X(4.5) : X(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.primaryContainer(), this.primary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.primary(), "2025", e);
	}
	primaryDim() {
		return U.fromPalette({
			name: "primary_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.variant === q.NEUTRAL ? 85 : e.variant === q.TONAL_SPOT ? Y(e.primaryPalette, 0, 90) : Y(e.primaryPalette),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => X(4.5),
			toneDeltaPair: (e) => new K(this.primaryDim(), this.primary(), 5, "darker", !0, "farther")
		});
	}
	onPrimary() {
		let e = U.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			background: (e) => e.platform === "phone" ? this.primary() : this.primaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.onPrimary(), "2025", e);
	}
	primaryContainer() {
		let e = U.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.variant === q.NEUTRAL ? e.isDark ? 30 : 90 : e.variant === q.TONAL_SPOT ? e.isDark ? ma(e.primaryPalette, 35, 93) : Y(e.primaryPalette, 0, 90) : e.variant === q.EXPRESSIVE ? e.isDark ? Y(e.primaryPalette, 30, 93) : Y(e.primaryPalette, 78, B.isCyan(e.primaryPalette.hue) ? 88 : 90) : e.isDark ? ma(e.primaryPalette, 66, 93) : Y(e.primaryPalette, 66, B.isCyan(e.primaryPalette.hue) ? 88 : 93),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "phone" ? void 0 : new K(this.primaryContainer(), this.primaryDim(), 10, "darker", !0, "farther"),
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? X(1.5) : void 0
		});
		return H(super.primaryContainer(), "2025", e);
	}
	onPrimaryContainer() {
		let e = U.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.onPrimaryContainer(), "2025", e);
	}
	primaryFixed() {
		let e = U.fromPalette({
			name: "primary_fixed",
			palette: (e) => e.primaryPalette,
			tone: (e) => {
				let t = Object.assign({}, e, {
					isDark: !1,
					contrastLevel: 0
				});
				return this.primaryContainer().getTone(t);
			},
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? X(1.5) : void 0
		});
		return H(super.primaryFixed(), "2025", e);
	}
	primaryFixedDim() {
		let e = U.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => this.primaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new K(this.primaryFixedDim(), this.primaryFixed(), 5, "darker", !0, "exact")
		});
		return H(super.primaryFixedDim(), "2025", e);
	}
	onPrimaryFixed() {
		let e = U.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixedDim(),
			contrastCurve: (e) => X(7)
		});
		return H(super.onPrimaryFixed(), "2025", e);
	}
	onPrimaryFixedVariant() {
		let e = U.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixedDim(),
			contrastCurve: (e) => X(4.5)
		});
		return H(super.onPrimaryFixedVariant(), "2025", e);
	}
	inversePrimary() {
		let e = U.fromPalette({
			name: "inverse_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e.primaryPalette),
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.inversePrimary(), "2025", e);
	}
	secondary() {
		let e = U.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === q.NEUTRAL ? 90 : Y(e.secondaryPalette, 0, 90) : e.variant === q.NEUTRAL ? e.isDark ? ma(e.secondaryPalette, 0, 98) : Y(e.secondaryPalette) : e.variant === q.VIBRANT ? Y(e.secondaryPalette, 0, e.isDark ? 90 : 98) : e.isDark ? 80 : Y(e.secondaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? X(4.5) : X(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.secondaryContainer(), this.secondary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.secondary(), "2025", e);
	}
	secondaryDim() {
		return U.fromPalette({
			name: "secondary_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.variant === q.NEUTRAL ? 85 : Y(e.secondaryPalette, 0, 90),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => X(4.5),
			toneDeltaPair: (e) => new K(this.secondaryDim(), this.secondary(), 5, "darker", !0, "farther")
		});
	}
	onSecondary() {
		let e = U.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			background: (e) => e.platform === "phone" ? this.secondary() : this.secondaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.onSecondary(), "2025", e);
	}
	secondaryContainer() {
		let e = U.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.variant === q.VIBRANT ? e.isDark ? ma(e.secondaryPalette, 30, 40) : Y(e.secondaryPalette, 84, 90) : e.variant === q.EXPRESSIVE ? e.isDark ? 15 : Y(e.secondaryPalette, 90, 95) : e.isDark ? 25 : 90,
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new K(this.secondaryContainer(), this.secondaryDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? X(1.5) : void 0
		});
		return H(super.secondaryContainer(), "2025", e);
	}
	onSecondaryContainer() {
		let e = U.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.onSecondaryContainer(), "2025", e);
	}
	secondaryFixed() {
		let e = U.fromPalette({
			name: "secondary_fixed",
			palette: (e) => e.secondaryPalette,
			tone: (e) => {
				let t = Object.assign({}, e, {
					isDark: !1,
					contrastLevel: 0
				});
				return this.secondaryContainer().getTone(t);
			},
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? X(1.5) : void 0
		});
		return H(super.secondaryFixed(), "2025", e);
	}
	secondaryFixedDim() {
		let e = U.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => this.secondaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new K(this.secondaryFixedDim(), this.secondaryFixed(), 5, "darker", !0, "exact")
		});
		return H(super.secondaryFixedDim(), "2025", e);
	}
	onSecondaryFixed() {
		let e = U.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixedDim(),
			contrastCurve: (e) => X(7)
		});
		return H(super.onSecondaryFixed(), "2025", e);
	}
	onSecondaryFixedVariant() {
		let e = U.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixedDim(),
			contrastCurve: (e) => X(4.5)
		});
		return H(super.onSecondaryFixedVariant(), "2025", e);
	}
	tertiary() {
		let e = U.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === q.TONAL_SPOT ? Y(e.tertiaryPalette, 0, 90) : Y(e.tertiaryPalette) : e.variant === q.EXPRESSIVE || e.variant === q.VIBRANT ? Y(e.tertiaryPalette, 0, B.isCyan(e.tertiaryPalette.hue) ? 88 : e.isDark ? 98 : 100) : e.isDark ? Y(e.tertiaryPalette, 0, 98) : Y(e.tertiaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? X(4.5) : X(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.tertiaryContainer(), this.tertiary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.tertiary(), "2025", e);
	}
	tertiaryDim() {
		return U.fromPalette({
			name: "tertiary_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.variant === q.TONAL_SPOT ? Y(e.tertiaryPalette, 0, 90) : Y(e.tertiaryPalette),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => X(4.5),
			toneDeltaPair: (e) => new K(this.tertiaryDim(), this.tertiary(), 5, "darker", !0, "farther")
		});
	}
	onTertiary() {
		let e = U.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			background: (e) => e.platform === "phone" ? this.tertiary() : this.tertiaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.onTertiary(), "2025", e);
	}
	tertiaryContainer() {
		let e = U.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === q.TONAL_SPOT ? Y(e.tertiaryPalette, 0, 90) : Y(e.tertiaryPalette) : e.variant === q.NEUTRAL ? e.isDark ? Y(e.tertiaryPalette, 0, 93) : Y(e.tertiaryPalette, 0, 96) : e.variant === q.TONAL_SPOT ? Y(e.tertiaryPalette, 0, e.isDark ? 93 : 100) : e.variant === q.EXPRESSIVE ? Y(e.tertiaryPalette, 75, B.isCyan(e.tertiaryPalette.hue) ? 88 : e.isDark ? 93 : 100) : e.isDark ? Y(e.tertiaryPalette, 0, 93) : Y(e.tertiaryPalette, 72, 100),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new K(this.tertiaryContainer(), this.tertiaryDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? X(1.5) : void 0
		});
		return H(super.tertiaryContainer(), "2025", e);
	}
	onTertiaryContainer() {
		let e = U.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.onTertiaryContainer(), "2025", e);
	}
	tertiaryFixed() {
		let e = U.fromPalette({
			name: "tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				let t = Object.assign({}, e, {
					isDark: !1,
					contrastLevel: 0
				});
				return this.tertiaryContainer().getTone(t);
			},
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? X(1.5) : void 0
		});
		return H(super.tertiaryFixed(), "2025", e);
	}
	tertiaryFixedDim() {
		let e = U.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => this.tertiaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new K(this.tertiaryFixedDim(), this.tertiaryFixed(), 5, "darker", !0, "exact")
		});
		return H(super.tertiaryFixedDim(), "2025", e);
	}
	onTertiaryFixed() {
		let e = U.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixedDim(),
			contrastCurve: (e) => X(7)
		});
		return H(super.onTertiaryFixed(), "2025", e);
	}
	onTertiaryFixedVariant() {
		let e = U.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixedDim(),
			contrastCurve: (e) => X(4.5)
		});
		return H(super.onTertiaryFixedVariant(), "2025", e);
	}
	error() {
		let e = U.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? ma(e.errorPalette, 0, 98) : Y(e.errorPalette) : ma(e.errorPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? X(4.5) : X(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.errorContainer(), this.error(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.error(), "2025", e);
	}
	errorDim() {
		return U.fromPalette({
			name: "error_dim",
			palette: (e) => e.errorPalette,
			tone: (e) => ma(e.errorPalette),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => X(4.5),
			toneDeltaPair: (e) => new K(this.errorDim(), this.error(), 5, "darker", !0, "farther")
		});
	}
	onError() {
		let e = U.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			background: (e) => e.platform === "phone" ? this.error() : this.errorDim(),
			contrastCurve: (e) => e.platform === "phone" ? X(6) : X(7)
		});
		return H(super.onError(), "2025", e);
	}
	errorContainer() {
		let e = U.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.isDark ? ma(e.errorPalette, 30, 93) : Y(e.errorPalette, 0, 90),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new K(this.errorContainer(), this.errorDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? X(1.5) : void 0
		});
		return H(super.errorContainer(), "2025", e);
	}
	onErrorContainer() {
		let e = U.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => e.platform === "phone" ? X(4.5) : X(7)
		});
		return H(super.onErrorContainer(), "2025", e);
	}
	surfaceVariant() {
		let e = Object.assign(this.surfaceContainerHighest().clone(), { name: "surface_variant" });
		return H(super.surfaceVariant(), "2025", e);
	}
	surfaceTint() {
		let e = Object.assign(this.primary().clone(), { name: "surface_tint" });
		return H(super.surfaceTint(), "2025", e);
	}
	background() {
		let e = Object.assign(this.surface().clone(), { name: "background" });
		return H(super.background(), "2025", e);
	}
	onBackground() {
		let e = Object.assign(this.onSurface().clone(), {
			name: "on_background",
			tone: (e) => e.platform === "watch" ? 100 : this.onSurface().getTone(e)
		});
		return H(super.onBackground(), "2025", e);
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/color_spec_2026.js
function _a(e, t = 0, n = 100, r = 1) {
	return z(t, n, ya(e.hue, e.chroma * r, 100, !0));
}
function va(e, t = 0, n = 100) {
	return z(t, n, ya(e.hue, e.chroma, 0, !1));
}
function ya(e, t, n, r) {
	let i = n, a = B.from(e, t, i);
	for (; a.chroma < t && !(n < 0 || n > 100);) {
		n += r ? -1 : 1;
		let o = B.from(e, t, n);
		a.chroma < o.chroma && (a = o, i = n);
	}
	return i;
}
function Z(e) {
	return e === 1.5 ? new G(1.5, 1.5, 3, 5.5) : e === 3 ? new G(3, 3, 4.5, 7) : e === 4.5 ? new G(4.5, 4.5, 7, 11) : e === 6 ? new G(6, 6, 7, 11) : e === 7 ? new G(7, 7, 11, 21) : e === 9 ? new G(9, 9, 11, 21) : e === 11 ? new G(11, 11, 21, 21) : e === 21 ? new G(21, 21, 21, 21) : new G(e, e, 7, 21);
}
var ba = class extends ga {
	surface() {
		let e = U.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 4 : 98 : 0,
			isBackground: !0
		});
		return H(super.surface(), "2026", e);
	}
	surfaceDim() {
		let e = U.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 4 : 87 : 0,
			chromaMultiplier: (e) => e.variant === q.CMF ? e.isDark ? 1 : 1.7 : 0,
			isBackground: !0
		});
		return H(super.surfaceDim(), "2026", e);
	}
	surfaceBright() {
		let e = U.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 18 : 98 : 0,
			chromaMultiplier: (e) => e.variant === q.CMF ? e.isDark ? 1.7 : 1 : 0,
			isBackground: !0
		});
		return H(super.surfaceBright(), "2026", e);
	}
	surfaceContainerLowest() {
		let e = U.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 0 : 100 : 0,
			isBackground: !0
		});
		return H(super.surfaceContainerLowest(), "2026", e);
	}
	surfaceContainerLow() {
		let e = U.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 6 : 96 : 0,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.25 : 0,
			isBackground: !0
		});
		return H(super.surfaceContainerLow(), "2026", e);
	}
	surfaceContainer() {
		let e = U.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 9 : 94 : 0,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.4 : 0,
			isBackground: !0
		});
		return H(super.surfaceContainer(), "2026", e);
	}
	surfaceContainerHigh() {
		let e = U.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 12 : 92 : 0,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.5 : 0,
			isBackground: !0
		});
		return H(super.surfaceContainerHigh(), "2026", e);
	}
	surfaceContainerHighest() {
		let e = U.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === q.CMF ? e.isDark ? 15 : 90 : 0,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.7 : 0,
			isBackground: !0
		});
		return H(super.surfaceContainerHighest(), "2026", e);
	}
	onSurface() {
		let e = U.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.isDark ? Z(11) : Z(9)
		});
		return H(super.onSurface(), "2026", e);
	}
	onSurfaceVariant() {
		let e = U.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.isDark ? Z(6) : Z(4.5)
		});
		return H(super.onSurfaceVariant(), "2026", e);
	}
	outline() {
		let e = U.fromPalette({
			name: "outline",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Z(3)
		});
		return H(super.outline(), "2026", e);
	}
	outlineVariant() {
		let e = U.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Z(1.5)
		});
		return H(super.outlineVariant(), "2026", e);
	}
	inverseSurface() {
		let e = U.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 98 : 4,
			chromaMultiplier: (e) => e.variant === q.CMF ? 1.7 : 0,
			isBackground: !0
		});
		return H(super.inverseSurface(), "2026", e);
	}
	inverseOnSurface() {
		let e = U.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => Z(7)
		});
		return H(super.inverseOnSurface(), "2026", e);
	}
	primary() {
		let e = U.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.sourceColorHct.chroma <= 12 ? e.isDark ? 80 : 40 : e.sourceColorHct.tone,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.primaryContainer(), this.primary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.primary(), "2026", e);
	}
	onPrimary() {
		let e = U.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primary(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onPrimary(), "2026", e);
	}
	primaryContainer() {
		let e = U.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => !e.isDark && e.sourceColorHct.chroma <= 12 ? 90 : e.sourceColorHct.tone > 55 ? z(61, 90, e.sourceColorHct.tone) : z(30, 49, e.sourceColorHct.tone),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.primaryContainer(), "2026", e);
	}
	onPrimaryContainer() {
		let e = U.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onPrimaryContainer(), "2026", e);
	}
	primaryFixed() {
		let e = U.fromPalette({
			name: "primary_fixed",
			palette: (e) => e.primaryPalette,
			tone: (e) => {
				let t = Object.assign({}, e, {
					isDark: !1,
					contrastLevel: 0
				});
				return this.primaryContainer().getTone(t);
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.primaryFixed(), "2026", e);
	}
	primaryFixedDim() {
		let e = U.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => this.primaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new K(this.primaryFixedDim(), this.primaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.primaryFixedDim(), "2026", e);
	}
	onPrimaryFixed() {
		let e = U.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixed().getTone(e) > 57 ? this.primaryFixedDim() : this.primaryFixed(),
			contrastCurve: (e) => Z(7)
		});
		return H(super.onPrimaryFixed(), "2026", e);
	}
	onPrimaryFixedVariant() {
		let e = U.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixed().getTone(e) > 57 ? this.primaryFixedDim() : this.primaryFixed(),
			contrastCurve: (e) => Z(4.5)
		});
		return H(super.onPrimaryFixedVariant(), "2026", e);
	}
	inversePrimary() {
		return super.inversePrimary();
	}
	secondary() {
		let e = U.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? va(e.secondaryPalette) : _a(e.secondaryPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.secondaryContainer(), this.secondary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.secondary(), "2026", e);
	}
	onSecondary() {
		let e = U.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondary(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onSecondary(), "2026", e);
	}
	secondaryContainer() {
		let e = U.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? va(e.secondaryPalette, 20, 49) : _a(e.secondaryPalette, 61, 90),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.secondaryContainer(), "2026", e);
	}
	onSecondaryContainer() {
		let e = U.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onSecondaryContainer(), "2026", e);
	}
	secondaryFixed() {
		let e = U.fromPalette({
			name: "secondary_fixed",
			palette: (e) => e.secondaryPalette,
			tone: (e) => {
				let t = Object.assign({}, e, {
					isDark: !1,
					contrastLevel: 0
				});
				return this.secondaryContainer().getTone(t);
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.secondaryFixed(), "2026", e);
	}
	secondaryFixedDim() {
		let e = U.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => this.secondaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new K(this.secondaryFixedDim(), this.secondaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.secondaryFixedDim(), "2026", e);
	}
	onSecondaryFixed() {
		let e = U.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixed().getTone(e) > 57 ? this.secondaryFixedDim() : this.secondaryFixed(),
			contrastCurve: (e) => Z(7)
		});
		return H(super.onSecondaryFixed(), "2026", e);
	}
	onSecondaryFixedVariant() {
		let e = U.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixed().getTone(e) > 57 ? this.secondaryFixedDim() : this.secondaryFixed(),
			contrastCurve: (e) => Z(4.5)
		});
		return H(super.onSecondaryFixedVariant(), "2026", e);
	}
	tertiary() {
		let e = U.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.sourceColorHcts[1]?.tone ?? e.sourceColorHct.tone,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.tertiaryContainer(), this.tertiary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.tertiary(), "2026", e);
	}
	onTertiary() {
		let e = U.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiary(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onTertiary(), "2026", e);
	}
	tertiaryContainer() {
		let e = U.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				let t = e.sourceColorHcts[1] ?? e.sourceColorHct;
				return t.tone > 55 ? z(61, 90, t.tone) : z(20, 49, t.tone);
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.tertiaryContainer(), "2026", e);
	}
	onTertiaryContainer() {
		let e = U.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onTertiaryContainer(), "2026", e);
	}
	tertiaryFixed() {
		let e = U.fromPalette({
			name: "tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				let t = Object.assign({}, e, {
					isDark: !1,
					contrastLevel: 0
				});
				return this.tertiaryContainer().getTone(t);
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.tertiaryFixed(), "2026", e);
	}
	tertiaryFixedDim() {
		let e = U.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => this.tertiaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new K(this.tertiaryFixedDim(), this.tertiaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.tertiaryFixedDim(), "2026", e);
	}
	onTertiaryFixed() {
		let e = U.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixed().getTone(e) > 57 ? this.tertiaryFixedDim() : this.tertiaryFixed(),
			contrastCurve: (e) => Z(7)
		});
		return H(super.onTertiaryFixed(), "2026", e);
	}
	onTertiaryFixedVariant() {
		let e = U.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixed().getTone(e) > 57 ? this.tertiaryFixedDim() : this.tertiaryFixed(),
			contrastCurve: (e) => Z(4.5)
		});
		return H(super.onTertiaryFixedVariant(), "2026", e);
	}
	error() {
		let e = U.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => _a(e.errorPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new K(this.errorContainer(), this.error(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return H(super.error(), "2026", e);
	}
	onError() {
		let e = U.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			background: (e) => this.error(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onError(), "2026", e);
	}
	errorContainer() {
		let e = U.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? va(e.errorPalette) : _a(e.errorPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return H(super.errorContainer(), "2026", e);
	}
	onErrorContainer() {
		let e = U.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => Z(6)
		});
		return H(super.onErrorContainer(), "2026", e);
	}
	primaryDim() {
		let e = Object.assign(this.primary().clone(), { name: "primary_dim" });
		return H(super.primaryDim(), "2026", e);
	}
	secondaryDim() {
		let e = Object.assign(this.secondary().clone(), { name: "secondary_dim" });
		return H(super.secondaryDim(), "2026", e);
	}
	tertiaryDim() {
		let e = Object.assign(this.tertiary().clone(), { name: "tertiary_dim" });
		return H(super.tertiaryDim(), "2026", e);
	}
	errorDim() {
		let e = Object.assign(this.error().clone(), { name: "error_dim" });
		return H(super.errorDim(), "2026", e);
	}
}, Q = class e {
	constructor() {
		this.allColors = [
			this.background(),
			this.onBackground(),
			this.surface(),
			this.surfaceDim(),
			this.surfaceBright(),
			this.surfaceContainerLowest(),
			this.surfaceContainerLow(),
			this.surfaceContainer(),
			this.surfaceContainerHigh(),
			this.surfaceContainerHighest(),
			this.onSurface(),
			this.onSurfaceVariant(),
			this.outline(),
			this.outlineVariant(),
			this.inverseSurface(),
			this.inverseOnSurface(),
			this.primary(),
			this.primaryDim(),
			this.onPrimary(),
			this.primaryContainer(),
			this.onPrimaryContainer(),
			this.primaryFixed(),
			this.primaryFixedDim(),
			this.onPrimaryFixed(),
			this.onPrimaryFixedVariant(),
			this.inversePrimary(),
			this.secondary(),
			this.secondaryDim(),
			this.onSecondary(),
			this.secondaryContainer(),
			this.onSecondaryContainer(),
			this.secondaryFixed(),
			this.secondaryFixedDim(),
			this.onSecondaryFixed(),
			this.onSecondaryFixedVariant(),
			this.tertiary(),
			this.tertiaryDim(),
			this.onTertiary(),
			this.tertiaryContainer(),
			this.onTertiaryContainer(),
			this.tertiaryFixed(),
			this.tertiaryFixedDim(),
			this.onTertiaryFixed(),
			this.onTertiaryFixedVariant(),
			this.error(),
			this.errorDim(),
			this.onError(),
			this.errorContainer(),
			this.onErrorContainer()
		].filter((e) => e !== void 0);
	}
	highestSurface(t) {
		return e.colorSpec.highestSurface(t);
	}
	primaryPaletteKeyColor() {
		return e.colorSpec.primaryPaletteKeyColor();
	}
	secondaryPaletteKeyColor() {
		return e.colorSpec.secondaryPaletteKeyColor();
	}
	tertiaryPaletteKeyColor() {
		return e.colorSpec.tertiaryPaletteKeyColor();
	}
	neutralPaletteKeyColor() {
		return e.colorSpec.neutralPaletteKeyColor();
	}
	neutralVariantPaletteKeyColor() {
		return e.colorSpec.neutralVariantPaletteKeyColor();
	}
	errorPaletteKeyColor() {
		return e.colorSpec.errorPaletteKeyColor();
	}
	background() {
		return e.colorSpec.background();
	}
	onBackground() {
		return e.colorSpec.onBackground();
	}
	surface() {
		return e.colorSpec.surface();
	}
	surfaceDim() {
		return e.colorSpec.surfaceDim();
	}
	surfaceBright() {
		return e.colorSpec.surfaceBright();
	}
	surfaceContainerLowest() {
		return e.colorSpec.surfaceContainerLowest();
	}
	surfaceContainerLow() {
		return e.colorSpec.surfaceContainerLow();
	}
	surfaceContainer() {
		return e.colorSpec.surfaceContainer();
	}
	surfaceContainerHigh() {
		return e.colorSpec.surfaceContainerHigh();
	}
	surfaceContainerHighest() {
		return e.colorSpec.surfaceContainerHighest();
	}
	onSurface() {
		return e.colorSpec.onSurface();
	}
	surfaceVariant() {
		return e.colorSpec.surfaceVariant();
	}
	onSurfaceVariant() {
		return e.colorSpec.onSurfaceVariant();
	}
	outline() {
		return e.colorSpec.outline();
	}
	outlineVariant() {
		return e.colorSpec.outlineVariant();
	}
	inverseSurface() {
		return e.colorSpec.inverseSurface();
	}
	inverseOnSurface() {
		return e.colorSpec.inverseOnSurface();
	}
	shadow() {
		return e.colorSpec.shadow();
	}
	scrim() {
		return e.colorSpec.scrim();
	}
	surfaceTint() {
		return e.colorSpec.surfaceTint();
	}
	primary() {
		return e.colorSpec.primary();
	}
	primaryDim() {
		return e.colorSpec.primaryDim();
	}
	onPrimary() {
		return e.colorSpec.onPrimary();
	}
	primaryContainer() {
		return e.colorSpec.primaryContainer();
	}
	onPrimaryContainer() {
		return e.colorSpec.onPrimaryContainer();
	}
	inversePrimary() {
		return e.colorSpec.inversePrimary();
	}
	primaryFixed() {
		return e.colorSpec.primaryFixed();
	}
	primaryFixedDim() {
		return e.colorSpec.primaryFixedDim();
	}
	onPrimaryFixed() {
		return e.colorSpec.onPrimaryFixed();
	}
	onPrimaryFixedVariant() {
		return e.colorSpec.onPrimaryFixedVariant();
	}
	secondary() {
		return e.colorSpec.secondary();
	}
	secondaryDim() {
		return e.colorSpec.secondaryDim();
	}
	onSecondary() {
		return e.colorSpec.onSecondary();
	}
	secondaryContainer() {
		return e.colorSpec.secondaryContainer();
	}
	onSecondaryContainer() {
		return e.colorSpec.onSecondaryContainer();
	}
	secondaryFixed() {
		return e.colorSpec.secondaryFixed();
	}
	secondaryFixedDim() {
		return e.colorSpec.secondaryFixedDim();
	}
	onSecondaryFixed() {
		return e.colorSpec.onSecondaryFixed();
	}
	onSecondaryFixedVariant() {
		return e.colorSpec.onSecondaryFixedVariant();
	}
	tertiary() {
		return e.colorSpec.tertiary();
	}
	tertiaryDim() {
		return e.colorSpec.tertiaryDim();
	}
	onTertiary() {
		return e.colorSpec.onTertiary();
	}
	tertiaryContainer() {
		return e.colorSpec.tertiaryContainer();
	}
	onTertiaryContainer() {
		return e.colorSpec.onTertiaryContainer();
	}
	tertiaryFixed() {
		return e.colorSpec.tertiaryFixed();
	}
	tertiaryFixedDim() {
		return e.colorSpec.tertiaryFixedDim();
	}
	onTertiaryFixed() {
		return e.colorSpec.onTertiaryFixed();
	}
	onTertiaryFixedVariant() {
		return e.colorSpec.onTertiaryFixedVariant();
	}
	error() {
		return e.colorSpec.error();
	}
	errorDim() {
		return e.colorSpec.errorDim();
	}
	onError() {
		return e.colorSpec.onError();
	}
	errorContainer() {
		return e.colorSpec.errorContainer();
	}
	onErrorContainer() {
		return e.colorSpec.onErrorContainer();
	}
	static highestSurface(t) {
		return e.colorSpec.highestSurface(t);
	}
};
Q.contentAccentToneDelta = 15, Q.colorSpec = new ba(), Q.primaryPaletteKeyColor = Q.colorSpec.primaryPaletteKeyColor(), Q.secondaryPaletteKeyColor = Q.colorSpec.secondaryPaletteKeyColor(), Q.tertiaryPaletteKeyColor = Q.colorSpec.tertiaryPaletteKeyColor(), Q.neutralPaletteKeyColor = Q.colorSpec.neutralPaletteKeyColor(), Q.neutralVariantPaletteKeyColor = Q.colorSpec.neutralVariantPaletteKeyColor(), Q.background = Q.colorSpec.background(), Q.onBackground = Q.colorSpec.onBackground(), Q.surface = Q.colorSpec.surface(), Q.surfaceDim = Q.colorSpec.surfaceDim(), Q.surfaceBright = Q.colorSpec.surfaceBright(), Q.surfaceContainerLowest = Q.colorSpec.surfaceContainerLowest(), Q.surfaceContainerLow = Q.colorSpec.surfaceContainerLow(), Q.surfaceContainer = Q.colorSpec.surfaceContainer(), Q.surfaceContainerHigh = Q.colorSpec.surfaceContainerHigh(), Q.surfaceContainerHighest = Q.colorSpec.surfaceContainerHighest(), Q.onSurface = Q.colorSpec.onSurface(), Q.surfaceVariant = Q.colorSpec.surfaceVariant(), Q.onSurfaceVariant = Q.colorSpec.onSurfaceVariant(), Q.inverseSurface = Q.colorSpec.inverseSurface(), Q.inverseOnSurface = Q.colorSpec.inverseOnSurface(), Q.outline = Q.colorSpec.outline(), Q.outlineVariant = Q.colorSpec.outlineVariant(), Q.shadow = Q.colorSpec.shadow(), Q.scrim = Q.colorSpec.scrim(), Q.surfaceTint = Q.colorSpec.surfaceTint(), Q.primary = Q.colorSpec.primary(), Q.onPrimary = Q.colorSpec.onPrimary(), Q.primaryContainer = Q.colorSpec.primaryContainer(), Q.onPrimaryContainer = Q.colorSpec.onPrimaryContainer(), Q.inversePrimary = Q.colorSpec.inversePrimary(), Q.secondary = Q.colorSpec.secondary(), Q.onSecondary = Q.colorSpec.onSecondary(), Q.secondaryContainer = Q.colorSpec.secondaryContainer(), Q.onSecondaryContainer = Q.colorSpec.onSecondaryContainer(), Q.tertiary = Q.colorSpec.tertiary(), Q.onTertiary = Q.colorSpec.onTertiary(), Q.tertiaryContainer = Q.colorSpec.tertiaryContainer(), Q.onTertiaryContainer = Q.colorSpec.onTertiaryContainer(), Q.error = Q.colorSpec.error(), Q.onError = Q.colorSpec.onError(), Q.errorContainer = Q.colorSpec.errorContainer(), Q.onErrorContainer = Q.colorSpec.onErrorContainer(), Q.primaryFixed = Q.colorSpec.primaryFixed(), Q.primaryFixedDim = Q.colorSpec.primaryFixedDim(), Q.onPrimaryFixed = Q.colorSpec.onPrimaryFixed(), Q.onPrimaryFixedVariant = Q.colorSpec.onPrimaryFixedVariant(), Q.secondaryFixed = Q.colorSpec.secondaryFixed(), Q.secondaryFixedDim = Q.colorSpec.secondaryFixedDim(), Q.onSecondaryFixed = Q.colorSpec.onSecondaryFixed(), Q.onSecondaryFixedVariant = Q.colorSpec.onSecondaryFixedVariant(), Q.tertiaryFixed = Q.colorSpec.tertiaryFixed(), Q.tertiaryFixedDim = Q.colorSpec.tertiaryFixedDim(), Q.onTertiaryFixed = Q.colorSpec.onTertiaryFixed(), Q.onTertiaryFixedVariant = Q.colorSpec.onTertiaryFixedVariant();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/dynamic_scheme.js
var $ = class e {
	static maybeFallbackSpecVersion(e, t) {
		return t === q.CMF ? e : t === q.EXPRESSIVE || t === q.VIBRANT || t === q.TONAL_SPOT || t === q.NEUTRAL ? e === "2026" ? "2025" : e : "2021";
	}
	constructor(t) {
		if (t.sourceColorHcts) {
			if (t.sourceColorHcts.length === 0) throw Error("sourceColorHcts cannot be empty");
			this.sourceColorHct = t.sourceColorHcts[0], this.sourceColorHcts = t.sourceColorHcts;
		} else if (t.sourceColorHct) this.sourceColorHct = t.sourceColorHct, this.sourceColorHcts = [t.sourceColorHct];
		else throw Error("sourceColorHct or sourceColorHcts required");
		this.sourceColorArgb = this.sourceColorHct.toInt(), this.variant = t.variant, this.contrastLevel = t.contrastLevel, this.isDark = t.isDark, this.platform = t.platform ?? "phone", this.specVersion = e.maybeFallbackSpecVersion(t.specVersion ?? "2021", this.variant), this.primaryPalette = t.primaryPalette ?? Ta(this.specVersion).getPrimaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.secondaryPalette = t.secondaryPalette ?? Ta(this.specVersion).getSecondaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.tertiaryPalette = t.tertiaryPalette ?? Ta(this.specVersion).getTertiaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralPalette = t.neutralPalette ?? Ta(this.specVersion).getNeutralPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralVariantPalette = t.neutralVariantPalette ?? Ta(this.specVersion).getNeutralVariantPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.errorPalette = t.errorPalette ?? Ta(this.specVersion).getErrorPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel) ?? W.fromHueAndChroma(25, 84), this.colors = new Q();
	}
	toString() {
		let e = this.sourceColorHcts.length <= 1 ? "" : `sourceColorHctList=[${this.sourceColorHcts.map((e) => e.toString()).join(", ")}], `;
		return `Scheme: variant=${q[this.variant]}, mode=${this.isDark ? "dark" : "light"}, platform=${this.platform}, contrastLevel=${this.contrastLevel.toFixed(1)}, seed=${this.sourceColorHct.toString()}, ` + e + `specVersion=${this.specVersion}`;
	}
	static getPiecewiseHue(e, t, n) {
		let r = Math.min(t.length - 1, n.length), i = e.hue;
		for (let e = 0; e < r; e++) if (i >= t[e] && i < t[e + 1]) return ji(n[e]);
		return i;
	}
	static getRotatedHue(t, n, r) {
		let i = e.getPiecewiseHue(t, n, r);
		return Math.min(n.length - 1, r.length) <= 0 && (i = 0), ji(t.hue + i);
	}
	getArgb(e) {
		return e.getArgb(this);
	}
	getHct(e) {
		return e.getHct(this);
	}
	get primaryPaletteKeyColor() {
		return this.getArgb(this.colors.primaryPaletteKeyColor());
	}
	get secondaryPaletteKeyColor() {
		return this.getArgb(this.colors.secondaryPaletteKeyColor());
	}
	get tertiaryPaletteKeyColor() {
		return this.getArgb(this.colors.tertiaryPaletteKeyColor());
	}
	get neutralPaletteKeyColor() {
		return this.getArgb(this.colors.neutralPaletteKeyColor());
	}
	get neutralVariantPaletteKeyColor() {
		return this.getArgb(this.colors.neutralVariantPaletteKeyColor());
	}
	get errorPaletteKeyColor() {
		return this.getArgb(this.colors.errorPaletteKeyColor());
	}
	get background() {
		return this.getArgb(this.colors.background());
	}
	get onBackground() {
		return this.getArgb(this.colors.onBackground());
	}
	get surface() {
		return this.getArgb(this.colors.surface());
	}
	get surfaceDim() {
		return this.getArgb(this.colors.surfaceDim());
	}
	get surfaceBright() {
		return this.getArgb(this.colors.surfaceBright());
	}
	get surfaceContainerLowest() {
		return this.getArgb(this.colors.surfaceContainerLowest());
	}
	get surfaceContainerLow() {
		return this.getArgb(this.colors.surfaceContainerLow());
	}
	get surfaceContainer() {
		return this.getArgb(this.colors.surfaceContainer());
	}
	get surfaceContainerHigh() {
		return this.getArgb(this.colors.surfaceContainerHigh());
	}
	get surfaceContainerHighest() {
		return this.getArgb(this.colors.surfaceContainerHighest());
	}
	get onSurface() {
		return this.getArgb(this.colors.onSurface());
	}
	get surfaceVariant() {
		return this.getArgb(this.colors.surfaceVariant());
	}
	get onSurfaceVariant() {
		return this.getArgb(this.colors.onSurfaceVariant());
	}
	get inverseSurface() {
		return this.getArgb(this.colors.inverseSurface());
	}
	get inverseOnSurface() {
		return this.getArgb(this.colors.inverseOnSurface());
	}
	get outline() {
		return this.getArgb(this.colors.outline());
	}
	get outlineVariant() {
		return this.getArgb(this.colors.outlineVariant());
	}
	get shadow() {
		return this.getArgb(this.colors.shadow());
	}
	get scrim() {
		return this.getArgb(this.colors.scrim());
	}
	get surfaceTint() {
		return this.getArgb(this.colors.surfaceTint());
	}
	get primary() {
		return this.getArgb(this.colors.primary());
	}
	get primaryDim() {
		let e = this.colors.primaryDim();
		if (e === void 0) throw Error("`primaryDim` color is undefined prior to 2025 spec.");
		return this.getArgb(e);
	}
	get onPrimary() {
		return this.getArgb(this.colors.onPrimary());
	}
	get primaryContainer() {
		return this.getArgb(this.colors.primaryContainer());
	}
	get onPrimaryContainer() {
		return this.getArgb(this.colors.onPrimaryContainer());
	}
	get primaryFixed() {
		return this.getArgb(this.colors.primaryFixed());
	}
	get primaryFixedDim() {
		return this.getArgb(this.colors.primaryFixedDim());
	}
	get onPrimaryFixed() {
		return this.getArgb(this.colors.onPrimaryFixed());
	}
	get onPrimaryFixedVariant() {
		return this.getArgb(this.colors.onPrimaryFixedVariant());
	}
	get inversePrimary() {
		return this.getArgb(this.colors.inversePrimary());
	}
	get secondary() {
		return this.getArgb(this.colors.secondary());
	}
	get secondaryDim() {
		let e = this.colors.secondaryDim();
		if (e === void 0) throw Error("`secondaryDim` color is undefined prior to 2025 spec.");
		return this.getArgb(e);
	}
	get onSecondary() {
		return this.getArgb(this.colors.onSecondary());
	}
	get secondaryContainer() {
		return this.getArgb(this.colors.secondaryContainer());
	}
	get onSecondaryContainer() {
		return this.getArgb(this.colors.onSecondaryContainer());
	}
	get secondaryFixed() {
		return this.getArgb(this.colors.secondaryFixed());
	}
	get secondaryFixedDim() {
		return this.getArgb(this.colors.secondaryFixedDim());
	}
	get onSecondaryFixed() {
		return this.getArgb(this.colors.onSecondaryFixed());
	}
	get onSecondaryFixedVariant() {
		return this.getArgb(this.colors.onSecondaryFixedVariant());
	}
	get tertiary() {
		return this.getArgb(this.colors.tertiary());
	}
	get tertiaryDim() {
		let e = this.colors.tertiaryDim();
		if (e === void 0) throw Error("`tertiaryDim` color is undefined prior to 2025 spec.");
		return this.getArgb(e);
	}
	get onTertiary() {
		return this.getArgb(this.colors.onTertiary());
	}
	get tertiaryContainer() {
		return this.getArgb(this.colors.tertiaryContainer());
	}
	get onTertiaryContainer() {
		return this.getArgb(this.colors.onTertiaryContainer());
	}
	get tertiaryFixed() {
		return this.getArgb(this.colors.tertiaryFixed());
	}
	get tertiaryFixedDim() {
		return this.getArgb(this.colors.tertiaryFixedDim());
	}
	get onTertiaryFixed() {
		return this.getArgb(this.colors.onTertiaryFixed());
	}
	get onTertiaryFixedVariant() {
		return this.getArgb(this.colors.onTertiaryFixedVariant());
	}
	get error() {
		return this.getArgb(this.colors.error());
	}
	get errorDim() {
		let e = this.colors.errorDim();
		if (e === void 0) throw Error("`errorDim` color is undefined prior to 2025 spec.");
		return this.getArgb(e);
	}
	get onError() {
		return this.getArgb(this.colors.onError());
	}
	get errorContainer() {
		return this.getArgb(this.colors.errorContainer());
	}
	get onErrorContainer() {
		return this.getArgb(this.colors.onErrorContainer());
	}
};
$.DEFAULT_SPEC_VERSION = "2021", $.DEFAULT_PLATFORM = "phone";
var xa = class {
	getPrimaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.CONTENT:
			case q.FIDELITY: return W.fromHueAndChroma(t.hue, t.chroma);
			case q.FRUIT_SALAD: return W.fromHueAndChroma(ji(t.hue - 50), 48);
			case q.MONOCHROME: return W.fromHueAndChroma(t.hue, 0);
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, 12);
			case q.RAINBOW: return W.fromHueAndChroma(t.hue, 48);
			case q.TONAL_SPOT: return W.fromHueAndChroma(t.hue, 36);
			case q.EXPRESSIVE: return W.fromHueAndChroma(ji(t.hue + 240), 40);
			case q.VIBRANT: return W.fromHueAndChroma(t.hue, 200);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getSecondaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.CONTENT:
			case q.FIDELITY: return W.fromHueAndChroma(t.hue, Math.max(t.chroma - 32, t.chroma * .5));
			case q.FRUIT_SALAD: return W.fromHueAndChroma(ji(t.hue - 50), 36);
			case q.MONOCHROME: return W.fromHueAndChroma(t.hue, 0);
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, 8);
			case q.RAINBOW: return W.fromHueAndChroma(t.hue, 16);
			case q.TONAL_SPOT: return W.fromHueAndChroma(t.hue, 16);
			case q.EXPRESSIVE: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				21,
				51,
				121,
				151,
				191,
				271,
				321,
				360
			], [
				45,
				95,
				45,
				20,
				45,
				90,
				45,
				45,
				45
			]), 24);
			case q.VIBRANT: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				41,
				61,
				101,
				131,
				181,
				251,
				301,
				360
			], [
				18,
				15,
				10,
				12,
				15,
				18,
				15,
				12,
				12
			]), 24);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getTertiaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.CONTENT: return W.fromHct(na.fixIfDisliked(new ua(t).analogous(3, 6)[2]));
			case q.FIDELITY: return W.fromHct(na.fixIfDisliked(new ua(t).complement));
			case q.FRUIT_SALAD: return W.fromHueAndChroma(t.hue, 36);
			case q.MONOCHROME: return W.fromHueAndChroma(t.hue, 0);
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, 16);
			case q.RAINBOW:
			case q.TONAL_SPOT: return W.fromHueAndChroma(ji(t.hue + 60), 24);
			case q.EXPRESSIVE: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				21,
				51,
				121,
				151,
				191,
				271,
				321,
				360
			], [
				120,
				120,
				20,
				45,
				20,
				15,
				20,
				120,
				120
			]), 32);
			case q.VIBRANT: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				41,
				61,
				101,
				131,
				181,
				251,
				301,
				360
			], [
				35,
				30,
				20,
				25,
				30,
				35,
				30,
				25,
				25
			]), 32);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getNeutralPalette(e, t, n, r, i) {
		switch (e) {
			case q.CONTENT:
			case q.FIDELITY: return W.fromHueAndChroma(t.hue, t.chroma / 8);
			case q.FRUIT_SALAD: return W.fromHueAndChroma(t.hue, 10);
			case q.MONOCHROME: return W.fromHueAndChroma(t.hue, 0);
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, 2);
			case q.RAINBOW: return W.fromHueAndChroma(t.hue, 0);
			case q.TONAL_SPOT: return W.fromHueAndChroma(t.hue, 6);
			case q.EXPRESSIVE: return W.fromHueAndChroma(ji(t.hue + 15), 8);
			case q.VIBRANT: return W.fromHueAndChroma(t.hue, 10);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getNeutralVariantPalette(e, t, n, r, i) {
		switch (e) {
			case q.CONTENT: return W.fromHueAndChroma(t.hue, t.chroma / 8 + 4);
			case q.FIDELITY: return W.fromHueAndChroma(t.hue, t.chroma / 8 + 4);
			case q.FRUIT_SALAD: return W.fromHueAndChroma(t.hue, 16);
			case q.MONOCHROME: return W.fromHueAndChroma(t.hue, 0);
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, 2);
			case q.RAINBOW: return W.fromHueAndChroma(t.hue, 0);
			case q.TONAL_SPOT: return W.fromHueAndChroma(t.hue, 8);
			case q.EXPRESSIVE: return W.fromHueAndChroma(ji(t.hue + 15), 12);
			case q.VIBRANT: return W.fromHueAndChroma(t.hue, 12);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getErrorPalette(e, t, n, r, i) {}
}, Sa = class e extends xa {
	getPrimaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, r === "phone" ? B.isBlue(t.hue) ? 12 : 8 : B.isBlue(t.hue) ? 16 : 12);
			case q.TONAL_SPOT: return W.fromHueAndChroma(t.hue, r === "phone" && n ? 26 : 32);
			case q.EXPRESSIVE: return W.fromHueAndChroma(t.hue, r === "phone" ? n ? 36 : 48 : 40);
			case q.VIBRANT: return W.fromHueAndChroma(t.hue, r === "phone" ? 74 : 56);
			default: return super.getPrimaryPalette(e, t, n, r, i);
		}
	}
	getSecondaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, r === "phone" ? B.isBlue(t.hue) ? 6 : 4 : B.isBlue(t.hue) ? 10 : 6);
			case q.TONAL_SPOT: return W.fromHueAndChroma(t.hue, 16);
			case q.EXPRESSIVE: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				105,
				140,
				204,
				253,
				278,
				300,
				333,
				360
			], [
				-160,
				155,
				-100,
				96,
				-96,
				-156,
				-165,
				-160
			]), r === "phone" && n ? 16 : 24);
			case q.VIBRANT: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				38,
				105,
				140,
				333,
				360
			], [
				-14,
				10,
				-14,
				10,
				-14
			]), r === "phone" ? 56 : 36);
			default: return super.getSecondaryPalette(e, t, n, r, i);
		}
	}
	getTertiaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.NEUTRAL: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				38,
				105,
				161,
				204,
				278,
				333,
				360
			], [
				-32,
				26,
				10,
				-39,
				24,
				-15,
				-32
			]), r === "phone" ? 20 : 36);
			case q.TONAL_SPOT: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				20,
				71,
				161,
				333,
				360
			], [
				-40,
				48,
				-32,
				40,
				-32
			]), r === "phone" ? 28 : 32);
			case q.EXPRESSIVE: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				105,
				140,
				204,
				253,
				278,
				300,
				333,
				360
			], [
				-165,
				160,
				-105,
				101,
				-101,
				-160,
				-170,
				-165
			]), 48);
			case q.VIBRANT: return W.fromHueAndChroma($.getRotatedHue(t, [
				0,
				38,
				71,
				105,
				140,
				161,
				253,
				333,
				360
			], [
				-72,
				35,
				24,
				-24,
				62,
				50,
				62,
				-72
			]), 56);
			default: return super.getTertiaryPalette(e, t, n, r, i);
		}
	}
	static getExpressiveNeutralHue(e) {
		return $.getRotatedHue(e, [
			0,
			71,
			124,
			253,
			278,
			300,
			360
		], [
			10,
			0,
			10,
			0,
			10,
			0
		]);
	}
	static getExpressiveNeutralChroma(t, n, r) {
		let i = e.getExpressiveNeutralHue(t);
		return r === "phone" ? n ? B.isYellow(i) ? 6 : 14 : 18 : 12;
	}
	static getVibrantNeutralHue(e) {
		return $.getRotatedHue(e, [
			0,
			38,
			105,
			140,
			333,
			360
		], [
			-14,
			10,
			-14,
			10,
			-14
		]);
	}
	static getVibrantNeutralChroma(t, n) {
		let r = e.getVibrantNeutralHue(t);
		return n === "phone" || B.isBlue(r) ? 28 : 20;
	}
	getNeutralPalette(t, n, r, i, a) {
		switch (t) {
			case q.NEUTRAL: return W.fromHueAndChroma(n.hue, i === "phone" ? 1.4 : 6);
			case q.TONAL_SPOT: return W.fromHueAndChroma(n.hue, i === "phone" ? 5 : 10);
			case q.EXPRESSIVE: return W.fromHueAndChroma(e.getExpressiveNeutralHue(n), e.getExpressiveNeutralChroma(n, r, i));
			case q.VIBRANT: return W.fromHueAndChroma(e.getVibrantNeutralHue(n), e.getVibrantNeutralChroma(n, i));
			default: return super.getNeutralPalette(t, n, r, i, a);
		}
	}
	getNeutralVariantPalette(t, n, r, i, a) {
		switch (t) {
			case q.NEUTRAL: return W.fromHueAndChroma(n.hue, (i === "phone" ? 1.4 : 6) * 2.2);
			case q.TONAL_SPOT: return W.fromHueAndChroma(n.hue, (i === "phone" ? 5 : 10) * 1.7);
			case q.EXPRESSIVE:
				let o = e.getExpressiveNeutralHue(n), s = e.getExpressiveNeutralChroma(n, r, i);
				return W.fromHueAndChroma(o, s * (o >= 105 && o < 125 ? 1.6 : 2.3));
			case q.VIBRANT:
				let c = e.getVibrantNeutralHue(n), l = e.getVibrantNeutralChroma(n, i);
				return W.fromHueAndChroma(c, l * 1.29);
			default: return super.getNeutralVariantPalette(t, n, r, i, a);
		}
	}
	getErrorPalette(e, t, n, r, i) {
		let a = $.getPiecewiseHue(t, [
			0,
			3,
			13,
			23,
			33,
			43,
			153,
			273,
			360
		], [
			12,
			22,
			32,
			12,
			22,
			32,
			22,
			12
		]);
		switch (e) {
			case q.NEUTRAL: return W.fromHueAndChroma(a, r === "phone" ? 50 : 40);
			case q.TONAL_SPOT: return W.fromHueAndChroma(a, r === "phone" ? 60 : 48);
			case q.EXPRESSIVE: return W.fromHueAndChroma(a, r === "phone" ? 64 : 48);
			case q.VIBRANT: return W.fromHueAndChroma(a, r === "phone" ? 80 : 60);
			default: return super.getErrorPalette(e, t, n, r, i);
		}
	}
}, Ca = new xa(), wa = new Sa();
function Ta(e) {
	return e === "2025" ? wa : Ca;
}
var Ea = [
	"canvas",
	"ink",
	"border-subtle",
	"surface",
	"surface-container",
	"surface-container-high",
	"outline",
	"outline-variant",
	"success",
	"warning",
	"danger"
], Da = {
	light: {
		canvas: "#f0f4f8",
		ink: "#0b1f33",
		"border-subtle": "#d4e0eb",
		surface: "#ffffff",
		"surface-container": "#ffffff",
		"surface-container-high": "#f1f5f9",
		outline: "#cbd5e1",
		"outline-variant": "#e2e8f0",
		success: "#15803d",
		warning: "#b45309",
		danger: "#e60012"
	},
	dark: {
		canvas: "#121316",
		ink: "#f8fafc",
		"border-subtle": "#2e3038",
		surface: "#1e2026",
		"surface-container": "#1e2026",
		"surface-container-high": "#24262e",
		outline: "#334155",
		"outline-variant": "#2e3038",
		success: "#4ade80",
		warning: "#fbbf24",
		danger: "#e60012"
	}
}, Oa = new Q(), ka = U.fromPalette({
	name: "on_on_primary",
	palette: (e) => e.primaryPalette,
	background: () => Oa.onPrimary(),
	contrastCurve: () => new G(6, 6, 7, 11)
}), Aa = U.fromPalette({
	name: "primary_container_subtle",
	palette: (e) => e.primaryPalette,
	isBackground: !0,
	background: (e) => Oa.highestSurface(e),
	contrastCurve: () => void 0
}), ja = U.fromPalette({
	name: "on_primary_container_subtle",
	palette: (e) => e.primaryPalette,
	background: () => Aa,
	contrastCurve: () => new G(6, 6, 7, 11)
}), Ma = U.fromPalette({
	name: "secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	isBackground: !0,
	background: (e) => Oa.highestSurface(e),
	contrastCurve: () => void 0
}), Na = U.fromPalette({
	name: "on_secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	background: () => Ma,
	contrastCurve: () => new G(6, 6, 7, 11)
}), Pa = U.fromPalette({
	name: "tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	isBackground: !0,
	background: (e) => Oa.highestSurface(e),
	contrastCurve: () => void 0
}), Fa = U.fromPalette({
	name: "on_tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	background: () => Pa,
	contrastCurve: () => new G(6, 6, 7, 11)
}), Ia = U.fromPalette({
	name: "error_container_subtle",
	palette: (e) => e.errorPalette,
	isBackground: !0,
	background: (e) => Oa.highestSurface(e),
	contrastCurve: () => void 0
}), La = U.fromPalette({
	name: "on_error_container_subtle",
	palette: (e) => e.errorPalette,
	background: () => Ia,
	contrastCurve: () => new G(6, 6, 7, 11)
}), Ra = [
	...Oa.allColors.filter((e) => e.name !== "background" && e.name !== "on_background"),
	Oa.shadow(),
	Oa.scrim(),
	ka,
	Aa,
	ja,
	Ma,
	Na,
	Pa,
	Fa,
	Ia,
	La
];
[
	{
		name: "brand",
		source: "primary"
	},
	{
		name: "brand-muted",
		source: "primary-container-subtle"
	},
	{
		name: "soft-blue",
		source: "inverse-primary"
	},
	{
		name: "surface-variant",
		source: "surface-container-low"
	}
].filter((e) => e.name !== "surface-variant");
function za(e) {
	let t = (e & 16777215).toString(16).padStart(6, "0");
	return t[0] === t[1] && t[2] === t[3] && t[4] === t[5] ? `#${t[0]}${t[2]}${t[4]}` : `#${t}`;
}
function Ba(e) {
	let t = e.replace("#", "").trim();
	if (t.length === 3) {
		let e = t[0] + t[0], n = t[1] + t[1], r = t[2] + t[2];
		return Number.parseInt(`ff${e}${n}${r}`, 16);
	}
	return t.length === 6 ? Number.parseInt(`ff${t}`, 16) : t.length === 8 ? Number.parseInt(t, 16) : null;
}
function Va(e) {
	return e.replaceAll("_", "-");
}
function Ha(e, t) {
	return new $({
		sourceColorHcts: [B.fromInt(e)],
		variant: q.TONAL_SPOT,
		contrastLevel: 0,
		specVersion: "2025",
		isDark: t
	});
}
function Ua(e, t) {
	for (let n of Ea) e[n] = Da[t][n];
	return e;
}
function Wa(e, t) {
	let n = e === "dark", r = Ha((t ? Ba(t) : null) ?? 4278216887, n), i = {};
	for (let e of Ra) {
		let t = Va(e.name);
		i[t] = za(e.getArgb(r));
	}
	return Ua(i, e), {
		surface: i.surface ?? (n ? "#141318" : "#fef7ff"),
		onSurface: i["on-surface"] ?? (n ? "#e6e0e9" : "#1d1b20"),
		primary: i.primary ?? (n ? "#a8c7fa" : "#0068b7"),
		onPrimary: i["on-primary"] ?? (n ? "#003366" : "#ffffff"),
		surfaceVariant: i["surface-container-low"] ?? (n ? "#1d1b20" : "#f7f2fa"),
		outline: i.outline ?? (n ? "#938f99" : "#79747e"),
		...i
	};
}
//#endregion
//#region packages/ui-kit/src/schema-form/inputs/FileField.svelte
Ci(Wa("light"), Wa("dark")), typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), cr(["input"]), cr(["change"]), cr(["change"]), cr(["change"]);
//#endregion
//#region packages/ui-kit/src/utils/middle-truncate.ts
var Ga = null;
function Ka(e) {
	if (typeof document > "u") return () => Infinity;
	Ga ??= document.createElement("canvas");
	let t = Ga.getContext("2d");
	return t ? (t.font = e, (e) => t.measureText(e).width) : () => Infinity;
}
function qa(e, t, n, r = 6) {
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
function Ja(e) {
	let t = getComputedStyle(e), n = t.fontStyle || "normal", r = t.fontWeight || "normal", i = t.fontFamily || "sans-serif";
	return (e) => Ka(`${n} ${r} ${e}px ${i}`);
}
//#endregion
//#region packages/ui-kit/src/utils/fit-width-font.svelte.ts
var Ya = 6;
function Xa(e) {
	return (t) => {
		let n = () => {
			let { lines: n, maxFontPx: r, minFontPx: i = Ya, fromParent: a = !1 } = e(), o = n.filter((e) => e.length > 0), s = (a ? t.parentElement ?? t : t).clientWidth;
			if (a) {
				let e = getComputedStyle(t);
				s -= (Number.parseFloat(e.paddingLeft) || 0) + (Number.parseFloat(e.paddingRight) || 0), s = Math.max(0, s);
			}
			if (s <= 0 || o.length === 0) return;
			let c = Ja(t), l = qa(s, (e) => {
				let t = c(e);
				return Math.max(...o.map((e) => t(e)));
			}, r, i);
			t.style.fontSize = `${l}px`;
		}, r = null, i = new ResizeObserver(n);
		return dn(() => {
			let { fromParent: a = !1 } = e(), o = a ? t.parentElement ?? t : t;
			r !== o && (i.disconnect(), i.observe(o), r = o), n();
		}), () => i.disconnect();
	};
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
cr(["click"]), cr(["change"]), cr(["click"]), cr(["click"]), cr(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function Za(e) {
	return {
		[bi]: !0,
		mount(t, n) {
			let r = yr(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				Cr(r);
			} };
		}
	};
}
//#endregion
//#region packages/ui-kit/src/i18n/plugin-text.ts
function Qa(e, t, n, r, i) {
	let a = n["zh-cn"][r] ?? n.en?.[r] ?? String(r);
	if (!e) return yi(a, i);
	e.slotVersion;
	let o = e.translatePlugin(t, r, i);
	return o === r ? yi(a, i) : o;
}
//#endregion
//#region packages/plugins/today/src/messages.ts
var $a = {
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
}, eo = "tool-today";
//#endregion
//#region packages/plugins/today/src/index.ts
function to(e = {}) {
	let { screenComponent: t } = e;
	return Ei({
		id: eo,
		messages: $a,
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
				id: eo,
				title: () => n("screen.title"),
				...t ? { component: t } : {}
			});
		}
	});
}
//#endregion
//#region packages/plugins/today/src/today-courses.ts
var no = new di();
function ro(e, t, n) {
	let r = e.find((e) => e.index === t), i = e.find((e) => e.index === n);
	return !r || !i ? null : {
		startTime: r.startTime,
		endTime: i.endTime
	};
}
function io(e) {
	return [...e].sort((e, t) => {
		let n = e.course.startPeriod - t.course.startPeriod;
		if (n !== 0) return n;
		let r = e.course.endPeriod - t.course.endPeriod;
		return r === 0 ? e.course.name.localeCompare(t.course.name, "zh-CN") : r;
	});
}
function ao(e, t, n, r) {
	let i = pi(t), a = i.find((t) => t.index === e.startPeriod), o = i.find((t) => t.index === e.endPeriod);
	if (a && o) {
		if (n > o.endMinutes) return "past";
		if (n >= a.startMinutes && n <= o.endMinutes) return "current";
		if (n < a.startMinutes) return "upcoming";
	}
	return r == null ? "upcoming" : e.endPeriod < r ? "past" : e.startPeriod <= r && e.endPeriod >= r ? "current" : "upcoming";
}
function oo(e, t, n, r) {
	return io(e).map((e) => ({
		hit: e,
		status: ao(e.course, t, n, r)
	}));
}
async function so(e, t) {
	let { todayIso: n, scope: r, timetable: i } = t;
	if (!i) return [];
	let a = ui(n);
	if (r === "active") {
		let t = no.calculateAcademicWeek(n, i.academicConfig);
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
		let t = no.calculateAcademicWeek(n, e.academicConfig), r = c.get(t) ?? [];
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
function co() {
	let e = /* @__PURE__ */ zt(null), t = "", n = /* @__PURE__ */ zt("active"), r = /* @__PURE__ */ zt([]), i, a;
	function o() {
		return I(e)?.currentTimetable ?? null;
	}
	function s() {
		return o()?.academicConfig.periodTimes ?? [];
	}
	let c = /* @__PURE__ */ dt(() => I(e)?.clockTodayIso || li()), l = /* @__PURE__ */ dt(() => I(e)?.clockNow ?? /* @__PURE__ */ new Date()), u = /* @__PURE__ */ dt(() => {
		let t = I(e), n = t?.clockNow ?? /* @__PURE__ */ new Date(), r = pi(s());
		return r.length === 0 ? t?.currentPeriodIndex ?? null : hi(r, mi(n));
	});
	async function d() {
		let i = I(e), a = o();
		if (!i || !a) {
			A(r, []);
			return;
		}
		try {
			let e = await so(i.getPluginContext(t).service(_i), {
				todayIso: I(c),
				scope: I(n),
				timetable: a
			});
			A(r, oo(e, s(), mi(I(l)), I(u)));
		} catch {
			A(r, []);
		}
	}
	async function f() {
		let r = I(e);
		if (r) try {
			let e = r.getPluginContext(t);
			A(n, e.config.scope ?? "active", !0);
		} catch {
			A(n, "active");
		}
	}
	async function p(n, r) {
		if (!I(e)) {
			A(e, n, !0), t = r, await f();
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
		A(n, r, !0);
		let i = I(e);
		if (i) {
			try {
				await i.getPluginContext(t).updateConfig({ scope: r });
			} catch {}
			await d();
		}
	}
	function h() {
		i?.(), i = void 0, a?.(), a = void 0, A(e, null), t = "", A(r, []);
	}
	return dn(() => {
		let t = I(e);
		t && (t.clockNow, t.clockTodayIso, I(n), o()?.id, o()?.academicConfig.periodTimes, d());
	}), {
		get today() {
			return I(c);
		},
		get now() {
			return I(l);
		},
		get scope() {
			return I(n);
		},
		get courseEntries() {
			return I(r);
		},
		get currentPeriodIndex() {
			return I(u);
		},
		init: p,
		dispose: h,
		persistScope: m,
		refreshCourses: d
	};
}
//#endregion
//#region packages/plugins/today/src/TodayScreen.svelte
var lo = /* @__PURE__ */ L("<p class=\"text-label-large shrink-0 text-on-surface-variant\"> </p>"), uo = /* @__PURE__ */ L("<div class=\"mt-1 flex items-center justify-between gap-3\"><p class=\"text-body-medium text-on-surface-variant\"> </p> <!></div>"), fo = /* @__PURE__ */ L("<div></div>"), po = /* @__PURE__ */ L("<button type=\"button\"> </button>"), mo = /* @__PURE__ */ L("<section class=\"flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs\"><div class=\"mb-4 flex size-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" class=\"size-8 fill-current\"><path d=\"M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z\"></path></svg></div> <p class=\"text-title-medium text-on-surface\"> </p></section>"), ho = /* @__PURE__ */ L("<section class=\"flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs\"><div class=\"mb-4 flex size-16 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" class=\"size-8 fill-current\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"></path></svg></div> <p class=\"text-title-medium text-on-surface\"> </p> <p class=\"text-body-medium mt-2 text-on-surface-variant\"> </p></section>"), go = /* @__PURE__ */ L("<p class=\"text-label-medium text-on-surface tabular-nums\"> </p>"), _o = /* @__PURE__ */ L("<span class=\"text-label-small shrink-0 rounded-full bg-primary px-2 py-0.5 text-on-primary\"> </span>"), vo = /* @__PURE__ */ L("<p> </p>"), yo = /* @__PURE__ */ L("<div class=\"text-body-small mt-1 flex flex-col gap-1 text-on-surface-variant\"><!> <!> <!></div>"), bo = /* @__PURE__ */ L("<div class=\"flex w-11 shrink-0 flex-col items-center self-stretch\"><!> <div class=\"flex min-h-0 w-full flex-1 flex-col items-center justify-center\"><p class=\"text-headline-small w-full min-w-0 text-center font-bold whitespace-nowrap text-on-surface-variant\"> </p></div> <!></div> <div class=\"w-1 shrink-0 self-stretch rounded-full\" aria-hidden=\"true\"></div> <div class=\"min-w-0 flex-1\"><div class=\"flex items-start justify-between gap-2\"><p class=\"text-title-medium truncate text-on-surface\"> </p> <!></div> <!></div>", 1), xo = /* @__PURE__ */ L("<button type=\"button\"><!></button>"), So = /* @__PURE__ */ L("<div><!></div>"), Co = /* @__PURE__ */ L("<li><!></li>"), wo = /* @__PURE__ */ L("<section class=\"overflow-hidden rounded-2xl border border-outline/20 bg-surface shadow-xs\"><ul class=\"divide-y divide-outline/10\"></ul></section>"), To = /* @__PURE__ */ L("<div class=\"flex min-h-0 flex-1 flex-col overflow-y-auto\"><header class=\"border-b border-outline/10 bg-surface px-4 pt-6 pb-4\"><p class=\"text-headline-small text-on-surface\"> </p> <!> <div class=\"rounded-pill relative mt-4 flex w-full border border-border bg-surface p-1.5 shadow-xs\"><!> <!></div></header> <div class=\"flex flex-1 flex-col gap-4 p-4\"><!></div></div>");
function Eo(e, t) {
	ze(t, !0);
	let n = Gr(t, "active", 3, !0), r = new di(), i = co(), a = /* @__PURE__ */ dt(() => t.controller.currentTimetable), o = /* @__PURE__ */ dt(() => I(a)?.academicConfig.periodTimes ?? []), s = /* @__PURE__ */ dt(() => t.controller.clockTodayIso || i.today), c = /* @__PURE__ */ dt(() => I(a) ? r.calculateAcademicWeek(I(s), I(a).academicConfig) : 1), l = /* @__PURE__ */ dt(() => {
		let e = t.controller.coursePalette;
		return ei(i.courseEntries.map((e) => e.hit.course), e);
	}), u = /* @__PURE__ */ dt(() => [{
		value: "active",
		label: f("screen.scope.active")
	}, {
		value: "all",
		label: f("screen.scope.all")
	}]), d = /* @__PURE__ */ dt(() => I(u).findIndex((e) => e.value === i.scope));
	function f(e, n) {
		return Qa(t.controller, eo, $a, e, n);
	}
	function p(e) {
		return (/* @__PURE__ */ new Date(`${e}T12:00:00`)).toLocaleDateString(void 0, {
			month: "long",
			day: "numeric",
			weekday: "long"
		});
	}
	function m(e) {
		let n = t.controller.coursePalette;
		return I(l).get(Xr(e.course.name)) ?? $r(e.course, n);
	}
	let h = /* @__PURE__ */ dt(() => {
		try {
			return t.controller.getPluginContext(t.pluginId).tryService(vi);
		} catch {
			return;
		}
	});
	function g(e) {
		I(h)?.openCourseEditor(e);
	}
	Tr(() => (i.init(t.controller, t.pluginId), () => i.dispose()));
	var _ = To(), v = j(_), y = j(v), b = j(y, !0);
	D(y);
	var x = M(y, 2), S = (e) => {
		var t = uo(), n = j(t), r = j(n, !0);
		D(n);
		var a = M(n, 2), o = (e) => {
			var t = lo(), n = j(t, !0);
			D(t), N((e) => vr(n, e), [() => f("screen.summary.count", { count: i.courseEntries.length })]), R(e, t);
		};
		Er(a, (e) => {
			i.courseEntries.length > 0 && e(o);
		}), D(t), N((e) => vr(r, e), [() => f("screen.week", { week: I(c) })]), R(e, t);
	};
	Er(x, (e) => {
		I(a) && e(S);
	});
	var C = M(x, 2), w = j(C), ee = (e) => {
		var t = fo();
		let r;
		N(() => {
			Hr(t, 1, `rounded-pill absolute top-1.5 bottom-1.5 bg-secondary-container shadow-xs ${n() ? "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]" : ""}`), r = Wr(t, "", r, {
				left: `calc(0.375rem + ${I(d) ?? ""} * ((100% - 0.75rem) / 2))`,
				width: "calc((100% - 0.75rem) / 2)"
			});
		}), R(e, t);
	};
	Er(w, (e) => {
		I(d) >= 0 && e(ee);
	}), Ar(M(w, 2), 17, () => I(u), (e) => e.value, (e, t) => {
		var n = po(), r = j(n, !0);
		D(n), N(() => {
			Hr(n, 1, `text-label-large rounded-pill relative z-10 flex-1 cursor-pointer py-2 text-center transition-colors duration-200 ${i.scope === I(t).value ? "text-on-secondary-container" : "text-on-surface-variant hover:text-on-surface"}`), vr(r, I(t).label);
		}), sr("click", n, () => void i.persistScope(I(t).value)), R(e, n);
	}), D(C), D(v);
	var te = M(v, 2), ne = j(te), re = (e) => {
		var t = mo(), n = M(j(t), 2), r = j(n, !0);
		D(n), D(t), N((e) => vr(r, e), [() => f("screen.empty.noTimetable")]), R(e, t);
	}, ie = (e) => {
		var t = ho(), n = M(j(t), 2), r = j(n, !0);
		D(n);
		var i = M(n, 2), a = j(i, !0);
		D(i), D(t), N((e, t) => {
			vr(r, e), vr(a, t);
		}, [() => f("screen.empty.noCourses"), () => f("screen.empty.noCoursesHint")]), R(e, t);
	}, ae = (e) => {
		var t = wo(), n = j(t);
		Ar(n, 21, () => i.courseEntries, (e) => `${e.hit.timetableId}-${e.hit.course.id}`, (e, t) => {
			var n = Co();
			{
				let e = (e) => {
					var n = bo(), r = en(n), a = j(r), o = (e) => {
						var t = go(), n = j(t, !0);
						D(t), N(() => vr(n, I(l).startTime)), R(e, t);
					};
					Er(a, (e) => {
						I(l) && e(o);
					});
					var s = M(a, 2), d = j(s), p = j(d, !0);
					D(d), Ir(d, () => Xa(() => ({
						lines: [I(u)],
						maxFontPx: 24,
						minFontPx: 6,
						fromParent: !0
					}))), D(s);
					var m = M(s, 2), h = (e) => {
						var t = go(), n = j(t, !0);
						D(t), N(() => vr(n, I(l).endTime)), R(e, t);
					};
					Er(m, (e) => {
						I(l) && e(h);
					}), D(r);
					var g = M(r, 2);
					let _;
					var v = M(g, 2), y = j(v), b = j(y), x = j(b, !0);
					D(b);
					var S = M(b, 2), C = (e) => {
						var t = _o(), n = j(t, !0);
						D(t), N((e) => vr(n, e), [() => f("screen.status.current")]), R(e, t);
					};
					Er(S, (e) => {
						I(t).status === "current" && e(C);
					}), D(y);
					var w = M(y, 2), ee = (e) => {
						var n = yo(), r = j(n), a = (e) => {
							var n = vo(), r = j(n, !0);
							D(n), N((e) => vr(r, e), [() => f("screen.course.timetable", { name: I(t).hit.timetableName })]), R(e, n);
						};
						Er(r, (e) => {
							i.scope === "all" && I(t).hit.timetableName && e(a);
						});
						var o = M(r, 2), s = (e) => {
							var n = vo(), r = j(n, !0);
							D(n), N(() => vr(r, I(t).hit.course.location)), R(e, n);
						};
						Er(o, (e) => {
							I(t).hit.course.location && e(s);
						});
						var c = M(o, 2), l = (e) => {
							var n = vo(), r = j(n, !0);
							D(n), N(() => vr(r, I(t).hit.course.teacher)), R(e, n);
						};
						Er(c, (e) => {
							I(t).hit.course.teacher && e(l);
						}), D(n), R(e, n);
					};
					Er(w, (e) => {
						(i.scope === "all" && I(t).hit.timetableName || I(t).hit.course.location || I(t).hit.course.teacher) && e(ee);
					}), D(v), N(() => {
						vr(p, I(u)), _ = Wr(g, "", _, { "background-color": I(c).background }), vr(x, I(t).hit.course.name);
					}), R(e, n);
				}, c = /* @__PURE__ */ dt(() => m(I(t).hit)), l = /* @__PURE__ */ dt(() => ro(I(o), I(t).hit.course.startPeriod, I(t).hit.course.endPeriod)), u = /* @__PURE__ */ dt(() => I(t).hit.course.startPeriod === I(t).hit.course.endPeriod ? f("screen.course.periodSingle", { n: I(t).hit.course.startPeriod }) : f("screen.course.periodRange", {
					start: I(t).hit.course.startPeriod,
					end: I(t).hit.course.endPeriod
				}));
				var r = j(n), a = (n) => {
					var r = xo(), i = j(r);
					e(i), D(r), N(() => Hr(r, 1, `flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-container-low ${I(t).status === "past" ? "opacity-60" : ""}`)), sr("click", r, () => g(I(t).hit.course.id)), R(n, r);
				}, s = (n) => {
					var r = So(), i = j(r);
					e(i), D(r), N(() => Hr(r, 1, `flex gap-3 px-4 py-4 ${I(t).status === "past" ? "opacity-60" : ""}`)), R(n, r);
				};
				Er(r, (e) => {
					I(h) ? e(a) : e(s, -1);
				}), D(n);
			}
			R(e, n);
		}), D(n), D(t), R(e, t);
	};
	Er(ne, (e) => {
		I(a) ? i.courseEntries.length === 0 ? e(ie, 1) : e(ae, -1) : e(re);
	}), D(te), D(_), N((e) => vr(b, e), [() => p(I(s))]), R(e, _), Be();
}
cr(["click"]);
//#endregion
//#region packages/plugins/today/bundle/entry.ts
var Do = to({ screenComponent: Za(Eo) });
//#endregion
export { Do as default };
