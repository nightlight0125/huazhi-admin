import { z } from 'zod'

export const variantPricingSchema = z.object({
  id: z.string(),
  sku: z.string(),
  cjColor: z.string(),
  color: z.string(),
  rrp: z.number(),
  cjPrice: z.number(),
  shippingFee: z.string().optional(),
  totalDropshippingPrice: z.string().optional(),
  yourPrice: z.string().optional(),
})

export type VariantPricing = z.infer<typeof variantPricingSchema>

