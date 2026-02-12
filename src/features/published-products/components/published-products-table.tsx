import { CategoryTreeFilterPopover } from '@/components/category-tree-filter-popover'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  queryGoodClassList,
  queryPushProductsList,
  type GoodClassItem,
} from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
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
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { type PublishedProduct } from '../data/schema'
import { PublishedProductsBulkActions } from './published-products-bulk-actions'
import { publishedProductsColumns } from './published-products-columns'

const route = getRouteApi('/_authenticated/published-products/')

type DataTableProps = {
  status?: 'published' | 'publishing' | 'failed'
}

// Category item type
type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

// Convert API data to category tree structure
function convertToCategoryTree(items: GoodClassItem[]): CategoryItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  // Create a map for quick lookup
  const itemMap = new Map<string, GoodClassItem>()
  items.forEach((item) => {
    const id = String(item.id || item.number || '')
    if (id) {
      itemMap.set(id, item)
    }
  })

  // Build tree structure
  const tree: CategoryItem[] = []
  const processed = new Set<string>()

  // First pass: find root items (items with hzkj_parent_id === "0" or empty)
  items.forEach((item) => {
    const id = String(item.id || item.number || '')
    if (!id || processed.has(id)) return

    // Use hzkj_parent_id, fallback to parent_id for backward compatibility
    const parentId = String(item.hzkj_parent_id || item.parent_id || '')

    // Root items: parent_id is "0" or empty, or parent not in the list
    if (parentId === '0' || !parentId || !itemMap.has(parentId)) {
      const categoryItem: CategoryItem = {
        label: String(item.name || item.number || ''),
        value: id,
      }
      tree.push(categoryItem)
      processed.add(id)
    }
  })

  // Second pass: add children recursively
  const addChildren = (parent: CategoryItem) => {
    items.forEach((item) => {
      const id = String(item.id || item.number || '')
      // Use hzkj_parent_id, fallback to parent_id for backward compatibility
      const parentId = String(item.hzkj_parent_id || item.parent_id || '')

      // If this item's parent matches the current parent and hasn't been processed
      if (id && parentId === parent.value && !processed.has(id)) {
        if (!parent.children) {
          parent.children = []
        }
        const categoryItem: CategoryItem = {
          label: String(item.name || item.number || ''),
          value: id,
        }
        parent.children.push(categoryItem)
        processed.add(id)
        // Recursively add children of this item
        addChildren(categoryItem)
      }
    })
  }

  // Add children to all root items
  tree.forEach(addChildren)

  // If no tree structure found, return flat list
  if (tree.length === 0) {
    return items.map((item) => ({
      label: String(item.name || item.number || ''),
      value: String(item.id || item.number || ''),
    }))
  }

  return tree
}

export function PublishedProductsTable({ status }: DataTableProps) {
  const { auth } = useAuthStore()
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [data, setData] = useState<PublishedProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState('') // 独立的搜索状态
  const prevSearchValueRef = useRef<string>('') // 跟踪上一次的搜索值
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([]) // 分类树
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  ) // 选中的分类
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
      {
        columnId: 'category',
        searchKey: 'category',
        type: 'array',
      },
    ],
  })

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await queryGoodClassList('00000001', 1, 100)
        console.log('categories===================:', categories)
        const tree = convertToCategoryTree(categories)
        console.log('tree===================:', tree)
        setCategoryTree(tree)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load categories. Please try again.'
        )
        setCategoryTree([])
      }
    }

    void fetchCategories()
  }, [])

  // 处理分类变化
  const handleCategoryChange = (value: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(value)
      } else {
        next.delete(value)
      }
      return next
    })
  }

  // 当搜索条件改变时，重置到第一页
  useEffect(() => {
    if (prevSearchValueRef.current !== searchValue) {
      const wasEmpty = prevSearchValueRef.current === ''
      const isEmpty = searchValue === ''
      prevSearchValueRef.current = searchValue

      // 只有当搜索值真正改变时才重置分页（避免初始加载时从空到空）
      if (!(wasEmpty && isEmpty)) {
        onPaginationChange({
          pageIndex: 0,
          pageSize: pagination.pageSize,
        })
      }
    }
  }, [searchValue, pagination.pageSize, onPaginationChange])

  // 从 columnFilters 中获取选中的店铺ID
  const selectedShopId = useMemo(() => {
    const storeNameFilter = columnFilters.find((f) => f.id === 'storeName')
    if (
      storeNameFilter &&
      Array.isArray(storeNameFilter.value) &&
      storeNameFilter.value.length > 0
    ) {
      return storeNameFilter.value[0] as string
    }
    return null
  }, [columnFilters])

  // 获取数据 - 使用防抖来避免重复请求
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
        // 构建请求参数
        const requestData: any = {
          hzkj_customer_id: String(customerId),
          hzkj_issuccess: hzkj_issuccess,
          hzkj_push_shop_id: selectedShopId || '2337110780475925504', // 使用选中的店铺ID
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
            spu: item.spu || item.number || '',
            storeName: item.hzkj_push_shop_name || '',
            tdPrice: item.tdPrice || item.price || 0,
            yourPrice: item.yourPrice || `HKD${item.price || 0}`,
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
      const spu = String(row.original.spu || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return name.includes(searchValue) || spu.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // 启用服务端分页
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
          // 当点击搜索按钮时，更新搜索状态，触发 API 调用
          setSearchValue(searchValue)
        }}
        customFilterSlot={
          <CategoryTreeFilterPopover
            title='All categories'
            categories={categoryTree}
            selectedValues={selectedCategories}
            onValueChange={handleCategoryChange}
          />
        }
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
