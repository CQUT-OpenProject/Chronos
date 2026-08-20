module.exports = {
	id: 'theme-yumemita',
	name: function () {
		return 'YUMEMITA';
	},
	version: '1.0.0',
	description: function () {
		return 'YUMEMITA 主题';
	},
	apply: function (ctx) {
		ctx.registerSlot('theme.definition', {
			id: 'yumemita',
			name: function () {
				return 'YUMEMITA';
			},
			supportsDynamicColor: false,
			getTokens: function (mode) {
				var primary = '#2288dd';
				var secondary = '#ff7788';
				var onAccent = '#fff';
				if (mode === 'light') {
					return {
						surface: '#f9f9fe',
						onSurface: '#2e333a',
						primary: primary,
						onPrimary: onAccent,
						surfaceVariant: '#eceef5',
						outline: '#aeb2bb',
						'primary-dim': primary,
						'primary-container': primary,
						'on-primary-container': onAccent,
						'inverse-primary': primary,
						'on-on-primary': primary,
						'primary-container-subtle': primary,
						'on-primary-container-subtle': onAccent,
						secondary: secondary,
						'secondary-dim': secondary,
						'on-secondary': onAccent,
						'secondary-container': secondary,
						'on-secondary-container': onAccent,
						'secondary-container-subtle': secondary,
						'on-secondary-container-subtle': onAccent
					};
				}
				return {
					surface: '#1e2026',
					onSurface: '#f8fafc',
					primary: primary,
					onPrimary: onAccent,
					surfaceVariant: '#24262e',
					outline: '#334155',
					'primary-dim': primary,
					'primary-container': primary,
					'on-primary-container': onAccent,
					'inverse-primary': primary,
					'on-on-primary': primary,
					'primary-container-subtle': primary,
					'on-primary-container-subtle': onAccent,
					secondary: secondary,
					'secondary-dim': secondary,
					'on-secondary': onAccent,
					'secondary-container': secondary,
					'on-secondary-container': onAccent,
					'secondary-container-subtle': secondary,
					'on-secondary-container-subtle': onAccent
				};
			},
			resolveCoursePaint: function (_course, paletteIndex, _mode) {
				var palette = [
					{ background: '#FFEE55', foreground: '#1a1a1a' },
					{ background: '#FFBBCC', foreground: '#1a1a1a' },
					{ background: '#4477CC', foreground: '#fff' },
					{ background: '#9977CC', foreground: '#fff' },
					{ background: '#EE5577', foreground: '#fff' },
					{ background: '#4D5B4C', foreground: '#fff' }
				];
				return palette[Math.abs(paletteIndex) % palette.length];
			}
		});
		ctx.actions.setTheme('yumemita');
	}
};
