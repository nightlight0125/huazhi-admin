import { z } from 'zod'

export const storeSchema = z.object({
  storeName: z.string(),
  storeId: z.string(),
  authorizationTime: z.object({
    date: z.string(),
    time: z.string(),
  }),
  createTime: z.object({
    date: z.string(),
    time: z.string(),
  }),
  storeStatus: z.string(),
  authorizationStatus: z.string(),
  platformType: z.string(),
})

export type Store = z.infer<typeof storeSchema>

