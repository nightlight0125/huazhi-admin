import { getRouteApi } from '@tanstack/react-router'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { likedProductsColumns } from './components/liked-products-columns'
import { ProductsTableWithToolbar } from './components/products-table-with-toolbar'
import { likedProductsData } from './data/data'

const route = getRouteApi('/_authenticated/liked-products/')

export function LikedProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <>
      <Header fixed>
        <HeaderActions />
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
