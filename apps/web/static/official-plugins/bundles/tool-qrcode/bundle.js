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
var p = 1024, m = 2048, h = 4096, ee = 8192, te = 16384, ne = 32768, re = 1 << 25, ie = 65536, g = 1 << 19, ae = 1 << 20, _ = 65536, oe = 1 << 21, se = 1 << 22, ce = 1 << 23, le = Symbol("$state"), ue = Symbol("attributes"), de = Symbol("class"), fe = Symbol("style"), pe = Symbol("text"), me = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function he() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ge() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function _e() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ve() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function ye() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function be() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/constants.js
var v = Symbol("uninitialized");
function xe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Se() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function Ce(e) {
	return e === this.v;
}
function we(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Te(e) {
	return !we(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var y = null;
function b(e) {
	y = e;
}
function Ee(e, t = !1, n) {
	y = {
		p: y,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: W,
		l: null
	};
}
function De(e) {
	var t = y, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) kt(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, y = t.p, e ?? {};
}
function x() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var S = [];
function Oe() {
	var e = S;
	S = [], d(e);
}
function C(e) {
	if (S.length === 0 && !Qe) {
		var t = S;
		queueMicrotask(() => {
			t === S && Oe();
		});
	}
	S.push(e);
}
function ke(e) {
	var t = W;
	if (t === null) return V.f |= ce, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	w(e, t);
}
function w(e, t) {
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
var Ae = ~(m | h | p);
function T(e, t) {
	e.f = e.f & Ae | t;
}
function je(e) {
	e.f & 512 || e.deps === null ? T(e, p) : T(e, h);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Me(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= _, Me(t.deps));
}
function Ne(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Me(e.deps), T(e, p);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function E(e) {
	var t = V, n = W;
	U(null), G(null);
	try {
		return e();
	} finally {
		U(t), G(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function Pe(e) {
	let t = 0, n = dt(0), r;
	return () => {
		Dt() && ($(n), Nt(() => (t === 0 && (r = sn(() => e(() => I(n)))), t += 1, () => {
			C(() => {
				--t, t === 0 && (r?.(), r = void 0, I(n));
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
	#m = Pe(() => (this.#p = dt(this.#c), () => {
		this.#p = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#t = t, this.#n = (e) => {
			var t = W;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = W.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#r = Ft(() => {
			this.#g();
		}, Fe);
	}
	#h(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				Se();
				return;
			}
			t = !0, n && be(), this.#o !== null && Ht(this.#o, () => {
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
					w(e, this.#r && this.#r.parent);
				}
			}
		};
	}
	#g() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#l = 0, this.#c = 0, this.#i = It(() => {
				this.#n(this.#e);
			}), this.#l > 0) {
				var e = this.#s = document.createDocumentFragment();
				Wt(this.#i, e);
				let t = this.#t.pending;
				this.#a = It(() => t(this.#e));
			} else this.#_(k);
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		this.is_pending = !1, e.transfer_effects(this.#d, this.#f);
	}
	defer_effect(e) {
		Ne(e, this.#d, this.#f);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#t.pending;
	}
	#v(e) {
		var t = W, n = V, r = y;
		G(this.#r), U(this.#r), b(this.#r.ctx);
		try {
			return rt.ensure(), e();
		} catch (e) {
			return ke(e), null;
		} finally {
			G(t), U(n), b(r);
		}
	}
	#y(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#y(e, t);
			return;
		}
		this.#l += e, this.#l === 0 && (this.#_(t), this.#a && Ht(this.#a, () => {
			this.#a = null;
		}), this.#s &&= (this.#e.before(this.#s), null));
	}
	update_pending_count(e, t) {
		this.#y(e, t), this.#c += e, !(!this.#p || this.#u) && (this.#u = !0, C(() => {
			this.#u = !1, this.#p && ft(this.#p, this.#c);
		}));
	}
	get_effect_pending() {
		return this.#m(), $(this.#p);
	}
	error(e) {
		if (!this.#t.onerror && !this.#t.failed) throw e;
		k?.is_fork ? (this.#i && k.skip_effect(this.#i), this.#a && k.skip_effect(this.#a), this.#o && k.skip_effect(this.#o), k.oncommit(() => {
			this.#b(e);
		})) : this.#b(e);
	}
	#b(e) {
		this.#i &&= (z(this.#i), null), this.#a &&= (z(this.#a), null), this.#o &&= (z(this.#o), null);
		let t = this.#t.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#h(e);
			r(), t && (this.#o = this.#v(() => {
				try {
					return It(() => {
						var r = W;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return w(e, this.#r.parent), null;
				}
			}));
		};
		C(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				w(e, this.#r && this.#r.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => w(e, this.#r && this.#r.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function Re(e, t, n, r) {
	let i = x() ? He : We;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = W, c = ze(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				w(e, s);
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
		Promise.all(n.map((e) => /* @__PURE__ */ Ue(e))).then(u).catch((e) => w(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), Be();
	}) : f();
}
function ze() {
	var e = W, t = V, n = y, r = k;
	return function(i = !0) {
		G(e), U(t), b(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Be(e = !0) {
	G(null), U(null), b(null), e && k?.deactivate();
}
function Ve() {
	var e = W, t = e.b, n = k, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function He(e) {
	var t = 2 | m;
	return W !== null && (W.f |= g), {
		ctx: y,
		deps: null,
		effects: null,
		equals: Ce,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v,
		wv: 0,
		parent: W,
		ac: null
	};
}
var D = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Ue(e, t, n) {
	let r = W;
	r === null && he();
	var i = void 0, a = dt(v), o = !V, s = /* @__PURE__ */ new Set();
	return Mt(() => {
		var t = W, n = f();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== me && n.reject(e);
			}).finally(Be);
		} catch (e) {
			n.reject(e), Be();
		}
		var c = k;
		if (o) {
			if (t.f & 32768) var l = Ve();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(D);
			else for (let e of s.values()) e.reject(D);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== D && (c.activate(), t ? (a.f |= ce, ft(a, t)) : (a.f & 8388608 && (a.f ^= ce), ft(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Ot(() => {
		for (let e of s) e.reject(D);
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
function We(e) {
	let t = /* @__PURE__ */ He(e);
	return t.equals = Te, t;
}
function Ge(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) z(t[n]);
	}
}
function Ke(e) {
	var t, n = W, r = e.parent;
	if (!B && r !== null && e.v !== v && r.f & 24576) return xe(), e.v;
	G(r);
	try {
		e.f &= ~_, Ge(e), t = tn(e);
	} finally {
		G(n);
	}
	return t;
}
function qe(e) {
	var t = Ke(e);
	if (!e.equals(t) && (e.wv = Qt(), (!k?.is_fork || e.deps === null) && (k === null ? e.v = t : (k.capture(e, t, !0), Xe?.capture(e, t, !0)), e.deps === null))) {
		T(e, p);
		return;
	}
	B || (A === null ? je(e) : (Dt() || k?.is_fork) && A.set(e, t));
}
function Je(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && E(() => {
		t.ac.abort(me), t.ac = null;
	}), t.fn !== null && (t.teardown = u), rn(t, 0), Rt(t));
}
function Ye(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Q(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var O = null, k = null, Xe = null, A = null, Ze = null, Qe = !1, $e = !1, j = null, et = null, tt = 0, nt = 1, rt = class e {
	id = nt++;
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
		O === null ? O = this : (O.#n = this, this.#t = O), O = this;
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
			for (var r of n.d) T(r, m), t(r);
			for (r of n.m) T(r, h), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, tt++ > 1e3 && (this.#x(), it());
		for (let e of this.#u) this.#d.delete(e), T(e, m), this.schedule(e);
		for (let e of this.#d) T(e, h), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = j = [], r = [], i = et = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw ct(e), this.#h() || this.discard(), t;
		}
		if (k = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (j = null, et = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) st(e, t);
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
		this.#r.clear(), Xe = this, at(r), at(n), Xe = null, this.#s?.resolve();
		var s = k;
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
				a ? r.f ^= p : i & 4 ? t.push(r) : $t(r) && (i & 16 && this.#d.add(r), Q(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), T(i, m), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), k = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Ne(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== v && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), A?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		k = this;
	}
	deactivate() {
		k = null, A = null;
	}
	flush() {
		try {
			$e = !0, k = this, this.#g();
		} finally {
			tt = 0, Ze = null, j = null, et = null, $e = !1, k = null, A = null, N.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(D);
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
		this.#m || (this.#m = !0, C(() => {
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
		if (k === null) {
			let t = k = new e();
			!$e && C(() => {
				t.#e || t.flush();
			});
		}
		return k;
	}
	apply() {
		A = null;
	}
	schedule(e) {
		if (Ze = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (j !== null && t === W && (V === null || !(V.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? O = e : t.#t = e, this.linked = !1;
		}
	}
};
function it() {
	try {
		ge();
	} catch (e) {
		w(e, Ze);
	}
}
var M = null;
function at(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && $t(r) && (M = /* @__PURE__ */ new Set(), Q(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Vt(r), M?.size > 0)) {
				N.clear();
				for (let e of M) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) M.has(n) && (M.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Q(n);
					}
				}
				M.clear();
			}
		}
		M = null;
	}
}
function ot(e) {
	k.schedule(e);
}
function st(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), T(e, p);
		for (var n = e.first; n !== null;) st(n, t), n = n.next;
	}
}
function ct(e) {
	T(e, p);
	for (var t = e.first; t !== null;) ct(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var lt = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Map(), ut = !1;
function dt(e, t) {
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
function P(e, t) {
	let n = dt(e, t);
	return Jt(n), n;
}
function F(e, t, n = !1) {
	return V !== null && (!H || V.f & 131072) && x() && V.f & 4325394 && (K === null || !K.has(e)) && ye(), ft(e, n ? L(t) : t, et);
}
function ft(e, t, n = null) {
	if (!e.equals(t)) {
		N.set(e, B ? t : e.v);
		var r = rt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ke(t), A === null && je(t);
		}
		e.wv = Qt(), mt(e, m, n), x() && W !== null && W.f & 1024 && !(W.f & 96) && (Y === null ? Yt([e]) : Y.push(e)), !r.is_fork && lt.size > 0 && !ut && pt();
	}
	return t;
}
function pt() {
	ut = !1;
	for (let e of lt) {
		e.f & 1024 && T(e, h);
		let t;
		try {
			t = $t(e);
		} catch {
			t = !0;
		}
		t && Q(e);
	}
	lt.clear();
}
function I(e) {
	F(e, e.v + 1);
}
function mt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = x(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === W)) {
			var l = (c & m) === 0;
			if (l && T(s, t), c & 131072) lt.add(s);
			else if (c & 2) {
				var u = s;
				A?.delete(u), c & 65536 || (c & 512 && (W === null || !(W.f & 2097152)) && (s.f |= _), mt(u, h, n));
			} else if (l) {
				var d = s;
				c & 16 && M !== null && M.add(d), n === null ? ot(d) : n.push(d);
			}
		}
	}
}
function L(t) {
	if (typeof t != "object" || !t || le in t) return t;
	let n = c(t);
	if (n !== o && n !== s) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), l = /* @__PURE__ */ P(0), u = null, d = Z, f = (e) => {
		if (Z === d) return e();
		var t = V, n = Z;
		U(null), Zt(d);
		var r = e();
		return U(t), Zt(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ P(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && _e();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ P(n.value, u);
				return r.set(t, e), e;
			}) : F(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ P(v, u));
					r.set(t, e), I(l);
				}
			} else F(n, v), I(l);
			return !0;
		},
		get(e, n, i) {
			if (n === le) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ P(L(s ? e[n] : v), u)), r.set(n, o)), o !== void 0) {
				var c = $(o);
				return c === v ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = $(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== v) return {
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
			var n = r.get(t), i = n !== void 0 && n.v !== v || Reflect.has(e, t);
			return (n !== void 0 || W !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ P(i ? L(e[t]) : v, u)), r.set(t, n)), $(n) === v) ? !1 : i;
		},
		set(e, t, n, o) {
			var s = r.get(t), c = t in e;
			if (i && t === "length") for (var d = n; d < s.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ P(v, u)), r.set(d + "", p)) : F(p, v);
			}
			if (s === void 0) (!c || a(e, t)?.writable) && (s = f(() => /* @__PURE__ */ P(void 0, u)), F(s, L(n)), r.set(t, s));
			else {
				c = s.v !== v;
				var m = f(() => L(n));
				F(s, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(o, n), !c) {
				if (i && typeof t == "string") {
					var ee = r.get("length"), te = Number(t);
					Number.isInteger(te) && te >= ee.v && F(ee, te + 1);
				}
				I(l);
			}
			return !0;
		},
		ownKeys(e) {
			$(l);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== v;
			});
			for (var [n, i] of r) i.v !== v && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ve();
		}
	});
}
var ht, gt, _t, vt;
function yt() {
	if (ht === void 0) {
		ht = window, gt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		_t = a(t, "firstChild").get, vt = a(t, "nextSibling").get, l(e) && (e[de] = void 0, e[ue] = null, e[fe] = void 0, e.__e = void 0), l(n) && (n[pe] = void 0);
	}
}
function bt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function xt(e) {
	return _t.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function St(e) {
	return vt.call(e);
}
function Ct(e, t) {
	return /* @__PURE__ */ xt(e);
}
function wt(e, t = 1, n = !1) {
	let r = e;
	for (; t--;) r = /* @__PURE__ */ St(r);
	return r;
}
function Tt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function Et(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function R(e, t) {
	var n = W;
	n !== null && n.f & 8192 && (e |= ee);
	var r = {
		ctx: y,
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
	k?.register_created_effect(r);
	var i = r;
	if (e & 4) j === null ? rt.ensure().schedule(r) : j.push(r);
	else if (t !== null) {
		try {
			Q(r);
		} catch (e) {
			throw z(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ie));
	}
	if (i !== null && (i.parent = n, n !== null && Et(i, n), V !== null && V.f & 2 && !(e & 64))) {
		var a = V;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Dt() {
	return V !== null && !H;
}
function Ot(e) {
	let t = R(8, null);
	return T(t, p), t.teardown = e, t;
}
function kt(e) {
	return R(4 | ae, e);
}
function At(e) {
	rt.ensure();
	let t = R(64 | g, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Ht(t, () => {
			z(t), n(void 0);
		}) : (z(t), n(void 0));
	});
}
function jt(e) {
	return R(4, e);
}
function Mt(e) {
	return R(se | g, e);
}
function Nt(e, t = 0) {
	return R(8 | t, e);
}
function Pt(e, t = [], n = [], r = []) {
	Re(r, t, n, (t) => {
		R(8, () => {
			e(...t.map($));
		});
	});
}
function Ft(e, t = 0) {
	return R(16 | t, e);
}
function It(e) {
	return R(32 | g, e);
}
function Lt(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = B, n = V;
		qt(!0), U(null);
		try {
			t.call(null);
		} finally {
			qt(e), U(n);
		}
	}
}
function Rt(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && E(() => {
			e.abort(me);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : z(n, t), n = r;
	}
}
function zt(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || z(t), t = n;
	}
}
function z(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Bt(e.nodes.start, e.nodes.end), n = !0), e.f |= re, Rt(e, t && !n), rn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Lt(e), e.f ^= re, e.f |= te;
	var i = e.parent;
	i !== null && i.first !== null && Vt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Bt(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ St(e);
		e.remove(), e = n;
	}
}
function Vt(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ht(e, t, n = !0) {
	var r = [];
	Ut(e, r, !0);
	var i = () => {
		n && z(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Ut(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= ee;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Ut(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Wt(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ St(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var Gt = null, Kt = !1, B = !1;
function qt(e) {
	B = e;
}
var V = null, H = !1;
function U(e) {
	V = e;
}
var W = null;
function G(e) {
	W = e;
}
var K = null;
function Jt(e) {
	V !== null && (K ??= /* @__PURE__ */ new Set()).add(e);
}
var q = null, J = 0, Y = null;
function Yt(e) {
	Y = e;
}
var Xt = 1, X = 0, Z = X;
function Zt(e) {
	Z = e;
}
function Qt() {
	return ++Xt;
}
function $t(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~_), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if ($t(a) && qe(a), a.wv > e.wv) return !0;
		}
		t & 512 && A === null && T(e, p);
	}
	return !1;
}
function en(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(K !== null && K.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? en(a, t, !1) : t === a && (n ? T(a, m) : a.f & 1024 && T(a, h), ot(a));
	}
}
function tn(e) {
	var t = q, n = J, r = Y, i = V, a = K, o = y, s = H, c = Z, l = e.f;
	q = null, J = 0, Y = null, V = l & 96 ? null : e, K = null, b(e.ctx), H = !1, Z = ++X, e.ac !== null && (E(() => {
		e.ac.abort(me);
	}), e.ac = null);
	try {
		e.f |= oe;
		var u = e.fn, d = u();
		e.f |= ne;
		var f = e.deps, p = k?.is_fork;
		if (q !== null) {
			var m;
			if (p || rn(e, J), f !== null && J > 0) for (f.length = J + q.length, m = 0; m < q.length; m++) f[J + m] = q[m];
			else e.deps = f = q;
			if (Dt() && e.f & 512) for (m = J; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && J < f.length && (rn(e, J), f.length = J);
		if (x() && Y !== null && !H && f !== null && !(e.f & 6146)) for (m = 0; m < Y.length; m++) en(Y[m], e);
		if (i !== null && i !== e) {
			if (X++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = X;
			if (t !== null) for (let e of t) e.rv = X;
			Y !== null && (r === null ? r = Y : r.push(...Y));
		}
		return e.f & 8388608 && (e.f ^= ce), d;
	} catch (e) {
		return ke(e);
	} finally {
		e.f ^= oe, q = t, J = n, Y = r, V = i, K = a, b(o), H = s, Z = c;
	}
}
function nn(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (q === null || !n.call(q, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~_), s.v !== v && je(s), s.ac !== null && E(() => {
			s.ac.abort(me), s.ac = null, T(s, m);
		}), Je(s), rn(s, 0);
	}
}
function rn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) nn(e, n[r]);
}
function Q(e) {
	var t = e.f;
	if (!(t & 16384)) {
		T(e, p);
		var n = W, r = Kt;
		W = e, Kt = !(t & 96);
		try {
			t & 16777232 ? zt(e) : Rt(e), Lt(e);
			var i = tn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Xt;
		} finally {
			Kt = r, W = n;
		}
	}
}
function $(e) {
	var t = !!(e.f & 2);
	if (Gt?.add(e), V !== null && !H && !(W !== null && W.f & 16384) && (K === null || !K.has(e))) {
		var r = V.deps;
		if (V.f & 2097152) e.rv < X && (e.rv = X, q === null && r !== null && r[J] === e ? J++ : q === null ? q = [e] : q.push(e));
		else {
			V.deps ??= [], n.call(V.deps, e) || V.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [V] : n.call(i, V) || i.push(V);
		}
	}
	if (B && N.has(e)) return N.get(e);
	if (t) {
		var a = e;
		if (B) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || on(a)) && (o = Ke(a)), N.set(a, o), o;
		}
		var s = !(a.f & 512) && !H && V !== null && (Kt || !!(V.f & 512)), c = (a.f & ne) === 0;
		$t(a) && (s && (a.f |= 512), qe(a)), s && !c && (Ye(a), an(a));
	}
	if (A?.has(e)) return A.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function an(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Ye(t), an(t));
}
function on(e) {
	if (e.v === v) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (N.has(t) || t.f & 2 && on(t)) return !0;
	return !1;
}
function sn(e) {
	var t = H;
	try {
		return H = !0, e();
	} finally {
		H = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var cn = ["touchstart", "touchmove"];
function ln(e) {
	return cn.includes(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var un = Symbol("events"), dn = /* @__PURE__ */ new Set(), fn = /* @__PURE__ */ new Set();
function pn(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || vn.call(t, e), !e.cancelBubble) return E(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? C(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function mn(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = pn(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && Ot(() => {
		t.removeEventListener(e, o, a);
	});
}
function hn(e, t, n) {
	(t[un] ??= {})[e] = n;
}
function gn(e) {
	for (var t = 0; t < e.length; t++) dn.add(e[t]);
	for (var n of fn) n(e);
}
var _n = null;
function vn(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	_n = e;
	var s = 0, c = _n === e && e[un];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[un] = t;
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
		var d = V, f = W;
		U(null), G(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[un]?.[r];
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
			e[un] = t, delete e.currentTarget, U(d), G(f);
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
	var t = Tt("template");
	return t.innerHTML = bn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function Sn(e, t) {
	var n = W;
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
		i === void 0 && (i = xn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ xt(i)));
		var t = r || gt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ xt(t), s = t.lastChild;
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
	yt();
	var l = void 0, u = At(() => {
		var s = n ?? t.appendChild(bt());
		Ie(s, { pending: () => {} }, (t) => {
			Ee({});
			var n = y;
			o && (n.c = o), a && (i.$$events = a), l = e(t, i) || {}, De();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = ln(r);
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
	var i = y.r, a = W;
	return jt(() => {
		var o, s;
		return Nt(() => {
			o = s, s = r?.() || [], sn(() => {
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
//#region packages/codec-kit/src/deflate.ts
async function Jn(e) {
	return new Uint8Array(await new Response(e).arrayBuffer());
}
async function Yn(e) {
	if (typeof CompressionStream > "u") {
		let t = await import(
			/* @vite-ignore */
			["node", "zlib"].join(":")
);
		return new Uint8Array(t.deflateRawSync(Buffer.from(e)));
	}
	let t = new CompressionStream("deflate-raw"), n = t.writable.getWriter();
	return await n.write(e), await n.close(), Jn(t.readable);
}
async function Xn(e) {
	if (typeof DecompressionStream > "u") {
		let t = await import(
			/* @vite-ignore */
			["node", "zlib"].join(":")
);
		return new Uint8Array(t.inflateRawSync(Buffer.from(e)));
	}
	let t = new DecompressionStream("deflate-raw"), n = t.writable.getWriter();
	return await n.write(e), await n.close(), Jn(t.readable);
}
//#endregion
//#region packages/codec-kit/src/base64.ts
var Zn = 8192;
function Qn(e) {
	let t = "";
	for (let n = 0; n < e.length; n += Zn) t += String.fromCharCode(...e.subarray(n, n + Zn));
	return t;
}
function $n(e) {
	let t = new Uint8Array(e.length);
	for (let n = 0; n < e.length; n += 1) t[n] = e.charCodeAt(n);
	return t;
}
function er(e) {
	return btoa(Qn(e));
}
function tr(e) {
	return $n(atob(e));
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
function nr(e) {
	let t = e.filter((e) => e < 1 || e > 32);
	if (t.length > 0) throw RangeError(`week out of range: ${t.join(", ")}`);
}
function rr(e) {
	nr(e);
	let t = 0;
	for (let n of e) t |= 1 << n - 1;
	return t >>> 0;
}
function ir(e) {
	let t = [];
	for (let n = 1; n <= 32; n += 1) e & 1 << n - 1 && t.push(n);
	return t;
}
//#endregion
//#region packages/codec-kit/src/interner.ts
var ar = class {
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
}, or = /* @__PURE__ */ new Uint8Array(512), sr = /* @__PURE__ */ new Uint8Array(256);
(() => {
	let e = 1;
	for (let t = 0; t < 255; t++) or[t] = e, or[t + 255] = e, sr[e] = t, e <<= 1, e & 256 && (e ^= 285);
})();
function cr(e, t) {
	return e === 0 || t === 0 ? 0 : or[sr[e] + sr[t]];
}
function lr(e) {
	let t = new Uint8Array([1]);
	for (let n = 0; n < e; n++) {
		let e = new Uint8Array(t.length + 1);
		for (let r = 0; r < t.length; r++) e[r] ^= cr(t[r], or[n]), e[r + 1] ^= t[r];
		t = e;
	}
	return t;
}
function ur(e, t) {
	let n = lr(t), r = new Uint8Array(t);
	for (let i = 0; i < e.length; i++) {
		let a = e[i] ^ r[0];
		for (let e = 0; e < t - 1; e++) r[e] = r[e + 1] ^ cr(n[e + 1], a);
		r[t - 1] = cr(n[t], a);
	}
	return r;
}
var dr = [
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
], fr = [
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
], pr = [
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
], mr = 9174;
function hr(e) {
	let t = dr[e - 1];
	if (!t) throw Error(`Unsupported QR version: ${e}`);
	return t;
}
function gr(e) {
	for (let t = 1; t <= 40; t++) {
		let n = hr(t).blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0);
		if (e + (t <= 9 ? 2 : 3) <= n) return t;
	}
	throw Error(`Data payload too large for QR Code (length: ${e}, max capacity: 2953 bytes)`);
}
function _r(e, t) {
	let n = new TextEncoder().encode(e), r = hr(t), i = r.blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0), a = [];
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
		d.push(t), f.push(ur(t, r.eccPerBlock)), p += e.dataCodewords;
	}
	let m = [], h = Math.max(...d.map((e) => e.length));
	for (let e = 0; e < h; e++) for (let t of d) e < t.length && m.push(t[e]);
	for (let e = 0; e < r.eccPerBlock; e++) for (let t of f) m.push(t[e]);
	return Uint8Array.from(m);
}
function vr(e) {
	let t = gr(new TextEncoder().encode(e).length), n = t * 4 + 17, r = Array.from({ length: n }, () => Array(n).fill(null)), i = Array.from({ length: n }, () => Array(n).fill(!1));
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
	let s = fr[t - 1] ?? [];
	for (let e of s) for (let t of s) if (!i[e][t]) for (let n = -2; n <= 2; n++) for (let r = -2; r <= 2; r++) {
		let i = Math.max(Math.abs(n), Math.abs(r)) !== 1;
		a(e + n, t + r, i);
	}
	a(n - 8, 8, !0);
	for (let e = 0; e < 9; e++) r[8][e] === null && a(8, e, !1, !0), r[e][8] === null && a(e, 8, !1, !0);
	for (let e = 0; e < 8; e++) r[8][n - 1 - e] === null && a(8, n - 1 - e, !1, !0), r[n - 1 - e][8] === null && a(n - 1 - e, 8, !1, !0);
	if (t >= 7) {
		let e = pr[t - 7];
		for (let t = 0; t < 18; t++) {
			let r = (e >> t & 1) == 1, i = Math.floor(t / 3), o = t % 3 + n - 11;
			a(i, o, r), a(o, i, r);
		}
	}
	let c = _r(e, t), l = 0, u = n - 1, d = -1;
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
	let f = mr;
	for (let e = 0; e < 15; e++) {
		let t = (f >> e & 1) == 1;
		e < 6 ? r[8][e] = t : e < 8 ? r[8][e + 1] = t : r[8][n - 15 + e] = t, e < 8 ? r[n - 1 - e][8] = t : r[14 - e][8] = t;
	}
	return {
		size: n,
		modules: r.map((e) => e.map((e) => !!e))
	};
}
function yr(e, t = {}) {
	let { margin: n = 2, color: r = "#000000", background: i = "#ffffff", size: a = 512 } = t, o = vr(e), s = o.size + n * 2, c = [];
	for (let e = 0; e < o.size; e++) for (let t = 0; t < o.size; t++) o.modules[e][t] && c.push(`M${t + n},${e + n}h1v1h-1z`);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${a}" height="${a}" shape-rendering="crispEdges" data-chronos-qr="${e}"><metadata>${e}</metadata><rect width="${s}" height="${s}" fill="${i}"/><path d="${c.join("")}" fill="${r}"/></svg>`;
}
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-decode.ts
async function br(e) {
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
var xr = /* @__PURE__ */ Cn("<div class=\"rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs\"><div class=\"flex flex-col gap-4\"><div><h2 class=\"m3-title-medium text-on-surface\">从二维码导入</h2> <p class=\"m3-body-small mt-0.5 text-on-surface-variant\">选择或拖入他人分享的课表二维码图片</p></div> <input type=\"file\" accept=\"image/*,.svg\" class=\"hidden\"/> <div role=\"region\" aria-label=\"二维码图片上传区域\"><svg class=\"size-10 text-on-surface-variant/80\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><path d=\"M14 14h3v3h-3z\"></path><path d=\"M20 14v3h-3\"></path><path d=\"M14 20h7\"></path></svg> <div class=\"flex flex-col gap-1\"><span class=\"m3-body-medium font-medium text-on-surface\">点击选择二维码图片</span> <span class=\"m3-body-small text-on-surface-variant\">支持 PNG、JPEG、WebP 或 SVG 格式</span></div> <button type=\"button\" class=\"m3-label-large mt-1 rounded-full bg-primary px-6 py-2.5 font-medium text-on-primary disabled:opacity-50\"> </button></div></div></div>");
function Sr(e, t) {
	Ee(t, !0);
	let n = /* @__PURE__ */ P(!1), r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P(!1);
	function a() {
		let { errorMessage: e } = t.transfer.state;
		e && alert(e);
	}
	async function o(e) {
		F(n, !0);
		try {
			let n = await br(e);
			await t.transfer.previewWithSlot("qrcode", { content: n }) ? t.onContinue() : a();
		} catch (e) {
			let t = e instanceof Error ? e.message : "二维码识别失败";
			alert(t);
		} finally {
			F(n, !1);
		}
	}
	async function s(e) {
		let t = e.target, n = t.files?.[0];
		n && (await o(n), t.value = "");
	}
	async function c(e) {
		e.preventDefault(), F(i, !1);
		let t = e.dataTransfer?.files?.[0];
		t && await o(t);
	}
	var l = xr(), u = wt(Ct(Ct(l)), 2);
	Fn(u, (e) => F(r, e), () => $(r));
	var d = wt(u, 2), f = wt(Ct(d), 4), p = Ct(f, !0);
	Pt(() => {
		Nn(d, 1, `flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${$(i) ? "border-primary bg-primary/5" : "border-outline/40 bg-surface-variant/20"}`), f.disabled = $(n), Tn(p, $(n) ? "识别中…" : "选择图片");
	}), hn("change", u, s), mn("dragover", d, (e) => {
		e.preventDefault(), F(i, !0);
	}), mn("dragleave", d, () => F(i, !1)), mn("drop", d, c), hn("click", f, () => $(r)?.click()), wn(e, l), De();
}
gn(["change", "click"]);
//#endregion
//#region packages/plugins/codec-qrcode/src/index.ts
async function Cr(e) {
	let t = new ar(), n = e.courses.map((e) => {
		let n = t.intern(e.name), r = t.intern(e.teacher), i = t.intern(e.location), a = t.intern(e.remark), o = t.intern(e.color), s = rr(e.weeks), c = [
			n,
			r,
			i,
			e.dayOfWeek,
			e.startPeriod,
			e.endPeriod,
			s
		];
		return (a >= 0 || o >= 0) && c.push(a >= 0 ? a : -1), o >= 0 && c.push(o), c;
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
	return `chronos-qr:v2:${er(await Yn(new TextEncoder().encode(i)))}`;
}
async function wr(e) {
	let t = e.trim();
	if (t.startsWith("chronos-qr:v2:")) {
		let e = await Xn(tr(t.slice(14))), n = new TextDecoder().decode(e), r = JSON.parse(n), i = r.s ?? [], a = (r.c ?? []).map((e, t) => {
			let n = (e[0] >= 0 ? i[e[0]] : null) ?? "未命名课程", r = (e[1] >= 0 ? i[e[1]] : null) ?? "", a = (e[2] >= 0 ? i[e[2]] : null) ?? "", o = e[3] ?? 1, s = e[4] ?? 1, c = e[5] ?? 1, l = ir(e[6] ?? 1), u = l.length > 0 ? l : [1], d = e[7] !== void 0 && e[7] >= 0 ? i[e[7]] : void 0, f = e[8] !== void 0 && e[8] >= 0 ? i[e[8]] : void 0;
			return Hn({
				id: `c-qr-${t + 1}-${Date.now().toString(36)}`,
				name: n,
				teacher: r,
				location: a,
				dayOfWeek: o,
				startPeriod: s,
				endPeriod: c,
				weeks: u,
				remark: d,
				color: f
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
		let e = tr(t.slice(14));
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
var Tr = qn({ content: {
	type: "string",
	title: () => "二维码内容",
	placeholder: () => "二维码识别出的数据内容",
	required: !0
} });
function Er(e = {}) {
	let { importComponent: t = Sr } = e;
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
				inputSchema: Tr,
				async executeImport(e) {
					let t = e.content ?? e.fileContent;
					if (!t?.trim()) throw Error("未识别到有效的二维码内容");
					return wr(t);
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
					let r = yr(await Cr(n), { margin: 2 });
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
Er();
//#endregion
//#region packages/plugins/codec-qrcode/bundle/entry.ts
var Dr = Er({ importComponent: {
	[Symbol.for("chronos.mountable")]: !0,
	mount(e, t) {
		let n = En(Sr, {
			target: e,
			props: t
		});
		return { unmount() {
			An(n);
		} };
	}
} });
//#endregion
export { Dr as default };
