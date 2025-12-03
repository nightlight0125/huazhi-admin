import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { HeaderActions } from '@/components/header-actions'
import { DataTableToolbar } from '@/components/data-table'
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
              filters={[
                {
                  columnId: 'logistics',
                  title: 'Logistics',
                  options: [
                    { label: 'DHL', value: 'DHL' },
                    { label: 'FedEx', value: 'FedEx' },
                    { label: 'UPS', value: 'UPS' },
                    { label: 'USPS', value: 'USPS' },
                  ],
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
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SampleOrdersTable data={sampleOrders} onTableReady={setTable} />
        </div>
      </Main>

      <SampleOrdersDialogs />
    </SampleOrdersProvider>
  )
}
