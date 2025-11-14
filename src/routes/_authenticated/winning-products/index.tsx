import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { WinningProducts } from '@/features/winning-products'

const winningProductsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/winning-products/')({
  validateSearch: winningProductsSearchSchema,
  component: WinningProducts,
})
