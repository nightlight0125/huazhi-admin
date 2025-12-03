import { z } from 'zod'

export const sourcingSchema = z.object({
  id: z.string(),
  sourcingId: z.string(),
  url: z.string().optional(),
  images: z.array(z.string()).optional(),
  productName: z.string(),
  status: z.string(),
  result: z.string().optional(),
  remark: z.string().optional(),
  productId: z.string().optional(), // 关联的产品ID
  createdTime: z.date(),
  resultTime: z.date().optional(),
})

export type Sourcing = z.infer<typeof sourcingSchema>

