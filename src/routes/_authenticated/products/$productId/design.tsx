import { createFileRoute } from '@tanstack/react-router'
import { ProductDesign } from '@/features/products/components/product-design'

export const Route = createFileRoute('/_authenticated/products/$productId/design')({
  component: ProductDesign,
  validateSearch: () => ({}),
})
