import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type Store } from '../data/schema'
import { platformConfig } from '../data/schema'
import { StoreIcon } from './store-icons'

interface StoresStatsProps {
  stores: Store[]
}

export function StoresStats({ stores }: StoresStatsProps) {
  const totalStores = stores.length
  const connectedStores = stores.filter(store => store.status === 'active').length
  const totalProducts = stores.reduce((sum, store) => sum + store.productCount, 0)
  const totalOrders = stores.reduce((sum, store) => sum + store.orderCount, 0)
  const totalRevenue = stores.reduce((sum, store) => sum + store.revenue, 0)

  const platformStats = stores.reduce((acc, store) => {
    acc[store.platform] = (acc[store.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* 总店铺数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总店铺数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStores}</div>
          <p className="text-xs text-muted-foreground">
            已连接 {connectedStores} 个
          </p>
        </CardContent>
      </Card>

      {/* 总商品数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总商品数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            所有平台商品总数
          </p>
        </CardContent>
      </Card>

      {/* 总订单数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总订单数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            所有平台订单总数
          </p>
        </CardContent>
      </Card>

      {/* 总收入 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总收入</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">¥{totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            所有平台总收入
          </p>
        </CardContent>
      </Card>

      {/* 平台分布 */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">平台分布</CardTitle>
          <CardDescription>各平台店铺数量统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(platformConfig).map(([platform, config]) => {
              const count = platformStats[platform] || 0
              return (
                <div key={platform} className="flex items-center space-x-2">
                  <div className={`${config.color} flex h-8 w-8 items-center justify-center rounded-lg`}>
                    <StoreIcon platform={platform as any} className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{config.name}</div>
                    <div className="text-xs text-muted-foreground">
                      <Badge variant="secondary">{count} 个店铺</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
