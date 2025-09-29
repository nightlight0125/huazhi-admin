import { createFileRoute } from '@tanstack/react-router'
import { ProductPurchase } from '@/features/products/components/product-purchase'

export const Route = createFileRoute('/_authenticated/products/$productId/purchase')({
  component: ProductPurchase,
})
