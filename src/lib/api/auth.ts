import { apiClient } from '../api-client'

// 生成随机 nonce (UUID v4)
export function generateNonce(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 格式化时间戳
export function formatTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取 Token 请求参数
export interface GetTokenRequest {
  client_id: string
  client_secret: string
  username: string
  accountId?: string
  nonce: string
  timestamp: string
  language: string
}

// 获取 Token 响应
export interface GetTokenResponse {
  access_token?: string
  token?: string
  data?: {
    token?: string
    access_token?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

// 会员登录请求参数
export interface MemberLoginRequest {
  member: {
    email: string
    password: string
  }
}

// 会员登录响应
export interface MemberLoginResponse {
  data: unknown
  errorCode?: string
  message?: string
  status: boolean
  token?: string
  access_token?: string
  [key: string]: unknown
}

// 会员登录 API
export async function memberLogin(
  email: string,
  password: string,
): Promise<MemberLoginResponse> {
  const requestData: MemberLoginRequest = {
    member: {
      email,
      password,
    },
  }

  const response = await apiClient.post<MemberLoginResponse>(
    '/v2/hzkj/base/member/login',
    requestData
  )

  const res = response.data

  // 检查响应状态：
  // 1. status 为 false
  // 2. 或 errorCode 不为空且不为 "0"
  const hasErrorCode =
    typeof res.errorCode === 'string' &&
    res.errorCode.trim() !== '' &&
    res.errorCode.trim() !== '0'

  if (!res.status || hasErrorCode) {
    const errorMessage =
      res.message || 'Login failed. Please check your credentials.'
    throw new Error(errorMessage)
  }

  return res
}

// 获取 Token API
// 注意：根据接口文档，获取 token 只需要 username，不需要 password
// 如果需要先验证密码，可能需要先调用验证接口
export async function getToken(
): Promise<string> {
  const requestData: GetTokenRequest =
   {
    client_id: 'HuaZhiQD',
    client_secret: 'Dc1598837132xcs@',
    username:'xuchushun',
    accountId: '2299284867814356992',
    nonce: generateNonce(), // 使用随机生成的 nonce
    timestamp: formatTimestamp(),
    language: 'zh_CN',
  }
  // {
  //   "client_id": "HuaZhiQD",
  //   "client_secret": "Dc1598837132xcs@",
  //   "username": "xuchushun",
  //   "accountId": "2299284867814356992",
  //   "nonce": "fd59fda9-2985-4b26-b28c-6956b7105101",
  //   "timestamp": "2025-12-10 16:07:00",
  //   "language": "zh_CN"
  // }

  try {
    console.log('getToken 请求数据:', JSON.stringify(requestData, null, 2))
    
    const response = await apiClient.post<GetTokenResponse>(
      '/oauth2/getToken',
      requestData
    )
    
    console.log('getToken 响应:', response)
    console.log('getToken 响应数据:', response.data)

    const token =
      response.data.access_token ||
      response.data.token ||
      response.data.data?.access_token ||
      response.data.data?.token

    if (!token) {
      console.error('Token 未找到，响应数据:', response.data)
      throw new Error('Token not found in response')
    }

    console.log('获取到的 token:', token.substring(0, 50) + '...')
    return token
  } catch (error) {
    console.error('getToken 错误详情:')
    console.error('错误对象:', error)
    
    if (error instanceof Error) {
      console.error('错误消息:', error.message)
      console.error('错误堆栈:', error.stack)
    }
    
    // 如果是 axios 错误，打印详细信息
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: unknown
          status?: number
          statusText?: string
          headers?: unknown
        }
        request?: unknown
        config?: {
          url?: string
          method?: string
          data?: unknown
          headers?: unknown
        }
      }
      console.error('Axios 错误详情:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      })
    }
    
    throw error
  }
}

// 注册请求参数
export interface SignUpRequest {
  member: {
    username: string
    email: string
    name: string
    phone: string
    password: string
  }
}

// 注册响应
export interface SignUpResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 注册 API
// 注意：注册接口需要先获取 token 才能调用
export async function memberSignUp(
  username: string,
  email: string,
  name: string,
  phone: string,
  password: string
): Promise<SignUpResponse> {
  const requestData: SignUpRequest = {
    member: {
      username,
      email,
      name,
      phone,
      password, // 这里传入的是已经加密后的密码
    },
  }

  console.log('注册请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<SignUpResponse>(
    '/v2/hzkj/base/member/add',
    requestData
  )

  console.log('注册响应:', response.data)

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Registration failed. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

