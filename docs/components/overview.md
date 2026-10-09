---
title: 组件总览与范例
order: 1
---

# 交互短代码组件库 (Auto-registered Shortcodes)

VitePress Zenith 预置了一套现代高质感、在全站任何 Markdown 文件中**免 import 直接书写**的交互短代码组件库。

---

## 1. 卡片与矩阵 (VpCard & VpCardGrid)

提供响应式多列自适应网格与悬浮高光渐变卡片，支持 UnoCSS 纯 CSS 图标、徽标与外部链接箭头。

<VpCardGrid :cols="3">
  <VpCard
    title="极速构建"
    desc="基于 Vite 与 Rollup 底层，瞬时冷启动与毫秒级热更新。"
    icon="i-lucide-zap"
    badge="高性能"
    badgeType="tip"
  />
  <VpCard
    title="沉浸专注"
    desc="一键切换 Alt+Z 双向展翼 1180px 宽屏阅读画布。"
    icon="i-lucide-eye"
    badge="独家特性"
    badgeType="purple"
  />
  <VpCard
    title="类型诊断"
    desc="集成 Shiki Twoslash，文档内代码块实时悬浮类型与报错波浪线。"
    icon="i-lucide-code-2"
    badge="IDE体验"
    badgeType="info"
  />
</VpCardGrid>

```html
<VpCardGrid :cols="3">
  <VpCard
    title="极速构建"
    desc="基于 Vite 与 Rollup 底层，瞬时冷启动与毫秒级热更新。"
    icon="i-lucide-zap"
    badge="高性能"
    badgeType="tip"
  />
</VpCardGrid>
```

---

## 2. 状态胶囊徽标 (VpBadge)

提供 6 种语义色（`tip`、`success`、`info`、`warning`、`danger`、`purple`）、3 种视觉变体（`subtle`、`solid`、`outline`）与可选小圆点（`dot`）。

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
  <VpBadge type="tip">默认推荐</VpBadge>
  <VpBadge type="success" dot>编译成功</VpBadge>
  <VpBadge type="info" variant="solid">v1.2.0</VpBadge>
  <VpBadge type="purple" variant="outline">实验性特性</VpBadge>
  <VpBadge type="warning" dot>即将废弃</VpBadge>
  <VpBadge type="danger" variant="solid">严重警告</VpBadge>
</div>

```html
<VpBadge type="tip">默认推荐</VpBadge>
<VpBadge type="success" dot>编译成功</VpBadge>
<VpBadge type="info" variant="solid">v1.2.0</VpBadge>
<VpBadge type="purple" variant="outline">实验性特性</VpBadge>
```

---

## 3. 版本演进与项目时间轴 (VpTimeline & VpTimelineItem)

用于优雅展示系统演进历程、更新日志（Changelog）与版本里程碑。

<VpTimeline>
  <VpTimelineItem
    time="2026-09-25"
    version="v1.0.0"
    title="VitePress Zenith 正式发布"
    type="primary"
    icon="i-lucide-rocket"
  >
    <ul>
      <li>完成全能 Landing Page 与现代玻璃拟态排版；</li>
      <li>支持 Shiki Twoslash 动态类型与编译诊断；</li>
      <li>全站联动包管理器选项卡与 1180px 专注模式。</li>
    </ul>
  </VpTimelineItem>

  <VpTimelineItem
    time="2026-09-20"
    version="v0.9.0-rc"
    title="富媒体与公式系统集成"
    type="success"
    icon="i-lucide-check-circle-2"
  >
    <p>集成 MathJax3 数学公式、Mermaid 流程图与 Markmap 交互脑图。</p>
  </VpTimelineItem>

  <VpTimelineItem
    time="2026-09-10"
    version="v0.5.0-beta"
    title="架构选型确立"
    type="info"
  >
    <p>基于 VitePress 官方默认主题扩展结合 UnoCSS 原子层构建。</p>
  </VpTimelineItem>
</VpTimeline>

