import { z } from 'zod'

export const packagingProductSchema = z.object({
  id: z.string(),
  image: z.string().url(),
  name: z.string(),
  sku: z.string(),
  category: z.enum([
    'paper-boxes',
    'plastic-boxes',
    'leather-boxes',
    'wooden-boxes',
    'bamboo-boxes',
    'cartons',
    'card',
    'sticker',
    'shipping-bag',
    'ziplock-bag',
  ]),
  sizes: z.array(
    z.object({
      label: z.string(), // e.g., "Small 36*36cm"
      value: z.string(),
    })
  ),
  price: z.number(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type PackagingProduct = z.infer<typeof packagingProductSchema>

