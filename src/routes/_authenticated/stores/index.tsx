import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Stores } from '@/features/stores'

const storeSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z.enum(['all', 'connected', 'notConnected']).optional().catch('all'),
  platform: z.enum(['all', 'shopify', 'ebay', 'tiktok', 'amazon']).optional().catch('all'),
  sort: z.enum(['asc', 'desc']).optional().catch('asc'),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/stores/')({
  validateSearch: storeSearchSchema,
  component: Stores,
})
