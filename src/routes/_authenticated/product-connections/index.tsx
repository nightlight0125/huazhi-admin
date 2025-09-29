import { createFileRoute } from '@tanstack/react-router'
import { ProductConnections } from '@/features/product-connections'

export const Route = createFileRoute('/_authenticated/product-connections/')({
  component: ProductConnections,
})
