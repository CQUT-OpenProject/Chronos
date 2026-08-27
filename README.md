<div align="center">

# _Chronos_

<img src=".github/assets/light.png" alt="Preview Light" height="500" />
<img src=".github/assets/dark.png" alt="Preview Dark" height="500" />

基于渐进式 Web 的课程表应用

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/CQUT-OpenProject/Chronos)

</div>

## 基础功能

Chronos 的核心功能仅为查看、管理与分享课表。另外，您可在「插件中心」安装 Chronos 官方或第三方插件以个性化使用体验。

受 [DeepSeek-Hardness](https://github.com/deepseek-ai/deepseek-harness) 启发，Chronos 的许多能力同样由插件构成，并由内置的轻量运行时框架驱动。这一架构也为定制不同学校的专用版本带来了极大便利。

> [!CAUTION]
> 从外部链接安装的插件，其代码在您的浏览器中与内置功能同等权限运行，由您自行承担来源可信性及使用风险，我们不对第三方或外部来源插件的行为、数据处理或造成的损害承担责任。

## 导入课表

重庆理工大学定制 profile 支持以下与教务系统相关的导入方式：

#### 知行理工

在应用内选择导入方式为「知行理工」，按照提示输入学号 / 工号以及密码

#### 教务 HTML

在应用内选择导入方式为「教务 HTML」，并按照以下步骤操作：

1. 电脑端登录办事大厅
2. 进入【本科生教务管理系统 → 信息查询 → 个人课表查询】
3. 按下键盘的 `Ctrl + S` 或 `Cmd + S` 保存页面为 HTML 文件
4. 在 Chronos 中选择刚才保存的 HTML 文件即可

## 数据收集

官方 Vercel 托管版在生产环境且配置了 `PUBLIC_POSTHOG_KEY` 时，会通过 PostHog 收集匿名化的功能使用统计以改进产品，不包含课表内容与账号凭据等隐私信息。未配置密钥的构建不会启用埋点。

详见应用内「关于 → 隐私政策」，或 [`privacy-policy.md`](apps/web/static/legal/privacy-policy.md)。

## 部署 Chronos ｜ 插件开发 ｜ 贡献代码

此项目正处于快速演进阶段，若发现问题，欢迎任何形式的贡献！无论是修复错误、改进功能，还是提升代码质量，我们都非常欢迎您的参与。

提交贡献前，推荐阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 以了解建议的代码规范和提交流程。

## 切换到旧版

**Chronos-Android** 位于 `legacy` 分支，目前已停止维护
