import { z } from 'zod'

export const publishedProductSchema = z.object({
  id: z.string(),
  image: z.string().url(),
  name: z.string(),
  spu: z.string(),
  /** 后端 hzkj_spu_number，列表展示优先使用 */
  hzkj_spu_number: z.string().optional(),
  storeName: z.string(),
  tdPrice: z.number(),
  yourPrice: z.string(), // HKD49.99 format
  /** 后端 hzkj_shopify_price */
  hzkj_shopify_price: z.union([z.string(), z.number()]).optional(),
  /** 后端 hzkj_hz_min_price */
  hzkj_hz_min_price: z.number().optional(),
  weight: z.number(), // in grams
  shippingFrom: z.string(),
  shippingMethod: z.string(),
  amount: z.number(),
  status: z.enum(['published', 'publishing', 'failed']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type PublishedProduct = z.infer<typeof publishedProductSchema>

