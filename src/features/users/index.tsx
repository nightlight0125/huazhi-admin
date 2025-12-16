import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { queryAccount } from '@/lib/api/users'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
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
    lastName: String(data.lastName || ''),
    username: String(data.username || data.account || ''),
    email: String(data.hzkj_email || data.email || ''),
    phoneNumber: String(
      data.hzkj_phone || data.phone || data.phoneNumber || ''
    ),
    status: data.enable === '1' ? 'active' : 'inactive',
    role: String(data.hzkj_role_name || ''),
    createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt as string) : new Date(),
  }
}

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 从URL参数或auth store获取hzkj_member_id，如果没有则使用默认值
  // TODO: 从登录响应中获取实际的hzkj_member_id
  const hzkj_member_id = '2333521702035667968' // 临时使用测试值

  // 获取分页参数
  const pageNo = (search.page as number) || 1
  const pageSize = (search.pageSize as number) || 10

  useEffect(() => {
    async function fetchUsers() {
      if (!auth.accessToken) {
        console.warn('No access token available')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const rows = await queryAccount(hzkj_member_id, pageNo, pageSize)

        if (Array.isArray(rows) && rows.length > 0) {
          const mappedUsers = rows.map(mapApiDataToUser)
          setUsers(mappedUsers)
        } else {
          setUsers([])
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load users. Please try again.'
        )
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [auth.accessToken, hzkj_member_id, pageNo, pageSize])

  return (
    <UsersProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-2 flex flex-wrap items-center justify-end space-y-2'>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading users...</p>
            </div>
          ) : (
            <UsersTable data={users} search={search} navigate={navigate} />
          )}
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
