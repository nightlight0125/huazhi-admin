import { apiClient } from '../api-client'

// 查询账户请求参数
export interface QueryAccountRequest {
  data: {
    hzkj_member_id: string
    hzkj_role_id?: string
    hzkj_queryParams?: string
    enable?: string
  }
  pageSize: number
  pageNo: number
}

// 查询账户响应
export interface QueryAccountResponse {
  data?: {
    list?: unknown[]
    rows?: unknown[]
    total?: number
    totalCount?: number
    pageNo?: number
    pageSize?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

export interface QueryAccountResult {
  rows: unknown[]
  totalCount: number
}

// 查询账户列表 API
export async function queryAccount(
  hzkj_member_id: string,
  pageNo: number = 1,
  pageSize: number = 10,
  options?: {
    hzkj_role_id?: string
    hzkj_queryParams?: string
    enable?: string
  }
): Promise<QueryAccountResult> {
  const requestData: QueryAccountRequest = {
    data: {
      hzkj_member_id,
      ...(options?.hzkj_role_id && { hzkj_role_id: options.hzkj_role_id }),
      hzkj_queryParams: options?.hzkj_queryParams || '*',
      ...(options?.enable && { enable: options.enable }),
    },
    pageSize,
    pageNo,
  }

  console.log('查询账户请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryAccountResponse>(
    '/v2/hzkj/hzkj_member/hzkj_account_record/queryAccount',
    requestData
  )

  console.log('查询账户响应:', response.data)

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to query accounts. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组和 totalCount
  const rows = response.data.data?.rows || response.data.data?.list
  const totalCount = response.data.data?.totalCount || response.data.data?.total || 0

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}

// 角色数据接口
export interface RoleItem {
  id: string
  number?: string
  name: string
  status?: string
  status_title?: string
  enable?: string
  enable_title?: string
  createtime?: string | null
  modifytime?: string
  hzkj_description?: string
  [key: string]: unknown
}

// 查询角色请求参数
export interface QueryRoleRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}

// 查询角色响应
export interface QueryRoleResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: RoleItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 查询角色列表 API
export async function queryRole(
  pageNo: number = 1,
  pageSize: number = 10
): Promise<RoleItem[]> {
  const requestData: QueryRoleRequest = {
    data: {},
    pageSize,
    pageNo,
  }

  const response = await apiClient.post<QueryRoleResponse>(
    '/v2/hzkj/hzkj_member/hzkj_role/queryRole',
    requestData
  )


  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to query roles. Please try again.'
    throw new Error(errorMessage)
  }

  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 菜单权限项接口
export interface MenuPermissionItem {
  id?: string
  menuId?: string
  menuName?: string
  url?: string
  [key: string]: unknown
}

// 查询菜单权限请求参数
export interface QueryMenuRequest {
  data: {
    roleId: string
  }
  pageSize: number
  pageNo: number
}

// 查询菜单权限响应
export interface QueryMenuResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: MenuPermissionItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 查询菜单权限 API
export async function queryMenu(
  roleId: string,
  pageNo: number = 1,
  pageSize: number = 100
): Promise<MenuPermissionItem[]> {
  const requestData: QueryMenuRequest = {
    data: {
      roleId,
    },
    pageSize,
    pageNo,
  }


  const response = await apiClient.post<QueryMenuResponse>(
    '/v2/hzkj/hzkj_member/hzkj_role/queryMenu',
    requestData
  )

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to query menu permissions. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 添加账户请求参数
export interface AddAccountRequest {
  member: {
    username: string
    email: string
    surname: string
    name: string
    phone: string
    password: string
    roleId: number | string
    customerId: number | string
  }
}

// 添加账户响应
export interface AddAccountResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 添加账户 API
export async function addAccount(
  memberData: AddAccountRequest['member']
): Promise<AddAccountResponse> {
  const requestData: AddAccountRequest = {
    member: memberData,
  }

  console.log('添加账户请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<AddAccountResponse>(
    '/v2/hzkj/hzkj_member/member/addAccount',
    requestData
  )

  console.log('添加账户响应:', response.data)

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to add account. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 重置密码请求参数
export interface UpdatePasswordRequest {
  accountId: string
  newPassword: string
}

// 重置密码响应
export interface UpdatePasswordResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 重置密码 API
export async function updatePassword(
  accountId: string | number,
  newPassword: string
): Promise<UpdatePasswordResponse> {
  const requestData: UpdatePasswordRequest = {
    accountId: String(accountId),
    newPassword: newPassword,
  }

  console.log('重置密码请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<UpdatePasswordResponse>(
    '/v2/hzkj/hzkj_member/member/updatePassword',
    requestData
  )

  console.log('重置密码响应:', response.data)

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to update password. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 获取用户 Profile Info 响应类型
export interface GetProfileInfoResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: Array<{
      hzkj_whatsapp1?: string
      hzkj_customer_first_name3?: string
      hzkj_customer_last_name3?: string
      hzkj_emailfield3?: string
      hzkj_remark1?: string
      [key: string]: unknown
    }>
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 获取用户 Profile Info API
export async function getProfileInfo(
  userId: string | number,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<GetProfileInfoResponse> {
  const response = await apiClient.get<GetProfileInfoResponse>(
    '/v2/hzkj/hzkj_member/hzkj_member_customer/getProfileInfo',
    {
      params: {
        id: userId,
        pageNo,
        pageSize,
      },
    }
  )

  console.log('获取 Profile Info 响应:', response.data)

  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to get profile info. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 更新用户 Profile 请求行
export interface UpdateProfileRow {
  id: string | number
  hzkj_customer_first_name3: string
  hzkj_customer_last_name3: string
  hzkj_emailfield3: string
  hzkj_whatsapp1?: string
  hzkj_remark1?: string
  hzkj_timezone_id?: string
  [key: string]: unknown
}

// 更新用户 Profile 请求参数
export interface UpdateProfileRequest {
  data: UpdateProfileRow[]
}

// 更新用户 Profile 响应
export interface UpdateProfileResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 更新用户 Profile API
export async function updateProfile(
  rows: UpdateProfileRow[]
): Promise<UpdateProfileResponse> {
  const requestData: UpdateProfileRequest = {
    data: rows,
  }

  console.log('更新 Profile 请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<UpdateProfileResponse>(
    '/v2/hzkj/hzkj_member/hzkj_member_customer/updateProfile',
    requestData
  )

  console.log('更新 Profile 响应:', response.data)

  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to update profile. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 查询客户用户请求参数
export interface QueryCustomerUserRequest {
  data: {
    id: string
  }
  pageSize: number
  pageNo: number
}

// 客户用户数据接口
export interface CustomerUserItem {
  hzkj_biz_user_id?: string
  hzkj_biz_user_number?: string
  hzkj_biz_user_name?: string
  hzkj_biz_user_username?: string
  hzkj_biz_user_email?: string
  hzkj_biz_user_phone?: string
  hzkj_biz_user_gender?: string
  hzkj_biz_user_gender_title?: string
  hzkj_biz_user_picturefield?: string
  [key: string]: unknown
}

// 查询客户用户响应
export interface QueryCustomerUserResponse {
  data?: {
    rows?: CustomerUserItem[]
    list?: CustomerUserItem[]
    pageNo?: number
    pageSize?: number
    totalCount?: number
    filter?: string
    lastPage?: boolean
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询客户用户 API
export async function queryCustomerUser(
  id: string,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<CustomerUserItem | null> {
  const requestData: QueryCustomerUserRequest = {
    data: {
      id,
    },
    pageSize,
    pageNo,
  }

  console.log('查询客户用户请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryCustomerUserResponse>(
    '/v2/hzkj/hzkj_member/hzkj_member_customer/queryCustomerUser',
    requestData
  )

  console.log('查询客户用户响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query customer user. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组中的第一个，如果没有 rows 则返回 list 中的第一个，如果都没有则返回 null
  const rows = response.data.data?.rows || response.data.data?.list
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as CustomerUserItem
  }

  return null
}

// 查询客户推荐列表请求参数
export interface QueryCustomerRecommendListRequest {
  customerId: string
  startDate?: string
  endDate?: string
  pageIndex: number
  pageSize: number
}

// 客户推荐列表项
export interface CustomerRecommendListItem {
  id?: string
  referee?: string
  registrationTime?: string | Date
  commissionAmount?: number
  [key: string]: unknown
}

// 查询客户推荐列表响应
export interface QueryCustomerRecommendListResponse {
  data?: {
    rows?: CustomerRecommendListItem[]
    list?: CustomerRecommendListItem[]
    pageNo?: number
    pageSize?: number
    totalCount?: number
    filter?: string
    lastPage?: boolean
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询客户推荐列表 API
export async function queryCustomerRecommendList(
  customerId: string,
  pageIndex: number = 1,
  pageSize: number = 10,
  options?: {
    startDate?: string
    endDate?: string
  }
): Promise<{ rows: CustomerRecommendListItem[]; totalCount: number }> {
  const requestData: QueryCustomerRecommendListRequest = {
    customerId,
    pageIndex,
    pageSize,
    ...(options?.startDate && { startDate: options.startDate }),
    ...(options?.endDate && { endDate: options.endDate }),
  }

  console.log('查询客户推荐列表请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryCustomerRecommendListResponse>(
    '/v2/hzkj/hzkj_customer/member/queryRecommendList',
    requestData
  )

  console.log('查询客户推荐列表响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query customer recommend list. Please try again.'
    throw new Error(errorMessage)
  }


  return {
    rows: Array.isArray(response.data.data?.items) ? response.data.data?.items : [],
    totalCount: typeof response.data.data?.total === 'number' ? response.data.data?.total : 0,
  }
}

// 客户追踪记录项
export interface CustomerTraceItem {
  id: string
  number?: string
  name?: string
  status?: string
  status_title?: string
  enable?: string
  enable_title?: string
  hzkj_email?: string
  hzkj_type?: string
  hzkj_type_title?: string
  hzkj_src_type?: string
  hzkj_src_type_title?: string
  hzkj_registration_link?: string
  hzkj_official_website?: string
  hzkj_src_channel_name?: string
  hzkj_src_channel_number?: string
  hzkj_src_channel_id?: string
  hzkj_customer_name?: string
  hzkj_customer_number?: string
  hzkj_customer_id?: string
  [key: string]: unknown
}

// 查询客户追踪请求参数
export interface QueryCustomerTraceRequest {
  data: {
    hzkj_customer_id: string
  }
  pageSize: number
  pageNo: number
  startDate?: string
  endDate?: string
}

// 查询客户追踪响应
export interface QueryCustomerTraceResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: CustomerTraceItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 查询客户追踪 API
export async function queryCustomerTrace(
  customerId: string,
  pageNo: number = 1,
  pageSize: number = 10,
  startDate?: string,
  endDate?: string
): Promise<{ rows: CustomerTraceItem[]; totalCount: number }> {
  const requestData: QueryCustomerTraceRequest = {
    data: {
      hzkj_customer_id: customerId,
    },
    pageSize,
    pageNo,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }

  console.log('查询客户追踪请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryCustomerTraceResponse>(
    '/v2/hzkj/hzkj_customer/hzkj_trace/queryCustomerTrace',
    requestData
  )

  console.log('查询客户追踪响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query customer trace. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组和总数
  const rows = response.data.data?.rows || []
  const totalCount = response.data.data?.totalCount || 0

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalCount: typeof totalCount === 'number' ? totalCount : 0,
  }
}

// 更新账户信息请求参数
export interface UpdateAccountInfoRequest {
  data: Array<{
    id: string
    name?: string
    hzkj_avatar?: string
    hzkj_username?: string
    hzkj_surname?: string
    hzkj_role_id?: string
    [key: string]: unknown
  }>
}

// 更新账户信息响应
export interface UpdateAccountInfoResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 更新账户信息 API
export async function updateAccountInfo(
  accountData: UpdateAccountInfoRequest['data'][0]
): Promise<UpdateAccountInfoResponse> {
  const requestData: UpdateAccountInfoRequest = {
    data: [accountData],
  }

  console.log('更新账户信息请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<UpdateAccountInfoResponse>(
    '/v2/hzkj/hzkj_member/hzkj_account_record/updateAccountInfo',
    requestData
  )

  console.log('更新账户信息响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to update account info. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 删除账户请求参数
export interface DeleteAccountRequest {
  customerId: string
  accountId: string
}

// 删除账户响应
export interface DeleteAccountResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 删除账户 API
export async function deleteAccount(
  customerId: string,
  accountId: string
): Promise<DeleteAccountResponse> {
  const requestData: DeleteAccountRequest = {
    customerId,
    accountId,
  }

  console.log('删除账户请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<DeleteAccountResponse>(
    '/v2/hzkj/hzkj_ordercenter/member/deleteAccount',
    requestData
  )

  console.log('删除账户响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to delete account. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 时区数据接口
export interface TimezoneItem {
  id: string
  name: string
  [key: string]: unknown
}

// 查询时区请求参数
export interface QueryTimezoneRequest {
  data: Record<string, unknown>
  pageSize: number
  pageNo: number
}

// 查询时区响应
export interface QueryTimezoneResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: TimezoneItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询时区列表 API
export async function queryAdmininteTimezone(
  pageNo: number = 1,
  pageSize: number = 100
): Promise<TimezoneItem[]> {
  const requestData: QueryTimezoneRequest = {
    data: {},
    pageSize,
    pageNo,
  }

  console.log('查询时区请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryTimezoneResponse>(
    '/v2/hzkj/base/inte_timezone/queryAdmininteTimezone',
    requestData
  )

  console.log('查询时区响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to query timezones. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 地址数据接口
export interface AddressItem {
  hzkj_customer_first_name2?: string
  hzkj_customer_last_name2?: string
  hzkj_phone_number?: string
  hzkj_emailfield?: string
  hzkj_bill_city?: string
  hzkj_bill_adress?: string
  hzkj_bill_adress2?: string
  hzkj_textfield3?: string
  hzkj_tax_id2?: string
  hzkj_synchronize_adress?: boolean
  hzkj_customer_first_name?: string
  hzkj_customer_last_name?: string
  hzkj_phone?: string
  hzkj_adress_emailfield?: string
  hzkj_city?: string
  hzkj_address2?: string
  hzkj_textfield?: string
  hzkj_tax_id1?: string
  hzkj_textfield1?: string
  // 扩展：用于下单时的国家 ID
  hzkj_country2_id?: string | number
  hzkj_country2_number?: string
  hzkj_admindivision2_number?: string
  hzkj_admindivision2_id?: string | number
  hzkj_country_number?: string
  hzkj_admindivision_number?: string
  hzkj_admindivision_id?: string | number
  [key: string]: unknown
}

// 获取地址响应
export interface GetAddressResponse {
  data?: {
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: AddressItem[]
    totalCount?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string | null
  status?: boolean
  [key: string]: unknown
}

// 获取地址 API（返回完整响应数据）
export async function getAddress(
  id: string | number,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<AddressItem | null> {
  const response = await apiClient.get<GetAddressResponse>(
    '/v2/hzkj/hzkj_member/hzkj_member_customer/getAddress',
    {
      params: {
        id: String(id),
        pageNo,
        pageSize,
      },
    }
  )
  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to get address. Please try again.'
    throw new Error(errorMessage)
  }

  const innerData = response.data.data
  const rows = innerData?.rows

  if (Array.isArray(rows) && rows.length > 0) {
    const firstRow = rows[0] as AddressItem
    return firstRow
  }

  return null
}

// 行政区划级别数据接口
export interface AdmindivisionLevelItem {
  id: string
  number?: string
  name: string
  level?: number
  country_name?: string
  country_number?: string
  country_id?: string
  [key: string]: unknown
}

// 查询行政区划级别请求参数
export interface QueryAdmindivisionLevelRequest {
  data: {
    country_id: number | string
  }
  pageSize: number
  pageNo: number
}

// 查询行政区划级别响应
export interface QueryAdmindivisionLevelResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: AdmindivisionLevelItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询行政区划级别 API
export async function queryAdmindivisionLevel(
  countryId: number | string,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<AdmindivisionLevelItem[]> {
  const requestData: QueryAdmindivisionLevelRequest = {
    data: {
      country_id: countryId,
    },
    pageSize,
    pageNo,
  }

  console.log('查询行政区划级别请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryAdmindivisionLevelResponse>(
    '/v2/hzkj/base/bd_admindivisionlevel/queryAdmindivisionlevel',
    requestData
  )

  console.log('查询行政区划级别响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query administrative division levels. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 行政区划数据接口
export interface AdmindivisionItem {
  id: string
  number?: string
  name: string
  level?: number
  country_id?: string | number
  parent_id?: string | number
  [key: string]: unknown
}

// 查询行政区划请求参数
export interface QueryAdmindivisionRequest {
  data: {
    country_id: number | string
    basedatafield_id?: number | string
    parent_id?: number | string
  }
  pageSize: number
  pageNo: number
}

// 查询行政区划响应
export interface QueryAdmindivisionResponse {
  data?: {
    filter?: string
    lastPage?: boolean
    pageNo?: number
    pageSize?: number
    rows?: AdmindivisionItem[]
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 查询行政区划 API
export async function queryAdmindivision(
  countryId: number | string,
  basedatafieldId?: number | string,
  parentId?: number | string,
  pageNo: number = 1,
  pageSize: number = 100
): Promise<AdmindivisionItem[]> {
  const requestData: QueryAdmindivisionRequest = {
    data: {
      country_id: countryId,
      ...(basedatafieldId !== undefined && { basedatafield_id: basedatafieldId }),
      ...(parentId !== undefined && { parent_id: parentId }),
    },
    pageSize,
    pageNo,
  }

  console.log('查询行政区划请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryAdmindivisionResponse>(
    '/v2/hzkj/base/bd_admindivision/queryAdmindivision',
    requestData
  )

  console.log('查询行政区划响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to query administrative divisions. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
  const rows = response.data.data?.rows
  return Array.isArray(rows) ? rows : []
}

// 更新账单地址请求参数
export interface UpdateBillAddressRequest {
  data: Array<{
    id: string | number
    hzkj_customer_first_name2?: string
    hzkj_customer_last_name2?: string
    hzkj_phone_number?: string
    hzkj_emailfield?: string
    hzkj_bill_city?: string
    hzkj_bill_adress?: string
    hzkj_bill_adress2?: string
    hzkj_textfield3?: string
    hzkj_tax_id2?: string
    hzkj_country2_id?: string | number
    hzkj_admindivision2_id?: string | number
    [key: string]: unknown
  }>
}

// 更新账单地址响应
export interface UpdateBillAddressResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 更新账单地址 API
export async function updateBillAddress(
  addressData: UpdateBillAddressRequest['data'][0]
): Promise<UpdateBillAddressResponse> {
  const requestData: UpdateBillAddressRequest = {
    data: [addressData],
  }

  console.log('更新账单地址请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<UpdateBillAddressResponse>(
    '/v2/hzkj/hzkj_member/hzkj_member_customer/updateBillAdress',
    requestData
  )

  console.log('更新账单地址响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message ||
      'Failed to update billing address. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

// 更新收货地址请求参数
export interface UpdateAddressRequest {
  data: Array<{
    id: string | number
    hzkj_customer_first_name?: string
    hzkj_customer_last_name?: string
    hzkj_phone?: string
    hzkj_adress_emailfield?: string
    hzkj_city?: string
    hzkj_textfield?: string
    hzkj_address2?: string
    hzkj_textfield1?: string
    hzkj_tax_id1?: string
    hzkj_country_id?: string | number
    hzkj_admindivision_id?: string | number
    [key: string]: unknown
  }>
}

// 更新收货地址响应
export interface UpdateAddressResponse {
  data?: unknown
  errorCode?: string
  message?: string
  status?: boolean
  [key: string]: unknown
}

// 更新收货地址 API
export async function updateAddress(
  addressData: UpdateAddressRequest['data'][0]
): Promise<UpdateAddressResponse> {
  const requestData: UpdateAddressRequest = {
    data: [addressData],
  }

  console.log('更新收货地址请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<UpdateAddressResponse>(
    '/v2/hzkj/hzkj_member/hzkj_member_customer/updateAdress',
    requestData
  )

  console.log('更新收货地址响应:', response.data)

  // 检查响应状态
  if (response.data.status === false) {
    const errorMessage =
      response.data.message || 'Failed to update address. Please try again.'
    throw new Error(errorMessage)
  }

  return response.data
}

