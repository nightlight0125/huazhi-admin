import { apiClient } from '../api-client'

// 查询账户请求参数
export interface QueryAccountRequest {
  data: {
    hzkj_member_id: string
  }
  pageSize: number
  pageNo: number
}

// 查询账户响应
export interface QueryAccountResponse {
  data?: {
    list?: unknown[]
    rows?: unknown[]
    total?: number
    pageNo?: number
    pageSize?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 查询账户列表 API
export async function queryAccount(
  hzkj_member_id: string,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<unknown[]> {
  const requestData: QueryAccountRequest = {
    data: {
      hzkj_member_id,
    },
    pageSize,
    pageNo,
  }

  console.log('查询账户请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryAccountResponse>(
    '/v2/hzkj/hzkj_member/hzkj_account_record/queryAccount',
    requestData
  )

  console.log('查询账户响应:', response.data)

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to query accounts. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回 list，如果都没有则返回空数组
  const rows = response.data.data?.rows 
  return Array.isArray(rows) ? rows : []
}

