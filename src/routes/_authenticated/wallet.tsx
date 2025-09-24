import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Wallet } from '@/features/wallet'

const walletSearchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  filter: z.string().optional(),
  status: z.array(z.string()).optional(),
  customer: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/wallet')({
  component: Wallet,
  validateSearch: walletSearchSchema,
})
