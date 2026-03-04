import { z } from 'zod'

export const likedProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** 后端返回的英文名，可能是字符串或对象 { GLang?, zh_CN? } */
  enname: z
    .union([
      z.string(),
      z.record(z.string(), z.unknown()),
    ])
    .optional(),
  image: z.string(),
  description: z.string(),
  spu: z.string(),
  priceMin: z.number(),
  priceMax: z.number(),
  addDate: z.date(),
})

export type LikedProduct = z.infer<typeof likedProductSchema>

