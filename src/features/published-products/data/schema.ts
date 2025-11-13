import { z } from 'zod'

export const publishedProductSchema = z.object({
  id: z.string(),
  image: z.string().url(),
  name: z.string(),
  spu: z.string(),
  storeName: z.string(),
  tdPrice: z.number(),
  yourPrice: z.string(), // HKD49.99 format
  weight: z.number(), // in grams
  shippingFrom: z.string(),
  shippingMethod: z.string(),
  amount: z.number(),
  status: z.enum(['published', 'publishing', 'failed']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type PublishedProduct = z.infer<typeof publishedProductSchema>

