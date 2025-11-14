import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { ProductDetails } from '@/features/products/components/product-details'

function ProductPage() {
  const location = useLocation()
  const isPurchasePage = location.pathname.includes('/purchase')
  const isDesignPage = location.pathname.includes('/design')
  
  if (isPurchasePage || isDesignPage) {
    return <Outlet />
  }
  
  return <ProductDetails />
}

export const Route = createFileRoute('/_authenticated/products/$productId')({
  component: ProductPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      from: (search.from as string) || undefined,
    }
  },
})
