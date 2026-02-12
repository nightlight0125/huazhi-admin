import { apiClient } from '../api-client'

// 保存询价单请求参数
export interface SaveBillRequest {
  id?: number | string // 编辑时传入，新建时为 0
  createtime?: string // 编辑时传入，格式: "YYYY-MM-DD HH:mm:ss"
  hzkj_goodname: string
  hzkj_url: string
  hzkj_amount?: string
  hzkj_textfield?: string
  hzkj_picturefield?: string
  hzkj_target_quality?: string
  hzkj_combofield1?: string
  hzkj_accept_status?: string
  hzkj_customer_id?: string
  hzkj_api?: boolean // 默认为 true
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
  // 格式化时间为 "YYYY-MM-DD HH:mm:ss" 格式
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 构建请求数据对象
  const dataItem: Record<string, unknown> = {
    id: params.id !== undefined ? Number(params.id) : 0,
    createtime: params.createtime || formatDateTime(new Date()),
    hzkj_goodname: params.hzkj_goodname,
    hzkj_url: params.hzkj_url,
    hzkj_api: params.hzkj_api !== undefined ? params.hzkj_api : true,
  }

  // 添加可选字段
  if (params.hzkj_amount) {
    dataItem.hzkj_amount = params.hzkj_amount
  }
  if (params.hzkj_textfield) {
    dataItem.hzkj_textfield = params.hzkj_textfield
  }
  if (params.hzkj_picturefield && typeof params.hzkj_picturefield === 'string') {
    dataItem.hzkj_picturefield = params.hzkj_picturefield
  }
  if (params.hzkj_target_quality) {
    dataItem.hzkj_target_quality = params.hzkj_target_quality
  }
  if (params.hzkj_combofield1) {
    dataItem.hzkj_combofield1 = params.hzkj_combofield1
  }
  if (params.hzkj_accept_status) {
    dataItem.hzkj_accept_status = params.hzkj_accept_status
  }
  if (params.hzkj_customer_id) {
    dataItem.hzkj_customer_id = params.hzkj_customer_id
  }

  const requestData = {
    data: [dataItem],
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

