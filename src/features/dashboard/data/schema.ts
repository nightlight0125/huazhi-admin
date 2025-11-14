import { z } from 'zod'

export const hotSellingProductSchema = z.object({
  id: z.string(),
  ranking: z.number(),
  productName: z.string(),
  quantity: z.number(),
  sellingAmount: z.number(),
})

export type HotSellingProduct = z.infer<typeof hotSellingProductSchema>

