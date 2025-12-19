import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getRecommendProductsList } from '@/lib/api/products'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProductsTableWithToolbar } from '../liked-products/components/products-table-with-toolbar'
import { recommendProductsColumns } from './components/recommend-products-columns'
import type { RecommendProduct } from './data/schema'

const route = getRouteApi('/_authenticated/recommend-products/')

export function RecommendProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [data, setData] = useState<RecommendProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.id
      if (!customerId) {
        toast.error('User not authenticated. Please login again.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await getRecommendProductsList({
          customerId,
          pageSize: 2,
          pageNo: 1,
          nameOrCode: '',
        })

        const apiProducts = response.data?.products || []
        const products: RecommendProduct[] = apiProducts.map((item) => ({
          id: item.id,
          name: item.name || item.enname || '',
          image: item.picture || '',
          description: item.enname || item.name || '',
          spu: item.number || '',
          priceMin: item.price || 0,
          priceMax: item.price || 0,
          addDate: new Date(),
        }))

        setData(products)
      } catch (error) {
        console.error('获取推荐产品列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load recommend products. Please try again.'
        )
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [auth.user?.id])

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          {isLoading ? (
            <div className='flex h-96 items-center justify-center'>
              <p className='text-muted-foreground text-sm'>
                Loading recommend products...
              </p>
            </div>
          ) : (
            <ProductsTableWithToolbar
              data={data}
              columns={recommendProductsColumns}
              search={search}
              navigate={navigate}
            />
          )}
        </div>
      </Main>
    </>
  )
}