```html
<VpTimeline>
  <VpTimelineItem
    time="2026-09-25"
    version="v1.0.0"
    title="VitePress Zenith 正式发布"
    type="primary"
    icon="i-lucide-rocket"
  >
    <ul>
      <li>完成全能 Landing Page 与现代玻璃拟态排版；</li>
    </ul>
  </VpTimelineItem>
</VpTimeline>
```

---

## 4. 外部资源导航卡片 (VpLinkCard)

高质感精美资源外链卡片，悬浮时平滑位移并具备箭头指向动效：

<VpLinkCard
  title="Vue 3 官方文档"
  desc="渐进式 JavaScript 框架，具备极高开发效率与灵活响应式系统。"
  href="https://vuejs.org"
  icon="i-lucide-code"
  badge="核心框架"
/>

<VpLinkCard
  title="VitePress 官方站点"
  desc="由 Vite 和 Vue 驱动的极速静态站点生成器，提供极佳的 Markdown 写作体验。"
  href="https://vitepress.dev"
  icon="i-lucide-book-open"
  badge="引擎底座"
/>

```html
<VpLinkCard
  title="Vue 3 官方文档"
  desc="渐进式 JavaScript 框架，具备极高开发效率与灵活响应式系统。"
  href="https://vuejs.org"
  icon="i-lucide-code"
  badge="核心框架"
/>
```

---

## 5. 交互运行态与在线沙箱 (VpDemoPreview & VpPlayground)

在同一个卡片中同时展示组件的实时交互运行态与源码，支持展开/收起代码、一键复制代码以及**一键在 StackBlitz WebContainer 在线沙箱中试跑与调试**：

- **即时在线沙箱直达**：点击工具栏的“在 StackBlitz 试跑”，自动将当前组件代码打包为微型 Vite + Vue 3 虚拟机工程在新窗口中启动；
- **开关控制**：支持通过 `:stackblitz="false"` 针对纯展示型代码关闭试跑入口；
- **独立沙箱启动卡片**：提供专用的 `<VpPlayground>` 独立卡片，方便在文档中嵌入高冲击力的试跑入口。

### 实机效果演示

<VpDemoPreview
  title="在线沙箱与交互演示"
  desc="点击工具栏右侧的「在 StackBlitz 试跑」即可一键将代码送入 WebContainer 虚拟机"
  code="<template><div style='padding: 24px; text-align: center;'><h2 style='color: #6366f1;'>Hello VitePress Zenith</h2><p>当前代码正在 StackBlitz 浏览器在线沙箱中运行！</p></div></template>"
>
  <div style="display: flex; gap: 12px; align-items: center;">
    <VpBadge type="tip" dot>在线运行态正常</VpBadge>
    <VpBadge type="purple" variant="solid">StackBlitz Ready</VpBadge>
    <span style="font-size: 13px; color: var(--vp-c-text-2);">支持一键投送至浏览器在线沙箱</span>
  </div>

  <template #code>

```html
<template>
  <div style="padding: 24px; text-align: center;">
    <h2 style="color: #6366f1;">Hello VitePress Zenith</h2>
    <p>当前代码正在 StackBlitz 浏览器在线沙箱中运行！</p>
  </div>
</template>
```

  </template>
</VpDemoPreview>

### 独立沙箱启动卡片 (VpPlayground)

<VpPlayground
  title="Vue 3 计数器交互沙箱"
  desc="包含完整的响应式 ref 与点击累加逻辑，点击右侧按钮立即在新窗口体验秒级热更新"
  code="<script setup lang='ts'>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div style='padding: 30px; text-align: center;'>
    <h3>Vue 3 响应式计数器</h3>
    <button @click='count++' style='padding: 8px 16px; border-radius: 8px; background: #6366f1; color: #fff; border: none; cursor: pointer;'>
      当前计数：{{ count }}
    </button>
  </div>
</template>"
/>

```html
<VpPlayground
  title="Vue 3 计数器交互沙箱"
  desc="包含完整的响应式 ref 与点击累加逻辑，点击右侧按钮立即在新窗口体验秒级热更新"
  code="..."
/>
```


