import { z } from 'zod'

export const recommendProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  description: z.string(),
  spu: z.string(),
  priceMin: z.number(),
  priceMax: z.number(),
  addDate: z.date(),
})

export type RecommendProduct = z.infer<typeof recommendProductSchema>

