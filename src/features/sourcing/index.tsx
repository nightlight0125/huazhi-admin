import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { queryList } from '@/lib/api/sourcing'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SourcingTable } from './components/sourcing-table'
import type { Sourcing } from './data/schema'

const route = getRouteApi('/_authenticated/sourcing/')

export function Sourcing() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [data, setData] = useState<Sourcing[]>([])
  const [_isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // 获取分页状态和过滤状态（从 URL）
  const { pagination, columnFilters, globalFilter } = useTableUrlState({
    search,
    navigate: navigate as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  // 获取状态过滤值
  const statusFilter = columnFilters.find((f) => f.id === 'status')
  const statusValues = Array.isArray(statusFilter?.value)
    ? (statusFilter.value as string[])
    : []

  const getAcceptStatus = (statuses: string[]): string => {
    if (statuses.length === 0) return ''
    return statuses[0] || ''
  }

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.customerId

      if (!customerId) {
        setIsLoading(false)
        setData([])
        setTotalCount(0)
        return
      }

      const pageNo = pagination.pageIndex + 1
      const pageSize = pagination.pageSize

      setIsLoading(true)
      try {
        const result = await queryList({
          data: {
            hzkj_customer_id: String(customerId),
            hzkj_accept_status: getAcceptStatus(statusValues),
          },
          pageSize,
          pageNo,
        })

        // 映射 API 数据到 Sourcing 类型
        const mappedData: Sourcing[] = result.rows.map((item: any) => {
          // 映射状态：hzkj_accept_status 直接使用 '0' 或 '1'
          // '0' = accepted, '1' = not accepted
          const status = item.hzkj_accept_status || '0'

          // 从 entryentity 中获取 SPU 信息
          const entryEntity =
            Array.isArray(item.entryentity) && item.entryentity.length > 0
              ? item.entryentity[0]
              : null

          const spuName = entryEntity?.hzkj_spu_name || ''
          const price = item.hzkj_amount
            ? typeof item.hzkj_amount === 'string'
              ? parseFloat(item.hzkj_amount) || 0
              : Number(item.hzkj_amount) || 0
            : undefined

          // 使用 billno 或生成 sourcingId
          const sourcingId =
            item.billno || `SRC${String(item.id || '').padStart(8, '0')}`

          return {
            id: String(item.id || ''),
            sourcingId,
            url: item.hzkj_url || '',
            images: item.hzkj_picturefield
              ? [item.hzkj_picturefield]
              : undefined,
            productName: item.hzkj_goodname || '',
            status,
            result: undefined,
            remark: item.hzkj_textfield || undefined,
            productId: entryEntity?.hzkj_spu_id
              ? String(entryEntity.hzkj_spu_id)
              : undefined,
            createdTime: item.createtime
              ? new Date(item.createtime)
              : new Date(),
            resultTime: undefined,
            spuName,
            price,
            entryentity: item.entryentity, // 保存原始 entryentity 数据
          }
        })

        setData(mappedData)
        setTotalCount(result.totalCount)
      } catch (error) {
        console.error('Failed to fetch sourcing list:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load sourcing list. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [
    auth.user?.customerId,
    refreshKey,
    pagination.pageIndex,
    pagination.pageSize,
    statusValues.join(','),
    globalFilter,
  ])

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <SourcingTable
            data={data}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
            totalCount={totalCount}
          />
        </div>
      </Main>
    </>
  )
}
