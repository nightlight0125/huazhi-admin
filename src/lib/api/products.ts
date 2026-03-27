import { apiClient } from '../api-client'

// 获取产品列表请求参数
export interface GetProductsListRequest {
  customerId: string
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

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get recommend products list. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 获取收藏产品列表请求参数
export interface GetCollectProductsListRequest {
  customerId: string
  pageSize: number
  pageNo: number
  nameOrCode?: string
  startDate?: string
  endDate?: string
}

// 获取收藏产品列表响应
export interface GetCollectProductsListResponse {
  data?: {
    pageNo: number
    pageSize: number
    totalCount: number
    data?: ApiProductItem[]
    products?: ApiProductItem[]
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 获取收藏 SKU 列表请求参数
export interface GetCollectSKUsListRequest {
  customerId: string
  pageSize: number
  pageNo: number
  nameOrCode?: string
  startDate?: string
  endDate?: string
}

// 获取收藏 SKU 列表响应
// 返回 data 中项字段与表单映射：Product Name<-spuName, Product Pic Url<-pic
// Product Variants/Quantity/Product Link 无对应后端字段
export interface GetCollectSKUsListResponse {
  data?: {
    data?: Array<{ spuName?: string; pic?: string; [key: string]: unknown }>
    rows?: Array<{ spuName?: string; pic?: string; [key: string]: unknown }>
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 获取收藏 SKU 列表 API
export async function getCollectSKUsList(
  params: GetCollectSKUsListRequest
): Promise<GetCollectSKUsListResponse> {
  const response = await apiClient.post<GetCollectSKUsListResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getCollectSKUsList',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get collected SKUs list. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询店铺产品列表请求参数
export interface QueryStoreSKUListRequest {
  customerId: string
  pageNo: number
  pageSize: number
  /** 有值时传，无值不传 */
  skuId?: string
  /** 有值时传，无值不传 */
  productName?: string
}

// 查询店铺产品列表响应
export interface QueryStoreSKUListResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询店铺产品列表 API
export async function queryStoreSKUList(
  params: QueryStoreSKUListRequest
): Promise<QueryStoreSKUListResponse> {
  const response = await apiClient.post<QueryStoreSKUListResponse>(
    '/v2/hzkj/hzkj_commodity/products/queryStoreSKUList',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get store products list. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 获取收藏产品列表 API
export async function getCollectProductsList(
  params: GetCollectProductsListRequest
): Promise<GetCollectProductsListResponse> {
  const response = await apiClient.post<GetCollectProductsListResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getCollectProductsList',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to get collection products list. Please try again.'
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

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete recommend products. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

export async function delCollectProducts(
  params: DelRecommendProductsRequest
): Promise<DelRecommendProductsResponse> {
  const response = await apiClient.post<DelRecommendProductsResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/delCollectProducts',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete collected products. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询商品分类请求参数
export interface QueryGoodClassRequest {
  data: {
    group_number?: string
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
      ...(group_number && { group_number }),
    },
    pageNo,
    pageSize,
  }

  const response = await apiClient.post<QueryGoodClassResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_goodclass/queryList',
    requestData
  )

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
    hzkj_cus_id: string
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
  customerId: string,
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

  const response = await apiClient.post<QuerySkuByCustomerResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_sku_record/querySkuByCustomer',
    requestData
  )

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

/** 按 SKU 编码校验客户商品档案（订单改品 / 新增行） */
export interface GetSkuByNumberResponse {
  data?: unknown | null
  errorCode?: string
  message?: string
  status?: boolean
}

export async function getSkuByNumber(params: {
  number: string
  cusId: string
}): Promise<GetSkuByNumberResponse> {
  const response = await apiClient.post<GetSkuByNumberResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getSkuByNumber',
    {
      number: params.number.trim(),
      cusId: params.cusId,
    }
  )
  return response.data
}

// 查询客户已绑定包装 API 请求参数
export interface QueryCustomerBindPackageAPIRequest {
  data: {
    number?: string
    hzkj_pack_material_id?: string[]
    hzkj_cus_id: string
    hzkj_good_hzkj_goodtype_id: string
  }
  pageSize: number
  pageNo: number
}

// 查询客户已绑定包装 API 响应
export interface QueryCustomerBindPackageAPIResponse {
  data?: {
    rows?: unknown[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

export async function queryCustomerBindPackageAPI(
  params: QueryCustomerBindPackageAPIRequest
): Promise<{ rows: unknown[]; totalCount: number }> {
  const response = await apiClient.post<QueryCustomerBindPackageAPIResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_sku_record/queryCustomerBindPackageAPI',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query customer bound packages. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = Array.isArray(response.data.data?.rows)
    ? response.data.data!.rows!
    : []
  const totalCount =
    typeof response.data.data?.totalCount === 'number'
      ? (response.data.data.totalCount as number)
      : 0

  return {
    rows,
    totalCount,
  }
}

// ---------------- 包装应用：绑定店铺 SKU 与包装产品 ----------------

export interface AddCuOdPdPackageItem {
  id: string // 行 id（例如变体行 id）
  hzkj_shop_pd_package_id: string // 包装产品 id
  hzkj_package_type: string // 包装类型：1/2 等
  hzkj_order_pd_pk_qty: number // 数量
}

export interface AddCuOdPdPackageRequest {
  data: AddCuOdPdPackageItem[]
}

export interface AddCuOdPdPackageResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

export async function addCuOdPdPackageAPI(
  params: AddCuOdPdPackageRequest
): Promise<AddCuOdPdPackageResponse> {
  const response = await apiClient.post<AddCuOdPdPackageResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_od_pd_package_tb/addCuOdPdPackage',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to apply packaging. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 绑定店铺包装：addCuShopPackage
export interface AddCuShopPackageItem {
  hzkj_shop_id: string
  hzkj_shop_pk_entry: Array<{ hzkj_shop_package_id: string }>
}

export interface AddCuShopPackageRequest {
  data: AddCuShopPackageItem[]
}

export interface AddCuShopPackageResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

export async function addCuShopPackage(
  params: AddCuShopPackageRequest
): Promise<AddCuShopPackageResponse> {
  const response = await apiClient.post<AddCuShopPackageResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_shop_package_bind/addCuShopPackage',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to apply packaging. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 获取产品详情请求参数
export interface GetProductRequest {
  productId: string
  customerId: string
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
  productId: string,
  customerId: string
): Promise<ApiProductItem | null> {
  const response = await apiClient.post<GetProductResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getProduct',
    { productId, customerId }
  )

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
  productId: string
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
    productId: goodsId,
    customerId: customerId,
  }

  const response = await apiClient.post<CollectProductResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/collectProducts',
    requestData
  )

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

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query Shopify connected products. Please try again.'
    throw new Error(errorMessage)
  }

  // 提取数据（兼容不同后端字段：list/rows, total/totalCount）
  const dataObj = response.data.data
  const rows = Array.isArray(dataObj?.list)
    ? dataObj.list
    : Array.isArray(dataObj?.rows)
      ? dataObj.rows
      : []
  const totalCount =
    typeof dataObj?.total === 'number'
      ? dataObj.total
      : typeof dataObj?.totalCount === 'number'
        ? dataObj.totalCount
        : 0

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

// 删除推送产品请求参数（支持批量）
export interface DeletePushProductRequest {
  pushProductIds: string[]
  customerId: string
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

// 根据规格选择获取 SKU 响应数据项
export interface SelectSpecGetSkuResponseItem {
  number?: string // SKU编码
  souprice?: number // 标准原价
  price?: number // 建议销售价
  netweight?: number // 产品净重
  name?: unknown // 配货名
  id?: string // id
  pic?: string // 图片
  enname?: unknown // 英文配货名
  [key: string]: unknown
}

// 根据规格选择获取 SKU 响应
export interface SelectSpecGetSkuResponse {
  data?: SelectSpecGetSkuResponseItem[] // 返回数组
  errorCode?: string
  message?: string | null
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

  // 提取数据（兼容不同后端字段：list/rows, total/totalCount）
  const dataObj = response.data.data
  const rows = Array.isArray(dataObj?.list)
    ? dataObj.list
    : Array.isArray(dataObj?.rows)
      ? dataObj.rows
      : []
  const totalCount =
    typeof dataObj?.total === 'number'
      ? dataObj.total
      : typeof dataObj?.totalCount === 'number'
        ? dataObj.totalCount
        : 0
  return {
    rows,
    totalCount,
  }
}

// 查询未连接变体请求参数
export interface QueryUnconnectedVariantsRequest {
  customerId: string
  productId: string
}

// 未连接变体项
export interface UnconnectedVariantItem {
  variantid?: string // 后端返回的字段名（小写）
  title?: string
  picture?: string
  id?: string
  image?: string
  description?: string
  variantId?: string
  productId?: string
  [key: string]: unknown
}

// 查询未连接变体响应
export interface QueryUnconnectedVariantsResponse {
  data?: UnconnectedVariantItem[]
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询未连接变体 API
export async function queryUnconnectedVariants(
  params: QueryUnconnectedVariantsRequest
): Promise<UnconnectedVariantItem[]> {
  const response = await apiClient.post<QueryUnconnectedVariantsResponse>(
    '/v2/hzkj/hzkj_customer/products/queryUnconnectedVariants',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query unconnected variants. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回数据数组
  return Array.isArray(response.data.data) ? response.data.data : []
}

// 查询包装连接列表请求参数
export interface QueryOdPdPackageListRequest {
  data: {
    hzkj_od_pd_shop_hzkj_customer_id: string
    hzkj_package_type?: string // "1" for Products, "2" for Order, undefined for unconnected
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

// 购买产品请求参数
export interface BuyProductRequest {
  customerId: string
  customChannelId: string
  // 支付完成后返回的地址（回调 URL）
  returnUrl?: string
  // 支付失败/取消后返回的地址
  returnFailUrl?: string
  // 收货地址相关信息
  firstName: string
  lastName: string
  phone: string
  countryId: string
  admindivisionId: string
  city: string
  address1: string
  address2: string
  postCode: string
  taxId: string
  note: string
  // 订单明细
  detail: Array<{
    skuId: string
    quantity: number
    flag: number
  }>
}

// 购买产品响应
export interface BuyProductResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 购买产品 API
export async function buyProduct(
  params: BuyProductRequest
): Promise<BuyProductResponse> {
  const response = await apiClient.post<BuyProductResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/buyProduct',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to buy product. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 保存自定义设计请求参数
export interface SaveCustomizationRequest {
  customerId: string
  skuId: string
  image: string
  brandName: string
  size: string // Large | Medium | Small
  type: string // My Logo | My Cards | My Product Packaging | My Shipping Packaging
  remark: string
}

// 保存自定义设计响应
export interface SaveCustomizationResponse {
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 保存自定义设计 API
export async function saveCustomization(
  params: SaveCustomizationRequest
): Promise<SaveCustomizationResponse> {
  const response = await apiClient.post<SaveCustomizationResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/customization',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to save customization. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询我的包装列表请求参数
export interface GetCustomizationListRequest {
  pageSize: number
  pageNo: number
  customerId: string
  brandName?: string
  size?: string
  type?: string
}

// 我的包装项（直接使用后端字段，不做映射）
export interface CustomizationListItem {
  name?: string
  oldNumber?: string
  newNumber?: string
  size?: string
  type?: string
  picture?: string
  remark?: string
  [key: string]: unknown
}

// 查询我的包装列表响应
export interface GetCustomizationListResponse {
  data?: {
    pageNo?: number
    pageSize?: number
    totalCount?: number
    list?: CustomizationListItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询我的包装列表 API
export async function getCustomizationList(
  params: GetCustomizationListRequest
): Promise<GetCustomizationListResponse> {
  const response = await apiClient.post<GetCustomizationListResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_cu_product_record/getCustomizationList',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query customization list. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 删除店铺包装请求参数
export interface DeleteShopPackageRequest {
  shopPackageId: string
}

// 删除店铺包装响应
export interface DeleteShopPackageResponse {
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 删除店铺包装 API
export async function deleteShopPackage(
  params: DeleteShopPackageRequest
): Promise<DeleteShopPackageResponse> {
  const response = await apiClient.post<DeleteShopPackageResponse>(
    '/v2/hzkj/hzkj_customer/bindPackage/deleteShopPackage',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete shop package. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 连接店铺商品与本地 SKU 请求参数
export interface LinkProductRequest {
  customerId: string
  localSkuId: string
  shopSkuId: string
}

// 连接店铺商品与本地 SKU 响应
export interface LinkProductResponse {
  data?: unknown
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 连接店铺商品与本地 SKU API
export async function linkProduct(
  params: LinkProductRequest
): Promise<LinkProductResponse> {
  const response = await apiClient.post<LinkProductResponse>(
    '/v2/hzkj/hzkj_commodity/products/linkProduct',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to link product. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 解绑店铺商品与本地 SKU 请求参数
export interface UnlinkProductRequest {
  customerId: string
  shopSkuId: string
}

// 解绑店铺商品与本地 SKU 响应
export interface UnlinkProductResponse {
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 解绑店铺商品与本地 SKU API
export async function unlinkProduct(
  params: UnlinkProductRequest
): Promise<UnlinkProductResponse> {
  const response = await apiClient.post<UnlinkProductResponse>(
    '/v2/hzkj/hzkj_commodity/products/unlinkProduct',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to unlink product. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 推送产品到 Shopify 请求参数
export interface PushProductToShopifyNewRequest {
  pushProductVO: {
    shopId: string
    customerId: string
    productId?: string
    title: string
    tags: string[]
    pictures: string[]
    description: string
    variants: Array<{
      picture: string
      sku: string
      price: number
      variantValues: Array<{
        groupName: string
        name: string
      }>
    }>
  }
}

// 推送产品到 Shopify 响应
export interface PushProductToShopifyNewResponse {
  errorCode?: string
  message?: string | null
  status?: boolean
  data?: unknown
  [key: string]: unknown
}

// 推送产品到 Shopify API
export async function pushProductToShopifyNew(
  params: PushProductToShopifyNewRequest
): Promise<PushProductToShopifyNewResponse> {
  const response = await apiClient.post<PushProductToShopifyNewResponse>(
    '/v2/hzkj/hzkj_commodity/products/pushProductToShopifyNew',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to push product to Shopify. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询绑定材料 API 请求参数
export interface QueryBindMaterialApiRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}

// 包装材料项
export interface PackMaterialItem {
  id: string
  number: string
  name: string
  [key: string]: unknown
}

// 查询绑定材料 API 响应
export interface QueryBindMaterialApiResponse {
  data?: {
    rows?: PackMaterialItem[]
    totalCount?: number
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询绑定材料 API
export async function queryBindMaterialApi(
  params: QueryBindMaterialApiRequest
): Promise<{ rows: PackMaterialItem[]; totalCount: number }> {
  const response = await apiClient.post<QueryBindMaterialApiResponse>(
    '/v2/hzkj/hzkj_commodity/hzkj_pack_material/queryBindMaterialApi',
    params
  )

  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query bind material. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = Array.isArray(response.data.data?.rows)
    ? response.data.data!.rows!
    : []
  const totalCount =
    typeof response.data.data?.totalCount === 'number'
      ? (response.data.data.totalCount as number)
      : 0

  return {
    rows,
    totalCount,
  }
}

// 解绑订单产品包装请求参数
export interface UnBindOdPdPackageRequest {
  odPdPackageId: string
}

// 解绑订单产品包装响应
export interface UnBindOdPdPackageResponse {
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 解绑订单产品包装 API
export async function unBindOdPdPackage(
  params: UnBindOdPdPackageRequest
): Promise<UnBindOdPdPackageResponse> {
  const response = await apiClient.post<UnBindOdPdPackageResponse>(
    '/v2/hzkj/hzkj_customer/bindPackage/unBindOdPdPackage',
    params
  )

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to unbind order product package. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}
