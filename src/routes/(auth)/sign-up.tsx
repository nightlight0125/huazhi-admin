import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@/features/auth/sign-up'

const searchSchema = z.object({
  // query 里的值有时会被解析成 number（例如纯数字），这里强制转回 string
  customerId: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
  operatorId: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
})

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
  validateSearch: searchSchema,
})
