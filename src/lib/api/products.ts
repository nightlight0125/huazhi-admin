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
  hzkj_sku_spec_e?: Array<any>
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
    data?: ApiProductItem[] // 后端返回的产品数组在 data.data 中
    products?: ApiProductItem[] // 保留向后兼容
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
      response.data.message || 'Failed to get recommend products list. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 删除推荐产品请求参数
export interface DelRecommendProductsRequest {
  customerId: string
  productIds: string[]
}

// 删除推荐产品响应
export interface DelRecommendProductsResponse {
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 删除推荐产品 API
export async function delRecommendProducts(
  params: DelRecommendProductsRequest
): Promise<DelRecommendProductsResponse> {
  const response = await apiClient.post<DelRecommendProductsResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/delRecommendProducts',
    params
  )

  console.log('删除推荐产品响应:', response.data)

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete recommend products. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询商品分类请求参数
export interface QueryGoodClassRequest {
  data: {
    groupNumber?: string
  }
  pageNo: number
  pageSize: number
}

// 商品分类项
export interface GoodClassItem {
  id: string
  number: string
  name: string
  hzkj_parent_id?: string
  children?: GoodClassItem[]
  [key: string]: unknown
}

// 查询商品分类响应
export interface QueryGoodClassResponse {
  data?: {
    rows?: GoodClassItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询商品分类列表 API
export async function queryGoodClassList(
  group_number?: string,
  pageNo: number = 1,
  pageSize: number = 100
): Promise<GoodClassItem[]> {
  const requestData: QueryGoodClassRequest = {
    data: {
      ...(group_number && { group_number: group_number }),
    },
    pageNo,
    pageSize,
  }

  const response = await apiClient.post<QueryGoodClassResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_goodclass/queryList',
    requestData
  )

  console.log('查询商品分类列表响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query good class list. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 查询 SKU 记录请求参数
export interface QuerySkuByCustomerRequest {
  data: {
    hzkj_cus_id: number
    hzkj_good_id?: string
    hzkj_public?: string
    hzkj_str?: string // 搜索字段
  }
  pageSize: number
  pageNo: number
}

// SKU 记录项接口
export interface SkuRecordItem {
  id?: string
  hzkj_good_id?: string
  hzkj_sku_number?: string
  hzkj_sku_name?: string
  [key: string]: unknown
}

// 查询 SKU 记录响应
export interface QuerySkuByCustomerResponse {
  data?: {
    rows?: SkuRecordItem[]
    list?: SkuRecordItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean

  [key: string]: unknown
}

// 查询 SKU 记录 API（支持可选 goodId、hzkj_str 和返回总数）
export async function querySkuByCustomer(
  goodId: string | undefined,
  customerId: number,
  publicFlag: string = '0',
  pageNo: number = 1,
  pageSize: number = 10,
  returnTotal?: boolean,
  hzkjStr?: string // 搜索字段
): Promise<SkuRecordItem[] | { rows: SkuRecordItem[]; totalCount: number }> {
  const requestData: QuerySkuByCustomerRequest = {
    data: {
      hzkj_cus_id: customerId,
      hzkj_public: publicFlag,
      ...(goodId && { hzkj_good_id: goodId }),
      ...(hzkjStr && hzkjStr.trim() && { hzkj_str: hzkjStr.trim() }),
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
  const skuRecords = Array.isArray(rows) ? rows : []

  // 如果需要返回总数
  if (returnTotal) {
    const totalCount = typeof response.data.data?.totalCount === 'number'
      ? response.data.data.totalCount
      : 0
    return {
      rows: skuRecords,
      totalCount,
    }
  }

  return skuRecords
}

// 获取产品详情请求参数
export interface GetProductRequest {
  productId: string
}

// 获取产品详情响应
export interface GetProductResponse {
  data?: ApiProductItem
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 获取产品详情 API
export async function getProduct(
  productId: string
): Promise<ApiProductItem | null> {
  const response = await apiClient.post<GetProductResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getProduct',
    { productId }
  )

  console.log('获取产品详情响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get product. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data.data || null
}

// 收藏产品请求参数
export interface CollectProductRequest {
  goodsId: string
  customerId: string
}

// 收藏产品响应
export interface CollectProductResponse {
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 收藏产品 API
export async function collectProduct(
  goodsId: string,
  customerId: string
): Promise<CollectProductResponse> {
  const requestData: CollectProductRequest = {
    goodsId,
    customerId,
  }

  const response = await apiClient.post<CollectProductResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/collectProduct',
    requestData
  )

  console.log('收藏产品响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to collect product. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// Shopify 连接产品项
export interface ShopifyConnectedProductItem {
  localSpuId?: string
  shopSpuTitle?: string
  productID?: string
  localSpuPicture?: string
  localSpuNumber?: string
  shopName?: string
  shopSpuPrice?: string
  localSpuPrice?: number
  category?: string | null
  items?: Array<{
    localSkuNumber?: string
    localSkuValue?: string
    localSkuPicture?: string
    shopVariantId?: string
    localSkuCName?: string
    localSkuPrice?: number
    shopVariantPicture?: string
    shopVariantPrice?: string
    variantShopName?: string
    localSkuEName?: string
    shopVariantTitle?: string
    category?: string | null
  }>
  entryId?: string
  shopSpuPicture?: string
  [key: string]: unknown
}

// 查询 Shopify 连接产品请求参数
export interface QueryShopifyConnectedProductsRequest {
  shopId: string
  customerId: string
  accountId: string
  pageIndex: number
  pageSize: number
}

// 查询 Shopify 连接产品响应
export interface QueryShopifyConnectedProductsResponse {
  data?: {
    rows?: ShopifyConnectedProductItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询 Shopify 连接产品 API
export async function queryShopifyConnectedProducts(
  params: QueryShopifyConnectedProductsRequest
): Promise<{ rows: ShopifyConnectedProductItem[]; totalCount: number }> {
  const response = await apiClient.post<QueryShopifyConnectedProductsResponse>(
    '/v2/hzkj/hzkj_commodity/products/queryShopifyConnectedProducts',
    params
  )

  console.log('查询 Shopify 连接产品响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query Shopify connected products. Please try again.'
    throw new Error(errorMessage)
  }

  // 提取数据
  const dataObj = response.data.data
  const rows = Array.isArray(dataObj?.list
  ) ? dataObj.list : []
  const totalCount = typeof dataObj?.total === 'number' ? dataObj.total : 0

  return {
    rows,
    totalCount,
  }
}

// 查询推送产品列表请求参数
export interface QueryPushProductsListRequest {
  data: {
    hzkj_customer_id: string
    hzkj_issuccess: string
    hzkj_push_shop_id: string
    str?: string // 搜索字段
  }
  pageSize: number
  pageNo: number
}

// 推送产品项（API 返回的数据结构，需要根据实际 API 响应调整）
export interface PushProductItem {
  id?: string
  name?: string
  image?: string
  spu?: string
  storeName?: string
  tdPrice?: number
  yourPrice?: string
  weight?: number
  shippingFrom?: string
  shippingMethod?: string
  amount?: number
  status?: 'published' | 'publishing' | 'failed'
  createdAt?: Date
  updatedAt?: Date
  [key: string]: unknown
}

// 查询推送产品列表响应
export interface QueryPushProductsListResponse {
  data?: {
    rows?: PushProductItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询推送产品列表 API
export async function queryPushProductsList(
  params: QueryPushProductsListRequest
): Promise<{ rows: PushProductItem[]; totalCount: number }> {
  const response = await apiClient.post<QueryPushProductsListResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_push_product/queryPushProductsList',
    params
  )

  console.log('查询推送产品列表响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query push products list. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = Array.isArray(response.data?.data?.rows) ? response.data.data.rows : []
  const totalCount = typeof response.data?.data?.totalCount === 'number' ? response.data.data.totalCount : 0

  return {
    rows,
    totalCount,
  }
}

// 删除推送产品请求参数
export interface DeletePushProductRequest {
  productId: string
}

// 删除推送产品响应
export interface DeletePushProductResponse {
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 删除推送产品 API
export async function deletePushProduct(
  params: DeletePushProductRequest
): Promise<DeletePushProductResponse> {
  const response = await apiClient.post<DeletePushProductResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/deletePushProduct',
    params
  )

  console.log('删除推送产品响应:', response.data)

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to delete push product. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 根据规格选择获取 SKU 请求参数
export interface SelectSpecGetSkuRequest {
  productId: string
  specIds: string[] // 规格值ID列表
}

// 根据规格选择获取 SKU 响应
export interface SelectSpecGetSkuResponse {
  data?: {
    id?: string
    sku?: string
    price?: number
    stock?: number
    image?: string
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 根据规格选择获取 SKU API
export async function selectSpecGetSku(
  params: SelectSpecGetSkuRequest
): Promise<SelectSpecGetSkuResponse> {
  const response = await apiClient.post<SelectSpecGetSkuResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/selectSpecGetSku',
    params
  )

  console.log('根据规格选择获取 SKU 响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get SKU by specs. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询 Shopify 未连接产品请求参数
export interface QueryShopifyUnconnectedProductsRequest {
  shopId: string
  customerId: string
  accountId: string
  pageIndex: number
  pageSize: number
  hzkj_str?: string // 搜索字段
}

// Shopify 未连接产品项
export interface ShopifyUnconnectedProductItem {
  id?: string
  image?: string
  description?: string
  variantId?: string
  [key: string]: unknown
}

// 查询 Shopify 未连接产品响应
export interface QueryShopifyUnconnectedProductsResponse {
  data?: {
    rows?: ShopifyUnconnectedProductItem[]
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

// 查询 Shopify 未连接产品 API
export async function queryShopifyUnconnectedProducts(
  params: QueryShopifyUnconnectedProductsRequest
): Promise<{ rows: ShopifyUnconnectedProductItem[]; totalCount: number }> {
  const response = await apiClient.post<QueryShopifyUnconnectedProductsResponse>(
    '/v2/hzkj/hzkj_commodity/products/queryShopifyUnconnectedProducts',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query Shopify unconnected products. Please try again.'
    throw new Error(errorMessage)
  }

  // 提取数据
  const dataObj = response.data.data
  const rows = Array.isArray(dataObj?.list) ? dataObj.list : []
  const totalCount = typeof dataObj?.total === 'number' ? dataObj.total : 0
  console.log('totalCount------------111:', totalCount)

  return {
    rows,
    totalCount,
  }
}

// 查询包装连接列表请求参数
export interface QueryOdPdPackageListRequest {
  data: {
    hzkj_od_pd_shop_hzkj_customer_id: string
    hzkj_package_type: string // "1" for Products, "2" for Order
    accountId: string
    hzkj_od_pd_shop_id?: string
    str?: string
    hzkj_isconnect?: string
  }
  pageSize: number
  pageNo: number
}

// 包装连接列表项
export interface OdPdPackageListItem {
  id?: string
  hzkj_od_pd_shop_id?: string
  hzkj_od_pd_shop_name?: string
  hzkj_od_pd_shop_sku?: string
  hzkj_od_pd_shop_variant_id?: string
  hzkj_od_pd_shop_product_name?: string
  hzkj_od_pd_shop_product_image?: string
  hzkj_od_pd_shop_price?: number
  hzkj_isconnect?: string
  hzkj_hz_product_id?: string
  hzkj_hz_product_image?: string
  hzkj_hz_product_sku?: string
  [key: string]: unknown
}

// 查询包装连接列表响应
export interface QueryOdPdPackageListResponse {
  data?: {
    list?: OdPdPackageListItem[]
    total?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询包装连接列表 API
export async function queryOdPdPackageList(
  params: QueryOdPdPackageListRequest
): Promise<{ rows: OdPdPackageListItem[]; totalCount: number }> {
  const response = await apiClient.post<QueryOdPdPackageListResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_od_pd_package_tb/queryOdPdPackageList',
    params
  )

  console.log('查询包装连接列表响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query packaging connection list. Please try again.'
    throw new Error(errorMessage)
  }

  // 提取数据
  const dataObj = response.data.data
  const rows = Array.isArray(dataObj?.rows) ? dataObj.rows : []
  const totalCount = typeof dataObj?.totalCount === 'number' ? dataObj.totalCount : 0

  return {
    rows,
    totalCount,
  }
}

// 查询客户店铺包装列表请求参数
export interface QueryCuShopPackageListRequest {
  data: {
    hzkj_pk_shop_hzkj_customer_id: string
    accountId: string
  }
  pageSize: number
  pageNo: number
}

// 客户店铺包装列表项
export interface CuShopPackageListItem {
  id?: string
  hzkj_pk_shop_id?: string
  hzkj_pk_shop_name?: string
  hzkj_pk_shop_sku?: string
  hzkj_pk_shop_variant_id?: string
  hzkj_pk_shop_product_name?: string
  hzkj_pk_shop_product_image?: string
  hzkj_pk_shop_price?: number
  [key: string]: unknown
}

// 查询客户店铺包装列表响应
export interface QueryCuShopPackageListResponse {
  data?: {
    rows?: CuShopPackageListItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询客户店铺包装列表 API
export async function queryCuShopPackageList(
  params: QueryCuShopPackageListRequest
): Promise<{ rows: CuShopPackageListItem[]; totalCount: number }> {
  const response = await apiClient.post<QueryCuShopPackageListResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_shop_package_tb/queryCuShopPackageList',
    params
  )

  console.log('查询客户店铺包装列表响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query customer shop package list. Please try again.'
    throw new Error(errorMessage)
  }

  // 提取数据
  const dataObj = response.data.data
  const rows = Array.isArray(dataObj?.rows) ? dataObj.rows : []
  const totalCount = typeof dataObj?.totalCount === 'number' ? dataObj.totalCount : 0

  return {
    rows,
    totalCount,
  }
}
