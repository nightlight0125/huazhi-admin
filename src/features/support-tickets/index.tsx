import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { queryAfterSaleOrders, type ApiAfterSaleOrderItem } from '@/lib/api/orders'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteApi } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { SupportTicketsTable } from './components/support-tickets-table'
import { type SupportTicket } from './data/schema'

const route = getRouteApi('/_authenticated/support-tickets/')

// 将 API 售后订单项转换为 SupportTicket 类型
function transformApiAfterSaleOrderToSupportTicket(
  apiOrder: ApiAfterSaleOrderItem
): SupportTicket {
  return {
    id: apiOrder.id || '',
    supportTicketNo: apiOrder.supportTicketNo || '',
    hzOrderNo: apiOrder.hzOrderNo || '',
    hzSku: apiOrder.hzSku || '',
    variant: apiOrder.variant || '',
    qty: typeof apiOrder.qty === 'number' ? apiOrder.qty : 0,
    totalPrice: typeof apiOrder.totalPrice === 'number' ? apiOrder.totalPrice : 0,
    productImage: apiOrder.productImage,
    returnQty: typeof apiOrder.returnQty === 'number' ? apiOrder.returnQty : 0,
    storeName: apiOrder.storeName || '',
    type: (apiOrder.type as 'Product return' | 'Other') || 'Other',
    status: (apiOrder.status as Exclude<SupportTicket['status'], 'all'>) || 'processing',
    createTime: apiOrder.createTime || '',
    updateTime: apiOrder.updateTime || '',
    remarks: apiOrder.remarks || '',
    reason: apiOrder.reason || '',
  }
}

export function SupportTickets() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [data, setData] = useState<SupportTicket[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const lastRequestKeyRef = useRef<string>('')
  const isRequestingRef = useRef<boolean>(false)

  // 获取分页参数
  const pageNo = (search.page as number) || 1
  const pageSize = (search.pageSize as number) || 10

  const fetchAfterSaleOrders = useCallback(async (forceRefresh?: boolean) => {
    if (!auth.user?.customerId) {
      setIsLoading(false)
      return
    }

    const requestKey = `${auth.user.customerId}-${pageNo}-${pageSize}`

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
        },
        pageSize,
        pageNo,
      }

      const result = await queryAfterSaleOrders(requestParams)

      // 映射后端数据到前端格式
      const mappedData = result.rows.map(transformApiAfterSaleOrderToSupportTicket)

      setData(mappedData)
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
  }, [auth.user?.customerId, pageNo, pageSize])

  useEffect(() => {
    fetchAfterSaleOrders()
  }, [fetchAfterSaleOrders])

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading support tickets...</p>
            </div>
          ) : (
            <SupportTicketsTable
              data={data}
              search={search}
              navigate={navigate}
              totalCount={totalCount}
              onRefresh={fetchAfterSaleOrders}
            />
          )}
        </div>
      </Main>
    </>
  )
}
