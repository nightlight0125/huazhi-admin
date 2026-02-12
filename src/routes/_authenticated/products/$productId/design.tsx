import { createFileRoute } from '@tanstack/react-router'
import { ProductDesign } from '@/features/products/components/product-design'

export const Route = createFileRoute(
  '/_authenticated/products/$productId/design'
)({
  component: ProductDesign,
  // 支持可选的 skuId，用于自定义设计时指定 SKU
  validateSearch: (search: { skuId?: string }) => search,
})
