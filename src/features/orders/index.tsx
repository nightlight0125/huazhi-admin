import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { ConfigDrawer } from '@/components/config-drawer'
import { DataTableToolbar } from '@/components/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
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
  shippingOrigins,
  stores,
} from './data/data'
import { orders } from './data/orders'
import { type Order } from './data/schema'

export function Orders() {
  const [table, setTable] = useState<Table<Order> | null>(null)

  return (
    <OrdersProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className='mb-6'>
          <OrdersStats orders={orders} />
        </div>
        {table && (
          <div className='mb-6'>
            <DataTableToolbar
              table={table}
              searchPlaceholder='StoreOrder Number'
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
                {
                  columnId: 'shippingOrigin',
                  title: 'Location',
                  options: shippingOrigins.map((o) => ({
                    label: o.label,
                    value: o.value,
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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div></div>
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
