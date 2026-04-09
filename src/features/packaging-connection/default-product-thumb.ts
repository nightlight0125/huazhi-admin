/** Product 列固定占位图（与列组件共用，便于 preload） */
export const DEFAULT_PRODUCT_THUMB_URL =
  'https://test.hzdrop.com/files/img/defaultDiagram.jpg'

const PRELOAD_LINK_ID = 'packaging-default-product-thumb-preload'

/** 尽早把同一张图拉进 HTTP 缓存，减少首屏/分页格子里再画时的闪动 */
export function prefetchDefaultProductThumb(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(PRELOAD_LINK_ID)) return
  const link = document.createElement('link')
  link.id = PRELOAD_LINK_ID
  link.rel = 'preload'
  link.as = 'image'
  link.href = DEFAULT_PRODUCT_THUMB_URL
  document.head.appendChild(link)
}
