import type { Order } from '@/features/orders/data/schema'
import { apiClient } from '../api-client'

// 查询订单请求参数
export interface QueryOrderRequest {
  customerId: string
  type: string
  str?: string // 搜索字符串，可选
  pageIndex: number
  pageSize: number
  shopId?: string // 商店ID，可选
  shopOrderStatus?: string // 商店订单状态，可选
  countryId?: string | string[] // 国家ID，可选，支持字符串或数组
  orderStatus?: string | string[] // 订单状态，可选，支持字符串或数组
  startDate?: string // 开始日期，可选
  endDate?: string // 结束日期，可选
}

// API 返回的订单项
export interface ApiOrderItem {
  id: string
  hzkj_orderstatus?: string
  hzkj_bizdate?: string
  hzkj_post_code?: string
  hzkj_bill_address?: string
  hzkj_sam_address?: string
  hzkj_netweight_total?: number
  hzkj_link_user?: string
  hzkj_email?: string
  hzkj_country_address?: string
  lingItems?: Array<{
    hzkj_picture?: string
    hzkj_qty?: string
    hzkj_product_name_en?: {
      GLang?: string
      zh_CN?: string
      zh_TW?: string
      [key: string]: unknown
    }
    hzkj_shop_price?: number
    hzkj_variant_name?: string
    entryId?: string
    hzkj_sku_values?: unknown
    hzkj_local_sku_name_cn?: {
      GLang?: string
      zh_CN?: string
      zh_TW?: string
      [key: string]: unknown
    }
    hzkj_amount?: string
    hzkj_shop_currency?: string
    hzkj_local_sku?: string
    hzkj_src_qty?: string
    hzkj_local_sku_id?: string
    hzkj_shop_sku?: string
    [key: string]: unknown
  }>
  hzkj_billtype?: string
  hzkj_order_weight?: number
  hzkj_country_id?: string | null
  hzkj_pack_weight_total?: number
  hzkj_source_number?: string
  hzkj_consignee_type?: string
  hzkj_deliveryway?: string
  hzkj_order_amount?: number
  hzkj_shop_number?: string
  hzkj_telephone?: string
  hzkj_customer_id?: string
  createtime?: string
  hzkj_note?: string
  hzkj_shop_name?: {
    GLang?: string
    zh_CN?: string
    [key: string]: unknown
  }
  hzkj_customer_name?: {
    zh_TW?: string
    GLang?: string
    zh_CN?: string
    [key: string]: unknown
  }
  hzkj_address?: string
  hzkj_country_code?: string | null
  hzkj_remark?: string
  hzkj_shopify_note?: string
  hzkj_buyer?: string
  hzkj_fulfillment_status?: string | null
  hzkj_reccustomer?: string
  billno?: string
  hzkj_qty?: number | string
  [key: string]: unknown
  hzkj_product_name_en?: {
    GLang?: string
    zh_CN?: string
    zh_TW?: string
    [key: string]: unknown
  }
  hzkj_fre_quo_amount?: number | string
  hzkj_customer_channel_name?: number | string
  hzkj_customer_channel_number?: string
  /** 物流跟踪号，可能为逗号分隔多段 */
  trackingNumber?: string
  hzkj_tracking_number?: string
}

