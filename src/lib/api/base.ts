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

  console.log('获取货币列表请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<GetCurrencyResponse>(
    '/v2/hzkj/base/bd_currency/getCurrency',
    requestData
  )

  console.log('获取货币列表响应:', response.data)

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

  console.log('获取提醒列表响应:', response.data)

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

