import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Quotes } from '@/features/quotes'
import { statuses, qualities } from '@/features/quotes/data/data'

const quoteSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  quality: z
    .array(z.enum(qualities.map((quality) => quality.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/quotes/')({
  validateSearch: quoteSearchSchema,
  component: Quotes,
})