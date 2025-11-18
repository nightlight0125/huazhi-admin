import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SupportTickets } from '@/features/support-tickets'

const supportTicketsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/support-tickets/')({
  validateSearch: supportTicketsSearchSchema,
  component: SupportTickets,
})
