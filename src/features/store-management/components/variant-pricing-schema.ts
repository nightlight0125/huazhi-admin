import { z } from 'zod'

export const variantPricingSchema = z
  .object({
    id: z.string(),
    sku: z.string(),
    skuId: z.string().optional(),
    image: z.string().optional(),
    cjColor: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    rrp: z.number().optional(),
    cjPrice: z.number().optional(),
    shippingFee: z.string().optional(),
    totalDropshippingPrice: z.string().optional(),
    yourPrice: z.string().optional(),
  })
  .passthrough() // 允许额外的动态规格字段（如 spec_xxx）

export type VariantPricing = z.infer<typeof variantPricingSchema>

