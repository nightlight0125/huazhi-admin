import { createFileRoute } from '@tanstack/react-router'
import { PackagingConnection } from '@/features/packaging-connection'

export const Route = createFileRoute('/_authenticated/packaging-connection/')({
  component: PackagingConnection,
})
