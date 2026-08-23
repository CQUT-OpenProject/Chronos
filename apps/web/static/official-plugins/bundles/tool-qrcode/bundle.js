//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/utils.js
var e = Array.isArray, t = Array.prototype.indexOf, n = Array.prototype.includes, r = Array.from, i = Object.defineProperty, a = Object.getOwnPropertyDescriptor, o = Object.prototype, s = Array.prototype, c = Object.getPrototypeOf, l = Object.isExtensible, u = () => {};
function d(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function f() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var p = 1024, m = 2048, h = 4096, ee = 8192, te = 16384, ne = 32768, re = 1 << 25, ie = 65536, g = 1 << 19, ae = 1 << 20, _ = 65536, oe = 1 << 21, se = 1 << 22, ce = 1 << 23, le = Symbol("$state"), ue = Symbol("attributes"), de = Symbol("class"), fe = Symbol("style"), pe = Symbol("text"), v = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function me() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function he() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ge() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function _e() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function ve() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ye() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/constants.js
var y = Symbol("uninitialized");
function be() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function xe() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function Se(e) {
	return e === this.v;
}
function Ce(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function we(e) {
	return !Ce(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var b = null;
function x(e) {
	b = e;
}
function Te(e, t = !1, n) {
	b = {
		p: b,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: null
	};
}
function Ee(e) {
	var t = b, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) At(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, b = t.p, e ?? {};
}
function S() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var C = [];
function De() {
	var e = C;
	C = [], d(e);
}
function w(e) {
	if (C.length === 0 && !$e) {
		var t = C;
		queueMicrotask(() => {
			t === C && De();
		});
	}
	C.push(e);
}
function Oe(e) {
	var t = U;
	if (t === null) return B.f |= ce, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	T(e, t);
}
function T(e, t) {
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
var ke = ~(m | h | p);
function E(e, t) {
	e.f = e.f & ke | t;
}
function Ae(e) {
	e.f & 512 || e.deps === null ? E(e, p) : E(e, h);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function je(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= _, je(t.deps));
}
function Me(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), je(e.deps), E(e, p);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Ne(e) {
	var t = B, n = U;
	H(null), W(null);
	try {
		return e();
	} finally {
		H(t), W(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function Pe(e) {
	let t = 0, n = ft(0), r;
	return () => {
		Ot() && (Q(n), Pt(() => (t === 0 && (r = cn(() => e(() => F(n)))), t += 1, () => {
			w(() => {
				--t, t === 0 && (r?.(), r = void 0, F(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var Fe = ie | g;
function Ie(e, t, n, r) {
	new Le(e, t, n, r);
}
var Le = class {
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
	#m = Pe(() => (this.#p = ft(this.#c), () => {
		this.#p = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#t = t, this.#n = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#r = It(() => {
			this.#g();
		}, Fe);
	}
	#h(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				xe();
				return;
			}
			t = !0, n && ye(), this.#o !== null && Ut(this.#o, () => {
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
					T(e, this.#r && this.#r.parent);
				}
			}
		};
	}
	#g() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#l = 0, this.#c = 0, this.#i = Lt(() => {
				this.#n(this.#e);
			}), this.#l > 0) {
				var e = this.#s = document.createDocumentFragment();
				Gt(this.#i, e);
				let t = this.#t.pending;
				this.#a = Lt(() => t(this.#e));
			} else this.#_(O);
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		this.is_pending = !1, e.transfer_effects(this.#d, this.#f);
	}
	defer_effect(e) {
		Me(e, this.#d, this.#f);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#t.pending;
	}
	#v(e) {
		var t = U, n = B, r = b;
		W(this.#r), H(this.#r), x(this.#r.ctx);
		try {
			return it.ensure(), e();
		} catch (e) {
			return Oe(e), null;
		} finally {
			W(t), H(n), x(r);
		}
	}
	#y(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#y(e, t);
			return;
		}
		this.#l += e, this.#l === 0 && (this.#_(t), this.#a && Ut(this.#a, () => {
			this.#a = null;
		}), this.#s &&= (this.#e.before(this.#s), null));
	}
	update_pending_count(e, t) {
		this.#y(e, t), this.#c += e, !(!this.#p || this.#u) && (this.#u = !0, w(() => {
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
					return Lt(() => {
						var r = U;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return T(e, this.#r.parent), null;
				}
			}));
		};
		w(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				T(e, this.#r && this.#r.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => T(e, this.#r && this.#r.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function Re(e, t, n, r) {
	let i = S() ? He : Ge;
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
				T(e, s);
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
		Promise.all(n.map((e) => /* @__PURE__ */ We(e))).then(u).catch((e) => T(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), Be();
	}) : f();
}
function ze() {
	var e = U, t = B, n = b, r = O;
	return function(i = !0) {
		W(e), H(t), x(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Be(e = !0) {
	W(null), H(null), x(null), e && O?.deactivate();
}
function Ve() {
	var e = U, t = e.b, n = O, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function He(e) {
	var t = 2 | m;
	return U !== null && (U.f |= g), {
		ctx: b,
		deps: null,
		effects: null,
		equals: Se,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: y,
		wv: 0,
		parent: U,
		ac: null
	};
}
var Ue = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function We(e, t, n) {
	let r = U;
	r === null && me();
	var i = void 0, a = ft(y), o = !B, s = /* @__PURE__ */ new Set();
	return Nt(() => {
		var t = U, n = f();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== v && n.reject(e);
			}).finally(Be);
		} catch (e) {
			n.reject(e), Be();
		}
		var c = O;
		if (o) {
			if (t.f & 32768) var l = Ve();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(Ue);
			else for (let e of s.values()) e.reject(Ue);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== Ue && (c.activate(), t ? (a.f |= ce, pt(a, t)) : (a.f & 8388608 && (a.f ^= ce), pt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), kt(() => {
		for (let e of s) e.reject(Ue);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Ge(e) {
	let t = /* @__PURE__ */ He(e);
	return t.equals = we, t;
}
function Ke(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) R(t[n]);
	}
}
function qe(e) {
	var t, n = U, r = e.parent;
	if (!z && r !== null && e.v !== y && r.f & 24576) return be(), e.v;
	W(r);
	try {
		e.f &= ~_, Ke(e), t = nn(e);
	} finally {
		W(n);
	}
	return t;
}
function Je(e) {
	var t = qe(e);
	if (!e.equals(t) && (e.wv = $t(), (!O?.is_fork || e.deps === null) && (O === null ? e.v = t : (O.capture(e, t, !0), Ze?.capture(e, t, !0)), e.deps === null))) {
		E(e, p);
		return;
	}
	z || (k === null ? Ae(e) : (Ot() || O?.is_fork) && k.set(e, t));
}
function Ye(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Ne(() => {
		t.ac.abort(v), t.ac = null;
	}), t.fn !== null && (t.teardown = u), an(t, 0), zt(t));
}
function Xe(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Z(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var D = null, O = null, Ze = null, k = null, Qe = null, $e = !1, et = !1, A = null, tt = null, nt = 0, rt = 1, it = class e {
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
			for (var r of n.d) E(r, m), t(r);
			for (r of n.m) E(r, h), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, nt++ > 1e3 && (this.#x(), at());
		for (let e of this.#u) this.#d.delete(e), E(e, m), this.schedule(e);
		for (let e of this.#d) E(e, h), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = A = [], r = [], i = tt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw lt(e), this.#h() || this.discard(), t;
		}
		if (O = null, i.length > 0) {
			var a = e.ensure();
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
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= p;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= p : i & 4 ? t.push(r) : en(r) && (i & 16 && this.#d.add(r), Z(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), E(i, m), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), O = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Me(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== y && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), k?.set(e, t)), this.is_fork || (e.v = t);
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
		this.#m || (this.#m = !0, w(() => {
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
		return (this.#s ??= f()).promise;
	}
	static ensure() {
		if (O === null) {
			let t = O = new e();
			!et && w(() => {
				t.#e || t.flush();
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
				t.f ^= p;
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
		he();
	} catch (e) {
		T(e, Qe);
	}
}
var j = null;
function ot(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && en(r) && (j = /* @__PURE__ */ new Set(), Z(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ht(r), j?.size > 0)) {
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
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), E(e, p);
		for (var n = e.first; n !== null;) ct(n, t), n = n.next;
	}
}
function lt(e) {
	E(e, p);
	for (var t = e.first; t !== null;) lt(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var ut = /* @__PURE__ */ new Set(), M = /* @__PURE__ */ new Map(), dt = !1;
function ft(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Se,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function N(e, t) {
	let n = ft(e, t);
	return Yt(n), n;
}
function P(e, t, n = !1) {
	return B !== null && (!V || B.f & 131072) && S() && B.f & 4325394 && (G === null || !G.has(e)) && ve(), pt(e, n ? I(t) : t, tt);
}
function pt(e, t, n = null) {
	if (!e.equals(t)) {
		M.set(e, z ? t : e.v);
		var r = it.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && qe(t), k === null && Ae(t);
		}
		e.wv = $t(), ht(e, m, n), S() && U !== null && U.f & 1024 && !(U.f & 96) && (J === null ? Xt([e]) : J.push(e)), !r.is_fork && ut.size > 0 && !dt && mt();
	}
	return t;
}
function mt() {
	dt = !1;
	for (let e of ut) {
		e.f & 1024 && E(e, h);
		let t;
		try {
			t = en(e);
		} catch {
			t = !0;
		}
		t && Z(e);
	}
	ut.clear();
}
function F(e) {
	P(e, e.v + 1);
}
function ht(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = S(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === U)) {
			var l = (c & m) === 0;
			if (l && E(s, t), c & 131072) ut.add(s);
			else if (c & 2) {
				var u = s;
				k?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= _), ht(u, h, n));
			} else if (l) {
				var d = s;
				c & 16 && j !== null && j.add(d), n === null ? st(d) : n.push(d);
			}
		}
	}
}
function I(t) {
	if (typeof t != "object" || !t || le in t) return t;
	let n = c(t);
	if (n !== o && n !== s) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), l = /* @__PURE__ */ N(0), u = null, d = X, f = (e) => {
		if (X === d) return e();
		var t = B, n = X;
		H(null), Qt(d);
		var r = e();
		return H(t), Qt(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ N(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ge();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ N(n.value, u);
				return r.set(t, e), e;
			}) : P(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ N(y, u));
					r.set(t, e), F(l);
				}
			} else P(n, y), F(l);
			return !0;
		},
		get(e, n, i) {
			if (n === le) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ N(I(s ? e[n] : y), u)), r.set(n, o)), o !== void 0) {
				var c = Q(o);
				return c === y ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = Q(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== y) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === le) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== y || Reflect.has(e, t);
			return (n !== void 0 || U !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ N(i ? I(e[t]) : y, u)), r.set(t, n)), Q(n) === y) ? !1 : i;
		},
		set(e, t, n, o) {
			var s = r.get(t), c = t in e;
			if (i && t === "length") for (var d = n; d < s.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ N(y, u)), r.set(d + "", p)) : P(p, y);
			}
			if (s === void 0) (!c || a(e, t)?.writable) && (s = f(() => /* @__PURE__ */ N(void 0, u)), P(s, I(n)), r.set(t, s));
			else {
				c = s.v !== y;
				var m = f(() => I(n));
				P(s, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(o, n), !c) {
				if (i && typeof t == "string") {
					var ee = r.get("length"), te = Number(t);
					Number.isInteger(te) && te >= ee.v && P(ee, te + 1);
				}
				F(l);
			}
			return !0;
		},
		ownKeys(e) {
			Q(l);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== y;
			});
			for (var [n, i] of r) i.v !== y && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			_e();
		}
	});
}
var gt, _t, vt, yt;
function bt() {
	if (gt === void 0) {
		gt = window, _t = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		vt = a(t, "firstChild").get, yt = a(t, "nextSibling").get, l(e) && (e[de] = void 0, e[ue] = null, e[fe] = void 0, e.__e = void 0), l(n) && (n[pe] = void 0);
	}
}
function xt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function St(e) {
	return vt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Ct(e) {
	return yt.call(e);
}
function wt(e, t) {
	return /* @__PURE__ */ St(e);
}
function Tt(e, t = 1, n = !1) {
	let r = e;
	for (; t--;) r = /* @__PURE__ */ Ct(r);
	return r;
}
function Et(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function Dt(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function L(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= ee);
	var r = {
		ctx: b,
		deps: null,
		nodes: null,
		f: e | m | 512,
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
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ie));
	}
	if (i !== null && (i.parent = n, n !== null && Dt(i, n), B !== null && B.f & 2 && !(e & 64))) {
		var a = B;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Ot() {
	return B !== null && !V;
}
function kt(e) {
	let t = L(8, null);
	return E(t, p), t.teardown = e, t;
}
function At(e) {
	return L(4 | ae, e);
}
function jt(e) {
	it.ensure();
	let t = L(64 | g, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Ut(t, () => {
			R(t), n(void 0);
		}) : (R(t), n(void 0));
	});
}
function Mt(e) {
	return L(4, e);
}
function Nt(e) {
	return L(se | g, e);
}
function Pt(e, t = 0) {
	return L(8 | t, e);
}
function Ft(e, t = [], n = [], r = []) {
	Re(r, t, n, (t) => {
		L(8, () => {
			e(...t.map(Q));
		});
	});
}
function It(e, t = 0) {
	return L(16 | t, e);
}
function Lt(e) {
	return L(32 | g, e);
}
function Rt(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = z, n = B;
		Jt(!0), H(null);
		try {
			t.call(null);
		} finally {
			Jt(e), H(n);
		}
	}
}
function zt(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Ne(() => {
			e.abort(v);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : R(n, t), n = r;
	}
}
function Bt(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || R(t), t = n;
	}
}
function R(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Vt(e.nodes.start, e.nodes.end), n = !0), e.f |= re, zt(e, t && !n), an(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Rt(e), e.f ^= re, e.f |= te;
	var i = e.parent;
	i !== null && i.first !== null && Ht(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Vt(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Ct(e);
		e.remove(), e = n;
	}
}
function Ht(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ut(e, t, n = !0) {
	var r = [];
	Wt(e, r, !0);
	var i = () => {
		n && R(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Wt(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= ee;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Wt(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Gt(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Ct(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var Kt = null, qt = !1, z = !1;
function Jt(e) {
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
function Yt(e) {
	B !== null && (G ??= /* @__PURE__ */ new Set()).add(e);
}
var K = null, q = 0, J = null;
function Xt(e) {
	J = e;
}
var Zt = 1, Y = 0, X = Y;
function Qt(e) {
	X = e;
}
function $t() {
	return ++Zt;
}
function en(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~_), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (en(a) && Je(a), a.wv > e.wv) return !0;
		}
		t & 512 && k === null && E(e, p);
	}
	return !1;
}
function tn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(G !== null && G.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? tn(a, t, !1) : t === a && (n ? E(a, m) : a.f & 1024 && E(a, h), st(a));
	}
}
function nn(e) {
	var t = K, n = q, r = J, i = B, a = G, o = b, s = V, c = X, l = e.f;
	K = null, q = 0, J = null, B = l & 96 ? null : e, G = null, x(e.ctx), V = !1, X = ++Y, e.ac !== null && (Ne(() => {
		e.ac.abort(v);
	}), e.ac = null);
	try {
		e.f |= oe;
		var u = e.fn, d = u();
		e.f |= ne;
		var f = e.deps, p = O?.is_fork;
		if (K !== null) {
			var m;
			if (p || an(e, q), f !== null && q > 0) for (f.length = q + K.length, m = 0; m < K.length; m++) f[q + m] = K[m];
			else e.deps = f = K;
			if (Ot() && e.f & 512) for (m = q; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && q < f.length && (an(e, q), f.length = q);
		if (S() && J !== null && !V && f !== null && !(e.f & 6146)) for (m = 0; m < J.length; m++) tn(J[m], e);
		if (i !== null && i !== e) {
			if (Y++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Y;
			if (t !== null) for (let e of t) e.rv = Y;
			J !== null && (r === null ? r = J : r.push(...J));
		}
		return e.f & 8388608 && (e.f ^= ce), d;
	} catch (e) {
		return Oe(e);
	} finally {
		e.f ^= oe, K = t, q = n, J = r, B = i, G = a, x(o), V = s, X = c;
	}
}
function rn(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (K === null || !n.call(K, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~_), s.v !== y && Ae(s), s.ac !== null && Ne(() => {
			s.ac.abort(v), s.ac = null, E(s, m);
		}), Ye(s), an(s, 0);
	}
}
function an(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) rn(e, n[r]);
}
function Z(e) {
	var t = e.f;
	if (!(t & 16384)) {
		E(e, p);
		var n = U, r = qt;
		U = e, qt = !(t & 96);
		try {
			t & 16777232 ? Bt(e) : zt(e), Rt(e);
			var i = nn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Zt;
		} finally {
			qt = r, U = n;
		}
	}
}
function Q(e) {
	var t = !!(e.f & 2);
	if (Kt?.add(e), B !== null && !V && !(U !== null && U.f & 16384) && (G === null || !G.has(e))) {
		var r = B.deps;
		if (B.f & 2097152) e.rv < Y && (e.rv = Y, K === null && r !== null && r[q] === e ? q++ : K === null ? K = [e] : K.push(e));
		else {
			B.deps ??= [], n.call(B.deps, e) || B.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [B] : n.call(i, B) || i.push(B);
		}
	}
	if (z && M.has(e)) return M.get(e);
	if (t) {
		var a = e;
		if (z) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || sn(a)) && (o = qe(a)), M.set(a, o), o;
		}
		var s = !(a.f & 512) && !V && B !== null && (qt || !!(B.f & 512)), c = (a.f & ne) === 0;
		en(a) && (s && (a.f |= 512), Je(a)), s && !c && (Xe(a), on(a));
	}
	if (k?.has(e)) return k.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function on(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Xe(t), on(t));
}
function sn(e) {
	if (e.v === y) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (M.has(t) || t.f & 2 && sn(t)) return !0;
	return !1;
}
function cn(e) {
	var t = V;
	try {
		return V = !0, e();
	} finally {
		V = t;
	}
}
"allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".");
var ln = ["touchstart", "touchmove"];
function un(e) {
	return ln.includes(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var $ = Symbol("events"), dn = /* @__PURE__ */ new Set(), fn = /* @__PURE__ */ new Set();
function pn(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || vn.call(t, e), !e.cancelBubble) return Ne(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? w(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function mn(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = pn(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && kt(() => {
		t.removeEventListener(e, o, a);
	});
}
function hn(e, t, n) {
	(t[$] ??= {})[e] = n;
}
function gn(e) {
	for (var t = 0; t < e.length; t++) dn.add(e[t]);
	for (var n of fn) n(e);
}
var _n = null;
function vn(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	_n = e;
	var s = 0, c = _n === e && e[$];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[$] = t;
			return;
		}
		var u = a.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (o = a[s] || e.target, o !== t) {
		i(e, "currentTarget", {
			configurable: !0,
			get() {
				return o || n;
			}
		});
		var d = B, f = U;
		H(null), W(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[$]?.[r];
					h != null && (!o.disabled || e.target === o) && h.call(o, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, o = s < a.length ? a[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[$] = t, delete e.currentTarget, H(d), W(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var yn = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function bn(e) {
	return yn?.createHTML(e) ?? e;
}
function xn(e) {
	var t = Et("template");
	return t.innerHTML = bn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function Sn(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Cn(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		i === void 0 && (i = xn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ St(i)));
		var t = r || _t ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ St(t), s = t.lastChild;
			Sn(o, s);
		} else Sn(t, t);
		return t;
	};
}
function wn(e, t) {
	e !== null && e.before(t);
}
function Tn(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[pe] ??= e.nodeValue) && (e[pe] = n, e.nodeValue = `${n}`);
}
function En(e, t) {
	return On(e, t);
}
var Dn = /* @__PURE__ */ new Map();
function On(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	bt();
	var l = void 0, u = jt(() => {
		var s = n ?? t.appendChild(xt());
		Ie(s, { pending: () => {} }, (t) => {
			Te({});
			var n = b;
			o && (n.c = o), a && (i.$$events = a), l = e(t, i) || {}, Ee();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = un(r);
					for (let e of [t, document]) {
						var a = Dn.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Dn.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, vn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(dn)), fn.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Dn.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, vn), r.delete(e), r.size === 0 && Dn.delete(n)) : r.set(e, i);
			}
			fn.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return kn.set(l, u), l;
}
var kn = /* @__PURE__ */ new WeakMap();
function An(e, t) {
	let n = kn.get(e);
	return n ? (kn.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var jn = [..." 	\n\r\f\xA0\v﻿"];
function Mn(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || jn.includes(r[o - 1])) && (s === r.length || jn.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function Nn(e, t, n, r, i, a) {
	var o = e[de];
	if (o !== n || o === void 0) {
		var s = Mn(n, r, a);
		s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s), e[de] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Pn(e, t) {
	return e === t || e?.[le] === t;
}
function Fn(e = {}, t, n, r) {
	var i = b.r, a = U;
	return Mt(() => {
		var o, s;
		return Pt(() => {
			o = s, s = r?.() || [], cn(() => {
				Pn(n(...s), e) || (t(e, ...s), o && Pn(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Pn(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
var In = [
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
], Ln = In.map(([e, t]) => ({
	background: e,
	foreground: t
})), Rn = /\s+/g;
function zn(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = t * 31 + e.charCodeAt(n) | 0;
	return t;
}
function Bn(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(Rn, " ");
}
function Vn(e) {
	return In[Math.abs(zn(e) % In.length)] ?? In[0];
}
new Map(Ln.map((e, t) => [e.background.toLowerCase(), t]));
//#endregion
//#region packages/core/src/domain/course.ts
function Hn(e) {
	let t = e.name ? Bn(e.name) : "", [n, r] = t ? Vn(t) : ["#EADDFF", "#21005D"];
	return {
		teacher: "",
		location: "",
		weeks: [],
		remark: "",
		color: e.color || n,
		textColor: e.textColor || (e.color ? void 0 : r),
		...e
	};
}
var Un = "未命名课表";
function Wn(e) {
	let t = e.trim();
	return t.length > 0 ? t : Un;
}
function Gn(e) {
	if (!e) return;
	let t = e.source.trim() || "UNKNOWN", n = e.campusId?.trim();
	return n ? {
		source: t,
		campusId: n
	} : { source: t };
}
function Kn(e) {
	let t = Date.now(), n = Gn(e.importMetadata), r = e.courses ?? [];
	return {
		schemaVersion: e.schemaVersion ?? 1,
		id: e.id,
		name: Wn(e.name),
		courses: r,
		academicConfig: {
			termStartDate: e.academicConfig?.termStartDate ?? "",
			startWeek: e.academicConfig?.startWeek ?? 1,
			endWeek: e.academicConfig?.endWeek ?? 20,
			periodTimes: e.academicConfig?.periodTimes ?? []
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
//#region packages/core/src/schema/schema.ts
function qn(e) {
	return e;
}
new Set(/* @__PURE__ */ "color.surface,color.onSurface,color.primary,color.onPrimary,color.surfaceVariant,color.outline,color.secondary,color.onSecondary,color.primaryContainer,color.onPrimaryContainer,color.secondaryContainer,color.onSecondaryContainer,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-encode.ts
var Jn = /* @__PURE__ */ new Uint8Array(512), Yn = /* @__PURE__ */ new Uint8Array(256);
(() => {
	let e = 1;
	for (let t = 0; t < 255; t++) Jn[t] = e, Jn[t + 255] = e, Yn[e] = t, e <<= 1, e & 256 && (e ^= 285);
})();
function Xn(e, t) {
	return e === 0 || t === 0 ? 0 : Jn[Yn[e] + Yn[t]];
}
function Zn(e) {
	let t = new Uint8Array([1]);
	for (let n = 0; n < e; n++) {
		let e = new Uint8Array(t.length + 1);
		for (let r = 0; r < t.length; r++) e[r] ^= Xn(t[r], Jn[n]), e[r + 1] ^= t[r];
		t = e;
	}
	return t;
}
function Qn(e, t) {
	let n = Zn(t), r = new Uint8Array(t);
	for (let i = 0; i < e.length; i++) {
		let a = e[i] ^ r[0];
		for (let e = 0; e < t - 1; e++) r[e] = r[e + 1] ^ Xn(n[e + 1], a);
		r[t - 1] = Xn(n[t], a);
	}
	return r;
}
var $n = [
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
], er = [
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
], tr = [
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
], nr = 9174;
function rr(e) {
	let t = $n[e - 1];
	if (!t) throw Error(`Unsupported QR version: ${e}`);
	return t;
}
function ir(e) {
	for (let t = 1; t <= 40; t++) {
		let n = rr(t).blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0);
		if (e + (t <= 9 ? 2 : 3) <= n) return t;
	}
	throw Error(`Data payload too large for QR Code (length: ${e}, max capacity: 2953 bytes)`);
}
function ar(e, t) {
	let n = new TextEncoder().encode(e), r = rr(t), i = r.blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0), a = [];
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
		d.push(t), f.push(Qn(t, r.eccPerBlock)), p += e.dataCodewords;
	}
	let m = [], h = Math.max(...d.map((e) => e.length));
	for (let e = 0; e < h; e++) for (let t of d) e < t.length && m.push(t[e]);
	for (let e = 0; e < r.eccPerBlock; e++) for (let t of f) m.push(t[e]);
	return Uint8Array.from(m);
}
function or(e) {
	let t = ir(new TextEncoder().encode(e).length), n = t * 4 + 17, r = Array.from({ length: n }, () => Array(n).fill(null)), i = Array.from({ length: n }, () => Array(n).fill(!1));
	function a(e, t, a, o = !0) {
		e >= 0 && e < n && t >= 0 && t < n && (r[e][t] = a, o && (i[e][t] = !0));
	}
	function o(e, t) {
		for (let r = -1; r <= 7; r++) for (let i = -1; i <= 7; i++) {
			let o = e + r, s = t + i;
			o < 0 || o >= n || s < 0 || s >= n || (r === -1 || r === 7 || i === -1 || i === 7 ? a(o, s, !1) : r === 0 || r === 6 || i === 0 || i === 6 || r >= 2 && r <= 4 && i >= 2 && i <= 4 ? a(o, s, !0) : a(o, s, !1));
		}
	}
	o(0, 0), o(0, n - 7), o(n - 7, 0);
	for (let e = 8; e < n - 8; e++) r[6][e] === null && a(6, e, e % 2 == 0), r[e][6] === null && a(e, 6, e % 2 == 0);
	let s = er[t - 1] ?? [];
	for (let e of s) for (let t of s) if (!i[e][t]) for (let n = -2; n <= 2; n++) for (let r = -2; r <= 2; r++) {
		let i = Math.max(Math.abs(n), Math.abs(r)) !== 1;
		a(e + n, t + r, i);
	}
	a(n - 8, 8, !0);
	for (let e = 0; e < 9; e++) r[8][e] === null && a(8, e, !1, !0), r[e][8] === null && a(e, 8, !1, !0);
	for (let e = 0; e < 8; e++) r[8][n - 1 - e] === null && a(8, n - 1 - e, !1, !0), r[n - 1 - e][8] === null && a(n - 1 - e, 8, !1, !0);
	if (t >= 7) {
		let e = tr[t - 7];
		for (let t = 0; t < 18; t++) {
			let r = (e >> t & 1) == 1, i = Math.floor(t / 3), o = t % 3 + n - 11;
			a(i, o, r), a(o, i, r);
		}
	}
	let c = ar(e, t), l = 0, u = n - 1, d = -1;
	for (let e = n - 1; e > 0; e -= 2) for (e === 6 && e--;;) {
		for (let t = 0; t < 2; t++) {
			let n = e - t;
			if (!i[u][n]) {
				let e = Math.floor(l / 8), t = 7 - l % 8, i = e < c.length && (c[e] >> t & 1) == 1;
				r[u][n] = i, l++;
			}
		}
		if (u += d, u < 0 || u >= n) {
			d = -d, u += d;
			break;
		}
	}
	for (let e = 0; e < n; e++) for (let t = 0; t < n; t++) i[e][t] || (e + t) % 2 == 0 && (r[e][t] = !r[e][t]);
	let f = nr;
	for (let e = 0; e < 15; e++) {
		let t = (f >> e & 1) == 1;
		e < 6 ? r[8][e] = t : e < 8 ? r[8][e + 1] = t : r[8][n - 15 + e] = t, e < 8 ? r[n - 1 - e][8] = t : r[14 - e][8] = t;
	}
	return {
		size: n,
		modules: r.map((e) => e.map((e) => !!e))
	};
}
function sr(e, t = {}) {
	let { margin: n = 2, color: r = "#000000", background: i = "#ffffff", size: a = 512 } = t, o = or(e), s = o.size + n * 2, c = [];
	for (let e = 0; e < o.size; e++) for (let t = 0; t < o.size; t++) o.modules[e][t] && c.push(`M${t + n},${e + n}h1v1h-1z`);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${a}" height="${a}" shape-rendering="crispEdges" data-chronos-qr="${e}"><metadata>${e}</metadata><rect width="${s}" height="${s}" fill="${i}"/><path d="${c.join("")}" fill="${r}"/></svg>`;
}
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-decode.ts
async function cr(e) {
	if (typeof window > "u") throw Error("QR 解码仅支持在浏览器环境中运行");
	try {
		let t = await e.text(), n = /chronos-qr:[A-Za-z0-9+/=:_-]+/.exec(t);
		if (n) return n[0];
		let r = t.trim();
		if (r.startsWith("{") && r.endsWith("}")) return r;
	} catch {}
	let t = URL.createObjectURL(e), n = document.createElement("canvas"), r = n.getContext("2d");
	try {
		let e = new Image();
		await new Promise((n, r) => {
			e.onload = () => n(), e.onerror = () => r(/* @__PURE__ */ Error("无法读取图片内容")), e.src = t;
		});
		let i = e.naturalWidth || e.width || 512, a = e.naturalHeight || e.height || 512;
		if (n.width = i, n.height = a, r?.drawImage(e, 0, 0, i, a), window.BarcodeDetector) try {
			let e = await new window.BarcodeDetector({ formats: ["qr_code"] }).detect(n);
			if (e.length > 0 && e[0]?.rawValue) return e[0].rawValue;
		} catch (e) {
			console.warn("[BarcodeDetector] detect failed on canvas:", e);
		}
	} finally {
		URL.revokeObjectURL(t);
	}
	throw Error("未能从该图片中识别出有效的二维码或当前浏览器不支持原生扫码识别");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region packages/plugins/codec-qrcode/src/QrCodeImportTab.svelte
var lr = /* @__PURE__ */ Cn("<div class=\"rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs\"><div class=\"flex flex-col gap-4\"><div><h2 class=\"m3-title-medium text-on-surface\">从二维码导入</h2> <p class=\"m3-body-small mt-0.5 text-on-surface-variant\">选择或拖入他人分享的课表二维码图片</p></div> <input type=\"file\" accept=\"image/*,.svg\" class=\"hidden\"/> <div role=\"region\" aria-label=\"二维码图片上传区域\"><svg class=\"size-10 text-on-surface-variant/80\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><path d=\"M14 14h3v3h-3z\"></path><path d=\"M20 14v3h-3\"></path><path d=\"M14 20h7\"></path></svg> <div class=\"flex flex-col gap-1\"><span class=\"m3-body-medium font-medium text-on-surface\">点击选择二维码图片</span> <span class=\"m3-body-small text-on-surface-variant\">支持 PNG、JPEG、WebP 或 SVG 格式</span></div> <button type=\"button\" class=\"m3-label-large mt-1 rounded-full bg-primary px-6 py-2.5 font-medium text-on-primary disabled:opacity-50\"> </button></div></div></div>");
function ur(e, t) {
	Te(t, !0);
	let n = /* @__PURE__ */ N(!1), r = /* @__PURE__ */ N(null), i = /* @__PURE__ */ N(!1);
	function a() {
		let { errorMessage: e } = t.transfer.state;
		e && alert(e);
	}
	async function o(e) {
		P(n, !0);
		try {
			let n = await cr(e);
			await t.transfer.previewWithSlot("qrcode", { content: n }) ? t.onContinue() : a();
		} catch (e) {
			let t = e instanceof Error ? e.message : "二维码识别失败";
			alert(t);
		} finally {
			P(n, !1);
		}
	}
	async function s(e) {
		let t = e.target, n = t.files?.[0];
		n && (await o(n), t.value = "");
	}
	async function c(e) {
		e.preventDefault(), P(i, !1);
		let t = e.dataTransfer?.files?.[0];
		t && await o(t);
	}
	var l = lr(), u = Tt(wt(wt(l)), 2);
	Fn(u, (e) => P(r, e), () => Q(r));
	var d = Tt(u, 2), f = Tt(wt(d), 4), p = wt(f, !0);
	Ft(() => {
		Nn(d, 1, `flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${Q(i) ? "border-primary bg-primary/5" : "border-outline/40 bg-surface-variant/20"}`), f.disabled = Q(n), Tn(p, Q(n) ? "识别中…" : "选择图片");
	}), hn("change", u, s), mn("dragover", d, (e) => {
		e.preventDefault(), P(i, !0);
	}), mn("dragleave", d, () => P(i, !1)), mn("drop", d, c), hn("click", f, () => Q(r)?.click()), wn(e, l), Ee();
}
gn(["change", "click"]);
//#endregion
//#region packages/plugins/codec-qrcode/src/index.ts
function dr(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
	return typeof btoa == "function" ? btoa(t) : Buffer.from(e).toString("base64");
}
function fr(e) {
	let t = typeof atob == "function" ? atob(e) : Buffer.from(e, "base64").toString("binary"), n = new Uint8Array(t.length);
	for (let e = 0; e < t.length; e++) n[e] = t.charCodeAt(e);
	return n;
}
async function pr(e) {
	if (typeof CompressionStream < "u") try {
		let t = new CompressionStream("deflate-raw"), n = t.writable.getWriter();
		n.write(e), n.close();
		let r = await new Response(t.readable).arrayBuffer();
		return new Uint8Array(r);
	} catch {}
	return e;
}
async function mr(e) {
	if (typeof DecompressionStream < "u") try {
		let t = new DecompressionStream("deflate-raw"), n = t.writable.getWriter();
		n.write(e), n.close();
		let r = await new Response(t.readable).arrayBuffer();
		return new Uint8Array(r);
	} catch {}
	return e;
}
function hr(e) {
	let t = 0;
	for (let n of e) n >= 1 && n <= 31 && (t |= 1 << n);
	return t;
}
function gr(e) {
	let t = [];
	for (let n = 1; n <= 31; n++) e & 1 << n && t.push(n);
	return t.length > 0 ? t : [1];
}
async function _r(e) {
	let t = [], n = /* @__PURE__ */ new Map();
	function r(e) {
		if (!e) return -1;
		let r = e.trim();
		if (!r) return -1;
		let i = n.get(r);
		return i === void 0 && (i = t.length, t.push(r), n.set(r, i)), i;
	}
	let i = e.courses.map((e) => {
		let t = r(e.name), n = r(e.teacher), i = r(e.location), a = r(e.remark), o = r(e.color), s = hr(e.weeks), c = [
			t,
			n,
			i,
			e.dayOfWeek,
			e.startPeriod,
			e.endPeriod,
			s
		];
		return (a >= 0 || o >= 0) && c.push(a >= 0 ? a : -1), o >= 0 && c.push(o), c;
	}), a = {
		v: 2,
		n: e.name,
		s: t,
		c: i
	};
	e.academicConfig?.termStartDate && (a.d = e.academicConfig.termStartDate), (e.academicConfig?.startWeek !== void 0 || e.academicConfig?.endWeek !== void 0) && (a.w = [e.academicConfig.startWeek ?? 1, e.academicConfig.endWeek ?? 20]), e.academicConfig?.periodTimes?.length && (a.p = e.academicConfig.periodTimes.map((e) => [
		e.index,
		e.startTime,
		e.endTime
	]));
	let o = JSON.stringify(a);
	return `chronos-qr:v2:${dr(await pr(new TextEncoder().encode(o)))}`;
}
async function vr(e) {
	let t = e.trim();
	if (t.startsWith("chronos-qr:v2:")) {
		let e = await mr(fr(t.slice(14))), n = new TextDecoder().decode(e), r = JSON.parse(n), i = r.s ?? [], a = (r.c ?? []).map((e, t) => {
			let n = (e[0] >= 0 ? i[e[0]] : null) ?? "未命名课程", r = (e[1] >= 0 ? i[e[1]] : null) ?? "", a = (e[2] >= 0 ? i[e[2]] : null) ?? "", o = e[3] ?? 1, s = e[4] ?? 1, c = e[5] ?? 1, l = gr(e[6] ?? 1), u = e[7] !== void 0 && e[7] >= 0 ? i[e[7]] : void 0, d = e[8] !== void 0 && e[8] >= 0 ? i[e[8]] : void 0;
			return Hn({
				id: `c-qr-${t + 1}-${Date.now().toString(36)}`,
				name: n,
				teacher: r,
				location: a,
				dayOfWeek: o,
				startPeriod: s,
				endPeriod: c,
				weeks: l,
				remark: u,
				color: d
			});
		});
		return Kn({
			id: `t-qr-${Date.now().toString(36)}`,
			name: r.n || "二维码导入课表",
			academicConfig: {
				termStartDate: r.d ?? "",
				startWeek: r.w?.[0] ?? 1,
				endWeek: r.w?.[1] ?? 20,
				periodTimes: (r.p ?? []).map((e) => ({
					index: e[0],
					startTime: e[1],
					endTime: e[2]
				}))
			},
			courses: a
		});
	}
	if (t.startsWith("chronos-qr:v1:")) {
		let e = fr(t.slice(14));
		t = new TextDecoder().decode(e);
	}
	let n;
	try {
		n = JSON.parse(t);
	} catch {
		throw Error("二维码数据格式损坏或无法解析为课表");
	}
	if (!n || typeof n != "object") throw Error("二维码内容不是合法的课表数据结构");
	let r = n;
	if (Array.isArray(r.courses)) return Kn({
		id: `t-qr-${Date.now().toString(36)}`,
		name: r.name || "二维码导入课表",
		academicConfig: r.academicConfig,
		courses: r.courses.map((e) => Hn(e))
	});
	throw Error("二维码中未包含有效的课表课程数据");
}
var yr = qn({ content: {
	type: "string",
	title: () => "二维码内容",
	placeholder: () => "二维码识别出的数据内容",
	required: !0
} });
function br(e = {}) {
	let { importComponent: t = ur } = e;
	return {
		id: "tool-qrcode",
		name: () => "课表二维码",
		version: "1.0.0",
		description: () => "课表二维码生成与识别导入",
		category: "tool",
		order: 35,
		author: "CQUT OpenProject",
		homepage: "https://github.com/CQUT-OpenProject/Chronos",
		async apply(e) {
			e.registerSlot("import.source.tab", {
				id: "qrcode",
				title: () => "二维码",
				order: 25,
				importKind: "file",
				badge: () => "图片",
				supportingText: () => "选择或扫描课表二维码图片进行导入",
				component: t,
				inputSchema: yr,
				async executeImport(e) {
					let t = e.content ?? e.fileContent;
					if (!t?.trim()) throw Error("未识别到有效的二维码内容");
					return vr(t);
				}
			}), e.registerSlot("export.action", {
				id: "qrcode",
				title: () => "课表二维码",
				order: 20,
				disposition: "download",
				isPrimary: !1,
				description: () => "生成分享二维码矢量图并保存",
				async export(e, t) {
					let n = e ?? t?.state.currentTimetable;
					if (!n) throw Error("无可导出的课表");
					let r = sr(await _r(n), { margin: 2 });
					return {
						filename: `${(n.name || "timetable").replace(/[/\\?%*:|"<>]/g, "_")}-qrcode.svg`,
						mimeType: "image/svg+xml",
						content: r,
						disposition: "download",
						successMessage: () => "已生成并下载课表二维码"
					};
				}
			});
		}
	};
}
br();
//#endregion
//#region packages/plugins/codec-qrcode/bundle/entry.ts
var xr = br({ importComponent: {
	[Symbol.for("chronos.mountable")]: !0,
	mount(e, t) {
		let n = En(ur, {
			target: e,
			props: t
		});
		return { unmount() {
			An(n);
		} };
	}
} });
//#endregion
export { xr as default };
