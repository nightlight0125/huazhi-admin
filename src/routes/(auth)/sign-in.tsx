import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
  accountId: z
    .union([z.string(), z.number()])
    .transform((value) => String(value))
    .optional(),
  bizUserId: z
    .union([z.string(), z.number()])
    .transform((value) => String(value))
    .optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
  validateSearch: searchSchema,
})
