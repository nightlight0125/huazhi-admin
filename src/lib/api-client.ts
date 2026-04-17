import { redirectToExpiredIfNeeded } from '@/lib/build-expiration'
import { shouldRefreshTokenBeforeExpiry } from '@/lib/token-validate'
import { useAuthStore } from '@/stores/auth-store'
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

type RequestConfigExtra = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean
  /** 已因 401 刷新过重试一次，避免死循环 */
  _authRetry?: boolean
}

/** 并发请求共享同一次刷新（主动临近过期 + 401 被动刷新） */
let refreshMutex: Promise<void> | null = null

/**
 * 等待当前进行中的 accessToken 刷新结束（成功或失败）。
 * 供路由 beforeLoad、拦截器等在「判断是否未登录」前调用，避免刷新请求尚未返回就跳转登录并取消刷新。
 */
export async function awaitOngoingAccessTokenRefresh(): Promise<void> {
  const p = refreshMutex
  if (!p) return
  try {
    await p
  } catch {
    // 失败时由 performTokenRefresh / handleRefreshFailure 已处理；此处只同步时序
  }
}

function redirectToSignInIfNeeded(): void {
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (
    path.includes('/sign-in') ||
    path.includes('/sign-up') ||
    path.includes('/staff-login')
  ) {
    return
  }
  const redirectPath = window.location.pathname + window.location.search
  window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`
}

function handleRefreshFailure(): void {
  const { auth: a } = useAuthStore.getState()
  a.reset()
  redirectToSignInIfNeeded()
}

/**
 * 实际调用 refreshTokenApi 并更新 store；失败则清空登录态并跳转。
 */
async function performTokenRefresh(): Promise<void> {
  const { auth: a } = useAuthStore.getState()
  const t = a.accessToken
  if (!t) {
    const err = new Error('Token expired. Please login again.')
    // @ts-expect-error
    err.isAuthError = true
    throw err
  }
  const { refreshTokenApi } = await import('@/lib/api/auth')
  const { token: newToken, expiresAtMs } = await refreshTokenApi(t)
  a.setAccessToken(newToken)
  a.setTokenExpiresAtMs(expiresAtMs)
}

/**
 * 单例互斥：多请求同时 401 / 临近过期时只刷新一次。
 */
async function refreshAccessTokenOrThrowMutex(): Promise<void> {
  if (refreshMutex) {
    await refreshMutex
    return
  }
  refreshMutex = (async () => {
    try {
      await performTokenRefresh()
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(
          '[refreshAccessTokenOrThrowMutex] refreshTokenApi 失败',
          e instanceof Error ? e.message : e
        )
      }
      handleRefreshFailure()
      const err =
        e instanceof Error
          ? e
          : new Error('Token expired. Please login again.')
      // @ts-expect-error
      err.isAuthError = true
      throw err
    }
  })()
  try {
    await refreshMutex
  } finally {
    refreshMutex = null
  }
}

async function ensureValidAccessToken(): Promise<void> {
  const { auth } = useAuthStore.getState()
  const exp = auth.tokenExpiresAtMs
  const current = auth.accessToken
  if (!current || exp == null) return
  if (!shouldRefreshTokenBeforeExpiry(exp)) return

  try {
    await refreshAccessTokenOrThrowMutex()
  } catch (e) {
    throw e
  }
}

function isRefreshTokenUrl(url: string | undefined): boolean {
  return !!url?.includes('/hzkj_customer/member/refreshTokenApi')
}

function shouldSkipAuthRetry(url: string | undefined): boolean {
  if (!url) return true
  return (
    url.includes('/v2/hzkj/base/member/login') ||
    url.includes('/v2/hzkj/hzkj_im_ext/member/idLogin') ||
    isAnonymousMemberFlowUrl(url) ||
    url.includes('/hzkj_member/member/getResetPassWordCode') ||
    url.includes('/hzkj_member/member/sendCode') ||
    url.includes('/hzkj_member/member/resetPassword') ||
    url.includes('order/paymentCallback') ||
    url.includes('wallet/callback')
  )
}

/** 401 后刷新成功则重试原请求（仅一次） */
async function retryRequestAfterRefresh(
  config: InternalAxiosRequestConfig | undefined
): Promise<AxiosResponse> {
  const cfg = config as RequestConfigExtra
  if (!cfg || cfg._authRetry) {
    handleRefreshFailure()
    return Promise.reject(
      new Error('AccessToken认证不通过，token已过期')
    ) as Promise<AxiosResponse>
  }
  try {
    await refreshAccessTokenOrThrowMutex()
  } catch (e) {
    return Promise.reject(e) as Promise<AxiosResponse>
  }
  const token = useAuthStore.getState().auth.accessToken
  if (!token) {
    handleRefreshFailure()
    return Promise.reject(
      new Error('AccessToken认证不通过，token已过期')
    ) as Promise<AxiosResponse>
  }
  cfg._authRetry = true
  cfg.headers = cfg.headers ?? {}
  cfg.headers.access_token = `${token}`
  cfg.headers['x-acgw-identity'] =
    `djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=`
  return apiClient.request(cfg)
}

// 创建 axios 实例
export const apiClient: AxiosInstance = axios.create({
  // 临时关闭 Vite 代理后，开发环境也直连后端
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://test.hzdrop.com/kapi/',
  // baseURL: 'http://test.hzdrop.com/kapi/v2/hzkj/hzkj_ordercenter/',
  // baseURL: 'https://hyperzone.test.kdgalaxy.com/kapi/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'openApiSign':
      'anZYZFdrTFpkUGx5VWNaSmlkbHZIb3pjSEV6LVJOd3dKRVcxV3ZaZjRQYz06MjI5OTI4NDg2NzgxNDM1Njk5Mg==',
    'x-acgw-identity':
      'djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=',
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

    const isRefreshTokenRequest = isRefreshTokenUrl(config.url)

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
        config.headers['x-acgw-identity'] =
          `djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=`
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
      config.headers['x-acgw-identity'] =
        `djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=`
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
    const responseData = response.data as Record<string, unknown> | null
    const config = response.config as InternalAxiosRequestConfig | undefined

    const hasLogical401 =
      responseData &&
      typeof responseData === 'object' &&
      (responseData.errorCode === '401' ||
        (responseData.errorCode === 401 && responseData.status === false))

    if (!hasLogical401) {
      return response
    }

    const isLoginOrIdLogin =
      config?.url?.includes('/v2/hzkj/base/member/login') ||
      config?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
    if (isLoginOrIdLogin) {
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
        new Error(
          (responseData?.message as string | undefined) ||
            'AccessToken认证不通过，token已过期'
        )
      )
    }
    if (isAnonymousMemberFlowUrl(config?.url)) {
      return Promise.reject(
        new Error(
          (responseData?.message as string | undefined) ||
            'AccessToken认证不通过，token已过期'
        )
      )
    }

    // 刷新接口自身返回逻辑 401：无法再重试，直接登出
    if (isRefreshTokenUrl(config?.url)) {
      handleRefreshFailure()
      return Promise.reject(
        new Error(
          (responseData?.message as string | undefined) ||
            'AccessToken认证不通过，token已过期'
        )
      )
    }

    if (shouldSkipAuthRetry(config?.url)) {
      handleRefreshFailure()
      return Promise.reject(
        new Error(
          (responseData?.message as string | undefined) ||
            'AccessToken认证不通过，token已过期'
        )
      )
    }

    // 已重试仍逻辑 401 → 登出
    const cfg = config as RequestConfigExtra
    if (cfg._authRetry) {
      handleRefreshFailure()
      return Promise.reject(
        new Error(
          (responseData?.message as string | undefined) ||
            'AccessToken认证不通过，token已过期'
        )
      )
    }

    return retryRequestAfterRefresh(config)
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigExtra | undefined

    if (error.response) {
      const responseData = error.response.data as Record<string, unknown> | null
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
      if (has401Code && isAnonymousMemberFlowUrl(originalRequest?.url)) {
        return Promise.reject(error)
      }

      if (has401Code && originalRequest) {
        if (isRefreshTokenUrl(originalRequest.url)) {
          handleRefreshFailure()
          return Promise.reject(error)
        }
        if (shouldSkipAuthRetry(originalRequest.url)) {
          handleRefreshFailure()
          return Promise.reject(error)
        }
        if (originalRequest._authRetry) {
          handleRefreshFailure()
          return Promise.reject(error)
        }
        return retryRequestAfterRefresh(originalRequest)
      }
    }

    // HTTP 401
    const http401 = error.response?.status === 401
    if (http401 && originalRequest) {
      const isLoginOrIdLoginUrl =
        originalRequest.url?.includes('/v2/hzkj/base/member/login') ||
        originalRequest.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (isLoginOrIdLoginUrl) {
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
      if (isAnonymousMemberFlowUrl(originalRequest.url)) {
        return Promise.reject(error)
      }
      if (isRefreshTokenUrl(originalRequest.url)) {
        handleRefreshFailure()
        return Promise.reject(error)
      }
      if (shouldSkipAuthRetry(originalRequest.url)) {
        handleRefreshFailure()
        return Promise.reject(error)
      }
      if (originalRequest._authRetry) {
        handleRefreshFailure()
        return Promise.reject(error)
      }
      return retryRequestAfterRefresh(originalRequest)
    }

    // 处理认证错误（自定义认证错误等）
    const isAuthError =
      !!(error as { isAuthError?: boolean })?.isAuthError ||
      (error as Error)?.message?.includes('not authenticated') ||
      (error as Error)?.message?.includes('Token expired')

    if (isAuthError) {
      await awaitOngoingAccessTokenRefresh()
      const tokenAfterRefresh = useAuthStore.getState().auth.accessToken
      if (tokenAfterRefresh && tokenAfterRefresh.trim() !== '') {
        return Promise.reject(error)
      }

      const isLoginOrIdLoginUrl =
        originalRequest?.url?.includes('/v2/hzkj/base/member/login') ||
        originalRequest?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (isLoginOrIdLoginUrl) {
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
          const redirectPath =
            window.location.pathname + window.location.search
          window.location.href = `/sign-in?redirect=${encodeURIComponent(
            redirectPath
          )}`
        }
      }

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
