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
  [key: string]: unknown
  hzkj_product_name_en?: {
    GLang?: string
    zh_CN?: string
    zh_TW?: string
    [key: string]: unknown
  }
  hzkj_fre_quo_amount?: number | string
  hzkj_customer_channel_name?: number | string
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

// 将 API 订单项转换为 Order 类型
function transformApiOrderToOrder(apiOrder: ApiOrderItem): Order {
  // 转换产品列表
  console.log(apiOrder, 'apiOrder')
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
    trackingNumber: '',
    shippingCost: 0,
    otherCosts: 0,
    totalCost: apiOrder.hzkj_order_amount || 0,
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
    hzkj_pack_weight_total: apiOrder.hzkj_pack_weight_total,
    hzkj_product_name_en: apiOrder.hzkj_product_name_en?.GLang || apiOrder.hzkj_product_name_en?.zh_CN || '',
    // 添加额外的字段以支持 orders-columns.tsx
    lingItems: apiOrder.lingItems,
    hzkj_shop_name: apiOrder.hzkj_shop_name,
    billno: apiOrder.billno,
    createtime: apiOrder.createtime,
    hzkj_customer_name: apiOrder.hzkj_customer_name,
    providers: apiOrder.hzkj_deliveryway,
    hzkj_fre_quo_amount: apiOrder.hzkj_fre_quo_amount,
    hzkj_customer_channel_name: apiOrder.hzkj_customer_channel_name,
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
    hzkj_tax_id: (apiOrder as any).hzkj_tax_id,
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
  console.log('queryOrder response:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query orders. Please try again.'
    throw new Error(errorMessage)
  }

  const apiOrders = Array.isArray(response.data.data?.array) ? response.data.data?.array : []
  const orders = apiOrders.map(transformApiOrderToOrder)

  return {
    orders,
    total: typeof response.data.data?.total === 'number' ? response.data.data?.total : 0,
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

  console.log('订单统计响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get order statistics. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data.data || {}
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

  console.log('删除订单响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete order. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// ---------- 更新发货订单（修改地址等） ----------

export interface UpdateSalOutOrderDetailItem {
  entryId: string
  skuId: string
  quantity: number
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

  console.log('更新发货订单响应:', response.data)

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

  console.log('创建售后订单请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<AddRMAOrderResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/addRMAOrder',
    requestData
  )

  console.log('创建售后订单响应:', response.data)

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
    '/v2/hzkj/hzkj_ordercenter/hzkj_after_sales_reason/queryAfterSaleResopnList',
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

  console.log('同步店铺订单响应:', response.data)

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

  console.log('订单图形统计请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<GraphicStatisticsResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/graphicStatistics',
    requestData
  )

  console.log('订单图形统计响应:', response.data)

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

  console.log('热销产品统计请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<HotProductStatisticsResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/hotProductStatistics',
    requestData
  )

  console.log('热销产品统计响应:', response.data)

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

  console.log('订单数量统计请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<OrderCountStatisticsResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/orderCountStatistics',
    requestData
  )

  console.log('订单数量统计响应:', response.data)

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
  const response = await apiClient.post<RequestPaymentResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/requestPayment',
    request
  )

  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to request payment. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
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

  console.log('查询售后订单响应:', response.data)

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
  hzkj_source_number?: string // 客户订单号
  hzkj_order_amount?: number // 订单金额
  hzkj_datetimefield?: string // 日期时间
  normal?: string // 状态
  [key: string]: unknown
}

// 获取 Invoice Records 请求参数
export interface GetInvoiceRecordsRequest {
  data: {
    hzkj_orderstatus: string
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
  // 可选的时间范围参数，当输入日期时由前端传入
  hzkj_datetimefield_start?: string,
  hzkj_datetimefield_end?: string,
  // 可选的 Clients Order Number（搜索框）
  hzkj_source_number?: string
): Promise<{ rows: ApiInvoiceRecordItem[]; totalCount: number }> {
  const data: GetInvoiceRecordsRequest['data'] = {
    hzkj_orderstatus: '0',
    hzkj_customer_id: customerId,
  }

  // 如果有日期过滤条件，则附加到请求数据中
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

  console.log('获取 Invoice Records 请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<GetInvoiceRecordsResponse>(
    '/v2/hzkj/hzkj_ordercenter/hzkj_orders/getInvoiceRecords',
    requestData
  )

  console.log('获取 Invoice Records 响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get invoice records. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回数据
  const rows = response.data.data?.rows || []
  const totalCount = response.data.data?.totalCount || 0

  console.log('获取 Invoice Records 响应数据1111111111:', rows)

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}