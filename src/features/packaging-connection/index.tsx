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

  const { table, expandedRows, handleExpand } = usePackagingConnectionTable(
    packagingConnections,
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
                    data={packagingConnections}
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
