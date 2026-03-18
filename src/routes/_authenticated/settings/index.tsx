import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/features/settings/profile'

export const Route = createFileRoute('/_authenticated/settings/')({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || 'profile',
    returnTo: (search.returnTo as string) || undefined,
  }),
  component: SettingsProfile,
})
