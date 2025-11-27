import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DollarSign, Package, CreditCard } from 'lucide-react'
import { type SampleOrder } from '../data/schema'

interface SampleOrdersStatsProps {
  orders: SampleOrder[]
}

export function SampleOrdersStats({ orders }: SampleOrdersStatsProps) {
  // 计算统计数据
  const totalOrders = orders.length

  // 计算待支付金额
  const pendingPayment = orders
    .filter((order) => order.status === 'pending' || order.status === 'pay_in_progress')
    .reduce((sum, order) => sum + order.cost.total, 0)

  // 模拟账号余额（实际项目中应该从用户数据获取）
  const accountBalance = 0.0

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card -mx-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 lg:px-6'>
      <Card className='@container/card'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5 text-green-600' />
            <CardDescription>Account balance</CardDescription>
          </div>
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
          <div className='flex items-center gap-2'>
            <Package className='h-5 w-5 text-blue-600' />
            <CardDescription>Pending Orders</CardDescription>
          </div>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {totalOrders.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5 text-yellow-600' />
            <CardDescription>Pending Payment</CardDescription>
          </div>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            ${pendingPayment.toFixed(2)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5 text-red-600' />
            <CardDescription>Currency</CardDescription>
          </div>
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

