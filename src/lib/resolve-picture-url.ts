const API_BASE = 'https://test.hzdrop.com/kapi/'
const ORIGIN = 'https://test.hzdrop.com'

/** 将后端返回的 picture/pic 转为可用的完整 URL（相对路径需拼接域名） */
export function resolvePictureUrl(picture: unknown): string {
  const raw = typeof picture === 'string' ? picture.trim() : ''
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return `${ORIGIN}${raw}`
  return `${API_BASE}${raw.replace(/^\//, '')}`
}
