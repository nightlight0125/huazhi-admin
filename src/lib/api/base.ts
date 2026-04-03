import { apiClient } from '../api-client'

// 货币项
export interface CurrencyItem {
  number: string
  sign: string
  id: string
}

// 获取货币列表请求参数
export interface GetCurrencyRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}

// 获取货币列表响应
export interface GetCurrencyResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: CurrencyItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取货币列表 API
export async function getCurrency(
  pageNo: number = 1,
  pageSize: number = 100
): Promise<CurrencyItem[]> {
  const requestData: GetCurrencyRequest = {
    data: {},
    pageSize,
    pageNo,
  }

  const response = await apiClient.post<GetCurrencyResponse>(
    '/v2/hzkj/base/bd_currency/getCurrency',
    requestData
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get currency list. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 提醒项
export interface ReminderItem {
  billno?: string
  hzkj_effective_time_enddate?: string | null
  hzkj_effective_time_startdate?: string | null
  hzkj_textfield?: string
  hzkj_richtextfield?: string
  [key: string]: unknown
}

// 获取提醒列表响应
export interface GetReminderResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: ReminderItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取提醒列表 API
export async function getReminder(
  pageNo: number = 1,
  pageSize: number = 10
): Promise<ReminderItem[]> {
  const response = await apiClient.get<GetReminderResponse>(
    '/v2/hzkj/hzkj_member/hzkj_reminder/getReminder',
    {
      params: {
        pageNo,
        pageSize,
      },
    }
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get reminder list. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 获取当前提醒详情 API（POST，传入 customerId）
export interface GetNowReminderResponse {
  status?: string
  data?: ReminderItem & {
    id?: number
    text?: string
    bill_no?: string
    type?: string
    effective_start_date?: string
    effective_end_date?: string
    content?: string
    [key: string]: unknown
  }
  message?: string
  [key: string]: unknown
}

export async function getNowReminder(
  customerId: string
): Promise<ReminderItem & Record<string, unknown>> {
  const response = await apiClient.post<GetNowReminderResponse>(
    '/v2/hzkj/hzkj_member/hzkj_customer_reminder/getNowReminder',
    { customerId }
  )

  const resp = response.data as { status?: string | boolean }
  if (resp.status === false || resp.status === 'error') {
    const errorMessage =
      response.data.message || 'Failed to get reminder details. Please try again.'
    throw new Error(errorMessage)
  }

  let rawData = response.data.data as unknown

  // 后端可能返回单个对象或数组，这里统一兼容：
  // - 如果是数组：默认取第一条用于首页弹窗
  // - 如果是对象：直接使用
  if (Array.isArray(rawData)) {
    rawData = rawData[0]
  }

  const data = rawData
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid reminder response.')
  }

  // 字段映射：billno, createtime, hzkj_textfield, hzkj_richtextfield
  const d = data as Record<string, unknown>
  return {
    ...data,
    billno: (d.billno ?? d.bill_no) as string | undefined,
    createtime: d.createtime as string | undefined,
    hzkj_textfield: (d.hzkj_textfield ?? d.text) as string | undefined,
    hzkj_richtextfield: (d.hzkj_richtextfield ?? d.content) as string | undefined,
    hzkj_effective_time_startdate: (d.createtime ??
      d.effective_start_date ??
      d.hzkj_effective_time_startdate) as string | null | undefined,
  }
}

