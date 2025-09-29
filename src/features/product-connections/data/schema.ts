import { z } from 'zod'

// 品牌连接状态
export const brandConnectionSchema = z.object({
  logo: z.object({
    connected: z.boolean(),
    brandItemId: z.string().optional(),
    brandItemName: z.string().optional(),
  }),
  card: z.object({
    connected: z.boolean(),
    brandItemId: z.string().optional(),
    brandItemName: z.string().optional(),
  }),
  productPackaging: z.object({
    connected: z.boolean(),
    brandItemId: z.string().optional(),
    brandItemName: z.string().optional(),
  }),
  shippingPackaging: z.object({
    connected: z.boolean(),
    brandItemId: z.string().optional(),
    brandItemName: z.string().optional(),
  }),
})

// 产品连接的数据模型
export const productConnectionSchema = z.object({
  id: z.string(),
  productImage: z.string(),
  productName: z.string(),
  price: z.number(),
  shippingFrom: z.string(),
  shippingMethod: z.string(),
  shippingCost: z.number(),
  totalAmount: z.number(),
  brandConnections: brandConnectionSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ProductConnection = z.infer<typeof productConnectionSchema>
export type BrandConnection = z.infer<typeof brandConnectionSchema>
