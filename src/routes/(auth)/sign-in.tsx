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
  /** 邀请注册：与 sign-up 一致（不用 preprocess，避免 Router 把 key 推断成必填 unknown） */
  customerId: z
    .union([z.string(), z.number()])
    .transform((value) => String(value))
    .optional(),
  operatorId: z
    .union([z.string(), z.number()])
    .transform((value) => String(value))
    .optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
  validateSearch: searchSchema,
})
