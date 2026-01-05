import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { orderStatistics } from '@/lib/api/orders'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface OrdersStatsProps {
  orders?: unknown[] // 保留 orders prop 以保持兼容性，但不再使用
}

export function OrdersStats({ orders: _orders }: OrdersStatsProps) {
  const { auth } = useAuthStore()
  const [stats, setStats] = useState<{
    totalAmount: number
    awaitPayCount: number
    awaitPayAmount: number
  }>({
    totalAmount: 0,
    awaitPayCount: 0,
    awaitPayAmount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const customerId = auth.user?.customerId
      if (!customerId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await orderStatistics({
          customerId: String(customerId),
          type: 'hzkj_orders_BT',
        })

        setStats({
          totalAmount:
            typeof data?.totalAmount === 'number' ? data.totalAmount : 0,
          awaitPayCount:
            typeof data?.awaitPayCount === 'number' ? data.awaitPayCount : 0,
          awaitPayAmount:
            typeof data?.awaitPayAmount === 'number' ? data.awaitPayAmount : 0,
        })
      } catch (error) {
        console.error('Failed to fetch order statistics:', error)
        // 保持默认值
      } finally {
        setIsLoading(false)
      }
    }

    void fetchStats()
  }, [auth.user?.customerId])

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card -mx-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 lg:px-6'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Account balance</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {isLoading ? (
              <span className='text-muted-foreground'>Loading...</span>
            ) : (
              <>
                $
                {stats.totalAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Awaiting Orders</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {isLoading ? (
              <span className='text-muted-foreground'>Loading...</span>
            ) : (
              stats.awaitPayCount.toLocaleString()
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Awaiting Payment</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {isLoading ? (
              <span className='text-muted-foreground'>Loading...</span>
            ) : (
              <>
                $
                {stats.awaitPayAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </>
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
