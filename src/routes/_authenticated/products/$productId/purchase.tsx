import { createFileRoute } from '@tanstack/react-router'
import { ProductPurchase } from '@/features/products/components/product-purchase'

export const Route = createFileRoute(
  '/_authenticated/products/$productId/purchase'
)({
  component: ProductPurchase,
  validateSearch: (search: Record<string, unknown>) => {
    const mode = search.mode
    return {
      mode: mode === 'sample' || mode === 'stock' ? mode : 'sample',
      from: (search.from as string | undefined) ?? undefined,
    }
  },
})
