import { type ChangeEvent, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { SlidersHorizontal, ArrowUpAZ, ArrowDownAZ, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { stores } from './data/stores'
import { type Store } from './data/schema'
import { StoreCard } from './components/store-card'
import { StoresStats } from './components/stores-stats'
import { showSubmittedData } from '@/lib/show-submitted-data'

const route = getRouteApi('/_authenticated/stores/')

type StoreType = 'all' | 'connected' | 'notConnected'
type StorePlatform = 'all' | 'shopify' | 'ebay' | 'tiktok' | 'amazon'

const storeTypeText = new Map<StoreType, string>([
  ['all', '所有店铺'],
  ['connected', '已连接'],
  ['notConnected', '未连接'],
])

const platformText = new Map<StorePlatform, string>([
  ['all', '所有平台'],
  ['shopify', 'Shopify'],
  ['ebay', 'eBay'],
  ['tiktok', 'TikTok Shop'],
  ['amazon', 'Amazon Store'],
])

export function Stores() {
  const {
    filter = '',
    type = 'all',
    platform = 'all',
    sort: initSort = 'asc',
  } = route.useSearch()
  const navigate = route.useNavigate()

  const [sort, setSort] = useState(initSort)
  const [storeType, setStoreType] = useState(type)
  const [storePlatform, setStorePlatform] = useState(platform)
  const [searchTerm, setSearchTerm] = useState(filter)

  const filteredStores = stores
    .sort((a, b) =>
      sort === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .filter((store) =>
      storeType === 'connected'
        ? store.status === 'active'
        : storeType === 'notConnected'
          ? store.status !== 'active'
          : true
    )
    .filter((store) =>
      storePlatform === 'all'
        ? true
        : store.platform === storePlatform
    )
    .filter((store) => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.platform.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    navigate({
      search: (prev) => ({
        ...prev,
        filter: e.target.value || undefined,
      }),
    })
  }

  const handleTypeChange = (value: StoreType) => {
    setStoreType(value)
    navigate({
      search: (prev) => ({
        ...prev,
        type: value === 'all' ? undefined : value,
      }),
    })
  }

  const handlePlatformChange = (value: StorePlatform) => {
    setStorePlatform(value)
    navigate({
      search: (prev) => ({
        ...prev,
        platform: value === 'all' ? undefined : value,
      }),
    })
  }

  const handleSortChange = (sort: 'asc' | 'desc') => {
    setSort(sort)
    navigate({ search: (prev) => ({ ...prev, sort }) })
  }

  const handleConnect = (store: Store) => {
    showSubmittedData(store, '正在连接店铺:')
  }

  const handleDisconnect = (store: Store) => {
    showSubmittedData(store, '正在断开店铺连接:')
  }

  const handleSync = (store: Store) => {
    showSubmittedData(store, '正在同步店铺数据:')
  }

  const handleManage = (store: Store) => {
    showSubmittedData(store, '正在打开店铺管理:')
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div className="flex items-center justify-between">
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              店铺管理
            </h1>
            <p className='text-muted-foreground'>
              管理您的电商平台店铺连接和同步
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加店铺
          </Button>
        </div>

        {/* 统计信息 */}
        <StoresStats stores={stores} />

        {/* 筛选和搜索 */}
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='搜索店铺...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={handleSearch}
            />
            <Select value={storeType} onValueChange={handleTypeChange}>
              <SelectTrigger className='w-36'>
                <SelectValue>{storeTypeText.get(storeType)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>所有店铺</SelectItem>
                <SelectItem value='connected'>已连接</SelectItem>
                <SelectItem value='notConnected'>未连接</SelectItem>
              </SelectContent>
            </Select>
            <Select value={storePlatform} onValueChange={handlePlatformChange}>
              <SelectTrigger className='w-36'>
                <SelectValue>{platformText.get(storePlatform)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>所有平台</SelectItem>
                <SelectItem value='shopify'>Shopify</SelectItem>
                <SelectItem value='ebay'>eBay</SelectItem>
                <SelectItem value='tiktok'>TikTok Shop</SelectItem>
                <SelectItem value='amazon'>Amazon Store</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className='w-16'>
              <SelectValue>
                <SlidersHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value='asc'>
                <div className='flex items-center gap-4'>
                  <ArrowUpAZ size={16} />
                  <span>升序</span>
                </div>
              </SelectItem>
              <SelectItem value='desc'>
                <div className='flex items-center gap-4'>
                  <ArrowDownAZ size={16} />
                  <span>降序</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator className='shadow-sm' />
        
        {/* 店铺列表 */}
        <div className='faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3'>
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              onManage={handleManage}
            />
          ))}
        </div>
      </Main>
    </>
  )
}