// 查询订单响应
export interface QueryOrderResponse {
  data?: {
    total?: number
    array?: ApiOrderItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

function transformApiOrderToOrder(apiOrder: ApiOrderItem): Order {
  const productList = (apiOrder.lingItems || []).map((item, index) => ({
    id: item.entryId || `product-${index}`,
    productName: item.hzkj_product_name_en?.GLang || item.hzkj_local_sku_name_cn?.GLang || '',
    productVariant: item.hzkj_variant_name ? [
      {
        id: `variant-${index}`,
        name: 'Variant',
        value: item.hzkj_variant_name,
      },
    ] : [],
    quantity: Number(item.hzkj_qty) || 0,
    productImageUrl: item.hzkj_picture || '',
    productLink: '',
    price: Number(item.hzkj_shop_price) || 0,
    totalPrice: Number(item.hzkj_amount) || 0,
    hzkj_fre_quo_amount: apiOrder.hzkj_fre_quo_amount || 0,
    hzkj_customer_channel_name: apiOrder.hzkj_customer_channel_name || '',
  }))

  // 提取地址信息
  const address = apiOrder.hzkj_bill_address || apiOrder.hzkj_sam_address || ''
  const country = apiOrder.hzkj_country_address || ''
  const customerName = apiOrder.hzkj_customer_name?.GLang || apiOrder.hzkj_buyer || ''

  // 创建日期
  const createdAt = apiOrder.createtime ? new Date(apiOrder.createtime) : new Date()

  return {
    id: apiOrder.id,
    store: apiOrder.hzkj_shop_name?.GLang || '',
    orderNumber: apiOrder.billno || apiOrder.hzkj_source_number || '',
    customerName,
    country,
    province: '',
    city: '',
    address,
    phoneNumber: apiOrder.hzkj_telephone || '',
    email: apiOrder.hzkj_email || '',
    postalCode: apiOrder.hzkj_post_code || '',
    taxNumber: '',
    productList,
    storeName: apiOrder.hzkj_shop_name?.GLang || '',
    platformOrderNumber: apiOrder.billno || '',
    customerOrderNumber: apiOrder.hzkj_source_number || '',
    customer: customerName,
    trackingNumber: (() => {
      const raw =
        apiOrder.trackingNumber ??
        apiOrder.hzkj_tracking_number ??
        (apiOrder as Record<string, unknown>).tracking_number
      if (raw == null || raw === '') return ''
      return String(raw).trim()
    })(),
    shippingCost: 0,
    otherCosts: 0,
    totalCost: (apiOrder as any).hzkj_amount != null
      ? (typeof (apiOrder as any).hzkj_amount === 'string'
          ? parseFloat((apiOrder as any).hzkj_amount) || 0
          : Number((apiOrder as any).hzkj_amount)) || 0
      : (apiOrder.hzkj_order_amount || 0),
    shippingStock: '',
    productName: productList[0]?.productName || '',
    logistics: apiOrder.hzkj_deliveryway || '',
    platformOrderStatus: (apiOrder.hzkj_orderstatus || '0') as any,
    platformFulfillmentStatus: (apiOrder.hzkj_fulfillment_status || 'unfulfilled') as any,
    shippingOrigin: '',
    status: 'pending' as any,
    createdAt,
    updatedAt: createdAt,
    hzkj_country_code: apiOrder.hzkj_country_code || null,
    hzkj_orderstatus: apiOrder.hzkj_orderstatus,
    hzkj_fulfillment_status: apiOrder.hzkj_fulfillment_status || null,
    hzkj_order_amount: apiOrder.hzkj_order_amount,
    hzkj_amount: (apiOrder as any).hzkj_amount,
    hzkj_pack_weight_total: apiOrder.hzkj_pack_weight_total,
    hzkj_product_name_en:
      (apiOrder.hzkj_product_name_en && typeof apiOrder.hzkj_product_name_en === 'object'
        ? (apiOrder.hzkj_product_name_en as any).GLang || (apiOrder.hzkj_product_name_en as any).zh_CN
        : (apiOrder as any).hzkj_product_name_en) ||
      (productList[0]?.productName ?? ''),
    hzkj_picture:
      (apiOrder as any).hzkj_picture ||
      (apiOrder.lingItems?.[0] as any)?.hzkj_picture ||
      '',
    // 添加额外的字段以支持 orders-columns.tsx
    lingItems: apiOrder.lingItems,
    hzkj_shop_name: apiOrder.hzkj_shop_name,
    billno: apiOrder.billno,
    hzkj_source_number: apiOrder.hzkj_source_number,
    createtime: apiOrder.createtime,
    hzkj_customer_name: apiOrder.hzkj_customer_name,
    providers: apiOrder.hzkj_deliveryway,
    hzkj_fre_quo_amount: apiOrder.hzkj_fre_quo_amount,
    hzkj_customer_channel_name: apiOrder.hzkj_customer_channel_name,
    hzkj_customer_channel_number: apiOrder.hzkj_customer_channel_number,
    hzkj_total_amount: (apiOrder as any).hzkj_total_amount,
    totalQty: (apiOrder as any).totalQty,
    // 额外挂载编辑地址需要用到的原始字段（保持原始命名，方便直接读取）
    // 收货地址行信息
    hzkj_address1: (apiOrder as any).hzkj_address1,
    hzkj_address2: (apiOrder as any).hzkj_address2,
    hzkj_admindivision_id: (apiOrder as any).hzkj_admindivision_id,
    hzkj_admindivision_name:
      (apiOrder as any).hzkj_admindivision_name?.GLang ||
      (apiOrder as any).hzkj_admindivision_name?.zh_CN ||
      (apiOrder as any).hzkj_admindivision_name?.zh_TW ||
      (apiOrder as any).hzkj_admindivision_name,
    hzkj_city: (apiOrder as any).hzkj_city,
    hzkj_country_id: (apiOrder as any).hzkj_country_id,
    // 客户名拆分字段
    hzkj_customer_first_name: (apiOrder as any).hzkj_customer_first_name,
    hzkj_customer_last_name: (apiOrder as any).hzkj_customer_last_name,
    // 联系方式
    hzkj_phone: (apiOrder as any).hzkj_phone,
    hzkj_email: (apiOrder as any).hzkj_email,
    // 仓库与税号
    hzkj_dst_warehouse_id: (apiOrder as any).hzkj_dst_warehouse_id,
    hzkj_dst_warehouse_name: (apiOrder as any).hzkj_dst_warehouse_name,
    hzkj_warehouse_name: (apiOrder as any).hzkj_warehouse_name,
    hzkj_tax_id: (apiOrder as any).hzkj_tax_id,
    hzkj_qty:
      apiOrder.hzkj_qty !== undefined && apiOrder.hzkj_qty !== null
        ? apiOrder.hzkj_qty
        : apiOrder.lingItems?.[0]?.hzkj_qty !== undefined &&
            apiOrder.lingItems?.[0]?.hzkj_qty !== null
          ? apiOrder.lingItems[0].hzkj_qty
          : apiOrder.lingItems?.length
            ? String(
                apiOrder.lingItems.reduce(
                  (sum, it) => sum + (Number(it.hzkj_qty) || 0),
                  0
                )
              )
            : undefined,
  } as Order
}

// 查询订单 API
export async function queryOrder(
  params: QueryOrderRequest
): Promise<{ orders: Order[]; total: number }> {
  const response = await apiClient.post<QueryOrderResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/queryOrder',
    params
  )
  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query orders. Please try again.'
    throw new Error(errorMessage)
  }

