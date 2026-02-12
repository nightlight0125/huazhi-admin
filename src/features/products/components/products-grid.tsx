import { CategoryTreeFilterPopover } from '@/components/category-tree-filter-popover'
import { DataTablePagination } from '@/components/data-table'
import { FilterToolbar } from '@/components/filter-toolbar'
import { ImageSearchInput } from '@/components/image-search-input'
import { PriceRangePopover } from '@/components/price-range-popover'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { type Product } from '@/features/products/data/schema'
import { StoreListingTabs } from '@/features/store-management/components/store-listing-tabs'
import { createVariantPricingColumns } from '@/features/store-management/components/variant-pricing-columns'
import { mockVariantPricingData } from '@/features/store-management/components/variant-pricing-data'
import { type VariantPricing } from '@/features/store-management/components/variant-pricing-schema'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  collectProduct,
  type GoodClassItem,
  queryGoodClassList,
} from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import { useLocation, useNavigate } from '@tanstack/react-router'
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { Heart, Loader2, ShoppingCart, Store } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

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

type ProductsGridProps = {
  data: Product[]
  search: any
  navigate: any
  totalCount?: number
  isLoading?: boolean
  onCategoryChange?: (categoryIds: string[]) => void
  onPriceRangeChange?: (
    priceRange: { min: number; max: number } | undefined
  ) => void
}

// Create a minimal column definition for the table
const columns: ColumnDef<Product>[] = [
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
  },
]

