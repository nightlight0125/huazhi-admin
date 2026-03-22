import { createFileRoute } from '@tanstack/react-router'
import { BuyStockPage } from '@/features/stock-orders/components/buy-stock-page'

export const Route = createFileRoute('/_authenticated/stock-orders/buy-stock')({
  component: BuyStockPage,
  validateSearch: (search: Record<string, unknown>) => ({
    orderId:
      typeof search.orderId === 'string' ? search.orderId : undefined,
  }),
})
