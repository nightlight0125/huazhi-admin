import { type ChangeEvent, useState } from 'react'
import { Search, CheckCircle, XCircle, RefreshCw, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { stores } from './data/stores'
import { type Store } from './data/schema'
import { StoreIcon } from './components/store-icons'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'


// 平台选项
const platformOptions = [
  { value: 'shopify', label: 'Shopify', icon: '🛍️' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
]

export function Stores() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStores = stores
    .filter((store) => store.status === 'active') // 只显示已连接的店铺
    .filter((store) => store.platform === 'shopify' || store.platform === 'tiktok') // 只显示Shopify和TikTok
    .filter((store) => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.platform.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }


  const handleReconnect = (store: Store) => {
    showSubmittedData(store, '正在重新连接店铺:')
  }

  const handleBrand = (store: Store) => {
    showSubmittedData(store, '正在打开品牌管理:')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive':
      case 'suspended':
      case 'pending':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
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
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div className="mb-6">
          <h1 className='text-2xl font-bold tracking-tight'>
            店铺管理
          </h1>
          <p className='text-muted-foreground'>
            管理您的电商平台店铺连接和同步
          </p>
        </div>

        {/* 连接按钮和平台选择 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button className="bg-primary text-primary-foreground">
                  连接》
                </Button>
                <div className="flex items-center gap-2">
                  {platformOptions.map((platform) => (
                    <div
                      key={platform.value}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索店铺"
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <Button variant="outline">
                  查询
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 店铺列表表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">店铺</TableHead>
                <TableHead className="w-[150px]">类型</TableHead>
                <TableHead className="w-[200px]">日期</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[200px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <StoreIcon platform={store.platform} className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {store.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {store.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {store.connectedAt ? (
                        <div>
                          <div className="font-medium">
                            {format(store.connectedAt, 'yyyy/M/d HH:mm:ss', { locale: zhCN })}
                          </div>
                          <div className="text-muted-foreground">
                            连接时间
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">
                            {format(store.createdAt, 'yyyy/M/d HH:mm:ss', { locale: zhCN })}
                          </div>
                          <div className="text-muted-foreground">
                            创建时间
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(store.status)}
                      <span className="text-sm">{getStatusText(store.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReconnect(store)}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        ReConnect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBrand(store)}
                        className="w-full"
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        品牌
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Main>
    </>
  )
}
