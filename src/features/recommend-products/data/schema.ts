import { z } from 'zod'

export const recommendProductSchema = z.object({
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
  spu: z.string(),
  priceMin: z.number(),
  addDate: z.date(),
})

export type RecommendProduct = z.infer<typeof recommendProductSchema>