export function ProductsGrid({
  data,
  search,
  navigate,
  totalCount = 0,
  isLoading = false,
  onCategoryChange,
  onPriceRangeChange,
}: ProductsGridProps) {
  const nav = useNavigate()
  const location = useLocation()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    { min: number; max: number } | undefined
  >(undefined)
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([])
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  // 本地搜索输入值
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  
  // Store Listing Tabs 相关状态
  const [isStoreListingOpen, setIsStoreListingOpen] = useState(false)
  const [storeListingSelectedTags, setStoreListingSelectedTags] = useState<
    string[]
  >([])
  const [storeListingRowSelection, setStoreListingRowSelection] =
    useState<RowSelectionState>({})
  const [storeListingSorting, setStoreListingSorting] = useState<SortingState>(
    []
  )
  const [storeListingColumnFilters, setStoreListingColumnFilters] =
    useState<ColumnFiltersState>([])

  // 为 StoreListingTabs 准备 Variant Pricing 表格
  const variantPricingColumns = useMemo(() => createVariantPricingColumns(), [])
  const variantPricingData = useMemo(() => mockVariantPricingData, [])
  const variantPricingTable = useReactTable<VariantPricing>({
    data: variantPricingData,
    columns: variantPricingColumns,
    state: {
      rowSelection: storeListingRowSelection,
      sorting: storeListingSorting,
      columnFilters: storeListingColumnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setStoreListingRowSelection,
    onSortingChange: setStoreListingSorting,
    onColumnFiltersChange: setStoreListingColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Fetch category data from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await queryGoodClassList('00000001', 1, 100)
        const tree = convertToCategoryTree(categories)
        setCategoryTree(tree)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
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

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
    columnFilters,
    onColumnFiltersChange,
  } = useTableUrlState({
    search,
    navigate: navigate as any,
    pagination: { defaultPage: 1, defaultPageSize: 8 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  // 同步 globalFilter 到本地搜索输入值（当 URL 变化时）
  useEffect(() => {
    setSearchInputValue(globalFilter || '')
  }, [globalFilter])

  // 处理搜索输入变化（只更新本地状态，不调用接口）
  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value)
  }

  // 处理搜索按钮点击（调用接口）
  const handleSearchClick = () => {
    onGlobalFilterChange?.(searchInputValue)
    // 搜索时重置到第一页
    onPaginationChange({
      pageIndex: 0,
      pageSize: pagination.pageSize,
    })
  }

  // Create table instance for pagination (when totalCount is provided, use server-side pagination)
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
    manualPagination: totalCount > 0, // 如果提供了 totalCount，启用服务端分页
    pageCount: totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  // Ensure page is in range
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

  // Filter data locally (for category, price range filters - client-side only)
  const filteredData = useMemo(() => {
    let result = data

    if (selectedCategories.size > 0) {
      result = result.filter((product) => {
        if (!product.category) return false

        return Array.from(selectedCategories).some((selectedCat) => {
          if (product.category === selectedCat) return true
          const parentCategory = categoryTree.find(
            (cat) => cat.value === selectedCat
          )
          if (parentCategory?.children) {
            return parentCategory.children.some(
              (child) => child.value === product.category
            )
          }
          const productParent = categoryTree.find((cat) =>
            cat.children?.some((child) => child.value === product.category)
          )
          if (productParent?.value === selectedCat) return true
          return false
        })
      })
    }

    // Apply price range filter
    if (selectedPriceRange) {
      result = result.filter(
        (product) =>
          product.price >= selectedPriceRange.min &&
          product.price <= selectedPriceRange.max
      )
    }

    return result
  }, [data, selectedCategories, selectedPriceRange, categoryTree])

  // Client-side pagination (when totalCount is not provided)
  const pageSize = pagination.pageSize || 8
  const pageIndex = (pagination.pageIndex || 0) + 1
  const startIndex = (pageIndex - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const { auth } = useAuthStore()

  const toggleFavorite = async (productId: string) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Please login first')
      return
    }

    try {
      // 调用收藏产品 API
      await collectProduct(productId, String(customerId))

      // 更新本地状态
      setSelectedItems((prev) => {
        const next = new Set(prev)
        if (next.has(productId)) {
          next.delete(productId)
          toast.success('Product removed from favorites')
        } else {
          next.add(productId)
          toast.success('Product added to favorites')
        }
        return next
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update favorite. Please try again.'
      )
    }
  }

  const handleCategoryChange = (value: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(value)
      } else {
        next.delete(value)
      }
      // 将选中的分类ID转换为数组并传递给父组件
      const categoryIds = Array.from(next)
      onCategoryChange?.(categoryIds)
      // 分类变化时重置到第一页
      onPaginationChange({
        pageIndex: 0,
        pageSize: pagination.pageSize,
      })
      return next
    })
  }

  return (
    <div className='space-y-4'>
      <FilterToolbar
        showSearch={false}
        searchPlaceholder='Search'
        searchValue={searchInputValue}
        onSearchChange={handleSearchInputChange}
        onSearchClick={handleSearchClick}
        filters={[
          <ImageSearchInput
            key='image-search'
            value={searchInputValue}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              // 按 Enter 键立即搜索
              if (e.key === 'Enter') {
                handleSearchClick()
              }
            }}
            onImageSearchClick={() => {
              /* 打开上传图片 / 图片搜索弹窗 */
            }}
          />,
          <CategoryTreeFilterPopover
            key='category'
            title='All categories'
            categories={categoryTree}
            selectedValues={selectedCategories}
            onValueChange={handleCategoryChange}
          />,
          <PriceRangePopover
            key='price'
            value={selectedPriceRange}
            onChange={(value) => {
              setSelectedPriceRange(value)
              // 价格范围变化时通知父组件
              onPriceRangeChange?.(value)
              // 价格范围变化时重置到第一页
              onPaginationChange({
                pageIndex: 0,
                pageSize: pagination.pageSize,
              })
            }}
          />,
        ]}
      />

      {/* Grid Layout */}
      <div className='relative'>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6'>
          {isLoading ? (
            <div className='col-span-full flex h-96 items-center justify-center'>
              <div className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Loading...</span>
              </div>
            </div>
          ) : totalCount > 0 ? (
            // Server-side pagination: use table rows
            table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const product = row.original
                const isFavorite = selectedItems.has(product.id)

                return (
                  <div
                    key={product.id}
                    className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
                    onClick={() => {
                      // 根据当前路由确定来源
                      let fromValue: string | undefined = undefined
                      if (location.pathname.includes('/winning-products')) {
                        fromValue = 'winning-products'
                      } else if (location.pathname.includes('/all-products')) {
                        fromValue = 'all-products'
                      }

                      nav({
                        to: '/products/$productId',
                        params: { productId: product.id },
                        search: { from: fromValue },
                      })
                    }}
                  >
                    {/* Product Image */}
                    <div className='relative aspect-[5/4] overflow-hidden bg-gray-100'>
                      <img
                        src={product.image}
                        alt={product.name}
                        className='h-full w-full object-cover transition-transform group-hover:scale-105'
                      />
                    </div>

                    {/* Product Info */}
                    <div className='space-y-1.5 p-2.5'>
                      {/* Product Title */}
                      <h3 className='line-clamp-2 h-10 text-sm leading-tight font-semibold'>
                        {product.name}
                      </h3>

                      {/* SPU */}
                      <p className='font-mono text-xs text-gray-600'>
                        SPU:{product.sku}
                      </p>

                      {/* Price */}
                      <div className='text-base font-bold text-orange-500'>
                        ${product.price.toFixed(2)}
                      </div>

                      {/* Action Buttons - Bottom */}
                      <div className='flex gap-1.5 pt-1.5'>
                        <Button
                          variant='outline'
                          size='sm'
                          className={`h-7 flex-1 px-1 ${
                            isFavorite
                              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                              : ''
                          }`}
                          title='Favorite'
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(product.id)
                          }}
                        >
                          <Heart
                            className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`}
                          />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 flex-1 px-1'
                          title='Add to Cart'
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Add to cart:', product.id)
                          }}
                        >
                          <ShoppingCart className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 flex-1 px-1'
                          title='Add to Store'
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsStoreListingOpen(true)
                          }}
                        >
                          <Store className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className='col-span-full flex h-24 items-center justify-center'>
                <div className='text-muted-foreground'>No products found.</div>
              </div>
            )
          ) : // Client-side pagination: use paginated filtered data
          paginatedData.length > 0 ? (
            paginatedData.map((product) => {
              const isFavorite = selectedItems.has(product.id)

              return (
                <div
                  key={product.id}
                  className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
                  onClick={() => {
                    // 根据当前路由确定来源
                    let fromValue: string | undefined = undefined
                    if (location.pathname.includes('/winning-products')) {
                      fromValue = 'winning-products'
                    } else if (location.pathname.includes('/all-products')) {
                      fromValue = 'all-products'
                    }

                    nav({
                      to: '/products/$productId',
                      params: { productId: product.id },
                      search: { from: fromValue },
                    })
                  }}
                >
                  {/* Product Image */}
                  <div className='relative aspect-[5/4] overflow-hidden bg-gray-100'>
                    <img
                      src={product.image}
                      alt={product.name}
                      className='h-full w-full object-cover transition-transform group-hover:scale-105'
                    />
                  </div>

                  {/* Product Info */}
                  <div className='space-y-1.5 p-2.5'>
                    {/* Product Title */}
                    <h3 className='line-clamp-2 h-10 text-sm leading-tight font-semibold'>
                      {product.name}
                    </h3>

                    {/* SPU */}
                    <p className='font-mono text-xs text-gray-600'>
                      SPU:{product.sku}
                    </p>

                    {/* Price */}
                    <div className='text-base font-bold text-orange-500'>
                      ${product.price.toFixed(2)}
                    </div>

                    {/* Action Buttons - Bottom */}
                    <div className='flex gap-1.5 pt-1.5'>
                      <Button
                        variant='outline'
                        size='sm'
                        className={`h-7 flex-1 px-1 ${
                          isFavorite
                            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                            : ''
                        }`}
                        title='Favorite'
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(product.id)
                        }}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`}
                        />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-7 flex-1 px-1'
                        title='Add to Cart'
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Add to cart:', product.id)
                        }}
                      >
                        <ShoppingCart className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-7 flex-1 px-1'
                        title='Add to Store'
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsStoreListingOpen(true)
                        }}
                      >
                        <Store className='h-3.5 w-3.5' />
                      </Button>
                    </div>
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
        {isLoading && (
          <div className='bg-background/50 absolute inset-0 flex items-center justify-center backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
              <p className='text-muted-foreground text-sm'>Loading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination - only show when using server-side pagination */}
      {totalCount > 0 && <DataTablePagination table={table} />}

      {/* Store listing 右侧抽屉 */}
      <Sheet open={isStoreListingOpen} onOpenChange={setIsStoreListingOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-full flex-col sm:!w-[70vw] sm:!max-w-none'
        >
          <div className='flex h-full text-sm'>
            <StoreListingTabs
              selectedTags={storeListingSelectedTags}
              setSelectedTags={setStoreListingSelectedTags}
              variantPricingTable={variantPricingTable}
              columns={variantPricingColumns}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
