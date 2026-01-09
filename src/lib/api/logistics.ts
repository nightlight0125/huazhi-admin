import { apiClient } from '../api-client'

// 州/省数据接口
export interface StateItem {
  id: string
  number?: string
  name?: string
  hzkj_code?: string
  hzkj_name?: string
  [key: string]: unknown
}

// 查询州/省列表请求参数
export interface GetStatesListRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}

// 查询州/省列表响应
export interface GetStatesListResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: StateItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

export async function getStatesList(
  pageNo: number = 1,
  pageSize: number = 1000
): Promise<StateItem[]> {
  const requestData: GetStatesListRequest = {
    data: {},
    pageSize,
    pageNo,
  }


  const response = await apiClient.post<GetStatesListResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_state/getStatesList',
    requestData
  )


  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get states list. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

export interface CustomChannelItem {
  id: string
  number?: string
  name?: string
  [key: string]: unknown
}

export interface GetLogsListRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}
export interface GetLogsListResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: CustomChannelItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询自定义渠道列表 API
export async function getLogsList(
  pageNo: number = 1,
  pageSize: number = 1000
): Promise<CustomChannelItem[]> {
  const requestData: GetLogsListRequest = {
    data: {},
    pageSize,
    pageNo,
  }

  const response = await apiClient.post<GetLogsListResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_custom_channel/getLogsList',
    requestData
  )


  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get custom channels list. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 新增运费自定义渠道请求参数
export interface AddCusFreightRequest {
  customerId: string
  spuId: string
  destination: Record<string, string>
}

// 新增运费自定义渠道响应
export interface AddCusFreightResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 新增运费自定义渠道 API
export async function addCusFreight(
  requestData: AddCusFreightRequest
): Promise<AddCusFreightResponse> {

  const response = await apiClient.post<AddCusFreightResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/addCus',
    requestData
  )


  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to add custom freight. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 运费自定义渠道列表项
export interface CusFreightItem {
  id?: string
  customerId?: string
  spuId?: string
  spuName?: string
  spuNumber?: string
  logsNumber?: string
  stateName?: string
  timeName?: string
  destination?: Record<string, string>
  [key: string]: unknown
}

// 查询运费自定义渠道列表请求参数
export interface GetCusListRequest {
  pageSize: number
  pageNo: number
  customerId: string
  spuOrDestination?: string
}

// 查询运费自定义渠道列表响应
export interface GetCusListResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: CusFreightItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询运费自定义渠道列表 API
export async function getCusList(
  params: GetCusListRequest
): Promise<{ rows: CusFreightItem[]; totalCount: number }> {

  const response = await apiClient.post<GetCusListResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/getCusList',
    params
  )


  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get custom freight list. Please try again.'
    throw new Error(errorMessage)
  }

  // 数据在 response.data.data.data 中（根据日志显示）
  const dataObj = response.data.data
  let rows: CusFreightItem[] = []
  
  // 尝试多种可能的数据结构
  if (Array.isArray(dataObj?.data)) {
    rows = dataObj.data as CusFreightItem[]
  } else if (Array.isArray(dataObj?.rows)) {
    rows = dataObj.rows as CusFreightItem[]
  } else if (Array.isArray(dataObj)) {
    rows = dataObj as CusFreightItem[]
  }
  
  const totalCount = dataObj?.totalCount || 0

  console.log('Extracted rows:', rows)
  console.log('Extracted totalCount:', totalCount)

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}

// 计算运费请求参数
export interface CalcuFreightRequest {
  spuId: string
  destinationId: string
}

// 运费选项接口（后端返回的原始格式）
export interface FreightOption {
  logsId: string
  logsNumber: string
  freight: number
  time: string
  [key: string]: unknown
}

// 计算运费响应
export interface CalcuFreightResponse {
  data?: FreightOption[]
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 计算运费 API
export async function calcuFreight(
  params: CalcuFreightRequest
): Promise<FreightOption[]> {
  const response = await apiClient.post<CalcuFreightResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/calcuFreight',
    params
  )

  console.log('计算运费响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to calculate freight. Please try again.'
    throw new Error(errorMessage)
  }

  // 提取运费选项数据
  const data = response.data.data
  return Array.isArray(data) ? data : []
}

