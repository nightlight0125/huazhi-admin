import { apiClient } from '../api-client'

// 查询账户请求参数
export interface QueryAccountRequest {
  data: {
    hzkj_member_id: string
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
    pageNo?: number
    pageSize?: number
    [key: string]: unknown
  }
  errorCode?: string
  message?: string
  status: boolean
  [key: string]: unknown
}

// 查询账户列表 API
export async function queryAccount(
  hzkj_member_id: string,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<unknown[]> {
  const requestData: QueryAccountRequest = {
    data: {
      hzkj_member_id,
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

  // 返回 rows 数组，如果没有 rows 则返回 list，如果都没有则返回空数组
  const rows = response.data.data?.rows 
  return Array.isArray(rows) ? rows : []
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

  console.log('查询角色请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryRoleResponse>(
    '/v2/hzkj/hzkj_member/hzkj_role/queryRole',
    requestData
  )

  console.log('查询角色响应:', response.data)

  // 检查响应状态
  if (!response.data.status) {
    const errorMessage =
      response.data.message || 'Failed to query roles. Please try again.'
    throw new Error(errorMessage)
  }

  // 返回 rows 数组，如果没有 rows 则返回空数组
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

  console.log('查询菜单权限请求数据:', JSON.stringify(requestData, null, 2))

  const response = await apiClient.post<QueryMenuResponse>(
    '/v2/hzkj/hzkj_member/hzkj_role/queryMenu',
    requestData
  )

  console.log('查询菜单权限响应:', response.data)

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
    roleId: number
    customerId: number
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
  data: {
    id: number
    newpassword: string
  }
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
  userId: number,
  newPassword: string
): Promise<UpdatePasswordResponse> {
  const requestData: UpdatePasswordRequest = {
    data: {
      id: userId,
      newpassword: newPassword,
    },
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


