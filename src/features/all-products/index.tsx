import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsGrid } from '../products/components/products-grid'
import { ProductsProvider } from '../products/components/products-provider'
import { products } from '../products/data/data'

const route = getRouteApi('/_authenticated/all-products')

export function AllProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <ProductsProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <ProductsGrid data={products} search={search} navigate={navigate} />
      </Main>
    </ProductsProvider>
  )
}
