import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@/features/auth/sign-up'

/** 路由 search 可能是 string 或 number，统一成 string；超大整数由 router 的 parseSearch 保持为字符串 */
const inviteIdParam = z
  .union([z.string(), z.number()])
  .transform((value) => String(value))
  .optional()

const searchSchema = z.object({
  customerId: inviteIdParam,
  operatorId: inviteIdParam,
})

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
  validateSearch: searchSchema,
})
