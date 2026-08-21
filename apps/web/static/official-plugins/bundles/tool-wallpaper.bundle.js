//#region packages/core/src/engine/palette.ts
var e = [
	["#EADDFF", "#21005D"],
	["#FFDBC9", "#311100"],
	["#C4EED0", "#072711"],
	["#D3E3FD", "#041E49"],
	["#FFD8E4", "#31111D"],
	["#F6E1B0", "#241A00"],
	["#A9F0E4", "#00201C"],
	["#DCE9A1", "#181E00"]
], t = e.map(([e, t]) => ({
	background: e,
	foreground: t
})), n = /\s+/g;
function r(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = t * 31 + e.charCodeAt(n) | 0;
	return t;
}
function i(e) {
	return e.replace(/^【调】/, "").replace(/[★☆〇■◆]$/u, "").trim().replace(n, " ");
}
function a(t) {
	return e[Math.abs(r(t) % e.length)] ?? e[0];
}
var o = new Map(t.map((e, t) => [e.background.toLowerCase(), t]));
function s(e) {
	return o.get(e.trim().toLowerCase()) ?? null;
}
function c(e, n = t) {
	let r = e.name ? i(e.name) : "", o = s(e.color || (r ? a(r)[0] : ""));
	if (o == null || n.length === 0) {
		if (r) {
			let [t, n] = a(r);
			return {
				background: e.color || t,
				foreground: e.textColor || n
			};
		}
		return {
			background: e.color || "#EADDFF",
			foreground: e.textColor || "#21005D"
		};
	}
	return n[o % n.length];
}
function l(e, n = t) {
	if (n.length === 0) return /* @__PURE__ */ new Map();
	let o = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = i(t.name), n = s(t.color || a(e)[0]);
		n != null && (o.has(e) || o.set(e, {
			name: e,
			slot: n,
			hash: r(e)
		}));
	}
	let c = [...o.values()].sort((e, t) => e.hash - t.hash || e.name.localeCompare(t.name)), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), d = [];
	for (let { name: e, slot: t } of c) {
		let r = t % n.length;
		if (u.has(r)) {
			d.push(e);
			continue;
		}
		u.add(r), l.set(e, n[r]);
	}
	let f = 0;
	for (let e of d) {
		for (; u.has(f % n.length) && u.size < n.length;) f += 1;
		let t = f % n.length;
		u.add(t), l.set(e, n[t]), f += 1;
	}
	return l;
}
//#endregion
//#region packages/core/src/engine/date.ts
function u(e) {
	let t = e.trim(), n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!n) throw Error(`Invalid ISO date: ${e}`);
	let [, r, i, a] = n;
	return new Date(Date.UTC(Number(r), Number(i) - 1, Number(a), 12));
}
function d(e) {
	return `${e.getUTCFullYear()}-${String(e.getUTCMonth() + 1).padStart(2, "0")}-${String(e.getUTCDate()).padStart(2, "0")}`;
}
function f(e) {
	let t = new Date(e.getTime()), n = t.getUTCDay(), r = n === 0 ? -6 : 1 - n;
	return t.setUTCDate(t.getUTCDate() + r), t;
}
function p(e, t) {
	let n = new Date(e.getTime());
	return n.setUTCDate(n.getUTCDate() + t), n;
}
function m(e, t) {
	return p(e, t * 7);
}
function h(e, t) {
	return Math.floor((t.getTime() - e.getTime()) / 6048e5);
}
function g(e, t) {
	return e.getTime() < t.getTime();
}
function _(e) {
	return d(f(u(e)));
}
function v(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region packages/core/src/engine/calendar.ts
var y = class {
	normalizeTermStartDate(e, t) {
		let n = u(_(t));
		if (!e || !e.trim()) return d(f(n));
		try {
			return d(f(u(e)));
		} catch {
			return d(f(this.inferTermStartDateFromTermName(e) || n));
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
		}, r = u(this.normalizeTermStartDate(n.termStartDate, e)), i = u(e);
		if (g(i, r)) return n.startWeek;
		let a = h(r, i);
		return Math.min(Math.max(n.startWeek + a, n.startWeek), n.endWeek);
	}
	resolveWeekStart(e, t, n) {
		return d(m(u(this.normalizeTermStartDate(e.termStartDate, n)), t - e.startWeek));
	}
	resolveCourseDate(e, t, n, r) {
		return d(p(u(this.resolveWeekStart(e, t, r)), n - 1));
	}
}, b = {
	termStartDate: "",
	startWeek: 1,
	endWeek: 20,
	periodTimes: []
};
function x(e) {
	let [, t, n] = e.split("-");
	return `${Number(t)}/${Number(n)}`;
}
function S(e, t, n, r, i = new y()) {
	let a = e ?? b, o = i.resolveWeekStart(a, t, n), s = 5;
	r?.showSunday ? s = 7 : r?.showSaturday && (s = 6);
	let c = p(u(o), s - 1);
	return `${x(o)} - ${x(d(c))}`;
}
//#endregion
//#region packages/core/src/engine/slot-key.ts
function C(e, t, n) {
	return `${e}:${t}:${n}`;
}
function w(e) {
	return C(e.dayOfWeek, e.startPeriod, e.endPeriod);
}
//#endregion
//#region packages/core/src/engine/grid.ts
function ee(e) {
	let t = [
		1,
		2,
		3,
		4,
		5
	];
	return e.viewPrefs.showSaturday && t.push(6), e.viewPrefs.showSunday && t.push(7), t;
}
function te(e) {
	let t = e[0] ? Number(e[0].slice(5, 7)) : 0, n = e[e.length - 1] ? Number(e[e.length - 1].slice(5, 7)) : 0;
	return t ? t === n ? String(t) : `${t}/${n}` : "";
}
function ne(e, t, n = []) {
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
function re(e, t, n, r) {
	let i = r?.academicCalendarService ?? new y(), a = ee(n), o = u(i.resolveWeekStart(n.academicConfig, t, e)), s = a.map((t) => {
		let n = d(p(o, t - 1));
		return {
			dayOfWeek: t,
			date: n,
			isToday: n === e
		};
	}), c = Math.max(10, n.academicConfig.periodTimes.length, ...n.courses.map((e) => e.endPeriod), 0);
	return {
		monthLabel: te(s.map((e) => e.date)),
		visibleDays: s,
		periods: ne(n.academicConfig.periodTimes, c, r?.defaultPeriods),
		displayedPeriodCount: c
	};
}
//#endregion
//#region packages/core/src/engine/display-models.ts
function ie(e, t) {
	return e.nextWeek === t.nextWeek ? e.originalIndex < t.originalIndex : e.nextWeek < t.nextWeek;
}
function ae(e, t, n) {
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
	let a = new Set(r.map((e) => w(e.course))), o = /* @__PURE__ */ new Map();
	for (let { course: e, originalIndex: t } of i) {
		let r = Infinity;
		for (let t of e.weeks) t >= n && t < r && (r = t);
		if (!Number.isFinite(r)) continue;
		let i = w(e);
		if (a.has(i)) continue;
		let s = {
			course: e,
			nextWeek: r,
			originalIndex: t
		}, c = o.get(i);
		(!c || ie(s, c)) && o.set(i, s);
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
var oe = "非本周", se = 70, ce = 2, le = 1, ue = 1, de = 12, fe = 8, pe = 8, me = 1.25, he = 2, ge = [
	[50, 12],
	[70, 14],
	[85, 15],
	[110, 17]
], _e = [
	[50, 8],
	[70, 10],
	[85, 11],
	[110, 12]
], ve = [
	[50, 8],
	[70, 9],
	[85, 10],
	[110, 12]
];
function ye(e) {
	let { courseDisplayModels: n, visibleDays: r, columnWidthPx: i, expandedSlotKeys: a, layoutMode: o = "fixed", coursePalette: s = t, paletteCourses: c, capsuleCornerStyle: u = "rounded" } = e, d = o === "compact", f = r.length;
	if (f === 0) return [];
	let p = l(c ?? n.map((e) => e.course), s), m = new Map(r.map((e, t) => [e.dayOfWeek, t])), h = 100 / f, g = [];
	for (let e of Me(n)) {
		let t = C(e.dayOfWeek, e.startPeriod, e.endPeriod), n = e.courses.length, r = (m.get(e.dayOfWeek) ?? 0) * h;
		if (n === 1) {
			let n = e.courses[0];
			g.push(be({
				displayModel: n,
				columnLeft: r,
				widthPercent: h,
				columnWidthPx: i,
				overlapCount: 1,
				coursePalette: s,
				paletteByName: p,
				compact: d,
				key: `${t}:${n.course.id}`
			}));
			continue;
		}
		if (!a.has(t)) {
			let a = je(i, 1, d);
			g.push({
				kind: "overlap-placeholder",
				key: t,
				geometry: {
					leftPercent: r,
					widthPercent: h,
					startPeriod: e.startPeriod,
					endPeriod: e.endPeriod
				},
				count: n,
				placeholderPx: a.placeholderPx,
				corners: xe
			});
			continue;
		}
		let o = h / n;
		e.courses.forEach((e, a) => {
			g.push(be({
				displayModel: e,
				columnLeft: r + o * a,
				widthPercent: o,
				columnWidthPx: i,
				overlapCount: n,
				coursePalette: s,
				paletteByName: p,
				compact: d,
				key: `${t}:${e.course.id}`
			}));
		});
	}
	return u === "rounded" ? Te(g) : u === "sharp" && Ce(g), g;
}
function be(e) {
	let { displayModel: t, columnLeft: n, widthPercent: r, columnWidthPx: i, overlapCount: a, coursePalette: o, paletteByName: s, compact: c, key: l } = e, u = t.course, d = ke(i, a), f = Pe(u.location, { includeCampus: d }), p = je(i, a, c), m = Ae(p.detailPx, d, f.length);
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
		colors: Ie(u, o, s),
		scale: p,
		locationLines: f,
		locationMetrics: m,
		teacher: u.teacher.trim(),
		badgeLabel: t.isInDisplayedWeek ? null : oe,
		overlapCount: a,
		corners: xe
	};
}
var xe = {
	topLeft: !0,
	topRight: !0,
	bottomLeft: !0,
	bottomRight: !0
}, Se = {
	topLeft: !1,
	topRight: !1,
	bottomLeft: !1,
	bottomRight: !1
};
function Ce(e) {
	for (let t of e) t.corners = Se;
}
var we = .001;
function Te(e) {
	let t = e.length;
	if (t <= 1) {
		t === 1 && (e[0].corners = xe);
		return;
	}
	for (let n = 0; n < t; n += 1) {
		let r = e[n], { leftPercent: i, widthPercent: a, startPeriod: o, endPeriod: s } = r.geometry, c = i + a, l = !0, u = !0, d = !0, f = !0;
		for (let r = 0; r < t; r += 1) {
			if (n === r) continue;
			let { leftPercent: t, widthPercent: a, startPeriod: p, endPeriod: m } = e[r].geometry, h = t + a;
			if (!(h < i - we || t > c + we) && (Ee(i, c, t, h) && (m + 1 === o && (l = !1), p === s + 1 && (u = !1)), De(o, s, p, m) && (Oe(h, i) && (d = !1), Oe(c, t) && (f = !1)), !l && !u && !d && !f)) break;
		}
		r.corners = {
			topLeft: l && d,
			topRight: l && f,
			bottomLeft: u && d,
			bottomRight: u && f
		};
	}
}
function Ee(e, t, n, r) {
	return Math.max(e, n) < Math.min(t, r) - we;
}
function De(e, t, n, r) {
	return e <= r && n <= t;
}
function Oe(e, t) {
	return Math.abs(e - t) < we;
}
function ke(e, t = 1) {
	return Math.max(0, e) / Math.max(1, t) >= se;
}
function Ae(e, t, n) {
	let r = t ? Math.min(Math.max(n, 1), 3) : 3;
	return {
		fontPx: Be(t ? e : e + he),
		heightPx: r * e * me
	};
}
function je(e, t = 1, n = !1) {
	let r = Math.max(0, e) / Math.max(1, t), i = Be(ze(r, ge)), a = Be(ze(r, _e)), o = Be(ze(r, ve));
	n && (i = Math.max(de, Be(i - ce)), a = Math.max(fe, Be(a - le)), o = Math.max(pe, Be(o - ue)));
	let s = Be(Math.max(11, i - 1));
	return {
		titlePx: i,
		detailPx: a,
		badgePx: o,
		placeholderPx: s
	};
}
function Me(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.course.dayOfWeek, r = t.get(e);
		r ? r.push(n) : t.set(e, [n]);
	}
	return [...t.entries()].sort(([e], [t]) => e - t).flatMap(([, e]) => Le(e));
}
function Ne(e) {
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
function Pe(e, t) {
	let { campus: n, building: r, room: i } = Ne(e);
	return (t?.includeCampus === !1 ? [r, i] : [
		n,
		r,
		i
	]).filter((e) => e.length > 0);
}
function Fe(e) {
	let t = e.trim();
	return /^#[0-9A-Fa-f]{6}$/.test(t) ? t : "#EADDFF";
}
function Ie(e, t, n) {
	let r = n.get(i(e.name)) ?? c(e, t);
	return {
		background: Fe(r.background),
		text: Fe(r.foreground)
	};
}
function Le(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e.course.startPeriod - t.course.startPeriod || e.course.endPeriod - t.course.endPeriod || e.course.name.localeCompare(t.course.name)), n = [], r = [], i = 0;
	for (let e of t) {
		let t = e.course;
		r.length === 0 || t.startPeriod <= i ? (r.push(e), i = Math.max(i, t.endPeriod)) : (n.push(Re(r, i)), r = [e], i = t.endPeriod);
	}
	return r.length > 0 && n.push(Re(r, i)), n;
}
function Re(e, t) {
	let n = e[0];
	return {
		dayOfWeek: n.course.dayOfWeek,
		startPeriod: n.course.startPeriod,
		endPeriod: t,
		courses: e
	};
}
function ze(e, t) {
	let n = t[0], r = t[t.length - 1];
	if (e <= n[0]) return n[1];
	if (e >= r[0]) return r[1];
	for (let n = 1; n < t.length; n += 1) {
		let [r, i] = t[n - 1], [a, o] = t[n];
		if (e <= a) return i + (e - r) / (a - r) * (o - i);
	}
	return r[1];
}
function Be(e) {
	return Math.round(e * 10) / 10;
}
//#endregion
//#region packages/core/src/engine/timetable-layout.ts
function Ve(e) {
	let { timetable: n, displayedWeek: r, todayIso: i, columnWidthPx: a = 0, expandedSlotKeys: o = /* @__PURE__ */ new Set(), layoutMode: s = "fixed", capsuleCornerStyle: c = "rounded", coursePalette: l = t, paletteCourses: u, academicCalendarService: d = new y() } = e, f = d.calculateAcademicWeek(i, n.academicConfig), p = r === f, m = re(i, r, n, { academicCalendarService: d }), h = ae(n, new Set(m.visibleDays.map((e) => e.dayOfWeek)), r);
	return {
		gridModel: m,
		courseDisplayModels: h,
		placements: ye({
			courseDisplayModels: h,
			visibleDays: m.visibleDays,
			columnWidthPx: a,
			expandedSlotKeys: o,
			layoutMode: s,
			capsuleCornerStyle: c,
			coursePalette: l,
			paletteCourses: u
		}),
		weekRangeText: S(n.academicConfig, r, i, n.viewPrefs, d),
		isCurrentWeek: p,
		academicWeek: f
	};
}
//#endregion
//#region packages/core/src/schema/schema.ts
function He(e) {
	return e;
}
//#endregion
//#region packages/core/src/types/services.ts
function Ue(e) {
	return { key: e };
}
var We = Ue("storage"), Ge = {}, T = Symbol("uninitialized"), Ke = Array.isArray, qe = Array.prototype.indexOf, Je = Array.prototype.includes, Ye = Array.from, Xe = Object.getOwnPropertyDescriptor, Ze = Object.prototype, Qe = Array.prototype, $e = Object.getPrototypeOf, et = () => {};
function tt(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function nt() {
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
var rt = 1 << 24, E = 1024, it = 2048, at = 4096, ot = 8192, st = 16384, ct = 32768, lt = 1 << 25, ut = 65536, dt = 1 << 19, ft = 1 << 20, pt = 1 << 25, mt = 65536, ht = 1 << 21, gt = 1 << 22, _t = 1 << 23, vt = Symbol("$state"), yt = Symbol("legacy props"), bt = Symbol("class"), xt = Symbol("style"), St = Symbol("text"), Ct = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/errors.js
function wt() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Tt(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Et() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Dt(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Ot() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function kt() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function At() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function jt() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Mt(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/hydration.js
var D = !1;
function Nt(e) {
	D = e;
}
var O;
function Pt(e) {
	if (e === null) throw Mt(), Ge;
	return O = e;
}
function Ft() {
	return Pt(/* @__PURE__ */ $n(O));
}
function k(e) {
	if (D) {
		if (/* @__PURE__ */ $n(O) !== null) throw Mt(), Ge;
		O = e;
	}
}
function It(e = 1) {
	if (D) {
		for (var t = e, n = O; t--;) n = /* @__PURE__ */ $n(n);
		O = n;
	}
}
function Lt(e = !0) {
	for (var t = 0, n = O;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ $n(n);
		e && n.remove(), n = i;
	}
}
function Rt(e) {
	if (!e || e.nodeType !== 8) throw Mt(), Ge;
	return e.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/equality.js
function zt(e) {
	return e === this.v;
}
function Bt(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Vt(e) {
	return !Bt(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/context.js
var Ht = null;
function Ut(e) {
	Ht = e;
}
function Wt(e, t = !1, n) {
	Ht = {
		p: Ht,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: F,
		l: null
	};
}
function Gt(e) {
	var t = Ht, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) lr(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ht = t.p, e ?? {};
}
function Kt() {
	return !0;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/task.js
var qt = [];
function Jt() {
	var e = qt;
	qt = [], tt(e);
}
function Yt(e) {
	if (qt.length === 0 && !Cn) {
		var t = qt;
		queueMicrotask(() => {
			t === qt && Jt();
		});
	}
	qt.push(e);
}
function Xt(e) {
	var t = F;
	if (t === null) return P.f |= _t, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Zt(e, t);
}
function Zt(e, t) {
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
var Qt = ~(it | at | E);
function A(e, t) {
	e.f = e.f & Qt | t;
}
function $t(e) {
	e.f & 512 || e.deps === null ? A(e, E) : A(e, at);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/utils.js
function en(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= mt, en(t.deps));
}
function tn(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), en(e.deps), A(e, E);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/store.js
var nn = !1;
function rn(e) {
	var t = nn;
	try {
		return nn = !1, [e(), nn];
	} finally {
		nn = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function an(e) {
	var t = P, n = F;
	Nr(null), Pr(null);
	try {
		return e();
	} finally {
		Nr(t), Pr(n);
	}
}
ut | dt;
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/async.js
function on(e, t, n, r) {
	let i = Kt() ? un : pn;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = F, c = sn(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Zt(e, s);
			}
			cn();
		}
	}
	var d = ln();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ fn(e))).then(u).catch((e) => Zt(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), cn();
	}) : f();
}
function sn() {
	var e = F, t = P, n = Ht, r = M;
	return function(i = !0) {
		Pr(e), Nr(t), Ut(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function cn(e = !0) {
	Pr(null), Nr(null), Ut(null), e && M?.deactivate();
}
function ln() {
	var e = F, t = e.b, n = M, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function un(e) {
	var t = 2 | it;
	return F !== null && (F.f |= dt), {
		ctx: Ht,
		deps: null,
		effects: null,
		equals: zt,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: T,
		wv: 0,
		parent: F,
		ac: null
	};
}
var dn = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function fn(e, t, n) {
	let r = F;
	r === null && wt();
	var i = void 0, a = zn(T), o = !P, s = /* @__PURE__ */ new Set();
	return dr(() => {
		var t = F, n = nt();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== Ct && n.reject(e);
			}).finally(cn);
		} catch (e) {
			n.reject(e), cn();
		}
		var c = M;
		if (o) {
			if (t.f & 32768) var l = ln();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(dn);
			else for (let e of s.values()) e.reject(dn);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== dn && (c.activate(), t ? (a.f |= _t, Un(a, t)) : (a.f & 8388608 && (a.f ^= _t), Un(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), cr(() => {
		for (let e of s) e.reject(dn);
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
	let t = /* @__PURE__ */ un(e);
	return Ir(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function pn(e) {
	let t = /* @__PURE__ */ un(e);
	return t.equals = Vt, t;
}
function mn(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) br(t[n]);
	}
}
function hn(e) {
	var t, n = F, r = e.parent;
	if (!Ar && r !== null && e.v !== T && r.f & 24576) return jt(), e.v;
	Pr(r);
	try {
		e.f &= ~mt, mn(e), t = Gr(e);
	} finally {
		Pr(n);
	}
	return t;
}
function gn(e) {
	var t = hn(e);
	if (!e.equals(t) && (e.wv = Hr(), (!M?.is_fork || e.deps === null) && (M === null ? e.v = t : (M.capture(e, t, !0), bn?.capture(e, t, !0)), e.deps === null))) {
		A(e, E);
		return;
	}
	Ar || (xn === null ? $t(e) : (sr() || M?.is_fork) && xn.set(e, t));
}
function _n(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && an(() => {
		t.ac.abort(Ct), t.ac = null;
	}), t.fn !== null && (t.teardown = et), qr(t, 0), vr(t));
}
function vn(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Jr(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/batch.js
var yn = null, M = null, bn = null, xn = null, Sn = null, Cn = !1, wn = !1, Tn = null, En = null, Dn = 0, On = 1, kn = class e {
	id = On++;
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
		yn === null ? yn = this : (yn.#n = this, this.#t = yn), yn = this;
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
			for (var r of n.d) A(r, it), t(r);
			for (r of n.m) A(r, at), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Dn++ > 1e3 && (this.#x(), An());
		for (let e of this.#u) this.#d.delete(e), A(e, it), this.schedule(e);
		for (let e of this.#d) A(e, at), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Tn = [], r = [], i = En = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Fn(e), this.#h() || this.discard(), t;
		}
		if (M = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Tn = null, En = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Pn(e, t);
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
		this.#r.clear(), bn = this, Mn(r), Mn(n), bn = null, this.#s?.resolve();
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
		e.f ^= E;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= E : i & 4 ? t.push(r) : Ur(r) && (i & 16 && this.#d.add(r), Jr(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), A(i, it), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), M = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) tn(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== T && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), xn?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		M = this;
	}
	deactivate() {
		M = null, xn = null;
	}
	flush() {
		try {
			wn = !0, M = this, this.#g();
		} finally {
			Dn = 0, Sn = null, Tn = null, En = null, wn = !1, M = null, xn = null, Ln.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(dn);
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
		this.#m || (this.#m = !0, Yt(() => {
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
		return (this.#s ??= nt()).promise;
	}
	static ensure() {
		if (M === null) {
			let t = M = new e();
			!wn && Yt(() => {
				t.#e || t.flush();
			});
		}
		return M;
	}
	apply() {
		xn = null;
	}
	schedule(e) {
		if (Sn = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (Tn !== null && t === F && (P === null || !(P.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= E;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? yn = e : t.#t = e, this.linked = !1;
		}
	}
};
function An() {
	try {
		Et();
	} catch (e) {
		Zt(e, Sn);
	}
}
var jn = null;
function Mn(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Ur(r) && (jn = /* @__PURE__ */ new Set(), Jr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Sr(r), jn?.size > 0)) {
				Ln.clear();
				for (let e of jn) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) jn.has(n) && (jn.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Jr(n);
					}
				}
				jn.clear();
			}
		}
		jn = null;
	}
}
function Nn(e) {
	M.schedule(e);
}
function Pn(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), A(e, E);
		for (var n = e.first; n !== null;) Pn(n, t), n = n.next;
	}
}
function Fn(e) {
	A(e, E);
	for (var t = e.first; t !== null;) Fn(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/sources.js
var In = /* @__PURE__ */ new Set(), Ln = /* @__PURE__ */ new Map(), Rn = !1;
function zn(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: zt,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Bn(e, t) {
	let n = zn(e, t);
	return Ir(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Vn(e, t = !1, n = !0) {
	let r = zn(e);
	return t || (r.equals = Vt), r;
}
function Hn(e, t, n = !1) {
	return P !== null && (!Mr || P.f & 131072) && Kt() && P.f & 4325394 && (Fr === null || !Fr.has(e)) && At(), Un(e, n ? qn(t) : t, En);
}
function Un(e, t, n = null) {
	if (!e.equals(t)) {
		Ln.set(e, Ar ? t : e.v);
		var r = kn.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && hn(t), xn === null && $t(t);
		}
		e.wv = Hr(), Kn(e, it, n), Kt() && F !== null && F.f & 1024 && !(F.f & 96) && (R === null ? Lr([e]) : R.push(e)), !r.is_fork && In.size > 0 && !Rn && Wn();
	}
	return t;
}
function Wn() {
	Rn = !1;
	for (let e of In) {
		e.f & 1024 && A(e, at);
		let t;
		try {
			t = Ur(e);
		} catch {
			t = !0;
		}
		t && Jr(e);
	}
	In.clear();
}
function Gn(e) {
	Hn(e, e.v + 1);
}
function Kn(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Kt(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === F)) {
			var l = (c & it) === 0;
			if (l && A(s, t), c & 131072) In.add(s);
			else if (c & 2) {
				var u = s;
				xn?.delete(u), c & 65536 || (c & 512 && (F === null || !(F.f & 2097152)) && (s.f |= mt), Kn(u, at, n));
			} else if (l) {
				var d = s;
				c & 16 && jn !== null && jn.add(d), n === null ? Nn(d) : n.push(d);
			}
		}
	}
}
function qn(e) {
	if (typeof e != "object" || !e || vt in e) return e;
	let t = $e(e);
	if (t !== Ze && t !== Qe) return e;
	var n = /* @__PURE__ */ new Map(), r = Ke(e), i = /* @__PURE__ */ Bn(0), a = null, o = Br, s = (e) => {
		if (Br === o) return e();
		var t = P, n = Br;
		Nr(null), Vr(o);
		var r = e();
		return Nr(t), Vr(n), r;
	};
	return r && n.set("length", /* @__PURE__ */ Bn(e.length, a)), new Proxy(e, {
		defineProperty(e, t, r) {
			(!("value" in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && Ot();
			var i = n.get(t);
			return i === void 0 ? s(() => {
				var e = /* @__PURE__ */ Bn(r.value, a);
				return n.set(t, e), e;
			}) : Hn(i, r.value, !0), !0;
		},
		deleteProperty(e, t) {
			var r = n.get(t);
			if (r === void 0) {
				if (t in e) {
					let e = s(() => /* @__PURE__ */ Bn(T, a));
					n.set(t, e), Gn(i);
				}
			} else Hn(r, T), Gn(i);
			return !0;
		},
		get(t, r, i) {
			if (r === vt) return e;
			var o = n.get(r), c = r in t;
			if (o === void 0 && (!c || Xe(t, r)?.writable) && (o = s(() => /* @__PURE__ */ Bn(qn(c ? t[r] : T), a)), n.set(r, o)), o !== void 0) {
				var l = z(o);
				return l === T ? void 0 : l;
			}
			return Reflect.get(t, r, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var r = Reflect.getOwnPropertyDescriptor(e, t);
			if (r && "value" in r) {
				var i = n.get(t);
				i && (r.value = z(i));
			} else if (r === void 0) {
				var a = n.get(t), o = a?.v;
				if (a !== void 0 && o !== T) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return r;
		},
		has(e, t) {
			if (t === vt) return !0;
			var r = n.get(t), i = r !== void 0 && r.v !== T || Reflect.has(e, t);
			return (r !== void 0 || F !== null && (!i || Xe(e, t)?.writable)) && (r === void 0 && (r = s(() => /* @__PURE__ */ Bn(i ? qn(e[t]) : T, a)), n.set(t, r)), z(r) === T) ? !1 : i;
		},
		set(e, t, o, c) {
			var l = n.get(t), u = t in e;
			if (r && t === "length") for (var d = o; d < l.v; d += 1) {
				var f = n.get(d + "");
				f === void 0 ? d in e && (f = s(() => /* @__PURE__ */ Bn(T, a)), n.set(d + "", f)) : Hn(f, T);
			}
			if (l === void 0) (!u || Xe(e, t)?.writable) && (l = s(() => /* @__PURE__ */ Bn(void 0, a)), Hn(l, qn(o)), n.set(t, l));
			else {
				u = l.v !== T;
				var p = s(() => qn(o));
				Hn(l, p);
			}
			var m = Reflect.getOwnPropertyDescriptor(e, t);
			if (m?.set && m.set.call(c, o), !u) {
				if (r && typeof t == "string") {
					var h = n.get("length"), g = Number(t);
					Number.isInteger(g) && g >= h.v && Hn(h, g + 1);
				}
				Gn(i);
			}
			return !0;
		},
		ownKeys(e) {
			z(i);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = n.get(e);
				return t === void 0 || t.v !== T;
			});
			for (var [r, a] of n) a.v !== T && !(r in e) && t.push(r);
			return t;
		},
		setPrototypeOf() {
			kt();
		}
	});
}
var Jn, Yn, Xn;
function Zn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Qn(e) {
	return Yn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function $n(e) {
	return Xn.call(e);
}
function N(e, t) {
	if (!D) return /* @__PURE__ */ Qn(e);
	var n = /* @__PURE__ */ Qn(O);
	if (n === null) n = O.appendChild(Zn());
	else if (t && n.nodeType !== 3) {
		var r = Zn();
		return n?.before(r), Pt(r), r;
	}
	return t && ir(n), Pt(n), n;
}
function er(e, t = 1, n = !1) {
	let r = D ? O : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ $n(r);
	if (!D) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Zn();
			return r === null ? i?.after(a) : r.before(a), Pt(a), a;
		}
		ir(r);
	}
	return Pt(r), r;
}
function tr(e) {
	e.textContent = "";
}
function nr() {
	return !1;
}
function rr(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function ir(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/effects.js
function ar(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function or(e, t) {
	var n = F;
	n !== null && n.f & 8192 && (e |= ot);
	var r = {
		ctx: Ht,
		deps: null,
		nodes: null,
		f: e | it | 512,
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
	if (e & 4) Tn === null ? kn.ensure().schedule(r) : Tn.push(r);
	else if (t !== null) {
		try {
			Jr(r);
		} catch (e) {
			throw br(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ut));
	}
	if (i !== null && (i.parent = n, n !== null && ar(i, n), P !== null && P.f & 2 && !(e & 64))) {
		var a = P;
		(a.effects ??= []).push(i);
	}
	return r;
}
function sr() {
	return P !== null && !Mr;
}
function cr(e) {
	let t = or(8, null);
	return A(t, E), t.teardown = e, t;
}
function lr(e) {
	return or(4 | ft, e);
}
function ur(e) {
	return or(4, e);
}
function dr(e) {
	return or(gt | dt, e);
}
function fr(e, t = 0) {
	return or(8 | t, e);
}
function pr(e, t = [], n = [], r = []) {
	on(r, t, n, (t) => {
		or(8, () => {
			e(...t.map(z));
		});
	});
}
function mr(e, t = 0) {
	return or(16 | t, e);
}
function hr(e, t = 0) {
	return or(rt | t, e);
}
function gr(e) {
	return or(32 | dt, e);
}
function _r(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Ar, n = P;
		jr(!0), Nr(null);
		try {
			t.call(null);
		} finally {
			jr(e), Nr(n);
		}
	}
}
function vr(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && an(() => {
			e.abort(Ct);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : br(n, t), n = r;
	}
}
function yr(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || br(t), t = n;
	}
}
function br(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (xr(e.nodes.start, e.nodes.end), n = !0), e.f |= lt, vr(e, t && !n), qr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	_r(e), e.f ^= lt, e.f |= st;
	var i = e.parent;
	i !== null && i.first !== null && Sr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function xr(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ $n(e);
		e.remove(), e = n;
	}
}
function Sr(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Cr(e, t, n = !0) {
	var r = [];
	wr(e, r, !0);
	var i = () => {
		n && br(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function wr(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= ot;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				wr(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Tr(e) {
	Er(e, !0);
}
function Er(e, t) {
	if (e.f & 8192) {
		e.f ^= ot, e.f & 1024 || (A(e, it), kn.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Er(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Dr(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ $n(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/legacy.js
var Or = null, kr = !1, Ar = !1;
function jr(e) {
	Ar = e;
}
var P = null, Mr = !1;
function Nr(e) {
	P = e;
}
var F = null;
function Pr(e) {
	F = e;
}
var Fr = null;
function Ir(e) {
	P !== null && (Fr ??= /* @__PURE__ */ new Set()).add(e);
}
var I = null, L = 0, R = null;
function Lr(e) {
	R = e;
}
var Rr = 1, zr = 0, Br = zr;
function Vr(e) {
	Br = e;
}
function Hr() {
	return ++Rr;
}
function Ur(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~mt), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Ur(a) && gn(a), a.wv > e.wv) return !0;
		}
		t & 512 && xn === null && A(e, E);
	}
	return !1;
}
function Wr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Fr !== null && Fr.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Wr(a, t, !1) : t === a && (n ? A(a, it) : a.f & 1024 && A(a, at), Nn(a));
	}
}
function Gr(e) {
	var t = I, n = L, r = R, i = P, a = Fr, o = Ht, s = Mr, c = Br, l = e.f;
	I = null, L = 0, R = null, P = l & 96 ? null : e, Fr = null, Ut(e.ctx), Mr = !1, Br = ++zr, e.ac !== null && (an(() => {
		e.ac.abort(Ct);
	}), e.ac = null);
	try {
		e.f |= ht;
		var u = e.fn, d = u();
		e.f |= ct;
		var f = e.deps, p = M?.is_fork;
		if (I !== null) {
			var m;
			if (p || qr(e, L), f !== null && L > 0) for (f.length = L + I.length, m = 0; m < I.length; m++) f[L + m] = I[m];
			else e.deps = f = I;
			if (sr() && e.f & 512) for (m = L; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && L < f.length && (qr(e, L), f.length = L);
		if (Kt() && R !== null && !Mr && f !== null && !(e.f & 6146)) for (m = 0; m < R.length; m++) Wr(R[m], e);
		if (i !== null && i !== e) {
			if (zr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = zr;
			if (t !== null) for (let e of t) e.rv = zr;
			R !== null && (r === null ? r = R : r.push(...R));
		}
		return e.f & 8388608 && (e.f ^= _t), d;
	} catch (e) {
		return Xt(e);
	} finally {
		e.f ^= ht, I = t, L = n, R = r, P = i, Fr = a, Ut(o), Mr = s, Br = c;
	}
}
function Kr(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var r = qe.call(n, e);
		if (r !== -1) {
			var i = n.length - 1;
			i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
		}
	}
	if (n === null && t.f & 2 && (I === null || !Je.call(I, t))) {
		var a = t;
		a.f & 512 && (a.f ^= 512, a.f &= ~mt), a.v !== T && $t(a), a.ac !== null && an(() => {
			a.ac.abort(Ct), a.ac = null, A(a, it);
		}), _n(a), qr(a, 0);
	}
}
function qr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Kr(e, n[r]);
}
function Jr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		A(e, E);
		var n = F, r = kr;
		F = e, kr = !(t & 96);
		try {
			t & 16777232 ? yr(e) : vr(e), _r(e);
			var i = Gr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Rr;
		} finally {
			kr = r, F = n;
		}
	}
}
function z(e) {
	var t = !!(e.f & 2);
	if (Or?.add(e), P !== null && !Mr && !(F !== null && F.f & 16384) && (Fr === null || !Fr.has(e))) {
		var n = P.deps;
		if (P.f & 2097152) e.rv < zr && (e.rv = zr, I === null && n !== null && n[L] === e ? L++ : I === null ? I = [e] : I.push(e));
		else {
			P.deps ??= [], Je.call(P.deps, e) || P.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [P] : Je.call(r, P) || r.push(P);
		}
	}
	if (Ar && Ln.has(e)) return Ln.get(e);
	if (t) {
		var i = e;
		if (Ar) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || Xr(i)) && (a = hn(i)), Ln.set(i, a), a;
		}
		var o = !(i.f & 512) && !Mr && P !== null && (kr || !!(P.f & 512)), s = (i.f & ct) === 0;
		Ur(i) && (o && (i.f |= 512), gn(i)), o && !s && (vn(i), Yr(i));
	}
	if (xn?.has(e)) return xn.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Yr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (vn(t), Yr(t));
}
function Xr(e) {
	if (e.v === T) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Ln.has(t) || t.f & 2 && Xr(t)) return !0;
	return !1;
}
function Zr(e) {
	var t = Mr;
	try {
		return Mr = !0, e();
	} finally {
		Mr = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/events.js
var Qr = Symbol("events"), $r = /* @__PURE__ */ new Set(), ei = /* @__PURE__ */ new Set();
function ti(e, t, n) {
	(t[Qr] ??= {})[e] = n;
}
function ni(e) {
	for (var t = 0; t < e.length; t++) $r.add(e[t]);
	for (var n of ei) n(e);
}
var ri = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function ii(e) {
	return ri?.createHTML(e) ?? e;
}
function ai(e) {
	var t = rr("template");
	return t.innerHTML = ii(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/template.js
function oi(e, t) {
	var n = F;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function si(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (D) return oi(O, null), O;
		i === void 0 && (i = ai(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Qn(i)));
		var t = r || Jn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Qn(t), s = t.lastChild;
			oi(o, s);
		} else oi(t, t);
		return t;
	};
}
function ci(e, t) {
	if (D) {
		var n = F;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = O), Ft();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
function li(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[St] ??= e.nodeValue) && (e[St] = n, e.nodeValue = `${n}`);
}
var ui = class {
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
			if (n) Tr(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Tr(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (br(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Dr(r, t), t.append(Zn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else br(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Cr(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (br(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = M, r = nr();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = Zn();
				i.append(a), this.#n.set(e, {
					effect: gr(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, gr(() => t(this.anchor)));
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
function di(e, t, n = !1) {
	var r;
	D && (r = O, Ft());
	var i = new ui(e), a = n ? ut : 0;
	function o(e, t) {
		if (D) {
			var n = Rt(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Lt();
				Pt(a), i.anchor = a, Nt(!1), i.ensure(e, t), Nt(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	mr(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/blocks/each.js
function fi(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		Cr(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					pi(e, Ye(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var c = r.length === 0 && n !== null && e.pending.size === 0;
		if (c) {
			var l = n, u = l.parentNode;
			tr(u), u.append(l), e.items.clear();
		}
		pi(e, t, !c);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function pi(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= pt, Dr(a, document.createDocumentFragment())) : br(t[i], n);
	}
}
var mi;
function hi(e, t, n, r, i, a = null) {
	var o = e, s = /* @__PURE__ */ new Map();
	if (t & 4) {
		var c = e;
		o = D ? Pt(/* @__PURE__ */ Qn(c)) : c.appendChild(Zn());
	}
	D && Ft();
	var l = null, u = /* @__PURE__ */ pn(() => {
		var e = n();
		return Ke(e) ? e : e == null ? [] : Ye(e);
	}), d, f = /* @__PURE__ */ new Map(), p = !0;
	function m(e) {
		g.effect.f & 16384 || (g.pending.delete(e), g.fallback = l, _i(g, d, o, t, r), l !== null && (d.length === 0 ? l.f & 33554432 ? (l.f ^= pt, yi(l, null, o)) : Tr(l) : Cr(l, () => {
			l = null;
		})));
	}
	function h(e) {
		g.pending.delete(e);
	}
	var g = {
		effect: mr(() => {
			d = z(u);
			var e = d.length;
			let c = !1;
			D && Rt(o) === "[!" != (e === 0) && (o = Lt(), Pt(o), Nt(!1), c = !0);
			for (var g = /* @__PURE__ */ new Set(), _ = M, v = nr(), y = 0; y < e; y += 1) {
				D && O.nodeType === 8 && O.data === "]" && (o = O, c = !0, Nt(!1));
				var b = d[y], x = r(b, y), S = p ? null : s.get(x);
				S ? (S.v && Un(S.v, b), S.i && Un(S.i, y), v && _.unskip_effect(S.e)) : (S = vi(s, p ? o : mi ??= Zn(), b, x, y, i, t, n), p || (S.e.f |= pt), s.set(x, S)), g.add(x);
			}
			if (e === 0 && a && !l && (p ? l = gr(() => a(o)) : (l = gr(() => a(mi ??= Zn())), l.f |= pt)), e > g.size && Tt("", "", ""), D && e > 0 && Pt(Lt()), !p) {
				if (f.set(_, g), v) {
					for (let [e, t] of s) g.has(e) || _.skip_effect(t.e);
					_.oncommit(m), _.ondiscard(h);
				} else m(_);
			}
			c && Nt(!0), z(u);
		}),
		flags: t,
		items: s,
		pending: f,
		outrogroups: null,
		fallback: l
	};
	p = !1, D && (o = O);
}
function gi(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function _i(e, t, n, r, i) {
	var a = !!(r & 8), o = t.length, s = e.items, c = gi(e.effect.first), l, u = null, d, f = [], p = [], m, h, g, _;
	if (a) for (_ = 0; _ < o; _ += 1) m = t[_], h = i(m, _), g = s.get(h).e, g.f & 33554432 || (g.nodes?.a?.measure(), (d ??= /* @__PURE__ */ new Set()).add(g));
	for (_ = 0; _ < o; _ += 1) {
		if (m = t[_], h = i(m, _), g = s.get(h).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(g), t.done.delete(g);
		if (g.f & 8192 && (Tr(g), a && (g.nodes?.a?.unfix(), (d ??= /* @__PURE__ */ new Set()).delete(g))), g.f & 33554432) {
			if (g.f ^= pt, g === c) yi(g, null, n);
			else {
				var v = u ? u.next : c;
				g === e.effect.last && (e.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), bi(e, u, g), bi(e, g, v), yi(g, v, n), u = g, f = [], p = [], c = gi(u.next);
				continue;
			}
		}
		if (g !== c) {
			if (l !== void 0 && l.has(g)) {
				if (f.length < p.length) {
					var y = p[0], b;
					u = y.prev;
					var x = f[0], S = f[f.length - 1];
					for (b = 0; b < f.length; b += 1) yi(f[b], y, n);
					for (b = 0; b < p.length; b += 1) l.delete(p[b]);
					bi(e, x.prev, S.next), bi(e, u, x), bi(e, S, y), c = y, u = S, --_, f = [], p = [];
				} else l.delete(g), yi(g, c, n), bi(e, g.prev, g.next), bi(e, g, u === null ? e.effect.first : u.next), bi(e, u, g), u = g;
				continue;
			}
			for (f = [], p = []; c !== null && c !== g;) (l ??= /* @__PURE__ */ new Set()).add(c), p.push(c), c = gi(c.next);
			if (c === null) continue;
		}
		g.f & 33554432 || f.push(g), u = g, c = gi(g.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (pi(e, Ye(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (c !== null || l !== void 0) {
		var C = [];
		if (l !== void 0) for (g of l) g.f & 8192 || C.push(g);
		for (; c !== null;) !(c.f & 8192) && c !== e.fallback && C.push(c), c = gi(c.next);
		var w = C.length;
		if (w > 0) {
			var ee = r & 4 && o === 0 ? n : null;
			if (a) {
				for (_ = 0; _ < w; _ += 1) C[_].nodes?.a?.measure();
				for (_ = 0; _ < w; _ += 1) C[_].nodes?.a?.fix();
			}
			fi(e, C, ee);
		}
	}
	a && Yt(() => {
		if (d !== void 0) for (g of d) g.nodes?.a?.apply();
	});
}
function vi(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? zn(n) : /* @__PURE__ */ Vn(n, !1, !1) : null, l = o & 2 ? zn(i) : null;
	return {
		v: c,
		i: l,
		e: gr(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function yi(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ $n(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function bi(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function xi(e, t) {
	var n = void 0, r;
	hr(() => {
		n !== (n = t()) && (r &&= (br(r), null), n && (r = gr(() => {
			ur(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/shared/attributes.js
var Si = [..." 	\n\r\f\xA0\v﻿"];
function Ci(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Si.includes(r[o - 1])) && (s === r.length || Si.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function wi(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Ti(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Ei(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Ti)), i && c.push(...Object.keys(i).map(Ti));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Ti(e.substring(l, u).trim());
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
		return r && (n += wi(r)), i && (n += wi(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/class.js
function Di(e, t, n, r, i, a) {
	var o = e[bt];
	if (D || o !== n || o === void 0) {
		var s = Ci(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[bt] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/style.js
function Oi(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ki(e, t, n, r) {
	var i = e[xt];
	if (D || i !== t) {
		var a = Ei(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[xt] = t;
	} else r && (Array.isArray(r) ? (Oi(e, n?.[0], r[0]), Oi(e, n?.[1], r[1], "important")) : Oi(e, n, r));
	return r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ai(e, t) {
	return e === t || e?.[vt] === t;
}
function ji(e = {}, t, n, r) {
	var i = Ht.r, a = F;
	return ur(() => {
		var o, s;
		return fr(() => {
			o = s, s = r?.() || [], Zr(() => {
				Ai(n(...s), e) || (t(e, ...s), o && Ai(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Ai(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/client/reactivity/props.js
function Mi(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), s = r, c = !0, l = void 0, u = () => o && i ? (l ??= /* @__PURE__ */ un(r), z(l)) : (c && (c = !1, s = o ? Zr(r) : r), s);
	let d;
	if (a) {
		var f = vt in e || yt in e;
		d = Xe(e, t)?.set ?? (f && t in e ? (n) => e[t] = n : void 0);
	}
	var p, m = !1;
	a ? [p, m] = rn(() => e[t]) : p = e[t], p === void 0 && r !== void 0 && (p = u(), d && (i && Dt(t), d(p)));
	var h = i ? () => {
		var n = e[t];
		return n === void 0 ? u() : (c = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (s = void 0), n === void 0 ? s : n;
	};
	if (i && !(n & 4)) return h;
	if (d) {
		var g = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || g || m) && d(t ? h() : e), e) : h();
		});
	}
	var _ = !1, v = (n & 1 ? un : pn)(() => (_ = !1, h()));
	a && z(v);
	var y = F;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? z(v) : i && a ? qn(e) : e;
			return Hn(v, n), _ = !0, s !== void 0 && (s = n), e;
		}
		return Ar && _ || y.f & 16384 ? v.v : z(v);
	});
}
var Ni = "tool-wallpaper", Pi = "wallpaper_image";
function Fi(e) {
	let t = "";
	for (let n = 0; n < e.length; n += 1) t += String.fromCharCode(e[n]);
	return btoa(t);
}
function Ii(e) {
	return `data:${e.mimeType || "image/jpeg"};base64,${e.base64}`;
}
async function Li(e) {
	let t = await e.arrayBuffer();
	return {
		mimeType: e.type || "image/jpeg",
		base64: Fi(new Uint8Array(t))
	};
}
async function Ri(e, t = Ni) {
	let n = await e.getPluginData(t, Pi);
	return n?.base64 ? Ii(n) : null;
}
async function zi(e, t, n = Ni) {
	let r = await Li(t);
	return await e.setPluginData(n, Pi, r), Ii(r);
}
async function Bi(e, t = Ni) {
	await e.deletePluginData(t, Pi);
}
//#endregion
//#region packages/plugins/wallpaper/src/runtime.svelte.ts
var Vi = null, Hi = /* @__PURE__ */ Bn(null), Ui = null, Wi = /* @__PURE__ */ new Set();
function Gi(e) {
	Hn(Hi, e, !0);
	for (let t of Wi) try {
		t(e);
	} catch (e) {
		console.error("[WallpaperRuntime] listener error:", e);
	}
	Ui?.(e);
}
function Ki(e) {
	Ui = e, e && e(z(Hi));
}
function qi() {
	return {
		get uri() {
			return z(Hi);
		},
		get hasWallpaper() {
			return !!z(Hi);
		},
		clearLocal() {
			Gi(null);
		},
		async syncFromStorage(e) {
			if (!e || !Vi) {
				Gi(null);
				return;
			}
			Gi(await Ri(Vi, Ni));
		},
		async setWallpaper(e) {
			if (Vi) {
				if (!e) {
					await Bi(Vi, Ni), Gi(null);
					return;
				}
				Gi(await zi(Vi, e, Ni));
			}
		},
		async clearPersisted() {
			Vi && (await Bi(Vi, Ni), Gi(null));
		}
	};
}
function Ji(e) {
	Vi = e;
}
function Yi() {
	Vi = null, Ui = null, Gi(null);
}
//#endregion
//#region packages/plugins/wallpaper/src/create-wallpaper-plugin.ts
var Xi = "wallpaper", Zi = He({ wallpaper: {
	type: "wallpaper-preview",
	title: () => "选择壁纸图片",
	description: () => "支持 PNG、JPG、WebP 格式图片，自动提取并应用主题色彩",
	accept: "image/*",
	required: !1
} }), Qi = {
	id: Xi,
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
async function $i(e) {
	let t = e.wallpaper, n = qi();
	if (t instanceof Uint8Array) {
		await n.setWallpaper(new Blob([t]));
		return;
	}
	t === null && await n.setWallpaper(null);
}
function ea(e = {}) {
	let { screenComponent: t } = e;
	return {
		id: Ni,
		name: () => "课表壁纸",
		version: "1.0.0",
		description: () => "自定义课表背景壁纸与主题取色",
		category: "tool",
		order: 40,
		author: "Chronos Community",
		homepage: "https://github.com/CQUT-OpenProject/Chronos",
		configSchema: Zi,
		defaultConfig: {},
		async apply(e) {
			Ji(e.service(We)), Ki((t) => {
				e.emit("wallpaper:changed", { uri: t });
			}), e.on("wallpaper:set", async ({ blob: e }) => {
				await qi().setWallpaper(e);
			}), e.on("wallpaper:hydrate", () => {
				e.emit("wallpaper:changed", { uri: qi().uri });
			}), e.on("config:changed", async ({ pluginId: e, config: t }) => {
				e === "tool-wallpaper" && await $i(t);
			}), await qi().syncFromStorage(!0), e.registerSlot("mine.item", {
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
				id: Ni,
				title: () => "设置课表壁纸",
				...t ? { component: t } : {},
				schema: Zi
			}), e.registerSlot("theme.definition", Qi);
		},
		async dispose() {
			Ki(null), Yi();
		}
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.9_@typescript-eslint+types@8.66.0/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/math_utils.js
function B(e) {
	return e < 0 ? -1 : e === 0 ? 0 : 1;
}
function ta(e, t, n) {
	return (1 - n) * e + n * t;
}
function na(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function V(e, t, n) {
	return n < e ? e : n > t ? t : n;
}
function ra(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function ia(e, t) {
	return [
		e[0] * t[0][0] + e[1] * t[0][1] + e[2] * t[0][2],
		e[0] * t[1][0] + e[1] * t[1][1] + e[2] * t[1][2],
		e[0] * t[2][0] + e[1] * t[2][1] + e[2] * t[2][2]
	];
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/utils/color_utils.js
var aa = [
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
], oa = [
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
], sa = [
	95.047,
	100,
	108.883
];
function ca(e, t, n) {
	return (255 << 24 | (e & 255) << 16 | (t & 255) << 8 | n & 255) >>> 0;
}
function la(e) {
	return ca(ba(e[0]), ba(e[1]), ba(e[2]));
}
function ua(e) {
	return e >> 16 & 255;
}
function da(e) {
	return e >> 8 & 255;
}
function fa(e) {
	return e & 255;
}
function pa(e, t, n) {
	let r = oa, i = r[0][0] * e + r[0][1] * t + r[0][2] * n, a = r[1][0] * e + r[1][1] * t + r[1][2] * n, o = r[2][0] * e + r[2][1] * t + r[2][2] * n;
	return ca(ba(i), ba(a), ba(o));
}
function ma(e) {
	return ia([
		ya(ua(e)),
		ya(da(e)),
		ya(fa(e))
	], aa);
}
function ha(e) {
	let t = ba(_a(e));
	return ca(t, t, t);
}
function ga(e) {
	let t = ma(e)[1];
	return 116 * Sa(t / 100) - 16;
}
function _a(e) {
	return 100 * Ca((e + 16) / 116);
}
function va(e) {
	return Sa(e / 100) * 116 - 16;
}
function ya(e) {
	let t = e / 255;
	return t <= .040449936 ? t / 12.92 * 100 : ((t + .055) / 1.055) ** 2.4 * 100;
}
function ba(e) {
	let t = e / 100, n = 0;
	return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, na(0, 255, Math.round(n * 255));
}
function xa() {
	return sa;
}
function Sa(e) {
	return e > .008856451679035631 ? e ** (1 / 3) : (903.2962962962963 * e + 16) / 116;
}
function Ca(e) {
	let t = e * e * e;
	return t > .008856451679035631 ? t : (116 * e - 16) / 903.2962962962963;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/viewing_conditions.js
var wa = class e {
	static make(t = xa(), n = 200 / Math.PI * _a(50) / 100, r = 50, i = 2, a = !1) {
		let o = t, s = o[0] * .401288 + o[1] * .650173 + o[2] * -.051461, c = o[0] * -.250268 + o[1] * 1.204414 + o[2] * .045854, l = o[0] * -.002079 + o[1] * .048952 + o[2] * .953127, u = .8 + i / 10, d = u >= .9 ? ta(.59, .69, (u - .9) * 10) : ta(.525, .59, (u - .8) * 10), f = a ? 1 : u * (1 - 1 / 3.6 * Math.exp((-n - 42) / 92));
		f = f > 1 ? 1 : f < 0 ? 0 : f;
		let p = u, m = [
			100 / s * f + 1 - f,
			100 / c * f + 1 - f,
			100 / l * f + 1 - f
		], h = 1 / (5 * n + 1), g = h * h * h * h, _ = 1 - g, v = g * n + .1 * _ * _ * Math.cbrt(5 * n), y = _a(r) / t[1], b = 1.48 + Math.sqrt(y), x = .725 / y ** .2, S = x, C = [
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
wa.DEFAULT = wa.make();
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/hct/cam16.js
var Ta = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.hue = e, this.chroma = t, this.j = n, this.q = r, this.m = i, this.s = a, this.jstar = o, this.astar = s, this.bstar = c;
	}
	distance(e) {
		let t = this.jstar - e.jstar, n = this.astar - e.astar, r = this.bstar - e.bstar;
		return 1.41 * Math.sqrt(t * t + n * n + r * r) ** .63;
	}
	static fromInt(t) {
		return e.fromIntInViewingConditions(t, wa.DEFAULT);
	}
	static fromIntInViewingConditions(t, n) {
		let r = (t & 16711680) >> 16, i = (t & 65280) >> 8, a = t & 255, o = ya(r), s = ya(i), c = ya(a), l = .41233895 * o + .35762064 * s + .18051042 * c, u = .2126 * o + .7152 * s + .0722 * c, d = .01932141 * o + .11916382 * s + .95034478 * c, f = .401288 * l + .650173 * u - .051461 * d, p = -.250268 * l + 1.204414 * u + .045854 * d, m = -.002079 * l + .048952 * u + .953127 * d, h = n.rgbD[0] * f, g = n.rgbD[1] * p, _ = n.rgbD[2] * m, v = (n.fl * Math.abs(h) / 100) ** .42, y = (n.fl * Math.abs(g) / 100) ** .42, b = (n.fl * Math.abs(_) / 100) ** .42, x = B(h) * 400 * v / (v + 27.13), S = B(g) * 400 * y / (y + 27.13), C = B(_) * 400 * b / (b + 27.13), w = (11 * x + -12 * S + C) / 11, ee = (x + S - 2 * C) / 9, te = (20 * x + 20 * S + 21 * C) / 20, ne = (40 * x + 20 * S + C) / 20, re = ra(Math.atan2(ee, w) * 180 / Math.PI), ie = re * Math.PI / 180, ae = 100 * (ne * n.nbb / n.aw) ** +(n.c * n.z), oe = 4 / n.c * Math.sqrt(ae / 100) * (n.aw + 4) * n.fLRoot, se = re < 20.14 ? re + 360 : re, ce = (5e4 / 13 * (.25 * (Math.cos(se * Math.PI / 180 + 2) + 3.8)) * n.nc * n.ncb * Math.sqrt(w * w + ee * ee) / (te + .305)) ** .9 * (1.64 - .29 ** n.n) ** .73, le = ce * Math.sqrt(ae / 100), ue = le * n.fLRoot, de = 50 * Math.sqrt(ce * n.c / (n.aw + 4)), fe = (1 + 100 * .007) * ae / (1 + .007 * ae), pe = 1 / .0228 * Math.log(1 + .0228 * ue), me = pe * Math.cos(ie), he = pe * Math.sin(ie);
		return new e(re, le, ae, oe, ue, de, fe, me, he);
	}
	static fromJch(t, n, r) {
		return e.fromJchInViewingConditions(t, n, r, wa.DEFAULT);
	}
	static fromJchInViewingConditions(t, n, r, i) {
		let a = 4 / i.c * Math.sqrt(t / 100) * (i.aw + 4) * i.fLRoot, o = n * i.fLRoot, s = n / Math.sqrt(t / 100), c = 50 * Math.sqrt(s * i.c / (i.aw + 4)), l = r * Math.PI / 180, u = (1 + 100 * .007) * t / (1 + .007 * t), d = 1 / .0228 * Math.log(1 + .0228 * o), f = d * Math.cos(l), p = d * Math.sin(l);
		return new e(r, n, t, a, o, c, u, f, p);
	}
	static fromUcs(t, n, r) {
		return e.fromUcsInViewingConditions(t, n, r, wa.DEFAULT);
	}
	static fromUcsInViewingConditions(t, n, r, i) {
		let a = n, o = r, s = Math.sqrt(a * a + o * o), c = (Math.exp(s * .0228) - 1) / .0228 / i.fLRoot, l = 180 / Math.PI * Math.atan2(o, a);
		l < 0 && (l += 360);
		let u = t / (1 - (t - 100) * .007);
		return e.fromJchInViewingConditions(u, c, l, i);
	}
	toInt() {
		return this.viewed(wa.DEFAULT);
	}
	viewed(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = B(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = B(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = B(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return pa(1.86206786 * x - 1.01125463 * S + .14918677 * C, .38752654 * x + .62144744 * S - .00897398 * C, -.0158415 * x - .03412294 * S + 1.04996444 * C);
	}
	static fromXyzInViewingConditions(t, n, r, i) {
		let a = .401288 * t + .650173 * n - .051461 * r, o = -.250268 * t + 1.204414 * n + .045854 * r, s = -.002079 * t + .048952 * n + .953127 * r, c = i.rgbD[0] * a, l = i.rgbD[1] * o, u = i.rgbD[2] * s, d = (i.fl * Math.abs(c) / 100) ** .42, f = (i.fl * Math.abs(l) / 100) ** .42, p = (i.fl * Math.abs(u) / 100) ** .42, m = B(c) * 400 * d / (d + 27.13), h = B(l) * 400 * f / (f + 27.13), g = B(u) * 400 * p / (p + 27.13), _ = (11 * m + -12 * h + g) / 11, v = (m + h - 2 * g) / 9, y = (20 * m + 20 * h + 21 * g) / 20, b = (40 * m + 20 * h + g) / 20, x = Math.atan2(v, _) * 180 / Math.PI, S = x < 0 ? x + 360 : x >= 360 ? x - 360 : x, C = S * Math.PI / 180, w = 100 * (b * i.nbb / i.aw) ** +(i.c * i.z), ee = 4 / i.c * Math.sqrt(w / 100) * (i.aw + 4) * i.fLRoot, te = S < 20.14 ? S + 360 : S, ne = (5e4 / 13 * (1 / 4 * (Math.cos(te * Math.PI / 180 + 2) + 3.8)) * i.nc * i.ncb * Math.sqrt(_ * _ + v * v) / (y + .305)) ** .9 * (1.64 - .29 ** i.n) ** .73, re = ne * Math.sqrt(w / 100), ie = re * i.fLRoot, ae = 50 * Math.sqrt(ne * i.c / (i.aw + 4)), oe = (1 + 100 * .007) * w / (1 + .007 * w), se = Math.log(1 + .0228 * ie) / .0228, ce = se * Math.cos(C), le = se * Math.sin(C);
		return new e(S, re, w, ee, ie, ae, oe, ce, le);
	}
	xyzInViewingConditions(e) {
		let t = ((this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100)) / (1.64 - .29 ** e.n) ** .73) ** (1 / .9), n = this.hue * Math.PI / 180, r = .25 * (Math.cos(n + 2) + 3.8), i = e.aw * (this.j / 100) ** (1 / e.c / e.z), a = 5e4 / 13 * r * e.nc * e.ncb, o = i / e.nbb, s = Math.sin(n), c = Math.cos(n), l = 23 * (o + .305) * t / (23 * a + 11 * t * c + 108 * t * s), u = l * c, d = l * s, f = (460 * o + 451 * u + 288 * d) / 1403, p = (460 * o - 891 * u - 261 * d) / 1403, m = (460 * o - 220 * u - 6300 * d) / 1403, h = Math.max(0, 27.13 * Math.abs(f) / (400 - Math.abs(f))), g = B(f) * (100 / e.fl) * h ** (1 / .42), _ = Math.max(0, 27.13 * Math.abs(p) / (400 - Math.abs(p))), v = B(p) * (100 / e.fl) * _ ** (1 / .42), y = Math.max(0, 27.13 * Math.abs(m) / (400 - Math.abs(m))), b = B(m) * (100 / e.fl) * y ** (1 / .42), x = g / e.rgbD[0], S = v / e.rgbD[1], C = b / e.rgbD[2];
		return [
			1.86206786 * x - 1.01125463 * S + .14918677 * C,
			.38752654 * x + .62144744 * S - .00897398 * C,
			-.0158415 * x - .03412294 * S + 1.04996444 * C
		];
	}
}, Ea = class e {
	static sanitizeRadians(e) {
		return (e + Math.PI * 8) % (Math.PI * 2);
	}
	static trueDelinearized(e) {
		let t = e / 100, n = 0;
		return n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055, n * 255;
	}
	static chromaticAdaptation(e) {
		let t = Math.abs(e) ** .42;
		return B(e) * 400 * t / (t + 27.13);
	}
	static hueOf(t) {
		let n = ia(t, e.SCALED_DISCOUNT_FROM_LINRGB), r = e.chromaticAdaptation(n[0]), i = e.chromaticAdaptation(n[1]), a = e.chromaticAdaptation(n[2]), o = (11 * r + -12 * i + a) / 11, s = (r + i - 2 * a) / 9;
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
		return B(e) * n ** (1 / .42);
	}
	static findResultByJ(t, n, r) {
		let i = Math.sqrt(r) * 11, a = wa.DEFAULT, o = 1 / (1.64 - .29 ** a.n) ** .73, s = .25 * (Math.cos(t + 2) + 3.8) * (5e4 / 13) * a.nc * a.ncb, c = Math.sin(t), l = Math.cos(t);
		for (let t = 0; t < 5; t++) {
			let u = i / 100, d = ((n === 0 || i === 0 ? 0 : n / Math.sqrt(u)) * o) ** (1 / .9), f = a.aw * u ** (1 / a.c / a.z) / a.nbb, p = 23 * (f + .305) * d / (23 * s + 11 * d * l + 108 * d * c), m = p * l, h = p * c, g = (460 * f + 451 * m + 288 * h) / 1403, _ = (460 * f - 891 * m - 261 * h) / 1403, v = (460 * f - 220 * m - 6300 * h) / 1403, y = ia([
				e.inverseChromaticAdaptation(g),
				e.inverseChromaticAdaptation(_),
				e.inverseChromaticAdaptation(v)
			], e.LINRGB_FROM_SCALED_DISCOUNT);
			if (y[0] < 0 || y[1] < 0 || y[2] < 0) return 0;
			let b = e.Y_FROM_LINRGB[0], x = e.Y_FROM_LINRGB[1], S = e.Y_FROM_LINRGB[2], C = b * y[0] + x * y[1] + S * y[2];
			if (C <= 0) return 0;
			if (t === 4 || Math.abs(C - r) < .002) return y[0] > 100.01 || y[1] > 100.01 || y[2] > 100.01 ? 0 : la(y);
			i -= (C - r) * i / (2 * C);
		}
		return 0;
	}
	static solveToInt(t, n, r) {
		if (n < 1e-4 || r < 1e-4 || r > 99.9999) return ha(r);
		t = ra(t);
		let i = t / 180 * Math.PI, a = _a(r), o = e.findResultByJ(i, n, a);
		return o === 0 ? la(e.bisectToLimit(a, i)) : o;
	}
	static solveToCam(t, n, r) {
		return Ta.fromInt(e.solveToInt(t, n, r));
	}
};
Ea.SCALED_DISCOUNT_FROM_LINRGB = [
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
], Ea.LINRGB_FROM_SCALED_DISCOUNT = [
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
], Ea.Y_FROM_LINRGB = [
	.2126,
	.7152,
	.0722
], Ea.CRITICAL_PLANES = [
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
		return new e(Ea.solveToInt(t, n, r));
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
		this.setInternalState(Ea.solveToInt(e, this.internalChroma, this.internalTone));
	}
	get chroma() {
		return this.internalChroma;
	}
	set chroma(e) {
		this.setInternalState(Ea.solveToInt(this.internalHue, e, this.internalTone));
	}
	get tone() {
		return this.internalTone;
	}
	set tone(e) {
		this.setInternalState(Ea.solveToInt(this.internalHue, this.internalChroma, e));
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
		let t = Ta.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = ga(e), this.argb = e;
	}
	setInternalState(e) {
		let t = Ta.fromInt(e);
		this.internalHue = t.hue, this.internalChroma = t.chroma, this.internalTone = ga(e), this.argb = e;
	}
	inViewingConditions(t) {
		let n = Ta.fromInt(this.toInt()).xyzInViewingConditions(t), r = Ta.fromXyzInViewingConditions(n[0], n[1], n[2], wa.make());
		return e.from(r.hue, r.chroma, va(n[1]));
	}
}, U = class e {
	static ratioOfTones(t, n) {
		return t = V(0, 100, t), n = V(0, 100, n), e.ratioOfYs(_a(t), _a(n));
	}
	static ratioOfYs(e, t) {
		let n = e > t ? e : t, r = n === t ? e : t;
		return (n + 5) / (r + 5);
	}
	static lighter(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = _a(t), i = n * (r + 5) - 5, a = e.ratioOfYs(i, r), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = va(i) + .4;
		return s < 0 || s > 100 ? -1 : s;
	}
	static darker(t, n) {
		if (t < 0 || t > 100) return -1;
		let r = _a(t), i = (r + 5) / n - 5, a = e.ratioOfYs(r, i), o = Math.abs(a - n);
		if (a < n && o > .04) return -1;
		let s = va(i) - .4;
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
}, Da = class e {
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
function Oa(e, t, n) {
	if (e.name !== n.name) throw Error(`Attempting to extend color ${e.name} with color ${n.name} of different name for spec version ${t}.`);
	if (e.isBackground !== n.isBackground) throw Error(`Attempting to extend color ${e.name} as a ${e.isBackground ? "background" : "foreground"} with color ${n.name} as a ${n.isBackground ? "background" : "foreground"} for spec version ${t}.`);
}
function W(e, t, n) {
	return Oa(e, t, n), G.fromPalette({
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
		let n = Na(e.specVersion).getHct(e, this);
		return this.hctCache.size > 4 && this.hctCache.clear(), this.hctCache.set(e, n), n;
	}
	getTone(e) {
		return Na(e.specVersion).getTone(e, this);
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
}, ka = class {
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
}, Aa = class {
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
}, ja = new ka(), Ma = new Aa();
function Na(e) {
	return e === "2021" ? ja : Ma;
}
//#endregion
//#region node_modules/.pnpm/@ktibow+material-color-utilities-nightly@0.4.1772748028000/node_modules/@ktibow/material-color-utilities-nightly/dynamiccolor/contrast_curve.js
var K = class {
	constructor(e, t, n, r) {
		this.low = e, this.normal = t, this.medium = n, this.high = r;
	}
	get(e) {
		return e <= -1 ? this.low : e < 0 ? ta(this.low, this.normal, (e - -1) / 1) : e < .5 ? ta(this.normal, this.medium, (e - 0) / .5) : e < 1 ? ta(this.medium, this.high, (e - .5) / .5) : this.high;
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
function Pa(e) {
	return e.variant === J.FIDELITY || e.variant === J.CONTENT;
}
function Y(e) {
	return e.variant === J.MONOCHROME;
}
function Fa(e, t, n, r) {
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
var Ia = class {
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
			tone: (e) => Pa(e) ? e.sourceColorHct.tone : Y(e) ? e.isDark ? 85 : 25 : e.isDark ? 30 : 90,
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
			tone: (e) => Pa(e) ? G.foregroundTone(this.primaryContainer().tone(e), 4.5) : Y(e) ? e.isDark ? 0 : 100 : e.isDark ? 90 : 30,
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
				return Y(e) ? e.isDark ? 30 : 85 : Pa(e) ? Fa(e.secondaryPalette.hue, e.secondaryPalette.chroma, t, !e.isDark) : t;
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
			tone: (e) => Y(e) ? e.isDark ? 90 : 10 : Pa(e) ? G.foregroundTone(this.secondaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
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
				if (!Pa(e)) return e.isDark ? 30 : 90;
				let t = e.tertiaryPalette.getHct(e.sourceColorHct.tone);
				return Da.fixIfDisliked(t).tone;
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
			tone: (e) => Y(e) ? e.isDark ? 0 : 100 : Pa(e) ? G.foregroundTone(this.tertiaryContainer().tone(e), 4.5) : e.isDark ? 90 : 30,
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
	return V(t, n, Ra(e.hue, e.chroma * r, 100, !0));
}
function La(e, t = 0, n = 100) {
	return V(t, n, Ra(e.hue, e.chroma, 0, !1));
}
function Ra(e, t, n, r) {
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
var za = class extends Ia {
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
			tone: (e) => e.platform === "watch" ? 30 : e.variant === J.NEUTRAL ? e.isDark ? 30 : 90 : e.variant === J.TONAL_SPOT ? e.isDark ? La(e.primaryPalette, 35, 93) : X(e.primaryPalette, 0, 90) : e.variant === J.EXPRESSIVE ? e.isDark ? X(e.primaryPalette, 30, 93) : X(e.primaryPalette, 78, H.isCyan(e.primaryPalette.hue) ? 88 : 90) : e.isDark ? La(e.primaryPalette, 66, 93) : X(e.primaryPalette, 66, H.isCyan(e.primaryPalette.hue) ? 88 : 93),
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
			tone: (e) => e.platform === "watch" ? e.variant === J.NEUTRAL ? 90 : X(e.secondaryPalette, 0, 90) : e.variant === J.NEUTRAL ? e.isDark ? La(e.secondaryPalette, 0, 98) : X(e.secondaryPalette) : e.variant === J.VIBRANT ? X(e.secondaryPalette, 0, e.isDark ? 90 : 98) : e.isDark ? 80 : X(e.secondaryPalette),
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
			tone: (e) => e.platform === "watch" ? 30 : e.variant === J.VIBRANT ? e.isDark ? La(e.secondaryPalette, 30, 40) : X(e.secondaryPalette, 84, 90) : e.variant === J.EXPRESSIVE ? e.isDark ? 15 : X(e.secondaryPalette, 90, 95) : e.isDark ? 25 : 90,
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
			tone: (e) => e.platform === "phone" ? e.isDark ? La(e.errorPalette, 0, 98) : X(e.errorPalette) : La(e.errorPalette),
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
			tone: (e) => La(e.errorPalette),
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
			tone: (e) => e.platform === "watch" ? 30 : e.isDark ? La(e.errorPalette, 30, 93) : X(e.errorPalette, 0, 90),
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
function Ba(e, t = 0, n = 100, r = 1) {
	return V(t, n, Ha(e.hue, e.chroma * r, 100, !0));
}
function Va(e, t = 0, n = 100) {
	return V(t, n, Ha(e.hue, e.chroma, 0, !1));
}
function Ha(e, t, n, r) {
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
var Ua = class extends za {
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
			tone: (e) => e.isDark ? Va(e.secondaryPalette) : Ba(e.secondaryPalette),
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
			tone: (e) => e.isDark ? Va(e.secondaryPalette, 20, 49) : Ba(e.secondaryPalette, 61, 90),
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
			tone: (e) => Ba(e.errorPalette),
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
			tone: (e) => e.isDark ? Va(e.errorPalette) : Ba(e.errorPalette),
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
$.contentAccentToneDelta = 15, $.colorSpec = new Ua(), $.primaryPaletteKeyColor = $.colorSpec.primaryPaletteKeyColor(), $.secondaryPaletteKeyColor = $.colorSpec.secondaryPaletteKeyColor(), $.tertiaryPaletteKeyColor = $.colorSpec.tertiaryPaletteKeyColor(), $.neutralPaletteKeyColor = $.colorSpec.neutralPaletteKeyColor(), $.neutralVariantPaletteKeyColor = $.colorSpec.neutralVariantPaletteKeyColor(), $.background = $.colorSpec.background(), $.onBackground = $.colorSpec.onBackground(), $.surface = $.colorSpec.surface(), $.surfaceDim = $.colorSpec.surfaceDim(), $.surfaceBright = $.colorSpec.surfaceBright(), $.surfaceContainerLowest = $.colorSpec.surfaceContainerLowest(), $.surfaceContainerLow = $.colorSpec.surfaceContainerLow(), $.surfaceContainer = $.colorSpec.surfaceContainer(), $.surfaceContainerHigh = $.colorSpec.surfaceContainerHigh(), $.surfaceContainerHighest = $.colorSpec.surfaceContainerHighest(), $.onSurface = $.colorSpec.onSurface(), $.surfaceVariant = $.colorSpec.surfaceVariant(), $.onSurfaceVariant = $.colorSpec.onSurfaceVariant(), $.inverseSurface = $.colorSpec.inverseSurface(), $.inverseOnSurface = $.colorSpec.inverseOnSurface(), $.outline = $.colorSpec.outline(), $.outlineVariant = $.colorSpec.outlineVariant(), $.shadow = $.colorSpec.shadow(), $.scrim = $.colorSpec.scrim(), $.surfaceTint = $.colorSpec.surfaceTint(), $.primary = $.colorSpec.primary(), $.onPrimary = $.colorSpec.onPrimary(), $.primaryContainer = $.colorSpec.primaryContainer(), $.onPrimaryContainer = $.colorSpec.onPrimaryContainer(), $.inversePrimary = $.colorSpec.inversePrimary(), $.secondary = $.colorSpec.secondary(), $.onSecondary = $.colorSpec.onSecondary(), $.secondaryContainer = $.colorSpec.secondaryContainer(), $.onSecondaryContainer = $.colorSpec.onSecondaryContainer(), $.tertiary = $.colorSpec.tertiary(), $.onTertiary = $.colorSpec.onTertiary(), $.tertiaryContainer = $.colorSpec.tertiaryContainer(), $.onTertiaryContainer = $.colorSpec.onTertiaryContainer(), $.error = $.colorSpec.error(), $.onError = $.colorSpec.onError(), $.errorContainer = $.colorSpec.errorContainer(), $.onErrorContainer = $.colorSpec.onErrorContainer(), $.primaryFixed = $.colorSpec.primaryFixed(), $.primaryFixedDim = $.colorSpec.primaryFixedDim(), $.onPrimaryFixed = $.colorSpec.onPrimaryFixed(), $.onPrimaryFixedVariant = $.colorSpec.onPrimaryFixedVariant(), $.secondaryFixed = $.colorSpec.secondaryFixed(), $.secondaryFixedDim = $.colorSpec.secondaryFixedDim(), $.onSecondaryFixed = $.colorSpec.onSecondaryFixed(), $.onSecondaryFixedVariant = $.colorSpec.onSecondaryFixedVariant(), $.tertiaryFixed = $.colorSpec.tertiaryFixed(), $.tertiaryFixedDim = $.colorSpec.tertiaryFixedDim(), $.onTertiaryFixed = $.colorSpec.onTertiaryFixed(), $.onTertiaryFixedVariant = $.colorSpec.onTertiaryFixedVariant();
//#endregion
//#region packages/ui-kit/src/theme/m3-theme.ts
var Wa = new $();
G.fromPalette({
	name: "on_on_primary",
	palette: (e) => e.primaryPalette,
	background: () => Wa.onPrimary(),
	contrastCurve: () => new K(6, 6, 7, 11)
});
var Ga = G.fromPalette({
	name: "primary_container_subtle",
	palette: (e) => e.primaryPalette,
	isBackground: !0,
	background: (e) => Wa.highestSurface(e),
	contrastCurve: () => void 0
});
G.fromPalette({
	name: "on_primary_container_subtle",
	palette: (e) => e.primaryPalette,
	background: () => Ga,
	contrastCurve: () => new K(6, 6, 7, 11)
});
var Ka = G.fromPalette({
	name: "secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	isBackground: !0,
	background: (e) => Wa.highestSurface(e),
	contrastCurve: () => void 0
});
G.fromPalette({
	name: "on_secondary_container_subtle",
	palette: (e) => e.secondaryPalette,
	background: () => Ka,
	contrastCurve: () => new K(6, 6, 7, 11)
});
var qa = G.fromPalette({
	name: "tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	isBackground: !0,
	background: (e) => Wa.highestSurface(e),
	contrastCurve: () => void 0
});
G.fromPalette({
	name: "on_tertiary_container_subtle",
	palette: (e) => e.tertiaryPalette,
	background: () => qa,
	contrastCurve: () => new K(6, 6, 7, 11)
});
var Ja = G.fromPalette({
	name: "error_container_subtle",
	palette: (e) => e.errorPalette,
	isBackground: !0,
	background: (e) => Wa.highestSurface(e),
	contrastCurve: () => void 0
});
//#endregion
//#region packages/ui-kit/src/schema-form/inputs/FileField.svelte
G.fromPalette({
	name: "on_error_container_subtle",
	palette: (e) => e.errorPalette,
	background: () => Ja,
	contrastCurve: () => new K(6, 6, 7, 11)
}), [
	...Wa.allColors.filter((e) => e.name !== "background" && e.name !== "on_background"),
	Wa.shadow(),
	Wa.scrim()
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
].filter((e) => e.name !== "surface-variant"), ni(["input"]), ni(["change"]), ni(["change"]), ni(["change"]);
//#endregion
//#region packages/ui-kit/src/timetable-preview/day-labels.ts
var Ya = [
	"",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"日"
];
function Xa(e) {
	return Ya[e] ?? "?";
}
//#endregion
//#region packages/ui-kit/src/timetable-preview/TimetablePreviewGrid.svelte
var Za = /* @__PURE__ */ si("<div class=\"flex min-w-0 flex-1 flex-col items-center\"><span class=\"m3-body-small text-on-surface-variant\"> </span> <div> </div></div>"), Qa = /* @__PURE__ */ si("<div class=\"flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center\"><div class=\"flex h-full w-full flex-col items-center justify-center rounded-2xl\"><span class=\"m3-body-medium font-bold\"> </span> <span class=\"m3-caption mt-1 leading-tight text-on-surface-variant\"> <br/> </span></div></div>"), $a = /* @__PURE__ */ si("<div><span class=\"text-on-surface-variant\"> </span></div>"), eo = /* @__PURE__ */ si("<span class=\"truncate text-on-surface-variant\"> </span>"), to = /* @__PURE__ */ si("<div><span class=\"truncate leading-tight font-bold\"> </span> <!></div>"), no = /* @__PURE__ */ si("<div class=\"absolute box-border overflow-hidden\"><!></div>"), ro = /* @__PURE__ */ si("<div><div><div class=\"m3-body-small flex w-[var(--sidebar-width)] flex-col items-center text-center text-on-surface-variant\"><span> </span> <span>月</span></div> <div class=\"flex min-w-0 flex-1\"></div></div> <div role=\"region\" aria-label=\"课表预览\"><div class=\"flex\"><aside aria-label=\"节次与时间\" class=\"shrink-0\"></aside> <div class=\"relative min-w-0 flex-1\"></div></div></div></div>");
function io(e, t) {
	Wt(t, !0);
	let n = Mi(t, "hasWallpaper", 3, !1), r = /* @__PURE__ */ Bn(0), i = /* @__PURE__ */ j(() => t.gridModel.visibleDays.length), a = /* @__PURE__ */ j(() => z(i) > 0 ? z(r) / z(i) : 0), o = /* @__PURE__ */ j(() => ye({
		courseDisplayModels: t.courseDisplayModels,
		visibleDays: t.gridModel.visibleDays,
		columnWidthPx: z(a),
		expandedSlotKeys: /* @__PURE__ */ new Set(),
		coursePalette: t.coursePalette,
		layoutMode: "fixed",
		capsuleCornerStyle: "rounded"
	})), s = /* @__PURE__ */ j(() => n() ? "" : "bg-surface");
	function c(e) {
		return e.slice(8, 10);
	}
	function l(e) {
		return [
			e.topLeft ? "rounded-tl-xl" : null,
			e.topRight ? "rounded-tr-xl" : null,
			e.bottomLeft ? "rounded-bl-xl" : null,
			e.bottomRight ? "rounded-br-xl" : null
		].filter((e) => e != null).join(" ");
	}
	let u = (e) => {
		let t = () => {
			Hn(r, e.clientWidth, !0);
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	};
	var d = ro();
	ki(d, "--row-height: 5.5rem; --sidebar-width: 3.25rem");
	var f = N(d), p = N(f), m = N(p), h = N(m, !0);
	k(m), It(2), k(p);
	var g = er(p, 2);
	hi(g, 21, () => t.gridModel.visibleDays, (e) => e.dayOfWeek, (e, t) => {
		var n = Za(), r = N(n), i = N(r, !0);
		k(r);
		var a = er(r, 2), o = N(a, !0);
		k(a), k(n), pr((e, n) => {
			li(i, e), Di(a, 1, `m3-body-medium mt-1 flex size-[26px] items-center justify-center rounded-full ${z(t).isToday ? "bg-brand text-on-primary" : "text-on-surface"}`), li(o, n);
		}, [() => Xa(z(t).dayOfWeek), () => c(z(t).date)]), ci(e, n);
	}), k(g), k(f);
	var _ = er(f, 2), v = N(_);
	let y;
	var b = N(v);
	let x;
	hi(b, 21, () => t.gridModel.periods, (e) => e.index, (e, t) => {
		var n = Qa(), r = N(n), i = N(r), a = N(i, !0);
		k(i);
		var o = er(i, 2), s = N(o, !0), c = er(s, 2, !0);
		k(o), k(r), k(n), pr(() => {
			li(a, z(t).index), li(s, z(t).startTime), li(c, z(t).endTime);
		}), ci(e, n);
	}), k(b);
	var S = er(b, 2);
	let C;
	hi(S, 21, () => z(o), (e) => e.key, (e, t) => {
		let n = /* @__PURE__ */ j(() => z(t).geometry.endPeriod - z(t).geometry.startPeriod + 1);
		var r = no();
		let i;
		var a = N(r), o = (e) => {
			var n = $a(), r = N(n);
			let i;
			var a = N(r);
			k(r), k(n), pr((e) => {
				Di(n, 1, `flex h-full w-full items-center justify-center border border-outline-variant/50 bg-surface-variant p-2 text-center ${e ?? ""}`), i = ki(r, "", i, { "font-size": `${z(t).placeholderPx ?? ""}px` }), li(a, `${z(t).count ?? ""} 门课程重叠`);
			}, [() => l(z(t).corners)]), ci(e, n);
		}, s = (e) => {
			var n = to();
			let r;
			var i = N(n);
			let a;
			var o = N(i, !0);
			k(i);
			var s = er(i, 2), c = (e) => {
				var n = eo();
				let r;
				var i = N(n, !0);
				k(n), pr(() => {
					r = ki(n, "", r, { "font-size": `${z(t).scale.detailPx ?? ""}px` }), li(i, z(t).locationLines[0]);
				}), ci(e, n);
			};
			di(s, (e) => {
				z(t).locationLines.length > 0 && e(c);
			}), k(n), pr((e) => {
				Di(n, 1, `course-capsule flex h-full min-h-0 w-full flex-col overflow-hidden border p-2 ${e ?? ""} ${z(t).displayModel.isInDisplayedWeek ? "" : "opacity-45"}`), r = ki(n, "", r, {
					"--capsule": z(t).colors.background,
					"--capsule-fg": z(t).colors.text
				}), a = ki(i, "", a, { "font-size": `${z(t).scale.titlePx ?? ""}px` }), li(o, z(t).course.name);
			}, [() => l(z(t).corners)]), ci(e, n);
		};
		di(a, (e) => {
			z(t).kind === "overlap-placeholder" ? e(o) : e(s, -1);
		}), k(r), pr(() => i = ki(r, "", i, {
			top: `calc((var(--row-height) * ${z(t).geometry.startPeriod - 1}))`,
			left: `${z(t).geometry.leftPercent ?? ""}%`,
			width: `${z(t).geometry.widthPercent ?? ""}%`,
			height: `calc(var(--row-height) * ${z(n) ?? ""})`
		})), ci(e, r);
	}), k(S), xi(S, () => u), k(v), k(_), k(d), pr(() => {
		Di(d, 1, `relative flex h-full w-full flex-col ${z(s) ?? ""}`), Di(f, 1, `flex shrink-0 items-center py-2 ${n() ? "bg-[var(--wallpaper-tint-sidebar)]" : "bg-surface"}`), li(h, t.gridModel.monthLabel), Di(_, 1, `min-h-0 flex-1 overflow-hidden ${n() ? "timetable-wallpaper-body" : "bg-surface"}`), y = ki(v, "", y, { height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})` }), x = ki(b, "", x, {
			width: "var(--sidebar-width)",
			height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})`
		}), C = ki(S, "", C, { height: `calc(var(--row-height) * ${t.gridModel.displayedPeriodCount ?? ""})` });
	}), ci(e, d), Gt();
}
//#endregion
//#region packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte
ni(["change"]), ni(["click"]);
//#endregion
//#region packages/plugins/wallpaper/src/WallpaperScreen.svelte
var ao = /* @__PURE__ */ si("<div class=\"relative min-h-0 flex-1 overflow-hidden\"><div class=\"absolute inset-0\"><!></div></div>"), oo = /* @__PURE__ */ si("<div class=\"flex min-h-0 flex-1 items-center justify-center bg-canvas p-4\"><p class=\"m3-body-medium text-center text-on-surface-variant\">选择壁纸后，可在此预览应用效果</p></div>"), so = /* @__PURE__ */ si("<button type=\"button\" class=\"flex flex-1 items-center justify-center gap-2 rounded-full border border-outline bg-surface px-4 py-3 text-sm font-medium text-on-surface\">清除壁纸</button>"), co = /* @__PURE__ */ si("<div class=\"flex min-h-0 flex-1 flex-col\"><input type=\"file\" accept=\"image/*\" class=\"hidden\"/> <!> <div class=\"bottom-bar\"><div class=\"mx-auto flex h-full w-full max-w-lg items-center gap-3\"><!> <button type=\"button\" class=\"flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-on-primary\"> </button></div></div></div>");
function lo(e, n) {
	Wt(n, !0);
	let r = new y(), i = qi(), a = /* @__PURE__ */ j(() => i.uri), o = /* @__PURE__ */ j(() => i.hasWallpaper), s = /* @__PURE__ */ j(() => n.controller.currentTimetable), c = /* @__PURE__ */ j(v), l = /* @__PURE__ */ j(() => r.calculateAcademicWeek(z(c), z(s)?.academicConfig)), u = /* @__PURE__ */ j(() => z(s) ? Ve({
		timetable: z(s),
		displayedWeek: z(l),
		todayIso: z(c),
		academicCalendarService: r
	}) : null), d = /* @__PURE__ */ j(() => z(u)?.gridModel ?? null), f = /* @__PURE__ */ j(() => z(u)?.courseDisplayModels ?? []), p = /* @__PURE__ */ Bn(void 0);
	function m() {
		z(p)?.click();
	}
	async function h(e) {
		let t = e.currentTarget, r = t.files?.[0];
		if (r) try {
			await i.setWallpaper(r);
		} catch (e) {
			let t = e instanceof DOMException && e.name === "QuotaExceededError" ? "此图片过大，无法导入" : "壁纸导入失败，请重试";
			try {
				n.controller.getPluginContext(n.pluginId).actions.notify(t, "error");
			} catch {
				alert(t);
			}
		} finally {
			t.value = "";
		}
	}
	async function g() {
		await i.setWallpaper(null);
	}
	var _ = co(), b = N(_);
	ji(b, (e) => Hn(p, e), () => z(p));
	var x = er(b, 2), S = (e) => {
		var n = ao();
		let r;
		var i = N(n);
		io(N(i), {
			get displayedWeek() {
				return z(l);
			},
			get gridModel() {
				return z(d);
			},
			get courseDisplayModels() {
				return z(f);
			},
			get coursePalette() {
				return t;
			},
			hasWallpaper: !0
		}), k(i), k(n), pr(() => r = ki(n, "", r, {
			"background-image": z(a) ? `url('${z(a)}')` : void 0,
			"background-size": "cover",
			"background-position": "center"
		})), ci(e, n);
	}, C = (e) => {
		ci(e, oo());
	};
	di(x, (e) => {
		z(o) && z(s) && z(d) ? e(S) : e(C, -1);
	});
	var w = er(x, 2), ee = N(w), te = N(ee), ne = (e) => {
		var t = so();
		ti("click", t, g), ci(e, t);
	};
	di(te, (e) => {
		z(o) && e(ne);
	});
	var re = er(te, 2), ie = N(re, !0);
	k(re), k(ee), k(w), k(_), pr(() => li(ie, z(o) ? "重新选择" : "选择壁纸")), ti("change", b, h), ti("click", re, m), ci(e, _), Gt();
}
ni(["change", "click"]);
//#endregion
//#region packages/plugins/wallpaper/bundle/entry.ts
var uo = ea({ screenComponent: lo });
//#endregion
export { uo as default };
