import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { OrdersCreatePage } from './components/orders-create-page'

export function OrdersCreate() {
  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <OrdersCreatePage />
        </div>
      </Main>
    </>
  )
}