  const data = response.data?.data ?? response.data
  const apiOrders = Array.isArray(data?.array) ? data.array : []
  const orders = apiOrders.map(transformApiOrderToOrder)

  return {
    orders,
    total: typeof data?.total === 'number' ? data.total : 0,
  }
}

// 订单统计请求参数
export interface OrderStatisticsRequest {
  customerId: string
  type: string
}

// 订单统计响应
export interface OrderStatisticsResponse {
  data?: {
    totalAmount?: number
    awaitPayCount?: number
    awaitPayAmount?: number
    size?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取订单统计 API
export async function orderStatistics(
  params: OrderStatisticsRequest
): Promise<OrderStatisticsResponse['data']> {
  const response = await apiClient.post<OrderStatisticsResponse>(
    '/v2/hzkj/hzkj_customer/order/orderStatistics',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get order statistics. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data.data || {}
}

// 创建订单（addBTOrder）请求体，对齐 addBTOrder 接口
export interface AddBTOrderRequest {
  orderVo: {
    customerId: string
    shopId: string
    orderNumber?: string // 可选，创建订单时不传
    customerName: string
    countryId: string
    admindivisionId?: string
    city: string
    address1: string
    phone: string
    email?: string
    postCode: string
    taxId?: string
    detail: Array<{
      skuId: string
      quantity: number
      variantId?: string
    }>
  }
}

// 创建订单响应
export interface AddBTOrderResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 创建订单 API（addBTOrder）
export async function addBTOrder(
  params: AddBTOrderRequest
): Promise<AddBTOrderResponse> {
  const response = await apiClient.post<AddBTOrderResponse>(
    '/v2/hzkj/hzkj_customer/order/addBTOrder',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to create order. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 删除订单请求参数
export interface DeleteOrderRequest {
  customerId: string
  orderId: string
}

// 删除订单响应
export interface DeleteOrderResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 删除订单 API
export async function deleteOrder(
  params: DeleteOrderRequest
): Promise<DeleteOrderResponse> {
  const response = await apiClient.post<DeleteOrderResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/deleteSalOutOrder',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete order. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 取消订单状态请求参数
export interface UpdateOrderCancelStatusRequest {
  customerId: string
  orderId: string
  orderType: string
}

// 取消订单状态响应
export interface UpdateOrderCancelStatusResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 更新订单为已取消状态 API
export async function updateOrderCancelStatus(
  params: UpdateOrderCancelStatusRequest
): Promise<UpdateOrderCancelStatusResponse> {
  const response = await apiClient.post<UpdateOrderCancelStatusResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/updateOrderCancelStatus',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to cancel order. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

export interface UpdateSalOutOrderDetailItem {
  entryId: string
  skuId: string
  quantity: number
  /** 0 = 保留该行，1 = 删除该行（逻辑删除） */
  flag: number
}

export interface UpdateSalOutOrderRequest {
  orderId: string
  customerId: string | number
  firstName: string
  lastName: string
  phone: string
  countryId: string | number
  admindivisionId?: string | number
  city: string
  address1: string
  address2?: string
  postCode: string
  taxId?: string
  customChannelId?: string
  email?: string
  wareHouse: string | number
  detail: UpdateSalOutOrderDetailItem[]
}

export interface UpdateSalOutOrderResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 更新销售出库订单（修改收货信息等）
export async function updateSalOutOrder(
  params: UpdateSalOutOrderRequest
): Promise<UpdateSalOutOrderResponse> {
  const response = await apiClient.post<UpdateSalOutOrderResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/updateSalOutOrder',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to update order. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 创建售后订单请求参数
export interface AddRMAOrderRequest {
  customerId: string
  orderId: string
  // 售后类型：A-Return and refund, B-Refund only, C-Reshipment, D-Returns only
  salesType: string
  // 售后原因，直接使用售后原因接口返回的 ID/编码
  reason: string
  // 客户备注（问题描述，可选）
  cusNote?: string
}

// 创建售后订单响应
export interface AddRMAOrderResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 创建售后订单 API
export async function addRMAOrder(
  params: AddRMAOrderRequest
): Promise<AddRMAOrderResponse> {
  const requestData = {
    customerId: params.customerId,
    orderId: params.orderId,
    salesType: params.salesType,
    reason: params.reason,
    cusNote: params.cusNote || '',
  }

  const response = await apiClient.post<AddRMAOrderResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/addRMAOrder',
    requestData
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to create RMA order. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 售后原因项
export interface AfterSaleReasonItem {
  id?: string
  // 名称字段后端可能存在多种命名，前端不做硬编码，只做兜底展示
  name?: string
  reason?: string
  [key: string]: unknown
}

// 查询售后原因列表请求参数
export interface QueryAfterSaleReasonListRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}

// 查询售后原因列表响应
export interface QueryAfterSaleReasonListResponse {
  data?: {
    rows?: AfterSaleReasonItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询售后原因列表 API
export async function queryAfterSaleReasonList(
  pageNo: number = 1,
  pageSize: number = 10
): Promise<AfterSaleReasonItem[]> {
  const requestData: QueryAfterSaleReasonListRequest = {
    data: {},
    pageNo,
    pageSize,
  }

  const response = await apiClient.post<QueryAfterSaleReasonListResponse>(
    '/v2/hzkj/hzkj_ordercenter/hzkj_after_sales_reason2/queryAfterSaleResopn2List',
    requestData
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query after sale reasons. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = response.data.data?.rows || []
  return Array.isArray(rows) ? rows : []
}

// 删除库存订单请求参数
export interface DeleteStockOrderRequest {
  customerId: string | number
  orderId: string | number
}

// 删除库存订单响应
export interface DeleteStockOrderResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 删除库存订单 API
export async function deleteStockOrder(
  params: DeleteStockOrderRequest
): Promise<DeleteStockOrderResponse> {
  const response = await apiClient.post<DeleteStockOrderResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/deleteStockOrder',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete stock order. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 同步店铺订单请求参数
export interface SyncShopOrdersRequest {
  customerId: string
  shopIds: string[]
}

// 同步店铺订单响应
export interface SyncShopOrdersResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 同步店铺订单 API
export async function syncShopOrders(
  params: SyncShopOrdersRequest
): Promise<SyncShopOrdersResponse> {
  const response = await apiClient.post<SyncShopOrdersResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/syncShopOrders',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to sync shop orders. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 订单图形统计项
export interface GraphicStatisticsItem {
  orderAmount: number
  orderCount: number
  paidAmount: number
}

// 订单图形统计请求参数
export interface GraphicStatisticsRequest {
  customerId: string
}

// 订单图形统计响应
export interface GraphicStatisticsResponse {
  data?: Record<string, GraphicStatisticsItem>
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 订单图形统计 API
export async function graphicStatistics(
  customerId: string
): Promise<Record<string, GraphicStatisticsItem>> {
  const requestData: GraphicStatisticsRequest = {
    customerId,
  }

  const response = await apiClient.post<GraphicStatisticsResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/graphicStatistics',
    requestData
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get graphic statistics. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回统计数据对象
  return response.data.data || {}
}

// 热销产品统计项
export interface HotProductStatisticsItem {
  productName: string
  skuNumber: string
  totalAmount: number
  totalQty: number
}

// 热销产品统计请求参数
export interface HotProductStatisticsRequest {
  customerId: string
  pageIndex: number
  pageSize: number
  shopId?: string
  startDate?: string
  endDate?: string
}

// 热销产品统计响应
export interface HotProductStatisticsResponse {
  data?: {
    total?: number
    rows?: HotProductStatisticsItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 热销产品统计 API
export async function hotProductStatistics(
  customerId: string,
  pageIndex: number = 0,
  pageSize: number = 10,
  shopId?: string,
  startDate?: string,
  endDate?: string
): Promise<{ rows: HotProductStatisticsItem[]; total: number }> {
  const requestData: HotProductStatisticsRequest = {
    customerId,
    pageIndex,
    pageSize,
    ...(shopId && { shopId }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }

  const response = await apiClient.post<HotProductStatisticsResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/hotProductStatistics',
    requestData
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get hot product statistics. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回数据
  const rows = response.data.data?.rows || []
  const total = response.data.data?.total || 0

  return {
    rows: Array.isArray(rows) ? rows : [],
    total: typeof total === 'number' ? total : 0,
  }
}

// 订单数量统计请求参数
export interface OrderCountStatisticsRequest {
  customerId: string
}

// 订单数量统计响应数据
export interface OrderCountStatisticsData {
  newCount: number
  paidCount: number
  paymentCount: number
  rmaCount: number
}

// 订单数量统计响应
export interface OrderCountStatisticsResponse {
  data?: OrderCountStatisticsData
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 订单数量统计 API
export async function orderCountStatistics(
  customerId: string
): Promise<OrderCountStatisticsData> {
  const requestData: OrderCountStatisticsRequest = {
    customerId,
  }

  const response = await apiClient.post<OrderCountStatisticsResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/orderCountStatistics',
    requestData
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get order count statistics. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回统计数据
  return response.data.data || {
    newCount: 0,
    paidCount: 0,
    paymentCount: 0,
    rmaCount: 0,
  }
}

// 请求支付接口
export interface RequestPaymentRequest {
  customerId: string
  orderIds: string[]
  type: number // 2 表示库存订单
  // 支付完成后返回的地址（回调 URL，可选）
  returnUrl?: string
  // 支付失败/取消后返回的地址
  returnFailUrl?: string
}

/** 获取客户余额请求 */
export interface GetCustomerBalanceRequest {
  customerId: string
}

/** 获取客户余额响应 data */
export interface GetCustomerBalanceData {
  balance?: string
  avaliableBalance?: string
  [key: string]: unknown
}

export interface GetCustomerBalanceResponse {
  data?: GetCustomerBalanceData
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

export async function getCustomerBalance(
  params: GetCustomerBalanceRequest
): Promise<GetCustomerBalanceResponse> {
  const response = await apiClient.post<GetCustomerBalanceResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/getCustomerBalance',
    params
  )
  if (response.data.status === false) {
    const msg = response.data.message || 'Failed to get customer balance.'
    throw new Error(msg)
  }
  return response.data
}

export interface RequestPaymentResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

export async function requestPayment(
  request: RequestPaymentRequest
): Promise<RequestPaymentResponse> {
  // 在浏览器环境下，附加带有 session_id 占位符的回调地址
  // 支付服务商会将 {CHECKOUT_SESSION_ID} 替换为真实的会话 ID，并重定向回该地址
  const payload: RequestPaymentRequest = {
    ...request,
    ...(typeof window !== 'undefined'
      ? {
          ...(!request.returnUrl
            ? {
                returnUrl: `${window.location.origin}/order/payment-callback?session_id={CHECKOUT_SESSION_ID}`,
              }
            : {}),
          ...(!request.returnFailUrl
            ? {
                returnFailUrl: `${window.location.origin}/order/payment-fail`,
              }
            : {}),
        }
      : {}),
  }

  const response = await apiClient.post<RequestPaymentResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/requestPayment',
    payload
  )

  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to request payment. Please try again.'
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

/** 钱包支付：销售 0，样品 1，备货 2 */
export interface WalletPaymentRequest {
  customerId: string
  /** 已有订单时传订单号；商品详情页余额下单可传 `[]`，由后端按地址/明细建单并扣款 */
  orderIds: string[]
  type: number
  /** 以下字段与 buyProduct 一致，仅用于商品详情页余额支付（不调 buyProduct 时由本接口携带） */
  customChannelId?: string
  firstName?: string
  lastName?: string
  phone?: string
  countryId?: string
  admindivisionId?: string
  city?: string
  address1?: string
  address2?: string
  postCode?: string
  taxId?: string
  note?: string
  detail?: Array<{ skuId: string; quantity: number; flag: number }>
}

export interface WalletPaymentResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

export async function walletPayment(
  request: WalletPaymentRequest
): Promise<WalletPaymentResponse> {
  const response = await apiClient.post<WalletPaymentResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/walletPayment',
    request
  )
  if (response.data.status === false) {
    const msg =
      response.data.message || 'Failed to request wallet payment. Please try again.'
    throw new Error(msg)
  }
  return response.data
}

// 支付完成/失败后回调（携带 session_id）
export interface PaymentCallbackResponse {
  status?: boolean
  message?: string
  [key: string]: unknown
}

export async function paymentCallback(sessionId: string): Promise<PaymentCallbackResponse> {
  const response = await apiClient.post<PaymentCallbackResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/paymentCallback',
    { sessionId: sessionId }
  )
  if (response.data?.status === false) {
    throw new Error(response.data.message || 'Payment callback failed.')
  }
  return response.data ?? {}
}

// 入库（加库存）请求参数
export interface AddStockRequest {
  stockType: string // 默认 "1"
  stockItems: Array<{ skuId: string; qty: number }>
  warehouseId: string
  customerId: string
}

export interface AddStockResponse {
  status?: boolean
  message?: string
  [key: string]: unknown
}

export async function addStock(
  request: AddStockRequest
): Promise<AddStockResponse> {
  const response = await apiClient.post<AddStockResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/addStock',
    request
  )
  if (response.data?.status === false) {
    throw new Error(
      response.data.message || 'Failed to add stock. Please try again.'
    )
  }
  return response.data ?? {}
}

// 查询售后订单请求参数
export interface QueryAfterSaleOrdersRequest {
  data: {
    hzkj_payingcustomer_id: string
    hzkj_shop_id?: string // 店铺ID，可以是 "*" 表示所有
    hzkj_sales_type?: string // 销售类型，可以是 "*" 表示所有
    start_date?: string // 开始日期，格式: "YYYY-MM-DD HH:mm:ss"
    end_date?: string // 结束日期，格式: "YYYY-MM-DD HH:mm:ss"
    str?: string // 搜索字段
    [key: string]: unknown
  }
  pageSize: number
  pageNo: number
}

// API 返回的售后订单项中的 item
export interface ApiAfterSaleOrderItemEntry {
  id?: string
  hzkj_localsku_number?: string // Order NO
  hzkj_localsku_name?: string // SKU
  hzkj_qty?: number // QTY
  hzkj_localsku_hzkj_pur_price?: number // Total Price
  hzkj_localsku_hzkj_picturefield?: string // 图片
  [key: string]: unknown
}

// API 返回的售后订单项
export interface ApiAfterSaleOrderItem {
  id?: string
  number?: string // NO 显示的是 number
  hzkj_after_entryentity?: {
    item?: ApiAfterSaleOrderItemEntry[]
    [key: string]: unknown
  }
  hzkj_sales_type?: string // type 对应的是 hzkj_sales_type
  createtime?: string // Create Time 对应的是 createtime
  supportTicketNo?: string
  hzOrderNo?: string
  hzSku?: string
  variant?: string
  qty?: number
  totalPrice?: number
  productImage?: string
  returnQty?: number
  storeName?: string
  type?: string
  status?: string
  createTime?: string
  updateTime?: string
  remarks?: string
  reason?: string
  [key: string]: unknown
}

// 查询售后订单响应
export interface QueryAfterSaleOrdersResponse {
  data?: {
    rows?: ApiAfterSaleOrderItem[]
    totalCount?: number
    pageNo?: number
    pageSize?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询售后订单 API
export async function queryAfterSaleOrders(
  params: QueryAfterSaleOrdersRequest
): Promise<{ rows: ApiAfterSaleOrderItem[]; totalCount: number }> {
  const response = await apiClient.post<QueryAfterSaleOrdersResponse>(
    '/v2/hzkj/hzkj_ordercenter/hzkj_after_sale_orders/queryAfterSaleOrders',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query after sale orders. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = response.data.data?.rows || []
  const totalCount = response.data.data?.totalCount || 0

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}

// Invoice Records 项（API返回的数据结构）
export interface ApiInvoiceRecordItem {
  id?: string // 记录 ID，用于 getInvoicePdf 等接口
  hzkj_source_number?: string // 客户订单号
  hzkj_order_amount?: number // 订单金额
  hzkj_datetimefield?: string // 日期时间
  normal?: string // 状态
  [key: string]: unknown
}

// 获取 Invoice Records 请求参数
export interface GetInvoiceRecordsRequest {
  data: {
    hzkj_customer_id: string
    // 可选的时间范围过滤字段
    hzkj_datetimefield_start?: string
    hzkj_datetimefield_end?: string
    // 可选的 Clients Order Number 过滤字段
    hzkj_source_number?: string
  }
  pageSize: number
  pageNo: number
}

// 获取 Invoice Records 响应
export interface GetInvoiceRecordsResponse {
  data?: {
    rows?: ApiInvoiceRecordItem[]
    totalCount?: number
    pageNo?: number
    pageSize?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取 Invoice Records API
export async function getInvoiceRecords(
  customerId: string,
  pageNo: number = 1,
  pageSize: number = 10,
  hzkj_datetimefield_start?: string,
  hzkj_datetimefield_end?: string,
  hzkj_source_number?: string
): Promise<{ rows: ApiInvoiceRecordItem[]; totalCount: number }> {
  const data: GetInvoiceRecordsRequest['data'] = {
    hzkj_customer_id: customerId,
  }

  if (hzkj_datetimefield_start) {
    data.hzkj_datetimefield_start = hzkj_datetimefield_start
  }
  if (hzkj_datetimefield_end) {
    data.hzkj_datetimefield_end = hzkj_datetimefield_end
  }
  if (hzkj_source_number) {
    data.hzkj_source_number = hzkj_source_number
  }

  const requestData: GetInvoiceRecordsRequest = {
    data,
    pageSize,
    pageNo,
  }

  const response = await apiClient.post<GetInvoiceRecordsResponse>(
    '/v2/hzkj/hzkj_ordercenter/hzkj_orders/getInvoiceRecords',
    requestData
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get invoice records. Please try again.'
    throw new Error(errorMessage)
  }
  const rows = response.data.data?.rows || []
  const totalCount = response.data.data?.totalCount || 0

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}

/** 订单发票 PDF 下载。type: "1"-Store Orders, "2"-Sample Orders, "3"-Stock Orders */
function base64ToPdfBlob(base64: string): Blob {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new Blob([bytes], { type: 'application/pdf' })
}

export async function getOrderInvoicePdf(
  customerId: string,
  ids: string[],
  type: '1' | '2' | '3'
): Promise<Blob> {
  const response = await apiClient.post<{
    data?: string
    status?: boolean
    message?: string | null
    errorCode?: string
  }>('/v2/hzkj/hzkj_ordercenter/invoice/getOrderInvoicePdf', {
    customerId,
    ids,
    type,
  })
  if (response.data?.status === false) {
    throw new Error(
      response.data.message || 'Failed to get order invoice PDF. Please try again.'
    )
  }
  const base64 = response.data?.data
  if (typeof base64 !== 'string' || !base64) {
    throw new Error('Invalid PDF response from server')
  }
  return base64ToPdfBlob(base64)
}