---

## 6. 全宽公告通知横幅 (VpBanner)

全站顶栏公告条，支持平滑折叠关闭与 `localStorage` 记忆防打扰。已默认挂载在站点全域顶部，亦可在独立页面内嵌入。

<VpBanner
  id="demo-banner-doc"
  :fixed="false"
  text="✨ 欢迎体验全新组件库与通知横幅组件！"
  link="/guide/getting-started"
  linkText="查阅起步指南 →"
/>

```html
<VpBanner
  id="announcement-v1"
  text="🎉 欢迎体验 VitePress Zenith 旗舰级技术文档与知识库矩阵模板！"
  link="/guide/getting-started"
  linkText="了解详情 →"
  :dismissible="true"
/>
```

---

## 7. 文档有用度评价 (VpHelpful)

文档轻量反馈交互短代码组件，支持本地记忆已投票状态并提供鼓励动效气泡。读者与二开团队可按需在任意技术文档或特定页面中书写调用：

<VpHelpful />

```html
<VpHelpful />
```

---

## 8. 技术社区讨论与评论 (VpComments)

基于 GitHub Discussions 的无服务器评论体系，已默认挂载于全站技术文档与博客专栏末尾，支持深浅模式无缝自适应：

- **零服务器成本**：无任何自建数据库或外部服务器依赖，天然具备防刷屏与高质量技术交流氛围；
- **主题实时换肤**：监听 VitePress 的 `isDark` 状态机，无需重新刷新页面即可实时切换 Giscus 深浅主题；
- **页面级精确控制**：在任意文章 Frontmatter 中声明 `comments: false`，即可针对特定草稿或公告单独关闭评论区。

### 全局配置示例 (`docs/.vitepress/config.ts`)

```ts
export default defineConfig({
  themeConfig: {
    giscus: {
      enabled: true,
      repo: 'your-username/your-repo',
      repoId: 'R_kgDO...',
      category: 'General',
      categoryId: 'DIC_kwDO...',
      mapping: 'pathname',
      lang: 'zh-CN',
    },
  },
})
```

---

## 9. 动态强调色盘选择器 (VpThemePicker)

已默认集成于全局顶部导航栏右侧，支持读者一键切换 4 套精心校准的高质感主品牌色，并具备本地持久化记忆：

- **4 套预置色盘**：Indigo 经典紫蓝、Emerald 极客翠绿、Rose 潮流蔷薇、Amber 典雅琥珀；
- **防闪烁 (Anti-FOUC) 注入**：结合 `<head>` 极速探针脚本，页面刷新绝无色相跳变；
- **组件式调用**：除顶栏常驻外，二开团队亦可在任意页面或悬浮栏中独立复用：

```html
<VpThemePicker />
```

---

## 10. 站内内链悬浮预览组件 (VpLinkPreview)

已全局开箱即用挂载于全站底层，提供类似 Wikipedia / Notion 的沉浸式内链预览：

- **无感预加载**：编译期构建全站 Markdown 文档元数据索引，瞬时 O(1) 内存解析；
- **防抖与容差**：280ms 悬浮防抖避免误触，160ms 移出保护允许光标平滑滑入卡片选读；
- **视口翻转防碰撞**：智能计算上下空间与左右边缘，防止浮层超出视口；
- **零侵入书写**：无需特殊短代码语法，普通 Markdown 相对链接自动获得预览能力。

---

## 11. 结构化参数契约表 (VpApiTable & VpApiItem)

专为技术文档设计的结构化参数与配置项呈现组件，彻底根除原生 Markdown 宽表格在移动端和窄屏下的拥挤换行与横向截断。在桌面端以严整网格对齐，在移动端（`<768px`）平滑自适应降级为垂直弹性卡片流。

### 实机效果演示

<VpApiTable
  title="ComponentProps 配置契约"
  description="支持类型高光、默认值胶囊、必填标记、版本注记与即时检索过滤"
  :searchable="true"
