import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getProductsList } from '@/lib/api/products'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProductsProvider } from '../products/components/products-provider'
import type { Product } from '../products/data/schema'
import { productCategories, shippingLocations } from '../products/data/schema'
import { AllProductsGrid } from './components/all-products-grid'

const route = getRouteApi('/_authenticated/all-products')

export function AllProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<
    | {
        min: number
        max: number
      }
    | undefined
  >(undefined)
  const [deliveryId, setDeliveryId] = useState<string | undefined>(undefined)

  // 获取分页状态和搜索状态（从 URL）
  const { pagination, globalFilter } = useTableUrlState({
    search,
    navigate: navigate as any,
    pagination: { defaultPage: 1, defaultPageSize: 8 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  useEffect(() => {
    const fetchProducts = async () => {
      const pageNo = pagination.pageIndex + 1
      const pageSize = pagination.pageSize

      setIsLoading(true)
      try {
        const response = await getProductsList({
          pageSize,
          pageNo,
          productName: globalFilter || '',
          minPrice: priceRange?.min ?? 0,
          maxPrice: priceRange?.max ?? 99999999,
          deliveryId: deliveryId || '',
          categoryIds: categoryIds.length > 0 ? categoryIds : [],
          productTypes: [],
          productTags: [],
        })

        // 后端返回的数据在 data.products 中
        const apiProducts = response.data?.products || []
        const convertedProducts: Product[] = apiProducts.map(
          (apiProduct: any) => {
            // 将 API 产品数据转换为 Product schema 格式
            return {
              id: apiProduct.id,
              name: apiProduct.name || apiProduct.enname || '',
              image: apiProduct.picture || '',
              shippingLocation: shippingLocations[0], // 默认值，API 没有提供
              price: apiProduct.price || 0,
              sku: apiProduct.number || apiProduct.id,
              category: productCategories[0], // 默认值，API 没有提供
              sales: 0, // 默认值，API 没有提供
              isPublic: true,
              isRecommended: false,
              isFavorite: false,
              isMyStore: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
        )

        setProducts(convertedProducts)
        setTotalCount(response.data?.totalCount || 0)
      } catch (error) {
        console.error('获取产品列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load products. Please try again.'
        )
        setProducts([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProducts()
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    categoryIds,
    priceRange,
    deliveryId,
  ])

  const handleCategoryChange = (ids: string[]) => {
    setCategoryIds(ids)
  }

  const handlePriceRangeChange = (
    range: { min: number; max: number } | undefined
  ) => {
    setPriceRange(range)
  }

  const handleLocationChange = (id: string | undefined) => {
    setDeliveryId(id)
  }

  return (
    <ProductsProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <AllProductsGrid
          data={products}
          totalCount={totalCount}
          isLoading={isLoading}
          onCategoryChange={handleCategoryChange}
          onPriceRangeChange={handlePriceRangeChange}
          onLocationChange={handleLocationChange}
        />
      </Main>
    </ProductsProvider>
  )
}
