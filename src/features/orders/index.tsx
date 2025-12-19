import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { CountrySelect } from '@/components/country-select'
import { DataTableToolbar } from '@/components/data-table'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersPrimaryButtons } from './components/orders-primary-buttons'
import { OrdersProvider } from './components/orders-provider'
import { OrdersStats } from './components/orders-stats'
import { OrdersTable } from './components/orders-table'
import { orderStatuses, platformOrderStatuses, stores } from './data/data'
import { orders } from './data/orders'
import { type Order } from './data/schema'

export function Orders() {
  const [table, setTable] = useState<Table<Order> | null>(null)

  return (
    <OrdersProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-6'>
          <OrdersStats orders={orders} />
        </div>
        {table && (
          <div className='mb-6'>
            <DataTableToolbar
              table={table}
              searchPlaceholder='Order No.\SPU\Name'
              dateRange={{
                enabled: true,
                columnId: 'createdAt',
                placeholder: 'Select Date Range',
              }}
              customFilterSlot={
                <CountrySelect
                  className='min-w-[260px]'
                  value={
                    ((table.getColumn('country')?.getFilterValue() as
                      | string[]
                      | undefined) ?? [])[0]
                  }
                  onChange={(value) => {
                    const column = table.getColumn('country')
                    if (!column) return
                    column.setFilterValue(value ? [value] : undefined)
                  }}
                  placeholder='Select country'
                />
              }
              filters={[
                {
                  columnId: 'store',
                  title: 'Store',
                  options: stores.map((s) => ({
                    label: s.label,
                    value: s.value,
                  })),
                },

                {
                  columnId: 'platformOrderStatus',
                  title: 'Store Order Status',
                  options: platformOrderStatuses.map((s) => ({
                    label: s.label,
                    value: s.value,
                    icon: s.icon,
                  })),
                },
                {
                  columnId: 'status',
                  title: 'Order Status',
                  options: orderStatuses
                    .filter((s) => s.value !== 'all')
                    .map((s) => ({
                      label: s.label,
                      value: s.value,
                      icon: s.icon,
                    })),
                },
              ]}
            />
          </div>
        )}
        <div className='mb-2 flex flex-wrap items-center justify-end space-y-2 gap-x-4'>
          <OrdersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <OrdersTable data={orders} onTableReady={setTable} />
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}
