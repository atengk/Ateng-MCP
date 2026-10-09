<!--
 * 现代化技术博客归档与标签多维筛选组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { data as rawPosts, type Post } from '../utils/posts.data'

// 安全兜底文章列表（防空安全契约）
const posts = computed<Post[]>(() => Array.isArray(rawPosts) ? rawPosts : [])

// 当前选中的筛选标签（默认 'all' 表示全部）
const activeTag = ref<string>('all')

// 提取所有标签及其包含的文章篇数
const tagCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const post of posts.value) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1
    }
  }
  return counts
})

// 所有可供筛选的标签列表
const tagsList = computed(() => Object.keys(tagCounts.value).sort())

// 根据当前选中的标签过滤文章
const filteredPosts = computed(() => {
  if (activeTag.value === 'all') {
    return posts.value
  }
  return posts.value.filter((post) => post.tags.includes(activeTag.value))
})

// 按年份分组聚合过滤后的博文列表
const groupedPosts = computed(() => {
  const groups: Record<string, Post[]> = {}
  for (const post of filteredPosts.value) {
    const year = post.date.formatted.split('-')[0] || '其他'
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  }
  return groups
})

// 年份降序排序列表
const sortedYears = computed(() => Object.keys(groupedPosts.value).sort((a, b) => Number(b) - Number(a)))

/**
 * 切换选中的标签
 * @param tag 目标标签名称
 */
function selectTag(tag: string) {
  activeTag.value = tag
}
</script>

<template>
  <div class="vp-blog-container">
    <!-- 博客头部统计与导语 -->
    <header class="vp-blog-header">
      <h1 class="vp-blog-title">技术博客矩阵</h1>
      <p class="vp-blog-subtitle">
        收录技术沉淀、架构推演与工程实践经验 · 共 {{ posts.length }} 篇专栏
      </p>
    </header>

    <!-- 标签矩阵筛选器 -->
    <div class="vp-blog-tags-bar">
      <button
        class="vp-tag-chip"
        :class="{ active: activeTag === 'all' }"
        @click="selectTag('all')"
      >
        全部文章
        <span class="vp-tag-badge">{{ posts.length }}</span>
      </button>

      <button
        v-for="tag in tagsList"
        :key="tag"
        class="vp-tag-chip"
        :class="{ active: activeTag === tag }"
        @click="selectTag(tag)"
      >
        {{ tag }}
        <span class="vp-tag-badge">{{ tagCounts[tag] }}</span>
      </button>
    </div>

    <!-- 文章流（按年份分组呈现） -->
    <div v-if="filteredPosts.length > 0" class="vp-blog-stream">
      <section v-for="year in sortedYears" :key="year" class="vp-year-group">
        <div class="vp-year-header">
          <span class="vp-year-badge">{{ year }}</span>
          <div class="vp-year-line"></div>
        </div>

        <div class="vp-posts-list">
          <article
            v-for="post in groupedPosts[year]"
            :key="post.url"
            class="vp-post-card"
          >
            <div class="vp-post-meta">
              <span class="meta-inline"><span class="i-lucide-calendar" /> {{ post.date.formatted }}</span>
              <span class="meta-dot">·</span>
              <span class="meta-inline"><span class="i-lucide-user" /> {{ post.author }}</span>
              <span class="meta-dot">·</span>
              <span class="meta-inline"><span class="i-lucide-file-text" /> 约 {{ (post.words || 0).toLocaleString() }} 字</span>
              <span class="meta-dot">·</span>
              <span class="meta-inline"><span class="i-lucide-clock" /> {{ post.readingTime || 1 }} 分钟阅读</span>
            </div>

            <h2 class="vp-post-title">
              <a :href="post.url" class="vp-post-link">{{ post.title }}</a>
            </h2>

            <p v-if="post.excerpt" class="vp-post-excerpt">
              {{ post.excerpt }}
            </p>

            <div class="vp-post-footer">
              <div class="vp-post-tags">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="vp-post-tag"
                  @click.stop="selectTag(tag)"
                >
                  #{{ tag }}
                </span>
              </div>

              <a :href="post.url" class="vp-read-more">
                阅读全文 →
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- 筛选无结果缺省状态 -->
    <div v-else class="vp-blog-empty">
      <p class="vp-empty-text">当前标签暂无相关文章</p>
      <button class="vp-empty-btn" @click="selectTag('all')">
        查看全部文章
      </button>
    </div>
  </div>
</template>

<style scoped>
.vp-blog-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 20px 64px;
}

.vp-blog-header {
  text-align: center;
  margin-bottom: 36px;
}

.vp-blog-title {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 12px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.vp-blog-subtitle {
  font-size: 1.05rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.6;
}

/* 标签筛选栏 */
.vp-blog-tags-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 40px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.vp-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vp-tag-chip:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.vp-tag-chip.active {
  color: #fff;
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.vp-tag-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}

.vp-tag-chip.active .vp-tag-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* 文章流与年份分组 */
.vp-year-group {
  margin-bottom: 48px;
}

.vp-year-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.vp-year-badge {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.vp-year-line {
  flex: 1;
  height: 1px;
  background: var(--vp-c-divider);
}

.vp-posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vp-post-card {
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.vp-post-card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.vp-post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 10px;
}

.meta-inline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.meta-dot {
  color: var(--vp-c-text-3);
  user-select: none;
}

.vp-post-title {
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 10px;
}

.vp-post-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.vp-post-link:hover {
  color: var(--vp-c-brand-1);
}

.vp-post-excerpt {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0 0 16px;
}

.vp-post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.vp-post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vp-post-tag {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  padding: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.vp-post-tag:hover {
  background: var(--vp-c-brand-soft);
}

.vp-read-more {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: transform 0.2s ease;
}

.vp-read-more:hover {
  transform: translateX(4px);
}

/* 空状态 */
.vp-blog-empty {
  text-align: center;
  padding: 48px 20px;
}

.vp-empty-text {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 16px;
}

.vp-empty-btn {
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  background: var(--vp-c-brand-1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.vp-empty-btn:hover {
  background: var(--vp-c-brand-2);
}
</style>
