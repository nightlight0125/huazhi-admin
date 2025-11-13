import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { StoreProductsDialogs } from './components/store-products-dialogs'
import { StoreProductsProvider } from './components/store-products-provider'
import { StoreProductsTable } from './components/store-products-table'
import { storeProducts } from './data/data'

export function StoreProducts() {
  return (
    <StoreProductsProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <p className='text-muted-foreground'>
              Here you can find all your stores product.These Products are
              private so they can only be seen by you.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <StoreProductsTable data={storeProducts} />
        </div>
      </Main>

      <StoreProductsDialogs />
    </StoreProductsProvider>
  )
}
