import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { isTokenExpired } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { auth } = useAuthStore.getState()
    const token = auth.accessToken
    const user = auth.user

    // 检查是否有 token 和用户信息
    if (!token || token.trim() === '' || !user?.id) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
        replace: true,
      })
    }

    // 检查 token 是否过期（使用统一的过期检查逻辑）
    if (isTokenExpired()) {
      // Token 已过期，清除认证信息并跳转到登录页
      useAuthStore.getState().auth.reset()
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
        replace: true,
      })
    }
  },
  component: AuthenticatedLayout,
})
