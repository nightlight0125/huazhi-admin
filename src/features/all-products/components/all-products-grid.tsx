import { CategoryTreeFilterPopover } from '@/components/category-tree-filter-popover'
import { DataTablePagination } from '@/components/data-table'
import { FilterToolbar } from '@/components/filter-toolbar'
import { ImageSearchInput } from '@/components/image-search-input'
import { PriceRangePopover } from '@/components/price-range-popover'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { type Product } from '@/features/products/data/schema'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { type CountryItem, queryCountry } from '@/lib/api/logistics'
import {
  collectProduct,
  type GoodClassItem,
  queryGoodClassList,
} from '@/lib/api/products'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { CheckIcon } from '@radix-ui/react-icons'
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
  type RowSelectionState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { ChevronDown, Heart, Loader2, ShoppingCart, Store } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import countries from 'world-countries'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { StoreListingTabs } from '@/features/store-management/components/store-listing-tabs'
import { createVariantPricingColumns } from '@/features/store-management/components/variant-pricing-columns'
import { mockVariantPricingData } from '@/features/store-management/components/variant-pricing-data'
import { type VariantPricing } from '@/features/store-management/components/variant-pricing-schema'

const route = getRouteApi('/_authenticated/all-products')

type AllProductsGridProps = {
  data: Product[]
  totalCount?: number
  isLoading?: boolean
  onCategoryChange?: (categoryIds: string[]) => void
  onPriceRangeChange?: (
    priceRange: { min: number; max: number } | undefined
  ) => void
  onLocationChange?: (deliveryId: string | undefined) => void
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

export function AllProductsGrid({
  data,
  totalCount = 0,
  isLoading = false,
  onCategoryChange,
  onPriceRangeChange,
  onLocationChange,
}: AllProductsGridProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    { min: number; max: number } | undefined
  >(undefined)
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined
  )
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false)
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
  const [storeListingTagsPopoverOpen, setStoreListingTagsPopoverOpen] =
    useState(false)
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
    search: route.useSearch(),
    navigate: route.useNavigate(),
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

  // Create table instance for pagination
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

  const [locationOptions, setLocationOptions] = useState<CountryItem[]>([])

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
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update favorite status. Please try again.'
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

  useEffect(() => {
    const fetchLocationOptions = async () => {
      try {
        const locationOptions = await queryCountry(1, 1000)
        setLocationOptions(locationOptions)
      } catch (error) {
        console.error('Failed to load location options:', error)
        setLocationOptions([])
      }
    }
    void fetchLocationOptions()
  }, [])

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
          <Popover
            key='location'
            open={locationPopoverOpen}
            onOpenChange={setLocationPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='min-w-[160px] justify-between'
              >
                {selectedLocation
                  ? locationOptions.find((opt) => opt.id === selectedLocation)
                      ?.name || 'Ship from anywhere'
                  : 'Ship from anywhere'}
                <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0' align='start'>
              <Command>
                <CommandList>
                  <CommandEmpty>No locations found.</CommandEmpty>
                  <CommandGroup>
                    {locationOptions.map((option) => {
                      const isSelected = selectedLocation === option.id
                      return (
                        <CommandItem
                          key={option.id}
                          onSelect={() => {
                            if (isSelected) {
                              // 如果点击的是已选中的项，取消选择
                              setSelectedLocation(undefined)
                              onLocationChange?.(undefined)
                            } else {
                              // 选择新的位置
                              setSelectedLocation(option.id)
                              onLocationChange?.(option.id)
                            }
                            setLocationPopoverOpen(false)
                            // 位置变化时重置到第一页
                            onPaginationChange({
                              pageIndex: 0,
                              pageSize: pagination.pageSize,
                            })
                          }}
                        >
                          <div
                            className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50'
                            }`}
                          >
                            {isSelected && <CheckIcon className='h-4 w-4' />}
                          </div>
                          <div className='flex items-center gap-2'>
                            {option.twocountrycode && (() => {
                              const countryInfo = countries.find(
                                (c) => c.cca2.toUpperCase() === option.twocountrycode?.toUpperCase()
                              )
                              const code = countryInfo?.cca2.toLowerCase() || option.twocountrycode?.toLowerCase() || ''
                              const flagClass = code ? `fi fi-${code}` : ''
                              return flagClass ? (
                                <span
                                  className={cn(flagClass, 'mr-1')}
                                  aria-hidden='true'
                                />
                              ) : null
                            })()}
                            <span>{option.name || option.hzkj_name || option.description}</span>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>,
        ]}
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
            const isFavorite = selectedItems.has(product.id)

            return (
              <div
                key={product.id}
                className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
                onClick={() =>
                  navigate({
                    to: '/products/$productId',
                    params: { productId: product.id },
                    search: { from: undefined },
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

                <div className='space-y-1.5 p-2.5'>
                  <h3
                    className='overflow-hidden text-sm font-semibold break-words'
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.5',
                      maxHeight: '3em',
                      transform: 'translateZ(0)',
                    }}
                  >
                    {product.name.trim().replace(/\s+/g, ' ')}
                  </h3>

                  <p className='font-mono text-xs text-gray-600'>
                    SPU:{product.sku}
                  </p>

                  <div className='text-base font-bold'>
                    ${product.price.toFixed(2)}
                  </div>

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

      <DataTablePagination table={table} />

      {/* Store listing 右侧抽屉 */}
      <Sheet open={isStoreListingOpen} onOpenChange={setIsStoreListingOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-full flex-col sm:!w-[70vw] sm:!max-w-none'
        >
          <div className='flex h-full text-sm'>
            <StoreListingTabs
              tagsPopoverOpen={storeListingTagsPopoverOpen}
              setTagsPopoverOpen={setStoreListingTagsPopoverOpen}
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
