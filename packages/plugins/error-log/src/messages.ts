import type { PluginMessageCatalog } from '@chronos/core';

export const ERROR_LOG_MESSAGES = {
	'zh-cn': {
		'plugin.name': '错误日志',
		'plugin.description': '记录未处理异常与 console.error，便于排查问题',
		'mine.title': '错误日志',
		'mine.keywords': '错误,日志,异常,console,error,log,debug',
		'screen.title': '错误日志',
		'screen.empty': '暂无错误记录',
		'screen.action.copyAll': '复制全部',
		'screen.action.copyOne': '复制',
		'screen.action.clear': '清空',
		'screen.notify.copySuccess': '已复制到剪贴板',
		'screen.notify.copyFailed': '复制失败',
		'screen.notify.cleared': '已清空'
	},
	en: {
		'plugin.name': 'Error Log',
		'plugin.description': 'Capture unhandled errors and console.error for debugging',
		'mine.title': 'Error Log',
		'mine.keywords': 'error,log,exception,console,debug',
		'screen.title': 'Error Log',
		'screen.empty': 'No errors recorded yet',
		'screen.action.copyAll': 'Copy all',
		'screen.action.copyOne': 'Copy',
		'screen.action.clear': 'Clear',
		'screen.notify.copySuccess': 'Copied to clipboard',
		'screen.notify.copyFailed': 'Copy failed',
		'screen.notify.cleared': 'Cleared'
	}
} satisfies PluginMessageCatalog;
