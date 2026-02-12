import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { queryAccount } from '@/lib/api/users'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteApi } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/users/')

// 将API响应数据映射到User类型
function mapApiDataToUser(apiData: unknown): User {
  const data = apiData as Record<string, unknown>
  return {
    id: String(data.id || data.hzkj_account_record_id || ''),
    firstName: String(data.firstName || data.name || ''),
    lastName: String(data.hzkj_surname || data.lastName || data.surname || ''),
    username: String(data.hzkj_username || data.username || data.account || ''),
    email: String(data.hzkj_email || data.email || ''),
    phoneNumber: String(
      data.hzkj_phone || data.phone || data.phoneNumber || ''
    ),
    status: (data.enable === '1' ? 'active' : 'inactive') as
      | 'active'
      | 'inactive',
    role: String(data.hzkj_role_name || data.role || ''),
    roleId: String(data.hzkj_role_id || data.roleId || ''),
    surname: String(data.hzkj_surname || data.surname || ''),
    createdAt: data.createdAt
      ? new Date(data.createdAt as string)
      : data.createtime
        ? new Date(data.createtime as string)
        : new Date(),
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt as string)
      : data.modifytime
        ? new Date(data.modifytime as string)
        : new Date(),
  }
}

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const lastRequestKeyRef = useRef<string>('')
  const isRequestingRef = useRef<boolean>(false)

  const hzkj_member_id = '2333521702035667968'

  // 获取分页参数
  const pageNo = (search.page as number) || 1
  const pageSize = (search.pageSize as number) || 10

  const fetchUsers = useCallback(async (filters?: {
    role?: string[]
    status?: string[]
    username?: string
  }, forceRefresh?: boolean) => {
    let username = ''
    if (filters?.username !== undefined) {
      username = filters.username || ''
    } else {
      username = (search.username as string) || ''
    }
    
    const roleFilter = filters?.role ?? (search.role as string[]) ?? []
    const statusFilter = filters?.status ?? (search.status as string[]) ?? []
    const hzkj_role_id = roleFilter.length > 0 ? roleFilter[0] : undefined
    
    const trimmedUsername = username.trim()
    const hzkj_queryParams = trimmedUsername || '*'
    
    let enable: string | undefined = undefined
    if (statusFilter.length > 0) {
      const status = statusFilter[0]
      enable =
        status === 'active' ? '1' : status === 'inactive' ? '0' : undefined
    }

    const requestKey = `${hzkj_member_id}-${pageNo}-${pageSize}-${hzkj_role_id || ''}-${hzkj_queryParams}-${enable || ''}`

    if (!forceRefresh && lastRequestKeyRef.current === requestKey) {
      console.log('Request parameters unchanged, skipping request')
      return
    }

    if (isRequestingRef.current) {
      console.log('Request already in progress, skipping')
      return
    }

    lastRequestKeyRef.current = requestKey
    isRequestingRef.current = true

    setIsLoading(true)
    try {
      const result = await queryAccount(hzkj_member_id, pageNo, pageSize, {
        hzkj_role_id,
        hzkj_queryParams,
        enable,
      })
      if (Array.isArray(result.rows) && result.rows.length > 0) {
        const mappedUsers = result.rows.map(mapApiDataToUser)
        setUsers(mappedUsers)
      } else {
        setUsers([])
      }
      setTotalCount(result.totalCount)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to load users. Please try again.'
      )
      setUsers([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
      isRequestingRef.current = false
    }
  }, [auth.accessToken, hzkj_member_id, pageNo, pageSize, search.username, search.role, search.status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <UsersProvider onRefresh={fetchUsers}>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-2 flex flex-wrap items-center justify-end space-y-2'>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable
            data={users}
            search={search}
            navigate={navigate}
            totalCount={totalCount}
            isLoading={isLoading}
            onFiltersChange={fetchUsers}
          />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
