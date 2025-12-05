import { z } from 'zod'

const addressSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  email: z.string(),
  company: z.string(),
  address1: z.string(),
  address2: z.string().optional(),
  country: z.string(),
  province: z.string(),
  city: z.string(),
  postcode: z.string(),
  taxId: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Address = z.infer<typeof addressSchema>

export const addressListSchema = z.array(addressSchema)

