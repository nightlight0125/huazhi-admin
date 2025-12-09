import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { createLikedProductsColumns } from '@/features/liked-products/components/liked-products-columns'
import { ProductsTableWithToolbar } from '@/features/liked-products/components/products-table-with-toolbar'
import { likedProductsData } from '@/features/liked-products/data/data'

const route = getRouteApi('/_authenticated/collection-products/')

export function CollectionProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const columns = useMemo(
    () => createLikedProductsColumns(),
    []
  )

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <ProductsTableWithToolbar
            data={likedProductsData}
            columns={columns}
            search={search}
            navigate={navigate}
          />
        </div>
      </Main>
    </>
  )
}


