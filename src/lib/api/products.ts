import { apiClient } from '../api-client'

// 获取产品列表请求参数
export interface GetProductsListRequest {
  pageSize: number
  pageNo: number
  productName?: string
  minPrice?: number
  maxPrice?: number
  deliveryId?: string
  categoryIds?: string[]
  productTypes?: string[]
  productTags?: string[]
}

// API 返回的产品项
export interface ApiProductItem {
  number: string
  price: number
  name: string
  id: string
  picture: string
  enname: string
  [key: string]: unknown
}

// 获取产品列表响应
export interface GetProductsListResponse {
  data?: {
    pageNo: number
    pageSize: number
    totalCount: number
    products?: ApiProductItem[]
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 获取产品列表 API
export async function getProductsList(
  params: GetProductsListRequest
): Promise<GetProductsListResponse> {
  const response = await apiClient.post<GetProductsListResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getProductsList',
    params
  )

  console.log('获取产品列表响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get products list. Please try again.'
    throw new Error(errorMessage)
  }
  console.log('response.data.products', response.data)
  console.log('response.data.products', response.data.data?.products)

  return response.data.data?.products
}

// 获取推荐产品列表请求参数
export interface GetRecommendProductsListRequest {
  customerId: string
  pageSize: number
  pageNo: number
  nameOrCode?: string
  startDate?: string
  endDate?: string
}

// 获取推荐产品列表响应
export interface GetRecommendProductsListResponse {
  data?: {
    pageNo: number
    pageSize: number
    totalCount: number
    products?: ApiProductItem[]
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 获取推荐产品列表 API
export async function getRecommendProductsList(
  params: GetRecommendProductsListRequest
): Promise<GetRecommendProductsListResponse> {
  const response = await apiClient.post<GetRecommendProductsListResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getRecommendProductsList',
    params
  )

  console.log('获取推荐产品列表响应:', response.data)

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get recommended products list. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 删除收藏 / 推荐产品请求参数
export interface DelRecommendProductsRequest {
  customerId: string
  productIds: string[]
}

// 删除收藏 / 推荐产品响应
export interface DelRecommendProductsResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 删除收藏 / 推荐产品 API
export async function delRecommendProducts(
  params: DelRecommendProductsRequest
): Promise<DelRecommendProductsResponse> {
  const response = await apiClient.post<DelRecommendProductsResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/delRecommendProducts',
    params
  )

  console.log('删除收藏/推荐产品响应:', response.data)

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to delete collection products. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询商品分类请求参数
export interface QueryGoodClassRequest {
  data: {
    group_number?: string
  }
  pageSize: number
  pageNo: number
}

// 商品分类项接口
export interface GoodClassItem {
  id?: string
  number?: string
  name?: string
  group_number?: string
  hzkj_parent_id?: string
  hzkj_parent_name?: string
  hzkj_parent_number?: string
  hzkj_picture?: string
  parent_id?: string // 保留向后兼容
  level?: number
  [key: string]: unknown
}

// 查询商品分类响应
export interface QueryGoodClassResponse {
  data?: {
    rows?: GoodClassItem[]
    list?: GoodClassItem[]
    pageNo?: number
    pageSize?: number
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询商品分类列表 API
export async function queryGoodClassList(
  groupNumber?: string,
  pageNo: number = 1,
  pageSize: number = 100
): Promise<GoodClassItem[]> {
  const requestData: QueryGoodClassRequest = {
    data: groupNumber
      ? {
          group_number: groupNumber,
        }
      : {},
    pageSize,
    pageNo,
  }

  console.log('查询商品分类请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryGoodClassResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_goodclass/queryList',
    requestData
  )

  console.log('查询商品分类响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query good class list. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回 list，如果都没有则返回空数组
  const rows = response.data.data?.rows || response.data.data?.list
  return Array.isArray(rows) ? rows : []
}

// 查询 SKU 记录请求参数
export interface QuerySkuByCustomerRequest {
  data: {
    hzkj_cus_id: number
    hzkj_good_id: string
    hzkj_public?: string
  }
  pageSize: number
  pageNo: number
}

// SKU 记录项接口
export interface SkuRecordItem {
  id?: string
  number?: string
  name?: string
  hzkj_cus_id?: number
  hzkj_good_id?: string
  hzkj_public?: string
  [key: string]: unknown
}

// 查询 SKU 记录响应
export interface QuerySkuByCustomerResponse {
  data?: {
    rows?: SkuRecordItem[]
    list?: SkuRecordItem[]
    pageNo?: number
    pageSize?: number
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询 SKU 记录 API
export async function querySkuByCustomer(
  goodId: string,
  customerId: number = 0,
  publicFlag: string = '0',
  pageNo: number = 1,
  pageSize: number = 10
): Promise<SkuRecordItem[]> {
  const requestData: QuerySkuByCustomerRequest = {
    data: {
      hzkj_cus_id: customerId,
      hzkj_good_id: goodId,
      hzkj_public: publicFlag,
    },
    pageSize,
    pageNo,
  }

  console.log('查询 SKU 记录请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QuerySkuByCustomerResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_sku_record/querySkuByCustomer',
    requestData
  )

  console.log('查询 SKU 记录响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query SKU records. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回 list，如果都没有则返回空数组
  const rows = response.data.data?.rows || response.data.data?.list
  return Array.isArray(rows) ? rows : []
}

