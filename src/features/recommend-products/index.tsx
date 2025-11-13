import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsTableWithToolbar } from '../liked-products/components/products-table-with-toolbar'
import { recommendProductsColumns } from './components/recommend-products-columns'
import { recommendProductsData } from './data/data'

const route = getRouteApi('/_authenticated/recommend-products/')

export function RecommendProducts() {
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
            data={recommendProductsData}
            columns={recommendProductsColumns}
            search={search}
            navigate={navigate}
          />
        </div>
      </Main>
    </>
  )
}

