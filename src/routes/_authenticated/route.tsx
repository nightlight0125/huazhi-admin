import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { auth } = useAuthStore.getState()
    const token = auth.accessToken
    const user = auth.user

    // 检查是否有 token
    if (!token || token.trim() === '') {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
        replace: true,
      })
    }

    // 检查 token 是否过期（如果用户信息中有过期时间）
    if (user?.exp) {
      const now = Date.now()
      if (now >= user.exp) {
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
    }
  },
  component: AuthenticatedLayout,
})
