import { z } from 'zod'

export const likedProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  description: z.string(),
  spu: z.string(),
  priceMin: z.number(),
  priceMax: z.number(),
  addDate: z.date(),
  // 是否已被收藏（用于演示，可根据实际数据来源调整）
  isFavorited: z.boolean(),
})

export type LikedProduct = z.infer<typeof likedProductSchema>

