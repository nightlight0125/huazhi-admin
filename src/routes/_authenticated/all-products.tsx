import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AllProducts } from '@/features/all-products'

const allProductsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/all-products')({
  validateSearch: allProductsSearchSchema,
  component: AllProducts,
})
