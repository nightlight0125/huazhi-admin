import { createFileRoute } from '@tanstack/react-router'
import { OrdersCreate } from '@/features/orders/create'

export const Route = createFileRoute('/_authenticated/orders/create')({
  component: OrdersCreate,
})
