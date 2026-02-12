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
  // 店铺商品相关字段
  shopSpuPicture: z.string().optional(),
  shopSpuTitle: z.string().optional(),
  shopSpuPrice: z.string().optional(),
  productID: z.string().optional(),
  // 本地商品相关字段
  localSpuPicture: z.string().optional(),
  localSpuId: z.string().optional(),
  localSpuNumber: z.string().optional(),
  localSpuPrice: z.number().optional(),
  // 其他字段
  category: z.string().optional(),
  entryId: z.string().optional(),
})

export type StoreProduct = z.infer<typeof storeProductSchema>
