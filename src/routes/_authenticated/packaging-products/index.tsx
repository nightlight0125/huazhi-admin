import { createFileRoute } from '@tanstack/react-router'
import { PackagingProducts } from '@/features/packaging-products'

export const Route = createFileRoute('/_authenticated/packaging-products/')({
  component: PackagingProducts,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 18,
      filter: (search.filter as string) || '',
    }
  },
})
