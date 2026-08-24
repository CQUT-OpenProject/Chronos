---
layout: home

hero:
  name: Chronos
  text: 微内核插件化课表 PWA
  tagline: 插槽驱动的课表引擎 · Profile 高校装配 · 官方插件在线分发
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 插件作者指南
      link: /develop/plugin-authoring
    - theme: alt
      text: 架构决策记录
      link: /adr/

features:
  - icon: 🧩
    title: 分层插槽树
    details: 所有扩展点都是声明式插槽贡献，宿主代码不包含针对具体插件的特殊处理；多贡献者按 order 共存排序。
  - icon: 🎓
    title: Profile 装配体系
    details: 按高校组合内置插件与默认配置，四层配置合并，离线 profile 可纯静态部署。
  - icon: 🛍️
    title: 官方插件市场
    details: catalog + manifest 在线安装，ESM 自包含富 UI，双哈希校验，JSON 主题免编译分发。
  - icon: 📴
    title: 离线优先 PWA
    details: 课表、偏好与插件数据全部本地持久化，安装到主屏幕即可日常使用。
---
