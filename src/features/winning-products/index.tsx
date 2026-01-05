import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getProductsList } from '@/lib/api/products'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProductsGrid } from '../products/components/products-grid'
import { ProductsProvider } from '../products/components/products-provider'
import {
  type Product,
  productCategories,
  shippingLocations,
} from '../products/data/schema'

const route = getRouteApi('/_authenticated/winning-products/')

export function WinningProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [data, setData] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 获取分页状态和搜索状态（从 URL）
  const { pagination, globalFilter } = useTableUrlState({
    search,
    navigate: navigate as any,
    pagination: { defaultPage: 1, defaultPageSize: 8 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      const pageNo = pagination.pageIndex + 1
      const pageSize = pagination.pageSize

      setIsLoading(true)
      try {
        const response = await getProductsList({
          pageSize,
          pageNo,
          productName: globalFilter || '',
          minPrice: 0,
          maxPrice: 99999999,
          deliveryId: '',
          categoryIds: [],
          productTypes: [],
          productTags: [],
        })

        // 后端返回的数据在 data.products 中
        const apiProducts = response.data?.products || []
        const products: Product[] = apiProducts.map((item: any) => {
          // 映射 API 数据到 Product 类型
          return {
            id: item.id || '',
            name: item.name || item.enname || '',
            image: item.picture || '',
            shippingLocation: shippingLocations[0], // 默认值
            price: item.price || 0,
            sku: item.number || '',
            category: productCategories[0], // 默认值，可以根据实际需求调整
            sales: 0, // API 可能没有这个字段
            isPublic: true,
            isRecommended: false,
            isFavorite: false,
            isMyStore: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        })

        setData(products)
      } catch (error) {
        console.error('获取产品列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load products. Please try again.'
        )
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [pagination.pageIndex, pagination.pageSize, globalFilter])

  return (
    <ProductsProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        {isLoading ? (
          <div className='flex h-96 items-center justify-center'>
            <p className='text-muted-foreground text-sm'>Loading products...</p>
          </div>
        ) : (
          <ProductsGrid data={data} search={search} navigate={navigate} />
        )}
      </Main>
    </ProductsProvider>
  )
}
