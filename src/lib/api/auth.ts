import { apiClient } from '../api-client'

// 自定义错误类，用于携带 errorCode 信息
export class AuthError extends Error {
  constructor(
    message: string,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

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

// 业务员 ID 登录 API（/v2/hzkj/hzkj_im_ext/member/idLogin）
export async function idLogin(
  accountId: string,
  bizUserId: string
): Promise<MemberLoginResponse> {
  const response = await apiClient.post<MemberLoginResponse>(
    '/v2/hzkj/hzkj_im_ext/member/idLogin',
    { accountId, bizUserId }
  )

  const res = response.data

  if (!res.status) {
    const errorMessage =
      res.message || 'ID login failed. Please check accountId and bizUserId.'
    throw new Error(errorMessage)
  }

  return res
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
 
  try {
    
    const response = await apiClient.post<GetTokenResponse>(
      '/oauth2/getToken',
      requestData
    )
    

    const token =
      response.data.access_token ||
      response.data.token ||
      response.data.data?.access_token ||
      response.data.data?.token

    if (!token) {
      throw new Error('Token not found in response')
    }

    return token
  } catch (error) {
    if (error instanceof Error) {
    }
    
    // 如果是 axios 错误，可在此打印 error.response 等详细信息
    if (error && typeof error === 'object' && 'response' in error) {
      // AxiosError handling placeholder
    }
    
    throw error
  }
}

// 注册请求参数
export interface SignUpRequest {
  member: {
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

export async function memberSignUp(
  email: string,
  name: string,
  phone: string,
  password: string
): Promise<SignUpResponse> {
  const requestData: SignUpRequest = {
    member: {
      email,
      name,
      phone,
      password, 
    },
  }

  const response = await apiClient.post<SignUpResponse>(
    '/v2/hzkj/base/member/add',
    requestData
  )
  return response.data
}

// 检查登录状态请求参数
export interface GetUserStatusRequest {
  accountId: string
}

// 检查登录状态响应
export interface GetUserStatusResponse {
  status: boolean
  data?: {
    isValid?: boolean
    userId?: string
    accountId?: string
    [key: string]: unknown
  }
  message?: string
  errorCode?: string
  [key: string]: unknown
}

/**
 * 检查登录状态 API
 * 调用后端 getUserStatus 接口验证当前用户的登录状态
 */
export async function checkLoginStatus(): Promise<GetUserStatusResponse> {
  const { useAuthStore } = await import('@/stores/auth-store')
  const { auth } = useAuthStore.getState()
  
  // 如果没有用户信息或 accountId，直接返回未认证
  if (!auth.user?.accountNo && !auth.user?.id) {
    return {
      status: false,
      message: 'User not authenticated',
    }
  }

  // 使用 accountNo 或 id 作为 accountId
  const accountId = auth.user.accountNo || auth.user.id

  try {
    const requestData: GetUserStatusRequest = {
      accountId,
    }

    const response = await apiClient.post<GetUserStatusResponse>(
      '/v2/hzkj/hzkj_member/member/getUserStatus',
      requestData
    )

    // 如果接口返回 status 为 false，说明登录状态无效
    if (!response.data.status) {
      return {
        status: false,
        message: response.data.message || 'Login status invalid',
        errorCode: response.data.errorCode,
      }
    }

    return response.data
  } catch (error) {
    // 如果请求失败（如 401），说明 token 无效
    console.error('Failed to check login status:', error)
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Failed to check login status',
    }
  }
}

// ---------- 忘记密码：获取重置验证码 ----------
export interface GetResetPassWordCodeRequest {
  email: string
}

export interface GetResetPassWordCodeResponse {
  status?: boolean
  message?: string
  errorCode?: string
  /** 后端返回的验证码数字（用于页面展示，用户输入后提交） */
  data?: string | number
  [key: string]: unknown
}

/** 获取重置密码验证码（接口会向邮箱发送验证码） */
export async function getResetPassWordCode(
  email: string
): Promise<GetResetPassWordCodeResponse> {
  const response = await apiClient.post<GetResetPassWordCodeResponse>(
    '/v2/hzkj/hzkj_member/member/getResetPassWordCode',
    { email }
  )
  if (response.data.status === false) {
    throw new Error(
      response.data.message || 'Failed to get verification code. Please try again.'
    )
  }
  return response.data
}

// ---------- 忘记密码：发送验证码 ----------
export interface SendCodeRequest {
  email: string
  code: string
}

export interface SendCodeResponse {
  status?: boolean
  message?: string
  errorCode?: string
  [key: string]: unknown
}

/** 发送验证码（如：重新发送或校验后发送） */
export async function sendCode(
  email: string,
  code: string
): Promise<SendCodeResponse> {
  const response = await apiClient.post<SendCodeResponse>(
    '/v2/hzkj/hzkj_member/member/sendCode',
    { email, code }
  )
  if (response.data.status === false) {
    const error: any = new Error(
      response.data.message || 'Failed to send verification code. Please try again.'
    )
    error.errorCode = response.data.errorCode
    throw error
  }
  return response.data
}

// ---------- 忘记密码：重置密码 ----------
export interface ResetPasswordRequest {
  email: string
  resetPasswordCode: string
}

export interface ResetPasswordResponse {
  status?: boolean
  message?: string
  errorCode?: string
  [key: string]: unknown
}

/** 使用邮箱验证码重置密码（用户输入新密码） */
export async function resetPassword(
  email: string,
  resetPasswordCode: string
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ResetPasswordResponse>(
    '/v2/hzkj/hzkj_member/member/resetPassword',
    { email, resetPasswordCode }
  )
  if (response.data.status === false) {
    const error: any = new Error(
      response.data.message || 'Failed to reset password. Please try again.'
    )
    error.errorCode = response.data.errorCode
    throw error
  }
  return response.data
}

