import { createFileRoute } from '@tanstack/react-router'
import { RecommendProducts } from '@/features/recommend-products'

export const Route = createFileRoute('/_authenticated/recommend-products/')({
  component: RecommendProducts,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
    }
  },
})
