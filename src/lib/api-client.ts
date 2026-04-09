import { redirectToExpiredIfNeeded } from '@/lib/build-expiration'
import { shouldRefreshTokenBeforeExpiry } from '@/lib/token-validate'
import { useAuthStore } from '@/stores/auth-store'
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

type RequestConfigExtra = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean
}

/** 并发请求共享同一次刷新 */
let refreshInFlight: Promise<void> | null = null

async function ensureValidAccessToken(): Promise<void> {
  const { auth } = useAuthStore.getState()
  const exp = auth.tokenExpiresAtMs
  const current = auth.accessToken
  if (!current || exp == null) return
  if (!shouldRefreshTokenBeforeExpiry(exp)) return

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { auth: a } = useAuthStore.getState()
      const t = a.accessToken
      if (!t) return
      try {
        const { refreshTokenApi } = await import('@/lib/api/auth')
        const { token: newToken, expiresAtMs } = await refreshTokenApi(t)
        a.setAccessToken(newToken)
        a.setTokenExpiresAtMs(expiresAtMs)
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error(
            '[ensureValidAccessToken] refreshTokenApi 失败，将清空登录态并跳转登录页',
            e instanceof Error ? e.message : e
          )
        }
        a.reset()
        if (typeof window !== 'undefined') {
          const path = window.location.pathname
          if (
            !path.includes('/sign-in') &&
            !path.includes('/sign-up') &&
            !path.includes('/staff-login')
          ) {
            const redirectPath =
              window.location.pathname + window.location.search
            window.location.href = `/sign-in?redirect=${encodeURIComponent(
              redirectPath
            )}`
          }
        }
        const err = new Error('Token expired. Please login again.')
        // @ts-expect-error - 添加自定义属性
        err.isAuthError = true
        throw err
      } finally {
        refreshInFlight = null
      }
    })()
  }
  await refreshInFlight
}

// 创建 axios 实例
export const apiClient: AxiosInstance = axios.create({
  // 临时关闭 Vite 代理后，开发环境也直连后端
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://test.hzdrop.com/kapi/',
  // baseURL: 'http://test.hzdrop.com/kapi/v2/hzkj/hzkj_ordercenter/',
  // baseURL: 'http://47.242.207.93/kapi/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'openApiSign':'anZYZFdrTFpkUGx5VWNaSmlkbHZIb3pjSEV6LVJOd3dKRVcxV3ZaZjRQYz06MjI5OTI4NDg2NzgxNDM1Njk5Mg==',
    'x-acgw-identity':'djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=',
  },
})

function isAnonymousMemberFlowUrl(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes('/hzkj_ordercenter/member/registerSendCode') ||
    url.includes('/v2/hzkj/base/member/add')
  )
}

