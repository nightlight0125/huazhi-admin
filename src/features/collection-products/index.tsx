import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getRecommendProductsList } from '@/lib/api/products'
import { useTableUrlState } from '@/hooks/use-table-url-state'
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
  const [refreshKey, setRefreshKey] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // 获取分页状态和搜索状态（从 URL）
  const { pagination, globalFilter, onGlobalFilterChange } = useTableUrlState({
    search,
    navigate: navigate as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  // 刷新数据的函数
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // 处理搜索
  const handleSearch = (searchValue: string) => {
    console.log('handleSearch 被调用，搜索值:', searchValue)
    // 使用 onGlobalFilterChange 更新 URL 参数和状态
    // 这会触发 useFetchCollectionProducts 重新获取数据
    if (onGlobalFilterChange) {
      onGlobalFilterChange(searchValue)
      // 同时重置到第一页
      navigate({
        search: (prev) => ({
          ...prev,
          page: 1,
        }),
      })
    }
  }

  const columns = useMemo(
    () => createLikedProductsColumns(handleRefresh),
    [handleRefresh]
  )

  // 加载推荐产品数据（收藏产品）
  useFetchCollectionProducts(
    setData,
    setIsLoading,
    refreshKey,
    pagination,
    setTotalCount,
    globalFilter
  )

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
              totalCount={totalCount}
              onSearch={handleSearch}
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
  setIsLoading: (loading: boolean) => void,
  refreshKey: number = 0,
  pagination?: { pageIndex: number; pageSize: number },
  setTotalCount?: (count: number) => void,
  globalFilter?: string
) {
  const { auth } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.customerId

      if (!customerId) {
        setIsLoading(false)
        setData([])
        setTotalCount?.(0)
        return
      }

      // 使用分页参数，如果没有则使用默认值
      const pageNo = pagination ? pagination.pageIndex + 1 : 1
      const pageSize = pagination?.pageSize || 10

      // 使用搜索参数，如果没有则使用空字符串
      const nameOrCode = globalFilter?.trim() || ''

      console.log('useFetchCollectionProducts: 开始获取数据', {
        customerId,
        pageNo,
        pageSize,
        nameOrCode,
        globalFilter,
      })

      setIsLoading(true)
      try {
        const response = await getRecommendProductsList({
          customerId: String(customerId),
          pageSize,
          pageNo,
          nameOrCode,
        })

        console.log('API Response:', response)

        // API 返回的数据在 response.data.data 中
        const apiProducts =
          (response.data as any)?.data || response.data?.products || []
        console.log('apiProducts:', apiProducts)

        // 获取总数
        const total = response.data?.totalCount || 0
        setTotalCount?.(total)

        const likedProducts: LikedProduct[] = apiProducts.map((item: any) => ({
          id: item.id || String(item.id) || '',
          name: item.name || '',
          image: item.picture || '',
          description: item.enname || '',
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
        setTotalCount?.(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [
    auth.user?.id,
    auth.user?.customerId,
    setData,
    setIsLoading,
    refreshKey,
    pagination?.pageIndex,
    pagination?.pageSize,
    globalFilter,
    setTotalCount,
  ])
}
