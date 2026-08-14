## 版本信息

| 项       | 内容         |
| -------- | ------------ |
| 版本号   | `v`          |
| 发布日期 | `YYYY-MM-DD` |
| 上一版本 | `v`          |

## 更新摘要

<!-- 简要说明本版本面向用户的主要变更，可与 Release 文档保持一致 -->

-

## 检查清单

- [ ] 已更新 `package.json` 中的 `version`
- [ ] 已新增或更新 `src/lib/content/releases/entries/vX.Y.Z.md`
- [ ] Release 文档中的 `name`、`publishedAt` 与正文内容已核对
- [ ] 已运行 `vp check` 与 `vp test`，结果通过
- [ ] 合并后计划打 tag：`vX.Y.Z`（用于触发 GitHub Pages 部署）

## 合并方式

> **本 PR 必须使用 Squash merge，请勿使用 Merge commit 或 Rebase merge，目标分支为 `master`**

Squash 后的提交标题请使用：

```text
X.Y.Z
```

Squash 提交说明可粘贴「更新摘要」中的要点，或保留 PR 正文摘要。
