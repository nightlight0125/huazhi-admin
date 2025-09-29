import { TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type Order } from '../data/schema'

interface OrdersStatsProps {
  orders: Order[]
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  // 计算统计数据
  const totalOrders = orders.length
  
  // 按状态统计订单
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const unpaidOrders = statusCounts['pending_payment'] || 0
  const pendingPaymentOrders = statusCounts['pending_quote'] || 0
  
  // 模拟账号余额（实际项目中应该从用户数据获取）
  const accountBalance = 125000.50
  
  // 模拟趋势数据（实际项目中应该从历史数据计算）
  const balanceTrend = 8.5 // 模拟8.5%增长
  const ordersTrend = 12.3 // 模拟12.3%增长
  const unpaidTrend = -15.2 // 模拟15.2%下降
  const pendingTrend = 5.7 // 模拟5.7%增长

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 -mx-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>账号余额</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{balanceTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            余额持续增长 <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            可用于订单支付
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>总订单数</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalOrders.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{ordersTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            订单数量增长 <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            所有状态订单总数
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>未付款订单数</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {unpaidOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {unpaidTrend > 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {unpaidTrend > 0 ? '+' : ''}{unpaidTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {unpaidTrend > 0 ? '未付款订单增加' : '未付款订单减少'} 
            {unpaidTrend > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            需要及时处理
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>待付款</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingPaymentOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{pendingTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            待付款订单增加 <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            等待客户付款
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
