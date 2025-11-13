import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsTableWithToolbar } from './components/products-table-with-toolbar'
import { likedProductsColumns } from './components/liked-products-columns'
import { likedProductsData } from './data/data'

const route = getRouteApi('/_authenticated/liked-products/')

export function LikedProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <ProductsTableWithToolbar
            data={likedProductsData}
            columns={likedProductsColumns}
            search={search}
            navigate={navigate}
          />
        </div>
      </Main>
    </>
  )
}
