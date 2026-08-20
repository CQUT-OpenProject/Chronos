module.exports = {
	id: 'tool-wallpaper',
	name: function () {
		return '课表壁纸';
	},
	version: '1.0.0',
	description: function () {
		return '自定义课表背景壁纸与主题取色';
	},
	category: 'tool',
	apply: function (ctx) {
		ctx.registerSlot('mine.item', {
			id: 'wallpaper',
			sectionId: 'appearance-feedback',
			title: function () {
				return '设置课表壁纸';
			},
			href: '/plugins/tool-wallpaper',
			icon: 'wallpaper',
			iconTone: 'primary',
			order: 30
		});

		ctx.registerSlot('shell.route.screen', {
			id: 'tool-wallpaper',
			title: function () {
				return '设置课表壁纸';
			}
		});

		ctx.registerSlot('theme.definition', {
			id: 'wallpaper',
			name: function () {
				return '壁纸';
			},
			description: function () {
				return '从当前壁纸提取配色';
			},
			supportsDynamicColor: true,
			getTokens: function (mode) {
				return {
					surface: mode === 'dark' ? '#1e2026' : '#f9f9fe',
					onSurface: mode === 'dark' ? '#f8fafc' : '#2e333a',
					primary: '#0068b7',
					onPrimary: '#ffffff',
					surfaceVariant: mode === 'dark' ? '#24262e' : '#eceef5',
					outline: mode === 'dark' ? '#334155' : '#aeb2bb'
				};
			}
		});
	}
};
