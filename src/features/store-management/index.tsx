import { useCallback, useEffect, useRef, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getUserShopList, shopifyCallback } from '@/lib/api/shop'
import { Card, CardContent } from '@/components/ui/card'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TasksProvider } from '../tasks/components/tasks-provider'
import { BindShopDialog } from './components/bind-shop-dialog'
import { ConnectStoreDialog } from './components/connect-store-dialog'
import { StoresTable } from './components/stores-table'
import { type Store } from './data/schema'

const route = getRouteApi('/_authenticated/store-management')

// 模块级去重（仅 100ms 内同 key 去重），防止 StrictMode 双挂载导致两次请求
let lastStoreManagementFetchKey = ''
let lastStoreManagementFetchTime = 0

const platformButtons = [
  {
    name: 'Shopify',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/shopify_1764749551392.png',
    color: 'text-green-600',
  },
  {
    name: 'Offline Store',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20260319/offline-store_1773887159036.png',
    color: 'text-orange-600',
  },
]

export function StoreManagement() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [bindShopDialogOpen, setBindShopDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [isCallbackProcessing, setIsCallbackProcessing] = useState(false)

  // 从 auth store 获取用户信息
  const user = useAuthStore((state) => state.auth.user)

  // 从 URL 获取分页参数
  const search = route.useSearch()
  const pageNo = search.page ? Number(search.page) - 1 : 0
  const pageSize = search.pageSize ? Number(search.pageSize) : 10
  const queryParam = search.filter || ''

  // 是否已成功加载过（用于区分首次加载 vs 分页/搜索变化）
  const hasLoadedOnceRef = useRef(false)

  // 获取用户店铺列表
  const fetchUserShops = useCallback(
    async (isSearch = false) => {
      if (isSearch) {
        setIsSearching(true)
      } else {
        setIsInitialLoading(true)
      }
      try {
        const response = await getUserShopList({
          hzkjAccountId: user?.id || '',
          queryParam,
          pageNo,
          pageSize,
        })

        const mappedStores: Store[] = (
          Array.isArray(response.list) ? response.list : []
        ).map((item: any) => ({
          name: item.name || '',
          id: item.id || String(item.id || ''),
          bindtime: item.bindtime || undefined,
          createtime: item.createtime || undefined,
          enable: item.enable !== undefined ? item.enable : undefined,
          platform: item.platform || undefined,
        }))

        setStores(mappedStores)
        setTotalCount(response.total || 0)
        hasLoadedOnceRef.current = true
      } catch (error) {
        console.error('Failed to fetch user shops:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load shops. Please try again.'
        )
        setStores([])
        setTotalCount(0)
      } finally {
        if (isSearch) {
          setIsSearching(false)
        } else {
          setIsInitialLoading(false)
        }
      }
    },
    [user?.id, pageNo, pageSize, queryParam]
  )

  // 用户ID、分页、搜索变化时加载（100ms 内同 key 去重，避免 StrictMode 双挂载导致两次请求）
  useEffect(() => {
    if (!user?.id) return
    const fetchKey = `${user.id}-${pageNo}-${pageSize}-${queryParam}`
    const now = Date.now()
    if (
      lastStoreManagementFetchKey === fetchKey &&
      now - lastStoreManagementFetchTime < 100
    )
      return
    lastStoreManagementFetchKey = fetchKey
    lastStoreManagementFetchTime = now
    const isSearch = hasLoadedOnceRef.current
    void fetchUserShops(isSearch)
  }, [user?.id, pageNo, pageSize, queryParam, fetchUserShops])

  // Shopify OAuth 回调：授权完成后重定向到此页时，将完整 query string 传给后端
  useEffect(() => {
    if (typeof window === 'undefined') return
    const search = window.location.search
    if (!search) return
    const params = new URLSearchParams(search)
    const code = params.get('code')
    const shop = params.get('shop')
    const state = params.get('state')
    if (!code || !shop || !state) return

    let cancelled = false
    setIsCallbackProcessing(true)
    shopifyCallback(search)
      .then(() => {
        if (cancelled) return
        toast.success('Store connected successfully!')
        window.history.replaceState({}, '', window.location.pathname)
        void fetchUserShops(true)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Shopify callback error:', err)
        toast.error(
          err instanceof Error ? err.message : 'Failed to complete OAuth.'
        )
      })
      .finally(() => {
        if (!cancelled) setIsCallbackProcessing(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handlePlatformClick = (platformName: string, index: number) => {
    if (index === 0) {
      setSelectedPlatform(platformName)
      setConnectDialogOpen(true)
    } else if (index === platformButtons.length - 1) {
      setBindShopDialogOpen(true)
    } else {
      toast.info(`${platformName} - Coming soon`)
    }
  }

  const handleNext = () => {
    if (selectedPlatform) {
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
                {platformButtons.map((platform, index) => (
                  <button
                    key={platform.name}
                    type='button'
                    className='border-border bg-background hover:bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors'
                    onClick={() => handlePlatformClick(platform.name, index)}
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
          {isCallbackProcessing ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>
                Processing OAuth callback...
              </p>
            </div>
          ) : isInitialLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading shops...</p>
            </div>
          ) : (
            <StoresTable
              data={stores}
              totalCount={totalCount}
              isLoading={isSearching}
              onRefresh={() => fetchUserShops(true)}
            />
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
        <BindShopDialog
          open={bindShopDialogOpen}
          onOpenChange={setBindShopDialogOpen}
          onSuccess={() => fetchUserShops(true)}
        />
      </Main>
    </TasksProvider>
  )
}
