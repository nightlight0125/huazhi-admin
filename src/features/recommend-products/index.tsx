import { getRouteApi } from '@tanstack/react-router'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
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
        <HeaderActions />
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

