/** 与需求一致：外链支付跳转前写入，回调页读取（同源 sessionStorage） */
export const PAYMENT_RETURN_TO_STORAGE_KEY = 'paymentReturnTo'

/** 支付完成后「前往哪类订单列表」：localStorage（持久化，支付回跳仍可读） */
export const PAYMENT_ORDER_SOURCE_STORAGE_KEY = 'paymentOrderSource'

export type PaymentOrderSource = 'store' | 'sample' | 'stock'

export function persistPaymentOrderSource(source: PaymentOrderSource): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PAYMENT_ORDER_SOURCE_STORAGE_KEY, source)
  } catch {
    // ignore
  }
}

/** 读取来源但不删除（供成功页/回调页渲染；跳转前请再调 clear） */
export function peekPaymentOrderSource(): PaymentOrderSource | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const v = localStorage.getItem(PAYMENT_ORDER_SOURCE_STORAGE_KEY)
    if (v === 'store' || v === 'sample' || v === 'stock') return v
    return undefined
  } catch {
    return undefined
  }
}

export function clearPaymentOrderSource(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(PAYMENT_ORDER_SOURCE_STORAGE_KEY)
  } catch {
    // ignore
  }
}

const MAX_RETURN_LEN = 2048

/** 仅允许站内相对路径，防止开放重定向 */
export function sanitizeInternalReturnTo(
  raw: string | undefined | null
): string | undefined {
  if (raw == null || typeof raw !== 'string') return undefined
  const t = raw.trim()
  if (!t.startsWith('/') || t.startsWith('//')) return undefined
  if (t.includes('\\')) return undefined
  if (/^javascript:/i.test(t) || /^data:/i.test(t)) return undefined
  if (t.length > MAX_RETURN_LEN) return undefined
  try {
    const u = new URL(t, 'http://local.invalid')
    if (u.username || u.password || u.host !== 'local.invalid') return undefined
    return u.pathname + u.search
  } catch {
    return undefined
  }
}

export function getCurrentPaymentReturnPath(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname + (window.location.search || '')
}

export function persistPaymentReturnTo(path?: string): void {
  if (typeof window === 'undefined') return
  const raw = path ?? getCurrentPaymentReturnPath()
  const safe = sanitizeInternalReturnTo(raw)
  if (!safe) return
  try {
    sessionStorage.setItem(PAYMENT_RETURN_TO_STORAGE_KEY, safe)
  } catch {
    // ignore
  }
}

export function consumePaymentReturnTo(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const v = sessionStorage.getItem(PAYMENT_RETURN_TO_STORAGE_KEY)
    sessionStorage.removeItem(PAYMENT_RETURN_TO_STORAGE_KEY)
    return sanitizeInternalReturnTo(v)
  } catch {
    return undefined
  }
}

type NavigateFn = (opts: {
  to: string
  search?: Record<string, unknown>
  replace?: boolean
}) => void

export function navigateToSanitizedReturnTo(
  navigate: NavigateFn,
  raw: string | undefined,
  options?: { replace?: boolean }
): boolean {
  const safe = sanitizeInternalReturnTo(raw)
  if (!safe) return false
  const q = safe.indexOf('?')
  const pathname = q === -1 ? safe : safe.slice(0, q)
  const searchStr = q === -1 ? '' : safe.slice(q + 1)
  if (!searchStr) {
    navigate({ to: pathname, replace: options?.replace })
    return true
  }
  const params = new URLSearchParams(searchStr)
  const search: Record<string, unknown> = {}
  for (const [k, v] of params) {
    search[k] = v
  }
  navigate({ to: pathname, search, replace: options?.replace })
  return true
}
