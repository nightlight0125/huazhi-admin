import { createFileRoute } from '@tanstack/react-router'
import { LikedProducts } from '@/features/liked-products'

export const Route = createFileRoute('/_authenticated/liked-products/')({
  component: LikedProducts,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
    }
  },
})
