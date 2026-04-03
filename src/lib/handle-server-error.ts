import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

export function handleServerError(error: unknown) {
  if (useAuthStore.getState().signingOut) {
    return
  }

  // 鉴权相关错误（比如未登录 / 退出登录过程中的 401）在 axios 拦截器里已经统一处理，
  // 这里不再弹 toast，避免出现空白或重复提示。
  if (
    error &&
    typeof error === 'object' &&
    'isAuthError' in error &&
    (error as any).isAuthError
  ) {
    return
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Content not found.'
  }

  if (error instanceof AxiosError) {
    const data: any = error.response?.data
    errMsg = data?.title || data?.message || error.message || errMsg
  }

  if (!errMsg) return

  toast.error(errMsg)
}
