import { createFileRoute } from '@tanstack/react-router'
import { PublishedProducts } from '@/features/published-products'

export const Route = createFileRoute('/_authenticated/published-products/')({
  component: PublishedProducts,
  validateSearch: (search: Record<string, unknown>) => {
    const storeNameRaw = search.storeName
    const storeName =
      Array.isArray(storeNameRaw)
        ? storeNameRaw.map(String).filter(Boolean)
        : storeNameRaw != null && storeNameRaw !== ''
          ? [String(storeNameRaw)]
          : undefined
    return {
      page: Number(search.page) || 1,
      pageSize: Number(search.pageSize) || 10,
      filter: (search.filter as string) || '',
      ...(storeName && storeName.length > 0 ? { storeName } : {}),
    }
  },
})
