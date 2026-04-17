import type { InternalAxiosRequestConfig } from 'axios'
import { isAxiosError } from 'axios'
import { apiClient } from '../api-client'
import { parseValidateTimeToMs } from '../token-validate'

const REFRESH_TOKEN_LOG_PREFIX = '[refreshTokenApi]'

/** 与 api-client 拦截器一致，避免刷新接口再进入刷新链 */
type RefreshRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean
}

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

// 会员登录请求参数
export interface MemberLoginRequest {
  member: {
    email: string
    password: string
  }
}

/** 登录 / 刷新接口 data 中与令牌相关的字段 */
export interface AuthTokenPayload {
  token?: string
  /** 令牌过期时间（后端控制格式，见 parseValidateTimeToMs） */
  validateTime?: string
  [key: string]: unknown
}

// 会员登录响应
export interface MemberLoginResponse {
  data?: AuthTokenPayload | unknown
  errorCode?: string
  message?: string
  status: boolean
  token?: string
  access_token?: string
  [key: string]: unknown
}

/** 从登录 / idLogin 等响应中解析 token 与过期时刻（毫秒） */
export function extractTokenAndExpiryFromLoginResponse(
  res: MemberLoginResponse | Record<string, unknown>
): { token: string | null; expiresAtMs: number | null } {
  const raw = res as Record<string, unknown>
  const data = raw.data as AuthTokenPayload | undefined
  const token =
    (data?.token as string | undefined) ||
    (raw.token as string | undefined) ||
    (raw.access_token as string | undefined) ||
    null
  const expiresAtMs = parseValidateTimeToMs(data?.validateTime)
  return { token, expiresAtMs }
}

export interface RefreshTokenApiResponse {
  data?: AuthTokenPayload
  status?: boolean
  message?: string
  errorCode?: string | number
  [key: string]: unknown
}

/**
 * 刷新访问令牌（请求体仅传当前 token，与后端约定一致）
 * 通过 axios 自定义 config 标记，避免触发 request 拦截器里的「刷新链」
 */
export async function refreshTokenApi(accessToken: string): Promise<{
  token: string
  expiresAtMs: number | null
}> {
  const log = import.meta.env.DEV
  if (log) {
    console.warn(`${REFRESH_TOKEN_LOG_PREFIX} 请求开始`, {
      path: '/v2/hzkj/hzkj_customer/member/refreshTokenApi',
      tokenLength: accessToken?.length ?? 0,
    })
  }

  try {
    const response = await apiClient.post<RefreshTokenApiResponse>(
      '/v2/hzkj/hzkj_customer/member/refreshTokenApi',
      { token: accessToken },
      { skipAuthRefresh: true } as RefreshRequestConfig
    )
    const res: RefreshTokenApiResponse = response.data

    if (log) {
      console.warn(`${REFRESH_TOKEN_LOG_PREFIX} HTTP 响应`, {
        httpStatus: response.status,
        bodyStatus: res.status,
        errorCode: res.errorCode,
        message: res.message,
        hasData: res.data != null,
      })
    }

    if (res.status === false) {
      if (log) {
        console.error(`${REFRESH_TOKEN_LOG_PREFIX} 业务 status=false`, {
          message: res.message,
          errorCode: res.errorCode,
        })
      }
      throw new Error(
        (res.message as string | undefined) || 'Token refresh failed'
      )
    }
    if (res.errorCode === '401' || res.errorCode === 401) {
      if (log) {
        console.error(`${REFRESH_TOKEN_LOG_PREFIX} 业务 errorCode=401`, {
          message: res.message,
        })
      }
      throw new Error(
        (res.message as string | undefined) || 'Token refresh failed'
      )
    }

    const data = res.data as AuthTokenPayload | undefined
    const token =
      (data?.token as string | undefined) ||
      (res as { token?: string }).token
    if (!token || String(token).trim() === '') {
      if (log) {
        console.error(`${REFRESH_TOKEN_LOG_PREFIX} 响应中无 token`, {
          dataKeys: data ? Object.keys(data) : [],
          topKeys: Object.keys(res as object),
        })
      }
      throw new Error('No token in refresh response')
    }
    const expiresAtMs = parseValidateTimeToMs(data?.validateTime)
    if (log) {
      console.warn(`${REFRESH_TOKEN_LOG_PREFIX} 刷新成功`, {
        newTokenLength: token.length,
        expiresAtMs,
      })
    }
    return { token, expiresAtMs }
  } catch (err) {
    if (log) {
      if (isAxiosError(err)) {
        console.error(`${REFRESH_TOKEN_LOG_PREFIX} 请求异常 (Axios)`, {
          message: err.message,
          code: err.code,
          httpStatus: err.response?.status,
          responseData: err.response?.data,
        })
      } else if (err instanceof Error) {
        console.error(`${REFRESH_TOKEN_LOG_PREFIX} 失败`, {
          message: err.message,
          stack: err.stack,
        })
      } else {
        console.error(`${REFRESH_TOKEN_LOG_PREFIX} 失败`, err)
      }
    }
    throw err
  }
}

export async function idLogin(
  userId: string,
  bizUserId: string
): Promise<MemberLoginResponse> {
  const response = await apiClient.post<MemberLoginResponse>(
    '/v2/hzkj/hzkj_im_ext/member/idLogin',
    { userId, bizUserId }
  )

  const res = response.data

  if (!res.status) {
    const errorMessage =
      res.message || 'ID login failed. Please check userId and bizUserId.'
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

// 注册请求参数
export interface SignUpRequest {
  member: {
    email: string
    name: string
    phone: string
    password: string
    emailCode: string
    customerId?: string
    operatorId?: string
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
  password: string,
  emailCode: string,
  referral?: {
    customerId?: string
    operatorId?: string
  }
): Promise<SignUpResponse> {
  const member: SignUpRequest['member'] = {
    email,
    name,
    phone,
    password,
    emailCode,
  }
  // 后端约定为字符串；显式 String，避免运行时为 number 时 JSON 序列化成数字
  const cid =
    referral?.customerId != null && String(referral.customerId).trim() !== ''
      ? String(referral.customerId).trim()
      : ''
  const oid =
    referral?.operatorId != null && String(referral.operatorId).trim() !== ''
      ? String(referral.operatorId).trim()
      : ''
  if (cid) member.customerId = cid
  if (oid) member.operatorId = oid

  const requestData: SignUpRequest = { member }

  const response = await apiClient.post<SignUpResponse>(
    '/v2/hzkj/base/member/add',
    requestData
  )
  return response.data
}

// ---------- 注册：发送邮箱验证码 ----------
export interface RegisterSendCodeResponse {
  status?: boolean
  message?: string
  errorCode?: string
  [key: string]: unknown
}

/** 向注册邮箱发送验证码 */
export async function registerSendCode(
  email: string
): Promise<RegisterSendCodeResponse> {
  const response = await apiClient.post<RegisterSendCodeResponse>(
    '/v2/hzkj/hzkj_ordercenter/member/registerSendCode',
    { email }
  )
  if (response.data.status === false) {
    throw new Error(
      response.data.message ||
        'Failed to send verification code. Please try again.'
    )
  }
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

  const accountId = auth.user.accountNo 

  try {
    const requestData: GetUserStatusRequest = {
      accountId,
    }

    const response = await apiClient.post<GetUserStatusResponse>(
      '/v2/hzkj/hzkj_member/member/getUserStatus',
      requestData
    )

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

