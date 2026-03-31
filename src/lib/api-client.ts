import { useAuthStore } from '@/stores/auth-store'
import { redirectToExpiredIfNeeded } from '@/lib/build-expiration'
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

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

/** 注册发码 / 注册提交等：无需登录；失败时不应触发 getToken 自动重登 */
function isAnonymousMemberFlowUrl(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes('/hzkj_ordercenter/member/registerSendCode') ||
    url.includes('/v2/hzkj/base/member/add')
  )
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (redirectToExpiredIfNeeded()) {
      return Promise.reject(new Error('Build expired. Access denied.'))
    }

    const isGetTokenRequest = config.url?.includes('/oauth2/getToken')

    if (isGetTokenRequest) {
      return config
    }

    const { auth } = useAuthStore.getState()
    const token = auth.accessToken

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

    if (!token || !auth.user?.id) {
      const error = new Error('User not authenticated. Please login again.')
      // @ts-expect-error - 添加自定义属性
      error.isAuthError = true
      return Promise.reject(error)
    }

    // 检查 token 是否过期（3小时）
    try {
      const expiryTime = localStorage.getItem('token_expiry')
      if (expiryTime && Date.now() >= Number(expiryTime)) {
        auth.reset()
        const error = new Error('Token expired. Please login again.')
        // @ts-expect-error - 添加自定义属性
        error.isAuthError = true
        return Promise.reject(error)
      }
    } catch {
      // 如果检查过期时间失败，继续请求（让后端验证）
    }

    // 添加认证头
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
    // 针对「返回 200 但 body 中携带 401」的情况做自动登录和重试
    const responseData = response.data as any
    const config = response.config as
      | (InternalAxiosRequestConfig & { _logical401Retried?: boolean })
      | undefined

    const hasLogical401 =
      responseData &&
      typeof responseData === 'object' &&
      (responseData.errorCode === '401' ||
        (responseData.errorCode === 401 && responseData.status === false))

    if (hasLogical401) {
      const isLoginOrGetToken =
        config?.url?.includes('/v2/hzkj/base/member/login') ||
        config?.url?.includes('/oauth2/getToken') ||
        config?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (isLoginOrGetToken) {
        // 401 来自 login、getToken 或 idLogin 时不再重试，直接登出，避免死循环
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
      // 避免无限重试：每个请求只自动重登并重试一次
      if (config && !config._logical401Retried) {
        config._logical401Retried = true
        try {
          // 先尝试仅用 oauth2/getToken 刷新 token（与登录时一致），避免重复调 login 导致死循环
          let reloginSuccess = await tryRefreshToken()
          if (!reloginSuccess) {
            reloginSuccess = await tryAutoLogin()
          }
          if (reloginSuccess) {
            const { auth } = useAuthStore.getState()
            const token = auth.accessToken
            if (token && config.headers) {
              config.headers.access_token = `${token}`
              config.headers['x-acgw-identity'] =
                'djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw='
            }
            // 使用同一配置重试原始请求
            return apiClient(config)
          }
        } catch (err) {
          console.error('Auto login failed on logical 401:', err)
        }
      }

      // 自动登录不可用或失败时，执行登出并跳转登录页
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
      | (InternalAxiosRequestConfig & { _retry?: boolean })
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

      const isLoginOrGetTokenReq =
        originalRequest?.url?.includes('/v2/hzkj/base/member/login') ||
        originalRequest?.url?.includes('/oauth2/getToken') ||
        originalRequest?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (has401Code && isLoginOrGetTokenReq) {
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
      if (has401Code && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          let reloginSuccess = await tryRefreshToken()
          if (!reloginSuccess) {
            reloginSuccess = await tryAutoLogin()
          }
          if (reloginSuccess) {
            const { auth } = useAuthStore.getState()
            const token = auth.accessToken
            if (token && originalRequest.headers) {
              originalRequest.headers.access_token = `${token}`
              originalRequest.headers['x-acgw-identity'] =
                'djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw='
            }
            return apiClient(originalRequest)
          }
        } catch {
          // 自动登录失败则继续走后续逻辑
        }

        // 自动登录不可用或失败，再执行原有登出与跳转逻辑
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
      const isLoginOrGetTokenReq =
        originalRequest?.url?.includes('/v2/hzkj/base/member/login') ||
        originalRequest?.url?.includes('/oauth2/getToken') ||
        originalRequest?.url?.includes('/v2/hzkj/hzkj_im_ext/member/idLogin')
      if (isLoginOrGetTokenReq) {
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
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          let reloginSuccess = await tryRefreshToken()
          if (!reloginSuccess) {
            reloginSuccess = await tryAutoLogin()
          }
          if (reloginSuccess) {
            const { auth } = useAuthStore.getState()
            const token = auth.accessToken
            if (token && originalRequest.headers) {
              originalRequest.headers.access_token = `${token}`
              originalRequest.headers['x-acgw-identity'] =
                'djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw='
            }
            return apiClient(originalRequest)
          }
        } catch {
          // ignore and fall through to logout
        }
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
    }
    return Promise.reject(error)
  }
)

// 仅通过 oauth2/getToken 刷新 accessToken，与登录时步骤一致，避免重复调 login 导致死循环
async function tryRefreshToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const { getToken } = await import('@/lib/api/auth')
    const { auth } = useAuthStore.getState()
    const token = await getToken()
    if (!token || token.trim() === '') return false
    auth.setAccessToken(token)
    return true
  } catch {
    return false
  }
}

// 尝试使用本地保存的邮箱和密码自动登录（先 getToken 再 memberLogin，与正常登录流程一致）
async function tryAutoLogin(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    const raw = window.localStorage.getItem('saved_login_credentials')
    if (!raw) return false

    const parsed = JSON.parse(raw) as {
      email?: string
      password?: string
    }

    if (!parsed.email || !parsed.password) {
      return false
    }

    const { getToken, memberLogin } = await import('@/lib/api/auth')
    const { auth } = useAuthStore.getState()

    // 与正常登录一致：先请求 oauth2/getToken 再 memberLogin
    const token = await getToken()
    auth.setAccessToken(token)

    const loginResponse: any = await memberLogin(
      parsed.email,
      parsed.password
    )
    const finalToken =
      loginResponse.token || loginResponse.access_token || token

    if (!finalToken || finalToken.trim() === '') {
      return false
    }

    auth.setAccessToken(finalToken)

    // 尽量还原基础用户信息（精简版）
    const userData = (loginResponse.data as any) ?? {}
    const user = {
      accountNo: userData.accountId || userData.id || parsed.email,
      email: userData.email || parsed.email,
      role: ['user'],
      exp: Date.now() + 3 * 60 * 60 * 1000,
      id: userData.user?.id || userData.id || '',
      username: userData.user?.username || parsed.email.split('@')[0] || '',
      roleId: userData.roleId || userData.user?.roleId || '',
      hzkj_whatsapp1:
        userData.user?.hzkj_whatsapp1 || userData.hzkj_whatsapp1 || '',
      customerId: userData.user?.customerId || userData.customerId || '',
    }
    auth.setUser(user as any)

    return true
  } catch (err) {
    console.error('Auto login failed:', err)
    return false
  }
}
