import { apiClient } from '../api-client'

// 保存询价单请求参数
export interface SaveBillRequest {
  hzkj_goodname: string
  hzkj_url: string
  hzkj_amount?: string
  hzkj_textfield?: string
  hzkj_picturefield?: string
  hzkj_target_quality?: string
  hzkj_combofield1?: string
  hzkj_accept_status?: string
  hzkj_customer_id?: string
}

// 保存询价单响应
export interface SaveBillResponse {
  data?: Array<{
    id: number
    createtime: string
    hzkj_goodname: string
    hzkj_target_quality: string
    hzkj_combofield1: string
    hzkj_amount: string
    hzkj_textfield: string
    hzkj_url: string
    hzkj_picturefield: string
    hzkj_accept_status: string
    hzkj_customer_id: string
    hzkj_api: boolean
  }>
  status?: boolean
  message?: string
  [key: string]: unknown
}

// 保存询价单 API
export async function saveBill(
  params: SaveBillRequest
): Promise<SaveBillResponse> {
  const requestData = {
    data: {
      hzkj_goodname: params.hzkj_goodname,
      hzkj_url: params.hzkj_url,
      ...(params.hzkj_amount && { hzkj_amount: params.hzkj_amount }),
      ...(params.hzkj_textfield && { hzkj_textfield: params.hzkj_textfield }),
      ...(params.hzkj_picturefield &&
        typeof params.hzkj_picturefield === 'string' && {
          hzkj_picturefield: params.hzkj_picturefield,
        }),
      ...(params.hzkj_target_quality && {
        hzkj_target_quality: params.hzkj_target_quality,
      }),
      ...(params.hzkj_combofield1 && { hzkj_combofield1: params.hzkj_combofield1 }),
      ...(params.hzkj_accept_status && {
        hzkj_accept_status: params.hzkj_accept_status,
      }),
      ...(params.hzkj_customer_id && { hzkj_customer_id: params.hzkj_customer_id }),
    },
  }

  console.log('保存询价单请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<SaveBillResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_customer_inquiry/saveBill',
    requestData
  )

  console.log('保存询价单响应:', response.data)

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to save sourcing bill. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询询价单列表请求参数
export interface QueryListRequest {
  data: {
    hzkj_customer_id?: string
    hzkj_accept_status?: string
  }
  pageSize: number
  pageNo: number
}

// 查询询价单列表响应
export interface QueryListResponse {
  data?: {
    rows?: Array<{
      id: number | string
      billno?: string
      createtime?: string
      hzkj_goodname?: string
      hzkj_target_quality?: string
      hzkj_combofield1?: string
      hzkj_amount?: string | number
      hzkj_textfield?: string
      hzkj_url?: string
      hzkj_picturefield?: string
      hzkj_accept_status?: string
      hzkj_customer_id?: string
      entryentity?: Array<{
        hzkj_spu_name?: string
        hzkj_spu_number?: string
        hzkj_spu_id?: string
        hzkj_spu_hzkj_pur_price?: number | string
        hzkj_spu_hzkj_picturefield?: string
        hzkj_spu_hzkj_enname?: string
        [key: string]: unknown
      }>
      [key: string]: unknown
    }>
    totalCount?: number
  }
  status?: boolean
  message?: string
  [key: string]: unknown
}

// 查询询价单列表 API
export async function queryList(
  params: QueryListRequest
): Promise<{ rows: Array<QueryListResponse['data'] extends { rows?: (infer R)[] } ? R : never>; totalCount: number }> {

  const response = await apiClient.post<QueryListResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_customer_inquiry/queryList',
    params
  )

  console.log('查询询价单列表响应:', response.data)

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query sourcing list. Please try again.'
    throw new Error(errorMessage)
  }

  // 从响应中提取数据
  const responseData = response.data.data
  const rows = responseData?.rows || []
  const totalCount = responseData?.totalCount || 0

  console.log('解析后的数据:', { rows, totalCount })

  return {
    rows: (Array.isArray(rows) ? rows : []) as any,
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}

// 删除询价单请求参数
export interface DelBillRequest {
  billId: string[]
}

// 删除询价单响应
export interface DelBillResponse {
  status?: boolean
  message?: string
  [key: string]: unknown
}

// 删除询价单 API
export async function delBill(
  params: DelBillRequest
): Promise<DelBillResponse> {
  const requestData = {
    billId: params.billId,
  }

  console.log('删除询价单请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<DelBillResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_customer_inquiry/delBill',
    requestData
  )

  console.log('删除询价单响应:', response.data)

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete sourcing bill. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

