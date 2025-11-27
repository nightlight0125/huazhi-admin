import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { StockOrdersDialogs } from './components/stock-orders-dialogs'
import { StockOrdersFilterPanel } from './components/stock-orders-filter-panel'
import { StockOrdersProvider } from './components/stock-orders-provider'
import { StockOrdersStats } from './components/stock-orders-stats'
import { StockOrdersTable } from './components/stock-orders-table'
import { stockOrders } from './data/stock-orders'

export function StockOrders() {
  return (
    <StockOrdersProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <StockOrdersStats orders={stockOrders} />
        </div>
        <div className='mb-6'>
          <StockOrdersFilterPanel />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <StockOrdersTable data={stockOrders} />
        </div>
      </Main>

      <StockOrdersDialogs />
    </StockOrdersProvider>
  )
}
