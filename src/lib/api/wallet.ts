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
  hzkj_amountfield2?: number
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
    // 资金记录日期范围
    hzkj_datetimefield_start?: string
    hzkj_datetimefield_end?: string
    // 搜索：主账号 ID
    hzkj_customer_masterid?: string
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
  pageSize: number = 10,
  hzkj_datetimefield_start?: string,
  hzkj_datetimefield_end?: string,
  hzkj_customer_masterid?: string
): Promise<{ rows: ApiFundRecordItem[]; totalCount: number }> {
  const data: GetWalletListRequest['data'] = {
    hzkj_customer: customerId,
  }

  if (hzkj_datetimefield_start) {
    data.hzkj_datetimefield_start = hzkj_datetimefield_start
  }
  if (hzkj_datetimefield_end) {
    data.hzkj_datetimefield_end = hzkj_datetimefield_end
  }
  if (hzkj_customer_masterid) {
    data.hzkj_customer_masterid = hzkj_customer_masterid
  }

  const requestData: GetWalletListRequest = {
    data,
    pageSize,
    pageNo,
  }

  const response = await apiClient.post<GetWalletListResponse>(
    '/v2/hzkj/hzkj_member/hzkj_customer_wallet/getWalletList',
    requestData
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get wallet list. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回数据
  const rows = response.data.data?.rows || []
  const totalCount = response.data.data?.totalCount || 0

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

// 获取资金记录请求参数（getFundRecord 接口）
export interface GetFundRecordRequest {
  hzkj_customer: string
  hzkj_datetimefield_start?: string
  hzkj_datetimefield_end?: string
  pageNo: number
  pageSize: number
}

// 获取资金记录响应
export interface GetFundRecordResponse {
  data?: {
    items?: ApiFundRecordItem[] | ApiWalletItem[]
    total?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取资金记录 API（GET /v2/hzkj/hzkj_customer/wallet/getFundRecord）
export async function getFundRecord(
  customerId: string,
  pageNo: number = 1,
  pageSize: number = 10,
  hzkj_datetimefield_start?: string,
  hzkj_datetimefield_end?: string
): Promise<{ rows: ApiFundRecordItem[]; totalCount: number }> {
  const params: GetFundRecordRequest = {
    hzkj_customer: customerId,
    pageNo,
    pageSize,
  }
  if (hzkj_datetimefield_start) {
    params.hzkj_datetimefield_start = hzkj_datetimefield_start
  }
  if (hzkj_datetimefield_end) {
    params.hzkj_datetimefield_end = hzkj_datetimefield_end
  }

  const response = await apiClient.post<GetFundRecordResponse>(
    '/v2/hzkj/hzkj_customer/wallet/getFundRecord',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get fund records. Please try again.'
    throw new Error(errorMessage)
  }

  const data = response.data.data
  const rawItems = Array.isArray(data?.items) ? data.items : []
  const totalCount = typeof data?.total === 'number' ? data.total : 0

  const fundRecords: ApiFundRecordItem[] = []
  if (Array.isArray(rawItems)) {
    rawItems.forEach((row: ApiWalletItem | ApiFundRecordItem) => {
      if (Array.isArray((row as ApiWalletItem).hzkj_fund_record)) {
        fundRecords.push(...(row as ApiWalletItem).hzkj_fund_record!)
      } else if ((row as ApiFundRecordItem).hzkj_datetimefield != null) {
        fundRecords.push(row as ApiFundRecordItem)
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

  const response = await apiClient.post<GetWalletInfoResponse>(
    '/v2/hzkj/hzkj_member/hzkj_customer_wallet/getWalletInfo',
    requestData
  )

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

// 请求支付接口请求参数
export interface RequestWalletPaymentRequest {
  customerId: string
  amount: number
  currency: string
  currencyNumber: string
  // 支付完成后返回的地址（回调 URL，可选）
  returnUrl?: string
  // 支付失败/取消后返回的地址
  returnFailUrl?: string
}

// 请求支付接口响应
export interface RequestWalletPaymentResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 请求支付 API（参考订单支付，使用 session_id 回调格式）
export async function requestWalletPayment(
  request: RequestWalletPaymentRequest
): Promise<RequestWalletPaymentResponse> {
  // 在浏览器环境下，附加带有 session_id 占位符的回调地址
  // 支付服务商会将 {CHECKOUT_SESSION_ID} 替换为真实的会话 ID，并重定向回该地址
  const payload: RequestWalletPaymentRequest = {
    ...request,
    ...(typeof window !== 'undefined'
      ? {
          ...(!request.returnUrl
            ? {
                returnUrl: `${window.location.origin}/wallet/paymentcallback?session_id={CHECKOUT_SESSION_ID}`,
              }
            : {}),
          ...(!request.returnFailUrl
            ? {
                returnFailUrl: `${window.location.origin}/wallet/payment-fail`,
              }
            : {}),
        }
      : {}),
  }

  const response = await apiClient.post<RequestWalletPaymentResponse>(
    '/v2/hzkj/hzkj_customer/wallet/requestPayment',
    payload
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to request payment. Please try again.'
    throw new Error(errorMessage)
  }

  // 如果后端返回支付链接，则在当前窗口中跳转到支付页面
  const paymentUrl =
    typeof response.data.data === 'string'
      ? (response.data.data as string)
      : response.data.data &&
          typeof (response.data.data as any).url === 'string'
        ? ((response.data.data as any).url as string)
        : ''

  if (paymentUrl && typeof window !== 'undefined') {
    window.location.href = paymentUrl
  }

  return response.data
}

// 钱包充值支付完成/失败后回调（携带 session_id）
export interface WalletCallbackResponse {
  status?: boolean
  message?: string
  [key: string]: unknown
}

export async function walletCallback(
  sessionId: string
): Promise<WalletCallbackResponse> {
  const response = await apiClient.post<WalletCallbackResponse>(
    '/v2/hzkj/hzkj_customer/wallet/callback',
    { sessionId: sessionId }
  )
  if (response.data?.status === false) {
    throw new Error(response.data.message || 'Wallet payment callback failed.')
  }
  return response.data ?? {}
}

/** 后端返回 data 为 base64 字符串（无 data:application/pdf;base64, 前缀），转为 Blob 供下载 */
function base64ToPdfBlob(base64: string): Blob {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new Blob([bytes], { type: 'application/pdf' })
}

/** 获取发票/充值记录 PDF 批量下载。type: "1"-充值记录, "2"-发票记录。后端返回 data 为 base64 字符串 */
export async function getInvoicePdf(
  customerId: string,
  ids: string[],
  type: '1' | '2'
): Promise<Blob> {
  const response = await apiClient.post<{
    data?: string
    status?: boolean
    message?: string | null
    errorCode?: string
  }>('/v2/hzkj/hzkj_customer/invoice/getInvoicePdf', {
    customerId,
    ids,
    type,
  })
  if (response.data?.status === false) {
    throw new Error(
      response.data.message || 'Failed to get invoice PDF. Please try again.'
    )
  }
  const base64 = response.data?.data
  if (typeof base64 !== 'string' || !base64) {
    throw new Error('Invalid PDF response from server')
  }
  return base64ToPdfBlob(base64)
}
