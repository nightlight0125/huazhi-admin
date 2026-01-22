import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { createLikedProductsColumns } from '@/features/liked-products/components/liked-products-columns'
import { ProductsTableWithToolbar } from '@/features/liked-products/components/products-table-with-toolbar'
import type { LikedProduct } from '@/features/liked-products/data/schema'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { getRecommendProductsList } from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const route = getRouteApi('/_authenticated/collection-products/')

export function CollectionProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [data, setData] = useState<LikedProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
    // onGlobalFilterChange 已经会重置 page 到第一页，不需要再次调用 navigate
    if (onGlobalFilterChange) {
      onGlobalFilterChange(searchValue)
    }
  }

  const columns = useMemo(
    () => createLikedProductsColumns(handleRefresh),
    [handleRefresh]
  )

  // 使用 useMemo 稳定 pagination 对象，避免不必要的重新渲染
  const stablePagination = useMemo(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize]
  )

  // 加载推荐产品数据（收藏产品）
  useFetchCollectionProducts(
    setData,
    setIsLoading,
    refreshKey,
    stablePagination,
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
          <ProductsTableWithToolbar
            data={data}
            columns={columns}
            search={search}
            navigate={navigate}
            totalCount={totalCount}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
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
  // 使用 useRef 跟踪上一次的请求参数，避免重复请求
  const lastRequestParamsRef = useRef<string>('')
  // 使用 useRef 跟踪是否正在请求，防止并发请求
  const isRequestingRef = useRef<boolean>(false)
  // 防抖定时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 使用 useMemo 稳定依赖项的值，避免不必要的重复请求
  const pageIndex = pagination?.pageIndex ?? 0
  const pageSize = pagination?.pageSize ?? 10
  const nameOrCode = globalFilter?.trim() || ''
  const customerId = auth.user?.customerId

  useEffect(() => {
    if (!customerId) {
      return
    }

    // 清除之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    // 构建请求的唯一标识符
    const requestKey = `${customerId}-${pageIndex}-${pageSize}-${nameOrCode}-${refreshKey}`

    // 如果请求参数没有变化，跳过请求
    if (lastRequestParamsRef.current === requestKey) {
      return
    }

    // 使用防抖，延迟执行请求，避免在状态快速变化时触发多次请求
    debounceTimerRef.current = setTimeout(() => {
      // 再次检查请求参数（可能在防抖期间发生了变化）
      const currentRequestKey = `${customerId}-${pageIndex}-${pageSize}-${nameOrCode}-${refreshKey}`
      
      // 如果请求参数没有变化，跳过请求
      if (lastRequestParamsRef.current === currentRequestKey) {
        return
      }

      // 如果正在请求中，跳过
      if (isRequestingRef.current) {
        return
      }

      // 更新请求参数标识符
      lastRequestParamsRef.current = currentRequestKey
      isRequestingRef.current = true

      const fetchData = async () => {
        const pageNo = pageIndex + 1

        setIsLoading(true)
        try {
          const response = await getRecommendProductsList({
            customerId: String(customerId),
            pageSize,
            pageNo,
            nameOrCode,
          })
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
          isRequestingRef.current = false
        }
      }

      void fetchData()
    }, 100) // 100ms 防抖延迟

    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [
    customerId,
    refreshKey,
    pageIndex,
    pageSize,
    nameOrCode,
    setData,
    setIsLoading,
    setTotalCount,
  ])
}
