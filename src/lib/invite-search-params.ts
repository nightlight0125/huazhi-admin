/**
 * 从完整 URL 解析邀请注册参数（如 ?customerId= &operatorId=），用于登录/注册链路传递。
 */
export function parseInviteSearchParamsFromHref(href: string): {
  customerId?: string
  operatorId?: string
} {
  try {
    const u = new URL(href, 'http://localhost')
    const customerId = u.searchParams.get('customerId')?.trim()
    const operatorId = u.searchParams.get('operatorId')?.trim()
    return {
      ...(customerId ? { customerId } : {}),
      ...(operatorId ? { operatorId } : {}),
    }
  } catch {
    return {}
  }
}

/**
 * 从当前页地址栏 query 读取邀请 ID（始终为字符串）。
 * 避免路由/JSON 把纯数字解析成 number 导致大整数精度丢失。
 */
export function getInviteIdsFromCurrentSearchParams(): {
  customerId?: string
  operatorId?: string
} {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const customerId = p.get('customerId')?.trim()
  const operatorId = p.get('operatorId')?.trim()
  return {
    ...(customerId ? { customerId } : {}),
    ...(operatorId ? { operatorId } : {}),
  }
}

/**
 * 与路由 search 合并：优先使用地址栏 URLSearchParams 的原始字符串（与展示一致），
 * 否则回退到路由解析值并 String()，保证提交给后端与地址栏一致、且为大整数字符串。
 */
export function mergeInviteIdsFromRoute(
  routeCustomerId?: string,
  routeOperatorId?: string
): { customerId?: string; operatorId?: string } {
  const fromBar = getInviteIdsFromCurrentSearchParams()
  const pick = (
    bar: string | undefined,
    route: string | undefined
  ): string | undefined => {
    if (bar) return bar
    if (route === undefined || route === null || route === '') return undefined
    return String(route)
  }
  return {
    customerId: pick(fromBar.customerId, routeCustomerId),
    operatorId: pick(fromBar.operatorId, routeOperatorId),
  }
}