>
  <VpApiItem
    name="title"
    type="string"
    required
    version="v1.0.0"
    description="表格主标题文案，为空时不渲染顶部标题行"
  />
  <VpApiItem
    name="searchable"
    type="boolean"
    default="false"
    version="v1.1.0"
  >
    是否开启右上角即时过滤检索输入框。读者可输入关键字快速过滤目标参数。
  </VpApiItem>
  <VpApiItem
    name="items"
    type="ApiTableItem[]"
    default="[]"
    version="v1.0.0"
    description="数组形式的参数配置列表，支持数据驱动模式免写嵌套标签"
  />
  <VpApiItem
    name="legacyMode"
    type="boolean"
    default="false"
    deprecated="v2.0.0"
    description="旧版兼容模式开关，已在 v2.0.0 中废弃，建议直接使用标准模式"
  />
</VpApiTable>

### 标签插槽模式代码示例

```html
<VpApiTable title="组件参数契约" :searchable="true">
  <VpApiItem
    name="timeout"
    type="number"
    default="3000"
    required
    version="v1.0.0"
    description="网络请求超时时间，单位毫秒"
  />
  <VpApiItem
    name="headers"
    type="Record<string, string>"
    version="v1.2.0"
  >
    自定义 HTTP Header 请求头键值对，支持动态注入认证 Token。
  </VpApiItem>
</VpApiTable>
```

### 数据驱动模式代码示例

```html
<VpApiTable
  title="全局配置选项"
  :items="[
    { name: 'apiUrl', type: 'string', required: true, description: '后端接口服务基准地址' },
    { name: 'retries', type: 'number', default: '3', version: 'v1.1.0', description: '失败自动重试最大次数' }
  ]"
/>
```

---

## 12. 历史版本归档警告横幅 (VpLegacyBanner)

用于在历史版本、已废弃分支或已归档文档顶部展示高对比度警示横幅，支持自定义版本标识、升级提示文案与一键跳转目标：

<VpLegacyBanner
  :visible="true"
  current-version="v0.9.0"
  latest-version="v1.0.0"
  latest-link="/guide/getting-started"
  title="历史归档版本提示"
  message="当前查阅的是历史旧版文档，部分 API 已在最新稳定版中升级或重构。"
  button-text="前往最新版文档"
/>

```html
<VpLegacyBanner
  :visible="true"
  current-version="v0.9.0"
  latest-version="v1.0.0"
  latest-link="/guide/getting-started"
  title="历史归档版本提示"
  message="当前查阅的是历史旧版文档，建议前往最新版获取完整功能支持。"
  button-text="前往最新稳定版"
/>
```

---

## 13. 全键盘极客快捷键速查中心 (VpShortcutsModal)

为重度键盘党与技术极客设计的沉浸式快捷键速查中心浮层。支持按 <kbd>?</kbd>（或 <kbd>Shift</kbd> + <kbd>/</kbd>）在全站任意位置即时唤起，具备输入保护（Input Guard）与全套按键行为说明：

- **极客全键盘导航**：集成 <kbd>J</kbd>/<kbd>K</kbd> 智能前后翻页、<kbd>T</kbd> 毫秒级深浅换肤、<kbd>Alt</kbd>+<kbd>Z</kbd> 专注模式与 <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd> 命令中心；
- **智能防误触保护**：在 `INPUT`、`TEXTAREA` 或富文本编辑态下自动屏蔽单键触发，杜绝输入乱码；
- **独立复用与控制**：除全局按键响应外，支持在业务页面中通过 `v-model` 或事件手动控制显隐。

```html
<!-- 随处按下键盘上的「?」即可唤起全局速查浮层 -->
<VpShortcutsModal v-model="showShortcuts" />
```

---

## 14. 开源贡献者致谢流与 GitHub 协同 (VpContributors)

基于编译期 Git Commit 历史自动挖掘技术，在文档末尾生成重叠头像流与悬浮名片，并提供“在 GitHub 上编辑此页”协同入口：

