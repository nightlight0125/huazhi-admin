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

// 新增运费自定义渠道 — 单条计划（与后端 data 数组项一致）
export interface AddCusFreightDataItem {
  /** 国家 / 目的地 ID */
  destination: string
  /** 物流渠道 ID */
  logisticsChannel: string
  /** 优先级，字符串 "0" | "1" | "2" */
  priority: string
}

// 新增运费自定义渠道请求参数
export interface AddCusFreightRequest {
  customerId: string
  spuId: string
  data: AddCusFreightDataItem[]
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

  // 兼容 data / data.data / data.data.data 等嵌套（部分环境返回三层 data）
  const root = response.data.data as unknown
  let rows: CusFreightItem[] = []
  let totalCount = 0

  const takeRowsAndTotal = (node: unknown): boolean => {
    if (node == null || typeof node !== 'object') return false
    const o = node as Record<string, unknown>
    if (Array.isArray(o.rows)) {
      rows = o.rows as CusFreightItem[]
      totalCount = Number(o.totalCount) || totalCount
      return true
    }
    if (Array.isArray(o.data)) {
      rows = o.data as CusFreightItem[]
      totalCount = Number(o.totalCount) || totalCount
      return true
    }
    if (o.data != null && typeof o.data === 'object' && !Array.isArray(o.data)) {
      totalCount = Number(o.totalCount) || totalCount
      return takeRowsAndTotal(o.data)
    }
    return false
  }

  if (Array.isArray(root)) {
    rows = root as CusFreightItem[]
  } else {
    takeRowsAndTotal(root)
  }

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalCount: typeof totalCount === 'number' && totalCount > 0 ? totalCount : rows.length,
  }
}

// 批量更新订单物流渠道请求
export interface BatchUpdOrderLogsRequest {
  orderId: string[]
  logsId: string
}

// 批量更新订单物流渠道响应
export interface BatchUpdOrderLogsResponse {
  data?: string
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 批量更新订单物流渠道 API
export async function batchUpdOrderLogs(
  request: BatchUpdOrderLogsRequest
): Promise<BatchUpdOrderLogsResponse> {
  const response = await apiClient.post<BatchUpdOrderLogsResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/batchUpdOrderLogs',
    request
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to batch update order logistics. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
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

// 计算运费 API（按 SKU、目的地与数量；skuId 来自 selectSpecGetSku 返回的 id）
export async function calcuFreight(
  params: {
    skuId: string
    destinationId: string
    /** 购买数量 */
    quantity: number
  }
): Promise<FreightOption[]> {
  const response = await apiClient.post<CalcuFreightResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/calcuFreight',
    params
  )

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

// 计算新订单运费请求参数
export interface CalcuNewOrderFreightRequest {
  skuIdToQty: Record<string, string> // { skuId: quantity }
  countryId: string
  customerId: string
}

// 计算新订单运费 API（按 SKU 与数量）
export async function calcuNewOrderFreight(
  params: CalcuNewOrderFreightRequest
): Promise<FreightOption[]> {
  const response = await apiClient.post<CalcuFreightResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/calcuNewOrderFreight',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to calculate freight. Please try again.'
    throw new Error(errorMessage)
  }

  const data = response.data.data
  return Array.isArray(data) ? data : []
}

// 计算订单运费请求参数
export interface CalcuOrderFreightRequest {
  orderId: string
}

// 计算订单运费 API（按订单）
export async function calcuOrderFreight(
  params: CalcuOrderFreightRequest
): Promise<FreightOption[]> {
  const response = await apiClient.post<CalcuFreightResponse>(
    '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/calcuOrderFreight',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to calculate order freight. Please try again.'
    throw new Error(errorMessage)
  }

  const data = response.data.data
  return Array.isArray(data) ? data : []
}

// 国家/地区数据接口
export interface CountryItem {
  id?: string
  number?: string
  name?: string
  hzkj_code?: string
  hzkj_name?: string
  twocountrycode?: string // 两位国家代码，如 "CN", "US", "HK"
  simplespell?: string // 简化拼写，如 "CHN", "USA"
  description?: string // 英文名称
  fullname?: string // 全名
  areacode?: string // 区号
  [key: string]: unknown
}

// 查询国家/地区列表请求参数
export interface QueryCountryRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}

// 查询国家/地区列表响应
export interface QueryCountryResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: CountryItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询国家/地区列表 API
export async function queryCountry(
  pageNo: number = 1,
  pageSize: number = 1000
): Promise<CountryItem[]> {
  const requestData: QueryCountryRequest = {
    data: {},
    pageSize,
    pageNo,
  }

  const response = await apiClient.post<QueryCountryResponse>(
    '/v2/hzkj/base/bd_country/queryCountry',
    requestData
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query country list. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 仓库数据接口
export interface WarehouseItem {
  id: string
  number?: string
  name?: string
  hzkj_name?: string | { GLang?: string; zh_CN?: string; [key: string]: unknown }
  [key: string]: unknown
}

// 查询仓库列表响应
export interface GetWarehouseListResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: WarehouseItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询仓库列表 API
export async function getWarehouseList(
  pageNo: number = 1,
  pageSize: number = 10
): Promise<WarehouseItem[]> {
  const response = await apiClient.get<GetWarehouseListResponse>(
    '/v2/hzkj/sbd/bd_warehouse/queryWareHouse',
    {
      params: {
        pageNo: String(pageNo),
        pageSize: String(pageSize),
      },
    }
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get warehouse list. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}
