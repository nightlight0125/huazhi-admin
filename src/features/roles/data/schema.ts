import { z } from 'zod'

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
  userCount: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Role = z.infer<typeof roleSchema>

export const roleListSchema = z.array(roleSchema)
