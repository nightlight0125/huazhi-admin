import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { DataTableToolbar } from '@/components/data-table'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersPrimaryButtons } from './components/orders-primary-buttons'
import { OrdersProvider } from './components/orders-provider'
import { OrdersStats } from './components/orders-stats'
import { OrdersTable } from './components/orders-table'
import {
  countries,
  logistics,
  orderStatuses,
  platformFulfillmentStatuses,
  platformOrderStatuses,
  stores,
} from './data/data'
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
              searchPlaceholder='Enter SKU id,SKU name'
              filters={[
                {
                  columnId: 'country',
                  title: 'Country',
                  options: countries.map((c) => ({
                    label: c.label,
                    value: c.value,
                  })),
                },
                {
                  columnId: 'store',
                  title: 'Shop',
                  options: stores.map((s) => ({
                    label: s.label,
                    value: s.value,
                  })),
                },
                {
                  columnId: 'logistics',
                  title: 'Logistics',
                  options: logistics.map((l) => ({
                    label: l.label,
                    value: l.value,
                  })),
                },
                {
                  columnId: 'platformOrderStatus',
                  title: 'Platform Order Status',
                  options: platformOrderStatuses.map((s) => ({
                    label: s.label,
                    value: s.value,
                    icon: s.icon,
                  })),
                },
                {
                  columnId: 'platformFulfillmentStatus',
                  title: 'Platform Fulfillment Status',
                  options: platformFulfillmentStatuses.map((s) => ({
                    label: s.label,
                    value: s.value,
                    icon: s.icon,
                  })),
                },
                {
                  columnId: 'status',
                  title: 'HZ Order Status',
                  options: orderStatuses
                    .filter((s) => s.value !== 'all')
                    .map((s) => ({
                      label: s.label,
                      value: s.value,
                      icon: s.icon,
                    })),
                },
              ]}
              dateRange={{
                enabled: true,
                columnId: 'createdAt',
                placeholder: 'Select Date Range',
              }}
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