<VpContributors
  title="开源贡献者致谢流"
  :contributors="[
    {
      name: '孔余 (Ateng)',
      avatar: 'https://github.com/atengk.png',
      github: 'atengk',
      commitsCount: 12,
      lastCommitTime: 1790346106,
      lastCommitMessage: 'feat(contributors): 构建 Git 历史贡献者提取与协同体系'
    },
    {
      name: 'VitePress Zenith',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Zenith',
      commitsCount: 3,
      lastCommitTime: 1790345000,
      lastCommitMessage: 'docs: 完善组件库示例与多语言矩阵'
    }
  ]"
  edit-url="https://github.com/atengk/vitepress-zenith/edit/master/docs/components/overview.md"
/>

```html
<VpContributors
  title="本篇核心贡献团队"
  :contributors="pageContributors"
  edit-url="https://github.com/atengk/vitepress-zenith/edit/master/docs/:path"
/>
```

---

## 15. 全局命令中心检索与快捷动作 (VpCommandPalette)

类似 macOS Spotlight 与 Raycast 的全局沉浸式命令面板，支持按 <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> 或正文快捷键一键唤起：

- **混合式全文检索**：无缝对接离线 Minisearch 搜索引擎与高精度中文分词；
- **页面与动作派发**：支持直接跳转核心指南模块、一键切换深浅外观、一键激活专注模式或投送在线沙箱；
- **历史记录与高频直达**：智能记录读者最近访问的章节与搜索关键字。

```html
<!-- 全局开箱即用集成，亦可按需显式嵌入 -->
<VpCommandPalette />
```

---

## 16. 博客文章归档卡片流 (VpBlogList)

基于 VitePress 静态数据加载器（`createContentLoader`）的现代化轻量博客列表组件，支持按多维标签即时筛选、年份降序分组、字数与阅读耗时统计推导：

- **多维标签即时过滤**：标签卡片展示各分类下的博文篇数，点击瞬时无刷新重筛；
- **年份流光时间轴**：按发布年份层次化分组折叠，左侧配备流光渐变时间线；
- **阅读认知增强**：自动从 Markdown 正文中抽取字数、计算估算阅读分钟数并展示摘要。

```html
<!-- 在任意博客主页中直接使用即可渲染全套博客卡片流 -->
<VpBlogList />
```

---

## 17. 增强多媒体与流媒体短代码 (Media Assets)

专为技术文档打造的高质感多媒体交互组件，消除原生 HTML 标签的生硬感，支持 16:9 响应式比例、现代圆角阴影、居中图注与深浅色模式自适应。

### 17.1 深浅色模式双图适配 (VpImage)

<VpImage
  light="/theme-demo-light.svg"
  dark="/theme-demo-dark.svg"
  alt="深浅双模主题测试"
  caption="实机演示：请点击页面右上角切换深浅色外观，查看图片自动交替（亦支持点击放大）"
  width="520px"
/>

```html
<VpImage
  light="/theme-demo-light.svg"
  dark="/theme-demo-dark.svg"
  alt="深浅双模主题测试"
  caption="实机演示：请点击页面右上角切换深浅色外观，查看图片自动交替"
  width="520px"
/>
```

### 17.2 高质感视频播放器 (VpVideo)

<VpVideo
  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  poster="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80"
  caption="实机运行：VpVideo 高质感视频播放器"
  width="80%"
/>

```html
<VpVideo
  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  poster="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80"
  caption="视频 1-1：演示影片播放范例"
  width="80%"
/>
```

### 17.3 Bilibili / YouTube 流媒体嵌入 (VpBilibili / VpYouTube)

<VpBilibili bvid="BV1GJ411x7h7" caption="实机运行：Bilibili 响应式嵌入播放器" width="80%" />

```html
<!-- Bilibili 演示（默认关闭弹幕，16:9 自适应） -->
<VpBilibili bvid="BV1GJ411x7h7" caption="Bilibili 响应式播放器" width="80%" />

<!-- YouTube 国际化流媒体（隐私增强域名嵌入） -->
<VpYouTube id="dQw4w9WgXcQ" caption="YouTube 响应式播放器" width="80%" />
```


