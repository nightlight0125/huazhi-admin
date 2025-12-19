import { z } from 'zod'

export const storeSchema = z.object({
  name: z.string(),
  id: z.string(),
  bindtime: z.string().optional(),
  createtime: z.string().optional(),
  enable: z.union([z.string(), z.number()]).optional(),
  platform: z.string().optional(),
})

export type Store = z.infer<typeof storeSchema>

