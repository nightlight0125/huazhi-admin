import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type Order } from '../data/schema'

interface OrdersStatsProps {
  orders: Order[]
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  // 计算统计数据
  const totalOrders = orders.length

  // 按状态统计订单
  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const unpaidOrders = statusCounts['pending_payment'] || 0
  const pendingPaymentOrders = statusCounts['pending_quote'] || 0

  // 模拟账号余额（实际项目中应该从用户数据获取）
  const accountBalance = 125000.5

  // 模拟趋势数据（实际项目中应该从历史数据计算）
  const balanceTrend = 8.5 // 模拟8.5%增长
  const ordersTrend = 12.3 // 模拟12.3%增长
  const unpaidTrend = -15.2 // 模拟15.2%下降
  const pendingTrend = 5.7 // 模拟5.7%增长

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card -mx-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 lg:px-6'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Account balance</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            $
            {accountBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Pending Orders</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {totalOrders.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Pending Payment</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {unpaidOrders}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <div className='space-y-2'>
            <CardTitle className='text-2xl font-semibold text-blue-600 tabular-nums @[250px]/card:text-3xl'>
              $ 0.00
            </CardTitle>
            <div className='border-border border-t'></div>
            <CardTitle className='text-2xl font-semibold text-red-600 tabular-nums @[250px]/card:text-3xl'>
              € 0.00
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
