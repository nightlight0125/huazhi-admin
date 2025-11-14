import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersFilterPanel } from './components/orders-filter-panel'
import { OrdersPrimaryButtons } from './components/orders-primary-buttons'
import { OrdersProvider } from './components/orders-provider'
import { OrdersStats } from './components/orders-stats'
import { OrdersTable } from './components/orders-table'
import { orders } from './data/orders'

export function Orders() {
  return (
    <OrdersProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <OrdersStats orders={orders} />
        </div>
        <div className='mb-6'>
          <OrdersFilterPanel />
        </div>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div></div>
          <OrdersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <OrdersTable data={orders} />
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}
