import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getUserShop } from '@/lib/api/shop'
import { Card, CardContent } from '@/components/ui/card'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TasksProvider } from '../tasks/components/tasks-provider'
import { ConnectStoreDialog } from './components/connect-store-dialog'
import { StoresTable } from './components/stores-table'
import { type Store } from './data/schema'

const platformButtons = [
  {
    name: 'Shopify',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/shopify_1764749551392.png',
    color: 'text-green-600',
  },
  {
    name: 'WooCommerce',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/woocommerce_1764749594778.png',
    color: 'text-purple-600',
  },
  {
    name: 'eBay',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/ebay-copy_1764749627017.png',
    color: 'text-blue-600',
  },
  {
    name: 'Etsy',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/etsy_1764749608025.png',
    color: 'text-orange-600',
  },
  {
    name: 'TikTok',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/tiktoklogo_tiktok_1764749645734.png',
    color: 'text-orange-600',
  },
  {
    name: 'Amazon',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/platform-amazon_1764749673988.png',
    color: 'text-orange-600',
  },
]

export function StoreManagement() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 从 auth store 获取用户信息
  const user = useAuthStore((state) => state.auth.user)
  console.log('======user', user)

  // 获取用户店铺列表
  useEffect(() => {
    async function fetchUserShops() {
      if (!user?.id) {
        console.warn('No user ID available')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await getUserShop(user.id)

        // 根据实际 API 响应结构处理数据
        const responseData = response.data as any
        const shopsData = responseData?.data || []
        console.log('shopsData=====121212', shopsData)

        // 映射数据到 Store schema
        const mappedStores: Store[] = (
          Array.isArray(shopsData) ? shopsData : []
        ).map((item: any) => ({
          name: item.name || '',
          id: item.id || String(item.id || ''),
          bindtime: item.bindtime || undefined,
          createtime: item.createtime || undefined,
          enable: item.enable !== undefined ? item.enable : undefined,
          platform: item.platform || undefined,
        }))

        setStores(mappedStores)
      } catch (error) {
        console.error('Failed to fetch user shops:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load shops. Please try again.'
        )
        setStores([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserShops()
  }, [user?.accountNo])

  const handlePlatformClick = (platformName: string) => {
    setSelectedPlatform(platformName)
    setConnectDialogOpen(true)
  }

  const handleNext = () => {
    if (selectedPlatform) {
      console.log('Connect to platform:', selectedPlatform)
      // TODO: 实现实际的连接逻辑
    }
  }

  return (
    <TasksProvider>
      <Header>
        <HeaderActions />
      </Header>

      <Main fluid>
        <Card className='mb-6'>
          <CardContent className=''>
            <div className='text-sm font-medium'>Add Store</div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3 rounded-lg px-4 py-3'>
                {platformButtons.map((platform) => (
                  <button
                    key={platform.name}
                    type='button'
                    className='border-border bg-background hover:bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors'
                    onClick={() => handlePlatformClick(platform.name)}
                  >
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className='h-4 w-4 object-contain'
                    />
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading shops...</p>
            </div>
          ) : (
            <StoresTable data={stores} />
          )}
        </div>

        {selectedPlatform && (
          <ConnectStoreDialog
            open={connectDialogOpen}
            onOpenChange={(open) => {
              setConnectDialogOpen(open)
              if (!open) {
                setSelectedPlatform(null)
              }
            }}
            platformName={selectedPlatform}
            onNext={handleNext}
          />
        )}
      </Main>
    </TasksProvider>
  )
}
