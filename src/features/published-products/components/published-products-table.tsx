import { useEffect, useMemo, useRef, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  queryPushProductsList,
  type QueryPushProductsListRequest,
} from '@/lib/api/products'
import { getUserShopList, type ShopListItem } from '@/lib/api/shop'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type PublishedProduct } from '../data/schema'
import { PublishedProductsBulkActions } from './published-products-bulk-actions'
import { publishedProductsColumns } from './published-products-columns'

const route = getRouteApi('/_authenticated/published-products/')

type DataTableProps = {
  status?: 'published' | 'publishing' | 'failed'
}

export function PublishedProductsTable({ status }: DataTableProps) {
  const { auth } = useAuthStore()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [data, setData] = useState<PublishedProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState('') // 独立的搜索状态
  const prevSearchValueRef = useRef<string>('') // 跟踪上一次的搜索值
  const [storeOptions, setStoreOptions] = useState<
    Array<{ label: string; value: string }>
  >([])
  // 防抖定时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 请求标志，用于防止重复请求
  const isRequestingRef = useRef(false)
  // 刷新键，用于触发列表刷新
  const [refreshKey, setRefreshKey] = useState(0)

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate() as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      {
        columnId: 'storeName',
        searchKey: 'storeName',
        type: 'array',
      },
    ],
  })

  // 店铺列表（用于筛选）
  useEffect(() => {
    const fetchStores = async () => {
      const userId = auth.user?.id
      if (!userId) {
        setStoreOptions([])
        return
      }
      try {
        const response = await getUserShopList({
          hzkjAccountId: userId,
          pageNo: 0,
          pageSize: 100,
        })

        const options = response.list
          .filter(
            (shop: ShopListItem) =>
              !!shop.id && String(shop.enable ?? '1') !== '0'
          )
          .map((shop: ShopListItem) => ({
            label: shop.name || shop.platform || String(shop.id || ''),
            value: String(shop.id || ''),
          }))

        setStoreOptions(options)
      } catch (error) {
        console.error('Failed to fetch stores:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load stores. Please try again.'
        )
        setStoreOptions([])
      }
    }

    void fetchStores()
  }, [auth.user?.id])

  useEffect(() => {
    if (prevSearchValueRef.current !== searchValue) {
      const wasEmpty = prevSearchValueRef.current === ''
      const isEmpty = searchValue === ''
      prevSearchValueRef.current = searchValue

      if (!(wasEmpty && isEmpty)) {
        onPaginationChange({
          pageIndex: 0,
          pageSize: pagination.pageSize,
        })
      }
    }
  }, [searchValue, pagination.pageSize, onPaginationChange])

  const selectedShopId = useMemo(() => {
    const storeNameFilter = columnFilters.find((f) => f.id === 'storeName')
    if (
      storeNameFilter &&
      Array.isArray(storeNameFilter.value) &&
      storeNameFilter.value.length > 0
    ) {
      return String(storeNameFilter.value[0])
    }
    return null
  }, [columnFilters])

  useEffect(() => {
    // 清除之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    const customerId = auth.user?.customerId
    if (!customerId) {
      console.warn('Customer ID not available')
      return
    }

    // 使用防抖，延迟 200ms 执行请求
    debounceTimerRef.current = setTimeout(async () => {
      // 如果已经有请求在进行中，跳过
      if (isRequestingRef.current) {
        return
      }

      isRequestingRef.current = true
      const hzkj_issuccess = status === 'failed' ? '0' : '1'

      setIsLoading(true)
      try {
        // 构建请求参数（未选店铺时不传 hzkj_push_shop_id）
        const requestData: QueryPushProductsListRequest['data'] = {
          hzkj_customer_id: String(customerId),
          hzkj_issuccess: hzkj_issuccess,
        }
        if (selectedShopId) {
          requestData.hzkj_push_shop_id = selectedShopId
        }

        // 如果有搜索值，添加 str 字段
        if (searchValue && searchValue.trim()) {
          requestData.str = searchValue.trim()
        }

        const response = await queryPushProductsList({
          data: requestData,
          pageSize: pagination.pageSize,
          pageNo: pagination.pageIndex + 1,
        })

        const apiProducts = response?.rows || []

        // 映射 API 数据到 PublishedProduct 类型
        const mappedProducts: PublishedProduct[] = apiProducts.map(
          (item: any) => ({
            id: item.id || String(item.id) || '',
            image: item.hzkj_picture || '',
            name: item.name || '',
            spu: item.hzkj_spu_number ?? item.spu ?? item.number ?? '',
            hzkj_spu_number: item.hzkj_spu_number,
            storeName: item.hzkj_push_shop_name || '',
            tdPrice: (() => {
              const raw = item.hzkj_hz_min_price
              if (raw != null && raw !== '' && !Number.isNaN(Number(raw))) {
                return Number(raw)
              }
              return item.tdPrice || item.price || 0
            })(),
            yourPrice:
              item.hzkj_shopify_price != null && item.hzkj_shopify_price !== ''
                ? String(item.hzkj_shopify_price)
                : item.yourPrice || `HKD${item.price || 0}`,
            hzkj_shopify_price: item.hzkj_shopify_price,
            hzkj_hz_min_price:
              item.hzkj_hz_min_price != null &&
              item.hzkj_hz_min_price !== '' &&
              !Number.isNaN(Number(item.hzkj_hz_min_price))
                ? Number(item.hzkj_hz_min_price)
                : undefined,
            weight: item.weight || 0,
            shippingFrom: item.shippingFrom || '',
            shippingMethod: item.shippingMethod || '',
            amount: item.amount || item.price || 0,
            status:
              (status as 'published' | 'publishing' | 'failed') || 'published',
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          })
        )
        setData(mappedProducts)
        setTotalCount(response.totalCount || 0)
      } catch (error) {
        console.error('Failed to fetch push products:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load products. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
        isRequestingRef.current = false
      }
    }, 200) // 200ms 防抖延迟

    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    status,
    searchValue,
    selectedShopId,
    auth.user?.customerId,
    refreshKey,
  ])

  const filteredData = useMemo(() => {
    if (!status) return data
    return data.filter((product) => product.status === status)
  }, [data, status])

  // 根据当前 tab 状态控制列显隐
  useEffect(() => {
    setColumnVisibility((prev) => {
      if (status === 'failed') {
        return {
          ...prev,
          category: false, // 默认隐藏分类列
          price: false,
          weight: false,
          reason: true,
          time: true,
        }
      }

      // Published / publishing 显示价格和重量，隐藏 Reason & Time
      return {
        ...prev,
        category: false, // 默认隐藏分类列
        price: true,
        weight: true,
        reason: false,
        time: false,
      }
    })
  }, [status])

  const pageCount =
    totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0

  // 创建带删除回调的 columns
  const columnsWithDelete = useMemo(
    () =>
      publishedProductsColumns({
        onDeleteSuccess: () => {
          // 删除成功后刷新列表
          setRefreshKey((prev) => prev + 1)
        },
      }),
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns: columnsWithDelete,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = String(row.original.name || '').toLowerCase()
      const spu = String(
        row.original.hzkj_spu_number || row.original.spu || ''
      ).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return name.includes(searchValue) || spu.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // 启用服务端分页
    // 店铺等筛选由接口完成；列筛选存的是 shopId，与 storeName 列展示值不一致，不能在客户端再滤一层
    manualFiltering: true,
    pageCount,
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  useEffect(() => {
    if (pageCount > 0 && pagination.pageIndex >= pageCount) {
      onPaginationChange({
        pageIndex: Math.max(0, pageCount - 1),
        pageSize: pagination.pageSize,
      })
    }
  }, [pageCount, pagination.pageIndex, pagination.pageSize, onPaginationChange])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Enter SPU/SKU/Product Name'
        searchKey='name'
        onSearch={(searchValue) => {
          setSearchValue(searchValue)
        }}
        filters={[
          {
            columnId: 'storeName',
            title: 'Store Name',
            options: storeOptions,
            singleSelect: true,
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className='text-xs font-medium'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columnsWithDelete.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='text-xs'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-2'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithDelete.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <PublishedProductsBulkActions table={table} />
    </div>
  )
}
