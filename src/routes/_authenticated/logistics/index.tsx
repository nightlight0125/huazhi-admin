import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Logistics } from '@/features/logistics'

const logisticsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
  shippingFrom: z.string().optional().catch(''),
  shippingTo: z.string().optional().catch(''),
  shippingMethod: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/logistics/')({
  validateSearch: logisticsSearchSchema,
  component: Logistics,
})
