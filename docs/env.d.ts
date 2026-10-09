/**
 * 全局环境变量与虚拟模块类型声明
 * @author Ateng
 * @since 2026-09-25
 */

declare module '@localSearchIndex' {
  const localSearchIndex: Record<string, () => Promise<{ default: string }>>
  export default localSearchIndex
}
