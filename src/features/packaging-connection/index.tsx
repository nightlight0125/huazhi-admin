import { useMemo, useState } from 'react'
import { Package, Store } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTableToolbar } from '@/components/data-table'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ApplyPackagingDialog } from './components/apply-packaging-dialog'
import { DisconnectConfirmDialog } from './components/disconnect-confirm-dialog'
import {
  PackagingConnectionTable,
  usePackagingConnectionTable,
} from './components/packaging-connection-table'
import { packagingConnections } from './data/data'
import { type PackagingProduct, type StoreSku } from './data/schema'

type TabType = 'products' | 'stores'

const tabs = [
  {
    value: 'products' as TabType,
    label: 'Products',
    icon: Package,
  },
  {
    value: 'stores' as TabType,
    label: 'Stores',
    icon: Store,
  },
]

export function PackagingConnection() {
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [selectedStoreSku, setSelectedStoreSku] = useState<StoreSku | null>(
    null
  )
  const [storeSkuToDisconnect, setStoreSkuToDisconnect] =
    useState<StoreSku | null>(null)
  // Note: These filters are currently used in filteredData but setter functions are not used
  // They may be needed for future custom filtering beyond DataTableToolbar
  const [statusFilter] = useState<'connected' | 'unconnected' | 'all'>('all')
  const [searchFilters] = useState<{
    storeName1?: string
    storeName2?: string
    storeSku?: string
    productName?: string
    status?: 'connected' | 'unconnected'
  }>({})

  const filteredData = useMemo(() => {
    let filtered = [...packagingConnections]

    // Apply status filter
    if (statusFilter === 'connected') {
      filtered = filtered.filter((item) => item.isConnected)
    } else if (statusFilter === 'unconnected') {
      filtered = filtered.filter((item) => !item.isConnected)
    }

    // Apply search filters
    if (searchFilters.storeName1) {
      filtered = filtered.filter((item) =>
        item.storeName
          .toLowerCase()
          .includes(searchFilters.storeName1!.toLowerCase())
      )
    }

    if (searchFilters.storeName2) {
      filtered = filtered.filter((item) =>
        item.storeName
          .toLowerCase()
          .includes(searchFilters.storeName2!.toLowerCase())
      )
    }

    if (searchFilters.storeSku) {
      const searchTerm = searchFilters.storeSku.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.sku.toLowerCase().includes(searchTerm) ||
          item.name.toLowerCase().includes(searchTerm)
      )
    }

    if (searchFilters.productName) {
      const searchTerm = searchFilters.productName.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.sku.toLowerCase().includes(searchTerm) ||
          (item.hzProductSku?.toLowerCase().includes(searchTerm) ?? false)
      )
    }

    return filtered
  }, [statusFilter, searchFilters])

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

  const { table, expandedRows, handleExpand } = usePackagingConnectionTable(
    filteredData,
    {
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
    }
  )

  // Get unique store names for filter options
  const storeNameOptions = useMemo(() => {
    const uniqueStoreNames = Array.from(
      new Set(packagingConnections.map((item) => item.storeName))
    )
    return uniqueStoreNames.map((storeName) => ({
      label: storeName,
      value: storeName,
    }))
  }, [])

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
            <TabsList className='mb-4 grid h-9 w-fit grid-cols-2 gap-1'>
              {tabs.map((tab) => {
                const Icon = tab.icon
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
                  <DataTableToolbar
                    table={table}
                    showSearch={false}
                    filters={[
                      {
                        columnId: 'storeName',
                        title: 'Store Name',
                        options: storeNameOptions,
                      },
                      ...(tab.value === 'stores'
                        ? [
                            {
                              columnId: 'status',
                              title: 'Status',
                              options: [
                                { label: 'Connected', value: 'connected' },
                                { label: 'Unconnected', value: 'unconnected' },
                              ],
                            },
                          ]
                        : []),
                    ]}
                  />
                  <PackagingConnectionTable
                    data={filteredData}
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
