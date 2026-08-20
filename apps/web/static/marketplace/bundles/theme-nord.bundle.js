module.exports = {
	id: 'theme-nord',
	name: function () {
		return 'Nord 极光主题';
	},
	version: '1.0.0',
	description: function () {
		return '北极深蓝与极光色调主题';
	},
	apply: function (ctx) {
		ctx.registerSlot('theme.definition', {
			id: 'nord',
			name: function () {
				return 'Nord';
			},
			supportsDynamicColor: false,
			getTokens: function (mode) {
				if (mode === 'light') {
					return {
						surface: '#eceff4',
						onSurface: '#2e3440',
						primary: '#5e81ac',
						onPrimary: '#eceff4',
						surfaceVariant: '#e5e9f0',
						outline: '#d8dee9'
					};
				}
				return {
					surface: '#2e3440',
					onSurface: '#eceff4',
					primary: '#88c0d0',
					onPrimary: '#2e3440',
					surfaceVariant: '#3b4252',
					outline: '#4c566a'
				};
			}
		});
	}
};
