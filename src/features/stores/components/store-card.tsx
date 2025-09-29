import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type Store } from '../data/schema'
import { platformConfig } from '../data/schema'
import { StoreIcon } from './store-icons'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ExternalLink, MoreHorizontal, RefreshCw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface StoreCardProps {
  store: Store
  onConnect?: (store: Store) => void
  onDisconnect?: (store: Store) => void
  onSync?: (store: Store) => void
  onManage?: (store: Store) => void
}

export function StoreCard({ 
  store, 
  onConnect, 
  onDisconnect, 
  onSync, 
  onManage 
}: StoreCardProps) {
  const platform = platformConfig[store.platform]
  const isConnected = store.status === 'active'
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '已连接'
      case 'inactive':
        return '未连接'
      case 'suspended':
        return '已暂停'
      case 'pending':
        return '待审核'
      default:
        return '未知'
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${platform.color} flex h-12 w-12 items-center justify-center rounded-lg`}>
              <StoreIcon platform={store.platform} className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{store.name}</CardTitle>
              <CardDescription className="text-sm">
                {platform.name}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(store.status)}>
              {getStatusText(store.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isConnected ? (
                  <>
                    <DropdownMenuItem onClick={() => onSync?.(store)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      同步数据
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManage?.(store)}>
                      管理店铺
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDisconnect?.(store)}
                      className="text-red-600"
                    >
                      断开连接
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => onConnect?.(store)}>
                    连接店铺
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {store.description}
        </p>
        
        {isConnected && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {store.productCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">商品数量</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {store.orderCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">订单数量</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                ${store.revenue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">总收入</div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div>
            {store.connectedAt && (
              <div>
                连接时间: {format(store.connectedAt, 'yyyy-MM-dd', { locale: zhCN })}
              </div>
            )}
            {store.lastSyncAt && (
              <div>
                最后同步: {format(store.lastSyncAt, 'MM-dd HH:mm', { locale: zhCN })}
              </div>
            )}
          </div>
          {store.url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={store.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
