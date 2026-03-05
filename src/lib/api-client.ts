import { useAuthStore } from '@/stores/auth-store'
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

// 创建 axios 实例
export const apiClient: AxiosInstance = axios.create({
  // baseURL: 'https://hyperzone.test.kdgalaxy.com/kapi',
  baseURL: 'https://test.hzdrop.com/kapi/',
  // baseURL: 'http://test.hzdrop.com/kapi/v2/hzkj/hzkj_ordercenter/',
  // baseURL: 'http://47.242.207.93/kapi/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'openApiSign':'anZYZFdrTFpkUGx5VWNaSmlkbHZIb3pjSEV6LVJOd3dKRVcxV3ZaZjRQYz06MjI5OTI4NDg2NzgxNDM1Njk5Mg==',
    'x-acgw-identity':'djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=',
  },
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isGetTokenRequest = config.url?.includes('/oauth2/getToken')

    if (isGetTokenRequest) {
      return config
    }

    const { auth } = useAuthStore.getState()
    const token = auth.accessToken

    const isLoginRequest = config.url?.includes('/v2/hzkj/base/member/login')
    const isSignUpRequest = config.url?.includes('/v2/hzkj/base/member/add')
    const isForgotPasswordRequest =
      config.url?.includes('/hzkj_member/member/getResetPassWordCode') ||
      config.url?.includes('/hzkj_member/member/sendCode') ||
      config.url?.includes('/hzkj_member/member/resetPassword')

    const isPaymentCallbackRequest =
      config.url?.includes('order/paymentCallback')

    if (
      isLoginRequest ||
      isSignUpRequest ||
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
  (response) => {
    // 检查响应数据中是否包含401错误码
    const responseData = response.data as any
    if (
      responseData &&
      typeof responseData === 'object' &&
      (responseData.errorCode === '401' ||
        (responseData.errorCode === 401 && responseData.status === false))
    ) {
      // 后端返回了401错误码，构造一个错误交给错误处理逻辑
      const error = new Error(
        responseData.message || 'AccessToken认证不通过，token已过期'
      ) as any
      ;(error as any).response = response
      ;(error as any).isAuthError = true
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

      if (has401Code && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const reloginSuccess = await tryAutoLogin()
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
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const reloginSuccess = await tryAutoLogin()
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

// 尝试使用本地保存的邮箱和密码自动登录
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

    // 获取 / 刷新 token
    let token = auth.accessToken
    if (!token || token.trim() === '') {
      token = await getToken()
      auth.setAccessToken(token)
    }

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
