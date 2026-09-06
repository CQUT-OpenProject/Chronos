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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, ee = 1 << 25, te = 65536, ne = 1 << 21, re = 1 << 22, ie = 1 << 23, ae = Symbol("$state"), oe = Symbol("attributes"), se = Symbol("class"), ce = Symbol("style"), le = Symbol("text"), ue = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function de() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function fe(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function pe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function me() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function he() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function ge() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function _e() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function ve() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function ye(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function be() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/hydration.js
var T = !1;
function xe(e) {
	T = e;
}
var E;
function Se(t) {
	if (t === null) throw ye(), e;
	return E = t;
}
function Ce() {
	return Se(/* @__PURE__ */ Gt(E));
}
function D(t) {
	if (T) {
		if (/* @__PURE__ */ Gt(E) !== null) throw ye(), e;
		E = t;
	}
}
function we(e = 1) {
	if (T) {
		for (var t = e, n = E; t--;) n = /* @__PURE__ */ Gt(n);
		E = n;
	}
}
function Te(e = !0) {
	for (var t = 0, n = E;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Gt(n);
		e && n.remove(), n = i;
	}
}
function Ee(t) {
	if (!t || t.nodeType !== 8) throw ye(), e;
	return t.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function De(e) {
	return e === this.v;
}
function Oe(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function ke(e) {
	return !Oe(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var Ae = null;
function je(e) {
	Ae = e;
}
function Me(e, t = !1, n) {
	Ae = {
		p: Ae,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: N,
		l: null
	};
}
function Ne(e) {
	var t = Ae, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) tn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ae = t.p, e ?? {};
}
function Pe() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var Fe = [];
function Ie() {
	var e = Fe;
	Fe = [], p(e);
}
function Le(e) {
	if (Fe.length === 0 && !pt) {
		var t = Fe;
		queueMicrotask(() => {
			t === Fe && Ie();
		});
	}
	Fe.push(e);
}
function Re(e) {
	var t = N;
	if (t === null) return M.f |= ie, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	ze(e, t);
}
function ze(e, t) {
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
var Be = ~(g | _ | h);
function O(e, t) {
	e.f = e.f & Be | t;
}
function Ve(e) {
	e.f & 512 || e.deps === null ? O(e, h) : O(e, _);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function He(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= te, He(t.deps));
}
function Ue(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), He(e.deps), O(e, h);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function We(e) {
	var t = M, n = N;
	wn(null), Tn(null);
	try {
		return e();
	} finally {
		wn(t), Tn(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function Ge(e) {
	let t = 0, n = kt(0), r;
	return () => {
		$t() && (I(n), an(() => (t === 0 && (r = Un(() => e(() => Ft(n)))), t += 1, () => {
			Le(() => {
				--t, t === 0 && (r?.(), r = void 0, Ft(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var Ke = S | C;
function qe(e, t, n, r) {
	new Je(e, t, n, r);
}
var Je = class {
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
	#h = Ge(() => (this.#m = kt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = N;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = N.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = sn(() => {
			if (T) {
				let e = this.#t;
				Ce();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, Ke), T && (this.#e = E);
	}
	#g() {
		try {
			this.#a = cn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Le(r), t && (this.#s = cn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				be();
				return;
			}
			t = !0, n && _e(), this.#s !== null && mn(this.#s, () => {
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
					ze(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = cn(() => e(this.#e)), Le(() => {
			var e = this.#c = document.createDocumentFragment(), t = Ut();
			e.append(t), this.#a = this.#S(() => cn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, mn(this.#o, () => {
				this.#o = null;
			}), this.#x(k));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = cn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				vn(this.#a, e);
				let t = this.#n.pending;
				this.#o = cn(() => t(this.#e));
			} else this.#x(k);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Ue(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = N, n = M, r = Ae;
		Tn(this.#i), wn(this.#i), je(this.#i.ctx);
		try {
			return yt.ensure(), e();
		} catch (e) {
			return Re(e), null;
		} finally {
			Tn(t), wn(n), je(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && mn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Le(() => {
			this.#d = !1, this.#m && Nt(this.#m, this.#l);
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
		this.#a &&= (j(this.#a), null), this.#o &&= (j(this.#o), null), this.#s &&= (j(this.#s), null), T && (Se(this.#t), we(), Se(Te()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return cn(() => {
						var r = N;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return ze(e, this.#i.parent), null;
				}
			}));
		};
		Le(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				ze(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => ze(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function Ye(e, t, n, r) {
	let i = Pe() ? $e : rt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = N, c = Xe(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				ze(e, s);
			}
			Ze();
		}
	}
	var d = Qe();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ tt(e))).then(u).catch((e) => ze(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), Ze();
	}) : f();
}
function Xe() {
	var e = N, t = M, n = Ae, r = k;
	return function(i = !0) {
		Tn(e), wn(t), je(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Ze(e = !0) {
	Tn(null), wn(null), je(null), e && k?.deactivate();
}
function Qe() {
	var e = N, t = e.b, n = k, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function $e(e) {
	var n = 2 | g;
	return N !== null && (N.f |= C), {
		ctx: Ae,
		deps: null,
		effects: null,
		equals: De,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: N,
		ac: null
	};
}
var et = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function tt(e, n, r) {
	let i = N;
	i === null && de();
	var a = void 0, o = kt(t), s = !M, c = /* @__PURE__ */ new Set();
	return rn(() => {
		var t = N, n = m();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ue && n.reject(e);
			}).finally(Ze);
		} catch (e) {
			n.reject(e), Ze();
		}
		var r = k;
		if (s) {
			if (t.f & 32768) var l = Qe();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(et);
			else for (let e of c.values()) e.reject(et);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== et && (r.activate(), t ? (o.f |= ie, Nt(o, t)) : (o.f & 8388608 && (o.f ^= ie), Nt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), en(() => {
		for (let e of c) e.reject(et);
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
function nt(e) {
	let t = /* @__PURE__ */ $e(e);
	return Dn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function rt(e) {
	let t = /* @__PURE__ */ $e(e);
	return t.equals = ke, t;
}
function it(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) j(t[n]);
	}
}
function at(e) {
	var n, r = N, i = e.parent;
	if (!xn && i !== null && e.v !== t && i.f & 24576) return ve(), e.v;
	Tn(i);
	try {
		e.f &= ~te, it(e), n = Ln(e);
	} finally {
		Tn(r);
	}
	return n;
}
function ot(e) {
	var t = at(e);
	if (!e.equals(t) && (e.wv = Pn(), (!k?.is_fork || e.deps === null) && (k === null ? e.v = t : (k.capture(e, t, !0), ut?.capture(e, t, !0)), e.deps === null))) {
		O(e, h);
		return;
	}
	xn || (dt === null ? Ve(e) : ($t() || k?.is_fork) && dt.set(e, t));
}
function st(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && We(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = f), zn(t, 0), un(t));
}
function ct(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Bn(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var lt = null, k = null, ut = null, dt = null, ft = null, pt = !1, mt = !1, ht = null, gt = null, _t = 0, vt = 1, yt = class e {
	id = vt++;
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
		lt === null ? lt = this : (lt.#n = this, this.#t = lt), lt = this;
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
			for (var r of n.d) O(r, g), t(r);
			for (r of n.m) O(r, _), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, _t++ > 1e3 && (this.#x(), bt());
		for (let e of this.#u) this.#d.delete(e), O(e, g), this.schedule(e);
		for (let e of this.#d) O(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = ht = [], r = [], i = gt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Tt(e), this.#h() || this.discard(), t;
		}
		if (k = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (ht = null, gt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) wt(e, t);
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
		this.#r.clear(), ut = this, St(r), St(n), ut = null, this.#s?.resolve();
		var s = k;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && (Dt.clear(), s.#g());
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : Fn(r) && (i & 16 && this.#d.add(r), Bn(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), O(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), k = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Ue(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), dt?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		k = this;
	}
	deactivate() {
		k = null, dt = null;
	}
	flush() {
		try {
			mt = !0, k = this, this.#g();
		} finally {
			_t = 0, ft = null, ht = null, gt = null, mt = !1, k = null, dt = null, Dt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(et);
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
		if (k === null) {
			let t = k = new e();
			!mt && Le(() => {
				t.#e || t.flush();
			});
		}
		return k;
	}
	apply() {
		dt = null;
	}
	schedule(e) {
		if (ft = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (ht !== null && t === N && (M === null || !(M.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? lt = e : t.#t = e, this.linked = !1;
		}
	}
};
function bt() {
	try {
		pe();
	} catch (e) {
		ze(e, ft);
	}
}
var xt = null;
function St(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Fn(r) && (xt = /* @__PURE__ */ new Set(), Bn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && pn(r), xt?.size > 0)) {
				Dt.clear();
				for (let e of xt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) xt.has(n) && (xt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Bn(n);
					}
				}
				xt.clear();
			}
		}
		xt = null;
	}
}
function Ct(e) {
	k.schedule(e);
}
function wt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), O(e, h);
		for (var n = e.first; n !== null;) wt(n, t), n = n.next;
	}
}
function Tt(e) {
	O(e, h);
	for (var t = e.first; t !== null;) Tt(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var Et = /* @__PURE__ */ new Set(), Dt = /* @__PURE__ */ new Map(), Ot = !1;
function kt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: De,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function At(e, t) {
	let n = kt(e, t);
	return Dn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function jt(e, t = !1, n = !0) {
	let r = kt(e);
	return t || (r.equals = ke), r;
}
function Mt(e, t, n = !1) {
	return M !== null && (!Cn || M.f & 131072) && Pe() && M.f & 4325394 && (En === null || !En.has(e)) && ge(), Nt(e, n ? Lt(t) : t, gt);
}
function Nt(e, t, n = null) {
	if (!e.equals(t)) {
		xn ? Dt.set(e, t) : Dt.has(e) || Dt.set(e, e.v);
		var r = yt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && at(t), dt === null && Ve(t);
		}
		e.wv = Pn(), It(e, g, n), Pe() && N !== null && N.f & 1024 && !(N.f & 96) && (On === null ? kn([e]) : On.push(e)), !r.is_fork && Et.size > 0 && !Ot && Pt();
	}
	return t;
}
function Pt() {
	Ot = !1;
	for (let e of Et) {
		e.f & 1024 && O(e, _);
		let t;
		try {
			t = Fn(e);
		} catch {
			t = !0;
		}
		t && Bn(e);
	}
	Et.clear();
}
function Ft(e) {
	Mt(e, e.v + 1);
}
function It(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Pe(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === N)) {
			var l = (c & g) === 0;
			if (l && O(s, t), c & 131072) Et.add(s);
			else if (c & 2) {
				var u = s;
				dt?.delete(u), c & 65536 || (c & 512 && (N === null || !(N.f & 2097152)) && (s.f |= te), It(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && xt !== null && xt.add(d), n === null ? Ct(d) : n.push(d);
			}
		}
	}
}
function Lt(e) {
	if (typeof e != "object" || !e || ae in e) return e;
	let r = u(e);
	if (r !== c && r !== l) return e;
	var i = /* @__PURE__ */ new Map(), a = n(e), o = /* @__PURE__ */ At(0), d = null, f = Mn, p = (e) => {
		if (Mn === f) return e();
		var t = M, n = Mn;
		wn(null), Nn(f);
		var r = e();
		return wn(t), Nn(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ At(e.length, d)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && me();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ At(n.value, d);
				return i.set(t, e), e;
			}) : Mt(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ At(t, d));
					i.set(n, e), Ft(o);
				}
			} else Mt(r, t), Ft(o);
			return !0;
		},
		get(n, r, a) {
			if (r === ae) return e;
			var o = i.get(r), c = r in n;
			if (o === void 0 && (!c || s(n, r)?.writable) && (o = p(() => /* @__PURE__ */ At(Lt(c ? n[r] : t), d)), i.set(r, o)), o !== void 0) {
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
			if (n === ae) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || N !== null && (!a || s(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ At(a ? Lt(e[n]) : t, d)), i.set(n, r)), I(r) === t) ? !1 : a;
		},
		set(e, n, r, c) {
			var l = i.get(n), u = n in e;
			if (a && n === "length") for (var f = r; f < l.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ At(t, d)), i.set(f + "", m)) : Mt(m, t);
			}
			if (l === void 0) (!u || s(e, n)?.writable) && (l = p(() => /* @__PURE__ */ At(void 0, d)), Mt(l, Lt(r)), i.set(n, l));
			else {
				u = l.v !== t;
				var h = p(() => Lt(r));
				Mt(l, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(c, r), !u) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && Mt(_, v + 1);
				}
				Ft(o);
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
			he();
		}
	});
}
var Rt, zt, Bt, Vt;
function Ht() {
	if (Rt === void 0) {
		Rt = window, zt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Bt = s(t, "firstChild").get, Vt = s(t, "nextSibling").get, d(e) && (e[se] = void 0, e[oe] = null, e[ce] = void 0, e.__e = void 0), d(n) && (n[le] = void 0);
	}
}
function Ut(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Wt(e) {
	return Bt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Gt(e) {
	return Vt.call(e);
}
function A(e, t) {
	if (!T) return /* @__PURE__ */ Wt(e);
	var n = /* @__PURE__ */ Wt(E);
	if (n === null) n = E.appendChild(Ut());
	else if (t && n.nodeType !== 3) {
		var r = Ut();
		return n?.before(r), Se(r), r;
	}
	return t && Xt(n), Se(n), n;
}
function Kt(e, t = 1, n = !1) {
	let r = T ? E : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Gt(r);
	if (!T) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Ut();
			return r === null ? i?.after(a) : r.before(a), Se(a), a;
		}
		Xt(r);
	}
	return Se(r), r;
}
function qt(e) {
	e.textContent = "";
}
function Jt() {
	return !1;
}
function Yt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Xt(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function Zt(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Qt(e, t) {
	var n = N;
	n !== null && n.f & 8192 && (e |= v);
	var r = {
		ctx: Ae,
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
	k?.register_created_effect(r);
	var i = r;
	if (e & 4) ht === null ? yt.ensure().schedule(r) : ht.push(r);
	else if (t !== null) {
		try {
			Bn(r);
		} catch (e) {
			throw j(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && Zt(i, n), M !== null && M.f & 2 && !(e & 64))) {
		var a = M;
		(a.effects ??= []).push(i);
	}
	return r;
}
function $t() {
	return M !== null && !Cn;
}
function en(e) {
	let t = Qt(8, null);
	return O(t, h), t.teardown = e, t;
}
function tn(e) {
	return Qt(4 | w, e);
}
function nn(e) {
	yt.ensure();
	let t = Qt(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? mn(t, () => {
			j(t), n(void 0);
		}) : (j(t), n(void 0));
	});
}
function rn(e) {
	return Qt(re | C, e);
}
function an(e, t = 0) {
	return Qt(8 | t, e);
}
function on(e, t = [], n = [], r = []) {
	Ye(r, t, n, (t) => {
		Qt(8, () => {
			e(...t.map(I));
		});
	});
}
function sn(e, t = 0) {
	return Qt(16 | t, e);
}
function cn(e) {
	return Qt(32 | C, e);
}
function ln(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = xn, n = M;
		Sn(!0), wn(null);
		try {
			t.call(null);
		} finally {
			Sn(e), wn(n);
		}
	}
}
function un(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && We(() => {
			e.abort(ue);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : j(n, t), n = r;
	}
}
function dn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || j(t), t = n;
	}
}
function j(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (fn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, un(e, t && !n), zn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	ln(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && pn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function fn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Gt(e);
		e.remove(), e = n;
	}
}
function pn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function mn(e, t, n = !0) {
	var r = [];
	hn(e, r, !0);
	var i = () => {
		n && j(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function hn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				hn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function gn(e) {
	_n(e, !0);
}
function _n(e, t) {
	if (e.f & 8192) {
		e.f ^= v, e.f & 1024 || (O(e, g), yt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			_n(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function vn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Gt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var yn = null, bn = !1, xn = !1;
function Sn(e) {
	xn = e;
}
var M = null, Cn = !1;
function wn(e) {
	M = e;
}
var N = null;
function Tn(e) {
	N = e;
}
var En = null;
function Dn(e) {
	M !== null && (En ??= /* @__PURE__ */ new Set()).add(e);
}
var P = null, F = 0, On = null;
function kn(e) {
	On = e;
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
	if (t & 2 && (e.f &= ~te), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Fn(a) && ot(a), a.wv > e.wv) return !0;
		}
		t & 512 && dt === null && O(e, h);
	}
	return !1;
}
function In(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(En !== null && En.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? In(a, t, !1) : t === a && (n ? O(a, g) : a.f & 1024 && O(a, _), Ct(a));
	}
}
function Ln(e) {
	var t = P, n = F, r = On, i = M, a = En, o = Ae, s = Cn, c = Mn, l = e.f;
	P = null, F = 0, On = null, M = l & 96 ? null : e, En = null, je(e.ctx), Cn = !1, Mn = ++jn, e.ac !== null && (We(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= ne;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = k?.is_fork;
		if (P !== null) {
			var m;
			if (p || zn(e, F), f !== null && F > 0) for (f.length = F + P.length, m = 0; m < P.length; m++) f[F + m] = P[m];
			else e.deps = f = P;
			if ($t() && e.f & 512) for (m = F; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && F < f.length && (zn(e, F), f.length = F);
		if (Pe() && On !== null && !Cn && f !== null && !(e.f & 6146)) for (m = 0; m < On.length; m++) In(On[m], e);
		if (i !== null && i !== e) {
			if (jn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = jn;
			if (t !== null) for (let e of t) e.rv = jn;
			On !== null && (r === null ? r = On : r.push(...On));
		}
		return e.f & 8388608 && (e.f ^= ie), d;
	} catch (e) {
		return Re(e);
	} finally {
		e.f ^= ne, P = t, F = n, On = r, M = i, En = a, je(o), Cn = s, Mn = c;
	}
}
function Rn(e, n) {
	let a = n.reactions;
	if (a !== null) {
		var o = r.call(a, e);
		if (o !== -1) {
			var s = a.length - 1;
			s === 0 ? a = n.reactions = null : (a[o] = a[s], a.pop());
		}
	}
	if (a === null && n.f & 2 && (P === null || !i.call(P, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~te), c.v !== t && Ve(c), c.ac !== null && We(() => {
			c.ac.abort(ue), c.ac = null, O(c, g);
		}), st(c), zn(c, 0);
	}
}
function zn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Rn(e, n[r]);
}
function Bn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		O(e, h);
		var n = N, r = bn;
		N = e, bn = !(t & 96);
		try {
			t & 16777232 ? dn(e) : un(e), ln(e);
			var i = Ln(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = An;
		} finally {
			bn = r, N = n;
		}
	}
}
function I(e) {
	var t = !!(e.f & 2);
	if (yn?.add(e), M !== null && !Cn && !(N !== null && N.f & 16384) && (En === null || !En.has(e))) {
		var n = M.deps;
		if (M.f & 2097152) e.rv < jn && (e.rv = jn, P === null && n !== null && n[F] === e ? F++ : P === null ? P = [e] : P.push(e));
		else {
			M.deps ??= [], i.call(M.deps, e) || M.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [M] : i.call(r, M) || r.push(M);
		}
	}
	if (xn && Dt.has(e)) return Dt.get(e);
	if (t) {
		var a = e;
		if (xn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Hn(a)) && (o = at(a)), Dt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Cn && M !== null && (bn || !!(M.f & 512)), c = (a.f & b) === 0;
		Fn(a) && (s && (a.f |= 512), ot(a)), s && !c && (ct(a), Vn(a));
	}
	if (dt?.has(e)) return dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Vn(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (ct(t), Vn(t));
}
function Hn(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Dt.has(t) || t.f & 2 && Hn(t)) return !0;
	return !1;
}
function Un(e) {
	var t = Cn;
	try {
		return Cn = !0, e();
	} finally {
		Cn = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var Wn = Symbol("events"), Gn = /* @__PURE__ */ new Set(), Kn = /* @__PURE__ */ new Set();
function qn(e, t, n) {
	(t[Wn] ??= {})[e] = n;
}
function Jn(e) {
	for (var t = 0; t < e.length; t++) Gn.add(e[t]);
	for (var n of Kn) n(e);
}
var Yn = null, Xn = !1;
function Zn(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	Yn = e, Xn || (Xn = !0, setTimeout(() => {
		Xn = !1, Yn = null;
	}));
	var s = 0, c = Yn === e && e[Wn];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Wn] = t;
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
		var d = M, f = N;
		wn(null), Tn(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[Wn]?.[r];
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
			e[Wn] = t, delete e.currentTarget, wn(d), Tn(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var Qn = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function $n(e) {
	return Qn?.createHTML(e) ?? e;
}
function er(e) {
	var t = Yt("template");
	return t.innerHTML = $n(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function tr(e, t) {
	var n = N;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function nr(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (T) return tr(E, null), E;
		i === void 0 && (i = er(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Wt(i)));
		var t = r || zt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Wt(t), s = t.lastChild;
			tr(o, s);
		} else tr(t, t);
		return t;
	};
}
function rr(e, t) {
	if (T) {
		var n = N;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = E), Ce();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var ir = ["touchstart", "touchmove"];
function ar(e) {
	return ir.includes(e);
}
function or(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[le] ??= e.nodeValue) && (e[le] = n, e.nodeValue = `${n}`);
}
function sr(e, t) {
	return lr(e, t);
}
var cr = /* @__PURE__ */ new Map();
function lr(t, { target: n, anchor: r, props: i = {}, events: o, context: s, intro: c = !0, transformError: l }) {
	Ht();
	var u = void 0, d = nn(() => {
		var c = r ?? n.appendChild(Ut());
		qe(c, { pending: () => {} }, (n) => {
			Me({});
			var r = Ae;
			if (s && (r.c = s), o && (i.$$events = o), T && tr(n, null), u = t(n, i) || {}, T && (N.nodes.end = E, E === null || E.nodeType !== 8 || E.data !== "]")) throw ye(), e;
			Ne();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = ar(r);
					for (let e of [n, document]) {
						var a = cr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), cr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Zn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(a(Gn)), Kn.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = cr.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, Zn), t.delete(e), t.size === 0 && cr.delete(r)) : t.set(e, i);
			}
			Kn.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return ur.set(u, d), u;
}
var ur = /* @__PURE__ */ new WeakMap();
function dr(e, t) {
	let n = ur.get(e);
	return n ? (ur.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var fr = class {
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
			if (n) gn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (gn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (j(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						vn(r, t), t.append(Ut()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else j(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), mn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (j(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = k, r = Jt();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = Ut();
				i.append(a), this.#n.set(e, {
					effect: cn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, cn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else T && (this.anchor = E), this.#a(n);
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/if.js
function pr(e, t, n = !1) {
	var r;
	T && (r = E, Ce());
	var i = new fr(e), a = n ? S : 0;
	function o(e, t) {
		if (T) {
			var n = Ee(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Te();
				Se(a), i.anchor = a, xe(!1), i.ensure(e, t), xe(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	sn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.10_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function mr(e, t, n) {
	for (var r = [], i = t.length, o, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		mn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					hr(e, a(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			qt(d), d.append(u), e.items.clear();
		}
		hr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function hr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ee, vn(a, document.createDocumentFragment())) : j(t[i], n);
	}
}
var gr;
function _r(e, t, r, i, o, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = T ? Se(/* @__PURE__ */ Wt(u)) : u.appendChild(Ut());
	}
	T && Ce();
	var d = null, f = /* @__PURE__ */ rt(() => {
		var e = r();
		return n(e) ? e : e == null ? [] : a(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, yr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ee, xr(d, null, c)) : gn(d) : mn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: sn(() => {
			p = I(f);
			var e = p.length;
			let n = !1;
			T && Ee(c) === "[!" != (e === 0) && (c = Te(), Se(c), xe(!1), n = !0);
			for (var a = /* @__PURE__ */ new Set(), u = k, v = Jt(), y = 0; y < e; y += 1) {
				T && E.nodeType === 8 && E.data === "]" && (c = E, n = !0, xe(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && Nt(S.v, b), S.i && Nt(S.i, y), v && u.unskip_effect(S.e)) : (S = br(l, h ? c : gr ??= Ut(), b, x, y, o, t, r), h || (S.e.f |= ee), l.set(x, S)), a.add(x);
			}
			if (e === 0 && s && !d && (h ? d = cn(() => s(c)) : (d = cn(() => s(gr ??= Ut())), d.f |= ee)), e > a.size && fe("", "", ""), T && e > 0 && Se(Te()), !h) {
				if (m.set(u, a), v) {
					for (let [e, t] of l) a.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			n && xe(!0), I(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, T && (c = E);
}
function vr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function yr(e, t, n, r, i) {
	var o = !!(r & 8), s = t.length, c = e.items, l = vr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (gn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ee, _ === l) xr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Sr(e, d, _), Sr(e, _, y), xr(_, y, n), d = _, p = [], m = [], l = vr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) xr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Sr(e, S.prev, C.next), Sr(e, d, S), Sr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), xr(_, l, n), Sr(e, _.prev, _.next), Sr(e, _, d === null ? e.effect.first : d.next), Sr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = vr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = vr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (hr(e, a(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = vr(l.next);
		var te = w.length;
		if (te > 0) {
			var ne = r & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < te; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < te; v += 1) w[v].nodes?.a?.fix();
			}
			mr(e, w, ne);
		}
	}
	o && Le(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function br(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? kt(n) : /* @__PURE__ */ jt(n, !1, !1) : null, l = o & 2 ? kt(i) : null;
	return {
		v: c,
		i: l,
		e: cn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function xr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Gt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Sr(e, t, n) {
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
function Cr(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function wr(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function Tr(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function Er(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function Dr(e, t) {
	return Er(e, t * 7);
}
function Or(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function kr(e, t) {
	return e.getTime() < t.getTime();
}
function Ar(e) {
	return wr(Tr(Cr(e)));
}
function jr(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region packages/core/src/algorithms/calendar.ts
var Mr = class {
	normalizeTermStartDate(e, t) {
		let n = Cr(Ar(t));
		if (!e || !e.trim()) return wr(Tr(n));
		try {
			return wr(Tr(Cr(e)));
		} catch {
			return wr(Tr(this.inferTermStartDateFromTermName(e) || n));
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
		}, r = Cr(this.normalizeTermStartDate(n.termStartDate, e)), i = Cr(e);
		if (kr(i, r)) return n.startWeek;
		let a = Or(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return wr(Dr(Cr(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return wr(Er(Cr(this.resolveWeekStart(e, t, r)), n - 1));
	}
};
//#endregion
//#region packages/core/src/algorithms/holiday-calendar.ts
function Nr(e) {
	let { holidayCalendar: t, ...n } = e;
	return n;
}
async function Pr(e) {
	let t = await e.listTimetables(), n = 0;
	for (let r of t) {
		let t = await e.getTimetable(r.id);
		if (!t?.academicConfig.holidayCalendar) continue;
		let i = {
			...t,
			academicConfig: Nr(t.academicConfig),
			updatedAt: Date.now()
		};
		await e.saveTimetable(i), n += 1;
	}
	return n;
}
function Fr(e, t = jr()) {
	let n = new Mr(), r = Cr(n.resolveWeekStart(e, e.startWeek, t)), i = Er(Cr(n.resolveWeekStart(e, e.endWeek, t)), 6);
	return {
		startDate: wr(r),
		endDate: wr(i)
	};
}
function Ir(e, t, n = jr()) {
	let { startDate: r, endDate: i } = Fr(t, n);
	return e.filter((e) => e.date >= r && e.date <= i);
}
function Lr(e, t = jr()) {
	let { startDate: n, endDate: r } = Fr(e, t), i = Number.parseInt(n.slice(0, 4), 10), a = Number.parseInt(r.slice(0, 4), 10), o = /* @__PURE__ */ new Set();
	for (let e = i; e <= a; e += 1) o.add(e);
	return o.size === 0 && o.add(Number.parseInt(t.slice(0, 4), 10)), [...o].sort((e, t) => e - t);
}
//#endregion
//#region packages/core/src/types/services.ts
function Rr(e) {
	return { key: e };
}
var zr = Rr("http"), Br = Rr("storage");
//#endregion
//#region packages/core/src/i18n/i18n-catalog.ts
function Vr(e, t) {
	return t ? e.replace(/\{(\w+)\}/g, (e, n) => {
		let r = t[n];
		return r == null ? `{${n}}` : typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? String(r) : JSON.stringify(r);
	}) : e;
}
//#endregion
//#region packages/core/src/types/mountable.ts
var Hr = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.on-surface,color.primary,color.on-primary,color.surface-variant,color.outline,color.secondary,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,color.outline-variant,color.surface-container-high,color.canvas,color.ink,color.border-subtle,color.success,color.warning,color.danger,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
function Ur(e) {
	return `color.${e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;
}
function Wr(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) typeof r == "string" && r.length > 0 && (t[Ur(n)] = r);
	return t;
}
function Gr(e, t) {
	return {
		light: Wr(e),
		dark: Wr(t)
	};
}
//#endregion
//#region packages/core/src/plugin/define-chronos-plugin.ts
function Kr(e, t, n = "zh-cn") {
	return e[n]?.[t] ?? e.en?.[t] ?? t;
}
function qr() {
	return "0.4.6";
}
function Jr(e) {
	let t;
	return {
		id: e.id,
		name: () => t?.(e.nameKey) ?? Kr(e.messages, e.nameKey),
		version: e.version ?? qr(),
		description: e.descriptionKey ? () => t?.(e.descriptionKey) ?? Kr(e.messages, e.descriptionKey) : void 0,
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
function L(e) {
	return e < 0 ? -1 : e === 0 ? 0 : 1;
}
function Yr(e, t, n) {
	return (1 - n) * e + n * t;
}
function Xr(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function R(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function Zr(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function z(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function Qr(e, t) {
	return [
		e[0] * t[0][0] + e[1] * t[0][1] + e[2] * t[0][2],
		e[0] * t[1][0] + e[1] * t[1][1] + e[2] * t[1][2],
		e[0] * t[2][0] + e[1] * t[2][1] + e[2] * t[2][2]
	];
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/color_utils.js
var $r = [
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
], ei = [
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
], ti = [
	95.047,
	100,
	108.883
];
function ni(e, t, n) {
	return (255 << 24 | (e & 255) << 16 | (t & 255) << 8 | n & 255) >>> 0;
}
function ri(e) {
	return ni(hi(e[0]), hi(e[1]), hi(e[2]));
}
function ii(e) {
	return e >> 16 & 255;
}
function ai(e) {
	return e >> 8 & 255;
}
function oi(e) {
	return e & 255;
}
function si(e, t, n) {
	let r = ei, i = r[0][0] * e + r[0][1] * t + r[0][2] * n, a = r[1][0] * e + r[1][1] * t + r[1][2] * n, o = r[2][0] * e + r[2][1] * t + r[2][2] * n;
	return ni(hi(i), hi(a), hi(o));
}
function ci(e) {
	return Qr([
		mi(ii(e)),
		mi(ai(e)),
		mi(oi(e))
	], $r);
}
function li(e) {
	let t = mi(ii(e)), n = mi(ai(e)), r = mi(oi(e)), i = $r, a = i[0][0] * t + i[0][1] * n + i[0][2] * r, o = i[1][0] * t + i[1][1] * n + i[1][2] * r, s = i[2][0] * t + i[2][1] * n + i[2][2] * r, c = ti, l = a / c[0], u = o / c[1], d = s / c[2], f = _i(l), p = _i(u), m = _i(d);
	return [
		116 * p - 16,
		500 * (f - p),
		200 * (p - m)
	];
}
function ui(e) {
	let t = hi(fi(e));
	return ni(t, t, t);
}
function di(e) {
	let t = ci(e)[1];
	return 116 * _i(t / 100) - 16;
}
function fi(e) {
	return 100 * vi((e + 16) / 116);
}
function pi(e) {
	return _i(e / 100) * 116 - 16;
}
function mi(e) {
	let t = e / 255;
	return t <= .040449936 ? t / 12.92 * 100 : ((t + .055) / 1.055) ** 2.4 * 100;
}
function hi(e) {
	let t = e / 100, n = 0;
	return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, Xr(0, 255, Math.round(n * 255));
}
function gi() {
	return ti;
}
function _i(e) {
	return e > .008856451679035631 ? e ** (1 / 3) : (903.2962962962963 * e + 16) / 116;
}
function vi(e) {
	let t = e * e * e;
	return t > .008856451679035631 ? t : (116 * e - 16) / 903.2962962962963;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/viewing_conditions.js
var yi = class e {
	static make(t = gi(), n = 200 / Math.PI * fi(50) / 100, r = 50, i = 2, a = !1) {
		let o = t, s = o[0] * .401288 + o[1] * .650173 + o[2] * -.051461, c = o[0] * -.250268 + o[1] * 1.204414 + o[2] * .045854, l = o[0] * -.002079 + o[1] * .048952 + o[2] * .953127, u = .8 + i / 10, d = u >= .9 ? Yr(.59, .69, (u - .9) * 10) : Yr(.525, .59, (u - .8) * 10), f = a ? 1 : u * (1 - 1 / 3.6 * Math.exp((-n - 42) / 92));
		f = f > 1 ? 1 : f < 0 ? 0 : f;
		let p = u, m = [
			100 / s * f + 1 - f,
			100 / c * f + 1 - f,
			100 / l * f + 1 - f
		], h = 1 / (5 * n + 1), g = h * h * h * h, _ = 1 - g, v = g * n + .1 * _ * _ * Math.cbrt(5 * n), y = fi(r) / t[1], b = 1.48 + Math.sqrt(y), x = .725 / y ** .2, S = x, C = [
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
yi.DEFAULT = yi.make();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/cam16.js
var bi = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.hue = e, this.chroma = t, this.j = n, this.q = r, this.m = i, this.s = a, this.jstar = o, this.astar = s, this.bstar = c;
	}
	distance(e) {
		let t = this.jstar - e.jstar, n = this.astar - e.astar, r = this.bstar - e.bstar;
		return 1.41 * Math.sqrt(t * t + n * n + r * r) ** .63;
	}
	static fromInt(t) {
		return e.fromIntInViewingConditions(t, yi.DEFAULT);
	}
	static fromIntInViewingConditions(t, n) {
		let r = (t & 16711680) >> 16, i = (t & 65280) >> 8, a = t & 255, o = mi(r), s = mi(i), c = mi(a), l = .41233895 * o + .35762064 * s + .18051042 * c, u = .2126 * o + .7152 * s + .0722 * c, d = .01932141 * o + .11916382 * s + .95034478 * c, f = .401288 * l + .650173 * u - .051461 * d, p = -.250268 * l + 1.204414 * u + .045854 * d, m = -.002079 * l + .048952 * u + .953127 * d, h = n.rgbD[0] * f, g = n.rgbD[1] * p, _ = n.rgbD[2] * m, v = (n.fl * Math.abs(h) / 100) ** .42, y = (n.fl * Math.abs(g) / 100) ** .42, b = (n.fl * Math.abs(_) / 100) ** .42, x = L(h) * 400 * v / (v + 27.13), S = L(g) * 400 * y / (y + 27.13), C = L(_) * 400 * b / (b + 27.13), w = (11 * x + -12 * S + C) / 11, ee = (x + S - 2 * C) / 9, te = (20 * x + 20 * S + 21 * C) / 20, ne = (40 * x + 20 * S + C) / 20, re = z(Math.atan2(ee, w) * 180 / Math.PI), ie = re * Math.PI / 180, ae = 100 * (ne * n.nbb / n.aw) ** +(n.c * n.z), oe = 4 / n.c * Math.sqrt(ae / 100) * (n.aw + 4) * n.fLRoot, se = re < 20.14 ? re + 360 : re, ce = (5e4 / 13 * (.25 * (Math.cos(se * Math.PI / 180 + 2) + 3.8)) * n.nc * n.ncb * Math.sqrt(w * w + ee * ee) / (te + .305)) ** .9 * (1.64 - .29 ** n.n) ** .73, le = ce * Math.sqrt(ae / 100), ue = le * n.fLRoot, de = 50 * Math.sqrt(ce * n.c / (n.aw + 4)), fe = (1 + 100 * .007) * ae / (1 + .007 * ae), pe = 1 / .0228 * Math.log(1 + .0228 * ue), me = pe * Math.cos(ie), he = pe * Math.sin(ie);
		return new e(re, le, ae, oe, ue, de, fe, me, he);
	}
	static fromJch(t, n, r) {
		return e.fromJchInViewingConditions(t, n, r, yi.DEFAULT);
	}
	static fromJchInViewingConditions(t, n, r, i) {
		let a = 4 / i.c * Math.sqrt(t / 100) * (i.aw + 4) * i.fLRoot, o = n * i.fLRoot, s = n / Math.sqrt(t / 100), c = 50 * Math.sqrt(s * i.c / (i.aw + 4)), l = r * Math.PI / 180, u = (1 + 100 * .007) * t / (1 + .007 * t), d = 1 / .0228 * Math.log(1 + .0228 * o), f = d * Math.cos(l), p = d * Math.sin(l);
		return new e(r, n, t, a, o, c, u, f, p);
	}
	static fromUcs(t, n, r) {
		return e.fromUcsInViewingConditions(t, n, r, yi.DEFAULT);
	}
	static fromUcsInViewingConditions(t, n, r, i) {
		let a = n, o = r, s = Math.sqrt(a * a + o * o), c = (Math.exp(s * .0228) - 1) / .0228 / i.fLRoot, l = 180 / Math.PI * Math.atan2(o, a);
		l < 0 && (l += 360);
		let u = t / (1 - (t - 100) * .007);
		return e.fromJchInViewingConditions(u, c, l, i);
	}
	toInt() {
		return this.viewed(yi.DEFAULT);
	}
	viewed(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = L(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = L(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = L(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return si(1.86206786 * x - 1.01125463 * S + .14918677 * C, .38752654 * x + .62144744 * S - .00897398 * C, -.0158415 * x - .03412294 * S + 1.04996444 * C);
	}
	static fromXyzInViewingConditions(t, n, r, i) {
		let a = .401288 * t + .650173 * n - .051461 * r, o = -.250268 * t + 1.204414 * n + .045854 * r, s = -.002079 * t + .048952 * n + .953127 * r, c = i.rgbD[0] * a, l = i.rgbD[1] * o, u = i.rgbD[2] * s, d = (i.fl * Math.abs(c) / 100) ** .42, f = (i.fl * Math.abs(l) / 100) ** .42, p = (i.fl * Math.abs(u) / 100) ** .42, m = L(c) * 400 * d / (d + 27.13), h = L(l) * 400 * f / (f + 27.13), g = L(u) * 400 * p / (p + 27.13), _ = (11 * m + -12 * h + g) / 11, v = (m + h - 2 * g) / 9, y = (20 * m + 20 * h + 21 * g) / 20, b = (40 * m + 20 * h + g) / 20, x = Math.atan2(v, _) * 180 / Math.PI, S = x < 0 ? x + 360 : x >= 360 ? x - 360 : x, C = S * Math.PI / 180, w = 100 * (b * i.nbb / i.aw) ** +(i.c * i.z), ee = 4 / i.c * Math.sqrt(w / 100) * (i.aw + 4) * i.fLRoot, te = S < 20.14 ? S + 360 : S, ne = (5e4 / 13 * (1 / 4 * (Math.cos(te * Math.PI / 180 + 2) + 3.8)) * i.nc * i.ncb * Math.sqrt(_ * _ + v * v) / (y + .305)) ** .9 * (1.64 - .29 ** i.n) ** .73, re = ne * Math.sqrt(w / 100), ie = re * i.fLRoot, ae = 50 * Math.sqrt(ne * i.c / (i.aw + 4)), oe = (1 + 100 * .007) * w / (1 + .007 * w), se = Math.log(1 + .0228 * ie) / .0228, ce = se * Math.cos(C), le = se * Math.sin(C);
		return new e(S, re, w, ee, ie, ae, oe, ce, le);
	}
	xyzInViewingConditions(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = L(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = L(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = L(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return [
			1.86206786 * x - 1.01125463 * S + .14918677 * C,
			.38752654 * x + .62144744 * S - .00897398 * C,
			-.0158415 * x - .03412294 * S + 1.04996444 * C
		];
	}
}, xi = class e {
	static sanitizeRadians(e) {
		return (e + Math.PI * 8) % (Math.PI * 2);
	}
	static trueDelinearized(e) {
		let t = e / 100, n = 0;
		return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, n * 255;
	}
	static chromaticAdaptation(e) {
		let t = Math.abs(e) ** .42;
		return L(e) * 400 * t / (t + 27.13);
	}
	static hueOf(t) {
		let n = Qr(t, e.SCALED_DISCOUNT_FROM_LINRGB), r = e.chromaticAdaptation(n[0]), i = e.chromaticAdaptation(n[1]), a = e.chromaticAdaptation(n[2]), o = (11 * r + -12 * i + a) / 11, s = (r + i - 2 * a) / 9;
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
		return L(e) * n ** (1 / .42);
	}
	static findResultByJ(t, n, r) {
		let i = Math.sqrt(r) * 11, a = yi.DEFAULT, o = 1 / (1.64 - .29 ** a.n) ** .73, s = .25 * (Math.cos(t + 2) + 3.8) * (5e4 / 13) * a.nc * a.ncb, c = Math.sin(t), l = Math.cos(t);
		for (let t = 0; t < 5; t++) {
			let u = i / 100, d = ((n === 0 || i === 0 ? 0 : n / Math.sqrt(u)) * o) ** (1 / .9), f = a.aw * u ** (1 / a.c / a.z) / a.nbb, p = 23 * (f + .305) * d / (23 * s + 11 * d * l + 108 * d * c), m = p * l, h = p * c, g = (460 * f + 451 * m + 288 * h) / 1403, _ = (460 * f - 891 * m - 261 * h) / 1403, v = (460 * f - 220 * m - 6300 * h) / 1403, y = Qr([
				e.inverseChromaticAdaptation(g),
				e.inverseChromaticAdaptation(_),
				e.inverseChromaticAdaptation(v)
			], e.LINRGB_FROM_SCALED_DISCOUNT);
			if (y[0] < 0 || y[1] < 0 || y[2] < 0) return 0;
			let b = e.Y_FROM_LINRGB[0], x = e.Y_FROM_LINRGB[1], S = e.Y_FROM_LINRGB[2], C = b * y[0] + x * y[1] + S * y[2];
			if (C <= 0) return 0;
			if (t === 4 || Math.abs(C - r) < .002) return y[0] > 100.01 || y[1] > 100.01 || y[2] > 100.01 ? 0 : ri(y);
			i -= (C - r) * i / (2 * C);
		}
		return 0;
	}
	static solveToInt(t, n, r) {
		if (n < 1e-4 || r < 1e-4 || r > 99.9999) return ui(r);
		t = z(t);
		let i = t / 180 * Math.PI, a = fi(r), o = e.findResultByJ(i, n, a);
		return o === 0 ? ri(e.bisectToLimit(a, i)) : o;
	}
	static solveToCam(t, n, r) {
		return bi.fromInt(e.solveToInt(t, n, r));
	}
};
xi.SCALED_DISCOUNT_FROM_LINRGB = [
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
], xi.LINRGB_FROM_SCALED_DISCOUNT = [
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
], xi.Y_FROM_LINRGB = [
	.2126,
	.7152,
	.0722
], xi.CRITICAL_PLANES = [
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
		return new e(xi.solveToInt(t, n, r));
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
		this.setInternalState(xi.solveToInt(e, this.internalChroma, this.internalTone));
	}
	get chroma() {
		return this.internalChroma;
	}
	set chroma(e) {
		this.setInternalState(xi.solveToInt(this.internalHue, e, this.internalTone));
	}
	get tone() {
		return this.internalTone;
	}
	set tone(e) {
		this.setInternalState(xi.solveToInt(this.internalHue, this.internalChroma, e));
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
		let t = bi.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = di(e), this.argb = e;
	}
	setInternalState(e) {
		let t = bi.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = di(e), this.argb = e;
	}
	inViewingConditions(t) {
		let n = bi.fromInt(this.toInt()).xyzInViewingConditions(t), r = bi.fromXyzInViewingConditions(n[0], n[1], n[2], yi.make());
		return e.from(r.hue, r.chroma, pi(n[1]));
	}
}, V = class e {
	static ratioOfTones(t, n) {
		return t = R(0, 100, t), n = R(0, 100, n), e.ratioOfYs(fi(t), fi(n));
	}
	static ratioOfYs(e, t) {
		let n = e > t ? e : t, r = n === t ? e : t;
		return (n + 5) / (r + 5);
	}
	static lighter(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = fi(t), i = n * (r + 5) - 5, a = e.ratioOfYs(i, r), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = pi(i) + .4;
		return s < 0 || s > 100 ? -1 : s;
	}
	static darker(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = fi(t), i = (r + 5) / n - 5, a = e.ratioOfYs(r, i), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = pi(i) - .4;
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
}, Si = class e {
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
function Ci(e, t, n) {
	if (e.name !== n.name) throw Error(`Attempting to extend color ${e.name} with color ${n.name} of different name for spec version ${t}.`);
	if (e.isBackground !== n.isBackground) throw Error(`Attempting to extend color ${e.name} as a ${e.isBackground ? "background" : "foreground"} with color ${n.name} as a ${n.isBackground ? "background" : "foreground"} for spec version ${t}.`);
}
function H(e, t, n) {
	return Ci(e, t, n), U.fromPalette({
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
		let n = Oi(e.specVersion).getHct(e, this);
		return this.hctCache.size > 4 && this.hctCache.clear(), this.hctCache.set(e, n), n;
	}
	getTone(e) {
		return Oi(e.specVersion).getTone(e, this);
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
}, wi = class {
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
			return (h - m) * p < o && (h = R(0, 100, m + o * p), (h - m) * p >= o || (m = R(0, 100, h - o * p))), 50 <= m && m < 60 ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : 50 <= h && h < 60 && (c ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : h = p > 0 ? 60 : 49), f ? m : h;
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
}, Ti = class {
	getHct(e, t) {
		let n = t.palette(e), r = t.getTone(e), i = n.hue, a = n.chroma * (t.chromaMultiplier ? t.chromaMultiplier(e) : 1);
		return B.from(i, a, r);
	}
	getTone(e, t) {
		let n = t.toneDeltaPair ? t.toneDeltaPair(e) : void 0;
		if (n) {
			let r = n.roleA, i = n.roleB, a = n.polarity, o = n.constraint, s = a === "darker" || a === "relative_lighter" && e.isDark || a === "relative_darker" && !e.isDark ? -n.delta : n.delta, c = t.name === r.name, l = c ? r : i, u = c ? i : r, d = l.tone(e), f = u.getTone(e), p = s * (c ? 1 : -1);
			if (o === "exact" ? d = R(0, 100, f + p) : o === "nearer" ? d = p > 0 ? R(0, 100, R(f, f + p, d)) : R(0, 100, R(f + p, f, d)) : o === "farther" && (d = p > 0 ? R(f + p, 100, d) : R(0, f + p, d)), t.background && t.contrastCurve) {
				let n = t.background(e), r = t.contrastCurve(e);
				if (n && r) {
					let t = n.getTone(e), i = r.get(e.contrastLevel);
					d = V.ratioOfTones(t, d) >= i && e.contrastLevel >= 0 ? d : U.foregroundTone(t, i);
				}
			}
			return t.isBackground && !t.name.endsWith("_fixed_dim") && (d = d >= 57 ? R(65, 100, d) : R(0, 49, d)), d;
		}
		{
			let n = t.tone(e);
			if (t.background == null || t.background(e) === void 0 || t.contrastCurve == null || t.contrastCurve(e) === void 0) return n;
			let r = t.background(e).getTone(e), i = t.contrastCurve(e).get(e.contrastLevel);
			if (n = V.ratioOfTones(r, n) >= i && e.contrastLevel >= 0 ? n : U.foregroundTone(r, i), t.isBackground && !t.name.endsWith("_fixed_dim") && (n = n >= 57 ? R(65, 100, n) : R(0, 49, n)), t.secondBackground == null || t.secondBackground(e) === void 0) return n;
			let [a, o] = [t.background, t.secondBackground], [s, c] = [a(e).getTone(e), o(e).getTone(e)], [l, u] = [Math.max(s, c), Math.min(s, c)];
			if (V.ratioOfTones(l, n) >= i && V.ratioOfTones(u, n) >= i) return n;
			let d = V.lighter(l, i), f = V.darker(u, i), p = [];
			return d !== -1 && p.push(d), f !== -1 && p.push(f), U.tonePrefersLightForeground(s) || U.tonePrefersLightForeground(c) ? d < 0 ? 100 : d : p.length === 1 ? p[0] : f < 0 ? 0 : f;
		}
	}
}, Ei = new wi(), Di = new Ti();
function Oi(e) {
	return e === "2021" ? Ei : Di;
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
		let r = new ki(t, n).create();
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
}, ki = class {
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
}, Ai = class e {
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
			let t = Zr(n + e), r = this.hctsByHue[t], a = this.relativeTemperature(r), s = Math.abs(a - i);
			i = a, o += s;
		}
		let s = 1, c = o / t, l = 0;
		for (i = this.relativeTemperature(r); a.length < t;) {
			let e = Zr(n + s), r = this.hctsByHue[e], o = this.relativeTemperature(r), u = Math.abs(o - i);
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
			let r = z(o + 1 * t);
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
		let t = li(e.toInt()), n = z(Math.atan2(t[2], t[1]) * 180 / Math.PI);
		return -.5 + .02 * Math.sqrt(t[1] * t[1] + t[2] * t[2]) ** 1.07 * Math.cos(z(n - 50) * Math.PI / 180);
	}
}, G = class {
	constructor(e, t, n, r) {
		this.low = e, this.normal = t, this.medium = n, this.high = r;
	}
	get(e) {
		return e <= -1 ? this.low : e < 0 ? Yr(this.low, this.normal, (e - -1) / 1) : e < .5 ? Yr(this.normal, this.medium, (e - 0) / .5) : e < 1 ? Yr(this.medium, this.high, (e - .5) / .5) : this.high;
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
function ji(e) {
	return e.variant === q.FIDELITY || e.variant === q.CONTENT;
}
function J(e) {
	return e.variant === q.MONOCHROME;
}
function Mi(e, t, n, r) {
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
var Ni = class {
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
			tone: (e) => ji(e) ? e.sourceColorHct.tone : J(e) ? e.isDark ? 85 : 25 : e.isDark ? 30 : 90,
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
			tone: (e) => ji(e) ? U.foregroundTone(this.primaryContainer().tone(e), 4.5) : J(e) ? e.isDark ? 0 : 100 : e.isDark ? 90 : 30,
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
				return J(e) ? e.isDark ? 30 : 85 : ji(e) ? Mi(e.secondaryPalette.hue, e.secondaryPalette.chroma, t, !e.isDark) : t;
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
			tone: (e) => J(e) ? e.isDark ? 90 : 10 : ji(e) ? U.foregroundTone(this.secondaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
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
				if (!ji(e)) return e.isDark ? 30 : 90;
				let t = e.tertiaryPalette.getHct(e.sourceColorHct.tone);
				return Si.fixIfDisliked(t).tone;
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
			tone: (e) => J(e) ? e.isDark ? 0 : 100 : ji(e) ? U.foregroundTone(this.tertiaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
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
	return R(t, n, Fi(e.hue, e.chroma * r, 100, !0));
}
function Pi(e, t = 0, n = 100) {
	return R(t, n, Fi(e.hue, e.chroma, 0, !1));
}
function Fi(e, t, n, r) {
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
var Ii = class extends Ni {
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
			tone: (e) => e.platform === "watch" ? 30 : e.variant === q.NEUTRAL ? e.isDark ? 30 : 90 : e.variant === q.TONAL_SPOT ? e.isDark ? Pi(e.primaryPalette, 35, 93) : Y(e.primaryPalette, 0, 90) : e.variant === q.EXPRESSIVE ? e.isDark ? Y(e.primaryPalette, 30, 93) : Y(e.primaryPalette, 78, B.isCyan(e.primaryPalette.hue) ? 88 : 90) : e.isDark ? Pi(e.primaryPalette, 66, 93) : Y(e.primaryPalette, 66, B.isCyan(e.primaryPalette.hue) ? 88 : 93),
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
			tone: (e) => e.platform === "watch" ? e.variant === q.NEUTRAL ? 90 : Y(e.secondaryPalette, 0, 90) : e.variant === q.NEUTRAL ? e.isDark ? Pi(e.secondaryPalette, 0, 98) : Y(e.secondaryPalette) : e.variant === q.VIBRANT ? Y(e.secondaryPalette, 0, e.isDark ? 90 : 98) : e.isDark ? 80 : Y(e.secondaryPalette),
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
			tone: (e) => e.platform === "watch" ? 30 : e.variant === q.VIBRANT ? e.isDark ? Pi(e.secondaryPalette, 30, 40) : Y(e.secondaryPalette, 84, 90) : e.variant === q.EXPRESSIVE ? e.isDark ? 15 : Y(e.secondaryPalette, 90, 95) : e.isDark ? 25 : 90,
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
			tone: (e) => e.platform === "phone" ? e.isDark ? Pi(e.errorPalette, 0, 98) : Y(e.errorPalette) : Pi(e.errorPalette),
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
			tone: (e) => Pi(e.errorPalette),
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
			tone: (e) => e.platform === "watch" ? 30 : e.isDark ? Pi(e.errorPalette, 30, 93) : Y(e.errorPalette, 0, 90),
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
function Li(e, t = 0, n = 100, r = 1) {
	return R(t, n, zi(e.hue, e.chroma * r, 100, !0));
}
function Ri(e, t = 0, n = 100) {
	return R(t, n, zi(e.hue, e.chroma, 0, !1));
}
function zi(e, t, n, r) {
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
var Bi = class extends Ii {
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
			tone: (e) => !e.isDark && e.sourceColorHct.chroma <= 12 ? 90 : e.sourceColorHct.tone > 55 ? R(61, 90, e.sourceColorHct.tone) : R(30, 49, e.sourceColorHct.tone),
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
			tone: (e) => e.isDark ? Ri(e.secondaryPalette) : Li(e.secondaryPalette),
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
			tone: (e) => e.isDark ? Ri(e.secondaryPalette, 20, 49) : Li(e.secondaryPalette, 61, 90),
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
				return t.tone > 55 ? R(61, 90, t.tone) : R(20, 49, t.tone);
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
			tone: (e) => Li(e.errorPalette),
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
			tone: (e) => e.isDark ? Ri(e.errorPalette) : Li(e.errorPalette),
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
Q.contentAccentToneDelta = 15, Q.colorSpec = new Bi(), Q.primaryPaletteKeyColor = Q.colorSpec.primaryPaletteKeyColor(), Q.secondaryPaletteKeyColor = Q.colorSpec.secondaryPaletteKeyColor(), Q.tertiaryPaletteKeyColor = Q.colorSpec.tertiaryPaletteKeyColor(), Q.neutralPaletteKeyColor = Q.colorSpec.neutralPaletteKeyColor(), Q.neutralVariantPaletteKeyColor = Q.colorSpec.neutralVariantPaletteKeyColor(), Q.background = Q.colorSpec.background(), Q.onBackground = Q.colorSpec.onBackground(), Q.surface = Q.colorSpec.surface(), Q.surfaceDim = Q.colorSpec.surfaceDim(), Q.surfaceBright = Q.colorSpec.surfaceBright(), Q.surfaceContainerLowest = Q.colorSpec.surfaceContainerLowest(), Q.surfaceContainerLow = Q.colorSpec.surfaceContainerLow(), Q.surfaceContainer = Q.colorSpec.surfaceContainer(), Q.surfaceContainerHigh = Q.colorSpec.surfaceContainerHigh(), Q.surfaceContainerHighest = Q.colorSpec.surfaceContainerHighest(), Q.onSurface = Q.colorSpec.onSurface(), Q.surfaceVariant = Q.colorSpec.surfaceVariant(), Q.onSurfaceVariant = Q.colorSpec.onSurfaceVariant(), Q.inverseSurface = Q.colorSpec.inverseSurface(), Q.inverseOnSurface = Q.colorSpec.inverseOnSurface(), Q.outline = Q.colorSpec.outline(), Q.outlineVariant = Q.colorSpec.outlineVariant(), Q.shadow = Q.colorSpec.shadow(), Q.scrim = Q.colorSpec.scrim(), Q.surfaceTint = Q.colorSpec.surfaceTint(), Q.primary = Q.colorSpec.primary(), Q.onPrimary = Q.colorSpec.onPrimary(), Q.primaryContainer = Q.colorSpec.primaryContainer(), Q.onPrimaryContainer = Q.colorSpec.onPrimaryContainer(), Q.inversePrimary = Q.colorSpec.inversePrimary(), Q.secondary = Q.colorSpec.secondary(), Q.onSecondary = Q.colorSpec.onSecondary(), Q.secondaryContainer = Q.colorSpec.secondaryContainer(), Q.onSecondaryContainer = Q.colorSpec.onSecondaryContainer(), Q.tertiary = Q.colorSpec.tertiary(), Q.onTertiary = Q.colorSpec.onTertiary(), Q.tertiaryContainer = Q.colorSpec.tertiaryContainer(), Q.onTertiaryContainer = Q.colorSpec.onTertiaryContainer(), Q.error = Q.colorSpec.error(), Q.onError = Q.colorSpec.onError(), Q.errorContainer = Q.colorSpec.errorContainer(), Q.onErrorContainer = Q.colorSpec.onErrorContainer(), Q.primaryFixed = Q.colorSpec.primaryFixed(), Q.primaryFixedDim = Q.colorSpec.primaryFixedDim(), Q.onPrimaryFixed = Q.colorSpec.onPrimaryFixed(), Q.onPrimaryFixedVariant = Q.colorSpec.onPrimaryFixedVariant(), Q.secondaryFixed = Q.colorSpec.secondaryFixed(), Q.secondaryFixedDim = Q.colorSpec.secondaryFixedDim(), Q.onSecondaryFixed = Q.colorSpec.onSecondaryFixed(), Q.onSecondaryFixedVariant = Q.colorSpec.onSecondaryFixedVariant(), Q.tertiaryFixed = Q.colorSpec.tertiaryFixed(), Q.tertiaryFixedDim = Q.colorSpec.tertiaryFixedDim(), Q.onTertiaryFixed = Q.colorSpec.onTertiaryFixed(), Q.onTertiaryFixedVariant = Q.colorSpec.onTertiaryFixedVariant();
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
		this.sourceColorArgb = this.sourceColorHct.toInt(), this.variant = t.variant, this.contrastLevel = t.contrastLevel, this.isDark = t.isDark, this.platform = t.platform ?? "phone", this.specVersion = e.maybeFallbackSpecVersion(t.specVersion ?? "2021", this.variant), this.primaryPalette = t.primaryPalette ?? Gi(this.specVersion).getPrimaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.secondaryPalette = t.secondaryPalette ?? Gi(this.specVersion).getSecondaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.tertiaryPalette = t.tertiaryPalette ?? Gi(this.specVersion).getTertiaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralPalette = t.neutralPalette ?? Gi(this.specVersion).getNeutralPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralVariantPalette = t.neutralVariantPalette ?? Gi(this.specVersion).getNeutralVariantPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.errorPalette = t.errorPalette ?? Gi(this.specVersion).getErrorPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel) ?? W.fromHueAndChroma(25, 84), this.colors = new Q();
	}
	toString() {
		let e = this.sourceColorHcts.length <= 1 ? "" : `sourceColorHctList=[${this.sourceColorHcts.map((e) => e.toString()).join(", ")}], `;
		return `Scheme: variant=${q[this.variant]}, mode=${this.isDark ? "dark" : "light"}, platform=${this.platform}, contrastLevel=${this.contrastLevel.toFixed(1)}, seed=${this.sourceColorHct.toString()}, ` + e + `specVersion=${this.specVersion}`;
	}
	static getPiecewiseHue(e, t, n) {
		let r = Math.min(t.length - 1, n.length), i = e.hue;
		for (let e = 0; e < r; e++) if (i >= t[e] && i < t[e + 1]) return z(n[e]);
		return i;
	}
	static getRotatedHue(t, n, r) {
		let i = e.getPiecewiseHue(t, n, r);
		return Math.min(n.length - 1, r.length) <= 0 && (i = 0), z(t.hue + i);
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
var Vi = class {
	getPrimaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.CONTENT:
			case q.FIDELITY: return W.fromHueAndChroma(t.hue, t.chroma);
			case q.FRUIT_SALAD: return W.fromHueAndChroma(z(t.hue - 50), 48);
			case q.MONOCHROME: return W.fromHueAndChroma(t.hue, 0);
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, 12);
			case q.RAINBOW: return W.fromHueAndChroma(t.hue, 48);
			case q.TONAL_SPOT: return W.fromHueAndChroma(t.hue, 36);
			case q.EXPRESSIVE: return W.fromHueAndChroma(z(t.hue + 240), 40);
			case q.VIBRANT: return W.fromHueAndChroma(t.hue, 200);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getSecondaryPalette(e, t, n, r, i) {
		switch (e) {
			case q.CONTENT:
			case q.FIDELITY: return W.fromHueAndChroma(t.hue, Math.max(t.chroma - 32, t.chroma * .5));
			case q.FRUIT_SALAD: return W.fromHueAndChroma(z(t.hue - 50), 36);
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
			case q.CONTENT: return W.fromHct(Si.fixIfDisliked(new Ai(t).analogous(3, 6)[2]));
			case q.FIDELITY: return W.fromHct(Si.fixIfDisliked(new Ai(t).complement));
			case q.FRUIT_SALAD: return W.fromHueAndChroma(t.hue, 36);
			case q.MONOCHROME: return W.fromHueAndChroma(t.hue, 0);
			case q.NEUTRAL: return W.fromHueAndChroma(t.hue, 16);
			case q.RAINBOW:
			case q.TONAL_SPOT: return W.fromHueAndChroma(z(t.hue + 60), 24);
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
			case q.EXPRESSIVE: return W.fromHueAndChroma(z(t.hue + 15), 8);
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
			case q.EXPRESSIVE: return W.fromHueAndChroma(z(t.hue + 15), 12);
			case q.VIBRANT: return W.fromHueAndChroma(t.hue, 12);
			default: throw Error(`Unsupported variant: ${e}`);
		}
	}
	getErrorPalette(e, t, n, r, i) {}
}, Hi = class e extends Vi {
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
}, Ui = new Vi(), Wi = new Hi();
function Gi(e) {
	return e === "2025" ? Wi : Ui;
}
var Ki = [
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
], qi = {
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
}, Ji = new Q(), Yi = U.fromPalette({
	name: "on_on_primary",
	palette: (e) => e.primaryPalette,
	background: () => Ji.onPrimary(),
	contrastCurve: () => new G(6, 6, 7, 11)
}), Xi = U.fromPalette({
	name: "primary_container_subtle",
	palette: (e) => e.primaryPalette,
	isBackground: !0,
	background: (e) => Ji.highestSurface(e),
	contrastCurve: () => void 0
}), Zi = U.fromPalette({
	name: "on_primary_container_subtle",
	palette: (e) => e.primaryPalette,
	background: () => Xi,
	contrastCurve: () => new G(6, 6, 7, 11)
}), Qi = U.fromPalette({
	name: "secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	isBackground: !0,
	background: (e) => Ji.highestSurface(e),
	contrastCurve: () => void 0
}), $i = U.fromPalette({
	name: "on_secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	background: () => Qi,
	contrastCurve: () => new G(6, 6, 7, 11)
}), ea = U.fromPalette({
	name: "tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	isBackground: !0,
	background: (e) => Ji.highestSurface(e),
	contrastCurve: () => void 0
}), ta = U.fromPalette({
	name: "on_tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	background: () => ea,
	contrastCurve: () => new G(6, 6, 7, 11)
}), na = U.fromPalette({
	name: "error_container_subtle",
	palette: (e) => e.errorPalette,
	isBackground: !0,
	background: (e) => Ji.highestSurface(e),
	contrastCurve: () => void 0
}), ra = U.fromPalette({
	name: "on_error_container_subtle",
	palette: (e) => e.errorPalette,
	background: () => na,
	contrastCurve: () => new G(6, 6, 7, 11)
}), ia = [
	...Ji.allColors.filter((e) => e.name !== "background" && e.name !== "on_background"),
	Ji.shadow(),
	Ji.scrim(),
	Yi,
	Xi,
	Zi,
	Qi,
	$i,
	ea,
	ta,
	na,
	ra
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
function aa(e) {
	let t = (e & 16777215).toString(16).padStart(6, "0");
	return t[0] === t[1] && t[2] === t[3] && t[4] === t[5] ? `#${t[0]}${t[2]}${t[4]}` : `#${t}`;
}
function oa(e) {
	let t = e.replace("#", "").trim();
	if (t.length === 3) {
		let e = t[0] + t[0], n = t[1] + t[1], r = t[2] + t[2];
		return Number.parseInt(`ff${e}${n}${r}`, 16);
	}
	return t.length === 6 ? Number.parseInt(`ff${t}`, 16) : t.length === 8 ? Number.parseInt(t, 16) : null;
}
function sa(e) {
	return e.replaceAll("_", "-");
}
function ca(e, t) {
	return new $({
		sourceColorHcts: [B.fromInt(e)],
		variant: q.TONAL_SPOT,
		contrastLevel: 0,
		specVersion: "2025",
		isDark: t
	});
}
function la(e, t) {
	for (let n of Ki) e[n] = qi[t][n];
	return e;
}
function ua(e, t) {
	let n = e === "dark", r = ca((t ? oa(t) : null) ?? 4278216887, n), i = {};
	for (let e of ia) {
		let t = sa(e.name);
		i[t] = aa(e.getArgb(r));
	}
	return la(i, e), {
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
//#region packages/ui-kit/src/schema-form/inputs/WallpaperPreviewField.svelte
Gr(ua("light"), ua("dark")), typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), Jn(["input"]), Jn(["change"]), Jn(["change"]), Jn(["change"]), Jn(["click"]), Jn(["change"]);
//#endregion
//#region packages/ui-kit/src/form/date-field-utils.ts
function da(e) {
	return e?.toLowerCase() === "en" ? "en" : "zh-CN";
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
Jn(["click"]), Jn(["click"]), Jn(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function fa(e) {
	return {
		[Hr]: !0,
		mount(t, n) {
			let r = sr(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				dr(r);
			} };
		}
	};
}
//#endregion
//#region packages/ui-kit/src/i18n/plugin-text.ts
function pa(e, t, n, r, i) {
	let a = n["zh-cn"][r] ?? n.en?.[r] ?? String(r);
	if (!e) return Vr(a, i);
	e.slotVersion;
	let o = e.translatePlugin(t, r, i);
	return o === r ? Vr(a, i) : o;
}
//#endregion
//#region packages/plugins/calendar-holidays/src/messages.ts
var ma = {
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
}, ha = "tool-calendar-holidays", ga = "https://fastly.jsdelivr.net/gh/NateScarlet/holiday-cn@master", _a = {
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
function va(e) {
	return e.days.filter((e) => e.isOffDay).map((e) => ({
		date: e.date,
		label: e.name
	}));
}
async function ya(e, t) {
	let n = `${ga}/${t}.json`;
	try {
		let t = await e.request(n, {
			method: "GET",
			timeoutMs: 15e3
		});
		if (!t.ok) throw Error(`HTTP ${t.status}`);
		return await t.json();
	} catch (e) {
		return _a[t] || (console.warn(`[calendar-holidays] No holiday-cn data for ${t}`, e), null);
	}
}
async function ba(e, t) {
	let n = (await Promise.all(t.map((t) => ya(e, t)))).filter((e) => e !== null);
	if (n.length === 0) throw Error(`No holiday-cn data for years: ${t.join(", ")}`);
	let r = n.flatMap((e) => va(e)), i = /* @__PURE__ */ new Map();
	for (let e of r) i.has(e.date) || i.set(e.date, e);
	return { holidays: [...i.values()].sort((e, t) => e.date.localeCompare(t.date)) };
}
//#endregion
//#region packages/plugins/calendar-holidays/src/holiday-sync.ts
var xa = /* @__PURE__ */ new Map();
async function Sa(e) {
	return Pr(e.service(Br));
}
function Ca(e, t) {
	if (!e?.syncedAt || !e.syncedYears?.length) return !0;
	let n = new Set(e.syncedYears);
	return t.some((e) => !n.has(e));
}
async function wa(e, t = {}) {
	let n = e.state.currentTimetable;
	if (!n) throw Error("No active timetable");
	let r = n.id, i = xa.get(r);
	if (i) return i;
	let a = Ea(e, r, n.academicConfig, t).finally(() => {
		xa.delete(r);
	});
	return xa.set(r, a), a;
}
async function Ta(e, t = {}) {
	return e.state.currentTimetable ? wa(e, t) : !1;
}
async function Ea(e, t, n, r) {
	let i = Lr(n), a = e.service(Br), o = await a.getTimetable(t);
	if (!o) throw Error(`Timetable not found: ${t}`);
	if (!r.force && !Ca(o.academicConfig.holidayCalendar, i)) return !1;
	let { holidays: s } = await ba(e.service(zr), i), c = {
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
function Da(e = {}) {
	let { screenComponent: t } = e, n;
	return Jr({
		id: ha,
		messages: ma,
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
				href: `/plugins/${ha}`,
				icon: "event",
				iconTone: "secondary",
				keywords: i,
				order: 25
			}), e.registerSlot("shell.route.screen", {
				id: ha,
				title: () => r("screen.title"),
				...t ? { component: t } : {}
			});
			try {
				await Ta(e);
			} catch {
				e.actions.notify(r("screen.error.syncFailed"), "warn");
			}
			e.on("timetable:switched", async () => {
				try {
					await Ta(e);
				} catch {}
			});
		},
		async dispose() {
			let e = n;
			n = void 0, e && await Sa(e);
		}
	});
}
//#endregion
//#region packages/plugins/calendar-holidays/src/HolidayCalendarScreen.svelte
var Oa = /* @__PURE__ */ nr("<p class=\"text-body-medium py-6 text-center text-on-surface-variant\"> </p>"), ka = /* @__PURE__ */ nr("<li class=\"py-3\"><span class=\"text-body-medium text-on-surface\"> </span></li>"), Aa = /* @__PURE__ */ nr("<ul class=\"divide-y divide-outline/10\"></ul>"), ja = /* @__PURE__ */ nr("<div class=\"mt-3 flex flex-col gap-4\"></div>"), Ma = /* @__PURE__ */ nr("<p class=\"text-body-small text-error\"> </p>"), Na = /* @__PURE__ */ nr("<div class=\"flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4\"><section class=\"rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs\"><p class=\"text-body-medium text-on-surface-variant\"> </p> <button type=\"button\" class=\"text-label-large mt-4 w-full rounded-full bg-primary px-4 py-3 text-on-primary disabled:opacity-50\"> </button> <div class=\"mt-3 flex items-center justify-between gap-3\"><a class=\"text-body-small shrink-0 text-primary\" href=\"https://github.com/NateScarlet/holiday-cn\" target=\"_blank\" rel=\"noreferrer\"> </a> <p class=\"text-body-small text-right text-on-surface-variant\"> </p></div></section> <section class=\"rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs\"><h3 class=\"text-title-small text-on-surface\"> </h3> <!></section> <!></div>");
function Pa(e, t) {
	Me(t, !0);
	let n = /* @__PURE__ */ At(!1), r = /* @__PURE__ */ At(null), i = /* @__PURE__ */ nt(() => t.controller.currentTimetable), a = /* @__PURE__ */ nt(() => I(i)?.academicConfig.holidayCalendar), o = /* @__PURE__ */ nt(() => I(i) && I(a) ? Ir(I(a).holidays, I(i).academicConfig) : []), s = /* @__PURE__ */ nt(() => u(I(o))), c = /* @__PURE__ */ nt(() => !!I(a)?.syncedAt);
	function l(e) {
		return pa(t.controller, ha, ma, e);
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
		return l("screen.sync.last").replace("{time}", n.toLocaleString(da(t.controller.currentLocale), {
			month: "numeric",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		}));
	}
	async function p() {
		if (!I(i)) {
			Mt(r, l("screen.error.noTimetable"), !0);
			return;
		}
		Mt(n, !0), Mt(r, null);
		try {
			let e = t.controller.getPluginContext(t.pluginId);
			await wa(e, { force: !0 }), e.actions.notify(l("screen.notify.synced"), "info");
		} catch (e) {
			Mt(r, e instanceof Error ? e.message : l("screen.error.syncFailed"), !0);
		} finally {
			Mt(n, !1);
		}
	}
	var m = Na(), h = A(m), g = A(h), _ = A(g, !0);
	D(g);
	var v = Kt(g, 2), y = A(v, !0);
	D(v);
	var b = Kt(v, 2), x = A(b), S = A(x, !0);
	D(x);
	var C = Kt(x, 2), w = A(C, !0);
	D(C), D(b), D(h);
	var ee = Kt(h, 2), te = A(ee), ne = A(te, !0);
	D(te);
	var re = Kt(te, 2), ie = (e) => {
		var t = Oa(), n = A(t, !0);
		D(t), on((e) => or(n, e), [() => I(a)?.holidays.length ? l("screen.list.empty") : l("screen.list.emptyHint")]), rr(e, t);
	}, ae = (e) => {
		var n = ja();
		_r(n, 21, () => I(s), (e) => e.key, (e, n) => {
			var r = Aa();
			_r(r, 21, () => I(n).items, (e) => e.date, (e, n) => {
				var r = ka(), i = A(r), a = A(i, !0);
				D(i), D(r), on((e) => or(a, e), [() => d(I(n), t.controller.currentLocale)]), rr(e, r);
			}), D(r), rr(e, r);
		}), D(n), rr(e, n);
	};
	pr(re, (e) => {
		I(o).length === 0 ? e(ie) : e(ae, -1);
	}), D(ee);
	var oe = Kt(ee, 2), se = (e) => {
		var t = Ma(), n = A(t, !0);
		D(t), on(() => or(n, I(r))), rr(e, t);
	};
	pr(oe, (e) => {
		I(r) && e(se);
	}), D(m), on((e, t, r, a, o) => {
		or(_, e), v.disabled = I(n) || !I(i), or(y, t), or(S, r), or(w, a), or(ne, o);
	}, [
		() => l("screen.intro.body"),
		() => I(n) ? l("screen.sync.syncing") : I(c) ? l("screen.sync.resync") : l("screen.sync.action"),
		() => l("screen.intro.source"),
		() => f(I(a)?.syncedAt),
		() => l("screen.list.heading")
	]), qn("click", v, p), rr(e, m), Ne();
}
Jn(["click"]);
//#endregion
//#region packages/plugins/calendar-holidays/bundle/entry.ts
var Fa = Da({ screenComponent: fa(Pa) });
//#endregion
export { Fa as default };
