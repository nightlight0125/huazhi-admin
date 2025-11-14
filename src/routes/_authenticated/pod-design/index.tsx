import { createFileRoute } from '@tanstack/react-router'
import { PodDesign } from '@/features/pod-design'

export const Route = createFileRoute('/_authenticated/pod-design/')({
  component: PodDesign,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
    }
  },
})
