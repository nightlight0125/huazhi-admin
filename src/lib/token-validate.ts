/** 后端 validateTime（字符串）解析为「过期时刻」的毫秒时间戳 */
export function parseValidateTimeToMs(value: unknown): number | null {
  if (value == null || value === '') return null
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return null
    // 秒级时间戳（10 位）
    if (value < 1e12) return Math.round(value * 1000)
    return Math.round(value)
  }
  if (typeof value !== 'string') return null
  const s = value.trim()
  if (!s) return null
  if (/^\d+$/.test(s)) {
    const n = Number(s)
    if (!Number.isFinite(n) || n <= 0) return null
    if (s.length <= 10) return n * 1000
    return n
  }
  const parsed = Date.parse(s)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

/**
 * 在 `validateTime` 之前的该时间窗口内会触发 refreshToken（与 api-client 拦截器一致）。
 * 测试阶段写死为 **1 分钟**；上线后可改为 env 或更长窗口。
 */
export const TOKEN_REFRESH_BUFFER_MS = 60 * 1000

/**
 * 是否应在发请求前先刷新 token（临近过期）。
 * 条件：`now >= tokenExpiresAtMs - bufferMs`
 */
export function shouldRefreshTokenBeforeExpiry(
  tokenExpiresAtMs: number,
  nowMs: number = Date.now(),
  bufferMs: number = TOKEN_REFRESH_BUFFER_MS
): boolean {
  return nowMs >= tokenExpiresAtMs - bufferMs
}
