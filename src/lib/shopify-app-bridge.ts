/**
 * Shopify App Bridge（CDN：app-bridge.js）初始化。
 * App Bridge Next 要求同时提供 `shop` 与 `host`（嵌入 Shopify Admin 时由 URL 注入）。
 * 独立访问或缺参时跳过 createApp，避免 Uncaught: missing required configuration fields: shop
 */
const DEFAULT_API_KEY = 'a8fdd191adabac499a892ec1ac7d2e45'

type CreateAppFn = (config: {
  apiKey: string
  host: string
  shop: string
  forceRedirect?: boolean
}) => unknown

let appBridgeInstance: unknown | null = null

let bridgeScriptLoadPromise: Promise<void> | null = null

/** 仅在 Shopify 嵌入（URL 同时有 host、shop）时加载 CDN，避免独立打开站点时脚本自执行报缺 shop */
export function ensureShopifyAppBridgeScriptLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  const params = new URLSearchParams(window.location.search)
  if (!params.get('host') || !params.get('shop')) {
    return Promise.resolve()
  }
  if (getCreateAppFromWindow()) {
    return Promise.resolve()
  }
  if (bridgeScriptLoadPromise) return bridgeScriptLoadPromise

  bridgeScriptLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js'
    s.async = true
    s.dataset.shopifyAppBridge = '1'
    s.onload = () => resolve()
    s.onerror = () =>
      reject(new Error('Shopify App Bridge script failed to load'))
    document.head.appendChild(s)
  })
  return bridgeScriptLoadPromise
}

function getCreateAppFromWindow(): CreateAppFn | null {
  if (typeof window === 'undefined') return null
  const AppBridge = (window as unknown as Record<string, { default?: CreateAppFn }>)[
    'app-bridge'
  ]
  const createApp = AppBridge?.default
  return typeof createApp === 'function' ? createApp : null
}

/** 创建一次并缓存；缺 shop/host 或 CDN 未加载时返回 null */
export function initShopifyAppBridge(): unknown | null {
  if (appBridgeInstance != null) return appBridgeInstance

  const createApp = getCreateAppFromWindow()
  if (!createApp) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Shopify App Bridge] window["app-bridge"] not found. Is the CDN script loaded?'
      )
    }
    return null
  }

  const params = new URLSearchParams(window.location.search)
  const host = params.get('host')
  const shop = params.get('shop')
  if (!host || !shop) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug(
        '[Shopify App Bridge] Missing `host` or `shop` in URL — not embedded in Shopify Admin, skip init.'
      )
    }
    return null
  }

  const apiKey =
    (import.meta.env.VITE_SHOPIFY_APP_API_KEY as string | undefined) ??
    DEFAULT_API_KEY

  appBridgeInstance = createApp({
    apiKey,
    host,
    shop,
    forceRedirect: true,
  })

  return appBridgeInstance
}

export function getShopifyAppBridge(): unknown | null {
  return appBridgeInstance
}
