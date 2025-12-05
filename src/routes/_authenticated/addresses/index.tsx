import { createFileRoute } from '@tanstack/react-router'
import { Addresses } from '@/features/addresses'

export const Route = createFileRoute('/_authenticated/addresses/')({
  component: Addresses,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
    }
  },
})
