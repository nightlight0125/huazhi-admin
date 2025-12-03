import { createFileRoute } from '@tanstack/react-router'
import { CollectionProducts } from '@/features/collection-products'

export const Route = createFileRoute(
  '/_authenticated/collection-products/'
)({
  component: CollectionProducts,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
    }
  },
})

