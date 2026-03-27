import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'

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

export const Route = createFileRoute('/(auth)/staff-login')({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/sign-in',
      search: {
        redirect: search.redirect,
        accountId: search.accountId,
        bizUserId: search.bizUserId,
      },
      replace: true,
    })
  },
})
