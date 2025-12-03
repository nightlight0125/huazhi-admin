import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PackagingProductsGrid } from './components/packaging-products-grid'
import { packagingProducts } from './data/data'

export function PackagingProducts() {
  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <PackagingProductsGrid data={packagingProducts} />
        </div>
      </Main>
    </>
  )
}

