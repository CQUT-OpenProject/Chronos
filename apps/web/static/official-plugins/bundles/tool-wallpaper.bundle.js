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
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/constants.js
var p = 1 << 24, m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, ee = 1 << 21, te = 1 << 22, ne = 1 << 23, re = Symbol("$state"), ie = Symbol("legacy props"), ae = Symbol("attributes"), oe = Symbol("class"), se = Symbol("style"), ce = Symbol("text"), le = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function ue() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function de(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function fe(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function pe() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function me(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function he() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ge(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
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
var xe = {}, E = Symbol("uninitialized");
function Se() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Ce(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function we() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/hydration.js
var D = !1;
function Te(e) {
	D = e;
}
var O;
function Ee(e) {
	if (e === null) throw Ce(), xe;
	return O = e;
}
function De() {
	return Ee(/* @__PURE__ */ Xt(O));
}
function k(e) {
	if (D) {
		if (/* @__PURE__ */ Xt(O) !== null) throw Ce(), xe;
		O = e;
	}
}
function Oe(e = 1) {
	if (D) {
		for (var t = e, n = O; t--;) n = /* @__PURE__ */ Xt(n);
		O = n;
	}
}
function ke(e = !0) {
	for (var t = 0, n = O;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Xt(n);
		e && n.remove(), n = i;
	}
}
function Ae(e) {
	if (!e || e.nodeType !== 8) throw Ce(), xe;
	return e.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function je(e) {
	return e === this.v;
}
function Me(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ne(e) {
	return !Me(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var Pe = null;
function Fe(e) {
	Pe = e;
}
function Ie(e, t = !1, n) {
	Pe = {
		p: Pe,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: I,
		l: null
	};
}
function Le(e) {
	var t = Pe, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) un(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Pe = t.p, e ?? {};
}
function Re() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var ze = [];
function Be() {
	var e = ze;
	ze = [], d(e);
}
function Ve(e) {
	if (ze.length === 0 && !vt) {
		var t = ze;
		queueMicrotask(() => {
			t === ze && Be();
		});
	}
	ze.push(e);
}
function He(e) {
	var t = I;
	if (t === null) return F.f |= ne, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ue(e, t);
}
function Ue(e, t) {
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
var We = ~(h | g | m);
function A(e, t) {
	e.f = e.f & We | t;
}
function Ge(e) {
	e.f & 512 || e.deps === null ? A(e, m) : A(e, g);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function Ke(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, Ke(t.deps));
}
function qe(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Ke(e.deps), A(e, m);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/store.js
var Je = !1;
function Ye(e) {
	var t = Je;
	try {
		return Je = !1, [e(), Je];
	} finally {
		Je = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Xe(e) {
	var t = F, n = I;
	Pn(null), Fn(null);
	try {
		return e();
	} finally {
		Pn(t), Fn(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/reactivity/create-subscriber.js
function Ze(e) {
	let t = 0, n = Pt(0), r;
	return () => {
		sn() && (L(n), mn(() => (t === 0 && (r = tr(() => e(() => Bt(n)))), t += 1, () => {
			Ve(() => {
				--t, t === 0 && (r?.(), r = void 0, Bt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var Qe = x | S;
function $e(e, t, n, r) {
	new et(e, t, n, r);
}
var et = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = D ? O : null;
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
	#h = Ze(() => (this.#m = Pt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = I;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = I.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = hn(() => {
			if (D) {
				let e = this.#t;
				De();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, Qe), D && (this.#e = O);
	}
	#g() {
		try {
			this.#a = _n(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ve(r), t && (this.#s = _n(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				we();
				return;
			}
			t = !0, n && be(), this.#s !== null && wn(this.#s, () => {
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
					Ue(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = _n(() => e(this.#e)), Ve(() => {
			var e = this.#c = document.createDocumentFragment(), t = Jt();
			e.append(t), this.#a = this.#S(() => _n(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, wn(this.#o, () => {
				this.#o = null;
			}), this.#x(M));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = _n(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				On(this.#a, e);
				let t = this.#n.pending;
				this.#o = _n(() => t(this.#e));
			} else this.#x(M);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		qe(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = I, n = F, r = Pe;
		Fn(this.#i), Pn(this.#i), Fe(this.#i.ctx);
		try {
			return wt.ensure(), e();
		} catch (e) {
			return He(e), null;
		} finally {
			Fn(t), Pn(n), Fe(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && wn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ve(() => {
			this.#d = !1, this.#m && Rt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), L(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		M?.is_fork ? (this.#a && M.skip_effect(this.#a), this.#o && M.skip_effect(this.#o), this.#s && M.skip_effect(this.#s), M.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (xn(this.#a), null), this.#o &&= (xn(this.#o), null), this.#s &&= (xn(this.#s), null), D && (Ee(this.#t), Oe(), Ee(ke()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return _n(() => {
						var r = I;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Ue(e, this.#i.parent), null;
				}
			}));
		};
		Ve(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ue(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ue(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function tt(e, t, n, r) {
	let i = Re() ? at : ct;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = I, c = nt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ue(e, s);
			}
			rt();
		}
	}
	var d = it();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ st(e))).then(u).catch((e) => Ue(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), rt();
	}) : f();
}
function nt() {
	var e = I, t = F, n = Pe, r = M;
	return function(i = !0) {
		Fn(e), Pn(t), Fe(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function rt(e = !0) {
	Fn(null), Pn(null), Fe(null), e && M?.deactivate();
}
function it() {
	var e = I, t = e.b, n = M, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function at(e) {
	var t = 2 | h;
	return I !== null && (I.f |= S), {
		ctx: Pe,
		deps: null,
		effects: null,
		equals: je,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: E,
		wv: 0,
		parent: I,
		ac: null
	};
}
var ot = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function st(e, t, n) {
	let r = I;
	r === null && ue();
	var i = void 0, a = Pt(E), o = !F, s = /* @__PURE__ */ new Set();
	return pn(() => {
		var t = I, n = f();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== le && n.reject(e);
			}).finally(rt);
		} catch (e) {
			n.reject(e), rt();
		}
		var c = M;
		if (o) {
			if (t.f & 32768) var l = it();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(ot);
			else for (let e of s.values()) e.reject(ot);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== ot && (c.activate(), t ? (a.f |= ne, Rt(a, t)) : (a.f & 8388608 && (a.f ^= ne), Rt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), cn(() => {
		for (let e of s) e.reject(ot);
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
function j(e) {
	let t = /* @__PURE__ */ at(e);
	return Ln(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function ct(e) {
	let t = /* @__PURE__ */ at(e);
	return t.equals = Ne, t;
}
function lt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) xn(t[n]);
	}
}
function ut(e) {
	var t, n = I, r = e.parent;
	if (!jn && r !== null && e.v !== E && r.f & 24576) return Se(), e.v;
	Fn(r);
	try {
		e.f &= ~T, lt(e), t = Yn(e);
	} finally {
		Fn(n);
	}
	return t;
}
function dt(e) {
	var t = ut(e);
	if (!e.equals(t) && (e.wv = Kn(), (!M?.is_fork || e.deps === null) && (M === null ? e.v = t : (M.capture(e, t, !0), ht?.capture(e, t, !0)), e.deps === null))) {
		A(e, m);
		return;
	}
	jn || (gt === null ? Ge(e) : (sn() || M?.is_fork) && gt.set(e, t));
}
function ft(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Xe(() => {
		t.ac.abort(le), t.ac = null;
	}), t.fn !== null && (t.teardown = u), Zn(t, 0), yn(t));
}
function pt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Qn(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var mt = null, M = null, ht = null, gt = null, _t = null, vt = !1, yt = !1, bt = null, xt = null, St = 0, Ct = 1, wt = class e {
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
		mt === null ? mt = this : (mt.#n = this, this.#t = mt), mt = this;
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
			for (var r of n.d) A(r, h), t(r);
			for (r of n.m) A(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, St++ > 1e3 && (this.#x(), Tt());
		for (let e of this.#u) this.#d.delete(e), A(e, h), this.schedule(e);
		for (let e of this.#d) A(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = bt = [], r = [], i = xt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw At(e), this.#h() || this.discard(), t;
		}
		if (M = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (bt = null, xt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) kt(e, t);
			i.length > 0 && M.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), ht = this, Dt(r), Dt(n), ht = null, this.#s?.resolve();
		var s = M;
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
				a ? r.f ^= m : i & 4 ? t.push(r) : qn(r) && (i & 16 && this.#d.add(r), Qn(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), A(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), M = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) qe(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== E && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), gt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		M = this;
	}
	deactivate() {
		M = null, gt = null;
	}
	flush() {
		try {
			yt = !0, M = this, this.#g();
		} finally {
			St = 0, _t = null, bt = null, xt = null, yt = !1, M = null, gt = null, Mt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(ot);
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
		this.#m || (this.#m = !0, Ve(() => {
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
		if (M === null) {
			let t = M = new e();
			!yt && Ve(() => {
				t.#e || t.flush();
			});
		}
		return M;
	}
	apply() {
		gt = null;
	}
	schedule(e) {
		if (_t = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (bt !== null && t === I && (F === null || !(F.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? mt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Tt() {
	try {
		he();
	} catch (e) {
		Ue(e, _t);
	}
}
var Et = null;
function Dt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && qn(r) && (Et = /* @__PURE__ */ new Set(), Qn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Cn(r), Et?.size > 0)) {
				Mt.clear();
				for (let e of Et) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Et.has(n) && (Et.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Qn(n);
					}
				}
				Et.clear();
			}
		}
		Et = null;
	}
}
function Ot(e) {
	M.schedule(e);
}
function kt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), A(e, m);
		for (var n = e.first; n !== null;) kt(n, t), n = n.next;
	}
}
function At(e) {
	A(e, m);
	for (var t = e.first; t !== null;) At(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var jt = /* @__PURE__ */ new Set(), Mt = /* @__PURE__ */ new Map(), Nt = !1;
function Pt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: je,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ft(e, t) {
	let n = Pt(e, t);
	return Ln(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function It(e, t = !1, n = !0) {
	let r = Pt(e);
	return t || (r.equals = Ne), r;
}
function Lt(e, t, n = !1) {
	return F !== null && (!Nn || F.f & 131072) && Re() && F.f & 4325394 && (In === null || !In.has(e)) && ye(), Rt(e, n ? Ht(t) : t, xt);
}
function Rt(e, t, n = null) {
	if (!e.equals(t)) {
		Mt.set(e, jn ? t : e.v);
		var r = wt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && ut(t), gt === null && Ge(t);
		}
		e.wv = Kn(), Vt(e, h, n), Re() && I !== null && I.f & 1024 && !(I.f & 96) && (Bn === null ? Vn([e]) : Bn.push(e)), !r.is_fork && jt.size > 0 && !Nt && zt();
	}
	return t;
}
function zt() {
	Nt = !1;
	for (let e of jt) {
		e.f & 1024 && A(e, g);
		let t;
		try {
			t = qn(e);
		} catch {
			t = !0;
		}
		t && Qn(e);
	}
	jt.clear();
}
function Bt(e) {
	Lt(e, e.v + 1);
}
function Vt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Re(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === I)) {
			var l = (c & h) === 0;
			if (l && A(s, t), c & 131072) jt.add(s);
			else if (c & 2) {
				var u = s;
				gt?.delete(u), c & 65536 || (c & 512 && (I === null || !(I.f & 2097152)) && (s.f |= T), Vt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Et !== null && Et.add(d), n === null ? Ot(d) : n.push(d);
			}
		}
	}
}
function Ht(t) {
	if (typeof t != "object" || !t || re in t) return t;
	let n = c(t);
	if (n !== o && n !== s) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), l = /* @__PURE__ */ Ft(0), u = null, d = Wn, f = (e) => {
		if (Wn === d) return e();
		var t = F, n = Wn;
		Pn(null), Gn(d);
		var r = e();
		return Pn(t), Gn(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ Ft(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && _e();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ Ft(n.value, u);
				return r.set(t, e), e;
			}) : Lt(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ Ft(E, u));
					r.set(t, e), Bt(l);
				}
			} else Lt(n, E), Bt(l);
			return !0;
		},
		get(e, n, i) {
			if (n === re) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ Ft(Ht(s ? e[n] : E), u)), r.set(n, o)), o !== void 0) {
				var c = L(o);
				return c === E ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = L(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== E) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === re) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== E || Reflect.has(e, t);
			return (n !== void 0 || I !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ Ft(i ? Ht(e[t]) : E, u)), r.set(t, n)), L(n) === E) ? !1 : i;
		},
		set(e, t, n, o) {
			var s = r.get(t), c = t in e;
			if (i && t === "length") for (var d = n; d < s.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ Ft(E, u)), r.set(d + "", p)) : Lt(p, E);
			}
			if (s === void 0) (!c || a(e, t)?.writable) && (s = f(() => /* @__PURE__ */ Ft(void 0, u)), Lt(s, Ht(n)), r.set(t, s));
			else {
				c = s.v !== E;
				var m = f(() => Ht(n));
				Lt(s, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(o, n), !c) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && Lt(g, _ + 1);
				}
				Bt(l);
			}
			return !0;
		},
		ownKeys(e) {
			L(l);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== E;
			});
			for (var [n, i] of r) i.v !== E && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ve();
		}
	});
}
var Ut, Wt, Gt, Kt;
function qt() {
	if (Ut === void 0) {
		Ut = window, Wt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Gt = a(t, "firstChild").get, Kt = a(t, "nextSibling").get, l(e) && (e[oe] = void 0, e[ae] = null, e[se] = void 0, e.__e = void 0), l(n) && (n[ce] = void 0);
	}
}
function Jt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Yt(e) {
	return Gt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Xt(e) {
	return Kt.call(e);
}
function N(e, t) {
	if (!D) return /* @__PURE__ */ Yt(e);
	var n = /* @__PURE__ */ Yt(O);
	if (n === null) n = O.appendChild(Jt());
	else if (t && n.nodeType !== 3) {
		var r = Jt();
		return n?.before(r), Ee(r), r;
	}
	return t && nn(n), Ee(n), n;
}
function Zt(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ Yt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Xt(n) : n;
	}
	if (t) {
		if (O?.nodeType !== 3) {
			var r = Jt();
			return O?.before(r), Ee(r), r;
		}
		nn(O);
	}
	return O;
}
function Qt(e, t = 1, n = !1) {
	let r = D ? O : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Xt(r);
	if (!D) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Jt();
			return r === null ? i?.after(a) : r.before(a), Ee(a), a;
		}
		nn(r);
	}
	return Ee(r), r;
}
function $t(e) {
	e.textContent = "";
}
function en() {
	return !1;
}
function tn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function nn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function rn(e) {
	I === null && (F === null && me(e), pe()), jn && fe(e);
}
function an(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function on(e, t) {
	var n = I;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: Pe,
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
	M?.register_created_effect(r);
	var i = r;
	if (e & 4) bt === null ? wt.ensure().schedule(r) : bt.push(r);
	else if (t !== null) {
		try {
			Qn(r);
		} catch (e) {
			throw xn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && an(i, n), F !== null && F.f & 2 && !(e & 64))) {
		var a = F;
		(a.effects ??= []).push(i);
	}
	return r;
}
function sn() {
	return F !== null && !Nn;
}
function cn(e) {
	let t = on(8, null);
	return A(t, m), t.teardown = e, t;
}
function ln(e) {
	rn("$effect");
	var t = I.f;
	if (!F && t & 32 && Pe !== null && !Pe.i) {
		var n = Pe;
		(n.e ??= []).push(e);
	} else return un(e);
}
function un(e) {
	return on(4 | C, e);
}
function dn(e) {
	wt.ensure();
	let t = on(64 | S, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? wn(t, () => {
			xn(t), n(void 0);
		}) : (xn(t), n(void 0));
	});
}
function fn(e) {
	return on(4, e);
}
function pn(e) {
	return on(te | S, e);
}
function mn(e, t = 0) {
	return on(8 | t, e);
}
function P(e, t = [], n = [], r = []) {
	tt(r, t, n, (t) => {
		on(8, () => {
			e(...t.map(L));
		});
	});
}
function hn(e, t = 0) {
	return on(16 | t, e);
}
function gn(e, t = 0) {
	return on(p | t, e);
}
function _n(e) {
	return on(32 | S, e);
}
function vn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = jn, n = F;
		Mn(!0), Pn(null);
		try {
			t.call(null);
		} finally {
			Mn(e), Pn(n);
		}
	}
}
function yn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Xe(() => {
			e.abort(le);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : xn(n, t), n = r;
	}
}
function bn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || xn(t), t = n;
	}
}
function xn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Sn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, yn(e, t && !n), Zn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	vn(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Cn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Sn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Xt(e);
		e.remove(), e = n;
	}
}
function Cn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function wn(e, t, n = !0) {
	var r = [];
	Tn(e, r, !0);
	var i = () => {
		n && xn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Tn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Tn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function En(e) {
	Dn(e, !0);
}
function Dn(e, t) {
	if (e.f & 8192) {
		e.f ^= _, e.f & 1024 || (A(e, h), wt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Dn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function On(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Xt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var kn = null, An = !1, jn = !1;
function Mn(e) {
	jn = e;
}
var F = null, Nn = !1;
function Pn(e) {
	F = e;
}
var I = null;
function Fn(e) {
	I = e;
}
var In = null;
function Ln(e) {
	F !== null && (In ??= /* @__PURE__ */ new Set()).add(e);
}
var Rn = null, zn = 0, Bn = null;
function Vn(e) {
	Bn = e;
}
var Hn = 1, Un = 0, Wn = Un;
function Gn(e) {
	Wn = e;
}
function Kn() {
	return ++Hn;
}
function qn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (qn(a) && dt(a), a.wv > e.wv) return !0;
		}
		t & 512 && gt === null && A(e, m);
	}
	return !1;
}
function Jn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(In !== null && In.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Jn(a, t, !1) : t === a && (n ? A(a, h) : a.f & 1024 && A(a, g), Ot(a));
	}
}
function Yn(e) {
	var t = Rn, n = zn, r = Bn, i = F, a = In, o = Pe, s = Nn, c = Wn, l = e.f;
	Rn = null, zn = 0, Bn = null, F = l & 96 ? null : e, In = null, Fe(e.ctx), Nn = !1, Wn = ++Un, e.ac !== null && (Xe(() => {
		e.ac.abort(le);
	}), e.ac = null);
	try {
		e.f |= ee;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = M?.is_fork;
		if (Rn !== null) {
			var m;
			if (p || Zn(e, zn), f !== null && zn > 0) for (f.length = zn + Rn.length, m = 0; m < Rn.length; m++) f[zn + m] = Rn[m];
			else e.deps = f = Rn;
			if (sn() && e.f & 512) for (m = zn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && zn < f.length && (Zn(e, zn), f.length = zn);
		if (Re() && Bn !== null && !Nn && f !== null && !(e.f & 6146)) for (m = 0; m < Bn.length; m++) Jn(Bn[m], e);
		if (i !== null && i !== e) {
			if (Un++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Un;
			if (t !== null) for (let e of t) e.rv = Un;
			Bn !== null && (r === null ? r = Bn : r.push(...Bn));
		}
		return e.f & 8388608 && (e.f ^= ne), d;
	} catch (e) {
		return He(e);
	} finally {
		e.f ^= ee, Rn = t, zn = n, Bn = r, F = i, In = a, Fe(o), Nn = s, Wn = c;
	}
}
function Xn(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Rn === null || !n.call(Rn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== E && Ge(s), s.ac !== null && Xe(() => {
			s.ac.abort(le), s.ac = null, A(s, h);
		}), ft(s), Zn(s, 0);
	}
}
function Zn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Xn(e, n[r]);
}
function Qn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		A(e, m);
		var n = I, r = An;
		I = e, An = !(t & 96);
		try {
			t & 16777232 ? bn(e) : yn(e), vn(e);
			var i = Yn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Hn;
		} finally {
			An = r, I = n;
		}
	}
}
function L(e) {
	var t = !!(e.f & 2);
	if (kn?.add(e), F !== null && !Nn && !(I !== null && I.f & 16384) && (In === null || !In.has(e))) {
		var r = F.deps;
		if (F.f & 2097152) e.rv < Un && (e.rv = Un, Rn === null && r !== null && r[zn] === e ? zn++ : Rn === null ? Rn = [e] : Rn.push(e));
		else {
			F.deps ??= [], n.call(F.deps, e) || F.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [F] : n.call(i, F) || i.push(F);
		}
	}
	if (jn && Mt.has(e)) return Mt.get(e);
	if (t) {
		var a = e;
		if (jn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || er(a)) && (o = ut(a)), Mt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Nn && F !== null && (An || !!(F.f & 512)), c = (a.f & y) === 0;
		qn(a) && (s && (a.f |= 512), dt(a)), s && !c && (pt(a), $n(a));
	}
	if (gt?.has(e)) return gt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function $n(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (pt(t), $n(t));
}
function er(e) {
	if (e.v === E) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Mt.has(t) || t.f & 2 && er(t)) return !0;
	return !1;
}
function tr(e) {
	var t = Nn;
	try {
		return Nn = !0, e();
	} finally {
		Nn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var nr = ["touchstart", "touchmove"];
function rr(e) {
	return nr.includes(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var ir = Symbol("events"), ar = /* @__PURE__ */ new Set(), or = /* @__PURE__ */ new Set();
function sr(e, t, n) {
	(t[ir] ??= {})[e] = n;
}
function cr(e) {
	for (var t = 0; t < e.length; t++) ar.add(e[t]);
	for (var n of or) n(e);
}
var lr = null;
function ur(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	lr = e;
	var s = 0, c = lr === e && e[ir];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[ir] = t;
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
		var d = F, f = I;
		Pn(null), Fn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[ir]?.[r];
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
			e[ir] = t, delete e.currentTarget, Pn(d), Fn(f);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/reconciler.js
var dr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function fr(e) {
	return dr?.createHTML(e) ?? e;
}
function pr(e) {
	var t = tn("template");
	return t.innerHTML = fr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function mr(e, t) {
	var n = I;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function R(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (D) return mr(O, null), O;
		i === void 0 && (i = pr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Yt(i)));
		var t = r || Wt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Yt(t), s = t.lastChild;
			mr(o, s);
		} else mr(t, t);
		return t;
	};
}
function hr() {
	if (D) return mr(O, null), O;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = Jt();
	return e.append(t, n), mr(t, n), e;
}
function z(e, t) {
	if (D) {
		var n = I;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = O), De();
		return;
	}
	e !== null && e.before(t);
}
function gr(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function _r(e, t) {
	return yr(e, t);
}
var vr = /* @__PURE__ */ new Map();
function yr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	qt();
	var l = void 0, u = dn(() => {
		var s = n ?? t.appendChild(Jt());
		$e(s, { pending: () => {} }, (t) => {
			Ie({});
			var n = Pe;
			if (o && (n.c = o), a && (i.$$events = a), D && mr(t, null), l = e(t, i) || {}, D && (I.nodes.end = O, O === null || O.nodeType !== 8 || O.data !== "]")) throw Ce(), xe;
			Le();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = rr(r);
					for (let e of [t, document]) {
						var a = vr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), vr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, ur, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(ar)), or.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = vr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, ur), r.delete(e), r.size === 0 && vr.delete(n)) : r.set(e, i);
			}
			or.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return br.set(l, u), l;
}
var br = /* @__PURE__ */ new WeakMap();
function xr(e, t) {
	let n = br.get(e);
	return n ? (br.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Sr = class {
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
			if (n) En(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (En(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (xn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						On(r, t), t.append(Jt()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else xn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), wn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (xn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = M, r = en();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = Jt();
				i.append(a), this.#n.set(e, {
					effect: _n(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, _n(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else D && (this.anchor = O), this.#a(n);
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/if.js
function Cr(e, t, n = !1) {
	var r;
	D && (r = O, De());
	var i = new Sr(e), a = n ? x : 0;
	function o(e, t) {
		if (D) {
			var n = Ae(r);
			if (e !== parseInt(n.substring(1))) {
				var a = ke();
				Ee(a), i.anchor = a, Te(!1), i.ensure(e, t), Te(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	hn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function wr(e, t) {
	return t;
}
function Tr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		wn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Er(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			$t(d), d.append(u), e.items.clear();
		}
		Er(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Er(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= w, On(a, document.createDocumentFragment())) : xn(t[i], n);
	}
}
var Dr;
function Or(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = D ? Ee(/* @__PURE__ */ Yt(u)) : u.appendChild(Jt());
	}
	D && De();
	var d = null, f = /* @__PURE__ */ ct(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Ar(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Mr(d, null, c)) : En(d) : wn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: hn(() => {
			p = L(f);
			var e = p.length;
			let t = !1;
			D && Ae(c) === "[!" != (e === 0) && (c = ke(), Ee(c), Te(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = M, v = en(), y = 0; y < e; y += 1) {
				D && O.nodeType === 8 && O.data === "]" && (c = O, t = !0, Te(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Rt(S.v, b), S.i && Rt(S.i, y), v && u.unskip_effect(S.e)) : (S = jr(l, h ? c : Dr ??= Jt(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = _n(() => s(c)) : (d = _n(() => s(Dr ??= Jt())), d.f |= w)), e > r.size && de("", "", ""), D && e > 0 && Ee(ke()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Te(!0), L(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, D && (c = O);
}
function kr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Ar(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = kr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (En(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Mr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Nr(e, d, _), Nr(e, _, y), Mr(_, y, n), d = _, p = [], m = [], l = kr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Mr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Nr(e, S.prev, C.next), Nr(e, d, S), Nr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Mr(_, l, n), Nr(e, _.prev, _.next), Nr(e, _, d === null ? e.effect.first : d.next), Nr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = kr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = kr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Er(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = kr(l.next);
		var ee = T.length;
		if (ee > 0) {
			var te = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < ee; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < ee; v += 1) T[v].nodes?.a?.fix();
			}
			Tr(e, T, te);
		}
	}
	o && Ve(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function jr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Pt(n) : /* @__PURE__ */ It(n, !1, !1) : null, l = o & 2 ? Pt(i) : null;
	return {
		v: c,
		i: l,
		e: _n(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Mr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Xt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Nr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function Pr(e, t, ...n) {
	var r = new Sr(e);
	hn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, x);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function Fr(e, t) {
	var n = void 0, r;
	gn(() => {
		n !== (n = t()) && (r &&= (xn(r), null), n && (r = _n(() => {
			fn(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var Ir = [..." 	\n\r\f\xA0\v﻿"];
function Lr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Ir.includes(r[o - 1])) && (s === r.length || Ir.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Rr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function zr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Br(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(zr)), i && c.push(...Object.keys(i).map(zr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = zr(e.substring(l, u).trim());
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
		return r && (n += Rr(r)), i && (n += Rr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function Vr(e, t, n, r, i, a) {
	var o = e[oe];
	if (D || o !== n || o === void 0) {
		var s = Lr(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[oe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/style.js
function Hr(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function B(e, t, n, r) {
	var i = e[se];
	if (D || i !== t) {
		var a = Br(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[se] = t;
	} else r && (Array.isArray(r) ? (Hr(e, n?.[0], r[0]), Hr(e, n?.[1], r[1], "important")) : Hr(e, n, r));
	return r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ur(e, t) {
	return e === t || e?.[re] === t;
}
function Wr(e = {}, t, n, r) {
	var i = Pe.r, a = I;
	return fn(() => {
		var o, s;
		return mn(() => {
			o = s, s = r?.() || [], tr(() => {
				Ur(n(...s), e) || (t(e, ...s), o && Ur(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Ur(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/props.js
function Gr(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ at(r), L(u)) : (l && (l = !1, c = s ? tr(r) : r), c);
	let f;
	if (o) {
		var p = re in e || ie in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = Ye(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ge(t), f(m)));
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
	var v = !1, y = (n & 1 ? at : ct)(() => (v = !1, g()));
	o && L(y);
	var b = I;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? L(y) : i && o ? Ht(e) : e;
			return Lt(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return jn && v || b.f & 16384 ? y.v : L(y);
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
var Qr = new Map(qr.map((e, t) => [e.background.toLowerCase(), t]));
function $r(e) {
	return Qr.get(e.trim().toLowerCase()) ?? null;
}
function ei(e, t = qr) {
	let n = e.name ? Xr(e.name) : "", r = $r(e.color || (n ? Zr(n)[0] : ""));
	if (r == null || t.length === 0) {
		if (n) {
			let [t, r] = Zr(n);
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
function ti(e, t = qr) {
	if (t.length === 0) return /* @__PURE__ */ new Map();
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Xr(t.name), r = $r(t.color || Zr(e)[0]);
		r != null && (n.has(e) || n.set(e, {
			name: e,
			slot: r,
			hash: Yr(e)
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
function ni(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function ri(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function ii(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function ai(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function oi(e, t) {
	return ai(e, t * 7);
}
function si(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function ci(e, t) {
	return e.getTime() < t.getTime();
}
function li(e) {
	return ri(ii(ni(e)));
}
function ui(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region packages/core/src/engine/calendar.ts
var di = class {
	normalizeTermStartDate(e, t) {
		let n = ni(li(t));
		if (!e || !e.trim()) return ri(ii(n));
		try {
			return ri(ii(ni(e)));
		} catch {
			return ri(ii(this.inferTermStartDateFromTermName(e) || n));
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
		}, r = ni(this.normalizeTermStartDate(n.termStartDate, e)), i = ni(e);
		if (ci(i, r)) return n.startWeek;
		let a = si(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return ri(oi(ni(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return ri(ai(ni(this.resolveWeekStart(e, t, r)), n - 1));
	}
}, fi = {
	termStartDate: "",
	startWeek: 1,
	endWeek: 20,
	periodTimes: []
};
function pi(e) {
	let [, t, n] = e.split("-");
	return `${Number(t)}/${Number(n)}`;
}
function mi(e, t, n, r, i = new di()) {
	let a = e ?? fi, o = i.resolveWeekStart(a, t, n), s = 5;
	r?.showSunday ? s = 7 : r?.showSaturday && (s = 6);
	let c = ai(ni(o), s - 1);
	return `${pi(o)} - ${pi(ri(c))}`;
}
//#endregion
//#region packages/core/src/engine/slot-key.ts
function hi(e, t, n) {
	return `${e}:${t}:${n}`;
}
function gi(e) {
	return hi(e.dayOfWeek, e.startPeriod, e.endPeriod);
}
//#endregion
//#region packages/core/src/engine/grid.ts
function _i(e) {
	let t = [
		1,
		2,
		3,
		4,
		5
	];
	return e.viewPrefs.showSaturday && t.push(6), e.viewPrefs.showSunday && t.push(7), t;
}
function vi(e) {
	let t = e[0] ? Number(e[0].slice(5, 7)) : 0, n = e[e.length - 1] ? Number(e[e.length - 1].slice(5, 7)) : 0;
	return t ? t === n ? String(t) : `${t}/${n}` : "";
}
function yi(e, t, n = []) {
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
function bi(e, t, n, r) {
	let i = r?.academicCalendarService ?? new di(), a = _i(n), o = ni(i.resolveWeekStart(n.academicConfig, t, e)), s = a.map((t) => {
		let n = ri(ai(o, t - 1));
		return {
			dayOfWeek: t,
			date: n,
			isToday: n === e
		};
	}), c = Math.max(10, n.academicConfig.periodTimes.length, ...n.courses.map((e) => e.endPeriod), 0);
	return {
		monthLabel: vi(s.map((e) => e.date)),
		visibleDays: s,
		periods: yi(n.academicConfig.periodTimes, c, r?.defaultPeriods),
		displayedPeriodCount: c
	};
}
//#endregion
//#region packages/core/src/engine/display-models.ts
function xi(e, t) {
	return e.nextWeek === t.nextWeek ? e.originalIndex < t.originalIndex : e.nextWeek < t.nextWeek;
}
function Si(e, t, n) {
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
	let a = new Set(r.map((e) => gi(e.course))), o = /* @__PURE__ */ new Map();
	for (let { course: e, originalIndex: t } of i) {
		let r = Infinity;
		for (let t of e.weeks) t >= n && t < r && (r = t);
		if (!Number.isFinite(r)) continue;
		let i = gi(e);
		if (a.has(i)) continue;
		let s = {
			course: e,
			nextWeek: r,
			originalIndex: t
		}, c = o.get(i);
		(!c || xi(s, c)) && o.set(i, s);
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
var Ci = "非本周", wi = 70, Ti = 2, Ei = 1, Di = 1, Oi = 12, ki = 8, Ai = 8, ji = 1.25, Mi = 2, Ni = [
	[50, 12],
	[70, 14],
	[85, 15],
	[110, 17]
], Pi = [
	[50, 8],
	[70, 10],
	[85, 11],
	[110, 12]
], Fi = [
	[50, 8],
	[70, 9],
	[85, 10],
	[110, 12]
];
function Ii(e) {
	let { courseDisplayModels: t, visibleDays: n, columnWidthPx: r, expandedSlotKeys: i, layoutMode: a = "fixed", coursePalette: o = qr, paletteCourses: s, capsuleCornerStyle: c = "rounded" } = e, l = a === "compact", u = n.length;
	if (u === 0) return [];
	let d = ti(s ?? t.map((e) => e.course), o), f = new Map(n.map((e, t) => [e.dayOfWeek, t])), p = 100 / u, m = [];
	for (let e of Yi(t)) {
		let t = hi(e.dayOfWeek, e.startPeriod, e.endPeriod), n = e.courses.length, a = (f.get(e.dayOfWeek) ?? 0) * p;
		if (n === 1) {
			let n = e.courses[0];
			m.push(Li({
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
			let i = Ji(r, 1, l);
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
				corners: Ri
			});
			continue;
		}
		let s = p / n;
		e.courses.forEach((e, i) => {
			m.push(Li({
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
	return c === "pill" ? Hi(m) : c === "sharp" && Bi(m), m;
}
function Li(e) {
	let { displayModel: t, columnLeft: n, widthPercent: r, columnWidthPx: i, overlapCount: a, coursePalette: o, paletteByName: s, compact: c, key: l } = e, u = t.course, d = Ki(i, a), f = Zi(u.location, { includeCampus: d }), p = Ji(i, a, c), m = qi(p.detailPx, d, f.length);
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
		colors: $i(u, o, s),
		scale: p,
		locationLines: f,
		locationMetrics: m,
		teacher: u.teacher.trim(),
		badgeLabel: t.isInDisplayedWeek ? null : Ci,
		overlapCount: a,
		corners: Ri
	};
}
var Ri = {
	topLeft: !0,
	topRight: !0,
	bottomLeft: !0,
	bottomRight: !0
}, zi = {
	topLeft: !1,
	topRight: !1,
	bottomLeft: !1,
	bottomRight: !1
};
function Bi(e) {
	for (let t of e) t.corners = zi;
}
var Vi = .001;
function Hi(e) {
	let t = e.length;
	if (t <= 1) {
		t === 1 && (e[0].corners = Ri);
		return;
	}
	for (let n = 0; n < t; n += 1) {
		let r = e[n], { leftPercent: i, widthPercent: a, startPeriod: o, endPeriod: s } = r.geometry, c = i + a, l = !0, u = !0, d = !0, f = !0;
		for (let r = 0; r < t; r += 1) {
			if (n === r) continue;
			let { leftPercent: t, widthPercent: a, startPeriod: p, endPeriod: m } = e[r].geometry, h = t + a;
			if (!(h < i - Vi || t > c + Vi) && (Ui(i, c, t, h) && (m + 1 === o && (l = !1), p === s + 1 && (u = !1)), Wi(o, s, p, m) && (Gi(h, i) && (d = !1), Gi(c, t) && (f = !1)), !l && !u && !d && !f)) break;
		}
		r.corners = {
			topLeft: l && d,
			topRight: l && f,
			bottomLeft: u && d,
			bottomRight: u && f
		};
	}
}
function Ui(e, t, n, r) {
	return Math.max(e, n) < Math.min(t, r) - Vi;
}
function Wi(e, t, n, r) {
	return e <= r && n <= t;
}
function Gi(e, t) {
	return Math.abs(e - t) < Vi;
}
function Ki(e, t = 1) {
	return Math.max(0, e) / Math.max(1, t) >= wi;
}
function qi(e, t, n) {
	let r = t ? Math.min(Math.max(n, 1), 3) : 3;
	return {
		fontPx: ra(t ? e : e + Mi),
		heightPx: r * e * ji
	};
}
function Ji(e, t = 1, n = !1) {
	let r = Math.max(0, e) / Math.max(1, t), i = ra(na(r, Ni)), a = ra(na(r, Pi)), o = ra(na(r, Fi));
	n && (i = Math.max(Oi, ra(i - Ti)), a = Math.max(ki, ra(a - Ei)), o = Math.max(Ai, ra(o - Di)));
	let s = ra(Math.max(11, i - 1));
	return {
		titlePx: i,
		detailPx: a,
		badgePx: o,
		placeholderPx: s
	};
}
function Yi(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.course.dayOfWeek, r = t.get(e);
		r ? r.push(n) : t.set(e, [n]);
	}
	return [...t.entries()].sort(([e], [t]) => e - t).flatMap(([, e]) => ea(e));
}
function Xi(e) {
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
function Zi(e, t) {
	let { campus: n, building: r, room: i } = Xi(e);
	return (t?.includeCampus === !1 ? [r, i] : [
		n,
		r,
		i
	]).filter((e) => e.length > 0);
}
function Qi(e) {
	let t = e.trim();
	return /^#[0-9A-Fa-f]{6}$/.test(t) ? t : "#EADDFF";
}
function $i(e, t, n) {
	let r = n.get(Xr(e.name)) ?? ei(e, t);
	return {
		background: Qi(r.background),
		text: Qi(r.foreground)
	};
}
function ea(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e.course.startPeriod - t.course.startPeriod || e.course.endPeriod - t.course.endPeriod || e.course.name.localeCompare(t.course.name)), n = [], r = [], i = 0;
	for (let e of t) {
		let t = e.course;
		r.length === 0 || t.startPeriod <= i ? (r.push(e), i = Math.max(i, t.endPeriod)) : (n.push(ta(r, i)), r = [e], i = t.endPeriod);
	}
	return r.length > 0 && n.push(ta(r, i)), n;
}
function ta(e, t) {
	let n = e[0];
	return {
		dayOfWeek: n.course.dayOfWeek,
		startPeriod: n.course.startPeriod,
		endPeriod: t,
		courses: e
	};
}
function na(e, t) {
	let n = t[0], r = t[t.length - 1];
	if (e <= n[0]) return n[1];
	if (e >= r[0]) return r[1];
	for (let n = 1; n < t.length; n += 1) {
		let [r, i] = t[n - 1], [a, o] = t[n];
		if (e <= a) return i + (e - r) / (a - r) * (o - i);
	}
	return r[1];
}
function ra(e) {
	return Math.round(e * 10) / 10;
}
//#endregion
//#region packages/core/src/engine/timetable-layout.ts
function ia(e) {
	let { timetable: t, displayedWeek: n, todayIso: r, columnWidthPx: i = 0, expandedSlotKeys: a = /* @__PURE__ */ new Set(), layoutMode: o = "fixed", capsuleCornerStyle: s = "rounded", coursePalette: c = qr, paletteCourses: l, academicCalendarService: u = new di() } = e, d = u.calculateAcademicWeek(r, t.academicConfig), f = n === d, p = bi(r, n, t, { academicCalendarService: u }), m = Si(t, new Set(p.visibleDays.map((e) => e.dayOfWeek)), n);
	return {
		gridModel: p,
		courseDisplayModels: m,
		placements: Ii({
			courseDisplayModels: m,
			visibleDays: p.visibleDays,
			columnWidthPx: i,
			expandedSlotKeys: a,
			layoutMode: o,
			capsuleCornerStyle: s,
			coursePalette: c,
			paletteCourses: l
		}),
		weekRangeText: mi(t.academicConfig, n, r, t.viewPrefs, u),
		isCurrentWeek: f,
		academicWeek: d
	};
}
//#endregion
//#region packages/core/src/engine/period-clock.ts
function aa(e) {
	let t = /^(\d{1,2}):(\d{2})$/.exec(e.trim());
	return t ? Number(t[1]) * 60 + Number(t[2]) : 0;
}
function oa(e) {
	return e.map((e) => ({
		index: e.index,
		startMinutes: aa(e.startTime),
		endMinutes: aa(e.endTime)
	})).sort((e, t) => e.index - t.index);
}
function sa(e) {
	return e.getHours() * 60 + e.getMinutes();
}
function ca(e, t, n = "upcomingOrLast") {
	let r = null;
	for (let n of e) {
		if (t >= n.startMinutes && t <= n.endMinutes) return n.index;
		r == null && t < n.startMinutes && (r = n.index);
	}
	return n === "none" ? null : r ?? e.at(-1)?.index ?? null;
}
//#endregion
//#region packages/core/src/schema/schema.ts
function la(e) {
	return e;
}
//#endregion
//#region packages/core/src/types/services.ts
function ua(e) {
	return { key: e };
}
var da = ua("storage"), fa = "tool-wallpaper", pa = "wallpaper_image";
function ma(e) {
	let t = "";
	for (let n = 0; n < e.length; n += 1) t += String.fromCharCode(e[n]);
	return btoa(t);
}
function ha(e) {
	return `data:${e.mimeType || "image/jpeg"};base64,${e.base64}`;
}
async function ga(e) {
	let t = await e.arrayBuffer();
	return {
		mimeType: e.type || "image/jpeg",
		base64: ma(new Uint8Array(t))
	};
}
async function _a(e, t = fa) {
	let n = await e.getPluginData(t, pa);
	return n?.base64 ? ha(n) : null;
}
async function va(e, t, n = fa) {
	let r = await ga(t);
	return await e.setPluginData(n, pa, r), ha(r);
}
async function ya(e, t = fa) {
	await e.deletePluginData(t, pa);
}
//#endregion
//#region packages/plugins/wallpaper/src/runtime.svelte.ts
var ba = null, xa = /* @__PURE__ */ Ft(null), Sa = null, Ca = /* @__PURE__ */ new Set();
function wa(e) {
	Lt(xa, e, !0);
	for (let t of Ca) try {
		t(e);
	} catch (e) {
		console.error("[WallpaperRuntime] listener error:", e);
	}
	Sa?.(e);
}
function Ta(e) {
	Sa = e, e && e(L(xa));
}
function Ea() {
	return {
		get uri() {
			return L(xa);
		},
		get hasWallpaper() {
			return !!L(xa);
		},
		async syncFromStorage(e) {
			if (!e || !ba) {
				wa(null);
				return;
			}
			wa(await _a(ba, fa));
		},
		async setWallpaper(e) {
			if (ba) {
				if (!e) {
					await ya(ba, fa), wa(null);
					return;
				}
				wa(await va(ba, e, fa));
			}
		}
	};
}
function Da(e) {
	ba = e;
}
function Oa() {
	ba = null, Sa = null, wa(null);
}
//#endregion
//#region packages/plugins/wallpaper/src/create-wallpaper-plugin.ts
var ka = "wallpaper", Aa = la({ wallpaper: {
	type: "wallpaper-preview",
	title: () => "选择壁纸图片",
	description: () => "支持 PNG、JPG、WebP 格式图片，自动提取并应用主题色彩",
	accept: "image/*",
	required: !1
} }), ja = {
	id: ka,
	name: () => "壁纸",
	description: () => "从当前壁纸提取配色",
	supportsDynamicColor: !0,
	getTokens: (e) => ({
		surface: e === "dark" ? "#1e2026" : "#f9f9fe",
		onSurface: e === "dark" ? "#f8fafc" : "#2e333a",
		primary: "#0068b7",
		onPrimary: "#ffffff",
		surfaceVariant: e === "dark" ? "#24262e" : "#eceef5",
		outline: e === "dark" ? "#334155" : "#aeb2bb"
	})
};
async function Ma(e) {
	let t = e.wallpaper, n = Ea();
	if (t instanceof Uint8Array) {
		await n.setWallpaper(new Blob([t]));
		return;
	}
	t === null && await n.setWallpaper(null);
}
function Na(e = {}) {
	let { screenComponent: t } = e;
	return {
		id: fa,
		name: () => "自定义壁纸",
		version: "1.0.0",
		description: () => "自定义课表页壁纸，支持动态取色",
		category: "tool",
		order: 40,
		author: "Chronos Community",
		homepage: "https://github.com/CQUT-OpenProject/Chronos",
		configSchema: Aa,
		defaultConfig: {},
		async apply(e) {
			Da(e.service(da)), Ta((t) => {
				e.emit("wallpaper:changed", { uri: t });
			}), e.on("wallpaper:set", async ({ blob: e }) => {
				await Ea().setWallpaper(e);
			}), e.on("wallpaper:hydrate", () => {
				e.emit("wallpaper:changed", { uri: Ea().uri });
			}), e.on("config:changed", async ({ pluginId: e, config: t }) => {
				e === "tool-wallpaper" && await Ma(t);
			}), await Ea().syncFromStorage(!0), e.registerSlot("mine.item", {
				id: "wallpaper",
				sectionId: "appearance-feedback",
				title: () => "设置课表壁纸",
				href: "/plugins/tool-wallpaper",
				icon: "wallpaper",
				iconTone: "primary",
				keywords: [
					"壁纸",
					"背景",
					"图片",
					"自定义",
					"封面"
				],
				order: 30
			}), e.registerSlot("shell.route.screen", {
				id: fa,
				title: () => "设置课表壁纸",
				...t ? { component: t } : {},
				schema: Aa
			}), e.registerSlot("theme.definition", ja);
		},
		async dispose() {
			Ta(null), Oa();
		}
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/math_utils.js
function Pa(e) {
	return e < 0 ? -1 : e === 0 ? 0 : 1;
}
function Fa(e, t, n) {
	return (1 - n) * e + n * t;
}
function Ia(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function V(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function La(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function Ra(e, t) {
	return [
		e[0] * t[0][0] + e[1] * t[0][1] + e[2] * t[0][2],
		e[0] * t[1][0] + e[1] * t[1][1] + e[2] * t[1][2],
		e[0] * t[2][0] + e[1] * t[2][1] + e[2] * t[2][2]
	];
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/color_utils.js
var za = [
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
], Ba = [
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
], Va = [
	95.047,
	100,
	108.883
];
function Ha(e, t, n) {
	return (255 << 24 | (e & 255) << 16 | (t & 255) << 8 | n & 255) >>> 0;
}
function Ua(e) {
	return Ha(eo(e[0]), eo(e[1]), eo(e[2]));
}
function Wa(e) {
	return e >> 16 & 255;
}
function Ga(e) {
	return e >> 8 & 255;
}
function Ka(e) {
	return e & 255;
}
function qa(e, t, n) {
	let r = Ba, i = r[0][0] * e + r[0][1] * t + r[0][2] * n, a = r[1][0] * e + r[1][1] * t + r[1][2] * n, o = r[2][0] * e + r[2][1] * t + r[2][2] * n;
	return Ha(eo(i), eo(a), eo(o));
}
function Ja(e) {
	return Ra([
		$a(Wa(e)),
		$a(Ga(e)),
		$a(Ka(e))
	], za);
}
function Ya(e) {
	let t = eo(Za(e));
	return Ha(t, t, t);
}
function Xa(e) {
	let t = Ja(e)[1];
	return 116 * no(t / 100) - 16;
}
function Za(e) {
	return 100 * ro((e + 16) / 116);
}
function Qa(e) {
	return no(e / 100) * 116 - 16;
}
function $a(e) {
	let t = e / 255;
	return t <= .040449936 ? t / 12.92 * 100 : ((t + .055) / 1.055) ** 2.4 * 100;
}
function eo(e) {
	let t = e / 100, n = 0;
	return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, Ia(0, 255, Math.round(n * 255));
}
function to() {
	return Va;
}
function no(e) {
	return e > .008856451679035631 ? e ** (1 / 3) : (903.2962962962963 * e + 16) / 116;
}
function ro(e) {
	let t = e * e * e;
	return t > .008856451679035631 ? t : (116 * e - 16) / 903.2962962962963;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/viewing_conditions.js
var io = class e {
	static make(t = to(), n = 200 / Math.PI * Za(50) / 100, r = 50, i = 2, a = !1) {
		let o = t, s = o[0] * .401288 + o[1] * .650173 + o[2] * -.051461, c = o[0] * -.250268 + o[1] * 1.204414 + o[2] * .045854, l = o[0] * -.002079 + o[1] * .048952 + o[2] * .953127, u = .8 + i / 10, d = u >= .9 ? Fa(.59, .69, (u - .9) * 10) : Fa(.525, .59, (u - .8) * 10), f = a ? 1 : u * (1 - 1 / 3.6 * Math.exp((-n - 42) / 92));
		f = f > 1 ? 1 : f < 0 ? 0 : f;
		let p = u, m = [
			100 / s * f + 1 - f,
			100 / c * f + 1 - f,
			100 / l * f + 1 - f
		], h = 1 / (5 * n + 1), g = h * h * h * h, _ = 1 - g, v = g * n + .1 * _ * _ * Math.cbrt(5 * n), y = Za(r) / t[1], b = 1.48 + Math.sqrt(y), x = .725 / y ** .2, S = x, C = [
			(v * m[0] * s / 100) ** .42,
			(v * m[1] * c / 100) ** .42,
			(v * m[2] * l / 100) ** .42
		], w = [
			400 * C[0] / (C[0] + 27.13),
			400 * C[1] / (C[1] + 27.13),
			400 * C[2] / (C[2] + 27.13)
		], T = (2 * w[0] + w[1] + .05 * w[2]) * x;
		return new e(y, T, x, S, d, p, m, v, v ** .25, b);
	}
	constructor(e, t, n, r, i, a, o, s, c, l) {
		this.n = e, this.aw = t, this.nbb = n, this.ncb = r, this.c = i, this.nc = a, this.rgbD = o, this.fl = s, this.fLRoot = c, this.z = l;
	}
};
io.DEFAULT = io.make();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/cam16.js
var ao = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.hue = e, this.chroma = t, this.j = n, this.q = r, this.m = i, this.s = a, this.jstar = o, this.astar = s, this.bstar = c;
	}
	distance(e) {
		let t = this.jstar - e.jstar, n = this.astar - e.astar, r = this.bstar - e.bstar;
		return 1.41 * Math.sqrt(t * t + n * n + r * r) ** .63;
	}
	static fromInt(t) {
		return e.fromIntInViewingConditions(t, io.DEFAULT);
	}
	static fromIntInViewingConditions(t, n) {
		let r = (t & 16711680) >> 16, i = (t & 65280) >> 8, a = t & 255, o = $a(r), s = $a(i), c = $a(a), l = .41233895 * o + .35762064 * s + .18051042 * c, u = .2126 * o + .7152 * s + .0722 * c, d = .01932141 * o + .11916382 * s + .95034478 * c, f = .401288 * l + .650173 * u - .051461 * d, p = -.250268 * l + 1.204414 * u + .045854 * d, m = -.002079 * l + .048952 * u + .953127 * d, h = n.rgbD[0] * f, g = n.rgbD[1] * p, _ = n.rgbD[2] * m, v = (n.fl * Math.abs(h) / 100) ** .42, y = (n.fl * Math.abs(g) / 100) ** .42, b = (n.fl * Math.abs(_) / 100) ** .42, x = Pa(h) * 400 * v / (v + 27.13), S = Pa(g) * 400 * y / (y + 27.13), C = Pa(_) * 400 * b / (b + 27.13), w = (11 * x + -12 * S + C) / 11, T = (x + S - 2 * C) / 9, ee = (20 * x + 20 * S + 21 * C) / 20, te = (40 * x + 20 * S + C) / 20, ne = La(Math.atan2(T, w) * 180 / Math.PI), re = ne * Math.PI / 180, ie = 100 * (te * n.nbb / n.aw) ** +(n.c * n.z), ae = 4 / n.c * Math.sqrt(ie / 100) * (n.aw + 4) * n.fLRoot, oe = ne < 20.14 ? ne + 360 : ne, se = (5e4 / 13 * (.25 * (Math.cos(oe * Math.PI / 180 + 2) + 3.8)) * n.nc * n.ncb * Math.sqrt(w * w + T * T) / (ee + .305)) ** .9 * (1.64 - .29 ** n.n) ** .73, ce = se * Math.sqrt(ie / 100), le = ce * n.fLRoot, ue = 50 * Math.sqrt(se * n.c / (n.aw + 4)), de = (1 + 100 * .007) * ie / (1 + .007 * ie), fe = 1 / .0228 * Math.log(1 + .0228 * le), pe = fe * Math.cos(re), me = fe * Math.sin(re);
		return new e(ne, ce, ie, ae, le, ue, de, pe, me);
	}
	static fromJch(t, n, r) {
		return e.fromJchInViewingConditions(t, n, r, io.DEFAULT);
	}
	static fromJchInViewingConditions(t, n, r, i) {
		let a = 4 / i.c * Math.sqrt(t / 100) * (i.aw + 4) * i.fLRoot, o = n * i.fLRoot, s = n / Math.sqrt(t / 100), c = 50 * Math.sqrt(s * i.c / (i.aw + 4)), l = r * Math.PI / 180, u = (1 + 100 * .007) * t / (1 + .007 * t), d = 1 / .0228 * Math.log(1 + .0228 * o), f = d * Math.cos(l), p = d * Math.sin(l);
		return new e(r, n, t, a, o, c, u, f, p);
	}
	static fromUcs(t, n, r) {
		return e.fromUcsInViewingConditions(t, n, r, io.DEFAULT);
	}
	static fromUcsInViewingConditions(t, n, r, i) {
		let a = n, o = r, s = Math.sqrt(a * a + o * o), c = (Math.exp(s * .0228) - 1) / .0228 / i.fLRoot, l = 180 / Math.PI * Math.atan2(o, a);
		l < 0 && (l += 360);
		let u = t / (1 - (t - 100) * .007);
		return e.fromJchInViewingConditions(u, c, l, i);
	}
	toInt() {
		return this.viewed(io.DEFAULT);
	}
	viewed(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = Pa(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = Pa(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = Pa(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return qa(1.86206786 * x - 1.01125463 * S + .14918677 * C, .38752654 * x + .62144744 * S - .00897398 * C, -.0158415 * x - .03412294 * S + 1.04996444 * C);
	}
	static fromXyzInViewingConditions(t, n, r, i) {
		let a = .401288 * t + .650173 * n - .051461 * r, o = -.250268 * t + 1.204414 * n + .045854 * r, s = -.002079 * t + .048952 * n + .953127 * r, c = i.rgbD[0] * a, l = i.rgbD[1] * o, u = i.rgbD[2] * s, d = (i.fl * Math.abs(c) / 100) ** .42, f = (i.fl * Math.abs(l) / 100) ** .42, p = (i.fl * Math.abs(u) / 100) ** .42, m = Pa(c) * 400 * d / (d + 27.13), h = Pa(l) * 400 * f / (f + 27.13), g = Pa(u) * 400 * p / (p + 27.13), _ = (11 * m + -12 * h + g) / 11, v = (m + h - 2 * g) / 9, y = (20 * m + 20 * h + 21 * g) / 20, b = (40 * m + 20 * h + g) / 20, x = Math.atan2(v, _) * 180 / Math.PI, S = x < 0 ? x + 360 : x >= 360 ? x - 360 : x, C = S * Math.PI / 180, w = 100 * (b * i.nbb / i.aw) ** +(i.c * i.z), T = 4 / i.c * Math.sqrt(w / 100) * (i.aw + 4) * i.fLRoot, ee = S < 20.14 ? S + 360 : S, te = (5e4 / 13 * (1 / 4 * (Math.cos(ee * Math.PI / 180 + 2) + 3.8)) * i.nc * i.ncb * Math.sqrt(_ * _ + v * v) / (y + .305)) ** .9 * (1.64 - .29 ** i.n) ** .73, ne = te * Math.sqrt(w / 100), re = ne * i.fLRoot, ie = 50 * Math.sqrt(te * i.c / (i.aw + 4)), ae = (1 + 100 * .007) * w / (1 + .007 * w), oe = Math.log(1 + .0228 * re) / .0228, se = oe * Math.cos(C), ce = oe * Math.sin(C);
		return new e(S, ne, w, T, re, ie, ae, se, ce);
	}
	xyzInViewingConditions(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = Pa(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = Pa(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = Pa(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return [
			1.86206786 * x - 1.01125463 * S + .14918677 * C,
			.38752654 * x + .62144744 * S - .00897398 * C,
			-.0158415 * x - .03412294 * S + 1.04996444 * C
		];
	}
}, oo = class e {
	static sanitizeRadians(e) {
		return (e + Math.PI * 8) % (Math.PI * 2);
	}
	static trueDelinearized(e) {
		let t = e / 100, n = 0;
		return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, n * 255;
	}
	static chromaticAdaptation(e) {
		let t = Math.abs(e) ** .42;
		return Pa(e) * 400 * t / (t + 27.13);
	}
	static hueOf(t) {
		let n = Ra(t, e.SCALED_DISCOUNT_FROM_LINRGB), r = e.chromaticAdaptation(n[0]), i = e.chromaticAdaptation(n[1]), a = e.chromaticAdaptation(n[2]), o = (11 * r + -12 * i + a) / 11, s = (r + i - 2 * a) / 9;
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
		return Pa(e) * n ** (1 / .42);
	}
	static findResultByJ(t, n, r) {
		let i = Math.sqrt(r) * 11, a = io.DEFAULT, o = 1 / (1.64 - .29 ** a.n) ** .73, s = .25 * (Math.cos(t + 2) + 3.8) * (5e4 / 13) * a.nc * a.ncb, c = Math.sin(t), l = Math.cos(t);
		for (let t = 0; t < 5; t++) {
			let u = i / 100, d = ((n === 0 || i === 0 ? 0 : n / Math.sqrt(u)) * o) ** (1 / .9), f = a.aw * u ** (1 / a.c / a.z) / a.nbb, p = 23 * (f + .305) * d / (23 * s + 11 * d * l + 108 * d * c), m = p * l, h = p * c, g = (460 * f + 451 * m + 288 * h) / 1403, _ = (460 * f - 891 * m - 261 * h) / 1403, v = (460 * f - 220 * m - 6300 * h) / 1403, y = Ra([
				e.inverseChromaticAdaptation(g),
				e.inverseChromaticAdaptation(_),
				e.inverseChromaticAdaptation(v)
			], e.LINRGB_FROM_SCALED_DISCOUNT);
			if (y[0] < 0 || y[1] < 0 || y[2] < 0) return 0;
			let b = e.Y_FROM_LINRGB[0], x = e.Y_FROM_LINRGB[1], S = e.Y_FROM_LINRGB[2], C = b * y[0] + x * y[1] + S * y[2];
			if (C <= 0) return 0;
			if (t === 4 || Math.abs(C - r) < .002) return y[0] > 100.01 || y[1] > 100.01 || y[2] > 100.01 ? 0 : Ua(y);
			i -= (C - r) * i / (2 * C);
		}
		return 0;
	}
	static solveToInt(t, n, r) {
		if (n < 1e-4 || r < 1e-4 || r > 99.9999) return Ya(r);
		t = La(t);
		let i = t / 180 * Math.PI, a = Za(r), o = e.findResultByJ(i, n, a);
		return o === 0 ? Ua(e.bisectToLimit(a, i)) : o;
	}
	static solveToCam(t, n, r) {
		return ao.fromInt(e.solveToInt(t, n, r));
	}
};
oo.SCALED_DISCOUNT_FROM_LINRGB = [
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
], oo.LINRGB_FROM_SCALED_DISCOUNT = [
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
], oo.Y_FROM_LINRGB = [
	.2126,
	.7152,
	.0722
], oo.CRITICAL_PLANES = [
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
var H = class e {
	static from(t, n, r) {
		return new e(oo.solveToInt(t, n, r));
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
		this.setInternalState(oo.solveToInt(e, this.internalChroma, this.internalTone));
	}
	get chroma() {
		return this.internalChroma;
	}
	set chroma(e) {
		this.setInternalState(oo.solveToInt(this.internalHue, e, this.internalTone));
	}
	get tone() {
		return this.internalTone;
	}
	set tone(e) {
		this.setInternalState(oo.solveToInt(this.internalHue, this.internalChroma, e));
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
		let t = ao.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = Xa(e), this.argb = e;
	}
	setInternalState(e) {
		let t = ao.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = Xa(e), this.argb = e;
	}
	inViewingConditions(t) {
		let n = ao.fromInt(this.toInt()).xyzInViewingConditions(t), r = ao.fromXyzInViewingConditions(n[0], n[1], n[2], io.make());
		return e.from(r.hue, r.chroma, Qa(n[1]));
	}
}, U = class e {
	static ratioOfTones(t, n) {
		return t = V(0, 100, t), n = V(0, 100, n), e.ratioOfYs(Za(t), Za(n));
	}
	static ratioOfYs(e, t) {
		let n = e > t ? e : t, r = n === t ? e : t;
		return (n + 5) / (r + 5);
	}
	static lighter(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = Za(t), i = n * (r + 5) - 5, a = e.ratioOfYs(i, r), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = Qa(i) + .4;
		return s < 0 || s > 100 ? -1 : s;
	}
	static darker(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = Za(t), i = (r + 5) / n - 5, a = e.ratioOfYs(r, i), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = Qa(i) - .4;
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
}, so = class e {
	static isDisliked(e) {
		let t = Math.round(e.hue) >= 90 && Math.round(e.hue) <= 111, n = Math.round(e.chroma) > 16, r = Math.round(e.tone) < 65;
		return t && n && r;
	}
	static fixIfDisliked(t) {
		return e.isDisliked(t) ? H.from(t.hue, t.chroma, 70) : t;
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/dynamic_color.js
function co(e, t, n) {
	if (e.name !== n.name) throw Error(`Attempting to extend color ${e.name} with color ${n.name} of different name for spec version ${t}.`);
	if (e.isBackground !== n.isBackground) throw Error(`Attempting to extend color ${e.name} as a ${e.isBackground ? "background" : "foreground"} with color ${n.name} as a ${n.isBackground ? "background" : "foreground"} for spec version ${t}.`);
}
function W(e, t, n) {
	return co(e, t, n), G.fromPalette({
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
var G = class e {
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
		let n = mo(e.specVersion).getHct(e, this);
		return this.hctCache.size > 4 && this.hctCache.clear(), this.hctCache.set(e, n), n;
	}
	getTone(e) {
		return mo(e.specVersion).getTone(e, this);
	}
	static foregroundTone(t, n) {
		let r = U.lighterUnsafe(t, n), i = U.darkerUnsafe(t, n), a = U.ratioOfTones(r, t), o = U.ratioOfTones(i, t);
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
}, lo = class {
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
					U.ratioOfTones(t, m) < o && (m = G.foregroundTone(t, o)), U.ratioOfTones(t, h) < s && (h = G.foregroundTone(t, s)), n && (m = G.foregroundTone(t, o), h = G.foregroundTone(t, s));
				}
			}
			return (h - m) * p < o && (h = V(0, 100, m + o * p), (h - m) * p >= o || (m = V(0, 100, h - o * p))), 50 <= m && m < 60 ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : 50 <= h && h < 60 && (c ? p > 0 ? (m = 60, h = Math.max(h, m + o * p)) : (m = 49, h = Math.min(h, m + o * p)) : h = p > 0 ? 60 : 49), f ? m : h;
		}
		{
			let r = t.tone(e);
			if (t.background == null || t.background(e) === void 0 || t.contrastCurve == null || t.contrastCurve(e) === void 0) return r;
			let i = t.background(e).getTone(e), a = t.contrastCurve(e).get(e.contrastLevel);
			if (U.ratioOfTones(i, r) >= a || (r = G.foregroundTone(i, a)), n && (r = G.foregroundTone(i, a)), t.isBackground && 50 <= r && r < 60 && (r = U.ratioOfTones(49, i) >= a ? 49 : 60), t.secondBackground == null || t.secondBackground(e) === void 0) return r;
			let [o, s] = [t.background, t.secondBackground], [c, l] = [o(e).getTone(e), s(e).getTone(e)], [u, d] = [Math.max(c, l), Math.min(c, l)];
			if (U.ratioOfTones(u, r) >= a && U.ratioOfTones(d, r) >= a) return r;
			let f = U.lighter(u, a), p = U.darker(d, a), m = [];
			return f !== -1 && m.push(f), p !== -1 && m.push(p), G.tonePrefersLightForeground(c) || G.tonePrefersLightForeground(l) ? f < 0 ? 100 : f : m.length === 1 ? m[0] : p < 0 ? 0 : p;
		}
	}
}, uo = class {
	getHct(e, t) {
		let n = t.palette(e), r = t.getTone(e), i = n.hue, a = n.chroma * (t.chromaMultiplier ? t.chromaMultiplier(e) : 1);
		return H.from(i, a, r);
	}
	getTone(e, t) {
		let n = t.toneDeltaPair ? t.toneDeltaPair(e) : void 0;
		if (n) {
			let r = n.roleA, i = n.roleB, a = n.polarity, o = n.constraint, s = a === "darker" || a === "relative_lighter" && e.isDark || a === "relative_darker" && !e.isDark ? -n.delta : n.delta, c = t.name === r.name, l = c ? r : i, u = c ? i : r, d = l.tone(e), f = u.getTone(e), p = s * (c ? 1 : -1);
			if (o === "exact" ? d = V(0, 100, f + p) : o === "nearer" ? d = p > 0 ? V(0, 100, V(f, f + p, d)) : V(0, 100, V(f + p, f, d)) : o === "farther" && (d = p > 0 ? V(f + p, 100, d) : V(0, f + p, d)), t.background && t.contrastCurve) {
				let n = t.background(e), r = t.contrastCurve(e);
				if (n && r) {
					let t = n.getTone(e), i = r.get(e.contrastLevel);
					d = U.ratioOfTones(t, d) >= i && e.contrastLevel >= 0 ? d : G.foregroundTone(t, i);
				}
			}
			return t.isBackground && !t.name.endsWith("_fixed_dim") && (d = d >= 57 ? V(65, 100, d) : V(0, 49, d)), d;
		}
		{
			let n = t.tone(e);
			if (t.background == null || t.background(e) === void 0 || t.contrastCurve == null || t.contrastCurve(e) === void 0) return n;
			let r = t.background(e).getTone(e), i = t.contrastCurve(e).get(e.contrastLevel);
			if (n = U.ratioOfTones(r, n) >= i && e.contrastLevel >= 0 ? n : G.foregroundTone(r, i), t.isBackground && !t.name.endsWith("_fixed_dim") && (n = n >= 57 ? V(65, 100, n) : V(0, 49, n)), t.secondBackground == null || t.secondBackground(e) === void 0) return n;
			let [a, o] = [t.background, t.secondBackground], [s, c] = [a(e).getTone(e), o(e).getTone(e)], [l, u] = [Math.max(s, c), Math.min(s, c)];
			if (U.ratioOfTones(l, n) >= i && U.ratioOfTones(u, n) >= i) return n;
			let d = U.lighter(l, i), f = U.darker(u, i), p = [];
			return d !== -1 && p.push(d), f !== -1 && p.push(f), G.tonePrefersLightForeground(s) || G.tonePrefersLightForeground(c) ? d < 0 ? 100 : d : p.length === 1 ? p[0] : f < 0 ? 0 : f;
		}
	}
}, fo = new lo(), po = new uo();
function mo(e) {
	return e === "2021" ? fo : po;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/contrast_curve.js
var K = class {
	constructor(e, t, n, r) {
		this.low = e, this.normal = t, this.medium = n, this.high = r;
	}
	get(e) {
		return e <= -1 ? this.low : e < 0 ? Fa(this.low, this.normal, (e - -1) / 1) : e < .5 ? Fa(this.normal, this.medium, (e - 0) / .5) : e < 1 ? Fa(this.medium, this.high, (e - .5) / .5) : this.high;
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
function ho(e) {
	return e.variant === J.FIDELITY || e.variant === J.CONTENT;
}
function Y(e) {
	return e.variant === J.MONOCHROME;
}
function go(e, t, n, r) {
	let i = n, a = H.from(e, t, n);
	if (a.chroma < t) {
		let n = a.chroma;
		for (; a.chroma < t;) {
			i += r ? -1 : 1;
			let o = H.from(e, t, i);
			if (n > o.chroma || Math.abs(o.chroma - t) < .4) break;
			Math.abs(o.chroma - t) < Math.abs(a.chroma - t) && (a = o), n = Math.max(n, o.chroma);
		}
	}
	return i;
}
var _o = class {
	primaryPaletteKeyColor() {
		return G.fromPalette({
			name: "primary_palette_key_color",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.primaryPalette.keyColor.tone
		});
	}
	secondaryPaletteKeyColor() {
		return G.fromPalette({
			name: "secondary_palette_key_color",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.secondaryPalette.keyColor.tone
		});
	}
	tertiaryPaletteKeyColor() {
		return G.fromPalette({
			name: "tertiary_palette_key_color",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.tertiaryPalette.keyColor.tone
		});
	}
	neutralPaletteKeyColor() {
		return G.fromPalette({
			name: "neutral_palette_key_color",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.neutralPalette.keyColor.tone
		});
	}
	neutralVariantPaletteKeyColor() {
		return G.fromPalette({
			name: "neutral_variant_palette_key_color",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.neutralVariantPalette.keyColor.tone
		});
	}
	errorPaletteKeyColor() {
		return G.fromPalette({
			name: "error_palette_key_color",
			palette: (e) => e.errorPalette,
			tone: (e) => e.errorPalette.keyColor.tone
		});
	}
	background() {
		return G.fromPalette({
			name: "background",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : 98,
			isBackground: !0
		});
	}
	onBackground() {
		return G.fromPalette({
			name: "on_background",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 10,
			background: (e) => this.background(),
			contrastCurve: (e) => new K(3, 3, 4.5, 7)
		});
	}
	surface() {
		return G.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : 98,
			isBackground: !0
		});
	}
	surfaceDim() {
		return G.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 6 : new K(87, 87, 80, 75).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceBright() {
		return G.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(24, 24, 29, 34).get(e.contrastLevel) : 98,
			isBackground: !0
		});
	}
	surfaceContainerLowest() {
		return G.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(4, 4, 2, 0).get(e.contrastLevel) : 100,
			isBackground: !0
		});
	}
	surfaceContainerLow() {
		return G.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(10, 10, 11, 12).get(e.contrastLevel) : new K(96, 96, 96, 95).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainer() {
		return G.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(12, 12, 16, 20).get(e.contrastLevel) : new K(94, 94, 92, 90).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainerHigh() {
		return G.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(17, 17, 21, 25).get(e.contrastLevel) : new K(92, 92, 88, 85).get(e.contrastLevel),
			isBackground: !0
		});
	}
	surfaceContainerHighest() {
		return G.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? new K(22, 22, 26, 30).get(e.contrastLevel) : new K(90, 90, 84, 80).get(e.contrastLevel),
			isBackground: !0
		});
	}
	onSurface() {
		return G.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 10,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	surfaceVariant() {
		return G.fromPalette({
			name: "surface_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 30 : 90,
			isBackground: !0
		});
	}
	onSurfaceVariant() {
		return G.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 80 : 30,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	inverseSurface() {
		return G.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 90 : 20,
			isBackground: !0
		});
	}
	inverseOnSurface() {
		return G.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 20 : 95,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	outline() {
		return G.fromPalette({
			name: "outline",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 60 : 50,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1.5, 3, 4.5, 7)
		});
	}
	outlineVariant() {
		return G.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralVariantPalette,
			tone: (e) => e.isDark ? 30 : 80,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5)
		});
	}
	shadow() {
		return G.fromPalette({
			name: "shadow",
			palette: (e) => e.neutralPalette,
			tone: (e) => 0
		});
	}
	scrim() {
		return G.fromPalette({
			name: "scrim",
			palette: (e) => e.neutralPalette,
			tone: (e) => 0
		});
	}
	surfaceTint() {
		return G.fromPalette({
			name: "surface_tint",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.isDark ? 80 : 40,
			isBackground: !0
		});
	}
	primary() {
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 10 : 90 : e.isDark ? 20 : 100,
			background: (e) => this.primary(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	primaryContainer() {
		return G.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => ho(e) ? e.sourceColorHct.tone : Y(e) ? e.isDark ? 85 : 25 : e.isDark ? 30 : 90,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.primaryContainer(), this.primary(), 10, "nearer", !1)
		});
	}
	onPrimaryContainer() {
		return G.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => ho(e) ? G.foregroundTone(this.primaryContainer().tone(e), 4.5) : Y(e) ? e.isDark ? 0 : 100 : e.isDark ? 90 : 30,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	inversePrimary() {
		return G.fromPalette({
			name: "inverse_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.isDark ? 40 : 80,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => new K(3, 4.5, 7, 7)
		});
	}
	secondary() {
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 10 : 100 : e.isDark ? 20 : 100,
			background: (e) => this.secondary(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	secondaryContainer() {
		return G.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => {
				let t = e.isDark ? 30 : 90;
				return Y(e) ? e.isDark ? 30 : 85 : ho(e) ? go(e.secondaryPalette.hue, e.secondaryPalette.chroma, t, !e.isDark) : t;
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.secondaryContainer(), this.secondary(), 10, "nearer", !1)
		});
	}
	onSecondaryContainer() {
		return G.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 90 : 10 : ho(e) ? G.foregroundTone(this.secondaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	tertiary() {
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 10 : 90 : e.isDark ? 20 : 100,
			background: (e) => this.tertiary(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	tertiaryContainer() {
		return G.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				if (Y(e)) return e.isDark ? 60 : 49;
				if (!ho(e)) return e.isDark ? 30 : 90;
				let t = e.tertiaryPalette.getHct(e.sourceColorHct.tone);
				return so.fixIfDisliked(t).tone;
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => new K(1, 1, 3, 4.5),
			toneDeltaPair: (e) => new q(this.tertiaryContainer(), this.tertiary(), 10, "nearer", !1)
		});
	}
	onTertiaryContainer() {
		return G.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? e.isDark ? 0 : 100 : ho(e) ? G.foregroundTone(this.tertiaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	error() {
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? 20 : 100,
			background: (e) => this.error(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	errorContainer() {
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => Y(e) ? e.isDark ? 90 : 10 : e.isDark ? 90 : 30,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	primaryFixed() {
		return G.fromPalette({
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
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? 100 : 10,
			background: (e) => this.primaryFixedDim(),
			secondBackground: (e) => this.primaryFixed(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	onPrimaryFixedVariant() {
		return G.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			tone: (e) => Y(e) ? 90 : 30,
			background: (e) => this.primaryFixedDim(),
			secondBackground: (e) => this.primaryFixed(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	secondaryFixed() {
		return G.fromPalette({
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
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			tone: (e) => 10,
			background: (e) => this.secondaryFixedDim(),
			secondBackground: (e) => this.secondaryFixed(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	onSecondaryFixedVariant() {
		return G.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			tone: (e) => Y(e) ? 25 : 30,
			background: (e) => this.secondaryFixedDim(),
			secondBackground: (e) => this.secondaryFixed(),
			contrastCurve: (e) => new K(3, 4.5, 7, 11)
		});
	}
	tertiaryFixed() {
		return G.fromPalette({
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
		return G.fromPalette({
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
		return G.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => Y(e) ? 100 : 10,
			background: (e) => this.tertiaryFixedDim(),
			secondBackground: (e) => this.tertiaryFixed(),
			contrastCurve: (e) => new K(4.5, 7, 11, 21)
		});
	}
	onTertiaryFixedVariant() {
		return G.fromPalette({
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
	return V(t, n, yo(e.hue, e.chroma * r, 100, !0));
}
function vo(e, t = 0, n = 100) {
	return V(t, n, yo(e.hue, e.chroma, 0, !1));
}
function yo(e, t, n, r) {
	let i = n, a = H.from(e, t, i);
	for (; a.chroma < t && !(n < 0 || n > 100);) {
		n += r ? -1 : 1;
		let o = H.from(e, t, n);
		a.chroma < o.chroma && (a = o, i = n);
	}
	return i;
}
function Z(e) {
	return e === 1.5 ? new K(1.5, 1.5, 3, 5.5) : e === 3 ? new K(3, 3, 4.5, 7) : e === 4.5 ? new K(4.5, 4.5, 7, 11) : e === 6 ? new K(6, 6, 7, 11) : e === 7 ? new K(7, 7, 11, 21) : e === 9 ? new K(9, 9, 11, 21) : e === 11 ? new K(11, 11, 21, 21) : e === 21 ? new K(21, 21, 21, 21) : new K(e, e, 7, 21);
}
var bo = class extends _o {
	surface() {
		let e = G.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => (super.surface().tone(e), e.platform === "phone" ? e.isDark ? 4 : H.isYellow(e.neutralPalette.hue) ? 99 : e.variant === J.VIBRANT ? 97 : 98 : 0),
			isBackground: !0
		});
		return W(super.surface(), "2025", e);
	}
	surfaceDim() {
		let e = G.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 4 : H.isYellow(e.neutralPalette.hue) ? 90 : e.variant === J.VIBRANT ? 85 : 87,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (!e.isDark) {
					if (e.variant === J.NEUTRAL) return 2.5;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? 2.7 : 1.75;
					if (e.variant === J.VIBRANT) return 1.36;
				}
				return 1;
			}
		});
		return W(super.surfaceDim(), "2025", e);
	}
	surfaceBright() {
		let e = G.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 18 : H.isYellow(e.neutralPalette.hue) ? 99 : e.variant === J.VIBRANT ? 97 : 98,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.isDark) {
					if (e.variant === J.NEUTRAL) return 2.5;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? 2.7 : 1.75;
					if (e.variant === J.VIBRANT) return 1.36;
				}
				return 1;
			}
		});
		return W(super.surfaceBright(), "2025", e);
	}
	surfaceContainerLowest() {
		let e = G.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 0 : 100,
			isBackground: !0
		});
		return W(super.surfaceContainerLowest(), "2025", e);
	}
	surfaceContainerLow() {
		let e = G.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 6 : H.isYellow(e.neutralPalette.hue) ? 98 : e.variant === J.VIBRANT ? 95 : 96 : 15,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 1.3;
					if (e.variant === J.TONAL_SPOT) return 1.25;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? 1.3 : 1.15;
					if (e.variant === J.VIBRANT) return 1.08;
				}
				return 1;
			}
		});
		return W(super.surfaceContainerLow(), "2025", e);
	}
	surfaceContainer() {
		let e = G.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 9 : H.isYellow(e.neutralPalette.hue) ? 96 : e.variant === J.VIBRANT ? 92 : 94 : 20,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 1.6;
					if (e.variant === J.TONAL_SPOT) return 1.4;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? 1.6 : 1.3;
					if (e.variant === J.VIBRANT) return 1.15;
				}
				return 1;
			}
		});
		return W(super.surfaceContainer(), "2025", e);
	}
	surfaceContainerHigh() {
		let e = G.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? 12 : H.isYellow(e.neutralPalette.hue) ? 94 : e.variant === J.VIBRANT ? 90 : 92 : 25,
			isBackground: !0,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 1.9;
					if (e.variant === J.TONAL_SPOT) return 1.5;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? 1.95 : 1.45;
					if (e.variant === J.VIBRANT) return 1.22;
				}
				return 1;
			}
		});
		return W(super.surfaceContainerHigh(), "2025", e);
	}
	surfaceContainerHighest() {
		let e = G.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 15 : H.isYellow(e.neutralPalette.hue) ? 92 : e.variant === J.VIBRANT ? 88 : 90,
			isBackground: !0,
			chromaMultiplier: (e) => e.variant === J.NEUTRAL ? 2.2 : e.variant === J.TONAL_SPOT ? 1.7 : e.variant === J.EXPRESSIVE ? H.isYellow(e.neutralPalette.hue) ? 2.3 : 1.6 : e.variant === J.VIBRANT ? 1.29 : 1
		});
		return W(super.surfaceContainerHighest(), "2025", e);
	}
	onSurface() {
		let e = G.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.VIBRANT ? X(e.neutralPalette, 0, 100, 1.1) : G.getInitialToneFromBackground((e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh())(e),
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.isDark && e.platform === "phone" ? Z(11) : Z(9)
		});
		return W(super.onSurface(), "2025", e);
	}
	onSurfaceVariant() {
		let e = G.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? e.isDark ? Z(6) : Z(4.5) : Z(7)
		});
		return W(super.onSurfaceVariant(), "2025", e);
	}
	outline() {
		let e = G.fromPalette({
			name: "outline",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(3) : Z(4.5)
		});
		return W(super.outline(), "2025", e);
	}
	outlineVariant() {
		let e = G.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => {
				if (e.platform === "phone") {
					if (e.variant === J.NEUTRAL) return 2.2;
					if (e.variant === J.TONAL_SPOT) return 1.7;
					if (e.variant === J.EXPRESSIVE) return H.isYellow(e.neutralPalette.hue) ? e.isDark ? 3 : 2.3 : 1.6;
				}
				return 1;
			},
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(1.5) : Z(3)
		});
		return W(super.outlineVariant(), "2025", e);
	}
	inverseSurface() {
		let e = G.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 98 : 4,
			isBackground: !0
		});
		return W(super.inverseSurface(), "2025", e);
	}
	inverseOnSurface() {
		let e = G.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => Z(7)
		});
		return W(super.inverseOnSurface(), "2025", e);
	}
	primary() {
		let e = G.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.variant === J.NEUTRAL ? e.platform === "phone" ? e.isDark ? 80 : 40 : 90 : e.variant === J.TONAL_SPOT ? e.platform === "phone" ? e.isDark ? 80 : X(e.primaryPalette) : X(e.primaryPalette, 0, 90) : e.variant === J.EXPRESSIVE ? e.platform === "phone" ? X(e.primaryPalette, 0, H.isYellow(e.primaryPalette.hue) ? 25 : H.isCyan(e.primaryPalette.hue) ? 88 : 98) : X(e.primaryPalette) : e.platform === "phone" ? X(e.primaryPalette, 0, H.isCyan(e.primaryPalette.hue) ? 88 : 98) : X(e.primaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.primaryContainer(), this.primary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.primary(), "2025", e);
	}
	primaryDim() {
		return G.fromPalette({
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
		let e = G.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			background: (e) => e.platform === "phone" ? this.primary() : this.primaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.onPrimary(), "2025", e);
	}
	primaryContainer() {
		let e = G.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.variant === J.NEUTRAL ? e.isDark ? 30 : 90 : e.variant === J.TONAL_SPOT ? e.isDark ? vo(e.primaryPalette, 35, 93) : X(e.primaryPalette, 0, 90) : e.variant === J.EXPRESSIVE ? e.isDark ? X(e.primaryPalette, 30, 93) : X(e.primaryPalette, 78, H.isCyan(e.primaryPalette.hue) ? 88 : 90) : e.isDark ? vo(e.primaryPalette, 66, 93) : X(e.primaryPalette, 66, H.isCyan(e.primaryPalette.hue) ? 88 : 93),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "phone" ? void 0 : new q(this.primaryContainer(), this.primaryDim(), 10, "darker", !0, "farther"),
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return W(super.primaryContainer(), "2025", e);
	}
	onPrimaryContainer() {
		let e = G.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.onPrimaryContainer(), "2025", e);
	}
	primaryFixed() {
		let e = G.fromPalette({
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
		return W(super.primaryFixed(), "2025", e);
	}
	primaryFixedDim() {
		let e = G.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => this.primaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new q(this.primaryFixedDim(), this.primaryFixed(), 5, "darker", !0, "exact")
		});
		return W(super.primaryFixedDim(), "2025", e);
	}
	onPrimaryFixed() {
		let e = G.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixedDim(),
			contrastCurve: (e) => Z(7)
		});
		return W(super.onPrimaryFixed(), "2025", e);
	}
	onPrimaryFixedVariant() {
		let e = G.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixedDim(),
			contrastCurve: (e) => Z(4.5)
		});
		return W(super.onPrimaryFixedVariant(), "2025", e);
	}
	inversePrimary() {
		let e = G.fromPalette({
			name: "inverse_primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => X(e.primaryPalette),
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.inversePrimary(), "2025", e);
	}
	secondary() {
		let e = G.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === J.NEUTRAL ? 90 : X(e.secondaryPalette, 0, 90) : e.variant === J.NEUTRAL ? e.isDark ? vo(e.secondaryPalette, 0, 98) : X(e.secondaryPalette) : e.variant === J.VIBRANT ? X(e.secondaryPalette, 0, e.isDark ? 90 : 98) : e.isDark ? 80 : X(e.secondaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.secondaryContainer(), this.secondary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.secondary(), "2025", e);
	}
	secondaryDim() {
		return G.fromPalette({
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
		let e = G.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			background: (e) => e.platform === "phone" ? this.secondary() : this.secondaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.onSecondary(), "2025", e);
	}
	secondaryContainer() {
		let e = G.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.variant === J.VIBRANT ? e.isDark ? vo(e.secondaryPalette, 30, 40) : X(e.secondaryPalette, 84, 90) : e.variant === J.EXPRESSIVE ? e.isDark ? 15 : X(e.secondaryPalette, 90, 95) : e.isDark ? 25 : 90,
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new q(this.secondaryContainer(), this.secondaryDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return W(super.secondaryContainer(), "2025", e);
	}
	onSecondaryContainer() {
		let e = G.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.onSecondaryContainer(), "2025", e);
	}
	secondaryFixed() {
		let e = G.fromPalette({
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
		return W(super.secondaryFixed(), "2025", e);
	}
	secondaryFixedDim() {
		let e = G.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => this.secondaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new q(this.secondaryFixedDim(), this.secondaryFixed(), 5, "darker", !0, "exact")
		});
		return W(super.secondaryFixedDim(), "2025", e);
	}
	onSecondaryFixed() {
		let e = G.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixedDim(),
			contrastCurve: (e) => Z(7)
		});
		return W(super.onSecondaryFixed(), "2025", e);
	}
	onSecondaryFixedVariant() {
		let e = G.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixedDim(),
			contrastCurve: (e) => Z(4.5)
		});
		return W(super.onSecondaryFixedVariant(), "2025", e);
	}
	tertiary() {
		let e = G.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === J.TONAL_SPOT ? X(e.tertiaryPalette, 0, 90) : X(e.tertiaryPalette) : e.variant === J.EXPRESSIVE || e.variant === J.VIBRANT ? X(e.tertiaryPalette, 0, H.isCyan(e.tertiaryPalette.hue) ? 88 : e.isDark ? 98 : 100) : e.isDark ? X(e.tertiaryPalette, 0, 98) : X(e.tertiaryPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.tertiaryContainer(), this.tertiary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.tertiary(), "2025", e);
	}
	tertiaryDim() {
		return G.fromPalette({
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
		let e = G.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			background: (e) => e.platform === "phone" ? this.tertiary() : this.tertiaryDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.onTertiary(), "2025", e);
	}
	tertiaryContainer() {
		let e = G.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.platform === "watch" ? e.variant === J.TONAL_SPOT ? X(e.tertiaryPalette, 0, 90) : X(e.tertiaryPalette) : e.variant === J.NEUTRAL ? e.isDark ? X(e.tertiaryPalette, 0, 93) : X(e.tertiaryPalette, 0, 96) : e.variant === J.TONAL_SPOT ? X(e.tertiaryPalette, 0, e.isDark ? 93 : 100) : e.variant === J.EXPRESSIVE ? X(e.tertiaryPalette, 75, H.isCyan(e.tertiaryPalette.hue) ? 88 : e.isDark ? 93 : 100) : e.isDark ? X(e.tertiaryPalette, 0, 93) : X(e.tertiaryPalette, 72, 100),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new q(this.tertiaryContainer(), this.tertiaryDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return W(super.tertiaryContainer(), "2025", e);
	}
	onTertiaryContainer() {
		let e = G.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.onTertiaryContainer(), "2025", e);
	}
	tertiaryFixed() {
		let e = G.fromPalette({
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
		return W(super.tertiaryFixed(), "2025", e);
	}
	tertiaryFixedDim() {
		let e = G.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => this.tertiaryFixed().getTone(e),
			isBackground: !0,
			toneDeltaPair: (e) => new q(this.tertiaryFixedDim(), this.tertiaryFixed(), 5, "darker", !0, "exact")
		});
		return W(super.tertiaryFixedDim(), "2025", e);
	}
	onTertiaryFixed() {
		let e = G.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixedDim(),
			contrastCurve: (e) => Z(7)
		});
		return W(super.onTertiaryFixed(), "2025", e);
	}
	onTertiaryFixedVariant() {
		let e = G.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixedDim(),
			contrastCurve: (e) => Z(4.5)
		});
		return W(super.onTertiaryFixedVariant(), "2025", e);
	}
	error() {
		let e = G.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => e.platform === "phone" ? e.isDark ? vo(e.errorPalette, 0, 98) : X(e.errorPalette) : vo(e.errorPalette),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : this.surfaceContainerHigh(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.errorContainer(), this.error(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.error(), "2025", e);
	}
	errorDim() {
		return G.fromPalette({
			name: "error_dim",
			palette: (e) => e.errorPalette,
			tone: (e) => vo(e.errorPalette),
			isBackground: !0,
			background: (e) => this.surfaceContainerHigh(),
			contrastCurve: (e) => Z(4.5),
			toneDeltaPair: (e) => new q(this.errorDim(), this.error(), 5, "darker", !0, "farther")
		});
	}
	onError() {
		let e = G.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			background: (e) => e.platform === "phone" ? this.error() : this.errorDim(),
			contrastCurve: (e) => e.platform === "phone" ? Z(6) : Z(7)
		});
		return W(super.onError(), "2025", e);
	}
	errorContainer() {
		let e = G.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.platform === "watch" ? 30 : e.isDark ? vo(e.errorPalette, 30, 93) : X(e.errorPalette, 0, 90),
			isBackground: !0,
			background: (e) => e.platform === "phone" ? this.highestSurface(e) : void 0,
			toneDeltaPair: (e) => e.platform === "watch" ? new q(this.errorContainer(), this.errorDim(), 10, "darker", !0, "farther") : void 0,
			contrastCurve: (e) => e.platform === "phone" && e.contrastLevel > 0 ? Z(1.5) : void 0
		});
		return W(super.errorContainer(), "2025", e);
	}
	onErrorContainer() {
		let e = G.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => e.platform === "phone" ? Z(4.5) : Z(7)
		});
		return W(super.onErrorContainer(), "2025", e);
	}
	surfaceVariant() {
		let e = Object.assign(this.surfaceContainerHighest().clone(), { name: "surface_variant" });
		return W(super.surfaceVariant(), "2025", e);
	}
	surfaceTint() {
		let e = Object.assign(this.primary().clone(), { name: "surface_tint" });
		return W(super.surfaceTint(), "2025", e);
	}
	background() {
		let e = Object.assign(this.surface().clone(), { name: "background" });
		return W(super.background(), "2025", e);
	}
	onBackground() {
		let e = Object.assign(this.onSurface().clone(), {
			name: "on_background",
			tone: (e) => e.platform === "watch" ? 100 : this.onSurface().getTone(e)
		});
		return W(super.onBackground(), "2025", e);
	}
};
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/color_spec_2026.js
function xo(e, t = 0, n = 100, r = 1) {
	return V(t, n, Co(e.hue, e.chroma * r, 100, !0));
}
function So(e, t = 0, n = 100) {
	return V(t, n, Co(e.hue, e.chroma, 0, !1));
}
function Co(e, t, n, r) {
	let i = n, a = H.from(e, t, i);
	for (; a.chroma < t && !(n < 0 || n > 100);) {
		n += r ? -1 : 1;
		let o = H.from(e, t, n);
		a.chroma < o.chroma && (a = o, i = n);
	}
	return i;
}
function Q(e) {
	return e === 1.5 ? new K(1.5, 1.5, 3, 5.5) : e === 3 ? new K(3, 3, 4.5, 7) : e === 4.5 ? new K(4.5, 4.5, 7, 11) : e === 6 ? new K(6, 6, 7, 11) : e === 7 ? new K(7, 7, 11, 21) : e === 9 ? new K(9, 9, 11, 21) : e === 11 ? new K(11, 11, 21, 21) : e === 21 ? new K(21, 21, 21, 21) : new K(e, e, 7, 21);
}
var wo = class extends bo {
	surface() {
		let e = G.fromPalette({
			name: "surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 4 : 98 : 0,
			isBackground: !0
		});
		return W(super.surface(), "2026", e);
	}
	surfaceDim() {
		let e = G.fromPalette({
			name: "surface_dim",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 4 : 87 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? e.isDark ? 1 : 1.7 : 0,
			isBackground: !0
		});
		return W(super.surfaceDim(), "2026", e);
	}
	surfaceBright() {
		let e = G.fromPalette({
			name: "surface_bright",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 18 : 98 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? e.isDark ? 1.7 : 1 : 0,
			isBackground: !0
		});
		return W(super.surfaceBright(), "2026", e);
	}
	surfaceContainerLowest() {
		let e = G.fromPalette({
			name: "surface_container_lowest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 0 : 100 : 0,
			isBackground: !0
		});
		return W(super.surfaceContainerLowest(), "2026", e);
	}
	surfaceContainerLow() {
		let e = G.fromPalette({
			name: "surface_container_low",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 6 : 96 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.25 : 0,
			isBackground: !0
		});
		return W(super.surfaceContainerLow(), "2026", e);
	}
	surfaceContainer() {
		let e = G.fromPalette({
			name: "surface_container",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 9 : 94 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.4 : 0,
			isBackground: !0
		});
		return W(super.surfaceContainer(), "2026", e);
	}
	surfaceContainerHigh() {
		let e = G.fromPalette({
			name: "surface_container_high",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 12 : 92 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.5 : 0,
			isBackground: !0
		});
		return W(super.surfaceContainerHigh(), "2026", e);
	}
	surfaceContainerHighest() {
		let e = G.fromPalette({
			name: "surface_container_highest",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.variant === J.CMF ? e.isDark ? 15 : 90 : 0,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			isBackground: !0
		});
		return W(super.surfaceContainerHighest(), "2026", e);
	}
	onSurface() {
		let e = G.fromPalette({
			name: "on_surface",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.isDark ? Q(11) : Q(9)
		});
		return W(super.onSurface(), "2026", e);
	}
	onSurfaceVariant() {
		let e = G.fromPalette({
			name: "on_surface_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.isDark ? Q(6) : Q(4.5)
		});
		return W(super.onSurfaceVariant(), "2026", e);
	}
	outline() {
		let e = G.fromPalette({
			name: "outline",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(3)
		});
		return W(super.outline(), "2026", e);
	}
	outlineVariant() {
		let e = G.fromPalette({
			name: "outline_variant",
			palette: (e) => e.neutralPalette,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(1.5)
		});
		return W(super.outlineVariant(), "2026", e);
	}
	inverseSurface() {
		let e = G.fromPalette({
			name: "inverse_surface",
			palette: (e) => e.neutralPalette,
			tone: (e) => e.isDark ? 98 : 4,
			chromaMultiplier: (e) => e.variant === J.CMF ? 1.7 : 0,
			isBackground: !0
		});
		return W(super.inverseSurface(), "2026", e);
	}
	inverseOnSurface() {
		let e = G.fromPalette({
			name: "inverse_on_surface",
			palette: (e) => e.neutralPalette,
			background: (e) => this.inverseSurface(),
			contrastCurve: (e) => Q(7)
		});
		return W(super.inverseOnSurface(), "2026", e);
	}
	primary() {
		let e = G.fromPalette({
			name: "primary",
			palette: (e) => e.primaryPalette,
			tone: (e) => e.sourceColorHct.chroma <= 12 ? e.isDark ? 80 : 40 : e.sourceColorHct.tone,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.primaryContainer(), this.primary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.primary(), "2026", e);
	}
	onPrimary() {
		let e = G.fromPalette({
			name: "on_primary",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primary(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onPrimary(), "2026", e);
	}
	primaryContainer() {
		let e = G.fromPalette({
			name: "primary_container",
			palette: (e) => e.primaryPalette,
			tone: (e) => !e.isDark && e.sourceColorHct.chroma <= 12 ? 90 : e.sourceColorHct.tone > 55 ? V(61, 90, e.sourceColorHct.tone) : V(30, 49, e.sourceColorHct.tone),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return W(super.primaryContainer(), "2026", e);
	}
	onPrimaryContainer() {
		let e = G.fromPalette({
			name: "on_primary_container",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryContainer(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onPrimaryContainer(), "2026", e);
	}
	primaryFixed() {
		let e = G.fromPalette({
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
		return W(super.primaryFixed(), "2026", e);
	}
	primaryFixedDim() {
		let e = G.fromPalette({
			name: "primary_fixed_dim",
			palette: (e) => e.primaryPalette,
			tone: (e) => this.primaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new q(this.primaryFixedDim(), this.primaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return W(super.primaryFixedDim(), "2026", e);
	}
	onPrimaryFixed() {
		let e = G.fromPalette({
			name: "on_primary_fixed",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixed().getTone(e) > 57 ? this.primaryFixedDim() : this.primaryFixed(),
			contrastCurve: (e) => Q(7)
		});
		return W(super.onPrimaryFixed(), "2026", e);
	}
	onPrimaryFixedVariant() {
		let e = G.fromPalette({
			name: "on_primary_fixed_variant",
			palette: (e) => e.primaryPalette,
			background: (e) => this.primaryFixed().getTone(e) > 57 ? this.primaryFixedDim() : this.primaryFixed(),
			contrastCurve: (e) => Q(4.5)
		});
		return W(super.onPrimaryFixedVariant(), "2026", e);
	}
	inversePrimary() {
		return super.inversePrimary();
	}
	secondary() {
		let e = G.fromPalette({
			name: "secondary",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? So(e.secondaryPalette) : xo(e.secondaryPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.secondaryContainer(), this.secondary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.secondary(), "2026", e);
	}
	onSecondary() {
		let e = G.fromPalette({
			name: "on_secondary",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondary(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onSecondary(), "2026", e);
	}
	secondaryContainer() {
		let e = G.fromPalette({
			name: "secondary_container",
			palette: (e) => e.secondaryPalette,
			tone: (e) => e.isDark ? So(e.secondaryPalette, 20, 49) : xo(e.secondaryPalette, 61, 90),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return W(super.secondaryContainer(), "2026", e);
	}
	onSecondaryContainer() {
		let e = G.fromPalette({
			name: "on_secondary_container",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryContainer(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onSecondaryContainer(), "2026", e);
	}
	secondaryFixed() {
		let e = G.fromPalette({
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
		return W(super.secondaryFixed(), "2026", e);
	}
	secondaryFixedDim() {
		let e = G.fromPalette({
			name: "secondary_fixed_dim",
			palette: (e) => e.secondaryPalette,
			tone: (e) => this.secondaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new q(this.secondaryFixedDim(), this.secondaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return W(super.secondaryFixedDim(), "2026", e);
	}
	onSecondaryFixed() {
		let e = G.fromPalette({
			name: "on_secondary_fixed",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixed().getTone(e) > 57 ? this.secondaryFixedDim() : this.secondaryFixed(),
			contrastCurve: (e) => Q(7)
		});
		return W(super.onSecondaryFixed(), "2026", e);
	}
	onSecondaryFixedVariant() {
		let e = G.fromPalette({
			name: "on_secondary_fixed_variant",
			palette: (e) => e.secondaryPalette,
			background: (e) => this.secondaryFixed().getTone(e) > 57 ? this.secondaryFixedDim() : this.secondaryFixed(),
			contrastCurve: (e) => Q(4.5)
		});
		return W(super.onSecondaryFixedVariant(), "2026", e);
	}
	tertiary() {
		let e = G.fromPalette({
			name: "tertiary",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => e.sourceColorHcts[1]?.tone ?? e.sourceColorHct.tone,
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.tertiaryContainer(), this.tertiary(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.tertiary(), "2026", e);
	}
	onTertiary() {
		let e = G.fromPalette({
			name: "on_tertiary",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiary(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onTertiary(), "2026", e);
	}
	tertiaryContainer() {
		let e = G.fromPalette({
			name: "tertiary_container",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => {
				let t = e.sourceColorHcts[1] ?? e.sourceColorHct;
				return t.tone > 55 ? V(61, 90, t.tone) : V(20, 49, t.tone);
			},
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return W(super.tertiaryContainer(), "2026", e);
	}
	onTertiaryContainer() {
		let e = G.fromPalette({
			name: "on_tertiary_container",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryContainer(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onTertiaryContainer(), "2026", e);
	}
	tertiaryFixed() {
		let e = G.fromPalette({
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
		return W(super.tertiaryFixed(), "2026", e);
	}
	tertiaryFixedDim() {
		let e = G.fromPalette({
			name: "tertiary_fixed_dim",
			palette: (e) => e.tertiaryPalette,
			tone: (e) => this.tertiaryFixed().getTone(e),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			toneDeltaPair: (e) => new q(this.tertiaryFixedDim(), this.tertiaryFixed(), 5, "darker", !0, "exact"),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return W(super.tertiaryFixedDim(), "2026", e);
	}
	onTertiaryFixed() {
		let e = G.fromPalette({
			name: "on_tertiary_fixed",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixed().getTone(e) > 57 ? this.tertiaryFixedDim() : this.tertiaryFixed(),
			contrastCurve: (e) => Q(7)
		});
		return W(super.onTertiaryFixed(), "2026", e);
	}
	onTertiaryFixedVariant() {
		let e = G.fromPalette({
			name: "on_tertiary_fixed_variant",
			palette: (e) => e.tertiaryPalette,
			background: (e) => this.tertiaryFixed().getTone(e) > 57 ? this.tertiaryFixedDim() : this.tertiaryFixed(),
			contrastCurve: (e) => Q(4.5)
		});
		return W(super.onTertiaryFixedVariant(), "2026", e);
	}
	error() {
		let e = G.fromPalette({
			name: "error",
			palette: (e) => e.errorPalette,
			tone: (e) => xo(e.errorPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => Q(4.5),
			toneDeltaPair: (e) => e.platform === "phone" ? new q(this.errorContainer(), this.error(), 5, "relative_lighter", !0, "farther") : void 0
		});
		return W(super.error(), "2026", e);
	}
	onError() {
		let e = G.fromPalette({
			name: "on_error",
			palette: (e) => e.errorPalette,
			background: (e) => this.error(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onError(), "2026", e);
	}
	errorContainer() {
		let e = G.fromPalette({
			name: "error_container",
			palette: (e) => e.errorPalette,
			tone: (e) => e.isDark ? So(e.errorPalette) : xo(e.errorPalette),
			isBackground: !0,
			background: (e) => this.highestSurface(e),
			contrastCurve: (e) => e.contrastLevel > 0 ? Q(1.5) : void 0
		});
		return W(super.errorContainer(), "2026", e);
	}
	onErrorContainer() {
		let e = G.fromPalette({
			name: "on_error_container",
			palette: (e) => e.errorPalette,
			background: (e) => this.errorContainer(),
			contrastCurve: (e) => Q(6)
		});
		return W(super.onErrorContainer(), "2026", e);
	}
	primaryDim() {
		let e = Object.assign(this.primary().clone(), { name: "primary_dim" });
		return W(super.primaryDim(), "2026", e);
	}
	secondaryDim() {
		let e = Object.assign(this.secondary().clone(), { name: "secondary_dim" });
		return W(super.secondaryDim(), "2026", e);
	}
	tertiaryDim() {
		let e = Object.assign(this.tertiary().clone(), { name: "tertiary_dim" });
		return W(super.tertiaryDim(), "2026", e);
	}
	errorDim() {
		let e = Object.assign(this.error().clone(), { name: "error_dim" });
		return W(super.errorDim(), "2026", e);
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
$.contentAccentToneDelta = 15, $.colorSpec = new wo(), $.primaryPaletteKeyColor = $.colorSpec.primaryPaletteKeyColor(), $.secondaryPaletteKeyColor = $.colorSpec.secondaryPaletteKeyColor(), $.tertiaryPaletteKeyColor = $.colorSpec.tertiaryPaletteKeyColor(), $.neutralPaletteKeyColor = $.colorSpec.neutralPaletteKeyColor(), $.neutralVariantPaletteKeyColor = $.colorSpec.neutralVariantPaletteKeyColor(), $.background = $.colorSpec.background(), $.onBackground = $.colorSpec.onBackground(), $.surface = $.colorSpec.surface(), $.surfaceDim = $.colorSpec.surfaceDim(), $.surfaceBright = $.colorSpec.surfaceBright(), $.surfaceContainerLowest = $.colorSpec.surfaceContainerLowest(), $.surfaceContainerLow = $.colorSpec.surfaceContainerLow(), $.surfaceContainer = $.colorSpec.surfaceContainer(), $.surfaceContainerHigh = $.colorSpec.surfaceContainerHigh(), $.surfaceContainerHighest = $.colorSpec.surfaceContainerHighest(), $.onSurface = $.colorSpec.onSurface(), $.surfaceVariant = $.colorSpec.surfaceVariant(), $.onSurfaceVariant = $.colorSpec.onSurfaceVariant(), $.inverseSurface = $.colorSpec.inverseSurface(), $.inverseOnSurface = $.colorSpec.inverseOnSurface(), $.outline = $.colorSpec.outline(), $.outlineVariant = $.colorSpec.outlineVariant(), $.shadow = $.colorSpec.shadow(), $.scrim = $.colorSpec.scrim(), $.surfaceTint = $.colorSpec.surfaceTint(), $.primary = $.colorSpec.primary(), $.onPrimary = $.colorSpec.onPrimary(), $.primaryContainer = $.colorSpec.primaryContainer(), $.onPrimaryContainer = $.colorSpec.onPrimaryContainer(), $.inversePrimary = $.colorSpec.inversePrimary(), $.secondary = $.colorSpec.secondary(), $.onSecondary = $.colorSpec.onSecondary(), $.secondaryContainer = $.colorSpec.secondaryContainer(), $.onSecondaryContainer = $.colorSpec.onSecondaryContainer(), $.tertiary = $.colorSpec.tertiary(), $.onTertiary = $.colorSpec.onTertiary(), $.tertiaryContainer = $.colorSpec.tertiaryContainer(), $.onTertiaryContainer = $.colorSpec.onTertiaryContainer(), $.error = $.colorSpec.error(), $.onError = $.colorSpec.onError(), $.errorContainer = $.colorSpec.errorContainer(), $.onErrorContainer = $.colorSpec.onErrorContainer(), $.primaryFixed = $.colorSpec.primaryFixed(), $.primaryFixedDim = $.colorSpec.primaryFixedDim(), $.onPrimaryFixed = $.colorSpec.onPrimaryFixed(), $.onPrimaryFixedVariant = $.colorSpec.onPrimaryFixedVariant(), $.secondaryFixed = $.colorSpec.secondaryFixed(), $.secondaryFixedDim = $.colorSpec.secondaryFixedDim(), $.onSecondaryFixed = $.colorSpec.onSecondaryFixed(), $.onSecondaryFixedVariant = $.colorSpec.onSecondaryFixedVariant(), $.tertiaryFixed = $.colorSpec.tertiaryFixed(), $.tertiaryFixedDim = $.colorSpec.tertiaryFixedDim(), $.onTertiaryFixed = $.colorSpec.onTertiaryFixed(), $.onTertiaryFixedVariant = $.colorSpec.onTertiaryFixedVariant();
//#endregion
//#region packages/ui-kit/src/theme/m3-theme.ts
var To = new $();
G.fromPalette({
	name: "on_on_primary",
	palette: (e) => e.primaryPalette,
	background: () => To.onPrimary(),
	contrastCurve: () => new K(6, 6, 7, 11)
});
var Eo = G.fromPalette({
	name: "primary_container_subtle",
	palette: (e) => e.primaryPalette,
	isBackground: !0,
	background: (e) => To.highestSurface(e),
	contrastCurve: () => void 0
});
G.fromPalette({
	name: "on_primary_container_subtle",
	palette: (e) => e.primaryPalette,
	background: () => Eo,
	contrastCurve: () => new K(6, 6, 7, 11)
});
var Do = G.fromPalette({
	name: "secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	isBackground: !0,
	background: (e) => To.highestSurface(e),
	contrastCurve: () => void 0
});
G.fromPalette({
	name: "on_secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	background: () => Do,
	contrastCurve: () => new K(6, 6, 7, 11)
});
var Oo = G.fromPalette({
	name: "tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	isBackground: !0,
	background: (e) => To.highestSurface(e),
	contrastCurve: () => void 0
});
G.fromPalette({
	name: "on_tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	background: () => Oo,
	contrastCurve: () => new K(6, 6, 7, 11)
});
var ko = G.fromPalette({
	name: "error_container_subtle",
	palette: (e) => e.errorPalette,
	isBackground: !0,
	background: (e) => To.highestSurface(e),
	contrastCurve: () => void 0
});
//#endregion
//#region packages/ui-kit/src/schema-form/inputs/FileField.svelte
G.fromPalette({
	name: "on_error_container_subtle",
	palette: (e) => e.errorPalette,
	background: () => ko,
	contrastCurve: () => new K(6, 6, 7, 11)
}), [
	...To.allColors.filter((e) => e.name !== "background" && e.name !== "on_background"),
	To.shadow(),
	To.scrim()
], [
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
].filter((e) => e.name !== "surface-variant"), cr(["input"]), cr(["change"]), cr(["change"]), cr(["change"]);
//#endregion
//#region packages/ui-kit/src/timetable-preview/day-labels.ts
var Ao = [
	"",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"日"
];
function jo(e) {
	return Ao[e] ?? "?";
}
//#endregion
//#region packages/ui-kit/src/utils/middle-truncate.ts
var Mo = "…", No = /[\s《》「」『』【】（）()·—\-、，,：:；;！!？?.…]/u, Po, Fo;
function Io(e) {
	if (typeof Intl < "u" && typeof Intl.Segmenter == "function") {
		Po ??= new Intl.Segmenter("und", { granularity: "grapheme" });
		let t = [];
		for (let n of Po.segment(e)) t.push(n.segment);
		return t;
	}
	return Array.from(e);
}
function Lo() {
	return typeof Intl > "u" || typeof Intl.Segmenter != "function" ? null : (Fo ??= new Intl.Segmenter("zh-CN", { granularity: "word" }), Fo);
}
function Ro(e, t) {
	let n = t.length, r = /* @__PURE__ */ new Set([0, n]), i = Lo();
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
		(No.test(n) || No.test(i)) && r.add(e);
	}
	return [...r].sort((e, t) => e - t);
}
function zo(e, t, n) {
	if (t <= 0) return {
		prefixLength: 0,
		suffixLength: 0
	};
	if (t >= e.length) return {
		prefixLength: e.length,
		suffixLength: 0
	};
	let r = Math.ceil(t / 2), i = Math.floor(t / 2), a = n ?? Ro(e.join(""), e), o = r, s = Bo(a, r);
	s != null && !(s === 0 && r > 0) && (o = s);
	let c = i, l = Vo(a, e.length - i);
	return l != null && l < e.length && (c = e.length - l), {
		prefixLength: o,
		suffixLength: c
	};
}
function Bo(e, t) {
	let n = null;
	for (let r of e) {
		if (r > t) break;
		n = r;
	}
	return n;
}
function Vo(e, t) {
	for (let n of e) if (n >= t) return n;
	return null;
}
function Ho(e, t, n, r) {
	if (t <= 0) return n;
	if (t >= e.length) return e.join("");
	let { prefixLength: i, suffixLength: a } = zo(e, t, r);
	return i <= 0 && a <= 0 ? n : `${e.slice(0, i).join("")}${n}${a > 0 ? e.slice(e.length - a).join("") : ""}`;
}
function Uo(e, t, n = Mo) {
	if (!e || t(e)) return e;
	if (!t(n)) return "";
	let r = Io(e), i = Ro(e, r), a = n, o = 0, s = r.length;
	for (; o <= s;) {
		let e = Math.floor((o + s) / 2), c = Ho(r, e, n, i);
		t(c) ? (a = c, o = e + 1) : s = e - 1;
	}
	return a;
}
var Wo = null;
function Go(e) {
	if (typeof document > "u") return () => Infinity;
	Wo ??= document.createElement("canvas");
	let t = Wo.getContext("2d");
	return t ? (t.font = e, (e) => t.measureText(e).width) : () => Infinity;
}
function Ko(e, t, n, r = 6) {
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
function qo(e) {
	let t = getComputedStyle(e), n = t.fontStyle || "normal", r = t.fontWeight || "normal", i = t.fontFamily || "sans-serif";
	return (e) => Go(`${n} ${r} ${e}px ${i}`);
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/MiddleTruncateText.svelte
var Jo = /* @__PURE__ */ R("<span></span>");
function Yo(e, t) {
	Ie(t, !0);
	let n = Gr(t, "class", 3, ""), r = /* @__PURE__ */ Ft(null);
	function i(e) {
		let n = t.text;
		if (e.clientWidth <= 0 || e.clientHeight <= 0) {
			e.textContent = n, e.removeAttribute("title");
			return;
		}
		let r = Uo(n, (t) => (e.textContent = t, e.scrollHeight <= e.clientHeight + .5));
		e.textContent = r, r === n ? e.removeAttribute("title") : e.title = n;
	}
	let a = (e) => {
		Lt(r, e, !0);
		let t = new ResizeObserver(() => {
			i(e);
		});
		return t.observe(e), () => {
			t.disconnect(), Lt(r, null);
		};
	};
	ln(() => {
		t.text, t.style, L(r) && i(L(r));
	});
	var o = Jo();
	Fr(o, () => a), P(() => {
		Vr(o, 1, `block min-w-0 overflow-hidden break-all whitespace-normal ${n() ?? ""}`), B(o, t.style);
	}), z(e, o), Le();
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetablePreviewGrid.svelte
var Xo = /* @__PURE__ */ R("<div class=\"flex min-w-0 flex-1 flex-col items-center\"><span class=\"m3-body-small text-on-surface-variant\"> </span> <div> </div></div>"), Zo = /* @__PURE__ */ R("<div class=\"flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center\"><div><span class=\"m3-body-medium font-bold\"> </span> <span> <br/> </span></div></div>"), Qo = /* @__PURE__ */ R("<button type=\"button\"><span class=\"text-on-surface-variant\"> </span></button>"), $o = /* @__PURE__ */ R("<div><span class=\"text-on-surface-variant\"> </span></div>"), es = /* @__PURE__ */ R("<span class=\"mb-0.5 flex w-full shrink-0 justify-center\"><span class=\"max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap\"> </span></span>"), ts = /* @__PURE__ */ R("<div class=\"overflow-hidden whitespace-nowrap\"> </div>"), ns = /* @__PURE__ */ R("<div class=\"mt-1.5 shrink-0 overflow-hidden leading-tight\"></div>"), rs = /* @__PURE__ */ R("<div class=\"mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap\"> </div>"), is = /* @__PURE__ */ R("<button type=\"button\"><!> <!> <!> <!></button>"), as = /* @__PURE__ */ R("<div><!> <!> <!> <!></div>"), os = /* @__PURE__ */ R("<div class=\"absolute box-border overflow-hidden\"><!></div>"), ss = /* @__PURE__ */ R("<div><div><div class=\"m3-body-small flex w-[var(--sidebar-width)] flex-col items-center text-center text-on-surface-variant\"><span> </span> <span>月</span></div> <div class=\"flex min-w-0 flex-1\"></div></div> <div role=\"region\" aria-label=\"课表预览\"><div class=\"flex\"><aside aria-label=\"节次与时间\" class=\"shrink-0\"></aside> <div class=\"relative min-w-0 flex-1\"></div></div></div></div>");
function cs(e, t) {
	Ie(t, !0);
	let n = Gr(t, "hasWallpaper", 3, !1), r = Gr(t, "layoutMode", 3, "fixed"), i = Gr(t, "capsuleCornerStyle", 3, "rounded"), a = Gr(t, "interactive", 3, !1), o = Gr(t, "isCurrentWeek", 3, !1), s = Gr(t, "courseBadges", 19, () => ({})), c = /* @__PURE__ */ Ft(0), l = /* @__PURE__ */ Ft(0), u = /* @__PURE__ */ Ft(Ht(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ Ft(Ht(/* @__PURE__ */ new Date())), f = /* @__PURE__ */ j(() => t.expandedSlots ?? L(u)), p = /* @__PURE__ */ j(() => t.gridModel.visibleDays.length), m = /* @__PURE__ */ j(() => L(p) > 0 ? L(c) / L(p) : 0), h = /* @__PURE__ */ j(() => oa(t.gridModel.periods)), g = /* @__PURE__ */ j(() => Ii({
		courseDisplayModels: t.courseDisplayModels,
		visibleDays: t.gridModel.visibleDays,
		columnWidthPx: L(m),
		expandedSlotKeys: L(f),
		coursePalette: t.coursePalette,
		paletteCourses: t.paletteCourses,
		layoutMode: r(),
		capsuleCornerStyle: i()
	})), _ = /* @__PURE__ */ j(() => n() ? "" : "bg-surface"), v = /* @__PURE__ */ j(() => r() === "compact"), y = /* @__PURE__ */ j(() => t.currentPeriodIndex === void 0 ? o() ? ca(L(h), sa(L(d))) : null : t.currentPeriodIndex), b = /* @__PURE__ */ j(() => !L(v) || L(l) <= 0 || t.gridModel.displayedPeriodCount <= 0 ? "5.5rem" : `${L(l) / t.gridModel.displayedPeriodCount}px`);
	ln(() => {
		if (t.currentPeriodIndex !== void 0 || !o()) return;
		let e, n = () => {
			let t = (() => {
				let e = L(h);
				if (e.length === 0) return 6e4;
				let t = sa(/* @__PURE__ */ new Date()), n = null;
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
				Lt(d, /* @__PURE__ */ new Date(), !0), n();
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
				let s = qo(t), c = Ko(o, (e) => {
					let t = s(e);
					return Math.max(...a.map((e) => t(e)));
				}, r, 6);
				t.style.fontSize = `${c}px`;
			}, r = null, i = new ResizeObserver(n);
			return ln(() => {
				let { fromParent: a = !1 } = e(), o = a ? t.parentElement ?? t : t;
				r !== o && (i.disconnect(), i.observe(o), r = o), n();
			}), () => i.disconnect();
		};
	}
	function S(e) {
		t.onExpandSlot ? t.onExpandSlot(e) : Lt(u, /* @__PURE__ */ new Set([...L(u), e]), !0);
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
	let T = (e) => {
		let t = () => {
			Lt(c, e.clientWidth, !0);
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, ee = (e) => {
		let t = e;
		Lt(l, t.clientHeight, !0);
		let n = new ResizeObserver(() => {
			Lt(l, t.clientHeight, !0);
		});
		return n.observe(t), () => {
			n.disconnect();
		};
	};
	var te = ss(), ne = N(te), re = N(ne), ie = N(re), ae = N(ie, !0);
	k(ie), Oe(2), k(re);
	var oe = Qt(re, 2);
	Or(oe, 21, () => t.gridModel.visibleDays, (e) => e.dayOfWeek, (e, t) => {
		var n = Xo(), r = N(n), i = N(r, !0);
		k(r);
		var a = Qt(r, 2), o = N(a, !0);
		k(a), k(n), P((e, n) => {
			gr(i, e), Vr(a, 1, `m3-body-medium mt-1 flex size-[26px] items-center justify-center rounded-full ${L(t).isToday ? "bg-brand text-on-primary" : "text-on-surface"}`), gr(o, n);
		}, [() => jo(L(t).dayOfWeek), () => C(L(t).date)]), z(e, n);
	}), k(oe), k(ne);
	var se = Qt(ne, 2), ce = N(se);
	let le;
	var ue = N(ce);
	let de;
	Or(ue, 21, () => t.gridModel.periods, (e) => e.index, (e, t) => {
		let n = /* @__PURE__ */ j(() => o() && L(t).index === L(y));
		var r = Zo(), i = N(r), a = N(i), s = N(a, !0);
		k(a);
		var c = Qt(a, 2), l = N(c, !0), u = Qt(l, 2, !0);
		k(c), k(i), k(r), P(() => {
			Vr(i, 1, `flex h-full w-full flex-col items-center justify-center rounded-2xl ${L(n) ? "period-active" : ""}`), gr(s, L(t).index), Vr(c, 1, `m3-caption mt-1 leading-tight ${L(n) ? "" : "text-on-surface-variant"}`), gr(l, L(t).startTime), gr(u, L(t).endTime);
		}), z(e, r);
	}), k(ue);
	var fe = Qt(ue, 2);
	let pe;
	Or(fe, 21, () => L(g), (e) => e.key, (e, n) => {
		let r = /* @__PURE__ */ j(() => L(n).geometry.endPeriod - L(n).geometry.startPeriod + 1);
		var i = os();
		let o;
		var c = N(i), l = (e) => {
			var t = hr(), r = Zt(t), i = (e) => {
				var t = Qo(), r = N(t);
				let i;
				var a = N(r);
				k(r), k(t), P((e) => {
					Vr(t, 1, `flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center ${e ?? ""}`, "svelte-1o3jcov"), i = B(r, "", i, { "font-size": `${L(n).placeholderPx ?? ""}px` }), gr(a, `此时段有 ${L(n).count ?? ""} 门课程重叠`);
				}, [() => w(L(n).corners)]), sr("click", t, () => S(L(n).key)), z(e, t);
			}, o = (e) => {
				var t = $o(), r = N(t);
				let i;
				var a = N(r);
				k(r), k(t), P((e) => {
					Vr(t, 1, `flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center ${e ?? ""}`, "svelte-1o3jcov"), i = B(r, "", i, { "font-size": `${L(n).placeholderPx ?? ""}px` }), gr(a, `${L(n).count ?? ""} 门课程重叠`);
				}, [() => w(L(n).corners)]), z(e, t);
			};
			Cr(r, (e) => {
				a() ? e(i) : e(o, -1);
			}), z(e, t);
		}, u = (e) => {
			let r = /* @__PURE__ */ j(() => s()[L(n).course.id] ?? []), i = /* @__PURE__ */ j(() => L(n).badgeLabel || L(r)[0]?.text);
			var o = hr(), c = Zt(o), l = (e) => {
				var r = is();
				let a;
				var o = N(r), s = (e) => {
					var t = es(), r = N(t);
					let a;
					var o = N(r, !0);
					k(r), Fr(r, () => x(() => ({
						lines: [L(i)],
						maxFontPx: L(n).scale.badgePx,
						fromParent: !0
					}))), k(t), P(() => {
						a = B(r, "", a, {
							"background-color": "color-mix(in srgb, currentColor 12%, transparent)",
							color: "color-mix(in srgb, currentColor 80%, transparent)",
							"font-size": `${L(n).scale.badgePx ?? ""}px`
						}), gr(o, L(i));
					}), z(e, t);
				};
				Cr(o, (e) => {
					L(i) && e(s);
				});
				var c = Qt(o, 2);
				Yo(c, {
					get text() {
						return L(n).course.name;
					},
					class: "min-h-0 flex-1 leading-tight font-medium",
					get style() {
						return `font-size: ${L(n).scale.titlePx ?? ""}px`;
					}
				});
				var l = Qt(c, 2), u = (e) => {
					var t = ns();
					Or(t, 21, () => L(n).locationLines, wr, (e, t) => {
						var n = ts(), r = N(n, !0);
						k(n), P(() => gr(r, L(t))), z(e, n);
					}), k(t), Fr(t, () => x(() => ({
						lines: L(n).locationLines,
						maxFontPx: L(n).locationMetrics.fontPx
					}))), P(() => B(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${L(n).locationMetrics.fontPx ?? ""}px; height: ${L(n).locationMetrics.heightPx ?? ""}px`)), z(e, t);
				};
				Cr(l, (e) => {
					L(n).locationLines.length > 0 && e(u);
				});
				var d = Qt(l, 2), f = (e) => {
					var t = rs(), r = N(t, !0);
					k(t), Fr(t, () => x(() => ({
						lines: [L(n).teacher],
						maxFontPx: L(n).scale.detailPx
					}))), P(() => {
						B(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${L(n).scale.detailPx ?? ""}px`), gr(r, L(n).teacher);
					}), z(e, t);
				};
				Cr(d, (e) => {
					L(n).teacher && e(f);
				}), k(r), P((e) => {
					Vr(r, 1, `course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left ${e ?? ""} ${L(n).displayModel.isInDisplayedWeek ? "" : "opacity-45"}`, "svelte-1o3jcov"), a = B(r, "", a, {
						"--capsule": L(n).colors.background,
						"--capsule-fg": L(n).colors.text
					});
				}, [() => w(L(n).corners)]), sr("click", r, () => t.onCourseClick?.(L(n).course)), z(e, r);
			}, u = (e) => {
				var t = as();
				let r;
				var a = N(t), o = (e) => {
					var t = es(), r = N(t);
					let a;
					var o = N(r, !0);
					k(r), Fr(r, () => x(() => ({
						lines: [L(i)],
						maxFontPx: L(n).scale.badgePx,
						fromParent: !0
					}))), k(t), P(() => {
						a = B(r, "", a, {
							"background-color": "color-mix(in srgb, currentColor 12%, transparent)",
							color: "color-mix(in srgb, currentColor 80%, transparent)",
							"font-size": `${L(n).scale.badgePx ?? ""}px`
						}), gr(o, L(i));
					}), z(e, t);
				};
				Cr(a, (e) => {
					L(i) && e(o);
				});
				var s = Qt(a, 2);
				Yo(s, {
					get text() {
						return L(n).course.name;
					},
					class: "min-h-0 flex-1 leading-tight font-medium",
					get style() {
						return `font-size: ${L(n).scale.titlePx ?? ""}px`;
					}
				});
				var c = Qt(s, 2), l = (e) => {
					var t = ns();
					Or(t, 21, () => L(n).locationLines, wr, (e, t) => {
						var n = ts(), r = N(n, !0);
						k(n), P(() => gr(r, L(t))), z(e, n);
					}), k(t), Fr(t, () => x(() => ({
						lines: L(n).locationLines,
						maxFontPx: L(n).locationMetrics.fontPx
					}))), P(() => B(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${L(n).locationMetrics.fontPx ?? ""}px; height: ${L(n).locationMetrics.heightPx ?? ""}px`)), z(e, t);
				};
				Cr(c, (e) => {
					L(n).locationLines.length > 0 && e(l);
				});
				var u = Qt(c, 2), d = (e) => {
					var t = rs(), r = N(t, !0);
					k(t), Fr(t, () => x(() => ({
						lines: [L(n).teacher],
						maxFontPx: L(n).scale.detailPx
					}))), P(() => {
						B(t, `color: color-mix(in srgb, currentColor 80%, transparent); font-size: ${L(n).scale.detailPx ?? ""}px`), gr(r, L(n).teacher);
					}), z(e, t);
				};
				Cr(u, (e) => {
					L(n).teacher && e(d);
				}), k(t), P((e) => {
					Vr(t, 1, `course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 text-left ${e ?? ""} ${L(n).displayModel.isInDisplayedWeek ? "" : "opacity-45"}`, "svelte-1o3jcov"), r = B(t, "", r, {
						"--capsule": L(n).colors.background,
						"--capsule-fg": L(n).colors.text
					});
				}, [() => w(L(n).corners)]), z(e, t);
			};
			Cr(c, (e) => {
				a() ? e(l) : e(u, -1);
			}), z(e, o);
		};
		Cr(c, (e) => {
			L(n).kind === "overlap-placeholder" ? e(l) : e(u, -1);
		}), k(i), P(() => o = B(i, "", o, {
			top: `calc((var(--row-height) * ${L(n).geometry.startPeriod - 1}))`,
			left: `${L(n).geometry.leftPercent ?? ""}%`,
			width: `${L(n).geometry.widthPercent ?? ""}%`,
			height: `calc(var(--row-height) * ${L(r) ?? ""})`
		})), z(e, i);
	}), k(fe), Fr(fe, () => T), k(ce), k(se), Fr(se, () => ee), k(te), P(() => {
		Vr(te, 1, `relative flex h-full min-h-0 w-full flex-1 flex-col ${L(_) ?? ""}`, "svelte-1o3jcov"), B(te, `--row-height: ${L(b) ?? ""}; --sidebar-width: 3.25rem`), Vr(ne, 1, `flex shrink-0 items-center py-2 ${n() ? "bg-[var(--wallpaper-tint-sidebar)]" : "bg-surface"}`), gr(ae, t.gridModel.monthLabel), Vr(se, 1, `min-h-0 flex-1 ${L(v) ? "overflow-hidden" : "overflow-y-auto"} ${n() ? "timetable-wallpaper-body" : "bg-surface"}`, "svelte-1o3jcov"), le = B(ce, "", le, { height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})` }), de = B(ue, "", de, {
			width: "var(--sidebar-width)",
			height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})`
		}), pe = B(fe, "", pe, { height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})` });
	}), z(e, te), Le();
}
cr(["click"]);
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetableWallpaperLayer.svelte
var ls = /* @__PURE__ */ R("<div class=\"absolute inset-0\"></div>"), us = /* @__PURE__ */ R("<div class=\"relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden\"><!> <!></div>");
function ds(e, t) {
	let n = Gr(t, "wallpaperUri", 3, null);
	var r = us(), i = N(r), a = (e) => {
		var t = ls();
		let r;
		P(() => r = B(t, "", r, {
			"background-image": `url("${n()}")`,
			"background-size": "cover",
			"background-position": "center",
			"background-repeat": "no-repeat"
		})), z(e, t);
	};
	Cr(i, (e) => {
		n() && e(a);
	});
	var o = Qt(i, 2), s = (e) => {
		var n = hr();
		Pr(Zt(n), () => t.children), z(e, n);
	};
	Cr(o, (e) => {
		t.children && e(s);
	}), k(r), z(e, r);
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
cr(["change"]), cr(["click"]);
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetableLivePreview.svelte
var fs = /* @__PURE__ */ R("<div class=\"flex min-h-[12rem] items-center justify-center p-8\"><p class=\"m3-body-medium text-center text-on-surface-variant\">暂无课表，导入后可预览效果</p></div>");
function ps(e, t) {
	Ie(t, !0);
	let n = Gr(t, "hasWallpaper", 3, !1), r = Gr(t, "wallpaperUri", 3, null), i = Gr(t, "interactive", 3, !1), a = new di(), o = /* @__PURE__ */ j(() => t.controller.currentTimetable), s = /* @__PURE__ */ j(ui), c = /* @__PURE__ */ j(() => L(o) ? a.calculateAcademicWeek(L(s), L(o).academicConfig) : null), l = /* @__PURE__ */ j(() => t.controller.displayedWeek ?? t.controller.activeWeek ?? L(c) ?? 1), u = /* @__PURE__ */ j(() => L(l) === (L(c) ?? t.controller.activeWeek ?? 1)), d = /* @__PURE__ */ j(() => t.controller.currentPeriodIndex), f = /* @__PURE__ */ j(() => t.controller.userPreferences?.timetableLayoutMode ?? "fixed"), p = /* @__PURE__ */ j(() => t.controller.userPreferences?.capsuleCornerStyle ?? "rounded"), m = /* @__PURE__ */ j(() => t.controller.coursePalette.length > 0 ? t.controller.coursePalette : qr), h = /* @__PURE__ */ j(() => L(o)?.courses ?? []), g = /* @__PURE__ */ j(() => t.controller.courseBadges ?? {}), _ = /* @__PURE__ */ j(() => L(o) ? ia({
		timetable: L(o),
		displayedWeek: L(l),
		todayIso: L(s),
		academicCalendarService: a,
		coursePalette: L(m),
		paletteCourses: L(h),
		layoutMode: L(f),
		capsuleCornerStyle: L(p)
	}) : null), v = /* @__PURE__ */ j(() => L(_)?.gridModel ?? null), y = /* @__PURE__ */ j(() => L(_)?.courseDisplayModels ?? []);
	var b = hr(), x = Zt(b), S = (e) => {
		{
			let t = /* @__PURE__ */ j(() => n() && r() ? r() : null);
			ds(e, {
				get wallpaperUri() {
					return L(t);
				},
				children: (e, t) => {
					{
						let t = /* @__PURE__ */ j(() => n() && !!r());
						cs(e, {
							get displayedWeek() {
								return L(l);
							},
							get gridModel() {
								return L(v);
							},
							get courseDisplayModels() {
								return L(y);
							},
							get coursePalette() {
								return L(m);
							},
							get paletteCourses() {
								return L(h);
							},
							get hasWallpaper() {
								return L(t);
							},
							get layoutMode() {
								return L(f);
							},
							get capsuleCornerStyle() {
								return L(p);
							},
							get interactive() {
								return i();
							},
							get isCurrentWeek() {
								return L(u);
							},
							get currentPeriodIndex() {
								return L(d);
							},
							get courseBadges() {
								return L(g);
							}
						});
					}
				},
				$$slots: { default: !0 }
			});
		}
	}, C = (e) => {
		z(e, fs());
	};
	Cr(x, (e) => {
		L(o) && L(v) ? e(S) : e(C, -1);
	}), z(e, b), Le();
}
//#endregion
//#region packages/plugins/wallpaper/src/WallpaperScreen.svelte
var ms = /* @__PURE__ */ R("<div class=\"relative flex min-h-0 flex-1 flex-col overflow-hidden\"><!></div>"), hs = /* @__PURE__ */ R("<div class=\"flex min-h-0 flex-1 items-center justify-center bg-canvas p-4\"><p class=\"m3-body-medium text-center text-on-surface-variant\">选择壁纸后，可在此预览应用效果</p></div>"), gs = /* @__PURE__ */ R("<button type=\"button\" class=\"flex flex-1 items-center justify-center gap-2 rounded-full border border-outline bg-surface px-4 py-3 text-sm font-medium text-on-surface\">清除壁纸</button>"), _s = /* @__PURE__ */ R("<div class=\"flex min-h-0 flex-1 flex-col\"><input type=\"file\" accept=\"image/*\" class=\"hidden\"/> <!> <div class=\"bottom-bar\"><div class=\"mx-auto flex h-full w-full max-w-lg items-center gap-3\"><!> <button type=\"button\" class=\"flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-on-primary\"> </button></div></div></div>");
function vs(e, t) {
	Ie(t, !0);
	let n = Ea(), r = /* @__PURE__ */ j(() => n.uri), i = /* @__PURE__ */ j(() => n.hasWallpaper), a = /* @__PURE__ */ j(() => t.controller.currentTimetable), o = /* @__PURE__ */ Ft(void 0);
	function s() {
		L(o)?.click();
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
	var u = _s(), d = N(u);
	Wr(d, (e) => Lt(o, e), () => L(o));
	var f = Qt(d, 2), p = (e) => {
		var n = ms();
		ps(N(n), {
			get controller() {
				return t.controller;
			},
			hasWallpaper: !0,
			get wallpaperUri() {
				return L(r);
			},
			interactive: !1
		}), k(n), z(e, n);
	}, m = (e) => {
		z(e, hs());
	};
	Cr(f, (e) => {
		L(i) && L(a) ? e(p) : e(m, -1);
	});
	var h = Qt(f, 2), g = N(h), _ = N(g), v = (e) => {
		var t = gs();
		sr("click", t, l), z(e, t);
	};
	Cr(_, (e) => {
		L(i) && e(v);
	});
	var y = Qt(_, 2), b = N(y, !0);
	k(y), k(g), k(h), k(u), P(() => gr(b, L(i) ? "重新选择" : "选择壁纸")), sr("change", d, c), sr("click", y, s), z(e, u), Le();
}
cr(["change", "click"]);
//#endregion
//#region packages/plugins/wallpaper/bundle/entry.ts
var ys = Na({ screenComponent: { mount(e, t) {
	let n = _r(vs, {
		target: e,
		props: t
	});
	return { unmount() {
		xr(n);
	} };
} } });
//#endregion
export { ys as default };
