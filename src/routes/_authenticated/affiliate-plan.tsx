import { createFileRoute } from '@tanstack/react-router'
import { AffiliatePlan } from '@/features/affiliate-plan'

export const Route = createFileRoute('/_authenticated/affiliate-plan')({
  component: AffiliatePlan,
})

