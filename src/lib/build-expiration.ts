const EXPIRED_PATH = '/500'
// const EXPIRE_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const EXPIRE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function toPositiveNumber(raw: unknown): number | null {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

function getExpireAtMs(): number | null {
  // Highest priority: explicit absolute expiration timestamp.
  const explicitExpireAt = toPositiveNumber(import.meta.env.VITE_EXPIRE_AT_MS)
  if (explicitExpireAt != null) {
    return explicitExpireAt
  }

  // Fallback: build timestamp + expiration window.
  const buildTimeMs = toPositiveNumber(import.meta.env.VITE_BUILD_TIME_MS)
  if (buildTimeMs != null) {
    return buildTimeMs + EXPIRE_WINDOW_MS
  }

  return null
}

export function isBuildExpired(nowMs: number = Date.now()): boolean {
  const expireAtMs = getExpireAtMs()
  if (expireAtMs == null) {
    return false
  }
  return nowMs >= expireAtMs
}

export function redirectToExpiredIfNeeded(): boolean {
  if (!isBuildExpired()) return false
  if (typeof window === 'undefined') return true
  if (window.location.pathname !== EXPIRED_PATH) {
    window.location.replace(EXPIRED_PATH)
    return true
  }
  // Already on /expired: allow app render so expired page can display.
  return false
}

export function getExpireAtIsoString(): string {
  const expireAtMs = getExpireAtMs()
  if (expireAtMs == null) return 'N/A'
  return new Date(expireAtMs).toISOString()
}
