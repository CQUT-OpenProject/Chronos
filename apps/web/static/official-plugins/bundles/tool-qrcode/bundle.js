//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/constants.js
var e = Symbol("uninitialized"), t = Array.isArray, n = Array.prototype.indexOf, r = Array.prototype.includes, i = Array.from, a = Object.defineProperty, o = Object.getOwnPropertyDescriptor, s = Object.prototype, c = Array.prototype, l = Object.getPrototypeOf, u = Object.isExtensible, d = () => {};
function f(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function p() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, ee = 1 << 25, b = 65536, x = 1 << 19, S = 1 << 20, C = 65536, te = 1 << 21, ne = 1 << 22, re = 1 << 23, ie = Symbol("$state"), ae = Symbol("attributes"), oe = Symbol("class"), se = Symbol("style"), ce = Symbol("text"), le = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function ue() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function de() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fe() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function pe() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function me() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function he() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function ge() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function _e() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
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
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var w = null;
function xe(e) {
	w = e;
}
function Se(e, t = !1, n) {
	w = {
		p: w,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: M,
		l: null
	};
}
function Ce(e) {
	var t = w, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) zt(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, w = t.p, e ?? {};
}
function we() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var Te = [];
function Ee() {
	var e = Te;
	Te = [], f(e);
}
function De(e) {
	if (Te.length === 0 && !nt) {
		var t = Te;
		queueMicrotask(() => {
			t === Te && Ee();
		});
	}
	Te.push(e);
}
function Oe(e) {
	var t = M;
	if (t === null) return k.f |= re, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	ke(e, t);
}
function ke(e, t) {
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
var Ae = ~(h | g | m);
function T(e, t) {
	e.f = e.f & Ae | t;
}
function je(e) {
	e.f & 512 || e.deps === null ? T(e, m) : T(e, g);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Me(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= C, Me(t.deps));
}
function Ne(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Me(e.deps), T(e, m);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Pe(e) {
	var t = k, n = M;
	j(null), sn(null);
	try {
		return e();
	} finally {
		j(t), sn(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function Fe(e) {
	let t = 0, n = vt(0), r;
	return () => {
		Lt() && (I(n), Ut(() => (t === 0 && (r = wn(() => e(() => xt(n)))), t += 1, () => {
			De(() => {
				--t, t === 0 && (r?.(), r = void 0, xt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var Ie = b | x;
function Le(e, t, n, r) {
	new Re(e, t, n, r);
}
var Re = class {
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
	#m = Fe(() => (this.#p = vt(this.#c), () => {
		this.#p = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#t = t, this.#n = (e) => {
			var t = M;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = M.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#r = Gt(() => {
			this.#g();
		}, Ie);
	}
	#h(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				_e();
				return;
			}
			t = !0, n && he(), this.#o !== null && $t(this.#o, () => {
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
					ke(e, this.#r && this.#r.parent);
				}
			}
		};
	}
	#g() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#l = 0, this.#c = 0, this.#i = Kt(() => {
				this.#n(this.#e);
			}), this.#l > 0) {
				var e = this.#s = document.createDocumentFragment();
				tn(this.#i, e);
				let t = this.#t.pending;
				this.#a = Kt(() => t(this.#e));
			} else this.#_(E);
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
		var t = M, n = k, r = w;
		sn(this.#r), j(this.#r), xe(this.#r.ctx);
		try {
			return ct.ensure(), e();
		} catch (e) {
			return Oe(e), null;
		} finally {
			sn(t), j(n), xe(r);
		}
	}
	#y(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#y(e, t);
			return;
		}
		this.#l += e, this.#l === 0 && (this.#_(t), this.#a && $t(this.#a, () => {
			this.#a = null;
		}), this.#s &&= (this.#e.before(this.#s), null));
	}
	update_pending_count(e, t) {
		this.#y(e, t), this.#c += e, !(!this.#p || this.#u) && (this.#u = !0, De(() => {
			this.#u = !1, this.#p && yt(this.#p, this.#c);
		}));
	}
	get_effect_pending() {
		return this.#m(), I(this.#p);
	}
	error(e) {
		if (!this.#t.onerror && !this.#t.failed) throw e;
		E?.is_fork ? (this.#i && E.skip_effect(this.#i), this.#a && E.skip_effect(this.#a), this.#o && E.skip_effect(this.#o), E.oncommit(() => {
			this.#b(e);
		})) : this.#b(e);
	}
	#b(e) {
		this.#i &&= (Xt(this.#i), null), this.#a &&= (Xt(this.#a), null), this.#o &&= (Xt(this.#o), null);
		let t = this.#t.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#h(e);
			r(), t && (this.#o = this.#v(() => {
				try {
					return Kt(() => {
						var r = M;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return ke(e, this.#r.parent), null;
				}
			}));
		};
		De(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				ke(e, this.#r && this.#r.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => ke(e, this.#r && this.#r.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function ze(e, t, n, r) {
	let i = we() ? Ue : Ke;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = M, c = Be(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				ke(e, s);
			}
			Ve();
		}
	}
	var d = He();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ Ge(e))).then(u).catch((e) => ke(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), Ve();
	}) : f();
}
function Be() {
	var e = M, t = k, n = w, r = E;
	return function(i = !0) {
		sn(e), j(t), xe(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Ve(e = !0) {
	sn(null), j(null), xe(null), e && E?.deactivate();
}
function He() {
	var e = M, t = e.b, n = E, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ue(t) {
	var n = 2 | h;
	return M !== null && (M.f |= x), {
		ctx: w,
		deps: null,
		effects: null,
		equals: ve,
		f: n,
		fn: t,
		reactions: null,
		rv: 0,
		v: e,
		wv: 0,
		parent: M,
		ac: null
	};
}
var We = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Ge(t, n, r) {
	let i = M;
	i === null && ue();
	var a = void 0, o = vt(e), s = !k, c = /* @__PURE__ */ new Set();
	return Ht(() => {
		var e = M, n = p();
		a = n.promise;
		try {
			Promise.resolve(t()).then(n.resolve, (e) => {
				e !== le && n.reject(e);
			}).finally(Ve);
		} catch (e) {
			n.reject(e), Ve();
		}
		var r = E;
		if (s) {
			if (e.f & 32768) var l = He();
			if (i.b?.is_rendered()) r.async_deriveds.get(e)?.reject(We);
			else for (let e of c.values()) e.reject(We);
			c.add(n), r.async_deriveds.set(e, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== We && (r.activate(), t ? (o.f |= re, yt(o, t)) : (o.f & 8388608 && (o.f ^= re), yt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Rt(() => {
		for (let e of c) e.reject(We);
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
function Ke(e) {
	let t = /* @__PURE__ */ Ue(e);
	return t.equals = be, t;
}
function qe(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Xt(t[n]);
	}
}
function Je(t) {
	var n, r = M, i = t.parent;
	if (!an && i !== null && t.v !== e && i.f & 24576) return ge(), t.v;
	sn(i);
	try {
		t.f &= ~C, qe(t), n = vn(t);
	} finally {
		sn(r);
	}
	return n;
}
function Ye(e) {
	var t = Je(e);
	if (!e.equals(t) && (e.wv = hn(), (!E?.is_fork || e.deps === null) && (E === null ? e.v = t : (E.capture(e, t, !0), $e?.capture(e, t, !0)), e.deps === null))) {
		T(e, m);
		return;
	}
	an || (et === null ? je(e) : (Lt() || E?.is_fork) && et.set(e, t));
}
function Xe(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Pe(() => {
		t.ac.abort(le), t.ac = null;
	}), t.fn !== null && (t.teardown = d), bn(t, 0), Jt(t));
}
function Ze(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && xn(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var Qe = null, E = null, $e = null, et = null, tt = null, nt = !1, rt = !1, it = null, at = null, ot = 0, st = 1, ct = class t {
	id = st++;
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
		Qe === null ? Qe = this : (Qe.#n = this, this.#t = Qe), Qe = this;
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
			for (var r of n.d) T(r, h), t(r);
			for (r of n.m) T(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, ot++ > 1e3 && (this.#x(), lt());
		for (let e of this.#u) this.#d.delete(e), T(e, h), this.schedule(e);
		for (let e of this.#d) T(e, g), this.schedule(e);
		let e = this.#c;
		this.#c = [], this.apply();
		var n = it = [], r = [], i = at = [];
		for (let t of e) try {
			this.#_(t, n, r);
		} catch (e) {
			throw mt(t), this.#h() || this.discard(), e;
		}
		if (E = null, i.length > 0) {
			var a = t.ensure();
			for (let e of i) a.schedule(e);
		}
		if (it = null, at = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) pt(e, t);
			i.length > 0 && E.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), $e = this, dt(r), dt(n), $e = null, this.#s?.resolve();
		var s = E;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= m;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= m : i & 4 ? t.push(r) : gn(r) && (i & 16 && this.#d.add(r), xn(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), T(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), E = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Ne(e[t], this.#u, this.#d);
	}
	capture(t, n, r = !1) {
		t.v !== e && !this.previous.has(t) && this.previous.set(t, t.v), t.f & 8388608 || (this.current.set(t, [n, r]), et?.set(t, n)), this.is_fork || (t.v = n);
	}
	activate() {
		E = this;
	}
	deactivate() {
		E = null, et = null;
	}
	flush() {
		try {
			rt = !0, E = this, this.#g();
		} finally {
			ot = 0, tt = null, it = null, at = null, rt = !1, E = null, et = null, gt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(We);
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
		this.#m || (this.#m = !0, De(() => {
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
		return (this.#s ??= p()).promise;
	}
	static ensure() {
		if (E === null) {
			let e = E = new t();
			!rt && De(() => {
				e.#e || e.flush();
			});
		}
		return E;
	}
	apply() {
		et = null;
	}
	schedule(e) {
		if (tt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (it !== null && t === M && (k === null || !(k.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= m;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? Qe = e : t.#t = e, this.linked = !1;
		}
	}
};
function lt() {
	try {
		de();
	} catch (e) {
		ke(e, tt);
	}
}
var ut = null;
function dt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && gn(r) && (ut = /* @__PURE__ */ new Set(), xn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Qt(r), ut?.size > 0)) {
				gt.clear();
				for (let e of ut) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) ut.has(n) && (ut.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || xn(n);
					}
				}
				ut.clear();
			}
		}
		ut = null;
	}
}
function ft(e) {
	E.schedule(e);
}
function pt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), T(e, m);
		for (var n = e.first; n !== null;) pt(n, t), n = n.next;
	}
}
function mt(e) {
	T(e, m);
	for (var t = e.first; t !== null;) mt(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var ht = /* @__PURE__ */ new Set(), gt = /* @__PURE__ */ new Map(), _t = !1;
function vt(e, t) {
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
function D(e, t) {
	let n = vt(e, t);
	return ln(n), n;
}
function O(e, t, n = !1) {
	return k !== null && (!A || k.f & 131072) && we() && k.f & 4325394 && (cn === null || !cn.has(e)) && me(), yt(e, n ? Ct(t) : t, at);
}
function yt(e, t, n = null) {
	if (!e.equals(t)) {
		gt.set(e, an ? t : e.v);
		var r = ct.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Je(t), et === null && je(t);
		}
		e.wv = hn(), St(e, h, n), we() && M !== null && M.f & 1024 && !(M.f & 96) && (F === null ? un([e]) : F.push(e)), !r.is_fork && ht.size > 0 && !_t && bt();
	}
	return t;
}
function bt() {
	_t = !1;
	for (let e of ht) {
		e.f & 1024 && T(e, g);
		let t;
		try {
			t = gn(e);
		} catch {
			t = !0;
		}
		t && xn(e);
	}
	ht.clear();
}
function xt(e) {
	O(e, e.v + 1);
}
function St(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = we(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === M)) {
			var l = (c & h) === 0;
			if (l && T(s, t), c & 131072) ht.add(s);
			else if (c & 2) {
				var u = s;
				et?.delete(u), c & 65536 || (c & 512 && (M === null || !(M.f & 2097152)) && (s.f |= C), St(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && ut !== null && ut.add(d), n === null ? ft(d) : n.push(d);
			}
		}
	}
}
function Ct(n) {
	if (typeof n != "object" || !n || ie in n) return n;
	let r = l(n);
	if (r !== s && r !== c) return n;
	var i = /* @__PURE__ */ new Map(), a = t(n), u = /* @__PURE__ */ D(0), d = null, f = pn, p = (e) => {
		if (pn === f) return e();
		var t = k, n = pn;
		j(null), mn(f);
		var r = e();
		return j(t), mn(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ D(n.length, d)), new Proxy(n, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && fe();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ D(n.value, d);
				return i.set(t, e), e;
			}) : O(r, n.value, !0), !0;
		},
		deleteProperty(t, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in t) {
					let t = p(() => /* @__PURE__ */ D(e, d));
					i.set(n, t), xt(u);
				}
			} else O(r, e), xt(u);
			return !0;
		},
		get(t, r, a) {
			if (r === ie) return n;
			var s = i.get(r), c = r in t;
			if (s === void 0 && (!c || o(t, r)?.writable) && (s = p(() => /* @__PURE__ */ D(Ct(c ? t[r] : e), d)), i.set(r, s)), s !== void 0) {
				var l = I(s);
				return l === e ? void 0 : l;
			}
			return Reflect.get(t, r, a);
		},
		getOwnPropertyDescriptor(t, n) {
			var r = Reflect.getOwnPropertyDescriptor(t, n);
			if (r && "value" in r) {
				var a = i.get(n);
				a && (r.value = I(a));
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
			if (n === ie) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== e || Reflect.has(t, n);
			return (r !== void 0 || M !== null && (!a || o(t, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ D(a ? Ct(t[n]) : e, d)), i.set(n, r)), I(r) === e) ? !1 : a;
		},
		set(t, n, r, s) {
			var c = i.get(n), l = n in t;
			if (a && n === "length") for (var f = r; f < c.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in t && (m = p(() => /* @__PURE__ */ D(e, d)), i.set(f + "", m)) : O(m, e);
			}
			if (c === void 0) (!l || o(t, n)?.writable) && (c = p(() => /* @__PURE__ */ D(void 0, d)), O(c, Ct(r)), i.set(n, c));
			else {
				l = c.v !== e;
				var h = p(() => Ct(r));
				O(c, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(t, n);
			if (g?.set && g.set.call(s, r), !l) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && O(_, v + 1);
				}
				xt(u);
			}
			return !0;
		},
		ownKeys(t) {
			I(u);
			var n = Reflect.ownKeys(t).filter((t) => {
				var n = i.get(t);
				return n === void 0 || n.v !== e;
			});
			for (var [r, a] of i) a.v !== e && !(r in t) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			pe();
		}
	});
}
var wt, Tt, Et, Dt;
function Ot() {
	if (wt === void 0) {
		wt = window, Tt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Et = o(t, "firstChild").get, Dt = o(t, "nextSibling").get, u(e) && (e[oe] = void 0, e[ae] = null, e[se] = void 0, e.__e = void 0), u(n) && (n[ce] = void 0);
	}
}
function kt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function At(e) {
	return Et.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function jt(e) {
	return Dt.call(e);
}
function Mt(e, t) {
	return /* @__PURE__ */ At(e);
}
function Nt(e, t = 1, n = !1) {
	let r = e;
	for (; t--;) r = /* @__PURE__ */ jt(r);
	return r;
}
function Pt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function Ft(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function It(e, t) {
	var n = M;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: w,
		deps: null,
		nodes: null,
		f: e | h | 512,
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
	E?.register_created_effect(r);
	var i = r;
	if (e & 4) it === null ? ct.ensure().schedule(r) : it.push(r);
	else if (t !== null) {
		try {
			xn(r);
		} catch (e) {
			throw Xt(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= b));
	}
	if (i !== null && (i.parent = n, n !== null && Ft(i, n), k !== null && k.f & 2 && !(e & 64))) {
		var a = k;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Lt() {
	return k !== null && !A;
}
function Rt(e) {
	let t = It(8, null);
	return T(t, m), t.teardown = e, t;
}
function zt(e) {
	return It(4 | S, e);
}
function Bt(e) {
	ct.ensure();
	let t = It(64 | x, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? $t(t, () => {
			Xt(t), n(void 0);
		}) : (Xt(t), n(void 0));
	});
}
function Vt(e) {
	return It(4, e);
}
function Ht(e) {
	return It(ne | x, e);
}
function Ut(e, t = 0) {
	return It(8 | t, e);
}
function Wt(e, t = [], n = [], r = []) {
	ze(r, t, n, (t) => {
		It(8, () => {
			e(...t.map(I));
		});
	});
}
function Gt(e, t = 0) {
	return It(16 | t, e);
}
function Kt(e) {
	return It(32 | x, e);
}
function qt(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = an, n = k;
		on(!0), j(null);
		try {
			t.call(null);
		} finally {
			on(e), j(n);
		}
	}
}
function Jt(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Pe(() => {
			e.abort(le);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Xt(n, t), n = r;
	}
}
function Yt(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Xt(t), t = n;
	}
}
function Xt(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Zt(e.nodes.start, e.nodes.end), n = !0), e.f |= ee, Jt(e, t && !n), bn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	qt(e), e.f ^= ee, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Qt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Zt(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ jt(e);
		e.remove(), e = n;
	}
}
function Qt(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function $t(e, t, n = !0) {
	var r = [];
	en(e, r, !0);
	var i = () => {
		n && Xt(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function en(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				en(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function tn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ jt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var nn = null, rn = !1, an = !1;
function on(e) {
	an = e;
}
var k = null, A = !1;
function j(e) {
	k = e;
}
var M = null;
function sn(e) {
	M = e;
}
var cn = null;
function ln(e) {
	k !== null && (cn ??= /* @__PURE__ */ new Set()).add(e);
}
var N = null, P = 0, F = null;
function un(e) {
	F = e;
}
var dn = 1, fn = 0, pn = fn;
function mn(e) {
	pn = e;
}
function hn() {
	return ++dn;
}
function gn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~C), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (gn(a) && Ye(a), a.wv > e.wv) return !0;
		}
		t & 512 && et === null && T(e, m);
	}
	return !1;
}
function _n(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(cn !== null && cn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? _n(a, t, !1) : t === a && (n ? T(a, h) : a.f & 1024 && T(a, g), ft(a));
	}
}
function vn(e) {
	var t = N, n = P, r = F, i = k, a = cn, o = w, s = A, c = pn, l = e.f;
	N = null, P = 0, F = null, k = l & 96 ? null : e, cn = null, xe(e.ctx), A = !1, pn = ++fn, e.ac !== null && (Pe(() => {
		e.ac.abort(le);
	}), e.ac = null);
	try {
		e.f |= te;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = E?.is_fork;
		if (N !== null) {
			var m;
			if (p || bn(e, P), f !== null && P > 0) for (f.length = P + N.length, m = 0; m < N.length; m++) f[P + m] = N[m];
			else e.deps = f = N;
			if (Lt() && e.f & 512) for (m = P; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && P < f.length && (bn(e, P), f.length = P);
		if (we() && F !== null && !A && f !== null && !(e.f & 6146)) for (m = 0; m < F.length; m++) _n(F[m], e);
		if (i !== null && i !== e) {
			if (fn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = fn;
			if (t !== null) for (let e of t) e.rv = fn;
			F !== null && (r === null ? r = F : r.push(...F));
		}
		return e.f & 8388608 && (e.f ^= re), d;
	} catch (e) {
		return Oe(e);
	} finally {
		e.f ^= te, N = t, P = n, F = r, k = i, cn = a, xe(o), A = s, pn = c;
	}
}
function yn(t, i) {
	let a = i.reactions;
	if (a !== null) {
		var o = n.call(a, t);
		if (o !== -1) {
			var s = a.length - 1;
			s === 0 ? a = i.reactions = null : (a[o] = a[s], a.pop());
		}
	}
	if (a === null && i.f & 2 && (N === null || !r.call(N, i))) {
		var c = i;
		c.f & 512 && (c.f ^= 512, c.f &= ~C), c.v !== e && je(c), c.ac !== null && Pe(() => {
			c.ac.abort(le), c.ac = null, T(c, h);
		}), Xe(c), bn(c, 0);
	}
}
function bn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) yn(e, n[r]);
}
function xn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		T(e, m);
		var n = M, r = rn;
		M = e, rn = !(t & 96);
		try {
			t & 16777232 ? Yt(e) : Jt(e), qt(e);
			var i = vn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = dn;
		} finally {
			rn = r, M = n;
		}
	}
}
function I(e) {
	var t = !!(e.f & 2);
	if (nn?.add(e), k !== null && !A && !(M !== null && M.f & 16384) && (cn === null || !cn.has(e))) {
		var n = k.deps;
		if (k.f & 2097152) e.rv < fn && (e.rv = fn, N === null && n !== null && n[P] === e ? P++ : N === null ? N = [e] : N.push(e));
		else {
			k.deps ??= [], r.call(k.deps, e) || k.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [k] : r.call(i, k) || i.push(k);
		}
	}
	if (an && gt.has(e)) return gt.get(e);
	if (t) {
		var a = e;
		if (an) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Cn(a)) && (o = Je(a)), gt.set(a, o), o;
		}
		var s = !(a.f & 512) && !A && k !== null && (rn || !!(k.f & 512)), c = (a.f & y) === 0;
		gn(a) && (s && (a.f |= 512), Ye(a)), s && !c && (Ze(a), Sn(a));
	}
	if (et?.has(e)) return et.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Sn(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Ze(t), Sn(t));
}
function Cn(t) {
	if (t.v === e) return !0;
	if (t.deps === null) return !1;
	for (let e of t.deps) if (gt.has(e) || e.f & 2 && Cn(e)) return !0;
	return !1;
}
function wn(e) {
	var t = A;
	try {
		return A = !0, e();
	} finally {
		A = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var Tn = Symbol("events"), En = /* @__PURE__ */ new Set(), Dn = /* @__PURE__ */ new Set();
function On(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Nn.call(t, e), !e.cancelBubble) return Pe(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? De(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function kn(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = On(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && Rt(() => {
		t.removeEventListener(e, o, a);
	});
}
function An(e, t, n) {
	(t[Tn] ??= {})[e] = n;
}
function jn(e) {
	for (var t = 0; t < e.length; t++) En.add(e[t]);
	for (var n of Dn) n(e);
}
var Mn = null;
function Nn(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], o = i[0] || e.target;
	Mn = e;
	var s = 0, c = Mn === e && e[Tn];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Tn] = t;
			return;
		}
		var u = i.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (o = i[s] || e.target, o !== t) {
		a(e, "currentTarget", {
			configurable: !0,
			get() {
				return o || n;
			}
		});
		var d = k, f = M;
		j(null), sn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[Tn]?.[r];
					h != null && (!o.disabled || e.target === o) && h.call(o, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, o = s < i.length ? i[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[Tn] = t, delete e.currentTarget, j(d), sn(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var Pn = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Fn(e) {
	return Pn?.createHTML(e) ?? e;
}
function In(e) {
	var t = Pt("template");
	return t.innerHTML = Fn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function Ln(e, t) {
	var n = M;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Rn(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		i === void 0 && (i = In(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ At(i)));
		var t = r || Tt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ At(t), s = t.lastChild;
			Ln(o, s);
		} else Ln(t, t);
		return t;
	};
}
function zn(e, t) {
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Bn = ["touchstart", "touchmove"];
function Vn(e) {
	return Bn.includes(e);
}
function Hn(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function Un(e, t) {
	return Gn(e, t);
}
var Wn = /* @__PURE__ */ new Map();
function Gn(e, { target: t, anchor: n, props: r = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	Ot();
	var l = void 0, u = Bt(() => {
		var s = n ?? t.appendChild(kt());
		Le(s, { pending: () => {} }, (t) => {
			Se({});
			var n = w;
			o && (n.c = o), a && (r.$$events = a), l = e(t, r) || {}, Ce();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = Vn(r);
					for (let e of [t, document]) {
						var a = Wn.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Wn.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Nn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(i(En)), Dn.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Wn.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Nn), r.delete(e), r.size === 0 && Wn.delete(n)) : r.set(e, i);
			}
			Dn.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Kn.set(l, u), l;
}
var Kn = /* @__PURE__ */ new WeakMap();
function qn(e, t) {
	let n = Kn.get(e);
	return n ? (Kn.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var Jn = [..." 	\n\r\f\xA0\v﻿"];
function Yn(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Jn.includes(r[o - 1])) && (s === r.length || Jn.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function Xn(e, t, n, r, i, a) {
	var o = e[oe];
	if (o !== n || o === void 0) {
		var s = Yn(n, r, a);
		s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s), e[oe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Zn(e, t) {
	return e === t || e?.[ie] === t;
}
function Qn(e = {}, t, n, r) {
	var i = w.r, a = M;
	return Vt(() => {
		var o, s;
		return Ut(() => {
			o = s, s = r?.() || [], wn(() => {
				Zn(n(...s), e) || (t(e, ...s), o && Zn(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Zn(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
var $n = [
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
], er = $n.map(([e, t]) => ({
	background: e,
	foreground: t
})), tr = /\s+/g;
function nr(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = t * 31 + e.charCodeAt(n) | 0;
	return t;
}
function rr(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(tr, " ");
}
function ir(e) {
	return $n[Math.abs(nr(e) % $n.length)] ?? $n[0];
}
new Map(er.map((e, t) => [e.background.toLowerCase(), t]));
//#endregion
//#region packages/core/src/domain/course.ts
function ar(e) {
	let t = e.name ? rr(e.name) : "", [n, r] = t ? ir(t) : ["#EADDFF", "#21005D"];
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
var or = "未命名课表";
function sr(e) {
	let t = e.trim();
	return t.length > 0 ? t : or;
}
function cr(e) {
	if (!e) return;
	let t = e.source.trim() || "UNKNOWN", n = e.campusId?.trim();
	return n ? {
		source: t,
		campusId: n
	} : { source: t };
}
function lr(e) {
	let t = Date.now(), n = cr(e.importMetadata), r = e.courses ?? [];
	return {
		schemaVersion: e.schemaVersion ?? 1,
		id: e.id,
		name: sr(e.name),
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
function ur(e) {
	return e;
}
//#endregion
//#region packages/core/src/types/mountable.ts
var dr = Symbol.for("chronos.mountable");
new Set(/* @__PURE__ */ "color.surface,color.onSurface,color.primary,color.onPrimary,color.surfaceVariant,color.outline,color.secondary,color.onSecondary,color.primaryContainer,color.onPrimaryContainer,color.secondaryContainer,color.onSecondaryContainer,color.primary-dim,color.primary-container,color.on-primary-container,color.inverse-primary,color.secondary-dim,color.on-secondary,color.secondary-container,color.on-secondary-container,color.primary-container-subtle,color.on-primary-container-subtle,color.secondary-container-subtle,color.on-secondary-container-subtle,shell.bottomTab.activeBackground,shell.bottomTab.activeForeground,shell.bottomBar.background,shell.topBar.background,leadingIcon.background,leadingIcon.color,leadingIcon.backgroundPrimary,leadingIcon.colorPrimary,leadingIcon.backgroundSecondary,leadingIcon.colorSecondary,leadingIcon.backgroundTertiary,leadingIcon.colorTertiary,leadingIcon.backgroundNeutral,leadingIcon.colorNeutral,timetable.period.activeBackground,timetable.period.activeBackgroundImage".split(","));
function fr(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) typeof r == "string" && r.length > 0 && (t[`color.${n}`] = r);
	return t;
}
function pr(e, t) {
	return {
		light: fr(e),
		dark: fr(t)
	};
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/math_utils.js
function L(e) {
	return e < 0 ? -1 : e === 0 ? 0 : 1;
}
function mr(e, t, n) {
	return (1 - n) * e + n * t;
}
function hr(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function R(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function gr(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function z(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function _r(e, t) {
	return [
		e[0] * t[0][0] + e[1] * t[0][1] + e[2] * t[0][2],
		e[0] * t[1][0] + e[1] * t[1][1] + e[2] * t[1][2],
		e[0] * t[2][0] + e[1] * t[2][1] + e[2] * t[2][2]
	];
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/color_utils.js
var vr = [
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
], yr = [
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
], br = [
	95.047,
	100,
	108.883
];
function xr(e, t, n) {
	return (255 << 24 | (e & 255) << 16 | (t & 255) << 8 | n & 255) >>> 0;
}
function Sr(e) {
	return xr(Pr(e[0]), Pr(e[1]), Pr(e[2]));
}
function Cr(e) {
	return e >> 16 & 255;
}
function wr(e) {
	return e >> 8 & 255;
}
function Tr(e) {
	return e & 255;
}
function Er(e, t, n) {
	let r = yr, i = r[0][0] * e + r[0][1] * t + r[0][2] * n, a = r[1][0] * e + r[1][1] * t + r[1][2] * n, o = r[2][0] * e + r[2][1] * t + r[2][2] * n;
	return xr(Pr(i), Pr(a), Pr(o));
}
function Dr(e) {
	return _r([
		Nr(Cr(e)),
		Nr(wr(e)),
		Nr(Tr(e))
	], vr);
}
function Or(e) {
	let t = Nr(Cr(e)), n = Nr(wr(e)), r = Nr(Tr(e)), i = vr, a = i[0][0] * t + i[0][1] * n + i[0][2] * r, o = i[1][0] * t + i[1][1] * n + i[1][2] * r, s = i[2][0] * t + i[2][1] * n + i[2][2] * r, c = br, l = a / c[0], u = o / c[1], d = s / c[2], f = Ir(l), p = Ir(u), m = Ir(d);
	return [
		116 * p - 16,
		500 * (f - p),
		200 * (p - m)
	];
}
function kr(e) {
	let t = Pr(jr(e));
	return xr(t, t, t);
}
function Ar(e) {
	let t = Dr(e)[1];
	return 116 * Ir(t / 100) - 16;
}
function jr(e) {
	return 100 * Lr((e + 16) / 116);
}
function Mr(e) {
	return Ir(e / 100) * 116 - 16;
}
function Nr(e) {
	let t = e / 255;
	return t <= .040449936 ? t / 12.92 * 100 : ((t + .055) / 1.055) ** 2.4 * 100;
}
function Pr(e) {
	let t = e / 100, n = 0;
	return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, hr(0, 255, Math.round(n * 255));
}
function Fr() {
	return br;
}
function Ir(e) {
	return e > .008856451679035631 ? e ** (1 / 3) : (903.2962962962963 * e + 16) / 116;
}
function Lr(e) {
	let t = e * e * e;
	return t > .008856451679035631 ? t : (116 * e - 16) / 903.2962962962963;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/viewing_conditions.js
var Rr = class e {
	static make(t = Fr(), n = 200 / Math.PI * jr(50) / 100, r = 50, i = 2, a = !1) {
		let o = t, s = o[0] * .401288 + o[1] * .650173 + o[2] * -.051461, c = o[0] * -.250268 + o[1] * 1.204414 + o[2] * .045854, l = o[0] * -.002079 + o[1] * .048952 + o[2] * .953127, u = .8 + i / 10, d = u >= .9 ? mr(.59, .69, (u - .9) * 10) : mr(.525, .59, (u - .8) * 10), f = a ? 1 : u * (1 - 1 / 3.6 * Math.exp((-n - 42) / 92));
		f = f > 1 ? 1 : f < 0 ? 0 : f;
		let p = u, m = [
			100 / s * f + 1 - f,
			100 / c * f + 1 - f,
			100 / l * f + 1 - f
		], h = 1 / (5 * n + 1), g = h * h * h * h, _ = 1 - g, v = g * n + .1 * _ * _ * Math.cbrt(5 * n), y = jr(r) / t[1], ee = 1.48 + Math.sqrt(y), b = .725 / y ** .2, x = b, S = [
			(v * m[0] * s / 100) ** .42,
			(v * m[1] * c / 100) ** .42,
			(v * m[2] * l / 100) ** .42
		], C = [
			400 * S[0] / (S[0] + 27.13),
			400 * S[1] / (S[1] + 27.13),
			400 * S[2] / (S[2] + 27.13)
		], te = (2 * C[0] + C[1] + .05 * C[2]) * b;
		return new e(y, te, b, x, d, p, m, v, v ** .25, ee);
	}
	constructor(e, t, n, r, i, a, o, s, c, l) {
		this.n = e, this.aw = t, this.nbb = n, this.ncb = r, this.c = i, this.nc = a, this.rgbD = o, this.fl = s, this.fLRoot = c, this.z = l;
	}
};
Rr.DEFAULT = Rr.make();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/cam16.js
var zr = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.hue = e, this.chroma = t, this.j = n, this.q = r, this.m = i, this.s = a, this.jstar = o, this.astar = s, this.bstar = c;
	}
	distance(e) {
		let t = this.jstar - e.jstar, n = this.astar - e.astar, r = this.bstar - e.bstar;
		return 1.41 * Math.sqrt(t * t + n * n + r * r) ** .63;
	}
	static fromInt(t) {
		return e.fromIntInViewingConditions(t, Rr.DEFAULT);
	}
	static fromIntInViewingConditions(t, n) {
		let r = (t & 16711680) >> 16, i = (t & 65280) >> 8, a = t & 255, o = Nr(r), s = Nr(i), c = Nr(a), l = .41233895 * o + .35762064 * s + .18051042 * c, u = .2126 * o + .7152 * s + .0722 * c, d = .01932141 * o + .11916382 * s + .95034478 * c, f = .401288 * l + .650173 * u - .051461 * d, p = -.250268 * l + 1.204414 * u + .045854 * d, m = -.002079 * l + .048952 * u + .953127 * d, h = n.rgbD[0] * f, g = n.rgbD[1] * p, _ = n.rgbD[2] * m, v = (n.fl * Math.abs(h) / 100) ** .42, y = (n.fl * Math.abs(g) / 100) ** .42, ee = (n.fl * Math.abs(_) / 100) ** .42, b = L(h) * 400 * v / (v + 27.13), x = L(g) * 400 * y / (y + 27.13), S = L(_) * 400 * ee / (ee + 27.13), C = (11 * b + -12 * x + S) / 11, te = (b + x - 2 * S) / 9, ne = (20 * b + 20 * x + 21 * S) / 20, re = (40 * b + 20 * x + S) / 20, ie = z(Math.atan2(te, C) * 180 / Math.PI), ae = ie * Math.PI / 180, oe = 100 * (re * n.nbb / n.aw) ** +(n.c * n.z), se = 4 / n.c * Math.sqrt(oe / 100) * (n.aw + 4) * n.fLRoot, ce = ie < 20.14 ? ie + 360 : ie, le = (5e4 / 13 * (.25 * (Math.cos(ce * Math.PI / 180 + 2) + 3.8)) * n.nc * n.ncb * Math.sqrt(C * C + te * te) / (ne + .305)) ** .9 * (1.64 - .29 ** n.n) ** .73, ue = le * Math.sqrt(oe / 100), de = ue * n.fLRoot, fe = 50 * Math.sqrt(le * n.c / (n.aw + 4)), pe = (1 + 100 * .007) * oe / (1 + .007 * oe), me = 1 / .0228 * Math.log(1 + .0228 * de), he = me * Math.cos(ae), ge = me * Math.sin(ae);
		return new e(ie, ue, oe, se, de, fe, pe, he, ge);
	}
	static fromJch(t, n, r) {
		return e.fromJchInViewingConditions(t, n, r, Rr.DEFAULT);
	}
	static fromJchInViewingConditions(t, n, r, i) {
		let a = 4 / i.c * Math.sqrt(t / 100) * (i.aw + 4) * i.fLRoot, o = n * i.fLRoot, s = n / Math.sqrt(t / 100), c = 50 * Math.sqrt(s * i.c / (i.aw + 4)), l = r * Math.PI / 180, u = (1 + 100 * .007) * t / (1 + .007 * t), d = 1 / .0228 * Math.log(1 + .0228 * o), f = d * Math.cos(l), p = d * Math.sin(l);
		return new e(r, n, t, a, o, c, u, f, p);
	}
	static fromUcs(t, n, r) {
		return e.fromUcsInViewingConditions(t, n, r, Rr.DEFAULT);
	}
	static fromUcsInViewingConditions(t, n, r, i) {
		let a = n, o = r, s = Math.sqrt(a * a + o * o), c = (Math.exp(s * .0228) - 1) / .0228 / i.fLRoot, l = 180 / Math.PI * Math.atan2(o, a);
		l < 0 && (l += 360);
		let u = t / (1 - (t - 100) * .007);
		return e.fromJchInViewingConditions(u, c, l, i);
	}
	toInt() {
		return this.viewed(Rr.DEFAULT);
	}
	viewed(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = L(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = L(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), ee = L(m) * (100 / e.fl) * y ** (1 / .42), b = g / e.rgbD[0], x = v / e.rgbD[1], S = ee / e.rgbD[2];
		return Er(1.86206786 * b - 1.01125463 * x + .14918677 * S, .38752654 * b + .62144744 * x - .00897398 * S, -.0158415 * b - .03412294 * x + 1.04996444 * S);
	}
	static fromXyzInViewingConditions(t, n, r, i) {
		let a = .401288 * t + .650173 * n - .051461 * r, o = -.250268 * t + 1.204414 * n + .045854 * r, s = -.002079 * t + .048952 * n + .953127 * r, c = i.rgbD[0] * a, l = i.rgbD[1] * o, u = i.rgbD[2] * s, d = (i.fl * Math.abs(c) / 100) ** .42, f = (i.fl * Math.abs(l) / 100) ** .42, p = (i.fl * Math.abs(u) / 100) ** .42, m = L(c) * 400 * d / (d + 27.13), h = L(l) * 400 * f / (f + 27.13), g = L(u) * 400 * p / (p + 27.13), _ = (11 * m + -12 * h + g) / 11, v = (m + h - 2 * g) / 9, y = (20 * m + 20 * h + 21 * g) / 20, ee = (40 * m + 20 * h + g) / 20, b = Math.atan2(v, _) * 180 / Math.PI, x = b < 0 ? b + 360 : b >= 360 ? b - 360 : b, S = x * Math.PI / 180, C = 100 * (ee * i.nbb / i.aw) ** +(i.c * i.z), te = 4 / i.c * Math.sqrt(C / 100) * (i.aw + 4) * i.fLRoot, ne = x < 20.14 ? x + 360 : x, re = (5e4 / 13 * (1 / 4 * (Math.cos(ne * Math.PI / 180 + 2) + 3.8)) * i.nc * i.ncb * Math.sqrt(_ * _ + v * v) / (y + .305)) ** .9 * (1.64 - .29 ** i.n) ** .73, ie = re * Math.sqrt(C / 100), ae = ie * i.fLRoot, oe = 50 * Math.sqrt(re * i.c / (i.aw + 4)), se = (1 + 100 * .007) * C / (1 + .007 * C), ce = Math.log(1 + .0228 * ae) / .0228, le = ce * Math.cos(S), ue = ce * Math.sin(S);
		return new e(x, ie, C, te, ae, oe, se, le, ue);
	}
	xyzInViewingConditions(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = L(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = L(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), ee = L(m) * (100 / e.fl) * y ** (1 / .42), b = g / e.rgbD[0], x = v / e.rgbD[1], S = ee / e.rgbD[2];
		return [
			1.86206786 * b - 1.01125463 * x + .14918677 * S,
			.38752654 * b + .62144744 * x - .00897398 * S,
			-.0158415 * b - .03412294 * x + 1.04996444 * S
		];
	}
}, Br = class e {
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
		let n = _r(t, e.SCALED_DISCOUNT_FROM_LINRGB), r = e.chromaticAdaptation(n[0]), i = e.chromaticAdaptation(n[1]), a = e.chromaticAdaptation(n[2]), o = (11 * r + -12 * i + a) / 11, s = (r + i - 2 * a) / 9;
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
		let i = Math.sqrt(r) * 11, a = Rr.DEFAULT, o = 1 / (1.64 - .29 ** a.n) ** .73, s = .25 * (Math.cos(t + 2) + 3.8) * (5e4 / 13) * a.nc * a.ncb, c = Math.sin(t), l = Math.cos(t);
		for (let t = 0; t < 5; t++) {
			let u = i / 100, d = ((n === 0 || i === 0 ? 0 : n / Math.sqrt(u)) * o) ** (1 / .9), f = a.aw * u ** (1 / a.c / a.z) / a.nbb, p = 23 * (f + .305) * d / (23 * s + 11 * d * l + 108 * d * c), m = p * l, h = p * c, g = (460 * f + 451 * m + 288 * h) / 1403, _ = (460 * f - 891 * m - 261 * h) / 1403, v = (460 * f - 220 * m - 6300 * h) / 1403, y = _r([
				e.inverseChromaticAdaptation(g),
				e.inverseChromaticAdaptation(_),
				e.inverseChromaticAdaptation(v)
			], e.LINRGB_FROM_SCALED_DISCOUNT);
			if (y[0] < 0 || y[1] < 0 || y[2] < 0) return 0;
			let ee = e.Y_FROM_LINRGB[0], b = e.Y_FROM_LINRGB[1], x = e.Y_FROM_LINRGB[2], S = ee * y[0] + b * y[1] + x * y[2];
			if (S <= 0) return 0;
			if (t === 4 || Math.abs(S - r) < .002) return y[0] > 100.01 || y[1] > 100.01 || y[2] > 100.01 ? 0 : Sr(y);
			i -= (S - r) * i / (2 * S);
		}
		return 0;
	}
	static solveToInt(t, n, r) {
		if (n < 1e-4 || r < 1e-4 || r > 99.9999) return kr(r);
		t = z(t);
		let i = t / 180 * Math.PI, a = jr(r), o = e.findResultByJ(i, n, a);
		return o === 0 ? Sr(e.bisectToLimit(a, i)) : o;
	}
	static solveToCam(t, n, r) {
		return zr.fromInt(e.solveToInt(t, n, r));
	}
};
Br.SCALED_DISCOUNT_FROM_LINRGB = [
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
], Br.LINRGB_FROM_SCALED_DISCOUNT = [
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
], Br.Y_FROM_LINRGB = [
	.2126,
	.7152,
	.0722
], Br.CRITICAL_PLANES = [
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
		return new e(Br.solveToInt(t, n, r));
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
		this.setInternalState(Br.solveToInt(e, this.internalChroma, this.internalTone));
	}
	get chroma() {
		return this.internalChroma;
	}
	set chroma(e) {
		this.setInternalState(Br.solveToInt(this.internalHue, e, this.internalTone));
	}
	get tone() {
		return this.internalTone;
	}
	set tone(e) {
		this.setInternalState(Br.solveToInt(this.internalHue, this.internalChroma, e));
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
		let t = zr.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = Ar(e), this.argb = e;
	}
	setInternalState(e) {
		let t = zr.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = Ar(e), this.argb = e;
	}
	inViewingConditions(t) {
		let n = zr.fromInt(this.toInt()).xyzInViewingConditions(t), r = zr.fromXyzInViewingConditions(n[0], n[1], n[2], Rr.make());
		return e.from(r.hue, r.chroma, Mr(n[1]));
	}
}, V = class e {
	static ratioOfTones(t, n) {
		return t = R(0, 100, t), n = R(0, 100, n), e.ratioOfYs(jr(t), jr(n));
	}
	static ratioOfYs(e, t) {
		let n = e > t ? e : t, r = n === t ? e : t;
		return (n + 5) / (r + 5);
	}
	static lighter(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = jr(t), i = n * (r + 5) - 5, a = e.ratioOfYs(i, r), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = Mr(i) + .4;
		return s < 0 || s > 100 ? -1 : s;
	}
	static darker(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = jr(t), i = (r + 5) / n - 5, a = e.ratioOfYs(r, i), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = Mr(i) - .4;
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
}, Vr = class e {
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
function Hr(e, t, n) {
	if (e.name !== n.name) throw Error(`Attempting to extend color ${e.name} with color ${n.name} of different name for spec version ${t}.`);
	if (e.isBackground !== n.isBackground) throw Error(`Attempting to extend color ${e.name} as a ${e.isBackground ? "background" : "foreground"} with color ${n.name} as a ${n.isBackground ? "background" : "foreground"} for spec version ${t}.`);
}
function H(e, t, n) {
	return Hr(e, t, n), U.fromPalette({
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
		let n = qr(e.specVersion).getHct(e, this);
		return this.hctCache.size > 4 && this.hctCache.clear(), this.hctCache.set(e, n), n;
	}
	getTone(e) {
		return qr(e.specVersion).getTone(e, this);
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
}, Ur = class {
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
}, Wr = class {
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
}, Gr = new Ur(), Kr = new Wr();
function qr(e) {
	return e === "2021" ? Gr : Kr;
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
		let r = new Jr(t, n).create();
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
}, Jr = class {
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
}, Yr = class e {
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
			let t = gr(n + e), r = this.hctsByHue[t], a = this.relativeTemperature(r), s = Math.abs(a - i);
			i = a, o += s;
		}
		let s = 1, c = o / t, l = 0;
		for (i = this.relativeTemperature(r); a.length < t;) {
			let e = gr(n + s), r = this.hctsByHue[e], o = this.relativeTemperature(r), u = Math.abs(o - i);
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
		let t = Or(e.toInt()), n = z(Math.atan2(t[2], t[1]) * 180 / Math.PI);
		return -.5 + .02 * Math.sqrt(t[1] * t[1] + t[2] * t[2]) ** 1.07 * Math.cos(z(n - 50) * Math.PI / 180);
	}
}, G = class {
	constructor(e, t, n, r) {
		this.low = e, this.normal = t, this.medium = n, this.high = r;
	}
	get(e) {
		return e <= -1 ? this.low : e < 0 ? mr(this.low, this.normal, (e - -1) / 1) : e < .5 ? mr(this.normal, this.medium, (e - 0) / .5) : e < 1 ? mr(this.medium, this.high, (e - .5) / .5) : this.high;
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
function Xr(e) {
	return e.variant === q.FIDELITY || e.variant === q.CONTENT;
}
function J(e) {
	return e.variant === q.MONOCHROME;
}
function Zr(e, t, n, r) {
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
var Qr = class {
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
			tone: (e) => Xr(e) ? e.sourceColorHct.tone : J(e) ? e.isDark ? 85 : 25 : e.isDark ? 30 : 90,
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
			tone: (e) => Xr(e) ? U.foregroundTone(this.primaryContainer().tone(e), 4.5) : J(e) ? e.isDark ? 0 : 100 : e.isDark ? 90 : 30,
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
				return J(e) ? e.isDark ? 30 : 85 : Xr(e) ? Zr(e.secondaryPalette.hue, e.secondaryPalette.chroma, t, !e.isDark) : t;
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
			tone: (e) => J(e) ? e.isDark ? 90 : 10 : Xr(e) ? U.foregroundTone(this.secondaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
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
				if (!Xr(e)) return e.isDark ? 30 : 90;
				let t = e.tertiaryPalette.getHct(e.sourceColorHct.tone);
				return Vr.fixIfDisliked(t).tone;
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
			tone: (e) => J(e) ? e.isDark ? 0 : 100 : Xr(e) ? U.foregroundTone(this.tertiaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
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
	return R(t, n, ei(e.hue, e.chroma * r, 100, !0));
}
function $r(e, t = 0, n = 100) {
	return R(t, n, ei(e.hue, e.chroma, 0, !1));
}
function ei(e, t, n, r) {
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
var ti = class extends Qr {
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
			tone: (e) => e.platform === "watch" ? 30 : e.variant === q.NEUTRAL ? e.isDark ? 30 : 90 : e.variant === q.TONAL_SPOT ? e.isDark ? $r(e.primaryPalette, 35, 93) : Y(e.primaryPalette, 0, 90) : e.variant === q.EXPRESSIVE ? e.isDark ? Y(e.primaryPalette, 30, 93) : Y(e.primaryPalette, 78, B.isCyan(e.primaryPalette.hue) ? 88 : 90) : e.isDark ? $r(e.primaryPalette, 66, 93) : Y(e.primaryPalette, 66, B.isCyan(e.primaryPalette.hue) ? 88 : 93),
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
			tone: (e) => e.platform === "watch" ? e.variant === q.NEUTRAL ? 90 : Y(e.secondaryPalette, 0, 90) : e.variant === q.NEUTRAL ? e.isDark ? $r(e.secondaryPalette, 0, 98) : Y(e.secondaryPalette) : e.variant === q.VIBRANT ? Y(e.secondaryPalette, 0, e.isDark ? 90 : 98) : e.isDark ? 80 : Y(e.secondaryPalette),
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
			tone: (e) => e.platform === "watch" ? 30 : e.variant === q.VIBRANT ? e.isDark ? $r(e.secondaryPalette, 30, 40) : Y(e.secondaryPalette, 84, 90) : e.variant === q.EXPRESSIVE ? e.isDark ? 15 : Y(e.secondaryPalette, 90, 95) : e.isDark ? 25 : 90,
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
			tone: (e) => e.platform === "phone" ? e.isDark ? $r(e.errorPalette, 0, 98) : Y(e.errorPalette) : $r(e.errorPalette),
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
			tone: (e) => $r(e.errorPalette),
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
			tone: (e) => e.platform === "watch" ? 30 : e.isDark ? $r(e.errorPalette, 30, 93) : Y(e.errorPalette, 0, 90),
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
function ni(e, t = 0, n = 100, r = 1) {
	return R(t, n, ii(e.hue, e.chroma * r, 100, !0));
}
function ri(e, t = 0, n = 100) {
	return R(t, n, ii(e.hue, e.chroma, 0, !1));
}
function ii(e, t, n, r) {
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
var ai = class extends ti {
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
			tone: (e) => e.isDark ? ri(e.secondaryPalette) : ni(e.secondaryPalette),
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
			tone: (e) => e.isDark ? ri(e.secondaryPalette, 20, 49) : ni(e.secondaryPalette, 61, 90),
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
			tone: (e) => ni(e.errorPalette),
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
			tone: (e) => e.isDark ? ri(e.errorPalette) : ni(e.errorPalette),
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
Q.contentAccentToneDelta = 15, Q.colorSpec = new ai(), Q.primaryPaletteKeyColor = Q.colorSpec.primaryPaletteKeyColor(), Q.secondaryPaletteKeyColor = Q.colorSpec.secondaryPaletteKeyColor(), Q.tertiaryPaletteKeyColor = Q.colorSpec.tertiaryPaletteKeyColor(), Q.neutralPaletteKeyColor = Q.colorSpec.neutralPaletteKeyColor(), Q.neutralVariantPaletteKeyColor = Q.colorSpec.neutralVariantPaletteKeyColor(), Q.background = Q.colorSpec.background(), Q.onBackground = Q.colorSpec.onBackground(), Q.surface = Q.colorSpec.surface(), Q.surfaceDim = Q.colorSpec.surfaceDim(), Q.surfaceBright = Q.colorSpec.surfaceBright(), Q.surfaceContainerLowest = Q.colorSpec.surfaceContainerLowest(), Q.surfaceContainerLow = Q.colorSpec.surfaceContainerLow(), Q.surfaceContainer = Q.colorSpec.surfaceContainer(), Q.surfaceContainerHigh = Q.colorSpec.surfaceContainerHigh(), Q.surfaceContainerHighest = Q.colorSpec.surfaceContainerHighest(), Q.onSurface = Q.colorSpec.onSurface(), Q.surfaceVariant = Q.colorSpec.surfaceVariant(), Q.onSurfaceVariant = Q.colorSpec.onSurfaceVariant(), Q.inverseSurface = Q.colorSpec.inverseSurface(), Q.inverseOnSurface = Q.colorSpec.inverseOnSurface(), Q.outline = Q.colorSpec.outline(), Q.outlineVariant = Q.colorSpec.outlineVariant(), Q.shadow = Q.colorSpec.shadow(), Q.scrim = Q.colorSpec.scrim(), Q.surfaceTint = Q.colorSpec.surfaceTint(), Q.primary = Q.colorSpec.primary(), Q.onPrimary = Q.colorSpec.onPrimary(), Q.primaryContainer = Q.colorSpec.primaryContainer(), Q.onPrimaryContainer = Q.colorSpec.onPrimaryContainer(), Q.inversePrimary = Q.colorSpec.inversePrimary(), Q.secondary = Q.colorSpec.secondary(), Q.onSecondary = Q.colorSpec.onSecondary(), Q.secondaryContainer = Q.colorSpec.secondaryContainer(), Q.onSecondaryContainer = Q.colorSpec.onSecondaryContainer(), Q.tertiary = Q.colorSpec.tertiary(), Q.onTertiary = Q.colorSpec.onTertiary(), Q.tertiaryContainer = Q.colorSpec.tertiaryContainer(), Q.onTertiaryContainer = Q.colorSpec.onTertiaryContainer(), Q.error = Q.colorSpec.error(), Q.onError = Q.colorSpec.onError(), Q.errorContainer = Q.colorSpec.errorContainer(), Q.onErrorContainer = Q.colorSpec.onErrorContainer(), Q.primaryFixed = Q.colorSpec.primaryFixed(), Q.primaryFixedDim = Q.colorSpec.primaryFixedDim(), Q.onPrimaryFixed = Q.colorSpec.onPrimaryFixed(), Q.onPrimaryFixedVariant = Q.colorSpec.onPrimaryFixedVariant(), Q.secondaryFixed = Q.colorSpec.secondaryFixed(), Q.secondaryFixedDim = Q.colorSpec.secondaryFixedDim(), Q.onSecondaryFixed = Q.colorSpec.onSecondaryFixed(), Q.onSecondaryFixedVariant = Q.colorSpec.onSecondaryFixedVariant(), Q.tertiaryFixed = Q.colorSpec.tertiaryFixed(), Q.tertiaryFixedDim = Q.colorSpec.tertiaryFixedDim(), Q.onTertiaryFixed = Q.colorSpec.onTertiaryFixed(), Q.onTertiaryFixedVariant = Q.colorSpec.onTertiaryFixedVariant();
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
		this.sourceColorArgb = this.sourceColorHct.toInt(), this.variant = t.variant, this.contrastLevel = t.contrastLevel, this.isDark = t.isDark, this.platform = t.platform ?? "phone", this.specVersion = e.maybeFallbackSpecVersion(t.specVersion ?? "2021", this.variant), this.primaryPalette = t.primaryPalette ?? ui(this.specVersion).getPrimaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.secondaryPalette = t.secondaryPalette ?? ui(this.specVersion).getSecondaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.tertiaryPalette = t.tertiaryPalette ?? ui(this.specVersion).getTertiaryPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralPalette = t.neutralPalette ?? ui(this.specVersion).getNeutralPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.neutralVariantPalette = t.neutralVariantPalette ?? ui(this.specVersion).getNeutralVariantPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel), this.errorPalette = t.errorPalette ?? ui(this.specVersion).getErrorPalette(this.variant, this.sourceColorHct, this.isDark, this.platform, this.contrastLevel) ?? W.fromHueAndChroma(25, 84), this.colors = new Q();
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
var oi = class {
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
			case q.CONTENT: return W.fromHct(Vr.fixIfDisliked(new Yr(t).analogous(3, 6)[2]));
			case q.FIDELITY: return W.fromHct(Vr.fixIfDisliked(new Yr(t).complement));
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
}, si = class e extends oi {
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
}, ci = new oi(), li = new si();
function ui(e) {
	return e === "2025" ? li : ci;
}
//#endregion
//#region packages/ui-kit/src/theme/m3-theme.ts
var di = new Q(), fi = U.fromPalette({
	name: "on_on_primary",
	palette: (e) => e.primaryPalette,
	background: () => di.onPrimary(),
	contrastCurve: () => new G(6, 6, 7, 11)
}), pi = U.fromPalette({
	name: "primary_container_subtle",
	palette: (e) => e.primaryPalette,
	isBackground: !0,
	background: (e) => di.highestSurface(e),
	contrastCurve: () => void 0
}), mi = U.fromPalette({
	name: "on_primary_container_subtle",
	palette: (e) => e.primaryPalette,
	background: () => pi,
	contrastCurve: () => new G(6, 6, 7, 11)
}), hi = U.fromPalette({
	name: "secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	isBackground: !0,
	background: (e) => di.highestSurface(e),
	contrastCurve: () => void 0
}), gi = U.fromPalette({
	name: "on_secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	background: () => hi,
	contrastCurve: () => new G(6, 6, 7, 11)
}), _i = U.fromPalette({
	name: "tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	isBackground: !0,
	background: (e) => di.highestSurface(e),
	contrastCurve: () => void 0
}), vi = U.fromPalette({
	name: "on_tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	background: () => _i,
	contrastCurve: () => new G(6, 6, 7, 11)
}), yi = U.fromPalette({
	name: "error_container_subtle",
	palette: (e) => e.errorPalette,
	isBackground: !0,
	background: (e) => di.highestSurface(e),
	contrastCurve: () => void 0
}), bi = U.fromPalette({
	name: "on_error_container_subtle",
	palette: (e) => e.errorPalette,
	background: () => yi,
	contrastCurve: () => new G(6, 6, 7, 11)
}), xi = [
	...di.allColors.filter((e) => e.name !== "background" && e.name !== "on_background"),
	di.shadow(),
	di.scrim(),
	fi,
	pi,
	mi,
	hi,
	gi,
	_i,
	vi,
	yi,
	bi
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
function Si(e) {
	let t = (e & 16777215).toString(16).padStart(6, "0");
	return t[0] === t[1] && t[2] === t[3] && t[4] === t[5] ? `#${t[0]}${t[2]}${t[4]}` : `#${t}`;
}
function Ci(e) {
	let t = e.replace("#", "").trim();
	if (t.length === 3) {
		let e = t[0] + t[0], n = t[1] + t[1], r = t[2] + t[2];
		return Number.parseInt(`ff${e}${n}${r}`, 16);
	}
	return t.length === 6 ? Number.parseInt(`ff${t}`, 16) : t.length === 8 ? Number.parseInt(t, 16) : null;
}
function wi(e) {
	return e.replaceAll("_", "-");
}
function Ti(e, t) {
	return new $({
		sourceColorHcts: [B.fromInt(e)],
		variant: q.TONAL_SPOT,
		contrastLevel: 0,
		specVersion: "2025",
		isDark: t
	});
}
function Ei(e, t) {
	let n = e === "dark", r = Ti((t ? Ci(t) : null) ?? 4278216887, n), i = {};
	for (let e of xi) {
		let t = wi(e.name);
		i[t] = Si(e.getArgb(r));
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
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
pr(Ei("light"), Ei("dark")), typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5"), jn(["input"]), jn(["change"]), jn(["change"]), jn(["change"]), jn(["click"]), jn(["change"]), jn(["click"]);
//#endregion
//#region packages/ui-kit/src/plugin-screen/mountable-svelte.ts
function Di(e) {
	return {
		[dr]: !0,
		mount(t, n) {
			let r = Un(e, {
				target: t,
				props: n
			});
			return { unmount: () => {
				qn(r);
			} };
		}
	};
}
//#endregion
//#region packages/codec-kit/src/deflate.ts
async function Oi(e) {
	return new Uint8Array(await new Response(e).arrayBuffer());
}
async function ki(e) {
	if (typeof CompressionStream > "u") {
		let t = await import(
			/* @vite-ignore */
			["node", "zlib"].join(":")
);
		return new Uint8Array(t.deflateRawSync(Buffer.from(e)));
	}
	let t = new CompressionStream("deflate-raw"), n = t.writable.getWriter();
	return await n.write(e), await n.close(), Oi(t.readable);
}
async function Ai(e) {
	if (typeof DecompressionStream > "u") {
		let t = await import(
			/* @vite-ignore */
			["node", "zlib"].join(":")
);
		return new Uint8Array(t.inflateRawSync(Buffer.from(e)));
	}
	let t = new DecompressionStream("deflate-raw"), n = t.writable.getWriter();
	return await n.write(e), await n.close(), Oi(t.readable);
}
//#endregion
//#region packages/codec-kit/src/base64.ts
var ji = 8192;
function Mi(e) {
	let t = "";
	for (let n = 0; n < e.length; n += ji) t += String.fromCharCode(...e.subarray(n, n + ji));
	return t;
}
function Ni(e) {
	let t = new Uint8Array(e.length);
	for (let n = 0; n < e.length; n += 1) t[n] = e.charCodeAt(n);
	return t;
}
function Pi(e) {
	return btoa(Mi(e));
}
function Fi(e) {
	return Ni(atob(e));
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
function Ii(e) {
	let t = e.filter((e) => e < 1 || e > 32);
	if (t.length > 0) throw RangeError(`week out of range: ${t.join(", ")}`);
}
function Li(e) {
	Ii(e);
	let t = 0;
	for (let n of e) t |= 1 << n - 1;
	return t >>> 0;
}
function Ri(e) {
	let t = [];
	for (let n = 1; n <= 32; n += 1) e & 1 << n - 1 && t.push(n);
	return t;
}
//#endregion
//#region packages/codec-kit/src/interner.ts
var zi = class {
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
}, Bi = /* @__PURE__ */ new Uint8Array(512), Vi = /* @__PURE__ */ new Uint8Array(256);
(() => {
	let e = 1;
	for (let t = 0; t < 255; t++) Bi[t] = e, Bi[t + 255] = e, Vi[e] = t, e <<= 1, e & 256 && (e ^= 285);
})();
function Hi(e, t) {
	return e === 0 || t === 0 ? 0 : Bi[Vi[e] + Vi[t]];
}
function Ui(e) {
	let t = new Uint8Array([1]);
	for (let n = 0; n < e; n++) {
		let e = new Uint8Array(t.length + 1);
		for (let r = 0; r < t.length; r++) e[r] ^= Hi(t[r], Bi[n]), e[r + 1] ^= t[r];
		t = e;
	}
	return t;
}
function Wi(e, t) {
	let n = Ui(t), r = new Uint8Array(t);
	for (let i = 0; i < e.length; i++) {
		let a = e[i] ^ r[0];
		for (let e = 0; e < t - 1; e++) r[e] = r[e + 1] ^ Hi(n[e + 1], a);
		r[t - 1] = Hi(n[t], a);
	}
	return r;
}
var Gi = [
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
], Ki = [
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
], qi = [
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
], Ji = 9174;
function Yi(e) {
	let t = Gi[e - 1];
	if (!t) throw Error(`Unsupported QR version: ${e}`);
	return t;
}
function Xi(e) {
	for (let t = 1; t <= 40; t++) {
		let n = Yi(t).blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0);
		if (e + (t <= 9 ? 2 : 3) <= n) return t;
	}
	throw Error(`Data payload too large for QR Code (length: ${e}, max capacity: 2953 bytes)`);
}
function Zi(e, t) {
	let n = new TextEncoder().encode(e), r = Yi(t), i = r.blocks.reduce((e, t) => e + t.count * t.dataCodewords, 0), a = [];
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
		d.push(t), f.push(Wi(t, r.eccPerBlock)), p += e.dataCodewords;
	}
	let m = [], h = Math.max(...d.map((e) => e.length));
	for (let e = 0; e < h; e++) for (let t of d) e < t.length && m.push(t[e]);
	for (let e = 0; e < r.eccPerBlock; e++) for (let t of f) m.push(t[e]);
	return Uint8Array.from(m);
}
function Qi(e) {
	let t = Xi(new TextEncoder().encode(e).length), n = t * 4 + 17, r = Array.from({ length: n }, () => Array(n).fill(null)), i = Array.from({ length: n }, () => Array(n).fill(!1));
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
	let s = Ki[t - 1] ?? [];
	for (let e of s) for (let t of s) if (!i[e][t]) for (let n = -2; n <= 2; n++) for (let r = -2; r <= 2; r++) {
		let i = Math.max(Math.abs(n), Math.abs(r)) !== 1;
		a(e + n, t + r, i);
	}
	a(n - 8, 8, !0);
	for (let e = 0; e < 9; e++) r[8][e] === null && a(8, e, !1, !0), r[e][8] === null && a(e, 8, !1, !0);
	for (let e = 0; e < 8; e++) r[8][n - 1 - e] === null && a(8, n - 1 - e, !1, !0), r[n - 1 - e][8] === null && a(n - 1 - e, 8, !1, !0);
	if (t >= 7) {
		let e = qi[t - 7];
		for (let t = 0; t < 18; t++) {
			let r = (e >> t & 1) == 1, i = Math.floor(t / 3), o = t % 3 + n - 11;
			a(i, o, r), a(o, i, r);
		}
	}
	let c = Zi(e, t), l = 0, u = n - 1, d = -1;
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
	let f = Ji;
	for (let e = 0; e < 15; e++) {
		let t = (f >> e & 1) == 1;
		e < 6 ? r[8][e] = t : e < 8 ? r[8][e + 1] = t : r[8][n - 15 + e] = t, e < 8 ? r[n - 1 - e][8] = t : r[14 - e][8] = t;
	}
	return {
		size: n,
		modules: r.map((e) => e.map((e) => !!e))
	};
}
function $i(e, t = {}) {
	let { margin: n = 2, color: r = "#000000", background: i = "#ffffff", size: a = 512 } = t, o = Qi(e), s = o.size + n * 2, c = [];
	for (let e = 0; e < o.size; e++) for (let t = 0; t < o.size; t++) o.modules[e][t] && c.push(`M${t + n},${e + n}h1v1h-1z`);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${a}" height="${a}" shape-rendering="crispEdges" data-chronos-qr="${e}"><metadata>${e}</metadata><rect width="${s}" height="${s}" fill="${i}"/><path d="${c.join("")}" fill="${r}"/></svg>`;
}
//#endregion
//#region packages/plugins/codec-qrcode/src/qr/qr-decode.ts
async function ea(e) {
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
//#region packages/plugins/codec-qrcode/src/QrCodeImportTab.svelte
var ta = /* @__PURE__ */ Rn("<div class=\"rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs\"><div class=\"flex flex-col gap-4\"><div><h2 class=\"m3-title-medium text-on-surface\">从二维码导入</h2> <p class=\"m3-body-small mt-0.5 text-on-surface-variant\">选择或拖入他人分享的课表二维码图片</p></div> <input type=\"file\" accept=\"image/*,.svg\" class=\"hidden\"/> <div role=\"region\" aria-label=\"二维码图片上传区域\"><svg class=\"size-10 text-on-surface-variant/80\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"></rect><path d=\"M14 14h3v3h-3z\"></path><path d=\"M20 14v3h-3\"></path><path d=\"M14 20h7\"></path></svg> <div class=\"flex flex-col gap-1\"><span class=\"m3-body-medium font-medium text-on-surface\">点击选择二维码图片</span> <span class=\"m3-body-small text-on-surface-variant\">支持 PNG、JPEG、WebP 或 SVG 格式</span></div> <button type=\"button\" class=\"m3-label-large mt-1 rounded-full bg-primary px-6 py-2.5 font-medium text-on-primary disabled:opacity-50\"> </button></div></div></div>");
function na(e, t) {
	Se(t, !0);
	let n = /* @__PURE__ */ D(!1), r = /* @__PURE__ */ D(null), i = /* @__PURE__ */ D(!1);
	function a() {
		let { errorMessage: e } = t.transfer.state;
		e && alert(e);
	}
	async function o(e) {
		O(n, !0);
		try {
			let n = await ea(e);
			await t.transfer.previewWithSlot("qrcode", { content: n }) ? t.onContinue() : a();
		} catch (e) {
			let t = e instanceof Error ? e.message : "二维码识别失败";
			alert(t);
		} finally {
			O(n, !1);
		}
	}
	async function s(e) {
		let t = e.target, n = t.files?.[0];
		n && (await o(n), t.value = "");
	}
	async function c(e) {
		e.preventDefault(), O(i, !1);
		let t = e.dataTransfer?.files?.[0];
		t && await o(t);
	}
	var l = ta(), u = Nt(Mt(Mt(l)), 2);
	Qn(u, (e) => O(r, e), () => I(r));
	var d = Nt(u, 2), f = Nt(Mt(d), 4), p = Mt(f, !0);
	Wt(() => {
		Xn(d, 1, `flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${I(i) ? "border-primary bg-primary/5" : "border-outline/40 bg-surface-variant/20"}`), f.disabled = I(n), Hn(p, I(n) ? "识别中…" : "选择图片");
	}), An("change", u, s), kn("dragover", d, (e) => {
		e.preventDefault(), O(i, !0);
	}), kn("dragleave", d, () => O(i, !1)), kn("drop", d, c), An("click", f, () => I(r)?.click()), zn(e, l), Ce();
}
jn(["change", "click"]);
//#endregion
//#region packages/plugins/codec-qrcode/src/index.ts
async function ra(e) {
	let t = new zi(), n = e.courses.map((e) => {
		let n = t.intern(e.name), r = t.intern(e.teacher), i = t.intern(e.location), a = t.intern(e.remark), o = t.intern(e.color), s = Li(e.weeks), c = [
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
	return `chronos-qr:v2:${Pi(await ki(new TextEncoder().encode(i)))}`;
}
async function ia(e) {
	let t = e.trim();
	if (!t.startsWith("chronos-qr:v2:")) throw Error("二维码数据格式损坏或无法解析为课表");
	let n = await Ai(Fi(t.slice(14))), r = new TextDecoder().decode(n), i = JSON.parse(r), a = i.s ?? [], o = (i.c ?? []).map((e, t) => {
		let n = (e[0] >= 0 ? a[e[0]] : null) ?? "未命名课程", r = (e[1] >= 0 ? a[e[1]] : null) ?? "", i = (e[2] >= 0 ? a[e[2]] : null) ?? "", o = e[3] ?? 1, s = e[4] ?? 1, c = e[5] ?? 1, l = Ri(e[6] ?? 1), u = l.length > 0 ? l : [1], d = e[7] !== void 0 && e[7] >= 0 ? a[e[7]] : void 0, f = e[8] !== void 0 && e[8] >= 0 ? a[e[8]] : void 0;
		return ar({
			id: `c-qr-${t + 1}-${Date.now().toString(36)}`,
			name: n,
			teacher: r,
			location: i,
			dayOfWeek: o,
			startPeriod: s,
			endPeriod: c,
			weeks: u,
			remark: d,
			color: f
		});
	});
	return lr({
		id: `t-qr-${Date.now().toString(36)}`,
		name: i.n || "二维码导入课表",
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
		courses: o
	});
}
var aa = ur({ content: {
	type: "string",
	title: () => "二维码内容",
	placeholder: () => "二维码识别出的数据内容",
	required: !0
} });
function oa(e = {}) {
	let { importComponent: t = Di(na) } = e;
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
				inputSchema: aa,
				async executeImport(e) {
					let t = e.content ?? e.fileContent;
					if (!t?.trim()) throw Error("未识别到有效的二维码内容");
					return ia(t);
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
					let r = $i(await ra(n), { margin: 2 });
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
oa();
//#endregion
//#region packages/plugins/codec-qrcode/bundle/entry.ts
var sa = oa({ importComponent: Di(na) });
//#endregion
export { sa as default };
