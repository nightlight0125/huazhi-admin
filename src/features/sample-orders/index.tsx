import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { SampleOrdersDialogs } from './components/sample-orders-dialogs'
import { SampleOrdersFilterPanel } from './components/sample-orders-filter-panel'
import { SampleOrdersProvider } from './components/sample-orders-provider'
import { SampleOrdersStats } from './components/sample-orders-stats'
import { SampleOrdersTable } from './components/sample-orders-table'
import { sampleOrders } from './data/sample-orders'

export function SampleOrders() {
  return (
    <SampleOrdersProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <SampleOrdersStats orders={sampleOrders} />
        </div>
        <div className='mb-6'>
          <SampleOrdersFilterPanel />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SampleOrdersTable data={sampleOrders} />
        </div>
      </Main>

      <SampleOrdersDialogs />
    </SampleOrdersProvider>
  )
}
