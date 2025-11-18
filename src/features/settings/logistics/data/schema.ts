import { z } from 'zod'

export const logisticsSchema = z.object({
  id: z.string(),
  sku: z.string(),
  variant: z.string(),
  qty: z.number(),
  shippingMethod: z.string(),
  shippingFrom: z.string(),
  shippingTo: z.string(),
  shippingTime: z.string(),
  shippingPrice: z.number(),
  productImage: z.string().optional(),
})

export type Logistics = z.infer<typeof logisticsSchema>

