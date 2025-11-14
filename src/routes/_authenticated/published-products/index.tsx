import { createFileRoute } from '@tanstack/react-router'
import { PublishedProducts } from '@/features/published-products'

export const Route = createFileRoute('/_authenticated/published-products/')({
  component: PublishedProducts,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
    }
  },
})
