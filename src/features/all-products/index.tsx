import { getRouteApi } from '@tanstack/react-router'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
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
        <HeaderActions />
      </Header>

      <Main fluid>
        <ProductsGrid data={products} search={search} navigate={navigate} />
      </Main>
    </ProductsProvider>
  )
}
