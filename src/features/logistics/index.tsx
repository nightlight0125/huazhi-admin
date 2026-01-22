import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { getCusList } from '@/lib/api/logistics'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { LogisticsTable } from './components/logistics-table'
import { ShippingPlanDialog } from './components/shipping-plan-dialog'
import { type Logistics } from './data/schema'

const route = getRouteApi('/_authenticated/logistics/')

export function Logistics() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [shippingPlanOpen, setShippingPlanOpen] = useState(false)
  const [data, setData] = useState<Logistics[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const lastRequestKeyRef = useRef<string>('')
  const isRequestingRef = useRef<boolean>(false)

  // 获取分页参数
  const pageNo = (search.page as number) || 1
  const pageSize = (search.pageSize as number) || 10
  const filter = (search.filter as string) || ''

  const fetchLogistics = useCallback(async (forceRefresh?: boolean) => {
    if (!auth.user?.customerId) {
      setIsLoading(false)
      return
    }

    const requestKey = `${auth.user.customerId}-${pageNo}-${pageSize}-${filter}`

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
        pageSize,
        pageNo,
        customerId: auth.user.customerId,
        spuOrDestination: filter || '',
      }

      const result = await getCusList(requestParams)

      // 映射后端数据到前端格式
      const mappedData = result.rows.map((item) => {
        return {
          id: item.id || '',
          sku: item.spuNumber || '',
          variant: String((item as any).variant || ''),
          qty: 0,
          shippingMethod: item.logsNumber || '',
          shippingFrom: '',
          shippingTo: item.stateName || '',
          // preserve entryId from backend row so edit/delete can use it
          entryId: String(
            (item as any).entryId ??
              (item as any).entry_id ??
              (item as any).data?.entryId ??
              (item as any).data?.entry_id ??
              (item as any).entryIdStr ??
              (item as any).entryid ??
              ''
          ),
          shippingTime: item.timeName || '',
          shippingPrice: 0,
          productImage: undefined,
          pic: String((item as any).pic || '').trim() || undefined,
        }
      })

      setData(mappedData)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Failed to fetch logistics:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to load logistics data. Please try again.'
      )
      setData([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
      isRequestingRef.current = false
    }
  }, [auth.user?.customerId, pageNo, pageSize, filter])

  useEffect(() => {
    fetchLogistics()
  }, [fetchLogistics])

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 space-y-4 overflow-auto px-4 py-1'>
          <div className='flex justify-end'>
            <Button
              size='sm'
              className='bg-orange-500 text-white hover:bg-orange-600'
              onClick={() => setShippingPlanOpen(true)}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Shipping Plan
            </Button>
          </div>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading logistics...</p>
            </div>
          ) : (
            <LogisticsTable
              data={data}
              search={search}
              navigate={navigate}
              totalCount={totalCount}
              onRefresh={fetchLogistics}
            />
          )}
        </div>
      </Main>

      <ShippingPlanDialog
        open={shippingPlanOpen}
        onOpenChange={setShippingPlanOpen}
        onSuccess={() => {
          // 提交成功后，触发列表刷新
          fetchLogistics()
        }}
      />
    </>
  )
}
