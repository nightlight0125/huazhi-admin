import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { getRecommendProductsList } from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
  const { pagination, globalFilter } = useTableUrlState({
    search,
    navigate: navigate as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.customerId
      if (!customerId) {
        setIsLoading(false)
        return
      }

      const pageNo = pagination.pageIndex + 1
      const pageSize = pagination.pageSize

      setIsLoading(true)
      try {
        const response = await getRecommendProductsList({
          customerId: String(customerId),
          pageSize,
          pageNo,
          nameOrCode: globalFilter || '',
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
            name: item.name || item.enname || '',
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
          />
        </div>
      </Main>
    </>
  )
}
