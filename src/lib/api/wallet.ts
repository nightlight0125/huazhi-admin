import { apiClient } from '../api-client'

// 钱包资金记录项（实际数据在hzkj_fund_record数组中）
export interface ApiFundRecordItem {
  id?: string
  seq?: number
  hzkj_description?: string
  hzkj_method?: string
  hzkj_datetimefield?: string
  hzkj_amountfield?: number
  hzkj_amountfield1?: number
  hzkj_status?: string
  [key: string]: unknown
}

// 钱包记录项（API返回的rows中的项）
export interface ApiWalletItem {
  hzkj_fund_record?: ApiFundRecordItem[]
  [key: string]: unknown
}

// 获取钱包列表请求参数
export interface GetWalletListRequest {
  data: {
    hzkj_customer: string
  }
  pageSize: number
  pageNo: number
}

// 获取钱包列表响应
export interface GetWalletListResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: ApiWalletItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取钱包列表 API
export async function getWalletList(
  customerId: string,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<{ rows: ApiFundRecordItem[]; totalCount: number }> {
  const requestData: GetWalletListRequest = {
    data: {
      hzkj_customer: customerId,
    },
    pageSize,
    pageNo,
  }

  console.log('获取钱包列表请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<GetWalletListResponse>(
    '/v2/hzkj/hzkj_member/hzkj_customer_wallet/getWalletList',
    requestData
  )

  console.log('获取钱包列表响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get wallet list. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回数据
  const rows = response.data.data?.rows || []
  const totalCount = response.data.data?.totalCount || 0

  // 从rows中提取hzkj_fund_record数组中的数据
  const fundRecords: ApiFundRecordItem[] = []
  if (Array.isArray(rows)) {
    rows.forEach((row) => {
      if (Array.isArray(row.hzkj_fund_record)) {
        fundRecords.push(...row.hzkj_fund_record)
      }
    })
  }

  return {
    rows: fundRecords,
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}

// 钱包信息项（API返回的数据结构）
export interface ApiWalletInfoItem {
  hzkj_balance?: number
  hzkj_rebate_amount?: number
  [key: string]: unknown
}

// 获取钱包信息请求参数
export interface GetWalletInfoRequest {
  data: {
    hzkj_customer: string
  }
  pageSize: number
  pageNo: number
}

// 获取钱包信息响应
export interface GetWalletInfoResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: ApiWalletInfoItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取钱包信息 API
export async function getWalletInfo(
  customerId: string,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<{ balance: number; rebateAmount: number }> {
  const requestData: GetWalletInfoRequest = {
    data: {
      hzkj_customer: customerId,
    },
    pageSize,
    pageNo,
  }

  console.log('获取钱包信息请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<GetWalletInfoResponse>(
    '/v2/hzkj/hzkj_member/hzkj_customer_wallet/getWalletInfo',
    requestData
  )

  console.log('获取钱包信息响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get wallet info. Please try again.'
    throw new Error(errorMessage)
  }

  // 从rows中提取数据
  const rows = response.data.data?.rows || []
  const firstRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null

  return {
    balance:
      typeof firstRow?.hzkj_balance === 'number' ? firstRow.hzkj_balance : 0,
    rebateAmount:
      typeof firstRow?.hzkj_rebate_amount === 'number'
        ? firstRow.hzkj_rebate_amount
        : 0,
  }
}

