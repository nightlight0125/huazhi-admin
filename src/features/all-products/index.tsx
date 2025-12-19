import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getProductsList } from '@/lib/api/products'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProductsGrid } from '../products/components/products-grid'
import { ProductsProvider } from '../products/components/products-provider'
import type { Product } from '../products/data/schema'
import { productCategories, shippingLocations } from '../products/data/schema'

const route = getRouteApi('/_authenticated/all-products')

export function AllProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const response = await getProductsList({
          pageSize: 10,
          pageNo: 1,
          productName: '',
          minPrice: 0,
          maxPrice: 99999999,
          deliveryId: '',
          categoryIds: [],
          productTypes: [],
          productTags: [],
        })

        // 将 API 返回的数据转换为 Product 格式
        const apiProducts = response.data?.products || []
        console.log('apiProducts:', apiProducts)
        const convertedProducts: Product[] = apiProducts.map((apiProduct) => {
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
        })

        setProducts(convertedProducts)
      } catch (error) {
        console.error('获取产品列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load products. Please try again.'
        )
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <ProductsProvider>
        <Header fixed>
          <HeaderActions />
        </Header>
        <Main fluid>
          <div className='flex h-96 items-center justify-center'>
            <div className='text-center'>
              <p className='text-muted-foreground'>Loading products...</p>
            </div>
          </div>
        </Main>
      </ProductsProvider>
    )
  }

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
