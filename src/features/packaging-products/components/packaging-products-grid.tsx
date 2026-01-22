import { useEffect, useRef, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  type ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getProductsList,
  type GoodClassItem,
  queryGoodClassList,
} from '@/lib/api/products'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { CategoryTreeFilterPopover } from '@/components/category-tree-filter-popover'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type PackagingProduct } from '../data/schema'

const route = getRouteApi('/_authenticated/packaging-products/')

type PackagingProductsGridProps = {
  tab?: 'packaging-products' | 'my-packaging'
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

// Create a minimal column definition for the table
const columns: ColumnDef<PackagingProduct>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    enableHiding: true,
  },
]

export function PackagingProductsGrid({
  tab = 'packaging-products',
}: PackagingProductsGridProps) {
  const nav = useNavigate()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([]) // 分类树
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  ) // 选中的分类
  const [data, setData] = useState<PackagingProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState('') // 独立的搜索状态
  const prevSearchValueRef = useRef<string>('') // 跟踪上一次的搜索值
  const prevSelectedCategoriesRef = useRef<Set<string>>(new Set()) // 跟踪上一次的选中分类
  const prevRequestParamsRef = useRef<{
    pageIndex: number
    pageSize: number
    searchValue: string
    categoryIds: string[]
  } | null>(null) // 跟踪上一次的请求参数
  const categoryFetchedRef = useRef(false) // 标记分类数据是否已获取
  const isManualSearchRef = useRef(false) // 标记是否是手动点击搜索按钮
  // 防抖定时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 请求标志，用于防止重复请求
  const isRequestingRef = useRef(false)
  const isCategoryRequestingRef = useRef(false) // 分类请求标志

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
    pagination: { defaultPage: 1, defaultPageSize: 18 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

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

  // 处理搜索按钮点击
  const handleSearchClick = (searchInputValue: string) => {
    // 标记这是手动搜索
    isManualSearchRef.current = true
    // 清除之前的防抖定时器，立即执行请求
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    // 立即显示 loading
    setIsLoading(true)
    // 更新搜索值，这会触发数据请求
    setSearchValue(searchInputValue)
  }

  // 获取数据 - 使用防抖来避免重复请求
  useEffect(() => {
    // 检查分类是否变化了
    const categoryChanged =
      prevSelectedCategoriesRef.current.size !== selectedCategories.size ||
      Array.from(prevSelectedCategoriesRef.current).some(
        (val: string) => !selectedCategories.has(val)
      ) ||
      Array.from(selectedCategories).some(
        (val: string) => !prevSelectedCategoriesRef.current.has(val)
      )

    // 如果分类变化了，更新 ref
    if (categoryChanged) {
      prevSelectedCategoriesRef.current = new Set(selectedCategories)
      // 如果当前不在第一页，重置分页（这会触发一次 useEffect，但防抖会合并）
      if (pagination.pageIndex !== 0) {
        onPaginationChange({
          pageIndex: 0,
          pageSize: pagination.pageSize,
        })
        // 不返回，让防抖处理合并请求
      }
    }

    // 如果是手动搜索，立即执行请求（不使用防抖）
    if (isManualSearchRef.current) {
      isManualSearchRef.current = false
      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      // 立即执行请求
      void (async () => {
        // 如果已经有请求在进行中，跳过
        if (isRequestingRef.current) {
          return
        }

        // 将选中的分类转换为数组
        const categoryIds = Array.from(selectedCategories)
        const currentRequestParams = {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          searchValue: searchValue || '',
          categoryIds: categoryIds.sort(),
        }

        // 检查请求参数是否与上一次相同
        if (prevRequestParamsRef.current) {
          const prev = prevRequestParamsRef.current
          if (
            prev.pageIndex === currentRequestParams.pageIndex &&
            prev.pageSize === currentRequestParams.pageSize &&
            prev.searchValue === currentRequestParams.searchValue &&
            prev.categoryIds.length ===
              currentRequestParams.categoryIds.length &&
            prev.categoryIds.every(
              (id, index) => id === currentRequestParams.categoryIds[index]
            )
          ) {
            // 请求参数相同，跳过请求
            setIsLoading(false)
            return
          }
        }

        isRequestingRef.current = true

        try {
          const requestData = {
            pageSize: pagination.pageSize,
            pageNo: pagination.pageIndex + 1,
            productName:
              searchValue && searchValue.trim()
                ? searchValue.trim()
                : undefined,
            minPrice: 0,
            maxPrice: 99999999,
            deliveryId: '',
            categoryIds: categoryIds.length > 0 ? categoryIds : [],
            productTypes: ['04'],
            productTags: [],
          }

          const response = await getProductsList(requestData)
          const apiProducts = response.data?.products || []
          const convertedProducts: PackagingProduct[] = apiProducts.map(
            (apiProduct: any) => ({
              id: apiProduct.id,
              name: apiProduct.name || apiProduct.enname || '',
              image: apiProduct.picture || '',
              sku: apiProduct.number || apiProduct.id,
              category: 'paper-boxes',
              sizes: [],
              price: apiProduct.price || 0,
              description: apiProduct.enname || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          )

          setData(convertedProducts)
          setTotalCount(response.data?.totalCount || 0)
          prevRequestParamsRef.current = currentRequestParams
        } catch (error) {
          console.error('获取包装产品列表失败:', error)
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to load packaging products. Please try again.'
          )
          setData([])
          setTotalCount(0)
        } finally {
          setIsLoading(false)
          isRequestingRef.current = false
        }
      })()
      return
    }

    // 清除之前的防抖定时器（这是关键：每次触发都清除之前的定时器）
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    // 使用防抖，延迟 300ms 执行请求（增加延迟时间，确保能合并连续触发）
    debounceTimerRef.current = setTimeout(async () => {
      // 如果已经有请求在进行中，跳过
      if (isRequestingRef.current) {
        return
      }

      // 将选中的分类转换为数组（在防抖回调中使用最新的值）
      const categoryIds = Array.from(selectedCategories)
      const currentRequestParams = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        searchValue: searchValue || '',
        categoryIds: categoryIds.sort(), // 排序以确保比较准确
      }

      // 检查请求参数是否与上一次相同
      if (prevRequestParamsRef.current) {
        const prev = prevRequestParamsRef.current
        if (
          prev.pageIndex === currentRequestParams.pageIndex &&
          prev.pageSize === currentRequestParams.pageSize &&
          prev.searchValue === currentRequestParams.searchValue &&
          prev.categoryIds.length === currentRequestParams.categoryIds.length &&
          prev.categoryIds.every(
            (id, index) => id === currentRequestParams.categoryIds[index]
          )
        ) {
          // 请求参数相同，跳过请求
          return
        }
      }

      isRequestingRef.current = true
      setIsLoading(true)

      try {
        // 构建请求参数（使用最新的分页值，确保分类变化时使用 pageIndex = 0）
        const requestData = {
          pageSize: pagination.pageSize,
          pageNo: pagination.pageIndex + 1,
          productName:
            searchValue && searchValue.trim() ? searchValue.trim() : undefined,
          minPrice: 0,
          maxPrice: 99999999,
          deliveryId: '',
          categoryIds: categoryIds.length > 0 ? categoryIds : [],
          productTypes: ['04'], // 包装产品类型
          productTags: [],
        }

        const response = await getProductsList(requestData)

        // 后端返回的数据在 data.products 中
        const apiProducts = response.data?.products || []
        const convertedProducts: PackagingProduct[] = apiProducts.map(
          (apiProduct: any) => {
            // 将 API 产品数据转换为 PackagingProduct schema 格式
            return {
              id: apiProduct.id,
              name: apiProduct.name || apiProduct.enname || '',
              image: apiProduct.picture || '',
              sku: apiProduct.number || apiProduct.id,
              category: 'paper-boxes', // 默认值，API 没有提供具体分类
              sizes: [], // API 没有提供尺寸信息
              price: apiProduct.price || 0,
              description: apiProduct.enname || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
        )

        setData(convertedProducts)
        setTotalCount(response.data?.totalCount || 0)

        // 更新上一次的请求参数
        prevRequestParamsRef.current = currentRequestParams
      } catch (error) {
        console.error('获取包装产品列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load packaging products. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
        isRequestingRef.current = false
      }
    }, 300) // 300ms 防抖延迟，确保能合并连续触发

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
    searchValue,
    selectedCategories,
  ])

  // Create real table instance for toolbar and pagination
  const table = useReactTable({
    data,
    columns,
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
      const sku = String(row.original.sku || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return name.includes(searchValue) || sku.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // 启用服务端分页
    pageCount: totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  // 获取分类数据 - 使用防抖避免重复请求
  useEffect(() => {
    // 如果已经获取过或正在请求，跳过
    if (categoryFetchedRef.current || isCategoryRequestingRef.current) {
      return
    }

    // 清除之前的防抖定时器
    let categoryDebounceTimer: NodeJS.Timeout | null = null

    categoryDebounceTimer = setTimeout(async () => {
      // 再次检查，防止在延迟期间重复请求
      if (categoryFetchedRef.current || isCategoryRequestingRef.current) {
        return
      }

      // 标记正在请求
      isCategoryRequestingRef.current = true
      try {
        const categories = await queryGoodClassList('00000001', 1, 100)
        const tree = convertToCategoryTree(categories)
        setCategoryTree(tree)
        // 标记已获取
        categoryFetchedRef.current = true
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load categories. Please try again.'
        )
        setCategoryTree([])
        // 即使失败也标记，避免重复请求
        categoryFetchedRef.current = true
      } finally {
        isCategoryRequestingRef.current = false
      }
    }, 100) // 100ms 防抖延迟

    // 清理函数
    return () => {
      if (categoryDebounceTimer) {
        clearTimeout(categoryDebounceTimer)
      }
    }
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

  const pageCount =
    totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0

  useEffect(() => {
    if (pageCount > 0 && pagination.pageIndex >= pageCount) {
      onPaginationChange({
        pageIndex: Math.max(0, pageCount - 1),
        pageSize: pagination.pageSize,
      })
    }
  }, [pageCount, pagination.pageIndex, pagination.pageSize, onPaginationChange])

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='SKU/Product Name'
        searchKey='name'
        onSearch={handleSearchClick}
        customFilterSlot={
          <CategoryTreeFilterPopover
            title='All categories'
            categories={categoryTree}
            selectedValues={selectedCategories}
            onValueChange={handleCategoryChange}
          />
        }
      />
      {/* Product Grid */}
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6'>
        {isLoading ? (
          <div className='col-span-full flex h-96 items-center justify-center'>
            <div className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Loading...</span>
            </div>
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const product = row.original
            const from =
              tab === 'my-packaging'
                ? 'packaging-products-my'
                : 'packaging-products'
            return (
              <div
                key={product.id}
                className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
                onClick={() =>
                  nav({
                    to: '/products/$productId',
                    params: { productId: product.id },
                    search: { from },
                  })
                }
              >
                <div className='relative aspect-[5/4] overflow-hidden bg-gray-100'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  />
                </div>

                {/* Product Info */}
                <div className='space-y-1.5 p-2.5'>
                  {/* Sizes */}
                  <div className='text-base'>{product.name}</div>

                  {/* Price */}
                  <div className='text-base font-bold'>
                    ${product.price.toFixed(2)}
                  </div>

                  {/* Description */}
                  <p className='text-muted-foreground line-clamp-2 text-xs leading-tight'>
                    {product.description}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className='col-span-full flex h-24 items-center justify-center'>
            <div className='text-muted-foreground'>No products found.</div>
          </div>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
