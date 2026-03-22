import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/orders'

const normalizeOrderStatus = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  // 兼容 dashboard 传参被包了引号的情况：orderStatus="%222%22" -> "2"
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const ordersSearchSchema = z.object({
  orderStatus: z.preprocess(normalizeOrderStatus, z.string().optional()).catch(undefined),
  page: z.number().optional().catch(undefined),
  pageSize: z.number().optional().catch(undefined),
  filter: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/orders/')({
  validateSearch: (search: Record<string, unknown>) =>
    ordersSearchSchema.parse(search),
  component: Orders,
})
