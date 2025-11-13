import { createFileRoute } from '@tanstack/react-router'
import { Sourcing } from '@/features/sourcing'

export const Route = createFileRoute('/_authenticated/sourcing/')({
  component: Sourcing,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
      status: Array.isArray(search.status)
        ? (search.status as string[])
        : search.status
          ? [search.status as string]
          : [],
    }
  },
})
