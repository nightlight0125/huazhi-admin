import { DataTableToolbar } from '@/components/data-table'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  deleteShopPackage,
  queryCuShopPackageList,
  queryOdPdPackageList,
  type OdPdPackageListItem,
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

// Transform OdPdPackageListItem to StoreSku
function transformOdPdPackageToStoreSku(item: OdPdPackageListItem): StoreSku {
  return {
    id: item.id || '',
    image: item.hzkj_od_pd_shop_product_image || '',
    name: item.hzkj_od_pd_shop_product_name || '',
    sku: item.hzkj_od_pd_shop_sku || '',
    variantId: item.hzkj_od_pd_shop_variant_id || '',
    storeName: item.hzkj_od_pd_shop_name || '',
    price: item.hzkj_od_pd_shop_price || 0,
    isConnected: item.hzkj_isconnect === '1',
    hzProductId: item.hzkj_hz_product_id,
    hzProductImage: item.hzkj_hz_product_image,
    hzProductSku: item.hzkj_hz_product_sku,
    hzkj_od_pd_shop_name: item.hzkj_od_pd_shop_name,
    hzkj_variant_picture: item.hzkj_od_pd_shop_product_image,
    hzkj_variant_price: item.hzkj_od_pd_shop_price,
    ...item,
  }
}

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStoreSku, setSelectedStoreSku] = useState<StoreSku | null>(
    null
  )
  const [storeSkuToDisconnect, setStoreSkuToDisconnect] =
    useState<StoreSku | null>(null)
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)

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

  const handleDelete = (item: any) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.hzkj_shop_package_id) {
      toast.error('Invalid item data')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      return
    }

    try {
      await deleteShopPackage({
        shopPackageId: String(itemToDelete.hzkj_shop_package_id),
      })
      toast.success('Shop package deleted successfully')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      
      // 重新获取数据 - 通过触发 useEffect 重新获取
      // 由于 useEffect 依赖 activeTab, pageNo, pageSize 等，删除后数据会自动刷新
      // 但为了确保立即刷新，我们可以强制触发一次数据获取
      const userId = auth.user?.id
      const customerId = auth.user?.customerId
      if (userId && customerId && activeTab === 'stores') {
        const response = await queryCuShopPackageList({
          data: {
            hzkj_pk_shop_hzkj_customer_id: String(customerId),
            accountId: String(userId),
          },
          pageSize,
          pageNo,
        })
        setPackagingData((response.rows || []) as any[])
        setTotalCount(response.totalCount || 0)
      }
    } catch (error) {
      console.error('Failed to delete shop package:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete shop package. Please try again.'
      )
    }
  }

  const { auth } = useAuthStore()
  const [storeNameOptions, setStoreNameOptions] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [packagingData, setPackagingData] = useState<StoreSku[] | any[]>([])
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

          // 直接使用后端返回的原始数据，不进行转换
          setPackagingData((response.rows || []) as any[])
          setTotalCount(response.totalCount || 0)
          return
        }

        // Products 和 Order tab 使用 queryOdPdPackageList API
        if (activeTab !== 'products' && activeTab !== 'order') {
          setPackagingData([])
          setTotalCount(0)
          return
        }

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

        // 根据 tab 确定 hzkj_package_type
        // 查询未关联产品时，hzkj_package_type 不传
        const packageType =
          hzkjIsconnect === '0'
            ? undefined
            : activeTab === 'products'
              ? '1'
              : '2'

        // 获取店铺过滤值
        const shopId =
          storeFilterValue && storeFilterValue.length > 0
            ? storeFilterValue[0]
            : '*'

        const response = await queryOdPdPackageList({
          data: {
            hzkj_od_pd_shop_hzkj_customer_id: String(customerId),
            ...(packageType && { hzkj_package_type: packageType }),
            accountId: String(userId),
            hzkj_od_pd_shop_id: shopId,
            str: '',
            hzkj_isconnect: hzkjIsconnect,
          },
          pageSize,
          pageNo,
        })
        const transformedData = (response.rows || []).map(
          transformOdPdPackageToStoreSku
        )
        console.log('Fetched packaging data:', {
          count: transformedData.length,
          totalCount: response.totalCount,
          statusFilter: statusFilterValue,
          data: transformedData,
        })
        setPackagingData(transformedData)
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
      onDelete: handleDelete,
      totalCount,
      activeTab,
    }
  )

  // 调试：检查表格数据
  useEffect(() => {
    if (table) {
      const rows = table.getRowModel().rows
      console.log('Table rows count:', rows.length)
      console.log('Table data:', packagingData.length)
      console.log('Table filtered rows:', table.getFilteredRowModel().rows.length)
      console.log('Table column filters:', table.getState().columnFilters)
    }
  }, [table, packagingData, table])

  // 当 statusFilterValue 变化时，重置分页并清除客户端过滤
  useEffect(() => {
    if (table) {
      // 先清除 columnFilters 中 status 的过滤值（必须在 setPageIndex 之前）
      const currentFilters = table.getState().columnFilters
      const filteredFilters = currentFilters.filter(
        (filter) => filter.id !== 'status'
      )
      if (filteredFilters.length !== currentFilters.length) {
        table.setColumnFilters(filteredFilters)
      }
      
      // 清除 status 列的客户端过滤（因为使用服务端过滤）
      const statusColumn = table.getColumn('status')
      if (statusColumn) {
        statusColumn.setFilterValue(undefined)
      }
      
      // 重置分页
      table.setPageIndex(0)
      setPageNo(1)
    }
  }, [statusFilterValue, table])

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

  // 监听过滤变化（只监听 storeName，不监听 status，因为 status 使用服务端过滤）
  useEffect(() => {
    const storeColumn = table.getColumn('storeName')
    if (storeColumn) {
      const filterValue = storeColumn.getFilterValue() as string[] | undefined
      if (JSON.stringify(filterValue) !== JSON.stringify(storeFilterValue)) {
        setStoreFilterValue(filterValue)
      }
    }
    // 注意：不监听 status 列的过滤变化，因为 status 使用服务端过滤
  }, [table, storeFilterValue])

  const handleStatusTabChange = (status: 'connected' | 'unconnected') => {
    const nextStatus =
      statusTab === status ? ('all' as const) : (status as typeof statusTab)
    setStatusTab(nextStatus)

    // 重置分页到第一页
    setPageNo(1)
    table.setPageIndex(0)

    // 清除 columnFilters 中 status 的过滤值（因为使用服务端过滤）
    const currentFilters = table.getState().columnFilters
    const filteredFilters = currentFilters.filter(
      (filter) => filter.id !== 'status'
    )
    if (filteredFilters.length !== currentFilters.length) {
      table.setColumnFilters(filteredFilters)
    }

    // 清除 status 列的过滤值
    const statusColumn = table.getColumn('status')
    if (statusColumn) {
      statusColumn.setFilterValue(undefined)
    }

    // 直接更新 statusFilterValue，这会触发 API 重新获取数据
    if (nextStatus === 'all') {
      setStatusFilterValue(undefined)
    } else {
      setStatusFilterValue([nextStatus])
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
                      onValueChange={(value) => {
                        if (value === 'connected' || value === 'unconnected') {
                          handleStatusTabChange(value)
                        }
                      }}
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
      <DisconnectConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setItemToDelete(null)
          }
        }}
        onConfirm={handleDeleteConfirm}
        title='Delete'
        description='Are you sure you want to delete this shop package?'
      />
    </>
  )
}
