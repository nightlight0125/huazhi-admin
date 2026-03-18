import { apiClient } from '../api-client'

// 获取用户店铺请求参数
export interface GetUserShopRequest {
  id: string
}

// 获取用户店铺响应
export interface GetUserShopResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 获取用户店铺 API
export async function getUserShop(
  userId: string
): Promise<GetUserShopResponse> {
  const response = await apiClient.get<GetUserShopResponse>(
    '/v2/hzkj/base/shop/getUserShop',
    {
      params: {
        hzkjAccountId: userId,
      },
    }
  )

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to get user shops. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 店铺列表项
export interface ShopListItem {
  id: string
  name: string
  platform: string
  createtime?: string
  bindtime?: string
  enable?: string
  [key: string]: unknown
}

// 获取用户店铺列表请求参数
export interface GetUserShopListRequest {
  hzkjAccountId: string
  queryParam?: string
  pageNo?: number
  pageSize?: number
}

// 获取用户店铺列表响应
export interface GetUserShopListResponse {
  data?: {
    total?: number
    list?: ShopListItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 获取用户店铺列表 API（新接口）
export async function getUserShopList(
  params: GetUserShopListRequest
): Promise<{ list: ShopListItem[]; total: number }> {
  const {
    hzkjAccountId,
    queryParam = '',
    pageNo = 0,
    pageSize = 10,
  } = params

  const response = await apiClient.get<GetUserShopListResponse>(
    '/v2/hzkj/hzkj_member/shop/getUserShop',
    {
      params: {
        hzkjAccountId,
        queryParam,
        pageNo: String(pageNo),
        pageSize: String(pageSize),
      },
    }
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get user shop list. Please try again.'
    throw new Error(errorMessage)
  }

  const list = response.data.data?.list || []
  const total = response.data.data?.total || 0

  return {
    list: Array.isArray(list) ? list : [],
    total: typeof total === 'number' ? total : 0,
  }
}

// Shopify OAuth 请求参数
export interface ShopifyOAuthRequest {
  shop: string
  state: string
}

// Shopify OAuth 响应
export interface ShopifyOAuthResponse {
  data?: {
    url?: string
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 获取 Shopify OAuth URL
export async function shopifyOAuth(
  shop: string,
  state: string
): Promise<string> {
  const response = await apiClient.get<ShopifyOAuthResponse>(
    '/v2/hzkj/hzkj_thirdparty/shop/shopifyOAuth',
    {
      params: {
        shop,
        state,
      },
    }
  )

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to get OAuth URL. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 OAuth URL
  const data = response.data?.data
  const url = data && typeof data === 'object' && 'url' in data
    ? (data as { url?: string }).url
    : typeof data === 'string'
      ? data
      : undefined
  if (!url || typeof url !== 'string') {
    throw new Error('OAuth URL not found in response')
  }

  return url
}

// Shopify 回调请求参数
export interface ShopifyCallbackRequest {
  code: string
  shop: string
  state: string
}

// Shopify 回调响应
export interface ShopifyCallbackResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 处理 Shopify OAuth 回调
export async function shopifyCallback(
  code: string,
  shop: string,
  state: string
): Promise<ShopifyCallbackResponse> {
  const response = await apiClient.get<ShopifyCallbackResponse>(
    '/v2/hzkj/hzkj_thirdparty/shop/callback',
    {
      params: {
        code,
        shop,
        state,
      },
    }
  )

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to complete OAuth. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 解绑店铺请求参数
export interface UnbindShopRequest {
  accountId: string
  shopId: string
  flag: number // 1 表示解绑
}

// 解绑店铺响应
export interface UnbindShopResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 绑定店铺请求参数
export interface AddShopRequest {
  addShopVO: {
    customerId: string
    accountId: string
    shopName: string
  }
}

// 绑定店铺响应
export interface AddShopResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 绑定店铺 API
export async function addShop(params: AddShopRequest): Promise<AddShopResponse> {
  const response = await apiClient.post<AddShopResponse>(
    '/v2/hzkj/hzkj_customer/shop/addShop',
    params
  )

  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to add shop. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 解绑店铺 API
export async function unbindShop(
  params: UnbindShopRequest
): Promise<UnbindShopResponse> {
  const response = await apiClient.post<UnbindShopResponse>(
    '/v2/hzkj/hzkj_member_sky/member/updateAccountBindShop',
    {
      accountId: params.accountId,
      shopId: params.shopId,
      flag: params.flag,
    }
  )

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to unbind shop. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

