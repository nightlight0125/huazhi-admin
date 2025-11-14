import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { StoreManagement } from '@/features/store-management'

const storeManagementSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/store-management')({
  validateSearch: storeManagementSearchSchema,
  component: StoreManagement,
})
