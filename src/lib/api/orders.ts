import { apiClient } from '../api-client'
import type { Order } from '@/features/orders/data/schema'

// 查询订单请求参数
export interface QueryOrderRequest {
  customerId: string
  type: string
  str?: string // 搜索字符串，可选
  pageIndex: number
  pageSize: number
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

// 查询订单 API
export async function queryOrder(
  params: QueryOrderRequest
): Promise<{ orders: Order[]; total: number }> {
  const response = await apiClient.post<QueryOrderResponse>(
    '/v2/hzkj/hzkj_ordercenter/order/queryOrder',
    params
  )

  console.log('查询订单响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query orders. Please try again.'
    throw new Error(errorMessage)
  }

  const array = response.data.data?.array || []
  const total = response.data.data?.total || 0

  // 转换 API 数据为 Order 类型
  const orders: Order[] = array.map((item) => {
    // 提取店铺名称
    const shopName =
      typeof item.hzkj_shop_name === 'object' && item.hzkj_shop_name !== null
        ? (item.hzkj_shop_name.zh_CN ||
            item.hzkj_shop_name.GLang ||
            String(item.hzkj_shop_name))
        : String(item.hzkj_shop_name || '')

    // 提取客户名称
    const customerName =
      typeof item.hzkj_customer_name === 'object' &&
      item.hzkj_customer_name !== null
        ? (item.hzkj_customer_name.zh_CN ||
            item.hzkj_customer_name.GLang ||
            item.hzkj_customer_name.zh_TW ||
            String(item.hzkj_customer_name))
        : String(item.hzkj_customer_name || '')

    // 转换产品列表
    const productList =
      item.lingItems?.map((lineItem, index) => {
        const productName =
          typeof lineItem.hzkj_product_name_en === 'object' &&
          lineItem.hzkj_product_name_en !== null
            ? (lineItem.hzkj_product_name_en.zh_CN ||
                lineItem.hzkj_product_name_en.GLang ||
                lineItem.hzkj_product_name_en.zh_TW ||
                String(lineItem.hzkj_product_name_en))
            : String(lineItem.hzkj_product_name_en || '')

        const localSkuName =
          typeof lineItem.hzkj_local_sku_name_cn === 'object' &&
          lineItem.hzkj_local_sku_name_cn !== null
            ? (lineItem.hzkj_local_sku_name_cn.zh_CN ||
                lineItem.hzkj_local_sku_name_cn.GLang ||
                lineItem.hzkj_local_sku_name_cn.zh_TW ||
                String(lineItem.hzkj_local_sku_name_cn))
            : String(lineItem.hzkj_local_sku_name_cn || '')

        const quantity = parseFloat(lineItem.hzkj_qty || '0')
        const price = lineItem.hzkj_shop_price || 0
        const amount = parseFloat(lineItem.hzkj_amount || '0')

        // 解析变体名称
        const variantParts = lineItem.hzkj_variant_name
          ? lineItem.hzkj_variant_name.split(' / ')
          : []
        const productVariant =
          variantParts.length > 0
            ? [
                {
                  id: `${lineItem.entryId || index}-color`,
                  name: 'Color',
                  value: variantParts[0] || '',
                },
                ...(variantParts.length > 1
                  ? [
                      {
                        id: `${lineItem.entryId || index}-size`,
                        name: 'Size',
                        value: variantParts[1] || '',
                      },
                    ]
                  : []),
              ]
            : []

        return {
          id: lineItem.entryId || `${item.id}-${index}`,
          productName: productName || localSkuName,
          productVariant,
          quantity,
          productImageUrl: lineItem.hzkj_picture || '',
          productLink: '',
          price,
          totalPrice: amount || price * quantity,
        }
      }) || []

    // 解析日期
    const createdAt = item.createtime
      ? new Date(item.createtime)
      : new Date()
    const updatedAt = item.hzkj_bizdate
      ? new Date(item.hzkj_bizdate)
      : createdAt

    // 解析地址信息
    const countryAddress = item.hzkj_country_address || ''
    const addressParts = countryAddress.split('/')
    const country = addressParts[0] || item.hzkj_country_code || ''
    const province = addressParts[1] || ''
    const city = ''

    return {
      id: item.id,
      store: item.hzkj_shop_number || '',
      orderNumber: item.billno || item.hzkj_source_number || item.id,
      customerName,
      country,
      province,
      city,
      address: item.hzkj_address || '',
      phoneNumber: item.hzkj_telephone || '',
      email: item.hzkj_email || '',
      postalCode: item.hzkj_post_code || '',
      taxNumber: '',
      productList,

      // 保留原有字段以兼容现有代码
      storeName: shopName,
      platformOrderNumber: item.hzkj_source_number || '',
      customerOrderNumber: item.billno || '',
      customer: customerName,
      trackingNumber: '',
      shippingCost: 0,
      otherCosts: 0,
      totalCost: item.hzkj_order_amount || 0,
      shippingStock: '',
      productName: productList[0]?.productName || '',
      logistics: item.hzkj_deliveryway || '',
      platformOrderStatus: (item.hzkj_orderstatus as '0' | 'no' | '1' | '2' | '3' | '4') || '1',
      platformFulfillmentStatus: (item.hzkj_fulfillment_status as 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked') || 'unfulfilled',
      shippingOrigin: '',
      status: 'pending' as const,
      createdAt,
      updatedAt,
    }
  })

  return {
    orders: Array.isArray(orders) ? orders : [],
    total: typeof total === 'number' ? total : 0,
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

