import { getRouteApi } from '@tanstack/react-router'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProductsProvider } from '../products/components/products-provider'
import { ProductsGrid } from '../products/components/products-grid'
import { winningProducts } from './data/data'

const route = getRouteApi('/_authenticated/winning-products/')

export function WinningProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <ProductsProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <ProductsGrid data={winningProducts} search={search} navigate={navigate} />
      </Main>
    </ProductsProvider>
  )
}

