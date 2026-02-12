import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SampleOrdersDialogs } from './components/sample-orders-dialogs'
import { SampleOrdersProvider } from './components/sample-orders-provider'
import { SampleOrdersStats } from './components/sample-orders-stats'
import { SampleOrdersTable } from './components/sample-orders-table'

export function SampleOrders() {
  return (
    <SampleOrdersProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-6'>
          <SampleOrdersStats />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SampleOrdersTable />
        </div>
      </Main>

      <SampleOrdersDialogs />
    </SampleOrdersProvider>
  )
}
