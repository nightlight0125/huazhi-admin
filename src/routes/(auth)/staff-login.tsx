import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { StaffLogin } from '@/features/auth/staff-login'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/staff-login')({
  component: StaffLogin,
  validateSearch: searchSchema,
})
