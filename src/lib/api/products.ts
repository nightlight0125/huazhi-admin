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

  return response.data
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

