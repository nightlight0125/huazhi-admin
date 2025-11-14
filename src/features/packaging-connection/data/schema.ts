import { z } from 'zod'

// 包装产品数据模型
export const packagingProductSchema = z.object({
  id: z.string(),
  image: z.string(),
  name: z.string(),
  sku: z.string(),
  variant: z.string(),
  price: z.number(),
  relatedTime: z.date(),
})

// 店铺SKU数据模型
export const storeSkuSchema = z.object({
  id: z.string(),
  image: z.string(),
  name: z.string(),
  sku: z.string(),
  variantId: z.string(),
  storeName: z.string(),
  price: z.number(),
  isConnected: z.boolean(),
  hzProductId: z.string().optional(),
  hzProductImage: z.string().optional(),
  hzProductSku: z.string().optional(),
  packagingProducts: z.array(packagingProductSchema).optional(),
})

export type PackagingProduct = z.infer<typeof packagingProductSchema>
export type StoreSku = z.infer<typeof storeSkuSchema>

