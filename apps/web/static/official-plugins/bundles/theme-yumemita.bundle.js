//#region packages/plugins/theme-yumemita/src/yumemita-theme.ts
var e = "yumemita", t = "#2288dd", n = "#ff7788", r = [
	"#FFEE55",
	"#FFBBCC",
	"#4477CC",
	"#9977CC",
	"#EE5577",
	"#4D5B4C"
];
function i(e) {
	let t = Number.parseInt(e.slice(1), 16), n = (e) => {
		let n = (t >> e & 255) / 255;
		return n <= .03928 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
	};
	return .2126 * n(16) + .7152 * n(8) + .0722 * n(0);
}
function a(e) {
	return i(e) > .55 ? "#1a1a1a" : "#fff";
}
var o = r.map((e) => ({
	background: e,
	foreground: a(e)
}));
function s(e) {
	let r = t, i = n, a = "#fff";
	return {
		surface: e === "dark" ? "#1e2026" : "#f9f9fe",
		onSurface: e === "dark" ? "#f8fafc" : "#2e333a",
		primary: r,
		onPrimary: a,
		surfaceVariant: e === "dark" ? "#24262e" : "#eceef5",
		outline: e === "dark" ? "#334155" : "#aeb2bb",
		"primary-dim": r,
		"primary-container": r,
		"on-primary-container": a,
		"inverse-primary": r,
		"on-on-primary": r,
		"primary-container-subtle": r,
		"on-primary-container-subtle": a,
		secondary: i,
		"secondary-dim": i,
		"on-secondary": a,
		"secondary-container": i,
		"on-secondary-container": a,
		"secondary-container-subtle": i,
		"on-secondary-container-subtle": a
	};
}
var c = {
	id: e,
	name: () => "YUMEMITA",
	supportsDynamicColor: !1,
	className: "theme-yumemita",
	customCssVars: {
		"--ee-primary": t,
		"--ee-secondary": n,
		"--period-active-bg": "transparent",
		"--period-active-bg-image": `linear-gradient(to bottom, ${n}, ${t})`
	},
	shell: { customCssVars: {
		"--shell-bottom-tab-active-bg": "transparent",
		"--shell-bottom-tab-active-fg": t,
		"--leading-icon-bg": `color-mix(in srgb, ${n} 75%, transparent)`,
		"--leading-icon-color": "#fff"
	} },
	paletteEntries: o,
	getTokens: s,
	resolveCoursePaint(e, t, n) {
		if (e.color && e.textColor) return {
			background: e.color,
			foreground: e.textColor
		};
		let r = o[Math.abs(t) % o.length];
		return {
			background: r.background,
			foreground: r.foreground
		};
	}
}, l = {
	id: "theme-yumemita",
	name: () => "YUME∞MITA",
	version: "1.0.0",
	description: () => "YUME∞MITA 主题",
	category: "theme",
	author: "Chronos Community",
	apply(e) {
		e.registerSlot("theme.definition", c);
	}
};
//#endregion
export { l as default };
