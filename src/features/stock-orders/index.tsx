import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { ConfigDrawer } from '@/components/config-drawer'
import { DataTableToolbar } from '@/components/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { StockOrdersDialogs } from './components/stock-orders-dialogs'
import { StockOrdersProvider } from './components/stock-orders-provider'
import { StockOrdersStats } from './components/stock-orders-stats'
import { StockOrdersTable } from './components/stock-orders-table'
import { type StockOrder } from './data/schema'
import { stockOrders } from './data/stock-orders'

export function StockOrders() {
  const [table, setTable] = useState<Table<StockOrder> | null>(null)

  return (
    <StockOrdersProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className='mb-6'>
          <StockOrdersStats orders={stockOrders} />
        </div>
        {table && (
          <div className='mb-6'>
            <DataTableToolbar
              table={table}
              searchPlaceholder='Order Number'
              searchKey='orderNumber'
              extraSearch={{
                columnId: 'sku',
                placeholder: 'Enter SKU',
              }}
              extraSearch2={{
                columnId: 'productName',
                placeholder: 'Enter Product Name',
              }}
            />
          </div>
        )}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <StockOrdersTable data={stockOrders} onTableReady={setTable} />
        </div>
      </Main>

      <StockOrdersDialogs />
    </StockOrdersProvider>
  )
}
