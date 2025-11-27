import { createFileRoute } from '@tanstack/react-router'
import { StockOrders } from '@/features/stock-orders'

export const Route = createFileRoute('/_authenticated/stock-orders/')({
  component: StockOrders,
})
