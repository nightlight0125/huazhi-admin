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

    if (isLoginRequest || isSignUpRequest) {
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
      // 后端返回了401错误码，需要跳转到登录页
      const authStore = useAuthStore.getState()
      authStore.auth.reset()

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (!currentPath.includes('/sign-in') && !currentPath.includes('/sign-up')) {
          // 只使用路径和查询参数，不包括协议和域名
          const redirectPath = window.location.pathname + window.location.search
          window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`
        }
      }

      // 创建一个错误对象以便后续处理
      const error = new Error(
        responseData.message || 'AccessToken认证不通过，token已过期'
      ) as any
      error.response = response
      error.isAuthError = true
      return Promise.reject(error)
    }

    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error('API 错误响应:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
      })

      // 检查响应数据中是否包含401错误码
      const responseData = error.response.data as any
      if (
        responseData &&
        typeof responseData === 'object' &&
        (responseData.errorCode === '401' ||
          responseData.errorCode === 401 ||
          (responseData.status === false && responseData.errorCode === '401'))
      ) {
        // 后端返回了401错误码
        const authStore = useAuthStore.getState()
        authStore.auth.reset()

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (!currentPath.includes('/sign-in') && !currentPath.includes('/sign-up')) {
            // 只使用路径和查询参数，不包括协议和域名
            const redirectPath = window.location.pathname + window.location.search
            window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`
          }
        }

        return Promise.reject(error)
      }
    } else if (error.request) {
      console.error('API 请求错误 (无响应):', {
        request: error.request,
        url: error.config?.url,
        method: error.config?.method,
      })
    } else {
      console.error('API 错误:', error.message)
    }

    // 处理认证错误（HTTP 401 或自定义认证错误）
    const isAuthError =
      error.response?.status === 401 ||
      (error as any)?.isAuthError ||
      (error as Error)?.message?.includes('not authenticated') ||
      (error as Error)?.message?.includes('Token expired')

    if (isAuthError) {
      const authStore = useAuthStore.getState()
      authStore.auth.reset()

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (!currentPath.includes('/sign-in') && !currentPath.includes('/sign-up')) {
          // 只使用路径和查询参数，不包括协议和域名
          const redirectPath = window.location.pathname + window.location.search
          window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`
        }
      }
    }
    return Promise.reject(error)
  }
)

