import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getRecommendProductsList } from '@/lib/api/products'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { createLikedProductsColumns } from '@/features/liked-products/components/liked-products-columns'
import { ProductsTableWithToolbar } from '@/features/liked-products/components/products-table-with-toolbar'
import type { LikedProduct } from '@/features/liked-products/data/schema'

const route = getRouteApi('/_authenticated/collection-products/')

export function CollectionProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [data, setData] = useState<LikedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const columns = useMemo(() => createLikedProductsColumns(), [])

  // 加载推荐产品数据（收藏产品）
  useFetchCollectionProducts(setData, setIsLoading)

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
                Loading collection products...
              </p>
            </div>
          ) : (
            <ProductsTableWithToolbar
              data={data}
              columns={columns}
              search={search}
              navigate={navigate}
            />
          )}
        </div>
      </Main>
    </>
  )
}

// 获取推荐产品数据
export function useFetchCollectionProducts(
  setData: (data: LikedProduct[]) => void,
  setIsLoading: (loading: boolean) => void
) {
  const { auth } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      // const customerId = auth.user?.id
      const customerId = '2333521702035667968'
      if (!customerId) {
        toast.error('User not authenticated. Please login again.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await getRecommendProductsList({
          customerId,
          pageSize: 5,
          pageNo: 1,
          nameOrCode: '',
        })

        console.log('API Response:', response)
        
        // API 返回的数据在 response.data.data 中
        const apiProducts = (response.data as any)?.data || response.data?.products || []
        console.log('apiProducts:', apiProducts)
        
        const likedProducts: LikedProduct[] = apiProducts.map((item: any) => ({
          id: item.id || String(item.id) || '',
          name: item.name || item.enname || '',
          image: item.picture || '',
          description: item.enname || item.name || '',
          spu: item.number || '',
          priceMin: item.price || 0,
          priceMax: item.price || 0,
          addDate: item.date ? new Date(item.date) : new Date(),
        }))

        console.log('Mapped likedProducts:', likedProducts)
        setData(likedProducts)
      } catch (error) {
        console.error('获取推荐产品列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load collection products. Please try again.'
        )
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [auth.user?.id, setData, setIsLoading])
}
