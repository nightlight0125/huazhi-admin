import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { getRecommendProductsList } from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ProductsTableWithToolbar } from '../liked-products/components/products-table-with-toolbar'
import { createRecommendProductsColumns } from './components/recommend-products-columns'
import type { RecommendProduct } from './data/schema'

const route = getRouteApi('/_authenticated/recommend-products/')

export function RecommendProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const [data, setData] = useState<RecommendProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // 获取分页状态和搜索状态（从 URL）
  const { pagination, globalFilter, onGlobalFilterChange } = useTableUrlState({
    search,
    navigate: navigate as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  const handleSearch = (searchValue: string) => {
    onGlobalFilterChange?.(searchValue)
  }

  const lastRequestParamsRef = useRef<string>('')
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const customerId = auth.user?.customerId
    if (!customerId) return

    const pageIndex = pagination.pageIndex
    const pageSize = pagination.pageSize
    const nameOrCode = globalFilter?.trim() || ''
    const requestKey = `${customerId}-${pageIndex}-${pageSize}-${nameOrCode}-${refreshKey}`

    if (lastRequestParamsRef.current === requestKey) return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    debounceTimerRef.current = setTimeout(() => {
      const currentKey = `${customerId}-${pagination.pageIndex}-${pagination.pageSize}-${(globalFilter ?? '').trim()}-${refreshKey}`
      if (lastRequestParamsRef.current === currentKey) return
      lastRequestParamsRef.current = currentKey

      const fetchData = async () => {
        const pageNo = pagination.pageIndex + 1
        const pageSizeVal = pagination.pageSize
        const searchVal = (globalFilter ?? '').trim() || ''

        setIsLoading(true)
        try {
          const response = await getRecommendProductsList({
            customerId: String(customerId),
            pageSize: pageSizeVal,
            pageNo,
            nameOrCode: searchVal,
          })

        // 后端返回的数据在 data.data 中
        const apiProducts = response.data?.data || response.data?.products || []
        const products: RecommendProduct[] = apiProducts.map((item: any) => {
          // 解析日期，如果后端返回了 date 字段
          let addDate = new Date()
          if (item.date) {
            const parsedDate = new Date(item.date)
            if (!isNaN(parsedDate.getTime())) {
              addDate = parsedDate
            }
          }

          return {
            id: item.id,
            name: item.name || (typeof item.enname === 'string' ? item.enname : '') || '',
            enname: item.enname ?? item.hzkj_enname ?? undefined,
            image: item.picture || '',
            spu: item.number || '', // SPU 使用 number 字段
            priceMin: item.price || 0,
            addDate,
          }
        })

        setData(products)
        setTotalCount(response.data?.totalCount || 0)
      } catch (error) {
        console.error('获取推荐产品列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load recommend products. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
    }, 250)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [
    auth.user?.customerId,
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    refreshKey,
  ])

  // 刷新数据的函数
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const columns = createRecommendProductsColumns({
    onDeleteSuccess: handleRefresh,
  })

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
            isLoading={isLoading}
            onSearch={handleSearch}
          />
        </div>
      </Main>
    </>
  )
}
