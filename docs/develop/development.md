# 开发工作流

## 环境准备

- Node.js（建议 LTS 最新）与全局 [Vite+ CLI](https://viteplus.dev)（`vp`）。本仓库**只用 `vp`**，不要直接调用 pnpm/npm/yarn。
- 克隆后先执行：

```sh
vp install
```

## 常用命令

| 命令                                                                          | 作用                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------ |
| `vp run dev`                                                                  | 启动 Web 宿主开发服务器                    |
| `vp run build` / `vp run build:cqut` / `build:cqut-offline` / `build:default` | 按 profile 构建产品                        |
| `vp run build:pages`                                                          | 构建 GitHub Pages 静态版                   |
| `vp run check`                                                                | 格式化检查 + lint + 类型检查（提交前必跑） |
| `vp run test`                                                                 | 运行全部单元测试                           |
| `vp run build:official-plugins`                                               | 构建官方插件 bundle 与 catalog             |
| `vp run verify:official-plugins`                                              | 官方插件产物自校验检查                     |
| `vp run theme:generate`                                                       | 重新生成主题令牌                           |

文档站独立于应用构建：

```sh
cd website && vp install && vp run dev   # build / preview 同理
```

## 仓库布局

```
apps/web                  SvelteKit 宿主（页面、适配器、transfer-state、i18n）
packages/core             @chronos/core 微内核（引擎/容器/插槽树/领域/Schema）
packages/ui-kit           组件库与响应式控制器
packages/plugins/*        内置与官方插件
packages/codec-kit        共享字节编解码原语（非插件）
scripts                   官方插件构建/校验、主题令牌、别名解析
docs                      文档站正文源（本站）
.agents/docs/adr          架构决策记录（投影到本站 /adr/）
```

## Profile 与部署

- `chronos-cqut`（默认 Vercel 版）：支持在线导入；`chronos-cqut-offline`（Pages 静态版）；`chronos-default`（开源通用）。经环境变量 `CHRONOS_PROFILE` 选择，详见根 README 的部署指南。

## 提交约定

Gitmoji 格式：`<emoji> <简洁中文描述>`，例如 `✨ 新增课表导出功能`。不使用 `feat:` / `fix:` 前缀。

## 质量门禁

1. `vp run check` 与 `vp run test` 全绿；
2. 改动内核契约时同步更新[参考文档](../reference/ports.md)与相关 ADR 的修订记录；
3. 官方插件产物变更必须伴随 `verify:official-plugins` 通过；
4. 不引入新的双轨实现——遇到「同一功能新旧两种做法并存」时，先合并或移除旧做法，再扩展新功能。
