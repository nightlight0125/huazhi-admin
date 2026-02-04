import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { queryAfterSaleOrders } from '@/lib/api/orders'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteApi } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { SupportTicketsTable } from './components/support-tickets-table'

const route = getRouteApi('/_authenticated/support-tickets/')


export function SupportTickets() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [data, setData] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined)
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined)
  const lastRequestKeyRef = useRef<string>('')
  const isRequestingRef = useRef<boolean>(false)

  // 获取分页参数和搜索关键词
  const pageNo = (search.page as number) || 1
  const pageSize = (search.pageSize as number) || 10
  const searchKeyword = (search.filter as string) || ''

  const fetchAfterSaleOrders = useCallback(
    async (forceRefresh?: boolean) => {
      if (!auth.user?.customerId) {
        setIsLoading(false)
        return
      }

      // 格式化日期范围
      const formattedDateRange =
        dateRange?.from && dateRange?.to
          ? {
              start_date: format(dateRange.from, 'yyyy-MM-dd 00:00:00'),
              end_date: format(dateRange.to, 'yyyy-MM-dd 23:59:59'),
            }
          : undefined

      // 构建请求 key，包含所有筛选条件（包括搜索关键词）
      const requestKey = `${auth.user.customerId}-${pageNo}-${pageSize}-${selectedStore || '*'}-${selectedType || '*'}-${searchKeyword || '*'}-${formattedDateRange?.start_date || ''}-${formattedDateRange?.end_date || ''}`

      // 如果请求参数没有变化且不是强制刷新，跳过请求
      if (!forceRefresh && lastRequestKeyRef.current === requestKey) {
        return
      }

      // 如果正在请求中，跳过（避免重复请求）
      if (isRequestingRef.current) {
        return
      }

      // 更新请求标识符和状态
      lastRequestKeyRef.current = requestKey
      isRequestingRef.current = true
      setIsLoading(true)

      try {
        const requestParams = {
          data: {
            hzkj_payingcustomer_id: auth.user.customerId,
            hzkj_shop_id: selectedStore || '*',
            hzkj_sales_type: selectedType || '*',
            ...(formattedDateRange && {
              start_date: formattedDateRange.start_date,
              end_date: formattedDateRange.end_date,
            }),
            str: searchKeyword || '',
          },
          pageSize,
          pageNo,
        }

        const result = await queryAfterSaleOrders(requestParams)

        console.log('result', result)


        setData(result?.rows || [])
        setTotalCount(result.totalCount || 0)
      } catch (error) {
        console.error('Failed to fetch after sale orders:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load after sale orders. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
        isRequestingRef.current = false
      }
    },
    [
      auth.user?.customerId,
      pageNo,
      pageSize,
      dateRange,
      selectedStore,
      selectedType,
      searchKeyword,
    ]
  )

  useEffect(() => {
    fetchAfterSaleOrders()
  }, [fetchAfterSaleOrders])

  // 当筛选条件变化时，重置到第一页并重新获取数据
  useEffect(() => {
    if (dateRange || selectedStore || selectedType || searchKeyword) {
      // 重置请求 key，强制重新获取
      lastRequestKeyRef.current = ''
      fetchAfterSaleOrders(true)
    }
  }, [dateRange, selectedStore, selectedType, searchKeyword, fetchAfterSaleOrders])

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <SupportTicketsTable
            data={data}
            search={search}
            navigate={navigate}
            totalCount={totalCount}
            isLoading={isLoading}
            onRefresh={fetchAfterSaleOrders}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            selectedStore={selectedStore}
            onStoreChange={setSelectedStore}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>
      </Main>
    </>
  )
}
