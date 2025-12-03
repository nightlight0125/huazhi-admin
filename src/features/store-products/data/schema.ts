import { z } from 'zod'

export const storeProductSchema = z.object({
  id: z.string(),
  image: z.string().url(),
  name: z.string(),
  storePrice: z.number(),
  hzPrice: z.number().nullable(),
  shippingFrom: z.string(),
  shippingMethod: z.string().nullable(),
  storeName: z.string(),
  // 关联状态：associated / not-associated / pending
  associateStatus: z.enum(['associated', 'not-associated', 'pending']).optional(),
  // 商品状态：active / inactive 等
  status: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type StoreProduct = z.infer<typeof storeProductSchema>
