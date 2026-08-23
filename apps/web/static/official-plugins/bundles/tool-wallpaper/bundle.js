//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/constants.js
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
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/constants.js
var h = 1 << 24, g = 1024, _ = 2048, v = 4096, y = 8192, b = 16384, x = 32768, S = 1 << 25, C = 65536, w = 1 << 19, ee = 1 << 20, te = 1 << 25, ne = 65536, re = 1 << 21, ie = 1 << 22, ae = 1 << 23, oe = Symbol("$state"), se = Symbol("legacy props"), ce = Symbol("attributes"), le = Symbol("class"), ue = Symbol("style"), de = Symbol("text"), fe = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function pe() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function me(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function he(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ge() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function _e(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function ve() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ye(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function be() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function xe() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Se() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ce() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function we() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Te(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ee() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/hydration.js
var T = !1;
function De(e) {
	T = e;
}
var E;
function Oe(t) {
	if (t === null) throw Te(), e;
	return E = t;
}
function ke() {
	return Oe(/* @__PURE__ */ Zt(E));
}
function D(t) {
	if (T) {
		if (/* @__PURE__ */ Zt(E) !== null) throw Te(), e;
		E = t;
	}
}
function Ae(e = 1) {
	if (T) {
		for (var t = e, n = E; t--;) n = /* @__PURE__ */ Zt(n);
		E = n;
	}
}
function je(e = !0) {
	for (var t = 0, n = E;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Zt(n);
		e && n.remove(), n = i;
	}
}
function Me(t) {
	if (!t || t.nodeType !== 8) throw Te(), e;
	return t.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function Ne(e) {
	return e === this.v;
}
function Pe(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Fe(e) {
	return !Pe(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var Ie = null;
function Le(e) {
	Ie = e;
}
function Re(e, t = !1, n) {
	Ie = {
		p: Ie,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: F,
		l: null
	};
}
function ze(e) {
	var t = Ie, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) dn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ie = t.p, e ?? {};
}
function Be() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var Ve = [];
function He() {
	var e = Ve;
	Ve = [], p(e);
}
function Ue(e) {
	if (Ve.length === 0 && !bt) {
		var t = Ve;
		queueMicrotask(() => {
			t === Ve && He();
		});
	}
	Ve.push(e);
}
function We(e) {
	var t = F;
	if (t === null) return P.f |= ae, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ge(e, t);
}
function Ge(e, t) {
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
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/status.js
var Ke = ~(_ | v | g);
function O(e, t) {
	e.f = e.f & Ke | t;
}
function qe(e) {
	e.f & 512 || e.deps === null ? O(e, g) : O(e, v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Je(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= ne, Je(t.deps));
}
function Ye(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Je(e.deps), O(e, g);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/store.js
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
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Qe(e) {
	var t = P, n = F;
	Fn(null), In(null);
	try {
		return e();
	} finally {
		Fn(t), In(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function $e(e) {
	let t = 0, n = It(0), r;
	return () => {
		cn() && (I(n), hn(() => (t === 0 && (r = nr(() => e(() => Vt(n)))), t += 1, () => {
			Ue(() => {
				--t, t === 0 && (r?.(), r = void 0, Vt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var et = C | w;
function tt(e, t, n, r) {
	new nt(e, t, n, r);
}
var nt = class {
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
	#h = $e(() => (this.#m = It(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = F;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = F.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = gn(() => {
			if (T) {
				let e = this.#t;
				ke();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, et), T && (this.#e = E);
	}
	#g() {
		try {
			this.#a = vn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ue(r), t && (this.#s = vn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				Ee();
				return;
			}
			t = !0, n && Ce(), this.#s !== null && Tn(this.#s, () => {
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
					Ge(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = vn(() => e(this.#e)), Ue(() => {
			var e = this.#c = document.createDocumentFragment(), t = Yt();
			e.append(t), this.#a = this.#S(() => vn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Tn(this.#o, () => {
				this.#o = null;
			}), this.#x(A));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = vn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				kn(this.#a, e);
				let t = this.#n.pending;
				this.#o = vn(() => t(this.#e));
			} else this.#x(A);
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
		var t = F, n = P, r = Ie;
		In(this.#i), Fn(this.#i), Le(this.#i.ctx);
		try {
			return Et.ensure(), e();
		} catch (e) {
			return We(e), null;
		} finally {
			In(t), Fn(n), Le(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Tn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ue(() => {
			this.#d = !1, this.#m && zt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), I(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		A?.is_fork ? (this.#a && A.skip_effect(this.#a), this.#o && A.skip_effect(this.#o), this.#s && A.skip_effect(this.#s), A.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Sn(this.#a), null), this.#o &&= (Sn(this.#o), null), this.#s &&= (Sn(this.#s), null), T && (Oe(this.#t), Ae(), Oe(je()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return vn(() => {
						var r = F;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Ge(e, this.#i.parent), null;
				}
			}));
		};
		Ue(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ge(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ge(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function rt(e, t, n, r) {
	let i = Be() ? st : ut;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = F, c = it(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ge(e, s);
			}
			at();
		}
	}
	var d = ot();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ lt(e))).then(u).catch((e) => Ge(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), at();
	}) : f();
}
function it() {
	var e = F, t = P, n = Ie, r = A;
	return function(i = !0) {
		In(e), Fn(t), Le(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function at(e = !0) {
	In(null), Fn(null), Le(null), e && A?.deactivate();
}
function ot() {
	var e = F, t = e.b, n = A, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function st(e) {
	var n = 2 | _;
	return F !== null && (F.f |= w), {
		ctx: Ie,
		deps: null,
		effects: null,
		equals: Ne,
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
var ct = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function lt(e, n, r) {
	let i = F;
	i === null && pe();
	var a = void 0, o = It(t), s = !P, c = /* @__PURE__ */ new Set();
	return mn(() => {
		var t = F, n = m();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== fe && n.reject(e);
			}).finally(at);
		} catch (e) {
			n.reject(e), at();
		}
		var r = A;
		if (s) {
			if (t.f & 32768) var l = ot();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(ct);
			else for (let e of c.values()) e.reject(ct);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== ct && (r.activate(), t ? (o.f |= ae, zt(o, t)) : (o.f & 8388608 && (o.f ^= ae), zt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), ln(() => {
		for (let e of c) e.reject(ct);
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
function k(e) {
	let t = /* @__PURE__ */ st(e);
	return Rn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function ut(e) {
	let t = /* @__PURE__ */ st(e);
	return t.equals = Fe, t;
}
function dt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Sn(t[n]);
	}
}
function ft(e) {
	var n, r = F, i = e.parent;
	if (!Mn && i !== null && e.v !== t && i.f & 24576) return we(), e.v;
	In(i);
	try {
		e.f &= ~ne, dt(e), n = Xn(e);
	} finally {
		In(r);
	}
	return n;
}
function pt(e) {
	var t = ft(e);
	if (!e.equals(t) && (e.wv = qn(), (!A?.is_fork || e.deps === null) && (A === null ? e.v = t : (A.capture(e, t, !0), _t?.capture(e, t, !0)), e.deps === null))) {
		O(e, g);
		return;
	}
	Mn || (vt === null ? qe(e) : (cn() || A?.is_fork) && vt.set(e, t));
}
function mt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Qe(() => {
		t.ac.abort(fe), t.ac = null;
	}), t.fn !== null && (t.teardown = f), Qn(t, 0), bn(t));
}
function ht(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && $n(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var gt = null, A = null, _t = null, vt = null, yt = null, bt = !1, xt = !1, St = null, Ct = null, wt = 0, Tt = 1, Et = class e {
	id = Tt++;
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
		gt === null ? gt = this : (gt.#n = this, this.#t = gt), gt = this;
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
		this.#e = !0, wt++ > 1e3 && (this.#x(), Dt());
		for (let e of this.#u) this.#d.delete(e), O(e, _), this.schedule(e);
		for (let e of this.#d) O(e, v), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = St = [], r = [], i = Ct = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Mt(e), this.#h() || this.discard(), t;
		}
		if (A = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (St = null, Ct = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) jt(e, t);
			i.length > 0 && A.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), _t = this, kt(r), kt(n), _t = null, this.#s?.resolve();
		var s = A;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= g;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= g : i & 4 ? t.push(r) : Jn(r) && (i & 16 && this.#d.add(r), $n(r));
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
		this.oncommit(() => e.discard()), e.#x(), A = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Ye(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), vt?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		A = this;
	}
	deactivate() {
		A = null, vt = null;
	}
	flush() {
		try {
			xt = !0, A = this, this.#g();
		} finally {
			wt = 0, yt = null, St = null, Ct = null, xt = !1, A = null, vt = null, Pt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(ct);
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
		this.#m || (this.#m = !0, Ue(() => {
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
		if (A === null) {
			let t = A = new e();
			!xt && Ue(() => {
				t.#e || t.flush();
			});
		}
		return A;
	}
	apply() {
		vt = null;
	}
	schedule(e) {
		if (yt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (St !== null && t === F && (P === null || !(P.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? gt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Dt() {
	try {
		ve();
	} catch (e) {
		Ge(e, yt);
	}
}
var Ot = null;
function kt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Jn(r) && (Ot = /* @__PURE__ */ new Set(), $n(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && wn(r), Ot?.size > 0)) {
				Pt.clear();
				for (let e of Ot) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Ot.has(n) && (Ot.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || $n(n);
					}
				}
				Ot.clear();
			}
		}
		Ot = null;
	}
}
function At(e) {
	A.schedule(e);
}
function jt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), O(e, g);
		for (var n = e.first; n !== null;) jt(n, t), n = n.next;
	}
}
function Mt(e) {
	O(e, g);
	for (var t = e.first; t !== null;) Mt(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var Nt = /* @__PURE__ */ new Set(), Pt = /* @__PURE__ */ new Map(), Ft = !1;
function It(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Ne,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Lt(e, t) {
	let n = It(e, t);
	return Rn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Rt(e, t = !1, n = !0) {
	let r = It(e);
	return t || (r.equals = Fe), r;
}
function j(e, t, n = !1) {
	return P !== null && (!Pn || P.f & 131072) && Be() && P.f & 4325394 && (Ln === null || !Ln.has(e)) && Se(), zt(e, n ? Ut(t) : t, Ct);
}
function zt(e, t, n = null) {
	if (!e.equals(t)) {
		Pt.set(e, Mn ? t : e.v);
		var r = Et.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && ft(t), vt === null && qe(t);
		}
		e.wv = qn(), Ht(e, _, n), Be() && F !== null && F.f & 1024 && !(F.f & 96) && (Vn === null ? Hn([e]) : Vn.push(e)), !r.is_fork && Nt.size > 0 && !Ft && Bt();
	}
	return t;
}
function Bt() {
	Ft = !1;
	for (let e of Nt) {
		e.f & 1024 && O(e, v);
		let t;
		try {
			t = Jn(e);
		} catch {
			t = !0;
		}
		t && $n(e);
	}
	Nt.clear();
}
function Vt(e) {
	j(e, e.v + 1);
}
function Ht(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Be(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === F)) {
			var l = (c & _) === 0;
			if (l && O(s, t), c & 131072) Nt.add(s);
			else if (c & 2) {
				var u = s;
				vt?.delete(u), c & 65536 || (c & 512 && (F === null || !(F.f & 2097152)) && (s.f |= ne), Ht(u, v, n));
			} else if (l) {
				var d = s;
				c & 16 && Ot !== null && Ot.add(d), n === null ? At(d) : n.push(d);
			}
		}
	}
}
function Ut(e) {
	if (typeof e != "object" || !e || oe in e) return e;
	let r = u(e);
	if (r !== c && r !== l) return e;
	var i = /* @__PURE__ */ new Map(), a = n(e), o = /* @__PURE__ */ Lt(0), d = null, f = Gn, p = (e) => {
		if (Gn === f) return e();
		var t = P, n = Gn;
		Fn(null), Kn(f);
		var r = e();
		return Fn(t), Kn(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ Lt(e.length, d)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && be();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ Lt(n.value, d);
				return i.set(t, e), e;
			}) : j(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ Lt(t, d));
					i.set(n, e), Vt(o);
				}
			} else j(r, t), Vt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === oe) return e;
			var o = i.get(r), c = r in n;
			if (o === void 0 && (!c || s(n, r)?.writable) && (o = p(() => /* @__PURE__ */ Lt(Ut(c ? n[r] : t), d)), i.set(r, o)), o !== void 0) {
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
			return (r !== void 0 || F !== null && (!a || s(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ Lt(a ? Ut(e[n]) : t, d)), i.set(n, r)), I(r) === t) ? !1 : a;
		},
		set(e, n, r, c) {
			var l = i.get(n), u = n in e;
			if (a && n === "length") for (var f = r; f < l.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ Lt(t, d)), i.set(f + "", m)) : j(m, t);
			}
			if (l === void 0) (!u || s(e, n)?.writable) && (l = p(() => /* @__PURE__ */ Lt(void 0, d)), j(l, Ut(r)), i.set(n, l));
			else {
				u = l.v !== t;
				var h = p(() => Ut(r));
				j(l, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(c, r), !u) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && j(_, v + 1);
				}
				Vt(o);
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
			xe();
		}
	});
}
var Wt, Gt, Kt, qt;
function Jt() {
	if (Wt === void 0) {
		Wt = window, Gt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Kt = s(t, "firstChild").get, qt = s(t, "nextSibling").get, d(e) && (e[le] = void 0, e[ce] = null, e[ue] = void 0, e.__e = void 0), d(n) && (n[de] = void 0);
	}
}
function Yt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Xt(e) {
	return Kt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Zt(e) {
	return qt.call(e);
}
function M(e, t) {
	if (!T) return /* @__PURE__ */ Xt(e);
	var n = /* @__PURE__ */ Xt(E);
	if (n === null) n = E.appendChild(Yt());
	else if (t && n.nodeType !== 3) {
		var r = Yt();
		return n?.before(r), Oe(r), r;
	}
	return t && rn(n), Oe(n), n;
}
function Qt(e, t = !1) {
	if (!T) {
		var n = /* @__PURE__ */ Xt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Zt(n) : n;
	}
	if (t) {
		if (E?.nodeType !== 3) {
			var r = Yt();
			return E?.before(r), Oe(r), r;
		}
		rn(E);
	}
	return E;
}
function $t(e, t = 1, n = !1) {
	let r = T ? E : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Zt(r);
	if (!T) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Yt();
			return r === null ? i?.after(a) : r.before(a), Oe(a), a;
		}
		rn(r);
	}
	return Oe(r), r;
}
function en(e) {
	e.textContent = "";
}
function tn() {
	return !1;
}
function nn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function rn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function an(e) {
	F === null && (P === null && _e(e), ge()), Mn && he(e);
}
function on(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function sn(e, t) {
	var n = F;
	n !== null && n.f & 8192 && (e |= y);
	var r = {
		ctx: Ie,
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
	A?.register_created_effect(r);
	var i = r;
	if (e & 4) St === null ? Et.ensure().schedule(r) : St.push(r);
	else if (t !== null) {
		try {
			$n(r);
		} catch (e) {
			throw Sn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= C));
	}
	if (i !== null && (i.parent = n, n !== null && on(i, n), P !== null && P.f & 2 && !(e & 64))) {
		var a = P;
		(a.effects ??= []).push(i);
	}
	return r;
}
function cn() {
	return P !== null && !Pn;
}
function ln(e) {
	let t = sn(8, null);
	return O(t, g), t.teardown = e, t;
}
function un(e) {
	an("$effect");
	var t = F.f;
	if (!P && t & 32 && Ie !== null && !Ie.i) {
		var n = Ie;
		(n.e ??= []).push(e);
	} else return dn(e);
}
function dn(e) {
	return sn(4 | ee, e);
}
function fn(e) {
	Et.ensure();
	let t = sn(64 | w, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Tn(t, () => {
			Sn(t), n(void 0);
		}) : (Sn(t), n(void 0));
	});
}
function pn(e) {
	return sn(4, e);
}
function mn(e) {
	return sn(ie | w, e);
}
function hn(e, t = 0) {
	return sn(8 | t, e);
}
function N(e, t = [], n = [], r = []) {
	rt(r, t, n, (t) => {
		sn(8, () => {
			e(...t.map(I));
		});
	});
}
function gn(e, t = 0) {
	return sn(16 | t, e);
}
function _n(e, t = 0) {
	return sn(h | t, e);
}
function vn(e) {
	return sn(32 | w, e);
}
function yn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Mn, n = P;
		Nn(!0), Fn(null);
		try {
			t.call(null);
		} finally {
			Nn(e), Fn(n);
		}
	}
}
function bn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Qe(() => {
			e.abort(fe);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Sn(n, t), n = r;
	}
}
function xn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Sn(t), t = n;
	}
}
function Sn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Cn(e.nodes.start, e.nodes.end), n = !0), e.f |= S, bn(e, t && !n), Qn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	yn(e), e.f ^= S, e.f |= b;
	var i = e.parent;
	i !== null && i.first !== null && wn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Cn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Zt(e);
		e.remove(), e = n;
	}
}
function wn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Tn(e, t, n = !0) {
	var r = [];
	En(e, r, !0);
	var i = () => {
		n && Sn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function En(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= y;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				En(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Dn(e) {
	On(e, !0);
}
function On(e, t) {
	if (e.f & 8192) {
		e.f ^= y, e.f & 1024 || (O(e, _), Et.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			On(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function kn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Zt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var An = null, jn = !1, Mn = !1;
function Nn(e) {
	Mn = e;
}
var P = null, Pn = !1;
function Fn(e) {
	P = e;
}
var F = null;
function In(e) {
	F = e;
}
var Ln = null;
function Rn(e) {
	P !== null && (Ln ??= /* @__PURE__ */ new Set()).add(e);
}
var zn = null, Bn = 0, Vn = null;
function Hn(e) {
	Vn = e;
}
var Un = 1, Wn = 0, Gn = Wn;
function Kn(e) {
	Gn = e;
}
function qn() {
	return ++Un;
}
function Jn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~ne), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Jn(a) && pt(a), a.wv > e.wv) return !0;
		}
		t & 512 && vt === null && O(e, g);
	}
	return !1;
}
function Yn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Ln !== null && Ln.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Yn(a, t, !1) : t === a && (n ? O(a, _) : a.f & 1024 && O(a, v), At(a));
	}
}
function Xn(e) {
	var t = zn, n = Bn, r = Vn, i = P, a = Ln, o = Ie, s = Pn, c = Gn, l = e.f;
	zn = null, Bn = 0, Vn = null, P = l & 96 ? null : e, Ln = null, Le(e.ctx), Pn = !1, Gn = ++Wn, e.ac !== null && (Qe(() => {
		e.ac.abort(fe);
	}), e.ac = null);
	try {
		e.f |= re;
		var u = e.fn, d = u();
		e.f |= x;
		var f = e.deps, p = A?.is_fork;
		if (zn !== null) {
			var m;
			if (p || Qn(e, Bn), f !== null && Bn > 0) for (f.length = Bn + zn.length, m = 0; m < zn.length; m++) f[Bn + m] = zn[m];
			else e.deps = f = zn;
			if (cn() && e.f & 512) for (m = Bn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Bn < f.length && (Qn(e, Bn), f.length = Bn);
		if (Be() && Vn !== null && !Pn && f !== null && !(e.f & 6146)) for (m = 0; m < Vn.length; m++) Yn(Vn[m], e);
		if (i !== null && i !== e) {
			if (Wn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Wn;
			if (t !== null) for (let e of t) e.rv = Wn;
			Vn !== null && (r === null ? r = Vn : r.push(...Vn));
		}
		return e.f & 8388608 && (e.f ^= ae), d;
	} catch (e) {
		return We(e);
	} finally {
		e.f ^= re, zn = t, Bn = n, Vn = r, P = i, Ln = a, Le(o), Pn = s, Gn = c;
	}
}
function Zn(e, n) {
	let a = n.reactions;
	if (a !== null) {
		var o = r.call(a, e);
		if (o !== -1) {
			var s = a.length - 1;
			s === 0 ? a = n.reactions = null : (a[o] = a[s], a.pop());
		}
	}
	if (a === null && n.f & 2 && (zn === null || !i.call(zn, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~ne), c.v !== t && qe(c), c.ac !== null && Qe(() => {
			c.ac.abort(fe), c.ac = null, O(c, _);
		}), mt(c), Qn(c, 0);
	}
}
function Qn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Zn(e, n[r]);
}
function $n(e) {
	var t = e.f;
	if (!(t & 16384)) {
		O(e, g);
		var n = F, r = jn;
		F = e, jn = !(t & 96);
		try {
			t & 16777232 ? xn(e) : bn(e), yn(e);
			var i = Xn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Un;
		} finally {
			jn = r, F = n;
		}
	}
}
function I(e) {
	var t = !!(e.f & 2);
	if (An?.add(e), P !== null && !Pn && !(F !== null && F.f & 16384) && (Ln === null || !Ln.has(e))) {
		var n = P.deps;
		if (P.f & 2097152) e.rv < Wn && (e.rv = Wn, zn === null && n !== null && n[Bn] === e ? Bn++ : zn === null ? zn = [e] : zn.push(e));
		else {
			P.deps ??= [], i.call(P.deps, e) || P.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [P] : i.call(r, P) || r.push(P);
		}
	}
	if (Mn && Pt.has(e)) return Pt.get(e);
	if (t) {
		var a = e;
		if (Mn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || tr(a)) && (o = ft(a)), Pt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Pn && P !== null && (jn || !!(P.f & 512)), c = (a.f & x) === 0;
		Jn(a) && (s && (a.f |= 512), pt(a)), s && !c && (ht(a), er(a));
	}
	if (vt?.has(e)) return vt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function er(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (ht(t), er(t));
}
function tr(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Pt.has(t) || t.f & 2 && tr(t)) return !0;
	return !1;
}
function nr(e) {
	var t = Pn;
	try {
		return Pn = !0, e();
	} finally {
		Pn = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var rr = Symbol("events"), ir = /* @__PURE__ */ new Set(), ar = /* @__PURE__ */ new Set();
function or(e, t, n) {
	(t[rr] ??= {})[e] = n;
}
function sr(e) {
	for (var t = 0; t < e.length; t++) ir.add(e[t]);
	for (var n of ar) n(e);
}
var cr = null;
function lr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	cr = e;
	var s = 0, c = cr === e && e[rr];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[rr] = t;
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
		Fn(null), In(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[rr]?.[r];
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
			e[rr] = t, delete e.currentTarget, Fn(d), In(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var ur = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function dr(e) {
	return ur?.createHTML(e) ?? e;
}
function fr(e) {
	var t = nn("template");
	return t.innerHTML = dr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function pr(e, t) {
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
		if (T) return pr(E, null), E;
		i === void 0 && (i = fr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Xt(i)));
		var t = r || Gt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Xt(t), s = t.lastChild;
			pr(o, s);
		} else pr(t, t);
		return t;
	};
}
function mr() {
	if (T) return pr(E, null), E;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = Yt();
	return e.append(t, n), pr(t, n), e;
}
function R(e, t) {
	if (T) {
		var n = F;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = E), ke();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var hr = ["touchstart", "touchmove"];
function gr(e) {
	return hr.includes(e);
}
function _r(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[de] ??= e.nodeValue) && (e[de] = n, e.nodeValue = `${n}`);
}
function vr(e, t) {
	return br(e, t);
}
var yr = /* @__PURE__ */ new Map();
function br(t, { target: n, anchor: r, props: i = {}, events: o, context: s, intro: c = !0, transformError: l }) {
	Jt();
	var u = void 0, d = fn(() => {
		var c = r ?? n.appendChild(Yt());
		tt(c, { pending: () => {} }, (n) => {
			Re({});
			var r = Ie;
			if (s && (r.c = s), o && (i.$$events = o), T && pr(n, null), u = t(n, i) || {}, T && (F.nodes.end = E, E === null || E.nodeType !== 8 || E.data !== "]")) throw Te(), e;
			ze();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = gr(r);
					for (let e of [n, document]) {
						var a = yr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), yr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, lr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(a(ir)), ar.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = yr.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, lr), t.delete(e), t.size === 0 && yr.delete(r)) : t.set(e, i);
			}
			ar.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return xr.set(u, d), u;
}
var xr = /* @__PURE__ */ new WeakMap();
function Sr(e, t) {
	let n = xr.get(e);
	return n ? (xr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Cr = class {
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
			if (n) Dn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Dn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Sn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						kn(r, t), t.append(Yt()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Sn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Tn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Sn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = A, r = tn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = Yt();
				i.append(a), this.#n.set(e, {
					effect: vn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, vn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else T && (this.anchor = E), this.#a(n);
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function wr(e, t, ...n) {
	var r = new Cr(e);
	gn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, C);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/if.js
function Tr(e, t, n = !1) {
	var r;
	T && (r = E, ke());
	var i = new Cr(e), a = n ? C : 0;
	function o(e, t) {
		if (T) {
			var n = Me(r);
			if (e !== parseInt(n.substring(1))) {
				var a = je();
				Oe(a), i.anchor = a, De(!1), i.ensure(e, t), De(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	gn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function Er(e, t) {
	return t;
}
function Dr(e, t, n) {
	for (var r = [], i = t.length, o, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		Tn(n, () => {
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
			en(d), d.append(u), e.items.clear();
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
		r?.has(a) ? (a.f |= te, kn(a, document.createDocumentFragment())) : Sn(t[i], n);
	}
}
var kr;
function Ar(e, t, r, i, o, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = T ? Oe(/* @__PURE__ */ Xt(u)) : u.appendChild(Yt());
	}
	T && ke();
	var d = null, f = /* @__PURE__ */ ut(() => {
		var e = r();
		return n(e) ? e : e == null ? [] : a(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Mr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= te, Pr(d, null, c)) : Dn(d) : Tn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: gn(() => {
			p = I(f);
			var e = p.length;
			let n = !1;
			T && Me(c) === "[!" != (e === 0) && (c = je(), Oe(c), De(!1), n = !0);
			for (var a = /* @__PURE__ */ new Set(), u = A, v = tn(), y = 0; y < e; y += 1) {
				T && E.nodeType === 8 && E.data === "]" && (c = E, n = !0, De(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && zt(S.v, b), S.i && zt(S.i, y), v && u.unskip_effect(S.e)) : (S = Nr(l, h ? c : kr ??= Yt(), b, x, y, o, t, r), h || (S.e.f |= te), l.set(x, S)), a.add(x);
			}
			if (e === 0 && s && !d && (h ? d = vn(() => s(c)) : (d = vn(() => s(kr ??= Yt())), d.f |= te)), e > a.size && me("", "", ""), T && e > 0 && Oe(je()), !h) {
				if (m.set(u, a), v) {
					for (let [e, t] of l) a.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			n && De(!0), I(f);
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
		if (_.f & 8192 && (Dn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
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
	o && Ue(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Nr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? It(n) : /* @__PURE__ */ Rt(n, !1, !1) : null, l = o & 2 ? It(i) : null;
	return {
		v: c,
		i: l,
		e: vn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Pr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Zt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Fr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function Ir(e, t) {
	var n = void 0, r;
	_n(() => {
		n !== (n = t()) && (r &&= (Sn(r), null), n && (r = vn(() => {
			pn(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
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
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
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
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
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
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/style.js
function Ur(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function z(e, t, n, r) {
	var i = e[ue];
	if (T || i !== t) {
		var a = Vr(t, r);
		(!T || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ue] = t;
	} else r && (Array.isArray(r) ? (Ur(e, n?.[0], r[0]), Ur(e, n?.[1], r[1], "important")) : Ur(e, n, r));
	return r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Wr(e, t) {
	return e === t || e?.[oe] === t;
}
function Gr(e = {}, t, n, r) {
	var i = Ie.r, a = F;
	return pn(() => {
		var o, s;
		return hn(() => {
			o = s, s = r?.() || [], nr(() => {
				Wr(n(...s), e) || (t(e, ...s), o && Wr(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Wr(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/props.js
function Kr(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), c = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ st(r), I(u)) : (l && (l = !1, c = o ? nr(r) : r), c);
	let f;
	if (a) {
		var p = oe in e || se in e;
		f = s(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = Ze(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ye(t), f(m)));
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
	var v = !1, y = (n & 1 ? st : ut)(() => (v = !1, g()));
	a && I(y);
	var b = F;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? I(y) : i && a ? Ut(e) : e;
			return j(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Mn && v || b.f & 16384 ? y.v : I(y);
	});
}
var qr = [
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
], Jr = qr.map(([e, t]) => ({
	background: e,
	foreground: t
})), Yr = /\s+/g;
function Xr(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = t * 31 + e.charCodeAt(n) | 0;
	return t;
}
function Zr(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(Yr, " ");
}
function Qr(e) {
	return qr[Math.abs(Xr(e) % qr.length)] ?? qr[0];
}
var $r = new Map(Jr.map((e, t) => [e.background.toLowerCase(), t]));
function ei(e) {
	return $r.get(e.trim().toLowerCase()) ?? null;
}
function ti(e, t = Jr) {
	let n = e.name ? Zr(e.name) : "", r = ei(e.color || (n ? Qr(n)[0] : ""));
	if (r == null || t.length === 0) {
		if (n) {
			let [t, r] = Qr(n);
			return {
				background: e.color || t,
				foreground: e.textColor || r
			};
		}
		return {
			background: e.color || "#EADDFF",
			foreground: e.textColor || "#21005D"
		};
	}
	return t[r % t.length];
}
function ni(e, t = Jr) {
	if (t.length === 0) return /* @__PURE__ */ new Map();
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Zr(t.name), r = ei(t.color || Qr(e)[0]);
		r != null && (n.has(e) || n.set(e, {
			name: e,
			slot: r,
			hash: Xr(e)
		}));
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
function ri(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function ii(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function ai(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function oi(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function si(e, t) {
	return oi(e, t * 7);
}
function ci(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function li(e, t) {
	return e.getTime() < t.getTime();
}
function ui(e) {
	return ii(ai(ri(e)));
}
function di(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region packages/core/src/engine/calendar.ts
var fi = class {
	normalizeTermStartDate(e, t) {
		let n = ri(ui(t));
		if (!e || !e.trim()) return ii(ai(n));
		try {
			return ii(ai(ri(e)));
		} catch {
			return ii(ai(this.inferTermStartDateFromTermName(e) || n));
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
		}, r = ri(this.normalizeTermStartDate(n.termStartDate, e)), i = ri(e);
		if (li(i, r)) return n.startWeek;
		let a = ci(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return ii(si(ri(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return ii(oi(ri(this.resolveWeekStart(e, t, r)), n - 1));
	}
}, pi = {
	termStartDate: "",
	startWeek: 1,
	endWeek: 20,
	periodTimes: []
};
function mi(e) {
	let [, t, n] = e.split("-");
	return `${Number(t)}/${Number(n)}`;
}
function hi(e, t, n, r, i = new fi()) {
	let a = e ?? pi, o = i.resolveWeekStart(a, t, n), s = 5;
	r?.showSunday ? s = 7 : r?.showSaturday && (s = 6);
	let c = oi(ri(o), s - 1);
	return `${mi(o)} - ${mi(ii(c))}`;
}
//#endregion
//#region packages/core/src/engine/slot-key.ts
function gi(e, t, n) {
	return `${e}:${t}:${n}`;
}
function _i(e) {
	return gi(e.dayOfWeek, e.startPeriod, e.endPeriod);
}
//#endregion
//#region packages/core/src/engine/grid.ts
function vi(e) {
	let t = [
		1,
		2,
		3,
		4,
		5
	];
	return e.viewPrefs.showSaturday && t.push(6), e.viewPrefs.showSunday && t.push(7), t;
}
function yi(e) {
	let t = e[0] ? Number(e[0].slice(5, 7)) : 0, n = e[e.length - 1] ? Number(e[e.length - 1].slice(5, 7)) : 0;
	return t ? t === n ? String(t) : `${t}/${n}` : "";
}
function bi(e, t, n = []) {
	let r = /* @__PURE__ */ new Map();
	for (let t of e) r.set(t.index, t);
	return Array.from({ length: t }, (e, t) => {
		let i = t + 1;
		return r.get(i) ?? n[t] ?? {
			index: i,
			startTime: "--:--",
			endTime: "--:--"
		};
	});
}
function xi(e, t, n, r) {
	let i = r?.academicCalendarService ?? new fi(), a = vi(n), o = ri(i.resolveWeekStart(n.academicConfig, t, e)), s = a.map((t) => {
		let n = ii(oi(o, t - 1));
		return {
			dayOfWeek: t,
			date: n,
			isToday: n === e
		};
	}), c = Math.max(10, n.academicConfig.periodTimes.length, ...n.courses.map((e) => e.endPeriod), 0);
	return {
		monthLabel: yi(s.map((e) => e.date)),
		visibleDays: s,
		periods: bi(n.academicConfig.periodTimes, c, r?.defaultPeriods),
		displayedPeriodCount: c
	};
}
//#endregion
//#region packages/core/src/engine/display-models.ts
function Si(e, t) {
	return e.nextWeek === t.nextWeek ? e.originalIndex < t.originalIndex : e.nextWeek < t.nextWeek;
}
function Ci(e, t, n) {
	let r = [], i = [];
	for (let a = 0; a < e.courses.length; a += 1) {
		let o = e.courses[a];
		t.has(o.dayOfWeek) && (o.weeks.length === 0 || o.weeks.includes(n) ? r.push({
			course: {
				...o,
				weeks: [...o.weeks]
			},
			isInDisplayedWeek: !0
		}) : i.push({
			course: o,
			originalIndex: a
		}));
	}
	if (!e.viewPrefs.showNonCurrentWeekCourses) return r;
	let a = new Set(r.map((e) => _i(e.course))), o = /* @__PURE__ */ new Map();
	for (let { course: e, originalIndex: t } of i) {
		let r = Infinity;
		for (let t of e.weeks) t >= n && t < r && (r = t);
		if (!Number.isFinite(r)) continue;
		let i = _i(e);
		if (a.has(i)) continue;
		let s = {
			course: e,
			nextWeek: r,
			originalIndex: t
		}, c = o.get(i);
		(!c || Si(s, c)) && o.set(i, s);
	}
	let s = [...o.values()].sort((e, t) => e.originalIndex - t.originalIndex).map((e) => ({
		course: {
			...e.course,
			weeks: [...e.course.weeks]
		},
		isInDisplayedWeek: !1
	}));
	return [...r, ...s];
}
//#endregion
//#region packages/core/src/engine/capsule-layout.ts
var wi = "非本周", Ti = 70, Ei = 2, Di = 1, Oi = 1, ki = 12, Ai = 8, ji = 8, Mi = 1.25, Ni = 2, Pi = [
	[50, 12],
	[70, 14],
	[85, 15],
	[110, 17]
], Fi = [
	[50, 8],
	[70, 10],
	[85, 11],
	[110, 12]
], Ii = [
	[50, 8],
	[70, 9],
	[85, 10],
	[110, 12]
];
function Li(e) {
	let { courseDisplayModels: t, visibleDays: n, columnWidthPx: r, expandedSlotKeys: i, layoutMode: a = "fixed", coursePalette: o = Jr, paletteCourses: s, capsuleCornerStyle: c = "rounded" } = e, l = a === "compact", u = n.length;
	if (u === 0) return [];
	let d = ni(s ?? t.map((e) => e.course), o), f = new Map(n.map((e, t) => [e.dayOfWeek, t])), p = 100 / u, m = [];
	for (let e of Xi(t)) {
		let t = gi(e.dayOfWeek, e.startPeriod, e.endPeriod), n = e.courses.length, a = (f.get(e.dayOfWeek) ?? 0) * p;
		if (n === 1) {
			let n = e.courses[0];
			m.push(Ri({
				displayModel: n,
				columnLeft: a,
				widthPercent: p,
				columnWidthPx: r,
				overlapCount: 1,
				coursePalette: o,
				paletteByName: d,
				compact: l,
				key: `${t}:${n.course.id}`
			}));
			continue;
		}
		if (!i.has(t)) {
			let i = Yi(r, 1, l);
			m.push({
				kind: "overlap-placeholder",
				key: t,
				geometry: {
					leftPercent: a,
					widthPercent: p,
					startPeriod: e.startPeriod,
					endPeriod: e.endPeriod
				},
				count: n,
				placeholderPx: i.placeholderPx,
				corners: zi
			});
			continue;
		}
		let s = p / n;
		e.courses.forEach((e, i) => {
			m.push(Ri({
				displayModel: e,
				columnLeft: a + s * i,
				widthPercent: s,
				columnWidthPx: r,
				overlapCount: n,
				coursePalette: o,
				paletteByName: d,
				compact: l,
				key: `${t}:${e.course.id}`
			}));
		});
	}
	return c === "pill" ? Ui(m) : c === "sharp" && Vi(m), m;
}
function Ri(e) {
	let { displayModel: t, columnLeft: n, widthPercent: r, columnWidthPx: i, overlapCount: a, coursePalette: o, paletteByName: s, compact: c, key: l } = e, u = t.course, d = qi(i, a), f = Qi(u.location, { includeCampus: d }), p = Yi(i, a, c), m = Ji(p.detailPx, d, f.length);
	return {
		kind: "course",
		key: l,
		course: u,
		displayModel: t,
		geometry: {
			leftPercent: n,
			widthPercent: r,
			startPeriod: u.startPeriod,
			endPeriod: u.endPeriod
		},
		colors: ea(u, o, s),
		scale: p,
		locationLines: f,
		locationMetrics: m,
		teacher: u.teacher.trim(),
		badgeLabel: t.isInDisplayedWeek ? null : wi,
		overlapCount: a,
		corners: zi
	};
}
var zi = {
	topLeft: !0,
	topRight: !0,
	bottomLeft: !0,
	bottomRight: !0
}, Bi = {
	topLeft: !1,
	topRight: !1,
	bottomLeft: !1,
	bottomRight: !1
};
function Vi(e) {
	for (let t of e) t.corners = Bi;
}
var Hi = .001;
function Ui(e) {
	let t = e.length;
	if (t <= 1) {
		t === 1 && (e[0].corners = zi);
		return;
	}
	for (let n = 0; n < t; n += 1) {
		let r = e[n], { leftPercent: i, widthPercent: a, startPeriod: o, endPeriod: s } = r.geometry, c = i + a, l = !0, u = !0, d = !0, f = !0;
		for (let r = 0; r < t; r += 1) {
			if (n === r) continue;
			let { leftPercent: t, widthPercent: a, startPeriod: p, endPeriod: m } = e[r].geometry, h = t + a;
			if (!(h < i - Hi || t > c + Hi) && (Wi(i, c, t, h) && (m + 1 === o && (l = !1), p === s + 1 && (u = !1)), Gi(o, s, p, m) && (Ki(h, i) && (d = !1), Ki(c, t) && (f = !1)), !l && !u && !d && !f)) break;
		}
		r.corners = {
			topLeft: l && d,
			topRight: l && f,
			bottomLeft: u && d,
			bottomRight: u && f
		};
	}
}
function Wi(e, t, n, r) {
	return Math.max(e, n) < Math.min(t, r) - Hi;
}
function Gi(e, t, n, r) {
	return e <= r && n <= t;
}
function Ki(e, t) {
	return Math.abs(e - t) < Hi;
}
function qi(e, t = 1) {
	return Math.max(0, e) / Math.max(1, t) >= Ti;
}
function Ji(e, t, n) {
	let r = t ? Math.min(Math.max(n, 1), 3) : 3;
	return {
		fontPx: ia(t ? e : e + Ni),
		heightPx: r * e * Mi
	};
}
function Yi(e, t = 1, n = !1) {
	let r = Math.max(0, e) / Math.max(1, t), i = ia(ra(r, Pi)), a = ia(ra(r, Fi)), o = ia(ra(r, Ii));
	n && (i = Math.max(ki, ia(i - Ei)), a = Math.max(Ai, ia(a - Di)), o = Math.max(ji, ia(o - Oi)));
	let s = ia(Math.max(11, i - 1));
	return {
		titlePx: i,
		detailPx: a,
		badgePx: o,
		placeholderPx: s
	};
}
function Xi(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.course.dayOfWeek, r = t.get(e);
		r ? r.push(n) : t.set(e, [n]);
	}
	return [...t.entries()].sort(([e], [t]) => e - t).flatMap(([, e]) => ta(e));
}
function Zi(e) {
	let t = e.trim().split(/\s+/).filter(Boolean), n = [], r = [];
	for (let e of t) e.endsWith("校区") ? n.push(e) : r.push(e);
	let i = n.join(""), a = r.join("");
	if (!a) return {
		campus: i,
		building: "",
		room: ""
	};
	let o = a.match(/^(.*?)([A-Za-z]+[0-9][A-Za-z0-9]*|[0-9]+[A-Za-z0-9]*)$/);
	return o ? {
		campus: i,
		building: o[1] ?? "",
		room: o[2] ?? ""
	} : {
		campus: i,
		building: a,
		room: ""
	};
}
function Qi(e, t) {
	let { campus: n, building: r, room: i } = Zi(e);
	return (t?.includeCampus === !1 ? [r, i] : [
		n,
		r,
		i
	]).filter((e) => e.length > 0);
}
function $i(e) {
	let t = e.trim();
	return /^#[0-9A-Fa-f]{6}$/.test(t) ? t : "#EADDFF";
}
function ea(e, t, n) {
	let r = n.get(Zr(e.name)) ?? ti(e, t);
	return {
		background: $i(r.background),
		text: $i(r.foreground)
	};
}
function ta(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e.course.startPeriod - t.course.startPeriod || e.course.endPeriod - t.course.endPeriod || e.course.name.localeCompare(t.course.name)), n = [], r = [], i = 0;
	for (let e of t) {
		let t = e.course;
		r.length === 0 || t.startPeriod <= i ? (r.push(e), i = Math.max(i, t.endPeriod)) : (n.push(na(r, i)), r = [e], i = t.endPeriod);
	}
	return r.length > 0 && n.push(na(r, i)), n;
}
function na(e, t) {
	let n = e[0];
	return {
		dayOfWeek: n.course.dayOfWeek,
		startPeriod: n.course.startPeriod,
		endPeriod: t,
		courses: e
	};
}
function ra(e, t) {
	let n = t[0], r = t[t.length - 1];
	if (e <= n[0]) return n[1];
	if (e >= r[0]) return r[1];
	for (let n = 1; n < t.length; n += 1) {
		let [r, i] = t[n - 1], [a, o] = t[n];
		if (e <= a) return i + (e - r) / (a - r) * (o - i);
	}
	return r[1];
}
function ia(e) {
	return Math.round(e * 10) / 10;
}
//#endregion
//#region packages/core/src/engine/timetable-layout.ts
function aa(e) {
	let { timetable: t, displayedWeek: n, todayIso: r, columnWidthPx: i = 0, expandedSlotKeys: a = /* @__PURE__ */ new Set(), layoutMode: o = "fixed", capsuleCornerStyle: s = "rounded", coursePalette: c = Jr, paletteCourses: l, academicCalendarService: u = new fi() } = e, d = u.calculateAcademicWeek(r, t.academicConfig), f = n === d, p = xi(r, n, t, { academicCalendarService: u }), m = Ci(t, new Set(p.visibleDays.map((e) => e.dayOfWeek)), n);
	return {
		gridModel: p,
		courseDisplayModels: m,
		placements: Li({
			courseDisplayModels: m,
			visibleDays: p.visibleDays,
			columnWidthPx: i,
			expandedSlotKeys: a,
			layoutMode: o,
			capsuleCornerStyle: s,
			coursePalette: c,
			paletteCourses: l
		}),
		weekRangeText: hi(t.academicConfig, n, r, t.viewPrefs, u),
		isCurrentWeek: f,
		academicWeek: d
	};
}
//#endregion
//#region packages/core/src/engine/period-clock.ts
function oa(e) {
	let t = /^(\d{1,2}):(\d{2})$/.exec(e.trim());
	return t ? Number(t[1]) * 60 + Number(t[2]) : 0;
}
function sa(e) {
	return e.map((e) => ({
		index: e.index,
		startMinutes: oa(e.startTime),
		endMinutes: oa(e.endTime)
	})).sort((e, t) => e.index - t.index);
}
function ca(e) {
	return e.getHours() * 60 + e.getMinutes();
}
function la(e, t, n = "upcomingOrLast") {
	let r = null;
	for (let n of e) {
		if (t >= n.startMinutes && t <= n.endMinutes) return n.index;
		r == null && t < n.startMinutes && (r = n.index);
	}
	return n === "none" ? null : r ?? e.at(-1)?.index ?? null;
}
//#endregion
//#region packages/core/src/schema/schema.ts
function ua(e) {
	return e;
}
//#endregion
//#region packages/core/src/types/services.ts
function da(e) {
	return { key: e };
}
var fa = da("storage"), pa = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.onSurface,color.primary,color.onPrimary,color.surfaceVariant,color.outline,color.secondary,color.onSecondary,color.primaryContainer,color.onPrimaryContainer,color.secondaryContainer,color.onSecondaryContainer,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
function ma(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) typeof r == "string" && r.length > 0 && (t[`color.${n}`] = r);
	return t;
}
function ha(e, t) {
	return {
		light: ma(e),
		dark: ma(t)
	};
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/math_utils.js
function ga(e) {
	return e < 0 ? -1 : e === 0 ? 0 : 1;
}
function _a(e, t, n) {
	return (1 - n) * e + n * t;
}
function va(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function B(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function ya(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function ba(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function xa(e, t) {
	return 180 - Math.abs(Math.abs(e - t) - 180);
}
function Sa(e, t) {
	return [
		e[0] * t[0][0] + e[1] * t[0][1] + e[2] * t[0][2],
		e[0] * t[1][0] + e[1] * t[1][1] + e[2] * t[1][2],
		e[0] * t[2][0] + e[1] * t[2][1] + e[2] * t[2][2]
	];
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/color_utils.js
var Ca = [
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
], wa = [
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
], Ta = [
	95.047,
	100,
	108.883
];
function Ea(e, t, n) {
	return (255 << 24 | (e & 255) << 16 | (t & 255) << 8 | n & 255) >>> 0;
}
function Da(e) {
	return Ea(Va(e[0]), Va(e[1]), Va(e[2]));
}
function Oa(e) {
	return e >> 24 & 255;
}
function ka(e) {
	return e >> 16 & 255;
}
function Aa(e) {
	return e >> 8 & 255;
}
function ja(e) {
	return e & 255;
}
function Ma(e, t, n) {
	let r = wa, i = r[0][0] * e + r[0][1] * t + r[0][2] * n, a = r[1][0] * e + r[1][1] * t + r[1][2] * n, o = r[2][0] * e + r[2][1] * t + r[2][2] * n;
	return Ea(Va(i), Va(a), Va(o));
}
function Na(e) {
	return Sa([
		Ba(ka(e)),
		Ba(Aa(e)),
		Ba(ja(e))
	], Ca);
}
function Pa(e, t, n) {
	let r = Ta, i = (e + 16) / 116, a = t / 500 + i, o = i - n / 200, s = Wa(a), c = Wa(i), l = Wa(o);
	return Ma(s * r[0], c * r[1], l * r[2]);
}
function Fa(e) {
	let t = Ba(ka(e)), n = Ba(Aa(e)), r = Ba(ja(e)), i = Ca, a = i[0][0] * t + i[0][1] * n + i[0][2] * r, o = i[1][0] * t + i[1][1] * n + i[1][2] * r, s = i[2][0] * t + i[2][1] * n + i[2][2] * r, c = Ta, l = a / c[0], u = o / c[1], d = s / c[2], f = Ua(l), p = Ua(u), m = Ua(d);
	return [
		116 * p - 16,
		500 * (f - p),
		200 * (p - m)
	];
}
function Ia(e) {
	let t = Va(Ra(e));
	return Ea(t, t, t);
}
function La(e) {
	let t = Na(e)[1];
	return 116 * Ua(t / 100) - 16;
}
function Ra(e) {
	return 100 * Wa((e + 16) / 116);
}
function za(e) {
	return Ua(e / 100) * 116 - 16;
}
function Ba(e) {
	let t = e / 255;
	return t <= .040449936 ? t / 12.92 * 100 : ((t + .055) / 1.055) ** 2.4 * 100;
}
function Va(e) {
	let t = e / 100, n = 0;
	return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, va(0, 255, Math.round(n * 255));
}
function Ha() {
	return Ta;
}
function Ua(e) {
	return e > .008856451679035631 ? e ** (1 / 3) : (903.2962962962963 * e + 16) / 116;
}
function Wa(e) {
	let t = e * e * e;
	return t > .008856451679035631 ? t : (116 * e - 16) / 903.2962962962963;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/viewing_conditions.js
var Ga = class e {
	static make(t = Ha(), n = 200 / Math.PI * Ra(50) / 100, r = 50, i = 2, a = !1) {
		let o = t, s = o[0] * .401288 + o[1] * .650173 + o[2] * -.051461, c = o[0] * -.250268 + o[1] * 1.204414 + o[2] * .045854, l = o[0] * -.002079 + o[1] * .048952 + o[2] * .953127, u = .8 + i / 10, d = u >= .9 ? _a(.59, .69, (u - .9) * 10) : _a(.525, .59, (u - .8) * 10), f = a ? 1 : u * (1 - 1 / 3.6 * Math.exp((-n - 42) / 92));
		f = f > 1 ? 1 : f < 0 ? 0 : f;
		let p = u, m = [
			100 / s * f + 1 - f,
			100 / c * f + 1 - f,
			100 / l * f + 1 - f
		], h = 1 / (5 * n + 1), g = h * h * h * h, _ = 1 - g, v = g * n + .1 * _ * _ * Math.cbrt(5 * n), y = Ra(r) / t[1], b = 1.48 + Math.sqrt(y), x = .725 / y ** .2, S = x, C = [
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
Ga.DEFAULT = Ga.make();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/cam16.js
var Ka = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.hue = e, this.chroma = t, this.j = n, this.q = r, this.m = i, this.s = a, this.jstar = o, this.astar = s, this.bstar = c;
	}
	distance(e) {
		let t = this.jstar - e.jstar, n = this.astar - e.astar, r = this.bstar - e.bstar;
		return 1.41 * Math.sqrt(t * t + n * n + r * r) ** .63;
	}
	static fromInt(t) {
		return e.fromIntInViewingConditions(t, Ga.DEFAULT);
	}
	static fromIntInViewingConditions(t, n) {
		let r = (t & 16711680) >> 16, i = (t & 65280) >> 8, a = t & 255, o = Ba(r), s = Ba(i), c = Ba(a), l = .41233895 * o + .35762064 * s + .18051042 * c, u = .2126 * o + .7152 * s + .0722 * c, d = .01932141 * o + .11916382 * s + .95034478 * c, f = .401288 * l + .650173 * u - .051461 * d, p = -.250268 * l + 1.204414 * u + .045854 * d, m = -.002079 * l + .048952 * u + .953127 * d, h = n.rgbD[0] * f, g = n.rgbD[1] * p, _ = n.rgbD[2] * m, v = (n.fl * Math.abs(h) / 100) ** .42, y = (n.fl * Math.abs(g) / 100) ** .42, b = (n.fl * Math.abs(_) / 100) ** .42, x = ga(h) * 400 * v / (v + 27.13), S = ga(g) * 400 * y / (y + 27.13), C = ga(_) * 400 * b / (b + 27.13), w = (11 * x + -12 * S + C) / 11, ee = (x + S - 2 * C) / 9, te = (20 * x + 20 * S + 21 * C) / 20, ne = (40 * x + 20 * S + C) / 20, re = ba(Math.atan2(ee, w) * 180 / Math.PI), ie = re * Math.PI / 180, ae = 100 * (ne * n.nbb / n.aw) ** +(n.c * n.z), oe = 4 / n.c * Math.sqrt(ae / 100) * (n.aw + 4) * n.fLRoot, se = re < 20.14 ? re + 360 : re, ce = (5e4 / 13 * (.25 * (Math.cos(se * Math.PI / 180 + 2) + 3.8)) * n.nc * n.ncb * Math.sqrt(w * w + ee * ee) / (te + .305)) ** .9 * (1.64 - .29 ** n.n) ** .73, le = ce * Math.sqrt(ae / 100), ue = le * n.fLRoot, de = 50 * Math.sqrt(ce * n.c / (n.aw + 4)), fe = (1 + 100 * .007) * ae / (1 + .007 * ae), pe = 1 / .0228 * Math.log(1 + .0228 * ue), me = pe * Math.cos(ie), he = pe * Math.sin(ie);
		return new e(re, le, ae, oe, ue, de, fe, me, he);
	}
	static fromJch(t, n, r) {
		return e.fromJchInViewingConditions(t, n, r, Ga.DEFAULT);
	}
	static fromJchInViewingConditions(t, n, r, i) {
		let a = 4 / i.c * Math.sqrt(t / 100) * (i.aw + 4) * i.fLRoot, o = n * i.fLRoot, s = n / Math.sqrt(t / 100), c = 50 * Math.sqrt(s * i.c / (i.aw + 4)), l = r * Math.PI / 180, u = (1 + 100 * .007) * t / (1 + .007 * t), d = 1 / .0228 * Math.log(1 + .0228 * o), f = d * Math.cos(l), p = d * Math.sin(l);
		return new e(r, n, t, a, o, c, u, f, p);
	}
	static fromUcs(t, n, r) {
		return e.fromUcsInViewingConditions(t, n, r, Ga.DEFAULT);
	}
	static fromUcsInViewingConditions(t, n, r, i) {
		let a = n, o = r, s = Math.sqrt(a * a + o * o), c = (Math.exp(s * .0228) - 1) / .0228 / i.fLRoot, l = 180 / Math.PI * Math.atan2(o, a);
		l < 0 && (l += 360);
		let u = t / (1 - (t - 100) * .007);
		return e.fromJchInViewingConditions(u, c, l, i);
	}
	toInt() {
		return this.viewed(Ga.DEFAULT);
	}
	viewed(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = ga(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = ga(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = ga(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return Ma(1.86206786 * x - 1.01125463 * S + .14918677 * C, .38752654 * x + .62144744 * S - .00897398 * C, -.0158415 * x - .03412294 * S + 1.04996444 * C);
	}
	static fromXyzInViewingConditions(t, n, r, i) {
		let a = .401288 * t + .650173 * n - .051461 * r, o = -.250268 * t + 1.204414 * n + .045854 * r, s = -.002079 * t + .048952 * n + .953127 * r, c = i.rgbD[0] * a, l = i.rgbD[1] * o, u = i.rgbD[2] * s, d = (i.fl * Math.abs(c) / 100) ** .42, f = (i.fl * Math.abs(l) / 100) ** .42, p = (i.fl * Math.abs(u) / 100) ** .42, m = ga(c) * 400 * d / (d + 27.13), h = ga(l) * 400 * f / (f + 27.13), g = ga(u) * 400 * p / (p + 27.13), _ = (11 * m + -12 * h + g) / 11, v = (m + h - 2 * g) / 9, y = (20 * m + 20 * h + 21 * g) / 20, b = (40 * m + 20 * h + g) / 20, x = Math.atan2(v, _) * 180 / Math.PI, S = x < 0 ? x + 360 : x >= 360 ? x - 360 : x, C = S * Math.PI / 180, w = 100 * (b * i.nbb / i.aw) ** +(i.c * i.z), ee = 4 / i.c * Math.sqrt(w / 100) * (i.aw + 4) * i.fLRoot, te = S < 20.14 ? S + 360 : S, ne = (5e4 / 13 * (1 / 4 * (Math.cos(te * Math.PI / 180 + 2) + 3.8)) * i.nc * i.ncb * Math.sqrt(_ * _ + v * v) / (y + .305)) ** .9 * (1.64 - .29 ** i.n) ** .73, re = ne * Math.sqrt(w / 100), ie = re * i.fLRoot, ae = 50 * Math.sqrt(ne * i.c / (i.aw + 4)), oe = (1 + 100 * .007) * w / (1 + .007 * w), se = Math.log(1 + .0228 * ie) / .0228, ce = se * Math.cos(C), le = se * Math.sin(C);
		return new e(S, re, w, ee, ie, ae, oe, ce, le);
	}
	xyzInViewingConditions(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = ga(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = ga(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = ga(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return [
			1.86206786 * x - 1.01125463 * S + .14918677 * C,
			.38752654 * x + .62144744 * S - .00897398 * C,
			-.0158415 * x - .03412294 * S + 1.04996444 * C
		];
	}
}, qa = class e {
	static sanitizeRadians(e) {
		return (e + Math.PI * 8) % (Math.PI * 2);
	}
	static trueDelinearized(e) {
		let t = e / 100, n = 0;
		return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, n * 255;
	}
	static chromaticAdaptation(e) {
		let t = Math.abs(e) ** .42;
		return ga(e) * 400 * t / (t + 27.13);
	}
	static hueOf(t) {
		let n = Sa(t, e.SCALED_DISCOUNT_FROM_LINRGB), r = e.chromaticAdaptation(n[0]), i = e.chromaticAdaptation(n[1]), a = e.chromaticAdaptation(n[2]), o = (11 * r + -12 * i + a) / 11, s = (r + i - 2 * a) / 9;
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
		return ga(e) * n ** (1 / .42);
	}
	static findResultByJ(t, n, r) {
		let i = Math.sqrt(r) * 11, a = Ga.DEFAULT, o = 1 / (1.64 - .29 ** a.n) ** .73, s = .25 * (Math.cos(t + 2) + 3.8) * (5e4 / 13) * a.nc * a.ncb, c = Math.sin(t), l = Math.cos(t);
		for (let t = 0; t < 5; t++) {
			let u = i / 100, d = ((n === 0 || i === 0 ? 0 : n / Math.sqrt(u)) * o) ** (1 / .9), f = a.aw * u ** (1 / a.c / a.z) / a.nbb, p = 23 * (f + .305) * d / (23 * s + 11 * d * l + 108 * d * c), m = p * l, h = p * c, g = (460 * f + 451 * m + 288 * h) / 1403, _ = (460 * f - 891 * m - 261 * h) / 1403, v = (460 * f - 220 * m - 6300 * h) / 1403, y = Sa([
				e.inverseChromaticAdaptation(g),
				e.inverseChromaticAdaptation(_),
				e.inverseChromaticAdaptation(v)
			], e.LINRGB_FROM_SCALED_DISCOUNT);
			if (y[0] < 0 || y[1] < 0 || y[2] < 0) return 0;
			let b = e.Y_FROM_LINRGB[0], x = e.Y_FROM_LINRGB[1], S = e.Y_FROM_LINRGB[2], C = b * y[0] + x * y[1] + S * y[2];
			if (C <= 0) return 0;
			if (t === 4 || Math.abs(C - r) < .002) return y[0] > 100.01 || y[1] > 100.01 || y[2] > 100.01 ? 0 : Da(y);
			i -= (C - r) * i / (2 * C);
		}
		return 0;
	}
	static solveToInt(t, n, r) {
		if (n < 1e-4 || r < 1e-4 || r > 99.9999) return Ia(r);
		t = ba(t);
		let i = t / 180 * Math.PI, a = Ra(r), o = e.findResultByJ(i, n, a);
		return o === 0 ? Da(e.bisectToLimit(a, i)) : o;
	}
	static solveToCam(t, n, r) {
		return Ka.fromInt(e.solveToInt(t, n, r));
	}
};
qa.SCALED_DISCOUNT_FROM_LINRGB = [
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
], qa.LINRGB_FROM_SCALED_DISCOUNT = [
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
], qa.Y_FROM_LINRGB = [
	.2126,
	.7152,
	.0722
], qa.CRITICAL_PLANES = [
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
var V = class e {
	static from(t, n, r) {
		return new e(qa.solveToInt(t, n, r));
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
		this.setInternalState(qa.solveToInt(e, this.internalChroma, this.internalTone));
	}
	get chroma() {
		return this.internalChroma;
	}
	set chroma(e) {
		this.setInternalState(qa.solveToInt(this.internalHue, e, this.internalTone));
	}
	get tone() {
		return this.internalTone;
	}
	set tone(e) {
		this.setInternalState(qa.solveToInt(this.internalHue, this.internalChroma, e));
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
		let t = Ka.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = La(e), this.argb = e;
	}
	setInternalState(e) {
		let t = Ka.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = La(e), this.argb = e;
	}
	inViewingConditions(t) {
		let n = Ka.fromInt(this.toInt()).xyzInViewingConditions(t), r = Ka.fromXyzInViewingConditions(n[0], n[1], n[2], Ga.make());
		return e.from(r.hue, r.chroma, za(n[1]));
	}
}, H = class e {
	static ratioOfTones(t, n) {
		return t = B(0, 100, t), n = B(0, 100, n), e.ratioOfYs(Ra(t), Ra(n));
	}
	static ratioOfYs(e, t) {
		let n = e > t ? e : t, r = n === t ? e : t;
		return (n + 5) / (r + 5);
	}
	static lighter(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = Ra(t), i = n * (r + 5) - 5, a = e.ratioOfYs(i, r), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = za(i) + .4;
		return s < 0 || s > 100 ? -1 : s;
	}
	static darker(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = Ra(t), i = (r + 5) / n - 5, a = e.ratioOfYs(r, i), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = za(i) - .4;
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
}, Ja = class e {
	static isDisliked(e) {
		let t = Math.round(e.hue) >= 90 && Math.round(e.hue) <= 111, n = Math.round(e.chroma) > 16, r = Math.round(e.tone) < 65;
		return t && n && r;
	}
	static fixIfDisliked(t) {
		return e.isDisliked(t) ? V.from(t.hue, t.chroma, 70) : t;
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/dynamic_color.js
function Ya(e, t, n) {
	if (e.name !== n.name) throw Error(`Attempting to extend color ${e.name} with color ${n.name} of different name for spec version ${t}.`);
	if (e.isBackground !== n.isBackground) throw Error(`Attempting to extend color ${e.name} as a ${e.isBackground ? "background" : "foreground"} with color ${n.name} as a ${n.isBackground ? "background" : "foreground"} for spec version ${t}.`);
}
function U(e, t, n) {
	return Ya(e, t, n), W.fromPalette({
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
var W = class e {
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
		let n = eo(e.specVersion).getHct(e, this);
		return this.hctCache.size > 4 && this.hctCache.clear(), this.hctCache.set(e, n), n;
	}
	getTone(e) {
		return eo(e.specVersion).getTone(e, this);
	}
	static foregroundTone(t, n) {
		let r = H.lighterUnsafe(t, n), i = H.darkerUnsafe(t, n), a = H.ratioOfTones(r, t), o = H.ratioOfTones(i, t);
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
}, Xa = class {
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
					H.ratioOfTones(t, m) < o && (m = W.foregroundTone(t, o)), H.ratioOfTones(t, h) < s && (h = W.foregroundTone(t, s)), n && (m = W.foregroundTone(t, o), h = W.foregroundTone(t, s));
				}
			}
			return (h - m) * p < o && (h = B(0, 100, m + o * p), (h - m) * p >= o || (m = B(0, 100, h - o * p))), 50 <= m && m < 60 ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : 50 <= h && h < 60 && (c ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : h = p > 0 ? 60 : 49), f ? m : h;
		}
		{
			let r = t.tone(e);
			if (t.background == null || t.background(e) === void 0 || t.contrastCurve == null || t.contrastCurve(e) === void 0) return r;
			let i = t.background(e).getTone(e), a = t.contrastCurve(e).get(e.contrastLevel);
			if (H.ratioOfTones(i, r) >= a || (r = W.foregroundTone(i, a)), n && (r = W.foregroundTone(i, a)), t.isBackground && 50 <= r && r < 60 && (r = H.ratioOfTones(49, i) >= a ? 49 : 60), t.secondBackground == null || t.secondBackground(e) === void 0) return r;
			let [o, s] = [t.background, t.secondBackground], [c, l] = [o(e).getTone(e), s(e).getTone(e)], [u, d] = [Math.max(c, l), Math.min(c, l)];
			if (H.ratioOfTones(u, r) >= a && H.ratioOfTones(d, r) >= a) return r;
			let f = H.lighter(u, a), p = H.darker(d, a), m = [];
			return f !== -1 && m.push(f), p !== -1 && m.push(p), W.tonePrefersLightForeground(c) || W.tonePrefersLightForeground(l) ? f < 0 ? 100 : f : m.length === 1 ? m[0] : p < 0 ? 0 : p;
		}
	}
}, Za = class {
	getHct(e, t) {
		let n = t.palette(e), r = t.getTone(e), i = n.hue, a = n.chroma * (t.chromaMultiplier ? t.chromaMultiplier(e) : 1);
		return V.from(i, a, r);
	}
	getTone(e, t) {
		let n = t.toneDeltaPair ? t.toneDeltaPair(e) : void 0;
		if (n) {
			let r = n.roleA, i = n.roleB, a = n.polarity, o = n.constraint, s = a === "darker" || a === "relative_lighter" && e.isDark || a === "relative_darker" && !e.isDark ? -n.delta : n.delta, c = t.name === r.name, l = c ? r : i, u = c ? i : r, d = l.tone(e), f = u.getTone(e), p = s * (c ? 1 : -1);
			if (o === "exact" ? d = B(0, 100, f + p) : o === "nearer" ? d = p > 0 ? B(0, 100, B(f, f + p, d)) : B(0, 100, B(f + p, f, d)) : o === "farther" && (d = p > 0 ? B(f + p, 100, d) : B(0, f + p, d)), t.background && t.contrastCurve) {
				let n = t.background(e), r = t.contrastCurve(e);
				if (n && r) {
					let t = n.getTone(e), i = r.get(e.contrastLevel);
					d = H.ratioOfTones(t, d) >= i && e.contrastLevel >= 0 ? d : W.foregroundTone(t, i);
				}
			}
			return t.isBackground && !t.name.endsWith("_fixed_dim") && (d = d >= 57 ? B(65, 100, d) : B(0, 49, d)), d;
		}
		{
			let n = t.tone(e);
			if (t.background == null || t.background(e) === void 0 || t.contrastCurve == null || t.contrastCurve(e) === void 0) return n;
			let r = t.background(e).getTone(e), i = t.contrastCurve(e).get(e.contrastLevel);
			if (n = H.ratioOfTones(r, n) >= i && e.contrastLevel >= 0 ? n : W.foregroundTone(r, i), t.isBackground && !t.name.endsWith("_fixed_dim") && (n = n >= 57 ? B(65, 100, n) : B(0, 49, n)), t.secondBackground == null || t.secondBackground(e) === void 0) return n;
			let [a, o] = [t.background, t.secondBackground], [s, c] = [a(e).getTone(e), o(e).getTone(e)], [l, u] = [Math.max(s, c), Math.min(s, c)];
			if (H.ratioOfTones(l, n) >= i && H.ratioOfTones(u, n) >= i) return n;
			let d = H.lighter(l, i), f = H.darker(u, i), p = [];
			return d !== -1 && p.push(d), f !== -1 && p.push(f), W.tonePrefersLightForeground(s) || W.tonePrefersLightForeground(c) ? d < 0 ? 100 : d : p.length === 1 ? p[0] : f < 0 ? 0 : f;
		}
	}
}, Qa = new Xa(), $a = new Za();
function eo(e) {
	return e === "2021" ? Qa : $a;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/palettes/tonal_palette.js
var G = class e {
	static fromInt(t) {
		let n = V.fromInt(t);
		return e.fromHct(n);
	}
	static fromHct(t) {
		return new e(t.hue, t.chroma, t);
	}
	static fromHueAndChroma(t, n) {
		let r = new to(t, n).create();
		return new e(t, n, r);
	}
	constructor(e, t, n) {
		this.hue = e, this.chroma = t, this.keyColor = n, this.cache = /* @__PURE__ */ new Map();
	}
	tone(e) {
		let t = this.cache.get(e);
		return t === void 0 && (t = e == 99 && V.isYellow(this.hue) ? this.averageArgb(this.tone(98), this.tone(100)) : V.from(this.hue, this.chroma, e).toInt(), this.cache.set(e, t)), t;
	}
	getHct(e) {
		return V.fromInt(this.tone(e));
	}
	averageArgb(e, t) {
		let n = e >>> 16 & 255, r = e >>> 8 & 255, i = e & 255, a = t >>> 16 & 255, o = t >>> 8 & 255, s = t & 255, c = Math.round((n + a) / 2), l = Math.round((r + o) / 2), u = Math.round((i + s) / 2);
		return (255 << 24 | (c & 255) << 16 | (l & 255) << 8 | u & 255) >>> 0;
	}
}, to = class {
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
					if (e === n) return V.from(this.hue, this.requestedChroma, e);
					e = n;
				}
			} else r ? e = n + 1 : t = n;
		}
		return V.from(this.hue, this.requestedChroma, e);
	}
	maxChroma(e) {
		if (this.chromaCache.has(e)) return this.chromaCache.get(e);
		let t = V.from(this.hue, this.maxChromaValue, e).chroma;
		return this.chromaCache.set(e, t), t;
	}
}, no = class e {
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
			let t = ya(n + e), r = this.hctsByHue[t], a = this.relativeTemperature(r), s = Math.abs(a - i);
			i = a, o += s;
		}
		let s = 1, c = o / t, l = 0;
		for (i = this.relativeTemperature(r); a.length < t;) {
			let e = ya(n + s), r = this.hctsByHue[e], o = this.relativeTemperature(r), u = Math.abs(o - i);
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
			let r = ba(o + 1 * t);
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
			let n = V.from(t, this.input.chroma, this.input.tone);
			e.push(n);
		}
		return this.hctsByHueCache = e, this.hctsByHueCache;
	}
	static isBetween(e, t, n) {
		return t < n ? t <= e && e <= n : t <= e || e <= n;
	}
	static rawTemperature(e) {
		let t = Fa(e.toInt()), n = ba(Math.atan2(t[2], t[1]) * 180 / Math.PI);
		return -.5 + .02 * Math.sqrt(t[1] * t[1] + t[2] * t[2]) ** 1.07 * Math.cos(ba(n - 50) * Math.PI / 180);
	}
}, K = class {
	constructor(e, t, n, r) {
		this.low = e, this.normal = t, this.medium = n, this.high = r;
	}
	get(e) {
		return e <= -1 ? this.low : e < 0 ? _a(this.low, this.normal, (e - -1) / 1) : e < .5 ? _a(this.normal, this.medium, (e - 0) / .5) : e < 1 ? _a(this.medium, this.high, (e - .5) / .5) : this.high;
	}
}, q = class {
	constructor(e, t, n, r, i, a) {
		this.roleA = e, this.roleB = t, this.delta = n, this.polarity = r, this.stayTogether = i, this.constraint = a, this.constraint = a ?? "exact";
	}
}, J;
(function(e) {
	e[e.MONOCHROME = 0] = "MONOCHROME", e[e.NEUTRAL = 1] = "NEUTRAL", e[e.TONAL_SPOT = 2] = "TONAL_SPOT", e[e.VIBRANT = 3] = "VIBRANT", e[e.EXPRESSIVE = 4] = "EXPRESSIVE", e[e.FIDELITY = 5] = "FIDELITY", e[e.CONTENT = 6] = "CONTENT", e[e.RAINBOW = 7] = "RAINBOW", e[e.FRUIT_SALAD = 8] = "FRUIT_SALAD", e[e.CMF = 9] = "CMF";
})(J ||= {});
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/color_spec_2021.js
function ro(e) {
	return e.variant === J.FIDELITY || e.variant === J.CONTENT;
}
function Y(e) {
	return e.variant === J.MONOCHROME;
}
function io(e, t, n, r) {
	let i = n, a = V.from(e, t, n);
	if (a.chroma < t) {
		let n = a.chroma;
		for (; a.chroma < t;) {
			i += r ? -1 : 1;
			let o = V.from(e, t, i);
			if (n > o.chroma || Math.abs(o.chroma - t) < .4) break;
			Math.abs(o.chroma - t) < Math.abs(a.chroma - t) && (a = o), n = Math.max(n, o.chroma);
		}
	}
	return i;
}
var ao = class {
	primaryPaletteKeyColor() {
		return W.fromPalette({
			name: "primary_palette_key_color",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.primaryPalette.keyColor.tone
		});
	}
	secondaryPaletteKeyColor() {
		return W.fromPalette({
			name: "secondary_palette_key_color",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.secondaryPalette.keyColor.tone
		});
	}
	tertiaryPaletteKeyColor() {
		return W.fromPalette({
			name: "tertiary_palette_key_color",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.tertiaryPalette.keyColor.tone
		});
	}
	neutralPaletteKeyColor() {
		return W.fromPalette({
			name: "neutral_palette_key_color",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.neutralPalette.keyColor.tone
		});
	}
	neutralVariantPaletteKeyColor() {
		return W.fromPalette({
			name: "neutral_variant_palette_key_color",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.neutralVariantPalette.keyColor.tone
		});
	}
	errorPaletteKeyColor() {
		return W.fromPalette({
			name: "error_palette_key_color",
			palette: (e) => e.errorPalette,
			tone: (e) => e.errorPalette.keyColor.tone
		});
	}
	background() {
		return W.fromPalette({
			name: "background",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : 98,
			isBackground: !0
		});
	}
	onBackground() {
		return W.fromPalette({
			name: "on_background",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 10,
			background: (e) => this.background(),
			contrastCurve: (e) => new K(3, 3, 4.5, 7)
		});
	}
	surface() {
		return W.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : 98,
			isBackground: !0
		});
	}
	surfaceDim() {
		return W.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : new K(87, 87, 80, 75).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceBright() {
		return W.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(24, 24, 29, 34).get(e.contrastLevel) : 98,
			isBackground: !0
		});
	}
	surfaceContainerLowest() {
		return W.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(4, 4, 2, 0).get(e.contrastLevel) : 100,
			isBackground: !0
		});
	}
	surfaceContainerLow() {
		return W.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(10, 10, 11, 12).get(e.contrastLevel) : new K(96, 96, 96, 95).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainer() {
		return W.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(12, 12, 16, 20).get(e.contrastLevel) : new K(94, 94, 92, 90).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainerHigh() {
		return W.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(17, 17, 21, 25).get(e.contrastLevel) : new K(92, 92, 88, 85).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainerHighest() {
		return W.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(22, 22, 26, 30).get(e.contrastLevel) : new K(90, 90, 84, 80).get(e.contrastLevel),
			isBackground: !0
		});
	}
	onSurface() {
		return W.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 10,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	surfaceVariant() {
		return W.fromPalette({
			name: "surface_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 30 : 90,
			isBackground: !0
		});
	}
	onSurfaceVariant() {
		return W.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 80 : 30,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	inverseSurface() {
		return W.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 20,
			isBackground: !0
		});
	}
	inverseOnSurface() {
		return W.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 20 : 95,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	outline() {
		return W.fromPalette({
			name: "outline",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 60 : 50,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1.5, 3, 4.5, 7)
		});
	}
	outlineVariant() {
		return W.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 30 : 80,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5)
		});
	}
	shadow() {
		return W.fromPalette({
			name: "shadow",
			palette: (e) => e.neutralPalette,
			tone: (e) => 0
		});
	}
	scrim() {
		return W.fromPalette({
			name: "scrim",
			palette: (e) => e.neutralPalette,
			tone: (e) => 0
		});
	}
	surfaceTint() {
		return W.fromPalette({
			name: "surface_tint",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.isDark ? 80 : 40,
			isBackground: !0
		});
	}
	primary() {
		return W.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 100 : 0 : e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new q(this.primaryContainer(), this.primary(), 10, "nearer", !1)
		});
	}
	primaryDim() {}
	onPrimary() {
		return W.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 10 : 90 : e.isDark ? 20 : 100,
			background: (e) => this.primary(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	primaryContainer() {
		return W.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => ro(e) ? e.sourceColorHct.tone : Y(e) ? e.isDark ? 85 : 25 : e.isDark ? 30 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.primaryContainer(), this.primary(), 10, "nearer", !1)
		});
	}
	onPrimaryContainer() {
		return W.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => ro(e) ? W.foregroundTone(this.primaryContainer().tone(e), 4.5) : Y(e) ? e.isDark ? 0 : 100 : e.isDark ? 90 : 30,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	inversePrimary() {
		return W.fromPalette({
			name: "inverse_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.isDark ? 40 : 80,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => new K(3, 4.5, 7, 7)
		});
	}
	secondary() {
		return W.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new q(this.secondaryContainer(), this.secondary(), 10, "nearer", !1)
		});
	}
	secondaryDim() {}
	onSecondary() {
		return W.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 10 : 100 : e.isDark ? 20 : 100,
			background: (e) => this.secondary(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	secondaryContainer() {
		return W.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => {
				let t = e.isDark ? 30 : 90;
				return Y(e) ? e.isDark ? 30 : 85 : ro(e) ? io(e.secondaryPalette.hue, e.secondaryPalette.chroma, t, !e.isDark) : t;
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.secondaryContainer(), this.secondary(), 10, "nearer", !1)
		});
	}
	onSecondaryContainer() {
		return W.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 90 : 10 : ro(e) ? W.foregroundTone(this.secondaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	tertiary() {
		return W.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 90 : 25 : e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new q(this.tertiaryContainer(), this.tertiary(), 10, "nearer", !1)
		});
	}
	tertiaryDim() {}
	onTertiary() {
		return W.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 10 : 90 : e.isDark ? 20 : 100,
			background: (e) => this.tertiary(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	tertiaryContainer() {
		return W.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				if (Y(e)) return e.isDark ? 60 : 49;
				if (!ro(e)) return e.isDark ? 30 : 90;
				let t = e.tertiaryPalette.getHct(e.sourceColorHct.tone);
				return Ja.fixIfDisliked(t).tone;
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.tertiaryContainer(), this.tertiary(), 10, "nearer", !1)
		});
	}
	onTertiaryContainer() {
		return W.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 0 : 100 : ro(e) ? W.foregroundTone(this.tertiaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	error() {
		return W.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? 80 : 40,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(3, 4.5, 7, 7),
			toneDeltaPair: (e) => new q(this.errorContainer(), this.error(), 10, "nearer", !1)
		});
	}
	errorDim() {}
	onError() {
		return W.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? 20 : 100,
			background: (e) => this.error(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	errorContainer() {
		return W.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? 30 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.errorContainer(), this.error(), 10, "nearer", !1)
		});
	}
	onErrorContainer() {
		return W.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => Y(e) ? e.isDark ? 90 : 10 : e.isDark ? 90 : 30,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	primaryFixed() {
		return W.fromPalette({
			name: "primary_fixed",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? 40 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.primaryFixed(), this.primaryFixedDim(), 10, "lighter", !0)
		});
	}
	primaryFixedDim() {
		return W.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? 30 : 80,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.primaryFixed(), this.primaryFixedDim(), 10, "lighter", !0)
		});
	}
	onPrimaryFixed() {
		return W.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? 100 : 10,
			background: (e) => this.primaryFixedDim(),
			secondBackground: (e) => this.primaryFixed(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	onPrimaryFixedVariant() {
		return W.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? 90 : 30,
			background: (e) => this.primaryFixedDim(),
			secondBackground: (e) => this.primaryFixed(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	secondaryFixed() {
		return W.fromPalette({
			name: "secondary_fixed",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? 80 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.secondaryFixed(), this.secondaryFixedDim(), 10, "lighter", !0)
		});
	}
	secondaryFixedDim() {
		return W.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? 70 : 80,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.secondaryFixed(), this.secondaryFixedDim(), 10, "lighter", !0)
		});
	}
	onSecondaryFixed() {
		return W.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			tone: (e) => 10,
			background: (e) => this.secondaryFixedDim(),
			secondBackground: (e) => this.secondaryFixed(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	onSecondaryFixedVariant() {
		return W.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? 25 : 30,
			background: (e) => this.secondaryFixedDim(),
			secondBackground: (e) => this.secondaryFixed(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	tertiaryFixed() {
		return W.fromPalette({
			name: "tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? 40 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.tertiaryFixed(), this.tertiaryFixedDim(), 10, "lighter", !0)
		});
	}
	tertiaryFixedDim() {
		return W.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? 30 : 80,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.tertiaryFixed(), this.tertiaryFixedDim(), 10, "lighter", !0)
		});
	}
	onTertiaryFixed() {
		return W.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? 100 : 10,
			background: (e) => this.tertiaryFixedDim(),
			secondBackground: (e) => this.tertiaryFixed(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	onTertiaryFixedVariant() {
		return W.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? 90 : 30,
			background: (e) => this.tertiaryFixedDim(),
			secondBackground: (e) => this.tertiaryFixed(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	highestSurface(e) {
		return e.isDark ? this.surfaceBright() : this.surfaceDim();
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/color_spec_2025.js
function X(e, t = 0, n = 100, r = 1) {
	return B(t, n, so(e.hue, e.chroma * r, 100, !0));
}
function oo(e, t = 0, n = 100) {
	return B(t, n, so(e.hue, e.chroma, 0, !1));
}
function so(e, t, n, r) {
	let i = n, a = V.from(e, t, i);
	for (; a.chroma < t && !(n < 0 || n > 100);) {
		n += r ? -1 : 1;
		let o = V.from(e, t, n);
		a.chroma < o.chroma && (a = o, i = n);
	}
	return i;
}
function Z(e) {
	return e === 1.5 ? new K(1.5, 1.5, 3, 5.5) : e === 3 ? new K(3, 3, 4.5, 7) : e === 4.5 ? new K(4.5, 4.5, 7, 11) : e === 6 ? new K(6, 6, 7, 11) : e === 7 ? new K(7, 7, 11, 21) : e === 9 ? new K(9, 9, 11, 21) : e === 11 ? new K(11, 11, 21, 21) : e === 21 ? new K(21, 21, 21, 21) : new K(e, e, 7, 21);
}
var co = class extends ao {
	surface() {
		let e = W.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => (super.surface().tone(e), e.platform === "phone" ? e.isDark ? 4 : V.isYellow(e.neutralPalette.hue) ? 99 : e.variant === J.VIBRANT ? 97 : 98 : 0),
			isBackground: !0
		});
		return U(super.surface(), "2025", e);
	}
	surfaceDim() {
		let e = W.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 4 : V.isYellow(e.neutralPalette.hue) ? 90 : e.variant === J.VIBRANT ? 85 : 87,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (!e.isDark) {
					if (e.variant === J.NEUTRAL) return 2.5;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? 2.7 : 1.75;
					if (e.variant === J.VIBRANT) return 1.36;
				}
				return 1;
			}
		});
		return U(super.surfaceDim(), "2025", e);
	}
	surfaceBright() {
		let e = W.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 18 : V.isYellow(e.neutralPalette.hue) ? 99 : e.variant === J.VIBRANT ? 97 : 98,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.isDark) {
					if (e.variant === J.NEUTRAL) return 2.5;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? 2.7 : 1.75;
					if (e.variant === J.VIBRANT) return 1.36;
				}
				return 1;
			}
		});
		return U(super.surfaceBright(), "2025", e);
	}
	surfaceContainerLowest() {
		let e = W.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 0 : 100,
			isBackground: !0
		});
		return U(super.surfaceContainerLowest(), "2025", e);
	}
	surfaceContainerLow() {
		let e = W.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 6 : V.isYellow(e.neutralPalette.hue) ? 98 : e.variant === J.VIBRANT ? 95 : 96 : 15,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 1.3;
					if (e.variant === J.TONAL_SPOT) return 1.25;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? 1.3 : 1.15;
					if (e.variant === J.VIBRANT) return 1.08;
				}
				return 1;
			}
		});
		return U(super.surfaceContainerLow(), "2025", e);
	}
	surfaceContainer() {
		let e = W.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 9 : V.isYellow(e.neutralPalette.hue) ? 96 : e.variant === J.VIBRANT ? 92 : 94 : 20,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 1.6;
					if (e.variant === J.TONAL_SPOT) return 1.4;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? 1.6 : 1.3;
					if (e.variant === J.VIBRANT) return 1.15;
				}
				return 1;
			}
		});
		return U(super.surfaceContainer(), "2025", e);
	}
	surfaceContainerHigh() {
		let e = W.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 12 : V.isYellow(e.neutralPalette.hue) ? 94 : e.variant === J.VIBRANT ? 90 : 92 : 25,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 1.9;
					if (e.variant === J.TONAL_SPOT) return 1.5;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? 1.95 : 1.45;
					if (e.variant === J.VIBRANT) return 1.22;
				}
				return 1;
			}
		});
		return U(super.surfaceContainerHigh(), "2025", e);
	}
	surfaceContainerHighest() {
		let e = W.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 15 : V.isYellow(e.neutralPalette.hue) ? 92 : e.variant === J.VIBRANT ? 88 : 90,
			isBackground: !0,
			chromaMultiplier: (e) => e.variant === J.NEUTRAL ? 2.2 : e.variant === J.TONAL_SPOT ? 1.7 : e.variant === J.EXPRESSIVE ? V.isYellow(e.neutralPalette.hue) ? 2.3 : 1.6 : e.variant === J.VIBRANT ? 1.29 : 1
		});
		return U(super.surfaceContainerHighest(), "2025", e);
	}
	onSurface() {
		let e = W.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.VIBRANT ? X(e.neutralPalette, 0, 100, 1.1) : W.getInitialToneFromBackground((e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh())(e),
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.isDark && e.platform === "phone" ? Z(11) : Z(9)
		});
		return U(super.onSurface(), "2025", e);
	}
	onSurfaceVariant() {
		let e = W.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? e.isDark ? Z(6) : Z(4.5) : Z(7)
		});
		return U(super.onSurfaceVariant(), "2025", e);
	}
	outline() {
		let e = W.fromPalette({
			name: "outline",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(3) : Z(4.5)
		});
		return U(super.outline(), "2025", e);
	}
	outlineVariant() {
		let e = W.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return V.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(1.5) : Z(3)
		});
		return U(super.outlineVariant(), "2025", e);
	}
	inverseSurface() {
		let e = W.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 98 : 4,
			isBackground: !0
		});
		return U(super.inverseSurface(), "2025", e);
	}
	inverseOnSurface() {
		let e = W.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => Z(7)
		});
		return U(super.inverseOnSurface(), "2025", e);
	}
	primary() {
		let e = W.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.variant === J.NEUTRAL ? e.platform === "phone" ? e.isDark ? 80 : 40 : 90 : e.variant === J.TONAL_SPOT ? e.platform === "phone" ? e.isDark ? 80 : X(e.primaryPalette) : X(e.primaryPalette, 0, 90) : e.variant === J.EXPRESSIVE ? e.platform === "phone" ? X(e.primaryPalette, 0, V.isYellow(e.primaryPalette.hue) ? 25 : V.isCyan(e.primaryPalette.hue) ? 88 : 98) : X(e.primaryPalette) : e.platform === "phone" ? X(e.primaryPalette, 0, V.isCyan(e.primaryPalette.hue) ? 88 : 98) : X(e.primaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.primaryContainer(), this.primary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.primary(), "2025", e);
	}
	primaryDim() {
		return W.fromPalette({
			name: "primary_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.variant === J.NEUTRAL ? 85 : e.variant === J.TONAL_SPOT ? X(e.primaryPalette, 0, 90) : X(e.primaryPalette),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => new q(this.primaryDim(), this.primary(), 5, "darker", !0, "farther")
		});
	}
	onPrimary() {
		let e = W.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			background: (e) => e.platform === "phone" ? this.primary() : this.primaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.onPrimary(), "2025", e);
	}
	primaryContainer() {
		let e = W.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.variant === J.NEUTRAL ? e.isDark ? 30 : 90 : e.variant === J.TONAL_SPOT ? e.isDark ? oo(e.primaryPalette, 35, 93) : X(e.primaryPalette, 0, 90) : e.variant === J.EXPRESSIVE ? e.isDark ? X(e.primaryPalette, 30, 93) : X(e.primaryPalette, 78, V.isCyan(e.primaryPalette.hue) ? 88 : 90) : e.isDark ? oo(e.primaryPalette, 66, 93) : X(e.primaryPalette, 66, V.isCyan(e.primaryPalette.hue) ? 88 : 93),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "phone" ? void 0 : new q(this.primaryContainer(), this.primaryDim(), 10, "darker", !0, "farther"),
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return U(super.primaryContainer(), "2025", e);
	}
	onPrimaryContainer() {
		let e = W.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.onPrimaryContainer(), "2025", e);
	}
	primaryFixed() {
		let e = W.fromPalette({
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
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return U(super.primaryFixed(), "2025", e);
	}
	primaryFixedDim() {
		let e = W.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => this.primaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new q(this.primaryFixedDim(), this.primaryFixed(), 5, "darker", !0, "exact")
		});
		return U(super.primaryFixedDim(), "2025", e);
	}
	onPrimaryFixed() {
		let e = W.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixedDim(),
			contrastCurve: (e) => Z(7)
		});
		return U(super.onPrimaryFixed(), "2025", e);
	}
	onPrimaryFixedVariant() {
		let e = W.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixedDim(),
			contrastCurve: (e) => Z(4.5)
		});
		return U(super.onPrimaryFixedVariant(), "2025", e);
	}
	inversePrimary() {
		let e = W.fromPalette({
			name: "inverse_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => X(e.primaryPalette),
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.inversePrimary(), "2025", e);
	}
	secondary() {
		let e = W.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === J.NEUTRAL ? 90 : X(e.secondaryPalette, 0, 90) : e.variant === J.NEUTRAL ? e.isDark ? oo(e.secondaryPalette, 0, 98) : X(e.secondaryPalette) : e.variant === J.VIBRANT ? X(e.secondaryPalette, 0, e.isDark ? 90 : 98) : e.isDark ? 80 : X(e.secondaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.secondaryContainer(), this.secondary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.secondary(), "2025", e);
	}
	secondaryDim() {
		return W.fromPalette({
			name: "secondary_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.variant === J.NEUTRAL ? 85 : X(e.secondaryPalette, 0, 90),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => new q(this.secondaryDim(), this.secondary(), 5, "darker", !0, "farther")
		});
	}
	onSecondary() {
		let e = W.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			background: (e) => e.platform === "phone" ? this.secondary() : this.secondaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.onSecondary(), "2025", e);
	}
	secondaryContainer() {
		let e = W.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.variant === J.VIBRANT ? e.isDark ? oo(e.secondaryPalette, 30, 40) : X(e.secondaryPalette, 84, 90) : e.variant === J.EXPRESSIVE ? e.isDark ? 15 : X(e.secondaryPalette, 90, 95) : e.isDark ? 25 : 90,
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new q(this.secondaryContainer(), this.secondaryDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return U(super.secondaryContainer(), "2025", e);
	}
	onSecondaryContainer() {
		let e = W.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.onSecondaryContainer(), "2025", e);
	}
	secondaryFixed() {
		let e = W.fromPalette({
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
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return U(super.secondaryFixed(), "2025", e);
	}
	secondaryFixedDim() {
		let e = W.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => this.secondaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new q(this.secondaryFixedDim(), this.secondaryFixed(), 5, "darker", !0, "exact")
		});
		return U(super.secondaryFixedDim(), "2025", e);
	}
	onSecondaryFixed() {
		let e = W.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixedDim(),
			contrastCurve: (e) => Z(7)
		});
		return U(super.onSecondaryFixed(), "2025", e);
	}
	onSecondaryFixedVariant() {
		let e = W.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixedDim(),
			contrastCurve: (e) => Z(4.5)
		});
		return U(super.onSecondaryFixedVariant(), "2025", e);
	}
	tertiary() {
		let e = W.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === J.TONAL_SPOT ? X(e.tertiaryPalette, 0, 90) : X(e.tertiaryPalette) : e.variant === J.EXPRESSIVE || e.variant === J.VIBRANT ? X(e.tertiaryPalette, 0, V.isCyan(e.tertiaryPalette.hue) ? 88 : e.isDark ? 98 : 100) : e.isDark ? X(e.tertiaryPalette, 0, 98) : X(e.tertiaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.tertiaryContainer(), this.tertiary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.tertiary(), "2025", e);
	}
	tertiaryDim() {
		return W.fromPalette({
			name: "tertiary_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.variant === J.TONAL_SPOT ? X(e.tertiaryPalette, 0, 90) : X(e.tertiaryPalette),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => new q(this.tertiaryDim(), this.tertiary(), 5, "darker", !0, "farther")
		});
	}
	onTertiary() {
		let e = W.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			background: (e) => e.platform === "phone" ? this.tertiary() : this.tertiaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.onTertiary(), "2025", e);
	}
	tertiaryContainer() {
		let e = W.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === J.TONAL_SPOT ? X(e.tertiaryPalette, 0, 90) : X(e.tertiaryPalette) : e.variant === J.NEUTRAL ? e.isDark ? X(e.tertiaryPalette, 0, 93) : X(e.tertiaryPalette, 0, 96) : e.variant === J.TONAL_SPOT ? X(e.tertiaryPalette, 0, e.isDark ? 93 : 100) : e.variant === J.EXPRESSIVE ? X(e.tertiaryPalette, 75, V.isCyan(e.tertiaryPalette.hue) ? 88 : e.isDark ? 93 : 100) : e.isDark ? X(e.tertiaryPalette, 0, 93) : X(e.tertiaryPalette, 72, 100),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new q(this.tertiaryContainer(), this.tertiaryDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return U(super.tertiaryContainer(), "2025", e);
	}
	onTertiaryContainer() {
		let e = W.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.onTertiaryContainer(), "2025", e);
	}
	tertiaryFixed() {
		let e = W.fromPalette({
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
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return U(super.tertiaryFixed(), "2025", e);
	}
	tertiaryFixedDim() {
		let e = W.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => this.tertiaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new q(this.tertiaryFixedDim(), this.tertiaryFixed(), 5, "darker", !0, "exact")
		});
		return U(super.tertiaryFixedDim(), "2025", e);
	}
	onTertiaryFixed() {
		let e = W.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixedDim(),
			contrastCurve: (e) => Z(7)
		});
		return U(super.onTertiaryFixed(), "2025", e);
	}
	onTertiaryFixedVariant() {
		let e = W.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixedDim(),
			contrastCurve: (e) => Z(4.5)
		});
		return U(super.onTertiaryFixedVariant(), "2025", e);
	}
	error() {
		let e = W.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? oo(e.errorPalette, 0, 98) : X(e.errorPalette) : oo(e.errorPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.errorContainer(), this.error(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.error(), "2025", e);
	}
	errorDim() {
		return W.fromPalette({
			name: "error_dim",
			palette: (e) => e.errorPalette,
			tone: (e) => oo(e.errorPalette),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => new q(this.errorDim(), this.error(), 5, "darker", !0, "farther")
		});
	}
	onError() {
		let e = W.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			background: (e) => e.platform === "phone" ? this.error() : this.errorDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return U(super.onError(), "2025", e);
	}
	errorContainer() {
		let e = W.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.isDark ? oo(e.errorPalette, 30, 93) : X(e.errorPalette, 0, 90),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new q(this.errorContainer(), this.errorDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return U(super.errorContainer(), "2025", e);
	}
	onErrorContainer() {
		let e = W.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7)
		});
		return U(super.onErrorContainer(), "2025", e);
	}
	surfaceVariant() {
		let e = Object.assign(this.surfaceContainerHighest().clone(), { name: "surface_variant" });
		return U(super.surfaceVariant(), "2025", e);
	}
	surfaceTint() {
		let e = Object.assign(this.primary().clone(), { name: "surface_tint" });
		return U(super.surfaceTint(), "2025", e);
	}
	background() {
		let e = Object.assign(this.surface().clone(), { name: "background" });
		return U(super.background(), "2025", e);
	}
	onBackground() {
		let e = Object.assign(this.onSurface().clone(), {
			name: "on_background",
			tone: (e) => e.platform === "watch" ? 100 : this.onSurface().getTone(e)
		});
		return U(super.onBackground(), "2025", e);
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/color_spec_2026.js
function lo(e, t = 0, n = 100, r = 1) {
	return B(t, n, fo(e.hue, e.chroma * r, 100, !0));
}
function uo(e, t = 0, n = 100) {
	return B(t, n, fo(e.hue, e.chroma, 0, !1));
}
function fo(e, t, n, r) {
	let i = n, a = V.from(e, t, i);
	for (; a.chroma < t && !(n < 0 || n > 100);) {
		n += r ? -1 : 1;
		let o = V.from(e, t, n);
		a.chroma < o.chroma && (a = o, i = n);
	}
	return i;
}
function Q(e) {
	return e === 1.5 ? new K(1.5, 1.5, 3, 5.5) : e === 3 ? new K(3, 3, 4.5, 7) : e === 4.5 ? new K(4.5, 4.5, 7, 11) : e === 6 ? new K(6, 6, 7, 11) : e === 7 ? new K(7, 7, 11, 21) : e === 9 ? new K(9, 9, 11, 21) : e === 11 ? new K(11, 11, 21, 21) : e === 21 ? new K(21, 21, 21, 21) : new K(e, e, 7, 21);
}
var po = class extends co {
	surface() {
		let e = W.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 4 : 98 : 0,
			isBackground: !0
		});
		return U(super.surface(), "2026", e);
	}
	surfaceDim() {
		let e = W.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 4 : 87 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? e.isDark ? 1 : 1.7 : 0,
			isBackground: !0
		});
		return U(super.surfaceDim(), "2026", e);
	}
	surfaceBright() {
		let e = W.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 18 : 98 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? e.isDark ? 1.7 : 1 : 0,
			isBackground: !0
		});
		return U(super.surfaceBright(), "2026", e);
	}
	surfaceContainerLowest() {
		let e = W.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 0 : 100 : 0,
			isBackground: !0
		});
		return U(super.surfaceContainerLowest(), "2026", e);
	}
	surfaceContainerLow() {
		let e = W.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 6 : 96 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.25 : 0,
			isBackground: !0
		});
		return U(super.surfaceContainerLow(), "2026", e);
	}
	surfaceContainer() {
		let e = W.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 9 : 94 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.4 : 0,
			isBackground: !0
		});
		return U(super.surfaceContainer(), "2026", e);
	}
	surfaceContainerHigh() {
		let e = W.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 12 : 92 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.5 : 0,
			isBackground: !0
		});
		return U(super.surfaceContainerHigh(), "2026", e);
	}
	surfaceContainerHighest() {
		let e = W.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 15 : 90 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			isBackground: !0
		});
		return U(super.surfaceContainerHighest(), "2026", e);
	}
	onSurface() {
		let e = W.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.isDark ? Q(11) : Q(9)
		});
		return U(super.onSurface(), "2026", e);
	}
	onSurfaceVariant() {
		let e = W.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.isDark ? Q(6) : Q(4.5)
		});
		return U(super.onSurfaceVariant(), "2026", e);
	}
	outline() {
		let e = W.fromPalette({
			name: "outline",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(3)
		});
		return U(super.outline(), "2026", e);
	}
	outlineVariant() {
		let e = W.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(1.5)
		});
		return U(super.outlineVariant(), "2026", e);
	}
	inverseSurface() {
		let e = W.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 98 : 4,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			isBackground: !0
		});
		return U(super.inverseSurface(), "2026", e);
	}
	inverseOnSurface() {
		let e = W.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => Q(7)
		});
		return U(super.inverseOnSurface(), "2026", e);
	}
	primary() {
		let e = W.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.sourceColorHct.chroma <= 12 ? e.isDark ? 80 : 40 : e.sourceColorHct.tone,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.primaryContainer(), this.primary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.primary(), "2026", e);
	}
	onPrimary() {
		let e = W.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primary(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onPrimary(), "2026", e);
	}
	primaryContainer() {
		let e = W.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => !e.isDark && e.sourceColorHct.chroma <= 12 ? 90 : e.sourceColorHct.tone > 55 ? B(61, 90, e.sourceColorHct.tone) : B(30, 49, e.sourceColorHct.tone),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.primaryContainer(), "2026", e);
	}
	onPrimaryContainer() {
		let e = W.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onPrimaryContainer(), "2026", e);
	}
	primaryFixed() {
		let e = W.fromPalette({
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
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.primaryFixed(), "2026", e);
	}
	primaryFixedDim() {
		let e = W.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => this.primaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new q(this.primaryFixedDim(), this.primaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.primaryFixedDim(), "2026", e);
	}
	onPrimaryFixed() {
		let e = W.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixed().getTone(e) > 57 ? this.primaryFixedDim() : this.primaryFixed(),
			contrastCurve: (e) => Q(7)
		});
		return U(super.onPrimaryFixed(), "2026", e);
	}
	onPrimaryFixedVariant() {
		let e = W.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixed().getTone(e) > 57 ? this.primaryFixedDim() : this.primaryFixed(),
			contrastCurve: (e) => Q(4.5)
		});
		return U(super.onPrimaryFixedVariant(), "2026", e);
	}
	inversePrimary() {
		return super.inversePrimary();
	}
	secondary() {
		let e = W.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? uo(e.secondaryPalette) : lo(e.secondaryPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.secondaryContainer(), this.secondary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.secondary(), "2026", e);
	}
	onSecondary() {
		let e = W.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondary(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onSecondary(), "2026", e);
	}
	secondaryContainer() {
		let e = W.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? uo(e.secondaryPalette, 20, 49) : lo(e.secondaryPalette, 61, 90),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.secondaryContainer(), "2026", e);
	}
	onSecondaryContainer() {
		let e = W.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onSecondaryContainer(), "2026", e);
	}
	secondaryFixed() {
		let e = W.fromPalette({
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
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.secondaryFixed(), "2026", e);
	}
	secondaryFixedDim() {
		let e = W.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => this.secondaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new q(this.secondaryFixedDim(), this.secondaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.secondaryFixedDim(), "2026", e);
	}
	onSecondaryFixed() {
		let e = W.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixed().getTone(e) > 57 ? this.secondaryFixedDim() : this.secondaryFixed(),
			contrastCurve: (e) => Q(7)
		});
		return U(super.onSecondaryFixed(), "2026", e);
	}
	onSecondaryFixedVariant() {
		let e = W.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixed().getTone(e) > 57 ? this.secondaryFixedDim() : this.secondaryFixed(),
			contrastCurve: (e) => Q(4.5)
		});
		return U(super.onSecondaryFixedVariant(), "2026", e);
	}
	tertiary() {
		let e = W.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.sourceColorHcts[1]?.tone ?? e.sourceColorHct.tone,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.tertiaryContainer(), this.tertiary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.tertiary(), "2026", e);
	}
	onTertiary() {
		let e = W.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiary(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onTertiary(), "2026", e);
	}
	tertiaryContainer() {
		let e = W.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				let t = e.sourceColorHcts[1] ?? e.sourceColorHct;
				return t.tone > 55 ? B(61, 90, t.tone) : B(20, 49, t.tone);
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.tertiaryContainer(), "2026", e);
	}
	onTertiaryContainer() {
		let e = W.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onTertiaryContainer(), "2026", e);
	}
	tertiaryFixed() {
		let e = W.fromPalette({
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
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.tertiaryFixed(), "2026", e);
	}
	tertiaryFixedDim() {
		let e = W.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => this.tertiaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new q(this.tertiaryFixedDim(), this.tertiaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.tertiaryFixedDim(), "2026", e);
	}
	onTertiaryFixed() {
		let e = W.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixed().getTone(e) > 57 ? this.tertiaryFixedDim() : this.tertiaryFixed(),
			contrastCurve: (e) => Q(7)
		});
		return U(super.onTertiaryFixed(), "2026", e);
	}
	onTertiaryFixedVariant() {
		let e = W.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixed().getTone(e) > 57 ? this.tertiaryFixedDim() : this.tertiaryFixed(),
			contrastCurve: (e) => Q(4.5)
		});
		return U(super.onTertiaryFixedVariant(), "2026", e);
	}
	error() {
		let e = W.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => lo(e.errorPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.errorContainer(), this.error(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return U(super.error(), "2026", e);
	}
	onError() {
		let e = W.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			background: (e) => this.error(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onError(), "2026", e);
	}
	errorContainer() {
		let e = W.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? uo(e.errorPalette) : lo(e.errorPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return U(super.errorContainer(), "2026", e);
	}
	onErrorContainer() {
		let e = W.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => Q(6)
		});
		return U(super.onErrorContainer(), "2026", e);
	}
	primaryDim() {
		let e = Object.assign(this.primary().clone(), { name: "primary_dim" });
		return U(super.primaryDim(), "2026", e);
	}
	secondaryDim() {
		let e = Object.assign(this.secondary().clone(), { name: "secondary_dim" });
		return U(super.secondaryDim(), "2026", e);
	}
	tertiaryDim() {
		let e = Object.assign(this.tertiary().clone(), { name: "tertiary_dim" });
		return U(super.tertiaryDim(), "2026", e);
	}
	errorDim() {
		let e = Object.assign(this.error().clone(), { name: "error_dim" });
		return U(super.errorDim(), "2026", e);
	}
}, $ = class e {
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
$.contentAccentToneDelta = 15, $.colorSpec = new po(), $.primaryPaletteKeyColor = $.colorSpec.primaryPaletteKeyColor(), $.secondaryPaletteKeyColor = $.colorSpec.secondaryPaletteKeyColor(), $.tertiaryPaletteKeyColor = $.colorSpec.tertiaryPaletteKeyColor(), $.neutralPaletteKeyColor = $.colorSpec.neutralPaletteKeyColor(), $.neutralVariantPaletteKeyColor = $.colorSpec.neutralVariantPaletteKeyColor(), $.background = $.colorSpec.background(), $.onBackground = $.colorSpec.onBackground(), $.surface = $.colorSpec.surface(), $.surfaceDim = $.colorSpec.surfaceDim(), $.surfaceBright = $.colorSpec.surfaceBright(), $.surfaceContainerLowest = $.colorSpec.surfaceContainerLowest(), $.surfaceContainerLow = $.colorSpec.surfaceContainerLow(), $.surfaceContainer = $.colorSpec.surfaceContainer(), $.surfaceContainerHigh = $.colorSpec.surfaceContainerHigh(), $.surfaceContainerHighest = $.colorSpec.surfaceContainerHighest(), $.onSurface = $.colorSpec.onSurface(), $.surfaceVariant = $.colorSpec.surfaceVariant(), $.onSurfaceVariant = $.colorSpec.onSurfaceVariant(), $.inverseSurface = $.colorSpec.inverseSurface(), $.inverseOnSurface = $.colorSpec.inverseOnSurface(), $.outline = $.colorSpec.outline(), $.outlineVariant = $.colorSpec.outlineVariant(), $.shadow = $.colorSpec.shadow(), $.scrim = $.colorSpec.scrim(), $.surfaceTint = $.colorSpec.surfaceTint(), $.primary = $.colorSpec.primary(), $.onPrimary = $.colorSpec.onPrimary(), $.primaryContainer = $.colorSpec.primaryContainer(), $.onPrimaryContainer = $.colorSpec.onPrimaryContainer(), $.inversePrimary = $.colorSpec.inversePrimary(), $.secondary = $.colorSpec.secondary(), $.onSecondary = $.colorSpec.onSecondary(), $.secondaryContainer = $.colorSpec.secondaryContainer(), $.onSecondaryContainer = $.colorSpec.onSecondaryContainer(), $.tertiary = $.colorSpec.tertiary(), $.onTertiary = $.colorSpec.onTertiary(), $.tertiaryContainer = $.colorSpec.tertiaryContainer(), $.onTertiaryContainer = $.colorSpec.onTertiaryContainer(), $.error = $.colorSpec.error(), $.onError = $.colorSpec.onError(), $.errorContainer = $.colorSpec.errorContainer(), $.onErrorContainer = $.colorSpec.onErrorContainer(), $.primaryFixed = $.colorSpec.primaryFixed(), $.primaryFixedDim = $.colorSpec.primaryFixedDim(), $.onPrimaryFixed = $.colorSpec.onPrimaryFixed(), $.onPrimaryFixedVariant = $.colorSpec.onPrimaryFixedVariant(), $.secondaryFixed = $.colorSpec.secondaryFixed(), $.secondaryFixedDim = $.colorSpec.secondaryFixedDim(), $.onSecondaryFixed = $.colorSpec.onSecondaryFixed(), $.onSecondaryFixedVariant = $.colorSpec.onSecondaryFixedVariant(), $.tertiaryFixed = $.colorSpec.tertiaryFixed(), $.tertiaryFixedDim = $.colorSpec.tertiaryFixedDim(), $.onTertiaryFixed = $.colorSpec.onTertiaryFixed(), $.onTertiaryFixedVariant = $.colorSpec.onTertiaryFixedVariant();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/dynamic_scheme.js
var mo = class e {
	static maybeFallbackSpecVersion(e, t) {
		return t === J.CMF ? e : t === J.EXPRESSIVE || t === J.VIBRANT || t === J.TONAL_SPOT || t === J.NEUTRAL ? e === "2026" ? "2025" : e : "2021";
	}
	constructor(t) {
		if (t.sourceColorHcts) {
			if (t.sourceColorHcts.length === 0) throw Error("sourceColorHcts cannot be empty");
			this.sourceColorHct = t.sourceColorHcts[0], this.sourceColorHcts = t.sourceColorHcts;
		} else if (t.sourceColorHct) this.sourceColorHct = t.sourceColorHct, this.sourceColorHcts = [t.sourceColorHct];
		else throw Error("sourceColorHct or sourceColorHcts required");
		this.sourceColorArgb = this.sourceColorHct.toInt(), this.variant = t.variant, this.contrastLevel = t.contrastLevel, this.isDark = t.isDark, this.platform = t.platform ?? "phone", this.specVersion = e.maybeFallbackSpecVersion(t.specVersion ?? "2021", this.variant), this.primaryPalette = t.primaryPalette ?? yo(this.specVersion).getPrimaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.secondaryPalette = t.secondaryPalette ?? yo(this.specVersion).getSecondaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.tertiaryPalette = t.tertiaryPalette ?? yo(this.specVersion).getTertiaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralPalette = t.neutralPalette ?? yo(this.specVersion).getNeutralPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralVariantPalette = t.neutralVariantPalette ?? yo(this.specVersion).getNeutralVariantPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.errorPalette = t.errorPalette ?? yo(this.specVersion).getErrorPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel) ?? G.fromHueAndChroma(25, 84), this.colors = new $();
	}
	toString() {
		let e = this.sourceColorHcts.length <= 1 ? "" : `sourceColorHctList=[${this.sourceColorHcts.map((e) => e.toString()).join(", ")}], `;
		return `Scheme: variant=${J[this.variant]}, mode=${this.isDark ? "dark" : "light"}, platform=${this.platform}, contrastLevel=${this.contrastLevel.toFixed(1)}, seed=${this.sourceColorHct.toString()}, ` + e + `specVersion=${this.specVersion}`;
	}
	static getPiecewiseHue(e, t, n) {
		let r = Math.min(t.length - 1, n.length), i = e.hue;
		for (let e = 0; e < r; e++) if (i >= t[e] && i < t[e + 1]) return ba(n[e]);
		return i;
	}
	static getRotatedHue(t, n, r) {
		let i = e.getPiecewiseHue(t, n, r);
		return Math.min(n.length - 1, r.length) <= 0 && (i = 0), ba(t.hue + i);
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
mo.DEFAULT_SPEC_VERSION = "2021", mo.DEFAULT_PLATFORM = "phone";
var ho = class {
	getPrimaryPalette(e, t, n, r, i) {
		switch (e) {
			case J.CONTENT:
			case J.FIDELITY: return G.fromHueAndChroma(t.hue, t.chroma);
			case J.FRUIT_SALAD: return G.fromHueAndChroma(ba(t.hue - 50), 48);
			case J.MONOCHROME: return G.fromHueAndChroma(t.hue, 0);
			case J.NEUTRAL: return G.fromHueAndChroma(t.hue, 12);
			case J.RAINBOW: return G.fromHueAndChroma(t.hue, 48);
			case J.TONAL_SPOT: return G.fromHueAndChroma(t.hue, 36);
			case J.EXPRESSIVE: return G.fromHueAndChroma(ba(t.hue + 240), 40);
			case J.VIBRANT: return G.fromHueAndChroma(t.hue, 200);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getSecondaryPalette(e, t, n, r, i) {
		switch (e) {
			case J.CONTENT:
			case J.FIDELITY: return G.fromHueAndChroma(t.hue, Math.max(t.chroma - 32, t.chroma * .5));
			case J.FRUIT_SALAD: return G.fromHueAndChroma(ba(t.hue - 50), 36);
			case J.MONOCHROME: return G.fromHueAndChroma(t.hue, 0);
			case J.NEUTRAL: return G.fromHueAndChroma(t.hue, 8);
			case J.RAINBOW: return G.fromHueAndChroma(t.hue, 16);
			case J.TONAL_SPOT: return G.fromHueAndChroma(t.hue, 16);
			case J.EXPRESSIVE: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.VIBRANT: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.CONTENT: return G.fromHct(Ja.fixIfDisliked(new no(t).analogous(3, 6)[2]));
			case J.FIDELITY: return G.fromHct(Ja.fixIfDisliked(new no(t).complement));
			case J.FRUIT_SALAD: return G.fromHueAndChroma(t.hue, 36);
			case J.MONOCHROME: return G.fromHueAndChroma(t.hue, 0);
			case J.NEUTRAL: return G.fromHueAndChroma(t.hue, 16);
			case J.RAINBOW:
			case J.TONAL_SPOT: return G.fromHueAndChroma(ba(t.hue + 60), 24);
			case J.EXPRESSIVE: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.VIBRANT: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.CONTENT:
			case J.FIDELITY: return G.fromHueAndChroma(t.hue, t.chroma / 8);
			case J.FRUIT_SALAD: return G.fromHueAndChroma(t.hue, 10);
			case J.MONOCHROME: return G.fromHueAndChroma(t.hue, 0);
			case J.NEUTRAL: return G.fromHueAndChroma(t.hue, 2);
			case J.RAINBOW: return G.fromHueAndChroma(t.hue, 0);
			case J.TONAL_SPOT: return G.fromHueAndChroma(t.hue, 6);
			case J.EXPRESSIVE: return G.fromHueAndChroma(ba(t.hue + 15), 8);
			case J.VIBRANT: return G.fromHueAndChroma(t.hue, 10);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getNeutralVariantPalette(e, t, n, r, i) {
		switch (e) {
			case J.CONTENT: return G.fromHueAndChroma(t.hue, t.chroma / 8 + 4);
			case J.FIDELITY: return G.fromHueAndChroma(t.hue, t.chroma / 8 + 4);
			case J.FRUIT_SALAD: return G.fromHueAndChroma(t.hue, 16);
			case J.MONOCHROME: return G.fromHueAndChroma(t.hue, 0);
			case J.NEUTRAL: return G.fromHueAndChroma(t.hue, 2);
			case J.RAINBOW: return G.fromHueAndChroma(t.hue, 0);
			case J.TONAL_SPOT: return G.fromHueAndChroma(t.hue, 8);
			case J.EXPRESSIVE: return G.fromHueAndChroma(ba(t.hue + 15), 12);
			case J.VIBRANT: return G.fromHueAndChroma(t.hue, 12);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getErrorPalette(e, t, n, r, i) {}
}, go = class e extends ho {
	getPrimaryPalette(e, t, n, r, i) {
		switch (e) {
			case J.NEUTRAL: return G.fromHueAndChroma(t.hue, r === "phone" ? V.isBlue(t.hue) ? 12 : 8 : V.isBlue(t.hue) ? 16 : 12);
			case J.TONAL_SPOT: return G.fromHueAndChroma(t.hue, r === "phone" && n ? 26 : 32);
			case J.EXPRESSIVE: return G.fromHueAndChroma(t.hue, r === "phone" ? n ? 36 : 48 : 40);
			case J.VIBRANT: return G.fromHueAndChroma(t.hue, r === "phone" ? 74 : 56);
			default: return super.getPrimaryPalette(e, t, n, r, i);
		}
	}
	getSecondaryPalette(e, t, n, r, i) {
		switch (e) {
			case J.NEUTRAL: return G.fromHueAndChroma(t.hue, r === "phone" ? V.isBlue(t.hue) ? 6 : 4 : V.isBlue(t.hue) ? 10 : 6);
			case J.TONAL_SPOT: return G.fromHueAndChroma(t.hue, 16);
			case J.EXPRESSIVE: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.VIBRANT: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.NEUTRAL: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.TONAL_SPOT: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.EXPRESSIVE: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
			case J.VIBRANT: return G.fromHueAndChroma(mo.getRotatedHue(t, [
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
		return mo.getRotatedHue(e, [
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
		return r === "phone" ? n ? V.isYellow(i) ? 6 : 14 : 18 : 12;
	}
	static getVibrantNeutralHue(e) {
		return mo.getRotatedHue(e, [
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
		return n === "phone" || V.isBlue(r) ? 28 : 20;
	}
	getNeutralPalette(t, n, r, i, a) {
		switch (t) {
			case J.NEUTRAL: return G.fromHueAndChroma(n.hue, i === "phone" ? 1.4 : 6);
			case J.TONAL_SPOT: return G.fromHueAndChroma(n.hue, i === "phone" ? 5 : 10);
			case J.EXPRESSIVE: return G.fromHueAndChroma(e.getExpressiveNeutralHue(n), e.getExpressiveNeutralChroma(n, r, i));
			case J.VIBRANT: return G.fromHueAndChroma(e.getVibrantNeutralHue(n), e.getVibrantNeutralChroma(n, i));
			default: return super.getNeutralPalette(t, n, r, i, a);
		}
	}
	getNeutralVariantPalette(t, n, r, i, a) {
		switch (t) {
			case J.NEUTRAL: return G.fromHueAndChroma(n.hue, (i === "phone" ? 1.4 : 6) * 2.2);
			case J.TONAL_SPOT: return G.fromHueAndChroma(n.hue, (i === "phone" ? 5 : 10) * 1.7);
			case J.EXPRESSIVE:
				let o = e.getExpressiveNeutralHue(n), s = e.getExpressiveNeutralChroma(n, r, i);
				return G.fromHueAndChroma(o, s * (o >= 105 && o < 125 ? 1.6 : 2.3));
			case J.VIBRANT:
				let c = e.getVibrantNeutralHue(n), l = e.getVibrantNeutralChroma(n, i);
				return G.fromHueAndChroma(c, l * 1.29);
			default: return super.getNeutralVariantPalette(t, n, r, i, a);
		}
	}
	getErrorPalette(e, t, n, r, i) {
		let a = mo.getPiecewiseHue(t, [
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
			case J.NEUTRAL: return G.fromHueAndChroma(a, r === "phone" ? 50 : 40);
			case J.TONAL_SPOT: return G.fromHueAndChroma(a, r === "phone" ? 60 : 48);
			case J.EXPRESSIVE: return G.fromHueAndChroma(a, r === "phone" ? 64 : 48);
			case J.VIBRANT: return G.fromHueAndChroma(a, r === "phone" ? 80 : 60);
			default: return super.getErrorPalette(e, t, n, r, i);
		}
	}
}, _o = new ho(), vo = new go();
function yo(e) {
	return e === "2025" ? vo : _o;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/quantize/lab_point_provider.js
var bo = class {
	fromInt(e) {
		return Fa(e);
	}
	toInt(e) {
		return Pa(e[0], e[1], e[2]);
	}
	distance(e, t) {
		let n = e[0] - t[0], r = e[1] - t[1], i = e[2] - t[2];
		return n * n + r * r + i * i;
	}
}, xo = 10, So = 3, Co = class {
	static quantize(e, t, n) {
		let r = /* @__PURE__ */ new Map(), i = [], a = [], o = new bo(), s = 0;
		for (let t = 0; t < e.length; t++) {
			let n = e[t], c = r.get(n);
			c === void 0 ? (s++, i.push(o.fromInt(n)), a.push(n), r.set(n, 1)) : r.set(n, c + 1);
		}
		let c = [];
		for (let e = 0; e < s; e++) {
			let t = a[e], n = r.get(t);
			n !== void 0 && (c[e] = n);
		}
		let l = Math.min(n, s);
		t.length > 0 && (l = Math.min(l, t.length));
		let u = [];
		for (let e = 0; e < t.length; e++) u.push(o.fromInt(t[e]));
		let d = l - u.length;
		if (t.length === 0 && d > 0) for (let e = 0; e < d; e++) {
			let e = Math.random() * 100, t = Math.random() * 201 + -100, n = Math.random() * 201 + -100;
			u.push([
				e,
				t,
				n
			]);
		}
		let f = [];
		for (let e = 0; e < s; e++) f.push(Math.floor(Math.random() * l));
		let p = [];
		for (let e = 0; e < l; e++) {
			p.push([]);
			for (let t = 0; t < l; t++) p[e].push(0);
		}
		let m = [];
		for (let e = 0; e < l; e++) {
			m.push([]);
			for (let t = 0; t < l; t++) m[e].push(new wo());
		}
		let h = [];
		for (let e = 0; e < l; e++) h.push(0);
		for (let e = 0; e < xo; e++) {
			for (let e = 0; e < l; e++) {
				for (let t = e + 1; t < l; t++) {
					let n = o.distance(u[e], u[t]);
					m[t][e].distance = n, m[t][e].index = e, m[e][t].distance = n, m[e][t].index = t;
				}
				m[e].sort();
				for (let t = 0; t < l; t++) p[e][t] = m[e][t].index;
			}
			let t = 0;
			for (let e = 0; e < s; e++) {
				let n = i[e], r = f[e], a = u[r], s = o.distance(n, a), c = s, d = -1;
				for (let e = 0; e < l; e++) {
					if (m[r][e].distance >= 4 * s) continue;
					let t = o.distance(n, u[e]);
					t < c && (c = t, d = e);
				}
				d !== -1 && Math.abs(Math.sqrt(c) - Math.sqrt(s)) > So && (t++, f[e] = d);
			}
			if (t === 0 && e !== 0) break;
			let n = Array(l).fill(0), r = Array(l).fill(0), a = Array(l).fill(0);
			for (let e = 0; e < l; e++) h[e] = 0;
			for (let e = 0; e < s; e++) {
				let t = f[e], o = i[e], s = c[e];
				h[t] += s, n[t] += o[0] * s, r[t] += o[1] * s, a[t] += o[2] * s;
			}
			for (let e = 0; e < l; e++) {
				let t = h[e];
				if (t === 0) {
					u[e] = [
						0,
						0,
						0
					];
					continue;
				}
				let i = n[e] / t, o = r[e] / t, s = a[e] / t;
				u[e] = [
					i,
					o,
					s
				];
			}
		}
		let g = /* @__PURE__ */ new Map();
		for (let e = 0; e < l; e++) {
			let t = h[e];
			if (t === 0) continue;
			let n = o.toInt(u[e]);
			g.has(n) || g.set(n, t);
		}
		return g;
	}
}, wo = class {
	constructor() {
		this.distance = -1, this.index = -1;
	}
}, To = class {
	static quantize(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			Oa(r) < 255 || t.set(r, (t.get(r) ?? 0) + 1);
		}
		return t;
	}
}, Eo = 5, Do = 33, Oo = 35937, ko = {
	RED: "red",
	GREEN: "green",
	BLUE: "blue"
}, Ao = class {
	constructor(e = [], t = [], n = [], r = [], i = [], a = []) {
		this.weights = e, this.momentsR = t, this.momentsG = n, this.momentsB = r, this.moments = i, this.cubes = a;
	}
	quantize(e, t) {
		this.constructHistogram(e), this.computeMoments();
		let n = this.createBoxes(t);
		return this.createResult(n.resultCount);
	}
	constructHistogram(e) {
		this.weights = Array.from({ length: Oo }).fill(0), this.momentsR = Array.from({ length: Oo }).fill(0), this.momentsG = Array.from({ length: Oo }).fill(0), this.momentsB = Array.from({ length: Oo }).fill(0), this.moments = Array.from({ length: Oo }).fill(0);
		let t = To.quantize(e);
		for (let [e, n] of t.entries()) {
			let t = ka(e), r = Aa(e), i = ja(e), a = (t >> 3) + 1, o = (r >> 3) + 1, s = (i >> 3) + 1, c = this.getIndex(a, o, s);
			this.weights[c] = (this.weights[c] ?? 0) + n, this.momentsR[c] += n * t, this.momentsG[c] += n * r, this.momentsB[c] += n * i, this.moments[c] += n * (t * t + r * r + i * i);
		}
	}
	computeMoments() {
		for (let e = 1; e < Do; e++) {
			let t = Array.from({ length: Do }).fill(0), n = Array.from({ length: Do }).fill(0), r = Array.from({ length: Do }).fill(0), i = Array.from({ length: Do }).fill(0), a = Array.from({ length: Do }).fill(0);
			for (let o = 1; o < Do; o++) {
				let s = 0, c = 0, l = 0, u = 0, d = 0;
				for (let f = 1; f < Do; f++) {
					let p = this.getIndex(e, o, f);
					s += this.weights[p], c += this.momentsR[p], l += this.momentsG[p], u += this.momentsB[p], d += this.moments[p], t[f] += s, n[f] += c, r[f] += l, i[f] += u, a[f] += d;
					let m = this.getIndex(e - 1, o, f);
					this.weights[p] = this.weights[m] + t[f], this.momentsR[p] = this.momentsR[m] + n[f], this.momentsG[p] = this.momentsG[m] + r[f], this.momentsB[p] = this.momentsB[m] + i[f], this.moments[p] = this.moments[m] + a[f];
				}
			}
		}
	}
	createBoxes(e) {
		this.cubes = Array.from({ length: e }).fill(0).map(() => new jo());
		let t = Array.from({ length: e }).fill(0);
		this.cubes[0].r0 = 0, this.cubes[0].g0 = 0, this.cubes[0].b0 = 0, this.cubes[0].r1 = 32, this.cubes[0].g1 = 32, this.cubes[0].b1 = 32;
		let n = e, r = 0;
		for (let i = 1; i < e; i++) {
			this.cut(this.cubes[r], this.cubes[i]) ? (t[r] = this.cubes[r].vol > 1 ? this.variance(this.cubes[r]) : 0, t[i] = this.cubes[i].vol > 1 ? this.variance(this.cubes[i]) : 0) : (t[r] = 0, i--), r = 0;
			let e = t[0];
			for (let n = 1; n <= i; n++) t[n] > e && (e = t[n], r = n);
			if (e <= 0) {
				n = i + 1;
				break;
			}
		}
		return new Mo(e, n);
	}
	createResult(e) {
		let t = [];
		for (let n = 0; n < e; ++n) {
			let e = this.cubes[n], r = this.volume(e, this.weights);
			if (r > 0) {
				let n = Math.round(this.volume(e, this.momentsR) / r), i = Math.round(this.volume(e, this.momentsG) / r), a = Math.round(this.volume(e, this.momentsB) / r), o = 255 << 24 | (n & 255) << 16 | (i & 255) << 8 | a & 255;
				t.push(o);
			}
		}
		return t;
	}
	variance(e) {
		let t = this.volume(e, this.momentsR), n = this.volume(e, this.momentsG), r = this.volume(e, this.momentsB);
		return this.moments[this.getIndex(e.r1, e.g1, e.b1)] - this.moments[this.getIndex(e.r1, e.g1, e.b0)] - this.moments[this.getIndex(e.r1, e.g0, e.b1)] + this.moments[this.getIndex(e.r1, e.g0, e.b0)] - this.moments[this.getIndex(e.r0, e.g1, e.b1)] + this.moments[this.getIndex(e.r0, e.g1, e.b0)] + this.moments[this.getIndex(e.r0, e.g0, e.b1)] - this.moments[this.getIndex(e.r0, e.g0, e.b0)] - (t * t + n * n + r * r) / this.volume(e, this.weights);
	}
	cut(e, t) {
		let n = this.volume(e, this.momentsR), r = this.volume(e, this.momentsG), i = this.volume(e, this.momentsB), a = this.volume(e, this.weights), o = this.maximize(e, ko.RED, e.r0 + 1, e.r1, n, r, i, a), s = this.maximize(e, ko.GREEN, e.g0 + 1, e.g1, n, r, i, a), c = this.maximize(e, ko.BLUE, e.b0 + 1, e.b1, n, r, i, a), l, u = o.maximum, d = s.maximum, f = c.maximum;
		if (u >= d && u >= f) {
			if (o.cutLocation < 0) return !1;
			l = ko.RED;
		} else l = d >= u && d >= f ? ko.GREEN : ko.BLUE;
		switch (t.r1 = e.r1, t.g1 = e.g1, t.b1 = e.b1, l) {
			case ko.RED:
				e.r1 = o.cutLocation, t.r0 = e.r1, t.g0 = e.g0, t.b0 = e.b0;
				break;
			case ko.GREEN:
				e.g1 = s.cutLocation, t.r0 = e.r0, t.g0 = e.g1, t.b0 = e.b0;
				break;
			case ko.BLUE:
				e.b1 = c.cutLocation, t.r0 = e.r0, t.g0 = e.g0, t.b0 = e.b1;
				break;
			default: throw Error("unexpected direction " + l);
		}
		return e.vol = (e.r1 - e.r0) * (e.g1 - e.g0) * (e.b1 - e.b0), t.vol = (t.r1 - t.r0) * (t.g1 - t.g0) * (t.b1 - t.b0), !0;
	}
	maximize(e, t, n, r, i, a, o, s) {
		let c = this.bottom(e, t, this.momentsR), l = this.bottom(e, t, this.momentsG), u = this.bottom(e, t, this.momentsB), d = this.bottom(e, t, this.weights), f = 0, p = -1, m = 0, h = 0, g = 0, _ = 0;
		for (let v = n; v < r; v++) {
			if (m = c + this.top(e, t, v, this.momentsR), h = l + this.top(e, t, v, this.momentsG), g = u + this.top(e, t, v, this.momentsB), _ = d + this.top(e, t, v, this.weights), _ === 0) continue;
			let n = (m * m + h * h + g * g) * 1, r = _ * 1, y = n / r;
			m = i - m, h = a - h, g = o - g, _ = s - _, _ !== 0 && (n = (m * m + h * h + g * g) * 1, r = _ * 1, y += n / r, y > f && (f = y, p = v));
		}
		return new No(p, f);
	}
	volume(e, t) {
		return t[this.getIndex(e.r1, e.g1, e.b1)] - t[this.getIndex(e.r1, e.g1, e.b0)] - t[this.getIndex(e.r1, e.g0, e.b1)] + t[this.getIndex(e.r1, e.g0, e.b0)] - t[this.getIndex(e.r0, e.g1, e.b1)] + t[this.getIndex(e.r0, e.g1, e.b0)] + t[this.getIndex(e.r0, e.g0, e.b1)] - t[this.getIndex(e.r0, e.g0, e.b0)];
	}
	bottom(e, t, n) {
		switch (t) {
			case ko.RED: return -n[this.getIndex(e.r0, e.g1, e.b1)] + n[this.getIndex(e.r0, e.g1, e.b0)] + n[this.getIndex(e.r0, e.g0, e.b1)] - n[this.getIndex(e.r0, e.g0, e.b0)];
			case ko.GREEN: return -n[this.getIndex(e.r1, e.g0, e.b1)] + n[this.getIndex(e.r1, e.g0, e.b0)] + n[this.getIndex(e.r0, e.g0, e.b1)] - n[this.getIndex(e.r0, e.g0, e.b0)];
			case ko.BLUE: return -n[this.getIndex(e.r1, e.g1, e.b0)] + n[this.getIndex(e.r1, e.g0, e.b0)] + n[this.getIndex(e.r0, e.g1, e.b0)] - n[this.getIndex(e.r0, e.g0, e.b0)];
			default: throw Error("unexpected direction $direction");
		}
	}
	top(e, t, n, r) {
		switch (t) {
			case ko.RED: return r[this.getIndex(n, e.g1, e.b1)] - r[this.getIndex(n, e.g1, e.b0)] - r[this.getIndex(n, e.g0, e.b1)] + r[this.getIndex(n, e.g0, e.b0)];
			case ko.GREEN: return r[this.getIndex(e.r1, n, e.b1)] - r[this.getIndex(e.r1, n, e.b0)] - r[this.getIndex(e.r0, n, e.b1)] + r[this.getIndex(e.r0, n, e.b0)];
			case ko.BLUE: return r[this.getIndex(e.r1, e.g1, n)] - r[this.getIndex(e.r1, e.g0, n)] - r[this.getIndex(e.r0, e.g1, n)] + r[this.getIndex(e.r0, e.g0, n)];
			default: throw Error("unexpected direction $direction");
		}
	}
	getIndex(e, t, n) {
		return (e << 10) + (e << 6) + e + (t << Eo) + t + n;
	}
}, jo = class {
	constructor(e = 0, t = 0, n = 0, r = 0, i = 0, a = 0, o = 0) {
		this.r0 = e, this.r1 = t, this.g0 = n, this.g1 = r, this.b0 = i, this.b1 = a, this.vol = o;
	}
}, Mo = class {
	constructor(e, t) {
		this.requestedCount = e, this.resultCount = t;
	}
}, No = class {
	constructor(e, t) {
		this.cutLocation = e, this.maximum = t;
	}
}, Po = class {
	static quantize(e, t) {
		let n = new Ao().quantize(e, t);
		return Co.quantize(e, n, t);
	}
}, Fo = {
	desired: 4,
	fallbackColorARGB: 4282549748,
	filter: !0
};
function Io(e, t) {
	return e.score > t.score ? -1 : +(e.score < t.score);
}
var Lo = class e {
	constructor() {}
	static score(t, n) {
		let { desired: r, fallbackColorARGB: i, filter: a } = {
			...Fo,
			...n
		}, o = [], s = Array(360).fill(0), c = 0;
		for (let [e, n] of t.entries()) {
			let t = V.fromInt(e);
			o.push(t);
			let r = Math.floor(t.hue);
			s[r] += n, c += n;
		}
		let l = Array(360).fill(0);
		for (let e = 0; e < 360; e++) {
			let t = s[e] / c;
			for (let n = e - 14; n < e + 16; n++) {
				let e = ya(n);
				l[e] += t;
			}
		}
		let u = [];
		for (let t of o) {
			let n = l[ya(Math.round(t.hue))];
			if (a && (t.chroma < e.CUTOFF_CHROMA || n <= e.CUTOFF_EXCITED_PROPORTION)) continue;
			let r = n * 100 * e.WEIGHT_PROPORTION, i = t.chroma < e.TARGET_CHROMA ? e.WEIGHT_CHROMA_BELOW : e.WEIGHT_CHROMA_ABOVE, o = r + (t.chroma - e.TARGET_CHROMA) * i;
			u.push({
				hct: t,
				score: o
			});
		}
		u.sort(Io);
		let d = [];
		for (let e = 90; e >= 15; e--) {
			d.length = 0;
			for (let { hct: t } of u) if (d.find((n) => xa(t.hue, n.hue) < e) || d.push(t), d.length >= r) break;
			if (d.length >= r) break;
		}
		let f = [];
		d.length === 0 && f.push(i);
		for (let e of d) f.push(e.toInt());
		return f;
	}
};
Lo.TARGET_CHROMA = 48, Lo.WEIGHT_PROPORTION = .7, Lo.WEIGHT_CHROMA_ABOVE = .3, Lo.WEIGHT_CHROMA_BELOW = .1, Lo.CUTOFF_CHROMA = 5, Lo.CUTOFF_EXCITED_PROPORTION = .01;
//#endregion
//#region packages/ui-kit/src/theme/m3-theme.ts
var Ro = new $(), zo = W.fromPalette({
	name: "on_on_primary",
	palette: (e) => e.primaryPalette,
	background: () => Ro.onPrimary(),
	contrastCurve: () => new K(6, 6, 7, 11)
}), Bo = W.fromPalette({
	name: "primary_container_subtle",
	palette: (e) => e.primaryPalette,
	isBackground: !0,
	background: (e) => Ro.highestSurface(e),
	contrastCurve: () => void 0
}), Vo = W.fromPalette({
	name: "on_primary_container_subtle",
	palette: (e) => e.primaryPalette,
	background: () => Bo,
	contrastCurve: () => new K(6, 6, 7, 11)
}), Ho = W.fromPalette({
	name: "secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	isBackground: !0,
	background: (e) => Ro.highestSurface(e),
	contrastCurve: () => void 0
}), Uo = W.fromPalette({
	name: "on_secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	background: () => Ho,
	contrastCurve: () => new K(6, 6, 7, 11)
}), Wo = W.fromPalette({
	name: "tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	isBackground: !0,
	background: (e) => Ro.highestSurface(e),
	contrastCurve: () => void 0
}), Go = W.fromPalette({
	name: "on_tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	background: () => Wo,
	contrastCurve: () => new K(6, 6, 7, 11)
}), Ko = W.fromPalette({
	name: "error_container_subtle",
	palette: (e) => e.errorPalette,
	isBackground: !0,
	background: (e) => Ro.highestSurface(e),
	contrastCurve: () => void 0
}), qo = W.fromPalette({
	name: "on_error_container_subtle",
	palette: (e) => e.errorPalette,
	background: () => Ko,
	contrastCurve: () => new K(6, 6, 7, 11)
}), Jo = [
	...Ro.allColors.filter((e) => e.name !== "background" && e.name !== "on_background"),
	Ro.shadow(),
	Ro.scrim(),
	zo,
	Bo,
	Vo,
	Ho,
	Uo,
	Wo,
	Go,
	Ko,
	qo
], Yo = [
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
function Xo(e) {
	return /primary|secondary|tertiary/.test(e);
}
function Zo(e) {
	let t = (e & 16777215).toString(16).padStart(6, "0");
	return t[0] === t[1] && t[2] === t[3] && t[4] === t[5] ? `#${t[0]}${t[2]}${t[4]}` : `#${t}`;
}
function Qo(e) {
	let t = e.replace("#", "").trim();
	if (t.length === 3) {
		let e = t[0] + t[0], n = t[1] + t[1], r = t[2] + t[2];
		return Number.parseInt(`ff${e}${n}${r}`, 16);
	}
	return t.length === 6 ? Number.parseInt(`ff${t}`, 16) : t.length === 8 ? Number.parseInt(t, 16) : null;
}
function $o(e) {
	return e.replaceAll("_", "-");
}
function es(e, t) {
	return new mo({
		sourceColorHcts: [V.fromInt(e)],
		variant: J.TONAL_SPOT,
		contrastLevel: 0,
		specVersion: "2025",
		isDark: t
	});
}
function ts(e, t) {
	let n = es(e, t), r = {};
	for (let e of Jo) {
		let t = $o(e.name);
		Xo(t) && (r[`--color-${t}`] = Zo(e.getArgb(n)));
	}
	for (let e of Yo) {
		let t = r[`--color-${e.source}`];
		t && (r[`--color-${e.name}`] = t);
	}
	return r;
}
function ns(e) {
	let t = es(e, !1), n = [
		t.primaryPalette,
		t.secondaryPalette,
		t.tertiaryPalette
	], r = [];
	for (let e of [90, 80]) for (let t of n) r.push({
		background: Zo(t.tone(e)),
		foreground: Zo(t.tone(10))
	});
	return r;
}
function rs(e) {
	let t = e.map((e) => G.fromInt(e)), n = [], r = /* @__PURE__ */ new Set();
	function i(e, t) {
		let i = Zo(e.tone(t));
		r.has(i) || n.length >= 6 || (r.add(i), n.push({
			background: i,
			foreground: Zo(e.tone(10))
		}));
	}
	for (let e of t) i(e, 90);
	for (let e of t) i(e, 80);
	let a = e[0] ?? 4278216887;
	for (let e of ns(a)) {
		if (n.length >= 6) break;
		r.has(e.background) || (r.add(e.background), n.push(e));
	}
	return n;
}
function is(e, t) {
	let n = e === "dark", r = es((t ? Qo(t) : null) ?? 4278216887, n), i = {};
	for (let e of Jo) {
		let t = $o(e.name);
		i[t] = Zo(e.getArgb(r));
	}
	return {
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
ha(is("light"), is("dark")), typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), sr(["input"]), sr(["change"]), sr(["change"]), sr(["change"]);
//#endregion
//#region packages/ui-kit/src/timetable-preview/day-labels.ts
var as = [
	"",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"日"
];
function os(e) {
	return as[e] ?? "?";
}
//#endregion
//#region packages/ui-kit/src/utils/middle-truncate.ts
var ss = "…", cs = /[\s《》「」『』【】（）()·—\-、，,：:；;！!？?.…]/u, ls, us;
function ds(e) {
	if (typeof Intl < "u" && typeof Intl.Segmenter == "function") {
		ls ??= new Intl.Segmenter("und", { granularity: "grapheme" });
		let t = [];
		for (let n of ls.segment(e)) t.push(n.segment);
		return t;
	}
	return Array.from(e);
}
function fs() {
	return typeof Intl > "u" || typeof Intl.Segmenter != "function" ? null : (us ??= new Intl.Segmenter("zh-CN", { granularity: "word" }), us);
}
function ps(e, t) {
	let n = t.length, r = /* @__PURE__ */ new Set([0, n]), i = fs();
	if (i) {
		let a = new Uint32Array(e.length + 1), o = 0;
		for (let e = 0; e < n; e += 1) {
			let n = t[e].length;
			for (let t = 0; t < n; t += 1) a[o + t] = e;
			o += n;
		}
		a[o] = n;
		for (let t of i.segment(e)) {
			if (!t.isWordLike) continue;
			let e = a[t.index] ?? n, i = a[t.index + t.segment.length] ?? n;
			r.add(e), r.add(i);
		}
	}
	for (let e = 1; e < n; e += 1) {
		let n = t[e - 1] ?? "", i = t[e] ?? "";
		(cs.test(n) || cs.test(i)) && r.add(e);
	}
	return [...r].sort((e, t) => e - t);
}
function ms(e, t, n) {
	if (t <= 0) return {
		prefixLength: 0,
		suffixLength: 0
	};
	if (t >= e.length) return {
		prefixLength: e.length,
		suffixLength: 0
	};
	let r = Math.ceil(t / 2), i = Math.floor(t / 2), a = n ?? ps(e.join(""), e), o = r, s = hs(a, r);
	s != null && !(s === 0 && r > 0) && (o = s);
	let c = i, l = gs(a, e.length - i);
	return l != null && l < e.length && (c = e.length - l), {
		prefixLength: o,
		suffixLength: c
	};
}
function hs(e, t) {
	let n = null;
	for (let r of e) {
		if (r > t) break;
		n = r;
	}
	return n;
}
function gs(e, t) {
	for (let n of e) if (n >= t) return n;
	return null;
}
function _s(e, t, n, r) {
	if (t <= 0) return n;
	if (t >= e.length) return e.join("");
	let { prefixLength: i, suffixLength: a } = ms(e, t, r);
	return i <= 0 && a <= 0 ? n : `${e.slice(0, i).join("")}${n}${a > 0 ? e.slice(e.length - a).join("") : ""}`;
}
function vs(e, t, n = ss) {
	if (!e || t(e)) return e;
	if (!t(n)) return "";
	let r = ds(e), i = ps(e, r), a = n, o = 0, s = r.length;
	for (; o <= s;) {
		let e = Math.floor((o + s) / 2), c = _s(r, e, n, i);
		t(c) ? (a = c, o = e + 1) : s = e - 1;
	}
	return a;
}
var ys = null;
function bs(e) {
	if (typeof document > "u") return () => Infinity;
	ys ??= document.createElement("canvas");
	let t = ys.getContext("2d");
	return t ? (t.font = e, (e) => t.measureText(e).width) : () => Infinity;
}
function xs(e, t, n, r = 6) {
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
function Ss(e) {
	let t = getComputedStyle(e), n = t.fontStyle || "normal", r = t.fontWeight || "normal", i = t.fontFamily || "sans-serif";
	return (e) => bs(`${n} ${r} ${e}px ${i}`);
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/MiddleTruncateText.svelte
var Cs = /* @__PURE__ */ L("<span></span>");
function ws(e, t) {
	Re(t, !0);
	let n = Kr(t, "class", 3, ""), r = /* @__PURE__ */ Lt(null);
	function i(e) {
		let n = t.text;
		if (e.clientWidth <= 0 || e.clientHeight <= 0) {
			e.textContent = n, e.removeAttribute("title");
			return;
		}
		let r = vs(n, (t) => (e.textContent = t, e.scrollHeight <= e.clientHeight + .5));
		e.textContent = r, r === n ? e.removeAttribute("title") : e.title = n;
	}
	let a = (e) => {
		j(r, e, !0);
		let t = new ResizeObserver(() => {
			i(e);
		});
		return t.observe(e), () => {
			t.disconnect(), j(r, null);
		};
	};
	un(() => {
		t.text, t.style, I(r) && i(I(r));
	});
	var o = Cs();
	Ir(o, () => a), N(() => {
		Hr(o, 1, `block min-w-0 overflow-hidden break-all whitespace-normal ${n() ?? ""}`), z(o, t.style);
	}), R(e, o), ze();
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/timetable-grid-chrome.ts
function Ts(e) {
	return e ? "" : "bg-surface";
}
function Es(e) {
	return e ? "bg-[var(--dynamic-tint-sidebar)]" : "bg-surface";
}
function Ds(e) {
	return e ? "timetable-dynamic-tint-body" : "bg-surface";
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetablePreviewGrid.svelte
var Os = /* @__PURE__ */ L("<div class=\"flex min-w-0 flex-1 flex-col items-center\"><span class=\"m3-body-small text-on-surface-variant\"> </span> <div> </div></div>"), ks = /* @__PURE__ */ L("<div class=\"flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center\"><div><span class=\"m3-body-medium font-bold\"> </span> <span> <br/> </span></div></div>"), As = /* @__PURE__ */ L("<button type=\"button\"><span class=\"text-on-surface-variant\"> </span></button>"), js = /* @__PURE__ */ L("<div><span class=\"text-on-surface-variant\"> </span></div>"), Ms = /* @__PURE__ */ L("<span class=\"mb-0.5 flex w-full shrink-0 justify-center\"><span class=\"max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap\"> </span></span>"), Ns = /* @__PURE__ */ L("<div class=\"overflow-hidden whitespace-nowrap\"> </div>"), Ps = /* @__PURE__ */ L("<div class=\"mt-1.5 shrink-0 overflow-hidden leading-tight\"></div>"), Fs = /* @__PURE__ */ L("<div class=\"mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap\"> </div>"), Is = /* @__PURE__ */ L("<button type=\"button\"><!> <!> <!> <!></button>"), Ls = /* @__PURE__ */ L("<div><!> <!> <!> <!></div>"), Rs = /* @__PURE__ */ L("<div class=\"absolute box-border overflow-hidden\"><!></div>"), zs = /* @__PURE__ */ L("<div><div><div class=\"m3-body-small flex w-[var(--sidebar-width)] flex-col items-center text-center text-on-surface-variant\"><span> </span> <span>月</span></div> <div class=\"flex min-w-0 flex-1\"></div></div> <div role=\"region\" aria-label=\"课表预览\"><div class=\"flex\"><aside aria-label=\"节次与时间\" class=\"shrink-0\"></aside> <div class=\"relative min-w-0 flex-1\"></div></div></div></div>");
function Bs(e, t) {
	Re(t, !0);
	let n = Kr(t, "hasDynamicBackground", 3, !1), r = Kr(t, "layoutMode", 3, "fixed"), i = Kr(t, "capsuleCornerStyle", 3, "rounded"), a = Kr(t, "interactive", 3, !1), o = Kr(t, "isCurrentWeek", 3, !1), s = Kr(t, "courseBadges", 19, () => ({})), c = /* @__PURE__ */ Lt(0), l = /* @__PURE__ */ Lt(0), u = /* @__PURE__ */ Lt(Ut(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ Lt(Ut(/* @__PURE__ */ new Date())), f = /* @__PURE__ */ k(() => t.expandedSlots ?? I(u)), p = /* @__PURE__ */ k(() => t.gridModel.visibleDays.length), m = /* @__PURE__ */ k(() => I(p) > 0 ? I(c) / I(p) : 0), h = /* @__PURE__ */ k(() => sa(t.gridModel.periods)), g = /* @__PURE__ */ k(() => Li({
		courseDisplayModels: t.courseDisplayModels,
		visibleDays: t.gridModel.visibleDays,
		columnWidthPx: I(m),
		expandedSlotKeys: I(f),
		coursePalette: t.coursePalette,
		paletteCourses: t.paletteCourses,
		layoutMode: r(),
		capsuleCornerStyle: i()
	})), _ = /* @__PURE__ */ k(() => Ts(n())), v = /* @__PURE__ */ k(() => r() === "compact"), y = /* @__PURE__ */ k(() => t.currentPeriodIndex === void 0 ? o() ? la(I(h), ca(I(d))) : null : t.currentPeriodIndex), b = /* @__PURE__ */ k(() => !I(v) || I(l) <= 0 || t.gridModel.displayedPeriodCount <= 0 ? "5.5rem" : `${I(l) / t.gridModel.displayedPeriodCount}px`);
	un(() => {
		if (t.currentPeriodIndex !== void 0 || !o()) return;
		let e, n = () => {
			let t = (() => {
				let e = I(h);
				if (e.length === 0) return 6e4;
				let t = ca(/* @__PURE__ */ new Date()), n = null;
				for (let r of e) {
					if (t < r.startMinutes) {
						n = r.startMinutes;
						break;
					}
					if (t < r.endMinutes) {
						n = r.endMinutes;
						break;
					}
				}
				return n == null ? 6e4 : Math.max((n - t) * 6e4, 1e3);
			})();
			e = setTimeout(() => {
				j(d, /* @__PURE__ */ new Date(), !0), n();
			}, t);
		};
		return n(), () => clearTimeout(e);
	});
	function x(e) {
		return (t) => {
			let n = () => {
				let { lines: n, maxFontPx: r, fromParent: i = !1 } = e(), a = n.filter((e) => e.length > 0), o = (i ? t.parentElement ?? t : t).clientWidth;
				if (i) {
					let e = getComputedStyle(t);
					o -= (Number.parseFloat(e.paddingLeft) || 0) + (Number.parseFloat(e.paddingRight) || 0), o = Math.max(0, o);
				}
				if (o <= 0 || a.length === 0) return;
				let s = Ss(t), c = xs(o, (e) => {
					let t = s(e);
					return Math.max(...a.map((e) => t(e)));
				}, r, 6);
				t.style.fontSize = `${c}px`;
			}, r = null, i = new ResizeObserver(n);
			return un(() => {
				let { fromParent: a = !1 } = e(), o = a ? t.parentElement ?? t : t;
				r !== o && (i.disconnect(), i.observe(o), r = o), n();
			}), () => i.disconnect();
		};
	}
	function S(e) {
		t.onExpandSlot ? t.onExpandSlot(e) : j(u, /* @__PURE__ */ new Set([...I(u), e]), !0);
	}
	function C(e) {
		return e.slice(8, 10);
	}
	function w(e) {
		return [
			e.topLeft ? "rounded-tl-xl" : null,
			e.topRight ? "rounded-tr-xl" : null,
			e.bottomLeft ? "rounded-bl-xl" : null,
			e.bottomRight ? "rounded-br-xl" : null
		].filter((e) => e != null).join(" ");
	}
	let ee = (e) => {
		let t = () => {
			j(c, e.clientWidth, !0);
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, te = (e) => {
		let t = e;
		j(l, t.clientHeight, !0);
		let n = new ResizeObserver(() => {
			j(l, t.clientHeight, !0);
		});
		return n.observe(t), () => {
			n.disconnect();
		};
	};
	var ne = zs(), re = M(ne), ie = M(re), ae = M(ie), oe = M(ae, !0);
	D(ae), Ae(2), D(ie);
	var se = $t(ie, 2);
	Ar(se, 21, () => t.gridModel.visibleDays, (e) => e.dayOfWeek, (e, t) => {
		var n = Os(), r = M(n), i = M(r, !0);
		D(r);
		var a = $t(r, 2), o = M(a, !0);
		D(a), D(n), N((e, n) => {
			_r(i, e), Hr(a, 1, `m3-body-medium mt-1 flex size-[26px] items-center justify-center rounded-full ${I(t).isToday ? "bg-brand text-on-primary" : "text-on-surface"}`), _r(o, n);
		}, [() => os(I(t).dayOfWeek), () => C(I(t).date)]), R(e, n);
	}), D(se), D(re);
	var ce = $t(re, 2), le = M(ce);
	let ue;
	var de = M(le);
	let fe;
	Ar(de, 21, () => t.gridModel.periods, (e) => e.index, (e, t) => {
		let n = /* @__PURE__ */ k(() => o() && I(t).index === I(y));
		var r = ks(), i = M(r), a = M(i), s = M(a, !0);
		D(a);
		var c = $t(a, 2), l = M(c, !0), u = $t(l, 2, !0);
		D(c), D(i), D(r), N(() => {
			Hr(i, 1, `flex h-full w-full flex-col items-center justify-center rounded-2xl ${I(n) ? "period-active" : ""}`), _r(s, I(t).index), Hr(c, 1, `m3-caption mt-1 leading-tight ${I(n) ? "" : "text-on-surface-variant"}`), _r(l, I(t).startTime), _r(u, I(t).endTime);
		}), R(e, r);
	}), D(de);
	var pe = $t(de, 2);
	let me;
	Ar(pe, 21, () => I(g), (e) => e.key, (e, n) => {
		let r = /* @__PURE__ */ k(() => I(n).geometry.endPeriod - I(n).geometry.startPeriod + 1);
		var i = Rs();
		let o;
		var c = M(i), l = (e) => {
			var t = mr(), r = Qt(t), i = (e) => {
				var t = As(), r = M(t);
				let i;
				var a = M(r);
				D(r), D(t), N((e) => {
					Hr(t, 1, `flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center ${e ?? ""}`), i = z(r, "", i, { "font-size": `${I(n).placeholderPx ?? ""}px` }), _r(a, `此时段有 ${I(n).count ?? ""} 门课程重叠`);
				}, [() => w(I(n).corners)]), or("click", t, () => S(I(n).key)), R(e, t);
			}, o = (e) => {
				var t = js(), r = M(t);
				let i;
				var a = M(r);
				D(r), D(t), N((e) => {
					Hr(t, 1, `flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center ${e ?? ""}`), i = z(r, "", i, { "font-size": `${I(n).placeholderPx ?? ""}px` }), _r(a, `${I(n).count ?? ""} 门课程重叠`);
				}, [() => w(I(n).corners)]), R(e, t);
			};
			Tr(r, (e) => {
				a() ? e(i) : e(o, -1);
			}), R(e, t);
		}, u = (e) => {
			let r = /* @__PURE__ */ k(() => s()[I(n).course.id] ?? []), i = /* @__PURE__ */ k(() => I(n).badgeLabel || I(r)[0]?.text);
			var o = mr(), c = Qt(o), l = (e) => {
				var r = Is();
				let a;
				var o = M(r), s = (e) => {
					var t = Ms(), r = M(t);
					let a;
					var o = M(r, !0);
					D(r), Ir(r, () => x(() => ({
						lines: [I(i)],
						maxFontPx: I(n).scale.badgePx,
						fromParent: !0
					}))), D(t), N(() => {
						a = z(r, "", a, {
							"background-color": "color-mix(in srgb, currentColor 12%, transparent)",
							color: "color-mix(in srgb, currentColor 80%, transparent)",
							"font-size": `${I(n).scale.badgePx ?? ""}px`
						}), _r(o, I(i));
					}), R(e, t);
				};
				Tr(o, (e) => {
					I(i) && e(s);
				});
				var c = $t(o, 2);
				ws(c, {
					get text() {
						return I(n).course.name;
					},
					class: "min-h-0 flex-1 leading-tight font-medium",
					get style() {
						return `font-size: ${I(n).scale.titlePx ?? ""}px`;
					}
				});
				var l = $t(c, 2), u = (e) => {
					var t = Ps();
					Ar(t, 21, () => I(n).locationLines, Er, (e, t) => {
						var n = Ns(), r = M(n, !0);
						D(n), N(() => _r(r, I(t))), R(e, n);
					}), D(t), Ir(t, () => x(() => ({
						lines: I(n).locationLines,
						maxFontPx: I(n).locationMetrics.fontPx
					}))), N(() => z(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${I(n).locationMetrics.fontPx ?? ""}px; height: ${I(n).locationMetrics.heightPx ?? ""}px`)), R(e, t);
				};
				Tr(l, (e) => {
					I(n).locationLines.length > 0 && e(u);
				});
				var d = $t(l, 2), f = (e) => {
					var t = Fs(), r = M(t, !0);
					D(t), Ir(t, () => x(() => ({
						lines: [I(n).teacher],
						maxFontPx: I(n).scale.detailPx
					}))), N(() => {
						z(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${I(n).scale.detailPx ?? ""}px`), _r(r, I(n).teacher);
					}), R(e, t);
				};
				Tr(d, (e) => {
					I(n).teacher && e(f);
				}), D(r), N((e) => {
					Hr(r, 1, `course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left ${e ?? ""} ${I(n).displayModel.isInDisplayedWeek ? "" : "opacity-45"}`), a = z(r, "", a, {
						"--capsule": I(n).colors.background,
						"--capsule-fg": I(n).colors.text
					});
				}, [() => w(I(n).corners)]), or("click", r, () => t.onCourseClick?.(I(n).course)), R(e, r);
			}, u = (e) => {
				var t = Ls();
				let r;
				var a = M(t), o = (e) => {
					var t = Ms(), r = M(t);
					let a;
					var o = M(r, !0);
					D(r), Ir(r, () => x(() => ({
						lines: [I(i)],
						maxFontPx: I(n).scale.badgePx,
						fromParent: !0
					}))), D(t), N(() => {
						a = z(r, "", a, {
							"background-color": "color-mix(in srgb, currentColor 12%, transparent)",
							color: "color-mix(in srgb, currentColor 80%, transparent)",
							"font-size": `${I(n).scale.badgePx ?? ""}px`
						}), _r(o, I(i));
					}), R(e, t);
				};
				Tr(a, (e) => {
					I(i) && e(o);
				});
				var s = $t(a, 2);
				ws(s, {
					get text() {
						return I(n).course.name;
					},
					class: "min-h-0 flex-1 leading-tight font-medium",
					get style() {
						return `font-size: ${I(n).scale.titlePx ?? ""}px`;
					}
				});
				var c = $t(s, 2), l = (e) => {
					var t = Ps();
					Ar(t, 21, () => I(n).locationLines, Er, (e, t) => {
						var n = Ns(), r = M(n, !0);
						D(n), N(() => _r(r, I(t))), R(e, n);
					}), D(t), Ir(t, () => x(() => ({
						lines: I(n).locationLines,
						maxFontPx: I(n).locationMetrics.fontPx
					}))), N(() => z(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${I(n).locationMetrics.fontPx ?? ""}px; height: ${I(n).locationMetrics.heightPx ?? ""}px`)), R(e, t);
				};
				Tr(c, (e) => {
					I(n).locationLines.length > 0 && e(l);
				});
				var u = $t(c, 2), d = (e) => {
					var t = Fs(), r = M(t, !0);
					D(t), Ir(t, () => x(() => ({
						lines: [I(n).teacher],
						maxFontPx: I(n).scale.detailPx
					}))), N(() => {
						z(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${I(n).scale.detailPx ?? ""}px`), _r(r, I(n).teacher);
					}), R(e, t);
				};
				Tr(u, (e) => {
					I(n).teacher && e(d);
				}), D(t), N((e) => {
					Hr(t, 1, `course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left ${e ?? ""} ${I(n).displayModel.isInDisplayedWeek ? "" : "opacity-45"}`), r = z(t, "", r, {
						"--capsule": I(n).colors.background,
						"--capsule-fg": I(n).colors.text
					});
				}, [() => w(I(n).corners)]), R(e, t);
			};
			Tr(c, (e) => {
				a() ? e(l) : e(u, -1);
			}), R(e, o);
		};
		Tr(c, (e) => {
			I(n).kind === "overlap-placeholder" ? e(l) : e(u, -1);
		}), D(i), N(() => o = z(i, "", o, {
			top: `calc((var(--row-height) * ${I(n).geometry.startPeriod - 1}))`,
			left: `${I(n).geometry.leftPercent ?? ""}%`,
			width: `${I(n).geometry.widthPercent ?? ""}%`,
			height: `calc(var(--row-height) * ${I(r) ?? ""})`
		})), R(e, i);
	}), D(pe), Ir(pe, () => ee), D(le), D(ce), Ir(ce, () => te), D(ne), N((e, n) => {
		Hr(ne, 1, `relative flex h-full min-h-0 w-full flex-1 flex-col ${I(_) ?? ""}`), z(ne, `--row-height: ${I(b) ?? ""}; --sidebar-width: 3.25rem`), Hr(re, 1, `flex shrink-0 items-center py-2 ${e ?? ""}`), _r(oe, t.gridModel.monthLabel), Hr(ce, 1, `min-h-0 flex-1 ${I(v) ? "overflow-hidden" : "overflow-y-auto"} ${n ?? ""}`), ue = z(le, "", ue, { height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})` }), fe = z(de, "", fe, {
			width: "var(--sidebar-width)",
			height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})`
		}), me = z(pe, "", me, { height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})` });
	}, [() => Es(n()), () => Ds(n())]), R(e, ne), ze();
}
sr(["click"]);
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetableWallpaperLayer.svelte
var Vs = /* @__PURE__ */ L("<div class=\"absolute inset-0\"></div>"), Hs = /* @__PURE__ */ L("<div class=\"relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden\"><!> <!></div>");
function Us(e, t) {
	let n = Kr(t, "wallpaperUri", 3, null);
	var r = Hs(), i = M(r), a = (e) => {
		var t = Vs();
		let r;
		N(() => r = z(t, "", r, {
			"background-image": `url("${n()}")`,
			"background-size": "cover",
			"background-position": "center",
			"background-repeat": "no-repeat"
		})), R(e, t);
	};
	Tr(i, (e) => {
		n() && e(a);
	});
	var o = $t(i, 2), s = (e) => {
		var n = mr();
		wr(Qt(n), () => t.children), R(e, n);
	};
	Tr(o, (e) => {
		t.children && e(s);
	}), D(r), R(e, r);
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
sr(["change"]), sr(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function Ws(e) {
	return {
		[pa]: !0,
		mount(t, n) {
			let r = vr(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				Sr(r);
			} };
		}
	};
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetableLivePreview.svelte
var Gs = /* @__PURE__ */ L("<div class=\"flex min-h-[12rem] items-center justify-center p-8\"><p class=\"m3-body-medium text-center text-on-surface-variant\">暂无课表，导入后可预览效果</p></div>");
function Ks(e, t) {
	Re(t, !0);
	let n = Kr(t, "hasDynamicBackground", 3, !1), r = Kr(t, "dynamicColorUri", 3, null), i = Kr(t, "interactive", 3, !1), a = new fi(), o = /* @__PURE__ */ k(() => t.controller.currentTimetable), s = /* @__PURE__ */ k(di), c = /* @__PURE__ */ k(() => I(o) ? a.calculateAcademicWeek(I(s), I(o).academicConfig) : null), l = /* @__PURE__ */ k(() => t.controller.displayedWeek ?? t.controller.activeWeek ?? I(c) ?? 1), u = /* @__PURE__ */ k(() => I(l) === (I(c) ?? t.controller.activeWeek ?? 1)), d = /* @__PURE__ */ k(() => t.controller.currentPeriodIndex), f = /* @__PURE__ */ k(() => t.controller.userPreferences?.timetableLayoutMode ?? "fixed"), p = /* @__PURE__ */ k(() => t.controller.userPreferences?.capsuleCornerStyle ?? "rounded"), m = /* @__PURE__ */ k(() => t.controller.coursePalette.length > 0 ? t.controller.coursePalette : Jr), h = /* @__PURE__ */ k(() => I(o)?.courses ?? []), g = /* @__PURE__ */ k(() => t.controller.courseBadges ?? {}), _ = /* @__PURE__ */ k(() => I(o) ? aa({
		timetable: I(o),
		displayedWeek: I(l),
		todayIso: I(s),
		academicCalendarService: a,
		coursePalette: I(m),
		paletteCourses: I(h),
		layoutMode: I(f),
		capsuleCornerStyle: I(p)
	}) : null), v = /* @__PURE__ */ k(() => I(_)?.gridModel ?? null), y = /* @__PURE__ */ k(() => I(_)?.courseDisplayModels ?? []);
	var b = mr(), x = Qt(b), S = (e) => {
		{
			let t = /* @__PURE__ */ k(() => n() && r() ? r() : null);
			Us(e, {
				get wallpaperUri() {
					return I(t);
				},
				children: (e, t) => {
					{
						let t = /* @__PURE__ */ k(() => n() && !!r());
						Bs(e, {
							get displayedWeek() {
								return I(l);
							},
							get gridModel() {
								return I(v);
							},
							get courseDisplayModels() {
								return I(y);
							},
							get coursePalette() {
								return I(m);
							},
							get paletteCourses() {
								return I(h);
							},
							get hasDynamicBackground() {
								return I(t);
							},
							get layoutMode() {
								return I(f);
							},
							get capsuleCornerStyle() {
								return I(p);
							},
							get interactive() {
								return i();
							},
							get isCurrentWeek() {
								return I(u);
							},
							get currentPeriodIndex() {
								return I(d);
							},
							get courseBadges() {
								return I(g);
							}
						});
					}
				},
				$$slots: { default: !0 }
			});
		}
	}, C = (e) => {
		R(e, Gs());
	};
	Tr(x, (e) => {
		I(o) && I(v) ? e(S) : e(C, -1);
	}), R(e, b), ze();
}
//#endregion
//#region packages/codec-kit/src/base64.ts
var qs = 8192;
function Js(e) {
	let t = "";
	for (let n = 0; n < e.length; n += qs) t += String.fromCharCode(...e.subarray(n, n + qs));
	return t;
}
function Ys(e) {
	return btoa(Js(e));
}
(() => {
	let e = /* @__PURE__ */ new Uint32Array(256);
	for (let t = 0; t < 256; t += 1) {
		let n = t;
		for (let e = 0; e < 8; e += 1) n = n & 1 ? n >>> 1 ^ 3988292384 : n >>> 1;
		e[t] = n >>> 0;
	}
	return e;
})();
//#endregion
//#region packages/plugins/wallpaper/src/storage.ts
var Xs = "tool-wallpaper", Zs = "wallpaper_image";
function Qs(e) {
	return `data:${e.mimeType || "image/jpeg"};base64,${e.base64}`;
}
async function $s(e) {
	let t = await e.arrayBuffer();
	return {
		mimeType: e.type || "image/jpeg",
		base64: Ys(new Uint8Array(t))
	};
}
async function ec(e, t = Xs) {
	let n = await e.getPluginData(t, Zs);
	return n?.base64 ? Qs(n) : null;
}
async function tc(e, t, n = Xs) {
	let r = await $s(t);
	return await e.setPluginData(n, Zs, r), Qs(r);
}
async function nc(e, t = Xs) {
	await e.deletePluginData(t, Zs);
}
//#endregion
//#region packages/plugins/wallpaper/src/runtime.svelte.ts
var rc = /* @__PURE__ */ new Map();
function ic(e = Xs) {
	let t = rc.get(e);
	if (!t) throw Error(`[WallpaperRuntime] not initialized for plugin "${e}"`);
	return t;
}
function ac(e, t = Xs) {
	let n = /* @__PURE__ */ Lt(null), r = null;
	function i(e) {
		j(n, e, !0);
		try {
			r?.(e);
		} catch (e) {
			console.error("[WallpaperRuntime] listener error:", e);
		}
	}
	let a = {
		get uri() {
			return I(n);
		},
		get hasWallpaper() {
			return !!I(n);
		},
		async syncFromStorage(n) {
			if (!n) {
				i(null);
				return;
			}
			i(await ec(e, t));
		},
		async setWallpaper(n) {
			if (!n) {
				await nc(e, t), i(null);
				return;
			}
			i(await tc(e, n, t));
		},
		setChangeHandler(e) {
			r = e, e && e(I(n));
		},
		dispose() {
			i(null), r = null, rc.get(t) === a && rc.delete(t);
		}
	};
	return rc.set(t, a), a;
}
//#endregion
//#region packages/plugins/wallpaper/src/wallpaper-theme.ts
var oc = 128;
function sc(e) {
	let t = [];
	for (let n = 0; n < e.length; n += 4) {
		let r = e[n], i = e[n + 1], a = e[n + 2];
		e[n + 3] < 255 || t.push(Ea(r, i, a));
	}
	let n = Lo.score(Po.quantize(t, 128), { desired: 6 });
	return {
		seed: n[0],
		ranked: n
	};
}
function cc() {
	let e = [], t = null, n = null, r = null;
	function i(e) {
		return e ?? (typeof document < "u" ? document.documentElement : void 0);
	}
	function a(t) {
		let n = i(t);
		if (n) {
			for (let t of e) n.style.removeProperty(t);
			e = [];
		}
	}
	async function o(e) {
		if (e !== t || n == null || r == null) {
			let { seed: i, ranked: a } = sc(await lc(e));
			t = e, n = i, r = a;
		}
		return {
			seed: n,
			coursePalette: rs(r)
		};
	}
	function s(t, n, r) {
		let o = i(r);
		if (!o) return;
		let s = ts(t, n);
		a(o), e = Object.keys(s);
		for (let [e, t] of Object.entries(s)) o.style.setProperty(e, t);
	}
	return {
		extractWallpaperSeed: o,
		paintWallpaperTheme: s,
		clearWallpaperTheme: a
	};
}
async function lc(e) {
	let t = new Image();
	t.src = e, await t.decode();
	let n = t.naturalWidth || t.width, r = t.naturalHeight || t.height, i = Math.min(1, oc / Math.max(n, r, 1)), a = Math.max(1, Math.round(n * i)), o = Math.max(1, Math.round(r * i)), s = document.createElement("canvas");
	s.width = a, s.height = o;
	let c = s.getContext("2d");
	if (!c) throw Error("Could not get canvas context");
	return c.drawImage(t, 0, 0, a, o), c.getImageData(0, 0, a, o).data;
}
//#endregion
//#region packages/plugins/wallpaper/src/messages.ts
function uc(e) {
	return ua({ wallpaper: {
		type: "wallpaper-preview",
		title: () => e("screen.field.wallpaper.title"),
		description: () => e("screen.field.wallpaper.description"),
		accept: "image/*",
		required: !1
	} });
}
var dc = {
	"zh-cn": {
		"plugin.name": "自定义壁纸",
		"plugin.description": "自定义课表页壁纸，支持动态取色",
		"theme.name": "壁纸",
		"theme.description": "从当前壁纸提取配色",
		"mine.title": "设置课表壁纸",
		"mine.keywords": "壁纸,背景,图片,自定义,封面",
		"screen.title": "设置课表壁纸",
		"screen.field.wallpaper.title": "选择壁纸图片",
		"screen.field.wallpaper.description": "支持 PNG、JPG、WebP 格式图片，自动提取并应用主题色彩"
	},
	en: {
		"plugin.name": "Custom Wallpaper",
		"plugin.description": "Custom timetable wallpaper with dynamic color extraction",
		"theme.name": "Wallpaper",
		"theme.description": "Extract palette from the current wallpaper",
		"mine.title": "Set timetable wallpaper",
		"mine.keywords": "wallpaper,background,image,custom,cover",
		"screen.title": "Set timetable wallpaper",
		"screen.field.wallpaper.title": "Choose wallpaper image",
		"screen.field.wallpaper.description": "PNG, JPG, or WebP images with automatic theme color extraction"
	}
}, fc = "wallpaper";
function pc(e) {
	return {
		id: fc,
		name: () => e("theme.name"),
		description: () => e("theme.description"),
		supportsDynamicColor: !0,
		workbenchColors: ha({
			surface: "#f9f9fe",
			onSurface: "#2e333a",
			primary: "#0068b7",
			onPrimary: "#ffffff",
			surfaceVariant: "#eceef5",
			outline: "#aeb2bb"
		}, {
			surface: "#1e2026",
			onSurface: "#f8fafc",
			primary: "#0068b7",
			onPrimary: "#ffffff",
			surfaceVariant: "#24262e",
			outline: "#334155"
		}),
		dynamicColorAdapter: cc(),
		getTokens: (e) => ({
			surface: e === "dark" ? "#1e2026" : "#f9f9fe",
			onSurface: e === "dark" ? "#f8fafc" : "#2e333a",
			primary: "#0068b7",
			onPrimary: "#ffffff",
			surfaceVariant: e === "dark" ? "#24262e" : "#eceef5",
			outline: e === "dark" ? "#334155" : "#aeb2bb"
		})
	};
}
async function mc(e, t) {
	let n = t.wallpaper;
	if (n instanceof Uint8Array) {
		await e.setWallpaper(new Blob([new Uint8Array(n)]));
		return;
	}
	n === null && await e.setWallpaper(null);
}
function hc(e = {}) {
	let { screenComponent: t } = e, n;
	return {
		id: Xs,
		name: () => n?.("plugin.name") ?? dc["zh-cn"]["plugin.name"],
		version: "1.0.0",
		description: () => n?.("plugin.description") ?? dc["zh-cn"]["plugin.description"],
		category: "tool",
		order: 40,
		author: "Chronos Community",
		homepage: "https://github.com/CQUT-OpenProject/Chronos",
		configSchema: uc((e) => dc["zh-cn"][e]),
		defaultConfig: {},
		async apply(e) {
			e.i18n.registerMessages(dc);
			let r = (t) => e.i18n.t(t);
			n = r;
			let i = uc(r), a = ac(e.service(fa), Xs);
			a.setChangeHandler((t) => {
				e.emit("dynamicColor:changed", { uri: t });
			}), e.on("dynamicColor:set", async ({ blob: e }) => {
				await a.setWallpaper(e);
			}), e.on("dynamicColor:hydrate", () => {
				e.emit("dynamicColor:changed", { uri: a.uri });
			}), e.on("config:changed", async ({ pluginId: e, config: t }) => {
				e === "tool-wallpaper" && await mc(a, t);
			}), await a.syncFromStorage(!0);
			let o = r("mine.keywords").split(",").map((e) => e.trim()).filter(Boolean);
			e.registerSlot("mine.item", {
				id: "wallpaper",
				sectionId: "appearance-feedback",
				title: () => r("mine.title"),
				href: "/plugins/tool-wallpaper",
				icon: "wallpaper",
				iconTone: "primary",
				keywords: o,
				order: 30
			}), e.registerSlot("shell.route.screen", {
				id: Xs,
				title: () => r("screen.title"),
				...t ? { component: t } : {},
				schema: i
			});
			let s = pc(r);
			e.registerSlot("theme.definition", s), e.addDisposable({ dispose: () => a.dispose() });
		}
	};
}
//#endregion
//#region packages/plugins/wallpaper/src/WallpaperScreen.svelte
var gc = /* @__PURE__ */ L("<div class=\"relative flex min-h-0 flex-1 flex-col overflow-hidden\"><!></div>"), _c = /* @__PURE__ */ L("<div class=\"flex min-h-0 flex-1 items-center justify-center bg-canvas p-4\"><p class=\"m3-body-medium text-center text-on-surface-variant\">选择壁纸后，可在此预览应用效果</p></div>"), vc = /* @__PURE__ */ L("<button type=\"button\" class=\"flex flex-1 items-center justify-center gap-2 rounded-full border border-outline bg-surface px-4 py-3 text-sm font-medium text-on-surface\">清除壁纸</button>"), yc = /* @__PURE__ */ L("<div class=\"flex min-h-0 flex-1 flex-col\"><input type=\"file\" accept=\"image/*\" class=\"hidden\"/> <!> <div class=\"bottom-bar\"><div class=\"mx-auto flex h-full w-full max-w-lg items-center gap-3\"><!> <button type=\"button\" class=\"flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-on-primary\"> </button></div></div></div>");
function bc(e, t) {
	Re(t, !0);
	let n = ic(t.pluginId), r = /* @__PURE__ */ k(() => n.uri), i = /* @__PURE__ */ k(() => n.hasWallpaper), a = /* @__PURE__ */ k(() => t.controller.currentTimetable), o = /* @__PURE__ */ Lt(void 0);
	function s() {
		I(o)?.click();
	}
	async function c(e) {
		let r = e.currentTarget, i = r.files?.[0];
		if (i) try {
			await n.setWallpaper(i);
		} catch (e) {
			let n = e instanceof DOMException && e.name === "QuotaExceededError" ? "此图片过大，无法导入" : "壁纸导入失败，请重试";
			try {
				t.controller.getPluginContext(t.pluginId).actions.notify(n, "error");
			} catch {
				alert(n);
			}
		} finally {
			r.value = "";
		}
	}
	async function l() {
		await n.setWallpaper(null);
	}
	var u = yc(), d = M(u);
	Gr(d, (e) => j(o, e), () => I(o));
	var f = $t(d, 2), p = (e) => {
		var n = gc();
		Ks(M(n), {
			get controller() {
				return t.controller;
			},
			hasDynamicBackground: !0,
			get dynamicColorUri() {
				return I(r);
			},
			interactive: !1
		}), D(n), R(e, n);
	}, m = (e) => {
		R(e, _c());
	};
	Tr(f, (e) => {
		I(i) && I(a) ? e(p) : e(m, -1);
	});
	var h = $t(f, 2), g = M(h), _ = M(g), v = (e) => {
		var t = vc();
		or("click", t, l), R(e, t);
	};
	Tr(_, (e) => {
		I(i) && e(v);
	});
	var y = $t(_, 2), b = M(y, !0);
	D(y), D(g), D(h), D(u), N(() => _r(b, I(i) ? "重新选择" : "选择壁纸")), or("change", d, c), or("click", y, s), R(e, u), ze();
}
sr(["change", "click"]);
//#endregion
//#region packages/plugins/wallpaper/bundle/entry.ts
var xc = hc({ screenComponent: Ws(bc) });
//#endregion
export { xc as default };
