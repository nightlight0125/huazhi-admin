import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/orders'

const ordersSearchSchema = z.object({
  orderStatus: z.string().optional().catch(undefined),
  page: z.number().optional().catch(undefined),
  pageSize: z.number().optional().catch(undefined),
  filter: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/orders/')({
  validateSearch: (search: Record<string, unknown>) =>
    ordersSearchSchema.parse(search),
  component: Orders,
})
