import { createFileRoute } from '@tanstack/react-router'
import { SampleOrders } from '@/features/sample-orders'

export const Route = createFileRoute('/_authenticated/sample-orders/')({
  component: SampleOrders,
})
