import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Products } from '@/features/products'
import { categories, locations, priceRanges } from '@/features/products/data/data'

const productSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  location: z
    .array(z.enum(locations.map((loc) => loc.value)))
    .optional()
    .catch([]),
  category: z
    .array(z.enum(categories.map((cat) => cat.value)))
    .optional()
    .catch([]),
  priceRange: z
    .array(z.enum(priceRanges.map((range) => range.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/products/')({
  validateSearch: productSearchSchema,
  component: Products,
})
