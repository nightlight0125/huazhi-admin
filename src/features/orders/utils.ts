/**
 * 将可能为多语言对象 { zh_CN, zh_TW, GLang } 或字符串的值转为可渲染字符串，
 * 避免 "Objects are not valid as a React child" 报错。
 */
export function toDisplayString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    return (
      (obj.GLang as string) ||
      (obj.zh_CN as string) ||
      (obj.zh_TW as string) ||
      ''
    )
  }
  return String(value)
}
