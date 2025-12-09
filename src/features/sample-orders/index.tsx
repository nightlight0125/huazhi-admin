import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { DataTableToolbar } from '@/components/data-table'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SampleOrdersDialogs } from './components/sample-orders-dialogs'
import { SampleOrdersProvider } from './components/sample-orders-provider'
import { SampleOrdersStats } from './components/sample-orders-stats'
import { SampleOrdersTable } from './components/sample-orders-table'
import { sampleOrders } from './data/sample-orders'
import { type SampleOrder } from './data/schema'

export function SampleOrders() {
  const [table, setTable] = useState<Table<SampleOrder> | null>(null)

  return (
    <SampleOrdersProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-6'>
          <SampleOrdersStats orders={sampleOrders} />
        </div>
        {table && (
          <div className='mb-6'>
            <DataTableToolbar
              table={table}
              searchPlaceholder='Enter Order Number,SKU,Product Name'
              searchKey='orderNumber'
              dateRange={{
                enabled: true,
                columnId: 'createdAt',
                placeholder: 'Select Date Range',
              }}
            />
          </div>
        )}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SampleOrdersTable data={sampleOrders} onTableReady={setTable} />
        </div>
      </Main>

      <SampleOrdersDialogs />
    </SampleOrdersProvider>
  )
}
