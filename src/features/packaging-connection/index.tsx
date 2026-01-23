import { DataTableToolbar } from '@/components/data-table'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  queryCuShopPackageList,
  queryOdPdPackageList
} from '@/lib/api/products'
import { getUserShopList, type ShopListItem } from '@/lib/api/shop'
import { useAuthStore } from '@/stores/auth-store'
import { Package, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ApplyPackagingDialog } from './components/apply-packaging-dialog'
import { DisconnectConfirmDialog } from './components/disconnect-confirm-dialog'
import {
  PackagingConnectionTable,
  usePackagingConnectionTable,
} from './components/packaging-connection-table'
import { type PackagingProduct, type StoreSku } from './data/schema'

type TabType = 'products' | 'stores' | 'order'

const tabs = [
  {
    value: 'products' as TabType,
    label: 'Products',
    icon: Package,
  },
  {
    value: 'order' as TabType,
    label: 'Order',
    icon: Store,
  },
  {
    value: 'stores' as TabType,
    label: 'Store',
    icon: Package,
  },
]

export function PackagingConnection() {
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [statusTab, setStatusTab] = useState<
    'all' | 'connected' | 'unconnected'
  >('all')
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [selectedStoreSku, setSelectedStoreSku] = useState<StoreSku | null>(
    null
  )
  const [storeSkuToDisconnect, setStoreSkuToDisconnect] =
    useState<StoreSku | null>(null)

  const handleConnect = (storeSku: StoreSku) => {
    setSelectedStoreSku(storeSku)
    setConnectDialogOpen(true)
  }

  const handleDisconnect = (storeSku: StoreSku) => {
    setStoreSkuToDisconnect(storeSku)
    setDisconnectDialogOpen(true)
  }

  const handleConnectDialogConfirm = (selectedProducts: PackagingProduct[]) => {
    console.log('Selected products:', selectedProducts)
    console.log('Store SKU:', selectedStoreSku)
    // TODO: Implement the connection logic here
    // This would typically involve an API call to associate the packaging products with the store SKU
  }

  const handleDisconnectConfirm = () => {
    console.log('Disconnecting:', storeSkuToDisconnect)
    // TODO: Implement the disconnect logic here
    // This would typically involve an API call to disconnect the packaging products from the store SKU
    setDisconnectDialogOpen(false)
    setStoreSkuToDisconnect(null)
  }

  const { auth } = useAuthStore()
  const [storeNameOptions, setStoreNameOptions] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [packagingData, setPackagingData] = useState<StoreSku[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [pageNo, setPageNo] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilterValue, setStatusFilterValue] = useState<
    string[] | undefined
  >(undefined)
  const [storeFilterValue, setStoreFilterValue] = useState<
    string[] | undefined
  >(undefined)

  // 获取店铺列表
  useEffect(() => {
    const fetchStores = async () => {
      const userId = auth.user?.id
      if (!userId) {
        setStoreNameOptions([])
        return
      }

      try {
        const response = await getUserShopList({
          hzkjAccountId: userId,
          queryParam: 'w',
          pageNo: 0,
          pageSize: 100, // 获取足够多的店铺
        })

        // 将店铺列表映射为选项格式
        const options = response.list
          .filter((shop: ShopListItem) => shop.id) // 过滤掉没有 id 的店铺
          .map((shop: ShopListItem) => ({
            label: typeof shop.name === 'string' ? shop.name : (typeof shop.platform === 'string' ? shop.platform : String(shop.id || '')),
            value: typeof shop.id === 'string' ? shop.id : String(shop.id || ''),
          }))

        setStoreNameOptions(options)
      } catch (error) {
        console.error('Failed to fetch stores:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load stores. Please try again.'
        )
        setStoreNameOptions([])
      }
    }

    void fetchStores()
  }, [])

  // 获取包装连接数据（Products、Order 和 Store tab）
  useEffect(() => {
    const fetchPackagingData = async () => {
      const userId = auth.user?.id
      const customerId = auth.user?.customerId

      try {
        if (activeTab === 'stores') {
          const response = await queryCuShopPackageList({
            data: {
              hzkj_pk_shop_hzkj_customer_id: String(customerId),
              accountId: String(userId),
            },
            pageSize,
            pageNo,
          })

          setPackagingData(response.rows || [])
          setTotalCount(response.totalCount || 0)
          return
        }

        // Products 和 Order tab 使用 queryOdPdPackageList API
        if (activeTab !== 'products' && activeTab !== 'order') {
          setPackagingData([])
          setTotalCount(0)
          return
        }

        // 根据 tab 确定 hzkj_package_type
        const packageType = activeTab === 'products' ? '1' : '2'

        // 获取连接状态过滤值
        let hzkjIsconnect: string | undefined
        if (
          statusFilterValue?.includes('connected') &&
          statusFilterValue.length === 1
        ) {
          hzkjIsconnect = '1'
        } else if (
          statusFilterValue?.includes('unconnected') &&
          statusFilterValue.length === 1
        ) {
          hzkjIsconnect = '0'
        }

        // 获取店铺过滤值
        const shopId =
          storeFilterValue && storeFilterValue.length > 0
            ? storeFilterValue[0]
            : '*'

        const response = await queryOdPdPackageList({
          data: {
            hzkj_od_pd_shop_hzkj_customer_id: String(customerId),
            hzkj_package_type: packageType,
            accountId: String(userId),
            hzkj_od_pd_shop_id: shopId,
            str: '',
            hzkj_isconnect: hzkjIsconnect,
          },
          pageSize,
          pageNo,
        })
        setPackagingData(response.rows || [])
        setTotalCount(response.totalCount || 0)
      } catch (error) {
        console.error('Failed to fetch packaging data:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load packaging data. Please try again.'
        )
        setPackagingData([])
        setTotalCount(0)
      }
    }

    void fetchPackagingData()
  }, [
    activeTab,
    auth.user?.id,
    auth.user?.customerId,
    pageNo,
    pageSize,
    statusFilterValue,
    storeFilterValue,
  ])

  const { table, expandedRows, handleExpand } = usePackagingConnectionTable(
    packagingData,
    {
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      totalCount,
    }
  )

  // 监听分页变化
  useEffect(() => {
    const pagination = table.getState().pagination
    if (pagination.pageIndex + 1 !== pageNo) {
      setPageNo(pagination.pageIndex + 1)
    }
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize)
    }
  }, [table, pageNo, pageSize])

  // 监听过滤变化
  useEffect(() => {
    const statusColumn = table.getColumn('status')
    const storeColumn = table.getColumn('storeName')
    if (statusColumn) {
      const filterValue = statusColumn.getFilterValue() as string[] | undefined
      if (JSON.stringify(filterValue) !== JSON.stringify(statusFilterValue)) {
        setStatusFilterValue(filterValue)
      }
    }
    if (storeColumn) {
      const filterValue = storeColumn.getFilterValue() as string[] | undefined
      if (JSON.stringify(filterValue) !== JSON.stringify(storeFilterValue)) {
        setStoreFilterValue(filterValue)
      }
    }
  }, [table, statusFilterValue, storeFilterValue])

  const handleStatusTabChange = (status: 'connected' | 'unconnected') => {
    const nextStatus =
      statusTab === status ? ('all' as const) : (status as typeof statusTab)
    setStatusTab(nextStatus)

    const statusColumn = table.getColumn('status')
    if (!statusColumn) return

    if (nextStatus === 'all') {
      statusColumn.setFilterValue(undefined)
    } else {
      statusColumn.setFilterValue([nextStatus])
    }
  }

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>
      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
            className='w-full'
          >
            <TabsList className='mb-4 inline-flex h-9 items-center gap-1'>
              {tabs.map((tab) => {
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className='data-[state=active]:text-primary flex h-8 items-center gap-2 px-3 py-1.5 text-sm'
                  >
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className='mt-0'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Tabs
                      value={statusTab}
                      onValueChange={(value) =>
                        handleStatusTabChange(
                          value as 'connected' | 'unconnected'
                        )
                      }
                      className='w-fit'
                    >
                      <TabsList className='h-8 gap-1'>
                        <TabsTrigger
                          value='connected'
                          className='data-[state=active]:text-primary px-3 py-1.5 text-xs'
                        >
                          Connected
                        </TabsTrigger>
                        <TabsTrigger
                          value='unconnected'
                          className='data-[state=active]:text-primary px-3 py-1.5 text-xs'
                        >
                          Unconnected
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <DataTableToolbar
                    table={table}
                    showSearch={false}
                    filters={[
                      {
                        columnId: 'storeName',
                        title: 'Store Name',
                        options: storeNameOptions,
                      },
                    ]}
                  />
                  <PackagingConnectionTable
                    data={packagingData}
                    table={table}
                    expandedRows={expandedRows}
                    onExpand={handleExpand}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Main>
      <ApplyPackagingDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        storeSku={selectedStoreSku}
        onConfirm={handleConnectDialogConfirm}
      />
      <DisconnectConfirmDialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
        onConfirm={handleDisconnectConfirm}
      />
    </>
  )
}
