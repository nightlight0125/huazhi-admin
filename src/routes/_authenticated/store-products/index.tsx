import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { storeProductStatuses } from '@/features/store-products/data/store-products-data'
import { StoreProducts } from '@/features/store-products'

const storeProductsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(storeProductStatuses.map((status) => status.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/store-products/')({
  validateSearch: storeProductsSearchSchema,
  component: StoreProducts,
})

