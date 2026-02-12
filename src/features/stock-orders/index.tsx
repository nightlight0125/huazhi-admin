import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { StockOrdersDialogs } from './components/stock-orders-dialogs'
import { StockOrdersProvider } from './components/stock-orders-provider'
import { StockOrdersStats } from './components/stock-orders-stats'
import { StockOrdersTable } from './components/stock-orders-table'

export function StockOrders() {
  return (
    <StockOrdersProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-6'>
          <StockOrdersStats />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <StockOrdersTable />
        </div>
      </Main>

      <StockOrdersDialogs />
    </StockOrdersProvider>
  )
}
