import { useAuthStore } from '@/stores/auth-store'
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

// 创建 axios 实例
export const apiClient: AxiosInstance = axios.create({
  // baseURL: 'https://hyperzone.test.kdgalaxy.com/kapi',
  baseURL: 'https://dcptest.zmi.cn/ierp/kapi',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isGetTokenRequest = config.url?.includes('/oauth2/getToken')
    
    if (!isGetTokenRequest) {
      const token = useAuthStore.getState().auth.accessToken
      if (token && config.headers) {
        config.headers.access_token = `${token}`
        config.headers['x-acgw-identity'] = `djF8MTk5NmMzOWQxNjQwNDI5ZDYwMDF8NDkxMjA1NzM1MzU2OXxIFC2gwtq5SNZj0TBnFgtAYCiBPHoLXU9qlDtcNTEANXw=`
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('API 请求:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data,
        headers: config.headers,
      })
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
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
    } else if (error.request) {
      console.error('API 请求错误 (无响应):', {
        request: error.request,
        url: error.config?.url,
        method: error.config?.method,
      })
    } else {
      console.error('API 错误:', error.message)
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore.getState()
      authStore.auth.reset()

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (!currentPath.includes('/sign-in') && !currentPath.includes('/sign-up')) {
          const redirectUrl = window.location.href
          window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
        }
      }
    }
    return Promise.reject(error)
  }
)

