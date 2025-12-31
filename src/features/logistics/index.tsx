import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getCusList } from '@/lib/api/logistics'
import { Button } from '@/components/ui/button'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
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

  // 获取分页参数
  const pageNo = (search.page as number) || 1
  const pageSize = (search.pageSize as number) || 10
  const filter = (search.filter as string) || ''

  const fetchLogistics = async () => {
    if (!auth.user?.customerId) {
      console.warn('No customerId available')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const requestParams = {
        pageSize,
        pageNo,
        customerId: auth.user.customerId,
        spuOrDestination: filter || '',
      }

      console.log('搜索请求参数:', requestParams)

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

      console.log('mappedData', mappedData)

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
    }
  }

  // 序列化过滤器参数以确保变化能被检测到
  const filterStr = String(filter || '')

  useEffect(() => {
    fetchLogistics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.customerId, pageNo, pageSize, filterStr])

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
