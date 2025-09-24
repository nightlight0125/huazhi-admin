import { Wallet, TrendingUp, FileText, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type WalletStats } from '../data/schema'

interface WalletStatsProps {
  stats: WalletStats
}

export function WalletStats({ stats }: WalletStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount)
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 -mx-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* 账户余额 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>账户余额</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
            {formatCurrency(stats.accountBalance)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Wallet className="w-4 h-4 mr-1" />
              可用
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            当前可用余额 <Wallet className="size-4" />
          </div>
          <div className="text-muted-foreground">
            实时更新的账户余额
          </div>
        </CardFooter>
      </Card>

      {/* 总充值金额 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>总充值金额</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.totalRecharge)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="w-4 h-4 mr-1" />
              累计
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            累计充值总额 <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            历史所有充值记录总和
          </div>
        </CardFooter>
      </Card>

      {/* 总发票金额 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>总发票金额</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.totalInvoice)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <FileText className="w-4 h-4 mr-1" />
              发票
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            累计发票总额 <FileText className="size-4" />
          </div>
          <div className="text-muted-foreground">
            已开具发票的总金额
          </div>
        </CardFooter>
      </Card>

      {/* 待处理金额 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>待处理金额</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-600">
            {formatCurrency(stats.pendingAmount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Clock className="w-4 h-4 mr-1" />
              待处理
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            待处理交易金额 <Clock className="size-4" />
          </div>
          <div className="text-muted-foreground">
            正在处理中的交易金额
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
