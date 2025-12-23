import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { ProductPurchase } from '@/features/products/components/product-purchase'
import { products } from '@/features/products/data/data'
import type { Product } from '@/features/products/data/schema'
import { useState } from 'react'

function ProductPurchasePage() {
  const { productId } = useParams({ from: '/_authenticated/products/$productId/purchase' })
  const search = useSearch({ from: '/_authenticated/products/$productId/purchase' })
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const mode = (search.mode as 'sample' | 'stock' | undefined) ?? 'sample'
  const product = products.find((p: Product) => p.id === productId)

  if (!product) return null

  return (
    <ProductPurchase
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          navigate({ to: '/products/$productId', params: { productId }, search: { from: search.from as string | undefined } })
        }
      }}
      mode={mode}
      product={{ id: product.id, name: product.name, image: product.image, price: product.price, sku: product.sku }}
    />
  )
}

export const Route = createFileRoute(
  '/_authenticated/products/$productId/purchase'
)({
  component: ProductPurchasePage,
  validateSearch: (search: Record<string, unknown>) => {
    const mode = search.mode
    return {
      mode: mode === 'sample' || mode === 'stock' ? mode : 'sample',
      from: (search.from as string | undefined) ?? undefined,
    }
  },
})
