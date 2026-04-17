import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { awaitOngoingAccessTokenRefresh } from '@/lib/api-client'
import { parseInviteSearchParamsFromHref } from '@/lib/invite-search-params'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    await awaitOngoingAccessTokenRefresh()

    const { auth } = useAuthStore.getState()
    const token = auth.accessToken
    const user = auth.user

    // 检查是否有 token 和用户信息（是否有效由后端与拦截器处理）
    if (!token || token.trim() === '' || !user?.id) {
      const invite = parseInviteSearchParamsFromHref(location.href)
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
          ...invite,
        },
        replace: true,
      })
    }
  },
  component: AuthenticatedLayout,
})