apiClient.interceptors.request.use(
  async (config: RequestConfigExtra) => {
    if (redirectToExpiredIfNeeded()) {
      return Promise.reject(new Error('Build expired. Access denied.'))
    }

    const isRefreshTokenRequest = config.url?.includes(
      '/hzkj_customer/member/refreshTokenApi'
    )

    const { auth } = useAuthStore.getState()
    let token = auth.accessToken

    const isLoginRequest = config.url?.includes('/v2/hzkj/base/member/login')
    const isIdLoginRequest = config.url?.includes(
      '/v2/hzkj/hzkj_im_ext/member/idLogin'
    )
    const isForgotPasswordRequest =
      config.url?.includes('/hzkj_member/member/getResetPassWordCode') ||
      config.url?.includes('/hzkj_member/member/sendCode') ||
      config.url?.includes('/hzkj_member/member/resetPassword')

    const isPaymentCallbackRequest =
      config.url?.includes('order/paymentCallback') ||
      config.url?.includes('wallet/callback')

    if (
      isLoginRequest ||
      isIdLoginRequest ||
      isAnonymousMemberFlowUrl(config.url) ||
      isForgotPasswordRequest ||
      isPaymentCallbackRequest
    ) {
      if (token && config.headers) {
        config.headers.access_token = `${token}`
        config.headers['x-acgw-identity'] = `djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=`
      }
      return config
    }

    if (!token) {
      // 未登录/已退出：不再抛出带文案的错误，避免在退出时出现多余的全局提示
      const error = new Error('')
      // @ts-expect-error - 添加自定义属性
      error.isAuthError = true
      return Promise.reject(error)
    }

    // 临近 validateTime 时先刷新 token（不经过本逻辑：刷新接口 / skipAuthRefresh）
    if (!isRefreshTokenRequest && !config.skipAuthRefresh) {
      try {
        await ensureValidAccessToken()
      } catch (e) {
        return Promise.reject(e)
      }
      token = useAuthStore.getState().auth.accessToken
      if (!token) {
        const error = new Error('')
        // @ts-expect-error
        error.isAuthError = true
        return Promise.reject(error)
      }
    }
    if (token && config.headers) {
      config.headers.access_token = `${token}`
      config.headers['x-acgw-identity'] = `djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=`
    }

    return config
  },
  (error) => {
    console.error('API 请求错误:', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  async (response) => {
    const responseData = response.data as any
    const config = response.config as InternalAxiosRequestConfig | undefined

    const hasLogical401 =
      responseData &&
      typeof responseData === 'object' &&
      (responseData.errorCode === '401' ||
        (responseData.errorCode === 401 && responseData.status === false))

    if (hasLogical401) {
      const isLoginOrIdLogin =
        config?.url?.includes('/v2/hzkj/base/member/login') ||
        config?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (isLoginOrIdLogin) {
        // 401 来自 login / idLogin 时不再走通用 401 分支，直接登出，避免死循环
        const authStore = useAuthStore.getState()
        authStore.auth.reset()
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          const isAuthPage =
            currentPath.includes('/sign-in') ||
            currentPath.includes('/sign-up') ||
            currentPath.includes('/staff-login')
          if (!isAuthPage) {
            const redirectPath =
              window.location.pathname + window.location.search
            window.location.href = `/sign-in?redirect=${encodeURIComponent(
              redirectPath
            )}`
          }
        }
        return Promise.reject(
          new Error(responseData?.message || 'AccessToken认证不通过，token已过期')
        )
      }
      if (isAnonymousMemberFlowUrl(config?.url)) {
        return Promise.reject(
          new Error(
            responseData?.message || 'AccessToken认证不通过，token已过期'
          )
        )
      }

      // Token 失效：不再静默刷新或凭本地缓存密码重登，直接登出并跳转登录页
      const authStore = useAuthStore.getState()
      authStore.auth.reset()

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (
          !currentPath.includes('/sign-in') &&
          !currentPath.includes('/sign-up')
        ) {
          const redirectPath =
            window.location.pathname + window.location.search
          window.location.href = `/sign-in?redirect=${encodeURIComponent(
            redirectPath
          )}`
        }
      }

      const error = new Error(
        responseData.message || 'AccessToken认证不通过，token已过期'
      )
      return Promise.reject(error)
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | InternalAxiosRequestConfig
      | undefined

    if (error.response) {
      // 检查响应数据中是否包含401错误码
      const responseData = error.response.data as any
      const has401Code =
        responseData &&
        typeof responseData === 'object' &&
        (responseData.errorCode === '401' ||
          responseData.errorCode === 401 ||
          (responseData.status === false &&
            responseData.errorCode === '401'))

      const isLoginOrIdLoginReq =
        originalRequest?.url?.includes('/v2/hzkj/base/member/login') ||
        originalRequest?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (has401Code && isLoginOrIdLoginReq) {
        const authStore = useAuthStore.getState()
        authStore.auth.reset()
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (!currentPath.includes('/sign-in') && !currentPath.includes('/sign-up')) {
            const redirectPath = window.location.pathname + window.location.search
            window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`
          }
        }
        return Promise.reject(error)
      }
      if (has401Code && isAnonymousMemberFlowUrl(originalRequest?.url)) {
        return Promise.reject(error)
      }
      if (has401Code && originalRequest) {
        const authStore = useAuthStore.getState()
        authStore.auth.reset()

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (
            !currentPath.includes('/sign-in') &&
            !currentPath.includes('/sign-up')
          ) {
            const redirectPath =
              window.location.pathname + window.location.search
            window.location.href = `/sign-in?redirect=${encodeURIComponent(
              redirectPath
            )}`
          }
        }

        return Promise.reject(error)
      }
    }

    // 处理认证错误（HTTP 401 或自定义认证错误）
    const isAuthError =
      error.response?.status === 401 ||
      (error as any)?.isAuthError ||
      (error as Error)?.message?.includes('not authenticated') ||
      (error as Error)?.message?.includes('Token expired')

    if (isAuthError) {
      const isLoginOrIdLoginUrl =
        originalRequest?.url?.includes('/v2/hzkj/base/member/login') ||
        originalRequest?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (isLoginOrIdLoginUrl) {
        const authStore = useAuthStore.getState()
        authStore.auth.reset()
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (!currentPath.includes('/sign-in') && !currentPath.includes('/sign-up')) {
            const redirectPath = window.location.pathname + window.location.search
            window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`
          }
        }
        return Promise.reject(error)
      }
      if (isAnonymousMemberFlowUrl(originalRequest?.url)) {
        return Promise.reject(error)
      }

      const authStore = useAuthStore.getState()
      authStore.auth.reset()

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (
          !currentPath.includes('/sign-in') &&
          !currentPath.includes('/sign-up')
        ) {
          // 只使用路径和查询参数，不包括协议和域名
          const redirectPath =
            window.location.pathname + window.location.search
          window.location.href = `/sign-in?redirect=${encodeURIComponent(
            redirectPath
          )}`
        }
      }

      // 认证类错误在这里统一吃掉，避免在退出登录等场景出现空白或重复的 toast
      return Promise.reject(
        new AxiosError(
          '',
          error.code,
          error.config,
          error.request,
          error.response
        )
      )
    }
    return Promise.reject(error)
  }
)
