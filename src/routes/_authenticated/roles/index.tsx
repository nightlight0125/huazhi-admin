import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Roles } from '@/features/roles'

const rolesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  sort: z.string().optional().catch(''),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/roles/')({
  component: Roles,
  validateSearch: (search) => rolesSearchSchema.parse(search),
})
